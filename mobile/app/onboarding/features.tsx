import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components';
import { Colors, Typography, Spacing, Shadows } from '@/src/theme/theme';

const { width } = Dimensions.get('window');

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  return (
    <View style={featureStyles.container}>
      <View style={[featureStyles.iconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={featureStyles.textContainer}>
        <Text style={featureStyles.title}>{title}</Text>
        <Text style={featureStyles.description}>{description}</Text>
      </View>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default function FeaturesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.illustrationContainer}>
          <View style={styles.mainCircle}>
            <Ionicons name="phone-portrait-outline" size={56} color={Colors.primary} />
          </View>
          <View style={[styles.badge, styles.badge1]}>
            <Ionicons name="calendar" size={16} color={Colors.primary} />
          </View>
          <View style={[styles.badge, styles.badge2]}>
            <Ionicons name="document-text" size={16} color={Colors.success} />
          </View>
          <View style={[styles.badge, styles.badge3]}>
            <Ionicons name="chatbubbles" size={16} color={'#7B1FA2'} />
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Healthcare at{'\n'}Your Fingertips</Text>
        <Text style={styles.subtitle}>
          Book appointments, access medical records, and stay connected with healthcare providers.
        </Text>

        {/* Feature List */}
        <View style={styles.featureList}>
          <FeatureItem
            icon="calendar-outline"
            title="Book Appointments"
            description="Schedule visits with ease"
            color={Colors.primary}
          />
          <FeatureItem
            icon="document-text-outline"
            title="Medical Records"
            description="Access your health history"
            color={Colors.success}
          />
          <FeatureItem
            icon="people-outline"
            title="Stay Connected"
            description="Connect with providers"
            color="#7B1FA2"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={() => router.push('/onboarding/role-select')}
            variant="primary"
            size="lg"
            fullWidth
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  badge: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  badge1: { top: 5, right: -5 },
  badge2: { bottom: 10, left: -10 },
  badge3: { bottom: 5, right: -5 },
  contentSection: {
    flex: 1,
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
    marginBottom: Spacing.lg,
  },
  featureList: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
  },
});
