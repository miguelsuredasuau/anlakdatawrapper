'use strict';

var isPlainObject = require('lodash/isPlainObject.js');
var isEqual$1 = require('lodash/isEqual.js');
var numeral = require('numeral');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var isPlainObject__default = /*#__PURE__*/_interopDefaultLegacy(isPlainObject);
var isEqual__default = /*#__PURE__*/_interopDefaultLegacy(isEqual$1);
var numeral__default = /*#__PURE__*/_interopDefaultLegacy(numeral);

function guessDelimiterFromLocale(numeral) {
    try {
        if (numeral.localeData().delimiters.decimal === ',') {
            return ';';
        }
    } catch (e) {
        // invalid locale data
    }
    return ',';
}

function escapeDelimitedValue(value, delimiter, quoteChar) {
    if (
        value === null ||
        value === undefined ||
        (typeof value === 'number' && !Number.isFinite(value))
    ) {
        return '';
    }
    const s = String(value);
    if (s.indexOf(quoteChar) !== -1) {
        // A double-quote appearing inside a field MUST be escaped by preceding it with another
        // double quote, and the field itself MUST be enclosed in double quotes.
        // See paragraph 8 at https://csv-spec.org/#csv-format-specification
        return quoteChar + s.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) + quoteChar;
    }
    if (new RegExp(`[\n\r${delimiter}]`).test(s)) {
        // Fields containing line breaks (CRLF, LF, or CR), double quotes, or the delimiter
        // character (normally a comma) MUST be enclosed in double-quotes.
        // See paragraph 7 at https://csv-spec.org/#csv-format-specification
        return quoteChar + s + quoteChar;
    }
    return s;
}

function formatDelimited(
    rows,
    { delimiter = ',', quoteChar = '"', lineTerminator = '\n' } = {}
) {
    return rows
        .map(row =>
            row.map(value => escapeDelimitedValue(value, delimiter, quoteChar)).join(delimiter)
        )
        .join(lineTerminator);
}

var delimited$1 = {
    formatDelimited,
    guessDelimiterFromLocale
};

// Current version.
var VERSION = '1.13.1';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = typeof self == 'object' && self.self === self && self ||
          typeof global == 'object' && global.global === global && global ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}

var isString = tagTester('String');

var isNumber = tagTester('Number');

var isDate = tagTester('Date');

var isRegExp = tagTester('RegExp');

var isError = tagTester('Error');

var isSymbol = tagTester('Symbol');

var isArrayBuffer = tagTester('ArrayBuffer');

var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;

var hasObjectTag = tagTester('Object');

// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
var hasStringTagBug = (
      supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8)))
    ),
    isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = (hasStringTagBug ? ie10IsDataView : isDataView);

// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
var isArray = nativeIsArray || tagTester('Array');

// Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}

var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has$1(obj, 'callee');
    };
  }
}());

var isArguments$1 = isArguments;

// Is a given object a finite number?
function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}

// Is the given value `NaN`?
function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}

// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}

// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

// Internal helper to obtain the `byteLength` property of an object.
var getByteLength = shallowProperty('byteLength');

// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
var isBufferLike = createSizePropertyCheck(getByteLength);

// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView$1(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);

// Internal helper to obtain the `length` property of an object.
var getLength = shallowProperty('length');

// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key]; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = isFunction$1(constructor) && constructor.prototype || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || isArguments$1(obj)
  )) return length === 0;
  return getLength(keys(obj)) === 0;
}

// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _$1(obj) {
  if (obj instanceof _$1) return obj;
  if (!(this instanceof _$1)) return new _$1(obj);
  this._wrapped = obj;
}

_$1.VERSION = VERSION;

// Extracts the result from a wrapped and chained object.
_$1.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

_$1.prototype.toString = function() {
  return String(this._wrapped);
};

// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}

// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Internal recursive comparison function for `_.isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `_.isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _$1) a = a._wrapped;
  if (b instanceof _$1) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className !== toString.call(b)) return false;
  // Work around a bug in IE 10 - Edge 13.
  if (hasStringTagBug && className == '[object Object]' && isDataView$1(a)) {
    if (!isDataView$1(b)) return false;
    className = tagDataView;
  }
  switch (className) {
    // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays && isTypedArray$1(a)) {
      var byteLength = getByteLength(a);
      if (byteLength !== getByteLength(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
      areArrays = true;
  }
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor &&
                             isFunction$1(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}

// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = getLength(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = allKeys(obj);
    if (getLength(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!isFunction$1(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);

var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');

var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');

var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');

var isWeakSet = tagTester('WeakSet');

// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }
  return names.sort();
}

// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);

// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);

// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);

// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

// Create a (shallow-cloned) duplicate of an object.
function clone$1(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;

// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _$1.toPath(path);
}

// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get$1(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has(obj, path) {
  path = toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has$1(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}

// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;

// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Predicate-generating function. Often useful outside of Underscore.
function noop(){}

// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get$1(obj, path);
  };
}

// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

// Return a random integer between `min` and `max` (inclusive).
function random$1(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};

// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}

// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

// Function for escaping strings to HTML interpolation.
var escape = createEscaper(escapeMap);

// Internal list of HTML entities for unescaping.
var unescapeMap = invert(escapeMap);

// Function for unescaping strings from HTML interpolation.
var unescape = createEscaper(unescapeMap);

// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};

// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _$1.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _$1);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;
  if (!length) {
    return isFunction$1(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction$1(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _$1(obj);
  instance._chain = true;
  return instance;
}

// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _$1;

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
var bind = restArguments(function(func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var isArrayLike = createSizePropertyCheck(getLength);

// Internal implementation of a recursive `flatten` function.
function flatten$1(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
var bindAll = restArguments(function(obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});

// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _$1, 1);

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}

// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);

// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

// Returns the first index on an array-like that passes a truth test.
var findIndex = createPredicateIndexFinder(1);

// Returns the last index on an array-like that passes a truth test.
var findLastIndex = createPredicateIndexFinder(-1);

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
var lastIndexOf = createIndexFinder(-1, findLastIndex);

// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}

// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}

// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);

// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);

// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}

// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}

// Determine if the array or object contains a given item (using `===`).
function contains$1(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}

// Invoke a method (with arguments) on every item in a collection.
var invoke = restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction$1(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});

// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}

// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

// Return the maximum element (or element-based computation).
function max$1(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min$1(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || computed === Infinity && result === Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random$1(obj.length - 1)];
  }
  var sample = isArrayLike(obj) ? clone$1(obj) : values(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random$1(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key]++; else result[key] = 1;
});

// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}

// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}

// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}

// Return a copy of the object only containing the allowed properties.
var pick = restArguments(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if (isFunction$1(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten$1(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
});

// Return a copy of the object without the disallowed properties.
var omit = restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten$1(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains$1(keys, key);
    };
  }
  return pick(obj, iteratee, context);
});

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}

// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return flatten$1(array, depth, false);
}

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains$1(rest, value);
  });
});

// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains$1(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains$1(result, value)) {
      result.push(value);
    }
  }
  return result;
}

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(flatten$1(arrays, true, true));
});

// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains$1(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains$1(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = array && max$1(array, getLength).length || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}

// Add your own custom functions to the Underscore object.
function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _$1[name] = obj[name];
    _$1.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_$1, args));
    };
  });
  return _$1;
}

// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

// Named Exports

var allExports = /*#__PURE__*/Object.freeze({
    __proto__: null,
    VERSION: VERSION,
    restArguments: restArguments,
    isObject: isObject,
    isNull: isNull,
    isUndefined: isUndefined,
    isBoolean: isBoolean,
    isElement: isElement,
    isString: isString,
    isNumber: isNumber,
    isDate: isDate,
    isRegExp: isRegExp,
    isError: isError,
    isSymbol: isSymbol,
    isArrayBuffer: isArrayBuffer,
    isDataView: isDataView$1,
    isArray: isArray,
    isFunction: isFunction$1,
    isArguments: isArguments$1,
    isFinite: isFinite$1,
    isNaN: isNaN$1,
    isTypedArray: isTypedArray$1,
    isEmpty: isEmpty,
    isMatch: isMatch,
    isEqual: isEqual,
    isMap: isMap,
    isWeakMap: isWeakMap,
    isSet: isSet,
    isWeakSet: isWeakSet,
    keys: keys,
    allKeys: allKeys,
    values: values,
    pairs: pairs,
    invert: invert,
    functions: functions,
    methods: functions,
    extend: extend,
    extendOwn: extendOwn,
    assign: extendOwn,
    defaults: defaults,
    create: create,
    clone: clone$1,
    tap: tap,
    get: get$1,
    has: has,
    mapObject: mapObject,
    identity: identity,
    constant: constant,
    noop: noop,
    toPath: toPath$1,
    property: property,
    propertyOf: propertyOf,
    matcher: matcher,
    matches: matcher,
    times: times,
    random: random$1,
    now: now,
    escape: escape,
    unescape: unescape,
    templateSettings: templateSettings,
    template: template,
    result: result,
    uniqueId: uniqueId,
    chain: chain,
    iteratee: iteratee,
    partial: partial,
    bind: bind,
    bindAll: bindAll,
    memoize: memoize,
    delay: delay,
    defer: defer,
    throttle: throttle,
    debounce: debounce,
    wrap: wrap,
    negate: negate,
    compose: compose,
    after: after,
    before: before,
    once: once,
    findKey: findKey,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    sortedIndex: sortedIndex,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    find: find,
    detect: find,
    findWhere: findWhere,
    each: each,
    forEach: each,
    map: map,
    collect: map,
    reduce: reduce,
    foldl: reduce,
    inject: reduce,
    reduceRight: reduceRight,
    foldr: reduceRight,
    filter: filter,
    select: filter,
    reject: reject,
    every: every,
    all: every,
    some: some,
    any: some,
    contains: contains$1,
    includes: contains$1,
    include: contains$1,
    invoke: invoke,
    pluck: pluck,
    where: where,
    max: max$1,
    min: min$1,
    shuffle: shuffle,
    sample: sample,
    sortBy: sortBy,
    groupBy: groupBy,
    indexBy: indexBy,
    countBy: countBy,
    partition: partition,
    toArray: toArray,
    size: size,
    pick: pick,
    omit: omit,
    first: first,
    head: first,
    take: first,
    initial: initial,
    last: last,
    rest: rest,
    tail: rest,
    drop: rest,
    compact: compact,
    flatten: flatten,
    without: without,
    uniq: uniq,
    unique: uniq,
    union: union,
    intersection: intersection,
    difference: difference,
    unzip: unzip,
    transpose: unzip,
    zip: zip,
    object: object,
    range: range,
    chunk: chunk,
    mixin: mixin,
    'default': _$1
});

// Default Export

// Add all of the Underscore functions to the wrapper object.
var _ = mixin(allExports);
// Legacy Node.js API.
_._ = _;

/*
 * Dataset class
 * @class dw.Dataset
 *
 * @param {dw.Column[]} columns
 */
