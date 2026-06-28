/**
 * @file llm.js
 * @description LLM factory for the Verdict agent.
 *
 * Supported providers (set LLM_PROVIDER env var):
 *   "groq"      → Groq free tier via openai-compatible API — DEFAULT
 *   "anthropic" → Anthropic Claude (requires paid credits)
 *   "openai"    → OpenAI GPT (requires paid credits)
 *
 * Groq is OpenAI API-compatible, so we use the official `openai` SDK
 * pointed at Groq's endpoint. This avoids the @langchain/groq version
 * conflict with @langchain/core.
 */

const config = require("./config");

// ── Groq via openai-compatible SDK ───────────────────────────────────────────

/**
 * Creates a LangChain-compatible chat model using Groq's OpenAI-compatible API.
 * We implement the minimal interface that our nodes use: .invoke([messages]).
 *
 * @param {string} model
 * @param {number} temperature
 * @param {number} maxTokens
 * @returns {{ invoke: function(Array): Promise<{content: string}> }}
 */
function createGroqLLM(model, temperature, maxTokens) {
  const OpenAI = require("openai");
  const client = new OpenAI.default({
    apiKey:  process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return {
    /**
     * Invokes the Groq LLM with an array of LangChain-style messages.
     * @param {Array<import("@langchain/core/messages").BaseMessage>} messages
     * @returns {Promise<{content: string}>}
     */
    async invoke(messages) {
      // Convert LangChain message objects to OpenAI format
      const openaiMessages = messages.map((msg) => {
        const type = msg._getType ? msg._getType() : msg.constructor?.name;
        let role = "user";
        if (type === "system" || type === "SystemMessage") role = "system";
        else if (type === "ai" || type === "AIMessage")    role = "assistant";

        return { role, content: msg.content };
      });

      const response = await client.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature,
        max_tokens: maxTokens,
      });

      return { content: response.choices[0]?.message?.content || "" };
    },
  };
}

// ── Main factory ─────────────────────────────────────────────────────────────

/**
 * Returns the configured LLM instance.
 * @returns {{ invoke: function(Array): Promise<{content: string}> }}
 */
function getLLM() {
  const { provider, model, temperature, maxTokens } = config;

  if (provider === "anthropic") {
    // Native LangChain integration — fully compatible
    return new ChatAnthropic({
      model,
      temperature,
      maxTokens,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  if (provider === "openai") {
    // Standard OpenAI via openai SDK
    const OpenAI = require("openai");
    const client = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
    return {
      async invoke(messages) {
        const openaiMessages = messages.map((msg) => {
          const type = msg._getType ? msg._getType() : "";
          let role = "user";
          if (type === "system") role = "system";
          if (type === "ai")     role = "assistant";
          return { role, content: msg.content };
        });
        const res = await client.chat.completions.create({
          model, messages: openaiMessages, temperature, max_tokens: maxTokens,
        });
        return { content: res.choices[0]?.message?.content || "" };
      },
    };
  }

  // Default: Groq (free tier) via OpenAI-compatible API
  return createGroqLLM(model, temperature, maxTokens);
}

module.exports = { getLLM };
