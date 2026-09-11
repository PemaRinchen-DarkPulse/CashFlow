# API Reference

Base URL resolves in `mobile/src/api/client.ts`. All responses are JSON. Errors are `{ error: <code>, message: <text> }`.

Authenticated routes need `Authorization: Bearer <token>`; without it they answer `401 no_session`.

## Unauthenticated

### `GET /`
Health probe. → `{ message: "Welcome to the CashFlow API" }`

### `POST /api/auth/register/start`
Rate limited: 5 per 15 min.

| Body | Validation |
|---|---|
| `name` | non-empty, ≤ 80 chars |
| `email` | valid, lowercased |

→ `201 { expiresInSec }`. Emails a 6-digit code and creates an `Otp` row. No `User` is created yet.
Errors: `email_taken` (409) — deliberate, so the app can redirect to sign-in rather than leave the user waiting for a code.

### `POST /api/auth/register/verify`
Rate limited: 10 per 15 min.

Body: `email`, `code` (6 digits) → `200 { otpToken }` — short-lived, single-purpose.

### `POST /api/auth/register/complete`
Rate limited: 10 per 15 min.

Body: `otpToken`, `password` (≥ 8 chars, not trimmed) → `201 { user, token, expiresAt }`. Creates the `User` and opens a session.

### `POST /api/auth/login`
Rate limited: 10 per 15 min.

Body: `email`, `password` → `200 { user, token, expiresAt }`.
A wrong email and a wrong password both answer `bad_credentials` (401), and a miss burns comparable bcrypt time so response timing cannot reveal which addresses exist.

## Authenticated

### `GET /api/auth/me`
→ `{ user }`. Called on launch: 200 means the session is still good, 401 means show sign-in. `avatar` and `cover` are presigned URLs when a photo has been uploaded.

### `POST /api/auth/logout`
→ `204`. Stateless — only confirms the token was valid.

### `GET /api/me/summary`
→ `{ user }`. Same shape as `/api/auth/me`, including signed photo URLs. Lives in `src/routes/profile.js`.

### `PATCH /api/me/photos`
Profile picture and cover. Accepts **JSON or `multipart/form-data`**. Multer ignores non-multipart, so a removal need not send a file.

| Body | Meaning |
|---|---|
| `avatar` (file) | Replace the round photo |
| `cover` (file) | Replace the banner |
| `removeAvatar` | Clear the round photo |
| `removeCover` | Clear the banner |

→ `{ user }` with freshly signed URLs. Empty body is `empty_patch` (400). Same upload rules as goals: 8 MB, JPEG/PNG/WebP/HEIC, magic-number check. Write order: upload first, save the user, then delete the superseded object.

**User shape**

```
{ id, name, email, createdAt, avatar?, cover? }
```

---

## Accounts — `src/routes/accounts.js`

Limits: 20 accounts per user, name ≤ 40 chars, colour `#rrggbb`.

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/accounts` | — | `{ accounts }` oldest first |
| `POST` | `/api/accounts` | `name`, `balance?`, `color?`, `icon?`, `id?` | `201 { account }` |
| `PATCH` | `/api/accounts/:id` | any of `name`, `balance`, `color`, `icon` | `{ account }` |
| `DELETE` | `/api/accounts/:id` | — | `204` |

- Sending a stored `id` on `POST` returns the stored account (`200`) — the hand-off path, safe to retry.
- `PATCH` doubles as the balance push the app makes after every ledger change.
- `DELETE` refuses the last account (`last_account`, 409): every transaction is booked against one.

## Goals — `src/routes/goals.js`

Limits: 50 goals per user, name ≤ 60 chars, image ≤ 8 MB (JPEG/PNG/WebP/HEIC/HEIF).

Accepts **JSON or `multipart/form-data`** on `POST` and `PATCH`. Multer ignores non-multipart requests, so a client with no picture need not send one. Over multipart every field arrives as a string; the route coerces numbers.

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/goals` | — | `{ goals }` soonest deadline first |
| `GET` | `/api/goals/:id` | — | `{ goal }` |
| `POST` | `/api/goals` | `name`, `target`, `deadline`, `saved?`, `icon?`, `color?`, `id?`, `image?` (file) | `201 { goal }` |
| `PATCH` | `/api/goals/:id` | any of the above, plus `removeImage` | `{ goal }` |
| `DELETE` | `/api/goals/:id` | — | `204` |

**Goal shape**

```
{ id, name, target, saved, deadline (ISO), icon, color,
  image?: <presigned URL>,
  imageMeta?: { key, cid, size, contentType, uploadedAt } }
```

`image` is signed at read time (7-day TTL) because the bucket is private — the stored object URL answers 403.

