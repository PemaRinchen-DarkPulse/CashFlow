import type { Category } from '@/src/types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drinks', icon: 'fast-food', color: '#FF8A3D', kind: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'cart', color: '#2DD4BF', kind: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#A78BFA', kind: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'bus', color: '#4DA3FF', kind: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: '#FFB020', kind: 'expense' },
  { id: 'fun', name: 'Entertainment', icon: 'game-controller', color: '#F472B6', kind: 'expense' },
  { id: 'health', name: 'Health', icon: 'medkit', color: '#FF5C6C', kind: 'expense' },
  { id: 'learning', name: 'Education', icon: 'school', color: '#60A5FA', kind: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#34D399', kind: 'expense' },
  { id: 'subs', name: 'Subscriptions', icon: 'repeat', color: '#C084FC', kind: 'expense' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#94A3B8', kind: 'expense' },
];

/** Salary is the only regular income; the catch-all covers the odd one-off. */
export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#1DD75B', kind: 'income' },
  { id: 'other-income', name: 'Other Income', icon: 'wallet', color: '#94A3B8', kind: 'income' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const FALLBACK_CATEGORY: Category = {
  id: 'unknown',
  name: 'Uncategorized',
  icon: 'help-circle',
  color: '#94A3B8',
  kind: 'expense',
};
