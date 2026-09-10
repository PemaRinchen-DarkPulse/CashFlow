# Architecture Blueprint

## Shape

Two independently installed packages in one git repository. The mobile app talks to the server over HTTP with a bearer token. There is no shared code, workspace or build step between them.

## Server layers

Request flow: `index.js` → `cors` → `express.json` → route-level middleware → router → service → model → MongoDB.

| Layer | Directory | Responsibility |
|---|---|---|
| Assembly | `server/index.js` | Mounts routers, applies the auth gate, exports `{ app, start }` |
| Config | `src/config/env.js` | Reads and validates every env var once at boot; exits on a missing required one |
| Middleware | `src/middleware/` | `requireAuth` (bearer verify + user load), `errorHandler` (ApiError → status, Mongo/multer mapping) |
| Routes | `src/routes/` | HTTP shape, input validation, orchestration |
| Services | `src/services/` | `filebase` (S3), `mailer` (Brevo), `otpService` (issue/verify codes) |
| Models | `src/models/` | Mongoose schemas, indexes, `toPublic()` serialisers |
| Utils | `src/utils/` | `ApiError`, `asyncHandler`, `tokens` (JWT sign/verify), `validate` |

### The auth gate

`index.js` mounts `requireAuth` on the `/api` prefix rather than per route:

```js
app.use('/api/auth', authRoutes);   // the only unauthenticated routes
app.use('/api', requireAuth);       // everything below is private by default
app.use('/api/accounts', accountRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/incomes', incomeRoutes);
```

A router added under `/api` after this line is protected the moment it is mounted. `GET /` (health) sits above the gate.

`requireAuth` verifies the signature **and reloads the user**, so a token for a deleted account stops working immediately rather than at expiry.

## Database

MongoDB via Mongoose. Five collections.

| Collection | Model | Owner key | Indexes |
|---|---|---|---|
| `users` | `User` | — | `email` unique |
| `otps` | `Otp` | — | `email` unique; TTL on `expiresAt` (self-sweeping) |
| `accounts` | `Account` | `userId` | `{userId, id}` unique |
| `incomes` | `Income` | `userId` | `{userId, id}` unique; `{userId, date: -1}` |
| `goals` | `Goal` | `userId` | `{userId, id}` unique; `{userId, deadline: 1}` |

Every owned collection carries both a Mongo `_id` and a client-facing `id` string. The client id is what the phone's local records point at, and is unique **per user** — two users can both hold `acc-everyday`.

`Goal.image` is an embedded sub-document (`key`, `url`, `cid`, `size`, `contentType`, `uploadedAt`). Image **bytes are never stored in Mongo** — only the record needed to fetch, replace and delete the object.

## Object storage

Filebase, S3-compatible, accessed with `@aws-sdk/client-s3`.

