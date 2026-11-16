import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export type DB = SQLite.SQLiteDatabase;

let dbInstance: DB | null = null;

let migrationsApplied = false;

export async function applyMigrations(db: DB) {
  if (migrationsApplied) return;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      sp_id TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS punches (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      ts INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      remote_id TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_punches_sync ON punches(synced);
    CREATE INDEX IF NOT EXISTS idx_punches_user_ts ON punches(user_id, ts);
  `);
  try {
    await db.execAsync('ALTER TABLE users ADD COLUMN sp_id TEXT');
  } catch {}
  await db.execAsync("UPDATE users SET pin = '' WHERE pin <> ''");
  await db.execAsync('DROP INDEX IF EXISTS idx_users_pin');

  migrationsApplied = true;
}

export function setDbFromProvider(db: DB) {
  dbInstance = db;
}

export async function getDb(): Promise<DB> {
  if (dbInstance) return dbInstance;
  if (Platform.OS === 'web') {
    throw new Error('SQLite database not initialized. Ensure <SQLiteProvider> is mounted.');
  }
  const db = await SQLite.openDatabaseAsync('eventico_timeclock.db');
  await applyMigrations(db);
  dbInstance = db;
  return db;
}

export function isDbReady() {
  return !!dbInstance;
}
