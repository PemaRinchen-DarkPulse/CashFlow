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
    // Deliberately empty. Every other list here is sample data the app can make
    // up, but accounts belong to the server: seeding three of them would put a
    // stranger's demo balances into a real user's database the first time their
    // device synced. A signed-in user with none is shown how to add their first.
    accounts: [],
    categories: ALL_CATEGORIES,
    // Empty: the ledger is whatever the server holds. Seeding paydays would put
    // a stranger's salary on Activity until the fetch landed — or, worse, hand
    // it to the database as if this user had earned it.
    transactions: [],
    // Empty for the same reason as accounts: budgets belong to the server, and
    // seeding seven of them would put a stranger's monthly caps onto a real
    // user's Analytics until the fetch landed — or hand them to the database
    // as if this user had set them.
    budgets: [],
    // Empty for the same reason as accounts. A seeded goal also has no picture
    // and no row behind it, so it would draw as a half-finished card and then
    // vanish the moment the server answered with the real list.
    goals: [],
    // Empty for the same reason as accounts, and then some: debts belong to the
    // server, and they are claims about real people. Seeding three of them
    // would tell a real user that three strangers owe them money, and put those
    // figures into the balance their own decisions rest on.
    debts: [],
    // Device-local only, and empty on purpose. Fake budget warnings and a
    // salary that never arrived made a first run look like someone else's app.
    notifications: [],
    rewards: {
      points: 0,
      badges: [
        {
          id: 'badge-starter',
          name: 'First Steps',
          icon: 'footsteps',
          earned: false,
          hint: 'Log your first transaction',
        },
        {
          id: 'badge-streak',
          name: 'Week Strong',
          icon: 'flame',
          earned: false,
          hint: 'Track expenses 7 days in a row',
        },
        {
          id: 'badge-budget',
          name: 'Budget Keeper',
          icon: 'shield-checkmark',
          earned: false,
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
      // These are the same defaults the server hands a brand-new account, and
      // they are replaced the moment that account's real preferences arrive.
      hideBalance: true,
      budgetAlerts: true,
      goalReminders: true,
      weeklyDigest: true,
    },
  };
}
