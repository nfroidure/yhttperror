'use strict';

const os = require('os');
const YError = require('yerror');

/**
 * Class representing an HTTP Error
 * @extends Error
 * @extends YError
 */
class YHTTPError extends YError {
  /**
   * Creates a new YHTTPError with an HTTP error `code`, `msg`
   *  as a message and `args` as debug values.
   * @param {number} httpCode
   * The HTTP error code corresponding to the actual error
   * @param {string} [errorCode = 'E_UNEXPECTED']
   * The error code corresponding to the actual error
   * @param {...any} [params]
   * Some additional debugging values
   */
  constructor(httpCode = 500, ...params) {
    super(...params);

    // Since we could not ask for a number for the moment,
    // we check the httpCode is a number here ¯\_(ツ)_/¯
    if ('number' !== typeof httpCode) {
      throw new YError('E_BAD_HTTP_CODE', typeof httpCode, httpCode);
    }

    this.httpCode = httpCode;
    this.name =
      YHTTPError.name +
      '[' +
      this.httpCode +
      ']: ' +
      this.code +
      ' (' +
      this.params.join(', ') +
      ')';
    this.headers = {};

    Error.captureStackTrace(this, YHTTPError);
  }
  toString() {
    return this.name;
  }
}

/**
 * Wraps any error and output a YHTTPError with an HTTP error
 *  `code`, `msg` as its message and `args` as debug values.
 * @param {Error} err
 * The error to wrap
 * @param {number} httpCode
 * The HTTP error code corresponding to the actual error
 * @param {string} [errorCode = 'E_UNEXPECTED']
 * The error code corresponding to the actual error
 * @param {...any} [params]
 * Some additional debugging values
 * @return {YHTTPError}
 * The wrapped error
 */
YHTTPError.wrap = function httpErrorWrap(err, httpCode, errorCode, ...params) {
  const wrappedErrorIsACode = _looksLikeAYHTTPErrorCode(err.message);
  const mergedParams = (err.params || []).concat(params);
  let httpError = null;

  if (!errorCode) {
    errorCode = wrappedErrorIsACode ? err.message : err.code || 'E_UNEXPECTED';
  }
  if (err.message && !wrappedErrorIsACode) {
    mergedParams.push(err.message);
  }

  httpError = new YHTTPError(httpCode, errorCode, ...mergedParams);
  httpError.wrappedErrors = (err.wrappedErrors || []).concat(err);
  if (httpError.wrappedErrors.length) {
    httpError.stack =
      httpError.wrappedErrors[httpError.wrappedErrors.length - 1].stack +
      os.EOL +
      httpError.stack;
  }
  httpError.headers = err.headers || {};
  return httpError;
};

/**
 * Return YHTTPError as is or wraps any other error and output
 *  a YHTTPError with `msg` as its message and `args` as debug values.
 * @param {Error} err
 * The error to cast
 * @param {number} httpCode
 * The HTTP error code corresponding to the actual error
 * @param {string} [errorCode = 'E_UNEXPECTED']
 * The error code corresponding to the actual error
 * @param {...any} [params]
 * Some additional debugging values
 * @return {YHTTPError}
 * The wrapped error
 */
YHTTPError.cast = function httpErrorCast(err, ...params) {
  if (_looksLikeAYHTTPError(err)) {
    return err;
  }
  return YHTTPError.wrap(err, ...params);
};

/**
 * Same than `YHTTPError.wrap()` but preserves the code,
 *  the message and the debug values of the error if it is
 *  already an instance of the YHTTPError constructor.
 * @param {Error} err
 * The error to bump
 * @param {number} httpCode
 * The HTTP error code corresponding to the actual error
 * @param {string} [errorCode = 'E_UNEXPECTED']
 * The error code corresponding to the actual error
 * @param {...any} [params]
 * Some additional debugging values
 * @return {YHTTPError}
 * The wrapped error
 */
YHTTPError.bump = function httpErrorBump(err, ...params) {
  if (_looksLikeAYHTTPError(err)) {
    return YHTTPError.wrap(err, err.httpCode, ...params.slice(1));
  }
  return YHTTPError.wrap(err, ...params);
};

// In order to keep compatibility through major versions
// we have to make kind of a cross major version instanceof
function _looksLikeAYHTTPError(err) {
  return (
    err instanceof YHTTPError ||
    (err.constructor &&
      err.constructor.name &&
      err.constructor.name.endsWith('Error') &&
      'string' === typeof err.code &&
      _looksLikeAYHTTPErrorCode(err.code) &&
      'number' === typeof err.httpCode &&
      err.params &&
      err.params instanceof Array)
  );
}

function _looksLikeAYHTTPErrorCode(str) {
  return /^([A-Z0-9_]+)$/.test(str);
}

module.exports = YHTTPError;
