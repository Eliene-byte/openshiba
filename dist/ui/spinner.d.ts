import React from 'react';
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
export declare function Spinner({ text, active }: SpinnerProps): React.ReactElement | null;
export {};
//# sourceMappingURL=spinner.d.ts.map