export async function syncQueuedPunchesForUser(rows, { userId, sendPunch, markSynced }) {
  if (!userId) {
    return {
      attempted: rows.length,
      synced: 0,
      failed: rows.length,
      error: 'Re-authenticate online with a PIN to sync queued punches.',
      reauthRequired: true,
    };
  }

  let synced = 0;
  let failed = 0;
  let error = null;
  for (const row of rows) {
    if (String(row.user_id) !== String(userId)) {
      failed++;
      error = error || 'Some queued punches belong to another user. Re-authenticate as that user online to sync them.';
      continue;
    }

    try {
      const response = await sendPunch(row);
      await markSynced(row.local_id, response?.id);
      synced++;
    } catch (failure) {
      failed++;
      error = error || failure?.message || 'One or more punches could not be synchronized.';
      if (failure?.status === 401) {
        return {
          attempted: rows.length,
          synced,
          failed: rows.length - synced,
          error: 'The timeclock session expired. Enter the PIN online and tap Sync Now; queued punches are retained.',
          reauthRequired: true,
          sessionExpired: true,
        };
      }
    }
  }

  return {
    attempted: rows.length,
    synced,
    failed,
    error,
    reauthRequired: rows.length > synced && rows.some((row) => String(row.user_id) !== String(userId)),
  };
}
