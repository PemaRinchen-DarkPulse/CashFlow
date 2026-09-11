import { Image } from 'expo-image';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { createSeedState } from '@/src/data/seed';
import { clearState, loadState, saveState } from '@/src/store/storage';
import {
  createServerAccount,
  deleteServerAccount,
  fetchServerAccounts,
  updateServerAccount,
} from '@/src/api/accountsApi';
import {
  createServerBudget,
  deleteServerBudget,
  fetchServerBudgets,
  updateServerBudget,
} from '@/src/api/budgetsApi';
import {
  createServerDebt,
  deleteServerDebt,
  fetchServerDebts,
  updateServerDebt,
} from '@/src/api/debtsApi';
import {
  createServerExpense,
  deleteServerExpense,
  fetchServerExpenses,
} from '@/src/api/expensesApi';
import {
  createServerIncome,
  deleteServerIncome,
  fetchServerIncomes,
} from '@/src/api/incomesApi';
import { useAuth } from '@/src/store/AuthContext';
import type {
  Account,
  Budget,
  Category,
  Debt,
  FinanceState,
  Goal,
  IconName,
  Settings,
  Transaction,
  TransactionKind,
} from '@/src/types';
import {
  cashEffectOf,
  debtSummary,
  outstandingOf,
  trackingStreak,
  type DebtSummary,
} from '@/src/utils/analytics';
import { endOfMonth, startOfMonth } from '@/src/utils/date';
import {
  createServerGoal,
  deleteServerGoal,
  fetchServerGoals,
  updateServerGoal,
  type GoalImageUpload,
} from '@/src/api/goalsApi';
import {
  fetchServerPreferences,
  updateServerPreferences,
  type ServerPreferences,
} from '@/src/api/preferencesApi';

/**
 * How many expenses one launch asks for. Matches the server's cap, so the list
 * the phone draws is the list the database holds rather than a page of it.
 */
const EXPENSE_LIST_LIMIT = 2000;
const INCOME_LIST_LIMIT = 2000;

/** Points awarded for healthy habits. */
const POINTS_PER_LOG = 5;
const POINTS_PER_CONTRIBUTION = 25;
const POINTS_PER_REPAYMENT = 15;

/**
 * How long the goal list waits on its pictures before giving up on them.
 *
 * A stalled image must not hold the list back for ever — that turns "loading"
 * into its own kind of broken. Past this the cards are handed over and anything
 * still missing falls back to the goal's icon.
 */
const GOAL_IMAGE_WARM_MS = 8000;

/**
 * Pull every goal's picture into the image cache before the goals are handed to
 * the screens.
 *
 * A goal card leads with a photo, so releasing the list the moment the JSON
 * lands draws a row of cards with holes in them that fill in one at a time.
 * Waiting here folds the pictures into `goalsLoading`, so every screen reading
 * that flag shows either a finished card or a skeleton, never half of one.
 *
 * Failures are swallowed rather than propagated: a picture that has expired or
 * cannot be reached is no reason to withhold the goal it belongs to.
 */
async function warmGoalImages(goals: Goal[]): Promise<void> {
  const urls = goals.map((goal) => goal.image).filter((url): url is string => !!url);
  if (urls.length === 0) return;

  await Promise.race([
    Promise.all(urls.map((url) => Image.prefetch(url).catch(() => false))),
    new Promise((resolve) => setTimeout(resolve, GOAL_IMAGE_WARM_MS)),
  ]);
}

export type NewTransaction = {
  title: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  date: string;
  note?: string;
  accountId?: string;
};

type Action =
  | { type: 'hydrate'; state: FinanceState }
  | { type: 'addTransaction'; transaction: Transaction }
  | { type: 'deleteTransaction'; id: string }
  | { type: 'setExpenses'; expenses: Transaction[] }
  | { type: 'setIncomes'; incomes: Transaction[] }
  | { type: 'setBudgets'; budgets: Budget[] }
  | { type: 'replaceBudget'; budget: Budget }
  | { type: 'deleteBudget'; id: string }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'addDebt'; debt: Debt }
  | { type: 'repayDebt'; id: string; amount: number }
  | { type: 'deleteDebt'; id: string }
  | { type: 'setDebts'; debts: Debt[] }
  | { type: 'replaceDebt'; debt: Debt }
  | { type: 'contributeToGoal'; id: string; amount: number }
  | { type: 'deleteGoal'; id: string }
  | { type: 'addAccount'; account: Account }
  | { type: 'deleteAccount'; id: string }
  | { type: 'setAccounts'; accounts: Account[] }
  | { type: 'setGoals'; goals: Goal[] }
  | { type: 'replaceGoal'; goal: Goal }
  | { type: 'updateSetting'; key: keyof Settings; value: boolean }
  | { type: 'setPreferences'; preferences: ServerPreferences }
  | { type: 'setIdentity'; name: string; email: string; memberSince: string; avatar?: string; cover?: string }
  | { type: 'updateProfile'; name: string; email: string }
  | { type: 'readNotifications' }
  | { type: 'clearNotifications' }
  | { type: 'reset'; state: FinanceState };

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function adjustBalance(accounts: Account[], accountId: string, delta: number): Account[] {
  return accounts.map((account) =>
    account.id === accountId
      ? { ...account, balance: Math.round((account.balance + delta) * 100) / 100 }
      : account
  );
}

