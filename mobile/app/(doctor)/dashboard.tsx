import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  StatCard,
  AppointmentCard,
  SectionHeader,
  NotificationCard,
} from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

export default function DoctorDashboardScreen() {
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
            <Text style={styles.name}>Dr. Karma Wangchuk</Text>
            <Text style={styles.specialty}>General Medicine • JDWNRH</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KW</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today's Patients"
            value={12}
            icon="people"
            color={Colors.primary}
          />
          <StatCard
            label="Completed"
            value={5}
            icon="checkmark-circle"
            color={Colors.success}
          />
          <StatCard
            label="Pending"
            value={7}
            icon="time"
            color={Colors.warning}
          />
        </View>

        {/* Queue Overview */}
        <View style={styles.queueCard}>
          <View style={styles.queueHeader}>
            <View>
              <Text style={styles.queueTitle}>Current Queue</Text>
              <Text style={styles.queueSubtitle}>OPD Room 3</Text>
            </View>
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>3 waiting</Text>
            </View>
          </View>
          <View style={styles.queueProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '42%' }]} />
            </View>
            <Text style={styles.progressText}>5 of 12 seen</Text>
          </View>
        </View>

        {/* Today's Appointments */}
        <SectionHeader title="Today's Appointments" onAction={() => {}} />
        <View style={styles.cardList}>
          <AppointmentCard
            doctorName="Tshering Dorji"
            specialty="Follow-up Visit"
            date="Today"
            time="10:00 AM"
            status="upcoming"
          />
          <AppointmentCard
            doctorName="Pema Yangzom"
            specialty="New Consultation"
            date="Today"
            time="10:30 AM"
            status="upcoming"
          />
          <AppointmentCard
            doctorName="Sonam Wangchuk"
            specialty="Lab Review"
            date="Today"
            time="11:00 AM"
            status="upcoming"
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" onAction={() => {}} />
        <View style={styles.cardList}>
          <NotificationCard
            title="New Patient Referral"
            message="Dr. Pema Lhamo referred a patient for cardiac evaluation"
            time="30 min ago"
            type="general"
          />
          <NotificationCard
            title="Lab Results"
            message="Lab results for Tshering Dorji are now available"
            time="1 hour ago"
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
    alignItems: 'flex-start',
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
  specialty: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarText: {
    ...Typography.titleMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  queueCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  queueTitle: {
    ...Typography.titleMedium,
    color: Colors.onPrimaryContainer,
  },
  queueSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  queueBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  queueBadgeText: {
    ...Typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  queueProgress: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cardList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
