import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Message Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import { renderMarkdown } from '../utils/markdown.js';
/**
 * Renders a single chat message in the terminal.
 * Handles user messages, assistant messages (with markdown),
 * streaming content, and token usage display.
 */
export function MessageItem({ message, isLast, streaming = false, streamContent = '', }) {
    const [blink, setBlink] = useState(true);
    // Blinking cursor effect during streaming
    useEffect(() => {
        if (streaming && isLast) {
            const interval = setInterval(() => {
                setBlink(prev => !prev);
            }, 530);
            return () => clearInterval(interval);
        }
    }, [streaming, isLast]);
    // Determine the display content
    const displayContent = useMemo(() => {
        if (streaming && isLast && streamContent) {
            return streamContent;
        }
        return message.content;
    }, [streaming, isLast, streamContent, message.content]);
    // Render the content based on role
    const renderedContent = useMemo(() => {
        if (message.role === 'assistant') {
            return renderMarkdown(displayContent);
        }
        return displayContent;
    }, [message.role, displayContent]);
    // Prefix based on role
    const prefix = useMemo(() => {
        switch (message.role) {
            case 'user':
                return chalk.hex('#e8873a')('[You] ');
            case 'assistant':
                return chalk.hex('#44aaff')('[AI] ');
            case 'system':
                return chalk.hex('#ffcc00')('[System] ');
            default:
                return chalk.dim('[Unknown] ');
        }
    }, [message.role]);
    // Token info line
    const tokenLine = useMemo(() => {
        if (message.tokens) {
            const { prompt_tokens, completion_tokens, total_tokens } = message.tokens;
            return chalk.dim(`  tokens: ${total_tokens} (prompt: ${prompt_tokens}, completion: ${completion_tokens})`);
        }
        return null;
    }, [message.tokens]);
    // Blinking cursor for streaming
    const cursor = streaming && isLast && blink
        ? chalk.hex('#e8873a')('█')
        : '';
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, marginBottom: message.tokens ? 1 : 0, children: [_jsx(Text, { children: prefix }), _jsxs(Text, { wrap: "wrap", children: [renderedContent, cursor] }), tokenLine && (_jsx(Box, { marginLeft: 2, children: _jsx(Text, { children: tokenLine }) }))] }));
}
//# sourceMappingURL=message.js.map