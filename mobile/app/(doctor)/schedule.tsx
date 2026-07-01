import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentCard, EmptyState } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [22, 23, 24, 25, 26, 27, 28];

const mockSchedule = [
  { doctorName: 'Tshering Dorji', specialty: 'Follow-up', date: 'Jun 25', time: '9:00 AM', status: 'upcoming' as const },
  { doctorName: 'Pema Yangzom', specialty: 'New Patient', date: 'Jun 25', time: '9:30 AM', status: 'upcoming' as const },
  { doctorName: 'Sonam Wangchuk', specialty: 'Post-op Review', date: 'Jun 25', time: '10:00 AM', status: 'upcoming' as const },
  { doctorName: 'Dorji Phuntsho', specialty: 'Lab Review', date: 'Jun 25', time: '10:30 AM', status: 'upcoming' as const },
  { doctorName: 'Kinley Wangmo', specialty: 'Consultation', date: 'Jun 25', time: '11:00 AM', status: 'completed' as const },
];

export default function DoctorScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(3); // Thu = index 3

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.month}>June 2026</Text>
      </View>

      {/* Week Calendar */}
      <View style={styles.weekRow}>
        {weekDays.map((day, index) => (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(index)}
            style={[styles.dayItem, selectedDay === index && styles.dayItemActive]}
          >
            <Text style={[styles.dayLabel, selectedDay === index && styles.dayLabelActive]}>
              {day}
            </Text>
            <Text style={[styles.dateLabel, selectedDay === index && styles.dateLabelActive]}>
              {dates[index]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Appointments */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>
            {weekDays[selectedDay]}, June {dates[selectedDay]}
          </Text>
          <Text style={styles.appointmentCount}>
            {mockSchedule.length} appointments
          </Text>
        </View>

        <View style={styles.list}>
          {mockSchedule.map((apt, index) => (
            <View key={index} style={styles.timeSlot}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{apt.time}</Text>
                <View style={styles.timeLine} />
              </View>
              <View style={styles.appointmentCard}>
                <AppointmentCard {...apt} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  month: {
    ...Typography.titleSmall,
    color: Colors.primary,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dayItemActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  dayLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  dayLabelActive: {
    color: Colors.onPrimary,
  },
  dateLabel: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  dateLabelActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  scheduleTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
  },
  appointmentCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  list: {
    paddingHorizontal: Spacing.md,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  timeColumn: {
    width: 70,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  timeText: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  appointmentCard: {
    flex: 1,
  },
});