function Dataset(columns) {
    // make column names unique
    const columnsByName = {};
    const origColumns = columns.slice(0);

    columns.forEach(col => {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    // sets a unique name for a column
    function uniqueName(col) {
        const origColName = col.name();
        let baseColName, suffix, colName;
        if (origColName) {
            baseColName = origColName;
            suffix = 0;
            colName = baseColName;
        } else {
            baseColName = 'X';
            suffix = 1;
            colName = `${baseColName}.${suffix}`;
        }
        while (Object.prototype.hasOwnProperty.call(columnsByName, colName)) {
            colName = `${baseColName}.${++suffix}`;
        }
        if (colName !== origColName) {
            col.name(colName, origColName);
        }
    }

    // public interface
    const dataset = {
        /**
         * returns all columns of the dataset
         * @returns {dw.Column[]}
         */
        columns() {
            return columns;
        },

        /**
         * returns a specific column by name or index
         *
         * @param {string|number} nameOrIndex -- the name or index of the column to return
         * @returns {dw.Column}
         */
        column(nameOrIndex) {
            if (isString(nameOrIndex)) {
                // single column by name
                if (columnsByName[nameOrIndex] !== undefined) return columnsByName[nameOrIndex];
                throw new Error('No column found with that name: "' + nameOrIndex + '"');
            } else {
                if (nameOrIndex < 0) {
                    return;
                }
            }

            // single column by index
            if (columns[nameOrIndex] !== undefined) return columns[nameOrIndex];
            throw new Error('No column found with that name or index: ' + nameOrIndex);
        },

        /**
         * returns the number of columns in the dataset
         * @returns {number}
         */
        numColumns() {
            return columns.length;
        },

        /**
         * returns the number of rows in the dataset
         * @returns {number}
         */
        numRows() {
            return columns[0].length;
        },

        /** calls a function for each column of the dataset */
        eachColumn(func) {
            columns.forEach(func);
        },

        /**
         * tests if a column name or index exists
         *
         * @param {string|number} nameOrIndex -- the name or index of the column
         * @returns {boolean}
         */
        hasColumn(nameOrIndex) {
            return (
                (isString(nameOrIndex) ? columnsByName[nameOrIndex] : columns[nameOrIndex]) !==
                undefined
            );
        },

        /**
         * returns the index of a column
         * @param {string} columnName
         * @returns {number}
         */
        indexOf(columnName) {
            if (!dataset.hasColumn(columnName)) return -1;
            return columns.indexOf(columnsByName[columnName]);
        },

        /**
         * returns a D3 friendly list of plain objects
         * @returns {object[]}
         */
        list() {
            return range(columns[0].length).map(dataset.row);
        },

        /**
         * returns an object containing the column values of the row
         * @param {number} index the row index
         * @returns {object}
         */
        row(index) {
            if (index >= columns[0].length) {
                return {};
            }
            const o = {};
            columns.forEach(col => {
                o[col.name()] = col.val(index);
            });
            return o;
        },

        /**
         * returns a CSV string representation of the dataset
         * @param {Object} opt -- options
         * @param {boolean} [opt.includeComputedColumns=true] -- include computed columns in the CSV
         * @param {boolean} [opt.includeHeader=true] -- include header row in the CSV
         * @param {string} [opt.numeral=null] -- format numbers using this Numeral.js instance
         * @returns {string}
         */
        csv({ includeComputedColumns = true, includeHeader = true, numeral = null, ...opts } = {}) {
            const numRows = dataset.numRows();
            const filteredColumns = includeComputedColumns
                ? columns
                : columns.filter(col => !col.isComputed);
            const table = filteredColumns.map(col => [
                ...(includeHeader ? [col.title()] : []),
                ...col.formatted(numeral)
            ]);
            const rows = table[0].map((_, i) => table.map(row => row[i])).slice(0, numRows + 1);
            if (!opts.delimiter && numeral) {
                opts.delimiter = guessDelimiterFromLocale(numeral);
            }
            return formatDelimited(rows, opts);
        },

        /**
         * @alias csv
         * @deprecated
         */
        toCSV() {
            return this.csv(...arguments);
        },

        /**
         * removes ignored columns from dataset
         * @param {object} ignore -- object of column names to ignore
         */
        filterColumns(ignore) {
            columns = columns.filter(c => !ignore[c.name()]);
            each(ignore, (ign, key) => {
                if (ign && columnsByName[key]) delete columnsByName[key];
            });
            return dataset;
        },

        /**
         * executes func for each row of the dataset
         */
        eachRow(func) {
            var i;
            for (i = 0; i < dataset.numRows(); i++) {
                func(i);
            }
            return dataset;
        },

        /**
         * adds a new column to the dataset
         * @param {dw.Column} column
         */
        add(column) {
            uniqueName(column);
            columns.push(column);
            columnsByName[column.name()] = column;
            origColumns.push(column);
            return dataset;
        },

        /**
         * cuts each column in the dataset to a maximum number of rows
         * @param {number} numRows
         * @returns {dw.Dataset}
         */
        limitRows(numRows) {
            columns.forEach(col => {
                col.limitRows(numRows);
            });
            return dataset;
        },

        /**
         * cuts the number of columns to a maximum value
         * @param {number} numCols
         * @returns {dw.Dataset}
         */
        limitColumns(numCols) {
            if (columns.length > numCols) {
                columns.length = numCols;
                origColumns.length = numCols;
            }
            return dataset;
        },

        /**
         * returns the columns in a given order
         * @param {number[]} sortOrder -- array of indexes
         */
        columnOrder(sortOrder) {
            if (arguments.length) {
                columns.length = 0;
                sortOrder.forEach(function (i) {
                    columns.push(origColumns[i]);
                });
                return dataset;
            }
            return columns.map(function (c) {
                return origColumns.indexOf(c);
            });
        },

        /**
         * make sure all columns have the same number of rows
         *
         * pad with empty string by default, because that's a neutral value that doesn't make the
         * cell invalid
         *
         * @param {*} [value=''] -- pad short columns with this value
         */
        align(value = '') {
            const maxNumRows = Math.max(...columns.map(column => column.length));
            for (const column of columns) {
                const padding = Array(maxNumRows - column.length).fill(value);
                column.add(...padding);
            }
        },

        /**
         * create a copy of the dataset
         * @returns {dw.Dataset}
         */
        clone() {
            return Dataset(columns.map(column => column.clone()));
        },

        /**
         * remove all rows from all columns of the dataset
         */
        clear() {
            for (const column of columns) {
                column.clear();
            }
        },

        /**
         * deletes one or more rows from dataset
         * @param {...number} rowIndex
         * @returns {dw.Dataset}
         */
        deleteRow(...rowIndexes) {
            rowIndexes.sort();
            for (const column of columns) {
                let numDeleted = 0;
                rowIndexes.forEach(rowIndex => {
                    const deletedRows = column.deleteRow(rowIndex - numDeleted);
                    numDeleted += deletedRows.length;
                });
            }
            return dataset;
        }
    };

    return dataset;
}

function text () {
    return {
        parse: identity,
        errors: function () {
            return 0;
        },
        name: function () {
            return 'text';
        },
        isValid: function () {
            return true;
        },
        format: function () {}
    };
}

/* eslint no-irregular-whitespace: "off" */

/*
 * A type for numbers:
 *
 * Usage:
 * var parse = dw.type.number(sampleData);
 * parse()
 */
function number (sample) {
    let format;
    let errors = 0;
    const knownFormats = {
        '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
        '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
        ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
        '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
        ' .': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(\.[0-9]+)?%? *$/,
        ' ,': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(,[0-9]+)?%? *$/,
        // excel sometimes produces a strange white-space:
        "'.": /^ *[-–—−]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
    };
    const formatLabels = {
        '-.': '1234.56',
        '-,': '1234,56',
        ',.': '1,234.56',
        '.,': '1.234,56',
        ' .': '1 234.56',
        ' ,': '1 234,56',
        // excel sometimes produces a strange white-space:
        ' .': '1 234.56',
        ' ,': '1 234,56',
        ' .': '1 234.56',
        ' ,': '1 234,56'
    };
    // a list of strings that are recognized as 'not available'
    const naStrings = {
        na: 1,
        'n/a': 1,
        '-': 1,
        ':': 1
    };

    const matches = {};
    const bestMatch = ['-.', 0];

    sample = sample || [];

    each(sample, function (n) {
        each(knownFormats, function (regex, fmt) {
            if (matches[fmt] === undefined) matches[fmt] = 0;
            if (regex.test(n)) {
                matches[fmt] += 1;
                if (matches[fmt] > bestMatch[1]) {
                    bestMatch[0] = fmt;
                    bestMatch[1] = matches[fmt];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    var type = {
        parse: function (raw) {
            if (isNumber(raw) || isUndefined(raw) || isNull(raw)) return raw;
            // replace percent sign, n-dash & m-dash, remove weird spaces
            var number = raw
                .replace('%', '')
                .replace('−', '-')
                .replace(/[   ]/g, '')
                .replace('–', '-')
                .replace('—', '-');
            // normalize number
            if (format[0] !== '-') {
                // remove kilo seperator
                number = number.replace(new RegExp(format[0] === '.' ? '\\.' : format[0], 'g'), '');
            }
            if (format[1] !== '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }
            if (isNaN(number) || number === '') {
                if (!naStrings[number.toLowerCase()] && number !== '') errors++;
                return raw;
            }
            return Number(number);
        },
        toNum: function (i) {
            return i;
        },
        fromNum: function (i) {
            return i;
        },
        errors: function () {
            return errors;
        },
        name: function () {
            return 'number';
        },

        isValid: function (val) {
            return val === '' || naStrings[String(val).toLowerCase()] || isNumber(type.parse(val));
        },

        ambiguousFormats: function () {
            var candidates = [];
            each(matches, function (cnt, fmt) {
                if (cnt === bestMatch[1]) {
                    candidates.push([fmt, formatLabels[fmt]]); // key, label
                }
            });
            return candidates;
        },

        format: function (fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        }
    };
    return type;
}

const begin = /^ */.source;
const end = /[*']* *$/.source;
const s0 = /[ \-/.]?/.source; // optional separator
const s1 = /[ \-/.]/.source; // mandatory separator
const s2 = /[ \-/.;,]/.source; // mandatory separator
const s3 = /[ \-|T]/.source; // mandatory separator
const sM = /[ \-/.m]/.source; // mandatory separator
const rx = {
    YY: { parse: /['’‘]?(\d{2})/ },
    YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
    YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
    H: { parse: /h([12])/ },
    Q: { parse: /q([1234])/ },
    W: { parse: /w([0-5]?[0-9])/ },
    MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
    DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
    DOW: { parse: /([0-7])/ },
    HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ }
};

const MONTHS = {
    // feel free to add more localized month names
    0: [
        'jan',
        'january',
        'januar',
        'jänner',
        'jän',
        'janv',
        'janvier',
        'ene',
        'enero',
        'gen',
        'gennaio',
        'janeiro'
    ],
    1: [
        'feb',
        'february',
        'febr',
        'februar',
        'fév',
        'févr',
        'février',
        'febrero',
        'febbraio',
        'fev',
        'fevereiro'
    ],
    2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
    3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
    4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
    5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
    6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
    7: ['aug', 'august', 'août', 'ago', 'agosto'],
    8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
    9: [
        'oct',
        'october',
        'okt',
        'oktober',
        'octobre',
        'octubre',
        'ott',
        'ottobre',
        'out',
        'outubro'
    ],
    10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
    11: [
        'dec',
        'december',
        'dez',
        'des',
        'dezember',
        'déc',
        'décembre',
        'dic',
        'diciembre',
        'dicembre',
        'desember',
        'dezembro'
    ]
};
const shortMonthKey = {};

each(MONTHS, function (abbr, m) {
    each(abbr, function (a) {
        shortMonthKey[a] = m;
    });
});

rx.MMM = { parse: new RegExp('(' + flatten(values(MONTHS)).join('|') + ')') };

each(rx, function (r) {
    r.parse = r.parse.source;
    if (isRegExp(r.test)) r.test = r.test.source;
    else r.test = r.parse;
});

var knownFormats = {
    // each format has two regex, a strict one for format guessing
    // based on a sample and a lazy one for parsing
    YYYY: {
        test: reg(rx.YYYY2.test),
        parse: reg(rx.YYYY2.parse),
        precision: 'year'
    },
    'YYYY-H': {
        test: reg(rx.YYYY.test, s0, rx.H.test),
        parse: reg(rx.YYYY.parse, s0, rx.H.parse),
        precision: 'half'
    },
    'H-YYYY': {
        test: reg(rx.H.test, s1, rx.YYYY.test),
        parse: reg(rx.H.parse, s1, rx.YYYY.parse),
        precision: 'half'
    },
    'YYYY-Q': {
        test: reg(rx.YYYY.test, s0, rx.Q.test),
        parse: reg(rx.YYYY.parse, s0, rx.Q.parse),
        precision: 'quarter'
    },
    'Q-YYYY': {
        test: reg(rx.Q.test, s1, rx.YYYY.test),
        parse: reg(rx.Q.parse, s1, rx.YYYY.parse),
        precision: 'quarter'
    },
    'YYYY-M': {
        test: reg(rx.YYYY.test, sM, rx.MM.test),
        parse: reg(rx.YYYY.parse, sM, rx.MM.parse),
        precision: 'month'
    },
    'M-YYYY': {
        test: reg(rx.MM.test, s1, rx.YYYY.test),
        parse: reg(rx.MM.parse, s1, rx.YYYY.parse),
        precision: 'month'
    },
    'YYYY-MMM': {
        test: reg(rx.YYYY.test, s1, rx.MMM.parse),
        parse: reg(rx.YYYY.parse, s1, rx.MMM.parse),
        precision: 'month'
    },
    'MMM-YYYY': {
        test: reg(rx.MMM.parse, s1, rx.YYYY.test),
        parse: reg(rx.MMM.parse, s1, rx.YYYY.parse),
        precision: 'month'
    },
    'MMM-YY': {
        test: reg(rx.MMM.parse, s1, rx.YY.test),
        parse: reg(rx.MMM.parse, s1, rx.YY.parse),
        precision: 'month'
    },
    MMM: {
        test: reg(rx.MMM.parse),
        parse: reg(rx.MMM.parse),
        precision: 'month'
    },
    'YYYY-WW': {
        test: reg(rx.YYYY.test, s0, rx.W.test),
        parse: reg(rx.YYYY.parse, s0, rx.W.parse),
        precision: 'week'
    },
    'WW-YYYY': {
        test: reg(rx.W.test, s1, rx.YYYY.test),
        parse: reg(rx.W.parse, s1, rx.YYYY.parse),
        precision: 'week'
    },
    'MM/DD/YYYY': {
        test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test),
        parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse),
        precision: 'day'
    },
    'MM/DD/YY': {
        test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YY.test),
        parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YY.parse),
        precision: 'day'
    },
    'DD/MM/YY': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YY.test),
        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YY.parse),
        precision: 'day'
    },
    'DD/MM/YYYY': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test),
        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse),
        precision: 'day'
    },
    'DD/MMM/YYYY': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YYYY.test),
        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YYYY.parse),
        precision: 'day'
    },
    'DD/MMM/YY': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YY.test),
        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YY.parse),
        precision: 'day'
    },
    'YYYY-MM-DD': {
        test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test),
        parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse),
        precision: 'day'
    },

    'MMM-DD-YYYY': {
        test: reg(rx.MMM.test, s1, rx.DD.test, s2, rx.YYYY.test),
        parse: reg(rx.MMM.parse, s1, rx.DD.parse, s2, rx.YYYY.parse),
        precision: 'day'
    },

    'YYYY-WW-d': {
        // year + ISO week + [day]
        test: reg(rx.YYYY.test, s0, rx.W.test, s1, rx.DOW.test),
        parse: reg(rx.YYYY.parse, s0, rx.W.parse, s1, rx.DOW.parse),
        precision: 'day'
    },

    // dates with a time
    'MM/DD/YYYY HH:MM': {
        test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
        parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
        precision: 'day-minutes'
    },
    'DD.MM.YYYY HH:MM': {
        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
        parse: reg(
            rx.DD.parse,
            '([\\-\\.\\/ ?])',
            rx.MM.parse,
            '\\2',
            rx.YYYY.parse,
            s3,
            rx.HHMM.parse
        ),
        precision: 'day-minutes'
    },
    'YYYY-MM-DD HH:MM': {
        test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
        parse: reg(
            rx.YYYY.parse,
            '([\\-\\.\\/ ?])',
            rx.MM.parse,
            '\\2',
            rx.DD.parse,
            s3,
            rx.HHMM.parse
        ),
        precision: 'day-minutes'
    },
    ISO8601: {
        test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)/,
        parse: function (str) {
            return str;
        },
        precision: 'day-seconds'
    }
};

function reg() {
    return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
}

function test(str, key) {
    var fmt = knownFormats[key];
    if (isRegExp(fmt.test)) {
        return fmt.test.test(str);
    } else {
        return fmt.test(str, key);
    }
}

function parse(str, key) {
    var fmt = knownFormats[key];
    if (isRegExp(fmt.parse)) {
        return str.match(fmt.parse);
    } else {
        return fmt.parse(str, key);
    }
}

function dateFromIsoWeek(year, week, day) {
    var d = new Date(Date.UTC(year, 0, 3));
    d.setUTCDate(3 - d.getUTCDay() + (week - 1) * 7 + parseInt(day, 10));
    return d;
}

function hour(hr, amPm) {
    if (hr !== 12) return hr + (amPm === 'pm' ? 12 : 0);
    return amPm === 'am' ? 0 : 12;
}

