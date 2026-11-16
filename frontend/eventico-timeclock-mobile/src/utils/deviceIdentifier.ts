import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const STORAGE_KEY = 'eventico.device.identifier';

const isLikelyPlaceholder = (value: string | null | undefined) => {
  if (!value) {
    return true;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  const appId = Application.applicationId ?? '';
  if (trimmed === appId) {
    return true;
  }
  const anonymousPrefix = 'com.anonymous.';
  return trimmed.startsWith(anonymousPrefix);
};

const first = <T>(...values: (T | null | undefined)[]) => {
  for (const value of values) {
    if (value) {
      return value;
    }
  }
  return null;
};

async function generateFallbackId() {
  try {
    if (typeof Crypto.randomUUID === 'function') {
      return Crypto.randomUUID();
    }
  } catch {}

  try {
    const bytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {}

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function getNativeIdentifier() {
  const getters: (() => Promise<string | null>)[] = [];

  if (Platform.OS === 'android' && typeof Application.getAndroidId === 'function') {
    getters.push(async () => {
      try {
        return Application.getAndroidId() || null;
      } catch {
        return null;
      }
    });
  }

  if (Platform.OS === 'ios' && typeof Application.getIosIdForVendorAsync === 'function') {
    getters.push(async () => {
      try {
        return (await Application.getIosIdForVendorAsync()) || null;
      } catch {
        return null;
      }
    });
  }

  for (const getter of getters) {
    const value = await getter();
    if (value) {
      return value;
    }
  }

  try {
    const fallback = first(
      Platform.OS === 'android' ? Application.getAndroidId() : null,
      Platform.OS === 'ios' ? await Application.getIosIdForVendorAsync() : null
    );
    if (fallback) {
      return fallback;
    }
  } catch {}

  return null;
}

export async function getDeviceIdentifier(): Promise<string> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (cached && !isLikelyPlaceholder(cached)) {
      return cached;
    }
  } catch {}

  const nativeId = await getNativeIdentifier();
  const identifier = !isLikelyPlaceholder(nativeId)
    ? nativeId!
    : await generateFallbackId();

  try {
    await AsyncStorage.setItem(STORAGE_KEY, identifier);
  } catch {}

  return identifier;
}
