import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import chalk from 'chalk';
/**
 * ASCII art of a Shiba Inu face, colored in amber/orange tones.
 * Only renders when `show` is true.
 */
export function ShibaMascot({ show }) {
    if (!show) {
        return null;
    }
    // Color palette for the Shiba Inu
    const primary = '#e8873a'; // Main orange
    const dark = '#b8692a'; // Darker orange for features
    const light = '#ffb87a'; // Lighter orange for highlights
    const nose = '#4a2a0a'; // Dark brown for nose
    const tongue = '#ff6b8a'; // Pink for the tongue/cheeks
    // Build the ASCII art with colors
    const art = [
        chalk.hex(primary)('      ___      '),
        chalk.hex(primary)('     /   \\     '),
        chalk.hex(primary)('    | ') + chalk.hex(dark)('O') + chalk.hex(primary)('   ') + chalk.hex(dark)('O') + chalk.hex(primary)(' |    '),
        chalk.hex(primary)('    |  ') + chalk.hex(nose)('^') + chalk.hex(primary)('  |    '),
        chalk.hex(primary)('    | \\_/ |    '),
        chalk.hex(primary)('     \\___/') + chalk.hex(tongue)('/'),
        chalk.hex(primary)('      ') + chalk.hex(dark)('|||'),
    ];
    return (_jsx(Box, { flexDirection: "column", alignItems: "center", paddingY: 1, children: art.map((line, index) => (_jsx(Text, { children: line }, index))) }));
}
//# sourceMappingURL=shiba.js.map