function adjustAccount(state: FinanceState, accountId: string, delta: number) {
  return adjustBalance(state.accounts, accountId, delta);
}

function withPoints(state: FinanceState, points: number): FinanceState['rewards'] {
  return { ...state.rewards, points: state.rewards.points + points };
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'hydrate':
    case 'reset':
      return action.state;

    case 'addTransaction': {
      const { transaction } = action;
      const delta = transaction.kind === 'income' ? transaction.amount : -transaction.amount;
      const next: FinanceState = {
        ...state,
        transactions: [transaction, ...state.transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        accounts: adjustAccount(state, transaction.accountId, delta),
      };
      return { ...next, rewards: withPoints(next, POINTS_PER_LOG) };
    }

    case 'deleteTransaction': {
      const target = state.transactions.find((item) => item.id === action.id);
      if (!target) return state;
      // Reverse the original balance effect.
      const delta = target.kind === 'income' ? -target.amount : target.amount;
      return {
        ...state,
        transactions: state.transactions.filter((item) => item.id !== action.id),
        accounts: adjustAccount(state, target.accountId, delta),
      };
    }

    /**
     * The server's expense list, swapped in for whatever this device had been
     * holding. Income stays: it has its own collection and its own sync. The
     * two halves of the ledger meet here because the screens still read one
     * `transactions` array.
     */
    case 'setExpenses': {
      const kept = state.transactions.filter((item) => item.kind !== 'expense');
      return {
        ...state,
        transactions: [...kept, ...action.expenses].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    }

    /** Same swap for the income half. Activity then holds only what the database has. */
    case 'setIncomes': {
      const kept = state.transactions.filter((item) => item.kind !== 'income');
      return {
        ...state,
        transactions: [...kept, ...action.incomes].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    }

    case 'setBudgets':
      return { ...state, budgets: action.budgets };

    /** The server's copy of one budget, after a write it confirmed. */
    case 'replaceBudget': {
      const exists = state.budgets.some((item) => item.id === action.budget.id);
      if (exists) {
        return {
          ...state,
          budgets: state.budgets.map((item) =>
            item.id === action.budget.id ? action.budget : item
          ),
        };
      }
      return { ...state, budgets: [...state.budgets, action.budget] };
    }

    case 'deleteBudget':
      return { ...state, budgets: state.budgets.filter((item) => item.id !== action.id) };

    case 'addGoal':
      return { ...state, goals: [...state.goals, action.goal] };

    case 'contributeToGoal': {
      const goal = state.goals.find((item) => item.id === action.id);
      if (!goal) return state;
      // A contribution is a transfer, not spending: it moves cash from the
      // everyday account into savings, so it never shows up as an expense.
      const everyday = state.accounts[0];
      // Nothing to move it out of. The screens block this, so reaching here
      // means the account went away mid-edit.
      if (!everyday) return state;
      const savings = state.accounts.find((item) => item.id === 'acc-savings') ?? everyday;
      let accounts = adjustAccount(state, everyday.id, -action.amount);
      accounts = accounts.map((account) =>
        account.id === savings.id && savings.id !== everyday.id
          ? { ...account, balance: Math.round((account.balance + action.amount) * 100) / 100 }
          : account
      );
      const next: FinanceState = {
        ...state,
        accounts,
        goals: state.goals.map((item) =>
          item.id === action.id
            ? { ...item, saved: Math.min(item.saved + action.amount, item.target) }
            : item
        ),
      };
      return { ...next, rewards: withPoints(next, POINTS_PER_CONTRIBUTION) };
    }

    case 'deleteGoal':
      return { ...state, goals: state.goals.filter((item) => item.id !== action.id) };

    case 'addDebt': {
      // Borrowing puts cash in the account; lending takes it out. Neither is
      // income or spending, so no transaction is written.
      return {
        ...state,
        debts: [action.debt, ...state.debts],
        accounts: adjustAccount(state, action.debt.accountId, cashEffectOf(action.debt)),
      };
    }

    case 'repayDebt': {
      const debt = state.debts.find((item) => item.id === action.id);
      if (!debt) return state;
      // Never record more than is outstanding.
      const amount = Math.min(action.amount, outstandingOf(debt));
      if (amount <= 0) return state;
      // Paying a friend back moves cash out; being paid back moves it in.
      const delta = debt.direction === 'borrowed' ? -amount : amount;
      const next: FinanceState = {
        ...state,
        debts: state.debts.map((item) =>
          item.id === debt.id
            ? { ...item, repaid: Math.round((item.repaid + amount) * 100) / 100 }
            : item
        ),
        accounts: adjustAccount(state, debt.accountId, delta),
      };
      return { ...next, rewards: withPoints(next, POINTS_PER_REPAYMENT) };
    }

    case 'deleteDebt': {
      const debt = state.debts.find((item) => item.id === action.id);
      if (!debt) return state;
      // Unwind only the part that still stands: borrowed cash still held has to
      // leave the balance again, money still out on loan comes back.
      return {
        ...state,
        debts: state.debts.filter((item) => item.id !== action.id),
        accounts: adjustAccount(state, debt.accountId, -cashEffectOf(debt)),
      };
    }

    /** The server's list, which is the list — as with accounts and goals. */
    case 'setDebts':
      return { ...state, debts: action.debts };

    /**
     * The server's copy of one debt, after an edit it confirmed. The balance is
     * moved by the difference between the two versions rather than recomputed,
     * so an edit that switches account takes the cash out of the old one and
     * puts it into the new one.
     */
    case 'replaceDebt': {
      const previous = state.debts.find((item) => item.id === action.debt.id);
      if (!previous) return state;
      let accounts = adjustBalance(state.accounts, previous.accountId, -cashEffectOf(previous));
      accounts = adjustBalance(accounts, action.debt.accountId, cashEffectOf(action.debt));
      return {
        ...state,
        accounts,
        debts: state.debts.map((item) => (item.id === action.debt.id ? action.debt : item)),
      };
    }

    case 'addAccount':
      return { ...state, accounts: [...state.accounts, action.account] };

    case 'deleteAccount':
      // Transactions booked against it are left alone: the history of what was
      // spent stays true even once the account it went through is gone.
      return { ...state, accounts: state.accounts.filter((item) => item.id !== action.id) };

    case 'setAccounts':
      return { ...state, accounts: action.accounts };

    case 'setGoals':
      return { ...state, goals: action.goals };

    /** The server's copy of one goal, after a write it confirmed. */
    case 'replaceGoal':
      return {
        ...state,
        goals: state.goals.map((item) => (item.id === action.goal.id ? action.goal : item)),
      };

    case 'updateSetting':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };

    /**
     * The complete set the server holds. Settings and currency travel together
     * because they are one document there — applying one without the other
     * would leave a phone showing Nu. next to someone who switched currency.
     */
    case 'setPreferences': {
      const { currency, ...settings } = action.preferences;
      return {
        ...state,
        settings,
        profile: { ...state.profile, currency },
      };
    }

    case 'setIdentity':
      return {
        ...state,
        profile: {
          ...state.profile,
          name: action.name,
          email: action.email,
          memberSince: action.memberSince,
          avatar: action.avatar,
          cover: action.cover,
        },
      };

    case 'updateProfile':
      return { ...state, profile: { ...state.profile, name: action.name, email: action.email } };

    case 'readNotifications':
      return {
        ...state,
        notifications: state.notifications.map((item) => ({ ...item, read: true })),
      };

    case 'clearNotifications':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

/** What a write that has to reach the server before it counts resolves with. */
export type MutationResult = { ok: true } | { ok: false; message: string };

/**
 * The fields an edit can change. `repaid` is absent on purpose: settling a debt
 * goes through `repayDebt`, which knows what is still outstanding, rather than
 * through a form where a typo would silently rewrite the payment history.
 */
export type DebtEdit = Partial<Omit<Debt, 'id' | 'repaid'>>;

type FinanceContextValue = {
  state: FinanceState;
  hydrated: boolean;
  /** True while the account list is being read back from the server. */
  accountsLoading: boolean;
  /** Why the last read failed, or null. An empty list means nothing until this is null. */
  accountsError: string | null;
  /**
   * This month's income as the database holds it. `null` while it is unknown —
   * not yet read, or the read failed — which is not the same as zero.
   */
  monthlyIncome: number | null;
  monthlyIncomeLoading: boolean;
  /** Ask for another read — what the offline retry on the home screen calls. */
  refreshMonthlyIncome: () => void;
  /** Cash across all accounts — borrowed money sitting here is included. */
  totalBalance: number;
  debts: DebtSummary;
  /** Cash minus what you owe, plus what is owed to you. */
  netWorth: number;
  categoryById: (id: string) => Category | undefined;
  unreadCount: number;
  /** Consecutive days with at least one logged transaction, derived from the ledger. */
  streak: number;
  addTransaction: (input: NewTransaction) => Promise<MutationResult>;
  deleteTransaction: (id: string) => Promise<MutationResult>;
  /** Spending is unknown until the server answers — not the same as none. */
  expensesLoading: boolean;
  expensesError: string | null;
  refreshExpenses: () => void;
  /**
   * The Activity list is both halves of the ledger. Either side still loading
   * means the list is not ready — showing income while spending is unknown
   * would be a half-drawn ledger.
   */
  transactionsLoading: boolean;
  transactionsError: string | null;
  refreshTransactions: () => void;
  /** Saved to the server first: the cap it hands back is the one kept locally. */
  setBudget: (categoryId: string, limit: number) => Promise<MutationResult>;
  /** Removed from the server first, so a refused delete leaves the list intact. */
  deleteBudget: (id: string) => Promise<MutationResult>;
  /** The budget list is unknown until the server answers — not the same as empty. */
  budgetsLoading: boolean;
  budgetsError: string | null;
  refreshBudgets: () => void;
  /** Saved to the server first: the goal it hands back is the one kept locally. */
  addGoal: (
    input: Omit<Goal, 'id' | 'image'>,
    image?: GoalImageUpload | null
  ) => Promise<MutationResult>;
  contributeToGoal: (id: string, amount: number) => void;
  /** Removed from the server first, so a refused delete leaves the list intact. */
  deleteGoal: (id: string) => Promise<MutationResult>;
  /** The goal list is unknown until the server answers — not the same as empty. */
  goalsLoading: boolean;
  goalsError: string | null;
  refreshGoals: () => void;
  /** Saved to the server first: the id it hands back is the one kept locally. */
  addAccount: (input: {
    name: string;
    balance?: number;
    color?: string;
    icon?: IconName;
  }) => Promise<MutationResult>;
  /** Removed from the server first, so a refused delete leaves the list intact. */
  deleteAccount: (id: string) => Promise<MutationResult>;
  refreshAccounts: () => void;
  /** Saved to the server first: the record it hands back is the one kept locally. */
  addDebt: (input: Omit<Debt, 'id' | 'repaid'> & { repaid?: number }) => Promise<MutationResult>;
  /** Correct a record. Every field is optional; omitted ones are left alone. */
  updateDebt: (id: string, input: DebtEdit) => Promise<MutationResult>;
  /** Recorded on the server first, so a refused write leaves the debt as it was. */
  repayDebt: (id: string, amount: number) => Promise<MutationResult>;
  /** Removed from the server first, so a refused delete leaves the list intact. */
  deleteDebt: (id: string) => Promise<MutationResult>;
  /** The debt list is unknown until the server answers — not the same as empty. */
  debtsLoading: boolean;
  debtsError: string | null;
  refreshDebts: () => void;
  /**
   * The switch moves immediately so it does not fight the finger, and a refused
   * write puts it back. A setting that did not save is not left looking as if
   * it had.
   */
  updateSetting: (key: keyof Settings, value: boolean) => Promise<MutationResult>;
  /** The preferences are unknown until the server answers — not the seed defaults. */
  preferencesLoading: boolean;
  preferencesError: string | null;
  refreshPreferences: () => void;
  updateProfile: (name: string, email: string) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  resetData: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => createSeedState());
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = useReducer(() => true, false);
  // Starts true: the list is unknown until the server answers, and that is not
  // the same as knowing it is empty. Screens tell the two apart so a list on its
  // way cannot flash "no accounts yet" first.
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  // Bumped to ask for another read of the server's list.
  const [accountsRefresh, setAccountsRefresh] = useState(0);

  /**
   * This month's income, as the database has it. `null` means the figure is not
   * known yet — the request is out, or it failed — which the home screen tells
   * apart from a real zero rather than showing a total nobody has confirmed.
   */
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [monthlyIncomeLoading, setMonthlyIncomeLoading] = useState(true);
  const [incomeRefresh, setIncomeRefresh] = useState(0);

  /**
   * Goals live in the database, like accounts. Starts true for the same reason:
   * an empty list is not the same as a list that has not arrived, and the
   * screens need to tell those apart before saying "no goals yet".
   */
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [goalsRefresh, setGoalsRefresh] = useState(0);

  /** Debts live in the database too, and start unknown for the same reason. */
  const [debtsLoading, setDebtsLoading] = useState(true);
  const [debtsError, setDebtsError] = useState<string | null>(null);
  const [debtsRefresh, setDebtsRefresh] = useState(0);

  /** Budgets live in the database too, and start unknown for the same reason. */
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);
  const [budgetsRefresh, setBudgetsRefresh] = useState(0);

  /**
   * How the account is set up. Starts unknown: the seed's toggles are a
   * placeholder, not this user's preferences, and must not be treated as such
   * until the server has answered.
   */
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesRefresh, setPreferencesRefresh] = useState(0);

  /** Spending lives in the database, and starts unknown for the same reason. */
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [expensesRefresh, setExpensesRefresh] = useState(0);

  /** Income rows for the ledger, separate from this month's summed total. */
  const [incomesLoading, setIncomesLoading] = useState(true);
  const [incomesError, setIncomesError] = useState<string | null>(null);
  const [incomesRefresh, setIncomesRefresh] = useState(0);

  const auth = useAuth();
  const token = auth?.token;

  /**
   * The balance the server last confirmed for each account. Spending moves a
   * balance locally the moment it is logged; this is what tells the push below
   * which of those moves the server has not been told about yet.
   */
  const syncedBalances = useRef(new Map<string, number>());

  /**
   * The ledger as it stands right now, for the income reconcile below to read
   * without listing `state.transactions` as a dependency — that would re-run
   * the whole sync on every unrelated edit. The writes that do change income
   * bump `incomeRefresh` explicitly instead.
   */
  const transactionsRef = useRef(state.transactions);
  transactionsRef.current = state.transactions;

  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (!active) return;
      dispatch({ type: 'hydrate', state: loaded });
      hydratedRef.current = true;
      setHydrated();
    });
    return () => {
      active = false;
    };
  }, []);

  /**
   * The account list, read from the database on every launch.
   *
   * Nothing on the device stands in for it: what the server answers with is the
   * list, empty included. A request that fails leaves `accountsLoading` off with
   * nothing loaded, which is what the screens read to say the accounts could not
   * be reached rather than that there are none.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setAccountsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setAccountsLoading(true);
      const res = await fetchServerAccounts(token);
      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setAccounts', accounts: res.data.accounts });
        syncedBalances.current = new Map(res.data.accounts.map((item) => [item.id, item.balance]));
        setAccountsError(null);
      } else {
        setAccountsError(res.message);
      }
      setAccountsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, accountsRefresh]);

  /**
   * The goal list, read from the database on every launch.
   *
   * As with accounts, nothing on the device stands in for it: what the server
   * answers with is the list, empty included. The seeded goals a fresh install
   * starts with are replaced the moment the server answers, so a signed-in user
   * sees their own goals rather than the demo ones.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setGoalsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setGoalsLoading(true);
      const res = await fetchServerGoals(token);
      if (!active) return;

      if (res.ok) {
        // Nothing is released until the pictures are cached as well, so the
        // list appears complete rather than filling itself in photo by photo.
        await warmGoalImages(res.data.goals);
        if (!active) return;

        dispatch({ type: 'setGoals', goals: res.data.goals });
        setGoalsError(null);
      } else {
        setGoalsError(res.message);
      }
      setGoalsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, goalsRefresh]);

  /**
   * The debt list, read from the database on every launch.
   *
   * As with accounts and goals, what the server answers with is the list, empty
   * included. It matters more here than anywhere: the "you owe" and "owed to
   * you" totals are summed from this list, and a stale local copy would put a
   * figure on the home screen that nobody owes anybody.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setDebtsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setDebtsLoading(true);
      const res = await fetchServerDebts(token);
      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setDebts', debts: res.data.debts });
        setDebtsError(null);
      } else {
        setDebtsError(res.message);
      }
      setDebtsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, debtsRefresh]);

  /**
   * The budget list, read from the database on every launch.
   *
   * As with debts, what the server answers with is the list, empty included. A
   * stale local copy would put last month's caps on Analytics while this phone
   * had already raised them from another device.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setBudgetsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setBudgetsLoading(true);
      const res = await fetchServerBudgets(token);
      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setBudgets', budgets: res.data.budgets });
        setBudgetsError(null);
      } else {
        setBudgetsError(res.message);
      }
      setBudgetsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, budgetsRefresh]);

  /**
   * How this account is set up, read on every launch.
   *
   * A second phone must not invent its own defaults: hide-balance, alerts and
   * currency are properties of the account, not of the device. Nothing stored
   * locally stands in for them — a failed read leaves the seed values on screen
   * only as a placeholder the Profile screen refuses to treat as the user's.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setPreferencesLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setPreferencesLoading(true);
      const res = await fetchServerPreferences(token);
      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setPreferences', preferences: res.data.preferences });
        setPreferencesError(null);
      } else {
        setPreferencesError(res.message);
      }
      setPreferencesLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, preferencesRefresh]);

  /**
   * The name and email belong to the session, not to this phone's seed. Without
   * this, a second device greets "Pema" until someone edits the profile by
   * hand — the same class of lie as default preferences.
   */
  useEffect(() => {
    const account = auth?.account;
    if (!hydrated || !account) return;
    dispatch({
      type: 'setIdentity',
      name: account.name,
      email: account.email,
      memberSince: account.createdAt,
      avatar: account.avatar,
      cover: account.cover,
    });
  }, [hydrated, auth?.account]);

  /**
   * Spending, read from the database on every launch.
   *
   * A second phone must not invent a blank ledger: expenses belong to the
   * account. Local copies that this device made before the collection existed
   * are handed over first (same id, so a retry cannot double-count), then the
   * server's list replaces the expense half of `transactions`. Income is left
   * alone — it has its own sync.
   *
   * Balances are not touched here. They already moved when the expense was
   * logged, and the accounts fetch is what the home screen totals.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setExpensesLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setExpensesLoading(true);

      let res = await fetchServerExpenses(token, { limit: EXPENSE_LIST_LIMIT });
      if (!active) return;

      if (res.ok) {
        const stored = new Set(res.data.expenses.map((expense) => expense.id));
        const pending = transactionsRef.current.filter((item) => {
          if (item.kind !== 'expense' || stored.has(item.id)) return false;
          if (!item.accountId) return false;
          // Demo rows from the old seed must not become this user's spending.
          if (item.id.startsWith('seed-')) return false;
          return true;
        });

        if (pending.length) {
          await Promise.all(
            pending.map((item) =>
              createServerExpense(token, {
                id: item.id,
                title: item.title,
                accountId: item.accountId,
                categoryId: item.categoryId,
                amount: item.amount,
                date: item.date,
                note: item.note,
              })
            )
          );
          if (!active) return;
          res = await fetchServerExpenses(token, { limit: EXPENSE_LIST_LIMIT });
          if (!active) return;
        }
      }

      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setExpenses', expenses: res.data.expenses });
        setExpensesError(null);
      } else {
        setExpensesError(res.message);
      }
      setExpensesLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, expensesRefresh]);

  /**
   * Income rows, read from the database on every launch.
   *
   * Activity used to mix these with the seed's demo salary. That list is not
   * this user's, so it is thrown away: what the server answers with is the
   * income half, empty included. Local `txn-…` rows from before this existed
   * are handed over first, the same way expenses are.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setIncomesLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setIncomesLoading(true);

      let res = await fetchServerIncomes(token, { limit: INCOME_LIST_LIMIT });
      if (!active) return;

      if (res.ok) {
        const stored = new Set(res.data.incomes.map((income) => income.id));
        const pending = transactionsRef.current.filter((item) => {
          if (item.kind !== 'income' || stored.has(item.id)) return false;
          if (!item.accountId) return false;
          if (item.id.startsWith('seed-')) return false;
          return true;
        });

        if (pending.length) {
          await Promise.all(
            pending.map((item) =>
              createServerIncome(token, {
                id: item.id,
                title: item.title,
                accountId: item.accountId,
                categoryId: item.categoryId,
                amount: item.amount,
                date: item.date,
                note: item.note,
              })
            )
          );
          if (!active) return;
          res = await fetchServerIncomes(token, { limit: INCOME_LIST_LIMIT });
          if (!active) return;
        }
      }

      if (!active) return;

      if (res.ok) {
        dispatch({ type: 'setIncomes', incomes: res.data.incomes });
        setIncomesError(null);
      } else {
        setIncomesError(res.message);
      }
      setIncomesLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, incomesRefresh]);

  /**
   * This month's income total, read from the database rather than summed on
   * device. The rows themselves are loaded by the list fetch above; this is
   * only the figure the home screen shows, over the current month.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setMonthlyIncomeLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setMonthlyIncomeLoading(true);

      const now = new Date();
      const res = await fetchServerIncomes(token, {
        from: startOfMonth(now).toISOString(),
        to: endOfMonth(now).toISOString(),
      });
      if (!active) return;

      setMonthlyIncome(res.ok ? res.data.total : null);
      setMonthlyIncomeLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [token, hydrated, incomeRefresh]);

  /**
   * Push balances the ledger has moved. Logging a transaction, contributing to
   * a goal and settling a debt all change an account's balance locally; without
   * this the next sign-in would read the stale figure back and the change would
   * look like it had been undone.
   */
  useEffect(() => {
    if (!token || !hydrated) return;
    const timeout = setTimeout(() => {
      state.accounts.forEach((account) => {
        const synced = syncedBalances.current.get(account.id);
        // Already in step, or an account this session has not read from the
        // server and so has no confirmed figure to compare against.
        if (synced === undefined || synced === account.balance) return;

        syncedBalances.current.set(account.id, account.balance);
        updateServerAccount(token, account.id, { balance: account.balance }).then((res) => {
          // Put the old figure back so the next change retries this one too.
          if (!res.ok) syncedBalances.current.set(account.id, synced);
        });
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [state.accounts, token, hydrated]);

  // Persist after hydration only, so the seed never overwrites saved data.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const timeout = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(timeout);
  }, [state]);

  const refreshAccounts = useCallback(() => setAccountsRefresh((n) => n + 1), []);
  const refreshMonthlyIncome = useCallback(() => setIncomeRefresh((n) => n + 1), []);
  const refreshGoals = useCallback(() => setGoalsRefresh((n) => n + 1), []);
  const refreshDebts = useCallback(() => setDebtsRefresh((n) => n + 1), []);
  const refreshBudgets = useCallback(() => setBudgetsRefresh((n) => n + 1), []);
  const refreshPreferences = useCallback(() => setPreferencesRefresh((n) => n + 1), []);
  const refreshExpenses = useCallback(() => setExpensesRefresh((n) => n + 1), []);
  const refreshTransactions = useCallback(() => {
    setExpensesRefresh((n) => n + 1);
    setIncomesRefresh((n) => n + 1);
  }, []);

  const value = useMemo<FinanceContextValue>(() => {
    const totalBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
    const debts = debtSummary(state.debts);

    return {
      state,
      hydrated,
      accountsLoading,
      accountsError,
      monthlyIncome,
      monthlyIncomeLoading,
      refreshMonthlyIncome,
      goalsLoading,
      goalsError,
      refreshGoals,
      debtsLoading,
      debtsError,
      budgetsLoading,
      budgetsError,
      expensesLoading,
      expensesError,
      refreshExpenses,
      transactionsLoading: expensesLoading || incomesLoading,
      transactionsError: expensesError ?? incomesError,
      refreshTransactions,
      totalBalance,
      debts,
      netWorth: totalBalance + debts.net,
      streak: trackingStreak(state.transactions),
      unreadCount: state.notifications.filter((item) => !item.read).length,
      categoryById: (id) => state.categories.find((item) => item.id === id),

      addTransaction: async (input) => {
        const transaction: Transaction = {
          id: makeId('txn'),
          title: input.title.trim(),
          categoryId: input.categoryId,
          amount: Math.round(input.amount * 100) / 100,
          kind: input.kind,
          date: input.date,
          note: input.note?.trim() || undefined,
          // The screens do not offer a save without an account, so the empty
          // string here is a transaction booked against one that was removed
          // mid-edit — it keeps its history, it just moves no balance.
          accountId: input.accountId ?? state.accounts[0]?.id ?? '',
        };

        if (transaction.kind === 'expense') {
          if (!token) return { ok: false, message: 'Sign in to log an expense' };
          if (!transaction.accountId) {
            return { ok: false, message: 'Pick an account to spend from' };
          }

          // Written to the database first, so a refused save is not shown as if
          // the money had left. The row it returns is what is kept — including
          // the id, so the phone and the database point at the same purchase.
          const res = await createServerExpense(token, {
            id: transaction.id,
            title: transaction.title,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            amount: transaction.amount,
            date: transaction.date,
            note: transaction.note,
          });
          if (!res.ok) return { ok: false, message: res.message };

          dispatch({ type: 'addTransaction', transaction: res.data.expense });
          return { ok: true };
        }

        if (!token) return { ok: false, message: 'Sign in to log income' };
        if (!transaction.accountId) {
          return { ok: false, message: 'Pick an account to pay into' };
        }

        const res = await createServerIncome(token, {
          id: transaction.id,
          title: transaction.title,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          amount: transaction.amount,
          date: transaction.date,
          note: transaction.note,
        });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'addTransaction', transaction: res.data.income });
        setIncomeRefresh((n) => n + 1);
        return { ok: true };
      },

      deleteTransaction: async (id) => {
        const removed = state.transactions.find((item) => item.id === id);
        if (!removed) return { ok: false, message: 'That record no longer exists' };

        if (removed.kind === 'expense') {
          if (!token) return { ok: false, message: 'Sign in to remove an expense' };

          const res = await deleteServerExpense(token, id);
          if (!res.ok) return { ok: false, message: res.message };

          dispatch({ type: 'deleteTransaction', id });
          return { ok: true };
        }

        if (!token) return { ok: false, message: 'Sign in to remove income' };

        const res = await deleteServerIncome(token, id);
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'deleteTransaction', id });
        setIncomeRefresh((n) => n + 1);
        return { ok: true };
      },
      /**
       * Written to the database first. A category that already has a cap is
       * patched rather than posted, because the server refuses a second row
       * for the same category — posting would 409 even though the user meant
       * "raise the limit", not "add another".
       */
      setBudget: async (categoryId, limit) => {
        if (!token) return { ok: false, message: 'Sign in to set a budget' };

        const rounded = Math.round(limit * 100) / 100;
        const existing = state.budgets.find((item) => item.categoryId === categoryId);

        if (existing) {
          const res = await updateServerBudget(token, existing.id, { limit: rounded });
          if (!res.ok) return { ok: false, message: res.message };

          dispatch({ type: 'replaceBudget', budget: res.data.budget });
          return { ok: true };
        }

        const res = await createServerBudget(token, {
          id: makeId('bud'),
          categoryId,
          limit: rounded,
        });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'replaceBudget', budget: res.data.budget });
        return { ok: true };
      },

      deleteBudget: async (id) => {
        if (!token) return { ok: false, message: 'Sign in to remove a budget' };

        const res = await deleteServerBudget(token, id);
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'deleteBudget', id });
        return { ok: true };
      },

      refreshBudgets,
      /**
       * Written to the database first, and what it returns is what is kept —
       * including the image URL, which only exists once the file has actually
       * reached storage. A goal that did not save is not shown as if it had.
       */
      addGoal: async (input, image) => {
        if (!token) return { ok: false, message: 'Sign in to add a goal' };

        const res = await createServerGoal(
          token,
          {
            name: input.name.trim(),
            target: input.target,
            saved: input.saved,
            deadline: input.deadline,
            icon: input.icon,
            color: input.color,
          },
          image
        );
        if (!res.ok) return { ok: false, message: res.message };

        // Cached before the card exists, for the same reason the list is: the
        // screen this returns to must not draw a goal with a hole where its
        // picture goes. The upload just came off this device, so the fetch back
        // is quick, and the save button stays in its loading state until it is
        // genuinely done rather than only nearly.
        await warmGoalImages([res.data.goal]);

        dispatch({ type: 'addGoal', goal: res.data.goal });
        return { ok: true };
      },

      /**
       * The contribution moves money between accounts locally and raises the
       * goal on the server. The local step is not waited on: it is what the
       * user sees change, and the account balances it touches are pushed by
       * their own sync above.
       */
      contributeToGoal: (id, amount) => {
        dispatch({ type: 'contributeToGoal', id, amount });

        if (!token) return;
        const goal = state.goals.find((item) => item.id === id);
        if (!goal) return;

        const saved = Math.min(goal.saved + amount, goal.target);
        updateServerGoal(token, id, { saved }).then((res) => {
          // Take the server's figure back, so its rounding and cap are what
          // stands rather than the optimistic local sum.
          if (res.ok) dispatch({ type: 'replaceGoal', goal: res.data.goal });
        });
      },

      deleteGoal: async (id) => {
        if (!token) return { ok: false, message: 'Sign in to remove a goal' };

        // Removed from the server first, so a refused delete leaves the list
        // intact. The picture goes with it there — nothing to clean up here.
        const res = await deleteServerGoal(token, id);
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'deleteGoal', id });
        return { ok: true };
      },
      // Both writes go to the database and nowhere else — there is no local
      // copy to fall back on, so a write that does not reach the server did not
      // happen and says so.
      addAccount: async (input) => {
        if (!token) return { ok: false, message: 'Sign in to add an account' };

        // The server decides the id, so what lands in the list is the row that
        // now exists in the database rather than a hopeful copy of it.
        const res = await createServerAccount(token, {
          name: input.name.trim(),
          balance: Math.round((input.balance || 0) * 100) / 100,
          color: input.color || '#4DA3FF',
          icon: input.icon || 'wallet',
        });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'addAccount', account: res.data.account });
        syncedBalances.current.set(res.data.account.id, res.data.account.balance);
        return { ok: true };
      },

      deleteAccount: async (id) => {
        if (!token) return { ok: false, message: 'Sign in to remove an account' };

        const res = await deleteServerAccount(token, id);
        if (!res.ok) return { ok: false, message: res.message };

        syncedBalances.current.delete(id);
        dispatch({ type: 'deleteAccount', id });
        return { ok: true };
      },

      refreshAccounts,

      /**
       * Written to the database first, and the row it returns is what is kept
       * — including the id, so the record on the phone and the record in the
       * database are the same one. A debt that did not save is not shown as if
       * it had, because the balance it moved would be a lie about real cash.
       */
      addDebt: async (input) => {
        if (!token) return { ok: false, message: 'Sign in to record a debt' };

        const res = await createServerDebt(token, {
          person: input.person.trim(),
          direction: input.direction,
          principal: input.principal,
          repaid: input.repaid,
          date: input.date,
          note: input.note?.trim(),
          accountId: input.accountId,
        });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'addDebt', debt: res.data.debt });
        return { ok: true };
      },

      updateDebt: async (id, input) => {
        if (!token) return { ok: false, message: 'Sign in to edit a debt' };

        // A field left out of `input` is left out of the request body too:
        // `JSON.stringify` drops undefined values, which is exactly what the
        // server reads as "leave this one alone".
        const res = await updateServerDebt(token, id, {
          ...input,
          person: input.person?.trim(),
          note: input.note?.trim(),
        });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'replaceDebt', debt: res.data.debt });
        return { ok: true };
      },

      repayDebt: async (id, amount) => {
        if (!token) return { ok: false, message: 'Sign in to record a repayment' };

        const debt = state.debts.find((item) => item.id === id);
        if (!debt) return { ok: false, message: 'That record no longer exists' };

        // Sent as the new running total rather than as the payment, so a retry
        // after a dropped connection cannot settle the same amount twice. The
        // server caps it the same way, so both arrive at the same figure.
        const repaid = Math.min(debt.repaid + amount, debt.principal);
        const res = await updateServerDebt(token, id, { repaid });
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'repayDebt', id, amount });
        return { ok: true };
      },

      deleteDebt: async (id) => {
        if (!token) return { ok: false, message: 'Sign in to remove a debt' };

        const res = await deleteServerDebt(token, id);
        if (!res.ok) return { ok: false, message: res.message };

        dispatch({ type: 'deleteDebt', id });
        return { ok: true };
      },

      refreshDebts,
      refreshPreferences,
      preferencesLoading,
      preferencesError,
      /**
       * Optimistic: the switch is already under the finger, so waiting for the
       * server would make it snap back and then forward. A refused write puts
       * only this key back — applying the whole PATCH response would clobber a
       * second toggle flipped while the first request was still in flight.
       */
      updateSetting: async (key, value) => {
        if (!token) return { ok: false, message: 'Sign in to change preferences' };

        const previous = state.settings[key];
        if (previous === value) return { ok: true };

        dispatch({ type: 'updateSetting', key, value });
        const res = await updateServerPreferences(token, { [key]: value });
        if (!res.ok) {
          dispatch({ type: 'updateSetting', key, value: previous });
          return { ok: false, message: res.message };
        }
        return { ok: true };
      },
      updateProfile: (name, email) => dispatch({ type: 'updateProfile', name, email }),
      markNotificationsRead: () => dispatch({ type: 'readNotifications' }),
      clearNotifications: () => dispatch({ type: 'clearNotifications' }),
      resetData: () => {
        clearState();
        dispatch({ type: 'reset', state: createSeedState() });
        // The reset is of this device's leftover local state; accounts, budgets,
        // debts and the rest of the server's lists are read back rather than
        // replaced with the seed's empties.
        refreshAccounts();
        refreshBudgets();
        refreshDebts();
        refreshGoals();
        refreshPreferences();
        refreshTransactions();
      },
    };
  }, [
    state,
    hydrated,
    accountsLoading,
    accountsError,
    monthlyIncome,
    monthlyIncomeLoading,
    refreshMonthlyIncome,
    goalsLoading,
    goalsError,
    refreshGoals,
    debtsLoading,
    debtsError,
    refreshDebts,
    budgetsLoading,
    budgetsError,
    refreshBudgets,
    expensesLoading,
    expensesError,
    refreshExpenses,
    incomesLoading,
    incomesError,
    refreshTransactions,
    preferencesLoading,
    preferencesError,
    refreshPreferences,
    token,
    refreshAccounts,
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside a FinanceProvider');
  return context;
}
