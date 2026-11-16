import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React from 'react';
import { AppState, Platform, View } from 'react-native';
import { useAppResources } from '../src/hooks/useAppResources';
import NetInfo from '@react-native-community/netinfo';
import { registerBackgroundSync } from '../src/tasks/backgroundSync';
import { syncUnsyncedPunches } from '../src/services/syncService';
import { SQLiteProvider } from 'expo-sqlite';
import { applyMigrations, setDbFromProvider, isDbReady } from '../src/db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useAppResources();
  const isSyncingRef = React.useRef(false);

  const doSync = React.useCallback(async () => {
    if (!isDbReady() || isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      let punchesRes: Awaited<ReturnType<typeof syncUnsyncedPunches>> | null = null;
      try {
        punchesRes = await syncUnsyncedPunches();
      } catch {}
      if (__DEV__) {
        console.log('[SYNC] tick', {
          attempted: punchesRes?.attempted ?? 0,
          synced: punchesRes?.synced ?? 0,
        });
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  React.useEffect(() => {
    registerBackgroundSync();

    const netSub = NetInfo.addEventListener((state) => {
      if (state.isConnected && isDbReady()) {
        doSync();
      }
    });

    const intervalMs = 60 * 1000; // poll every 60s to catch backend restarts
    const intervalId = setInterval(() => {
      doSync();
    }, intervalMs);

    const appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') doSync();
    });

    return () => {
      netSub && netSub();
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [doSync]);

  const onLayout = React.useCallback(async () => {
    if (ready) {
      try {
        await SplashScreen.hideAsync();
      } catch {}

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const el = document.getElementById('app-loader');
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName={Platform.OS === 'web' ? ':memory:' : 'eventico_timeclock.db'}
        onInit={async (db) => {
          await applyMigrations(db);
          setDbFromProvider(db);
          try {
            await doSync();
          } catch {}
        }}
      >
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="success"
              options={{ title: 'Success', headerBackVisible: false, gestureEnabled: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
          <StatusBar style="dark" backgroundColor="#f3f4f6" />
        </View>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