function date (sample) {
    let format;
    let errors = 0;
    const matches = {};
    const bestMatch = ['', 0];

    sample = sample || [];

    each(knownFormats, function (format, key) {
        each(sample, function (n) {
            if (matches[key] === undefined) matches[key] = 0;
            if (test(n, key)) {
                matches[key] += 1;
                if (matches[key] > bestMatch[1]) {
                    bestMatch[0] = key;
                    bestMatch[1] = matches[key];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    const type = {
        parse: function (raw) {
            if (isDate(raw) || isUndefined(raw)) return raw;
            if (!format || !isString(raw)) {
                errors++;
                return raw;
            }

            var m = parse(raw.toLowerCase(), format);

            if (!m) {
                errors++;
                return raw;
            } else {
                // increment errors anyway if string doesn't match strict format
                if (!test(raw, format)) errors++;
            }

            function guessTwoDigitYear(yr) {
                yr = +yr;
                if (yr < 30) return 2000 + yr;
                else return 1900 + yr;
            }

            var curYear = new Date().getFullYear();

            switch (format) {
                case 'YYYY':
                    return new Date(m[1], 0, 1);
                case 'YYYY-H':
                    return new Date(m[1], (m[2] - 1) * 6, 1);
                case 'H-YYYY':
                    return new Date(m[2], (m[1] - 1) * 6, 1);
                case 'YYYY-Q':
                    return new Date(m[1], (m[2] - 1) * 3, 1);
                case 'Q-YYYY':
                    return new Date(m[2], (m[1] - 1) * 3, 1);
                case 'YYYY-M':
                    return new Date(m[1], m[2] - 1, 1);
                case 'M-YYYY':
                    return new Date(m[2], m[1] - 1, 1);

                case 'YYYY-MMM':
                    return new Date(+m[1], shortMonthKey[m[2]], 1);
                case 'MMM-YYYY':
                    return new Date(+m[2], shortMonthKey[m[1]], 1);
                case 'MMM-YY':
                    return new Date(guessTwoDigitYear(+m[2]), shortMonthKey[m[1]], 1);
                case 'MMM':
                    return new Date(curYear, shortMonthKey[m[1]], 1);

                case 'YYYY-WW':
                    return dateFromIsoWeek(m[1], m[2], 1);
                case 'WW-YYYY':
                    return dateFromIsoWeek(m[2], m[1], 1);

                case 'YYYY-WW-d':
                    return dateFromIsoWeek(m[1], m[2], m[3]);
                case 'YYYY-MM-DD':
                    return new Date(m[1], m[3] - 1, m[4]);
                case 'DD/MM/YYYY':
                    return new Date(m[4], m[3] - 1, m[1]);
                case 'DD/MMM/YYYY':
                    return new Date(m[4], shortMonthKey[m[3]], m[1]);
                case 'DD/MMM/YY':
                    return new Date(guessTwoDigitYear(m[4]), shortMonthKey[m[3]], m[1]);
                case 'MM/DD/YYYY':
                    return new Date(m[4], m[1] - 1, m[3]);
                case 'MM/DD/YY':
                    return new Date(guessTwoDigitYear(m[4]), m[1] - 1, m[3]);
                case 'DD/MM/YY':
                    return new Date(guessTwoDigitYear(m[4]), m[3] - 1, m[1]);
                case 'MMM-DD-YYYY':
                    return new Date(m[3], shortMonthKey[m[1]], m[2]);

                case 'YYYY-MM-DD HH:MM':
                    return new Date(
                        +m[1],
                        m[3] - 1,
                        +m[4],
                        hour(+m[5], m[8]),
                        +m[6] || 0,
                        +m[7] || 0
                    );
                case 'DD.MM.YYYY HH:MM':
                    return new Date(
                        +m[4],
                        m[3] - 1,
                        +m[1],
                        hour(+m[5], m[8]),
                        +m[6] || 0,
                        +m[7] || 0
                    );
                case 'MM/DD/YYYY HH:MM':
                    return new Date(
                        +m[4],
                        m[1] - 1,
                        +m[3],
                        hour(+m[5], m[8]),
                        +m[6] || 0,
                        +m[7] || 0
                    );

                case 'ISO8601':
                    return new Date(m.toUpperCase());

                default:
                    console.warn('unknown format', format);
            }
            errors++;
            return raw;
        },
        toNum: function (d) {
            return isDate(d) ? d.getTime() : Number.NaN;
        },
        fromNum: function (i) {
            return new Date(i);
        },
        errors: function () {
            return errors;
        },
        name: function () {
            return 'date';
        },

        format: function (fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        },

        precision: function () {
            return knownFormats[format].precision;
        },

        isValid: function (val) {
            return isDate(type.parse(val));
        },

        ambiguousFormats: function () {
            var candidates = [];
            each(matches, function (cnt, fmt) {
                if (cnt === bestMatch[1]) {
                    candidates.push([fmt, fmt]); // key, label
                }
            });
            return candidates;
        }
    };
    return type;
}

var columnTypes = {
    text,
    number,
    date
};

const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
const defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

/**
 * Remove all non-whitelisted html tags from the given string
 *
 * @exports purifyHTML
 * @kind function
 *
 * @param {string} input - dirty html input
 * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
 * @return {string} - the cleaned html output
 */
function purifyHTML(input, allowed) {
    /*
     * written by Kevin van Zonneveld et.al.
     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
     */
    if (input === null) return null;
    if (input === undefined) return undefined;
    input = String(input);
    // pass if neither < or > exist in string
    if (input.indexOf('<') < 0 && input.indexOf('>') < 0) {
        return input;
    }
    input = stripTags(input, allowed);
    // remove all event attributes
    if (typeof document === 'undefined') return input;
    var d = document.createElement('div');

    d.innerHTML = `<span>${input}</span>`;
    // strip tags again, because `document.createElement()` closes unclosed tags and therefore
    // creates new elements that might not be allowed
    d.innerHTML = stripTags(
        d.innerHTML,
        allowed && !allowed.includes('<span>') ? allowed + '<span>' : allowed || undefined
    );
    var sel = d.childNodes[0].querySelectorAll('*');
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].nodeName.toLowerCase() === 'a') {
            // special treatment for <a> elements
            if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
            const hrefNormalized = (sel[i].getAttribute('href') || '')
                .toLowerCase()
                // remove invalid uri characters
                .replace(/[^a-z0-9 -/:?=]/g, '')
                .trim();
            if (
                hrefNormalized.startsWith('javascript:') ||
                hrefNormalized.startsWith('vbscript:') ||
                hrefNormalized.startsWith('data:')
            ) {
                // remove entire href to be safe
                sel[i].setAttribute('href', '');
            }
        }
        const removeAttrs = [];
        for (var j = 0; j < sel[i].attributes.length; j++) {
            var attrib = sel[i].attributes[j];
            if (attrib.specified) {
                if (attrib.name.substr(0, 2) === 'on') removeAttrs.push(attrib.name);
            }
        }
        removeAttrs.forEach(attr => sel[i].removeAttribute(attr));
    }
    return d.childNodes[0].innerHTML;
}

function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (
        ((allowed !== undefined ? allowed || '' : defaultAllowed) + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || []
    ).join('');

    var before = input;
    var after = input;
    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
    // eslint-disable-next-line no-constant-condition
    while (true) {
        before = after;
        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
        // return once no more tags are removed
        if (before === after) {
            return after;
        }
    }
}

/*
 * column abstracts the functionality of each column
 * of a dataset. A column has a type (text|number|date).
 *
 * API:
 *
 * column.name() ... returns the name (string)
 * column.type() ... return column type (string)
 * column.length ... number of rows (number)
 * column.val(i) ... parsed value in row i
 * column.each(func) ... apply function to each value
 * column.raw() ... access raw, unparsed values
 *
 */

/**
 * @class dw.Column
 */
function Column(name, rows, type) {
    function notEmpty(d) {
        return d !== null && d !== undefined && d !== '';
    }

    function guessType(sample) {
        if (every(rows, isNumber)) return columnTypes.number();
        if (every(rows, isDate)) return columnTypes.date();
        // guessing column type by counting parsing errors
        // for every known type
        const types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
        let type;
        const tolerance = 0.1 * rows.filter(notEmpty).length; // allowing 10% mis-parsed values

        each(rows, function (val) {
            each(types, function (t) {
                t.parse(val);
            });
        });
        every(types, function (t) {
            if (t.errors() < tolerance) type = t;
            return !type;
        });
        if (isUndefined(type)) type = types[2]; // default to text;
        return type;
    }

    // we pick random 200 non-empty values for column type testing
    const sample = shuffle(range(rows.length))
        .filter(function (i) {
            return notEmpty(rows[i]);
        })
        .slice(0, 200)
        .map(function (i) {
            return rows[i];
        });

    type = type ? columnTypes[type](sample) : guessType(sample);

    let origName = name;
    let valueRange, sum, mean, median;
    const origRows = rows.slice(0);
    let title;

    // public interface
    var column = {
        // column name (used for reference in chart metadata)
        name() {
            if (arguments.length >= 1) {
                name = arguments[0];
                if (arguments.length === 2) {
                    origName = arguments[1];
                } else {
                    origName = name;
                }
                return column;
            }
            return purifyHTML(name);
        },

        origName() {
            return purifyHTML(origName);
        },

        // column title (used for presentation)
        title() {
            if (arguments.length) {
                title = arguments[0];
                return column;
            }
            return purifyHTML(title || name);
        },

        /**
         * number of rows
         */
        length: rows.length,

        /**
         * returns ith row of the col, parsed
         *
         * @param i
         * @param unfiltered  if set to true, precedent calls of filterRows are ignored
         */
        val(i, unfiltered) {
            if (!arguments.length) return undefined;
            var r = unfiltered ? origRows : rows;
            if (i < 0) i += r.length;
            return type.parse(isDate(r[i]) || isNumber(r[i]) ? r[i] : purifyHTML(r[i]));
        },

        /**
         * returns an array of formatted values
         *
         * @param {string} [opt.numeral=null] -- format numbers using this Numeral.js instance
         */
        formatted(numeral = null) {
            if (numeral && this.type() === 'number') {
                return this.values().map(val => {
                    if (Number.isFinite(val)) {
                        return numeral(val).format('0.[00000000000000000000]');
                    }
                    // When the value is null, undefined, NaN, Infinity, or when parsing failed.
                    return val;
                });
            }
            return this.raw();
        },

        /**
         * returns an array of parsed values
         */
        values(unfiltered) {
            var r = unfiltered ? origRows : rows;
            r = map(r, function (d) {
                return isDate(d) || isNumber(d) ? d : purifyHTML(d);
            });
            return map(r, type.parse);
        },

        /**
         * apply function to each value
         */
        each(f) {
            for (var i = 0; i < rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw(i, val) {
            if (!arguments.length)
                return rows.map(d => (isDate(d) || isNumber(d) ? d : purifyHTML(d)));
            if (arguments.length === 2) {
                rows[i] = val;
                return column;
            }
            return isDate(rows[i]) || isNumber(rows[i]) ? rows[i] : purifyHTML(rows[i]);
        },

        /**
         * if called with no arguments, this returns the column type name
         * if called with true as argument, this returns the column type (as object)
         * if called with a string as argument, this sets a new column type
         */
        type(o) {
            if (o === true) return type;
            if (isString(o)) {
                if (columnTypes[o]) {
                    type = columnTypes[o](sample);
                    return column;
                } else {
                    throw new Error('unknown column type: ' + o);
                }
            }
            return type.name();
        },

        // [min,max] range
        range() {
            if (!type.toNum) return false;
            if (!valueRange) {
                valueRange = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function (v) {
                    v = type.toNum(v);
                    if (!isNumber(v) || isNaN$1(v)) return;
                    if (v < valueRange[0]) valueRange[0] = v;
                    if (v > valueRange[1]) valueRange[1] = v;
                });
                valueRange[0] = type.fromNum(valueRange[0]);
                valueRange[1] = type.fromNum(valueRange[1]);
            }
            return valueRange;
        },
        // sum of values
        sum() {
            if (!type.toNum) return false;
            if (sum === undefined) {
                sum = 0;
                column.each(function (v) {
                    const n = type.toNum(v);
                    if (Number.isFinite(n)) {
                        sum += n;
                    }
                });
                sum = type.fromNum(sum);
            }
            return sum;
        },

        mean() {
            if (!type.toNum) return false;
            if (mean === undefined) {
                mean = 0;
                let count = 0;
                column.each(function (v) {
                    const n = type.toNum(v);
                    if (Number.isFinite(n)) {
                        mean += n;
                        count++;
                    }
                });
                mean = type.fromNum(mean / count);
            }
            return mean;
        },

        median() {
            if (!type.toNum) return false;
            if (median === undefined) {
                const arr = column.values().map(type.toNum);
                median = type.fromNum(d3Median(arr));
            }
            return median;
        },

        // remove rows from column, keep those whose index
        // is within @r
        filterRows(r) {
            rows = [];
            if (arguments.length) {
                each(r, function (i) {
                    rows.push(origRows[i]);
                });
            } else {
                rows = origRows.slice(0);
            }
            column.length = rows.length;
            // invalidate valueRange and total
            valueRange = sum = mean = median = undefined;
            return column;
        },

        deleteRow(i) {
            const deletedRows = rows.splice(i, 1);
            origRows.splice(i, 1);
            column.length = rows.length;
            // invalidate valueRange and total
            valueRange = sum = mean = median = undefined;
            return deletedRows;
        },

        toString() {
            return name + ' (' + type.name() + ')';
        },

        indexOf(val) {
            return find(range(rows.length), function (i) {
                return column.val(i) === val;
            });
        },

        limitRows(numRows) {
            if (origRows.length > numRows) {
                origRows.length = numRows;
                rows.length = numRows;
                column.length = numRows;
            }
        },

        /**
         * add one or more new rows
         * @param {...*} values
         */
        add(...values) {
            origRows.push(...values);
            rows.push(...values);
            column.length = rows.length;
        },

        /**
         * create a copy of the column
         * @returns {dw.Column}
         */
        clone() {
            return Column(name, rows.slice(), type.name());
        },

        /**
         * delete all rows
         */
        clear() {
            rows.splice(0);
            column.length = rows.length;
        }
    };
    // backwards compatibility
    column.total = column.sum;
    return column;
}

// some d3 stuff
function d3Median(array) {
    var numbers = [];
    var n = array.length;
    var a;
    var i = -1;
    if (arguments.length === 1) {
        while (++i < n) if (d3Numeric((a = d3Number(array[i])))) numbers.push(a);
    }
    if (numbers.length) return d3Quantile(numbers.sort(d3Ascending), 0.5);
}
function d3Quantile(values, p) {
    var H = (values.length - 1) * p + 1;
    var h = Math.floor(H);
    var v = +values[h - 1];
    var e = H - h;
    return e ? v + e * (values[h] - v) : v;
}
function d3Number(x) {
    return x === null ? NaN : +x;
}
function d3Numeric(x) {
    return !isNaN$1(x);
}
function d3Ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

/*
 * dataset source for delimited files (CSV, TSV, ...)
 */

function delimited(opts) {
    function loadAndParseCsv() {
        if (opts.url) {
            const ts = new Date().getTime();
            const url = `${opts.url}${opts.url.indexOf('?') > -1 ? '&' : '?'}v=${
                opts.url.indexOf('//static.dwcdn.net') > -1 ? ts - (ts % 60000) : ts
            }`;
            return window
                .fetch(url)
                .then(res => res.text())
                .then(raw => {
                    return new DelimitedParser(opts).parse(raw);
                });
        } else if (opts.csv || opts.csv === '') {
            const dfd = new Promise(resolve => {
                resolve(opts.csv);
            });
            const parsed = dfd.then(raw => {
                return new DelimitedParser(opts).parse(raw);
            });
            return parsed;
        }
        const err = new Error('You need to provide either a URL or CSV data');
        return Promise.reject(err);
    }

    return {
        dataset: function () {
            return loadAndParseCsv().catch(e => {
                console.error(
                    `Could not fetch delimited data source for chart ${opts.chartId}, ` +
                        `returning an empty dataset: ${e.message}`
                );
                return Dataset([]);
            });
        },
        parse: function () {
            return new DelimitedParser(opts).parse(opts.csv);
        }
    };
}

Dataset.delimited = delimited;

class DelimitedParser {
    constructor(opts) {
        opts = Object.assign(
            {
                delimiter: 'auto',
                quoteChar: '"',
                skipRows: 0,
                emptyValue: null,
                transpose: false,
                firstRowIsHeader: true
            },
            opts
        );

        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
        this.opts = opts;
    }

    parse(data) {
        this.__rawData = data;
        const opts = this.opts;

        if (opts.delimiter === 'auto') {
            opts.delimiter = this.guessDelimiter(data, opts.skipRows);
            this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
        }
        const closure = opts.delimiter !== '|' ? '|' : '#';
        let arrData;

        data = closure + '\n' + data.replace(/[ \r\n\f]+$/g, '').replace(/^\uFEFF/, '') + closure;

        function parseCSV(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = strDelimiter || ',';

            // Create an array to hold our data. Give the array
            // a default empty first row.
            const arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            let arrMatches = null;
            let strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while ((arrMatches = delimiterPattern.exec(strData))) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
                } else {
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(
                    strMatchedValue === undefined ? '' : strMatchedValue
                );
            }

            // remove closure
            if (arrData[0][0].substr(0, 1) === closure) {
                arrData[0][0] = arrData[0][0].substr(1);
            }
            const p = arrData.length - 1;
            const q = arrData[p].length - 1;
            const r = arrData[p][q].length - 1;
            if (arrData[p][q].substr(r) === closure) {
                arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return arrData.slice(1);
        } // end parseCSV

        function transpose(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            const a = arrMatrix;
            const w = a.length ? a.length : 0;
            const h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
                return [];
            }
            let i, j;
            const t = [];
            for (i = 0; i < h; i++) {
                t[i] = [];
                for (j = 0; j < w; j++) {
                    t[i][j] = a[j][i];
                }
            }
            return t;
        }

        function makeColumns(arrData) {
            if (!arrData) {
                return [];
            }
            arrData = arrData.slice(opts.skipRows);
            if (!arrData.length) {
                return [];
            }

            // compute series
            const firstRow = arrData[0];
            const columnNames = {};
            let srcColumns = [];
            let rowIndex = 0;
            if (opts.firstRowIsHeader) {
                srcColumns = arrData[rowIndex];
                rowIndex++;
                arrData.shift();
            }

            return firstRow.map((_, i) => {
                const data = arrData.map(row => (row[i] !== '' ? row[i] : opts.emptyValue));
                let col = isString(srcColumns[i]) ? srcColumns[i].replace(/^\s+|\s+$/g, '') : '';
                let suffix = col !== '' ? '' : 1;
                col = col !== '' ? col : 'X.';
                while (columnNames[col + suffix] !== undefined) {
                    suffix = suffix === '' ? 1 : suffix + 1;
                }
                columnNames[col + suffix] = true;
                return Column(col + suffix, data);
            });
        }

        function makeDataset(arrData) {
            const columns = makeColumns(arrData);
            return Dataset(columns);
        }

        arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
        if (opts.transpose) {
            arrData = transpose(arrData);
        }
        return makeDataset(trimArrayData(arrData));
    } // end parse

    guessDelimiter(strData) {
        // find delimiter which occurs most often
        let maxMatchCount = 0;
        let k = -1;
        const me = this;
        const delimiters = ['\t', ';', '|', ','];
        delimiters.forEach((delimiter, i) => {
            const regex = getDelimiterPatterns(delimiter, me.quoteChar);
            let c = strData.match(regex).length;
            if (delimiter === '\t') c *= 1.15; // give tab delimiters more weight
            if (c > maxMatchCount) {
                maxMatchCount = c;
                k = i;
            }
        });
        return delimiters[k];
    }
}

function getDelimiterPatterns(delimiter, quoteChar) {
    return new RegExp(
        // Delimiters.
        '(\\' +
            delimiter +
            '|\\r?\\n|\\r|^)' +
            // Quoted fields.
            '(?:' +
            quoteChar +
            '([^' +
            quoteChar +
            ']*(?:' +
            quoteChar +
            '"[^' +
            quoteChar +
            ']*)*)' +
            quoteChar +
            '|' +
            // Standard fields.
            '([^' +
            quoteChar +
            '\\' +
            delimiter +
            '\\r\\n]*))',
        'gi'
    );
}

function trimArrayData(arrData) {
    for (let i = arrData.length - 1; i >= 0; i--) {
        if (arrData[i].some(col => col !== '')) {
            return arrData.slice(0, i + 1);
        }
    }
    return arrData.slice(0, 1);
}

/*
 * dataset source for JSON data
 */
function json(opts) {
    function loadAndParseJSON() {
        if (opts.url) {
            return fetch(opts.url)
                .then(res => res.text())
                .then(raw => {
                    return JSON.parse(raw);
                });
        } else if (opts.csv) {
            const dfd = new Promise(resolve => {
                resolve(opts.csv);
            });
            const parsed = dfd.then(raw => {
                return JSON.parse(raw);
            });
            return parsed;
        }
        const err = new Error('You need to provide either a URL or CSV data');
        return Promise.reject(err);
    }

    return {
        dataset: function () {
            return loadAndParseJSON().catch(e => {
                console.error(
                    `Could not fetch JSON data source for chart ${opts.chartId}, ` +
                        `returning an empty object: ${e.message}`
                );
                return {};
            });
        },
        parse: function () {
            return JSON.parse(opts.csv);
        }
    };
}

Dataset.json = json;

/**
 * returns the length of the "tail" of a number, meaning the
 * number of meaningful decimal places
 *
 * @exports tailLength
 * @kind function
 *
 * @example
 * // returns 3
 * tailLength(3.123)
 *
 * @example
 * // returns 2
 * tailLength(3.12999999)
 *
 * @param {number} value
 * @returns {number}
 */
function tailLength(value) {
    return Math.max(
        0,
        String(value - Math.floor(value))
            .replace(/00000*[0-9]+$/, '')
            .replace(/33333*[0-9]+$/, '')
            .replace(/99999*[0-9]+$/, '').length - 2
    );
}

/**
 * rounds a value to a certain number of decimals
 *
 * @exports round
 * @kind function
 *
 * @example
 * import round from '@datawrapper/shared/round';
 * round(1.2345); // 1
 * round(1.2345, 2); // 1.23
 * round(12345, -2); // 12300
 *
 * @param {number} value - the value to be rounded
 * @param {number} decimals - the number of decimals
 * @returns {number} - rounded value
 */
function round(value, decimals = 0) {
    const base = Math.pow(10, decimals);
    return Math.round(value * base) / base;
}

/**
 * computes the significant dimension for a list of numbers
 * That's the number of decimals to which we can round the numbers
 * without loosing information
 *
 * @exports significantDimension
 * @kind function
 *
 * @example
 * import {significantDimension} from '@datawrapper/shared/significantDimension';
 * significantDimension([0,10,20,30]); // -1
 *
 * @param {number[]} values - list of input numbers
 * @param {number} tolerance - percent of input values that we allow to "collide"
 * @returns {number} - number of significant dimensions (= the number of decimals)
 */
function significantDimension(values, tolerance = 0.1) {
    let result = [];
    let decimals = 0;
    const uniqValues = uniq(values.filter(isFinite$1));
    const totalUniq = uniqValues.length;
    let check, diff;

    const accepted = Math.floor(totalUniq * (1 - tolerance));

    if (uniqValues.length < 3) {
        // special case if there are only 2 unique values
        return Math.round(
            uniqValues.reduce(function (acc, cur) {
                if (!cur) return acc;
                const exp = Math.log(Math.abs(cur)) / Math.LN10;
                if (exp < 8 && exp > -3) {
                    // use tail length for normal numbers
                    return acc + Math.min(3, tailLength(uniqValues[0]));
                } else {
                    return acc + (exp > 0 ? (exp - 1) * -1 : exp * -1);
                }
            }, 0) / uniqValues.length
        );
    }

    if (uniq(uniqValues.map(currentRound)).length > accepted) {
        // we seem to have enough precision, but maybe it's too much?
        check = function () {
            return uniq(result).length === totalUniq;
        };
        diff = -1;
    } else {
        // if we end up here it means we're loosing too much information
        // due to rounding, we need to increase precision
        check = function () {
            return uniq(result).length <= accepted;
        };
        diff = +1;
    }
    let maxIter = 100;
    do {
        result = uniqValues.map(currentRound);
        decimals += diff;
    } while (check() && maxIter-- > 0);
    if (maxIter < 10) {
        console.warn('maximum iteration reached', values, result, decimals);
    }
    if (diff < 0) decimals += 2;
    else decimals--;
    /* rounds to the current number of decimals */
    function currentRound(v) {
        return round(v, decimals);
    }
    return decimals;
}

/**
 * rounds an array of numbers to the least number of decimals
 * without loosing any information due to the rounding
 *
 * @exports smartRound
 * @kind function
 *
 * @example
 * import {smartRound} from '@datawrapper/shared/smartRound';
 * smartRound([9, 10.5714, 12.1428, 13.7142]); // [9, 11, 12, 14]
 * smartRound([9, 10.5714, 12.1428, 12.4142]); // [9, 10.6, 12.1, 12.4]
 *
 * @param {array} values - the numbers to be rounded
 * @param {number} addPrecision - force more precision (=numbers of decimals) to the rounding
 * @param {number} tolerance - the percent of uniq input values that we can tolerate to lose after rounding
 * @returns the rounded values
 */
function smartRound(values, addPrecision = 0, tolerance = 0.1) {
    let dim = significantDimension(values, tolerance);
    dim += addPrecision;
    return values.map(v => round(v, dim));
}

/**
 * returns true if two numeric values are close enough
 *
 * @exports equalish
 * @kind function
 *
 * @param {number} a
 * @param {number} b
 *
 * @example
 * // returns true
 * equalish(0.333333, 1/3)
 *
 * @example
 * // returns false
 * equalish(0.333, 1/3)
 *
 * @export
 * @returns {boolean}
 */
function equalish(a, b) {
    return Math.abs(a - b) < 1e-6;
}

/**
 * Clones an object
 *
 * @exports clone
 * @kind function
 *
 * @param {*} object - the thing that should be cloned
 * @returns {*} - the cloned thing
 */
function clone(o) {
    if (!o || typeof o !== 'object') return o;
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}

function outerHeight(element, withMargin = false) {
    if (!element) return null;
    let height = element.offsetHeight;
    if (!withMargin) return height;
    var style = getComputedStyle(element);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

function getNonChartHeight() {
    let h = 0;

    const chart = document.querySelector('.dw-chart');
    for (let i = 0; i < chart.children.length; i++) {
        const el = chart.children[i];
        const tagName = el.tagName.toLowerCase();
        if (
            tagName !== 'script' &&
            tagName !== 'style' &&
            el.id !== 'chart' &&
            !hasClass(el, 'tooltip') &&
            !hasClass(el, 'vg-tooltip') &&
            !hasClass(el, 'hidden') &&
            !hasClass(el, 'sr-only') &&
            !hasClass(el, 'qtip') &&
            !hasClass(el, 'container') &&
            !hasClass(el, 'noscript') &&
            !hasClass(el, 'hidden') &&
            !hasClass(el, 'dw-after-body') &&
            !hasClass(el, 'dw-chart-body')
        ) {
            h += Number(outerHeight(el, true));

            if (hasClass(el, 'dw-chart-header')) {
                const filter = el.querySelector('.filter-ui');
                if (filter) h -= Number(outerHeight(filter, true));
            }
        }
    }

    function hasClass(el, className) {
        return el.classList.contains(className);
    }

    function getProp(selector, property) {
        return getComputedStyle(document.querySelector(selector))[property].replace('px', '');
    }

    const selectors = ['.dw-chart', '.dw-chart-body', 'body'];
    const properties = [
        'padding-top',
        'padding-bottom',
        'margin-top',
        'margin-bottom',
        'border-top-width',
        'border-bottom-width'
    ];

    selectors.forEach(function (sel) {
        properties.forEach(function (prop) {
            h += Number(getProp(sel, prop));
        });
    });

    return h;
}

var TEOF = 'TEOF';
var TOP = 'TOP';
var TNUMBER = 'TNUMBER';
var TSTRING = 'TSTRING';
var TPAREN = 'TPAREN';
var TBRACKET = 'TBRACKET';
var TCOMMA = 'TCOMMA';
var TNAME = 'TNAME';
var TSEMICOLON = 'TSEMICOLON';

function Token(type, value, index) {
  this.type = type;
  this.value = value;
  this.index = index;
}

Token.prototype.toString = function () {
  return this.type + ': ' + this.value;
};

function TokenStream(parser, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser.unaryOps;
  this.binaryOps = parser.binaryOps;
  this.ternaryOps = parser.ternaryOps;
  this.consts = parser.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser.options;
  this.parser = parser;
}

TokenStream.prototype.newToken = function (type, value, pos) {
  return new Token(type, value, pos != null ? pos : this.pos);
};

TokenStream.prototype.save = function () {
  this.savedPosition = this.pos;
  this.savedCurrent = this.current;
};

TokenStream.prototype.restore = function () {
  this.pos = this.savedPosition;
  this.current = this.savedCurrent;
};

TokenStream.prototype.next = function () {
  if (this.pos >= this.expression.length) {
    return this.newToken(TEOF, 'EOF');
  }

  if (this.isWhitespace() || this.isComment()) {
    return this.next();
  } else if (
    this.isRadixInteger() ||
    this.isNumber() ||
    this.isOperator() ||
    this.isString() ||
    this.isParen() ||
    this.isBracket() ||
    this.isComma() ||
    this.isSemicolon() ||
    this.isNamedOp() ||
    this.isConst() ||
    this.isName()
  ) {
    return this.current;
  } else {
    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
  }
};

TokenStream.prototype.isString = function () {
  var r = false;
  var startPos = this.pos;
  var quote = this.expression.charAt(startPos);

  if (quote === "'" || quote === '"') {
    var index = this.expression.indexOf(quote, startPos + 1);
    while (index >= 0 && this.pos < this.expression.length) {
      this.pos = index + 1;
      if (this.expression.charAt(index - 1) !== '\\') {
        var rawString = this.expression.substring(startPos + 1, index);
        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
        r = true;
        break;
      }
      index = this.expression.indexOf(quote, index + 1);
    }
  }
  return r;
};

TokenStream.prototype.isParen = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '(' || c === ')') {
    this.current = this.newToken(TPAREN, c);
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isBracket = function () {
  var c = this.expression.charAt(this.pos);
  if ((c === '[' || c === ']') && this.isOperatorEnabled('[')) {
    this.current = this.newToken(TBRACKET, c);
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isComma = function () {
  var c = this.expression.charAt(this.pos);
  if (c === ',') {
    this.current = this.newToken(TCOMMA, ',');
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isSemicolon = function () {
  var c = this.expression.charAt(this.pos);
  if (c === ';') {
    this.current = this.newToken(TSEMICOLON, ';');
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isConst = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && c !== '.' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (str in this.consts) {
      this.current = this.newToken(TNUMBER, this.consts[str]);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isNamedOp = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
      this.current = this.newToken(TOP, str);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isName = function () {
  var startPos = this.pos;
  var i = startPos;
  var hasLetter = false;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos && (c === '$' || c === '_')) {
        if (c === '_') {
          hasLetter = true;
        }
        continue;
      } else if (i === this.pos || !hasLetter || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    } else {
      hasLetter = true;
    }
  }
  if (hasLetter) {
    var str = this.expression.substring(startPos, i);
    this.current = this.newToken(TNAME, str);
    this.pos += str.length;
    return true;
  }
  return false;
};

TokenStream.prototype.isWhitespace = function () {
  var r = false;
  var c = this.expression.charAt(this.pos);
  while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
    r = true;
    this.pos++;
    if (this.pos >= this.expression.length) {
      break;
    }
    c = this.expression.charAt(this.pos);
  }
  return r;
};

var codePointPattern = /^[0-9a-f]{4}$/i;

TokenStream.prototype.unescape = function (v) {
  var index = v.indexOf('\\');
  if (index < 0) {
    return v;
  }

  var buffer = v.substring(0, index);
  while (index >= 0) {
    var c = v.charAt(++index);
    switch (c) {
      case "'":
        buffer += "'";
        break;
      case '"':
        buffer += '"';
        break;
      case '\\':
        buffer += '\\';
        break;
      case '/':
        buffer += '/';
        break;
      case 'b':
        buffer += '\b';
        break;
      case 'f':
        buffer += '\f';
        break;
      case 'n':
        buffer += '\n';
        break;
      case 'r':
        buffer += '\r';
        break;
      case 't':
        buffer += '\t';
        break;
      case 'u':
        // interpret the following 4 characters as the hex of the unicode code point
        var codePoint = v.substring(index + 1, index + 5);
        if (!codePointPattern.test(codePoint)) {
          this.parseError('Illegal escape sequence: \\u' + codePoint);
        }
        buffer += String.fromCharCode(parseInt(codePoint, 16));
        index += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
    }
    ++index;
    var backslash = v.indexOf('\\', index);
    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
    index = backslash;
  }

  return buffer;
};

TokenStream.prototype.isComment = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
    this.pos = this.expression.indexOf('*/', this.pos) + 2;
    if (this.pos === 1) {
      this.pos = this.expression.length;
    }
    return true;
  }
  return false;
};

TokenStream.prototype.isRadixInteger = function () {
  var pos = this.pos;

  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
    return false;
  }
  ++pos;

  var radix;
  var validDigit;
  if (this.expression.charAt(pos) === 'x') {
    radix = 16;
    validDigit = /^[0-9a-f]$/i;
    ++pos;
  } else if (this.expression.charAt(pos) === 'b') {
    radix = 2;
    validDigit = /^[01]$/i;
    ++pos;
  } else {
    return false;
  }

  var valid = false;
  var startPos = pos;

  while (pos < this.expression.length) {
    var c = this.expression.charAt(pos);
    if (validDigit.test(c)) {
      pos++;
      valid = true;
    } else {
      break;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
    this.pos = pos;
  }
  return valid;
};

TokenStream.prototype.isNumber = function () {
  var valid = false;
  var pos = this.pos;
  var startPos = pos;
  var resetPos = pos;
  var foundDot = false;
  var foundDigits = false;
  var c;

  while (pos < this.expression.length) {
    c = this.expression.charAt(pos);
    if ((c >= '0' && c <= '9') || (!foundDot && c === '.')) {
      if (c === '.') {
        foundDot = true;
      } else {
        foundDigits = true;
      }
      pos++;
      valid = foundDigits;
    } else {
      break;
    }
  }

  if (valid) {
    resetPos = pos;
  }

  if (c === 'e' || c === 'E') {
    pos++;
    var acceptSign = true;
    var validExponent = false;
    while (pos < this.expression.length) {
      c = this.expression.charAt(pos);
      if (acceptSign && (c === '+' || c === '-')) {
        acceptSign = false;
      } else if (c >= '0' && c <= '9') {
        validExponent = true;
        acceptSign = false;
      } else {
        break;
      }
      pos++;
    }

    if (!validExponent) {
      pos = resetPos;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
    this.pos = pos;
  } else {
    this.pos = resetPos;
  }
  return valid;
};

TokenStream.prototype.isOperator = function () {
  var startPos = this.pos;
  var c = this.expression.charAt(this.pos);

  if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
    this.current = this.newToken(TOP, c);
  } else if (c === '∙' || c === '•') {
    this.current = this.newToken(TOP, '*');
  } else if (c === '>') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '>=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '>');
    }
  } else if (c === '<') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '<=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '<');
    }
  } else if (c === '|') {
    if (this.expression.charAt(this.pos + 1) === '|') {
      this.current = this.newToken(TOP, '||');
      this.pos++;
    } else {
      return false;
    }
  } else if (c === '=') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '==');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else if (c === '!') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '!=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else {
    return false;
  }
  this.pos++;

  if (this.isOperatorEnabled(this.current.value)) {
    return true;
  } else {
    this.pos = startPos;
    return false;
  }
};

