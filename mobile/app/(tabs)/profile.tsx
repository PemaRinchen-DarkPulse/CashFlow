import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SettingRow } from '@/src/components/SettingRow';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import { formatDate } from '@/src/utils/date';
import { formatCurrency, maskAmount } from '@/src/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, totalBalance, streak, updateSetting, updateProfile, resetData, unreadCount } =
    useFinance();
  const { profile, accounts, transactions, settings, rewards, goals } = state;
  const currency = profile.currency;
  const hidden = settings.hideBalance;

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);

  const savedTotal = useMemo(() => goals.reduce((sum, goal) => sum + goal.saved, 0), [goals]);

  const openEditor = () => {
    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setEditing(true);
  };

  const saveProfile = () => {
    const name = draftName.trim();
    if (!name) return;
    updateProfile(name, draftEmail.trim());
    setEditing(false);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all data?',
      'This clears your transactions, budgets and goals, and restores the sample data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetData },
      ]
    );
  };

  const balanceLabel = formatCurrency(totalBalance, currency);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl },
        ]}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card style={styles.identityCard}>
            <View style={styles.identityRow}>
              <Avatar name={profile.name} size={64} />
              <View style={styles.identityText}>
                <AppText variant="h1" numberOfLines={1}>
                  {profile.name}
                </AppText>
                <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {profile.email}
                </AppText>
                <View style={styles.tier}>
                  <Ionicons name="sparkles" size={11} color={colors.primary} />
                  <AppText variant="caption" color={colors.primary}>
                    {rewards.points.toLocaleString()} points
                  </AppText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                onPress={openEditor}
                style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}>
                <Ionicons name="create-outline" size={17} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
              <AppText variant="caption" color={colors.textMuted}>
                Member since {formatDate(profile.memberSince)}
              </AppText>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(60)} style={styles.statRow}>
          <View style={styles.statBlock}>
            <AppText tabular style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {hidden ? maskAmount(balanceLabel) : balanceLabel}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Net balance
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <AppText tabular style={styles.statValue}>
              {transactions.length}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Transactions
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <AppText tabular style={styles.statValue}>
              {streak}d
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Streak
            </AppText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(120)}>
          <SectionHeader title="Accounts" subtitle="Where your money sits" />
          <Card style={styles.listCard}>
            {accounts.map((account, index) => {
              const label = formatCurrency(account.balance, currency);
              return (
                <View key={account.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.accountRow}>
                    <CategoryIcon icon={account.icon} color={account.color} size={40} />
                    <View style={styles.accountText}>
                      <AppText variant="h3">{account.name}</AppText>
                      <AppText variant="caption" color={colors.textMuted}>
                        •••• {account.last4}
                      </AppText>
                    </View>
                    <AppText tabular style={styles.accountBalance}>
                      {hidden ? maskAmount(label) : label}
                    </AppText>
                  </View>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <CategoryIcon icon="flag" color={colors.primary} size={40} />
              <View style={styles.accountText}>
                <AppText variant="h3">Set aside in goals</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  Across {goals.length} goal{goals.length === 1 ? '' : 's'}
                </AppText>
              </View>
              <AppText tabular style={[styles.accountBalance, { color: colors.primary }]}>
                {formatCurrency(savedTotal, currency, 0)}
              </AppText>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(180)}>
          <SectionHeader title="Preferences" />
          <Card style={styles.listCard}>
            <SettingRow
              icon="eye-off"
              label="Hide balances"
              description="Mask amounts across the app"
              value={settings.hideBalance}
              onValueChange={(value) => updateSetting('hideBalance', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="notifications"
              label="Budget alerts"
              description="Warn me at 80% of a category limit"
              accent={colors.warning}
              value={settings.budgetAlerts}
              onValueChange={(value) => updateSetting('budgetAlerts', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="flag"
              label="Goal reminders"
              description="Nudge me to contribute each month"
              accent={colors.info}
              value={settings.goalReminders}
              onValueChange={(value) => updateSetting('goalReminders', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="finger-print"
              label="Biometric lock"
              description="Require Face ID or fingerprint on open"
              accent="#A78BFA"
              value={settings.biometricLock}
              onValueChange={(value) => updateSetting('biometricLock', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="mail"
              label="Weekly digest"
              description="A Sunday summary of the week"
              accent="#2DD4BF"
              value={settings.weeklyDigest}
              onValueChange={(value) => updateSetting('weeklyDigest', value)}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(240)}>
          <SectionHeader title="More" />
          <Card style={styles.listCard}>
            <SettingRow
              icon="trophy"
              label="Rewards & badges"
              trailingText={`${rewards.points.toLocaleString()} pts`}
              onPress={() => router.push('/rewards')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              accent={colors.info}
              trailingText={unreadCount > 0 ? `${unreadCount} new` : undefined}
              onPress={() => router.push('/notifications')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="pie-chart-outline"
              label="Manage budgets"
              accent={colors.warning}
              onPress={() => router.push({ pathname: '/goals', params: { tab: 'budgets' } })}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="refresh"
              label="Reset all data"
              description="Restore the sample dataset"
              destructive
              onPress={confirmReset}
            />
          </Card>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
            <AppText variant="caption" color={colors.textSecondary}>
              Your money. Always protected.
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted}>
            CashFlow · v1.0.0 · Data stays on this device
          </AppText>
        </View>
      </ScrollView>

      <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditing(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Edit profile</AppText>

            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Name
              </AppText>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Email
              </AppText>
              <TextInput
                value={draftEmail}
                onChangeText={setDraftEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button label="Save changes" onPress={saveProfile} disabled={!draftName.trim()} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  identityCard: {
    gap: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    fontFamily: font.bold,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  listCard: {
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  accountText: {
    flex: 1,
    gap: 2,
  },
  accountBalance: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHigh,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
});
