import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const ClockDisplay = () => {
  const { width, height } = useWindowDimensions();
  const base = Math.min(width, height);
  const scale = Math.min(Math.max(base / 375, 1), 1.2);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { padding: 20 * scale, marginVertical: 10 * scale }]}>
      <Text style={[styles.time, { fontSize: 36 * scale }]}>{formatTime(currentTime)}</Text>
      <Text style={[styles.date, { fontSize: 16 * scale, marginTop: 5 * scale }]}>{formatDate(currentTime)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  date: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
  },
});

export default ClockDisplay;
