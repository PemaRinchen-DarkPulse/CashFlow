import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoleCard, Button } from '@/src/components';
import { useRole } from '@/src/services/RoleContext';
import { setOnboardingComplete } from '@/src/services/storage';
import { Colors, Typography, Spacing } from '@/src/theme/theme';
import type { Role } from '@/src/theme/theme';

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await setRole(selectedRole);
      await setOnboardingComplete();

      const routeMap: Record<Role, string> = {
        patient: '/(patient)/home',
        doctor: '/(doctor)/dashboard',
        pharmacist: '/(pharmacist)/dashboard',
      };

      router.replace(routeMap[selectedRole] as any);
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you'll use Bhutan ePIS. You can change this later in settings.
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <RoleCard
          role="patient"
          icon="👤"
          title="Patient"
          description="Book appointments, view records & prescriptions"
          selected={selectedRole === 'patient'}
          onPress={setSelectedRole}
        />
        <RoleCard
          role="doctor"
          icon="🩺"
          title="Doctor"
          description="Manage schedules, view patient records & queues"
          selected={selectedRole === 'doctor'}
          onPress={setSelectedRole}
        />
        <RoleCard
          role="pharmacist"
          icon="💊"
          title="Pharmacist"
          description="Process prescriptions, manage inventory & verify meds"
          selected={selectedRole === 'pharmacist'}
          onPress={setSelectedRole}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedRole}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  cardContainer: {
    flex: 1,
    gap: Spacing.md,
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingVertical: Spacing.lg,
  },
});
