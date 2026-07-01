import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top Section with Illustration */}
      <View style={styles.topSection}>
        <View style={styles.illustrationContainer}>
          <View style={styles.mainCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="heart-half" size={64} color={Colors.primary} />
            </View>
          </View>
          {/* Floating decorative elements */}
          <View style={[styles.floatingIcon, styles.floatingIcon1]}>
            <Ionicons name="medical" size={20} color={Colors.primary} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon2]}>
            <Ionicons name="fitness" size={18} color={Colors.secondary} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon3]}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon4]}>
            <Ionicons name="pulse" size={20} color={Colors.primary} />
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Welcome to{'\n'}Bhutan ePIS</Text>
        <Text style={styles.description}>
          Manage appointments, health records, prescriptions, and healthcare services in one platform.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/features')}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Skip"
            onPress={() => router.push('/onboarding/role-select')}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  floatingIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  floatingIcon1: {
    top: 20,
    right: 30,
  },
  floatingIcon2: {
    top: 60,
    left: 15,
  },
  floatingIcon3: {
    bottom: 50,
    right: 20,
  },
  floatingIcon4: {
    bottom: 30,
    left: 40,
  },
  contentSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
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
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
