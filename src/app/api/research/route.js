/**
 * @file route.js
 * @description Next.js App Router API route — POST /api/research
 *
 * Accepts { company: string } and streams NDJSON back to the client:
 *   { type: "progress", steps: Step[] }   — emitted after every graph node
 *   { type: "result",   data: VerdictResult } — emitted once at the end
 *   { type: "error",    message: string }  — emitted on failure
 */

import { runResearchAgent } from "@/lib/agent/index";

export const runtime = "nodejs"; // LangGraph requires Node.js (not Edge)
export const dynamic = "force-dynamic"; // Never cache this route

/**
 * Maps LangGraph node names → human-readable step labels for the UI timeline.
 * @type {Record<string, string>}
 */
const NODE_LABELS = {
  intake:     "Validating company name",
  research:   "Running multi-aspect web research",
  synthesis:  "Synthesising research findings",
  decision:   "Generating investment verdict",
  output:     "Preparing final report",
};

/**
 * Derives a step list from the agent state emitted after each node.
 * We rely on the `steps` array already tracked inside the state.
 *
 * @param {object} state  - Current LangGraph state snapshot
 * @returns {Array<{id: string, label: string, status: string}>}
 */
function stepsFromState(state) {
  // If the agent already tracks steps internally, use them directly
  if (Array.isArray(state.steps) && state.steps.length > 0) {
    return state.steps;
  }

  // Fallback: derive from known node order
  const nodeOrder = ["intake", "research", "synthesis", "decision", "output"];
  const completedNodes = new Set(state._completedNodes || []);

  return nodeOrder.map((id) => ({
    id,
    label:  NODE_LABELS[id] || id,
    status: completedNodes.has(id) ? "done" : "pending",
  }));
}

/**
 * POST /api/research
 * Body: { company: string }
 */
export async function POST(request) {
  let company;

  try {
    const body = await request.json();
    company = (body?.company || "").trim();
  } catch {
    return new Response(
      JSON.stringify({ message: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!company) {
    return new Response(
      JSON.stringify({ message: "Missing required field: company" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Set up a TransformStream to write NDJSON chunks ──────────────────────
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  /**
   * Writes one NDJSON line to the stream.
   * @param {object} payload
   */
  async function writeEvent(payload) {
    await writer.write(encoder.encode(JSON.stringify(payload) + "\n"));
  }

  // ── Run agent in background, streaming progress to the client ────────────
  (async () => {
    try {
      const verdict = await runResearchAgent(company, async (state) => {
        await writeEvent({
          type:  "progress",
          steps: stepsFromState(state),
        });
      });

      await writeEvent({ type: "result", data: verdict });
    } catch (err) {
      await writeEvent({
        type:    "error",
        message: err.message || "Research failed. Please try again.",
      });
    } finally {
      await writer.close();
    }
  })();

  // Return the readable side immediately so the browser can start consuming
  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type":  "application/x-ndjson",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no", // Disable Nginx buffering for true streaming
    },
  });
}
