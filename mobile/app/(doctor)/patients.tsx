import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader, Card } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface PatientItemProps {
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
}

function PatientItem({ name, age, gender, lastVisit, condition }: PatientItemProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <Pressable style={({ pressed }) => [patientStyles.card, pressed && patientStyles.pressed]}>
      <View style={patientStyles.avatar}>
        <Text style={patientStyles.avatarText}>{initials}</Text>
      </View>
      <View style={patientStyles.info}>
        <Text style={patientStyles.name}>{name}</Text>
        <Text style={patientStyles.details}>{age}y • {gender} • {condition}</Text>
        <Text style={patientStyles.lastVisit}>Last visit: {lastVisit}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

const patientStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.titleSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  details: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lastVisit: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});

const mockPatients: PatientItemProps[] = [
  { name: 'Tshering Dorji', age: 45, gender: 'Male', lastVisit: 'Jun 20, 2026', condition: 'Hypertension' },
  { name: 'Pema Yangzom', age: 32, gender: 'Female', lastVisit: 'Jun 18, 2026', condition: 'Diabetes Type 2' },
  { name: 'Sonam Wangchuk', age: 58, gender: 'Male', lastVisit: 'Jun 15, 2026', condition: 'Post-op Care' },
  { name: 'Dorji Phuntsho', age: 28, gender: 'Male', lastVisit: 'Jun 12, 2026', condition: 'Asthma' },
  { name: 'Kinley Wangmo', age: 67, gender: 'Female', lastVisit: 'Jun 10, 2026', condition: 'Arthritis' },
  { name: 'Ugyen Tshomo', age: 41, gender: 'Female', lastVisit: 'Jun 8, 2026', condition: 'Thyroid' },
];

export default function DoctorPatientsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.count}>{mockPatients.length} patients</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            placeholder="Search patients..."
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
        <SectionHeader title="Recent Patients" />
        <View style={styles.list}>
          {mockPatients.map((patient, index) => (
            <PatientItem key={index} {...patient} />
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
  count: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
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
  },
});
