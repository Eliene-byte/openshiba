#!/usr/bin/env node
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — CLI Entry Point
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { Repl } from './repl.js';
import { configStore } from '../storage/config.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ensure directories exist
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ensureDirectories(): void {
  const homeDir = os.homedir();
  const dirs = [
    path.join(homeDir, '.openshiba'),
    path.join(homeDir, '.openshiba', 'history'),
    path.join(homeDir, '.openshiba', 'profiles'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Read stdin if piped
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Piped input
      const chunks: Buffer[] = [];
      process.stdin.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      process.stdin.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'));
      });
      process.stdin.on('error', () => {
        resolve('');
      });
    } else {
      resolve('');
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Banner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function showBanner(): void {
  console.log('');
  console.log(chalk.hex('#e8873a')('  ╔══════════════════════════════════════════╗'));
  console.log(chalk.hex('#e8873a')('  ║') + chalk.hex('#ff9f5f').bold('        🐕 OpenShiba v1.0.0 ') + chalk.hex('#e8873a')('             ║'));
  console.log(chalk.hex('#e8873a')('  ║') + chalk.dim('  The Open-Source AI Terminal Companion ') + chalk.hex('#e8873a')('║'));
  console.log(chalk.hex('#e8873a')('  ╚══════════════════════════════════════════╝'));
  console.log('');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Debug logger
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function setupDebugLog(debug: boolean): void {
  if (!debug) return;

  const logPath = path.join(os.homedir(), '.openshiba', 'debug.log');
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  const writeLog = (level: string, ...args: unknown[]) => {
    const timestamp = new Date().toISOString();
    const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    fs.appendFileSync(logPath, `[${timestamp}] [${level}] ${message}\n`);
  };

  console.log = (...args: unknown[]) => {
    originalConsole.log(...args);
    writeLog('INFO', ...args);
  };

  console.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    writeLog('ERROR', ...args);
  };

  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    writeLog('WARN', ...args);
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main(): Promise<void> {
  // Ensure directories
  ensureDirectories();

  // CLI Parser
  const program = new Command();

  program
    .name('openshiba')
    .description('OpenShiba — CLI interativa sênior para conversar com modelos de IA')
    .version('1.0.0')
    .option('-p, --profile <name>', 'Usar um perfil de configuração específico', 'default')
    .option('-d, --debug', 'Ativar logs de debug em ~/.openshiba/debug.log', false)
    .option('-m, --model <model>', 'Modelo a ser utilizado')
    .option('--provider <provider>', 'Provider a ser utilizado')
    .option('--pipe', 'Ler stdin como contexto (modo pipe)')
    .option('--run <file>', 'Executar um arquivo .shibaprompt');

  program.parse();

  const options = program.opts();

  // Setup debug logging
  setupDebugLog(options.debug);

  // Handle --run flag
  if (options.run) {
    const filePath = path.resolve(options.run);
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    // Replace variables
    let processedContent = content
      .replace(/\{\{date\}\}/g, date)
      .replace(/\{\{clipboard\}\}/g, '[clipboard content not available in direct run]')
      .replace(/\{\{file:(.+?)\}\}/g, (_match, filePath: string) => {
        try {
          return fs.readFileSync(filePath.trim(), 'utf-8');
        } catch {
          return `[Error: Could not read file ${filePath}]`;
        }
      });

    // Pipe the processed content as input
    options.pipe = true;
    options._pipeContent = processedContent;
  }

  // Handle pipe mode
  let pipeContent = '';
  if (options.pipe || !process.stdin.isTTY) {
    if (options._pipeContent) {
      pipeContent = options._pipeContent as string;
    } else {
      pipeContent = await readStdin();
    }
  }

  // Show banner
  showBanner();

  // Handle --model and --provider overrides
  if (options.model || options.provider) {
    const config = configStore.getSessionConfig(options.profile);
    if (options.provider) {
      config.provider = options.provider;
    }
    if (options.model) {
      config.model = options.model;
    }
    configStore.setSessionConfig(config);
  }

  // Render the REPL
  try {
    const { waitUntilExit } = render(
      React.createElement(Repl, {
        initialInput: pipeContent || undefined,
        pipeMode: !!pipeContent,
        profile: options.profile,
        debugMode: options.debug,
      }),
      {
        exitOnCtrlC: true,
      }
    );

    await waitUntilExit();
  } catch (err) {
    console.error(chalk.red('Fatal error:'), err);
    process.exit(1);
  }
}

// Run
main().catch((err) => {
  console.error(chalk.red('Unhandled error:'), err);
  process.exit(1);
});
