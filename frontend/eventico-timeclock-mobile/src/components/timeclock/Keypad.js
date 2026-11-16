import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Keypad = ({
  onDigitClick,
  onClear,
  onBackspace,
  onClockIn,
  onClockOut,
  disabled = false,
}) => {
  const { width, height } = useWindowDimensions();
  const base = Math.min(width, height);
  const scale = Math.min(Math.max(base / 375, 1), 1.2);
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View style={styles.container}>
      <View style={styles.digitGrid}>
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[
              styles.digitButton,
              { height: 70 * scale, marginBottom: 12 * scale },
              disabled && styles.disabled,
            ]}
            onPress={() => onDigitClick(digit)}
            disabled={disabled}
          >
            <Text style={[styles.digitText, { fontSize: 24 * scale }]}>{digit}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.digitButton,
            { height: 70 * scale, marginBottom: 12 * scale },
            styles.clearButton,
            disabled && styles.disabled,
          ]}
          onPress={onClear}
          disabled={disabled}
        >
          <Text style={[styles.clearText, { fontSize: 16 * scale }]}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.digitButton,
            { height: 70 * scale, marginBottom: 12 * scale },
            disabled && styles.disabled,
          ]}
          onPress={() => onDigitClick('0')}
          disabled={disabled}
        >
          <Text style={[styles.digitText, { fontSize: 24 * scale }]}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.digitButton,
            { height: 70 * scale, marginBottom: 12 * scale },
            styles.backspaceButton,
            disabled && styles.disabled,
          ]}
          onPress={onBackspace}
          disabled={disabled}
        >
          <Ionicons name="backspace" size={24 * scale} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { height: 60 * scale },
            styles.clockInButton,
            disabled && styles.disabled,
          ]}
          onPress={onClockIn}
          disabled={disabled}
        >
          <Text style={[styles.actionButtonText, { fontSize: 18 * scale }]}>Clock In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { height: 60 * scale },
            styles.clockOutButton,
            disabled && styles.disabled,
          ]}
          onPress={onClockOut}
          disabled={disabled}
        >
          <Text style={[styles.actionButtonText, { fontSize: 18 * scale }]}>Clock Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  digitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  digitButton: {
    width: '30%',
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  digitText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearButton: {
    backgroundColor: '#6b7280',
  },
  clearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backspaceButton: {
    backgroundColor: '#f97316',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clockInButton: {
    backgroundColor: '#10b981',
  },
  clockOutButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Keypad;
