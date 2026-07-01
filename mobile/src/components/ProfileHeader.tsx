import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';
import type { Role } from '@/src/theme/theme';

interface ProfileHeaderProps {
  name: string;
  role: Role;
  email?: string;
  phone?: string;
  avatarInitials?: string;
  style?: ViewStyle;
}

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  patient: { label: 'Patient', color: Colors.primary, bg: Colors.primaryContainer },
  doctor: { label: 'Doctor', color: Colors.success, bg: Colors.successLight },
  pharmacist: { label: 'Pharmacist', color: '#7B1FA2', bg: '#F3E5F5' },
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  role,
  email,
  phone,
  avatarInitials,
  style,
}) => {
  const config = roleConfig[role];
  const initials = avatarInitials || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.roleBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.roleText, { color: config.color }]}>{config.label}</Text>
      </View>
      {email && (
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.infoText}>{email}</Text>
        </View>
      )}
      {phone && (
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.infoText}>{phone}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarText: {
    ...Typography.displaySmall,
    color: Colors.white,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  name: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  roleText: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
