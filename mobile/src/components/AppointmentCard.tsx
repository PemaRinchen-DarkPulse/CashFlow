import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

interface AppointmentCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  style?: ViewStyle;
}

const statusConfig = {
  upcoming: { label: 'Upcoming', color: Colors.primary, bg: Colors.primaryContainer },
  completed: { label: 'Completed', color: Colors.success, bg: Colors.successLight },
  cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctorName,
  specialty,
  date,
  time,
  status,
  style,
}) => {
  const config = statusConfig[status];

  return (
    <Card style={[styles.card, style]} shadow="md">
      <View style={[styles.accent, { backgroundColor: config.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.specialty}>{specialty}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <View style={styles.dateTime}>
            <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.dateText}>{time}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  doctorName: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  specialty: {
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
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
});