TokenStream.prototype.isOperatorEnabled = function (op) {
  return this.parser.isOperatorEnabled(op);
};

TokenStream.prototype.getCoordinates = function () {
  var line = 0;
  var column;
  var newline = -1;
  do {
    line++;
    column = this.pos - newline;
    newline = this.expression.indexOf('\n', newline + 1);
  } while (newline >= 0 && newline < this.pos);

  return {
    line: line,
    column: column
  };
};

TokenStream.prototype.parseError = function (msg) {
  var coords = this.getCoordinates();
  throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
};

var INUMBER = 'INUMBER';
var IOP1 = 'IOP1';
var IOP2 = 'IOP2';
var IOP3 = 'IOP3';
var IVAR = 'IVAR';
var IVARNAME = 'IVARNAME';
var IFUNCALL = 'IFUNCALL';
var IFUNDEF = 'IFUNDEF';
var IEXPR = 'IEXPR';
var IEXPREVAL = 'IEXPREVAL';
var IMEMBER = 'IMEMBER';
var IENDSTATEMENT = 'IENDSTATEMENT';
var IARRAY = 'IARRAY';

function Instruction(type, value) {
  this.type = type;
  this.value = value !== undefined && value !== null ? value : 0;
}

Instruction.prototype.toString = function () {
  switch (this.type) {
    case INUMBER:
    case IOP1:
    case IOP2:
    case IOP3:
    case IVAR:
    case IVARNAME:
    case IENDSTATEMENT:
      return this.value;
    case IFUNCALL:
      return 'CALL ' + this.value;
    case IFUNDEF:
      return 'DEF ' + this.value;
    case IARRAY:
      return 'ARRAY ' + this.value;
    case IMEMBER:
      return '.' + this.value;
    default:
      return 'Invalid Instruction';
  }
};

function unaryInstruction(value) {
  return new Instruction(IOP1, value);
}

function binaryInstruction(value) {
  return new Instruction(IOP2, value);
}

function ternaryInstruction(value) {
  return new Instruction(IOP3, value);
}

function contains(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}

function ParserState(parser, tokenStream, options) {
  this.parser = parser;
  this.tokens = tokenStream;
  this.current = null;
  this.nextToken = null;
  this.next();
  this.savedCurrent = null;
  this.savedNextToken = null;
  this.allowMemberAccess = options.allowMemberAccess !== false;
  this.restrictMemberAccess = new Set(options.restrictMemberAccess || []);
}

ParserState.prototype.next = function () {
  this.current = this.nextToken;
  return (this.nextToken = this.tokens.next());
};

ParserState.prototype.tokenMatches = function (token, value) {
  if (typeof value === 'undefined') {
    return true;
  } else if (Array.isArray(value)) {
    return contains(value, token.value);
  } else if (typeof value === 'function') {
    return value(token);
  } else {
    return token.value === value;
  }
};

ParserState.prototype.save = function () {
  this.savedCurrent = this.current;
  this.savedNextToken = this.nextToken;
  this.tokens.save();
};

ParserState.prototype.restore = function () {
  this.tokens.restore();
  this.current = this.savedCurrent;
  this.nextToken = this.savedNextToken;
};

ParserState.prototype.accept = function (type, value) {
  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
    this.next();
    return true;
  }
  return false;
};

ParserState.prototype.expect = function (type, value) {
  if (!this.accept(type, value)) {
    var coords = this.tokens.getCoordinates();
    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
  }
};

ParserState.prototype.parseAtom = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
    instr.push(new Instruction(IVAR, this.current.value));
  } else if (this.accept(TNUMBER)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TSTRING)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TPAREN, '(')) {
    this.parseExpression(instr);
    this.expect(TPAREN, ')');
  } else if (this.accept(TBRACKET, '[')) {
    if (this.accept(TBRACKET, ']')) {
      instr.push(new Instruction(IARRAY, 0));
    } else {
      var argCount = this.parseArrayList(instr);
      instr.push(new Instruction(IARRAY, argCount));
    }
  } else {
    throw new Error('unexpected ' + this.nextToken);
  }
};

ParserState.prototype.parseExpression = function (instr) {
  var exprInstr = [];
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.parseVariableAssignmentExpression(exprInstr);
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.pushExpression(instr, exprInstr);
};

ParserState.prototype.pushExpression = function (instr, exprInstr) {
  for (var i = 0, len = exprInstr.length; i < len; i++) {
    instr.push(exprInstr[i]);
  }
};

ParserState.prototype.parseUntilEndStatement = function (instr, exprInstr) {
  if (!this.accept(TSEMICOLON)) return false;
  if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
    exprInstr.push(new Instruction(IENDSTATEMENT));
  }
  if (this.nextToken.type !== TEOF) {
    this.parseExpression(exprInstr);
  }
  instr.push(new Instruction(IEXPR, exprInstr));
  return true;
};

ParserState.prototype.parseArrayList = function (instr) {
  var argCount = 0;

  while (!this.accept(TBRACKET, ']')) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }

  return argCount;
};

ParserState.prototype.parseVariableAssignmentExpression = function (instr) {
  this.parseConditionalExpression(instr);
  while (this.accept(TOP, '=')) {
    var varName = instr.pop();
    var varValue = [];
    var lastInstrIndex = instr.length - 1;
    if (varName.type === IFUNCALL) {
      if (!this.tokens.isOperatorEnabled('()=')) {
        throw new Error('function definition is not permitted');
      }
      for (var i = 0, len = varName.value + 1; i < len; i++) {
        var index = lastInstrIndex - i;
        if (instr[index].type === IVAR) {
          instr[index] = new Instruction(IVARNAME, instr[index].value);
        }
      }
      this.parseVariableAssignmentExpression(varValue);
      instr.push(new Instruction(IEXPR, varValue));
      instr.push(new Instruction(IFUNDEF, varName.value));
      continue;
    }
    if (varName.type !== IVAR && varName.type !== IMEMBER) {
      throw new Error('expected variable for assignment');
    }
    this.parseVariableAssignmentExpression(varValue);
    instr.push(new Instruction(IVARNAME, varName.value));
    instr.push(new Instruction(IEXPR, varValue));
    instr.push(binaryInstruction('='));
  }
};

