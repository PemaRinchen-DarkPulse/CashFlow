import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { NoAccountsNotice } from '@/src/components/NoAccountsNotice';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SettingRow } from '@/src/components/SettingRow';
import { useToast } from '@/src/components/Toast';
import { useAuth } from '@/src/store/AuthContext';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Account } from '@/src/types';
import { formatDate } from '@/src/utils/date';
import { formatCurrency, maskAmount } from '@/src/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Set by the screens that send someone here because they have no account yet.
  const params = useLocalSearchParams<{ addAccount?: string }>();
  const {
    state,
    totalBalance,
    streak,
    updateSetting,
    updateProfile,
    resetData,
    unreadCount,
    addAccount,
    deleteAccount,
  } = useFinance();
  const { biometrics, biometricEnabled, enableBiometrics, disableBiometrics, signOut } = useAuth();
  const { showToast } = useToast();
  const { profile, accounts, transactions, settings, rewards } = state;
  const currency = profile.currency;
  const hidden = settings.hideBalance;

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [biometricPassword, setBiometricPassword] = useState('');
  const [enabling, setEnabling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [addingAccount, setAddingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [removingAccount, setRemovingAccount] = useState(false);

  // Arriving from "Add an account" elsewhere opens the sheet straight away. The
  // param is cleared so leaving and coming back does not reopen it.
  useEffect(() => {
    if (params.addAccount !== '1') return;
    setAddingAccount(true);
    router.setParams({ addAccount: undefined });
  }, [params.addAccount, router]);

  const accountTransactionCount = useMemo(
    () =>
      deletingAccount
        ? transactions.filter((item) => item.accountId === deletingAccount.id).length
        : 0,
    [deletingAccount, transactions]
  );

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

  const handleSaveAccount = async () => {
    const name = newAccountName.trim();
    if (!name || savingAccount) return;

    setSavingAccount(true);
    const result = await addAccount({ name, balance: Number(newAccountBalance) || 0 });
    setSavingAccount(false);

    // The sheet stays open on a failure so the details typed are not lost.
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    showToast('Account added', 'success');
    setNewAccountName('');
    setNewAccountBalance('');
    setAddingAccount(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccount || removingAccount) return;

    setRemovingAccount(true);
    const result = await deleteAccount(deletingAccount.id);
    setRemovingAccount(false);
    setDeletingAccount(null);

    showToast(result.ok ? 'Account removed' : result.message, result.ok ? 'success' : 'error');
  };

  const handleReset = () => {
    resetData();
    setResetting(false);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!value) {
      await disableBiometrics();
      showToast('Biometric sign-in is off', 'success');
      return;
    }
    if (!biometrics.enrolled) {
      showToast('No biometrics enrolled on this device');
      return;
    }
    // Signing in with a fingerprint means unlocking a stored password, so
    // there has to be one to store — and the account has to be asked for it.
    setBiometricPassword('');
    setConfirming(true);
  };

  const confirmBiometrics = async () => {
    if (enabling) return;
    setEnabling(true);
    const result = await enableBiometrics(biometricPassword);
    setEnabling(false);
    if (!result.ok) {
      if (result.message) showToast(result.message);
      return;
    }
    setConfirming(false);
    setBiometricPassword('');
    showToast(`${biometrics.label} sign-in is on`, 'success');
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
        <View>
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
        </View>

        <View style={styles.statRow}>
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
        </View>

        <View>
          <SectionHeader
            title="Accounts"
            subtitle="Where your money sits"
            actionLabel="Add account"
            onAction={() => setAddingAccount(true)}
          />
          {accounts.length === 0 ? (
            <NoAccountsNotice onAddAccount={() => setAddingAccount(true)} />
          ) : (
            <Card style={styles.listCard}>
              {accounts.map((account, index) => {
                const label = formatCurrency(account.balance, currency);
                return (
                  <View key={account.id}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.accountRow}>
                      <CategoryIcon icon={account.icon} color={account.color} size={40} />
                      {/* Name then balance. Nothing that looks like a card or
                          account number: the app never asks for one. */}
                      <View style={styles.accountText}>
                        <AppText variant="h3">{account.name}</AppText>
                        <AppText tabular style={styles.accountBalance}>
                          {hidden ? maskAmount(label) : label}
                        </AppText>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${account.name}`}
                        onPress={() => setDeletingAccount(account)}
                        hitSlop={8}
                        style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.6 }]}>
                        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>

        <View>
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
              label={`${biometrics.label} sign-in`}
              description={
                biometrics.enrolled
                  ? `Unlock CashFlow with ${biometrics.label} instead of your password`
                  : 'No biometrics are enrolled on this device'
              }
              accent="#A78BFA"
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
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
        </View>

        <View>
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
              onPress={() => router.push('/analytics')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="refresh"
              label="Reset all data"
              description="Restore the sample dataset"
              destructive
              onPress={() => setResetting(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="log-out-outline"
              label="Sign out"
              description="You will need your password or biometrics to get back in"
              destructive
              // Straight out, with nothing to confirm. Signing out destroys no
              // data and is undone by signing back in, so a prompt was only
              // ever a step between the user and what they asked for.
              onPress={signOut}
            />
          </Card>
        </View>

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

      <ConfirmDialog
        visible={resetting}
        icon="refresh"
        title="Erase everything?"
        message="Every transaction, budget, goal and debt you have entered will be wiped and the sample data restored."
        detail="This cannot be undone."
        confirmLabel="Yes, erase it all"
        cancelLabel="Keep my data"
        onConfirm={handleReset}
        onCancel={() => setResetting(false)}
      />

      <ConfirmDialog
        visible={!!deletingAccount}
        icon="trash"
        title={`Remove ${deletingAccount?.name ?? 'this account'}?`}
        message={`Its ${formatCurrency(deletingAccount?.balance ?? 0, currency)} balance comes out of your net balance.`}
        detail={
          accountTransactionCount > 0
            ? `${accountTransactionCount} transaction${accountTransactionCount === 1 ? '' : 's'} logged against it stay in your history.`
            : undefined
        }
        confirmLabel="Remove account"
        cancelLabel="Keep it"
        loading={removingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeletingAccount(null)}
      />

      <Modal
        visible={editing}
        transparent
        animationType="none"
        onRequestClose={() => setEditing(false)}>
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

      <Modal
        visible={confirming}
        transparent
        animationType="none"
        onRequestClose={() => setConfirming(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirming(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Turn on {biometrics.label}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Confirm your password once. It is kept in this device&apos;s secure storage so your{' '}
              {biometrics.label.toLowerCase()} can sign you in, and never leaves the phone.
            </AppText>

            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Password
              </AppText>
              <TextInput
                value={biometricPassword}
                onChangeText={setBiometricPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoFocus
                onSubmitEditing={confirmBiometrics}
              />
            </View>

            <Button
              label={`Turn on ${biometrics.label}`}
              onPress={confirmBiometrics}
              disabled={!biometricPassword}
              loading={enabling}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={addingAccount}
        transparent
        animationType="none"
        onRequestClose={() => setAddingAccount(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddingAccount(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Add new account</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Track a new bank account, wallet, or cash reserve.
            </AppText>

            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Account name
              </AppText>
              <TextInput
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="BOB, BNB, Cash"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Initial balance ({currency})
              </AppText>
              <TextInput
                value={newAccountBalance}
                onChangeText={setNewAccountBalance}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <Button
              label="Add account"
              icon="add-circle"
              onPress={handleSaveAccount}
              loading={savingAccount}
              disabled={!newAccountName.trim()}
            />
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
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
