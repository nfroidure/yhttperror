import { describe, test } from '@jest/globals';
import assert from 'assert';
import { YHTTPError } from './index.js';

describe('YHTTPError', () => {
  describe('.__constructor', () => {
    test('Should work', () => {
      const err = new YHTTPError(400, 'E_ERROR', 'arg1', 'arg2');

      assert.equal(err.code, 'E_ERROR');
      assert.equal(err.httpCode, 400);
      assert.deepEqual(err.params, ['arg1', 'arg2']);
      assert.equal(err.toString(), 'YHTTPError[400]: E_ERROR (arg1, arg2)');
      assert.equal(err.name, err.toString());
      assert.deepEqual(err.headers, {});
    });

    test('Should work without code', () => {
      const err = new YHTTPError();

      assert.equal(err.code, 'E_UNEXPECTED');
      assert.equal(err.httpCode, 500);
      assert.deepEqual(err.params, []);
      assert.equal(err.toString(), 'YHTTPError[500]: E_UNEXPECTED ()');
      assert.equal(err.name, err.toString());
    });

    test('Should work with params', () => {
      const err = new YHTTPError(302, 'E_ERROR', 'arg1', 'arg2');

      assert.equal(err.code, 'E_ERROR');
      assert.equal(err.httpCode, 302);
      assert.deepEqual(err.params, ['arg1', 'arg2']);
      assert.equal(err.toString(), 'YHTTPError[302]: E_ERROR (arg1, arg2)');
      assert.equal(err.name, err.toString());
    });
  });

  describe('.cast()', () => {
    test('Should work with standard errors and a message', () => {
      const err = YHTTPError.cast(new Error('This is an error!'));

      assert.equal(err.code, 'E_UNEXPECTED');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 500);
      assert.deepEqual(err.params, ['This is an error!']);
      assert(
        -1 !== (err.stack || '').indexOf('Error: This is an error!'),
        'Contains the original error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[500]: E_UNEXPECTED (This is an error!)',
          ),
        'Contains the cast error.',
      );
      assert.equal(err.name, err.toString());
    });

    test('Should let YHTTPError instances pass through', () => {
      const err = YHTTPError.cast(
        new YHTTPError(400, 'E_ERROR_1', 'arg1.1', 'arg1.2'),
        500,
        'E_ERROR_2',
        'arg2.1',
        'arg2.2',
      );

      assert.equal(err.code, 'E_ERROR_1');
      assert.equal(err.httpCode, 400);
      assert.deepEqual(err.params, ['arg1.1', 'arg1.2']);
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_1 (arg1.1, arg1.2)',
          ),
        'Contains the original error.',
      );
      assert(
        -1 ===
          (err.stack || '').indexOf(
            'YHTTPError[500]: E_ERROR_2 (arg2.1, arg2.2)',
          ),
        "Doesn't contain the cast error.",
      );
      assert.equal(err.name, err.toString());
    });
  });

  describe('.bump()', () => {
    test('Should work with YHTTPError like errors, an error code and params', () => {
      const baseErr = new Error('E_ERROR');

      (baseErr as YHTTPError).code = 'E_ERROR';
      (baseErr as YHTTPError).params = ['baseParam1', 'baseParam2'];
      (baseErr as YHTTPError).httpCode = 418;

      const err = YHTTPError.bump(baseErr, 400, 'E_ERROR_2', 'arg1', 'arg2');

      assert.equal(err.code, 'E_ERROR_2');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 418);
      assert.deepEqual(err.params, [
        'baseParam1',
        'baseParam2',
        'arg1',
        'arg2',
      ]);
      assert(
        -1 !== (err.stack || '').indexOf('Error: E_ERROR'),
        'Contains the original error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[418]: E_ERROR_2 (baseParam1, baseParam2, arg1, arg2)',
          ),
        'Contains the bumped error.',
      );
      assert.equal(err.name, err.toString());
    });
  });

  describe('.wrap()', () => {
    test('Should work with standard errors and a message', () => {
      const err = YHTTPError.wrap(new Error('This is an error!'));

      assert.equal(err.code, 'E_UNEXPECTED');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 500);
      assert.deepEqual(err.params, ['This is an error!']);
      assert(
        -1 !== (err.stack || '').indexOf('Error: This is an error!'),
        'Contains the original error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[500]: E_UNEXPECTED (This is an error!)',
          ),
        'Contains the wrapped error.',
      );
      assert.equal(err.name, err.toString());
    });

    test('Should work with standard errors and an error code', () => {
      const err = YHTTPError.wrap(new Error('E_ERROR'));

      assert.equal(err.code, 'E_ERROR');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 500);
      assert.deepEqual(err.params, []);
      assert(
        -1 !== (err.stack || '').indexOf('Error: E_ERROR'),
        'Contains the original error.',
      );
      assert(
        -1 !== (err.stack || '').indexOf('YHTTPError[500]: E_ERROR ()'),
        'Contains the cast error.',
      );
      assert.equal(err.name, err.toString());
    });

    test('Should work with standard errors, an error code and params', () => {
      const err = YHTTPError.wrap(
        new Error('E_ERROR'),
        400,
        'E_ERROR_2',
        'arg1',
        'arg2',
      );

      assert.equal(err.code, 'E_ERROR_2');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 400);
      assert.deepEqual(err.params, ['arg1', 'arg2']);
      assert(
        -1 !== (err.stack || '').indexOf('Error: E_ERROR'),
        'Contains the original error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf('YHTTPError[400]: E_ERROR_2 (arg1, arg2)'),
        'Contains the cast error.',
      );
      assert.equal(err.name, err.toString());
    });

    test('Should work with HTTP errors and concat their params', () => {
      const baseErr = new YHTTPError(400, 'E_ERROR', 'arg1', 'arg2');

      baseErr.headers = { 'A-Header': 'A value' };

      const err = YHTTPError.wrap(baseErr, 400, 'E_ERROR_2', 'arg3', 'arg4');

      assert.equal(err.code, 'E_ERROR_2');
      assert.equal(err.wrappedErrors.length, 1);
      assert.equal(err.httpCode, 400);
      assert.equal(err.headers, baseErr.headers);
      assert.deepEqual(err.params, ['arg1', 'arg2', 'arg3', 'arg4']);
      assert(
        -1 !==
          (err.stack || '').indexOf('YHTTPError[400]: E_ERROR (arg1, arg2)'),
        'Contains the original error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_2 (arg1, arg2, arg3, arg4)',
          ),
        'Contains the cast error.',
      );
      assert.equal(err.name, err.toString());
    });

    test('Should work with several wrapped errors', () => {
      const err = YHTTPError.wrap(
        YHTTPError.wrap(
          new YHTTPError(400, 'E_ERROR_1', 'arg1.1', 'arg1.2'),
          401,
          'E_ERROR_2',
          'arg2.1',
          'arg2.2',
        ),
        402,
        'E_ERROR_3',
        'arg3.1',
        'arg3.2',
      );

      assert.equal(err.code, 'E_ERROR_3');
      assert.equal(err.wrappedErrors.length, 2); // eslint-disable-line
      assert.equal(err.httpCode, 402);
      assert.deepEqual(err.params, [
        'arg1.1',
        'arg1.2',
        'arg2.1',
        'arg2.2',
        'arg3.1',
        'arg3.2',
      ]);
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[400]: E_ERROR_1 (arg1.1, arg1.2)',
          ),
        'Contains the first error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[401]: E_ERROR_2 (arg1.1, arg1.2, arg2.1, arg2.2)',
          ),
        'Contains the second error.',
      );
      assert(
        -1 !==
          (err.stack || '').indexOf(
            'YHTTPError[402]: E_ERROR_3 (arg1.1, arg1.2, arg2.1, arg2.2, arg3.1, arg3.2)',
          ),
        'Contains the third error.',
      );
      assert.equal(err.name, err.toString());
    });
  });
});
