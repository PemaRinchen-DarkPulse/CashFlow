import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { createSeedState } from '@/src/data/seed';
import { clearState, loadState, saveState } from '@/src/store/storage';
import { createServerAccount, fetchServerAccounts } from '@/src/api/accountsApi';
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
  | { type: 'setAccounts'; accounts: Account[] }
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

    case 'setAccounts':
      return { ...state, accounts: action.accounts };

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

type FinanceContextValue = {
  state: FinanceState;
  hydrated: boolean;
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
  addGoal: (input: Omit<Goal, 'id'>) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addAccount: (input: { name: string; balance?: number; color?: string; icon?: IconName; last4?: string }) => void;
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

  const auth = useAuth();
  const token = auth?.token;

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

  // Fetch accounts from MongoDB server when authenticated
  useEffect(() => {
    if (!token) return;
    fetchServerAccounts(token).then((res) => {
      if (res.ok && res.data.accounts.length > 0) {
        dispatch({ type: 'setAccounts', accounts: res.data.accounts });
      }
    });
  }, [token]);

  // Persist after hydration only, so the seed never overwrites saved data.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const timeout = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(timeout);
  }, [state]);

  const value = useMemo<FinanceContextValue>(() => {
    const totalBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
    const debts = debtSummary(state.debts);

    return {
      state,
      hydrated,
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
          accountId: input.accountId ?? state.accounts[0]?.id ?? 'acc-everyday',
        };
        dispatch({ type: 'addTransaction', transaction });
        return transaction;
      },

      deleteTransaction: (id) => dispatch({ type: 'deleteTransaction', id }),
      setBudget: (categoryId, limit) => dispatch({ type: 'upsertBudget', categoryId, limit }),
      deleteBudget: (id) => dispatch({ type: 'deleteBudget', id }),
      addGoal: (input) => dispatch({ type: 'addGoal', goal: { ...input, id: makeId('goal') } }),
      contributeToGoal: (id, amount) => dispatch({ type: 'contributeToGoal', id, amount }),
      deleteGoal: (id) => dispatch({ type: 'deleteGoal', id }),
      addAccount: (input) => {
        const account: Account = {
          id: makeId('acc'),
          name: input.name.trim(),
          balance: Math.round((input.balance || 0) * 100) / 100,
          color: input.color || '#4DA3FF',
          icon: input.icon || 'wallet',
          last4: input.last4?.trim() || String(Math.floor(1000 + Math.random() * 9000)),
        };
        dispatch({ type: 'addAccount', account });
        if (token) {
          createServerAccount(token, input).catch(() => {});
        }
      },

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
      },
    };
  }, [state, hydrated]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside a FinanceProvider');
  return context;
}
