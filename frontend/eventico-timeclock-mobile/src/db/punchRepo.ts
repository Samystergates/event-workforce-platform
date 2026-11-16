import { getDb } from './database';

export type Punch = {
  local_id?: number;
  user_id: string;
  action: 'CLOCK_IN' | 'CLOCK_OUT' | string;
  ts: number;
  synced: 0 | 1;
  remote_id?: string | null;
};

export async function insertPunch(p: Omit<Punch, 'local_id' | 'synced'> & { synced?: 0 | 1 }) {
  const db = await getDb();
  const synced = p.synced ?? 0;
  const result = await db.runAsync(
    `INSERT INTO punches (user_id, action, ts, synced, remote_id) VALUES (?, ?, ?, ?, NULL)`,
    [p.user_id, p.action, p.ts, synced]
  );
  return result.lastInsertRowId as number;
}

export async function getUnsyncedPunches(limit = 50) {
  const db = await getDb();
  const rows = await db.getAllAsync<Punch & { local_id: number }>(
    `SELECT local_id, user_id, action, ts, synced, remote_id FROM punches WHERE synced = 0 ORDER BY ts ASC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getUnsyncedDetail(limit = 1000) {
  const db = await getDb();
  const rows = await db.getAllAsync<Punch>(
    `SELECT local_id, user_id, action, ts, synced, remote_id FROM punches WHERE synced = 0 ORDER BY ts ASC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getRecentPunches(limit = 50) {
  const db = await getDb();
  const rows = await db.getAllAsync<Punch>(
    `SELECT local_id, user_id, action, ts, synced, remote_id FROM punches ORDER BY ts DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function markPunchSynced(localId: number, remoteId?: string) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE punches SET synced = 1, remote_id = COALESCE(?, remote_id) WHERE local_id = ?`,
    [remoteId ?? null, localId]
  );
}

export async function getLastPunchAction(userId: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{ action: string }>(
    `SELECT action FROM punches WHERE user_id = ? ORDER BY ts DESC LIMIT 1`,
    [userId]
  );
  return row?.action ?? null;
}
