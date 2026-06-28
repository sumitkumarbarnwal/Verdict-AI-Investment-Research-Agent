/**
 * @file tools.js
 * @description LangChain tools available to the research agent.
 *
 * Uses @tavily/core directly (the official Tavily SDK) wrapped in
 * LangChain's DynamicStructuredTool so it integrates cleanly with the graph.
 *
 * Tools:
 *  - researchTool: structured multi-aspect company research (general search)
 *  - newsTool:     recent news search (last 30 days)
 */

const { tavily } = require("@tavily/core");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");

// ── Create Tavily client ─────────────────────────────────────────────────────

/**
 * Returns a Tavily client. Built lazily so the API key is read at call time.
 * @returns {import("@tavily/core").TavilyClient}
 */
function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY environment variable is not set.");
  return tavily({ apiKey });
}

// ── Query templates per research aspect ─────────────────────────────────────

/** @type {Record<string, string>} */
const ASPECT_QUERIES = {
  overview:    "{company} company overview business model products services customers",
  financials:  "{company} funding revenue valuation financial results ARR growth investors",
  news:        "{company} latest news 2024 2025 announcements",
  competitors: "{company} competitors market landscape alternatives comparison",
  team:        "{company} founders CEO leadership team management executives background",
  risks:       "{company} risks problems controversies challenges failures layoffs",
};

// ── General research tool ────────────────────────────────────────────────────

/**
 * Structured multi-query research tool that bundles several searches together.
 * Each research node calls this with a specific aspect to get focused results.
 */
const researchTool = new DynamicStructuredTool({
  name: "research_company",
  description:
    "Research a specific aspect of a company using live web data. " +
    "Specify the company name and the aspect to research " +
    "(overview, financials, news, competitors, team, or risks). " +
    "Returns structured search results with titles, URLs, and content.",
  schema: z.object({
    company: z.string().describe("The company name to research"),
    aspect: z
      .enum(["overview", "financials", "news", "competitors", "team", "risks"])
      .describe("The specific aspect of the company to research"),
    additionalQuery: z
      .string()
      .optional()
      .describe("Optional extra query terms to refine the search"),
  }),

  func: async ({ company, aspect, additionalQuery }) => {
    const template = ASPECT_QUERIES[aspect] || "{company} {aspect}";
    const baseQuery = template.replace("{company}", company).replace("{aspect}", aspect);
    const query = additionalQuery ? `${baseQuery} ${additionalQuery}` : baseQuery;

    try {
      const client = getTavilyClient();

      /** @type {import("@tavily/core").TavilySearchOptions} */
      const searchOptions = {
        maxResults: 5,
        searchDepth: "basic",
        includeAnswer: false,
        // For news aspect, focus on recent content
        ...(aspect === "news" ? { topic: "news", days: 30 } : {}),
      };

      const response = await client.search(query, searchOptions);

      // Normalise results to a consistent shape
      const results = (response.results || []).map((r) => ({
        title:   r.title   || "Source",
        url:     r.url     || "",
        content: (r.content || r.snippet || "").slice(0, 500),
        score:   r.score   || 0,
      }));

      return JSON.stringify({
        aspect,
        company,
        query,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Return empty results on error so the graph can continue
      return JSON.stringify({
        aspect,
        company,
        query,
        error: err.message,
        results: [],
        timestamp: new Date().toISOString(),
      });
    }
  },
});

module.exports = { researchTool };
