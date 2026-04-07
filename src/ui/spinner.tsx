// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Spinner Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import chalk from 'chalk';

/**
 * Spinner frames for the loading animation.
 */
const SPINNER_FRAMES = [
  '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏',
] as const;

const FRAME_INTERVAL_MS = 80;

interface SpinnerProps {
  /** Text to display alongside the spinner */
  text: string;
  /** Whether the spinner is actively animating */
  active: boolean;
}

/**
 * Loading spinner component for Ink (terminal React).
 * Uses a simple frame-based animation with setInterval.
 * When active, shows an animated spinner with text.
 * When inactive, renders nothing.
 */
export function Spinner({ text, active }: SpinnerProps): React.ReactElement | null {
  const [frameIndex, setFrameIndex] = useState<number>(0);

  useEffect(() => {
    if (!active) {
      setFrameIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % SPINNER_FRAMES.length);
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) {
    return null;
  }

  const frame = SPINNER_FRAMES[frameIndex];
  const coloredFrame = chalk.hex('#e8873a')(frame);

  return (
    <Text>
      {coloredFrame} {text}
    </Text>
  );
}