ParserState.prototype.parseConditionalExpression = function (instr) {
  this.parseOrExpression(instr);
  while (this.accept(TOP, '?')) {
    var trueBranch = [];
    var falseBranch = [];
    this.parseConditionalExpression(trueBranch);
    this.expect(TOP, ':');
    this.parseConditionalExpression(falseBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(ternaryInstruction('?'));
  }
};

ParserState.prototype.parseOrExpression = function (instr) {
  this.parseAndExpression(instr);
  while (this.accept(TOP, 'or')) {
    var falseBranch = [];
    this.parseAndExpression(falseBranch);
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(binaryInstruction('or'));
  }
};

ParserState.prototype.parseAndExpression = function (instr) {
  this.parseComparison(instr);
  while (this.accept(TOP, 'and')) {
    var trueBranch = [];
    this.parseComparison(trueBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(binaryInstruction('and'));
  }
};

var COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];

ParserState.prototype.parseComparison = function (instr) {
  this.parseAddSub(instr);
  while (this.accept(TOP, COMPARISON_OPERATORS)) {
    var op = this.current;
    this.parseAddSub(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var ADD_SUB_OPERATORS = ['+', '-', '||'];

ParserState.prototype.parseAddSub = function (instr) {
  this.parseTerm(instr);
  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
    var op = this.current;
    this.parseTerm(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var TERM_OPERATORS = ['*', '/', '%'];

ParserState.prototype.parseTerm = function (instr) {
  this.parseFactor(instr);
  while (this.accept(TOP, TERM_OPERATORS)) {
    var op = this.current;
    this.parseFactor(instr);
    instr.push(binaryInstruction(op.value));
  }
};

ParserState.prototype.parseFactor = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  this.save();
  if (this.accept(TOP, isPrefixOperator)) {
    if (this.current.value !== '-' && this.current.value !== '+') {
      if (this.nextToken.type === TPAREN && this.nextToken.value === '(') {
        this.restore();
        this.parseExponential(instr);
        return;
      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || (this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
        this.restore();
        this.parseAtom(instr);
        return;
      }
    }

    var op = this.current;
    this.parseFactor(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseExponential(instr);
  }
};

ParserState.prototype.parseExponential = function (instr) {
  this.parsePostfixExpression(instr);
  while (this.accept(TOP, '^')) {
    this.parseFactor(instr);
    instr.push(binaryInstruction('^'));
  }
};

ParserState.prototype.parsePostfixExpression = function (instr) {
  this.parseFunctionCall(instr);
  while (this.accept(TOP, '!')) {
    instr.push(unaryInstruction('!'));
  }
};

ParserState.prototype.parseFunctionCall = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  if (this.accept(TOP, isPrefixOperator)) {
    var op = this.current;
    this.parseAtom(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseMemberExpression(instr);
    while (this.accept(TPAREN, '(')) {
      if (this.accept(TPAREN, ')')) {
        instr.push(new Instruction(IFUNCALL, 0));
      } else {
        var argCount = this.parseArgumentList(instr);
        instr.push(new Instruction(IFUNCALL, argCount));
      }
    }
  }
};

ParserState.prototype.parseArgumentList = function (instr) {
  var argCount = 0;

  while (!this.accept(TPAREN, ')')) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }

  return argCount;
};

ParserState.prototype.parseMemberExpression = function (instr) {
  this.parseAtom(instr);
  while (this.accept(TOP, '.') || this.accept(TBRACKET, '[')) {
    var op = this.current;

    if (op.value === '.') {
      if (!this.allowMemberAccess) {
        throw new Error('unexpected ".", member access is not permitted');
      }
      if (this.restrictMemberAccess.has(this.nextToken.value)) {
        throw new Error('access to member "'+this.nextToken.value+'" is not permitted');
      }

      this.expect(TNAME);
      instr.push(new Instruction(IMEMBER, this.current.value));
    } else if (op.value === '[') {
      if (!this.tokens.isOperatorEnabled('[')) {
        throw new Error('unexpected "[]", arrays are disabled');
      }

      this.parseExpression(instr);
      this.expect(TBRACKET, ']');
      instr.push(binaryInstruction('['));
    } else {
      throw new Error('unexpected symbol: ' + op.value);
    }
  }
};

function add(a, b) {
  return Number(a) + Number(b);
}

function sub(a, b) {
  return a - b;
}

function mul(a, b) {
  return a * b;
}

function div(a, b) {
  return a / b;
}

function mod(a, b) {
  return a % b;
}

function equal(a, b) {
  return a === b;
}

function notEqual(a, b) {
  return a !== b;
}

function greaterThan(a, b) {
  return a > b;
}

function lessThan(a, b) {
  return a < b;
}

function greaterThanEqual(a, b) {
  return a >= b;
}

function lessThanEqual(a, b) {
  return a <= b;
}

function andOperator(a, b) {
  return Boolean(a && b);
}

function orOperator(a, b) {
  return Boolean(a || b);
}

function log10(a) {
  return Math.log(a) * Math.LOG10E;
}

function neg(a) {
  return -a;
}

function not(a) {
  return !a;
}

function trunc(a) {
  return a < 0 ? Math.ceil(a) : Math.floor(a);
}

function random(a) {
  return Math.random() * (a || 1);
}

function stringOrArrayLength(s) {
  if (Array.isArray(s)) {
    return s.length;
  }
  return String(s).length;
}

function condition(cond, yep, nope) {
  return cond ? yep : nope;
}

/**
 * Decimal adjustment of a number.
 * From @escopecz.
 *
 * @param {Number} value The number.
 * @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
 * @return {Number} The adjusted value.
 */
function roundTo(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = -+exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
}

function arrayIndex(array, index) {
  return array[index | 0];
}

function max(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}

function min(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.min.apply(Math, array);
  } else {
    return Math.min.apply(Math, arguments);
  }
}

function arrayMap(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to map is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to map is not an array');
  }
  return a.map(function (x, i) {
    return f(x, i);
  });
}

function arrayFold(f, init, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to fold is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to fold is not an array');
  }
  return a.reduce(function (acc, x, i) {
    return f(acc, x, i);
  }, init);
}

function arrayFilter(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to filter is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to filter is not an array');
  }
  return a.filter(function (x, i) {
    return f(x, i);
  });
}

function sign(x) {
  return (x > 0) - (x < 0) || +x;
}

function log1p(x) {
  return Math.log(1 + x);
}

function log2(x) {
  return Math.log(x) / Math.LN2;
}

function sum(array) {
  if (!Array.isArray(array)) {
    throw new Error('Sum argument is not an array');
  }

  return array.reduce(function (total, value) {
    return total + Number(value);
  }, 0);
}

function evaluate(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;

  if (isExpressionEvaluator(tokens)) {
    return resolveExpression(tokens, values);
  }

  var numTokens = tokens.length;

  for (var i = 0; i < numTokens; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === 'and') {
        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
      } else if (item.value === 'or') {
        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
      } else if (item.value === '=') {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
      }
    } else if (type === IVAR) {
      if (/^__proto__|prototype|constructor$/.test(item.value)) {
        throw new Error('prototype access detected');
      }
      if (item.value in expr.functions) {
        nstack.push(expr.functions[item.value]);
      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
        nstack.push(expr.unaryOps[item.value]);
      } else {
        var v = values[item.value];
        if (v !== undefined) {
          nstack.push(v);
        } else {
          throw new Error('undefined variable: ' + item.value);
        }
      }
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(resolveExpression(n1, values)));
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression(nstack.pop(), values));
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(f.apply(undefined, args));
      } else {
        throw new Error(f + ' is not a function');
      }
    } else if (type === IFUNDEF) {
      // Create closure to keep references to arguments and expression
      nstack.push(
        (function () {
          var n2 = nstack.pop();
          var args = [];
          var argCount = item.value;
          while (argCount-- > 0) {
            args.unshift(nstack.pop());
          }
          var n1 = nstack.pop();
          var f = function () {
            var scope = Object.assign({}, values);
            for (var i = 0, len = args.length; i < len; i++) {
              scope[args[i]] = arguments[i];
            }
            return evaluate(n2, expr, scope);
          };
          // f.name = n1
          Object.defineProperty(f, 'name', {
            value: n1,
            writable: false
          });
          values[n1] = f;
          return f;
        })()
      );
    } else if (type === IEXPR) {
      nstack.push(createExpressionEvaluator(item, expr));
    } else if (type === IEXPREVAL) {
      nstack.push(item);
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else if (type === IENDSTATEMENT) {
      nstack.pop();
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push(args);
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  // Explicitly return zero to avoid test issues caused by -0
  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
}

function createExpressionEvaluator(token, expr, values) {
  if (isExpressionEvaluator(token)) return token;
  return {
    type: IEXPREVAL,
    value: function (scope) {
      return evaluate(token.value, expr, scope);
    }
  };
}

function isExpressionEvaluator(n) {
  return n && n.type === IEXPREVAL;
}

function resolveExpression(n, values) {
  return isExpressionEvaluator(n) ? n.value(values) : n;
}

function Expression(tokens, parser) {
    this.tokens = tokens;
    this.parser = parser;
    this.unaryOps = parser.unaryOps;
    this.binaryOps = parser.binaryOps;
    this.ternaryOps = parser.ternaryOps;
    this.functions = parser.functions;
}

Expression.prototype.evaluate = function (values) {
    values = values || {};
    return evaluate(this.tokens, this, values);
};

Expression.prototype.variables = function () {
    return (this.tokens || []).filter(token => token.type === 'IVAR').map(token => token.value);
};

function trim(s) {
    return s.trim();
}

const RESTRICT_MEMBER_ACCESS = new Set(['__proto__', 'prototype', 'constructor']);

// parser
function Parser(options) {
    this.options = options || {};
    this.unaryOps = {
        /**
         * Sine (trigonometric function)
         *
         * @method SIN
         * @returns {number}
         * @example
         * SIN PI
         * SIN(PI)
         */
        SIN: Math.sin,
        /**
         * Cosine (trigonometric function)
         *
         * @method COS
         * @returns {number}
         * @example
         * COS PI
         * COS(PI)
         */
        COS: Math.cos,
        /**
         * Tangent (trigonometric function)
         *
         * @method TAN
         * @returns {number}
         * @example
         * TAN PI
         * TAN(PI)
         */
        TAN: Math.tan,
        /**
         * Arcus sine (inverse tigonometric function)
         *
         * @method ASIN
         * @returns {number}
         */
        ASIN: Math.asin,
        /**
         * Arcus cosine (inverse trigonometric function)
         *
         * @method ACOS
         * @returns {number}
         */
        ACOS: Math.acos,
        /**
         * Arcus tangent (inverse trigonometric function)
         *
         * @method ATAN
         * @returns {number}
         */
        ATAN: Math.atan,
        /**
         * Computes the square root
         *
         * @method SQRT
         * @returns {number}
         * @example
         * SQRT 9 // 3
         * SQRT(9) // 3
         */
        SQRT: Math.sqrt,
        /**
         * Returns the natural logarithm (base `e`) of a number
         *
         * @method LOG
         * @returns {number}
         * @example
         * LOG x
         */
        LOG: Math.log,
        /**
         * Returns the base 2 logarithm of a number
         *
         * @method LOG2
         * @returns {number}
         * @example
         * LOG2 8 // 3
         */
        LOG2: Math.log2 || log2,
        /**
         * Alias for {@link LOG}
         * @method LN
         * @returns {number}
         * @alias LOG
         */
        LN: Math.log,
        /**
         * Returns the base 10 logarithm of a number
         *
         * @method LOG10
         * @alias LG
         * @returns {number}
         * @example
         * LOG10 10 // 1
         * LOG10(100) // 2
         * LOG10(1000) // 3
         */
        LOG10: Math.log10 || log10,
        /**
         * Alias for {@link LOG10}
         * @method LG
         * @returns {number}
         * @alias LOG10
         */
        LG: Math.log10 || log10,
        LOG1P: Math.log1p || log1p,
        /**
         * Absolute number
         *
         * @method ABS
         * @example
         * ABS -10 // 10
         * @returns {number}
         */
        ABS: Math.abs,
        /**
         * Round number to next largest integer
         *
         * @method CEIL
         * @example
         * CEIL 2.3 // 3
         * CEIL(2.7) // 3
         * @returns {number}
         * @see {@link FLOOR}, {@link ROUND}, {@link TRUNC}
         */
        CEIL: Math.ceil,
        /**
         * Round number to the next smallest integer
         *
         * @method FLOOR
         * @example
         * FLOOR 2.3 // 2
         * FLOOR 2.7 // 2
         * FLOOR -5.05 // -6
         * @see {@link CEIL}, {@link ROUND}, {@link TRUNC}
         * @returns {number}
         */
        FLOOR: Math.floor,
        /**
         * Checks if an expression is NULL
         *
         * @method ISNULL
         * @example
         * ISNULL 0 // false
         * ISNULL NULL // true*
         * @returns {boolean}
         */
        ISNULL(a) {
            return a === null;
        },
        /**
         * Returns the integer part of a number by removing any fractional digits
         * @method TRUNC
         * @returns {number}
         * @see {@link CEIL}, {@link ROUND}, {@link FLOOR}
         * @example
         * TRUNC 5.05 // 5
         * TRUNC -5.05 // -5
         */
        TRUNC: Math.trunc || trunc,
        '-': neg,
        '+': Number,
        /**
         * Returns `e^x` where `e` is the Euler's number
         * @method EXP
         * @returns {number}
         * @example
         * LOG(EXP(4)) // 4
         */
        EXP: Math.exp,
        /**
         * Negates a boolean expression
         * @method NOT
         * @returns {boolean}
         * @example
         * NOT 3 > 5 // true
         */
        NOT: not,
        /**
         * Returns the length of an array or strng
         * @method LENGTH
         * @returns {number}
         * @example
         * LENGTH 'hello' // 5
         * LENGTH [1,2,3] // 3
         */
        LENGTH: stringOrArrayLength,
        /**
         * Alias for {@link NOT}
         * @method !
         * @alias NOT
         */
        '!': not,
        /**
         * returns either a positive or negative +/- 1, indicating the sign of a number passed
         * @example
         * SIGN 35 // 1
         * SIGN -6 // -1
         * @returns {number}
         */
        SIGN: Math.sign || sign,
        /**
         * Converts a value to a string
         * @method TEXT
         * @returns {string}
         * @example
         * TEXT 12.5 // '12.5'
         * @see {@link NUMBER}
         */
        TEXT(value) {
            if (isDate(value)) {
                return value.toISOString();
            }
            return String(value);
        },
        /**
         * Converts a value to a number
         * @method NUMBER
         * @returns {number}
         * @example
         * NUMBER '12.5' // 12.5
         * @see {@link TEXT}
         */
        NUMBER: Number
    };

    this.binaryOps = {
        '+': add,
        '-': sub,
        '*': mul,
        '/': div,
        '%': mod,
        '^': Math.pow,
        '==': equal,
        '!=': notEqual,
        '>': greaterThan,
        '<': lessThan,
        '>=': greaterThanEqual,
        '<=': lessThanEqual,
        and: andOperator,
        or: orOperator,
        in: (needle, haystack) =>
            Array.isArray(haystack) ? haystack.includes(needle) : String(haystack).includes(needle),
        '[': arrayIndex
    };

    this.ternaryOps = {
        '?': condition
    };

    const isDate = d => d instanceof Date && !isNaN(d);
    const asDate = d => {
        if (isDate(d)) return d;
        try {
            const n = new Date(d);
            if (isDate(n)) return n;
            return null;
        } catch (e) {
            return null;
        }
    };
    function filterNumbers(array) {
        return (arguments.length === 1 && Array.isArray(array) ? array : Array.from(arguments))
            .slice(0)
            .filter(v => !isNaN(v) && Number.isFinite(v));
    }
    // fallback regular expressions for browsers without
    // support for the unicode flag //u
    let PROPER_REGEX = /\w*/g;
    let TITLE_REGEX = /\w\S*/g;
    const ESCAPE_REGEX = /[\\^$*+?.()|[\]{}]/g;

    try {
        PROPER_REGEX = new RegExp('\\p{L}*', 'ug');
        TITLE_REGEX = new RegExp('[\\p{L}\\p{N}]\\S*', 'ug');
    } catch (e) {
        // continue regardless of error
    }

    this.functions = {
        // ---- LOGICAL FUNCTIONS ----

        /**
         * if-else statement
         *
         * @method IF
         *
         * @param boolean condition
         * @param expr  yay   expression to use if condition is `TRUE`
         * @param expr  nay   expression to use if condition is `FALSE`
         * @example IF(temp_diff > 0, "hotter", "colder")
         * // note: you can also use the shorthand ? notaton:
         * temp_diff > 0 ? "hotter" : "colder"
         */
        IF: condition,

        // ---- MATH FUNCTIONS ----

        /**
         * Generate a random real number between 0 and 1 when used without arguments, or between 0 and the passed number
         *
         * @method RANDOM
         * @param number  max value (optional)
         * @example RANDOM()
         * RANDOM(100)
         * @returns {number}
         */
        RANDOM: random,
        // fac: factorial,

        /**
         * Returns the smallest of the given numbers
         *
         * @method MIN
         * @example
         * MIN(1,2,3) // 1
         * MIN([1,2,3]) // 1
         * @returns {number}
         */
        MIN() {
            const v = filterNumbers.apply(this, arguments);
            return min(v);
        },

        /**
         * Returns the largest of the given numbers
         *
         * @method MAX
         * @example
         * MAX(1,2,3) // 3
         * MAX([1,2,3]) // 3
         * @returns {number}
         */
        MAX() {
            return max(filterNumbers.apply(this, arguments));
        },

        /**
         * Returns the sum of the given numbers
         *
         * @method SUM
         *
         * @example
         * SUM(1,2,3) // 6
         * SUM([1,2,3]) // 6
         * @returns {number}
         */
        SUM() {
            return sum(filterNumbers.apply(this, arguments));
        },

        /**
         * Returns the average of the given numbers
         *
         * @method MEAN
         * @example
         * MEAN(1,2,4,8) // 3.75
         * MEAN([1,2,4,8]) // 3.75
         * @returns {number}
         * @see {@link MEDIAN}
         */
        MEAN() {
            const v = filterNumbers.apply(this, arguments);
            return sum(v) / v.length;
        },

        /**
         * Returns the median of the given numbers
         *
         * @method MEDIAN
         * @example
         * MEDIAN(1,2,4,8) // 3
         * MEDIAN([1,2,4,8]) // 3
         * @returns {number}
         * @see {@link MEAN}
         */
        MEDIAN() {
            const v = filterNumbers.apply(this, arguments).sort((a, b) => a - b);
            const i = Math.floor(v.length / 2);
            return v.length % 2 === 1 ? v[i] : (v[i - 1] + v[i]) * 0.5;
        },

        /**
         * Computes the power of a number
         *
         * @method POW
         * @example
         * POW(2,3) // 8
         * POW(4,2) // 16
         * @returns {number}
         */
        POW: Math.pow,

        /**
         * Computes the atan2, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
         *
         * @method ATAN2
         * @example
         * ATAN2(2,3) // 8
         * ATAN2(4,2) // 16
         * @returns {number}
         */
        ATAN2: Math.atan2,

        /**
         * Rounds a number (to a given number of decimals)
         *
         * @method ROUND
         * @example
         * ROUND(3.1415) // 3
         * ROUND(3.1415, 2) // 3.14
         * @returns {number}
         * @see {@link FLOOR}, {@link CEIL}
         */
        ROUND: roundTo,

        // ---- STRING FUNCTIONS ----
        /**
         * Concatenate two or more strings
         *
         * @method CONCAT
         * @example
         * CONCAT("<b>", name, "</b>")
         * @returns {string}
         */
        CONCAT() {
            return Array.from(arguments).join('');
        },
        /**
         * Removes whitespaces at the beginning and end of a string
         *
         * @method TRIM
         * @returns {string}
         * @example
         * TRIM("  hello ") // 'hello'
         */
        TRIM: trim,
        /**
         * Extracts a part of a string
         *
         * @method SUBSTR
         * @param string the input string
         * @param number start
         * @param number end
         * @example
         * SUBSTR("This is fine", 5,7) // 'is'
         * @returns {string}
         */
        SUBSTR(s, start, end) {
            return s.substr(start, end);
        },
        /**
         * Replaces all occurances of a string with another string
         *
         * @method REPLACE
         * @param string the input string
         * @param string the search string
         * @param string the replacement string or function
         * @example
         * REPLACE("hello name", "name", "world") // 'hello world'
         * REPLACE("hello name", "name", TITLE) // 'hello Name'
         * REPLACE("hello name", "name", f(d) = CONCAT("<b>", d, "</b>")) // 'hello <b>name</b>'
         * @returns {string}
         * @see {@link REPLACE_REGEX}
         */
        REPLACE(str, search, replace) {
            return str.replace(
                new RegExp(String(search).replace(ESCAPE_REGEX, '\\$&'), 'g'),
                replace
            );
        },
        /**
         * Like REPLACE, but interprets the search string as regular expression
         *
         * @method REPLACE_REGEX
         * @param string the input string
         * @param string the search regex
         * @param string the replacement string or function
         * @example
         * REPLACE_REGEX("hello 123 world", "[0-9]", '#') // 'hello ### world'
         * REPLACE_REGEX("hello 123 world", "[0-9]+", '#') // 'hello # world'
         * @returns {string}
         * @see {@link REPLACE}
         */
        REPLACE_REGEX(str, regex, replace) {
            return str.replace(new RegExp(regex, 'g'), replace);
        },
        /**
         * Splits a string into an array
         *
         * @method SPLIT
         * @param string the input string
         * @param string the separator string
         * @example
         * SPLIT("hello world", " ") // ['hello', 'world']
         * @returns {array}
         */
        SPLIT(str, sep) {
            return String(str).split(sep);
        },
        /**
         * Lowercase a string
         *
         * @method LOWER
         * @example
         * LOWER("Hello World") // 'hello world'
         * @returns {string}
         * @see {@link UPPER}, {@link TITLE}, {@link PROPER}
         */
        LOWER(str) {
            return String(str).toLowerCase();
        },
        /**
         * Uppercase a string
         *
         * @method UPPER
         * @example
         * UPPER("Hello World") // 'HELLO WORLD'
         * @returns {string}
         * @see {@link LOWER}, {@link TITLE}, {@link PROPER}
         */
        UPPER(str) {
            return String(str).toUpperCase();
        },
        /**
         * Convert a string to title-case. Like `TITLE`, but better for names.
         *
         * @method PROPER
         * @example
         * PROPER("hello WoRLd") // 'Hello World'
         * PROPER("2-WAY STREET") // '2-Way Street'
         * PROPER("baron lloyd-webber") // 'Baron Lloyd-Webber'
         * @returns {string}
         * @see {@link TITLE}
         */
        PROPER(str) {
            return String(str).replace(
                PROPER_REGEX,
                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        /**
         * Convert a string to title-case. Like `PROPER`, but better for headlines.
         *
         * @method TITLE
         * @example
         * TITLE("hello WoRLd") // 'Hello World'
         * TITLE("2-WAY STREET") // '2-way Street'
         * TITLE("baron lloyd-webber") // 'Baron Lloyd-webber'
         * @returns {string}
         * @see {@link PROPER}
         */
        TITLE(str) {
            return String(str).replace(
                TITLE_REGEX,
                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },

        // ARRAY FUNCTIONS
        /**
         * Sort an array ascending or descending
         *
         * @method SORT
         * @param array the input array
         * @param boolean true for ascending, false for descending
         * @param string key to sort by (optional)
         * @example
         * SORT([5,2,4,1]) // [1,2,4,5]
         * SORT(countries, false, 'population')
         * @returns {array}
         */
        SORT(arr, asc = true, key = null) {
            if (RESTRICT_MEMBER_ACCESS.has(key)) throw new Error('Invalid key');
            if (!Array.isArray(arr)) {
                throw new Error('First argument to SORT is not an array');
            }
            return arr.slice(0).sort((a, b) => {
                a = typeof key === 'string' ? a[key] : typeof key === 'function' ? key(a) : a;
                b = typeof key === 'string' ? b[key] : typeof key === 'function' ? key(b) : b;
                return (a > b ? 1 : a < b ? -1 : 0) * (asc ? 1 : -1);
            });
        },
        /**
         * Slice an array (extract a part of array)
         *
         * @method SLICE
         * @param array the input array
         * @param number start index
         * @param number end index
         * @example
         * SLICE([1,2,3,4,5], 1) // [2,3,4,5]
         * SLICE([1,2,3,4,5], 1,3) // [2,3]
         * SLICE([1,2,3,4,5], -2) // [4,5]
         * @returns {array}
         */
        SLICE(arr, start, end) {
            if (!Array.isArray(arr)) {
                throw new Error('First argument to SLICE is not an array');
            }
            return arr.slice(start, end);
        },
        /**
         * Join array elements into a string
         *
         * @method JOIN
         * @param array the input array
         * @param string the glue string
         * @param string alternative glue string for the last join (optional)
         * @returns {string}
         * @example
         * JOIN(['USA', 'Canada', 'Mexico'], ', ') // 'USA, Canada, Mexico'
         * JOIN(['USA', 'Canada', 'Mexico'], ', ', ', and ') // 'USA, Canada, and Mexico'
         */
        JOIN(arr, sep, sepLast = null) {
            if (!Array.isArray(arr)) {
                throw new Error('First argument to JOIN is not an array');
            }
            return sepLast
                ? [arr.slice(0, arr.length - 1).join(sep), arr[arr.length - 1]].join(sepLast)
                : arr.join(sep);
        },
        /**
         * Evaluate function for each element in an array
         *
         * @method MAP
         * @param function the function to call
         * @param array the input array
         * @returns {array}
         * @example
         * MAP(UPPER, ['USA', 'Canada', 'Mexico']) // ['USA', 'CANADA', 'MEXICO']
         * MAP(f(s) = SUBSTR(s, 0, 2), ['USA', 'Canada', 'Mexico']) // ['US', 'Ca', 'Me']
         */
        MAP: arrayMap,
        /**
         * Fold array into a single value, good for more complex aggregations
         *
         * @method FOLD
         * @param function the function to call
         * @param * intial value
         * @param array the input array
         * @returns {}
         * @example
         * FOLD(f(a,b) = a * b, 1, [1,2,3,4,5]) // 120
         */
        FOLD: arrayFold,
        /**
         * Filter elements of an array using a function
         *
         * @method FILTER
         * @param function the function to test elements
         * @param array the input array
         * @returns {array}
         * @example
         * FILTER(f(x) = x > 2, [1, 2, 0, 3, -1, 5]) // [3, 5]
         * FILTER(f(x) = x >= 2, [1, 2, 0, 3, -1, 5]) // [2, 3, 5]
         */
        FILTER: arrayFilter,
        /**
         * Extract values from an array of objects
         *
         * @method PLUCK
         * @param array the input array of objects
         * @param string the key
         * @returns {array}
         * @example
         * PLUCK(countries, 'name')
         * PLUCK(countries, 'population')
         */
        PLUCK(arr, key) {
            if (RESTRICT_MEMBER_ACCESS.has(key)) throw new Error('Invalid key');
            if (!Array.isArray(arr)) throw new Error('First argument to PLUCK is not an array');
            return arr.map(item =>
                Object.prototype.hasOwnProperty.call(item, key) ? item[key] : null
            );
        },
        /**
         * Returns the index of the first occurance of an element in an array (or -1 if it's not in the array)
         *
         * @method INDEXOF
         * @param array the input array of objects
         * @param * target
         * @returns {number}
         * @example
         * INDEXOF(['a', 'b', 'c'], 'b') // 1
         * INDEXOF(['a', 'b', 'c'], 'd') // -1
         * @see {@link FIND}
         */
        INDEXOF(arr, target) {
            if (!Array.isArray(arr)) arr = String(arr);
            return arr.indexOf(target);
        },
        /**
         * Returns the first element of an array for which the test function returns true
         *
         * @method FIND
         * @param array the input array of objects
         * @param function test function
         * @returns {*}
         * @example
         * FIND([1,2,3,4,5,6], f(d) = d > 3) // 4
         * @see {@link INDEXOF}
         */
        FIND(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to FIND is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to FIND is not a function');
            const k = arr.length;
            for (let i = 0; i < k; i++) {
                if (test(arr[i])) return arr[i];
            }
            return null;
        },
        /**
         * Creates an array of numbers
         *
         * @method RANGE
         * @param number start value
         * @param number stop value (not included)
         * @param number step to increment each
         * @returns {array}
         * @example
         * RANGE(0,5) // [0,1,2,3,4]
         * RANGE(0,5,2) // [0,2,4]
         * RANGE(0,1,0.25) // [0,0.25,0.5,0.75]
         */
        RANGE(start, stop, step) {
            // borrowed from https://github.com/jashkenas/underscore/blob/master/modules/range.js
            if (stop == null) {
                stop = start || 0;
                start = 0;
            }
            if (!step) {
                step = stop < start ? -1 : 1;
            }

            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);

            for (var idx = 0; idx < length; idx++, start += step) {
                range[idx] = start;
            }

            return range;
        },
        /**
         * Returns TRUE if the test function is TRUE for every element in the arrat
         *
         * @method EVERY
         * @param array the input array
         * @param function the test function
         * @returns {boolean}
         * @see {@link SOME}
         * @example
         * EVERY([5,8,4,7,3], f(d) = d > 2) // true
         * EVERY([5,8,4,7,3], f(d) = d < 6) // false
         */
        EVERY(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to EVERY is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to EVERY is not a function');
            const k = arr.length;
            let every = true;
            for (let i = 0; i < k; i++) {
                every = every && test(arr[i]);
                if (!every) return false;
            }
            return true;
        },
        /**
         * Returns `true` if the test function is `true` for at least one element in the arrat
         *
         * @method SOME
         * @param array the input array
         * @param function the test function
         * @returns {boolean}
         * @see {@link EVERY}
         * @example
         * SOME([5,8,4,7,3], f(d) = d > 2) // true
         * SOME([5,8,4,7,3], f(d) = d < 6) // true
         * SOME([5,8,4,7,3], f(d) = d < 2) // false
         */
        SOME(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to SOME is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to SOME is not a function');
            const k = arr.length;
            let some = false;
            for (let i = 0; i < k; i++) {
                some = some || test(arr[i]);
                if (some) return true;
            }
            return false;
        },

        // ---- DATE FUNCTIONS ----
        /**
         * Constructs a new date object
         *
         * @method DATE
         * @param number year
         * @param number month
         * @param number day
         * @returns {date}
         * @example
         * DATE(2020, 1, 1) // January 1st, 2020
         */
        DATE() {
            if (arguments.length > 1) {
                // "correct" month argument (1=january, etc)
                arguments[1] = arguments[1] - 1;
            }
            return new Date(...arguments);
        },
        /**
         * Returns the year of a date
         *
         * @method YEAR
         * @param date the input date
         * @returns {number}
         * @see {@link MONTH},{@link DAY}
         * @example
         * YEAR(DATE(2020, 1, 1)) // 2020
         */
        YEAR(d) {
            d = asDate(d);
            return d ? d.getFullYear() : null;
        },
        /**
         * Returns the month of a date (1-12)
         *
         * @method MONTH
         * @param date the input date
         * @returns {number}
         * @see {@link YEAR},{@link DAY}
         * @example
         * MONTH(DATE(2020, 6, 1)) // 6
         */
        MONTH(d) {
            d = asDate(d);
            return d ? d.getMonth() + 1 : null;
        },
        /**
         * Returns the day of a date (1-31)
         *
         * @method DAY
         * @param date the input date
         * @returns {number}
         * @see {@link WEEKDAY},{@link YEAR},{@link MONTH},{@link DAY}
         * @example
         * DAY(DATE(2020, 6, 1)) // 1
         */
        DAY(d) {
            d = asDate(d);
            return d ? d.getDate() : null;
        },
        /**
         * Returns the weekday of a date (0 = Sunday, 1 = Monday, etc)
         *
         * @method WEEKDAY
         * @param date the input date
         * @returns {number}
         * @see {@link DAY}
         * @example
         * WEEKDAY(DATE(2020, 5, 10)) // 0
         */
        WEEKDAY(d) {
            d = asDate(d);
            return d ? d.getDay() : null;
        },
        /**
         * Returns the hours of a date (0-23)
         *
         * @method HOURS
         * @param date the input date
         * @returns {number}
         * @see {@link DAY},{@link MINUTES},{@link SECONDS}
         * @example
         * HOURS(time)
         */
        HOURS(d) {
            d = asDate(d);
            return d ? d.getHours() : null;
        },
        /**
         * Returns the minutes of a date (0-59)
         *
         * @method MINUTES
         * @param date the input date
         * @returns {number}
         * @see {@link HOURS},{@link SECONDS}
         * @example
         * MINUTES(time)
         */
        MINUTES(d) {
            d = asDate(d);
            return d ? d.getMinutes() : null;
        },
        /**
         * Returns the seconds of a date (0-59)
         *
         * @method SECONDS
         * @param date the input date
         * @returns {number}
         * @see {@link HOURS},{@link MINUTES}
         * @example
         * SECONDS(time)
         */
        SECONDS(d) {
            d = asDate(d);
            return d ? d.getSeconds() : null;
        },
        /**
         * Computes the  number of days between two dates
         *
         * @method DATEDIFF
         * @param date the input date 1
         * @param date the input date to substract from
         * @returns {number}
         * @see {@link TIMEDIFF}
         * @example
         * DATEDIFF(date1, date2)
         */
        DATEDIFF(d1, d2) {
            d1 = asDate(d1);
            d2 = asDate(d2);
            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 864e5 : null;
        },
        /**
         * Computes the  number of seconds between two dates
         *
         * @method TIMEDIFF
         * @param date the input date 1
         * @param date the input date to substract from
         * @returns {number}
         * @see {@link DATEDIFF}
         * @example
         * TIMEDIFF(date1, date2)
         */
        TIMEDIFF(d1, d2) {
            d1 = asDate(d1);
            d2 = asDate(d2);
            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 1000 : null;
        }
    };

    this.unaryOps.LOWER = this.functions.LOWER;
    this.unaryOps.UPPER = this.functions.UPPER;
    this.unaryOps.PROPER = this.functions.PROPER;
    this.unaryOps.TITLE = this.functions.TITLE;
    this.unaryOps.TRIM = this.functions.TRIM;
    this.unaryOps.YEAR = this.functions.YEAR;
    this.unaryOps.MONTH = this.functions.MONTH;
    this.unaryOps.DAY = this.functions.DAY;
    this.unaryOps.WEEKDAY = this.functions.WEEKDAY;
    this.unaryOps.HOURS = this.functions.HOURS;
    this.unaryOps.MINUTES = this.functions.MINUTES;
    this.unaryOps.SECONDS = this.functions.SECONDS;

    this.consts = {
        E: Math.E,
        PI: Math.PI,
        TRUE: true,
        FALSE: false,
        NA: Number.NaN,
        NULL: Number.NaN
    };
}

Parser.prototype.parse = function (expr) {
    var instr = [];
    var parserState = new ParserState(this, new TokenStream(this, expr), {
        allowMemberAccess: true,
        restrictMemberAccess: RESTRICT_MEMBER_ACCESS
    });

    parserState.parseExpression(instr);
    parserState.expect(TEOF, 'EOF');

    return new Expression(instr, this);
};

Parser.prototype.evaluate = function (expr, variables) {
    return this.parse(expr).evaluate(variables);
};

var sharedParser = new Parser();

Parser.parse = function (expr) {
    return sharedParser.parse(expr);
};

Parser.evaluate = function (expr, variables) {
    return sharedParser.parse(expr).evaluate(variables);
};

Parser.keywords = [
    'ABS',
    'ACOS',
    'ACOSH',
    'and',
    'ASIN',
    'ASINH',
    'ATAN',
    'ATAN2',
    'ATANH',
    'CBRT',
    'CEIL',
    'CONCAT',
    'COS',
    'COSH',
    'DATEDIFF',
    'DAY',
    'E',
    'EVERY',
    'EXP',
    'EXPM1',
    'FIND',
    'FLOOR',
    'HOURS',
    'IF',
    'in',
    'INDEXOF',
    'ISNULL',
    'JOIN',
    'LENGTH',
    'LN',
    'LOG',
    'LOG10',
    'LOG1P',
    'LOG2',
    'LOWER',
    'MAP',
    'MAX',
    'MEAN',
    'MEDIAN',
    'MIN',
    'MINUTES',
    'MONTH',
    'NOT',
    'NOT',
    'or',
    'PI',
    'PLUCK',
    'POW',
    'PROPER',
    'RANDOM',
    'RANGE',
    'REPLACE',
    'REPLACE_REGEX',
    'ROUND',
    'SECONDS',
    'SIGN',
    'SIN',
    'SINH',
    'SLICE',
    'SOME',
    'SORT',
    'SPLIT',
    'SQRT',
    'SUBSTR',
    'SUM',
    'TAN',
    'TANH',
    'TIMEDIFF',
    'TITLE',
    'TRIM',
    'TRUNC',
    'UPPER',
    'WEEKDAY',
    'YEAR'
];

var optionNameMap = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
    '%': 'remainder',
    '^': 'power',
    '!': 'factorial',
    '<': 'comparison',
    '>': 'comparison',
    '<=': 'comparison',
    '>=': 'comparison',
    '==': 'comparison',
    '!=': 'comparison',
    '||': 'concatenate',
    AND: 'logical',
    OR: 'logical',
    NOT: 'logical',
    IN: 'logical',
    '?': 'conditional',
    ':': 'conditional',
    '=': 'assignment',
    '[': 'array',
    '()=': 'fndef'
};

function getOptionName(op) {
    return Object.prototype.hasOwnProperty.call(optionNameMap, op) ? optionNameMap[op] : op;
}

Parser.prototype.isOperatorEnabled = function (op) {
    var optionName = getOptionName(op);
    var operators = this.options.operators || {};

    return !(optionName in operators) || !!operators[optionName];
};

const TPL_REG = /\{\{(.+?)\}\}/g;
/*
 * returns a function that evaluates template strings
 * using `expr-eval`.
 */
function templateParser(template) {
    const expressions = {};
    const parser = new Parser();
    template.replace(TPL_REG, (s, formula) => {
        formula = formula.trim();
        if (formula && !expressions[formula]) {
            expressions[formula] = parser.parse(formula);
        }
    });
    return context =>
        template.replace(TPL_REG, (s, formula) => {
            const result = formula.trim() ? expressions[formula.trim()].evaluate(context) : '';
            return result === null ? '' : result;
        });
}

const ALLOWED_TAGS =
    '<a><abbr><address><b><big><blockquote><br/><br><caption><cite><code><col><colgroup><dd><del><details><dfn><div><dl><dt><em><figure><font><h1><h2><h3><h4><h5><h6><hr><hgroup><i><img><ins><kbd><li><mark><meter><ol><p><pre><q><s><small><span><strike><strong><sub><summary><sup><table><tbody><td><th><thead><tfoot><tr><tt><u><ul><wbr>';
/*
 * returns a function that evaluates template strings
 * using `expr-eval`.
 */
function htmlTemplate(template) {
    const evaluateTemplate = templateParser(template);
    return context => purifyHTML(evaluateTemplate(context), ALLOWED_TAGS);
}

/*
 * returns the min/max range of a set of columns
 */
function minMax(columns) {
    const minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
    columns.forEach(column => {
        minmax[0] = Math.min(minmax[0], column.range()[0]);
        minmax[1] = Math.max(minmax[1], column.range()[1]);
    });
    return minmax;
}

/*
 * returns a new column with all column names as values
 */
function columnNameColumn(columns) {
    const names = columns.map(col => col.title());
    return Column('', names);
}

function name(obj) {
    return isFunction$1(obj.name) ? obj.name() : isString(obj.name) ? obj.name : obj;
}

function getMaxChartHeight() {
    if (window.innerHeight === 0) return 0;
    var maxH = window.innerHeight - getNonChartHeight();
    return Math.max(maxH, 0);
}

function nearest(array, value) {
    let minDiff = Number.MAX_VALUE;
    let minDiffVal;
    array.forEach(v => {
        var d = Math.abs(v - value);
        if (d < minDiff) {
            minDiff = d;
            minDiffVal = v;
        }
    });
    return minDiffVal;
}

function metricSuffix(locale) {
    switch (locale.substr(0, 2).toLowerCase()) {
        case 'de':
            return { 3: ' Tsd.', 6: ' Mio.', 9: ' Mrd.', 12: ' Bio.' };
        case 'fr':
            return { 3: ' mil', 6: ' Mio', 9: ' Mrd' };
        case 'es':
            return { 3: ' Mil', 6: ' millón' };
        default:
            return { 3: 'k', 6: 'M', 9: ' bil' };
    }
}

function magnitudeRange(minmax) {
    return (
        Math.round(Math.log(minmax[1]) / Math.LN10) - Math.round(Math.log(minmax[0]) / Math.LN10)
    );
}

function logTicks(min, max) {
    const e0 = Math.round(Math.log(min) / Math.LN10);
    const e1 = Math.round(Math.log(max) / Math.LN10);
    return range(e0, e1).map(exp => Math.pow(10, exp));
}

function height(element) {
    const h = parseFloat(getComputedStyle(element, null).height.replace('px', ''));
    return isNaN(h) ? 0 : h;
}

function width(element) {
    const w = parseFloat(getComputedStyle(element, null).width.replace('px', ''));
    return isNaN(w) ? 0 : w;
}

function addClass(element, className) {
    if (element) element.classList.add(className);
}

function removeClass(element, className) {
    if (element) element.classList.remove(className);
}

function remove(elementOrSelector) {
    const element =
        typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;
    if (element) element.parentElement.removeChild(element);
}

function domReady(callback) {
    if (/complete|interactive|loaded/.test(document.readyState)) {
        // dom is already loaded
        callback();
    } else {
        // wait for dom to load
        window.addEventListener('DOMContentLoaded', () => {
            callback();
        });
    }
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    purifyHtml: purifyHTML,
    significantDimension: significantDimension,
    tailLength: tailLength,
    round: round,
    smartRound: smartRound,
    equalish: equalish,
    clone: clone,
    delimited: delimited$1,
    getNonChartHeight: getNonChartHeight,
    outerHeight: outerHeight,
    htmlTemplate: htmlTemplate,
    templateParser: templateParser,
    minMax: minMax,
    columnNameColumn: columnNameColumn,
    name: name,
    getMaxChartHeight: getMaxChartHeight,
    nearest: nearest,
    metricSuffix: metricSuffix,
    magnitudeRange: magnitudeRange,
    logTicks: logTicks,
    height: height,
    width: width,
    addClass: addClass,
    removeClass: removeClass,
    remove: remove,
    domReady: domReady
});

/**
 * Safely access object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports get
 * @kind function
 *
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} _default - the fallback value to be returned if key doesn't exist
 *
 * @returns the value
 *
 * @example
 * import get from '@datawrapper/shared/get';
 * const someObject = { key: { list: ['a', 'b', 'c']}};
 * get(someObject, 'key.list[2]') // returns 'c'
 * get(someObject, 'missing.key') // returns undefined
 * get(someObject, 'missing.key', false) // returns false
 */
function get(object, key = null, _default = null) {
    if (!key) return object;
    const keys = Array.isArray(key) ? key : key.split('.');
    let pt = object;

    for (let i = 0; i < keys.length; i++) {
        if (pt === null || pt === undefined) break; // break out of the loop
        // move one more level in
        pt = pt[keys[i]];
    }
    return pt === undefined || pt === null ? _default : pt;
}

/**
 * safely set object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports set
 * @kind function
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} value - the value to be set
 *
 * @returns the value
 */
function set(object, key, value) {
    const keys = Array.isArray(key) ? key : key.split('.');
    const lastKey = keys.pop();
    let pt = object;

    // resolve property until the parent dict
    keys.forEach(key => {
        if (pt[key] === undefined || pt[key] === null) {
            pt[key] = {};
        }
        pt = pt[key];
    });

    // check if new value is set
    if (JSON.stringify(pt[lastKey]) !== JSON.stringify(value)) {
        pt[lastKey] = value;
        return true;
    }
    return false;
}

/**
 * Recursively compares two objects and returns the
 * "merge patch" object which can be deep-assigned to
 * the source to create the target
 *
 * @exports objectDiff
 * @kind function
 *
 * @example
 * import objectDiff from '@datawrapper/shared/objectDiff';
 * objectDiff({ foo: 1, bar: 'hello' }, { foo: 1, bar: 'world' });
 * // returns { bar: 'world' }
 *
 * @param {object} source - the original object
 * @param {object} target - the changed object
 * @param {array} allowedKeys - if given, the diff will
 *     ignore any first-level keys not in this array
 *
 * @returns {object} - the merge patch
 */
function objectDiff(source, target, allowedKeys = null) {
    return diffKeys(source, target, allowedKeys ? new Set(allowedKeys) : null);
}

/**
 * @param {object} source - the source object
 * @param {object} target - the target object
 * @param {Set|null} allowedKeys - Set
 *
 * @returns {object} - the merge patch
 */
function diffKeys(source, target, allowedKeys = null) {
    const patch = {};
    Object.keys(target).forEach(targetKey => {
        if (!isEqual__default["default"](target[targetKey], source[targetKey])) {
            if (allowedKeys && !allowedKeys.has(targetKey)) return;
            if (isPlainObject__default["default"](target[targetKey]) && isPlainObject__default["default"](source[targetKey])) {
                // iterate one level down
                const childPatch = diffKeys(source[targetKey], target[targetKey]);
                if (Object.keys(childPatch).length) {
                    patch[targetKey] = childPatch;
                }
            } else {
                patch[targetKey] = target[targetKey];
            }
        }
    });
    // also look for removed keys and set them null
    Object.keys(source).forEach(sourceKey => {
        if (allowedKeys && !allowedKeys.has(sourceKey)) return;
        if (target[sourceKey] === undefined) {
            patch[sourceKey] = null;
        }
    });
    return patch;
}

/**
 * Use this function to post event messages out of Datawrapper iframe and
 * web component embeds to the parent website.
 *
 * @exports postEvent
 * @kind function
 *
 * @param {string} chartId - the chart id each message should be signed with
 * @param {boolean} isIframe - render context (`true`: iframe, `false`: web component)
 * @returns {function}
 *
 * @example
 * import genPostEvent from '@datawrapper/shared/postEvent';
 * const postEvent = genPostEvent(chart.get('id'), true);
 * postEvent('bar.click', { value: 123 });
 */
function postEvent(chartId, isIframe) {
    const host = isIframe ? window.parent : window;
    return function (event, data) {
        if (host && host.postMessage) {
            const evt = {
                source: 'datawrapper',
                chartId,
                type: event,
                data
            };
            host.postMessage(evt, '*');
        }
    };
}

/*
 * simple event callbacks, mimicing the $.Callbacks API
 */

function events () {
    const list = [];

    return {
        fire() {
            for (var i = list.length - 1; i >= 0; i--) {
                list[i].apply(this, arguments);
            }
        },
        add(callback) {
            list.push(callback);
        }
    };
}

function reorderColumns (chart, dataset) {
    var order = chart.getMetadata('data.column-order', []);
    if (order.length && order.length === dataset.numColumns()) {
        dataset.columnOrder(order);
    }
    return dataset;
}

function applyChanges(chart, dataset) {
    const changes = chart.getMetadata('data.changes', []);
    const transpose = chart.getMetadata('data.transpose', false);
    const numRows = dataset.numRows();
    changes.forEach(change => {
        const row = !transpose ? change.row : change.column;
        const column = !transpose ? change.column : change.row;
        if (dataset.hasColumn(column)) {
            change.ignored = false;
            if (row === 0) {
                if (change.previous && change.previous !== 'undefined') {
                    const oldTitle = dataset.column(column).title();
                    if (oldTitle !== change.previous) {
                        // change.ignored = true; // TODO Something is buggy about this, let's revisit later.
                        return;
                    }
                }
                dataset.column(column).title(change.value);
            } else if (row <= numRows) {
                if (change.previous && change.previous !== 'undefined') {
                    const curValue = dataset.column(column).raw(row - 1);
                    if (curValue !== change.previous) {
                        // change.ignored = true; // TODO Something is buggy about this, let's revisit later.
                        return;
                    }
                }
                dataset.column(column).raw(row - 1, change.value);
            }
        }
    });

    // overwrite column types
    var columnFormats = chart.getMetadata('data.column-format', {});
    each(columnFormats, (columnFormat, key) => {
        if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type !== 'auto') {
            dataset.column(key).type(columnFormat.type);
        }
        if (columnFormat['input-format'] && dataset.hasColumn(key)) {
            dataset.column(key).type(true).format(columnFormat['input-format']);
        }
    });
    return dataset;
}

