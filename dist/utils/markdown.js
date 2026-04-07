// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Terminal Markdown Rendering
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import chalk from 'chalk';
import { marked } from 'marked';
// ─── ANSI stripping utility ───
function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
/**
 * Recursively extract plain text from marked tokens.
 */
function tokensToText(tokens) {
    let result = '';
    for (const token of tokens) {
        if ('text' in token && typeof token.text === 'string') {
            result += token.text;
        }
        if ('tokens' in token && Array.isArray(token.tokens)) {
            result += tokensToText(token.tokens);
        }
        if ('items' in token && Array.isArray(token.items)) {
            for (const item of token.items) {
                if (item.tokens) {
                    result += tokensToText(item.tokens);
                }
            }
        }
    }
    return result;
}
// ─── Renderer object ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const terminalRenderer = {
    heading(token) {
        const text = token.tokens ? tokensToText(token.tokens) : '';
        const styles = {
            1: chalk.bold.cyan,
            2: chalk.bold.yellow,
            3: chalk.bold.green,
            4: chalk.bold.blue,
            5: chalk.bold.magenta,
            6: chalk.bold,
        };
        const style = styles[token.depth] ?? chalk.bold;
        const label = token.depth <= 2 ? '#'.repeat(token.depth) + ' ' : '';
        return `\n${style(`${label}${text}`)}\n`;
    },
    strong(token) {
        return chalk.bold(tokensToText(token.tokens));
    },
    em(token) {
        return chalk.italic(tokensToText(token.tokens));
    },
    codespan(token) {
        return chalk.bgGray.white(` ${token.text} `);
    },
    code(token) {
        const language = token.lang ?? '';
        const lines = token.text.split('\n');
        const maxLineLength = Math.max(...lines.map((l) => stripAnsi(l).length), 10);
        const boxWidth = Math.min(maxLineLength + 4, 80);
        const topBorder = chalk.gray(`┌${'─'.repeat(boxWidth)}┐`);
        const bottomBorder = chalk.gray(`└${'─'.repeat(boxWidth)}┘`);
        const langLabel = language
            ? chalk.cyan(` ${language}`) + chalk.gray(' '.repeat(Math.max(boxWidth - language.length - 1, 0)))
            : chalk.gray(' '.repeat(boxWidth));
        const codeLines = [];
        for (const line of lines) {
            const stripped = stripAnsi(line);
            const padding = boxWidth - stripped.length;
            codeLines.push(chalk.gray('│ ') + chalk.green(line) + chalk.gray(' '.repeat(Math.max(padding, 0)) + ' │'));
        }
        return `\n${topBorder}\n${chalk.gray('│')}${langLabel}${chalk.gray('│')}\n${chalk.gray('├') + chalk.gray('─'.repeat(boxWidth)) + chalk.gray('┤')}\n${codeLines.join('\n')}\n${bottomBorder}\n`;
    },
    blockquote(token) {
        const text = token.tokens ? tokensToText(token.tokens) : '';
        const lines = text.split('\n');
        const quoted = lines.map((line) => chalk.gray('│ ') + chalk.dim(line)).join('\n');
        return `\n${quoted}\n`;
    },
    list(token) {
        const items = [];
        for (let i = 0; i < token.items.length; i++) {
            const item = token.items[i];
            const text = item.tokens ? tokensToText(item.tokens) : item.text;
            const bullet = token.ordered
                ? `${chalk.cyan(String(i + 1) + '.')}`
                : `${chalk.cyan('•')}`;
            items.push(`  ${bullet} ${text}`);
        }
        return '\n' + items.join('\n') + '\n';
    },
    link(token) {
        const text = tokensToText(token.tokens);
        return `${chalk.underline.cyan(text)}${chalk.dim(` (${token.href})`)}`;
    },
    paragraph(token) {
        const text = token.tokens ? tokensToText(token.tokens) : '';
        return `${text}\n\n`;
    },
    hr() {
        return chalk.gray('─'.repeat(60)) + '\n';
    },
    br() {
        return '\n';
    },
};
// ─── Public API ───
/**
 * Convert markdown text to a terminal-formatted string with ANSI colors.
 */
export function renderMarkdown(text) {
    if (!text)
        return '';
    marked.use({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderer: terminalRenderer,
        breaks: true,
        gfm: true,
    });
    const result = marked.parse(text);
    if (typeof result !== 'string') {
        return String(result);
    }
    // Clean up excessive blank lines (more than 2 consecutive)
    return result.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
/**
 * Remove all markdown formatting from text, returning plain text.
 */
export function stripMarkdown(text) {
    if (!text)
        return '';
    let result = text;
    // Remove code blocks with language
    result = result.replace(/```[\s\S]*?```/g, (match) => {
        const inner = match.replace(/```\w*\n?/g, '').replace(/```/g, '');
        return inner;
    });
    // Remove inline code
    result = result.replace(/`([^`]+)`/g, '$1');
    // Remove bold
    result = result.replace(/\*\*(.+?)\*\*/g, '$1');
    result = result.replace(/__(.+?)__/g, '$1');
    // Remove italic
    result = result.replace(/\*(.+?)\*/g, '$1');
    result = result.replace(/_(.+?)_/g, '$1');
    // Remove strikethrough
    result = result.replace(/~~(.+?)~~/g, '$1');
    // Remove links — keep text, remove URL
    result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove images — keep alt text
    result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
    // Remove headings
    result = result.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    // Remove blockquotes
    result = result.replace(/^>\s?(.+)$/gm, '$1');
    // Remove horizontal rules
    result = result.replace(/^[-*_]{3,}\s*$/gm, '');
    // Remove unordered list markers
    result = result.replace(/^\s*[-*+]\s+/gm, '');
    // Remove ordered list markers
    result = result.replace(/^\s*\d+\.\s+/gm, '');
    // Remove HTML tags
    result = result.replace(/<[^>]+>/g, '');
    // Clean up excess whitespace
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.trim();
    return result;
}
//# sourceMappingURL=markdown.js.map