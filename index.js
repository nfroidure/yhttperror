'use strict';

var util = require('util');
var os = require('os');
var YError = require('yerror');

// Create an HTTP Error directly sendable as a server response
function YHTTPError(httpCode/* , errorCode */) {

  // Ensure new were called
  if(!this instanceof YHTTPError) {
    return new (YHTTPError.bind.apply(YHTTPError,
      [YHTTPError].concat([].slice.call(arguments, 0))));
  }

  // Capture stack trace
  Error.captureStackTrace(this, this.constructor);

  // Filling error
  this.httpCode = httpCode || 500;

  // Call the parent constructor
  YError.apply(this, [].slice.call(arguments, 1));
}

util.inherits(YHTTPError, YError);

// Wrap a classic error
YHTTPError.prototype.toString = function httpErrorToString() {
  return (
    this.wrappedErrors.length ?
    this.wrappedErrors[this.wrappedErrors.length - 1].stack + os.EOL :
    ''
  ) +
  this.constructor.name + '[' + this.httpCode + ']: ' + this.code +
  ' (' + this.params.join(', ') + ')';
};

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
