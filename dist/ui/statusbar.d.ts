import React from 'react';
import type { TokenUsage } from '../types.js';
interface StatusbarProps {
    tokens: TokenUsage | null;
    contextMax: number;
    streaming: boolean;
    connected: boolean;
}
/**
 * Bottom status bar showing token usage, context window info,
 * streaming state, and connection status.
 */
export declare function Statusbar({ tokens, contextMax, streaming, connected, }: StatusbarProps): React.ReactElement;
export {};
//# sourceMappingURL=statusbar.d.ts.map