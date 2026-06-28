"use client";

/**
 * ReportExport — lets the user download the research report as a PDF.
 *
 * Uses the browser's native print-to-PDF via a hidden iframe containing
 * a fully styled HTML page. No external libraries required.
 *
 * @param {{ result: Object, companyName: string }} props
 */

/** Colour tokens matching the app design */
const COLOURS = {
  invest: "#008751",
  pass:   "#dc2626",
  hold:   "#d97706",
  ink:    "#11221A",
  muted:  "#5a7a68",
  border: "#D5EBD9",
  bg:     "#F8FBF9",
};

/**
 * Returns the hex colour for the verdict badge.
 * @param {string} verdict
 */
function verdictColour(verdict) {
  if (verdict === "INVEST") return COLOURS.invest;
  if (verdict === "PASS")   return COLOURS.pass;
  return COLOURS.hold;
}

/**
 * Escapes HTML special characters to prevent XSS inside the iframe.
 * @param {string} str
 */
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds a full HTML document string for the PDF.
 * @param {Object} result
 * @param {string} companyName
 * @returns {string}
 */
function buildHTML(result, companyName) {
  const date = new Date(result.researchedAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const colour = verdictColour(result.verdict);

  /* ── Scorecard rows ── */
  const scorecardRows = result.scorecard
    ? Object.entries(result.scorecard).map(([dim, score]) => {
        const label = {
          marketSize:      "Market Size",
          moat:            "Competitive Moat",
          team:            "Team Quality",
          financialHealth: "Financial Health",
          momentum:        "Momentum",
          riskLevel:       "Risk Level",
        }[dim] ?? dim;
        const pct  = (score / 10) * 100;
        const fill = dim === "riskLevel"
          ? (score >= 7 ? COLOURS.pass : score >= 4 ? COLOURS.hold : COLOURS.invest)
          : (score >= 7 ? COLOURS.invest : score >= 4 ? COLOURS.hold : COLOURS.pass);
        return `
          <tr>
            <td style="padding:6px 8px;color:${COLOURS.muted};font-size:12px;">${esc(label)}</td>
            <td style="padding:6px 8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="flex:1;height:6px;background:#e2e8f0;border-radius:9999px;overflow:hidden;">
                  <div style="width:${pct}%;height:100%;background:${fill};border-radius:9999px;"></div>
                </div>
                <span style="font-size:12px;font-weight:700;color:${COLOURS.ink};min-width:30px;">${score}/10</span>
              </div>
            </td>
          </tr>`;
      }).join("")
    : "";

  /* ── Pros ── */
  const pros = (result.prosFor || [])
    .map(p => `<li style="margin-bottom:4px;font-size:12px;color:${COLOURS.ink};">${esc(p)}</li>`)
    .join("");

  /* ── Cons ── */
  const cons = (result.consAgainst || [])
    .map(p => `<li style="margin-bottom:4px;font-size:12px;color:${COLOURS.ink};">${esc(p)}</li>`)
    .join("");

  /* ── Risks ── */
  const risks = (result.risks || [])
    .map(r => `<li style="margin-bottom:4px;font-size:12px;color:${COLOURS.ink};">⚠ ${esc(r)}</li>`)
    .join("");

  /* ── Research sections ── */
  const sections = (result.sections || []).map(s => {
    const heading = s.aspect.charAt(0).toUpperCase() + s.aspect.slice(1);
    const points  = (s.keyPoints || [])
      .map(p => `<li style="margin-bottom:3px;font-size:11px;color:${COLOURS.ink};">${esc(p)}</li>`)
      .join("");
    const sources = (s.sources || [])
      .filter(src => src.url)
      .map(src => `<li style="font-size:10px;"><a href="${esc(src.url)}" style="color:${COLOURS.invest};">${esc(src.title || src.url)}</a></li>`)
      .join("");
    return `
      <div style="margin-bottom:20px;padding:14px;border:1px solid ${COLOURS.border};border-radius:8px;break-inside:avoid;">
        <h3 style="margin:0 0 8px;font-size:13px;font-weight:700;color:${COLOURS.ink};text-transform:uppercase;letter-spacing:0.05em;">${esc(heading)}</h3>
        <p style="margin:0 0 8px;font-size:12px;color:${COLOURS.muted};line-height:1.6;">${esc(s.summary || "")}</p>
        ${points ? `<ul style="margin:0 0 8px;padding-left:18px;">${points}</ul>` : ""}
        ${sources ? `<div style="margin-top:6px;"><span style="font-size:10px;font-weight:600;color:${COLOURS.muted};text-transform:uppercase;">Sources</span><ul style="margin:4px 0 0;padding-left:18px;">${sources}</ul></div>` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Verdict Report — ${esc(companyName)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: ${COLOURS.ink}; padding: 40px; font-size: 13px; }
  h1 { font-size: 22px; font-weight: 900; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${COLOURS.muted}; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  ul { padding-left: 18px; }
  .divider { border: none; border-top: 1px solid ${COLOURS.border}; margin: 20px 0; }
  @media print {
    body { padding: 20px; }
    a { color: inherit !important; text-decoration: none; }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
    <div>
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${COLOURS.muted};margin-bottom:6px;">Verdict — AI Investment Research</div>
      <h1>${esc(companyName)}</h1>
      <div style="margin-top:4px;font-size:11px;color:${COLOURS.muted};">Researched on ${esc(date)}</div>
    </div>
    <div style="text-align:center;padding:12px 20px;border-radius:10px;background:${colour}18;border:2px solid ${colour};">
      <div style="font-size:22px;font-weight:900;color:${colour};">${esc(result.verdict)}</div>
      <div style="font-size:11px;font-weight:600;color:${COLOURS.muted};margin-top:2px;">Confidence: ${esc(String(result.confidence))}%</div>
    </div>
  </div>

  <hr class="divider"/>

  <!-- Summary -->
  <div style="margin-bottom:20px;">
    <h2>Executive Summary</h2>
    <p style="font-size:12px;line-height:1.7;color:${COLOURS.ink};">${esc(result.summary || "")}</p>
  </div>

  <hr class="divider"/>

  <!-- Scorecard -->
  ${scorecardRows ? `
  <div style="margin-bottom:20px;">
    <h2>Investment Scorecard</h2>
    <table>${scorecardRows}</table>
  </div>
  <hr class="divider"/>` : ""}

  <!-- Pros & Cons -->
  <div style="display:flex;gap:20px;margin-bottom:20px;">
    <div style="flex:1;padding:14px;border:1px solid ${COLOURS.invest}30;border-radius:8px;">
      <h2 style="color:${COLOURS.invest};margin-bottom:8px;">✓ Investment Case</h2>
      <ul>${pros}</ul>
    </div>
    <div style="flex:1;padding:14px;border:1px solid ${COLOURS.pass}30;border-radius:8px;">
      <h2 style="color:${COLOURS.pass};margin-bottom:8px;">✗ Concerns</h2>
      <ul>${cons}</ul>
    </div>
  </div>

  <!-- Risks -->
  ${risks ? `
  <div style="margin-bottom:20px;padding:14px;border:1px solid ${COLOURS.hold}30;border-radius:8px;">
    <h2 style="color:${COLOURS.hold};margin-bottom:8px;">Key Risks</h2>
    <ul>${risks}</ul>
  </div>` : ""}

  <hr class="divider"/>

  <!-- Research Sections -->
  ${sections ? `
  <div style="margin-bottom:20px;">
    <h2>Detailed Research</h2>
    ${sections}
  </div>` : ""}

  <!-- Footer -->
  <hr class="divider"/>
  <p style="font-size:10px;color:${COLOURS.muted};text-align:center;line-height:1.6;">
    Generated by <strong>Verdict — AI Investment Research Agent</strong><br/>
    Research is AI-generated and grounded in live web data. <strong>Not financial advice.</strong>
  </p>

</body>
</html>`;
}

export default function ReportExport({ result, companyName }) {
  if (!result) return null;

  function handleExportPDF() {
    const html  = buildHTML(result, companyName);
    const frame = document.createElement("iframe");

    // Hidden off-screen iframe
    frame.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:210mm;height:297mm;border:none;";
    document.body.appendChild(frame);

    frame.contentDocument.open();
    frame.contentDocument.write(html);
    frame.contentDocument.close();

    // Wait for fonts / images to load, then trigger print dialog
    frame.onload = () => {
      setTimeout(() => {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        // Remove iframe after print dialog closes
        setTimeout(() => document.body.removeChild(frame), 1000);
      }, 400);
    };
  }

  return (
    <button
      id="download-report-btn"
      onClick={handleExportPDF}
      className="
        flex items-center gap-2
        px-4 py-2 rounded-xl
        border border-surface-3 bg-surface-1
        text-ink-subtle hover:text-ink-loud
        hover:border-brand-500/30 hover:bg-surface-2
        transition-all duration-200
        text-sm font-medium
      "
      title="Export report as PDF"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export PDF
    </button>
  );
}
