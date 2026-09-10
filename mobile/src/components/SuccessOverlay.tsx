import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { colors, radius, spacing } from '@/src/theme';

export type SuccessOverlayProps = {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/**
 * The confirmation sheet shown after saving: a green check on a dark card, one
 * primary action and an optional quiet one.
 */
export function SuccessOverlay({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: SuccessOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onPrimary}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onSecondary ?? onPrimary} />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <CategoryIcon icon="checkmark" color={colors.primary} size={52} />
          </View>

          <AppText variant="h1" center style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center style={styles.message}>
            {message}
          </AppText>

          <Button label={primaryLabel} onPress={onPrimary} style={styles.primary} />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} />
          ) : null}
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
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  primary: {
    marginBottom: spacing.xs,
  },
});
