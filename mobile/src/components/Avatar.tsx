import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Skeleton } from '@/src/components/Skeleton';
import { colors, font } from '@/src/theme';
import { initialsOf } from '@/src/utils/format';

export type AvatarProps = {
  name: string;
  size?: number;
  /** Draws the green presence ring used in the home header. */
  ring?: boolean;
  /**
   * A signed photo URL. Initials stay the fallback when this is missing or the
   * fetch fails, so a broken link never leaves a hole where a face should be.
   */
  uri?: string;
};

export function Avatar({ name, size = 44, ring = true, uri }: AvatarProps) {
  const inner = ring ? size - 4 : size;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [uri]);

  const showPhoto = !!uri && !failed;

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
      {showPhoto ? (
        <View style={{ width: inner, height: inner, borderRadius: inner / 2, overflow: 'hidden' }}>
          {loaded ? null : (
            <Skeleton
              width={inner}
              height={inner}
              radius={inner / 2}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <Image
            source={{ uri }}
            style={{ width: inner, height: inner }}
            contentFit="cover"
            accessibilityElementsHidden
            importantForAccessibility="no"
            transition={160}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </View>
      ) : (
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
      )}
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
