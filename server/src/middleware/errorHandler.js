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

  /**
   * A racing write can beat a unique index rather than the lookup in front of
   * it. Which index was hit decides what to say: every collection that is
   * keyed per user has one, so reporting all of them as a taken email — which
   * this did when `users` was the only such index — would be actively wrong.
   */
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {}).join(',');
    if (field.includes('email')) {
      return res
        .status(409)
        .json({ error: 'email_taken', message: 'That email already has an account' });
    }
    return res
      .status(409)
      .json({ error: 'duplicate', message: 'That already exists' });
  }

  /**
   * Multer rejects an upload before the route sees it — a file past the size
   * cap, or more files than were asked for. Left alone these arrive as 500s,
   * which reads as a broken server rather than a picture that is too big.
   */
  if (error?.name === 'MulterError') {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Pick an image under 8 MB'
        : 'That upload could not be read';
    return res.status(400).json({ error: 'invalid_upload', message });
  }

  if (error?.name === 'ValidationError') {
    return res.status(400).json({ error: 'invalid_input', message: 'Check the details you sent' });
  }

  // Anything unrecognised is ours: log it in full, tell the client nothing.
  console.error('Unhandled error:', error);
  return res.status(500).json({ error: 'server_error', message: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
