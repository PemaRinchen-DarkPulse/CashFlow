import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { EmptyState } from '@/src/components/EmptyState';
import { NoAccountsNotice } from '@/src/components/NoAccountsNotice';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SettingRow } from '@/src/components/SettingRow';
import { SkeletonRow } from '@/src/components/Skeleton';
import { useToast } from '@/src/components/Toast';
import { useAuth } from '@/src/store/AuthContext';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Account } from '@/src/types';
import { formatDate } from '@/src/utils/date';
import { formatCurrency, maskAmount } from '@/src/utils/format';
import { pickAvatarImage, pickCoverImage } from '@/src/utils/goalImage';
import { updateMyName, MIN_PASSWORD_LENGTH } from '@/src/api/authApi';
import { updateServerPhotos } from '@/src/api/profileApi';

type PhotoSlot = 'avatar' | 'cover';

const CURRENCIES = [
  { symbol: 'Nu.', name: 'Bhutanese ngultrum' },
  { symbol: 'INR', name: 'Indian rupee' },
  { symbol: '$', name: 'US dollar' },
  { symbol: '€', name: 'Euro' },
] as const;

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
    updateCurrency,
    resetData,
    unreadCount,
    addAccount,
    renameAccount,
    deleteAccount,
    preferencesLoading,
    preferencesError,
    refreshPreferences,
  } = useFinance();
  const {
    biometrics,
    biometricEnabled,
    enableBiometrics,
    disableBiometrics,
    signOut,
    token,
    replaceAccount,
    changePassword,
    closeAccount,
  } = useAuth();
  const { showToast } = useToast();
  const { profile, accounts, transactions, settings, rewards } = state;
  const currency = profile.currency;
  const hidden = settings.hideBalance;

  const [confirming, setConfirming] = useState(false);
  const [biometricPassword, setBiometricPassword] = useState('');
  const [enabling, setEnabling] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [removingAccount, setRemovingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [renamingAccount, setRenamingAccount] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [pickingCurrency, setPickingCurrency] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [closingAccount, setClosingAccount] = useState(false);
  const [closePassword, setClosePassword] = useState('');
  const [closing, setClosing] = useState(false);
  const [photoSheet, setPhotoSheet] = useState<PhotoSlot | null>(null);
  const [uploading, setUploading] = useState<PhotoSlot | null>(null);

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

  const handleSetting = async (key: 'hideBalance' | 'budgetAlerts' | 'goalReminders' | 'weeklyDigest', value: boolean) => {
    const result = await updateSetting(key, value);
    if (!result.ok) showToast(result.message);
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

  const openNameEditor = () => {
    setDraftName(profile.name);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const name = draftName.trim();
    if (!name || savingName) return;
    if (!token) {
      showToast('Sign in to change your name');
      return;
    }

    setSavingName(true);
    const result = await updateMyName(token, name);
    setSavingName(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    await replaceAccount(result.data.user);
    setEditingName(false);
    showToast('Name updated', 'success');
  };

  const handlePickCurrency = async (symbol: string) => {
    setPickingCurrency(false);
    const result = await updateCurrency(symbol);
    if (!result.ok) showToast(result.message);
    else showToast('Currency updated', 'success');
  };

  const handleSaveAccountName = async () => {
    if (!editingAccount || renamingAccount) return;
    const name = editAccountName.trim();
    if (!name) return;

    setRenamingAccount(true);
    const result = await renameAccount(editingAccount.id, name);
    setRenamingAccount(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    setEditingAccount(null);
    showToast('Account renamed', 'success');
  };

  const handleChangePassword = async () => {
    if (savingPassword) return;
    if (nextPassword.length < MIN_PASSWORD_LENGTH) {
      showToast(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (nextPassword !== confirmPassword) {
      showToast('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    const result = await changePassword(currentPassword, nextPassword);
    setSavingPassword(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    setChangingPassword(false);
    setCurrentPassword('');
    setNextPassword('');
    setConfirmPassword('');
    showToast('Password updated', 'success');
  };

  const handleCloseAccount = async () => {
    if (closing) return;
    setClosing(true);
    const result = await closeAccount(closePassword);
    if (!result.ok) {
      setClosing(false);
      showToast(result.message);
      return;
    }
    // The session is already gone — this screen is unmounting. Clear leftover
    // local rewards so the next person on this phone does not inherit them.
    resetData();
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

  const openPhoto = (slot: PhotoSlot) => {
    if (uploading) return;
    const hasPhoto = slot === 'avatar' ? !!profile.avatar : !!profile.cover;
    if (hasPhoto) {
      setPhotoSheet(slot);
      return;
    }
    void choosePhoto(slot);
  };

  const choosePhoto = async (slot: PhotoSlot) => {
    setPhotoSheet(null);
    const picked = slot === 'avatar' ? await pickAvatarImage() : await pickCoverImage();
    if (!picked.ok) {
      if (picked.reason === 'denied') {
        showToast('CashFlow needs access to your photos to use one here.');
      }
      return;
    }
    if (!token) {
      showToast('Sign in to update your photo');
      return;
    }

    setUploading(slot);
    const result = await updateServerPhotos(
      token,
      slot === 'avatar' ? { avatar: picked.image } : { cover: picked.image }
    );
    setUploading(null);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    await replaceAccount(result.data.user);
  };

  const removePhoto = async (slot: PhotoSlot) => {
    setPhotoSheet(null);
    if (!token || uploading) return;

    setUploading(slot);
    const result = await updateServerPhotos(
      token,
      slot === 'avatar' ? { removeAvatar: true } : { removeCover: true }
    );
    setUploading(null);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    await replaceAccount(result.data.user);
  };

  const balanceLabel = formatCurrency(totalBalance, currency);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.hero}>
          <View style={[styles.heroWash, { paddingTop: insets.top + spacing.xs }]}>
            <View style={styles.heroBackdrop} pointerEvents="none">
              {profile.cover ? (
                <>
                  <Image
                    source={{ uri: profile.cover }}
                    style={styles.heroCover}
                    contentFit="cover"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <LinearGradient
                    colors={['rgba(5,9,11,0.5)', 'rgba(5,9,11,0.18)', 'rgba(5,9,11,0.55)'] as const}
                    style={StyleSheet.absoluteFill}
                  />
                </>
              ) : (
                <>
                  <LinearGradient
                    colors={['#1B5C3A', '#0C241C', colors.bg] as const}
                    locations={[0, 0.58, 1] as const}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.heroBlob} />
                </>
              )}
            </View>
            <View style={styles.heroBar}>
              <View style={styles.sinceChip}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <AppText variant="label" color={colors.textSecondary} numberOfLines={1}>
                  Since {formatDate(profile.memberSince)}
                </AppText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={profile.cover ? 'Change cover photo' : 'Add cover photo'}
              onPress={() => openPhoto('cover')}
              disabled={!!uploading}
              style={({ pressed }) => [styles.coverCamera, pressed && { opacity: 0.75 }]}>
              {uploading === 'cover' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Ionicons name="camera" size={18} color={colors.text} />
              )}
            </Pressable>
          </View>

          <View style={styles.avatarWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={profile.avatar ? 'Change profile photo' : 'Add profile photo'}
              onPress={() => openPhoto('avatar')}
              disabled={!!uploading}
              style={styles.avatarHalo}>
              <Avatar name={profile.name} size={AVATAR_SIZE} ring={false} uri={profile.avatar} />
              <View style={styles.avatarCamera}>
                {uploading === 'avatar' ? (
                  <ActivityIndicator size="small" color="#04140A" />
                ) : (
                  <Ionicons name="camera" size={14} color="#04140A" />
                )}
              </View>
            </Pressable>
          </View>

          <View style={styles.identity}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit display name"
              onPress={openNameEditor}
              style={({ pressed }) => [styles.identityNameHit, pressed && { opacity: 0.7 }]}>
              <AppText variant="h1" center numberOfLines={1} style={styles.identityName}>
                {profile.name}
              </AppText>
              <Ionicons name="pencil" size={14} color={colors.textMuted} />
            </Pressable>
            <AppText variant="body" color={colors.textMuted} center numberOfLines={1}>
              {profile.email}
            </AppText>
            <View style={styles.tier}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <AppText variant="caption" color={colors.primary}>
                {rewards.points.toLocaleString()} points
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.body}>
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
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Rename ${account.name}`}
                        onPress={() => {
                          setEditingAccount(account);
                          setEditAccountName(account.name);
                        }}
                        style={({ pressed }) => [styles.accountHit, pressed && { opacity: 0.7 }]}>
                        <CategoryIcon icon={account.icon} color={account.color} size={40} />
                        {/* Name then balance. Nothing that looks like a card or
                            account number: the app never asks for one. */}
                        <View style={styles.accountText}>
                          <AppText variant="h3">{account.name}</AppText>
                          <AppText tabular style={styles.accountBalance}>
                            {hidden ? maskAmount(label) : label}
                          </AppText>
                        </View>
                      </Pressable>
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
            {/*
              Hide-balance and currency belong to the server. Showing the seed
              defaults as if they were this user's, then flipping them when the
              real set arrives, is the half-loaded card all over again —
              skeleton, error, or the finished switches, never a guess.
              Biometrics stay on this device (the hardware is here) so that row
              is not gated with them.
            */}
            {preferencesLoading ? (
              <>
                <SkeletonRow lead={36} />
                <SkeletonRow lead={36} />
              </>
            ) : preferencesError ? (
              <EmptyState
                compact
                icon="cloud-offline-outline"
                title="Can't load preferences"
                body={`${preferencesError}. Your settings are safe — this device just cannot reach them right now.`}
                actionLabel="Try again"
                onAction={refreshPreferences}
              />
            ) : (
              <>
                <SettingRow
                  icon="eye-off"
                  label="Hide balances"
                  description="Mask amounts across the app"
                  value={settings.hideBalance}
                  onValueChange={(value) => handleSetting('hideBalance', value)}
                />
                <View style={styles.divider} />
                <SettingRow
                  icon="cash-outline"
                  label="Currency"
                  description="Shown beside every amount"
                  trailingText={currency}
                  onPress={() => setPickingCurrency(true)}
                />
              </>
            )}
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
              onPress={() => router.push('/goals')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="key-outline"
              label="Change password"
              description={`At least ${MIN_PASSWORD_LENGTH} characters`}
              onPress={() => {
                setCurrentPassword('');
                setNextPassword('');
                setConfirmPassword('');
                setChangingPassword(true);
              }}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="heart-outline"
              label="About CashFlow"
              description="Made by Pema Rinchen"
              onPress={() => router.push('/about')}
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
            <View style={styles.divider} />
            <SettingRow
              icon="trash-outline"
              label="Delete account"
              description="Permanently erase your CashFlow account"
              destructive
              onPress={() => {
                setClosePassword('');
                setClosingAccount(true);
              }}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
            <AppText variant="caption" color={colors.textSecondary}>
              Ledger and photos stay on your account.
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted} center style={styles.footerCopy}>
            Face ID and fingerprint never leave this phone. CashFlow never asks
            for a card or account number.
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            CashFlow · v1.0.0 · Made by Pema Rinchen
          </AppText>
        </View>
        </View>
      </ScrollView>

      <Modal
        visible={photoSheet !== null}
        transparent
        animationType="none"
        onRequestClose={() => setPhotoSheet(null)}>
        <View style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPhotoSheet(null)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">
              {photoSheet === 'cover' ? 'Cover photo' : 'Profile photo'}
            </AppText>
            <Button
              label="Choose photo"
              icon="image-outline"
              onPress={() => photoSheet && choosePhoto(photoSheet)}
              disabled={!!uploading}
            />
            <Button
              label="Remove photo"
              variant="danger"
              icon="trash-outline"
              onPress={() => photoSheet && removePhoto(photoSheet)}
              disabled={!!uploading}
            />
          </View>
        </View>
      </Modal>

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

      <Modal
        visible={editingName}
        transparent
        animationType="none"
        onRequestClose={() => setEditingName(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditingName(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Display name</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              This is what shows on your profile. Your email stays the same — it is how you sign in.
            </AppText>
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
                maxLength={80}
                onSubmitEditing={handleSaveName}
              />
            </View>
            <Button
              label="Save name"
              onPress={handleSaveName}
              loading={savingName}
              disabled={!draftName.trim()}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!editingAccount}
        transparent
        animationType="none"
        onRequestClose={() => setEditingAccount(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditingAccount(null)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Rename account</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              The balance stays put. Only the label changes.
            </AppText>
            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Account name
              </AppText>
              <TextInput
                value={editAccountName}
                onChangeText={setEditAccountName}
                placeholder="BOB, BNB, Cash"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoFocus
                maxLength={40}
                onSubmitEditing={handleSaveAccountName}
              />
            </View>
            <Button
              label="Save name"
              onPress={handleSaveAccountName}
              loading={renamingAccount}
              disabled={!editAccountName.trim()}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={pickingCurrency}
        transparent
        animationType="none"
        onRequestClose={() => setPickingCurrency(false)}>
        <View style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickingCurrency(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Currency</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              A symbol beside amounts. This does not convert what you have already logged.
            </AppText>
            {CURRENCIES.map((item) => {
              const selected = item.symbol === currency;
              return (
                <Pressable
                  key={item.symbol}
                  accessibilityRole="button"
                  onPress={() => handlePickCurrency(item.symbol)}
                  style={({ pressed }) => [
                    styles.currencyRow,
                    selected && styles.currencyRowSelected,
                    pressed && { opacity: 0.75 },
                  ]}>
                  <View>
                    <AppText variant="h3">{item.symbol}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {item.name}
                    </AppText>
                  </View>
                  {selected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal
        visible={changingPassword}
        transparent
        animationType="none"
        onRequestClose={() => setChangingPassword(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setChangingPassword(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Change password</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              Use the current one once, then pick a new one of at least {MIN_PASSWORD_LENGTH}{' '}
              characters.
            </AppText>
            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Current password
              </AppText>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoFocus
              />
            </View>
            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                New password
              </AppText>
              <TextInput
                value={nextPassword}
                onChangeText={setNextPassword}
                placeholder="New password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Confirm new password
              </AppText>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleChangePassword}
              />
            </View>
            <Button
              label="Update password"
              onPress={handleChangePassword}
              loading={savingPassword}
              disabled={!currentPassword || !nextPassword || !confirmPassword}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={closingAccount}
        transparent
        animationType="none"
        onRequestClose={() => setClosingAccount(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setClosingAccount(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Delete account?</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              This permanently erases your ledger, budgets, goals, debts, photos and the account
              itself. It cannot be undone.
            </AppText>
            <View style={styles.field}>
              <AppText variant="label" color={colors.textMuted}>
                Password
              </AppText>
              <TextInput
                value={closePassword}
                onChangeText={setClosePassword}
                placeholder="Confirm with your password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoFocus
                onSubmitEditing={handleCloseAccount}
              />
            </View>
            <Button
              label="Delete my account"
              variant="danger"
              icon="trash"
              onPress={handleCloseAccount}
              loading={closing}
              disabled={!closePassword}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenBackground>
  );
}

const AVATAR_SIZE = 104;
const AVATAR_HALO = 6;
const AVATAR_OUTER = AVATAR_SIZE + AVATAR_HALO * 2;

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  hero: {
    marginBottom: spacing.sm,
  },
  heroWash: {
    paddingHorizontal: spacing.xl,
    paddingBottom: AVATAR_OUTER / 2 + spacing.xxxl,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
    elevation: 0,
  },
  heroCover: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  heroBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 215, 91, 0.14)',
    top: -70,
    right: -50,
  },
  heroBar: {
    zIndex: 2,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sinceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 6,
    height: 44,
    maxWidth: '72%',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(23, 36, 43, 0.72)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  coverCamera: {
    position: 'absolute',
    right: spacing.xl,
    bottom: AVATAR_OUTER / 2 + spacing.xxl,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 8,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -AVATAR_OUTER / 2,
  },
  avatarHalo: {
    padding: AVATAR_HALO,
    borderRadius: AVATAR_OUTER / 2,
    backgroundColor: colors.bg,
  },
  avatarCamera: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  identity: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: 4,
  },
  identityNameHit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
  },
  identityName: {
    fontSize: 28,
    letterSpacing: -0.7,
    flexShrink: 1,
  },
  footerCopy: {
    paddingHorizontal: spacing.xl,
  },
  accountHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyRowSelected: {
    borderColor: colors.primary,
  },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  body: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
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
