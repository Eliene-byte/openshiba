import chalk from 'chalk';
const command = {
    name: 'tokens',
    description: 'Show token usage for current session',
    usage: '/tokens',
    async handler(_args, ctx) {
        try {
            const messages = ctx.conversation.messages;
            let totalPromptTokens = 0;
            let totalCompletionTokens = 0;
            let totalTokens = 0;
            for (const msg of messages) {
                if (msg.tokens) {
                    totalPromptTokens += msg.tokens.prompt_tokens;
                    totalCompletionTokens += msg.tokens.completion_tokens;
                    totalTokens += msg.tokens.total_tokens;
                }
            }
            // Try to get context window from current model
            const currentModelInfo = ctx.provider.config.models.find((m) => m.id === ctx.config.model);
            const contextWindow = currentModelInfo?.contextWindow ?? 128000;
            const usagePercent = contextWindow > 0 ? ((totalTokens / contextWindow) * 100).toFixed(1) : 'N/A';
            // Build usage bar
            const barWidth = 30;
            const percent = parseFloat(usagePercent);
            const filled = Math.min(Math.round((percent / 100) * barWidth), barWidth);
            const empty = barWidth - filled;
            const barColor = percent > 80 ? chalk.red : percent > 50 ? chalk.yellow : chalk.green;
            const bar = barColor('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  Token Usage'));
            console.log(chalk.dim('  ─'.repeat(16)));
            console.log('');
            console.log(`  ${chalk.hex('#e8873a')('Prompt tokens:')}     ${totalPromptTokens.toLocaleString()}`);
            console.log(`  ${chalk.hex('#e8873a')('Completion tokens:')} ${totalCompletionTokens.toLocaleString()}`);
            console.log(`  ${chalk.hex('#e8873a')('Total tokens:')}      ${totalTokens.toLocaleString()}`);
            console.log('');
            console.log(`  ${chalk.hex('#e8873a')('Context window:')}    ${contextWindow.toLocaleString()}`);
            console.log(`  ${chalk.hex('#e8873a')('Usage:')}             ${bar} ${usagePercent}%`);
            console.log('');
            console.log(chalk.dim(`  Messages in conversation: ${messages.length}`));
            console.log('');
            // Show per-message breakdown if there are tokens
            const messagesWithTokens = messages.filter((m) => m.tokens);
            if (messagesWithTokens.length > 0) {
                console.log(chalk.hex('#e8873a').bold('  Per-Message Breakdown'));
                console.log(chalk.dim('  ─'.repeat(16)));
                console.log('');
                for (const msg of messagesWithTokens) {
                    const role = msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙';
                    const content = msg.content.slice(0, 40) + (msg.content.length > 40 ? '...' : '');
                    console.log(`  ${role} ${chalk.dim(content)}`);
                    console.log(`     ${chalk.dim(`in: ${msg.tokens.prompt_tokens} | out: ${msg.tokens.completion_tokens} | total: ${msg.tokens.total_tokens}`)}`);
                }
                console.log('');
            }
        }
        catch (err) {
            console.log('');
            console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
            console.log('');
        }
    },
};
export default command;
//# sourceMappingURL=tokens.js.map