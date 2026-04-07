// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Message Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import type { Message } from '../types.js';
import { renderMarkdown } from '../utils/markdown.js';

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
export function MessageItem({
  message,
  isLast,
  streaming = false,
  streamContent = '',
}: MessageProps): React.ReactElement {
  const [blink, setBlink] = useState<boolean>(true);

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
      return chalk.dim(
        `  tokens: ${total_tokens} (prompt: ${prompt_tokens}, completion: ${completion_tokens})`
      );
    }
    return null;
  }, [message.tokens]);

  // Blinking cursor for streaming
  const cursor = streaming && isLast && blink
    ? chalk.hex('#e8873a')('█')
    : '';

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={message.tokens ? 1 : 0}>
      {/* Role prefix */}
      <Text>
        {prefix}
      </Text>

      {/* Message content */}
      <Text wrap="wrap">
        {renderedContent}
        {cursor}
      </Text>

      {/* Token usage info */}
      {tokenLine && (
        <Box marginLeft={2}><Text>{tokenLine}</Text></Box>
      )}
    </Box>
  );
}
