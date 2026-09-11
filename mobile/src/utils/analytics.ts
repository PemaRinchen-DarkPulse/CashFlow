import { FALLBACK_CATEGORY } from '@/src/data/categories';
import type { Budget, Category, Debt, Goal, Transaction } from '@/src/types';
import {
  addDays,
  addMonths,
  daysInMonth,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from '@/src/utils/date';

export type Totals = { income: number; expense: number; net: number };

export type CategoryBreakdown = {
  category: Category;
  total: number;
  /** 0-100 */
  share: number;
  count: number;
};

export type BudgetStatus = {
  budget: Budget;
  category: Category;
  spent: number;
  /** 0-100, clamped for the progress bar. */
  progress: number;
  remaining: number;
  state: 'safe' | 'warning' | 'over';
};

export function categoryOf(categories: Category[], id: string): Category {
  return categories.find((item) => item.id === id) ?? FALLBACK_CATEGORY;
}

export function inRange(transaction: Transaction, from: Date, to: Date): boolean {
  const time = new Date(transaction.date).getTime();
  return time >= from.getTime() && time <= to.getTime();
}

export function filterRange(transactions: Transaction[], from: Date, to: Date): Transaction[] {
  return transactions.filter((item) => inRange(item, from, to));
}

export function totalsOf(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const item of transactions) {
    if (item.kind === 'income') income += item.amount;
    else expense += item.amount;
  }
  return { income, expense, net: income - expense };
}

export function monthTransactions(transactions: Transaction[], month: Date): Transaction[] {
  return filterRange(transactions, startOfMonth(month), endOfMonth(month));
}

/**
 * The 1st of `month` through the same day-of-month as `reference`. Comparing a
 * part-way-through month against a *whole* previous month would overstate every
 * "spending is down" claim, so trends use this window on both sides.
 */
export function monthToDate(
  transactions: Transaction[],
  month: Date,
  reference = new Date()
): Transaction[] {
  const day = Math.min(reference.getDate(), daysInMonth(month));
  const to = new Date(month.getFullYear(), month.getMonth(), day, 23, 59, 59, 999);
  return filterRange(transactions, startOfMonth(month), to);
}

