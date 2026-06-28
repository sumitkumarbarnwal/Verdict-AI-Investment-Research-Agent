/**
 * @file graph.js
 * @description Builds and exports the LangGraph research agent graph.
 *
 * Graph topology:
 *
 *   [START] → intake → research → synthesis → decision → output → [END]
 *
 * Each node is a distinct async function that reads from and writes to
 * the shared AgentStateAnnotation. The graph is compiled once and reused
 * across requests (singleton pattern for Vercel cold-start efficiency).
 *
 * Streaming: we use graph.stream() with "values" mode so the caller
 * receives the full state after each node completes — enabling real-time
 * progress updates in the UI.
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { AgentStateAnnotation } = require("./state");
const {
  intakeNode,
  researchNode,
  synthesisNode,
  decisionNode,
  outputNode,
} = require("./nodes");

// ─────────────────────────────────────────────────────────────────────────────
// Build the graph
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a compiled LangGraph research agent.
 * Singleton — call once and reuse.
 *
 * @returns {import("@langchain/langgraph").CompiledStateGraph}
 */
function buildGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    // ── Register nodes ─────────────────────────────────────────────────────
    .addNode("intake",    intakeNode)
    .addNode("research",  researchNode)
    .addNode("synthesis", synthesisNode)
    .addNode("decision",  decisionNode)
    .addNode("output",    outputNode)

    // ── Wire edges (linear pipeline) ───────────────────────────────────────
    .addEdge(START,       "intake")
    .addEdge("intake",    "research")
    .addEdge("research",  "synthesis")
    .addEdge("synthesis", "decision")
    .addEdge("decision",  "output")
    .addEdge("output",    END);

  return graph.compile();
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton instance
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import("@langchain/langgraph").CompiledStateGraph | null} */
let _graph = null;

/**
 * Returns the singleton compiled graph, building it on first call.
 * @returns {import("@langchain/langgraph").CompiledStateGraph}
 */
function getGraph() {
  if (!_graph) _graph = buildGraph();
  return _graph;
}

module.exports = { getGraph, buildGraph };
