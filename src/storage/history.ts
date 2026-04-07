// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — HistoryStore Implementation (sql.js — pure JS/WASM, no C++ build)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import type { HistoryStore, Conversation, Message, TokenUsage } from '../types.js';

class HistoryStoreImpl implements HistoryStore {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private ready: Promise<void>;

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

  private async initDb(): Promise<void> {
    try {
      const SQL = await initSqlJs();

      // Load existing database from file if it exists
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } else {
        this.db = new SQL.Database();
      }

      this.runMigrations();
    } catch (err) {
      console.error('Failed to initialize history database:', err);
      this.db = null;
    }
  }

  private ensureReady(): SqlJsDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initDb() first.');
    }
    return this.db;
  }

  private runMigrations(): void {
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

  private persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch {
      // Ignore write errors
    }
  }

  private queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
    const db = this.ensureReady();
    try {
      const stmt = db.prepare(sql);
      const bindParams: Record<string, unknown> = {};
      for (let i = 0; i < params.length; i++) {
        bindParams[String(i + 1)] = params[i];
      }
      stmt.bind(bindParams);
      const rows: Record<string, unknown>[] = [];

      while (stmt.step()) {
        const row = stmt.getAsObject();
        rows.push(row);
      }

      stmt.free();
      return rows;
    } catch {
      return [];
    }
  }

  private queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | null {
    const db = this.ensureReady();
    try {
      const stmt = db.prepare(sql);
      const bindParams: Record<string, unknown> = {};
      for (let i = 0; i < params.length; i++) {
        bindParams[String(i + 1)] = params[i];
      }
      stmt.bind(bindParams);
      let row: Record<string, unknown> | null = null;

      if (stmt.step()) {
        row = stmt.getAsObject();
      }

      stmt.free();
      return row;
    } catch {
      return null;
    }
  }

  private runSql(sql: string, params: unknown[] = []): { changes: number } {
    const db = this.ensureReady();
    try {
      db.run(sql, params as unknown[]);
      // sql.js doesn't return changes directly, we track manually
      return { changes: 1 };
    } catch {
      return { changes: 0 };
    }
  }

  saveConversation(conversation: Conversation): string {
    const db = this.ensureReady();
    const id = conversation.id || crypto.randomUUID();
    const now = Date.now();

    try {
      // Check if conversation exists
      const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);

      if (existing) {
        db.run(
          `UPDATE conversations SET name = ?, provider = ?, model = ?, system_prompt = ?, updated_at = ? WHERE id = ?`,
          [conversation.name, conversation.provider, conversation.model, conversation.systemPrompt, now, id]
        );
        // Delete old messages
        db.run('DELETE FROM messages WHERE conversation_id = ?', [id]);
      } else {
        db.run(
          `INSERT INTO conversations (id, name, provider, model, system_prompt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, conversation.name, conversation.provider, conversation.model, conversation.systemPrompt, conversation.createdAt || now, now]
        );
      }

      // Insert messages
      for (const msg of conversation.messages) {
        const msgId = msg.id || crypto.randomUUID();
        const tokens: TokenUsage = msg.tokens ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        db.run(
          `INSERT OR IGNORE INTO messages (id, conversation_id, role, content, tokens_prompt, tokens_completion, tokens_total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [msgId, id, msg.role, msg.content, tokens.prompt_tokens, tokens.completion_tokens, tokens.total_tokens, msg.timestamp]
        );
      }

      this.persist();
      return id;
    } catch (err) {
      throw new Error(`Failed to save conversation: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  loadConversation(id: string): Conversation | null {
    try {
      const row = this.queryOne('SELECT * FROM conversations WHERE id = ?', [id]);
      if (!row) return null;

      const messageRows = this.queryAll(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [id]
      );

      const messages: Message[] = messageRows.map((m) => ({
        id: m.id as string,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content as string,
        timestamp: m.timestamp as number,
        tokens: {
          prompt_tokens: (m.tokens_prompt as number) ?? 0,
          completion_tokens: (m.tokens_completion as number) ?? 0,
          total_tokens: (m.tokens_total as number) ?? 0,
        },
      }));

      return {
        id: row.id as string,
        name: row.name as string,
        provider: row.provider as string,
        model: row.model as string,
        systemPrompt: row.system_prompt as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
        messages,
      };
    } catch {
      return null;
    }
  }

  listConversations(limit: number = 20, offset: number = 0): Conversation[] {
    try {
      const rows = this.queryAll(
        'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      return rows.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        provider: row.provider as string,
        model: row.model as string,
        systemPrompt: row.system_prompt as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
        messages: [],
      }));
    } catch {
      return [];
    }
  }

  searchConversations(query: string): Conversation[] {
    try {
      const searchTerm = `%${query}%`;

      const rows = this.queryAll(
        `SELECT DISTINCT c.id, c.name, c.provider, c.model, c.system_prompt, c.created_at, c.updated_at
         FROM conversations c
         INNER JOIN messages m ON m.conversation_id = c.id
         WHERE m.content LIKE ?
         ORDER BY c.updated_at DESC
         LIMIT 50`,
        [searchTerm]
      );

      return rows.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        provider: row.provider as string,
        model: row.model as string,
        systemPrompt: row.system_prompt as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
        messages: [],
      }));
    } catch {
      return [];
    }
  }

  deleteConversation(id: string): boolean {
    try {
      const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);
      if (!existing) return false;

      this.ensureReady().run('DELETE FROM messages WHERE conversation_id = ?', [id]);
      this.ensureReady().run('DELETE FROM conversations WHERE id = ?', [id]);
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  updateConversation(id: string, updates: Partial<Conversation>): boolean {
    try {
      const existing = this.queryOne('SELECT id FROM conversations WHERE id = ?', [id]);
      if (!existing) return false;

      const setClauses: string[] = [];
      const values: unknown[] = [];

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

      if (setClauses.length === 0) return true;

      const sql = `UPDATE conversations SET ${setClauses.join(', ')} WHERE id = ?`;
      values.push(id);

      this.ensureReady().run(sql, values);
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  getTotalCount(): number {
    try {
      const row = this.queryOne('SELECT COUNT(*) as count FROM conversations');
      return (row?.count as number) ?? 0;
    } catch {
      return 0;
    }
  }

  close(): void {
    try {
      if (this.db) {
        this.persist();
        this.db.close();
        this.db = null;
      }
    } catch {
      // Ignore close errors
    }
  }
}

export const historyStore = new HistoryStoreImpl();
