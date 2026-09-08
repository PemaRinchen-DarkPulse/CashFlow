import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/src/theme';

export type ProgressBarProps = {
  /** 0-100. Values above 100 are clamped. */
  value: number;
  color?: string;
  height?: number;
  trackColor?: string;
  delay?: number;
};

export function ProgressBar({
  value,
  color = colors.primary,
  height = 8,
  trackColor = 'rgba(255,255,255,0.07)',
  delay = 0,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, 100));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(clamped, { duration: 700 }));
  }, [clamped, delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[
          animatedStyle,
          { height: '100%', borderRadius: radius.pill, backgroundColor: color },
        ]}
      />
    </View>
  );
}
