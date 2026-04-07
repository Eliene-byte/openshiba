import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'stream',
  description: 'Toggle streaming on/off',
  usage: '/stream',
  handler(_args: string, ctx: CommandContext): void {
    try {
      const currentState = ctx.config.streaming;
      const newState = !currentState;

      ctx.setConfig({ streaming: newState });

      console.log('');
      console.log(chalk.hex('#e8873a')(`  Streaming: ${currentState ? chalk.red('off') : chalk.green('on')} → ${newState ? chalk.green('on') : chalk.red('off')}`));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
