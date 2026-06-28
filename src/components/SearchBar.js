"use client";

/**
 * SearchBar — wide pill-shaped company input.
 *
 * Layout: [🔍 input text ···············] [ Research → ]
 * Container: white rounded-full with subtle border + shadow.
 * Button: solid #008751 rounded-full with white text.
 * Below: quick-try pill chips row.
 */

import { useState, useRef } from "react";

const EXAMPLES = ["Zerodha", "Byju's", "Stripe", "OpenAI", "Swiggy", "Razorpay"];

export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const t = value.trim();
    if (t && !isLoading) onSearch(t);
  }

  function handleChip(company) {
    setValue(company);
    inputRef.current?.focus();
    if (!isLoading) onSearch(company);
  }

  return (
    <div className="w-full">
      {/* ── Pill search form ── */}
      <form onSubmit={handleSubmit}>
        <div
          className="search-pill-wrap flex items-center gap-2 bg-white border border-[#D5EBD9] rounded-full px-3 py-2 transition-all duration-200"
          style={{ boxShadow: "0 2px 16px rgba(17,34,26,0.06)" }}
        >
          {/* Search icon */}
          <div className="pl-2 flex-shrink-0" style={{ color: "#8aA898" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            id="company-search-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter a company name..."
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
            className="search-pill-input flex-1 bg-transparent text-base py-1.5 pr-2"
            style={{
              color: "#11221A",
              caretColor: "#008751",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          />

          {/* CTA button — solid #008751, white text, rounded-full */}
          <button
            type="submit"
            id="research-submit-btn"
            disabled={!value.trim() || isLoading}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            style={{ backgroundColor: "#008751" }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#006b40"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#008751"; }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Working…
              </>
            ) : (
              <>Research&nbsp;→</>
            )}
          </button>
        </div>
      </form>

      {/* ── Quick-try chips ── */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium" style={{ color: "#5a7a68" }}>Try:</span>
        {EXAMPLES.map(company => (
          <button
            key={company}
            id={`chip-${company.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            onClick={() => handleChip(company)}
            disabled={isLoading}
            className="text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: "#D5EBD9",
              backgroundColor: "#ffffff",
              color: "#334d3d",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(0,135,81,0.35)";
              e.currentTarget.style.backgroundColor = "#EAF5EE";
              e.currentTarget.style.color = "#008751";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#D5EBD9";
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.color = "#334d3d";
            }}
          >
            {company}
          </button>
        ))}
      </div>
    </div>
  );
}
