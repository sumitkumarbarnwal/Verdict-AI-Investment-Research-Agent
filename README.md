# Verdict — AI Investment Research Agent

> Enter any company name. Get a structured **Invest / Pass / Hold** verdict backed by live web research and a multi-node AI agent.

![Verdict Demo](./docs/demo.png)

---

## Overview

Verdict is a production-ready AI investment research agent built with:

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + React + Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| AI Orchestration | LangChain.js + **LangGraph.js** |
| LLM | Anthropic Claude (claude-sonnet-4-5) — swappable |
| Web Research | Tavily Search API (live web + news) |
| Deployment | Vercel |

A user types a company name → the LangGraph agent runs 5 sequential nodes → the frontend streams live progress → a structured verdict is displayed with an investment scorecard, pros/cons, risks, and expandable research sections with citations.

---

## How to Run It

### Prerequisites

- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- Tavily API key ([app.tavily.com](https://app.tavily.com)) — free tier: 1,000 searches/month

### Setup

```bash
# 1. Clone / unzip the project
cd verdict

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your API keys

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic Claude API key |
| `TAVILY_API_KEY` | ✅ | Tavily web search API key |
| `LLM_PROVIDER` | ❌ | `anthropic` (default) or `openai` |
| `LLM_MODEL` | ❌ | Override model name (e.g. `claude-opus-4-5`) |
| `RATE_LIMIT_RPM` | ❌ | Requests per IP per minute (default: 5) |

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (set env vars in Vercel dashboard or via CLI)
vercel deploy --prod
```

Set `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` in your Vercel project environment variables. No other changes needed.

---

## How It Works

### Architecture

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  POST /api/research                                          │
│  ├── Rate limiting (sliding window, per-IP)                  │
│  ├── Input validation                                        │
│  └── Streaming NDJSON response                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  LangGraph Agent Graph                       │
│                                                              │
│   [START]                                                    │
│      │                                                       │
│      ▼                                                       │
│   ┌──────────┐                                               │
│   │  Intake  │  Canonicalise company name via LLM            │
│   └────┬─────┘                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                               │
│   │ Research │  6 parallel Tavily searches:                  │
│   │          │  overview, financials, news,                  │
│   │          │  competitors, team, risks                     │
│   └────┬─────┘                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                               │
│   │Synthesis │  LLM aggregates raw search results            │
│   │          │  into structured per-section summaries        │
│   └────┬─────┘                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                               │
│   │ Decision │  LLM applies investment framework:            │
│   │          │  marketSize, moat, team, financialHealth,     │
│   │          │  momentum, riskLevel → INVEST/PASS/HOLD       │
│   └────┬─────┘                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                               │
│   │  Output  │  Assemble + deduplicate final JSON            │
│   └────┬─────┘                                               │
│        │                                                     │
│      [END]                                                   │
└─────────────────────────────────────────────────────────────┘
                  │
                  ▼
         Streaming NDJSON
         (progress + result)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  ├── ProgressTimeline (live step updates)                    │
│  ├── VerdictBadge (INVEST/PASS/HOLD + confidence ring)       │
│  ├── Scorecard (6-dimension bar chart)                       │
│  ├── ResearchSection × 6 (expandable accordions)            │
│  └── ReportExport (Markdown download)                        │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── layout.js             # Root layout, fonts, metadata
│   ├── page.js               # Main page — all 4 UI states
│   ├── globals.css           # Global styles + design tokens
│   └── api/
│       └── research/
│           └── route.js      # Streaming NDJSON API endpoint
├── components/
│   ├── Header.js             # Top nav bar
│   ├── SearchBar.js          # Input + example chips
│   ├── ProgressTimeline.js   # Live step stepper
│   ├── VerdictBadge.js       # Big INVEST/PASS/HOLD badge
│   ├── Scorecard.js          # 6-dimension bar chart
│   ├── ResearchSection.js    # Expandable research accordion
│   └── ReportExport.js       # Markdown download
└── lib/
    ├── rateLimit.js           # Sliding window rate limiter
    └── agent/
        ├── index.js           # Public API: runResearchAgent()
        ├── graph.js           # LangGraph graph definition
        ├── nodes.js           # 5 node implementations
        ├── tools.js           # Tavily LangChain tools
        ├── state.js           # AgentStateAnnotation (LangGraph)
        ├── llm.js             # LLM factory (Anthropic/OpenAI)
        └── config.js          # Central configuration
```

---

## Investment Framework

The Decision node scores each company across 6 dimensions (1–10):

| Dimension | Description |
|---|---|
| Market Size | How large and growing is the addressable market? |
| Competitive Moat | Durable advantages (network effects, IP, switching costs)? |
| Team Quality | Track record, depth, and capability of leadership? |
| Financial Health | Revenue growth, profitability, runway, or funding strength? |
| Momentum | Recent positive signals (growth, partnerships, press)? |
| Risk Level | Severity of risks (1=low, 10=extreme) |

**Verdict rules:**
- **INVEST** — weighted average ≥ 6.5 AND risk ≤ 7
- **PASS** — weighted average < 5.0 OR risk ≥ 8
- **HOLD** — everything else (mixed signals, needs more data)

---

## Example Runs

### Example 1: Zerodha

```json
{
  "verdict": "INVEST",
  "confidence": 82,
  "summary": "Zerodha is India's largest retail stockbroker with a dominant market position, bootstrapped profitability since inception, and a proven tech-first model. The company has consistently generated strong profits with zero external funding, demonstrating exceptional capital efficiency. Key risks include regulatory changes and growing competition from well-funded rivals like Groww.",
  "scorecard": {
    "marketSize": 8,
    "moat": 8,
    "team": 9,
    "financialHealth": 9,
    "momentum": 7,
    "riskLevel": 4
  }
}
```

### Example 2: Byju's

```json
{
  "verdict": "PASS",
  "confidence": 88,
  "summary": "Byju's faces severe structural challenges: mounting debt, regulatory investigations, auditor resignations, and significant revenue restatements have severely damaged credibility. The edtech market has contracted post-COVID and the company's aggressive acquisition strategy has left it overleveraged with no clear path to profitability.",
  "scorecard": {
    "marketSize": 7,
    "moat": 3,
    "team": 2,
    "financialHealth": 1,
    "momentum": 1,
    "riskLevel": 10
  }
}
```

### Example 3: Stripe

```json
{
  "verdict": "HOLD",
  "confidence": 65,
  "summary": "Stripe is a world-class fintech infrastructure company with unparalleled developer adoption, strong revenue growth, and an expanding product suite. However, as a private company, valuation uncertainty and the path to IPO/liquidity make a definitive verdict difficult. Worth monitoring for an IPO or secondary market opportunity.",
  "scorecard": {
    "marketSize": 9,
    "moat": 9,
    "team": 9,
    "financialHealth": 7,
    "momentum": 8,
    "riskLevel": 5
  }
}
```

---

## Key Decisions & Trade-offs

| Decision | Rationale |
|---|---|
| **LangGraph over a single chain** | Multi-node graph enables clear separation of concerns, better observability via step streaming, and easier future expansion (e.g. add a "follow-up questions" node) |
| **Parallel research searches** | All 6 Tavily searches run concurrently (`Promise.all`) to minimise latency — research phase takes ~5s instead of ~30s sequential |
| **NDJSON streaming** | Lets the UI show live progress without waiting for the full agent to complete. Much better UX than a blank spinner for a 30–60s operation |
| **In-memory rate limiter** | Sufficient for a demo/MVP; acknowledged limitation on Vercel serverless (process-local). Production upgrade: Upstash Redis |
| **Tailwind v3 (not v4)** | Broader ecosystem compatibility, stable PostCSS plugin, and the custom config system is more ergonomic for a custom design system |
| **JS not TypeScript** | Per assignment specification; JSDoc comments are used extensively to preserve type documentation |
| **Claude Sonnet** | Best balance of quality/speed/cost for this use case. Opus would give better analysis but at 5x cost and 2x latency |

---

## What I'd Improve With More Time

1. **Persistent rate limiting** — Replace in-memory store with Upstash Redis for true per-IP limits across Vercel serverless instances
2. **Result caching** — Cache results in KV for 1 hour so repeated lookups for the same company are instant
3. **PDF export** — Add `@react-pdf/renderer` for a polished, styled PDF download
4. **Historical comparison** — Store past verdicts to show how a company's score changes over time
5. **Financial data APIs** — Integrate Alpha Vantage or Polygon.io for real P/E ratios, revenue charts, and market cap figures
6. **Parallel LLM calls** — Run synthesis summaries per section in parallel rather than one big batch
7. **User accounts** — Let users save and revisit past research reports
8. **Confidence calibration** — Fine-tune the decision prompt with a validation set of known good/bad investments
9. **Mobile app** — The streaming architecture would translate well to React Native
10. **Webhook/API mode** — Let enterprise users hit the API directly without the UI

---

## Disclaimer

Research reports are AI-generated and grounded in live web data. **This is not financial advice.** Always conduct your own due diligence before making investment decisions.

---

*Built with ❤️ using Next.js, LangGraph, Claude, and Tavily*
