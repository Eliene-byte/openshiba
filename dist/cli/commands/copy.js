import chalk from 'chalk';
const command = {
    name: 'copy',
    description: 'Copy last assistant response to clipboard',
    usage: '/copy',
    async handler(_args, ctx) {
        try {
            // Find last assistant message
            const assistantMessages = ctx.conversation.messages.filter((m) => m.role === 'assistant');
            if (assistantMessages.length === 0) {
                console.log('');
                console.log(chalk.yellow('  ⚠ No assistant messages to copy.'));
                console.log('');
                return;
            }
            const lastMessage = assistantMessages[assistantMessages.length - 1].content;
            // Use clipboardy to copy to clipboard
            const clipboardy = await import('clipboardy');
            await clipboardy.default.write(lastMessage);
            console.log('');
            console.log(chalk.hex('#e8873a')('  ✓ Response copied to clipboard!'));
            console.log(chalk.dim(`  (${lastMessage.length} characters)`));
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
//# sourceMappingURL=copy.js.map