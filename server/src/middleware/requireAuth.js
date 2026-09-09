const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { verifySession } = require('../utils/tokens');

/**
 * The gate every non-auth route sits behind. A valid signature is not enough on
 * its own: the account is loaded on each request, so a token for a user who has
 * since been deleted stops working immediately rather than at expiry.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('no_session', 'Sign in to continue');
    }

    const payload = verifySession(token);
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('no_session', 'Sign in to continue');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
