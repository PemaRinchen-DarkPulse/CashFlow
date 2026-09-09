/**
 * Forwards a rejected promise to the error middleware. Express 5 does this for
 * async handlers on its own, but wrapping keeps the intent explicit and the
 * routes free of try/catch.
 */
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
