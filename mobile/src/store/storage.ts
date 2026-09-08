import AsyncStorage from '@react-native-async-storage/async-storage';

import { ALL_CATEGORIES } from '@/src/data/categories';
import { createSeedState } from '@/src/data/seed';
import type { FinanceState } from '@/src/types';

// Bumped when a seeded default changes (Nu. currency, balances hidden by
// default): saved state wins over the seed during reconcile, so an older blob
// would keep the previous defaults.
const STORAGE_KEY = 'cashflow:state:v4';

/**
 * Merges a persisted blob over a fresh seed so that a state shape added in a
 * later release never lands as `undefined` on an existing install.
 */
function reconcile(raw: unknown): FinanceState {
  const seed = createSeedState();
  if (!raw || typeof raw !== 'object') return seed;
  const saved = raw as Partial<FinanceState>;

  return {
    profile: { ...seed.profile, ...saved.profile },
    accounts: saved.accounts?.length ? saved.accounts : seed.accounts,
    // Categories are code-owned, not user data.
    categories: ALL_CATEGORIES,
    transactions: saved.transactions ?? seed.transactions,
    budgets: saved.budgets ?? seed.budgets,
    goals: saved.goals ?? seed.goals,
    debts: saved.debts ?? seed.debts,
    notifications: saved.notifications ?? seed.notifications,
    rewards: { ...seed.rewards, ...saved.rewards },
    settings: { ...seed.settings, ...saved.settings },
  };
}

export async function loadState(): Promise<FinanceState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return reconcile(JSON.parse(raw));
  } catch {
    // A corrupt or unreadable blob should never block app start.
    return createSeedState();
  }
}

export async function saveState(state: FinanceState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort; the in-memory state stays authoritative.
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
