# CashFlow

A personal finance and expense tracker built with **React Native + Expo (SDK 54) + TypeScript**,
designed to answer one question at a glance: **where did my money go?**

```bash
npm install
npx expo start        # then press a / i / w, or scan the QR code
```

## What it does

| Screen | Purpose |
| --- | --- |
| **Home** | Total balance with trend, month income/spend, category donut, budget progress, recent transactions, goal spotlight, streak |
| **Activity** | Full ledger grouped by day, with search, income/expense filters and category filters |
| **Analytics** | Week/month/year spending, category breakdown, savings rate, daily average, biggest payees, written insights |
| **Plan** | Monthly category budgets, savings goals, and debts owed to and by friends |
| **Profile** | Accounts, preferences, rewards, notifications, reset |

Supporting routes: add transaction (with success confirmation), transaction detail, budget editor,
new goal, notifications and rewards.

## Architecture

```
app/                     expo-router routes ((tabs) group + stack screens)
src/theme/               design tokens: colours, spacing, radii, Inter type scale, shadows
src/types.ts             domain model (Transaction, Budget, Goal, Account, …)
src/data/                categories and the deterministic 6-month demo dataset
src/store/               FinanceContext reducer + AsyncStorage persistence
src/utils/               date helpers, currency formatting, analytics selectors
src/components/          UI primitives, cards, rows and SVG charts
```

- **State** lives in a single reducer behind `useFinance()`, persisted to AsyncStorage
  (debounced) and reconciled against a fresh seed on load so new fields never land undefined.
- **Money is never double-counted**: adding or deleting a transaction adjusts the account
  balance by the exact inverse amount; goal contributions are treated as transfers between
  accounts rather than spending, so they stay out of expense analytics.
- **Debts are liabilities, not income**: borrowing from a friend raises your cash balance
  and repaying lowers it, but neither touches income, spending or any budget. `netWorth`
  reports cash minus what you owe plus what is owed to you — what you would hold after
  everyone settles up.
- **Derived values stay derived**: the tracking streak, budget status and every chart are
  computed from the ledger, so no screen can drift out of sync with another.
- **Charts** are hand-drawn with `react-native-svg` (donut, sparkline) and plain views
  (bars and progress), so there is no charting dependency to keep current.
- **No animation anywhere**: screens, modals and toasts appear outright, and progress
  bars render at their value. Nothing fades, slides or eases in.

Accounts live in the server's database — the phone reads them back on sign-in, and adding
or removing one is a write to `/api/accounts` before it shows up in the list. Everything
else (transactions, budgets, goals, debts) is still local to the device, so the balance an
account carries is pushed up whenever the ledger moves it.

## Design

Dark navy/near-black canvas, a single vivid green accent (`#1DD75B`), white headings and
grey secondary text, large rounded cards with soft shadows, and large tabular figures in
Inter. Income is green, expenses fall back to a muted red, and amounts can be masked
app-wide with the balance eye toggle.
