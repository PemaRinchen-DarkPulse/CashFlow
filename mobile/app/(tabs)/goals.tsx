import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
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
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { DebtCard } from '@/src/components/DebtCard';
import { EmptyState } from '@/src/components/EmptyState';
import { Skeleton, SkeletonRow } from '@/src/components/Skeleton';
import { GoalCard } from '@/src/components/GoalCard';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Segmented } from '@/src/components/Segmented';
import { useToast } from '@/src/components/Toast';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Debt, Goal } from '@/src/types';
import { goalProgress, outstandingOf } from '@/src/utils/analytics';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

type Tab = 'goals' | 'debts';

const TABS: Tab[] = ['goals', 'debts'];

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const {
    state,
    contributeToGoal,
    repayDebt,
    deleteDebt,
    debts: debtTotals,
    netWorth,
    totalBalance,
    goalsLoading,
    goalsError,
    refreshGoals,
    debtsLoading,
    debtsError,
    refreshDebts,
  } =
    useFinance();
  const { showToast } = useToast();
  const { goals, debts, profile, rewards, accounts } = state;
  const currency = profile.currency;

  const [tab, setTab] = useState<Tab>(
    TABS.includes(params.tab as Tab) ? (params.tab as Tab) : 'goals'
  );
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [contribution, setContribution] = useState('');
  const [repaying, setRepaying] = useState<Debt | null>(null);
  const [repayment, setRepayment] = useState('');
  const [recordingRepayment, setRecordingRepayment] = useState(false);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [removingDebt, setRemovingDebt] = useState(false);

  // Deep links from Home carry the tab to open.
  useEffect(() => {
    if (TABS.includes(params.tab as Tab)) setTab(params.tab as Tab);
  }, [params.tab]);

  const goalTotals = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.target, 0);
    const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    return { target, saved, progress: target === 0 ? 0 : (saved / target) * 100 };
  }, [goals]);

  const closeContribution = () => {
    setContributing(null);
    setContribution('');
  };

  const submitContribution = () => {
    const amount = Number(contribution);
    if (!contributing || !Number.isFinite(amount) || amount <= 0) return;
    contributeToGoal(contributing.id, amount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    closeContribution();
  };

  const contributionAmount = Number(contribution);
  const contributionValid =
    Number.isFinite(contributionAmount) && contributionAmount > 0 && contributionAmount <= totalBalance;

  /** Open debts first, most recent first; settled ones drop to the bottom. */
  const sortedDebts = useMemo(
    () =>
      [...debts].sort((a, b) => {
        const openA = outstandingOf(a) > 0 ? 0 : 1;
        const openB = outstandingOf(b) > 0 ? 0 : 1;
        if (openA !== openB) return openA - openB;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [debts]
  );

  const closeRepayment = () => {
    setRepaying(null);
    setRepayment('');
  };

  /**
   * The repayment is recorded in the database before the sheet closes, and the
   * sheet stays open if it is refused — the amount typed is not worth losing to
   * a dropped connection, and a debt that still stands must not look settled.
   */
  const submitRepayment = async () => {
    const amount = Number(repayment);
    if (!repaying || recordingRepayment || !Number.isFinite(amount) || amount <= 0) return;

    setRecordingRepayment(true);
    const result = await repayDebt(repaying.id, amount);
    setRecordingRepayment(false);

    if (!result.ok) {
      showToast(result.message);
      return;
    }

    showToast('Repayment recorded', 'success');
    closeRepayment();
  };

  const handleDeleteDebt = async () => {
    if (!deletingDebt || removingDebt) return;

    setRemovingDebt(true);
    const result = await deleteDebt(deletingDebt.id);
    setRemovingDebt(false);
    setDeletingDebt(null);

    showToast(result.ok ? 'Record deleted' : result.message, result.ok ? 'success' : 'error');
  };

  const repayOutstanding = repaying ? outstandingOf(repaying) : 0;
  const repaymentAmount = Number(repayment);
  const repaymentValid =
    Number.isFinite(repaymentAmount) &&
    repaymentAmount > 0 &&
    repaymentAmount <= repayOutstanding &&
    // Paying someone back needs the cash on hand; being paid back does not.
    (repaying?.direction === 'lent' || repaymentAmount <= totalBalance);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl },
        ]}>
        <View>
          <AppText variant="h1">Plan</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Savings goals and debts
          </AppText>
        </View>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'goals', label: 'Goals' },
            { value: 'debts', label: 'Debts' },
          ]}
        />

        {tab === 'debts' ? (
          /*
            The tab is one thing, not two: the totals are summed from the same
            list the cards are drawn from, so releasing them separately would
            put "you owe nothing" above a list still arriving. Either the whole
            picture is ready, or none of it is shown.
          */
          debtsLoading ? (
            <>
              <Card style={styles.summarySkeleton}>
                <Skeleton width="46%" height={12} />
                <Skeleton width="64%" height={24} />
                <Skeleton width="88%" height={12} />
              </Card>
              <Card>
                <SkeletonRow lead={42} />
                <SkeletonRow lead={42} />
              </Card>
            </>
          ) : debtsError ? (
            <Card>
              <EmptyState
                icon="cloud-offline-outline"
                title="Can't load your debts"
                body={`${debtsError}. Your records are safe — this device just cannot reach them right now.`}
                actionLabel="Try again"
                onAction={refreshDebts}
              />
            </Card>
          ) : (
          <>
            <View>
              <Card style={styles.debtSummary}>
                <View style={styles.debtSplit}>
                  <View style={styles.debtBlock}>
                    <AppText variant="caption" color={colors.textMuted}>
                      You owe
                    </AppText>
                    <AppText tabular style={[styles.debtValue, { color: colors.warning }]}>
                      {formatCurrency(debtTotals.owed, currency, 0)}
                    </AppText>
                  </View>
                  <View style={styles.debtDivider} />
                  <View style={styles.debtBlock}>
                    <AppText variant="caption" color={colors.textMuted}>
                      Owed to you
                    </AppText>
                    <AppText tabular style={[styles.debtValue, { color: colors.info }]}>
                      {formatCurrency(debtTotals.lent, currency, 0)}
                    </AppText>
                  </View>
                </View>

                <View style={styles.netRow}>
                  <Ionicons
                    name={debtTotals.net >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={debtTotals.net >= 0 ? colors.primary : colors.warning}
                  />
                  <AppText variant="caption" color={colors.textSecondary}>
                    Real position {formatCurrency(netWorth, currency, 0)} — your balance after
                    debts are settled
                  </AppText>
                </View>
              </Card>
            </View>

            <View>
              <SectionHeader
                title="Friends & IOUs"
                subtitle="Borrowing is tracked apart from spending"
                actionLabel="Record"
                onAction={() => router.push('/add-debt')}
              />
              {debts.length === 0 ? (
                <Card>
                  <EmptyState
                    icon="people-outline"
                    title="No debts on record"
                    body="Borrowed from a friend, or covered someone else? Log it here and it stays out of your income and spending."
                    actionLabel="Record a debt"
                    onAction={() => router.push('/add-debt')}
                  />
                </Card>
              ) : (
                <View style={styles.goalList}>
                  {sortedDebts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      currency={currency}
                      onRepay={() => setRepaying(debt)}
                      onEdit={() =>
                        router.push({ pathname: '/edit-debt', params: { id: debt.id } })
                      }
                      onDelete={() => setDeletingDebt(debt)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
          )
        ) : goalsLoading ? (
          /* Same rule on this side: the total is summed from the list, and the
             cards lead with photos the context caches before releasing them. */
          <>
            <Card style={styles.summarySkeleton}>
              <Skeleton width="52%" height={12} />
              <Skeleton width="68%" height={28} />
              <Skeleton width="74%" height={12} />
            </Card>
            <Card>
              <SkeletonRow lead={42} />
              <SkeletonRow lead={42} />
            </Card>
          </>
        ) : goalsError ? (
          <Card>
            <EmptyState
              icon="cloud-offline-outline"
              title="Can't load your goals"
              body={`${goalsError}. Your goals are safe — this device just cannot reach them right now.`}
              actionLabel="Try again"
              onAction={refreshGoals}
            />
          </Card>
        ) : (
          <>
            <View>
              <Card>
                <AppText variant="caption" color={colors.textMuted}>
                  Total saved towards goals
                </AppText>
                <AppText tabular style={styles.goalTotal}>
                  {formatCurrency(goalTotals.saved, currency)}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {goalTotals.progress.toFixed(0)}% of {formatCurrency(goalTotals.target, currency, 0)}{' '}
                  across {goals.length} goal{goals.length === 1 ? '' : 's'}
                </AppText>
              </Card>
            </View>

            <View>
              <SectionHeader
                title="Savings goals"
                subtitle="Money set aside on purpose"
                actionLabel="New goal"
                onAction={() => router.push('/add-goal')}
              />
              {goals.length === 0 ? (
                <Card>
                  <EmptyState
                    icon="flag-outline"
                    title="No goals yet"
                    body="Name something you are saving for and track every contribution towards it."
                    actionLabel="Create a goal"
                    onAction={() => router.push('/add-goal')}
                  />
                </Card>
              ) : (
                <View style={styles.goalList}>
                  {[...goals]
                    .sort((a, b) => goalProgress(b) - goalProgress(a))
                    .map((goal, index) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        currency={currency}
                        onAddFunds={() => setContributing(goal)}
                      />
                    ))}
                </View>
              )}
            </View>
          </>
        )}

        <View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/rewards')}
            style={({ pressed }) => [styles.rewards, pressed && { opacity: 0.85 }]}>
            <View style={styles.trophy}>
              <Ionicons name="trophy" size={19} color={colors.primary} />
            </View>
            <View style={styles.rewardsText}>
              <AppText variant="h3">Rewards</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {rewards.points.toLocaleString()} points ·{' '}
                {rewards.badges.filter((badge) => badge.earned).length}/{rewards.badges.length} badges
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={!!deletingDebt}
        title="Delete this record?"
        message={
          deletingDebt
            ? `The ${deletingDebt.direction === 'borrowed' ? 'money you borrowed from' : 'money you lent'} ${deletingDebt.person} will no longer be tracked.`
            : ''
        }
        detail={
          deletingDebt && outstandingOf(deletingDebt) > 0
            ? `${formatCurrency(outstandingOf(deletingDebt), currency)} is still outstanding and will be ${
                deletingDebt.direction === 'borrowed' ? 'taken back out of' : 'returned to'
              } your balance.`
            : undefined
        }
        confirmLabel="Yes, delete it"
        cancelLabel="Keep it"
        loading={removingDebt}
        onConfirm={handleDeleteDebt}
        onCancel={() => setDeletingDebt(null)}
      />

      {/* Repayment sheet */}
      <Modal visible={!!repaying} transparent animationType="none" onRequestClose={closeRepayment}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeRepayment} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">
              {repaying?.direction === 'borrowed'
                ? `Pay ${repaying?.person} back`
                : `Received from ${repaying?.person}`}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {formatCurrency(repayOutstanding, currency)} still outstanding
            </AppText>

            <View style={styles.amountInputRow}>
              <AppText style={styles.currency}>{currency}</AppText>
              <TextInput
                value={repayment}
                onChangeText={(text) => setRepayment(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={styles.amountInput}
                autoFocus
              />
            </View>

            <View style={styles.quickAmounts}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRepayment(String(repayOutstanding))}
                style={({ pressed }) => [styles.quickAmount, pressed && { opacity: 0.7 }]}>
                <AppText variant="label" color={colors.primary}>
                  Settle in full
                </AppText>
              </Pressable>
              {[100, 500, 1000].map((amount) => (
                <Pressable
                  key={amount}
                  accessibilityRole="button"
                  onPress={() => setRepayment(String(Math.min(amount, repayOutstanding)))}
                  style={({ pressed }) => [styles.quickAmount, pressed && { opacity: 0.7 }]}>
                  <AppText variant="label" color={colors.textSecondary}>
                    {formatCurrency(amount, currency, 0)}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <Button
              label={
                recordingRepayment
                  ? 'Saving…'
                  : repaying?.direction === 'borrowed'
                    ? 'Record payment'
                    : 'Mark as received'
              }
              icon="checkmark-circle"
              loading={recordingRepayment}
              disabled={!repaymentValid || recordingRepayment}
              onPress={submitRepayment}
            />
            {repayment && !repaymentValid ? (
              <AppText variant="caption" color={colors.expense} center>
                {repaymentAmount > repayOutstanding
                  ? 'That is more than is outstanding.'
                  : 'Not enough in your balance to pay that back.'}
              </AppText>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Contribution sheet */}
      <Modal
        visible={!!contributing}
        transparent
        animationType="none"
        onRequestClose={closeContribution}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeContribution} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.grabber} />
            <AppText variant="h2">Add to {contributing?.name}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {accounts.length === 0
                ? 'Add an account in your profile first — a contribution moves money out of one.'
                : `Moves money from ${accounts[0].name} into Savings. Available: ${formatCurrency(totalBalance, currency)}`}
            </AppText>

            <View style={styles.amountInputRow}>
              <AppText style={styles.currency}>{currency}</AppText>
              <TextInput
                value={contribution}
                onChangeText={(text) => setContribution(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={styles.amountInput}
                autoFocus
              />
            </View>

            <View style={styles.quickAmounts}>
              {[25, 50, 100, 250].map((amount) => (
                <Pressable
                  key={amount}
                  accessibilityRole="button"
                  onPress={() => setContribution(String(amount))}
                  style={({ pressed }) => [styles.quickAmount, pressed && { opacity: 0.7 }]}>
                  <AppText variant="label" color={colors.textSecondary}>
                    {formatCurrency(amount, currency, 0)}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <Button
              label="Add to goal"
              icon="arrow-up-circle"
              disabled={!contributionValid}
              onPress={submitContribution}
            />
            {contribution && !contributionValid ? (
              <AppText variant="caption" color={colors.expense} center>
                Enter an amount up to your available balance.
              </AppText>
            ) : null}
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
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  overviewPercent: {
    fontFamily: font.extrabold,
    fontSize: 24,
    letterSpacing: -0.8,
    color: colors.text,
  },
  overviewText: {
    flex: 1,
    gap: 4,
  },
  overviewValue: {
    fontFamily: font.bold,
    fontSize: 24,
    letterSpacing: -0.7,
    color: colors.text,
    marginBottom: 2,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listCard: {
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },
  goalTotal: {
    fontFamily: font.extrabold,
    fontSize: 30,
    letterSpacing: -1,
    color: colors.text,
    marginVertical: 2,
  },
  goalList: {
    gap: spacing.md,
  },
  /** Stands in for a summary card: a label, a figure, and a line under it. */
  summarySkeleton: {
    gap: spacing.sm,
  },
  debtSummary: {
    gap: spacing.lg,
  },
  debtSplit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  debtValue: {
    fontFamily: font.bold,
    fontSize: 22,
    letterSpacing: -0.6,
  },
  debtDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.border,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
    padding: spacing.lg,
  },
  trophy: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsText: {
    flex: 1,
    gap: 2,
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
    gap: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHigh,
    marginBottom: spacing.sm,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  currency: {
    fontFamily: font.bold,
    fontSize: 24,
    color: colors.textSecondary,
  },
  amountInput: {
    fontFamily: font.extrabold,
    fontSize: 40,
    letterSpacing: -1.4,
    color: colors.text,
    minWidth: 120,
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickAmount: {
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
