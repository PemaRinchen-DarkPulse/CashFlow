const bcrypt = require('bcryptjs');
const express = require('express');
const rateLimit = require('express-rate-limit');

const config = require('../config/env');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const otpService = require('../services/otpService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signOtpToken, signSession, verifyOtpToken } = require('../utils/tokens');
const { requireCode, requireEmail, requireName, requirePassword } = require('../utils/validate');
const presentUser = require('../utils/presentUser');

const PASSWORD_ROUNDS = 12;

const router = express.Router();

function limiter(windowMinutes, max, message) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: 'rate_limited', message }),
  });
}

// Anything that sends an email or checks a secret is metered separately from
// ordinary reads, since those are the endpoints worth hammering.
const sendLimiter = limiter(15, 5, 'Too many requests — try again later');
const guessLimiter = limiter(15, 10, 'Too many attempts — try again later');

/**
 * Step 1 — take the name and email, email a code.
 *
 * Responds the same way whether or not the address is already registered would
 * be the stricter choice; this returns 409 instead, because the app needs to
 * send the user to sign-in rather than leave them waiting for a code that will
 * never come.
 */
router.post(
  '/register/start',
  sendLimiter,
  asyncHandler(async (req, res) => {
    const name = requireName(req.body?.name);
    const email = requireEmail(req.body?.email);

    if (await User.exists({ email })) {
      throw ApiError.conflict('email_taken', 'That email already has an account');
    }

    const { expiresInSec } = await otpService.issue({ email, name });
    res.status(201).json({ expiresInSec });
  })
);

/** Step 2 — check the code, hand back a short-lived pass. */
router.post(
  '/register/verify',
  guessLimiter,
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const code = requireCode(req.body?.code, config.otp.length);

    const { name } = await otpService.verify({ email, code });
    res.json({ otpToken: signOtpToken(email, name) });
  })
);

/** Step 3 — set the password, create the account, open a session. */
router.post(
  '/register/complete',
  guessLimiter,
  asyncHandler(async (req, res) => {
    const { otpToken } = req.body ?? {};
    if (typeof otpToken !== 'string') {
      throw ApiError.badRequest('invalid_otp_token', 'Verify your email again');
    }
    const password = requirePassword(req.body?.password);
    const payload = verifyOtpToken(otpToken);

    if (await User.exists({ email: payload.email })) {
      throw ApiError.conflict('email_taken', 'That email already has an account');
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash: await bcrypt.hash(password, PASSWORD_ROUNDS),
      emailVerifiedAt: new Date(),
    });

    const { token, expiresAt } = signSession(user);
    res.status(201).json({ user: await presentUser(user), token, expiresAt });
  })
);

/**
 * A wrong email and a wrong password give the same answer, so the response
 * cannot be used to find out which addresses have accounts.
 */
router.post(
  '/login',
  guessLimiter,
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const password = requirePassword(req.body?.password);
    const wrong = ApiError.unauthorized('bad_credentials', 'Wrong email or password');

    const user = await User.findOne({ email });
    if (!user) {
      // Burn comparable time on a miss so the reply does not reveal, by how
      // quickly it arrives, whether the address exists.
      await bcrypt.compare(password, `$2a$${PASSWORD_ROUNDS}$${'.'.repeat(53)}`);
      throw wrong;
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) throw wrong;

    const { token, expiresAt } = signSession(user);
    res.json({ user: await presentUser(user), token, expiresAt });
  })
);

/**
 * Who the bearer token belongs to. The app calls this on launch: a 200 means
 * the day-long session is still good and it can go straight to the dashboard,
 * a 401 means show the sign-in screen.
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await presentUser(req.user) });
  })
);

/**
 * PATCH /api/auth/me — rename the account.
 *
 * The name only, deliberately. The email is the identity a code was sent to and
 * the one used to sign in, so changing it is a verification flow of its own
 * rather than an edit; the password has its own path for the same reason.
 *
 * This is what makes the name on the profile card belong to the account instead
 * of to one phone: it is read back from here on every launch, so a name typed
 * on one device is the name the next device shows.
 */
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    req.user.name = requireName(req.body?.name);
    await req.user.save();
    res.json({ user: await presentUser(req.user) });
  })
);

/**
 * Sessions are stateless, so this only confirms the token was valid. Ending the
 * session is the client discarding it — a revocation list is the change to make
 * if that ever needs to be enforced server-side.
 */
router.post('/logout', requireAuth, (req, res) => res.status(204).end());

module.exports = router;
