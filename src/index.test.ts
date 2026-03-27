import { describe, test, expect } from '@jest/globals';
import { YHTTPError } from './index.js';

describe('YHTTPError', () => {
  describe('.__constructor', () => {
    test('Should work', () => {
      const err = new YHTTPError(400, 'E_ERROR', ['arg1', 'arg2']);

      expect(err.code).toEqual('E_ERROR');
      expect(err.httpCode).toEqual(400);
      expect(err.debugValues).toEqual(['arg1', 'arg2']);
      expect(err.toString()).toEqual(
        'YHTTPError[400]: E_ERROR (["arg1","arg2"], {})',
      );
      expect(err.name).toEqual(err.toString());
      expect(err.headers).toEqual({});
    });

    test('Should work without code', () => {
      const err = new YHTTPError();

      expect(err.code).toEqual('E_UNEXPECTED');
      expect(err.httpCode).toEqual(500);
      expect(err.debugValues).toEqual([]);
      expect(err.toString()).toEqual('YHTTPError[500]: E_UNEXPECTED ([], {})');
      expect(err.name).toEqual(err.toString());
    });

    test('Should work with params', () => {
      const err = new YHTTPError(302, 'E_ERROR', ['arg1', 'arg2']);

      expect(err.code).toEqual('E_ERROR');
      expect(err.httpCode).toEqual(302);
      expect(err.debugValues).toEqual(['arg1', 'arg2']);
      expect(err.toString()).toEqual(
        'YHTTPError[302]: E_ERROR (["arg1","arg2"], {})',
      );
      expect(err.name).toEqual(err.toString());
    });
  });

  describe('.cast()', () => {
    test('Should work with standard errors and a message', () => {
      const err = YHTTPError.cast(new Error('This is an error!'));

      expect(err.code).toEqual('E_UNEXPECTED');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(500);
      expect(err.debugValues).toEqual([]);
      expect(
        -1 !== (err.stack || '').indexOf('Error: This is an error!'),
      ).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf('YHTTPError[500]: E_UNEXPECTED ([], {})'),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });

    test('Should let YHTTPError instances pass through', () => {
      const err = YHTTPError.cast(
        new YHTTPError(400, 'E_ERROR_1', ['arg1.1', 'arg1.2']),
        'E_ERROR_2',
        ['arg2.1', 'arg2.2'],
        500,
      );

      expect(err.code).toEqual('E_ERROR_1');
      expect(err.httpCode).toEqual(400);
      expect(err.debugValues).toEqual(['arg1.1', 'arg1.2']);
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_1 (["arg1.1","arg1.2"], {})',
          ),
      ).toBeTruthy();
      expect(
        -1 ===
          (err.stack || '').indexOf(
            'YHTTPError[500]: E_ERROR_2 (arg2.1, arg2.2)',
          ),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });
  });

  describe('.bump()', () => {
    test('Should work with YHTTPError like errors, an error code and params', () => {
      const baseErr = new Error('E_ERROR');

      (baseErr as YHTTPError).code = 'E_ERROR';
      (baseErr as YHTTPError).debugValues = ['baseParam1', 'baseParam2'];
      (baseErr as YHTTPError).httpCode = 418;

      const err = YHTTPError.bump(baseErr, 'E_ERROR_2', ['arg1', 'arg2'], 400);

      expect(err.code).toEqual('E_ERROR_2');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(418);
      expect(err.debugValues).toEqual(['arg1', 'arg2']);
      expect(-1 !== (err.stack || '').indexOf('Error: E_ERROR')).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[418]: E_ERROR_2 (["arg1","arg2"], {})',
          ),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });
  });

  describe('.wrap()', () => {
    test('Should work with standard errors and a message', () => {
      const err = YHTTPError.wrap(new Error('This is an error!'));

      expect(err.code).toEqual('E_UNEXPECTED');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(500);
      expect(err.debugValues).toEqual([]);
      expect(
        -1 !== (err.stack || '').indexOf('Error: This is an error!'),
      ).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf('YHTTPError[500]: E_UNEXPECTED ([], {})'),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });

    test('Should work with standard errors and an error code', () => {
      const err = YHTTPError.wrap(new Error('E_ERROR'));

      expect(err.code).toEqual('E_ERROR');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(500);
      expect(err.debugValues).toEqual([]);
      expect(-1 !== (err.stack || '').indexOf('Error: E_ERROR')).toBeTruthy();
      expect(
        -1 !== (err.stack || '').indexOf('YHTTPError[500]: E_ERROR ([], {})'),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });

    test('Should work with standard errors, an error code and params', () => {
      const err = YHTTPError.wrap(
        new Error('E_ERROR'),
        'E_ERROR_2',
        ['arg1', 'arg2'],
        400,
      );

      expect(err.code).toEqual('E_ERROR_2');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(400);
      expect(err.debugValues).toEqual(['arg1', 'arg2']);
      expect(-1 !== (err.stack || '').indexOf('Error: E_ERROR')).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_2 (["arg1","arg2"], {})',
          ),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });

    test('Should work with HTTP errors and concat their params', () => {
      const baseErr = new YHTTPError(400, 'E_ERROR', ['arg1', 'arg2'], {
        'A-Header': 'A value',
      });

      const err = YHTTPError.wrap(baseErr, 'E_ERROR_2', ['arg3', 'arg4'], 400);

      expect(err.code).toEqual('E_ERROR_2');
      expect(err.wrappedErrors.length).toEqual(1);
      expect(err.httpCode).toEqual(400);
      expect(err.headers).toEqual(baseErr.headers);
      expect(err.debugValues).toEqual(['arg3', 'arg4']);
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR (["arg1","arg2"], {"A-Header":"A value"})',
          ),
      ).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_2 (["arg3","arg4"], {"A-Header":"A value"})',
          ),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });

    test('Should work with several wrapped errors', () => {
      const err = YHTTPError.wrap(
        YHTTPError.wrap(
          new YHTTPError(400, 'E_ERROR_1', ['arg1.1', 'arg1.2']),
          'E_ERROR_2',
          ['arg2.1', 'arg2.2'],
          401,
        ),
        'E_ERROR_3',
        ['arg3.1', 'arg3.2'],
        402,
      );

      expect(err.code).toEqual('E_ERROR_3');
      expect(err.wrappedErrors.length).toEqual(2);
      expect(err.httpCode).toEqual(402);
      expect(err.debugValues).toEqual(['arg3.1', 'arg3.2']);
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_1 (["arg1.1","arg1.2"], {})',
          ),
      ).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[401]: E_ERROR_2 (["arg2.1","arg2.2"], {})',
          ),
      ).toBeTruthy();
      expect(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[402]: E_ERROR_3 (["arg3.1","arg3.2"], {})',
          ),
      ).toBeTruthy();
      expect(err.name).toEqual(err.toString());
    });
  });
});
