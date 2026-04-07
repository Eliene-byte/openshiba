import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'exit',
  description: 'Exit OpenShiba',
  usage: '/exit',
  handler(_args: string, ctx: CommandContext): void {
    console.log('');
    console.log(chalk.hex('#e8873a')('👋 Goodbye from OpenShiba! May the Shiba be with you!'));
    console.log('');
    ctx.exit();
  },
};

export default command;
