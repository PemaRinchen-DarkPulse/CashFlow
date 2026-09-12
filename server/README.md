# CashFlow server

Express API for CashFlow. It owns accounts, income, expenses, budgets, goals, debts, preferences, and profile photos. Sessions are JWT bearer tokens (one day). Every row is scoped to the signed-in user.

**Production:** [https://cash-flow-server-fawn.vercel.app](https://cash-flow-server-fawn.vercel.app)

A healthy deploy answers:

```json
{ "message": "Welcome to the CashFlow API" }
```

Client docs: [../README.md](../README.md) · [../mobile/README.md](../mobile/README.md)

Full route list: [../context/5-API-Reference.md](../context/5-API-Reference.md)

## Requirements

- Node.js 20 or newer (Vercel builds use `20.x`; local work is fine on 20–24)
- MongoDB Atlas cluster
- Brevo account and a **v3 API key** (`xkeysib-…`, not an SMTP `xsmtpsib-` key)
- A verified sender address in Brevo (`EMAIL_FROM`)
- Optional: Filebase keys for goal and profile photos

## Install and run locally

```bash
cd server
npm install
copy .env.example .env
```

Fill `.env`, then:

```bash
npm run dev      # nodemon
npm start        # plain node
```

Default port is `5000` (`PORT` in `.env`). The phone app in development calls this host on that port.

## Environment

Copy from `.env.example`. dotenv only reads `KEY=value` lines.

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | local only | Default `5000`. Vercel sets its own port. |
| `MONGO_URI` | yes | Atlas string. Put the database name (`cashflow`) before `?`, or the driver uses `test`. |
| `JWT_SECRET` | yes | Long random string. Changing it signs everyone out. |
| `BREVO_API_KEY` | yes | Must start with `xkeysib-`. |
| `EMAIL_FROM` | yes | Must be a verified Brevo sender. |
| `EMAIL_FROM_NAME` | no | Defaults to `CashFlow`. |
| `FILEBASE_ACCESS_KEY` | no | Blank disables uploads; the API still boots. |
| `FILEBASE_SECRET_KEY` | no | |
| `FILEBASE_BUCKET` | no | Lowercase S3 name, 3–63 characters. |
| `FILEBASE_ENDPOINT` | no | Defaults to `https://s3.filebase.com`. |
| `FILEBASE_REGION` | no | Defaults to `us-east-1`. |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Never commit `.env`.

## Layout

```
server/
├── api/index.js          Vercel handler (exports the Express app)
├── index.js              App assembly; `npm start` listens here
├── vercel.json           Rewrites every path to /api
├── .env.example
└── src/
    ├── config/env.js     Reads and checks env
    ├── db/connect.js     Mongo connection (cached on Vercel)
    ├── middleware/       requireAuth, errorHandler
    ├── models/           User, Account, Income, Expense, Budget, Goal, Debt, Otp
    ├── routes/           One router per resource
    ├── services/         mailer, otp, Filebase, delete-user
    └── utils/            ApiError, tokens, validate, presentUser
```

## Auth

Unauthenticated: `POST /api/auth/register/*`, `POST /api/auth/login`, and `GET /`.

Everything under `/api` except `/api/auth` needs `Authorization: Bearer <token>`.

| Method | Path | What it does |
| --- | --- | --- |
| `POST` | `/api/auth/register/start` | Email a 6-digit code |
| `POST` | `/api/auth/register/verify` | Trade the code for a short-lived pass |
| `POST` | `/api/auth/register/complete` | Set password, create the user, open a session |
| `POST` | `/api/auth/login` | Email + password → `{ user, token, expiresAt }` |
| `GET` | `/api/auth/me` | Current user (used on app launch) |
| `PATCH` | `/api/auth/me` | Rename |
| `PATCH` | `/api/auth/password` | Change password (needs the current one) |
| `DELETE` | `/api/auth/me` | Close the account (needs the password) |
| `POST` | `/api/auth/logout` | Confirms the token; the client drops it |

Wrong email and wrong password both return `bad_credentials`.

## Resources

All lists are per user. Client ids (`acc-…`, `goal-…`, …) are unique per user. Re-POSTing a stored id returns the stored row so retries cannot duplicate.

| Resource | Base path | Notes |
| --- | --- | --- |
| Accounts | `/api/accounts` | Max 20. Last account cannot be deleted. Balances are written by the client. |
| Incomes | `/api/incomes` | Does not change balances. |
| Expenses | `/api/expenses` | Does not change balances. |
| Budgets | `/api/budgets` | One cap per expense category. Spent is not stored. |
| Goals | `/api/goals` | JSON or multipart (photo). Max 50. |
| Debts | `/api/debts` | Repay with `PATCH` raising `repaid`. |
| Preferences | `/api/preferences` | `GET` is always complete. `PATCH` is partial. |
| Profile photos | `/api/me/photos` | Private bucket; links are signed on read. |

Errors look like `{ "error": "<code>", "message": "<text>" }`.

## Deploy on Vercel

This folder is the Vercel project (**Root Directory = `server`**).

1. Push this repo (or this folder) and import it on Vercel.
2. Set Root Directory to `server`.
3. Copy the same keys from `.env` into **Settings → Environment Variables** (Production):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `BREVO_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_FROM_NAME` (optional)
   - Filebase keys if you use photos
4. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0`. Vercel IPs change; a single office IP will block the function.
5. Redeploy.

The serverless entry is `api/index.js`. The app does not call `listen()` on Vercel. Mongo is opened on the first request and reused in that isolate.

If env vars are missing, the function answers `503` with `server_unconfigured` instead of crashing.

## Local vs phone

- Expo Go / `npx expo start` → this process on your LAN, port `5000`.
- Installed APK → `https://cash-flow-server-fawn.vercel.app`.

A phone cannot use `localhost` for your PC. Keep `npm run dev` running and stay on the same Wi-Fi.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | nodemon, restarts on change |
| `npm start` | `node index.js` |
| `npm test` | Placeholder; exits 1 |

---

CashFlow API · Made by Pema Rinchen
