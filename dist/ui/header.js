import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Header Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import figlet from 'figlet';
import chalk from 'chalk';
/**
 * Main header displayed at the top of the terminal.
 * Shows ASCII art title, connection info box, and status indicator.
 */
export function Header({ provider, model, endpoint, profile, connected }) {
    const [blink, setBlink] = useState(true);
    // Blinking effect: toggle every 500ms
    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);
    // Generate figlet ASCII art for "OPENSHIBA"
    const asciiArt = useMemo(() => {
        try {
            return figlet.textSync('OPENSHIBA', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default',
            });
        }
        catch {
            return 'OPENSHIBA';
        }
    }, []);
    // Color the ASCII art in orange/amber
    const coloredArt = chalk.hex('#e8873a')(asciiArt);
    // Build the info box lines
    const labelColor = '#e8873a';
    const borderColor = 'gray';
    const infoLines = [
        { label: 'Provider', value: provider },
        { label: 'Model', value: model },
        { label: 'Endpoint', value: endpoint },
        { label: 'Profile', value: profile },
    ];
    // Determine status text
    const statusText = connected
        ? blink
            ? chalk.green('● Connected')
            : chalk.dim('○ Connected')
        : blink
            ? chalk.hex('#ff4444')('● Disconnected')
            : chalk.dim('○ Disconnected');
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(Text, { children: coloredArt }), _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { children: [chalk.dim.gray('┌─ Status '), chalk.dim.gray('─'.repeat(40)), chalk.dim.gray('┐')] }), infoLines.map((line, index) => {
                        const isFirst = index === 0;
                        const isLast = index === infoLines.length - 1;
                        const connector = isFirst ? '├' : isLast ? '└' : '├';
                        // Pad label to 10 chars for alignment
                        const paddedLabel = line.label.padEnd(10);
                        return (_jsxs(Text, { children: [chalk.dim.gray(`${connector}─ `), chalk.hex(labelColor)(paddedLabel), chalk.dim.gray('── '), line.value] }, line.label));
                    }), _jsxs(Text, { children: [chalk.dim.gray('└─ '), chalk.hex(labelColor)('Status     '), chalk.dim.gray('── '), statusText] })] })] }));
}
//# sourceMappingURL=header.js.map