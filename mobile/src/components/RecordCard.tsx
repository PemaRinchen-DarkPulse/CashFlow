import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

type RecordType = 'lab' | 'imaging' | 'visit' | 'procedure';

interface RecordCardProps {
  title: string;
  type: RecordType;
  date: string;
  provider: string;
  facility: string;
  style?: ViewStyle;
}

const typeConfig: Record<RecordType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  lab: { icon: 'flask-outline', color: '#7B1FA2', bg: '#F3E5F5', label: 'Lab' },
  imaging: { icon: 'scan-outline', color: '#00838F', bg: '#E0F7FA', label: 'Imaging' },
  visit: { icon: 'clipboard-outline', color: Colors.primary, bg: Colors.primaryContainer, label: 'Visit' },
  procedure: { icon: 'medkit-outline', color: '#E65100', bg: '#FFF3E0', label: 'Procedure' },
};

export const RecordCard: React.FC<RecordCardProps> = ({
  title,
  type,
  date,
  provider,
  facility,
  style,
}) => {
  const config = typeConfig[type];

  return (
    <Card style={[styles.card, style]} shadow="sm">
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.provider}>{provider} • {facility}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
        <Text style={styles.dateText}>{date}</Text>
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
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  provider: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
});
