import { ALL_CATEGORIES } from '@/src/data/categories';
import type { FinanceState, Transaction } from '@/src/types';
import { addDays, daysInMonth, startOfMonth } from '@/src/utils/date';

/** Deterministic PRNG so the demo data looks the same on every fresh install. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type MerchantSpec = {
  categoryId: string;
  /** Candidate payees, picked at random. */
  names: string[];
  min: number;
  max: number;
  /** Expected occurrences per month. */
  perMonth: number;
};

const EXPENSE_SPECS: MerchantSpec[] = [
  {
    categoryId: 'food',
    names: ['Bean & Brew', 'Noodle House', 'Corner Deli', 'Pizza Loop', 'Sunrise Cafe'],
    min: 4.5,
    max: 38,
    perMonth: 9,
  },
  {
    categoryId: 'groceries',
    names: ['FreshMart', 'Green Grocer', 'DayMart Express'],
    min: 22,
    max: 145,
    perMonth: 5,
  },
  {
    categoryId: 'shopping',
    names: ['Urban Threads', 'ShopNest', 'Gadget Hub', 'Home Corner'],
    min: 18,
    max: 220,
    perMonth: 3,
  },
  {
    categoryId: 'transport',
    names: ['Metro Card', 'RideNow', 'Fuel Stop', 'City Parking'],
    min: 3.5,
    max: 62,
    perMonth: 6,
  },
  {
    categoryId: 'fun',
    names: ['CineDome', 'GameVault', 'Vinyl Room', 'Escape Lab'],
    min: 9,
    max: 75,
    perMonth: 3,
  },
  {
    categoryId: 'health',
    names: ['Wellness Pharmacy', 'PulseGym', 'City Clinic'],
    min: 12,
    max: 95,
    perMonth: 2,
  },
  {
    categoryId: 'learning',
    names: ['SkillPath', 'BookHaven'],
    min: 14,
    max: 60,
    perMonth: 1,
  },
];

/** Charges that land on the same day every month. */
const RECURRING: { categoryId: string; name: string; amount: number; day: number }[] = [
  { categoryId: 'bills', name: 'PowerGrid Utility', amount: 86.4, day: 4 },
  { categoryId: 'bills', name: 'FiberNet Broadband', amount: 54.99, day: 6 },
  { categoryId: 'bills', name: 'AquaFlow Water', amount: 28.75, day: 11 },
  { categoryId: 'subs', name: 'StreamBox Plus', amount: 15.99, day: 8 },
  { categoryId: 'subs', name: 'TuneStream', amount: 10.99, day: 14 },
  { categoryId: 'subs', name: 'CloudDrive Pro', amount: 9.99, day: 19 },
];

/** Salary is the only income, paid early in the month. */
const INCOME_SPECS: { categoryId: string; name: string; amount: number; day: number }[] = [
  { categoryId: 'salary', name: 'Monthly Salary', amount: 4250, day: 1 },
];

