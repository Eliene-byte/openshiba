import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';

const command: SlashCommand = {
  name: 'help',
  description: 'List all available commands with descriptions',
  usage: '/help',
  handler(_args: string, ctx: CommandContext): void {
    // We don't have direct access to allCommands here, so we use a hardcoded list
    // The REPL layer will pass commands through or we import the registry
    const commands: Array<{ name: string; description: string; usage?: string }> = [
      { name: 'help', description: 'List all available commands' },
      { name: 'model', description: 'List or switch AI models', usage: '/model [model-id|list]' },
      { name: 'provider', description: 'List or switch providers', usage: '/provider [name]' },
      { name: 'key', description: 'Show or set API key', usage: '/key [api-key]' },
      { name: 'config', description: 'Show or set configuration', usage: '/config [key=value ...]' },
      { name: 'system', description: 'Show or set system prompt', usage: '/system [prompt|clear]' },
      { name: 'clear', description: 'Clear conversation messages' },
      { name: 'reset', description: 'Reset everything to defaults' },
      { name: 'history', description: 'Browse conversation history', usage: '/history [list|search <query>|id]' },
      { name: 'load', description: 'Load a saved conversation', usage: '/load <conversation-id>' },
      { name: 'save', description: 'Save current conversation', usage: '/save [name]' },
      { name: 'export', description: 'Export conversation to file', usage: '/export [md|json]' },
      { name: 'copy', description: 'Copy last response to clipboard' },
      { name: 'tokens', description: 'Show token usage for session' },
      { name: 'stream', description: 'Toggle streaming on/off' },
      { name: 'multiline', description: 'Show multiline mode instructions' },
      { name: 'pipe', description: 'Show pipe mode instructions' },
      { name: 'run', description: 'Run a .shibaprompt file', usage: '/run <file-path>' },
      { name: 'whoami', description: 'Show current session info' },
      { name: 'exit', description: 'Exit OpenShiba' },
      { name: 'attach', description: 'Attach a file as context', usage: '/attach <file-path>' },
      { name: 'diff', description: 'Compare last two responses' },
    ];

    console.log('');
    console.log(chalk.hex('#e8873a').bold('  🐕 Available Commands'));
    console.log(chalk.dim('  ─'.repeat(20)));
    console.log('');

    for (const cmd of commands) {
      const nameStr = chalk.hex('#e8873a')(`  /${cmd.name}`);
      const descStr = chalk.dim(` — ${cmd.description}`);
      let line = `${nameStr}${descStr}`;
      if (cmd.usage) {
        line += `\n${chalk.dim(`    Usage: ${cmd.usage}`)}`;
      }
      console.log(line);
    }

    console.log('');
    console.log(chalk.dim('  Tip: Use /model list to interactively select a model'));
    console.log('');
  },
};

export default command;
