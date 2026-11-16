import { getDb } from './database';

export type User = { id: string; name: string; spId: string | null; updated_at: number };

export async function upsertUser(user: { id: string; name: string; spId?: string | null }) {
  const db = await getDb();
  const ts = Date.now();
  await db.runAsync(
    `INSERT INTO users (id, name, pin, sp_id, updated_at)
     VALUES (?, ?, '', ?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name, pin='', sp_id=excluded.sp_id, updated_at=excluded.updated_at`,
    [user.id, user.name, user.spId ?? null, ts]
  );
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<User>(
    'SELECT id, name, sp_id as spId, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return row ?? null;
}
