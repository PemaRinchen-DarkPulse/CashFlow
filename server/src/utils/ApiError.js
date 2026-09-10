/**
 * An error the client is meant to see. `code` is the stable machine-readable
 * string the app switches on; `message` is the short line it can show.
 */
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  static badRequest(code, message) {
    return new ApiError(400, code, message);
  }

  static unauthorized(code, message) {
    return new ApiError(401, code, message);
  }

  static notFound(code, message) {
    return new ApiError(404, code, message);
  }

  static conflict(code, message) {
    return new ApiError(409, code, message);
  }

  /** A service this server depends on failed, rather than the request being bad. */
  static badGateway(code, message) {
    return new ApiError(502, code, message);
  }
}

module.exports = ApiError;
