import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, shadow, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type QuickActionProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
  /** The filled green button that leads the row. */
  primary?: boolean;
};

export function QuickAction({ label, icon, onPress, primary = false }: QuickActionProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.root, pressed && { transform: [{ scale: 0.94 }] }]}>
      <View style={[styles.circle, primary ? styles.primary : styles.secondary, primary && shadow.glow]}>
        <Ionicons name={icon} size={21} color={primary ? '#04140A' : colors.text} />
      </View>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
