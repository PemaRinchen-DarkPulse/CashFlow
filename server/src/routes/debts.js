const express = require('express');

const Account = require('../models/Account');
const Debt = require('../models/Debt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireString } = require('../utils/validate');

const router = express.Router();

/** Enough for anyone keeping track of friends and IOUs, low enough to bound one user. */
const MAX_DEBTS = 200;
const MAX_PERSON_LENGTH = 60;
const MAX_NOTE_LENGTH = 200;
/** A loan nobody is filing through a budgeting app by hand. */
const MAX_AMOUNT = 1_000_000_000;
/** The shape the app generates: a prefix, a timestamp and a little randomness. */
const CLIENT_ID = /^[A-Za-z0-9_-]{1,40}$/;
const DIRECTIONS = ['borrowed', 'lent'];

function makeDebtId() {
  return `debt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function requirePerson(value) {
  const person = requireString(value, 'person', 'Name who the money is with');
  if (person.length > MAX_PERSON_LENGTH) {
    throw ApiError.badRequest('invalid_person', 'That name is too long');
  }
  return person;
}

function requireDirection(value) {
  if (!DIRECTIONS.includes(value)) {
    throw ApiError.badRequest('invalid_direction', 'Say whether you borrowed or lent');
  }
  return value;
}

/**
 * Money is stored to the cent. Zero is rejected along with negatives: a debt of
 * nothing is a mistake every time, and a negative one is the other direction
 * arriving through the wrong door — which `direction` already carries.
 */
function requirePrincipal(value) {
  const principal = Number(value);
  if (!Number.isFinite(principal) || principal <= 0) {
    throw ApiError.badRequest('invalid_principal', 'Enter an amount greater than zero');
  }
  if (principal > MAX_AMOUNT) {
    throw ApiError.badRequest('invalid_principal', 'That amount is too large');
  }
  return Math.round(principal * 100) / 100;
}

function readRepaid(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const repaid = Number(value);
  if (!Number.isFinite(repaid) || repaid < 0) {
    throw ApiError.badRequest('invalid_repaid', 'Enter a valid amount repaid');
  }
  return Math.round(repaid * 100) / 100;
}

/**
 * `repaid` is capped at `principal` rather than refused above it. Settling the
 * last of a debt in full is a normal thing to do slightly too much of, and a
 * rejected write there would lose the repayment entirely.
 */
function capRepaid(repaid, principal) {
  return Math.min(repaid, principal);
}

/** Defaults to now, so the app can log a loan without picking a date. */
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
 * Resolve the account the cash moved through.
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

/**
 * GET /api/debts — this user's debts, newest first.
 *
 * The whole list comes back rather than a page of it: it is capped at
 * MAX_DEBTS, and the app sums "you owe" and "owed to you" from it, so a partial
 * listing would put a wrong figure on the screen.
 *
 * The filter is `userId` on every query in this file without exception, and it
 * comes from the verified session rather than from anything the caller sent.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const debts = await Debt.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ debts: debts.map((debt) => debt.toPublic()) });
  })
);

/** GET /api/debts/:id — one debt, if it is this user's. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const debt = await Debt.findOne({ userId: req.user._id, id: req.params.id });
    if (!debt) throw ApiError.notFound('debt_not_found', 'That record no longer exists');
    res.json({ debt: debt.toPublic() });
  })
);

/**
 * POST /api/debts — record money borrowed or lent.
 *
 * As with accounts, goals and income, the app may send the `id` it is already
 * using locally, and re-sending a stored one returns what is stored rather than
 * erroring — so a retry after a dropped connection cannot record the same loan
 * twice.
 *
 * The account balance is deliberately left alone here. The app keeps balances
 * itself and pushes them with PATCH /api/accounts/:id; moving the balance in
 * this route as well would count every loan twice.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { id, person, direction, principal, repaid, date, note, accountId } = req.body || {};

    const debtPerson = requirePerson(person);
    const debtDirection = requireDirection(direction);
    const debtPrincipal = requirePrincipal(principal);
    const account = await requireOwnedAccount(req.user._id, accountId);

    if (id !== undefined && id !== null && id !== '') {
      if (typeof id !== 'string' || !CLIENT_ID.test(id)) {
        throw ApiError.badRequest('invalid_id', 'That debt id is not valid');
      }
      const existing = await Debt.findOne({ userId: req.user._id, id });
      if (existing) return res.json({ debt: existing.toPublic() });
    }

    const count = await Debt.countDocuments({ userId: req.user._id });
    if (count >= MAX_DEBTS) {
      throw ApiError.conflict('too_many_debts', `You can keep up to ${MAX_DEBTS} debt records`);
    }

    const debt = await Debt.create({
      userId: req.user._id,
      id: id || makeDebtId(),
      person: debtPerson,
      direction: debtDirection,
      principal: debtPrincipal,
      repaid: capRepaid(readRepaid(repaid), debtPrincipal),
      date: readDate(date),
      note: readNote(note, ''),
      accountId: account.id,
    });

    res.status(201).json({ debt: debt.toPublic() });
  })
);

/**
 * PATCH /api/debts/:id — correct a record, or log a repayment against it.
 * Every field is optional.
 *
 * A repayment is `repaid` moving up rather than an endpoint of its own: the
 * client sends the new running total, so a request that arrives twice settles
 * the debt once. An increment would settle it twice.
 *
 * Moving a debt to another account re-runs the ownership check, so it cannot be
 * reassigned out of the user's own accounts.
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const debt = await Debt.findOne({ userId: req.user._id, id: req.params.id });
    if (!debt) throw ApiError.notFound('debt_not_found', 'That record no longer exists');

    const { person, direction, principal, repaid, date, note, accountId } = req.body || {};

    if (person !== undefined) debt.person = requirePerson(person);
    if (direction !== undefined) debt.direction = requireDirection(direction);
    if (principal !== undefined) debt.principal = requirePrincipal(principal);
    if (repaid !== undefined) debt.repaid = readRepaid(repaid, debt.repaid);
    if (date !== undefined) debt.date = readDate(date);
    if (note !== undefined) debt.note = readNote(note, debt.note);
    if (accountId !== undefined) {
      const account = await requireOwnedAccount(req.user._id, accountId);
      debt.accountId = account.id;
    }

    // Applied after both, so raising `repaid` and lowering `principal` in one
    // request still lands on a consistent pair.
    debt.repaid = capRepaid(debt.repaid, debt.principal);

    await debt.save();
    res.json({ debt: debt.toPublic() });
  })
);

/** DELETE /api/debts/:id — stop tracking a debt. */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const debt = await Debt.findOneAndDelete({ userId: req.user._id, id: req.params.id });
    if (!debt) throw ApiError.notFound('debt_not_found', 'That record no longer exists');
    res.status(204).end();
  })
);

module.exports = router;
