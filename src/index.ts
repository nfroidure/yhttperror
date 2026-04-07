import { looksLikeAYErrorCode, YError, type YErrorDebug } from 'yerror';

export type YHTTPErrorCode = number;
export type YHTTPErrorHeaders = Record<string, string | string[]>;

/**
 * Class representing an HTTP Error with extra debug informations
 * @extends Error
 * @extends YError
 */
class YHTTPError<
  C extends string = string,
  CC extends string = string,
> extends YError<C, CC> {
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
    errorCode: C = 'E_UNEXPECTED' as C,
    debug?: YErrorDebug<C>,
    headers: YHTTPErrorHeaders = {},
    options: { cause?: Error | YError<CC> | YHTTPError<CC> } = {},
  ) {
    super(errorCode, debug, options);

    // Since we could not ask for a number for the moment,
    // we check the httpCode is a number here ¯\_(ツ)_/¯
    if ('number' !== typeof httpCode) {
      throw new YError('E_BAD_HTTP_CODE', [typeof httpCode, httpCode]);
    }

    this.httpCode = httpCode;
    this.headers = headers;
    this.cause = options?.cause;
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

  static wrap<C extends string, CC extends string>(
    err: Error | YError<CC> | YHTTPError<CC>,
    errorCode?: C,
    debug?: YErrorDebug<C>,
    httpCode?: number | string,
  ): YHTTPError<C> {
    const wrappedErrorIsACode = looksLikeAYErrorCode(err.message);

    if (!errorCode) {
      if (wrappedErrorIsACode) {
        errorCode = err.message as C;
      } else {
        errorCode = 'E_UNEXPECTED' as C;
      }
    }

    return new YHTTPError(
      typeof httpCode === 'number' ? httpCode : 500,
      errorCode,
      debug,
      looksLikeAYHTTPError(err) ? err.headers : {},
      { cause: err },
    );
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

  static cast<C extends string, CC extends string>(
    err: Error | YError<CC>,
    errorCode?: C,
    debug?: YErrorDebug<C>,
    httpCode?: number | string,
  ): YHTTPError<C> {
    if (looksLikeAYHTTPError(err)) {
      return err as YHTTPError;
    }
    return YHTTPError.wrap(err, errorCode, debug, httpCode);
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
  static bump<C extends string, CC extends string>(
    err: Error | YError<CC>,
    errorCode?: C,
    debug?: YErrorDebug<C>,
    httpCode?: number | string,
  ): YHTTPError<C> {
    if (looksLikeAYHTTPError(err)) {
      return YHTTPError.wrap(
        err,
        errorCode,
        debug,
        (err as YHTTPError).httpCode,
      );
    }
    return YHTTPError.wrap(err, errorCode, debug, httpCode);
  }

  toString(): string {
    let debugAsString: string;
    let headersAsString: string;

    try {
      debugAsString = JSON.stringify(this.debug);
    } catch {
      debugAsString = '<circular>';
    }
    try {
      headersAsString = JSON.stringify(this.headers);
    } catch {
      headersAsString = '<circular>';
    }

    return `${this.constructor.name}[${this.httpCode}]: ${this.code} (${debugAsString}, ${headersAsString})`;
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
      'debug' in err &&
      err.debug &&
      err.debug instanceof Array)
  );
}

export { YHTTPError };
