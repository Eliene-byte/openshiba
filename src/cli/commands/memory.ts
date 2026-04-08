import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

function detectCategory(text: string): 'fact' | 'preference' | 'context' | 'instruction' {
  const lower = text.toLowerCase();
  if (lower.startsWith('eu ') || lower.startsWith('i ')) {
    return 'preference';
  }
  if (lower.includes('project') || lower.includes('trabalhando')) {
    return 'context';
  }
  return 'fact';
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString();
}

function formatCategory(cat: string): string {
  const colors: Record<string, string> = {
    fact: '#44aaff',
    preference: '#44ff44',
    context: '#ffcc00',
    instruction: '#ff88ff',
  };
  return chalk.hex(colors[cat] || '#888888').bold(cat);
}

const command: SlashCommand = {
  name: 'memory',
  description: 'Manage persistent memories across conversations',
  usage: '/memory [add|delete|search|clear|on|off|save]',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();
      const memoryStore = ctx.memory;

      // ── No args or "list" ──
      if (!trimmed || trimmed === 'list') {
        const memories = memoryStore.getAll();
        const count = memoryStore.getCount();

        if (memories.length === 0) {
          console.log('');
          console.log(chalk.dim('  No memories stored yet.'));
          console.log(chalk.dim('  Use /memory add <text> to save a memory.'));
          console.log('');
          return;
        }

        console.log('');
        console.log(chalk.hex('#e8873a').bold('  Memories'));
        console.log(chalk.dim('  ' + '─'.repeat(18) + `  Total: ${count}`));
        console.log('');

        for (const mem of memories) {
          const id = chalk.cyan(`#${mem.id}`);
          const cat = formatCategory(mem.category);
          const date = chalk.dim(formatDate(mem.createdAt));
          console.log(`  ${id} ${cat} ${chalk.white(mem.content)} ${date}`);
        }

        console.log('');
        console.log(chalk.dim('  Use /memory add <text> to save a memory'));
        console.log(chalk.dim('  Use /memory delete <id> to remove one'));
        console.log(chalk.dim('  Use /memory search <query> to search'));
        console.log('');
        return;
      }

      // ── add <text> ──
      if (trimmed.startsWith('add ')) {
        const text = trimmed.slice(4).trim();
        if (!text) {
          console.log('');
          console.log(chalk.hex('#ff4444')('  ✗ Please provide text to remember.'));
          console.log(chalk.dim('  Usage: /memory add <text>'));
          console.log('');
          return;
        }

        const category = detectCategory(text);
        const id = memoryStore.add(text, category);

        console.log('');
        console.log(chalk.hex('#e8873a')(`  ✓ Memory saved (id: ${id}, category: ${category})`));
        console.log(chalk.dim(`  ${text}`));
        console.log('');
        return;
      }

      // ── delete <number> ──
      if (trimmed.startsWith('delete ')) {
        const idStr = trimmed.slice(7).trim();
        const id = parseInt(idStr, 10);

        if (isNaN(id)) {
          console.log('');
          console.log(chalk.hex('#ff4444')('  ✗ Please provide a valid memory ID (number).'));
          console.log(chalk.dim('  Usage: /memory delete <id>'));
          console.log('');
          return;
        }

        const mem = memoryStore.get(id);
        if (!mem) {
          console.log('');
          console.log(chalk.hex('#ff4444')(`  ✗ Memory #${id} not found.`));
          console.log('');
          return;
        }

        const success = memoryStore.delete(id);
        if (success) {
          console.log('');
          console.log(chalk.hex('#e8873a')(`  ✓ Memory #${id} deleted.`));
          console.log(chalk.dim(`  ${mem.content}`));
          console.log('');
        } else {
          console.log('');
          console.log(chalk.hex('#ff4444')(`  ✗ Failed to delete memory #${id}.`));
          console.log('');
        }
        return;
      }

      // ── search <query> ──
      if (trimmed.startsWith('search ')) {
        const query = trimmed.slice(7).trim();
        if (!query) {
          console.log('');
          console.log(chalk.hex('#ff4444')('  ✗ Please provide a search query.'));
          console.log(chalk.dim('  Usage: /memory search <query>'));
          console.log('');
          return;
        }

        const results = memoryStore.search(query);

        if (results.length === 0) {
          console.log('');
          console.log(chalk.dim(`  No memories found matching "${query}".`));
          console.log('');
          return;
        }

        console.log('');
        console.log(chalk.hex('#e8873a').bold(`  Search results for "${query}"`));
        console.log(chalk.dim('  ─'.repeat(18)));
        console.log('');

        for (const mem of results) {
          const id = chalk.cyan(`#${mem.id}`);
          const cat = formatCategory(mem.category);
          const date = chalk.dim(formatDate(mem.createdAt));
          console.log(`  ${id} ${cat} ${chalk.white(mem.content)} ${date}`);
        }

        console.log('');
        return;
      }

      // ── clear ──
      if (trimmed === 'clear') {
        const count = memoryStore.getCount();
        if (count === 0) {
          console.log('');
          console.log(chalk.dim('  No memories to clear.'));
          console.log('');
          return;
        }

        const success = memoryStore.clear();
        if (success) {
          console.log('');
          console.log(chalk.hex('#e8873a')(`  ✓ Cleared ${count} memories.`));
          console.log('');
        } else {
          console.log('');
          console.log(chalk.hex('#ff4444')('  ✗ Failed to clear memories.'));
          console.log('');
        }
        return;
      }

      // ── on ──
      if (trimmed === 'on') {
        ctx.setConfig({ memoryEnabled: true });
        console.log('');
        console.log(chalk.hex('#e8873a')('  ✓ Memory injection enabled.'));
        console.log(chalk.dim('  Memories will be included in system prompts.'));
        console.log('');
        return;
      }

      // ── off ──
      if (trimmed === 'off') {
        ctx.setConfig({ memoryEnabled: false });
        console.log('');
        console.log(chalk.hex('#e8873a')('  ✓ Memory injection disabled.'));
        console.log(chalk.dim('  Memories will not be included in system prompts.'));
        console.log('');
        return;
      }

      // ── save ──
      if (trimmed === 'save') {
        const messages = ctx.conversation.messages;
        // Find the last user message and the last assistant message
        let lastUserMsg: string | null = null;
        let lastAssistantMsg: string | null = null;

        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          if (msg.role === 'assistant' && !lastAssistantMsg) {
            lastAssistantMsg = msg.content;
          }
          if (msg.role === 'user' && !lastUserMsg) {
            lastUserMsg = msg.content;
          }
          if (lastUserMsg && lastAssistantMsg) break;
        }

        if (!lastUserMsg && !lastAssistantMsg) {
          console.log('');
          console.log(chalk.hex('#ff4444')('  ✗ No exchange to save. Chat with the AI first.'));
          console.log('');
          return;
        }

        let summary: string;
        if (lastAssistantMsg && lastUserMsg) {
          summary = `${lastAssistantMsg}`;
        } else {
          summary = lastAssistantMsg || lastUserMsg || '';
        }

        const category = detectCategory(summary);
        const id = memoryStore.add(summary, category);

        console.log('');
        console.log(chalk.hex('#e8873a')(`  ✓ Last exchange saved as memory (id: ${id}, category: ${category})`));
        console.log(chalk.dim(`  ${summary.length > 80 ? summary.slice(0, 80) + '...' : summary}`));
        console.log('');
        return;
      }

      // ── Unknown subcommand ──
      console.log('');
      console.log(chalk.hex('#ff4444')(`  ✗ Unknown subcommand: ${trimmed}`));
      console.log(chalk.dim('  Usage: /memory [add|delete|search|clear|on|off|save|list]'));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.hex('#ff4444')(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
