import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';
import type { Role } from '@/src/theme/theme';

interface RoleCardProps {
  role: Role;
  icon: string;
  title: string;
  description: string;
  selected?: boolean;
  onPress: (role: Role) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  icon,
  title,
  description,
  selected = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={() => onPress(role)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {selected && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadows.md,
    flex: 1,
    minHeight: 160,
    justifyContent: 'center',
    position: 'relative',
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
    ...Shadows.lg,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  titleSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
