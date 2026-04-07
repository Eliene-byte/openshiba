import chalk from 'chalk';
const command = {
    name: 'config',
    description: 'Show or set configuration values',
    usage: '/config [key=value ...]',
    handler(args, ctx) {
        try {
            const trimmed = args.trim();
            if (!trimmed) {
                // Show current config
                console.log('');
                console.log(chalk.hex('#e8873a').bold('  Current Configuration'));
                console.log(chalk.dim('  ─'.repeat(16)));
                console.log('');
                console.log(`  ${chalk.hex('#e8873a')('temperature')}  ${ctx.config.temperature}`);
                console.log(`  ${chalk.hex('#e8873a')('top_p')}       ${ctx.config.topP}`);
                console.log(`  ${chalk.hex('#e8873a')('max_tokens')}  ${ctx.config.maxTokens}`);
                console.log(`  ${chalk.hex('#e8873a')('streaming')}   ${ctx.config.streaming ? chalk.green('on') : chalk.red('off')}`);
                console.log(`  ${chalk.hex('#e8873a')('provider')}    ${ctx.config.provider}`);
                console.log(`  ${chalk.hex('#e8873a')('model')}       ${ctx.config.model}`);
                console.log('');
                return;
            }
            // Parse key=value pairs
            const pairs = trimmed.split(/\s+/);
            const updates = {};
            const errors = [];
            for (const pair of pairs) {
                const eqIndex = pair.indexOf('=');
                if (eqIndex === -1) {
                    errors.push(`Invalid format: "${pair}" (expected key=value)`);
                    continue;
                }
                const key = pair.slice(0, eqIndex).toLowerCase();
                const rawValue = pair.slice(eqIndex + 1);
                const value = parseFloat(rawValue);
                if (key === 'temperature' || key === 'temp') {
                    if (isNaN(value) || value < 0 || value > 2) {
                        errors.push('temperature must be between 0 and 2');
                    }
                    else {
                        updates.temperature = value;
                    }
                }
                else if (key === 'top_p' || key === 'topp') {
                    if (isNaN(value) || value < 0 || value > 1) {
                        errors.push('top_p must be between 0 and 1');
                    }
                    else {
                        updates.topP = value;
                    }
                }
                else if (key === 'max_tokens' || key === 'maxtokens') {
                    if (isNaN(value) || value < 1 || value > 32768) {
                        errors.push('max_tokens must be between 1 and 32768');
                    }
                    else {
                        updates.maxTokens = value;
                    }
                }
                else {
                    errors.push(`Unknown config key: "${key}"`);
                }
            }
            if (errors.length > 0) {
                console.log('');
                for (const error of errors) {
                    console.log(chalk.red(`  ✗ ${error}`));
                }
                console.log('');
                return;
            }
            if (Object.keys(updates).length > 0) {
                ctx.setConfig(updates);
                console.log('');
                console.log(chalk.hex('#e8873a')('  ✓ Configuration updated'));
                if (updates.temperature !== undefined) {
                    console.log(chalk.dim(`    temperature → ${updates.temperature}`));
                }
                if (updates.topP !== undefined) {
                    console.log(chalk.dim(`    top_p → ${updates.topP}`));
                }
                if (updates.maxTokens !== undefined) {
                    console.log(chalk.dim(`    max_tokens → ${updates.maxTokens}`));
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
//# sourceMappingURL=config.js.map