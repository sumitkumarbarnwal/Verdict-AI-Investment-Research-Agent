/**
 * @file config.js
 * @description Central configuration for the Verdict AI agent.
 *
 * Swap the LLM provider by setting LLM_PROVIDER env var:
 *   "groq"      → Groq (free tier, fast) — DEFAULT
 *   "anthropic" → Anthropic Claude
 *   "openai"    → OpenAI GPT
 */

/** @type {"groq"|"anthropic"|"openai"} */
const LLM_PROVIDER = process.env.LLM_PROVIDER || "groq";

/** Default model per provider */
const MODEL_MAP = {
  groq:      process.env.LLM_MODEL || "qwen/qwen3.8-27b",
  anthropic: process.env.LLM_MODEL || "claude-sonnet-4-5",
  openai:    process.env.LLM_MODEL || "gpt-4o",
};

/**
 * @typedef {Object} AgentConfig
 * @property {"groq"|"anthropic"|"openai"} provider
 * @property {string} model
 * @property {number} temperature  - 0–1; lower = more deterministic
 * @property {number} maxTokens    - max completion tokens per call
 * @property {number} rateLimitRpm - max API requests per IP per minute
 */

/** @type {AgentConfig} */
const config = {
  provider:     LLM_PROVIDER,
  model:        MODEL_MAP[LLM_PROVIDER] ?? MODEL_MAP.groq,
  temperature:  0.2,
  maxTokens:    4096,
  rateLimitRpm: parseInt(process.env.RATE_LIMIT_RPM || "5", 10),
};

module.exports = config;
