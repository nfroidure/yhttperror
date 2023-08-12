import os from 'os';
import { YError } from 'yerror';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YHTTPErrorParams = any;

/**
 * Class representing an HTTP Error with extra debug informations
 * @extends Error
 * @extends YError
 */
class YHTTPError extends YError {
  httpCode: number;
  headers: { [name: string]: string };

  /**
   * Creates a new YHTTPError with an HTTP error code, an
   *  error code and some params as debug values.
   * @param {number} httpCode
   * The HTTP error code corresponding to the actual error
   * @param {string} [errorCode = 'E_UNEXPECTED']
   * The error code corresponding to the actual error
   * @param {...any} [params]
   * Some additional debugging values
   */

  constructor(
    httpCode = 500,
    errorCode?: string,
    ...params: YHTTPErrorParams[]
  ) {
    super(errorCode || 'E_UNEXPECTED', ...params);

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

  /**
   * Wraps any error and output a YHTTPError with an HTTP
   *  error code, an error code and some params as debug values.
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

  static wrap<E extends Error | YError | YHTTPError>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: YHTTPErrorParams[]
  ): YHTTPError {
    const wrappedErrorIsACode = _looksLikeAYHTTPErrorCode(err.message);
    const mergedParams = ((err as YError).params || []).concat(params);

    if (!errorCode) {
      errorCode = wrappedErrorIsACode
        ? err.message
        : (err as YError).code || 'E_UNEXPECTED';
    }
    if (err.message && !wrappedErrorIsACode) {
      mergedParams.push(err.message);
    }

    const httpError = new YHTTPError(
      typeof httpCode === 'number' ? httpCode : 500,
      errorCode,
      ...mergedParams,
    );
    httpError.wrappedErrors = (
      'wrappedErrors' in err ? err.wrappedErrors : []
    ).concat(err);
    if (httpError.wrappedErrors.length) {
      httpError.stack =
        httpError.wrappedErrors[httpError.wrappedErrors.length - 1].stack +
        os.EOL +
        httpError.stack;
    }
    httpError.headers = 'headers' in err ? err.headers : {};
    return httpError;
  }

  /**
   * Return YHTTPError as is or wraps any other error and output
   *  a YHTTPError with an HTTP error code, an
   *  error code and some params as debug values.
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

  static cast<E extends Error | YError | YHTTPError>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: YHTTPErrorParams[]
  ): YHTTPError {
    if (_looksLikeAYHTTPError(err)) {
      return err as YHTTPError;
    }
    return YHTTPError.wrap(err, httpCode, errorCode, ...params);
  }

  /**
   * Same than `YHTTPError.wrap()` but preserves the HTTP code,
   *  the error code and the debug values of the error if it is
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
  static bump<E extends Error | YError | YHTTPError>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: YHTTPErrorParams[]
  ): YHTTPError {
    if (_looksLikeAYHTTPError(err)) {
      return YHTTPError.wrap(
        err,
        (err as YHTTPError).httpCode,
        errorCode,
        ...params,
      );
    }
    return YHTTPError.wrap(err, httpCode, errorCode, ...params);
  }

  toString(): string {
    return this.name;
  }
}

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

export { YHTTPError };
export default YHTTPError;