Validation: `target` > 0; `saved` is **capped at `target`, not rejected** above it, so over-contributing the last of a goal cannot lose the contribution; `deadline` must parse; `color` must be `#rrggbb`.

Storage errors are named, never 500s: `storage_unconfigured` (400), `storage_bucket_missing`, `storage_bucket_taken`, `storage_bucket_invalid`, `storage_bucket_limit`, `storage_rejected`, `storage_unavailable` (502). Bad uploads: `invalid_image`, `image_too_large` (400) — including a file whose bytes do not match its declared type.

## Debts — `src/routes/debts.js`

Money borrowed from or lent to somebody. Limits: 200 records per user, person ≤ 60 chars, note ≤ 200, `principal` > 0.

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/debts` | — | `{ debts }` newest first |
| `GET` | `/api/debts/:id` | — | `{ debt }` |
| `POST` | `/api/debts` | `person`, `direction`, `principal`, `accountId`, `repaid?`, `date?`, `note?`, `id?` | `201 { debt }` |
| `PATCH` | `/api/debts/:id` | any of the above | `{ debt }` |
| `DELETE` | `/api/debts/:id` | — | `204` |

**Debt shape**

```
{ id, person, direction: 'borrowed' | 'lent',
  principal, repaid, date (ISO), note?, accountId }
```

- The whole list comes back rather than a page of it: the app sums "you owe" and "owed to you" from it, so a partial listing would put a wrong figure on screen.
- `direction` is an enum — anything else is `invalid_direction` (400). `borrowed` means the user owes; `lent` means they are owed.
- **A repayment is a `PATCH` raising `repaid`**, sent as the new running total rather than an increment, so a request that arrives twice settles the debt once. There is no repayment endpoint.
- `repaid` is **capped at `principal`, not rejected** above it, for the same reason as `Goal.saved`: settling the last of a debt cannot lose the payment. The cap is re-applied after the whole body, so lowering `principal` and raising `repaid` in one request still lands on a consistent pair.
- `accountId` must be one of the caller's own accounts; anything else is `account_not_found` (400).
- Re-POSTing a stored `id` returns the stored record, so the write is safe to retry.
- **Does not touch account balances.** The client owns those and pushes them separately.

## Budgets — `src/routes/budgets.js`

A monthly spending cap on one expense category. Limits: one row per spending category (11 categories), `limit` > 0.

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/budgets` | — | `{ budgets }` oldest first |
| `GET` | `/api/budgets/:id` | — | `{ budget }` |
| `POST` | `/api/budgets` | `categoryId`, `limit`, `id?` | `201 { budget }` |
| `PATCH` | `/api/budgets/:id` | any of `categoryId`, `limit` | `{ budget }` |
| `DELETE` | `/api/budgets/:id` | — | `204` |

**Budget shape**

```
{ id, categoryId, limit }
```

- The whole list comes back rather than a page of it: the app derives spent-vs-limit from it against the ledger, so a partial listing would hide a category that is already over.
- `categoryId` must be one of the app's expense categories (`food`, `groceries`, `shopping`, `transport`, `bills`, `fun`, `health`, `learning`, `travel`, `subs`, `other`). An income id is `invalid_category` (400) — a cap on money coming in is not a budget.
- One cap per category: a second `POST` for a category that already has a row is `budget_exists` (409). Raise or lower the existing one with `PATCH`.
- Re-POSTing a stored `id` returns the stored record, so the write is safe to retry.
- **Does not store spent and does not touch account balances.** Spent is derived on the phone from this month's expenses; writing it here as well would be a second ledger the two could disagree on.

## Preferences — `src/routes/preferences.js`

