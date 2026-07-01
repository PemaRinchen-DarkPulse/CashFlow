import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

interface PrescriptionCardProps {
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'expired';
  refillsLeft?: number;
  style?: ViewStyle;
}

const statusConfig = {
  active: { label: 'Active', color: Colors.success, bg: Colors.successLight, icon: 'checkmark-circle' as const },
  completed: { label: 'Completed', color: Colors.primary, bg: Colors.primaryContainer, icon: 'checkmark-done' as const },
  expired: { label: 'Expired', color: Colors.error, bg: Colors.errorLight, icon: 'alert-circle' as const },
};

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  medication,
  dosage,
  frequency,
  prescribedBy,
  status,
  refillsLeft,
  style,
}) => {
  const config = statusConfig[status];

  return (
    <Card style={[styles.card, style]} shadow="sm">
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💊</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.medication}>{medication}</Text>
          <Text style={styles.dosage}>{dosage} • {frequency}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.footerText}>Dr. {prescribedBy}</Text>
        </View>
        {refillsLeft !== undefined && (
          <View style={styles.footerItem}>
            <Ionicons name="refresh-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.footerText}>{refillsLeft} refills left</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  medication: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  dosage: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
});
