# Verdict — AI Investment Research Agent

> Enter any company name. Get a structured **Invest / Pass / Hold** verdict backed by live web research and a multi-node AI agent.

---

## Overview

Verdict is a production-ready AI investment research agent built with:

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + React + Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| AI Orchestration | LangChain.js + **LangGraph.js** |
| LLM | **Groq** (llama / mixtral — free tier) |
| Web Research | Tavily Search API (live web + news) |
| Deployment | **Render** (Docker) |

A user types a company name → the LangGraph agent runs 5 sequential nodes → the frontend streams live progress → a structured verdict is displayed with an investment scorecard, pros/cons, risks, and expandable research sections with citations.

---

## How to Run It

### Prerequisites

- Node.js 20+
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Tavily API key — free tier: 1,000 searches/month at [app.tavily.com](https://app.tavily.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sumitkumarbarnwal/Verdict-AI-Investment-Research-Agent.git
cd Verdict-AI-Investment-Research-Agent

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key (free at console.groq.com) |
| `TAVILY_API_KEY` | ✅ | Tavily web search API key |
| `LLM_PROVIDER` | ❌ | `groq` (default) |
| `LLM_MODEL` | ❌ | Override model name |
| `RATE_LIMIT_RPM` | ❌ | Requests per IP per minute (default: 5) |

### Deploy to Render

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Set **Runtime = Docker** (Render auto-detects the `Dockerfile`)
5. Add environment variables in the Render dashboard:
   - `GROQ_API_KEY`
   - `TAVILY_API_KEY`
   - `NODE_ENV=production`
6. Click **Create Web Service** — build takes ~3–5 min

> **Note:** Free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s to wake up.

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
│   │  Intake  │  Canonicalise company name via Groq LLM       │
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
│   │Synthesis │  Groq aggregates raw search results           │
│   │          │  into structured per-section summaries        │
│   └────┬─────┘                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                               │
│   │ Decision │  Groq applies investment framework:           │
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
        ├── llm.js             # LLM factory (Groq via OpenAI-compatible API)
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
  "summary": "Zerodha is India's largest retail stockbroker with a dominant market position, bootstrapped profitability since inception, and a proven tech-first model.",
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
  "summary": "Byju's faces severe structural challenges: mounting debt, regulatory investigations, auditor resignations, and significant revenue restatements.",
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
  "summary": "Stripe is a world-class fintech infrastructure company with unparalleled developer adoption. As a private company, valuation uncertainty makes a definitive verdict difficult.",
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
| **Groq over paid LLMs** | Free tier with fast inference — ideal for a demo. Llama 3 on Groq delivers quality results at zero cost |
| **LangGraph over a single chain** | Multi-node graph enables clear separation of concerns, better observability via step streaming, and easier future expansion |
| **Parallel research searches** | All 6 Tavily searches run concurrently (`Promise.all`) to minimise latency — research phase takes ~5s instead of ~30s sequential |
| **NDJSON streaming** | Lets the UI show live progress without waiting for the full agent to complete. Much better UX than a blank spinner |
| **Docker on Render** | No cold-start timeout limits unlike serverless. The LangGraph agent can run as long as needed |
| **Tailwind v3 (not v4)** | Broader ecosystem compatibility and stable PostCSS plugin |

---

## What I'd Improve With More Time

1. **Persistent rate limiting** — Replace in-memory store with Upstash Redis
2. **Result caching** — Cache results in KV for 1 hour so repeated lookups are instant
3. **PDF export** — Add `@react-pdf/renderer` for a styled PDF download
4. **Historical comparison** — Store past verdicts to show score changes over time
5. **Financial data APIs** — Integrate Alpha Vantage for real P/E ratios and revenue charts
6. **Parallel LLM calls** — Run synthesis summaries per section in parallel
7. **User accounts** — Let users save and revisit past research reports

---

## Disclaimer

Research reports are AI-generated and grounded in live web data. **This is not financial advice.** Always conduct your own due diligence before making investment decisions.

---

*Built with ❤️ using Next.js, LangGraph, Groq, and Tavily*
