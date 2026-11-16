export type QueuedPunch = {
  local_id: number;
  user_id: string;
  action: string;
  ts: number;
};

export type PunchSyncResult = {
  attempted: number;
  synced: number;
  failed: number;
  error: string | null;
  reauthRequired: boolean;
  sessionExpired?: boolean;
};

export function syncQueuedPunchesForUser(
  rows: QueuedPunch[],
  options: {
    userId: string | null;
    sendPunch: (row: QueuedPunch) => Promise<{ id?: string }>;
    markSynced: (localId: number, remoteId?: string) => Promise<void>;
  }
): Promise<PunchSyncResult>;
