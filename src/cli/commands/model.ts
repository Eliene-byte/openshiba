import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'model',
  description: 'Quick-switch to a model by name or number',
  usage: '/model <model-id|number>',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();

      if (!trimmed) {
        // No args — show hint to use /models
        console.log('');
        console.log(chalk.hex('#e8873a').bold('  💡 Tip: use /models to see all available models'));
        console.log(chalk.dim(`  Current model: ${chalk.hex('#e8873a')(ctx.config.model)}`));
        console.log(chalk.dim('  Usage: /model <model-id>  or  /models <number>'));
        console.log('');
        return;
      }

      // Try to parse as number — switch by index from live list
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1) {
        try {
          const liveModels = await ctx.provider.listModels();
          if (num <= liveModels.length) {
            const selectedModel = liveModels[num - 1];
            ctx.setConfig({ model: selectedModel.id });
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${selectedModel.name} (${selectedModel.id})`));
            console.log('');
            return;
          }
        } catch {
          // Fall through to set by name
        }
      }

      // Switch to model by ID — accept any name
      ctx.setConfig({ model: trimmed });
      console.log('');
      console.log(chalk.hex('#e8873a')(`  ✓ Switched to model: ${trimmed}`));
      console.log(chalk.dim('  Type /models to see all available models'));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
