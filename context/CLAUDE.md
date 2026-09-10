# CashFlow — Claude Context

Personal finance tracker for Bhutan (currency `Nu.`). Expo React Native app plus an Express/MongoDB API.

## Stack

| Part | Technology |
|---|---|
| Mobile | Expo SDK 54, React Native 0.81.5, React 19.1, expo-router 6 (typed routes), TypeScript |
| Server | Node + Express 5, Mongoose 9, MongoDB Atlas |
| Auth | JWT bearer (1 day), bcryptjs, email OTP via Brevo REST API |
| File storage | Filebase (S3-compatible, IPFS-backed) via `@aws-sdk/client-s3` |

## Repository layout

```
mobile/    Expo app  — app/ (routes), src/ (components, store, api, utils)
server/    Express API — index.js, src/{routes,models,services,middleware,utils,config,db}
context/   This folder
```

No root package.json. The two packages are installed and run independently.

## Rules that matter

1. **The server is the source of truth for accounts, goals and income.** They are fetched on launch; an empty list from the server *is* the list. Never substitute local data for a failed fetch — screens distinguish loading / error / empty.
2. **Transactions, budgets, debts, notifications, rewards and settings are device-local only** (AsyncStorage, key `cashflow:state:v4`). They are seeded with demo data on first run.
3. **Balances are computed on device and pushed** via `PATCH /api/accounts/:id`. Server routes must never also mutate a balance, or every change double-counts.
4. **Every server query is scoped by `userId` from the verified session**, never from request input. Another user's row must read as 404.
5. **Client-facing ids** (`acc-…`, `goal-…`, `inc-…`, `txn-…`) are strings unique *per user*, not globally. Re-POSTing a stored id returns the stored row — writes are idempotent so retries cannot duplicate.
6. **Goal images are private.** The bucket is not public; `GET` routes return presigned URLs generated at read time. Never store a presigned URL in Mongo.
7. **Do not add secrets to context or commits.** `server/.env` is gitignored; `.env.example` is the committed template.

## Commands

```bash
cd mobile  && npm install && npx expo start     # add --clear after changing app.json or deps
cd server  && npm install && npm run dev        # nodemon; npm start for plain node
```

## Warnings

- Neither package has a test runner. `server` `npm test` is a placeholder that exits 1.
- `prettier --check` fails repo-wide (no config; its defaults want double quotes, the code uses single). Use `expo lint` / `eslint`, not prettier.
- Adding a native module requires `npx expo start --clear`, and a rebuild if not using Expo Go.
- MongoDB Atlas is IP-whitelisted; connection failures are usually the network, not the code.

## Other context files

| File | Read it for |
|---|---|
| `1-Project-Overview.md` | What the app does, features, dependencies |
| `2-Architecture-Blueprint.md` | Module responsibilities, data flow, auth and storage architecture |
| `3-Code-Standards.md` | Naming, structure and error-handling conventions in use |
| `4-Development-Guide.md` | Setup, env vars, running, pitfalls |
| `5-API-Reference.md` | Every endpoint and its client method |
| `6-Progress-Tracker.md` | What is done, partial, and outstanding |
