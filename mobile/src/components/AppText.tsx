import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, type as typeScale } from '@/src/theme';

type Variant = keyof typeof typeScale;

export type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  /** Renders digits at a fixed width so amounts do not jitter as they change. */
  tabular?: boolean;
  center?: boolean;
};

/**
 * The single text primitive for the app — every screen goes through it so the
 * Inter scale and colour roles stay consistent.
 */
export function AppText({
  variant = 'body',
  color = colors.text,
  tabular,
  center,
  style,
  ...rest
}: AppTextProps) {
  const base = typeScale[variant] as TextStyle;
  return (
    <RNText
      {...rest}
      style={[
        base,
        { color },
        tabular && { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
