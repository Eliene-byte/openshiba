import React from 'react';
import type { Message } from '../types.js';
interface MessageProps {
    message: Message;
    isLast: boolean;
    streaming?: boolean;
    streamContent?: string;
}
/**
 * Renders a single chat message in the terminal.
 * Handles user messages, assistant messages (with markdown),
 * streaming content, and token usage display.
 */
export declare function MessageItem({ message, isLast, streaming, streamContent, }: MessageProps): React.ReactElement;
export {};
//# sourceMappingURL=message.d.ts.map