# API
<a name="YHTTPError"></a>

## YHTTPError ⇐ <code>Error</code>
Class representing an HTTP Error with extra debug informations

**Kind**: global class  
**Extends**: <code>Error</code>, <code>YError</code>  

* [YHTTPError](#YHTTPError) ⇐ <code>Error</code>
    * [new YHTTPError(httpCode, [errorCode], [...params])](#new_YHTTPError_new)
    * [.wrap(err, httpCode, [errorCode], [...params])](#YHTTPError.wrap) ⇒ [<code>YHTTPError</code>](#YHTTPError)
    * [.cast(err, httpCode, [errorCode], [...params])](#YHTTPError.cast) ⇒ [<code>YHTTPError</code>](#YHTTPError)
    * [.bump(err, httpCode, [errorCode], [...params])](#YHTTPError.bump) ⇒ [<code>YHTTPError</code>](#YHTTPError)

<a name="new_YHTTPError_new"></a>

### new YHTTPError(httpCode, [errorCode], [...params])
Creates a new YHTTPError with an HTTP error code, an
 error code and some params as debug values.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| httpCode | <code>number</code> | <code>500</code> | The HTTP error code corresponding to the actual error |
| [errorCode] | <code>string</code> | <code>&quot;&#x27;E_UNEXPECTED&#x27;&quot;</code> | The error code corresponding to the actual error |
| [...params] | <code>any</code> |  | Some additional debugging values |

<a name="YHTTPError.wrap"></a>

### YHTTPError.wrap(err, httpCode, [errorCode], [...params]) ⇒ [<code>YHTTPError</code>](#YHTTPError)
Wraps any error and output a YHTTPError with an HTTP
 error code, an error code and some params as debug values.

**Kind**: static method of [<code>YHTTPError</code>](#YHTTPError)  
**Returns**: [<code>YHTTPError</code>](#YHTTPError) - The wrapped error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | The error to wrap |
| httpCode | <code>number</code> |  | The HTTP error code corresponding to the actual error |
| [errorCode] | <code>string</code> | <code>&quot;&#x27;E_UNEXPECTED&#x27;&quot;</code> | The error code corresponding to the actual error |
| [...params] | <code>any</code> |  | Some additional debugging values |

<a name="YHTTPError.cast"></a>

### YHTTPError.cast(err, httpCode, [errorCode], [...params]) ⇒ [<code>YHTTPError</code>](#YHTTPError)
Return YHTTPError as is or wraps any other error and output
 a YHTTPError with an HTTP error code, an
 error code and some params as debug values.

**Kind**: static method of [<code>YHTTPError</code>](#YHTTPError)  
**Returns**: [<code>YHTTPError</code>](#YHTTPError) - The wrapped error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | The error to cast |
| httpCode | <code>number</code> |  | The HTTP error code corresponding to the actual error |
| [errorCode] | <code>string</code> | <code>&quot;&#x27;E_UNEXPECTED&#x27;&quot;</code> | The error code corresponding to the actual error |
| [...params] | <code>any</code> |  | Some additional debugging values |

<a name="YHTTPError.bump"></a>

### YHTTPError.bump(err, httpCode, [errorCode], [...params]) ⇒ [<code>YHTTPError</code>](#YHTTPError)
Same than `YHTTPError.wrap()` but preserves the HTTP code,
 the error code and the debug values of the error if it is
 already an instance of the YHTTPError constructor.

**Kind**: static method of [<code>YHTTPError</code>](#YHTTPError)  
**Returns**: [<code>YHTTPError</code>](#YHTTPError) - The wrapped error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| err | <code>Error</code> |  | The error to bump |
| httpCode | <code>number</code> |  | The HTTP error code corresponding to the actual error |
| [errorCode] | <code>string</code> | <code>&quot;&#x27;E_UNEXPECTED&#x27;&quot;</code> | The error code corresponding to the actual error |
| [...params] | <code>any</code> |  | Some additional debugging values |

