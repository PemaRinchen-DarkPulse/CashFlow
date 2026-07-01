import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !isDisabled && variantPressedStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variant === 'primary' || variant === 'secondary' ? Colors.white : Colors.primary}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  sizeTextStyles[size],
                  variantTextStyles[variant],
                  pressed && !isDisabled && variantPressedTextStyles[variant],
                  isDisabled && styles.disabledText,
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
            </>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  md: { paddingVertical: Spacing.md - 4, paddingHorizontal: Spacing.lg },
  lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { ...Typography.labelMedium },
  md: { ...Typography.labelLarge },
  lg: { ...Typography.titleSmall },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: Colors.primary, ...Shadows.md },
  secondary: { backgroundColor: Colors.secondary },
  outline: { backgroundColor: Colors.transparent, borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.transparent },
};

const variantPressedStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: Colors.primaryDark, transform: [{ scale: 0.98 }] },
  secondary: { backgroundColor: '#3AAFE0', transform: [{ scale: 0.98 }] },
  outline: { backgroundColor: Colors.primaryContainer, transform: [{ scale: 0.98 }] },
  ghost: { backgroundColor: Colors.surfaceVariant, transform: [{ scale: 0.98 }] },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.onPrimary, fontWeight: '600' },
  secondary: { color: Colors.onSecondary, fontWeight: '600' },
  outline: { color: Colors.primary, fontWeight: '600' },
  ghost: { color: Colors.primary, fontWeight: '500' },
};

const variantPressedTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.onPrimary },
  secondary: { color: Colors.onSecondary },
  outline: { color: Colors.primaryDark },
  ghost: { color: Colors.primaryDark },
};
