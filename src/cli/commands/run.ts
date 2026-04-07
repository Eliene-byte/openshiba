import chalk from 'chalk';
import { readFile } from 'node:fs/promises';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'run',
  description: 'Run a .shibaprompt file',
  usage: '/run <file-path>',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();
      if (!trimmed) {
        console.log('');
        console.log(chalk.red('  ✗ Please provide a file path.'));
        console.log(chalk.dim('  Usage: /run <file-path>'));
        console.log('');
        return;
      }

      let fileContent: string;
      try {
        fileContent = await readFile(trimmed, 'utf-8');
      } catch {
        console.log('');
        console.log(chalk.red(`  ✗ File not found: ${trimmed}`));
        console.log('');
        return;
      }

      // Replace variables
      let prompt = fileContent;

      // {{clipboard}} - read from clipboard
      try {
        const clipboardy = await import('clipboardy');
        const clipboardContent = await clipboardy.default.read();
        prompt = prompt.replace(/\{\{clipboard\}\}/g, clipboardContent);
      } catch {
        prompt = prompt.replace(/\{\{clipboard\}\}/g, '[clipboard unavailable]');
      }

      // {{date}} - current date
      prompt = prompt.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
      prompt = prompt.replace(/\{\{datetime\}\}/g, new Date().toLocaleString());
      prompt = prompt.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString());

      // {{file:path}} - read file content
      const fileMatches = prompt.matchAll(/\{\{file:(.+?)\}\}/g);
      for (const match of fileMatches) {
        const filePath = match[1];
        try {
          const fileContent = await readFile(filePath, 'utf-8');
          prompt = prompt.replace(match[0], fileContent);
        } catch {
          prompt = prompt.replace(match[0], `[file not found: ${filePath}]`);
        }
      }

      // {{model}} - current model
      prompt = prompt.replace(/\{\{model\}\}/g, ctx.config.model);
      // {{provider}} - current provider
      prompt = prompt.replace(/\{\{provider\}\}/g, ctx.config.provider);

      console.log('');
      console.log(chalk.hex('#e8873a')(`  ✓ Running prompt file: ${trimmed}`));
      console.log('');

      // Set the input so the REPL will execute it
      ctx.setInput(prompt);
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
