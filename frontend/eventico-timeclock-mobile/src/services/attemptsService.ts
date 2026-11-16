import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

type AttemptState = {
  count: number;
  firstAt: number; // window start
  lockedUntil?: number; // epoch ms
};

const ATTEMPTS_KEY = 'attempts_v1';
const GLOBAL_KEY = 'attempts_global_v1';

// Policy (tune as needed)
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5; // per PIN per window
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

// Optional global rate limit (defense-in-depth)
const GLOBAL_WINDOW_MS = 10 * 60 * 1000;
const GLOBAL_MAX_ATTEMPTS = 30;
const GLOBAL_LOCKOUT_MS = 60 * 1000; // 1 minute UI cooldown

async function loadMap(key: string): Promise<Record<string, AttemptState>> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

async function saveMap(key: string, map: Record<string, AttemptState>) {
  await AsyncStorage.setItem(key, JSON.stringify(map));
}

async function hashPin(pin: string) {
  // Avoid storing raw PIN; namespace the digest
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `PIN:${pin}`);
}

function isLocked(state?: AttemptState) {
  if (!state?.lockedUntil) return false;
  return Date.now() < state.lockedUntil;
}

function resetIfWindowExpired(state: AttemptState, now = Date.now(), windowMs = WINDOW_MS) {
  if (now - state.firstAt > windowMs) {
    state.count = 0;
    state.firstAt = now;
    delete state.lockedUntil;
  }
}

export async function checkPinStatus(pin: string) {
  const key = await hashPin(pin);
  const map = await loadMap(ATTEMPTS_KEY);
  const state = map[key];
  if (!state) return { locked: false, remaining: MAX_ATTEMPTS, lockedUntil: undefined as number | undefined };
  resetIfWindowExpired(state);
  return {
    locked: isLocked(state),
    remaining: Math.max(0, MAX_ATTEMPTS - (state.count || 0)),
    lockedUntil: state.lockedUntil,
  };
}

export async function recordPinFailure(pin: string) {
  const key = await hashPin(pin);
  const map = await loadMap(ATTEMPTS_KEY);
  const now = Date.now();
  let state = map[key];
  if (!state) state = { count: 0, firstAt: now };
  resetIfWindowExpired(state, now, WINDOW_MS);
  state.count = (state.count || 0) + 1;
  if (state.count >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_MS;
  }
  map[key] = state;
  await saveMap(ATTEMPTS_KEY, map);
  await recordGlobalFailure();
}

export async function recordPinSuccess(pin: string) {
  const key = await hashPin(pin);
  const map = await loadMap(ATTEMPTS_KEY);
  if (map[key]) {
    delete map[key];
    await saveMap(ATTEMPTS_KEY, map);
  }
  await clearGlobalIfWindowExpired();
}

async function recordGlobalFailure() {
  const map = await loadMap(GLOBAL_KEY);
  const now = Date.now();
  const key = 'device';
  let state = map[key];
  if (!state) state = { count: 0, firstAt: now };
  resetIfWindowExpired(state, now, GLOBAL_WINDOW_MS);
  state.count = (state.count || 0) + 1;
  if (state.count >= GLOBAL_MAX_ATTEMPTS) {
    state.lockedUntil = now + GLOBAL_LOCKOUT_MS;
  }
  map[key] = state;
  await saveMap(GLOBAL_KEY, map);
}

async function clearGlobalIfWindowExpired() {
  const map = await loadMap(GLOBAL_KEY);
  const key = 'device';
  const state = map[key];
  if (!state) return;
  resetIfWindowExpired(state, Date.now(), GLOBAL_WINDOW_MS);
  if (state.count === 0 && !state.lockedUntil) {
    delete map[key];
  }
  await saveMap(GLOBAL_KEY, map);
}

export async function checkGlobalStatus() {
  const map = await loadMap(GLOBAL_KEY);
  const state = map['device'];
  if (!state) return { locked: false, remaining: GLOBAL_MAX_ATTEMPTS, lockedUntil: undefined as number | undefined };
  resetIfWindowExpired(state, Date.now(), GLOBAL_WINDOW_MS);
  return {
    locked: isLocked(state),
    remaining: Math.max(0, GLOBAL_MAX_ATTEMPTS - (state.count || 0)),
    lockedUntil: state.lockedUntil,
  };
}
