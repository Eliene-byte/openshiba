import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'clear',
  description: 'Clear all conversation messages',
  usage: '/clear',
  handler(_args: string, ctx: CommandContext): void {
    try {
      const count = ctx.conversation.messages.length;
      // Clear messages but keep system prompt
      ctx.conversation.messages = [];
      console.log('');
      console.log(chalk.hex('#e8873a')(`  ✓ Cleared ${count} message${count !== 1 ? 's' : ''} from conversation`));
      console.log(chalk.dim('  System prompt preserved.'));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
