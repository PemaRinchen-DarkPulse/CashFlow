const express = require('express');

const Account = require('../models/Account');
const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireString } = require('../utils/validate');

const router = express.Router();

const MAX_TITLE_LENGTH = 60;
const MAX_NOTE_LENGTH = 200;
/** A single purchase nobody is filing through a budgeting app by hand. */
const MAX_AMOUNT = 1_000_000_000;
/**
 * Enough for a couple of years of daily logging, low enough to bound one user.
 * The app asks for the whole list (it has no pages), so this is also the listing
 * ceiling.
 */
const MAX_EXPENSES = 2000;
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = MAX_EXPENSES;
/** The shape the app generates: a prefix, a timestamp and a little randomness. */
const CLIENT_ID = /^[A-Za-z0-9_-]{1,40}$/;

function makeExpenseId() {
  return `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function requireTitle(value) {
  const title = requireString(value, 'title', 'Enter a title');
  if (title.length > MAX_TITLE_LENGTH) {
    throw ApiError.badRequest('invalid_title', 'That title is too long');
  }
  return title;
}

function requireCategoryId(value) {
  const categoryId = requireString(value, 'category', 'Pick a category');
  if (!CLIENT_ID.test(categoryId)) {
    throw ApiError.badRequest('invalid_category', 'Pick a valid category');
  }
  return categoryId;
}

/**
 * Money is stored to the cent. Zero is rejected along with negatives: an expense
 * of nothing is a mistake every time, and a negative one is income that has
 * come through the wrong door.
 */
function requireAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest('invalid_amount', 'Enter an amount greater than zero');
  }
  if (amount > MAX_AMOUNT) {
    throw ApiError.badRequest('invalid_amount', 'That amount is too large');
  }
  return Math.round(amount * 100) / 100;
}

/** Defaults to now, so the app can log a purchase without picking a date. */
function readDate(value) {
  if (value === undefined || value === null || value === '') return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('invalid_date', 'Enter a valid date');
  }
  return date;
}

function readNote(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') {
    throw ApiError.badRequest('invalid_note', 'That note is not valid');
  }
  const note = value.trim();
  if (note.length > MAX_NOTE_LENGTH) {
    throw ApiError.badRequest('invalid_note', 'That note is too long');
  }
  return note;
}

/**
 * Resolve the account this expense is filed against.
 *
 * The lookup is scoped to the signed-in user, which is what makes an account id
 * belonging to somebody else indistinguishable from one that does not exist —
 * so this both keeps the link honest and refuses to confirm that another
 * person's account is out there.
 */
async function requireOwnedAccount(userId, value) {
  const accountId = requireString(value, 'account', 'Pick an account');
  if (!CLIENT_ID.test(accountId)) {
    throw ApiError.badRequest('invalid_account', 'Pick a valid account');
  }

  const account = await Account.findOne({ userId, id: accountId });
  if (!account) {
    throw ApiError.badRequest('account_not_found', 'Pick one of your accounts');
  }
  return account;
}

function readLimit(value) {
  if (value === undefined || value === '') return DEFAULT_LIMIT;
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw ApiError.badRequest('invalid_limit', `Ask for between 1 and ${MAX_LIMIT} entries`);
  }
  return limit;
}

/**
 * GET /api/expenses — this user's spending, newest first.
 *
 * The filter is `userId` on every query in this file without exception, and it
 * comes from the verified session rather than from anything the caller sent, so
 * there is no request that returns another person's spending.
 *
 * Optional query params: `accountId` narrows to one account, `from`/`to` bound
 * the date range, `limit` pages.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = { userId: req.user._id };

    if (req.query.accountId !== undefined) {
      const account = await requireOwnedAccount(req.user._id, req.query.accountId);
      filter.accountId = account.id;
    }

    if (req.query.from !== undefined || req.query.to !== undefined) {
      filter.date = {};
      if (req.query.from !== undefined) filter.date.$gte = readDate(req.query.from);
      if (req.query.to !== undefined) filter.date.$lte = readDate(req.query.to);
    }

    const limit = readLimit(req.query.limit);
    const expenses = await Expense.find(filter).sort({ date: -1 }).limit(limit);

    // The running total is summed over the same filter rather than over the
    // page, so a capped listing still reports the truth.
    const [totals] = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      expenses: expenses.map((expense) => expense.toPublic()),
      total: Math.round((totals?.total || 0) * 100) / 100,
      count: totals?.count || 0,
    });
  })
);

/** GET /api/expenses/:id — one entry, if it is this user's. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ userId: req.user._id, id: req.params.id });
    if (!expense) throw ApiError.notFound('expense_not_found', 'That expense no longer exists');
    res.json({ expense: expense.toPublic() });
  })
);

/**
 * POST /api/expenses — log money going out.
 *
 * The app sends the `id` it is already using locally, and re-sending a stored
 * one returns what is stored rather than erroring — so a retry after a dropped
 * connection cannot book the same purchase twice.
 *
 * The account balance is deliberately left alone here. The app keeps balances
 * itself and pushes them with PATCH /api/accounts/:id; moving the balance in
 * this route as well would count every purchase twice.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { id, title, accountId, categoryId, amount, date, note } = req.body || {};

    const expenseTitle = requireTitle(title);
    const account = await requireOwnedAccount(req.user._id, accountId);

    if (id !== undefined && id !== null) {
      if (typeof id !== 'string' || !CLIENT_ID.test(id)) {
        throw ApiError.badRequest('invalid_id', 'That expense id is not valid');
      }
      const existing = await Expense.findOne({ userId: req.user._id, id });
      if (existing) return res.json({ expense: existing.toPublic() });
    }

    const count = await Expense.countDocuments({ userId: req.user._id });
    if (count >= MAX_EXPENSES) {
      throw ApiError.conflict('too_many_expenses', 'You have reached the expense limit');
    }

    const expense = await Expense.create({
      userId: req.user._id,
      id: id || makeExpenseId(),
      title: expenseTitle,
      accountId: account.id,
      categoryId: requireCategoryId(categoryId),
      amount: requireAmount(amount),
      date: readDate(date),
      note: readNote(note, ''),
    });

    res.status(201).json({ expense: expense.toPublic() });
  })
);

/**
 * PATCH /api/expenses/:id — correct an entry. Every field is optional.
 *
 * Moving an entry to another account re-runs the ownership check, so spending
 * cannot be reassigned out of the user's own accounts.
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ userId: req.user._id, id: req.params.id });
    if (!expense) throw ApiError.notFound('expense_not_found', 'That expense no longer exists');

    const { title, accountId, categoryId, amount, date, note } = req.body || {};

    if (title !== undefined) expense.title = requireTitle(title);
    if (accountId !== undefined) {
      const account = await requireOwnedAccount(req.user._id, accountId);
      expense.accountId = account.id;
    }
    if (categoryId !== undefined) expense.categoryId = requireCategoryId(categoryId);
    if (amount !== undefined) expense.amount = requireAmount(amount);
    if (date !== undefined) expense.date = readDate(date);
    if (note !== undefined) expense.note = readNote(note, expense.note);

    await expense.save();
    res.json({ expense: expense.toPublic() });
  })
);

/** DELETE /api/expenses/:id — remove an entry. */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ userId: req.user._id, id: req.params.id });
    if (!expense) throw ApiError.notFound('expense_not_found', 'That expense no longer exists');
    res.status(204).end();
  })
);

module.exports = router;
