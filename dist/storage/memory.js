// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — MemoryStore Implementation (sql.js — pure JS/WASM, no C++ build)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import initSqlJs from 'sql.js';
class MemoryStoreImpl {
    db = null;
    dbPath;
    ready;
    constructor() {
        const historyDir = path.join(os.homedir(), '.openshiba', 'history');
        // Ensure the directory exists
        if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir, { recursive: true });
        }
        this.dbPath = path.join(historyDir, 'memories.db');
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
            console.error('Failed to initialize memory database:', err);
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
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'fact',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_content ON memories(content);
    `);
        db.run(`
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
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
    add(content, category = 'fact') {
        const now = Date.now();
        const validCategories = ['fact', 'preference', 'context', 'instruction'];
        const cat = validCategories.includes(category) ? category : 'fact';
        try {
            const db = this.ensureReady();
            db.run(`INSERT INTO memories (content, category, created_at, updated_at) VALUES (?, ?, ?, ?)`, [content, cat, now, now]);
            // Retrieve the last inserted row id
            const row = this.queryOne('SELECT last_insert_rowid() as id');
            const id = row?.id ?? 0;
            this.persist();
            return id;
        }
        catch (err) {
            throw new Error(`Failed to add memory: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    get(id) {
        try {
            const row = this.queryOne('SELECT * FROM memories WHERE id = ?', [id]);
            if (!row)
                return null;
            return {
                id: row.id,
                content: row.content,
                category: row.category,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
        }
        catch {
            return null;
        }
    }
    getAll(limit = 100) {
        try {
            const rows = this.queryAll('SELECT * FROM memories ORDER BY created_at DESC LIMIT ?', [limit]);
            return rows.map((row) => ({
                id: row.id,
                content: row.content,
                category: row.category,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));
        }
        catch {
            return [];
        }
    }
    search(query) {
        try {
            const searchTerm = `%${query}%`;
            const rows = this.queryAll(`SELECT * FROM memories WHERE content LIKE ? ORDER BY created_at DESC LIMIT 50`, [searchTerm]);
            return rows.map((row) => ({
                id: row.id,
                content: row.content,
                category: row.category,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));
        }
        catch {
            return [];
        }
    }
    delete(id) {
        try {
            const existing = this.queryOne('SELECT id FROM memories WHERE id = ?', [id]);
            if (!existing)
                return false;
            this.ensureReady().run('DELETE FROM memories WHERE id = ?', [id]);
            this.persist();
            return true;
        }
        catch {
            return false;
        }
    }
    clear() {
        try {
            this.ensureReady().run('DELETE FROM memories');
            this.persist();
            return true;
        }
        catch {
            return false;
        }
    }
    getCount() {
        try {
            const row = this.queryOne('SELECT COUNT(*) as count FROM memories');
            return row?.count ?? 0;
        }
        catch {
            return 0;
        }
    }
    formatForPrompt(limit = 50) {
        const memories = this.getAll(limit);
        if (memories.length === 0) {
            return '';
        }
        const lines = ['[Memories]'];
        for (let i = 0; i < memories.length; i++) {
            lines.push(`${i + 1}. ${memories[i].content}`);
        }
        return lines.join('\n');
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
export const memoryStore = new MemoryStoreImpl();
//# sourceMappingURL=memory.js.map