/**
 * converts a column name to a variable name that can be used in the custom
 * column editor. variable names can't contain spaces and special characters
 * and are also converted to lowercase.
 *
 * @exports columnNameToVariable
 * @kind function
 *
 * @example
 * import columnNameToVariable from '@datawrapper/shared/columnNameToVariable';
 *
 * columnNameToVariable('GDP (per cap.)') // gdp_per_cap
 *
 * @param {string} name -- name of the column
 * @returns {string} -- variable name
 */
function columnNameToVariable(name) {
    return name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with _
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/-/g, '_') // Replace multiple - with single -
        .replace(/__+/g, '_') // Replace multiple - with single -
        .replace(/^_+/, '') // Trim - from start of text
        .replace(/_+$/, '') // Trim - from end of text
        .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
        .replace(/^(and|or|in|true|false)$/, '$1_'); // avoid reserved keywords
}

function toISOStringSafe(date) {
    try {
        return date.toISOString();
    } catch (e) {
        if (e instanceof RangeError) {
            return date.toString();
        }
        throw e;
    }
}

function addComputedColumns(chart, dataset) {
    let virtualColumns = chart.getMetadata('describe.computed-columns', {});
    if (!Array.isArray(virtualColumns)) {
        // convert to array
        virtualColumns = Object.keys(virtualColumns).reduce((acc, cur) => {
            acc.push({
                name: cur,
                formula: virtualColumns[cur]
            });
            return acc;
        }, []);
    }

    const data = applyChanges(chart, dataset).list();
    const columnNameToVar = {};
    const colAggregates = {};
    const parser = new Parser();

    dataset.eachColumn(function (col) {
        if (col.isComputed) return;
        columnNameToVar[col.name()] = columnNameToVariable(col.name());
        if (col.type() === 'number') {
            const [min, max] = col.range();
            colAggregates[col.name()] = {
                min,
                max,
                sum: col.sum(),
                mean: col.mean(),
                median: col.median()
            };
        } else if (col.type() === 'date') {
            const [min, max] = col.range();
            colAggregates[col.name()] = { min, max };
        }
    });

    // initialize meta objects for each computed column
    const vNamesToVar = virtualColumns.reduce((acc, val, idx) => {
        const key = columnNameToVariable(val.name);
        return acc.set(key, {
            name: val.name,
            index: dataset.numColumns() + idx,
            key,
            formula: val.formula,
            visited: 0,
            computed: false,
            dependsOn: []
        });
    }, new Map());

    // parse formulas to detect cross-column dependencies
    virtualColumns.forEach(({ formula, name }) => {
        const col = vNamesToVar.get(columnNameToVariable(name));
        if (formula.trim()) {
            try {
                col.expr = parser.parse(formula.trim());
                col.expr.variables().forEach(v => {
                    v = v.split('__')[0];
                    if (vNamesToVar.has(v)) {
                        col.dependsOn.push(vNamesToVar.get(v));
                    }
                });
            } catch (e) {
                col.error = e.message;
                // console.error('err', e);
            }
        } else {
            col.expr = {
                evaluate() {
                    return '';
                },
                variables() {
                    return [];
                }
            };
        }
    });

    // sort computed columns in order of their dependency graph
    // circular dependencies are not allowed and will result in
    // errors
    const computedColumns = [];

    let curIter = 0;
    while (vNamesToVar.size) {
        if (curIter > 1000) break;
        vNamesToVar.forEach(col => {
            curIter++;
            try {
                visit(col, []);
            } catch (e) {
                if (e.message.startsWith('circular-dependency')) {
                    col.error = e.message;
                    // col.computed = true;
                    vNamesToVar.delete(col.key);
                    computedColumns.push(col);
                } else {
                    throw e;
                }
            }
        });
    }

    // compute in order of dependencies
    computedColumns.forEach(col => {
        if (col.error) {
            const errorCol = Column(
                col.name,
                data.map(() => 'null')
            );
            errorCol.isComputed = true;
            errorCol.formula = col.formula;
            errorCol.errors = [
                {
                    message: col.error,
                    row: 'all'
                }
            ];
            col.column = errorCol;
        } else {
            col.column = addComputedColumn(col);
        }
    });

    // add to dataset in original order
    computedColumns.sort((a, b) => a.index - b.index).forEach(({ column }) => dataset.add(column));

    return dataset;

    function visit(col, stack) {
        if (col.computed) return;
        stack.push(col.name);
        for (let i = 0; i < stack.length - 2; i++) {
            if (col.name === stack[i]) {
                throw new Error('circular-dependency: ' + stack.join(' ‣ '));
            }
        }
        col.curIter = curIter;
        let allComputed = true;
        for (let i = 0; i < col.dependsOn.length; i++) {
            allComputed = allComputed && col.dependsOn[i].computed;
        }
        if (allComputed) {
            // no dependencies, we can compute this now
            col.computed = true;
            computedColumns.push(col);
            vNamesToVar.delete(col.key);
        } else {
            if (stack.length < 10) {
                col.dependsOn.forEach(c => {
                    visit(c, stack.slice(0));
                });
            }
        }
    }

    function addComputedColumn({ formula, name, expr, error, index }) {
        const errors = [];
        if (error) {
            errors.push({ row: 'all', message: error });
        }

        // create a map of changes for this column
        const changes = chart
            .getMetadata('data.changes', [])
            .filter(change => change.column === index && change.row > 0)
            .reduce((acc, cur) => {
                const old = acc.get(cur.row - 1);
                if (old) {
                    // overwrite previous value
                    cur.previous = old.previous;
                }
                acc.set(cur.row - 1, cur);
                return acc;
            }, new Map());

        const values = data.map(function (row, index) {
            const context = {
                ROWNUMBER: index
            };
            each(row, function (val, key) {
                if (!columnNameToVar[key]) return;
                context[columnNameToVar[key]] = val;
                if (colAggregates[key]) {
                    Object.keys(colAggregates[key]).forEach(aggr => {
                        context[`${columnNameToVar[key]}__${aggr}`] = colAggregates[key][aggr];
                    });
                }
            });
            let value;
            try {
                value = expr.evaluate(context);
                if (typeof value === 'function') {
                    errors.push({ message: 'formula returned function', row: index });
                    value = null;
                }
            } catch (error) {
                errors.push({ message: error.message, row: index });
                value = null;
            }
            if (changes.has(index)) {
                const change = changes.get(index);
                if (change.previous === undefined || change.previous == value) {
                    // we have a change and it's still valid
                    return change.value;
                }
            }
            return value;
        });
        columnNameToVar[name] = columnNameToVariable(name);
        // apply values to rows so they can be used in formulas
        values.forEach((val, i) => {
            data[i][name] = val;
        });
        var virtualColumn = Column(
            name,
            values.map(function (v) {
                if (isBoolean(v)) return v ? 'yes' : 'no';
                if (isDate(v)) return toISOStringSafe(v);
                if (isNumber(v)) return String(v);
                if (isNull(v)) return null;
                return String(v);
            })
        );
        // aggregate values
        if (virtualColumn.type() === 'number') {
            const [min, max] = virtualColumn.range();
            colAggregates[name] = {
                min,
                max,
                sum: virtualColumn.sum(),
                mean: virtualColumn.mean(),
                median: virtualColumn.median()
            };
        } else if (virtualColumn.type() === 'date') {
            const [min, max] = virtualColumn.range();
            colAggregates[name] = { min, max };
        }
        virtualColumn.isComputed = true;
        virtualColumn.errors = errors;
        virtualColumn.formula = formula;
        return virtualColumn;
    }
}

