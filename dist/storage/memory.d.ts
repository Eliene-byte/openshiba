import type { MemoryStore, MemoryEntry } from '../types.js';
declare class MemoryStoreImpl implements MemoryStore {
    private db;
    private dbPath;
    private ready;
    constructor();
    private initDb;
    private ensureReady;
    private runMigrations;
    private persist;
    private queryAll;
    private queryOne;
    private runSql;
    add(content: string, category?: string): number;
    get(id: number): MemoryEntry | null;
    getAll(limit?: number): MemoryEntry[];
    search(query: string): MemoryEntry[];
    delete(id: number): boolean;
    clear(): boolean;
    getCount(): number;
    formatForPrompt(limit?: number): string;
    close(): void;
}
export declare const memoryStore: MemoryStoreImpl;
export {};
//# sourceMappingURL=memory.d.ts.map