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
| Expenses CRUD + totals | Complete | Own collection parallel to income; 2000 cap; does not touch balances |
| Goals CRUD | Complete | 50 per user; JSON or multipart |
| Debts CRUD | Complete | 200 per user; repayment is a `PATCH` raising `repaid`, capped at `principal` |
| Budgets CRUD | Complete | One cap per expense category; `limit` > 0; spent is not stored |
| Preferences | Complete | Embedded on `User`; GET always complete; PATCH is partial; unknown keys rejected |
| Filebase upload / replace / delete | Complete | Verified end to end against the live bucket. Goals and profile photos share the same service |
| Presigned image URLs | Complete | 7-day TTL, generated per read (`present` / `presentUser`) |
| Bucket auto-provisioning | Complete | `HeadBucket`, create only on a genuine 404, cached per boot |
| Upload validation | Complete | MIME allowlist, 8 MB cap, magic-number check |
| Named storage errors | Complete | Storage failures answer 502 with a code, never an unhandled 500 |

## Mobile

| Feature | Status | Notes |
|---|---|---|
| Auth screens + biometric unlock | Complete | `expo-secure-store` + `expo-local-authentication` |
| Accounts wired to server | Complete | Fetch on launch, create/delete server-first, debounced balance push |
| Goals wired to server | Complete | Fetch on launch; add/delete server-first; contribute patches `saved` |
| Goal lists never render half-loaded | Complete | The pictures are prefetched before the goals are dispatched, and the totals card is gated with the list, so a tab is skeleton, error, empty or finished — never partly drawn |
| Debts wired to server | Complete | Fetch on launch; add/edit/repay/delete all server-first; `edit-debt` screen; loading/error/empty states |
| Budgets wired to server | Complete | Fetch on launch; add/edit/delete server-first; loading/error/empty on Home and Analytics; not seeded or persisted |
| Preferences wired to server | Complete | Fetch on launch; toggles PATCH one field; currency rides along; loading/error on Profile; hide-balance waits with the balance card |
| Goal photo upload with crop | Complete | Dropzone UI, square crop, uploads with the goal in one request |
| Profile photos wired to server | Complete | Avatar (square) and cover (16:9) on the User; upload/replace/remove server-first; warmed before the account is released |
| Income mirrored to server | Complete | Fetch on launch into the ledger; add/delete server-first; month total still a separate summed read |
| Expenses wired to server | Complete | Fetch on launch; add/delete server-first; older local rows handed off; Activity/Home gated on loading |
| "Earned this month" from database | Complete | Shows `—` + retry when the server cannot be reached, rather than a stale local sum |
| Transactions | Complete (server list) | Activity shows only database rows. Both halves fetched on launch; nothing is seeded or persisted |
| Notifications, rewards | Not Implemented (server) | Device-only, AsyncStorage. Fully working locally. Settings, currency and budgets now live on the account |
| Custom calendar drawer | Complete | Fixed six-row grid so the sheet does not resize between months |
| Skeleton loading states | Complete | Balance card, stat tiles, account and goal lists |
| Actionable empty states | Complete | Stat tiles become a tappable prompt when empty or offline |
| Dark launch (no white flash) | Complete | Legacy `expo.splash` key added for Expo Go; loading states paint `colors.bg` |
| Shared `BackButton` | Complete | Circular, used by every `ScreenHeader` |

## Known technical debt

| Item | Impact |
|---|---|
| **No automated tests in either package** | Everything has been verified by throwaway Node scripts against live services. There is no regression net |
| Transactions are no longer the source of spending history | A reinstall still loses notifications and rewards. The ledger and budgets now come back from the database |
| `mobile/src/data/seed.ts` still populates a fresh install | Demo rewards appear before any real data. Accounts, goals, debts, budgets, settings and expenses are no longer seeded or persisted |
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

1. **Stop seeding a signed-in user.** Demo rewards appear alongside real server data. Seed only when there is no session.
2. **Add a test runner.** Server-side is the higher value: the routes have well-defined contracts and the ad-hoc scripts written during development can be adapted directly.
3. **Confirm the Filebase account**, then decide whether to keep the auto-created bucket or repoint `FILEBASE_BUCKET`.
