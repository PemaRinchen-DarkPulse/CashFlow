# Development Guide

## Install

The two packages are independent — there is no root `package.json`.

```bash
cd server && npm install
cd mobile && npm install
```

## Environment

Only the server reads a `.env`. Copy the template and fill it in:

```bash
cd server && cp .env.example .env
```

| Variable | Required | Notes |
|---|---|---|
| `PORT` | yes | API port. The app derives its base URL from this via `EXPO_PUBLIC_API_PORT` |
| `MONGO_URI` | yes | Full Atlas connection string. Include the database name before the `?`, or the driver silently uses `test`. Alternatively supply `MONGO_USER` + `MONGO_PASSWORD` + `MONGO_CLUSTER` |
| `JWT_SECRET` | yes | Long random string. Changing it signs every user out |
| `BREVO_API_KEY` | yes | Must start `xkeysib-` (API keys tab). An SMTP key `xsmtpsib-` is rejected with 401 by the REST API — boot fails fast with an explanation |
| `EMAIL_FROM` | yes | Must be a verified sender in Brevo or every send is rejected |
| `EMAIL_FROM_NAME` | no | Defaults to `CashFlow` |
| `FILEBASE_ACCESS_KEY` | no | Blank disables uploads; the server still boots |
| `FILEBASE_SECRET_KEY` | no | |
| `FILEBASE_BUCKET` | no | **Lowercase only.** Boot warns and suggests a fix if it contains capitals |
| `FILEBASE_ENDPOINT` | no | Defaults `https://s3.filebase.com` |
| `FILEBASE_REGION` | no | Defaults `us-east-1` |

`.env` is gitignored. Never commit real values; never paste them into documentation.

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The mobile app reads `EXPO_PUBLIC_API_PORT` (and optionally `EXPO_PUBLIC_API_URL`) from `mobile/.env`. Only `EXPO_PUBLIC_*` names are exposed to the bundle.

## Run

```bash
cd server && npm run dev      # nodemon, restarts on change
cd server && npm start        # plain node

cd mobile && npx expo start   # then scan the QR with Expo Go
```

The phone must be on the same LAN as the dev machine. The API base URL is derived from the host Metro served the bundle from, so no IP is hard-coded — but this does **not** work with `expo start --tunnel`, which forwards Metro and not the API.

## Checks

```bash
cd mobile && npx tsc --noEmit    # typecheck
cd mobile && npx expo lint       # or: npx eslint <paths>
```

Do **not** run `prettier --write`. There is no prettier config, so its defaults (double quotes) conflict with the codebase's single quotes, and `--check` already fails on files nobody has touched.

Neither package has tests. `cd server && npm test` is a placeholder that exits 1.

## Database

MongoDB Atlas, no migrations and no seed script. Collections and indexes are created by Mongoose from the schemas on first write. The developer's current IP must be on the Atlas access list — a `MongooseServerSelectionError` naming `ReplicaSetNoPrimary` is almost always that, or a dropped network, not a code fault.

Local demo data comes from `mobile/src/data/seed.ts` and exists only on the device.

## Object storage

The bucket is created automatically on first upload if it does not exist. To point at a different one, change `FILEBASE_BUCKET` and restart.

Bucket names are S3 names: lowercase, 3–63 characters, digits, dots and hyphens. A capital letter fails with `InvalidBucketName`; the server warns about this at boot rather than letting it surface later as an upload that "doesn't work".

Filebase access keys are **account-wide**. If uploads fail with `NoSuchBucket` while the bucket is visible in the console, the key almost certainly belongs to a different Filebase account. Diagnose with `ListBuckets`: an HTTP 200 with an empty list means the credentials are valid but own no buckets.

## Pitfalls

| Symptom | Cause |
|---|---|
| `Unable to resolve <module>` for a package that exists on disk | Metro's module map predates the install. `npx expo start --clear` |
| A `ReferenceError` for a variable you deleted | Stale bundle. Same fix, plus reload on the device |
| White flash on launch | A component returned `null` while loading. Render a `colors.bg` view instead — the host root is white |
| Expo Go shows a white splash despite the plugin config | Expo Go reads the legacy `expo.splash` key, not the `expo-splash-screen` plugin block. Both are set; keep them in step |
| Images 403 / do not display | The Filebase bucket is private. Goal images must be served as presigned URLs, never the raw object URL |
| Balances drift or double | Something mutated a balance server-side. Only the client computes balances; the server only stores what it is told |
| `borderStyle: 'dashed'` renders solid | Android limitation when combined with `borderRadius`. Accepted in the goal upload dropzone |
| Native module added but not working | Rebuild. Expo Go covers only its bundled modules |
