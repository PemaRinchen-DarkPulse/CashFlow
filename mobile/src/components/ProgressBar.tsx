import { View } from 'react-native';

import { colors, radius } from '@/src/theme';

export type ProgressBarProps = {
  /** 0-100. Values above 100 are clamped. */
  value: number;
  color?: string;
  height?: number;
  trackColor?: string;
};

export function ProgressBar({
  value,
  color = colors.primary,
  height = 8,
  trackColor = 'rgba(255,255,255,0.07)',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
