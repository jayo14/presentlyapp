import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AlertTriangle, CheckCircle, Info, MapPin, XCircle } from 'lucide-react-native';
import { Button } from './Button';

const { width } = Dimensions.get('window');

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'confirmation' | 'error' | 'success' | 'permission';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function CustomModal({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText = 'Cancel',
  loading = false,
}: CustomModalProps) {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'confirmation':
        return <AlertTriangle size={48} color={colors.warning} />;
      case 'error':
        return <XCircle size={48} color={colors.error} />;
      case 'success':
        return <CheckCircle size={48} color={colors.success} />;
      case 'permission':
        return <MapPin size={48} color={colors.primary} />;
      default:
        return <Info size={48} color={colors.primary} />;
    }
  };

  const getConfirmText = () => {
    if (confirmText) return confirmText;
    switch (type) {
      case 'confirmation':
        return 'Confirm';
      case 'permission':
        return 'Allow';
      case 'error':
        return 'OK';
      default:
        return 'OK';
    }
  };

  const showCancel = type === 'confirmation' || type === 'permission';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.actions}>
            {showCancel && onCancel && (
              <View style={styles.buttonWrapper}>
                <Button
                  title={cancelText}
                  onPress={onCancel}
                  variant="secondary"
                  disabled={loading}
                />
              </View>
            )}
            <View style={showCancel ? styles.buttonWrapper : styles.fullButtonWrapper}>
              <Button
                title={getConfirmText()}
                onPress={onConfirm}
                variant={type === 'error' ? 'primary' : 'primary'} // Could use error color for errors if Button supported it
                loading={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: width - 40,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
  fullButtonWrapper: {
    width: '100%',
  },
});
