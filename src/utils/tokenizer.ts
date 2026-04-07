// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Token Estimation Utility
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { Message } from '../types.js';

/**
 * Estimate the number of tokens in a given text.
 * Uses a rough BPE approximation of ~4 characters per token.
 * This is a heuristic — actual token counts vary by tokenizer.
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Estimate the total token count across all messages in a conversation.
 */
export function estimateConversationTokens(messages: Message[]): number {
  if (!messages || messages.length === 0) return 0;
  let total = 0;
  for (const msg of messages) {
    total += estimateTokens(msg.content);
  }
  return total;
}

/**
 * Format a token count as a human-readable string.
 * Examples: 1200 → "1.2k", 3500 → "3.5k", 800 → "800"
 */
export function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return String(count);
}

export interface TokenBudgetStatus {
  used: number;
  max: number;
  percentage: number;
  level: 'ok' | 'warning' | 'critical';
}

/**
 * Get the current token budget status relative to the maximum context window.
 *
 * Levels:
 *  - ok:       < 70%
 *  - warning:  70–90%
 *  - critical: > 90%
 */
export function getTokenBudgetStatus(usedTokens: number, maxContext: number): TokenBudgetStatus {
  const max = Math.max(maxContext, 1);
  const used = Math.max(usedTokens, 0);
  const percentage = Math.min((used / max) * 100, 100);

  let level: TokenBudgetStatus['level'];
  if (percentage >= 90) {
    level = 'critical';
  } else if (percentage >= 70) {
    level = 'warning';
  } else {
    level = 'ok';
  }

  return {
    used,
    max,
    percentage: Math.round(percentage * 100) / 100,
    level,
  };
}
