import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LinkedDeviceDto } from '../services/linkingDeviceService';

const KEY = 'eventico.device.linked';

function serialise(dto: LinkedDeviceDto | null): string | null {
  if (!dto) {
    return null;
  }
  try {
    return JSON.stringify(dto);
  } catch {
    return null;
  }
}

export async function saveLinkedDevice(dto: LinkedDeviceDto | null) {
  const serialised = serialise(dto);
  try {
    if (!serialised) {
      await AsyncStorage.removeItem(KEY);
    } else {
      await AsyncStorage.setItem(KEY, serialised);
    }
  } catch {}
}

export async function loadLinkedDevice(): Promise<LinkedDeviceDto | null> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as LinkedDeviceDto & { jobId?: number | null };
    if (parsed && parsed.projectId == null && parsed.jobId != null) {
      return { ...parsed, projectId: parsed.jobId };
    }
    return parsed;
  } catch {
    return null;
  }
}
