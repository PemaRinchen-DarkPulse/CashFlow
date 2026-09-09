const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const config = require('../config/env');
const Otp = require('../models/Otp');
const ApiError = require('../utils/ApiError');
const { sendOtpEmail } = require('./mailer');

/** Uniform over the full range — `crypto.randomInt` has no modulo skew. */
function generateCode() {
  const max = 10 ** config.otp.length;
  return String(crypto.randomInt(0, max)).padStart(config.otp.length, '0');
}

/**
 * Mints a code, emails it, and stores only its hash. Any earlier challenge for
 * the address is replaced, so exactly one code is live at a time.
 */
async function issue({ email, name }) {
  const existing = await Otp.findOne({ email });

  if (existing) {
    const waited = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    const left = Math.ceil(config.otp.resendCooldownSeconds - waited);
    if (left > 0) {
      throw new ApiError(429, 'resend_too_soon', `Wait ${left}s before asking again`);
    }
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + config.otp.ttlSeconds * 1000);

  // Send before storing: if Brevo fails, the previous challenge is untouched
  // and the caller gets an error rather than a code that never arrives.
  await sendOtpEmail({ to: email, name, code });

  await Otp.findOneAndUpdate(
    { email },
    { email, name, codeHash, expiresAt, attempts: 0, lastSentAt: new Date() },
    { upsert: true, new: true }
  );

  return { expiresInSec: config.otp.ttlSeconds };
}

/**
 * Checks a submitted code. Consumes the challenge on success, and burns it once
 * the attempt budget is spent so a live code cannot be ground down by guessing.
 */
async function verify({ email, code }) {
  const record = await Otp.findOne({ email });
  const invalid = ApiError.badRequest('bad_code', 'That code is not right');

  // TTL sweeps are periodic rather than instant, so the date is checked here too.
  if (!record || record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ email });
    throw ApiError.badRequest('code_expired', 'Code expired — send a new one');
  }

  if (record.attempts >= config.otp.maxAttempts) {
    await Otp.deleteOne({ email });
    throw ApiError.badRequest('too_many_attempts', 'Too many tries — send a new code');
  }

  if (!(await bcrypt.compare(code, record.codeHash))) {
    record.attempts += 1;
    await record.save();
    throw invalid;
  }

  await Otp.deleteOne({ email });
  return { name: record.name };
}

module.exports = { issue, verify };
