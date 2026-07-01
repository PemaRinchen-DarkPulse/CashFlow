import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProfileHeader, Card } from '@/src/components';
import { useRole } from '@/src/services/RoleContext';
import { resetAppData } from '@/src/services/storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, title, subtitle, onPress, danger }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [settingStyles.item, pressed && settingStyles.pressed]}
    >
      <View style={[settingStyles.icon, danger && settingStyles.dangerIcon]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={settingStyles.textContainer}>
        <Text style={[settingStyles.title, danger && settingStyles.dangerText]}>{title}</Text>
        {subtitle && <Text style={settingStyles.subtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

const settingStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    backgroundColor: Colors.surfaceVariant,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dangerIcon: {
    backgroundColor: Colors.errorLight,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  dangerText: {
    color: Colors.error,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default function PatientProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearRole } = useRole();

  async function handleSwitchRole() {
    await resetAppData();
    await clearRole();
    router.replace('/onboarding');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name="Tshering Dorji"
          role="patient"
          email="tshering.dorji@email.bt"
          phone="+975 17 123 456"
        />

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrCode}>
            <Ionicons name="qr-code" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.qrLabel}>Your Patient QR Code</Text>
          <Text style={styles.qrHint}>Show this to check in at hospitals</Text>
        </View>

        {/* Settings Groups */}
        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Personal Information</Text>
          <SettingsItem icon="person-outline" title="Edit Profile" subtitle="Name, DOB, address" onPress={() => {}} />
          <SettingsItem icon="shield-checkmark-outline" title="Health ID" subtitle="CID: 11901001234" onPress={() => {}} />
          <SettingsItem icon="people-outline" title="Emergency Contacts" onPress={() => {}} />
        </Card>

        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Preferences</Text>
          <SettingsItem icon="notifications-outline" title="Notifications" subtitle="Push, email, SMS" onPress={() => {}} />
          <SettingsItem icon="language-outline" title="Language" subtitle="English" onPress={() => {}} />
          <SettingsItem icon="lock-closed-outline" title="Privacy & Security" onPress={() => {}} />
        </Card>

        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Account</Text>
          <SettingsItem icon="swap-horizontal-outline" title="Switch Role" subtitle="Change to Doctor or Pharmacist" onPress={handleSwitchRole} />
          <SettingsItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
          <SettingsItem icon="information-circle-outline" title="About" subtitle="Version 1.0.0" onPress={() => {}} />
          <SettingsItem icon="log-out-outline" title="Sign Out" onPress={handleSwitchRole} danger />
        </Card>
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
  qrSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  qrCode: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  qrLabel: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  qrHint: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  settingsGroup: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  groupTitle: {
    ...Typography.labelMedium,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
