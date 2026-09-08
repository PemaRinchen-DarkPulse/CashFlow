import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { radius } from '@/src/theme';
import type { IconName } from '@/src/types';

export type CategoryIconProps = {
  icon: IconName;
  color: string;
  size?: number;
  /** Fills the pill with the category colour instead of a 14% tint. */
  solid?: boolean;
};

/** The rounded icon pill that fronts every transaction, budget and goal row. */
export function CategoryIcon({ icon, color, size = 44, solid = false }: CategoryIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 44 ? radius.md : radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: solid ? color : withAlpha(color, 0.16),
        borderWidth: solid ? 0 : 1,
        borderColor: withAlpha(color, 0.22),
      }}>
      <Ionicons name={icon} size={size * 0.46} color={solid ? '#04140A' : color} />
    </View>
  );
}

/** `#4DA3FF` + 0.16 -> `rgba(77,163,255,0.16)` */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
