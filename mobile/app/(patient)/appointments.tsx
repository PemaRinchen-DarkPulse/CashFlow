import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppointmentCard, EmptyState } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

type TabFilter = 'upcoming' | 'completed' | 'cancelled';

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const mockAppointments = {
  upcoming: [
    { doctorName: 'Dr. Karma Wangchuk', specialty: 'General Medicine', date: 'Jun 25, 2026', time: '10:00 AM', status: 'upcoming' as const },
    { doctorName: 'Dr. Pema Lhamo', specialty: 'Cardiology', date: 'Jun 28, 2026', time: '2:30 PM', status: 'upcoming' as const },
    { doctorName: 'Dr. Sonam Tshering', specialty: 'Dermatology', date: 'Jul 3, 2026', time: '11:00 AM', status: 'upcoming' as const },
  ],
  completed: [
    { doctorName: 'Dr. Dorji Wangmo', specialty: 'Ophthalmology', date: 'Jun 15, 2026', time: '9:00 AM', status: 'completed' as const },
    { doctorName: 'Dr. Karma Wangchuk', specialty: 'General Medicine', date: 'Jun 10, 2026', time: '10:30 AM', status: 'completed' as const },
  ],
  cancelled: [] as any[],
};

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
  const appointments = mockAppointments[activeTab];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {appointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No appointments"
            description={`You don't have any ${activeTab} appointments`}
          />
        ) : (
          <View style={styles.list}>
            {appointments.map((apt, index) => (
              <AppointmentCard key={index} {...apt} />
            ))}
          </View>
        )}
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  list: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
});
