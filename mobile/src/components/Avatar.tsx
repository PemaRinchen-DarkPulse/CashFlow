import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font } from '@/src/theme';
import { initialsOf } from '@/src/utils/format';

export type AvatarProps = {
  name: string;
  size?: number;
  /** Draws the green presence ring used in the home header. */
  ring?: boolean;
};

export function Avatar({ name, size = 44, ring = true }: AvatarProps) {
  const inner = ring ? size - 4 : size;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 1.5 : 0,
        },
      ]}>
      <LinearGradient
        colors={['#1DD75B', '#0E7A38'] as const}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText style={{ fontFamily: font.bold, fontSize: inner * 0.36, color: '#04140A' }}>
          {initialsOf(name) || '?'}
        </AppText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primaryEdge,
  },
});
