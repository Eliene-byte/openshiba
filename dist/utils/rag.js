// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — RAG (Retrieval-Augmented Generation) Utility
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import fs from 'node:fs/promises';
import path from 'node:path';
/**
 * Supported file extensions for RAG file attachment.
 */
const SUPPORTED_EXTENSIONS = new Set([
    '.txt', '.md', '.json', '.js', '.ts', '.py', '.rs', '.go',
    '.sh', '.yaml', '.yml', '.toml', '.xml', '.html', '.css',
    '.sql', '.log',
]);
/**
 * Check if a file extension is supported for RAG.
 */
function isSupportedExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
}
/**
 * Read file content from disk. Only supports text files.
 * Throws if the file extension is not supported or the file cannot be read.
 */
export async function readFileContent(filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!isSupportedExtension(resolvedPath)) {
        throw new Error(`Unsupported file type "${path.extname(resolvedPath)}". ` +
            `Supported: ${Array.from(SUPPORTED_EXTENSIONS).join(', ')}`);
    }
    try {
        const content = await fs.readFile(resolvedPath, 'utf-8');
        return content;
    }
    catch (err) {
        if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            throw new Error(`File not found: ${resolvedPath}`);
        }
        throw new Error(`Failed to read file "${resolvedPath}": ${err instanceof Error ? err.message : String(err)}`);
    }
}
/**
 * Split text into overlapping chunks for RAG context.
 *
 * @param text          The full text to split
 * @param maxChunkSize  Maximum characters per chunk (default: 1500)
 * @param overlap       Number of overlapping characters between chunks (default: 200)
 * @returns Array of text chunks
 */
export function chunkText(text, maxChunkSize = 1500, overlap = 200) {
    if (!text || text.length === 0)
        return [];
    // If the text fits in one chunk, return it as-is
    if (text.length <= maxChunkSize) {
        return [text];
    }
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxChunkSize;
        // If we haven't reached the end of the text, try to break at a word boundary
        if (end < text.length) {
            // Look backwards from end for a newline, period, or space
            const searchWindow = text.slice(Math.max(start, end - 200), end);
            const breakPoint = Math.max(searchWindow.lastIndexOf('\n'), searchWindow.lastIndexOf('.'), searchWindow.lastIndexOf(' '));
            if (breakPoint !== -1) {
                end = Math.max(start, end - 200) + breakPoint + 1;
            }
        }
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        // Move start forward, accounting for overlap
        start = end - overlap;
        // Avoid infinite loop when chunk is too small to advance
        if (start >= text.length)
            break;
        if (end >= text.length) {
            // Capture remaining text
            const remaining = text.slice(start).trim();
            if (remaining.length > 0) {
                chunks.push(remaining);
            }
            break;
        }
    }
    return chunks;
}
/**
 * Format chunks as a context string suitable for inclusion in an LLM prompt.
 *
 * Format:
 * ```
 * [Document: {fileName}]
 * --- Chunk 1/3 ---
 * {chunk content}
 * --- Chunk 2/3 ---
 * ...
 * ```
 */
export function formatChunksForContext(chunks, fileName) {
    if (!chunks || chunks.length === 0)
        return '';
    const lines = [];
    lines.push(`[Document: ${fileName}]`);
    for (let i = 0; i < chunks.length; i++) {
        lines.push(`--- Chunk ${i + 1}/${chunks.length} ---`);
        lines.push(chunks[i]);
    }
    return lines.join('\n');
}
/**
 * Attach a file for RAG — reads the file, chunks it, and returns a formatted context string.
 *
 * @param filePath  Path to the file on disk
 * @returns Formatted context string ready for inclusion in a prompt
 */
export async function attachFile(filePath) {
    const content = await readFileContent(filePath);
    const chunks = chunkText(content);
    const fileName = path.basename(filePath);
    return formatChunksForContext(chunks, fileName);
}
//# sourceMappingURL=rag.js.map