# Verdict — AI Investment Research Agent

> Enter any company name. Get a structured **Invest / Pass / Hold** verdict backed by live web research and a multi-node AI agent.

🌐 **Live Demo:** [https://verdict-ai-investment-research-agent.onrender.com](https://verdict-ai-investment-research-agent.onrender.com)
📁 **GitHub:** [https://github.com/sumitkumarbarnwal/Verdict-AI-Investment-Research-Agent](https://github.com/sumitkumarbarnwal/Verdict-AI-Investment-Research-Agent)



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

---

### ✅ Prerequisites

Before starting, make sure you have the following installed and ready:

| Requirement | Version | Where to get it |
|---|---|---|
| Node.js | 20 or higher | [nodejs.org](https://nodejs.org) |
| npm | comes with Node.js | — |
| Groq API Key | free | [console.groq.com](https://console.groq.com) → Sign up → API Keys → Create |
| Tavily API Key | free | [app.tavily.com](https://app.tavily.com) → Sign in → API Keys |

> **Note:** Both Groq and Tavily offer generous free tiers — no credit card required.

---

### 📦 Method 1 — Download ZIP

Use this method if you received the project as a `.zip` file.

**Step 1 — Extract the ZIP**

Extract the downloaded file `Verdict-AI-Investment-Research-Agent.zip` to any folder on your computer.

**Step 2 — Open a terminal in that folder**

- **Windows:** Right-click inside the extracted folder → "Open in Terminal" (or open PowerShell/CMD and `cd` into the folder)
- **Mac/Linux:** Open Terminal and `cd` into the extracted folder

```bash
cd Verdict-AI-Investment-Research-Agent
```

**Step 3 — Install dependencies**

```bash
npm install --legacy-peer-deps
```

> This installs all required packages. The `--legacy-peer-deps` flag is needed due to LangChain package version constraints. This is normal.

**Step 4 — Create your environment file**

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

Now open `.env.local` in any text editor (Notepad, VS Code, etc.) and fill in your keys:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
TAVILY_API_KEY=tvly-your_actual_key_here
```

**Step 5 — Start the development server**

```bash
npm run dev
```

**Step 6 — Open the app**

Open your browser and go to:
```
http://localhost:3000
```

---

### 🔗 Method 2 — Git Clone

Use this method if you have Git installed and want to clone directly from GitHub.

**Step 1 — Clone the repository**

```bash
git clone https://github.com/sumitkumarbarnwal/Verdict-AI-Investment-Research-Agent.git
```

**Step 2 — Navigate into the project folder**

```bash
cd Verdict-AI-Investment-Research-Agent
```

**Step 3 — Install dependencies**

```bash
npm install --legacy-peer-deps
```

**Step 4 — Create your environment file**

```bash
# Mac / Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Open `.env.local` and add your API keys:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
TAVILY_API_KEY=tvly-your_actual_key_here
```

**Step 5 — Start the development server**

```bash
npm run dev
```

**Step 6 — Open the app**

```
http://localhost:3000
```

---

### 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key. Get free at [console.groq.com](https://console.groq.com) |
| `TAVILY_API_KEY` | ✅ Yes | — | Tavily web search key. Get free at [app.tavily.com](https://app.tavily.com) |
| `LLM_PROVIDER` | ❌ No | `groq` | LLM provider to use (`groq` is the default) |
| `LLM_MODEL` | ❌ No | `llama-3.3-70b-versatile` | Override the default model name |
| `RATE_LIMIT_RPM` | ❌ No | `5` | Max research requests per IP per minute |

---

### 🐳 Method 3 — Docker (for deployment / Render)

If you want to run the app in a Docker container locally or deploy to Render:

**Step 1 — Build the Docker image**

```bash
docker build -t verdict .
```

**Step 2 — Run the container**

```bash
docker run -p 3000:3000 \
  -e GROQ_API_KEY=your_groq_key \
  -e TAVILY_API_KEY=your_tavily_key \
  -e NODE_ENV=production \
  verdict
```

**Step 3 — Open the app**

```
http://localhost:3000
```

---

### ☁️ Deploy to Render (Cloud)

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect the GitHub repo
4. Set **Runtime = Docker**
5. Add environment variables: `GROQ_API_KEY`, `TAVILY_API_KEY`, `NODE_ENV=production`
6. Click **Create Web Service** — Render builds and deploys automatically

---

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
