import type { Message } from '../types.js';
/**
 * Estimate the number of tokens in a given text.
 * Uses a rough BPE approximation of ~4 characters per token.
 * This is a heuristic — actual token counts vary by tokenizer.
 */
export declare function estimateTokens(text: string): number;
/**
 * Estimate the total token count across all messages in a conversation.
 */
export declare function estimateConversationTokens(messages: Message[]): number;
/**
 * Format a token count as a human-readable string.
 * Examples: 1200 → "1.2k", 3500 → "3.5k", 800 → "800"
 */
export declare function formatTokens(count: number): string;
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
export declare function getTokenBudgetStatus(usedTokens: number, maxContext: number): TokenBudgetStatus;
//# sourceMappingURL=tokenizer.d.ts.map