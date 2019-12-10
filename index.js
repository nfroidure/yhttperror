'use strict';

const os = require('os');
const YError = require('yerror');

class YHTTPError extends YError {
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

// Wrap a classic error
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
  return httpError;
};

YHTTPError.cast = function httpErrorCast(err, ...params) {
  if (_looksLikeAYHTTPError(err)) {
    return err;
  }
  return YHTTPError.wrap(err, ...params);
};

YHTTPError.bump = function httpErrorBump(err, ...params) {
  if (_looksLikeAYHTTPError(err)) {
    return YHTTPError.wrap(err, err.httpCode, ...params.slice(1));
  }
  return YHTTPError.wrap(err, ...params);
};

// In order to keep compatibility through major versions
// we have to make kind of an cross major version instanceof
function _looksLikeAYHTTPError(err) {
  return err instanceof YHTTPError || (
     err.constructor &&
     err.constructor.name &&
     err.constructor.name.endsWith('Error') &&
    'string' === typeof err.code && _looksLikeAYHTTPErrorCode(err.code) &&
    'number' === typeof err.httpCode &&
    err.params && err.params instanceof Array
  );
}

function _looksLikeAYHTTPErrorCode(str) {
  return (/^([A-Z0-9_]+)$/).test(str);
}

module.exports = YHTTPError;
