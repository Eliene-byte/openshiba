import chalk from 'chalk';
import { DEFAULT_SESSION_CONFIG } from '../../types.js';
const command = {
    name: 'system',
    description: 'Show or set system prompt',
    usage: '/system [prompt|clear]',
    handler(args, ctx) {
        try {
            const trimmed = args.trim();
            if (!trimmed) {
                // Show current system prompt
                const current = ctx.config.systemPrompt;
                if (!current) {
                    console.log('');
                    console.log(chalk.dim('  No system prompt set.'));
                    console.log('');
                }
                else {
                    console.log('');
                    console.log(chalk.hex('#e8873a').bold('  Current System Prompt'));
                    console.log(chalk.dim('  ─'.repeat(16)));
                    console.log('');
                    console.log(`  ${chalk.white(current)}`);
                    console.log('');
                }
                return;
            }
            if (trimmed === 'clear' || trimmed === 'reset') {
                // Reset to default system prompt
                const defaultPrompt = DEFAULT_SESSION_CONFIG.systemPrompt;
                ctx.setConfig({ systemPrompt: defaultPrompt });
                console.log('');
                console.log(chalk.hex('#e8873a')('  ✓ System prompt reset to default'));
                console.log('');
                return;
            }
            // Set new system prompt
            ctx.setConfig({ systemPrompt: trimmed });
            console.log('');
            console.log(chalk.hex('#e8873a')('  ✓ System prompt updated'));
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
//# sourceMappingURL=system.js.map