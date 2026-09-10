import AsyncStorage from '@react-native-async-storage/async-storage';

import { ALL_CATEGORIES } from '@/src/data/categories';
import { createSeedState } from '@/src/data/seed';
import type { FinanceState } from '@/src/types';

// Bumped when a seeded default changes (Nu. currency, balances hidden by
// default): saved state wins over the seed during reconcile, so an older blob
// would keep the previous defaults.
const STORAGE_KEY = 'cashflow:state:v4';

/**
 * Everything the app keeps on the device. Accounts are the one part of the
 * ledger that is not on this list: they belong to the server, and are read back
 * from it on every launch rather than remembered here.
 */
type PersistedState = Omit<FinanceState, 'accounts'>;

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
    // Never restored, even from a blob written by an older build that saved
    // them: the list starts empty and is whatever the server answers with. A
    // stale copy shown while that request is in flight would be a balance the
    // user cannot act on and might not still hold.
    accounts: [],
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
    // Dropping accounts here is also what clears them from a device that still
    // holds a set written by an older build: the first save overwrites the blob
    // without them.
    const { accounts: _accounts, ...persisted } = state;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted satisfies PersistedState));
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
