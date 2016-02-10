# YHTTPError
> Better HTTP errors for your NodeJS server.

[![NPM version](https://badge.fury.io/js/yhttperror.svg)](https://npmjs.org/package/yhttperror)
[![Build status](https://secure.travis-ci.org/SimpliField/yhttperror.svg)](https://travis-ci.org/SimpliField/yhttperror)
[![Dependency Status](https://david-dm.org/SimpliField/yhttperror.svg)](https://david-dm.org/SimpliField/yhttperror)
[![devDependency Status](https://david-dm.org/SimpliField/yhttperror/dev-status.svg)](https://david-dm.org/SimpliField/yhttperror#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/SimpliField/yhttperror/badge.svg?branch=master)](https://coveralls.io/r/SimpliField/yhttperror?branch=master)
[![Code Climate](https://codeclimate.com/github/SimpliField/yhttperror.svg)](https://codeclimate.com/github/SimpliField/yhttperror)

## Usage

As a child constructor of the YError one, YHTTPError allow you to get more
 valuable errors for better debugging, even for production errors.

YHTTPError also allows you to specify an HTTP error code, with 500 as a fallback.
 Here is a sample use case near to how we use it at SimpliField:

```js
var YHTTPError = require('yhttperror');

app.put('/users/:user_id', function(req, res, next) {
  // Let's start a Promise chain
  Promise.resolve()
  // This validate the payload an could throw errors
  .then(checkUserUpdatePayload.bind(null, req.body))
  // wrap any error into an HTTP 400 error with debug params
  .catch(function wrapUserPayloadError(err) {
    throw YHTTPError.wrap(err, 400, 'E_BAD_PAYLOAD', req.params.user_id, req.body);
  })
  // This check rights an return the result
  .then(checkUserRights.bind(null, req.user._id, 'USER_UPDATE'))
  // throw a YHTTPError if the user can't update an user
  .then(throwIfNotAuthorized(authorized) {
    if(!authorized) {
      throw new YHTTPError(401, 'E_UNAUTHORIZED', 'USER_UPDATE', authorized);
    }
  })
  // This update the user in the database
  .then(updateUser.bind(null, req.params.user_id, req.body))
  // wrap the error only if it is not yet a YHTTPError, in this case, db errors
  .catch(function castDatabaseError(err) {
    throw YHTTPError.cast(err, 500, 'E_DB_ERROR');
  })
  .then(sendUser.bind(null, res))
  .catch(function sendError(err) {
    // Sending the error, better done in an error middleware but keeping things
    // simple here. We're just passing the error to next like this in production
    // code: .catch(next);
    res.status(err.httpCode).send(err.stack);
  });
});
```

The above would give you valuable errors like this:
```
// Sample payload error:
// YError: E_INVALID_PROPERTY ('name', undefined)
//    at validateUser (/validateUser.js:5:11)
//    (...)
// YHTTPError [400]: E_BAD_PAYLOAD ('abbacacaabbacacaabbacaca', { email: 'a@a.com' })
//    at Function.YHTTPError.wrap (/home/nfroidure/simplifield/yhttperror/src/index.js:41:12)
//    at /home/nfroidure/simplifield/yhttperror/test.js:16:21
//    (...)

// Sample right error:
// YHTTPError [401]: E_UNAUTHORIZED ('b17eb17eb17eb17eb17eb17e', 'USER_UPDATE')
//    at Function.YHTTPError.wrap (/home/nfroidure/simplifield/yhttperror/src/index.js:41:12)
//    at /home/nfroidure/simplifield/yhttperror/test.js:16:21
//    (...)

// Sample db error:
// Error: Cannot connect to database
//    at dbConnect (/db.js:5:11)
//    (...)
// YHTTPError [500]: E_DB_ERROR ()
//    at Function.YHTTPError.wrap (/home/nfroidure/simplifield/yhttperror/src/index.js:41:12)
//    at /home/nfroidure/simplifield/yhttperror/test.js:16:21
//    (...)
```

## API

### YHTTPError(code:Number, msg:String, ...args:Mixed):Error

Creates a new YHTTPError with an HTTP error `code`, `msg` as a message and
 `args` as debug values.

### YHTTPError.wrap(err:Error, code:Number, msg:String, ...args:Mixed):Error

Wraps any error and output a YHTTPError with an HTTP error `code`, `msg` as its
 message and `args` as debug values.

### YHTTPError.cast(err:Error, code:Number, msg:String, ...args:Mixed):Error

Return YHTTPError as is or wraps any other error and output a YHTTPError with `msg` as
 its message and `args` as debug values.

### YHTTPError.bump(err:Error, fallbackCode:Number, fallbackMsg:String, ...fallbackArgs:Mixed):Error

Same than `YHTTPError.wrap()` but preserves the code, the message and the debug
 values of the error if it is already an instance of the YHTTPError constructor.

## Stats

[![NPM](https://nodei.co/npm/yhttperror.png?downloads=true&stars=true)](https://nodei.co/npm/yhttperror/)
[![NPM](https://nodei.co/npm-dl/yhttperror.png)](https://nodei.co/npm/yhttperror/)
