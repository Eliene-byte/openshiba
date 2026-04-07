// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Status Bar Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import cliWidth from 'cli-width';
import type { TokenUsage } from '../types.js';
import {
  formatTokens,
  getTokenBudgetStatus,
} from '../utils/tokenizer.js';

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
export function Statusbar({
  tokens,
  contextMax,
  streaming,
  connected,
}: StatusbarProps): React.ReactElement {
  const [blink, setBlink] = useState<boolean>(true);
  const [width, setWidth] = useState<number>(80);

  // Update terminal width periodically
  useEffect(() => {
    const updateWidth = () => {
      try {
        const w = cliWidth({ defaultWidth: 80 });
        setWidth(typeof w === 'string' ? parseInt(w, 10) || 80 : w);
      } catch {
        setWidth(80);
      }
    };

    updateWidth();

    const interval = setInterval(() => {
      updateWidth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Blinking effect for status indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Separator line
  const separator = chalk.dim('─'.repeat(width));

  // Token usage string
  const tokenInfo = useMemo(() => {
    if (!tokens) {
      return chalk.dim('Tokens: -- / ' + formatTokens(contextMax));
    }

    const used = tokens.total_tokens;
    const budget = getTokenBudgetStatus(used, contextMax);
    const maxStr = formatTokens(contextMax);
    const usedStr = formatTokens(used);
    const percentage = Math.round(budget.percentage);

    // Color based on percentage
    let coloredUsage: string;
    if (percentage > 80) {
      coloredUsage = chalk.hex('#ff4444')(`${usedStr} / ${maxStr}`);
    } else if (percentage > 50) {
      coloredUsage = chalk.hex('#ffcc00')(`${usedStr} / ${maxStr}`);
    } else {
      coloredUsage = chalk.hex('#44ff44')(`${usedStr} / ${maxStr}`);
    }

    // Percentage with color
    let coloredPercentage: string;
    if (percentage > 80) {
      coloredPercentage = chalk.hex('#ff4444')(`(${percentage}%)`);
    } else if (percentage > 50) {
      coloredPercentage = chalk.hex('#ffcc00')(`(${percentage}%)`);
    } else {
      coloredPercentage = chalk.hex('#44ff44')(`(${percentage}%)`);
    }

    return `Tokens: ${coloredUsage} ${coloredPercentage}`;
  }, [tokens, contextMax]);

  // Status indicator (right side)
  const statusIndicator = useMemo(() => {
    if (streaming) {
      return blink
        ? chalk.hex('#e8873a')('● Streaming...')
        : chalk.dim('○ Streaming...');
    }

    if (connected) {
      return blink
        ? chalk.green('● Connected')
        : chalk.dim('○ Connected');
    }

    return blink
      ? chalk.hex('#ff4444')('● Disconnected')
      : chalk.dim('○ Disconnected');
  }, [streaming, connected, blink]);

  return (
    <Box flexDirection="column">
      {/* Separator */}
      <Text>{separator}</Text>

      {/* Status line */}
      <Box justifyContent="space-between">
        <Text>{tokenInfo}</Text>
        <Text>{statusIndicator}</Text>
      </Box>
    </Box>
  );
}
