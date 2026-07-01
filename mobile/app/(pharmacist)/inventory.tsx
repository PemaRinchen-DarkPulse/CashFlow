import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface MedicationItemProps {
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
}

function MedicationItem({ name, quantity, unit, threshold, category }: MedicationItemProps) {
  const isLow = quantity <= threshold;
  const percentage = Math.min((quantity / (threshold * 5)) * 100, 100);

  return (
    <Pressable style={({ pressed }) => [medStyles.card, pressed && medStyles.pressed]}>
      <View style={medStyles.header}>
        <View style={[medStyles.iconContainer, isLow ? medStyles.iconLow : medStyles.iconNormal]}>
          <Text style={medStyles.icon}>💊</Text>
        </View>
        <View style={medStyles.info}>
          <Text style={medStyles.name}>{name}</Text>
          <Text style={medStyles.category}>{category}</Text>
        </View>
        {isLow && (
          <View style={medStyles.alertBadge}>
            <Ionicons name="alert" size={12} color={Colors.error} />
            <Text style={medStyles.alertText}>Low</Text>
          </View>
        )}
      </View>
      <View style={medStyles.stockRow}>
        <Text style={[medStyles.stockText, isLow && medStyles.stockLow]}>
          {quantity} {unit} remaining
        </Text>
        <Text style={medStyles.thresholdText}>
          Min: {threshold} {unit}
        </Text>
      </View>
      <View style={medStyles.progressBar}>
        <View
          style={[
            medStyles.progressFill,
            { width: `${percentage}%` },
            isLow && medStyles.progressLow,
          ]}
        />
      </View>
    </Pressable>
  );
}

const medStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconNormal: {
    backgroundColor: Colors.secondaryContainer,
  },
  iconLow: {
    backgroundColor: Colors.errorLight,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  category: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  alertText: {
    ...Typography.labelSmall,
    color: Colors.error,
    fontWeight: '600',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  stockText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  stockLow: {
    color: Colors.error,
    fontWeight: '600',
  },
  thresholdText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  progressLow: {
    backgroundColor: Colors.error,
  },
});

const mockInventory: MedicationItemProps[] = [
  { name: 'Amlodipine 5mg', quantity: 15, unit: 'boxes', threshold: 20, category: 'Cardiovascular' },
  { name: 'Metformin 500mg', quantity: 8, unit: 'boxes', threshold: 15, category: 'Diabetes' },
  { name: 'Omeprazole 20mg', quantity: 45, unit: 'boxes', threshold: 10, category: 'Gastrointestinal' },
  { name: 'Amoxicillin 500mg', quantity: 3, unit: 'boxes', threshold: 10, category: 'Antibiotics' },
  { name: 'Paracetamol 500mg', quantity: 120, unit: 'boxes', threshold: 30, category: 'Analgesics' },
  { name: 'Atorvastatin 10mg', quantity: 5, unit: 'boxes', threshold: 10, category: 'Cardiovascular' },
  { name: 'Ciprofloxacin 500mg', quantity: 25, unit: 'boxes', threshold: 10, category: 'Antibiotics' },
  { name: 'Losartan 50mg', quantity: 2, unit: 'boxes', threshold: 10, category: 'Cardiovascular' },
];

export default function PharmacistInventoryScreen() {
  const insets = useSafeAreaInsets();
  const lowStockCount = mockInventory.filter(m => m.quantity <= m.threshold).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <View style={styles.badgeRow}>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{mockInventory.length} items</Text>
          </View>
          {lowStockCount > 0 && (
            <View style={styles.lowBadge}>
              <Ionicons name="alert-circle" size={12} color={Colors.error} />
              <Text style={styles.lowBadgeText}>{lowStockCount} low</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            placeholder="Search medications..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lowStockCount > 0 && (
          <>
            <SectionHeader title="Low Stock Alert" />
            <View style={styles.list}>
              {mockInventory
                .filter(m => m.quantity <= m.threshold)
                .map((med, index) => (
                  <MedicationItem key={`low-${index}`} {...med} />
                ))}
            </View>
          </>
        )}

        <SectionHeader title="All Medications" style={{ marginTop: Spacing.md }} />
        <View style={styles.list}>
          {mockInventory.map((med, index) => (
            <MedicationItem key={index} {...med} />
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
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  totalBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  totalBadgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  lowBadgeText: {
    ...Typography.labelSmall,
    color: Colors.error,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  list: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});
