const ApiError = require('./ApiError');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MIN_PASSWORD_LENGTH = 8;

function requireString(value, field, message) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw ApiError.badRequest(`invalid_${field}`, message);
  }
  return value.trim();
}

function requireName(value) {
  const name = requireString(value, 'name', 'Enter your name');
  if (name.length > 80) throw ApiError.badRequest('invalid_name', 'That name is too long');
  return name;
}

function requireEmail(value) {
  const email = requireString(value, 'email', 'Enter a valid email').toLowerCase();
  if (!EMAIL.test(email)) throw ApiError.badRequest('invalid_email', 'Enter a valid email');
  return email;
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(
      'invalid_password',
      `Use at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }
  // Not trimmed: leading and trailing spaces are legitimate password characters.
  return value;
}

function requireCode(value, length) {
  const code = requireString(value, 'code', 'Enter the code');
  if (!new RegExp(`^\\d{${length}}$`).test(code)) {
    throw ApiError.badRequest('invalid_code', 'Enter the code');
  }
  return code;
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  requireName,
  requireEmail,
  requirePassword,
  requireCode,
  requireString,
};
