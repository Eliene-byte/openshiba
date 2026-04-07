import chalk from 'chalk';
/**
 * Simple word-level diff between two strings.
 * Returns an array of { type: 'same'|'add'|'remove', word: string }
 */
function wordDiff(a, b) {
    const wordsA = a.split(/(\s+)/);
    const wordsB = b.split(/(\s+)/);
    // Simple LCS-based diff
    const m = wordsA.length;
    const n = wordsB.length;
    // Build LCS table
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (wordsA[i - 1] === wordsB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    // Backtrack to find diff
    const result = [];
    let i = m;
    let j = n;
    const backtrack = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
            backtrack.unshift({ type: 'same', word: wordsA[i - 1] });
            i--;
            j--;
        }
        else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            backtrack.unshift({ type: 'add', word: wordsB[j - 1] });
            j--;
        }
        else if (i > 0) {
            backtrack.unshift({ type: 'remove', word: wordsA[i - 1] });
            i--;
        }
    }
    return backtrack;
}
const command = {
    name: 'diff',
    description: 'Compare last two assistant responses',
    usage: '/diff',
    handler(_args, ctx) {
        try {
            const assistantMessages = ctx.conversation.messages.filter((m) => m.role === 'assistant');
            if (assistantMessages.length < 2) {
                console.log('');
                console.log(chalk.yellow('  ⚠ Need at least 2 assistant responses to compare.'));
                console.log(chalk.dim(`  Currently have: ${assistantMessages.length}`));
                console.log('');
                return;
            }
            const older = assistantMessages[assistantMessages.length - 2].content;
            const newer = assistantMessages[assistantMessages.length - 1].content;
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  Diff: Last Two Responses'));
            console.log(chalk.dim('  ─'.repeat(18)));
            console.log('');
            const diff = wordDiff(older, newer);
            // Group consecutive same words for readability
            let line = '';
            for (const part of diff) {
                if (part.type === 'same') {
                    line += part.word;
                }
                else if (part.type === 'add') {
                    line += chalk.green(part.word);
                }
                else if (part.type === 'remove') {
                    line += chalk.red(part.word);
                }
                // Break lines at word boundaries for readability
                if (part.word.includes('\n')) {
                    console.log(`  ${line.trimEnd()}`);
                    line = '';
                }
            }
            if (line.trim()) {
                console.log(`  ${line.trimEnd()}`);
            }
            console.log('');
            console.log(chalk.dim('  Legend:'));
            console.log(`  ${chalk.green('green')} = added in latest response`);
            console.log(`  ${chalk.red('red')} = removed from previous response`);
            console.log('');
        }
        catch (err) {
            console.log('');
            console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
            console.log('');
        }
    },
};
export default command;
//# sourceMappingURL=diff.js.map