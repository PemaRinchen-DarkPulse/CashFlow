import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  AppointmentCard,
  PrescriptionCard,
  SectionHeader,
  QuickActionButton,
  NotificationCard,
} from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

export default function PatientHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Tshering Dorji</Text>
          </View>
          <View style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {/* Health Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View>
              <Text style={styles.summaryTitle}>Your Health Summary</Text>
              <Text style={styles.summarySubtitle}>2 upcoming appointments</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="heart" size={28} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="calendar-outline"
            label="Book Appt"
            onPress={() => {}}
            color={Colors.primary}
          />
          <QuickActionButton
            icon="document-text-outline"
            label="My Records"
            onPress={() => {}}
            color={Colors.success}
          />
          <QuickActionButton
            icon="qr-code-outline"
            label="Scan QR"
            onPress={() => {}}
            color="#7B1FA2"
          />
          <QuickActionButton
            icon="alert-circle-outline"
            label="Emergency"
            onPress={() => {}}
            color={Colors.error}
          />
        </View>

        {/* Upcoming Appointments */}
        <SectionHeader title="Upcoming Appointments" onAction={() => {}} />
        <View style={styles.cardList}>
          <AppointmentCard
            doctorName="Dr. Karma Wangchuk"
            specialty="General Medicine"
            date="Jun 25, 2026"
            time="10:00 AM"
            status="upcoming"
          />
          <AppointmentCard
            doctorName="Dr. Pema Lhamo"
            specialty="Cardiology"
            date="Jun 28, 2026"
            time="2:30 PM"
            status="upcoming"
          />
        </View>

        {/* Recent Prescriptions */}
        <SectionHeader title="Recent Prescriptions" onAction={() => {}} />
        <View style={styles.cardList}>
          <PrescriptionCard
            medication="Amlodipine"
            dosage="5mg"
            frequency="Once daily"
            prescribedBy="Karma Wangchuk"
            status="active"
            refillsLeft={3}
          />
          <PrescriptionCard
            medication="Metformin"
            dosage="500mg"
            frequency="Twice daily"
            prescribedBy="Pema Lhamo"
            status="active"
            refillsLeft={1}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" onAction={() => {}} />
        <View style={styles.cardList}>
          <NotificationCard
            title="Appointment Reminder"
            message="Your appointment with Dr. Karma Wangchuk is tomorrow at 10:00 AM"
            time="2 hours ago"
            type="appointment"
          />
          <NotificationCard
            title="Lab Results Ready"
            message="Your blood test results from JDWNRH are now available"
            time="1 day ago"
            type="result"
            read
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  name: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    ...Typography.titleMedium,
    color: Colors.onPrimaryContainer,
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
