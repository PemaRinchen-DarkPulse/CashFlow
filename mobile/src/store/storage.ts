import AsyncStorage from '@react-native-async-storage/async-storage';

import { ALL_CATEGORIES } from '@/src/data/categories';
import { createSeedState } from '@/src/data/seed';
import type { FinanceState } from '@/src/types';

// Bumped when a seeded default changes (Nu. currency, balances hidden by
// default): saved state wins over the seed during reconcile, so an older blob
// would keep the previous defaults.
const STORAGE_KEY = 'cashflow:state:v4';

/**
 * Everything the app keeps on the device. Accounts, goals, debts, budgets,
 * settings and the ledger are the parts that are not on this list: they belong
 * to the server, and are read back from it on every launch rather than
 * remembered here.
 */
type PersistedState = Omit<
  FinanceState,
  'accounts' | 'goals' | 'debts' | 'budgets' | 'settings' | 'transactions'
>;

/**
 * Merges a persisted blob over a fresh seed so that a state shape added in a
 * later release never lands as `undefined` on an existing install.
 */
function reconcile(raw: unknown): FinanceState {
  const seed = createSeedState();
  if (!raw || typeof raw !== 'object') return seed;
  const saved = raw as Partial<FinanceState>;

  return {
    profile: {
      ...seed.profile,
      ...saved.profile,
      // Currency rides with the preferences, not with the name on this device.
      currency: seed.profile.currency,
      // Signed per read, like a goal photo. A remembered link would 403 after
      // it lapsed, which is a hole in the avatar until the next launch fetch.
      avatar: undefined,
      cover: undefined,
    },
    // Never restored, even from a blob written by an older build that saved
    // them: the list starts empty and is whatever the server answers with. A
    // stale copy shown while that request is in flight would be a balance the
    // user cannot act on and might not still hold.
    accounts: [],
    // Categories are code-owned, not user data.
    categories: ALL_CATEGORIES,
    // Real `txn-…` rows from an older build are kept long enough for the
    // launch hand-off to POST them. Demo `seed-…` rows are skipped there and
    // then dropped when the server's lists replace both halves of the ledger.
    transactions: saved.transactions ?? [],
    // Never restored either. A remembered cap would sit on Analytics until the
    // fetch landed — or, worse, look like this month's limit after another
    // device had already changed it.
    budgets: [],
    // Not restored either. A goal card leads with a photo the server signs a
    // fresh link for on every read, so a remembered goal is one whose picture
    // cannot be fetched — it would draw as a card with a hole in it, which is
    // worse than the skeleton that stands in its place until the real list and
    // its images arrive together.
    goals: [],
    // Never restored either, and for a sharper reason than accounts: the debt
    // totals on the home screen are summed from this list, so a stale copy
    // would say someone owes money they have already been paid back.
    debts: [],
    notifications: saved.notifications ?? seed.notifications,
    rewards: { ...seed.rewards, ...saved.rewards },
    // Never restored. A second phone must not inherit this device's last
    // toggles, and this phone must not keep showing them while the real ones
    // are still on their way — that is a preference the user did not set here.
    settings: seed.settings,
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
    // Dropping these here is also what clears them from a device that still
    // holds a set written by an older build: the first save overwrites the blob
    // without them.
    const {
      accounts: _accounts,
      goals: _goals,
      debts: _debts,
      budgets: _budgets,
      settings: _settings,
      transactions: _transactions,
      ...rest
    } = state;
    const persisted: PersistedState = {
      ...rest,
      profile: {
        ...rest.profile,
        avatar: undefined,
        cover: undefined,
      },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
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
