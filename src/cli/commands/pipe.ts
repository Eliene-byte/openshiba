import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'pipe',
  description: 'Show pipe mode instructions',
  usage: '/pipe',
  handler(_args: string, _ctx: CommandContext): void {
    console.log('');
    console.log(chalk.hex('#e8873a').bold('  Pipe Mode'));
    console.log(chalk.dim('  ─'.repeat(16)));
    console.log('');
    console.log(chalk.white('  You can pipe content directly into OpenShiba:'));
    console.log('');
    console.log(chalk.hex('#e8873a')('  Examples:'));
    console.log(chalk.dim('  $ echo "Explain this" | openshiba'));
    console.log(chalk.dim('  $ cat file.ts | openshiba "Review this code"'));
    console.log(chalk.dim('  $ cat error.log | openshiba "What went wrong?"'));
    console.log('');
    console.log(chalk.dim('  Piped content is prepended to your prompt.'));
    console.log(chalk.dim('  This is useful for processing files, logs, or output.'));
    console.log('');
  },
};

export default command;
