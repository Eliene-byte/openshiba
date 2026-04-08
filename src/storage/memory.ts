// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — MemoryStore Implementation (sql.js — pure JS/WASM, no C++ build)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import type { MemoryStore, MemoryEntry } from '../types.js';

class MemoryStoreImpl implements MemoryStore {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private ready: Promise<void>;

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
      console.error('Failed to initialize memory database:', err);
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

  add(content: string, category: string = 'fact'): number {
    const now = Date.now();
    const validCategories = ['fact', 'preference', 'context', 'instruction'];
    const cat = validCategories.includes(category) ? category : 'fact';

    try {
      const db = this.ensureReady();
      db.run(
        `INSERT INTO memories (content, category, created_at, updated_at) VALUES (?, ?, ?, ?)`,
        [content, cat, now, now]
      );

      // Retrieve the last inserted row id
      const row = this.queryOne('SELECT last_insert_rowid() as id');
      const id = (row?.id as number) ?? 0;

      this.persist();
      return id;
    } catch (err) {
      throw new Error(`Failed to add memory: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  get(id: number): MemoryEntry | null {
    try {
      const row = this.queryOne('SELECT * FROM memories WHERE id = ?', [id]);
      if (!row) return null;

      return {
        id: row.id as number,
        content: row.content as string,
        category: row.category as MemoryEntry['category'],
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      };
    } catch {
      return null;
    }
  }

  getAll(limit: number = 100): MemoryEntry[] {
    try {
      const rows = this.queryAll(
        'SELECT * FROM memories ORDER BY created_at DESC LIMIT ?',
        [limit]
      );

      return rows.map((row) => ({
        id: row.id as number,
        content: row.content as string,
        category: row.category as MemoryEntry['category'],
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch {
      return [];
    }
  }

  search(query: string): MemoryEntry[] {
    try {
      const searchTerm = `%${query}%`;

      const rows = this.queryAll(
        `SELECT * FROM memories WHERE content LIKE ? ORDER BY created_at DESC LIMIT 50`,
        [searchTerm]
      );

      return rows.map((row) => ({
        id: row.id as number,
        content: row.content as string,
        category: row.category as MemoryEntry['category'],
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch {
      return [];
    }
  }

  delete(id: number): boolean {
    try {
      const existing = this.queryOne('SELECT id FROM memories WHERE id = ?', [id]);
      if (!existing) return false;

      this.ensureReady().run('DELETE FROM memories WHERE id = ?', [id]);
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      this.ensureReady().run('DELETE FROM memories');
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  getCount(): number {
    try {
      const row = this.queryOne('SELECT COUNT(*) as count FROM memories');
      return (row?.count as number) ?? 0;
    } catch {
      return 0;
    }
  }

  formatForPrompt(limit: number = 50): string {
    const memories = this.getAll(limit);

    if (memories.length === 0) {
      return '';
    }

    const lines: string[] = ['[Memories]'];
    for (let i = 0; i < memories.length; i++) {
      lines.push(`${i + 1}. ${memories[i].content}`);
    }

    return lines.join('\n');
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

export const memoryStore = new MemoryStoreImpl();