- `forcePathStyle: true` is mandatory — Filebase addresses buckets as `s3.filebase.com/<bucket>`, not `<bucket>.s3.filebase.com`.
- Object key layout: `goals/<userId>/<goalId>/<timestamp>-<random>.<ext>` — user-first, so one person's files share a prefix.
- **The bucket is private.** The stored object URL answers 403 to anyone without the account keys. `GET`/`POST`/`PATCH` responses therefore return a **presigned URL** generated at read time (`present()` in `routes/goals.js`, 7-day TTL — SigV4's maximum).
- The bucket is auto-provisioned: `ensureBucket()` does a `HeadBucket`, and creates it only on a genuine 404. Cached per process, so it costs one request per boot.
- Uploads are validated before they reach storage: allowed MIME type, 8 MB cap, and a **magic-number check** — the declared content type is the client's word, not evidence.

### Write ordering

1. **Create**: upload first, then write the document. If the write fails, the orphaned object is deleted. A goal never points at a picture that failed to store.
2. **Replace**: upload the new object, save the document, *then* delete the superseded one — only once the database no longer references it.
3. **Delete**: document first, object second. A failed object delete still leaves the goal gone, which is what was asked for.

## Mobile architecture

### Routing

`expo-router`, file-based. `app/_layout.tsx` holds the provider stack:

```
GestureHandlerRootView
└── SafeAreaProvider → ToastProvider → AuthProvider → FinanceProvider → RootNavigator
```

`RootNavigator` uses `Stack.Protected` guards so the signed-in and signed-out halves are mutually exclusive — the dashboard is never mounted, even for a frame, before sign-in.

| Group | Screens |
|---|---|
| `(auth)` | `login`, `register` |
| `(tabs)` | `index` (Home), `transactions` (Activity), `analytics`, `goals` (Plan), `profile` |
| root modals | `add-transaction`, `add-goal`, `add-debt`, `edit-budget` |
| root screens | `transaction/[id]`, `notifications`, `rewards` |

### State

Two React contexts. No Redux/Zustand.

| Context | Holds | Persistence |
|---|---|---|
| `AuthContext` | session status, token, user, biometric enrolment | `expo-secure-store` (keychain), AsyncStorage on web |
| `FinanceContext` | the whole `FinanceState` + server sync for accounts, goals, income | AsyncStorage `cashflow:state:v4` |

`FinanceContext` is a `useReducer` over `FinanceState` plus effects that reconcile with the server.

### What is server-backed vs local

| Data | Source of truth | Notes |
|---|---|---|
| Accounts | Server | Fetched on launch; `accounts` is excluded from the persisted local state |
| Goals | Server | Fetched on launch; local seed replaced once the server answers |
| Income total | Server | `GET /api/incomes?from&to` for the current month |
| Transactions | Device | Income entries are mirrored to the server; expenses are not |
| Budgets, debts, notifications, rewards, settings, profile | Device | AsyncStorage only |

### Data flow — balances

Balances move **locally first**. `FinanceContext` keeps `syncedBalances` (a ref of the last server-confirmed figure per account) and a debounced effect pushes any drift with `PATCH /api/accounts/:id`. A failed push restores the old figure so the next change retries it.

Server routes must never also adjust a balance — the income route documents this explicitly, because doing both would double-count every entry.

### Data flow — income reconcile

On launch, `FinanceContext`:
1. reads `GET /api/incomes` for the current month,
2. finds local income transactions in that month the server does not have,
3. POSTs them with their local `txn-…` id (idempotent, so a retry cannot double-count),
4. re-reads the total, so what the Home screen shows is a figure the database confirmed.

### API client

`src/api/client.ts` is the only place the app touches the network.

- Base URL resolves from `EXPO_PUBLIC_API_URL`, else from Expo's `hostUri` (the dev machine's LAN address) plus `EXPO_PUBLIC_API_PORT`.
- **Nothing throws.** Every call resolves to `{ ok: true, data }` or `{ ok: false, code, message }`; callers map that straight to a screen transition or a toast.
- 15-second timeout implemented with a manual timer, because React Native's `AbortSignal` polyfill has no static `timeout()`.
- A `FormData` body is passed through untouched, with no `content-type` header — `fetch` must write its own, including the multipart boundary.

## Authentication architecture

Registration is three server calls so nothing lands in `users` until the address is proven:

1. `POST /register/start` — name + email, code emailed, `Otp` row created (no `User` yet)
2. `POST /register/verify` — code checked, returns a short-lived single-purpose `otpToken`
3. `POST /register/complete` — password set, `User` created, session opened

Two token kinds are signed with the same secret but carry a `kind` claim (`session` / `otp`), and `verify()` rejects the wrong one — a sign-up pass can never be used as a session.

Sessions are stateless JWTs (1 day). `POST /logout` only confirms the token was valid; ending a session is the client discarding it.

Rate limits on the auth routes: 5 sends / 15 min, 10 guesses / 15 min. `app.set('trust proxy', 1)` so the limiter keys on `X-Forwarded-For` behind a proxy.