A singleton on the `User` document, not a collection. There is always exactly one set per account.

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/preferences` | — | `{ preferences }` every key present |
| `PATCH` | `/api/preferences` | any of `currency`, `hideBalance`, `budgetAlerts`, `goalReminders`, `weeklyDigest` | `{ preferences }` |

**Preferences shape**

```
{ currency, hideBalance, budgetAlerts, goalReminders, weeklyDigest }
```

- A user who has never changed anything gets the defaults (`Nu.`, all toggles on) rather than a 404: "never configured" and "configured to the defaults" are the same thing to the app.
- Every PATCH field is optional, but at least one recognised field is required (`empty_patch` 400). Unknown keys are `unknown_setting` (400) rather than ignored — a typo must not look like it saved.
- Toggles must be real booleans. The string `"false"` is rejected: `Boolean("false")` is `true`, so coercion would store the opposite of what was asked.
- `currency` is a symbol (`Nu.`, `$`, `INR`), 1–8 characters, no whitespace inside.
- No POST and no DELETE: the set exists from the moment the account does, and putting everything back means sending the defaults.
- No extra database read on GET: `requireAuth` has already loaded the user these are stored on.

## Incomes — `src/routes/incomes.js`

Separate collection from transactions. Limits: title ≤ 60, note ≤ 200, amount > 0.

| Method | Path | Query / Body | Response |
|---|---|---|---|
| `GET` | `/api/incomes` | `accountId?`, `from?`, `to?`, `limit?` (1–2000, default 500) | `{ incomes, total, count }` |
| `GET` | `/api/incomes/:id` | — | `{ income }` |
| `POST` | `/api/incomes` | `title`, `accountId`, `categoryId`, `amount`, `date?`, `note?`, `id?` | `201 { income }` |
| `PATCH` | `/api/incomes/:id` | any of the above | `{ income }` |
| `DELETE` | `/api/incomes/:id` | — | `204` |

- `total` is summed server-side over the **whole filter**, not the returned page, so a capped listing still reports the true figure.
- `accountId` must be one of the caller's own accounts; anything else is `account_not_found` (400), which also avoids confirming another user's account exists.
- Re-POSTing a stored `id` returns the stored entry — this is what makes the app's hand-off of local income safe to retry.
- **Does not touch account balances.** The client owns those and pushes them separately; doing both would double-count.

## Expenses — `src/routes/expenses.js`

Money going out. Parallel to `incomes` rather than a shared ledger table, so "earned this month" never scans spending. Limits: 2000 per user, title ≤ 60, note ≤ 200, `amount` > 0.

| Method | Path | Query / Body | Response |
|---|---|---|---|
| `GET` | `/api/expenses` | `accountId?`, `from?`, `to?`, `limit?` (1–2000, default 500) | `{ expenses, total, count }` newest first |
| `GET` | `/api/expenses/:id` | — | `{ expense }` |
| `POST` | `/api/expenses` | `title`, `accountId`, `categoryId`, `amount`, `date?`, `note?`, `id?` | `201 { expense }` |
| `PATCH` | `/api/expenses/:id` | any of the above | `{ expense }` |
| `DELETE` | `/api/expenses/:id` | — | `204` |

- `kind` is `'expense'` on the serialiser, not stored.
- `total` is summed server-side over the **whole filter**, not the returned page.
- `accountId` must be one of the caller's own accounts; anything else is `account_not_found` (400).
- Re-POSTing a stored `id` returns the stored entry — retries and the launch hand-off of older local expenses cannot double-count.
- **Does not touch account balances.** The client owns those and pushes them separately; doing both would double-count.
- Cap `too_many_expenses` (409) at 2000.

---

## Mobile API clients — `mobile/src/api/`

| Module | Functions |
|---|---|
| `client.ts` | `request(path, { method, body, token })`, `isApiConfigured()`. Never throws — resolves `{ ok: true, data }` or `{ ok: false, code, message }`. Passes a `FormData` body through without a `content-type` header |
| `authApi.ts` | `startRegistration`, `verifyRegistration`, `completeRegistration`, `login`, `fetchMe`, `logout` |
| `profileApi.ts` | `updateServerPhotos`. Multipart when a file goes with it, JSON for a removal |
| `accountsApi.ts` | `fetchServerAccounts`, `createServerAccount`, `updateServerAccount`, `deleteServerAccount` |
| `debtsApi.ts` | `fetchServerDebts`, `createServerDebt`, `updateServerDebt`, `deleteServerDebt` |
| `budgetsApi.ts` | `fetchServerBudgets`, `createServerBudget`, `updateServerBudget`, `deleteServerBudget` |
| `goalsApi.ts` | `fetchServerGoals`, `createServerGoal`, `updateServerGoal`, `deleteServerGoal`. Sends JSON without a picture, multipart with one |
| `incomesApi.ts` | `fetchServerIncomes`, `createServerIncome`, `deleteServerIncome` |
| `expensesApi.ts` | `fetchServerExpenses`, `createServerExpense`, `deleteServerExpense` |
| `preferencesApi.ts` | `fetchServerPreferences`, `updateServerPreferences`. `ServerPreferences` is `Settings` plus `currency`, so adding a toggle and forgetting the server type is a compile error |

React Native's `FormData` takes `{ uri, name, type }` where a browser takes a `File`; the bytes are read from the device path at send time, so an image is never loaded into JS memory.

## External integrations

| Service | Used for | Where |
|---|---|---|
| MongoDB Atlas | All persistence | `src/db/connect.js` |
| Brevo REST v3 (`https://api.brevo.com/v3/smtp/email`) | OTP email | `src/services/mailer.js` |
| Filebase S3 (`https://s3.filebase.com`) | Goal images | `src/services/filebase.js` |
