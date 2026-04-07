import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'history',
  description: 'Browse conversation history',
  usage: '/history [list|search <query>|id]',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();

      if (!trimmed || trimmed === 'list') {
        // List last 20 conversations
        const conversations = ctx.history.listConversations(20, 0);

        if (conversations.length === 0) {
          console.log('');
          console.log(chalk.dim('  No conversations in history.'));
          console.log(chalk.dim('  Use /save to save the current conversation.'));
          console.log('');
          return;
        }

        console.log('');
        console.log(chalk.hex('#e8873a').bold('  Conversation History'));
        console.log(chalk.dim('  ─'.repeat(18)));
        console.log('');

        for (const conv of conversations) {
          const id = chalk.cyan(conv.id.slice(0, 8));
          const name = chalk.white(conv.name || 'Untitled');
          const model = chalk.dim(conv.model);
          const date = chalk.dim(new Date(conv.updatedAt).toLocaleDateString());
          const count = chalk.dim(`${conv.messages.length} msgs`);
          console.log(`  ${id} | ${name} | ${model} | ${date} | ${count}`);
        }

        console.log('');
        console.log(chalk.dim('  Use /load <id> to load a conversation'));
        console.log(chalk.dim('  Use /history search <query> to search'));
        console.log('');
        return;
      }

      if (trimmed.startsWith('search ')) {
        // Search conversations
        const query = trimmed.slice(7).trim();
        if (!query) {
          console.log('');
          console.log(chalk.red('  ✗ Please provide a search query.'));
          console.log(chalk.dim('  Usage: /history search <query>'));
          console.log('');
          return;
        }

        const results = ctx.history.searchConversations(query);

        if (results.length === 0) {
          console.log('');
          console.log(chalk.dim(`  No conversations found matching "${query}".`));
          console.log('');
          return;
        }

        console.log('');
        console.log(chalk.hex('#e8873a').bold(`  Search results for "${query}"`));
        console.log(chalk.dim('  ─'.repeat(18)));
        console.log('');

        for (const conv of results) {
          const id = chalk.cyan(conv.id.slice(0, 8));
          const name = chalk.white(conv.name || 'Untitled');
          const model = chalk.dim(conv.model);
          const date = chalk.dim(new Date(conv.updatedAt).toLocaleDateString());
          const count = chalk.dim(`${conv.messages.length} msgs`);
          console.log(`  ${id} | ${name} | ${model} | ${date} | ${count}`);
        }

        console.log('');
        return;
      }

      // Assume it's a conversation ID — load it
      const conversation = ctx.history.loadConversation(trimmed);
      if (!conversation) {
        console.log('');
        console.log(chalk.red(`  ✗ Conversation "${trimmed}" not found.`));
        console.log('');
        return;
      }

      // Replace current conversation
      ctx.conversation.messages = [...conversation.messages];
      ctx.setConfig({
        provider: conversation.provider,
        model: conversation.model,
        systemPrompt: conversation.systemPrompt,
      });

      console.log('');
      console.log(chalk.hex('#e8873a')(`  ✓ Loaded conversation: ${conversation.name || 'Untitled'}`));
      console.log(chalk.dim(`  ID: ${conversation.id}`));
      console.log(chalk.dim(`  Messages: ${conversation.messages.length}`));
      console.log(chalk.dim(`  Model: ${conversation.model}`));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
