# Progress Tracker

Status as of the current working tree. Nothing here is marked complete unless the code supports it.

## Server

| Feature | Status | Notes |
|---|---|---|
| Email OTP registration (3 steps) | Complete | Rate limited; no `User` row until the code is verified |
| Login / `me` / `logout` | Complete | Stateless JWT, 1 day; uniform wrong-credentials reply with timing equalisation |
| `requireAuth` gate on `/api` | Complete | Mounted on the prefix, so new routers are private by default |
| Accounts CRUD | Complete | 20 per user; last account protected |
| Incomes CRUD + month totals | Complete | Own collection; server-side sum over the filter |
| Goals CRUD | Complete | 50 per user; JSON or multipart |
| Filebase upload / replace / delete | Complete | Verified end to end against the live bucket |
| Presigned image URLs | Complete | 7-day TTL, generated per read |
| Bucket auto-provisioning | Complete | `HeadBucket`, create only on a genuine 404, cached per boot |
| Upload validation | Complete | MIME allowlist, 8 MB cap, magic-number check |
| Named storage errors | Complete | Storage failures answer 502 with a code, never an unhandled 500 |

## Mobile

| Feature | Status | Notes |
|---|---|---|
| Auth screens + biometric unlock | Complete | `expo-secure-store` + `expo-local-authentication` |
| Accounts wired to server | Complete | Fetch on launch, create/delete server-first, debounced balance push |
| Goals wired to server | Complete | Fetch on launch; add/delete server-first; contribute patches `saved` |
| Goal photo upload with crop | Complete | Dropzone UI, square crop, uploads with the goal in one request |
| Income mirrored to server | Partial | Income transactions POST to `/api/incomes` and the month total is read back. **Expenses are not sent at all** |
| "Earned this month" from database | Complete | Shows `—` + retry when the server cannot be reached, rather than a stale local sum |
| Transactions | Partial | Full local CRUD; only the income half reaches the server |
| Budgets, debts, notifications, rewards, settings | Not Implemented (server) | Device-only, AsyncStorage. Fully working locally |
| Custom calendar drawer | Complete | Fixed six-row grid so the sheet does not resize between months |
| Skeleton loading states | Complete | Balance card, stat tiles, account and goal lists |
| Actionable empty states | Complete | Stat tiles become a tappable prompt when empty or offline |
| Dark launch (no white flash) | Complete | Legacy `expo.splash` key added for Expo Go; loading states paint `colors.bg` |
| Shared `BackButton` | Complete | Circular, used by every `ScreenHeader` |

## Known technical debt

| Item | Impact |
|---|---|
| **No automated tests in either package** | Everything has been verified by throwaway Node scripts against live services. There is no regression net |
| Transactions are device-only | A reinstall loses the ledger. Balances are reconstructed from the seed, not from history |
| `mobile/src/data/seed.ts` still populates a fresh install | Demo transactions, budgets, debts and rewards appear before any real data. Goals and accounts are replaced once the server answers; the rest are not |
| No pagination anywhere on the client | `GET /api/incomes` supports `limit`/`from`/`to`, but nothing else does and no screen pages |
| `prettier` disagrees with the codebase | No config committed; `--check` fails on untouched files. Use eslint only |
| `Goal.icon` is vestigial | The icon picker was removed; every new goal saves the same `flag` fallback |
| `Income.cid` often empty | Filebase did not return the CID header on `PutObject` in testing. Harmless — the object key is what everything uses |

## Blocked / environmental

| Item | Detail |
|---|---|
| MongoDB Atlas reachability | Intermittent `ReplicaSetNoPrimary` from this machine during recent work — DNS/network, and IP whitelisting. Not a code fault, but it blocks any test run |
| Filebase account mismatch | The bucket was auto-created in whichever account the current key belongs to. If that is not the account in the Filebase console, there is now an unused empty `cashflow` bucket in the other one — worth confirming which account holds live data |

## Next recommended work

1. **Send expenses to the server.** Income already has a collection, a route and a reconcile path; expenses have none, so the ledger is half-persisted and a reinstall loses spending history. Either widen `incomes` into a `transactions` collection or add a parallel one.
2. **Stop seeding a signed-in user.** Demo transactions and budgets appear alongside real server data. Seed only when there is no session.
3. **Add a test runner.** Server-side is the higher value: the routes have well-defined contracts and the ad-hoc scripts written during development can be adapted directly.
4. **Persist budgets and debts server-side**, following the goals pattern — a collection scoped by `userId`, a client id, and loading/error/empty states on the screen.
5. **Confirm the Filebase account**, then decide whether to keep the auto-created bucket or repoint `FILEBASE_BUCKET`.
