/**
 * Read file content from disk. Only supports text files.
 * Throws if the file extension is not supported or the file cannot be read.
 */
export declare function readFileContent(filePath: string): Promise<string>;
/**
 * Split text into overlapping chunks for RAG context.
 *
 * @param text          The full text to split
 * @param maxChunkSize  Maximum characters per chunk (default: 1500)
 * @param overlap       Number of overlapping characters between chunks (default: 200)
 * @returns Array of text chunks
 */
export declare function chunkText(text: string, maxChunkSize?: number, overlap?: number): string[];
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
export declare function formatChunksForContext(chunks: string[], fileName: string): string;
/**
 * Attach a file for RAG — reads the file, chunks it, and returns a formatted context string.
 *
 * @param filePath  Path to the file on disk
 * @returns Formatted context string ready for inclusion in a prompt
 */
export declare function attachFile(filePath: string): Promise<string>;
//# sourceMappingURL=rag.d.ts.map