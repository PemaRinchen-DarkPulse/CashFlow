require('dotenv').config();

/**
 * Every setting the server reads, resolved and checked once at boot. A missing
 * secret should stop the process here rather than surface as a confusing 500
 * on the first request that happens to need it.
 */
/**
 * Mongo can be given either as one connection string or as the four Atlas
 * parts, because .env and .env-example each grew a different style. A whole
 * MONGO_URI wins when both are present.
 */
function resolveMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER } = process.env;
  const db = process.env.MONGO_DB_NAME || 'cashflow';
  if (MONGO_USER && MONGO_PASSWORD && MONGO_CLUSTER) {
    const user = encodeURIComponent(MONGO_USER);
    const password = encodeURIComponent(MONGO_PASSWORD);
    return `mongodb+srv://${user}:${password}@${MONGO_CLUSTER}/${db}?retryWrites=true&w=majority`;
  }
  return null;
}

const mongoUri = resolveMongoUri();

const missing = ['JWT_SECRET', 'BREVO_API_KEY', 'EMAIL_FROM'].filter((key) => !process.env[key]);
if (!mongoUri) missing.push('MONGO_URI (or MONGO_USER/MONGO_PASSWORD/MONGO_CLUSTER)');

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill it in.');
  process.exit(1);
}

/**
 * Brevo issues two kinds of credential and only one works here. An SMTP key
 * ("xsmtpsib-") is a password for the smtp-relay host; the mailer speaks to the
 * REST API instead, which does not know that key exists and answers 401 "Key
 * not found". Left to itself that surfaces as a failed signup much later, with
 * an error naming nothing that would lead you back to the key.
 */
if (!process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
  console.error('BREVO_API_KEY is not a Brevo v3 API key: it must start with "xkeysib-".');
  console.error('Take it from Brevo > SMTP & API > the "API keys" tab. The "SMTP" tab');
  console.error('on that same page issues SMTP keys ("xsmtpsib-"), which this API rejects.');
  process.exit(1);
}

const ONE_DAY_SECONDS = 24 * 60 * 60;

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri,

  jwt: {
    secret: process.env.JWT_SECRET,
    /** Sessions last a day, as does the cookie-free bearer token that carries them. */
    sessionTtlSeconds: ONE_DAY_SECONDS,
    /** The pass issued between "code verified" and "password set". */
    otpTokenTtlSeconds: 15 * 60,
    issuer: 'cashflow-api',
  },

  otp: {
    length: 6,
    ttlSeconds: 10 * 60,
    /** Wrong guesses allowed before the code is burned. */
    maxAttempts: 5,
    resendCooldownSeconds: 30,
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    fromEmail: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME || 'CashFlow',
  },
};
