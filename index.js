'use strict';

var util = require('util');
var os = require('os');
var YError = require('yerror');

class YHTTPError extends YError {
  constructor(httpCode = 500, ...params) {
    super(...params);

    this.httpCode = httpCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    return (
        this.wrappedErrors.length ?
          this.wrappedErrors[this.wrappedErrors.length - 1].stack + os.EOL :
          ''
      ) +
      this.constructor.name + '[' + this.httpCode + ']: ' + this.code +
      ' (' + this.params.join(', ') + ')';
  }
}

// Wrap a classic error
YHTTPError.wrap = function httpErrorWrap(err, httpCode, errorCode/* , params */) {
  var httpError = null;
  var wrappedErrorIsACode = (/^([A-Z_]+)$/).test(err.message);

  if(!errorCode) {
    if(wrappedErrorIsACode) {
      errorCode = err.message;
    } else {
      errorCode = err.code || 'E_UNEXPECTED';
    }
  }
  httpError = new YHTTPError(httpCode, errorCode);
  httpError.wrappedErrors = (err.wrappedErrors || []).concat(err);
  httpError.params = (err.params || []).concat(([]).slice.call(arguments, 3));
  if(err.message && !wrappedErrorIsACode) {
    httpError.params.push(err.message);
  }
  httpError.name = httpError.toString();
  return httpError;
};

YHTTPError.cast = function httpErrorCast(err) {
  if(err instanceof YHTTPError) {
    return err;
  }
  return YHTTPError.wrap.apply(YHTTPError, arguments);
};

YHTTPError.bump = function httpErrorBump(err/* , httpCode*/) {
  if(err instanceof YHTTPError) {
    return YHTTPError.wrap.apply(YHTTPError,
        [err, err.httpCode].concat([].slice.call(arguments, 2)));
  }
  return YHTTPError.wrap.apply(YHTTPError, arguments);
};

module.exports = YHTTPError;
