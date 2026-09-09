import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { colors, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  /** Extra line for the consequence, e.g. what happens to the balance. */
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: IconName;
};

/**
 * The app's own destructive confirmation. Replaces `Alert.alert`, which renders
 * an OS dialog that looks nothing like the rest of CashFlow. Appears instantly
 * — a delete prompt should be in front of you, not animate in.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  icon = 'trash',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <CategoryIcon icon={icon} color={colors.expense} size={52} />
          </View>

          <AppText variant="h1" center style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center style={styles.message}>
            {message}
          </AppText>

          {detail ? (
            <View style={styles.detail}>
              <Ionicons name="alert-circle" size={15} color={colors.expense} />
              <AppText variant="caption" color={colors.textSecondary} style={styles.detailText}>
                {detail}
              </AppText>
            </View>
          ) : null}

          <Button
            label={confirmLabel}
            variant="danger"
            icon={icon}
            onPress={handleConfirm}
            style={styles.confirm}
          />
          <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.expenseSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,92,108,0.22)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  detailText: {
    flex: 1,
    lineHeight: 16,
  },
  confirm: {
    marginBottom: spacing.sm,
  },
});
