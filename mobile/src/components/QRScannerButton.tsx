import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface QRScannerButtonProps {
  onPress: () => void;
  label?: string;
  size?: number;
}

export const QRScannerButton: React.FC<QRScannerButtonProps> = ({
  onPress,
  label = 'Scan',
  size = 56,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="qr-code-outline" size={28} color={Colors.white} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  pressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.92 }],
  },
});
