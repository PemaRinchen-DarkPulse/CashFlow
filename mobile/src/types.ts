import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type TransactionKind = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  kind: TransactionKind;
};

export type Transaction = {
  id: string;
  title: string;
  categoryId: string;
  /** Always positive. `kind` carries the direction. */
  amount: number;
  kind: TransactionKind;
  /** ISO date string. */
  date: string;
  note?: string;
  accountId: string;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon: IconName;
};

export type Budget = {
  id: string;
  categoryId: string;
  /** Monthly cap in the app currency. */
  limit: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** ISO date string for the target date. */
  deadline: string;
  icon: IconName;
  /**
   * A picture of the thing being saved for, shown in place of `icon` when set.
   * A `file://` URI inside the app's own document directory, not the one the
   * picker hands back — see `pickGoalImage`.
   *
   * `icon` stays required and keeps working as the fallback, so goals made
   * before this existed, and goals nobody picks a photo for, are unaffected.
   */
  image?: string;
  color: string;
};

/**
 * Money borrowed from (or lent to) someone. A debt is a liability, not income:
 * it moves cash in and out of an account but never counts as earning or
 * spending, so it stays out of every budget and analytics figure.
 */
export type Debt = {
  id: string;
  /** Who the money is with. */
  person: string;
  /** `borrowed` = you owe them. `lent` = they owe you. */
  direction: 'borrowed' | 'lent';
  /** The original amount, unchanged as repayments come in. */
  principal: number;
  /** How much has been settled so far. */
  repaid: number;
  date: string;
  note?: string;
  /** Which account the cash moved through. */
  accountId: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  date: string;
  icon: IconName;
  tone: 'positive' | 'warning' | 'neutral';
  read: boolean;
};

export type Profile = {
  name: string;
  email: string;
  memberSince: string;
  currency: string;
  /** Presigned URL for the round photo. Not persisted — signed per read. */
  avatar?: string;
  /** Presigned URL for the banner. Not persisted — signed per read. */
  cover?: string;
};

/**
 * The streak is intentionally absent: it is derived from the ledger by
 * `trackingStreak` so it can never drift from the transactions on screen.
 */
export type Rewards = {
  points: number;
  badges: { id: string; name: string; icon: IconName; earned: boolean; hint: string }[];
};

/**
 * Biometric sign-in is deliberately absent: it belongs to the account, not the
 * ledger, so it lives in `AuthContext` beside the credentials it guards.
 */
export type Settings = {
  hideBalance: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  weeklyDigest: boolean;
};

export type FinanceState = {
  profile: Profile;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  notifications: AppNotification[];
  rewards: Rewards;
  settings: Settings;
};
