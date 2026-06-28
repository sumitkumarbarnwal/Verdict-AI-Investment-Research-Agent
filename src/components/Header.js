/**
 * Header — sticky nav bar.
 * Background: #F8FBF9/95 backdrop blur.
 * Left:  V logo mark + "Verdict" bold Inter + "AI Research Agent" pill badge.
 * Right: v1.0 version tag + GitHub icon link.
 */
export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#D5EBD9]"
      style={{ backgroundColor: "rgba(248,251,249,0.96)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">

        {/* ── Brand ── */}
        <div className="flex items-center gap-2.5">
          {/* Logo mark: solid emerald square with white V chevron */}
          <div
            className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#008751" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 3.5L7 10.5L11.5 3.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <span
            className="font-extrabold text-[17px] tracking-tight leading-none"
            style={{ color: "#11221A", fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif" }}
          >
            Verdict
          </span>

          {/* AI Research Agent badge */}
          <span
            className="hidden sm:inline text-[11px] font-medium px-2.5 py-0.5 rounded-full border ml-0.5"
            style={{
              color: "#5a7a68",
              borderColor: "#D5EBD9",
              backgroundColor: "#EAF5EE",
            }}
          >
            AI Research Agent
          </span>
        </div>

        {/* ── Right nav ── */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono hidden sm:inline" style={{ color: "#8aA898" }}>
            v1.0
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "#5a7a68" }}
            onMouseEnter={e => e.currentTarget.style.color = "#11221A"}
            onMouseLeave={e => e.currentTarget.style.color = "#5a7a68"}
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
                1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
                1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
                1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>

      </div>
    </header>
  );
}
