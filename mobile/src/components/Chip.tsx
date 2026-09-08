import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Overrides the selected tint, used by category filters. */
  accent?: string;
};

export function Chip({ label, selected = false, onPress, icon, accent = colors.primary }: ChipProps) {
  const content = (
    <View style={styles.content}>
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? '#04140A' : colors.textSecondary} />
      ) : null}
      <AppText variant="label" color={selected ? '#04140A' : colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? { backgroundColor: accent, borderColor: accent } : styles.idle,
        pressed && { opacity: 0.75 },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
