import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  StatCard,
  PrescriptionCard,
  SectionHeader,
} from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

export default function PharmacistDashboardScreen() {
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
            <Text style={styles.name}>Pharm. Dechen Zangmo</Text>
            <Text style={styles.pharmacy}>JDWNRH Pharmacy</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DZ</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Pending Rx"
            value={8}
            icon="receipt-outline"
            color={Colors.warning}
          />
          <StatCard
            label="Dispensed"
            value={23}
            icon="checkmark-circle"
            color={Colors.success}
          />
          <StatCard
            label="Low Stock"
            value={5}
            icon="alert-circle"
            color={Colors.error}
          />
        </View>

        {/* Alerts */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.alertTitle}>Inventory Alert</Text>
          </View>
          <Text style={styles.alertText}>
            5 medications are running low on stock. Review inventory for restocking.
          </Text>
          <Pressable style={styles.alertButton}>
            <Text style={styles.alertButtonText}>View Details</Text>
          </Pressable>
        </View>

        {/* Pending Prescriptions */}
        <SectionHeader title="Pending Prescriptions" onAction={() => {}} />
        <View style={styles.cardList}>
          <PrescriptionCard
            medication="Amlodipine 5mg"
            dosage="1 tablet"
            frequency="Once daily"
            prescribedBy="Karma Wangchuk"
            status="active"
          />
          <PrescriptionCard
            medication="Metformin 500mg"
            dosage="1 tablet"
            frequency="Twice daily"
            prescribedBy="Pema Lhamo"
            status="active"
          />
          <PrescriptionCard
            medication="Omeprazole 20mg"
            dosage="1 capsule"
            frequency="Before breakfast"
            prescribedBy="Sonam Tshering"
            status="active"
          />
        </View>

        {/* Daily Statistics */}
        <SectionHeader title="Today's Activity" />
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>31</Text>
              <Text style={styles.activityLabel}>Total Rx</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>23</Text>
              <Text style={styles.activityLabel}>Dispensed</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>8</Text>
              <Text style={styles.activityLabel}>Pending</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>0</Text>
              <Text style={styles.activityLabel}>Rejected</Text>
            </View>
          </View>
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
  pharmacy: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7B1FA2',
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
  alertCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alertTitle: {
    ...Typography.titleSmall,
    color: Colors.error,
  },
  alertText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  alertButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  alertButtonText: {
    ...Typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  cardList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  activityCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    ...Typography.headlineMedium,
    color: Colors.primary,
    fontWeight: '700',
  },
  activityLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xxs,
  },
  activityDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
});
