import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Verdict — AI Investment Research Agent",
  description:
    "AI-powered investment research. Enter any company name and get a structured Invest / Pass / Hold verdict backed by live web research.",
  keywords: ["investment research", "AI", "stock analysis", "venture capital", "fintech"],
  openGraph: {
    title: "Verdict — AI Investment Research Agent",
    description: "AI-powered investment research agent. Instant Invest/Pass verdicts.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface-0 text-ink-base antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
