"use client";

/**
 * VerdictBadge — the big, unmissable verdict display.
 * Shows INVEST / PASS / HOLD with confidence score ring.
 *
 * @param {{ verdict: string, confidence: number, companyName: string }} props
 */

const VERDICT_CONFIG = {
  INVEST: {
    label:      "INVEST",
    color:      "#00d68f",
    dimColor:   "rgba(0,214,143,0.12)",
    ringColor:  "#00d68f",
    textClass:  "text-invest-text",
    bgClass:    "bg-invest/10",
    borderClass:"border-invest/30",
    glowClass:  "glow-invest",
    emoji:      "↑",
    sublabel:   "Strong investment candidate",
  },
  PASS: {
    label:      "PASS",
    color:      "#ff4d6d",
    dimColor:   "rgba(255,77,109,0.12)",
    ringColor:  "#ff4d6d",
    textClass:  "text-pass-text",
    bgClass:    "bg-pass/10",
    borderClass:"border-pass/30",
    glowClass:  "glow-pass",
    emoji:      "↓",
    sublabel:   "Not recommended at this time",
  },
  HOLD: {
    label:      "HOLD",
    color:      "#ffd166",
    dimColor:   "rgba(255,209,102,0.12)",
    ringColor:  "#ffd166",
    textClass:  "text-hold-text",
    bgClass:    "bg-hold/10",
    borderClass:"border-hold/30",
    glowClass:  "glow-hold",
    emoji:      "→",
    sublabel:   "Monitor — needs more information",
  },
};

/**
 * SVG confidence ring — circular progress indicator.
 * @param {{ confidence: number, color: string }} props
 */
function ConfidenceRing({ confidence, color }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (confidence / 100) * circumference;

  return (
    <div className="confidence-ring relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112">
        {/* Background track */}
        <circle
          cx="56" cy="56" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Filled arc */}
        <circle
          cx="56" cy="56" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-ink-white leading-none">{confidence}%</span>
        <span className="text-2xs text-ink-muted mt-0.5">confidence</span>
      </div>
    </div>
  );
}

export default function VerdictBadge({ verdict, confidence = 0, companyName }) {
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.HOLD;
  const clampedConf = Math.min(100, Math.max(0, confidence));

  return (
    <div
      className={`
        verdict-pulse rounded-3xl border p-8
        ${cfg.bgClass} ${cfg.borderClass} ${cfg.glowClass}
        animate-slide-up
      `}
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Confidence ring */}
        <ConfidenceRing confidence={clampedConf} color={cfg.color} />

        {/* Main verdict */}
        <div className="flex-1 text-center sm:text-left">
          {/* Company name */}
          <p className="text-ink-muted text-sm mb-1 font-medium">{companyName}</p>

          {/* Big verdict label */}
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
            <span
              className="text-6xl font-black leading-none tracking-tight"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
            <span
              className="text-3xl font-bold"
              style={{ color: cfg.color }}
            >
              {cfg.emoji}
            </span>
          </div>

          <p className="text-ink-subtle text-sm">{cfg.sublabel}</p>
        </div>
      </div>
    </div>
  );
}
