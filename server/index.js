const cors = require('cors');
const express = require('express');

const config = require('./src/config/env');
const { connect } = require('./src/db/connect');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const requireAuth = require('./src/middleware/requireAuth');
const accountRoutes = require('./src/routes/accounts');
const authRoutes = require('./src/routes/auth');
const budgetRoutes = require('./src/routes/budgets');
const debtRoutes = require('./src/routes/debts');
const expenseRoutes = require('./src/routes/expenses');
const goalRoutes = require('./src/routes/goals');
const incomeRoutes = require('./src/routes/incomes');
const preferenceRoutes = require('./src/routes/preferences');
const profileRoutes = require('./src/routes/profile');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));
// Rate limiting keys on the caller's address, which behind a proxy arrives in
// X-Forwarded-For rather than on the socket.
app.set('trust proxy', 1);

/**
 * Atlas is opened here, not at boot. Vercel freezes the isolate between
 * invocations, so a listen-time connect would either never run or take the
 * function down with process.exit when Atlas refuses the IP.
 */
app.use(async (req, res, next) => {
  if (!config.ready) {
    return res.status(503).json({
      error: 'server_unconfigured',
      message: 'The server is missing environment variables',
    });
  }
  try {
    await connect();
    next();
  } catch (error) {
    next(error);
  }
});

/** Unauthenticated on purpose: a health probe has no session. */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CashFlow API' });
});

// The only routes reachable without a session — signing up and signing in.
app.use('/api/auth', authRoutes);

/**
 * Everything else is gated. Mounting the guard on the prefix rather than on
 * each route means a new endpoint is private by default: a router added under
 * /api later is protected the moment it is mounted, with no middleware to
 * forget.
 */
app.use('/api', requireAuth);

app.use('/api/accounts', accountRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/me', profileRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

// Vercel sets VERCEL=1 and must not listen — it invokes `app` as the handler.
if (require.main === module && !process.env.VERCEL) start();

// The default export is the Express app so Vercel can call it as (req, res).
// `.app` / `.start` stay on the same function object for local requires.
module.exports = app;
module.exports.app = app;
module.exports.start = start;
