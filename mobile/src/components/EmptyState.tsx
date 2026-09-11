import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { colors, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Tightens the vertical rhythm for a notice that sits among other content
   * rather than standing in for a whole screen's worth of it.
   */
  compact?: boolean;
};

export function EmptyState({
  icon = 'documents-outline',
  title,
  body,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>
        <Ionicons name={icon} size={compact ? 22 : 24} color={colors.primary} />
      </View>
      <AppText variant="h3" center>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.textMuted} center style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={compact ? styles.actionCompact : styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  rootCompact: {
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconWrapCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: spacing.sm,
  },
  body: {
    marginTop: spacing.sm,
    maxWidth: 280,
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  actionCompact: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
});
