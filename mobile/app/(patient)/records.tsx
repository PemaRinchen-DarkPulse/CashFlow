import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecordCard, EmptyState } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

type TabFilter = 'all' | 'lab' | 'imaging' | 'visit';

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lab', label: 'Lab' },
  { key: 'imaging', label: 'Imaging' },
  { key: 'visit', label: 'Visit' },
];

const mockRecords = [
  { title: 'Complete Blood Count', type: 'lab' as const, date: 'Jun 20, 2026', provider: 'Dr. Karma Wangchuk', facility: 'JDWNRH' },
  { title: 'Chest X-Ray', type: 'imaging' as const, date: 'Jun 15, 2026', provider: 'Dr. Sonam Tshering', facility: 'JDWNRH' },
  { title: 'Follow-up Consultation', type: 'visit' as const, date: 'Jun 10, 2026', provider: 'Dr. Pema Lhamo', facility: 'Thimphu Hospital' },
  { title: 'Lipid Panel', type: 'lab' as const, date: 'Jun 5, 2026', provider: 'Dr. Dorji Wangmo', facility: 'JDWNRH' },
  { title: 'ECG Report', type: 'imaging' as const, date: 'May 28, 2026', provider: 'Dr. Pema Lhamo', facility: 'Thimphu Hospital' },
  { title: 'Annual Physical', type: 'visit' as const, date: 'May 15, 2026', provider: 'Dr. Karma Wangchuk', facility: 'JDWNRH' },
];

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredRecords = activeTab === 'all'
    ? mockRecords
    : mockRecords.filter(r => r.type === activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
        <Text style={styles.subtitle}>{mockRecords.length} records</Text>
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
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No records found"
            description={`No ${activeTab} records available`}
          />
        ) : (
          <View style={styles.list}>
            {filteredRecords.map((record, index) => (
              <RecordCard key={index} {...record} />
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
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
