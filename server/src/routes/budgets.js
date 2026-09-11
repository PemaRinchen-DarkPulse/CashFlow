const express = require('express');

const Budget = require('../models/Budget');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireString } = require('../utils/validate');

const router = express.Router();

/**
 * Kept in this file rather than imported from the app: the two packages do not
 * share code, and a budget on an income category would put a spending cap on
 * money coming in. The list must stay in step with
 * `mobile/src/data/categories.ts` EXPENSE_CATEGORIES.
 */
const EXPENSE_CATEGORY_IDS = new Set([
  'food',
  'groceries',
  'shopping',
  'transport',
  'bills',
  'fun',
  'health',
  'learning',
  'travel',
  'subs',
  'other',
]);

/** One per expense category is the real rule; this bounds a flooding client. */
const MAX_BUDGETS = EXPENSE_CATEGORY_IDS.size;
/** A monthly cap nobody is typing into a budgeting app by hand. */
const MAX_AMOUNT = 1_000_000_000;
/** The shape the app generates: a prefix, a timestamp and a little randomness. */
const CLIENT_ID = /^[A-Za-z0-9_-]{1,40}$/;

function makeBudgetId() {
  return `bud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function isDuplicateKey(error, field) {
  return error?.code === 11000 && Object.keys(error.keyPattern || {}).includes(field);
}

function requireCategoryId(value) {
  const categoryId = requireString(value, 'category', 'Pick a category');
  if (!EXPENSE_CATEGORY_IDS.has(categoryId)) {
    throw ApiError.badRequest('invalid_category', 'Pick a spending category');
  }
  return categoryId;
}

/**
 * Money is stored to the cent. Zero is rejected along with negatives: a budget
 * of nothing is a mistake every time, and a negative one is not a cap.
 */
function requireLimit(value) {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) {
    throw ApiError.badRequest('invalid_limit', 'Enter an amount greater than zero');
  }
  if (limit > MAX_AMOUNT) {
    throw ApiError.badRequest('invalid_limit', 'That amount is too large');
  }
  return Math.round(limit * 100) / 100;
}

/**
 * GET /api/budgets — this user's monthly caps.
 *
 * The whole list comes back rather than a page of it: it is capped at one row
 * per expense category, and the app derives "spent vs limit" from it against
 * the ledger, so a partial listing would hide a category that is already over.
 *
 * The filter is `userId` on every query in this file without exception, and it
 * comes from the verified session rather than from anything the caller sent.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({ budgets: budgets.map((budget) => budget.toPublic()) });
  })
);

/** GET /api/budgets/:id — one budget, if it is this user's. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findOne({ userId: req.user._id, id: req.params.id });
    if (!budget) throw ApiError.notFound('budget_not_found', 'That budget no longer exists');
    res.json({ budget: budget.toPublic() });
  })
);

/**
 * POST /api/budgets — set a monthly cap on one spending category.
 *
 * As with accounts, goals and debts, the app may send the `id` it is already
 * using locally, and re-sending a stored one returns what is stored rather than
 * erroring — so a retry after a dropped connection cannot create a second cap
 * on the same category.
 *
 * Spent is deliberately not accepted and not stored. The app computes it from
 * expenses; writing it here as well would be a second ledger that the two
 * could disagree on.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { id, categoryId, limit } = req.body || {};

    const budgetCategoryId = requireCategoryId(categoryId);
    const budgetLimit = requireLimit(limit);

    if (id !== undefined && id !== null && id !== '') {
      if (typeof id !== 'string' || !CLIENT_ID.test(id)) {
        throw ApiError.badRequest('invalid_id', 'That budget id is not valid');
      }
      const existing = await Budget.findOne({ userId: req.user._id, id });
      if (existing) return res.json({ budget: existing.toPublic() });
    }

    const taken = await Budget.findOne({ userId: req.user._id, categoryId: budgetCategoryId });
    if (taken) {
      throw ApiError.conflict('budget_exists', 'That category already has a budget');
    }

    const count = await Budget.countDocuments({ userId: req.user._id });
    if (count >= MAX_BUDGETS) {
      throw ApiError.conflict('too_many_budgets', 'Every spending category already has a budget');
    }

    try {
      const budget = await Budget.create({
        userId: req.user._id,
        id: id || makeBudgetId(),
        categoryId: budgetCategoryId,
        limit: budgetLimit,
      });
      res.status(201).json({ budget: budget.toPublic() });
    } catch (error) {
      // A racing POST can beat the lookups above. Same id is a retry of this
      // write — return what landed. Same category is a second cap, which the
      // unique index exists to refuse.
      if (isDuplicateKey(error, 'id')) {
        const existing = await Budget.findOne({ userId: req.user._id, id: id || '' });
        if (existing) return res.json({ budget: existing.toPublic() });
      }
      if (isDuplicateKey(error, 'categoryId')) {
        throw ApiError.conflict('budget_exists', 'That category already has a budget');
      }
      throw error;
    }
  })
);

/**
 * PATCH /api/budgets/:id — raise or lower the cap, or move it to another
 * category. Every field is optional.
 *
 * Moving the cap onto a category that already has one is refused rather than
 * merged: silently replacing the other row would delete a limit the user did
 * not ask to remove.
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findOne({ userId: req.user._id, id: req.params.id });
    if (!budget) throw ApiError.notFound('budget_not_found', 'That budget no longer exists');

    const { categoryId, limit } = req.body || {};

    if (categoryId !== undefined) budget.categoryId = requireCategoryId(categoryId);
    if (limit !== undefined) budget.limit = requireLimit(limit);

    try {
      await budget.save();
    } catch (error) {
      if (isDuplicateKey(error, 'categoryId')) {
        throw ApiError.conflict('budget_exists', 'That category already has a budget');
      }
      throw error;
    }

    res.json({ budget: budget.toPublic() });
  })
);

/** DELETE /api/budgets/:id — stop tracking a monthly cap. Spending is left alone. */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const budget = await Budget.findOneAndDelete({ userId: req.user._id, id: req.params.id });
    if (!budget) throw ApiError.notFound('budget_not_found', 'That budget no longer exists');
    res.status(204).end();
  })
);

module.exports = router;
