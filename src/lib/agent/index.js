/**
 * @file index.js
 * @description Public API for the Verdict agent library.
 * Import from here in API routes and tests.
 */

const { getGraph } = require("./graph");
const { AgentStateAnnotation } = require("./state");

/**
 * Runs the full research agent for a company and streams progress.
 *
 * @param {string} companyInput - Raw company name from user
 * @param {function(object): void} onProgress - Called after each graph node with the current state
 * @returns {Promise<import("./state").VerdictResult>} Final verdict result
 */
async function runResearchAgent(companyInput, onProgress) {
  const graph = getGraph();

  const initialState = {
    companyInput: companyInput.trim(),
    steps: [],
    researchData: {},
    sections: [],
  };

  let finalState = initialState;

  // Stream node-by-node updates
  const stream = await graph.stream(initialState, { streamMode: "values" });

  for await (const state of stream) {
    finalState = state;
    if (typeof onProgress === "function") {
      onProgress(state);
    }
  }

  if (finalState.error) {
    throw new Error(finalState.error);
  }

  return finalState.verdict;
}

module.exports = { runResearchAgent };
