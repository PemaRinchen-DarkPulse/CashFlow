import { View, type ViewProps } from 'react-native';

import { colors, radius, shadow, spacing } from '@/src/theme';

export type CardProps = ViewProps & {
  padded?: boolean;
  /** Adds the soft drop shadow used by the hero surfaces. */
  elevated?: boolean;
  tone?: 'default' | 'surface';
};

export function Card({
  padded = true,
  elevated = false,
  tone = 'default',
  style,
  ...rest
}: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tone === 'surface' ? colors.surface : colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        padded && { padding: spacing.xl },
        elevated && shadow.card,
        style,
      ]}
    />
  );
}
