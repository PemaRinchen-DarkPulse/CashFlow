import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: IconName;
};

export function SectionHeader({ title, subtitle, actionLabel, onAction, actionIcon }: SectionHeaderProps) {
  const isAddAction =
    actionIcon ||
    (actionLabel &&
      ['add', 'new', 'record', 'create', 'set'].some((kw) =>
        actionLabel.toLowerCase().includes(kw)
      ));
  const iconName: IconName = actionIcon ?? (isAddAction ? 'add' : 'chevron-forward');

  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <AppText variant="h2">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Ionicons name={iconName} size={15} color={colors.primary} />
          <AppText variant="label" color={colors.primary} style={styles.actionText}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titles: {
    flex: 1,
    paddingRight: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
  },
  actionText: {
    fontFamily: font.semibold,
    fontSize: 12.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
