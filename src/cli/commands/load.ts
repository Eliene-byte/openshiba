import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'load',
  description: 'Load a saved conversation',
  usage: '/load <conversation-id>',
  handler(args: string, ctx: CommandContext): void {
    try {
      const trimmed = args.trim();
      if (!trimmed) {
        console.log('');
        console.log(chalk.red('  ✗ Please provide a conversation ID.'));
        console.log(chalk.dim('  Usage: /load <conversation-id>'));
        console.log(chalk.dim('  Use /history to see available conversations.'));
        console.log('');
        return;
      }

      const conversation = ctx.history.loadConversation(trimmed);
      if (!conversation) {
        console.log('');
        console.log(chalk.red(`  ✗ Conversation "${trimmed}" not found.`));
        console.log(chalk.dim('  Use /history to see available conversations.'));
        console.log('');
        return;
      }

      // Replace current conversation
      ctx.conversation.messages = [...conversation.messages];
      ctx.conversation.name = conversation.name;
      ctx.conversation.provider = conversation.provider;
      ctx.conversation.model = conversation.model;
      ctx.conversation.systemPrompt = conversation.systemPrompt;

      ctx.setConfig({
        provider: conversation.provider,
        model: conversation.model,
        systemPrompt: conversation.systemPrompt,
      });

      console.log('');
      console.log(chalk.hex('#e8873a')(`  ✓ Loaded: ${conversation.name || 'Untitled'}`));
      console.log(chalk.dim(`  ID: ${conversation.id}`));
      console.log(chalk.dim(`  Messages: ${conversation.messages.length}`));
      console.log(chalk.dim(`  Provider: ${conversation.provider}`));
      console.log(chalk.dim(`  Model: ${conversation.model}`));
      console.log(chalk.dim(`  Created: ${new Date(conversation.createdAt).toLocaleString()}`));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
