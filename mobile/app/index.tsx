import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRole } from '@/src/services/RoleContext';
import { getOnboardingComplete } from '@/src/services/storage';
import { LoadingState } from '@/src/components';
import { Colors } from '@/src/theme/theme';
import type { Role } from '@/src/theme/theme';

export default function Index() {
  const router = useRouter();
  const { role, isLoading } = useRole();

  useEffect(() => {
    if (isLoading) return;

    async function navigate() {
      const onboardingComplete = await getOnboardingComplete();

      if (!onboardingComplete || !role) {
        // First launch or no role selected
        router.replace('/onboarding');
        return;
      }

      // Navigate to role-specific home
      const routeMap: Record<Role, string> = {
        patient: '/(patient)/home',
        doctor: '/(doctor)/dashboard',
        pharmacist: '/(pharmacist)/dashboard',
      };

      router.replace(routeMap[role] as any);
    }

    navigate();
  }, [isLoading, role]);

  return (
    <View style={styles.container}>
      <LoadingState message="Loading Bhutan ePIS..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
