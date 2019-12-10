// Sadly, here, we cannot extend YError due to the
// parameters types redifinition in static methods
// this is why we are also declaring statuses as strings
// https://github.com/Microsoft/TypeScript/issues/4628
import YError from 'yerror';
declare class YHTTPError extends YError {
  constructor(httpCode: number, errorCode: string, ...params: any[]);
  httpCode: number;
  code: string;
  headers: { [name: string]: string };
  params: any[];
  static wrap<E extends Error>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: any[]
  ): YHTTPError;
  static cast<E extends Error>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: any[]
  ): YHTTPError;
  static bump<E extends Error>(
    err: E,
    httpCode?: number | string,
    errorCode?: string,
    ...params: any[]
  ): YHTTPError;
}

export default YHTTPError;
