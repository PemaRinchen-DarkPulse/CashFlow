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
→ `{ user }`. Called on launch: 200 means the session is still good, 401 means show sign-in.

### `POST /api/auth/logout`
→ `204`. Stateless — only confirms the token was valid.

### `GET /api/me/summary`
→ `{ user }`. Defined inline in `index.js`.

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

## Incomes — `src/routes/incomes.js`

Separate collection from transactions. Limits: title ≤ 60, note ≤ 200, amount > 0.

| Method | Path | Query / Body | Response |
|---|---|---|---|
| `GET` | `/api/incomes` | `accountId?`, `from?`, `to?`, `limit?` (1–500, default 100) | `{ incomes, total, count }` |
| `GET` | `/api/incomes/:id` | — | `{ income }` |
| `POST` | `/api/incomes` | `title`, `accountId`, `categoryId`, `amount`, `date?`, `note?`, `id?` | `201 { income }` |
| `PATCH` | `/api/incomes/:id` | any of the above | `{ income }` |
| `DELETE` | `/api/incomes/:id` | — | `204` |

- `total` is summed server-side over the **whole filter**, not the returned page, so a capped listing still reports the true figure.
- `accountId` must be one of the caller's own accounts; anything else is `account_not_found` (400), which also avoids confirming another user's account exists.
- Re-POSTing a stored `id` returns the stored entry — this is what makes the app's hand-off of local income safe to retry.
- **Does not touch account balances.** The client owns those and pushes them separately; doing both would double-count.

---

## Mobile API clients — `mobile/src/api/`

| Module | Functions |
|---|---|
| `client.ts` | `request(path, { method, body, token })`, `isApiConfigured()`. Never throws — resolves `{ ok: true, data }` or `{ ok: false, code, message }`. Passes a `FormData` body through without a `content-type` header |
| `authApi.ts` | `startRegistration`, `verifyRegistration`, `completeRegistration`, `login`, `fetchMe`, `logout` |
| `accountsApi.ts` | `fetchServerAccounts`, `createServerAccount`, `updateServerAccount`, `deleteServerAccount` |
| `goalsApi.ts` | `fetchServerGoals`, `createServerGoal`, `updateServerGoal`, `deleteServerGoal`. Sends JSON without a picture, multipart with one |
| `incomesApi.ts` | `fetchServerIncomes`, `createServerIncome`, `deleteServerIncome` |

React Native's `FormData` takes `{ uri, name, type }` where a browser takes a `File`; the bytes are read from the device path at send time, so an image is never loaded into JS memory.

## External integrations

| Service | Used for | Where |
|---|---|---|
| MongoDB Atlas | All persistence | `src/db/connect.js` |
| Brevo REST v3 (`https://api.brevo.com/v3/smtp/email`) | OTP email | `src/services/mailer.js` |
| Filebase S3 (`https://s3.filebase.com`) | Goal images | `src/services/filebase.js` |
