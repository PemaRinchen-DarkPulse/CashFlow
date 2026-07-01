import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = Colors.primary,
  trend,
  trendValue,
  style,
}) => {
  const trendColor = trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.textTertiary;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend && trendValue && (
          <View style={styles.trend}>
            <Ionicons
              name={trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove'}
              size={12}
              color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>{trendValue}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    ...Typography.labelSmall,
  },
  value: {
    ...Typography.displaySmall,
    fontWeight: '700',
    marginBottom: Spacing.xxs,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
