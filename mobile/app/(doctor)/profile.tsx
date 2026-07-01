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

export default function DoctorProfileScreen() {
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
          name="Dr. Karma Wangchuk"
          role="doctor"
          email="karma.wangchuk@jdwnrh.bt"
          phone="+975 17 654 321"
        />

        {/* Specialization Info */}
        <View style={styles.specCard}>
          <View style={styles.specRow}>
            <Ionicons name="medical" size={16} color={Colors.primary} />
            <Text style={styles.specText}>General Medicine</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="business" size={16} color={Colors.primary} />
            <Text style={styles.specText}>JDWNRH, Thimphu</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="ribbon" size={16} color={Colors.primary} />
            <Text style={styles.specText}>12 years experience</Text>
          </View>
        </View>

        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Practice</Text>
          <SettingsItem icon="person-outline" title="Edit Profile" subtitle="Name, specialization" onPress={() => {}} />
          <SettingsItem icon="time-outline" title="Working Hours" subtitle="Mon-Fri, 9AM-5PM" onPress={() => {}} />
          <SettingsItem icon="calendar-outline" title="Leave Management" onPress={() => {}} />
        </Card>

        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Preferences</Text>
          <SettingsItem icon="notifications-outline" title="Notifications" subtitle="Push, email" onPress={() => {}} />
          <SettingsItem icon="language-outline" title="Language" subtitle="English" onPress={() => {}} />
        </Card>

        <Card style={styles.settingsGroup} noBorder>
          <Text style={styles.groupTitle}>Account</Text>
          <SettingsItem icon="swap-horizontal-outline" title="Switch Role" onPress={handleSwitchRole} />
          <SettingsItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
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
  specCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  specText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
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
