import chalk from 'chalk';
const command = {
    name: 'model',
    description: 'List or switch AI models',
    usage: '/model [model-id|list]',
    async handler(args, ctx) {
        try {
            const trimmed = args.trim();
            if (!trimmed) {
                // List available models
                const models = ctx.provider.config.models;
                const currentModel = ctx.config.model;
                console.log('');
                console.log(chalk.hex('#e8873a').bold('  Available Models'));
                console.log(chalk.dim('  ─'.repeat(16)));
                console.log('');
                for (const model of models) {
                    const isCurrent = model.id === currentModel;
                    const marker = isCurrent ? chalk.hex('#e8873a').bold('  ● ') : '  ○ ';
                    const name = isCurrent
                        ? chalk.hex('#e8873a').bold(model.name)
                        : chalk.white(model.name);
                    const id = chalk.dim(` (${model.id})`);
                    console.log(`${marker}${name}${id}`);
                }
                console.log('');
                console.log(chalk.dim(`  Current: ${chalk.hex('#e8873a')(currentModel)}`));
                console.log(chalk.dim('  Use /model <id> to switch'));
                console.log('');
                return;
            }
            if (trimmed === 'list') {
                // Interactive numbered list
                const models = ctx.provider.config.models;
                const currentModel = ctx.config.model;
                console.log('');
                console.log(chalk.hex('#e8873a').bold('  Select a model (type number):'));
                console.log('');
                for (let i = 0; i < models.length; i++) {
                    const model = models[i];
                    const isCurrent = model.id === currentModel;
                    const marker = isCurrent ? chalk.hex('#e8873a').bold('→') : ' ';
                    const num = chalk.cyan(`[${i + 1}]`);
                    const name = isCurrent
                        ? chalk.hex('#e8873a').bold(model.name)
                        : chalk.white(model.name);
                    const id = chalk.dim(` (${model.id})`);
                    console.log(`  ${marker} ${num} ${name}${id}`);
                }
                console.log('');
                ctx.setInput(`/model __SELECT__`);
                return;
            }
            // Handle interactive selection result
            if (trimmed === '__SELECT__') {
                console.log(chalk.dim('  Cancelled model selection.'));
                return;
            }
            // Try to parse as number (for interactive selection)
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 1 && num <= ctx.provider.config.models.length) {
                const selectedModel = ctx.provider.config.models[num - 1];
                ctx.setConfig({ model: selectedModel.id });
                console.log('');
                console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${selectedModel.name} (${selectedModel.id})`));
                console.log('');
                return;
            }
            // Switch to model by ID
            const models = ctx.provider.config.models;
            const found = models.find((m) => m.id === trimmed);
            if (!found) {
                console.log('');
                console.log(chalk.red(`  ✗ Model "${trimmed}" not found.`));
                console.log(chalk.dim('  Use /model to see available models.'));
                console.log('');
                return;
            }
            ctx.setConfig({ model: trimmed });
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${found.name} (${found.id})`));
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
//# sourceMappingURL=model.js.map