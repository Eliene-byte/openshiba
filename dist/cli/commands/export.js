import chalk from 'chalk';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const command = {
    name: 'export',
    description: 'Export conversation to a file',
    usage: '/export [md|json]',
    async handler(args, ctx) {
        try {
            const trimmed = args.trim().toLowerCase();
            const format = trimmed === 'json' ? 'json' : 'md';
            if (ctx.conversation.messages.length === 0) {
                console.log('');
                console.log(chalk.yellow('  ⚠ No messages to export.'));
                console.log('');
                return;
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            let fileName;
            let content;
            if (format === 'json') {
                fileName = `conversation-${timestamp}.json`;
                const exportMessages = ctx.conversation.messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp).toISOString(),
                    tokens: msg.tokens,
                }));
                content = JSON.stringify(exportMessages, null, 2);
            }
            else {
                fileName = `conversation-${timestamp}.md`;
                const lines = [];
                lines.push(`# Conversation Export`);
                lines.push('');
                lines.push(`- **Provider:** ${ctx.conversation.provider}`);
                lines.push(`- **Model:** ${ctx.conversation.model}`);
                lines.push(`- **Date:** ${new Date().toLocaleString()}`);
                lines.push(`- **Messages:** ${ctx.conversation.messages.length}`);
                lines.push('');
                lines.push('---');
                lines.push('');
                for (const msg of ctx.conversation.messages) {
                    const roleHeader = msg.role === 'user' ? '## 👤 User' : msg.role === 'assistant' ? '## 🤖 Assistant' : '## ⚙ System';
                    lines.push(roleHeader);
                    lines.push('');
                    lines.push(msg.content);
                    lines.push('');
                    lines.push('---');
                    lines.push('');
                }
                content = lines.join('\n');
            }
            const filePath = join(process.cwd(), fileName);
            await writeFile(filePath, content, 'utf-8');
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ Conversation exported as ${format.toUpperCase()}`));
            console.log(chalk.dim(`  File: ${filePath}`));
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
//# sourceMappingURL=export.js.map