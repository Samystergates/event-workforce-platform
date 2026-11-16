import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinkedDeviceDto } from '../../services/linkingDeviceService';

interface Props {
  visible: boolean;
  onClose: () => void;
  deviceId: string | null;
  currentLink: LinkedDeviceDto | null;
  isLinkLoading: boolean;
  onRefreshLink: () => Promise<void>;
  onValidate: (username: string, password: string) => Promise<boolean>;
  onLink: (projectId: number) => Promise<void>;
}

const formatUpdatedAt = (value: string | null) => {
  if (!value) return 'Unknown';
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  } catch {}
  return value;
};

export function AdminConfigModal({
  visible,
  onClose,
  deviceId,
  currentLink,
  isLinkLoading,
  onRefreshLink,
  onValidate,
  onLink,
}: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const securityInputRef = useRef<TextInput | null>(null);

  const isLinkKnown = Boolean(currentLink && currentLink.projectId != null);
  const projectIdSummary = useMemo(() => {
    if (!currentLink) {
      return 'No link established.';
    }
    const parts = [`Project ID: ${currentLink.projectId ?? 'None'}`];
    parts.push(`Updated: ${formatUpdatedAt(currentLink.updatedAt)}`);
    if (currentLink.isExpired) {
      parts.push('Status: Expired');
    }
    return parts.join('\n');
  }, [currentLink]);

  useEffect(() => {
    if (!visible) {
      setUsername('');
      setPassword('');
      setIsValidated(false);
      setMessage(null);
      setValidateLoading(false);
      setLinkLoading(false);
      Keyboard.dismiss();
      return;
    }
    setProjectIdInput(currentLink?.projectId != null ? String(currentLink.projectId) : '');
    const focusTimer = setTimeout(() => {
      securityInputRef.current?.focus();
    }, 120);
    return () => {
      clearTimeout(focusTimer);
    };
  }, [visible, currentLink]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleValidate = async () => {
    if (!username.trim() || !password) {
      setMessage('Enter administrator credentials.');
      return;
    }
    setValidateLoading(true);
    setMessage(null);
    try {
      const valid = await onValidate(username.trim(), password);
      if (valid) {
        setIsValidated(true);
        setMessage('Administrator session verified.');
      } else {
        setIsValidated(false);
        setMessage('Administrator access was not granted.');
      }
    } catch (error: any) {
      setIsValidated(false);
      setMessage(error?.message || 'Unable to validate code.');
    } finally {
      setValidateLoading(false);
    }
  };

  const handleLink = async () => {
    const parsed = Number(projectIdInput.trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage('Enter a valid Project ID.');
      return;
    }
    setLinkLoading(true);
    setMessage(null);
    try {
      await onLink(parsed);
      setMessage('Device link updated.');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to update link.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleRefresh = async () => {
    setMessage(null);
    try {
      await onRefreshLink();
      setMessage('Link refreshed.');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to refresh link.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}
      >
        <View style={styles.backdrop}>
          <View style={styles.container}>
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Device Configuration</Text>
              <TouchableOpacity style={styles.closeIconButton} onPress={handleClose} accessibilityLabel="Close configuration">
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deviceIdLabel}>Device ID</Text>
            <Text style={styles.deviceIdValue}>{deviceId ?? 'Detecting...'}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrator Sign-in</Text>
            <TextInput
              ref={securityInputRef}
              value={username}
              onChangeText={setUsername}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              showSoftInputOnFocus
              autoComplete="off"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              secureTextEntry
              showSoftInputOnFocus
              autoComplete="off"
            />
            <TouchableOpacity
              style={[styles.button, validateLoading && styles.buttonDisabled]}
              onPress={handleValidate}
              disabled={validateLoading}
            >
              {validateLoading ? (
                <ActivityIndicator size="small" color="#e5e7eb" />
              ) : (
                <Text style={styles.buttonText}>Validate</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Linked Project</Text>
              <TouchableOpacity onPress={handleRefresh} disabled={isLinkLoading}>
                {isLinkLoading ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text style={styles.refreshText}>Refresh</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.summary}>{projectIdSummary}</Text>

            <TextInput
              value={projectIdInput}
              onChangeText={setProjectIdInput}
              placeholder="New Project ID"
              placeholderTextColor="#9ca3af"
              style={[styles.input, !isValidated && styles.inputDisabled]}
              editable={isValidated}
              keyboardType="number-pad"
              showSoftInputOnFocus
            />
            <TouchableOpacity
              style={[styles.button, (!isValidated || linkLoading) && styles.buttonDisabled]}
              onPress={handleLink}
              disabled={!isValidated || linkLoading}
            >
              {linkLoading ? (
                <ActivityIndicator size="small" color="#e5e7eb" />
              ) : (
                <Text style={styles.buttonText}>{isLinkKnown ? 'Update Link' : 'Link Device'}</Text>
              )}
            </TouchableOpacity>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  closeIconButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    padding: 8,
  },
  deviceIdLabel: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  deviceIdValue: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  summary: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  message: {
    textAlign: 'center',
    color: '#0ea5e9',
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  closeButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
});
