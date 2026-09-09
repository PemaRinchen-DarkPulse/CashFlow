const jwt = require('jsonwebtoken');

const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const SESSION = 'session';
const OTP = 'otp';

/**
 * The bearer token the app holds after signing in. One day, per the product
 * rule — `expiresAt` comes back alongside it so the client can drop its local
 * session at the same moment the server stops honouring the token, instead of
 * discovering the expiry through a failed request.
 */
function signSession(user) {
  const expiresAt = new Date(Date.now() + config.jwt.sessionTtlSeconds * 1000);
  const token = jwt.sign({ sub: user.id, kind: SESSION }, config.jwt.secret, {
    expiresIn: config.jwt.sessionTtlSeconds,
    issuer: config.jwt.issuer,
  });
  return { token, expiresAt };
}

/**
 * Proof that this email passed the code check, handed over so the password can
 * be set in a separate request. Short-lived and single-purpose: it can do
 * nothing except finish this one sign-up. The name rides along because the
 * challenge row is deleted the moment it is consumed, and the token is signed,
 * so the client cannot swap it for someone else's.
 */
function signOtpToken(email, name) {
  return jwt.sign({ email, name, kind: OTP }, config.jwt.secret, {
    expiresIn: config.jwt.otpTokenTtlSeconds,
    issuer: config.jwt.issuer,
  });
}

function verify(token, kind, invalid) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
  } catch {
    throw invalid;
  }
  // A session token must never be accepted where a sign-up pass is expected,
  // or the other way round.
  if (payload.kind !== kind) throw invalid;
  return payload;
}

function verifySession(token) {
  return verify(token, SESSION, ApiError.unauthorized('invalid_session', 'Session expired'));
}

function verifyOtpToken(token) {
  return verify(token, OTP, ApiError.badRequest('invalid_otp_token', 'Verify your email again'));
}

module.exports = { signSession, signOtpToken, verifySession, verifyOtpToken };
