import chalk from 'chalk';
import { PROVIDER_DEFAULTS } from '../../types.js';
const command = {
    name: 'key',
    description: 'Show or set API key for current provider',
    usage: '/key [api-key]',
    async handler(args, ctx) {
        try {
            const trimmed = args.trim();
            if (!trimmed) {
                // Show current key (masked)
                const currentKey = ctx.provider.config.apiKey;
                if (!currentKey) {
                    console.log('');
                    console.log(chalk.yellow('  ⚠ No API key set for current provider.'));
                    console.log(chalk.dim(`  Provider: ${ctx.config.provider}`));
                    console.log(chalk.dim('  Use /key <api-key> to set one.'));
                    console.log('');
                    return;
                }
                const masked = '*'.repeat(Math.max(0, currentKey.length - 4)) + currentKey.slice(-4);
                console.log('');
                console.log(chalk.hex('#e8873a')(`  API Key: ${chalk.dim(masked)}`));
                console.log(chalk.dim(`  Provider: ${ctx.config.provider}`));
                console.log('');
                return;
            }
            // Set new API key
            const newKey = trimmed;
            // Get current provider config and update it
            const providerName = ctx.config.provider;
            const providerDef = PROVIDER_DEFAULTS[providerName];
            if (!providerDef) {
                console.log('');
                console.log(chalk.red('  ✗ Unknown provider.'));
                console.log('');
                return;
            }
            const updatedConfig = {
                name: providerDef.name,
                baseUrl: providerDef.baseUrl,
                apiKey: newKey,
                models: providerDef.models,
                isLocal: providerDef.isLocal,
            };
            ctx.configStore.setProviderConfig(providerName, updatedConfig);
            // Recreate provider instance
            try {
                const { createProvider } = await import('../../providers/base.js');
                const newProvider = createProvider(providerName, newKey);
                // The REPL layer handles updating the provider reference
                // For now we update config which signals the change
                ctx.setConfig({ provider: providerName });
            }
            catch {
                // Provider module may not exist yet
                ctx.setConfig({ provider: providerName });
            }
            const masked = '*'.repeat(Math.max(0, newKey.length - 4)) + newKey.slice(-4);
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ API key updated for ${providerDef.name}`));
            console.log(chalk.dim(`  Key: ${masked}`));
            console.log('');
        }
        catch (err) {
            console.log('');
            console.log(chalk.red(`  ✗ Error: ${err instanceof Error ? err.message : String(err)}`));
            console.log('');
        }
    },
};
export default command;
//# sourceMappingURL=key.js.map