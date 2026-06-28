/**
 * @file nodes.js
 * @description LangGraph node implementations for the Verdict research agent.
 *
 * Node execution order (see graph.js for wiring):
 *   intake → research → synthesis → decision → output
 *
 * Each node is a pure async function:
 *   (state) => Promise<Partial<AgentState>>
 *
 * Nodes emit progress updates by returning { steps: <stepUpdate> }
 * which gets merged into state by the Annotation reducer.
 */

const { getLLM } = require("./llm");
const { researchTool } = require("./tools");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a progress step object.
 * @param {string} id
 * @param {string} label
 * @param {"pending"|"running"|"done"|"error"} status
 * @returns {import("./state").ProgressStep}
 */
const mkStep = (id, label, status) => ({ id, label, status, ts: Date.now() });

/**
 * Safely parses JSON from an LLM response, returning null on failure.
 * @param {string} text
 * @returns {any|null}
 */
function safeParseJSON(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract first JSON object/array from text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Node 1 — Intake
// Validates and cleans the company name, handles disambiguation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intake node: validates & canonicalises the company name.
 * Uses the LLM to resolve abbreviations, typos, or ambiguous names.
 *
 * @param {import("./state").AgentState} state
 * @returns {Promise<Partial<import("./state").AgentState>>}
 */
async function intakeNode(state) {
  const step = mkStep("intake", "Validating company name", "running");

  const llm = getLLM();
  const rawInput = state.companyInput?.trim();

  if (!rawInput) {
    return {
      steps: { ...step, status: "error" },
      error: "No company name provided.",
    };
  }

  try {
    const response = await llm.invoke([
      new SystemMessage(
        `You are a company name resolver for an investment research tool.
Given a raw company name from a user, return a JSON object with:
{
  "canonicalName": "<the most commonly known official company name>",
  "disambiguationNote": "<null or a note if multiple companies share this name>",
  "sector": "<industry/sector>",
  "country": "<primary country of operation>"
}
Be concise. If the name is already clear, just clean it up. 
Return ONLY valid JSON, no explanation.`
      ),
      new HumanMessage(`Company input: "${rawInput}"`),
    ]);

    const parsed = safeParseJSON(response.content);
    const companyName = parsed?.canonicalName || rawInput;
    const disambiguationNote = parsed?.disambiguationNote || null;

    return {
      steps: { ...step, status: "done" },
      companyName,
      disambiguationNote,
    };
  } catch (err) {
    // Fallback: use raw input if LLM fails
    return {
      steps: { ...step, status: "done" },
      companyName: rawInput,
      disambiguationNote: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Node 2 — Research
// Runs 6 parallel web searches across key investment dimensions
// ─────────────────────────────────────────────────────────────────────────────

/** Research aspects and their display labels */
const RESEARCH_ASPECTS = [
  { aspect: "overview",    label: "Company overview" },
  { aspect: "financials",  label: "Financials & funding" },
  { aspect: "news",        label: "Recent news" },
  { aspect: "competitors", label: "Competitive landscape" },
  { aspect: "team",        label: "Leadership & team" },
  { aspect: "risks",       label: "Risks & red flags" },
];

/**
 * Research node: runs parallel Tavily searches for all 6 research aspects.
 * Each search result is stored in state.researchData keyed by aspect.
 *
 * @param {import("./state").AgentState} state
 * @returns {Promise<Partial<import("./state").AgentState>>}
 */
async function researchNode(state) {
  const { companyName } = state;

  // Mark all research steps as pending upfront
  const initialSteps = RESEARCH_ASPECTS.map(({ aspect, label }) =>
    mkStep(`research-${aspect}`, `Researching ${label.toLowerCase()}`, "pending")
  );

  // Run all searches in parallel for speed
  const searchPromises = RESEARCH_ASPECTS.map(async ({ aspect, label }) => {
    try {
      const result = await researchTool.invoke({
        company: companyName,
        aspect,
      });

      let parsed;
      try {
        parsed = typeof result === "string" ? JSON.parse(result) : result;
      } catch {
        parsed = { aspect, results: [], error: "parse error" };
      }

      return { aspect, data: parsed, label, status: "done" };
    } catch (err) {
      return {
        aspect,
        data: { aspect, results: [], error: err.message },
        label,
        status: "error",
      };
    }
  });

  const results = await Promise.all(searchPromises);

  // Build researchData map and step updates
  const researchData = {};
  const completedSteps = results.map(({ aspect, data, label, status }) => {
    researchData[aspect] = data;
    return mkStep(`research-${aspect}`, `Researching ${label.toLowerCase()}`, status);
  });

  return {
    steps: initialSteps.map((s) => {
      const completed = completedSteps.find((c) => c.id === s.id);
      return completed || s;
    }),
    researchData,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Node 3 — Synthesis
// LLM aggregates raw search results into structured per-section summaries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Synthesis node: LLM reads all raw research data and produces clean,
 * structured summaries for each section with key findings and sources.
 *
 * @param {import("./state").AgentState} state
 * @returns {Promise<Partial<import("./state").AgentState>>}
 */
async function synthesisNode(state) {
  const step = mkStep("synthesis", "Synthesising research findings", "running");

  const { companyName, researchData } = state;
  const llm = getLLM();

  // Prepare a condensed research brief for the LLM
  const researchBrief = Object.entries(researchData)
    .map(([aspect, data]) => {
      const results = data.results || [];
      const snippets = results
        .slice(0, 3)
        .map((r) => `  - [${r.title || "Source"}] ${r.content || r.snippet || ""}`.slice(0, 400))
        .join("\n");
      return `### ${aspect.toUpperCase()}\n${snippets || "  No data available."}`;
    })
    .join("\n\n");

  try {
    const response = await llm.invoke([
      new SystemMessage(
        `You are a senior investment analyst synthesising web research into structured findings.
For the company provided, analyse the research data and return a JSON array of sections:
[
  {
    "aspect": "overview|financials|news|competitors|team|risks",
    "summary": "<2-4 sentence analytical summary of key findings for this aspect>",
    "keyPoints": ["<bullet point 1>", "<bullet point 2>", ...],
    "sentiment": "positive|neutral|negative|mixed"
  },
  ...
]
Include all 6 aspects. Be analytical, not just descriptive. 
Highlight what matters for an investment decision.
Return ONLY valid JSON array.`
      ),
      new HumanMessage(
        `Company: ${companyName}\n\nResearch data:\n${researchBrief}`
      ),
    ]);

    const parsed = safeParseJSON(response.content);
    const rawSections = Array.isArray(parsed) ? parsed : [];

    // Attach sources from raw research data to each section
    const sections = rawSections.map((section) => {
      const rawData = researchData[section.aspect] || {};
      const sources = (rawData.results || [])
        .filter((r) => r.url)
        .map((r) => ({
          title:   r.title   || "Source",
          url:     r.url     || "",
          snippet: (r.content || r.snippet || "").slice(0, 200),
        }))
        .slice(0, 4);

      return { ...section, sources };
    });

    return {
      steps: { ...step, status: "done" },
      sections,
    };
  } catch (err) {
    return {
      steps: { ...step, status: "error" },
      sections: [],
      error: `Synthesis failed: ${err.message}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Node 4 — Decision
// LLM applies the investment framework and produces Invest / Pass / Hold
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decision node: applies the Verdict investment framework to synthesised findings.
 *
 * Framework dimensions (each scored 1–10):
 *   marketSize, moat, team, financialHealth, momentum, riskLevel
 *
 * @param {import("./state").AgentState} state
 * @returns {Promise<Partial<import("./state").AgentState>>}
 */
async function decisionNode(state) {
  const step = mkStep("decision", "Generating investment verdict", "running");

  const { companyName, sections } = state;
  const llm = getLLM();

  // Prepare a synthesis brief for the decision LLM
  const synthBrief = sections
    .map(
      (s) =>
        `**${s.aspect.toUpperCase()}** (${s.sentiment}): ${s.summary}\n` +
        (s.keyPoints || []).map((p) => `  • ${p}`).join("\n")
    )
    .join("\n\n");

  try {
    const response = await llm.invoke([
      new SystemMessage(
        `You are a seasoned venture capital and public markets investor.
Using the research synthesis provided, apply the following investment framework to evaluate the company.

INVESTMENT FRAMEWORK (score each 1–10):
- marketSize:      How large and growing is the addressable market?
- moat:            Does the company have durable competitive advantages?
- team:            Quality, track record, and depth of the leadership team?
- financialHealth: Revenue growth, profitability, runway, or funding strength?
- momentum:        Recent positive signals (growth, partnerships, press, customers)?
- riskLevel:       Severity of risks (1=low risk, 10=extreme risk)?

VERDICT RULES:
- "INVEST" if weighted average ≥ 6.5 AND riskLevel ≤ 7
- "PASS"   if weighted average < 5.0 OR riskLevel ≥ 8
- "HOLD"   otherwise (needs more information or mixed signals)

Return a JSON object:
{
  "verdict": "INVEST|PASS|HOLD",
  "confidence": <integer 0-100, how confident you are in this verdict>,
  "summary": "<3-5 sentence executive summary explaining the verdict>",
  "prosFor": ["<reason 1>", "<reason 2>", ...],
  "consAgainst": ["<reason 1>", "<reason 2>", ...],
  "risks": ["<risk 1>", "<risk 2>", ...],
  "scorecard": {
    "marketSize":      <1-10>,
    "moat":            <1-10>,
    "team":            <1-10>,
    "financialHealth": <1-10>,
    "momentum":        <1-10>,
    "riskLevel":       <1-10>
  }
}
Be decisive. Return ONLY valid JSON.`
      ),
      new HumanMessage(
        `Company: ${companyName}\n\nSynthesised research:\n${synthBrief}`
      ),
    ]);

    const parsed = safeParseJSON(response.content);

    if (!parsed || !parsed.verdict) {
      throw new Error("LLM returned invalid verdict JSON");
    }

    return {
      steps: { ...step, status: "done" },
      verdict: parsed,
    };
  } catch (err) {
    return {
      steps: { ...step, status: "error" },
      error: `Decision failed: ${err.message}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Node 5 — Output
// Assembles the final structured result, collects all sources
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Output node: merges verdict + sections into the final API response object.
 * Deduplicates sources across all sections.
 *
 * @param {import("./state").AgentState} state
 * @returns {Promise<Partial<import("./state").AgentState>>}
 */
async function outputNode(state) {
  const step = mkStep("output", "Preparing final report", "running");

  const { companyName, disambiguationNote, verdict, sections } = state;

  // Collect and deduplicate all sources
  const allSources = [];
  const seenUrls = new Set();
  for (const section of sections || []) {
    for (const source of section.sources || []) {
      if (source.url && !seenUrls.has(source.url)) {
        seenUrls.add(source.url);
        allSources.push(source);
      }
    }
  }

  const finalVerdict = {
    ...(verdict || {}),
    companyName,
    disambiguationNote,
    sections: sections || [],
    sources: allSources,
    researchedAt: new Date().toISOString(),
  };

  return {
    steps: { ...step, status: "done" },
    verdict: finalVerdict,
  };
}

module.exports = { intakeNode, researchNode, synthesisNode, decisionNode, outputNode };
