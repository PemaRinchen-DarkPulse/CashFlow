import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/src/theme';

export type FilterButtonProps = {
  onPress: () => void;
  active?: boolean;
  accessibilityLabel?: string;
};

/** Top-right control on Activity and Analytics. Matches the home bell. */
export function FilterButton({
  onPress,
  active = false,
  accessibilityLabel = 'Filter',
}: FilterButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? `${accessibilityLabel}, filters applied` : accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons name="filter-outline" size={20} color={colors.text} />
      {active ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryEdge,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
