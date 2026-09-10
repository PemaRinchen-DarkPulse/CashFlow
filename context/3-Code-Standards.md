# Code Standards

Conventions observed in the codebase. Follow them; do not introduce competing ones.

## Naming

| Thing | Convention | Examples |
|---|---|---|
| React component file | PascalCase `.tsx`, one component per file | `GoalCard.tsx`, `BackButton.tsx` |
| Route file | expo-router lowercase kebab | `add-goal.tsx`, `transaction/[id].tsx` |
| Route group | parenthesised | `(auth)`, `(tabs)` |
| Non-component TS module | camelCase | `goalsApi.ts`, `analytics.ts`, `authStorage.ts` |
| Server module | camelCase, except models | `errorHandler.js`, `otpService.js` |
| Mongoose model file | PascalCase singular | `Goal.js`, `Income.js`, `User.js` |
| Server route file | lowercase plural, matching the mount path | `goals.js` → `/api/goals` |
| Constants | `SCREAMING_SNAKE_CASE` at module top | `MAX_GOALS`, `SIGNED_URL_TTL`, `DAYS_PER_MONTH` |
| Functions / variables | camelCase | `requireGoalName`, `capSaved`, `monthsToDeadline` |
| Types | PascalCase, `type` not `interface` | `type Goal`, `type GoalImageUpload` |
| Mobile API functions | `<verb>Server<Resource>` | `fetchServerGoals`, `createServerGoal`, `deleteServerGoal` |

## Server conventions

### Routes

Every handler is wrapped in `asyncHandler` so a rejected promise reaches the error middleware:

```js
router.get('/', asyncHandler(async (req, res) => { … }));
```

Validation lives in named helpers at the top of the route file, one per field, each throwing `ApiError`:

```js
function requireTarget(value) {
  const target = Number(value);
  if (!Number.isFinite(target) || target <= 0) {
    throw ApiError.badRequest('invalid_target', 'Enter a target greater than zero');
  }
  return Math.round(target * 100) / 100;
}
```

- `requireX` throws when absent or invalid. `readX(value, fallback)` returns the fallback when absent.
- Money is rounded to cents on write: `Math.round(n * 100) / 100`.
- Every query is scoped `{ userId: req.user._id, id: req.params.id }`.
- A missing row throws `ApiError.notFound`, never a 403 — that would confirm another user's row exists.

### Errors

`ApiError(status, code, message)` with static builders: `badRequest` (400), `unauthorized` (401), `notFound` (404), `conflict` (409), `badGateway` (502).

`code` is the stable machine string the app switches on; `message` is the short line it shows. `errorHandler` maps Mongo `11000`, Mongoose `ValidationError` and `MulterError`; anything unrecognised is logged in full and answered as a bare 500.

### Models

Every model exposes `toPublic()` — the only shape allowed over the wire. Internal fields (`_id`, `userId`, `passwordHash`) never leave through it. Dates are serialised with `.toISOString()`.

## Mobile conventions

### Components

Named exports, props type exported alongside:

```tsx
export type GoalCardProps = { goal: Goal; currency: string; … };
export function GoalCard({ goal, currency }: GoalCardProps) { … }
```

Structure in every component file: imports → types → component → `StyleSheet.create` at the bottom.

### Styling

- **All colour, spacing, radius and font values come from `src/theme`.** No literal hex in components except `#04140A`, the dark ink used on primary-filled surfaces.
- Text renders through `<AppText variant="…">`, never a bare `<Text>`.
- Pressed states use the `({ pressed }) => [...]` style function.
- Icons are Ionicons via `@expo/vector-icons`.

### Imports

Absolute via the `@/` alias (`@/src/components/AppText`), never deep relative paths. Order: external packages, then `@/` modules, then types.

### Typing

- `type` aliases throughout; no `interface`.
- Optional server-backed fields are `?`, and "not yet known" is modelled as `null` distinct from a real zero or empty (`monthlyIncome: number | null`).
- Mutating context methods that hit the server return `Promise<MutationResult>` = `{ ok: true } | { ok: false; message: string }`.

### State

- Server-backed resources expose the triple `xLoading` / `xError` / `refreshX` from `FinanceContext`.
- Screens must render three distinct states — loading (skeleton), error (retry), empty (call to action). An empty list is never shown while a fetch is in flight.
- Reducer actions are `{ type: '…' , …payload }`, verbs in camelCase (`addGoal`, `setGoals`, `replaceGoal`).

## Comments

The codebase comments **why**, not what — trade-offs, rejected alternatives and non-obvious constraints. Match that register. Do not add comments that restate the code.

## API naming

- Plural resource paths: `/api/accounts`, `/api/goals`, `/api/incomes`.
- REST verbs: `GET` list / `GET /:id` / `POST` create / `PATCH /:id` partial update / `DELETE /:id`.
- Responses are wrapped in a named key — `{ goal }`, `{ goals }`, `{ account }` — never a bare array or object.
- `DELETE` answers `204` with no body.
- Errors answer `{ error: <code>, message: <text> }`.

## Testing

No test runner is configured in either package. Verification to date has been ad-hoc Node scripts run against the real database and Filebase. If you add tests, you are establishing the convention — pick one and state it here.
