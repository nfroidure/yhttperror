'use strict';

const os = require('os');
const YError = require('yerror');

class YHTTPError extends YError {
  constructor(httpCode = 500, ...params) {
    super(...params);

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

    Error.captureStackTrace(this, YHTTPError);
  }
  toString() {
    return this.name;
  }
}

// Wrap a classic error
YHTTPError.wrap = function httpErrorWrap(err, httpCode, errorCode, ...params) {
  const wrappedErrorIsACode = /^([A-Z0-9_]+)$/.test(err.message);
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
  return httpError;
};

YHTTPError.cast = function httpErrorCast(err, ...params) {
  if (err instanceof YHTTPError) {
    return err;
  }
  return YHTTPError.wrap(err, ...params);
};

YHTTPError.bump = function httpErrorBump(err, ...params) {
  if (err instanceof YHTTPError) {
    return YHTTPError.wrap(err, err.httpCode, ...params.slice(2)); // eslint-disable-line
  }
  return YHTTPError.wrap(err, ...params);
};

module.exports = YHTTPError;
