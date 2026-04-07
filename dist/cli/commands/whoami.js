import chalk from 'chalk';
import { PROVIDER_DEFAULTS } from '../../types.js';
const SHIBA_ASCII = `
    __          __
   / /  ___    / /___  ____
  / /  / _ \\  / __/ _ \\/ __/
 / /__/  __/ / /_/  __/ /
/____/\\___/  \\__/\\___/_/
`;
const command = {
    name: 'whoami',
    description: 'Show current session info and Shiba mascot',
    usage: '/whoami',
    async handler(_args, ctx) {
        try {
            console.log('');
            console.log(chalk.hex('#e8873a')(SHIBA_ASCII));
            console.log('');
            console.log(chalk.hex('#e8873a').bold('  🐕 OpenShiba'));
            console.log(chalk.dim('  ─'.repeat(20)));
            console.log('');
            // Provider info
            const providerDef = PROVIDER_DEFAULTS[ctx.config.provider];
            const providerName = providerDef?.name ?? ctx.config.provider;
            const isLocal = providerDef?.isLocal ?? false;
            console.log(`  ${chalk.hex('#e8873a')('Provider:')}   ${chalk.white(providerName)}${isLocal ? chalk.dim(' [local]') : ''}`);
            // Current model
            const currentModel = ctx.provider.config.models.find((m) => m.id === ctx.config.model);
            const modelName = currentModel?.name ?? ctx.config.model;
            console.log(`  ${chalk.hex('#e8873a')('Model:')}      ${chalk.white(modelName)} (${chalk.dim(ctx.config.model)})`);
            // Profile
            console.log(`  ${chalk.hex('#e8873a')('Profile:')}    ${chalk.white(ctx.config.profile)}`);
            // Connection status
            try {
                const connected = await ctx.provider.testConnection();
                if (connected) {
                    console.log(`  ${chalk.hex('#e8873a')('Status:')}     ${chalk.green('● Connected')}`);
                }
                else {
                    console.log(`  ${chalk.hex('#e8873a')('Status:')}     ${chalk.red('○ Disconnected')}`);
                }
            }
            catch {
                console.log(`  ${chalk.hex('#e8873a')('Status:')}     ${chalk.yellow('○ Unknown')}`);
            }
            // Streaming
            console.log(`  ${chalk.hex('#e8873a')('Streaming:')}  ${ctx.config.streaming ? chalk.green('on') : chalk.red('off')}`);
            // Conversation info
            console.log('');
            console.log(`  ${chalk.hex('#e8873a')('Messages:')}   ${ctx.conversation.messages.length}`);
            console.log(`  ${chalk.hex('#e8873a')('Temperature:')}${ctx.config.temperature}`);
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
//# sourceMappingURL=whoami.js.map