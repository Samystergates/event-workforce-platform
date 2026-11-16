import assert from 'node:assert/strict';
import test from 'node:test';
import { syncQueuedPunchesForUser } from './punchQueueSync.mjs';

test('expired session leaves queued punch unsynced and requests PIN re-authentication', async () => {
  const row = { local_id: 7, user_id: 'user-1', action: 'CLOCK_IN', ts: 123 };
  let markedSynced = false;
  const expired = Object.assign(new Error('Unauthorized'), { status: 401 });

  const result = await syncQueuedPunchesForUser([row], {
    userId: 'user-1',
    sendPunch: async () => { throw expired; },
    markSynced: async () => { markedSynced = true; },
  });

  assert.equal(markedSynced, false);
  assert.equal(result.synced, 0);
  assert.equal(result.failed, 1);
  assert.equal(result.reauthRequired, true);
  assert.equal(result.sessionExpired, true);
});

test('a session for another user cannot submit or mark a queued punch synced', async () => {
  const row = { local_id: 8, user_id: 'user-2', action: 'CLOCK_OUT', ts: 456 };
  let sent = false;
  let markedSynced = false;

  const result = await syncQueuedPunchesForUser([row], {
    userId: 'user-1',
    sendPunch: async () => { sent = true; return { id: 'remote-8' }; },
    markSynced: async () => { markedSynced = true; },
  });

  assert.equal(sent, false);
  assert.equal(markedSynced, false);
  assert.equal(result.synced, 0);
  assert.equal(result.failed, 1);
  assert.equal(result.reauthRequired, true);
});
