// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — HistoryStore Implementation (sql.js — pure JS/WASM, no C++ build)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import initSqlJs from 'sql.js';
class HistoryStoreImpl {
    db = null;
    dbPath;
    ready;
    constructor() {
        const historyDir = path.join(os.homedir(), '.openshiba', 'history');
        // Ensure the directory exists
        if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir, { recursive: true });
        }
        this.dbPath = path.join(historyDir, 'conversations.db');
        // Initialize asynchronously
        this.ready = this.initDb();
    }
    async initDb() {
        try {
            const SQL = await initSqlJs();
            // Load existing database from file if it exists
            if (fs.existsSync(this.dbPath)) {
                const fileBuffer = fs.readFileSync(this.dbPath);
                this.db = new SQL.Database(fileBuffer);
            }
            else {
                this.db = new SQL.Database();
            }
            this.runMigrations();
        }
        catch (err) {
            console.error('Failed to initialize history database:', err);
            this.db = null;
        }
    }
    ensureReady() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initDb() first.');
        }
        return this.db;
    }
    runMigrations() {
        const db = this.ensureReady();
        db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        system_prompt TEXT DEFAULT '',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tokens_prompt INTEGER DEFAULT 0,
        tokens_completion INTEGER DEFAULT 0,
        tokens_total INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL
      );
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_content ON messages(content);
    `);
    }
    persist() {
        if (!this.db)
            return;
        try {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(this.dbPath, buffer);
        }
        catch {
            // Ignore write errors
        }
    }
    queryAll(sql, params = []) {
        const db = this.ensureReady();
        try {
            const stmt = db.prepare(sql);
            const bindParams = {};
            for (let i = 0; i < params.length; i++) {
                bindParams[String(i + 1)] = params[i];
            }
            stmt.bind(bindParams);
            const rows = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                rows.push(row);
            }
            stmt.free();
            return rows;
        }
        catch {
            return [];
        }
    }
    queryOne(sql, params = []) {
        const db = this.ensureReady();
        try {
            const stmt = db.prepare(sql);
            const bindParams = {};
            for (let i = 0; i < params.length; i++) {
                bindParams[String(i + 1)] = params[i];
            }
            stmt.bind(bindParams);
            let row = null;
            if (stmt.step()) {
                row = stmt.getAsObject();
            }
            stmt.free();
            return row;
        }
        catch {
            return null;
        }
    }
    runSql(sql, params = []) {
        const db = this.ensureReady();
        try {
            db.run(sql, params);
            // sql.js doesn't return changes directly, we track manually
            return { changes: 1 };
        }
        catch {
            return { changes: 0 };
        }
    }
    saveConversation(conversation) {
        const db = this.ensureReady();
        const id = conversation.id || crypto.randomUUID();
        const now = Date.now();
        try {
            // Check if conversation exists
            const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);
            if (existing) {
                db.run(`UPDATE conversations SET name = ?, provider = ?, model = ?, system_prompt = ?, updated_at = ? WHERE id = ?`, [conversation.name, conversation.provider, conversation.model, conversation.systemPrompt, now, id]);
                // Delete old messages
                db.run('DELETE FROM messages WHERE conversation_id = ?', [id]);
            }
            else {
                db.run(`INSERT INTO conversations (id, name, provider, model, system_prompt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, conversation.name, conversation.provider, conversation.model, conversation.systemPrompt, conversation.createdAt || now, now]);
            }
            // Insert messages
            for (const msg of conversation.messages) {
                const msgId = msg.id || crypto.randomUUID();
                const tokens = msg.tokens ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                db.run(`INSERT OR IGNORE INTO messages (id, conversation_id, role, content, tokens_prompt, tokens_completion, tokens_total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [msgId, id, msg.role, msg.content, tokens.prompt_tokens, tokens.completion_tokens, tokens.total_tokens, msg.timestamp]);
            }
            this.persist();
            return id;
        }
        catch (err) {
            throw new Error(`Failed to save conversation: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    loadConversation(id) {
        try {
            const row = this.queryOne('SELECT * FROM conversations WHERE id = ?', [id]);
            if (!row)
                return null;
            const messageRows = this.queryAll('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [id]);
            const messages = messageRows.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp,
                tokens: {
                    prompt_tokens: m.tokens_prompt ?? 0,
                    completion_tokens: m.tokens_completion ?? 0,
                    total_tokens: m.tokens_total ?? 0,
                },
            }));
            return {
                id: row.id,
                name: row.name,
                provider: row.provider,
                model: row.model,
                systemPrompt: row.system_prompt,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                messages,
            };
        }
        catch {
            return null;
        }
    }
    listConversations(limit = 20, offset = 0) {
        try {
            const rows = this.queryAll('SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?', [limit, offset]);
            return rows.map((row) => ({
                id: row.id,
                name: row.name,
                provider: row.provider,
                model: row.model,
                systemPrompt: row.system_prompt,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                messages: [],
            }));
        }
        catch {
            return [];
        }
    }
    searchConversations(query) {
        try {
            const searchTerm = `%${query}%`;
            const rows = this.queryAll(`SELECT DISTINCT c.id, c.name, c.provider, c.model, c.system_prompt, c.created_at, c.updated_at
         FROM conversations c
         INNER JOIN messages m ON m.conversation_id = c.id
         WHERE m.content LIKE ?
         ORDER BY c.updated_at DESC
         LIMIT 50`, [searchTerm]);
            return rows.map((row) => ({
                id: row.id,
                name: row.name,
                provider: row.provider,
                model: row.model,
                systemPrompt: row.system_prompt,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                messages: [],
            }));
        }
        catch {
            return [];
        }
    }
    deleteConversation(id) {
        try {
            const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);
            if (!existing)
                return false;
            this.ensureReady().run('DELETE FROM messages WHERE conversation_id = ?', [id]);
            this.ensureReady().run('DELETE FROM conversations WHERE id = ?', [id]);
            this.persist();
            return true;
        }
        catch {
            return false;
        }
    }
    updateConversation(id, updates) {
        try {
            const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);
            if (!existing)
                return false;
            const setClauses = [];
            const values = [];
            if (updates.name !== undefined) {
                setClauses.push('name = ?');
                values.push(updates.name);
            }
            if (updates.provider !== undefined) {
                setClauses.push('provider = ?');
                values.push(updates.provider);
            }
            if (updates.model !== undefined) {
                setClauses.push('model = ?');
                values.push(updates.model);
            }
            if (updates.systemPrompt !== undefined) {
                setClauses.push('system_prompt = ?');
                values.push(updates.systemPrompt);
            }
            setClauses.push('updated_at = ?');
            values.push(updates.updatedAt ?? Date.now());
            if (setClauses.length === 0)
                return true;
            const sql = `UPDATE conversations SET ${setClauses.join(', ')} WHERE id = ?`;
            values.push(id);
            this.ensureReady().run(sql, values);
            this.persist();
            return true;
        }
        catch {
            return false;
        }
    }
    getTotalCount() {
        try {
            const row = this.queryOne('SELECT COUNT(*) as count FROM conversations');
            return row?.count ?? 0;
        }
        catch {
            return 0;
        }
    }
    close() {
        try {
            if (this.db) {
                this.persist();
                this.db.close();
                this.db = null;
            }
        }
        catch {
            // Ignore close errors
        }
    }
}
export const historyStore = new HistoryStoreImpl();
//# sourceMappingURL=history.js.map