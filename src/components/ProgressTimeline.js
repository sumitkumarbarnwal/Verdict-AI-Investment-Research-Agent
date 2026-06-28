"use client";

/**
 * ProgressTimeline component — shows the LangGraph node execution steps
 * as an animated vertical stepper during the research phase.
 *
 * @param {{ steps: Array<{id:string,label:string,status:string,ts:number}> }} props
 */

const STATUS_ICONS = {
  pending: (
    <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  running: (
    <svg className="w-4 h-4 text-brand-400 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  done: (
    <svg className="w-4 h-4 text-invest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-pass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
    </svg>
  ),
};

const STATUS_COLORS = {
  pending: "border-surface-3 bg-surface-2",
  running: "border-brand-500/50 bg-brand-500/10",
  done:    "border-invest/40 bg-invest/10",
  error:   "border-pass/40 bg-pass/10",
};

const STATUS_TEXT = {
  pending: "text-ink-muted",
  running: "text-ink-strong",
  done:    "text-ink-base",
  error:   "text-pass-text",
};

// Default steps shown before any data arrives
const DEFAULT_STEPS = [
  { id: "intake",             label: "Validating company name",            status: "pending" },
  { id: "research-overview",  label: "Researching company overview",        status: "pending" },
  { id: "research-financials",label: "Researching financials & funding",    status: "pending" },
  { id: "research-news",      label: "Researching recent news",             status: "pending" },
  { id: "research-competitors",label:"Researching competitive landscape",   status: "pending" },
  { id: "research-team",      label: "Researching leadership & team",       status: "pending" },
  { id: "research-risks",     label: "Researching risks & red flags",       status: "pending" },
  { id: "synthesis",          label: "Synthesising research findings",      status: "pending" },
  { id: "decision",           label: "Generating investment verdict",       status: "pending" },
  { id: "output",             label: "Preparing final report",              status: "pending" },
];

/**
 * Merges live step updates into the default step list.
 * @param {Array} liveSteps
 * @returns {Array}
 */
function mergeSteps(liveSteps) {
  const liveMap = {};
  for (const s of liveSteps) liveMap[s.id] = s;

  return DEFAULT_STEPS.map((def) => ({
    ...def,
    ...(liveMap[def.id] || {}),
  }));
}

export default function ProgressTimeline({ steps = [] }) {
  const mergedSteps = mergeSteps(steps);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-ink-strong tracking-wide uppercase">
          Research in progress
        </h3>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {mergedSteps.map((step, idx) => (
          <div key={step.id} className="flex gap-3">
            {/* Connector + icon column */}
            <div className="flex flex-col items-center">
              {/* Icon circle */}
              <div
                className={`
                  w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0
                  transition-all duration-300
                  ${STATUS_COLORS[step.status] || STATUS_COLORS.pending}
                `}
              >
                {STATUS_ICONS[step.status] || STATUS_ICONS.pending}
              </div>

              {/* Connector line (not for last item) */}
              {idx < mergedSteps.length - 1 && (
                <div
                  className={`
                    step-connector flex-1 mt-0.5 mb-0.5 min-h-[16px]
                    ${step.status === "done" ? "done" : ""}
                  `}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pb-3">
              <p
                className={`
                  text-sm leading-none pt-2 transition-colors duration-200
                  ${STATUS_TEXT[step.status] || STATUS_TEXT.pending}
                  ${step.status === "running" ? "font-medium" : "font-normal"}
                `}
              >
                {step.label}
                {step.status === "running" && (
                  <span className="ml-2 text-xs text-brand-400 font-mono animate-pulse">
                    ···
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <p className="mt-6 text-xs text-ink-muted text-center">
        Live web research via Tavily • Powered by Claude
      </p>
    </div>
  );
}
