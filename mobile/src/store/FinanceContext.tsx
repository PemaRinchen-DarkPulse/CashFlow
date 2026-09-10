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
import { debtSummary, outstandingOf, trackingStreak, type DebtSummary } from '@/src/utils/analytics';
import { endOfMonth, startOfMonth } from '@/src/utils/date';
import {
  createServerGoal,
  deleteServerGoal,
  fetchServerGoals,
  updateServerGoal,
  type GoalImageUpload,
} from '@/src/api/goalsApi';

/** Points awarded for healthy habits. */
const POINTS_PER_LOG = 5;
const POINTS_PER_CONTRIBUTION = 25;
const POINTS_PER_REPAYMENT = 15;

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
  | { type: 'upsertBudget'; categoryId: string; limit: number }
  | { type: 'deleteBudget'; id: string }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'addDebt'; debt: Debt }
  | { type: 'repayDebt'; id: string; amount: number }
  | { type: 'deleteDebt'; id: string }
  | { type: 'contributeToGoal'; id: string; amount: number }
  | { type: 'deleteGoal'; id: string }
  | { type: 'addAccount'; account: Account }
  | { type: 'deleteAccount'; id: string }
  | { type: 'setAccounts'; accounts: Account[] }
  | { type: 'setGoals'; goals: Goal[] }
  | { type: 'replaceGoal'; goal: Goal }
  | { type: 'updateSetting'; key: keyof Settings; value: boolean }
  | { type: 'updateProfile'; name: string; email: string }
  | { type: 'readNotifications' }
  | { type: 'clearNotifications' }
  | { type: 'reset'; state: FinanceState };

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function adjustAccount(state: FinanceState, accountId: string, delta: number) {
  return state.accounts.map((account) =>
    account.id === accountId
      ? { ...account, balance: Math.round((account.balance + delta) * 100) / 100 }
      : account
  );
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

    case 'upsertBudget': {
      const existing = state.budgets.find((item) => item.categoryId === action.categoryId);
      if (existing) {
        return {
          ...state,
          budgets: state.budgets.map((item) =>
            item.id === existing.id ? { ...item, limit: action.limit } : item
          ),
        };
      }
      const budget: Budget = { id: makeId('bud'), categoryId: action.categoryId, limit: action.limit };
      return { ...state, budgets: [...state.budgets, budget] };
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
      const delta = action.debt.direction === 'borrowed' ? action.debt.principal : -action.debt.principal;
      return {
        ...state,
        debts: [action.debt, ...state.debts],
        accounts: adjustAccount(state, action.debt.accountId, delta),
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
      const outstanding = outstandingOf(debt);
      const delta = debt.direction === 'borrowed' ? -outstanding : outstanding;
      return {
        ...state,
        debts: state.debts.filter((item) => item.id !== action.id),
        accounts: adjustAccount(state, debt.accountId, delta),
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
  addTransaction: (input: NewTransaction) => Transaction;
  deleteTransaction: (id: string) => void;
  setBudget: (categoryId: string, limit: number) => void;
  deleteBudget: (id: string) => void;
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
  addDebt: (input: Omit<Debt, 'id' | 'repaid'> & { repaid?: number }) => void;
  repayDebt: (id: string, amount: number) => void;
  deleteDebt: (id: string) => void;
  updateSetting: (key: keyof Settings, value: boolean) => void;
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
   * This month's income, read from the database rather than summed on device.
   *
   * The figure the home screen shows is whatever the server holds, so it is the
   * same on every phone signed into the account instead of whatever this one
   * happens to have in storage.
   *
   * Income logged before the device had a session — or while it had no network
   * — is handed over first. Each entry keeps its local id, which the server
   * treats as idempotent, so a hand-off that is interrupted and retried cannot
   * double-count. The total is then read back rather than adjusted locally, so
   * what is on screen is a figure the database confirmed.
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
      const range = {
        from: startOfMonth(now).toISOString(),
        to: endOfMonth(now).toISOString(),
      };

      let res = await fetchServerIncomes(token, range);
      if (!active) return;

      if (res.ok) {
        const stored = new Set(res.data.incomes.map((income) => income.id));
        const monthStart = startOfMonth(now).getTime();
        const monthEnd = endOfMonth(now).getTime();

        const pending = transactionsRef.current.filter((item) => {
          if (item.kind !== 'income' || stored.has(item.id)) return false;
          // An entry booked against a removed account has no account to file it
          // under, so it stays local rather than being refused by the server.
          if (!item.accountId) return false;
          const at = new Date(item.date).getTime();
          return at >= monthStart && at <= monthEnd;
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
          res = await fetchServerIncomes(token, range);
          if (!active) return;
        }
      }

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
      totalBalance,
      debts,
      netWorth: totalBalance + debts.net,
      streak: trackingStreak(state.transactions),
      unreadCount: state.notifications.filter((item) => !item.read).length,
      categoryById: (id) => state.categories.find((item) => item.id === id),

      addTransaction: (input) => {
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
        dispatch({ type: 'addTransaction', transaction });

        // Money in is kept in its own collection on the server, so it goes
        // there as well as into the local ledger. The refresh below reads the
        // month's total back once the write lands; a write that fails leaves
        // the total as the server last confirmed it rather than inventing one,
        // and the entry is handed over again on the next launch.
        if (transaction.kind === 'income' && token && transaction.accountId) {
          createServerIncome(token, {
            id: transaction.id,
            title: transaction.title,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            amount: transaction.amount,
            date: transaction.date,
            note: transaction.note,
          }).then(() => setIncomeRefresh((n) => n + 1));
        }

        return transaction;
      },

      deleteTransaction: (id) => {
        const removed = state.transactions.find((item) => item.id === id);
        dispatch({ type: 'deleteTransaction', id });

        if (removed?.kind === 'income' && token) {
          deleteServerIncome(token, id).then(() => setIncomeRefresh((n) => n + 1));
        }
      },
      setBudget: (categoryId, limit) => dispatch({ type: 'upsertBudget', categoryId, limit }),
      deleteBudget: (id) => dispatch({ type: 'deleteBudget', id }),
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

      addDebt: (input) =>
        dispatch({
          type: 'addDebt',
          debt: {
            ...input,
            person: input.person.trim(),
            principal: Math.round(input.principal * 100) / 100,
            repaid: input.repaid ?? 0,
            note: input.note?.trim() || undefined,
            id: makeId('debt'),
          },
        }),
      repayDebt: (id, amount) => dispatch({ type: 'repayDebt', id, amount }),
      deleteDebt: (id) => dispatch({ type: 'deleteDebt', id }),
      updateSetting: (key, val) => dispatch({ type: 'updateSetting', key, value: val }),
      updateProfile: (name, email) => dispatch({ type: 'updateProfile', name, email }),
      markNotificationsRead: () => dispatch({ type: 'readNotifications' }),
      clearNotifications: () => dispatch({ type: 'clearNotifications' }),
      resetData: () => {
        clearState();
        dispatch({ type: 'reset', state: createSeedState() });
        // The reset is of this device's ledger; the accounts are the server's,
        // so they are read back rather than replaced with the seed's.
        refreshAccounts();
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
