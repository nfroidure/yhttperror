import { EOL } from 'node:os';
import { looksLikeAYErrorCode, YError, type YErrorDebugValue } from 'yerror';

export type YHTTPErrorCode = number;
export type YHTTPErrorHeaders = Record<string, string | string[]>;

/**
 * Class representing an HTTP Error with extra debug informations
 * @extends Error
 * @extends YError
 */
class YHTTPError<T extends unknown[] = YErrorDebugValue> extends YError<T> {
  httpCode: YHTTPErrorCode = 500;
  headers: YHTTPErrorHeaders = {};

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
    httpCode: YHTTPErrorCode = 500,
    errorCode?: string,
    debugValues: T = [] as unknown as T,
    headers: YHTTPErrorHeaders = {},
    wrappedErrors: (Error | YError)[] = [],
  ) {
    super(errorCode || 'E_UNEXPECTED', debugValues, wrappedErrors);

    // Since we could not ask for a number for the moment,
    // we check the httpCode is a number here ¯\_(ツ)_/¯
    if ('number' !== typeof httpCode) {
      throw new YError('E_BAD_HTTP_CODE', [typeof httpCode, httpCode]);
    }

    this.httpCode = httpCode;
    this.headers = headers;
    this.wrappedErrors = wrappedErrors;
    this.name = this.toString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, YHTTPError);
    }
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

  static wrap<T extends unknown[] = YErrorDebugValue>(
    err: Error | YError | YHTTPError,
    errorCode?: string,
    debugValues: T = [] as unknown as T,
    httpCode?: number | string,
  ): YHTTPError {
    const wrappedErrorIsACode = looksLikeAYErrorCode(err.message);
    const wrappedErrors = (
      'wrappedErrors' in err ? err.wrappedErrors : []
    ).concat(err);

    if (!errorCode) {
      errorCode = wrappedErrorIsACode
        ? err.message
        : (err as YError).code || 'E_UNEXPECTED';
    }

    const httpError = new YHTTPError(
      typeof httpCode === 'number' ? httpCode : 500,
      errorCode,
      debugValues,
      'headers' in err ? err.headers : {},
      wrappedErrors,
    );

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

  static cast<T extends unknown[] = YErrorDebugValue>(
    err: Error | YError | YHTTPError,
    errorCode?: string,
    debugValues: T = [] as unknown as T,
    httpCode?: number | string,
  ): YHTTPError {
    if (looksLikeAYHTTPError(err)) {
      return err as YHTTPError;
    }
    return YHTTPError.wrap(err, errorCode, debugValues, httpCode);
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
  static bump<T extends unknown[] = YErrorDebugValue>(
    err: Error | YError | YHTTPError,
    errorCode?: string,
    debugValues: T = [] as unknown as T,
    httpCode?: number | string,
  ): YHTTPError {
    if (looksLikeAYHTTPError(err)) {
      return YHTTPError.wrap(
        err,
        errorCode,
        debugValues,
        (err as YHTTPError).httpCode,
      );
    }
    return YHTTPError.wrap(err, errorCode, debugValues, httpCode);
  }

  toString(): string {
    let debugValuesAsString: string;
    let headersAsString;

    try {
      debugValuesAsString = JSON.stringify(this.debugValues);
    } catch {
      debugValuesAsString = '<circular>';
    }
    try {
      headersAsString = JSON.stringify(this.headers);
    } catch {
      headersAsString = '<circular>';
    }

    return `${
      this.wrappedErrors.length
        ? this.wrappedErrors[this.wrappedErrors.length - 1].stack + EOL
        : ''
    }${this.constructor.name}[${this.httpCode}]: ${this.code} (${debugValuesAsString}, ${headersAsString})`;
  }
}

// In order to keep compatibility through major versions
// we have to make kind of a cross major version instanceof
export function looksLikeAYHTTPError(
  err: Error | YError | YHTTPError,
): err is YHTTPError {
  return !!(
    err instanceof YHTTPError ||
    (err.constructor &&
      err.constructor.name &&
      err.constructor.name.endsWith('Error') &&
      'code' in err &&
      'string' === typeof err.code &&
      looksLikeAYErrorCode(err.code) &&
      'httpCode' in err &&
      'number' === typeof err.httpCode &&
      err.debugValues &&
      err.debugValues instanceof Array)
  );
}

export { YHTTPError };