let visualization$1;

/**
 * Chart
 * @module dw.chart
 */
function chart (attributes) {
    // private methods and properties
    let dataset;
    let theme;
    let metricPrefix;
    let locale;
    let flags = {};

    const changeCallbacks = events();
    const datasetChangeCallbacks = events();

    const _assets = {};
    let _translations = {};
    let _ds;

    // public interface
    const chart = {
        /**
         * @function chart.get
         */
        get(key, _default) {
            return get(attributes, key, _default);
        },

        getMetadata(key, _default) {
            return get(attributes, `metadata.${key}`, _default);
        },

        set(key, value) {
            if (set(attributes, key, value)) {
                changeCallbacks.fire(chart, key, value);
            }
            return this;
        },

        setMetadata(key, value) {
            return chart.set(`metadata.${key}`, value);
        },

        getElementBounds(element) {
            const rootBounds = visualization$1.target().getBoundingClientRect();
            const elementBounds = element.getBoundingClientRect();

            return {
                top: elementBounds.top - rootBounds.top,
                right: elementBounds.right - rootBounds.left,
                bottom: elementBounds.bottom - rootBounds.top,
                left: elementBounds.left - rootBounds.left,
                width: elementBounds.width,
                height: elementBounds.height
            };
        },

        // loads the dataset and returns a deferred
        load(csv, externalData) {
            const dsopts = {
                chartId: chart.get('id'),
                firstRowIsHeader: chart.get('metadata.data.horizontal-header', true),
                transpose: chart.get('metadata.data.transpose', false)
            };

            if ((csv || csv === '') && !externalData) dsopts.csv = csv;
            else dsopts.url = externalData || 'data.csv';

            const datasource = chart.get('metadata.data.json') ? json(dsopts) : delimited(dsopts);

            return datasource.dataset().then(ds => {
                this.dataset(ds);
                datasetChangeCallbacks.fire(chart, ds);
                return ds;
            });
        },

        /**
         * Getter/setter for the dw.dataset class. This method
         * can also be used to "reset" the current dataset by passing
         * true as argument. This will re-apply changes, column sorting
         * and computed columns to the existing dataset.
         *
         * @param {dw.dataset|true}
         *
         * @returns dataset
         */
        dataset(ds) {
            if (arguments.length) {
                if (ds !== true) _ds = ds;
                dataset = chart.get('metadata.data.json')
                    ? _ds
                    : reorderColumns(chart, applyChanges(chart, addComputedColumns(chart, _ds)));
                if (ds === true) return dataset;
                return chart;
            }
            return dataset;
        },

        /**
         * This helper method is used by the chart editor to inject
         * a dataset which has computed columns, changes and column
         * ordering already applied.
         *
         * @param {dw.dataset} ds
         */
        setDataset(ds) {
            dataset = ds;
        },

        // sets or gets the theme
        theme(_theme) {
            if (arguments.length) {
                theme = _theme;
                return chart;
            }
            return theme || {};
        },

        // sets or gets the visualization
        vis(_vis) {
            if (arguments.length) {
                visualization$1 = _vis;
                visualization$1.chart(chart);
                return chart;
            }
            return visualization$1;
        },

        // returns true if the user has set any highlights
        hasHighlight() {
            var hl = chart.get('metadata.visualize.highlighted-series');
            return isArray(hl) && hl.length > 0;
        },

        isHighlighted(obj) {
            if (isUndefined(obj) === undefined) return false;
            const hl = chart.get('metadata.visualize.highlighted-series');
            const objName = name(obj);
            return !isArray(hl) || hl.length === 0 || indexOf(hl, objName) >= 0;
        },

        locale(_locale, callback) {
            if (arguments.length) {
                locale = _locale.replace('_', '-');
                if (!locale) locale = 'en-US';
                if (typeof callback === 'function') callback();
                return chart;
            }
            return locale;
        },

        metricPrefix(_metricPrefix) {
            if (arguments.length) {
                metricPrefix = _metricPrefix;
                return chart;
            }
            return metricPrefix;
        },

        inEditor: () => {
            try {
                return (
                    window.parent !== window &&
                    window.parent.dw &&
                    window.parent.dw.backend &&
                    window.parent.dw.backend.hooks
                );
            } catch (ex) {
                return false;
            }
        },

        createPostEvent() {
            const chartId = chart.get('id');
            const { isIframe } = flags;
            return postEvent(chartId, isIframe);
        },

        // sets or gets the flags
        flags(_flags) {
            if (arguments.length) {
                flags = _flags;
                return chart;
            }
            return flags;
        },

        render(outerContainer) {
            if (!visualization$1 || !theme || !dataset) {
                throw new Error('cannot render the chart!');
            }

            const isIframe = flags.isIframe;
            const container = chart.vis().target();

            visualization$1.chart(chart);

            // compute chart dimensions
            const w = width(container);
            const h = isIframe
                ? getMaxChartHeight()
                : chart.getMetadata('publish.chart-height') || 400;

            const heightMode = chart.getHeightMode();

            // only render if iframe has valid dimensions
            if (heightMode === 'fixed' ? w <= 0 : w <= 0 || h <= 0) {
                console.warn('Aborting chart rendering due to invalid container dimensions');

                window.clearInterval(this.__resizingInterval);
                this.__resizingInterval = setInterval(postMessage, 1000);
                postMessage();

                return;
            }

            // set chart mode class
            [container, outerContainer].forEach(el => {
                el.classList.toggle('vis-height-fit', heightMode === 'fit');
                el.classList.toggle('vis-height-fixed', heightMode === 'fixed');
            });

            // set mobile class
            const breakpoint = get(theme, `vis.${chart.type}.mobileBreakpoint`, 450);
            outerContainer.classList.toggle('is-mobile', outerContainer.clientWidth <= breakpoint);

            // really needed?
            outerContainer.classList.add('vis-' + visualization$1.id);

            visualization$1.reset(container);
            visualization$1.size(w, h);
            visualization$1.__init();

            visualization$1.render(container);

            if (isIframe) {
                window.clearInterval(this.__resizingInterval);
                this.__resizingInterval = setInterval(postMessage, 1000);
                postMessage();
            }

            function postMessage() {
                if (flags && flags.fitchart) return;

                let desiredHeight;

                if (chart.getHeightMode() === 'fit') {
                    if (chart.inEditor() || !chart.getMetadata('publish.chart-height')) return;
                    desiredHeight = getNonChartHeight() + chart.getMetadata('publish.chart-height');
                } else {
                    desiredHeight = outerHeight(document.querySelector('html'), true);
                }

                if (Math.round(window.innerHeight) === Math.round(desiredHeight)) {
                    // no need to request a height change here
                    return;
                }

                // datawrapper responsive embed
                window.parent.postMessage(
                    {
                        'datawrapper-height': {
                            [chart.get().id]: desiredHeight
                        }
                    },
                    '*'
                );

                // Google AMP
                window.parent.postMessage(
                    {
                        sentinel: 'amp',
                        type: 'embed-size',
                        height: desiredHeight
                    },
                    '*'
                );

                // Medium
                window.parent.postMessage(
                    JSON.stringify({
                        src: location.href,
                        context: 'iframe.resize',
                        height: desiredHeight
                    }),
                    '*'
                );

                if (typeof window.datawrapperHeightCallback === 'function') {
                    window.datawrapperHeightCallback(desiredHeight);
                }
            }
        },

        getHeightMode() {
            const themeFitChart =
                get(visualization$1.theme(), 'vis.d3-pies.fitchart', false) &&
                ['d3-pies', 'd3-donuts', 'd3-multiple-pies', 'd3-multiple-donuts'].indexOf(
                    visualization$1.meta.id
                ) > -1;
            const urlParams = new URLSearchParams(window.location.search);
            const urlFitChart = !!urlParams.get('fitchart');

            return themeFitChart || urlFitChart || visualization$1.meta.height !== 'fixed'
                ? 'fit'
                : 'fixed';
        },

        attributes(attrs) {
            if (arguments.length) {
                const diff = objectDiff(attributes, attrs);
                attributes = attrs;
                // fire onChange callbacks
                getNestedObjectKeys(diff).forEach(key => {
                    changeCallbacks.fire(chart, key, get(attrs, key));
                });
                return chart;
            }
            return attributes;
        },

        // Legacy event-handling (TODO: Remove/replace?):
        onChange: changeCallbacks.add,
        onDatasetChange: datasetChangeCallbacks.add,

        dataCellChanged(column, row) {
            const changes = chart.get('metadata.data.changes', []);
            const transpose = chart.get('metadata.data.transpose', false);
            let changed = false;

            const order = dataset.columnOrder();
            column = order[column];

            changes.forEach(change => {
                let r = 'row';
                let c = 'column';
                if (transpose) {
                    r = 'column';
                    c = 'row';
                }
                if (column === change[c] && change[r] === row) {
                    changed = true;
                }
            });
            return changed;
        },

        asset(id, asset) {
            if (arguments.length === 1) {
                return _assets[id];
            }

            _assets[id] = asset;
        },

        translations(values) {
            if (arguments.length === 0) {
                return _translations;
            }

            _translations = values;

            return this;
        },

        translate(key) {
            if (!_translations[key]) return 'MISSING: ' + key;
            var translation = _translations[key];

            if (typeof translation === 'string' && arguments.length > 1) {
                // replace $0, $1 etc with remaining arguments
                translation = translation.replace(/\$(\d)/g, (m, i) => {
                    i = 1 + Number(i);
                    if (arguments[i] === undefined) return m;
                    return arguments[i];
                });
            }

            return translation;
        }
    };

    return chart;
}

