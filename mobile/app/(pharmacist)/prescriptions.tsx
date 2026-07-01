import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrescriptionCard, EmptyState } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

type TabFilter = 'pending' | 'dispensed' | 'expired';

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'dispensed', label: 'Dispensed' },
  { key: 'expired', label: 'Expired' },
];

const mockPrescriptions = {
  pending: [
    { medication: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', prescribedBy: 'Karma Wangchuk', status: 'active' as const },
    { medication: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', prescribedBy: 'Pema Lhamo', status: 'active' as const },
    { medication: 'Omeprazole 20mg', dosage: '1 capsule', frequency: 'Before breakfast', prescribedBy: 'Sonam Tshering', status: 'active' as const },
    { medication: 'Atorvastatin 10mg', dosage: '1 tablet', frequency: 'At bedtime', prescribedBy: 'Dorji Wangmo', status: 'active' as const },
  ],
  dispensed: [
    { medication: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily', prescribedBy: 'Karma Wangchuk', status: 'completed' as const },
    { medication: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'As needed', prescribedBy: 'Pema Lhamo', status: 'completed' as const },
  ],
  expired: [
    { medication: 'Ciprofloxacin 500mg', dosage: '1 tablet', frequency: 'Twice daily', prescribedBy: 'Sonam Tshering', status: 'expired' as const },
  ],
};

export default function PharmacistPrescriptionsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabFilter>('pending');
  const prescriptions = mockPrescriptions[activeTab];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {prescriptions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No prescriptions"
            description={`No ${activeTab} prescriptions found`}
          />
        ) : (
          <View style={styles.list}>
            {prescriptions.map((rx, index) => (
              <PrescriptionCard key={index} {...rx} />
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
