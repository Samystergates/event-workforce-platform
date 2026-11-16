import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const PinDisplay = ({ pin, maxLength = 6 }) => {
  const { width, height } = useWindowDimensions();
  const base = Math.min(width, height);
  const scale = Math.min(Math.max(base / 375, 1), 1.2);
  const dots = [];

  for (let i = 0; i < maxLength; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: 16 * scale,
            height: 16 * scale,
            borderRadius: 8 * scale,
            marginHorizontal: 8 * scale,
          },
          i < pin.length && styles.dotFilled,
        ]}
      />
    );
  }

  return (
    <View style={[styles.container, { padding: 20 * scale }]}>
      <Text style={[styles.label, { fontSize: 14 * scale, marginBottom: 10 * scale }]}>Enter PIN</Text>
      <View style={styles.dotsContainer}>{dots}</View>
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  dotFilled: {
    backgroundColor: '#3b82f6',
  },
});

export default PinDisplay;
