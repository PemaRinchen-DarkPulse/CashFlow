import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Avatar } from '@/src/components/Avatar';
import { BalanceCard } from '@/src/components/BalanceCard';
import { BudgetRow } from '@/src/components/BudgetRow';
import { Card } from '@/src/components/Card';
import { DonutChart } from '@/src/components/charts/DonutChart';
import { EmptyState } from '@/src/components/EmptyState';
import { GoalCard } from '@/src/components/GoalCard';
import { NoAccountsNotice } from '@/src/components/NoAccountsNotice';
import { QuickAction } from '@/src/components/QuickAction';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { StatCard } from '@/src/components/StatCard';
import { TransactionRow } from '@/src/components/TransactionRow';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import {
  breakdownByCategory,
  budgetStatuses,
  categoryOf,
  goalProgress,
  monthTransactions,
  totalsOf,
} from '@/src/utils/analytics';
import { greeting } from '@/src/utils/date';
import { formatCurrency, maskAmount } from '@/src/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    state,
    totalBalance,
    unreadCount,
    streak,
    debts,
    netWorth,
    updateSetting,
    monthlyIncome,
    monthlyIncomeLoading,
    refreshMonthlyIncome,
    accountsLoading,
  } = useFinance();
  const { profile, transactions, categories, budgets, goals, settings, rewards } = state;
  const currency = profile.currency;
  const hidden = settings.hideBalance;

  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = monthTransactions(transactions, now);
    const totals = totalsOf(thisMonth);
    return {
      totals,
      breakdown: breakdownByCategory(thisMonth, categories).slice(0, 4),
      budgets: budgetStatuses(budgets, transactions, categories, now).slice(0, 3),
    };
  }, [transactions, categories, budgets]);

  const recent = transactions.slice(0, 5);
  const spotlightGoal = useMemo(
    () => [...goals].sort((a, b) => goalProgress(b) - goalProgress(a))[0],
    [goals]
  );

  const spentLabel = formatCurrency(summary.totals.expense, currency);

  // Earned comes from the database, not from the ledger on this device, so the
  // figure matches on every phone signed into the account. Until the server has
  // answered there is no total to show — a dash, rather than a number that
  // might be replaced a moment later.
  const earnedKnown = monthlyIncome !== null;
  const earnedLabel = earnedKnown ? formatCurrency(monthlyIncome, currency) : '—';

  /**
   * A card with nothing in it should say what to do about that. Three cases,
   * and only the last is a plain figure: the total is still on its way, the
   * server could not be reached and the read can be tried again, or there is
   * genuinely no income yet and the next step is to log some.
   */
  const earnedAction = !earnedKnown
    ? monthlyIncomeLoading
      ? null // The skeleton is showing; there is nothing to do but wait.
      : { label: 'Tap to retry', onPress: refreshMonthlyIncome }
    : monthlyIncome === 0
      ? {
          label: 'Add your first income',
          onPress: () => router.push('/add-transaction?kind=income'),
        }
      : null;

  const spentAction =
    summary.totals.expense === 0
      ? {
          label: 'Log your first expense',
          onPress: () => router.push('/add-transaction?kind=expense'),
        }
      : null;

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.identity}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <Avatar name={profile.name} size={46} />
            <View style={styles.greeting}>
              <AppText variant="caption" color={colors.textSecondary}>
                {greeting()},
              </AppText>
              <AppText variant="h2">{profile.name}</AppText>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => [styles.bell, pressed && { opacity: 0.7 }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {unreadCount > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        {/* Balance + quick actions */}
        <View>
          <BalanceCard
            balance={totalBalance}
            currency={currency}
            hidden={hidden}
            loading={accountsLoading}
            onToggleHidden={() => updateSetting('hideBalance', !hidden)}>
            <QuickAction
              label="Add"
              icon="add"
              primary
              onPress={() =>
                router.push({ pathname: '/add-transaction', params: { kind: 'expense' } })
              }
            />
            <QuickAction
              label="Income"
              icon="arrow-down"
              onPress={() =>
                router.push({ pathname: '/add-transaction', params: { kind: 'income' } })
              }
            />
            <QuickAction label="Borrow" icon="people" onPress={() => router.push('/add-debt')} />
            <QuickAction label="Budgets" icon="pie-chart" onPress={() => router.push('/analytics')} />
          </BalanceCard>
        </View>

        {/* A zero balance with no accounts behind it needs saying, not showing. */}
        <NoAccountsNotice
          title="Start with an account"
          body="Your balance is empty because there is nowhere to hold it yet. Add the bank account, wallet or cash you use."
        />

        {/* This month at a glance */}
        <View style={styles.statRow}>
          <StatCard
            label="Earned this month"
            value={hidden && earnedKnown ? maskAmount(earnedLabel) : earnedLabel}
            valueColor={colors.income}
            caption="Income recorded"
            loading={monthlyIncomeLoading && !earnedKnown}
            actionLabel={earnedAction?.label}
            onAction={earnedAction?.onPress}
          />
          <StatCard
            label="Spent this month"
            value={hidden ? maskAmount(spentLabel) : spentLabel}
            valueColor={colors.expense}
            caption={`Net ${formatCurrency(summary.totals.net, currency, 0)}`}
            actionLabel={spentAction?.label}
            onAction={spentAction?.onPress}
          />
        </View>

        {/* Where the money went */}
        <View style={styles.section}>
          <SectionHeader
            title="Where your money went"
            subtitle="This month by category"
            actionLabel="Details"
            onAction={() => router.push('/analytics')}
          />
          <Card>
            {summary.breakdown.length === 0 ? (
              <EmptyState
                compact
                icon="pie-chart-outline"
                title="No spending yet this month"
                body="Log an expense and this chart will show exactly where the money goes."
                actionLabel="Add an expense"
                onAction={() => router.push('/add-transaction?kind=expense')}
              />
            ) : (
              <View style={styles.breakdown}>
                <DonutChart
                  size={116}
                  strokeWidth={16}
                  data={summary.breakdown.map((item) => ({
                    value: item.total,
                    color: item.category.color,
                  }))}>
                  <AppText variant="caption" color={colors.textMuted}>
                    Spent
                  </AppText>
                  <AppText tabular style={styles.donutValue} numberOfLines={1}>
                    {formatCurrency(summary.totals.expense, currency, 0)}
                  </AppText>
                </DonutChart>

                <View style={styles.legend}>
                  {summary.breakdown.map((item) => (
                    <View key={item.category.id} style={styles.legendRow}>
                      <View style={[styles.dot, { backgroundColor: item.category.color }]} />
                      <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.legendName}>
                        {item.category.name}
                      </AppText>
                      <AppText variant="label" tabular>
                        {item.share.toFixed(0)}%
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Debts */}
        {debts.openCount > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Friends & IOUs"
              subtitle="Kept out of income and spending"
              actionLabel="Manage"
              onAction={() => router.push({ pathname: '/goals', params: { tab: 'debts' } })}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/goals', params: { tab: 'debts' } })}
              style={({ pressed }) => [styles.debtCard, pressed && { opacity: 0.85 }]}>
              <View style={styles.debtRow}>
                <View style={styles.debtBlock}>
                  <AppText variant="caption" color={colors.textMuted}>
                    You owe
                  </AppText>
                  <AppText tabular style={[styles.debtValue, { color: colors.warning }]}>
                    {hidden
                      ? maskAmount(formatCurrency(debts.owed, currency, 0))
                      : formatCurrency(debts.owed, currency, 0)}
                  </AppText>
                </View>
                <View style={styles.debtDivider} />
                <View style={styles.debtBlock}>
                  <AppText variant="caption" color={colors.textMuted}>
                    Owed to you
                  </AppText>
                  <AppText tabular style={[styles.debtValue, { color: colors.info }]}>
                    {hidden
                      ? maskAmount(formatCurrency(debts.lent, currency, 0))
                      : formatCurrency(debts.lent, currency, 0)}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={colors.textSecondary}>
                After settling up you would have{' '}
                {hidden
                  ? maskAmount(formatCurrency(netWorth, currency, 0))
                  : formatCurrency(netWorth, currency, 0)}
                .
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {/* Budgets */}
        {summary.budgets.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Budgets"
              subtitle="Monthly limits"
              actionLabel="Manage"
              onAction={() => router.push('/analytics')}
            />
            <Card style={styles.tightCard}>
              {summary.budgets.map((status, index) => (
                <BudgetRow
                  key={status.budget.id}
                  status={status}
                  currency={currency}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-budget',
                      params: { categoryId: status.category.id },
                    })
                  }
                />
              ))}
            </Card>
          </View>
        ) : null}

        {/* Recent transactions */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Transactions"
            actionLabel="See All"
            onAction={() => router.push('/transactions')}
          />
          <Card style={styles.tightCard}>
            {recent.length === 0 ? (
              <EmptyState
                compact
                icon="receipt-outline"
                title="Nothing logged yet"
                body="Record what you earn and spend, and it will all show up here."
                actionLabel="Add your first transaction"
                onAction={() => router.push('/add-transaction')}
              />
            ) : (
              recent.map((transaction, index) => (
                <View key={transaction.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <TransactionRow
                    transaction={transaction}
                    category={categoryOf(categories, transaction.categoryId)}
                    currency={currency}
                    hidden={hidden}
                    onPress={() =>
                      router.push({
                        pathname: '/transaction/[id]',
                        params: { id: transaction.id },
                      })
                    }
                  />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Savings spotlight */}
        {spotlightGoal ? (
          <View style={styles.section}>
            <SectionHeader
              title="Savings Goal"
              actionLabel="All goals"
              onAction={() => router.push({ pathname: '/goals', params: { tab: 'goals' } })}
            />
            <GoalCard
              goal={spotlightGoal}
              currency={currency}
              onPress={() => router.push({ pathname: '/goals', params: { tab: 'goals' } })}
            />
          </View>
        ) : null}

        {/* Rewards */}
        <View style={styles.section}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/rewards')}
            style={({ pressed }) => [styles.rewards, pressed && { opacity: 0.85 }]}>
            <View style={styles.flameWrap}>
              <Ionicons name="flame" size={20} color={colors.primary} />
            </View>
            <View style={styles.rewardsText}>
              <AppText variant="h3">
                {streak > 0 ? `${streak}-day tracking streak` : 'Start a tracking streak'}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {rewards.points.toLocaleString()} points earned · keep it going
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  greeting: {
    gap: 1,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: 0,
  },
  tightCard: {
    paddingVertical: spacing.sm,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  donutValue: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.4,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendName: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
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
  flameWrap: {
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
  debtCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  debtRow: {
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
    fontSize: 20,
    letterSpacing: -0.5,
  },
  debtDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
});
