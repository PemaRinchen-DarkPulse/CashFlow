const ApiError = require('../utils/ApiError');

function notFound(req, res) {
  res.status(404).json({ error: 'not_found', message: 'No such endpoint' });
}

/* eslint-disable no-unused-vars */
/** Express identifies the error handler by its four arguments — `next` stays. */
function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.code, message: error.message });
  }

  // A racing signup can beat the unique index rather than the lookup.
  if (error?.code === 11000) {
    return res
      .status(409)
      .json({ error: 'email_taken', message: 'That email already has an account' });
  }

  if (error?.name === 'ValidationError') {
    return res.status(400).json({ error: 'invalid_input', message: 'Check the details you sent' });
  }

  // Anything unrecognised is ours: log it in full, tell the client nothing.
  console.error('Unhandled error:', error);
  return res.status(500).json({ error: 'server_error', message: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