/** Percentage change from `previous` to `current`; 0 when there is no baseline. */
export function changePercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function breakdownByCategory(
  transactions: Transaction[],
  categories: Category[],
  kind: 'income' | 'expense' = 'expense'
): CategoryBreakdown[] {
  const totals = new Map<string, { total: number; count: number }>();
  let grand = 0;

  for (const item of transactions) {
    if (item.kind !== kind) continue;
    const entry = totals.get(item.categoryId) ?? { total: 0, count: 0 };
    entry.total += item.amount;
    entry.count += 1;
    totals.set(item.categoryId, entry);
    grand += item.amount;
  }

  return [...totals.entries()]
    .map(([categoryId, entry]) => ({
      category: categoryOf(categories, categoryId),
      total: entry.total,
      count: entry.count,
      share: grand === 0 ? 0 : (entry.total / grand) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

export function budgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month = new Date()
): BudgetStatus[] {
  const scoped = monthTransactions(transactions, month);

  return budgets
    .map((budget) => {
      const spent = scoped
        .filter((item) => item.kind === 'expense' && item.categoryId === budget.categoryId)
        .reduce((sum, item) => sum + item.amount, 0);
      const ratio = budget.limit === 0 ? 0 : (spent / budget.limit) * 100;
      return {
        budget,
        category: categoryOf(categories, budget.categoryId),
        spent,
        progress: Math.min(ratio, 100),
        remaining: budget.limit - spent,
        state: ratio >= 100 ? ('over' as const) : ratio >= 80 ? ('warning' as const) : ('safe' as const),
      };
    })
    .sort((a, b) => b.progress - a.progress);
}

/** What is still open on a debt; never negative, even after an overpayment. */
export function outstandingOf(debt: Debt): number {
  return Math.max(debt.principal - debt.repaid, 0);
}

/**
 * What a debt has done to the balance of the account it went through, once
 * repayments are taken off: borrowed cash still held is money in hand, money
 * still out on loan has left.
 *
 * Recording a debt applies this, deleting one takes it back off, and editing
 * one does both — so a record that changes amount, direction or account lands
 * the same way whichever of the three it was.
 */
export function cashEffectOf(debt: Debt): number {
  const outstanding = outstandingOf(debt);
  return debt.direction === 'borrowed' ? outstanding : -outstanding;
}

export type DebtSummary = {
  /** Still owed to friends. */
  owed: number;
  /** Still owed to you. */
  lent: number;
  /** `lent - owed`: what the debts add to, or take from, your position. */
  net: number;
  openCount: number;
};

export function debtSummary(debts: Debt[]): DebtSummary {
  let owed = 0;
  let lent = 0;
  let openCount = 0;

  for (const debt of debts) {
    const outstanding = outstandingOf(debt);
    if (outstanding <= 0) continue;
    openCount += 1;
    if (debt.direction === 'borrowed') owed += outstanding;
    else lent += outstanding;
  }

  return { owed, lent, net: lent - owed, openCount };
}

export function goalProgress(goal: Goal): number {
  if (goal.target <= 0) return 0;
  return Math.min((goal.saved / goal.target) * 100, 100);
}

/** Longest run of consecutive days with at least one transaction, ending today or yesterday. */
export function trackingStreak(transactions: Transaction[], now = new Date()): number {
  const days = new Set(transactions.map((item) => startOfDay(new Date(item.date)).getTime()));
  if (days.size === 0) return 0;

  const today = startOfDay(now).getTime();
  const yesterday = startOfDay(addDays(now, -1)).getTime();
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : 0;
  if (cursor === 0) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = startOfDay(addDays(new Date(cursor), -1)).getTime();
  }
  return streak;
}

export type Insight = {
  id: string;
  title: string;
  body: string;
  tone: 'positive' | 'warning' | 'neutral';
};

/** Plain-language answers to "where did my money go?" for the analytics screen. */
export function buildInsights(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  now = new Date()
): Insight[] {
  const insights: Insight[] = [];
  const thisMonth = monthTransactions(transactions, now);
  const lastMonth = monthToDate(transactions, addMonths(startOfMonth(now), -1), now);
  const current = totalsOf(thisMonth);
  const previous = totalsOf(lastMonth);

  const spendChange = changePercent(current.expense, previous.expense);
  if (previous.expense > 0) {
    // Under a point either way is noise, not a trend worth an arrow.
    const steady = Math.abs(spendChange) < 1;
    insights.push({
      id: 'spend-trend',
      title: steady ? 'Spending is steady' : spendChange < 0 ? 'Spending is down' : 'Spending is up',
      body: steady
        ? 'You are within a percent of the same point last month.'
        : spendChange < 0
          ? `You have spent ${Math.abs(spendChange).toFixed(0)}% less than the same point last month.`
          : `You are ${spendChange.toFixed(0)}% above last month’s spending. Ease off the top category to catch up.`,
      tone: steady ? 'neutral' : spendChange < 0 ? 'positive' : 'warning',
    });
  }

  const breakdown = breakdownByCategory(thisMonth, categories);
  const top = breakdown[0];
  if (top) {
    insights.push({
      id: 'top-category',
      title: `${top.category.name} leads your spending`,
      body: `${top.share.toFixed(0)}% of this month’s outgoings went to ${top.category.name.toLowerCase()} across ${top.count} transaction${top.count === 1 ? '' : 's'}.`,
      tone: 'neutral',
    });
  }

  const savingsRate = current.income === 0 ? 0 : (current.net / current.income) * 100;
  if (current.income > 0) {
    insights.push({
      id: 'savings-rate',
      title: `You are keeping ${Math.max(savingsRate, 0).toFixed(0)}% of your income`,
      body:
        savingsRate >= 20
          ? 'That is above the 20% benchmark — a solid month for your goals.'
          : 'Aim for 20% to stay ahead of your savings goals.',
      tone: savingsRate >= 20 ? 'positive' : 'warning',
    });
  }

  const over = budgetStatuses(budgets, transactions, categories, now).filter((s) => s.state !== 'safe');
  if (over.length > 0) {
    insights.push({
      id: 'budget-alert',
      title: `${over.length} budget${over.length > 1 ? 's need' : ' needs'} attention`,
      body: over
        .slice(0, 2)
        .map((item) => `${item.category.name} at ${item.progress.toFixed(0)}%`)
        .join(' · '),
      tone: 'warning',
    });
  }

  return insights;
}
