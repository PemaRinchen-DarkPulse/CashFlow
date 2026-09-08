import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/src/theme';

/**
 * The app canvas: near-black base, a cool navy wash at the top and a faint
 * green bloom bleeding in from the left — the same depth as the reference.
 */
export function ScreenBackground({ children, style, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[styles.root, style]}>
      <LinearGradient
        colors={['#0A1720', '#060D11', colors.bg] as const}
        locations={[0, 0.45, 1] as const}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(29,215,91,0.10)', 'rgba(29,215,91,0)'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 0.6 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
