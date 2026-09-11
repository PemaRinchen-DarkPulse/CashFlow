import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { withAlpha } from '@/src/components/CategoryIcon';
import { colors, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type SettingRowProps = {
  icon: IconName;
  label: string;
  description?: string;
  accent?: string;
  /** Renders a switch instead of a chevron. */
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  trailingText?: string;
  destructive?: boolean;
  /** The switch stays put and does not take presses. */
  disabled?: boolean;
};

export function SettingRow({
  icon,
  label,
  description,
  accent = colors.primary,
  value,
  onValueChange,
  onPress,
  trailingText,
  destructive,
  disabled,
}: SettingRowProps) {
  const isSwitch = typeof value === 'boolean' && !!onValueChange;
  const tint = destructive ? colors.expense : accent;

  const body = (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: withAlpha(tint, 0.16) }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>

      <View style={styles.titles}>
        <AppText variant="bodyMedium" color={destructive ? colors.expense : colors.text}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
            {description}
          </AppText>
        ) : null}
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
          thumbColor={colors.text}
          ios_backgroundColor={colors.surfaceHigh}
        />
      ) : (
        <View style={styles.trailing}>
          {trailingText ? (
            <AppText variant="caption" color={colors.textMuted}>
              {trailingText}
            </AppText>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      )}
    </View>
  );

  if (isSwitch || !onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.65 }}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 58,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