/**
 * returns list of keys defined in an object
 *
 * @param {object} object
 * @returns {string[]} list of keys
 */
function getNestedObjectKeys(object) {
    const candidates = Object.keys(object);
    const keys = [];
    candidates.forEach(key => {
        if (!isPlainObject__default["default"](object[key])) keys.push(key);
        else {
            getNestedObjectKeys(object[key]).forEach(subkey => {
                keys.push(`${key}.${subkey}`);
            });
        }
    });
    return keys;
}

/**
 * Assign dataset columns to visualization axes. Non-optional columns
 * will automatically be assigned based on a matching column type and
 * column name (if the vis axis defined a regex).
 *
 * Optional axes can define a `overrideOptionalKey` which will turn
 * it into a non-optional axis in case the specified metadata key
 * contains a truthy value.
 *
 * @param {Dataset} dataset - the parsed dataset
 * @param {object} visAxes - axis definitions from visualization
 * @param {object} userAxes - user preferences for axis assignments
 *                            (from chart.metadata.axis)
 * @param {object} overrideKeys - map of all axes overrideOptionalKeys
 *                                and the current metadata values
 * @returns {object}
 */
function populateVisAxes({ dataset, visAxes, userAxes, overrideKeys }) {
    userAxes = userAxes || {};
    overrideKeys = overrideKeys || {};
    const usedColumns = {};
    const axes = {};
    const axesAsColumns = {};

    // get user preference
    each(visAxes, (o, key) => {
        if (userAxes[key]) {
            let columns = userAxes[key];

            if (o.optional && o.overrideOptionalKey && !overrideKeys[o.overrideOptionalKey]) {
                return;
            }

            if (
                columnExists(columns) &&
                checkColumn(o, columns, true) &&
                !!o.multiple === isArray(columns)
            ) {
                axes[key] = o.multiple && !isArray(columns) ? [columns] : columns;
                // mark columns as used
                if (!isArray(columns)) columns = [columns];
                each(columns, function (column) {
                    usedColumns[column] = true;
                });
            }
        }
    });

    var checked = [];

    each(visAxes, axisDef => {
        if (axisDef.optional) {
            // chart settings may override this
            if (axisDef.overrideOptionalKey && overrideKeys[axisDef.overrideOptionalKey]) {
                // now the axis is mandatory
                axisDef.optional = false;
            }
        }
    });

    // auto-populate remaining axes
    each(visAxes, (axisDef, key) => {
        function remainingRequiredColumns(accepts) {
            // returns how many required columns there are for the remaining axes
            // either an integer or "multiple" if there's another multi-column axis coming up
            function equalAccepts(a1, a2) {
                if (typeof a1 === 'undefined' && typeof a2 !== 'undefined') return false;
                if (typeof a2 === 'undefined' && typeof a1 !== 'undefined') return false;
                if (a1.length !== a2.length) return false;

                for (let i = 0; i < a1.length; i++) {
                    if (a2.indexOf(a1[i]) === -1) return false;
                }
                return true;
            }

            let res = 0;
            each(visAxes, function (axisDef, key) {
                if (checked.indexOf(key) > -1) return;
                if (!equalAccepts(axisDef.accepts, accepts)) return;
                if (typeof res === 'string') return;
                if (axisDef.optional) return;
                if (axisDef.multiple) {
                    res = 'multiple';
                    return;
                }
                res += 1;
            });
            return res;
        }
        function remainingAvailableColumns(dataset) {
            let count = 0;
            dataset.eachColumn(c => {
                if (checkColumn(axisDef, c)) {
                    count++;
                }
            });
            return count;
        }
        checked.push(key);
        if (axes[key]) return; // user has defined this axis already
        if (!axisDef.optional) {
            // we only populate mandatory axes
            if (!axisDef.multiple) {
                const accepted = filter(dataset.columns(), c => checkColumn(axisDef, c));
                let firstMatch;
                if (axisDef.preferred) {
                    // axis defined a regex for testing column names
                    const regex = new RegExp(axisDef.preferred, 'i');
                    firstMatch = find(accepted, function (col) {
                        return (
                            regex.test(col.name()) ||
                            (col.title() !== col.name() && regex.test(col.title()))
                        );
                    });
                }
                // simply use first colulmn accepted by axis
                if (!firstMatch) firstMatch = accepted[0];
                if (firstMatch) {
                    usedColumns[firstMatch.name()] = true; // mark column as used
                    axes[key] = firstMatch.name();
                } else {
                    // try to auto-populate missing text column
                    if (indexOf(axisDef.accepts, 'text') >= 0) {
                        // try using the first text column in the dataset instead
                        const acceptedAllowUsed = filter(dataset.columns(), function (col) {
                            return indexOf(axisDef.accepts, col.type()) >= 0;
                        });
                        if (acceptedAllowUsed.length) {
                            axes[key] = acceptedAllowUsed[0].name();
                        } else {
                            // no other text column in dataset, so genetate one with A,B,C,D...
                            const col = Column(
                                key,
                                map(range(dataset.numRows()), function (i) {
                                    return (
                                        (i > 25 ? String.fromCharCode(64 + i / 26) : '') +
                                        String.fromCharCode(65 + (i % 26))
                                    );
                                }),
                                'text'
                            );
                            dataset.add(col);
                            usedColumns[col.name()] = true;
                            axes[key] = col.name();
                        }
                    }
                }
            } else {
                const required = remainingRequiredColumns(axisDef.accepts);
                let available = remainingAvailableColumns(dataset);

                // fill axis with all accepted columns
                axes[key] = [];
                dataset.eachColumn(function (c) {
                    if (required === 'multiple' && axes[key].length) return;
                    else if (available <= required) return;

                    if (checkColumn(axisDef, c)) {
                        usedColumns[c.name()] = true;
                        axes[key].push(c.name());
                        available--;
                    }
                });
            }
        } else {
            axes[key] = false;
        }
    });

    each(axes, (columns, key) => {
        if (!isArray(columns)) {
            axesAsColumns[key] = columns !== false ? dataset.column(columns) : null;
        } else {
            axesAsColumns[key] = [];
            each(columns, function (column, i) {
                axesAsColumns[key][i] = column !== false ? dataset.column(column) : null;
            });
        }
    });

    return { axes, axesAsColumns, usedColumns };

    function columnExists(columns) {
        if (!isArray(columns)) columns = [columns];
        for (var i = 0; i < columns.length; i++) {
            if (!dataset.hasColumn(columns[i])) return false;
        }
        return true;
    }

    function checkColumn(axisDef, columns, allowMultipleUse) {
        if (!isArray(columns)) columns = [columns];
        columns = columns.map(el => (typeof el === 'string' ? dataset.column(el) : el));
        for (var i = 0; i < columns.length; i++) {
            if (
                (!allowMultipleUse && usedColumns[columns[i].name()]) ||
                indexOf(axisDef.accepts, columns[i].type()) === -1
            ) {
                return false;
            }
        }
        return true;
    }
}

function filterDatasetColumns (chart, dataset) {
    if (!dataset.filterColumns) return dataset;

    const columnFormat = chart.getMetadata('data.column-format', {});
    const ignore = Object.fromEntries(
        Object.entries(columnFormat).map(([key, format]) => [key, !!format.ignore])
    );
    dataset.filterColumns(ignore);
    return dataset;
}

/* globals dw */

const base = function () {}.prototype;

extend(base, {
    // called before rendering
    __init() {
        this.__renderedDfd = new Promise(resolve => {
            this.__renderedResolve = resolve;
        });
        this.__rendered = false;
        this.__colors = {};
        this.__callbacks = {};

        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage('datawrapper:vis:init', '*');
        }
        return this;
    },

    render(el) {
        el.innerHTML = 'implement me!';
    },

    theme(theme) {
        if (!arguments.length) {
            if (typeof this.__theme === 'string') return dw.theme(this.__theme);
            return this.__theme;
        }

        this.__theme = theme;
        return this;
    },

    libraries(libraries) {
        if (!arguments.length) {
            return this.__libraries || {};
        }

        this.__libraries = libraries;
        return this;
    },

    target(target) {
        if (!arguments.length) {
            return this.__target;
        }

        this.__target = target;
        return this;
    },

    size(width, height) {
        const me = this;
        if (!arguments.length) return [me.__w, me.__h];
        me.__w = width;
        me.__h = height;
        return me;
    },

    /**
     * short-cut for this.chart.get('metadata.visualize.*')
     */
    get(str, _default) {
        return get(this.chart().get(), 'metadata.visualize' + (str ? '.' + str : ''), _default);
    },

    chart(chart) {
        var me = this;
        if (!arguments.length) return me.__chart;
        me.dataset = chart.dataset();
        me.theme(chart.theme());
        me.__chart = chart;
        // reset visualization cache to make sure
        // auto-populated columns get re-created
        me.__axisCache = undefined;
        filterDatasetColumns(chart, me.dataset);

        // set locale
        const { numeral } = me.libraries();
        if (numeral && chart.locales && chart.locales.numeral) {
            try {
                numeral.register('locale', 'dw', chart.locales.numeral);
            } catch (e) {
                if (e instanceof TypeError) ; else {
                    throw e;
                }
            }
            numeral.locale('dw');
        }

        return me;
    },

    axes(returnAsColumns, noCache) {
        const me = this;
        const userAxes = get(me.chart().get(), 'metadata.axes', {});
        const visAxes = clone(me.meta.axes);

        const overrideKeys = Object.fromEntries(
            Object.entries(visAxes)
                .filter(([, axis]) => axis.optional && axis.overrideOptionalKey)
                .map(([, axis]) => [
                    axis.overrideOptionalKey,
                    me.chart().getMetadata(axis.overrideOptionalKey, false)
                ])
        );

        if (
            !noCache &&
            me.__axisCache &&
            isEqual(me.__axisCache.userAxes, userAxes) &&
            isEqual(me.__axisCache.overrideKeys, overrideKeys) &&
            me.__axisCache.transpose === me.chart().getMetadata('data.transpose')
        ) {
            return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
        }

        const dataset = me.chart().dataset();

        const { axes, axesAsColumns } = populateVisAxes({
            dataset,
            userAxes,
            visAxes,
            overrideKeys
        });

        // update chart dataset to include "virtual" columns
        me.chart().dataset(dataset);
        // filter hidden columns
        filterDatasetColumns(me.chart(), dataset);

        me.__axisCache = {
            axes: axes,
            axesAsColumns: axesAsColumns,
            userAxes: clone(userAxes),
            overrideKeys,
            transpose: me.chart().getMetadata('data.transpose')
        };

        return me.__axisCache[returnAsColumns ? 'axesAsColumns' : 'axes'];
    },

    keys() {
        const axesDef = this.axes();
        if (axesDef.labels) {
            const lblCol = this.dataset.column(axesDef.labels);
            const keys = [];
            lblCol.each(val => {
                keys.push(String(val));
            });
            return keys;
        }
        return [];
    },

    keyLabel(key) {
        return key;
    },

    /*
     * called by the core whenever the chart is re-drawn
     * without reloading the page
     */
    reset() {
        this.clear();
        const el = this.target();
        el.innerHTML = '';
        remove('.chart .filter-ui');
        remove('.chart .legend');
    },

    clear() {},

    renderingComplete() {
        if (window.parent && window.parent.postMessage) {
            setTimeout(function () {
                window.parent.postMessage('datawrapper:vis:rendered', '*');
            }, 200);
        }
        this.__renderedResolve();
        this.__rendered = true;
        this.postRendering();
    },

    postRendering() {},

    rendered() {
        return this.__renderedDfd;
    },

    /*
     * smart rendering means that a visualization is able to
     * re-render itself without having to instantiate it again
     */
    supportsSmartRendering() {
        return false;
    },

    colorMode(cm) {
        if (!arguments.length) {
            return this.__colorMode;
        }

        this.__colorMode = cm;
    },

    colorMap(cm) {
        if (!arguments.length) {
            return (...args) => {
                let color = args[0];
                const applyDarkModeMap = this.__darkMode && this.__darkModeColorMap;
                this.__colors[color] = 1;
                if (this.__colorMap) {
                    if (applyDarkModeMap) color = this.__darkModeColorMap(...args);
                    return this.__colorMap(color);
                } else if (applyDarkModeMap) {
                    color = this.__darkModeColorMap(...args);
                }
                return color;
            };
        }

        this.__colorMap = cm;
    },

    initDarkMode(cb, cm) {
        this.__onDarkModeChange = cb;
        this.__darkModeColorMap = cm;
    },

    /**
     * set or get dark mode state of vis
     */
    darkMode(dm) {
        // can't initialize in __init because that sets it back to false on each render
        if (this.__darkMode === undefined) this.__darkMode = false;
        if (!arguments.length) return this.__darkMode;
        if (!this.__onDarkModeChange) return;

        this.__darkMode = dm;
        this.__onDarkModeChange(dm);
    },

    colorsUsed() {
        return Object.keys(this.__colors);
    },

    /**
     * register an event listener for custom vis events
     */
    on(eventType, callback) {
        if (!this.__callbacks[eventType]) {
            this.__callbacks[eventType] = [];
        }
        this.__callbacks[eventType].push(callback);
    },

    /**
     * fire a custom vis event
     */
    fire(eventType, data) {
        if (this.__callbacks && this.__callbacks[eventType]) {
            this.__callbacks[eventType].forEach(function (cb) {
                if (typeof cb === 'function') cb(data);
            });
        }
    }
});

const __vis = {};

function visualization(id, target) {
    if (!__vis[id]) {
        console.warn('unknown visualization type: ' + id);
        const known = Object.keys(__vis);
        if (known.length > 0) console.warn('try one of these instead: ' + known.join(', '));
        return false;
    }

    function getParents(vis) {
        const parents = [];

        while (vis.parentVis !== 'base') {
            vis = __vis[vis.parentVis];
            parents.push({ id: vis.parentVis, vis });
        }

        return parents.reverse();
    }

    const vis = clone$1(base);

    const parents = getParents(__vis[id]);
    parents.push({ id, vis: __vis[id] });
    parents.forEach(el => {
        Object.assign(
            vis,
            typeof el.vis.init === 'function' ? el.vis.init({ target }) : el.vis.init,
            { id }
        );
    });

    vis.libraries(visualization.libraries);

    if (target) {
        vis.target(target);
    }

    return vis;
}

visualization.register = function (id) {
    let parentVis, init;

    if (arguments.length === 2) {
        parentVis = 'base';
        init = arguments[1];
    } else if (arguments.length === 3) {
        parentVis = arguments[1];
        init = arguments[2];
    }

    __vis[id] = {
        parentVis,
        init
    };
};

visualization.has = function (id) {
    return __vis[id] !== undefined;
};

visualization.libraries = {
    numeral: numeral__default["default"]
};

visualization.base = base;

const __themes = {};

function theme(id) {
    return __themes[id];
}

theme.register = function (id, props) {
    __themes[id] = props;
};

const __blocks = {};

function block(id) {
    return __blocks[id];
}

block.register = function (id, lib) {
    __blocks[id] = lib;
};

block.has = function (id) {
    return __blocks[id] !== undefined;
};

let __notifications = [];

function notify(notification) {
    notification.remove = () => {
        __notifications = __notifications.filter(d => d !== notification);
        window.parent.dw.backend.fire('notifications.change', __notifications);
    };
    __notifications.push(notification);
    try {
        window.parent.dw.backend.fire('notifications.change', __notifications);
        return notification.remove;
    } catch (ex) {
        /* not in editor, do nothing */
    }
}

/* eslint-env node */

Column.types = columnTypes;

// dw.start.js
const dw$1 = {
    version: 'chart-core@8.47.0',
    dataset: Dataset,
    column: Column,
    datasource: {
        delimited,
        json
    },
    utils,
    chart,
    visualization,
    theme,
    block,
    notify
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = dw$1;
    }
    exports.dw = dw$1;
} else {
    window.dw = dw$1;
}

module.exports = dw$1;
//# sourceMappingURL=dw-2.0.cjs.js.map
