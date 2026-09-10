import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { BudgetRow } from '@/src/components/BudgetRow';
import { Card } from '@/src/components/Card';
import { CategoryIcon, withAlpha } from '@/src/components/CategoryIcon';
import { Chip } from '@/src/components/Chip';
import { DonutChart } from '@/src/components/charts/DonutChart';
import { EmptyState } from '@/src/components/EmptyState';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import {
  breakdownByCategory,
  budgetStatuses,
  buildInsights,
  changePercent,
  filterRange,
  monthToDate,
  monthTransactions,
  totalsOf,
} from '@/src/utils/analytics';
import { addDays, addMonths, monthLabel, startOfDay, startOfMonth, startOfWeek } from '@/src/utils/date';
import { formatCurrency, formatPercent } from '@/src/utils/format';

type Period = 'week' | 'month' | 'year';

const TONE_COLOR = {
  positive: colors.primary,
  warning: colors.warning,
  neutral: colors.info,
} as const;

const TONE_ICON = {
  positive: 'trending-up',
  warning: 'alert-circle',
  neutral: 'information-circle',
} as const;

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useFinance();
  const { transactions, categories, budgets, profile } = state;
  const currency = profile.currency;

  const [period, setPeriod] = useState<Period>('month');

  const data = useMemo(() => {
    const now = new Date();

    if (period === 'week') {
      const from = startOfWeek(now);
      const scoped = filterRange(transactions, from, addDays(startOfDay(now), 1));
      const previous = filterRange(transactions, addDays(from, -7), from);
      return {
        label: 'This week',
        scoped,
        totals: totalsOf(scoped),
        previousTotals: totalsOf(previous),
      };
    }

    if (period === 'year') {
      const from = new Date(now.getFullYear(), 0, 1);
      const scoped = filterRange(transactions, from, now);
      const previous = filterRange(
        transactions,
        new Date(now.getFullYear() - 1, 0, 1),
        new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
      );
      return {
        label: String(now.getFullYear()),
        scoped,
        totals: totalsOf(scoped),
        previousTotals: totalsOf(previous),
      };
    }

    const scoped = monthTransactions(transactions, now);
    // Same window last month, so a part-way month is not judged against a full one.
    const previous = monthToDate(transactions, addMonths(startOfMonth(now), -1), now);
    return {
      label: `${monthLabel(now)} ${now.getFullYear()}`,
      scoped,
      totals: totalsOf(scoped),
      previousTotals: totalsOf(previous),
    };
  }, [transactions, period]);

  const breakdown = useMemo(
    () => breakdownByCategory(data.scoped, categories),
    [data.scoped, categories]
  );

  const budgetList = useMemo(
    () => budgetStatuses(budgets, transactions, categories),
    [budgets, transactions, categories]
  );

  const insights = useMemo(
    () => buildInsights(transactions, categories, budgets),
    [transactions, categories, budgets]
  );

  const topMerchants = useMemo(() => {
    const totals = new Map<string, { total: number; count: number; categoryId: string }>();
    for (const item of data.scoped) {
      if (item.kind !== 'expense') continue;
      const entry = totals.get(item.title) ?? { total: 0, count: 0, categoryId: item.categoryId };
      entry.total += item.amount;
      entry.count += 1;
      totals.set(item.title, entry);
    }
    return [...totals.entries()]
      .map(([title, entry]) => ({ title, ...entry }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data.scoped]);

  const spendChange = changePercent(data.totals.expense, data.previousTotals.expense);
  const steadySpend = Math.abs(spendChange) < 1;
  const savingsRate =
    data.totals.income === 0 ? 0 : Math.max((data.totals.net / data.totals.income) * 100, 0);
  const dailyAverage = useMemo(() => {
    const now = new Date();
    const days =
      period === 'week'
        ? Math.max(((now.getTime() - startOfWeek(now).getTime()) / 86_400_000) | 0, 1)
        : period === 'month'
          ? now.getDate()
          : Math.max(
              ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000) | 0,
              1
            );
    return data.totals.expense / days;
  }, [data.totals.expense, period]);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl },
        ]}>
        <View>
          <AppText variant="h1">Analytics</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {data.label}
          </AppText>
        </View>

        <View style={styles.periodRow}>
          {(['week', 'month', 'year'] as Period[]).map((value) => (
            <Chip
              key={value}
              label={value === 'week' ? 'Week' : value === 'month' ? 'Month' : 'Year'}
              selected={period === value}
              onPress={() => setPeriod(value)}
            />
          ))}
        </View>

        {/* Spend vs earn */}
        <View>
          <Card>
            <View style={styles.totalsBlock}>
                <AppText variant="caption" color={colors.textMuted}>
                  Total spent
                </AppText>
                <AppText tabular style={styles.bigNumber}>
                  {formatCurrency(data.totals.expense, currency)}
                </AppText>
                <View style={styles.changeRow}>
                  {steadySpend ? (
                    <Ionicons name="remove" size={12} color={colors.textSecondary} />
                  ) : (
                    <Ionicons
                      name={spendChange < 0 ? 'arrow-down' : 'arrow-up'}
                      size={12}
                      color={spendChange < 0 ? colors.primary : colors.expense}
                    />
                  )}
                  <AppText
                    variant="caption"
                    color={
                      steadySpend
                        ? colors.textSecondary
                        : spendChange < 0
                          ? colors.primary
                          : colors.expense
                    }>
                    {steadySpend ? 'About level' : formatPercent(Math.abs(spendChange), 0)}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {period === 'month' ? 'vs same point last month' : 'vs previous'}
                  </AppText>
                </View>
            </View>
          </Card>
        </View>

        {/* Health metrics */}
        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <AppText variant="caption" color={colors.textMuted}>
              Savings rate
            </AppText>
            <AppText tabular style={styles.metricValue}>
              {savingsRate.toFixed(0)}%
            </AppText>
            <ProgressBar value={savingsRate} height={6} />
          </Card>
          <Card style={styles.metricCard}>
            <AppText variant="caption" color={colors.textMuted}>
              Avg. per day
            </AppText>
            <AppText tabular style={styles.metricValue}>
              {formatCurrency(dailyAverage, currency, 0)}
            </AppText>
            <ProgressBar
              value={Math.min((dailyAverage / Math.max(data.totals.income / 30, 1)) * 100, 100)}
              height={6}
              color={colors.warning}
            />
          </Card>
        </View>

        {/* Category breakdown */}
        <View>
          <SectionHeader title="Spending by category" subtitle={data.label} />
          <Card>
            {breakdown.length === 0 ? (
              <EmptyState
                icon="pie-chart-outline"
                title="Nothing to break down yet"
                body="Log a few expenses and this chart will show exactly where the money goes."
                actionLabel="Add transaction"
                onAction={() => router.push('/add-transaction')}
              />
            ) : (
              <>
                <View style={styles.donutWrap}>
                  <DonutChart
                    size={180}
                    strokeWidth={22}
                    data={breakdown.map((item) => ({
                      value: item.total,
                      color: item.category.color,
                    }))}>
                    <AppText variant="caption" color={colors.textMuted}>
                      Total out
                    </AppText>
                    <AppText tabular style={styles.donutValue}>
                      {formatCurrency(data.totals.expense, currency, 0)}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {data.scoped.filter((item) => item.kind === 'expense').length} payments
                    </AppText>
                  </DonutChart>
                </View>

                <View style={styles.breakdownList}>
                  {breakdown.map((item, index) => (
                    <View key={item.category.id} style={styles.breakdownRow}>
                      <CategoryIcon
                        icon={item.category.icon}
                        color={item.category.color}
                        size={36}
                      />
                      <View style={styles.breakdownMiddle}>
                        <View style={styles.breakdownTop}>
                          <AppText variant="bodyMedium" numberOfLines={1}>
                            {item.category.name}
                          </AppText>
                          <AppText tabular variant="bodyMedium">
                            {formatCurrency(item.total, currency, 0)}
                          </AppText>
                        </View>
                        <ProgressBar
                          value={item.share}
                          color={item.category.color}
                          height={6}
                        />
                        <AppText variant="caption" color={colors.textMuted}>
                          {item.share.toFixed(1)}% · {item.count} transaction
                          {item.count === 1 ? '' : 's'}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Category Budgets */}
        <View>
          <SectionHeader
            title="Category budgets"
            subtitle="Tap a budget to adjust it"
            actionLabel="Add"
            onAction={() => router.push('/edit-budget')}
          />
          {budgetList.length === 0 ? (
            <Card>
              <EmptyState
                icon="pie-chart-outline"
                title="No budgets yet"
                body="Set a monthly limit on the categories you want to keep in check."
                actionLabel="Create a budget"
                onAction={() => router.push('/edit-budget')}
              />
            </Card>
          ) : (
            <Card style={styles.listCard}>
              {budgetList.map((status, index) => (
                <View key={status.budget.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <BudgetRow
                    status={status}
                    currency={currency}
                    onPress={() =>
                      router.push({
                        pathname: '/edit-budget',
                        params: { categoryId: status.category.id },
                      })
                    }
                  />
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Top merchants */}
        {topMerchants.length > 0 ? (
          <View>
            <SectionHeader title="Biggest payees" subtitle="Where it adds up fastest" />
            <Card style={styles.merchantCard}>
              {topMerchants.map((merchant, index) => (
                <View key={merchant.title} style={styles.merchantRow}>
                  <AppText variant="label" color={colors.textMuted} style={styles.rank}>
                    {index + 1}
                  </AppText>
                  <View style={styles.merchantMiddle}>
                    <AppText variant="bodyMedium" numberOfLines={1}>
                      {merchant.title}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {merchant.count} payment{merchant.count === 1 ? '' : 's'}
                    </AppText>
                  </View>
                  <AppText tabular variant="bodyMedium">
                    {formatCurrency(merchant.total, currency, 0)}
                  </AppText>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Insights */}
        {insights.length > 0 ? (
          <View>
            <SectionHeader title="Insights" subtitle="What changed this month" />
            <View style={styles.insightList}>
              {insights.map((insight) => (
                <Card key={insight.id} style={styles.insightCard}>
                  <View
                    style={[
                      styles.insightIcon,
                      { backgroundColor: withAlpha(TONE_COLOR[insight.tone], 0.16) },
                    ]}>
                    <Ionicons
                      name={TONE_ICON[insight.tone]}
                      size={17}
                      color={TONE_COLOR[insight.tone]}
                    />
                  </View>
                  <View style={styles.insightText}>
                    <AppText variant="h3">{insight.title}</AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={styles.insightBody}>
                      {insight.body}
                    </AppText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/transactions')}
          style={({ pressed }) => [styles.footerLink, pressed && { opacity: 0.7 }]}>
          <AppText variant="label" color={colors.primary}>
            See every transaction
          </AppText>
          <Ionicons name="arrow-forward" size={15} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  totalsBlock: {
    gap: 2,
  },
  bigNumber: {
    fontFamily: font.extrabold,
    fontSize: 28,
    letterSpacing: -1,
    color: colors.text,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  metricValue: {
    fontFamily: font.bold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: colors.text,
  },
  donutWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  donutValue: {
    fontFamily: font.extrabold,
    fontSize: 21,
    letterSpacing: -0.7,
    color: colors.text,
    marginVertical: 1,
  },
  breakdownList: {
    gap: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  breakdownMiddle: {
    flex: 1,
    gap: 5,
  },
  breakdownTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  merchantCard: {
    gap: spacing.lg,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    width: 18,
  },
  merchantMiddle: {
    flex: 1,
    gap: 1,
  },
  insightList: {
    gap: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    gap: 3,
  },
  insightBody: {
    lineHeight: 17,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  listCard: {
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },
});
