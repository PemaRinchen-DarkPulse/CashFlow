const express = require('express');

const Account = require('../models/Account');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireString } = require('../utils/validate');

const router = express.Router();

/** Enough for anyone tracking real accounts, low enough to bound a single user. */
const MAX_ACCOUNTS = 20;
const MAX_NAME_LENGTH = 40;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
/** The shape the app generates: a prefix, a timestamp and a little randomness. */
const CLIENT_ID = /^[A-Za-z0-9_-]{1,40}$/;

function makeAccountId() {
  return `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function requireAccountName(value) {
  const name = requireString(value, 'name', 'Enter an account name');
  if (name.length > MAX_NAME_LENGTH) {
    throw ApiError.badRequest('invalid_name', 'That account name is too long');
  }
  return name;
}

/** Money is stored to the cent; anything that is not a number is a bad request. */
function readBalance(value) {
  if (value === undefined || value === null || value === '') return 0;
  const balance = Number(value);
  if (!Number.isFinite(balance)) {
    throw ApiError.badRequest('invalid_balance', 'Enter a valid balance');
  }
  return Math.round(balance * 100) / 100;
}

function readColor(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) {
    throw ApiError.badRequest('invalid_color', 'Pick a valid colour');
  }
  return value;
}

function readIcon(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string' || value.length === 0 || value.length > 40) {
    throw ApiError.badRequest('invalid_icon', 'Pick a valid icon');
  }
  return value;
}

/** GET /api/accounts — every account this user holds, oldest first. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({ accounts: accounts.map((account) => account.toPublic()) });
  })
);

/**
 * POST /api/accounts — add an account.
 *
 * The app may send the `id` it is already using locally, which is what lets a
 * phone that has been keeping accounts on device hand them to the server
 * without breaking the transactions that point at them. Sending an id that is
 * already stored returns the stored account rather than an error, so that
 * hand-off can be retried safely after a dropped connection.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, balance, color, icon, id } = req.body || {};
    const accountName = requireAccountName(name);

    if (id !== undefined && id !== null) {
      if (typeof id !== 'string' || !CLIENT_ID.test(id)) {
        throw ApiError.badRequest('invalid_id', 'That account id is not valid');
      }
      const existing = await Account.findOne({ userId: req.user._id, id });
      if (existing) return res.json({ account: existing.toPublic() });
    }

    const count = await Account.countDocuments({ userId: req.user._id });
    if (count >= MAX_ACCOUNTS) {
      throw ApiError.conflict('too_many_accounts', `You can keep up to ${MAX_ACCOUNTS} accounts`);
    }

    const account = await Account.create({
      userId: req.user._id,
      id: id || makeAccountId(),
      name: accountName,
      balance: readBalance(balance),
      color: readColor(color, '#4DA3FF'),
      icon: readIcon(icon, 'wallet'),
    });

    res.status(201).json({ account: account.toPublic() });
  })
);

/**
 * PATCH /api/accounts/:id — change an account.
 *
 * Every field is optional, so this doubles as the write the app makes when a
 * transaction moves a balance: the stored balance is what the next device to
 * sign in will read, so it cannot be left behind.
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await Account.findOne({ userId: req.user._id, id: req.params.id });
    if (!account) throw ApiError.notFound('account_not_found', 'That account no longer exists');

    const { name, balance, color, icon } = req.body || {};
    if (name !== undefined) account.name = requireAccountName(name);
    if (balance !== undefined) account.balance = readBalance(balance);
    if (color !== undefined) account.color = readColor(color, account.color);
    if (icon !== undefined) account.icon = readIcon(icon, account.icon);

    await account.save();
    res.json({ account: account.toPublic() });
  })
);

/**
 * DELETE /api/accounts/:id — remove an account.
 *
 * The last one is kept: every transaction is booked against an account, so a
 * user with none has nowhere to record the next one. Adding a replacement
 * first turns this back into an ordinary delete.
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    // Checked before the count, so an account that is already gone says so
    // rather than reporting the rule about keeping the last one.
    const account = await Account.findOne({ userId: req.user._id, id: req.params.id });
    if (!account) throw ApiError.notFound('account_not_found', 'That account no longer exists');

    const count = await Account.countDocuments({ userId: req.user._id });
    if (count <= 1) {
      throw ApiError.conflict(
        'last_account',
        'Keep at least one account — add another before removing this one'
      );
    }

    await account.deleteOne();
    res.status(204).end();
  })
);

module.exports = router;
