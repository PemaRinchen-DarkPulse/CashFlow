# CashFlow mobile

Expo (SDK 54) + React Native + TypeScript phone app. It is the client for the [CashFlow API](../server/README.md).

What the product is for, and why it exists: [root README](../README.md).

**Released builds call:** [https://cash-flow-server-fawn.vercel.app](https://cash-flow-server-fawn.vercel.app)

## Screens

| Tab / screen | Purpose |
| --- | --- |
| **Home** | Net balance, month income/spend, category donut, recent transactions, goal, streak |
| **Activity** | Full ledger by day, with search and income / expense / category filters |
| **Analytics** | Week / month / year spending, breakdown, savings rate, insights |
| **Plan** | Monthly budgets, savings goals, debts with friends |
| **Profile** | Accounts, photos, currency, hide balances, password, delete account |
| **About** | Who made the app |

Also: add/edit transaction, transaction detail, new goal, edit budget, add/edit debt, rewards, notifications.

## Which server it uses

| How you run it | API |
| --- | --- |
| `npx expo start` / Expo Go (`__DEV__`) | Your computer, port `5000`, same LAN host as Metro. Not `localhost` on the phone. |
| Installed APK | `https://cash-flow-server-fawn.vercel.app` |

Do not set `EXPO_PUBLIC_API_URL` in `.env` for daily work, or Expo Go will hit Vercel too.

The phone and the PC must be on the same Wi-Fi. Keep `cd server && npm run dev` running.

## Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR with Expo Go. After changing `app.json` or native deps, use `npx expo start --clear`.

Copy `.env.example` to `.env` only if you need a non-default API port:

```
EXPO_PUBLIC_API_PORT=5000
```

That port must match `PORT` in `server/.env`.

## Build an APK

From the **repo root** (not this folder):

```powershell
.\build-mobile.ps1
```

That logs in to Expo if needed and builds a preview APK against Vercel. Download it from the URL EAS prints, or from [the project builds page](https://expo.dev/accounts/pemarinchen12/projects/cashflow/builds).

Profiles in `eas.json`:

| Profile | What you get |
| --- | --- |
| `preview` | Internal APK → Vercel |
| `production` | Store build → Vercel |
| `development` | Dev client; after install, `npm start` still uses the local API |

## Layout

```
mobile/
├── app/                   expo-router (a file is a screen)
│   ├── (auth)/            login, register
│   ├── (tabs)/            Home, Activity, Analytics, Plan, Profile
│   └── *.tsx              add-transaction, goals, debts, rewards, about, …
├── src/
│   ├── api/               one module per server resource + client.ts
│   ├── components/        shared UI
│   ├── store/             AuthContext, FinanceContext
│   ├── data/              categories
│   ├── utils/             dates, currency, analytics
│   └── theme/             colours, type, space
├── app.json
├── eas.json
└── .env.example
```

## How money is treated

- Adding or deleting a transaction moves the account balance by the inverse amount. The server does not also change that balance — that would double-count.
- Goal contributions are transfers, not spending. They stay out of expense analytics.
- Debts are liabilities, not income. Borrowing and repayment move cash and stay out of budgets.
- Charts, streak, and budget status are derived from the ledger so screens cannot drift apart.
- The server list is the list. An empty fetch is empty; a failed fetch is an error, not last week’s seed.

## Design

Dark navy canvas, one green accent (`#1DD75B`), Inter, large tabular amounts. Income is green; expenses are muted red. Hide balances masks figures app-wide.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Expo Go / Metro |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run lint` | ESLint |

---

CashFlow mobile · Made by Pema Rinchen
