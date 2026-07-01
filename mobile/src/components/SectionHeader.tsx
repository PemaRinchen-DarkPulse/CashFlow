import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/src/theme/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'See All',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onAction && (
        <Pressable onPress={onAction} style={({ pressed }) => [pressed && styles.pressed]}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  action: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
