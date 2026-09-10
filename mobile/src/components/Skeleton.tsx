import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';

import { colors, radius as radii, spacing } from '@/src/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  /** Corner rounding. Pass the height for a circle. */
  radius?: number;
  style?: ViewStyle;
};

/** One full sweep. Slow enough to read as loading, quick enough not to stall. */
const SWEEP_MS = 1150;

/**
 * A placeholder block that stands in for content still on its way.
 *
 * A skeleton beats a spinner here because it says something a spinner cannot:
 * how much is coming and roughly what shape it will be. The screen is already
 * laid out when the data lands, so nothing jumps, and the wait reads as the
 * page filling in rather than as the app being stuck.
 *
 * Built on React Native's own `Animated` rather than Reanimated: the sweep is a
 * single native-driven transform, so it needs no babel plugin to be configured
 * and keeps running on the UI thread while JavaScript is busy parsing the very
 * response this is waiting for.
 */
export function Skeleton({ width = '100%', height = 14, radius = radii.sm, style }: SkeletonProps) {
  const progress = useRef(new Animated.Value(0)).current;
  // The sweep is a translation, so it needs a real pixel width to travel.
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: SWEEP_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-measured, measured],
  });

  return (
    <View
      onLayout={(event) => setMeasured(event.nativeEvent.layout.width)}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surface,
          // Keeps the highlight clipped to the block's own corners.
          overflow: 'hidden',
        },
        style,
      ]}>
      {measured > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * The placeholder for a row that leads with a round icon and carries two lines
 * beside it — the shape of an account, a transaction and a goal alike.
 */
export function SkeletonRow({ lead = 40 }: { lead?: number }) {
  return (
    <View style={styles.row}>
      <Skeleton width={lead} height={lead} radius={radii.md} />
      <View style={styles.rowText}>
        <Skeleton width="62%" height={13} />
        <Skeleton width="38%" height={11} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.sm,
  },
});
