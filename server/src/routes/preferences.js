const express = require('express');

const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/** Room for `Nu.` or a three-letter code, and not much more. */
const MAX_CURRENCY_LENGTH = 8;

/** The on/off preferences, all read the same way. */
const TOGGLES = ['hideBalance', 'budgetAlerts', 'goalReminders', 'weeklyDigest'];

/** Only these keys are writable. Anything else is a client bug, not a no-op. */
const ALLOWED = new Set(['currency', ...TOGGLES]);

/**
 * A symbol shown beside amounts — `Nu.`, `$`, `INR`. Not a locale, and not a
 * free-form label: whitespace inside would wrap a figure, and control
 * characters would be a stored value nobody can see.
 */
function readCurrency(value) {
  if (typeof value !== 'string') {
    throw ApiError.badRequest('invalid_currency', 'Pick a valid currency');
  }
  const currency = value.trim();
  if (
    currency.length === 0 ||
    currency.length > MAX_CURRENCY_LENGTH ||
    /\s/.test(currency)
  ) {
    throw ApiError.badRequest('invalid_currency', 'Pick a valid currency');
  }
  return currency;
}

/**
 * Strict about the type rather than coercing it. A toggle that arrives as the
 * string `"false"` is a bug in whatever sent it, and `Boolean("false")` is
 * `true` — so coercion would store the opposite of what was asked for and give
 * nobody a reason to look.
 */
function readToggle(value, field) {
  if (typeof value !== 'boolean') {
    throw ApiError.badRequest('invalid_setting', `${field} must be on or off`);
  }
  return value;
}

/**
 * GET /api/preferences — how this user has the app set up.
 *
 * Answers with a complete set every time. A user who has never changed anything
 * gets the defaults rather than a 404, because "never configured" and
 * "configured to the defaults" are the same thing to the app reading it.
 *
 * No database call of its own: `requireAuth` has already loaded the user these
 * are stored on, which is the whole reason they live there.
 */
router.get('/', (req, res) => {
  res.json({ preferences: req.user.toPublicPreferences() });
});

/**
 * PATCH /api/preferences — change some of them.
 *
 * A singleton, so this is the only write there is: nothing to POST, because an
 * account always has preferences from the moment it exists, and nothing to
 * DELETE, because putting everything back means sending the defaults.
 *
 * Every field is optional, which lets the app send the one toggle a user just
 * flipped instead of holding the rest and resending them — two phones changing
 * different settings then cannot overwrite each other.
 */
router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw ApiError.badRequest('invalid_body', 'Send the settings to change');
    }

    const keys = Object.keys(body);
    if (keys.length === 0) {
      throw ApiError.badRequest('empty_patch', 'Send at least one setting to change');
    }
    for (const key of keys) {
      if (!ALLOWED.has(key)) {
        throw ApiError.badRequest('unknown_setting', 'That setting is not recognised');
      }
    }

    const { user } = req;

    // An account from before preferences existed has nothing to assign into.
    // Mongoose fills the subdocument from the schema defaults on first touch.
    if (!user.preferences) user.preferences = {};

    if (body.currency !== undefined) {
      user.preferences.currency = readCurrency(body.currency);
    }
    for (const key of TOGGLES) {
      if (body[key] !== undefined) {
        user.preferences[key] = readToggle(body[key], key);
      }
    }

    // Nested assignments on a freshly created subdocument are not always
    // marked dirty; without this a first write can save as the empty default.
    user.markModified('preferences');
    await user.save();
    res.json({ preferences: user.toPublicPreferences() });
  })
);

module.exports = router;
