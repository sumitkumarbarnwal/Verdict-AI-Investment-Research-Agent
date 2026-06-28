/**
 * @file state.js
 * @description Defines the LangGraph agent state shape.
 *
 * LangGraph uses an "annotation" to declare the state schema and
 * how each field is updated across graph transitions (reducers).
 *
 * The state flows through every node in the graph; each node reads
 * what it needs and returns partial updates.
 */

const { Annotation } = require("@langchain/langgraph");

/**
 * @typedef {Object} ResearchSection
 * @property {string}   aspect    - "overview" | "financials" | "news" | "competitors" | "team" | "risks"
 * @property {string}   summary   - LLM-generated summary of findings
 * @property {Source[]} sources   - Citations from web search
 * @property {string}   [rawData] - Raw JSON from the search tool (debug)
 */

/**
 * @typedef {Object} Source
 * @property {string} title
 * @property {string} url
 * @property {string} [snippet]
 */

/**
 * @typedef {Object} VerdictResult
 * @property {"INVEST"|"PASS"|"HOLD"} verdict
 * @property {number}   confidence    - 0–100
 * @property {string}   summary       - Executive summary paragraph
 * @property {string[]} prosFor       - Bulleted reasons to invest
 * @property {string[]} consAgainst   - Bulleted reasons to pass
 * @property {string[]} risks         - Key risk factors
 * @property {Object}   scorecard     - Per-dimension scores
 * @property {number}   scorecard.marketSize
 * @property {number}   scorecard.moat
 * @property {number}   scorecard.team
 * @property {number}   scorecard.financialHealth
 * @property {number}   scorecard.momentum
 * @property {number}   scorecard.riskLevel
 * @property {Source[]} sources
 * @property {string}   researchedAt  - ISO timestamp
 */

/**
 * @typedef {Object} ProgressStep
 * @property {string}  id        - unique step id
 * @property {string}  label     - human-readable label
 * @property {"pending"|"running"|"done"|"error"} status
 * @property {number}  [ts]      - unix timestamp when step started
 */

/**
 * The full LangGraph state annotation.
 * Each field uses the default "last writer wins" reducer unless specified.
 */
const AgentStateAnnotation = Annotation.Root({
  // ── Input ────────────────────────────────────────────────────────────────
  /** Raw company name from the user */
  companyInput: Annotation({ reducer: (_, b) => b }),

  /** Cleaned, canonical company name after intake */
  companyName: Annotation({ reducer: (_, b) => b }),

  /** Optional disambiguation note if multiple companies matched */
  disambiguationNote: Annotation({ reducer: (_, b) => b }),

  // ── Progress tracking (streamed to frontend) ─────────────────────────────
  /** Array of progress steps — appended by each node */
  steps: Annotation({
    default: () => [],
    reducer: (a, b) => {
      // b can be a full replacement array or a single step object to upsert
      if (Array.isArray(b)) return b;
      // Upsert: replace existing step with same id, or append
      const existing = a.findIndex((s) => s.id === b.id);
      if (existing >= 0) {
        const updated = [...a];
        updated[existing] = { ...updated[existing], ...b };
        return updated;
      }
      return [...a, b];
    },
  }),

  // ── Research data ────────────────────────────────────────────────────────
  /** Raw search results per aspect — populated by research nodes */
  researchData: Annotation({
    default: () => ({}),
    reducer: (a, b) => ({ ...a, ...b }),
  }),

  /** Synthesised summaries per section — populated by synthesis node */
  sections: Annotation({
    default: () => [],
    reducer: (a, b) => {
      if (Array.isArray(b)) return b;
      // Upsert by aspect
      const existing = a.findIndex((s) => s.aspect === b.aspect);
      if (existing >= 0) {
        const updated = [...a];
        updated[existing] = { ...updated[existing], ...b };
        return updated;
      }
      return [...a, b];
    },
  }),

  // ── Final output ─────────────────────────────────────────────────────────
  /** The final structured verdict — set by decision node */
  verdict: Annotation({ reducer: (_, b) => b }),

  // ── Error handling ───────────────────────────────────────────────────────
  /** Set if any node encounters a fatal error */
  error: Annotation({ reducer: (_, b) => b }),
});

module.exports = { AgentStateAnnotation };
