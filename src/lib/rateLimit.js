/**
 * @file rateLimit.js
 * @description Simple in-memory rate limiter for the research API route.
 * Uses a sliding window counter keyed by IP address.
 *
 * Note: This is process-local — on Vercel serverless each invocation may
 * be a different process, so this provides best-effort protection rather
 * than strict enforcement. For production, use Upstash Redis or similar.
 */

const config = require("./agent/config");

/** @type {Map<string, {count: number, windowStart: number}>} */
const store = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute window

/**
 * Checks if the given IP has exceeded the rate limit.
 * @param {string} ip - Client IP address
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const limit = config.rateLimitRpm;

  let record = store.get(ip);

  // Reset if window expired
  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { count: 0, windowStart: now };
  }

  record.count += 1;
  store.set(ip, record);

  // Periodically clean up old entries (every ~100 calls)
  if (Math.random() < 0.01) {
    for (const [key, val] of store.entries()) {
      if (now - val.windowStart > WINDOW_MS * 2) store.delete(key);
    }
  }

  return {
    allowed:   record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetAt:   record.windowStart + WINDOW_MS,
  };
}

module.exports = { checkRateLimit };
