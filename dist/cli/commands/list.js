import chalk from 'chalk';
const command = {
    name: 'list',
    description: 'List models available from the current provider (fetched live)',
    usage: '/list',
    async handler(_args, ctx) {
        try {
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  Fetching models from ') + chalk.hex('#e8873a').bold(ctx.provider.name) + chalk.hex('#e8873a').bold('...'));
            console.log('');
            const models = await ctx.provider.listModels();
            const currentModel = ctx.config.model;
            if (!models || models.length === 0) {
                console.log(chalk.dim('  No models found.'));
                console.log(chalk.dim('  Make sure the provider is running and accessible.'));
                console.log('');
                return;
            }
            console.log(chalk.hex('#e8873a').bold('  Available Models (live)'));
            console.log(chalk.dim('  ' + '\u2500'.repeat(30)));
            console.log('');
            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                const isCurrent = model.id === currentModel || model.name === currentModel;
                const marker = isCurrent ? chalk.hex('#e8873a').bold('  \u25cf ') : '  \u25cb ';
                const num = chalk.cyan(`[${i + 1}]`);
                const name = isCurrent
                    ? chalk.hex('#e8873a').bold(model.name)
                    : chalk.white(model.name);
                const id = chalk.dim(` (${model.id})`);
                console.log(`${marker}${num} ${name}${id}`);
            }
            console.log('');
            console.log(chalk.dim(`  Current: ${chalk.hex('#e8873a')(currentModel)}`));
            console.log(chalk.dim('  Use /model <id> to switch'));
            console.log(chalk.dim('  Use /model <number> to switch by index'));
            console.log('');
        }
        catch (err) {
            console.log('');
            console.log(chalk.red(`  Error fetching models: ${err instanceof Error ? err.message : String(err)}`));
            console.log(chalk.dim('  Make sure the provider is running.'));
            console.log('');
        }
    },
};
export default command;
//# sourceMappingURL=list.js.map