// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — /models Command
// Fetches live models from the current provider.
// Only shows models that are actually available to use.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import chalk from 'chalk';
import { execSync } from 'node:child_process';
import type { SlashCommand, CommandContext } from '../../types.js';

/**
 * Check if Ollama binary exists on the system PATH.
 */
function isOllamaInstalled(): boolean {
  try {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'where ollama' : 'which ollama';
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the Ollama server is responding.
 */
async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const command: SlashCommand = {
  name: 'models',
  description: 'List available models from the current provider (live)',
  usage: '/models [number]',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();
      const currentModel = ctx.config.model;

      // ── Switch by number ──
      if (trimmed) {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1) {
          const models = await ctx.provider.listModels();
          if (num <= models.length) {
            const selected = models[num - 1];
            ctx.setConfig({ model: selected.id });
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${selected.name} (${selected.id})`));
            console.log('');
            return;
          } else {
            console.log('');
            console.log(chalk.red(`  ✗ Number ${num} out of range. ${models.length} models available.`));
            console.log('');
            return;
          }
        }

        // Treat as model name
        ctx.setConfig({ model: trimmed });
        console.log('');
        console.log(chalk.hex('#e8873a')(`  ✓ Switched to model: ${trimmed}`));
        console.log('');
        return;
      }

      // ── List models ──
      console.log('');
      console.log(chalk.hex('#e8873a').bold('  📋 Available Models'));
      console.log(chalk.dim('  ' + '─'.repeat(30)));
      console.log(chalk.dim(`  Provider: ${ctx.provider.name}`));
      console.log('');

      let models: Awaited<ReturnType<typeof ctx.provider.listModels>>;
      try {
        models = await ctx.provider.listModels();
      } catch {
        models = [];
      }

      if (models.length === 0) {
        // ── Ollama-specific: detect installation and running status ──
        if (ctx.provider.config.isLocal && ctx.provider.name.includes('Ollama')) {
          const installed = isOllamaInstalled();
          const running = await isOllamaRunning();

          if (!installed) {
            console.log(chalk.red('  ✗ Ollama is NOT installed on this system.'));
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  To install Ollama:'));
            console.log('');
            if (process.platform === 'win32') {
              console.log(chalk.white('    Download from: https://ollama.com/download/windows'));
              console.log(chalk.dim('    Or run:  winget install Ollama.Ollama'));
              console.log(chalk.dim('    Or run:  choco install ollama'));
            } else if (process.platform === 'darwin') {
              console.log(chalk.white('    Download from: https://ollama.com/download/mac'));
              console.log(chalk.dim('    Or run:  brew install ollama'));
            } else {
              console.log(chalk.white('    Download from: https://ollama.com/download/linux'));
              console.log(chalk.dim('    Or run:  curl -fsSL https://ollama.com/install.sh | sh'));
            }
            console.log('');
            console.log(chalk.dim('  After installing, start Ollama and download a model:'));
            console.log(chalk.dim('    ollama serve          (starts the server)'));
            console.log(chalk.dim('    ollama pull llama3.3  (download a model)'));
            console.log('');
          } else if (!running) {
            console.log(chalk.yellow('  ⚠ Ollama is installed but NOT running.'));
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  To start Ollama:'));
            console.log('');
            console.log(chalk.white('    Open a new terminal and run:'));
            console.log(chalk.hex('#44aaff').bold('      ollama serve'));
            console.log('');
            console.log(chalk.dim('  Or simply open the Ollama application if installed via GUI.'));
            console.log('');
            console.log(chalk.dim('  Once running, download models with:'));
            console.log(chalk.dim('    ollama pull llama3.3'));
            console.log(chalk.dim('    ollama pull qwen2.5'));
            console.log('');
          } else {
            console.log(chalk.yellow('  ⚠ Ollama is running but no models are downloaded.'));
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  Download a model:'));
            console.log('');
            console.log(chalk.white('    ollama pull llama3.3'));
            console.log(chalk.white('    ollama pull qwen2.5'));
            console.log(chalk.white('    ollama pull mistral'));
            console.log(chalk.white('    ollama pull codellama'));
            console.log('');
            console.log(chalk.dim('  Browse all models at: https://ollama.com/library'));
            console.log(chalk.dim('  After downloading, run /models again to see them.'));
            console.log('');
          }
          return;
        }

        // ── Generic local provider (LM Studio, etc.) ──
        if (ctx.provider.config.isLocal) {
          console.log(chalk.yellow('  ⚠ No models found.'));
          console.log('');
          console.log(chalk.dim('  Make sure your local provider is running and has models loaded.'));
          console.log(chalk.dim(`  Endpoint: ${ctx.provider.config.baseUrl}`));
          console.log('');
          return;
        }

        // ── Cloud provider ──
        console.log(chalk.yellow('  ⚠ No models found.'));
        console.log('');
        console.log(chalk.dim('  Make sure your API key is set with /key'));
        console.log(chalk.dim('  Example: /key sk-or-v1-...'));
        console.log('');
        return;
      }

      // ── Display model list ──
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const isCurrent = model.id === currentModel || model.id === currentModel + ':latest';
        const marker = isCurrent ? chalk.hex('#e8873a').bold('→') : ' ';
        const num = chalk.cyan(`[${i + 1}]`);
        const name = isCurrent
          ? chalk.hex('#e8873a').bold(model.name)
          : chalk.white(model.name);
        const id = chalk.dim(` (${model.id})`);
        const size = model.size ? chalk.dim(`  ${model.size}`) : '';
        console.log(`  ${marker} ${num} ${name}${id}${size}`);
      }

      console.log('');
      console.log(chalk.dim('  ' + '─'.repeat(32)));
      console.log(chalk.dim(`  Current: ${chalk.hex('#e8873a')(currentModel)}`));
      console.log(chalk.dim(`  Total: ${chalk.white(String(models.length))} model(s) available`));
      console.log('');
      console.log(chalk.dim('  Use /models <number> to switch'));
      console.log('');
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
