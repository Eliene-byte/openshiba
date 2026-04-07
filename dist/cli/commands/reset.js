import chalk from 'chalk';
import { DEFAULT_SESSION_CONFIG } from '../../types.js';
const command = {
    name: 'reset',
    description: 'Reset everything to defaults',
    usage: '/reset',
    handler(_args, ctx) {
        try {
            // Reset conversation
            const msgCount = ctx.conversation.messages.length;
            ctx.conversation.messages = [];
            // Reset config to defaults
            ctx.setConfig({
                provider: DEFAULT_SESSION_CONFIG.provider,
                model: DEFAULT_SESSION_CONFIG.model,
                temperature: DEFAULT_SESSION_CONFIG.temperature,
                topP: DEFAULT_SESSION_CONFIG.topP,
                maxTokens: DEFAULT_SESSION_CONFIG.maxTokens,
                systemPrompt: DEFAULT_SESSION_CONFIG.systemPrompt,
                streaming: DEFAULT_SESSION_CONFIG.streaming,
            });
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  ✓ Everything reset to defaults'));
            console.log(chalk.dim(`  Cleared ${msgCount} message${msgCount !== 1 ? 's' : ''}`));
            console.log(chalk.dim(`  Provider: ${DEFAULT_SESSION_CONFIG.provider}`));
            console.log(chalk.dim(`  Model: ${DEFAULT_SESSION_CONFIG.model}`));
            console.log(chalk.dim(`  Temperature: ${DEFAULT_SESSION_CONFIG.temperature}`));
            console.log(chalk.dim(`  System prompt: reset`));
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
//# sourceMappingURL=reset.js.map