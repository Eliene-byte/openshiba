import chalk from 'chalk';
import { attachFile, chunkText } from '../../utils/rag.js';
import path from 'node:path';
const command = {
    name: 'attach',
    description: 'Attach a file as context for the next message',
    usage: '/attach <file-path>',
    async handler(args, ctx) {
        try {
            const trimmed = args.trim();
            if (!trimmed) {
                console.log('');
                console.log(chalk.red('  ✗ Please provide a file path.'));
                console.log(chalk.dim('  Usage: /attach <file-path>'));
                console.log('');
                return;
            }
            const fileName = path.basename(trimmed);
            // attachFile returns a formatted context string
            const contextStr = await attachFile(trimmed);
            // Count chunks by reading the file ourselves
            let chunkCount = 1;
            try {
                const { readFileContent } = await import('../../utils/rag.js');
                const rawContent = await readFileContent(trimmed);
                chunkCount = chunkText(rawContent).length;
            }
            catch {
                chunkCount = 1;
            }
            // Append the file content as context to the conversation
            ctx.appendMessage('user', contextStr);
            console.log('');
            console.log(chalk.hex('#e8873a')(`  ✓ Attached: ${fileName} (${chunkCount} chunk${chunkCount !== 1 ? 's' : ''})`));
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
//# sourceMappingURL=attach.js.map