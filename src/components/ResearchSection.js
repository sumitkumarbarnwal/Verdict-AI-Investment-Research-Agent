"use client";

/**
 * ResearchSection — expandable accordion card for a single research aspect.
 *
 * @param {{
 *   section: {
 *     aspect: string,
 *     summary: string,
 *     keyPoints: string[],
 *     sentiment: string,
 *     sources: Array<{title:string,url:string,snippet:string}>
 *   },
 *   defaultOpen: boolean,
 *   index: number
 * }} props
 */

import { useState, useRef, useEffect } from "react";

const ASPECT_CONFIG = {
  overview:    { icon: "🏢", label: "Company Overview",       color: "text-brand-300"  },
  financials:  { icon: "💰", label: "Financials & Funding",   color: "text-invest-text"},
  news:        { icon: "📰", label: "Recent News",             color: "text-hold-text"  },
  competitors: { icon: "⚔️",  label: "Competitive Landscape", color: "text-brand-400"  },
  team:        { icon: "👥", label: "Leadership & Team",       color: "text-ink-loud"   },
  risks:       { icon: "⚠️", label: "Risks & Red Flags",      color: "text-pass-text"  },
};

const SENTIMENT_BADGE = {
  positive: { label: "Positive", cls: "bg-invest/15 text-invest-text border-invest/20" },
  negative: { label: "Negative", cls: "bg-pass/15 text-pass-text border-pass/20"       },
  neutral:  { label: "Neutral",  cls: "bg-surface-3 text-ink-subtle border-surface-4"  },
  mixed:    { label: "Mixed",    cls: "bg-hold/15 text-hold-text border-hold/20"       },
};

export default function ResearchSection({ section, defaultOpen = false, index = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? "auto" : 0);

  useEffect(() => {
    if (open) {
      const el = contentRef.current;
      if (el) setHeight(el.scrollHeight);
      // Allow CSS transition, then switch to auto
      const t = setTimeout(() => setHeight("auto"), 360);
      return () => clearTimeout(t);
    } else {
      // First set explicit px, then animate to 0
      const el = contentRef.current;
      if (el) setHeight(el.scrollHeight);
      const t = setTimeout(() => setHeight(0), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  const cfg = ASPECT_CONFIG[section.aspect] || ASPECT_CONFIG.overview;
  const sentCfg = SENTIMENT_BADGE[section.sentiment] || SENTIMENT_BADGE.neutral;

  return (
    <div
      className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden card-hover animate-slide-up"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      {/* Header (always visible) */}
      <button
        id={`section-toggle-${section.aspect}`}
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between group text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{cfg.icon}</span>
          <div>
            <h4 className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</h4>
            <span
              className={`
                mt-0.5 inline-block text-2xs font-medium px-2 py-0.5 rounded-full border
                ${sentCfg.cls}
              `}
            >
              {sentCfg.label}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div
          className={`
            w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center
            text-ink-muted group-hover:text-ink-base
            transition-all duration-300
            ${open ? "rotate-180" : ""}
          `}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div
        ref={contentRef}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          overflow: "hidden",
          transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-5 pb-5 pt-1 space-y-4">
          {/* Summary */}
          <p className="text-sm text-ink-base leading-relaxed">{section.summary}</p>

          {/* Key points */}
          {section.keyPoints?.length > 0 && (
            <ul className="space-y-1.5">
              {section.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-base">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Sources */}
          {section.sources?.length > 0 && (
            <div className="pt-2 border-t border-surface-3">
              <p className="text-2xs text-ink-muted uppercase tracking-wide font-medium mb-2">
                Sources
              </p>
              <div className="space-y-1.5">
                {section.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group/src"
                  >
                    <span className="mt-0.5 flex-shrink-0 text-brand-500 group-hover/src:text-brand-300 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                    <span className="text-xs text-ink-muted group-hover/src:text-ink-base transition-colors line-clamp-1">
                      {src.title || src.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
