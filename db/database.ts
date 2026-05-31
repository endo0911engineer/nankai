import * as SQLite from "expo-sqlite";
import { Counter, Memory } from "../types";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nankai.db");
    await initDb(db);
  }
  return db;
}

const SCHEMA_VERSION = 3;

async function initDb(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync("PRAGMA journal_mode = WAL");

  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const version = row?.user_version ?? 0;

  if (version < 2) {
    await db.runAsync("DROP TABLE IF EXISTS memories");
    await db.runAsync("DROP TABLE IF EXISTS counters");
    await db.runAsync(`
      CREATE TABLE counters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_name TEXT NOT NULL,
        event_name TEXT NOT NULL,
        frequency_per_year REAL NOT NULL,
        birth_year INTEGER NOT NULL,
        person_lifespan INTEGER NOT NULL DEFAULT 85,
        last_met_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await db.runAsync(`
      CREATE TABLE memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        counter_id INTEGER NOT NULL,
        photo_uri TEXT,
        memo TEXT,
        met_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE
      )
    `);
    await db.runAsync("PRAGMA user_version = 2");
  }

  if (version < 3) {
    await db.runAsync("ALTER TABLE counters ADD COLUMN mode TEXT NOT NULL DEFAULT 'lifespan'");
    await db.runAsync("ALTER TABLE counters ADD COLUMN end_date TEXT");
    await db.runAsync("PRAGMA user_version = 3");
  }
}

export async function getAllCounters(): Promise<Counter[]> {
  const db = await getDb();
  return db.getAllAsync<Counter>("SELECT * FROM counters ORDER BY created_at DESC");
}

export async function getCounter(id: number): Promise<Counter | null> {
  const db = await getDb();
  return db.getFirstAsync<Counter>("SELECT * FROM counters WHERE id = ?", [id]);
}

export async function createCounter(data: Omit<Counter, "id" | "created_at">): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO counters (person_name, event_name, frequency_per_year, birth_year, person_lifespan, mode, end_date, last_met_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.person_name, data.event_name, data.frequency_per_year, data.birth_year, data.person_lifespan, data.mode ?? "lifespan", data.end_date ?? null, data.last_met_at ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateCounter(id: number, data: Partial<Omit<Counter, "id" | "created_at">>): Promise<void> {
  const db = await getDb();
  const entries = Object.entries(data);
  if (entries.length === 0) return;
  const fields = entries.map(([k]) => `${k} = ?`).join(", ");
  const values: (string | number | null)[] = [
    ...entries.map(([, v]) => (v === undefined ? null : v) as string | number | null),
    id,
  ];
  await db.runAsync(`UPDATE counters SET ${fields} WHERE id = ?`, values);
}

export async function deleteCounter(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM counters WHERE id = ?", [id]);
}

export async function getMemories(counterId: number): Promise<Memory[]> {
  const db = await getDb();
  return db.getAllAsync<Memory>(
    "SELECT * FROM memories WHERE counter_id = ? ORDER BY met_at DESC",
    [counterId]
  );
}

export async function createMemory(data: Omit<Memory, "id" | "created_at">): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO memories (counter_id, photo_uri, memo, met_at) VALUES (?, ?, ?, ?)`,
    [data.counter_id, data.photo_uri ?? null, data.memo ?? null, data.met_at]
  );
  return result.lastInsertRowId;
}

export async function deleteMemory(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM memories WHERE id = ?", [id]);
}
