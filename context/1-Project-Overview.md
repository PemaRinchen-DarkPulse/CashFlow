# Project Overview

## Purpose

CashFlow is a personal finance tracker: a phone app for logging income and spending, holding money across accounts, setting monthly category budgets, saving towards goals, and tracking debts with friends. Amounts default to Bhutanese ngultrum (`Nu.`).

Single-user-per-account. Every server record is owned by one signed-in user; there is no sharing, org or admin tier.

## Major features

| Feature | Where |
|---|---|
| Email OTP registration (3 steps), password sign-in, biometric unlock | `mobile/app/(auth)/`, `server/src/routes/auth.js` |
| Accounts — wallets/bank accounts holding balances | `server/src/routes/accounts.js` |
| Transactions — income and expense against an account and category | `mobile/app/add-transaction.tsx` |
| Savings goals with an uploaded photo, target amount and free-choice deadline | `mobile/app/add-goal.tsx`, `server/src/routes/goals.js` |
| Debts — money borrowed from or lent to a person, kept out of income/spending | `mobile/app/add-debt.tsx` |
| Monthly category budgets with warning thresholds | `mobile/app/edit-budget.tsx` |
| Analytics — category breakdown, monthly totals, insights, tracking streak | `mobile/app/(tabs)/analytics.tsx`, `mobile/src/utils/analytics.ts` |
| Rewards — points and badges for logging habits | `mobile/app/rewards.tsx` |
| Notifications feed | `mobile/app/notifications.tsx` |

Deliberately absent: the app never asks for or stores an account or card number.

## Technology

### Mobile (`mobile/`)

| Concern | Package |
|---|---|
| Framework | `expo` ~54.0.36, `react-native` 0.81.5, `react` 19.1.0 |
| Routing | `expo-router` ~6.0.24, typed routes + React Compiler enabled |
| Icons / fonts | `@expo/vector-icons` (Ionicons), `@expo-google-fonts/inter` |
| Images | `expo-image`, `expo-image-picker` (crop via `allowsEditing`) |
| Local storage | `@react-native-async-storage/async-storage` |
| Secure storage | `expo-secure-store`, `expo-local-authentication` |
| Graphics | `react-native-svg`, `expo-linear-gradient` |
| Motion / gesture | `react-native-reanimated`, `react-native-gesture-handler` |

### Server (`server/`)

| Concern | Package |
|---|---|
| HTTP | `express` ^5.2.1, `cors` |
| Database | `mongoose` ^9.9.5 (MongoDB Atlas) |
| Auth | `jsonwebtoken`, `bcryptjs`, `express-rate-limit` |
| Uploads | `multer` (memory storage) |
| Object storage | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| Config | `dotenv` |

## Runtime requirements

- Node.js (server tested on Node 24)
- MongoDB Atlas cluster, with the developer's IP whitelisted
- Brevo account and a v3 API key (`xkeysib-…`) for OTP email
- Filebase account with an S3 access key, for goal images
- Expo Go, or a custom dev build, on a phone on the same LAN as the dev machine

## Project structure

```
CashFlow/
├── mobile/
│   ├── app/                  expo-router routes (file = screen)
│   │   ├── (auth)/           login, register  — signed-out half
│   │   ├── (tabs)/           Home, Activity, Analytics, Plan, Profile
│   │   └── *.tsx             modal/detail screens
│   ├── src/
│   │   ├── api/              one module per server resource + client.ts
│   │   ├── components/       shared UI primitives
│   │   ├── store/            AuthContext, FinanceContext, storage adapters
│   │   ├── data/             static categories, demo seed
│   │   ├── utils/            date, format, analytics, goalImage
│   │   └── theme/            design tokens
│   └── app.json              Expo config, plugins, permissions
└── server/
    ├── index.js              app assembly, route mounting, startup
    └── src/
        ├── config/env.js     all env reading + validation
        ├── db/connect.js     Mongoose connection
        ├── middleware/       requireAuth, errorHandler
        ├── models/           Mongoose schemas
        ├── routes/           Express routers
        ├── services/         filebase, mailer, otpService
        └── utils/            ApiError, asyncHandler, tokens, validate
```
