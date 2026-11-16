import React, { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import ClockDisplay from '../src/components/timeclock/ClockDisplay';
import Keypad from '../src/components/timeclock/Keypad';
import PinDisplay from '../src/components/timeclock/PinDisplay';
import { validateUserByPin, recordPunch } from '../src/services/attendanceService';
import { checkPinStatus, checkGlobalStatus, recordPinFailure, recordPinSuccess } from '../src/services/attemptsService';
import { withTimeout } from '../src/utils/timeout';
import { getLastPunchAction, getUnsyncedDetail } from '../src/db/punchRepo';
import { syncUnsyncedPunches } from '../src/services/syncService';
import { AdminConfigModal } from '../src/components/admin/AdminConfigModal';
import {
  fetchCurrentLink,
  linkDeviceToProject,
  validateSecurityCode,
  LinkedDeviceDto,
} from '../src/services/linkingDeviceService';
import { getDeviceIdentifier } from '../src/utils/deviceIdentifier';
import { loadLinkedDevice, saveLinkedDevice } from '../src/storage/linkedDeviceStorage';

type RecentAction = {
  success: boolean;
  user: string;
  action: 'CLOCK_IN' | 'CLOCK_OUT';
  message: string;
};

type SyncSummary = {
  attempted?: number;
  synced?: number;
  failed?: number;
  error?: string | null;
  reauthRequired?: boolean;
};

const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export default function HomePage() {
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const baseDimension = Math.min(width, height);
  const scale = Math.min(Math.max(baseDimension / 375, 1), 1.2);
  const MAX_PIN_LENGTH = 4;
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<LinkedDeviceDto | null>(null);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [isAdminModalVisible, setAdminModalVisible] = useState(false);
  const settingsIconSize = useMemo(() => 22 * Math.min(scale, 1.2), [scale]);

  const serviceErrorToError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string') {
        return new Error(message);
      }
    }
    return new Error('Unexpected error');
  }, []);

  useEffect(() => {
    loadRecentActions();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadLinkedDevice();
        if (!cancelled && stored) {
          setLinkInfo((prev) => prev ?? stored);
        }
      } catch (error) {
        devLog('Failed to load linked device', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveLinkedDevice(linkInfo).catch((error) => {
      devLog('Failed to save linked device', error);
    });
  }, [linkInfo]);

  const loadRecentActions = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentActions');
      if (saved) {
        setRecentActions(JSON.parse(saved));
      }
    } catch (error: unknown) {
      devLog('Error loading recent actions:', error);
    }
  };

  const saveRecentActions = async (actions: RecentAction[]) => {
    try {
      await AsyncStorage.setItem('recentActions', JSON.stringify(actions));
    } catch (error: unknown) {
      devLog('Error saving recent actions:', error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadDeviceId = async () => {
      try {
        const id = await getDeviceIdentifier();
        if (!cancelled) {
          setDeviceId(id);
        }
      } catch (error) {
        if (__DEV__) {
          devLog('Failed to resolve device identifier', error);
        }
      }
    };
    loadDeviceId();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshLink = React.useCallback(async () => {
    if (!deviceId) {
      throw new Error('Device ID unavailable');
    }
    setIsLinkLoading(true);
    try {
      const info = await fetchCurrentLink(deviceId);
      setLinkInfo(info);
      return info;
    } catch (error) {
      throw serviceErrorToError(error);
    } finally {
      setIsLinkLoading(false);
    }
  }, [deviceId, serviceErrorToError]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    refreshLink().catch((error) => {
      devLog('Failed to refresh linked device', error);
    });
  }, [deviceId, refreshLink]);

  const handleValidateSecurityCode = React.useCallback(async (username: string, password: string) => {
    try {
      return await validateSecurityCode(username, password);
    } catch (error) {
      throw serviceErrorToError(error);
    }
  }, [serviceErrorToError]);

  const handleLinkDevice = React.useCallback(async (projectId: number) => {
    if (!deviceId) {
      throw new Error('Device ID unavailable');
    }
    try {
      const dto = await linkDeviceToProject({ projectId, deviceId });
      setLinkInfo(dto);
    } catch (error) {
      throw serviceErrorToError(error);
    }
  }, [deviceId, serviceErrorToError]);

  const handleDigitClick = (digit: string) => {
    if (pin.length < MAX_PIN_LENGTH) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin(pin + digit);
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPin('');
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin(pin.slice(0, -1));
    }
  };
  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const beforeList = await getUnsyncedDetail(1000);
      devLog('[SYNC] Unsynced before:', beforeList);
      let punchRes: SyncSummary | null = null;
      let syncError: string | null = null;
      const reauthPin = pin.length >= MAX_PIN_LENGTH ? pin : undefined;
      try {
        punchRes = await syncUnsyncedPunches({
          force: true,
          reauthPin,
          deviceId: deviceId ?? undefined,
        });
      } catch (error) {
        syncError = error instanceof Error ? error.message : 'Unexpected sync failure.';
      }
      const afterList = await getUnsyncedDetail(1000);
      devLog('[SYNC] Unsynced after:', afterList);
      const msg = `Attempted: ${beforeList.length}, Synced: ${punchRes?.synced ?? 0}, Remaining: ${afterList.length}`;
      const failed = Boolean(syncError || punchRes?.failed || punchRes?.error || punchRes?.reauthRequired);
      Toast.show({
        type: failed ? 'error' : 'success',
        text1: punchRes?.reauthRequired
          ? 'PIN re-authentication required'
          : failed ? 'Sync incomplete' : 'Sync complete',
        text2: syncError
          ? `${syncError} ${msg}`
          : punchRes?.error
            ? `${punchRes.error} ${msg}`
            : punchRes?.failed ? `Some punches remain queued. ${msg}` : msg,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to inspect queued punches',
        text2: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSyncing(false);
      setPin('');
    }
  };
  const handleSubmit = async (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    const now = Date.now();
    if (now - lastSubmitAt < 800) {
      // Debounce rapid taps
      return;
    }
    setLastSubmitAt(now);
    if (pin.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'Invalid PIN',
        text2: 'PIN must be at least 4 digits',
      });
      return;
    }

    // Rate-limit and lockout checks
    try {
      const [pinStatus, globalStatus] = await Promise.all([
        checkPinStatus(pin),
        checkGlobalStatus(),
      ]);
      if (pinStatus.locked) {
        const wait = Math.ceil(((pinStatus.lockedUntil || 0) - Date.now()) / 1000);
        Toast.show({ type: 'error', text1: 'Locked', text2: `Too many attempts. Try again in ${Math.max(1, wait)}s.` });
        return;
      }
      if (globalStatus.locked) {
        const wait = Math.ceil(((globalStatus.lockedUntil || 0) - Date.now()) / 1000);
        Toast.show({ type: 'error', text1: 'Please wait', text2: `Too many attempts. Try again in ${Math.max(1, wait)}s.` });
        return;
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to check PIN attempt limits',
        text2: error instanceof Error ? error.message : 'Please try again.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { user, pinVerifiedOnline } = await withTimeout(
        validateUserByPin(pin, deviceId || ''),
        10000,
        "Can't validate right now. User not stored locally and server unavailable."
      );
      const userId = String(user.id);
      // The integer timestamp is a UTC epoch instant.
      const ts = Date.now();

      // Local status check:
      // - Always block duplicate CLOCK_IN based on last local action
      // - Only block invalid CLOCK_OUT when online (allow queueing OUT offline)
      const lastAction = await getLastPunchAction(userId);
      if (action === 'CLOCK_IN' && lastAction === 'CLOCK_IN') {
        Toast.show({ type: 'error', text1: 'Already clocked in', text2: `${user.name} is already clocked in.` });
        return;
      }
      const netState = await NetInfo.fetch();
      const online = !!(netState.isConnected && netState.isInternetReachable !== false);
      if (online && deviceId) {
        try {
          setLinkInfo(await fetchCurrentLink(deviceId));
        } catch {
          // A cached punch remains queued if the link is temporarily unavailable.
        }
      }
      if (action === 'CLOCK_OUT' && online && lastAction !== 'CLOCK_IN') {
        Toast.show({ type: 'error', text1: 'Cannot clock out', text2: `${user.name} has not clocked in yet.` });
        return;
      }

      await recordPunch({ userId, action, ts });

      let message = action === 'CLOCK_IN' ? 'Clocked in (queued)' : 'Clocked out (queued)';
      if (!pinVerifiedOnline) {
        message = `${message} for ${user.name}; PIN not verified offline. Re-authenticate online to sync.`;
      }
      // Background sync will attempt this punch; no direct API call here to avoid duplicates

      const result: RecentAction = { success: true, user: user.name, action, message };
      const newActions = [result, ...recentActions].slice(0, 5);
      setRecentActions(newActions);
      saveRecentActions(newActions);

      Toast.show({
        type: 'success',
        text1: `${result.user}`,
        text2: result.message,
      });

      // Reset attempts for this PIN on success
      if (pinVerifiedOnline) {
        try { await recordPinSuccess(pin); } catch {}
      }

      setTimeout(() => {
        router.push({
          pathname: '/success',
          params: { user: result.user, action: result.action },
        });
      }, 300);
    } catch (error: unknown) {
      // Count as failure for lockout
      try { await recordPinFailure(pin); } catch {}
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Validation failed',
      });
    } finally {
      setIsLoading(false);
      setPin('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setAdminModalVisible(true)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="settings-outline" size={settingsIconSize} color="#f9fafb" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.contentWrapper}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isLandscape && styles.scrollContentLandscape,
              { paddingHorizontal: 20 * scale, paddingVertical: 10 * scale },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.mainContent, isLandscape && styles.mainContentLandscape]}>
              <View
                style={[
                  styles.infoColumn,
                  isLandscape && styles.infoColumnLandscape,
                  { paddingTop: isLandscape ? 12 : 0 },
                ]}
              >
                <View style={[styles.header, isLandscape && styles.headerLandscape, { marginBottom: 20 * scale }]}>
                  <Text style={[styles.title, { fontSize: 28 * scale }, isLandscape && styles.titleLandscape]}>Eventico Time Clock</Text>
                  <Text style={[styles.subtitle, { fontSize: 16 * scale }, isLandscape && styles.subtitleLandscape]}>Enter your PIN to clock in or out</Text>
                </View>

                <ClockDisplay />

                <View style={[styles.pinSection, isLandscape && styles.pinSectionLandscape, { marginVertical: 20 * scale }]}>
                  <PinDisplay pin={pin} maxLength={MAX_PIN_LENGTH} />
                </View>
              </View>

              <View
                style={[
                  styles.keypadColumn,
                  isLandscape && styles.keypadColumnLandscape,
                  { paddingTop: isLandscape ? 36 : 12 },
                ]}
              >
                <View style={[styles.keypadSection, { marginTop: (isLandscape ? 28 : 20) * scale }]}>
                  <Keypad
                    onDigitClick={handleDigitClick}
                    onClear={handleClear}
                    onBackspace={handleBackspace}
                    onClockIn={() => handleSubmit('CLOCK_IN')}
                    onClockOut={() => handleSubmit('CLOCK_OUT')}
                    disabled={isLoading}
                  />
                </View>

                <View style={[styles.devTools, isLandscape && styles.devToolsLandscape]}>
                  <TouchableOpacity style={styles.devButton} onPress={handleManualSync} disabled={isSyncing}>
                    <Text style={styles.devButtonText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <AdminConfigModal
        visible={isAdminModalVisible}
        onClose={() => setAdminModalVisible(false)}
        deviceId={deviceId}
        currentLink={linkInfo}
        isLinkLoading={isLinkLoading}
        onRefreshLink={async () => {
          await refreshLink();
        }}
        onValidate={handleValidateSecurityCode}
        onLink={handleLinkDevice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#111827',
    borderRadius: 9999,
    padding: 10,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scrollContentLandscape: {
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
  },
  mainContentLandscape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoColumn: {
    width: '100%',
  },
  infoColumnLandscape: {
    flex: 1,
    marginRight: 24,
    maxWidth: 420,
  },
  keypadColumn: {
    width: '100%',
    alignItems: 'center',
  },
  keypadColumnLandscape: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: 520,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLandscape: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  titleLandscape: {
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    width: '100%',
  },
  subtitleLandscape: {
    textAlign: 'left',
  },
  pinSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  pinSectionLandscape: {
    alignItems: 'flex-start',
  },
  keypadSection: {
    marginTop: 20,
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devTools: {
    marginTop: 24,
    alignItems: 'center',
  },
  devToolsLandscape: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  devButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  devButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
