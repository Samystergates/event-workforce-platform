import NetInfo from '@react-native-community/netinfo';
import { getUserById, upsertUser, type User } from '../db/userRepo';
import { insertPunch } from '../db/punchRepo';
import { syncUnsyncedPunches } from './syncService';
import { timeclockService } from './timeclockService';
import { getActiveUserId } from '../storage/authSession';

export type ValidateResult = { user: User; pinVerifiedOnline: boolean };

export async function validateUserByPin(pin: string, deviceId: string): Promise<ValidateResult> {
  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) {
    const activeUserId = await getActiveUserId();
    const activeUser = activeUserId ? await getUserById(activeUserId) : null;
    if (activeUser) return { user: activeUser, pinVerifiedOnline: false };
    throw new Error('Connect and verify a PIN online before recording an offline punch.');
  }

  try {
    const res = await timeclockService.verifyUser(pin, deviceId) as { success?: boolean; accessToken?: string; user?: {
      id: string | number;
      name: string;
      spId?: string | number | null;
    }; message?: string };
    if (!res?.success || !res?.user || !res.accessToken) {
      throw new Error(res?.message || 'User not found');
    }
    const user = res.user as {
      id: string | number;
      name: string;
      spId?: string | number | null;
    };
    const spId = user.spId != null ? String(user.spId) : null;
    const normalizedUser: User = {
      id: String(user.id),
      name: user.name,
      spId,
      updated_at: Date.now(),
    };
    await upsertUser({ id: normalizedUser.id, name: normalizedUser.name, spId });
    return { user: normalizedUser, pinVerifiedOnline: true };
  } catch (err: unknown) {
    if ((err as any)?.status === 401) {
      throw new Error('Invalid PIN');
    }
    if (err instanceof Error) throw err;
    const message = (err as any)?.message || (err as any)?.error || 'Unable to verify PIN';
    throw new Error(message);
  }
}

export async function recordPunch({ userId, action, ts }: { userId: string; action: string; ts: number }) {
  // Insert immediately, unsynced
  const localId = await insertPunch({ user_id: userId, action, ts, synced: 0 });

  // If online, trigger the standard sync pipeline (non-blocking)
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      // Use the same code path as periodic/manual sync so metrics and payloads match
      syncUnsyncedPunches().catch(() => {});
    }
  } catch {}

  return localId;
}
