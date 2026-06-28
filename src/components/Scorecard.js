"use client";

/**
 * Scorecard component — visual bar chart of the 6 investment dimensions.
 *
 * @param {{ scorecard: Object }} props
 */

const DIMENSIONS = [
  { key: "marketSize",      label: "Market Size",       icon: "📈", invert: false },
  { key: "moat",            label: "Competitive Moat",  icon: "🏰", invert: false },
  { key: "team",            label: "Team Quality",       icon: "👥", invert: false },
  { key: "financialHealth", label: "Financial Health",  icon: "💰", invert: false },
  { key: "momentum",        label: "Momentum",           icon: "⚡", invert: false },
  { key: "riskLevel",       label: "Risk Level",         icon: "⚠️", invert: true  },
];

/**
 * Returns Tailwind color class based on score (and whether metric is inverted).
 */
function getScoreColor(score, invert) {
  const effective = invert ? 11 - score : score;
  if (effective >= 8) return { bar: "bg-invest", text: "text-invest-text" };
  if (effective >= 6) return { bar: "bg-brand-400", text: "text-brand-300" };
  if (effective >= 4) return { bar: "bg-hold", text: "text-hold-text" };
  return { bar: "bg-pass", text: "text-pass-text" };
}

export default function Scorecard({ scorecard }) {
  if (!scorecard) return null;

  const avgScore =
    Object.values(scorecard).reduce((a, b) => a + b, 0) /
    Object.values(scorecard).length;

  return (
    <div
      className="bg-surface-1 border border-surface-3 rounded-2xl p-6 animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-ink-strong uppercase tracking-wide">
          Investment Scorecard
        </h3>
        <div className="text-xs text-ink-muted font-mono">
          Avg: <span className="text-ink-loud font-semibold">{avgScore.toFixed(1)}</span>/10
        </div>
      </div>

      <div className="space-y-4">
        {DIMENSIONS.map(({ key, label, icon, invert }) => {
          const score = scorecard[key] ?? 5;
          const colors = getScoreColor(score, invert);
          const widthPct = (score / 10) * 100;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-ink-base flex items-center gap-1.5">
                  <span>{icon}</span> {label}
                  {invert && (
                    <span className="text-2xs text-ink-muted">(lower is better)</span>
                  )}
                </span>
                <span className={`text-sm font-bold font-mono ${colors.text}`}>
                  {score}/10
                </span>
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full score-bar ${colors.bar}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