const MONTHS_OF_HISTORY = 6;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${index.toString(36)}`;
}

/** Builds ~6 months of history ending today, so every chart has something to show. */
export function generateTransactions(now = new Date()): Transaction[] {
  const random = mulberry32(20260908);
  const transactions: Transaction[] = [];
  let counter = 0;

  const push = (categoryId: string, title: string, amount: number, date: Date, note?: string) => {
    if (date.getTime() > now.getTime()) return;
    const category = ALL_CATEGORIES.find((item) => item.id === categoryId);
    transactions.push({
      id: makeId('seed', counter++),
      title,
      categoryId,
      amount: round2(amount),
      kind: category?.kind ?? 'expense',
      date: date.toISOString(),
      note,
      accountId: category?.kind === 'income' ? 'acc-everyday' : 'acc-everyday',
    });
  };

  for (let offset = MONTHS_OF_HISTORY - 1; offset >= 0; offset -= 1) {
    const monthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - offset, 1));
    const totalDays = daysInMonth(monthStart);

    for (const income of INCOME_SPECS) {
      const date = new Date(monthStart);
      date.setDate(Math.min(income.day, totalDays));
      date.setHours(9, 15, 0, 0);
      push(income.categoryId, income.name, income.amount, date);
    }

    for (const bill of RECURRING) {
      const date = new Date(monthStart);
      date.setDate(Math.min(bill.day, totalDays));
      date.setHours(7, 30, 0, 0);
      const drift = bill.categoryId === 'bills' ? 0.9 + random() * 0.25 : 1;
      push(bill.categoryId, bill.name, bill.amount * drift, date);
    }

    for (const spec of EXPENSE_SPECS) {
      const count = Math.max(1, Math.round(spec.perMonth * (0.7 + random() * 0.6)));
      for (let i = 0; i < count; i += 1) {
        const date = new Date(monthStart);
        date.setDate(1 + Math.floor(random() * totalDays));
        date.setHours(8 + Math.floor(random() * 13), Math.floor(random() * 60), 0, 0);
        const name = spec.names[Math.floor(random() * spec.names.length)];
        const amount = spec.min + random() * (spec.max - spec.min);
        push(spec.categoryId, name, amount, date);
      }
    }
  }

  // A couple of one-offs that make the recent list feel current.
  const today = new Date(now);
  today.setHours(10, 45, 0, 0);
  push('food', 'Bean & Brew', 6.8, today, 'Flat white before the standup');
  push('groceries', 'FreshMart', 74.2, addDays(today, -1));

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function createSeedState(now = new Date()): FinanceState {
  const memberSince = new Date(now.getFullYear() - 1, 2, 14).toISOString();

  return {
    profile: {
      name: 'Pema',
      email: 'pema@cashflow.app',
      memberSince,
      currency: 'Nu.',
    },
    accounts: [
      {
        id: 'acc-everyday',
        name: 'Everyday',
        last4: '4821',
        balance: 8412.6,
        color: '#1DD75B',
        icon: 'card',
      },
      {
        id: 'acc-savings',
        name: 'Savings',
        last4: '9073',
        balance: 9930.7,
        color: '#4DA3FF',
        icon: 'shield-checkmark',
      },
      {
        id: 'acc-cash',
        name: 'Cash',
        last4: '0000',
        balance: 399,
        color: '#FFB020',
        icon: 'cash',
      },
    ],
    categories: ALL_CATEGORIES,
    transactions: generateTransactions(now),
    budgets: [
      { id: 'bud-food', categoryId: 'food', limit: 320 },
      { id: 'bud-groceries', categoryId: 'groceries', limit: 420 },
      { id: 'bud-shopping', categoryId: 'shopping', limit: 350 },
      { id: 'bud-transport', categoryId: 'transport', limit: 180 },
      { id: 'bud-bills', categoryId: 'bills', limit: 220 },
      { id: 'bud-fun', categoryId: 'fun', limit: 150 },
      { id: 'bud-subs', categoryId: 'subs', limit: 45 },
    ],
    goals: [
      {
        id: 'goal-emergency',
        name: 'Emergency Fund',
        target: 10000,
        saved: 6480,
        deadline: new Date(now.getFullYear() + 1, 0, 31).toISOString(),
        icon: 'shield-checkmark',
        color: '#1DD75B',
      },
      {
        id: 'goal-laptop',
        name: 'New Laptop',
        target: 2400,
        saved: 940,
        deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString(),
        icon: 'laptop',
        color: '#4DA3FF',
      },
      {
        id: 'goal-trip',
        name: 'Japan Trip',
        target: 5000,
        saved: 1725,
        deadline: new Date(now.getFullYear() + 1, 3, 10).toISOString(),
        icon: 'airplane',
        color: '#A78BFA',
      },
    ],
    debts: [
      {
        id: 'debt-1',
        person: 'Sonam',
        direction: 'borrowed',
        principal: 3000,
        repaid: 1200,
        date: addDays(now, -24).toISOString(),
        note: 'Covered my share of the trip booking',
        accountId: 'acc-everyday',
      },
      {
        id: 'debt-2',
        person: 'Tashi',
        direction: 'borrowed',
        principal: 850,
        repaid: 850,
        date: addDays(now, -61).toISOString(),
        note: 'Dinner when my card failed',
        accountId: 'acc-everyday',
      },
      {
        id: 'debt-3',
        person: 'Karma',
        direction: 'lent',
        principal: 1500,
        repaid: 500,
        date: addDays(now, -12).toISOString(),
        accountId: 'acc-everyday',
      },
    ],
    notifications: [
      {
        id: 'ntf-1',
        title: 'Food & Drinks is close to its limit',
        body: 'You have used 82% of this month’s Food & Drinks budget.',
        date: addDays(now, -1).toISOString(),
        icon: 'warning',
        tone: 'warning',
        read: false,
      },
      {
        id: 'ntf-2',
        title: 'Salary received',
        body: 'Your monthly salary landed in the Everyday account.',
        date: addDays(now, -3).toISOString(),
        icon: 'arrow-down-circle',
        tone: 'positive',
        read: false,
      },
      {
        id: 'ntf-3',
        title: 'Emergency Fund is 64% funded',
        body: 'Keep the streak going — $3,520 left to reach your target.',
        date: addDays(now, -6).toISOString(),
        icon: 'flag',
        tone: 'neutral',
        read: true,
      },
    ],
    rewards: {
      points: 1240,
      badges: [
        {
          id: 'badge-starter',
          name: 'First Steps',
          icon: 'footsteps',
          earned: true,
          hint: 'Log your first transaction',
        },
        {
          id: 'badge-streak',
          name: 'Week Strong',
          icon: 'flame',
          earned: true,
          hint: 'Track expenses 7 days in a row',
        },
        {
          id: 'badge-budget',
          name: 'Budget Keeper',
          icon: 'shield-checkmark',
          earned: true,
          hint: 'Finish a month under budget',
        },
        {
          id: 'badge-saver',
          name: 'Super Saver',
          icon: 'trophy',
          earned: false,
          hint: 'Save 20% of your income in a month',
        },
        {
          id: 'badge-goal',
          name: 'Goal Crusher',
          icon: 'rocket',
          earned: false,
          hint: 'Complete a savings goal',
        },
        {
          id: 'badge-zero',
          name: 'No-Spend Day',
          icon: 'leaf',
          earned: false,
          hint: 'Go a full day without spending',
        },
      ],
    },
    settings: {
      // Amounts start masked; the eye on the balance card reveals them.
      hideBalance: true,
      budgetAlerts: true,
      goalReminders: true,
      biometricLock: false,
      weeklyDigest: true,
    },
  };
}
