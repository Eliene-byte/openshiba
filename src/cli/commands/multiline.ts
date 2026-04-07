import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'multiline',
  description: 'Show multiline mode instructions',
  usage: '/multiline',
  handler(_args: string, ctx: CommandContext): void {
    console.log('');
    console.log(chalk.hex('#e8873a').bold('  Multiline Mode'));
    console.log(chalk.dim('  ─'.repeat(16)));
    console.log('');
    console.log(chalk.white('  To enter multiline mode, type your message and press'));
    console.log(chalk.white('  Enter to add a new line. The message will be sent'));
    console.log(chalk.white('  when you press Enter on an empty line.'));
    console.log('');
    console.log(chalk.hex('#e8873a')('  Example:'));
    console.log(chalk.dim('  > First line of my prompt'));
    console.log(chalk.dim('  > Second line with more detail'));
    console.log(chalk.dim('  > '));
    console.log(chalk.dim('  (message sent)'));
    console.log('');
    console.log(chalk.dim('  Multiline mode is useful for long prompts, code,'));
    console.log(chalk.dim('  or when you need to format your input carefully.'));
    console.log('');
  },
};

export default command;
