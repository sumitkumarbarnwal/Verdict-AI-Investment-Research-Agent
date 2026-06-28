/**
 * @file sandboxData.js
 * @description Pre-computed mock reports for Stripe, Byju's, and Swiggy.
 * Allows users to instantly view realistic, high-quality investment research reports
 * without invoking live search APIs.
 */

export const sandboxCompanies = {
  stripe: {
    companyName: "Stripe, Inc.",
    verdict: "INVEST",
    confidence: 94,
    disambiguationNote: "Stripe, Inc. — Sandbox Simulation Report",
    summary: "Stripe is a world-class financial infrastructure platform for the internet. Millions of companies—from the world's largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities. Stripe's competitive position remains incredibly strong due to its developers-first API design, immense ecosystem integration, high switching costs, and strong product velocity.",
    prosFor: [
      "Incredible developer mindshare and documentation with industry-standard API integrations.",
      "Extremely strong switching costs once integrated into core SaaS billing systems (e.g., Billing, Stripe Invoicing).",
      "Expanding addressable market with products like Stripe Capital, Issuing, Link, and Tax.",
      "Highly scalable financial infrastructure with robust compliance and bank partner networks."
    ],
    consAgainst: [
      "Intensifying competition from Adyen in the enterprise space and Braintree/PayPal in mid-markets.",
      "Gross take rates face downward pricing pressure from large-volume merchants.",
      "High sensitivity to global macroeconomic retail spending patterns."
    ],
    risks: [
      "Regulatory scrutiny regarding cross-border payments, AML, and banking licenses.",
      "Dependency on Visa and Mastercard fee structures and network rules.",
      "Execution risk as they scale into legacy enterprise back-ends."
    ],
    scorecard: {
      marketSize: 10,
      moat: 9,
      team: 9,
      financialHealth: 9,
      momentum: 8,
      riskLevel: 4
    },
    researchedAt: new Date().toISOString(),
    sections: [
      {
        aspect: "overview",
        sentiment: "positive",
        summary: "Stripe handles hundreds of billions of dollars in transaction volume annually. Founded by Patrick and John Collison, it has evolved from a simple API for card processing into an all-in-one financial operating system. It operates in 40+ countries and supports 135+ currencies.",
        keyPoints: [
          "Founded in 2010 by Patrick and John Collison.",
          "Valuation peaked at $95B in 2021, reset to ~$70B+ in recent employee tender offers.",
          "Processes payment volumes exceeding $1 trillion annually as of recent milestones."
        ],
        sources: [
          { title: "Stripe 2024 Annual Update", url: "https://stripe.com/newsroom/news/annual-update-2024" },
          { title: "Stripe Valuation and Business Model (Forbes)", url: "https://forbes.com/stripe-valuation-2024" }
        ]
      },
      {
        aspect: "financials",
        sentiment: "positive",
        summary: "Stripe is reported to be highly cash-flow positive, with gross revenues surpassing $14B. Free cash flow is robust, driven by high operating leverage and scaling adjacent high-margin SaaS products (Billing, Connect, Tax).",
        keyPoints: [
          "Generating billions in net revenue and cash-flow positive since 2023.",
          "Significant margin expansion driven by value-added services rather than core checkout.",
          "Secured secondary transaction liquidity for employees without public IPO pressure."
        ],
        sources: [
          { title: "Stripe Financial Performance (Bloomberg)", url: "https://bloomberg.com/news/articles/stripe-financials-2024" }
        ]
      },
      {
        aspect: "competitors",
        sentiment: "neutral",
        summary: "Stripe operates in a highly competitive global payment landscape. Adyen is its main challenger in large enterprise platforms, boasting unified global acquiring. Checkout.com and regional players challenge them locally.",
        keyPoints: [
          "Adyen offers lower overall processing costs for massive scale enterprise volume.",
          "PayPal's Braintree remains sticky in consumer-heavy commerce platforms.",
          "Stripe retains the upper hand in fast integration and comprehensive developer tooling."
        ],
        sources: [
          { title: "Adyen vs Stripe: Enterprise Battle", url: "https://techcrunch.com/adyen-stripe-comparison" }
        ]
      },
      {
        aspect: "team",
        sentiment: "positive",
        summary: "Led by co-founders Patrick Collison (CEO) and John Collison (President). They have assembled a top-tier executive team including former leaders from Google, Goldman Sachs, and AWS. Engineer retention is very high.",
        keyPoints: [
          "Founders remain actively involved and hold significant voting power.",
          "Highly respected engineering culture that continues to attract top talent globally.",
          "Strong product-led leadership focusing on continuous release cycles."
        ],
        sources: [
          { title: "Patrick Collison on Tech Leadership", url: "https://ycombinator.com/library/patrick-collison" }
        ]
      },
      {
        aspect: "risks",
        sentiment: "mixed",
        summary: "The main risks stem from macroeconomic trends, regulatory tightening across banking and fintech jurisdictions, and downward pressure on transaction margins as merchants achieve massive scale.",
        keyPoints: [
          "Regulatory compliance cost increases as countries implement strict local localization laws.",
          "Merchant pricing compression as enterprise contracts get renegotiated.",
          "Exposure to credit risk through Stripe Capital merchant cash advances during downturns."
        ],
        sources: [
          { title: "Fintech Regulatory Outlook 2026", url: "https://reuters.com/fintech-regulations-2026" }
        ]
      }
    ]
  },
  "byju's": {
    companyName: "Byju's (Think and Learn Pvt Ltd)",
    verdict: "PASS",
    confidence: 96,
    disambiguationNote: "Think & Learn Pvt. Ltd. — Sandbox Simulation Report",
    summary: "Byju's, once India's most valuable edtech startup at $22B, has faced a severe liquidity crisis, corporate governance failures, legal disputes with lenders, and massive valuation downgrades. With multiple board departures, delayed financial reports, and aggressive debt restructuring challenges, it represents an extremely high-risk scenario that warrants an absolute Pass.",
    prosFor: [
      "Recognizable brand name and massive historical user base in India.",
      "Valuable catalog of learning materials and intellectual property."
    ],
    consAgainst: [
      "Severe corporate governance failures leading to auditor resignations (Deloitte) and board departures.",
      "Acute liquidity crunch, unpaid employee salaries, and ongoing insolvency proceedings.",
      "Outstanding $1.2 billion Term Loan B dispute and insolvency fights with foreign lenders.",
      "Aggressive sales practices that damaged brand reputation and customer trust."
    ],
    risks: [
      "High probability of complete bankruptcy or liquidation.",
      "Massive legal liabilities from lawsuits filed by board members, investors, and lenders.",
      "Total brand erosion and competitor capture by local rivals like PhysicsWallah and Allen."
    ],
    scorecard: {
      marketSize: 8,
      moat: 2,
      team: 1,
      financialHealth: 1,
      momentum: 1,
      riskLevel: 10
    },
    researchedAt: new Date().toISOString(),
    sections: [
      {
        aspect: "overview",
        sentiment: "negative",
        summary: "Founded in 2011 by Byju Raveendran, the company grew rapidly during the COVID-19 pandemic through aggressive acquisition of other edtech platforms like Aakash, Great Learning, and WhiteHat Jr. However, poor post-acquisition integration and excessive debt led to a rapid downward spiral.",
        keyPoints: [
          "Peak valuation reached $22B in 2022; current valuation is estimated at close to zero or negative by major investors.",
          "Underwent multiple rounds of layoffs, cost-cutting, and office closures.",
          "Board members representing major venture capital firms resigned in mass."
        ],
        sources: [
          { title: "The Rise and Fall of Byju's (BBC)", url: "https://bbc.com/news/world-asia-india-67990000" },
          { title: "Byju's Board Resignations & Governance (Economic Times)", url: "https://economictimes.indiatimes.com/byjus-board" }
        ]
      },
      {
        aspect: "financials",
        sentiment: "negative",
        summary: "Financial audits have been delayed by years. The FY22 financials showed massive losses, and subsequent years have seen cash reserves entirely depleted. Insolvency petitions are active in Indian courts (NCLT).",
        keyPoints: [
          "Severe delay in auditing and filing financial statements.",
          "Insolvency proceedings initiated by various entities including the BCCI and US lenders.",
          "Valuation slashed by key backers like BlackRock and Prosus to under $200 million."
        ],
        sources: [
          { title: "NCLT admits insolvency plea against Byju's", url: "https://moneycontrol.com/news/byjus-insolvency-nclt" }
        ]
      },
      {
        aspect: "competitors",
        sentiment: "negative",
        summary: "As Byju's retreated, competitors like PhysicsWallah, Unacademy, Allen, and traditional offline coaching centers have captured its market share. Its online learning model is losing traction to hybrid models.",
        keyPoints: [
          "PhysicsWallah scaled aggressively while maintaining profitability.",
          "Allen Career Institute established strong hybrid classrooms, taking over premium test prep.",
          "Byju's offline 'Tuition Centres' suffered from unpaid rents and staffing issues."
        ],
        sources: [
          { title: "India Edtech Competition Shift", url: "https://inc42.com/india-edtech-shift-2025" }
        ]
      },
      {
        aspect: "team",
        sentiment: "negative",
        summary: "Founder Byju Raveendran's management style has faced severe criticism. Key executives, including country heads, CFOs, and board advisors, have resigned. Investor groups have voted to oust the founder from leadership.",
        keyPoints: [
          "Investors called an EGM to remove Byju Raveendran from operational control.",
          "Significant management instability with continuous turnover in key executive roles.",
          "Widespread employee dissatisfaction due to delayed salaries and lack of communication."
        ],
        sources: [
          { title: "Byju Raveendran's battle with investors", url: "https://reuters.com/byju-raveendran-investors-clash" }
        ]
      }
    ]
  },
  swiggy: {
    companyName: "Swiggy Limited",
    verdict: "HOLD",
    confidence: 68,
    disambiguationNote: "Swiggy Limited — Sandbox Simulation Report",
    summary: "Swiggy is a leading food delivery and quick-commerce platform in India. It operates in a tight duopoly with Zomato. While Swiggy shows massive revenue growth and successful quick-commerce scaling (Swiggy Instamart), its profit margins lag behind Zomato. Its recent IPO raises liquidity but heightens market scrutiny. A Hold rating is recommended pending sustained EBITDA margin improvements.",
    prosFor: [
      "Duopoly market structure with Zomato in food delivery, forming high barriers to entry.",
      "Pioneering position and solid scale in quick-commerce (Instamart) with dark store network.",
      "Diversified revenue streams including Instamart, dining out (Swiggy Dineout), and delivery-as-a-service (Swiggy Genie)."
    ],
    consAgainst: [
      "Lagging Zomato in profitability metrics; Zomato achieved net profit milestones earlier.",
      "High burn rate in Quick Commerce due to fierce expansion and dark store setup costs.",
      "Fierce three-way competition in quick-commerce from Zepto, Blinkit (Zomato), and Tata's BigBasket."
    ],
    risks: [
      "Gig worker regulatory changes in India potentially increasing delivery partner compliance costs.",
      "Execution risk in dark store expansion and inventory management.",
      "High valuation multiples compared to global peers without matching profit margins."
    ],
    scorecard: {
      marketSize: 9,
      moat: 7,
      team: 8,
      financialHealth: 6,
      momentum: 8,
      riskLevel: 6
    },
    researchedAt: new Date().toISOString(),
    sections: [
      {
        aspect: "overview",
        sentiment: "neutral",
        summary: "Swiggy, founded in 2014 by Sriharsha Majety, Nandan Reddy, and Rahul Jaimini, is headquartered in Bengaluru. It connects consumers with restaurants and grocery stores. Its main operations span food delivery and Quick Commerce.",
        keyPoints: [
          "Listed on Indian stock exchanges (NSE/BSE) in late 2024.",
          "Serves over 500+ cities in India with hundreds of thousands of active delivery partners.",
          "Instamart contributes roughly 30% of overall gross transaction value (GTV)."
        ],
        sources: [
          { title: "Swiggy Red Herring Prospectus (DRHP)", url: "https://sebi.gov.in/swiggy-ipo-prospectus" },
          { title: "Swiggy Stock Listing and Market Cap", url: "https://moneycontrol.com/swiggy-stock-live" }
        ]
      },
      {
        aspect: "financials",
        sentiment: "neutral",
        summary: "Swiggy has shown strong top-line revenue growth, but continues to post net losses, primarily driven by investments in dark stores and customer acquisition for quick commerce. However, food delivery unit economics are positive.",
        keyPoints: [
          "Food delivery business is contribution-margin positive and profitable on a standalone basis.",
          "IPO proceeds are designated for Dark Store expansion and technology upgrades.",
          "EBITDA margins are improving but still trace Zomato by a few hundred basis points."
        ],
        sources: [
          { title: "Swiggy Quarterly Financial Analysis", url: "https://livemint.com/swiggy-financial-results" }
        ]
      },
      {
        aspect: "competitors",
        sentiment: "mixed",
        summary: "In food delivery, it's Zomato vs Swiggy. In quick commerce, Blinkit is currently the market leader, followed closely by Instamart and the venture-funded Zepto. Competitors are heavily funded.",
        keyPoints: [
          "Blinkit (owned by Zomato) has achieved higher average order values and faster path to profitability.",
          "Zepto is scaling aggressively with deep venture backing.",
          "Reliance Retail and Amazon represent potential dark horse competitors in quick delivery."
        ],
        sources: [
          { title: "Quick Commerce Market Share India (Redseer)", url: "https://redseer.com/quick-commerce-report" }
        ]
      }
    ]
  }
};
