import chalk from 'chalk';
import type { SlashCommand, CommandContext } from '../../types.js';
import { PROVIDER_DEFAULTS } from '../../types.js';

const command: SlashCommand = {
  name: 'provider',
  description: 'List or switch providers',
  usage: '/provider [name]',
  async handler(args: string, ctx: CommandContext): Promise<void> {
    try {
      const trimmed = args.trim();

      if (!trimmed) {
        // List available providers
        const providerKeys = Object.keys(PROVIDER_DEFAULTS);
        const currentProvider = ctx.config.provider;

        console.log('');
        console.log(chalk.hex('#e8873a').bold('  Available Providers'));
        console.log(chalk.dim('  ─'.repeat(16)));
        console.log('');

        for (const key of providerKeys) {
          const def = PROVIDER_DEFAULTS[key];
          const isCurrent = key === currentProvider;
          const marker = isCurrent ? chalk.hex('#e8873a').bold('  ● ') : '  ○ ';
          const name = isCurrent
            ? chalk.hex('#e8873a').bold(def.name)
            : chalk.white(def.name);
          const id = chalk.dim(` (${key})`);
          const modelCount = chalk.dim(` — ${def.models.length} models`);
          const local = def.isLocal ? chalk.dim(' [local]') : '';
          console.log(`${marker}${name}${id}${modelCount}${local}`);
        }

        console.log('');
        console.log(chalk.dim(`  Current: ${chalk.hex('#e8873a')(currentProvider)}`));
        console.log(chalk.dim('  Use /provider <name> to switch'));
        console.log('');
        return;
      }

      // Switch provider
      const providerKey = trimmed.toLowerCase();
      const providerDef = PROVIDER_DEFAULTS[providerKey];

      if (!providerDef) {
        const available = Object.keys(PROVIDER_DEFAULTS).join(', ');
        console.log('');
        console.log(chalk.red(`  ✗ Provider "${trimmed}" not found.`));
        console.log(chalk.dim(`  Available: ${available}`));
        console.log('');
        return;
      }

      // Get the stored provider config or use defaults
      const storedConfigs = ctx.configStore.getProviderConfigs();
      const storedConfig = storedConfigs[providerKey];
      const apiKey = storedConfig?.apiKey ?? '';

      // Try to create a new provider instance
      try {
        const { createProvider } = await import('../../providers/base.js');
        const newProvider = createProvider(providerKey, apiKey);

        // Update config with the first model of the new provider
        const firstModel = providerDef.models.length > 0 ? providerDef.models[0].id : 'default';
        ctx.setConfig({
          provider: providerKey,
          model: firstModel,
        });

        console.log('');
        console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${providerDef.name}`));
        console.log(chalk.dim(`  Model: ${firstModel}`));

        if (!apiKey) {
          console.log(chalk.yellow('  ⚠ No API key set. Use /key <api-key> to set one.'));
        }

        console.log('');
      } catch {
        // Provider module may not exist yet — still update config
        const firstModel = providerDef.models.length > 0 ? providerDef.models[0].id : 'default';
        ctx.setConfig({
          provider: providerKey,
          model: firstModel,
        });

        console.log('');
        console.log(chalk.hex('#e8873a')(`  ✓ Switched to ${providerDef.name}`));
        console.log(chalk.dim(`  Model: ${firstModel}`));
        console.log('');
      }
    } catch (err) {
      console.log('');
      console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log('');
    }
  },
};

export default command;
