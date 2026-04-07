import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'save',
  description: 'Save current conversation',
  usage: '/save [name]',
  handler(args: string, ctx: CommandContext): void {
    try {
      const trimmed = args.trim();
      const name = trimmed || `Untitled ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

      if (ctx.conversation.messages.length === 0) {
        console.log('');
        console.log(chalk.yellow('  ⚠ No messages to save.'));
        console.log('');
        return;
      }

      // Update conversation metadata before saving
      ctx.conversation.name = name;
      ctx.conversation.provider = ctx.config.provider;
      ctx.conversation.model = ctx.config.model;
      ctx.conversation.systemPrompt = ctx.config.systemPrompt;
      ctx.conversation.updatedAt = Date.now();

      const id = ctx.history.saveConversation(ctx.conversation);

      console.log('');
      console.log(chalk.hex('#e8873a')('  ✓ Conversation saved'));
      console.log(chalk.dim(`  ID: ${id}`));
      console.log(chalk.dim(`  Name: ${name}`));
      console.log(chalk.dim(`  Messages: ${ctx.conversation.messages.length}`));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
