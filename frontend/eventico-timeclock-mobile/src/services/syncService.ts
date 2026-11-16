import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedPunches, markPunchSynced } from '../db/punchRepo';
import { upsertUser } from '../db/userRepo';
import { timeclockService } from './timeclockService';
import { retryWithBackoff } from '../utils/retry';
import { loadLinkedDevice } from '../storage/linkedDeviceStorage';
import { clearAccessToken, getAccessToken, getActiveUserId } from '../storage/authSession';
import { syncQueuedPunchesForUser, type PunchSyncResult } from './punchQueueSync.mjs';

// Ensure only one sync runs at a time to prevent duplicate sends
let currentSyncPromise: Promise<PunchSyncResult> | null = null;

export async function syncUnsyncedPunches(opts?: { force?: boolean; reauthPin?: string; deviceId?: string }) {
  if (currentSyncPromise) {
    return currentSyncPromise;
  }

  currentSyncPromise = (async () => {
    let list;
    try {
      list = await getUnsyncedPunches(100);
    } catch {
      return { attempted: 0, synced: 0, failed: 0, error: 'Punch storage is unavailable.', reauthRequired: false };
    }
    if (list.length === 0) {
      return { attempted: 0, synced: 0, failed: 0, error: null, reauthRequired: false };
    }

    const net = await NetInfo.fetch();
    if (!net.isConnected || net.isInternetReachable === false) {
      if (!opts?.force) return { attempted: 0, synced: 0, failed: 0, error: null, reauthRequired: false };
      return {
        attempted: list.length,
        synced: 0,
        failed: list.length,
        error: 'Reconnect to the internet to sync. Queued punches are retained.',
        reauthRequired: Boolean(opts.reauthPin),
      };
    }

    let userId: string | null;
    if (opts?.reauthPin) {
      if (!opts.deviceId) {
        return {
          attempted: list.length,
          synced: 0,
          failed: list.length,
          error: 'Device ID unavailable; queued punches are retained.',
          reauthRequired: true,
        };
      }
      try {
        const verification = await timeclockService.verifyUser(opts.reauthPin, opts.deviceId);
        const user = verification.user;
        userId = String(user.id);
        await upsertUser({
          id: userId,
          name: user.name,
          spId: user.spId == null ? null : String(user.spId),
        });
      } catch (error: any) {
        return {
          attempted: list.length,
          synced: 0,
          failed: list.length,
          error: error?.message || 'PIN verification failed. Queued punches are retained.',
          reauthRequired: true,
        };
      }
    } else {
      const token = await getAccessToken();
      userId = token ? await getActiveUserId() : null;
      if (!userId) {
        return {
          attempted: list.length,
          synced: 0,
          failed: list.length,
          error: 'Enter the PIN online and tap Sync Now to re-authenticate. Queued punches are retained.',
          reauthRequired: true,
        };
      }
    }

    const currentLink = await loadLinkedDevice();
    if (!currentLink?.deviceId) {
      return {
        attempted: list.length,
        synced: 0,
        failed: list.length,
        error: 'This device is not linked to a project. Queued punches are retained.',
        reauthRequired: false,
      };
    }

    const result = await syncQueuedPunchesForUser(list, {
      userId,
      sendPunch: (row) => retryWithBackoff(
        () => timeclockService.punchWithMeta({
          action: row.action,
          ts: row.ts,
          userId: row.user_id,
          deviceLink: currentLink,
        }),
        { retries: 2, baseDelayMs: 800, maxDelayMs: 5000 }
      ),
      markSynced: markPunchSynced,
    });
    if (result.sessionExpired) {
      await clearAccessToken();
    }
    return result;
  })();

  try {
    return await currentSyncPromise;
  } finally {
    currentSyncPromise = null;
  }
}
