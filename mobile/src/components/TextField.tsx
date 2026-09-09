import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  icon?: IconName;
  /** Renders the field masked, with an eye toggle to reveal it. */
  password?: boolean;
  error?: boolean;
  hint?: string;
  /** Sits opposite the label — a "Forgot password?" link and the like. */
  accessory?: ReactNode;
};

/**
 * The single-line input used by the auth screens: label above, icon inside,
 * and a focus ring in the app accent so the active field is obvious.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, password, error, hint, accessory, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <AppText variant="label" color={error ? colors.expense : colors.textMuted}>
          {label}
        </AppText>
        {accessory}
      </View>

      <View style={[styles.shell, focused && styles.shellFocused, error && styles.shellError]}>
        {icon ? (
          <Ionicons name={icon} size={17} color={focused ? colors.primary : colors.textMuted} />
        ) : null}

        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={password && !revealed}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={10}
            onPress={() => setRevealed((value) => !value)}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {hint ? (
        <AppText variant="caption" color={error ? colors.expense : colors.textMuted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  shellFocused: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.surfaceHigh,
  },
  shellError: {
    borderColor: 'rgba(255,92,108,0.45)',
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
    // Android centres poorly without this when the height is fixed.
    paddingVertical: 0,
  },
});
