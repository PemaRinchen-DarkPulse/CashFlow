/**
 * Vercel entry. Every URL is rewritten here; Express then routes it.
 *
 * The handler must be the app itself — exporting `{ app, start }` makes
 * Vercel try to invoke a plain object, which is FUNCTION_INVOCATION_FAILED.
 */
const app = require('../index');

module.exports = app;
