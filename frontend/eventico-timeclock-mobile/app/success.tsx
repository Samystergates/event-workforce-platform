import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

type ActionType = 'CLOCK_IN' | 'CLOCK_OUT' | string | undefined;

export default function SuccessScreen() {
  const { user, action } = useLocalSearchParams<{ user?: string; action?: ActionType }>();
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.replace('/');
    }
  }, [countdown]);

  const getActionDetails = () => {
    switch (action) {
      case 'CLOCK_IN':
        return {
          icon: 'log-in' as const,
          color: '#10b981',
          title: 'Clocked In Successfully',
          message: 'Have a productive day!',
        };
      case 'CLOCK_OUT':
        return {
          icon: 'log-out' as const,
          color: '#ef4444',
          title: 'Clocked Out Successfully',
          message: 'See you next time!',
        };
      default:
        return {
          icon: 'checkmark-circle' as const,
          color: '#10b981',
          title: 'Action Completed',
          message: 'Your action has been recorded.',
        };
    }
  };

  const details = getActionDetails();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={details.icon} size={80} color={details.color} />
        </View>

        <Text style={[styles.title, { color: details.color }]}>
          {details.title}
        </Text>

        {!!user && <Text style={styles.userName}>{user}</Text>}
        <Text style={styles.message}>{details.message}</Text>

        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            Returning to time clock in {countdown}...
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Back to Time Clock</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,

    textAlign: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,

    textAlign: 'center',
    width: '100%',
  },
  countdownContainer: {
    marginBottom: 30,
  },
  countdownText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
