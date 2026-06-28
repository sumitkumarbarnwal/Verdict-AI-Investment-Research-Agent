"use client";

/**
 * @file page.js — Main Verdict application page.
 *
 * States:
 *   idle     → show hero + search bar
 *   loading  → show search bar + progress timeline
 *   result   → show full verdict report
 *   error    → show friendly error state
 */

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ProgressTimeline from "@/components/ProgressTimeline";
import VerdictBadge from "@/components/VerdictBadge";
import Scorecard from "@/components/Scorecard";
import ResearchSection from "@/components/ResearchSection";
import ReportExport from "@/components/ReportExport";
import { sandboxCompanies } from "@/lib/sandboxData";

/** @typedef {"idle"|"loading"|"result"|"error"} AppState */

export default function HomePage() {
  /** @type {[AppState, function]} */
  const [appState, setAppState] = useState("idle");
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");

  /**
   * Kicks off a research request for the given company name.
   * Reads the streaming NDJSON response and updates UI state.
   *
   * @param {string} company
   */
  const handleSearch = useCallback(async (company) => {
    setCurrentCompany(company);
    setAppState("loading");
    setSteps([]);
    setResult(null);
    setErrorMsg("");

    try {
      const response = await fetch("/api/research", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ company }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed: ${response.status}`);
      }

      // Parse the NDJSON stream line by line
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let event;
          try {
            event = JSON.parse(trimmed);
          } catch {
            continue;
          }

          if (event.type === "progress") {
            // Merge step updates
            setSteps((prev) => {
              const map = {};
              for (const s of prev) map[s.id] = s;
              for (const s of event.steps || []) map[s.id] = { ...map[s.id], ...s };
              return Object.values(map);
            });
          } else if (event.type === "result") {
            setResult(event.data);
            setAppState("result");
          } else if (event.type === "error") {
            throw new Error(event.message || "Research failed.");
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setAppState("error");
    }
  }, []);

  /**
   * Simulates a real search pipeline locally using the preloaded sandbox dataset.
   * Steps through the 10 progress indicators before rendering the result.
   */
  const handleSandboxSearch = useCallback((companyKey) => {
    const data = sandboxCompanies[companyKey];
    if (!data) return;

    setCurrentCompany(data.companyName);
    setAppState("loading");
    setErrorMsg("");
    setResult(null);

    const stepsList = [
      { id: "intake",             label: "Validating company name" },
      { id: "research-overview",  label: "Researching company overview" },
      { id: "research-financials",label: "Researching financials & funding" },
      { id: "research-news",      label: "Researching recent news" },
      { id: "research-competitors",label:"Researching competitive landscape" },
      { id: "research-team",      label: "Researching leadership & team" },
      { id: "research-risks",     label: "Researching risks & red flags" },
      { id: "synthesis",          label: "Synthesising research findings" },
      { id: "decision",           label: "Generating investment verdict" },
      { id: "output",             label: "Preparing final report" },
    ];

    setSteps(stepsList.map(s => ({ ...s, status: "pending" })));

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex > stepsList.length) {
        clearInterval(interval);
        setResult(data);
        setAppState("result");
        return;
      }

      setSteps(() => {
        return stepsList.map((step, idx) => {
          if (idx < currentIndex) {
            return { ...step, status: "done" };
          } else if (idx === currentIndex) {
            return { ...step, status: "running" };
          } else {
            return { ...step, status: "pending" };
          }
        });
      });

      currentIndex++;
    }, 120);
  }, []);

  /** Reset to idle state */
  function handleReset() {
    setAppState("idle");
    setSteps([]);
    setResult(null);
    setErrorMsg("");
    setCurrentCompany("");
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <Header />

      {/* Main content area */}
      <main className="pt-14 min-h-screen flex flex-col relative z-10">
        {/* ── IDLE: Hero landing view ─────────────────────────────────────── */}
        {appState === "idle" && (
          <div className="flex-1 flex flex-col items-center px-4 pt-8 sm:pt-10 pb-16 sm:pb-20 relative overflow-hidden" style={{ backgroundColor: "#F8FBF9" }}>

            {/* ── Top-left dot-network ── */}
            <div className="absolute top-0 left-0 pointer-events-none select-none" aria-hidden="true" style={{ width: 380, height: 350, opacity: 0.75 }}>
              <svg width="380" height="350" viewBox="0 0 380 350" fill="none">
                {/* Lines */}
                <line x1="38"  y1="42"  x2="108" y2="24"  stroke="#008751" strokeWidth="0.8" opacity="0.14"/>
                <line x1="108" y1="24"  x2="182" y2="56"  stroke="#008751" strokeWidth="0.8" opacity="0.13"/>
                <line x1="182" y1="56"  x2="244" y2="30"  stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="244" y1="30"  x2="318" y2="72"  stroke="#008751" strokeWidth="0.8" opacity="0.10"/>
                <line x1="38"  y1="42"  x2="72"  y2="114" stroke="#008751" strokeWidth="0.8" opacity="0.14"/>
                <line x1="108" y1="24"  x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="182" y1="56"  x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="72"  y1="114" x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.13"/>
                <line x1="158" y1="138" x2="232" y2="112" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="232" y1="112" x2="318" y2="72"  stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="72"  y1="114" x2="44"  y2="194" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="158" y1="138" x2="122" y2="222" stroke="#008751" strokeWidth="0.8" opacity="0.10"/>
                <line x1="232" y1="112" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="318" y1="72"  x2="324" y2="148" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="324" y1="148" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="44"  y1="194" x2="122" y2="222" stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="122" y1="222" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="222" y1="202" x2="292" y2="236" stroke="#008751" strokeWidth="0.8" opacity="0.07"/>
                <line x1="122" y1="222" x2="92"  y2="298" stroke="#008751" strokeWidth="0.8" opacity="0.06"/>
                <line x1="222" y1="202" x2="192" y2="276" stroke="#008751" strokeWidth="0.8" opacity="0.06"/>
                {/* Dot nodes */}
                <circle cx="38"  cy="42"  r="4.5" fill="#008751" opacity="0.24"/>
                <circle cx="108" cy="24"  r="3"   fill="#008751" opacity="0.18"/>
                <circle cx="182" cy="56"  r="3.5" fill="#008751" opacity="0.19"/>
                <circle cx="244" cy="30"  r="2.5" fill="#008751" opacity="0.14"/>
                <circle cx="318" cy="72"  r="3"   fill="#008751" opacity="0.13"/>
                <circle cx="72"  cy="114" r="3.5" fill="#008751" opacity="0.21"/>
                <circle cx="158" cy="138" r="5"   fill="#008751" opacity="0.24"/>
                <circle cx="232" cy="112" r="3"   fill="#008751" opacity="0.16"/>
                <circle cx="324" cy="148" r="2.5" fill="#008751" opacity="0.11"/>
                <circle cx="44"  cy="194" r="3"   fill="#008751" opacity="0.16"/>
                <circle cx="122" cy="222" r="4"   fill="#008751" opacity="0.18"/>
                <circle cx="222" cy="202" r="3.5" fill="#008751" opacity="0.14"/>
                <circle cx="292" cy="236" r="2.5" fill="#008751" opacity="0.10"/>
                <circle cx="92"  cy="298" r="3"   fill="#008751" opacity="0.11"/>
                <circle cx="192" cy="276" r="2.5" fill="#008751" opacity="0.09"/>
              </svg>
            </div>

            {/* ── Top-right dot-network (mirrored) ── */}
            <div className="absolute top-0 right-0 pointer-events-none select-none" aria-hidden="true" style={{ width: 380, height: 350, opacity: 0.75 }}>
              <svg width="380" height="350" viewBox="0 0 380 350" fill="none" style={{ transform: "scaleX(-1)" }}>
                {/* Same topology, mirrored */}
                <line x1="38"  y1="42"  x2="108" y2="24"  stroke="#008751" strokeWidth="0.8" opacity="0.14"/>
                <line x1="108" y1="24"  x2="182" y2="56"  stroke="#008751" strokeWidth="0.8" opacity="0.13"/>
                <line x1="182" y1="56"  x2="244" y2="30"  stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="244" y1="30"  x2="318" y2="72"  stroke="#008751" strokeWidth="0.8" opacity="0.10"/>
                <line x1="38"  y1="42"  x2="72"  y2="114" stroke="#008751" strokeWidth="0.8" opacity="0.14"/>
                <line x1="108" y1="24"  x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="182" y1="56"  x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="72"  y1="114" x2="158" y2="138" stroke="#008751" strokeWidth="0.8" opacity="0.13"/>
                <line x1="158" y1="138" x2="232" y2="112" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="232" y1="112" x2="318" y2="72"  stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="72"  y1="114" x2="44"  y2="194" stroke="#008751" strokeWidth="0.8" opacity="0.11"/>
                <line x1="158" y1="138" x2="122" y2="222" stroke="#008751" strokeWidth="0.8" opacity="0.10"/>
                <line x1="232" y1="112" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="318" y1="72"  x2="324" y2="148" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="324" y1="148" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="44"  y1="194" x2="122" y2="222" stroke="#008751" strokeWidth="0.8" opacity="0.09"/>
                <line x1="122" y1="222" x2="222" y2="202" stroke="#008751" strokeWidth="0.8" opacity="0.08"/>
                <line x1="222" y1="202" x2="292" y2="236" stroke="#008751" strokeWidth="0.8" opacity="0.07"/>
                <line x1="122" y1="222" x2="92"  y2="298" stroke="#008751" strokeWidth="0.8" opacity="0.06"/>
                <line x1="222" y1="202" x2="192" y2="276" stroke="#008751" strokeWidth="0.8" opacity="0.06"/>
                {/* Dot nodes */}
                <circle cx="38"  cy="42"  r="4.5" fill="#008751" opacity="0.24"/>
                <circle cx="108" cy="24"  r="3"   fill="#008751" opacity="0.18"/>
                <circle cx="182" cy="56"  r="3.5" fill="#008751" opacity="0.19"/>
                <circle cx="244" cy="30"  r="2.5" fill="#008751" opacity="0.14"/>
                <circle cx="318" cy="72"  r="3"   fill="#008751" opacity="0.13"/>
                <circle cx="72"  cy="114" r="3.5" fill="#008751" opacity="0.21"/>
                <circle cx="158" cy="138" r="5"   fill="#008751" opacity="0.24"/>
                <circle cx="232" cy="112" r="3"   fill="#008751" opacity="0.16"/>
                <circle cx="324" cy="148" r="2.5" fill="#008751" opacity="0.11"/>
                <circle cx="44"  cy="194" r="3"   fill="#008751" opacity="0.16"/>
                <circle cx="122" cy="222" r="4"   fill="#008751" opacity="0.18"/>
                <circle cx="222" cy="202" r="3.5" fill="#008751" opacity="0.14"/>
                <circle cx="292" cy="236" r="2.5" fill="#008751" opacity="0.10"/>
                <circle cx="92"  cy="298" r="3"   fill="#008751" opacity="0.11"/>
                <circle cx="192" cy="276" r="2.5" fill="#008751" opacity="0.09"/>
              </svg>
            </div>


            <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-semibold mb-8 animate-fade-in"
                style={{ borderColor: "rgba(0,135,81,0.25)", backgroundColor: "#EAF5EE", color: "#008751" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#008751" }} />
                Live Multi-Agent Orchestration
              </div>

              {/* Headline — #11221A base, "Research" gradient #11221A → #00DF89 */}
              <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] mb-6 animate-slide-up tracking-tight" style={{ color: "#11221A" }}>
                AI-Powered
                <br />
                Investment{" "}
                <span className="gradient-research">Research</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.08s", color: "#5a7a68" }}>
                Drop a company name. Get a live AI-powered <strong>Invest&nbsp;or&nbsp;Pass</strong> verdict in seconds.
              </p>

              {/* Search pill — wider, no outer card wrapper */}
              <div
                className="w-full max-w-3xl mx-auto mb-12 animate-slide-up"
                style={{ animationDelay: "0.12s" }}
              >
                <SearchBar onSearch={handleSearch} isLoading={false} />
              </div>

              {/* Metric cards — #EAF5EE surface, 4-column grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto w-full mb-20 animate-fade-in" style={{ animationDelay: "0.18s" }}>
                {[
                  { value: "20+",   label: "Sources Checked",      desc: "Live web pages & documents" },
                  { value: "6",     label: "Metric Dimensions",     desc: "Holistic scorecard matrix" },
                  { value: "100%",  label: "Real-Time Grounded",    desc: "Zero training-cutoff bias" },
                  { value: "< 15s", label: "Reasoning Speed",       desc: "Parallelized graph execution" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl text-center transition-all duration-300 group cursor-default"
                    style={{
                      backgroundColor: "#EAF5EE",
                      border: "1px solid #D5EBD9",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,135,81,0.35)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#D5EBD9"}
                  >
                    <div className="text-2xl sm:text-3xl font-black mb-1 font-mono" style={{ color: "#11221A" }}>{stat.value}</div>
                    <div className="text-xs font-bold mb-1" style={{ color: "#1a3028" }}>{stat.label}</div>
                    <div className="text-2xs leading-tight" style={{ color: "#5a7a68" }}>{stat.desc}</div>
                  </div>
                ))}
              </div>

              {/* Interactive Sandbox Cards */}
              <div className="w-full max-w-5xl mx-auto mb-20 text-left animate-fade-in" style={{ animationDelay: "0.22s" }}>
                <div className="text-center mb-10">
                  <span className="text-2xs font-mono uppercase tracking-widest text-brand-600 font-semibold px-2.5 py-1 rounded-md bg-brand-50 border border-brand-500/20">Sandbox Playground</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-white mt-4 tracking-tight">Interactive Analysis Models</h2>
                  <p className="text-sm text-ink-subtle mt-2">Explore Verdict's capabilities immediately — no API keys needed</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Card 1: Stripe */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-3 flex flex-col justify-between hover:border-invest/40 transition-all duration-300 hover:shadow-card-hover group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xs font-bold font-mono text-ink-muted uppercase tracking-wider">Payments SaaS</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-invest/10 text-invest-text border border-invest/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-invest animate-pulse" />
                          INVEST
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ink-white group-hover:text-invest transition-colors">Stripe, Inc.</h3>
                      <p className="text-xs text-ink-subtle mt-2 leading-relaxed">Robust payment processing giant. Enjoys strong developer mindshare, high customer switching costs, and expanding enterprise software suites.</p>
                      <div className="mt-4 flex items-center justify-between text-2xs text-ink-muted border-t border-surface-3 pt-3">
                        <span>Confidence Level:</span>
                        <span className="font-bold text-ink-strong font-mono">94%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSandboxSearch("stripe")}
                      className="w-full mt-5 py-2 rounded-lg bg-surface-2 hover:bg-invest border border-surface-3 hover:border-invest text-xs font-semibold text-ink-base hover:text-white transition-all duration-200"
                    >
                      Explore Report →
                    </button>
                  </div>

                  {/* Card 2: Byju's */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-3 flex flex-col justify-between hover:border-pass/40 transition-all duration-300 hover:shadow-card-hover group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xs font-bold font-mono text-ink-muted uppercase tracking-wider">EdTech</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pass/10 text-pass-text border border-pass/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-pass animate-pulse" />
                          PASS
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ink-white group-hover:text-pass transition-colors">Byju's</h3>
                      <p className="text-xs text-ink-subtle mt-2 leading-relaxed">High distress indicators. Facing auditor resignations, governance failures, debt litigation, and critical liquidity constraints.</p>
                      <div className="mt-4 flex items-center justify-between text-2xs text-ink-muted border-t border-surface-3 pt-3">
                        <span>Confidence Level:</span>
                        <span className="font-bold text-ink-strong font-mono">96%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSandboxSearch("byju's")}
                      className="w-full mt-5 py-2 rounded-lg bg-surface-2 hover:bg-pass border border-surface-3 hover:border-pass text-xs font-semibold text-ink-base hover:text-white transition-all duration-200"
                    >
                      Explore Report →
                    </button>
                  </div>

                  {/* Card 3: Swiggy */}
                  <div className="p-6 rounded-2xl bg-white border border-surface-3 flex flex-col justify-between hover:border-hold/40 transition-all duration-300 hover:shadow-card-hover group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xs font-bold font-mono text-ink-muted uppercase tracking-wider">Quick Commerce</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-hold/10 text-hold-text border border-hold/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-hold animate-pulse" />
                          HOLD
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ink-white group-hover:text-hold transition-colors">Swiggy Limited</h3>
                      <p className="text-xs text-ink-subtle mt-2 leading-relaxed">High growth duopoly. Holds strong market share with Instamart quick commerce, but margins currently lag key benchmarks.</p>
                      <div className="mt-4 flex items-center justify-between text-2xs text-ink-muted border-t border-surface-3 pt-3">
                        <span>Confidence Level:</span>
                        <span className="font-bold text-ink-strong font-mono">68%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSandboxSearch("swiggy")}
                      className="w-full mt-5 py-2 rounded-lg bg-surface-2 hover:bg-hold border border-surface-3 hover:border-hold text-xs font-semibold text-ink-base hover:text-white transition-all duration-200"
                    >
                      Explore Report →
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── LOADING: Progress timeline ──────────────────────────────────── */}
        {appState === "loading" && (
          <div className="flex-1 flex flex-col items-center px-4 py-12">
            {/* Company name + search bar at top */}
            <div className="w-full max-w-2xl mb-10">
              <SearchBar onSearch={handleSearch} isLoading={true} />
            </div>

            {/* Research context */}
            <div className="text-center mb-8">
              <p className="text-ink-muted text-sm font-medium">Researching</p>
              <h2 className="text-3xl font-black text-ink-white tracking-tight">{currentCompany}</h2>
            </div>

            {/* Live progress timeline */}
            <ProgressTimeline steps={steps} />
          </div>
        )}

        {/* ── ERROR: Friendly error state ─────────────────────────────────── */}
        {appState === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center">
              {/* Error icon */}
              <div className="w-16 h-16 rounded-2xl bg-pass/10 border border-pass/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-ink-white mb-2">Research Failed</h3>
              <p className="text-ink-subtle text-sm mb-6 leading-relaxed">{errorMsg}</p>

              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-glow-brand"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT: Full verdict report ─────────────────────────────────── */}
        {appState === "result" && result && (
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-6">
            {/* Top bar: new search + export */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                id="new-research-btn"
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-ink-subtle hover:text-ink-loud transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                New Research
              </button>
              <ReportExport result={result} companyName={result.companyName || currentCompany} />
            </div>

            {/* Disambiguation note */}
            {result.disambiguationNote && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-hold/10 border border-hold/20 text-hold-text text-sm">
                <span>ℹ️</span>
                <span>{result.disambiguationNote}</span>
              </div>
            )}

            {/* Big verdict badge */}
            <VerdictBadge
              verdict={result.verdict}
              confidence={result.confidence}
              companyName={result.companyName || currentCompany}
            />

            {/* Executive summary */}
            {result.summary && (
              <div
                className="bg-surface-1 border border-surface-3 rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: "0.15s" }}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
                  Executive Summary
                </h3>
                <p className="text-ink-base leading-relaxed text-sm">{result.summary}</p>
              </div>
            )}

            {/* Pros / Cons */}
            <div className="grid sm:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {/* Pros */}
              <div className="bg-surface-1 border border-invest/20 rounded-2xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-invest mb-3 flex items-center gap-1.5">
                  <span>✓</span> Investment Case
                </h4>
                <ul className="space-y-2">
                  {(result.prosFor || []).map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-base">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-invest flex-shrink-0" />
                      <span className="leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-surface-1 border border-pass/20 rounded-2xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-pass-text mb-3 flex items-center gap-1.5">
                  <span>✗</span> Concerns
                </h4>
                <ul className="space-y-2">
                  {(result.consAgainst || []).map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-base">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pass flex-shrink-0" />
                      <span className="leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Scorecard */}
            {result.scorecard && <Scorecard scorecard={result.scorecard} />}

            {/* Key risks */}
            {result.risks?.length > 0 && (
              <div
                className="bg-surface-1 border border-surface-3 rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: "0.25s" }}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
                  Key Risks
                </h3>
                <ul className="space-y-2">
                  {result.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-base">
                      <span className="mt-0.5 flex-shrink-0 text-hold">⚠</span>
                      <span className="leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Research sections */}
            {result.sections?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted px-1">
                  Detailed Research
                </h3>
                {result.sections.map((section, i) => (
                  <ResearchSection
                    key={section.aspect}
                    section={section}
                    defaultOpen={i === 0}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Footer disclaimer */}
            <div className="pb-10 text-center">
              <p className="text-2xs text-ink-muted leading-relaxed">
                Research generated{" "}
                {result.researchedAt
                  ? new Date(result.researchedAt).toLocaleString()
                  : "just now"}{" "}
                • Not financial advice. Always do your own due diligence.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

