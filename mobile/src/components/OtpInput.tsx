import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, spacing } from '@/src/theme';

export type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  editable?: boolean;
  error?: boolean;
};

/**
 * A row of digit boxes backed by one real input. Per-box inputs are a well
 * known source of focus and backspace bugs; here the boxes are only a drawing
 * of a single value, and a transparent field over them takes every keystroke —
 * so paste, autofill and the OS one-time-code suggestion all just work.
 */
export function OtpInput({
  value,
  onChangeText,
  length = 6,
  editable = true,
  error,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const boxes = Array.from({ length }, (_, index) => value[index] ?? '');
  // The caret box is the next empty one, or the last once the code is full.
  const caretAt = Math.min(value.length, length - 1);

  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={styles.row}>
      {boxes.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            error ? styles.boxError : null,
            focused && index === caretAt ? styles.boxActive : null,
          ]}>
          <AppText style={styles.digit}>{digit}</AppText>
        </View>
      ))}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(next) => onChangeText(next.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={length}
        editable={editable}
        autoFocus
        // Lets iOS offer the code from Messages and Android autofill it.
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.borderStrong,
  },
  boxActive: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.surfaceHigh,
  },
  boxError: {
    borderColor: 'rgba(255,92,108,0.45)',
  },
  digit: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.4,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    // Android needs a real text colour even at zero opacity or it can skip
    // rendering the field entirely and never take focus.
    color: colors.text,
  },
});
