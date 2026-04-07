import type { HistoryStore, Conversation } from '../types.js';
declare class HistoryStoreImpl implements HistoryStore {
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
    saveConversation(conversation: Conversation): string;
    loadConversation(id: string): Conversation | null;
    listConversations(limit?: number, offset?: number): Conversation[];
    searchConversations(query: string): Conversation[];
    deleteConversation(id: string): boolean;
    updateConversation(id: string, updates: Partial<Conversation>): boolean;
    getTotalCount(): number;
    close(): void;
}
export declare const historyStore: HistoryStoreImpl;
export {};
//# sourceMappingURL=history.d.ts.map