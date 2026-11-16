import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'eventico-timeclock-access-token';
const ACTIVE_USER_KEY = 'eventico-timeclock-active-user';
let webToken: string | null = null;

export async function saveAccessToken(token: string) {
  if (Platform.OS === 'web') {
    webToken = token;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, token);
}

export async function getAccessToken() {
  if (Platform.OS === 'web') return webToken;
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearAccessToken() {
  if (Platform.OS === 'web') {
    webToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function saveActiveUserId(userId: string) {
  await AsyncStorage.setItem(ACTIVE_USER_KEY, userId);
}

export async function getActiveUserId() {
  return AsyncStorage.getItem(ACTIVE_USER_KEY);
}
