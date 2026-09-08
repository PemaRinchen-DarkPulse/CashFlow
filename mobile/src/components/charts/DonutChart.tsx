import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { colors } from '@/src/theme';

export type DonutSlice = { value: number; color: string };

export type DonutChartProps = {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  /** Rendered in the middle of the ring (total, label, …). */
  children?: ReactNode;
  /** Gap between slices, in degrees. */
  gap?: number;
};

export function DonutChart({
  data,
  size = 168,
  strokeWidth = 20,
  gap = 2,
  children,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  let offset = 0;
  const segments = total > 0 ? data.filter((slice) => slice.value > 0) : [];
  const gapLength = segments.length > 1 ? (gap / 360) * circumference : 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {segments.map((slice, index) => {
            const length = (slice.value / total) * circumference;
            const dash = Math.max(length - gapLength, 0.5);
            const circle = (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
          {segments.length === 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.surfaceHigh}
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : null}
        </G>
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
