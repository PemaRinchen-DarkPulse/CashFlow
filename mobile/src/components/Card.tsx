import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  noBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = 'sm',
  noBorder = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        Shadows[shadow],
        { padding: Spacing[padding] },
        !noBorder && styles.border,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
