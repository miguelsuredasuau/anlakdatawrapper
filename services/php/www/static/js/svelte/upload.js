(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../../../static/vendor/jschardet/jschardet.min', '../../../../../../../../static/vendor/xlsx/xlsx.full.min'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.upload = factory(global.jschardet));
}(this, (function (jschardet) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var jschardet__default = /*#__PURE__*/_interopDefaultLegacy(jschardet);

	function noop$1() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function addListener(node, event, handler, options) {
		node.addEventListener(event, handler, options);
	}

	function removeListener(node, event, handler, options) {
		node.removeEventListener(event, handler, options);
	}

	function setAttribute(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function selectOption(select, value) {
		for (var i = 0; i < select.options.length; i += 1) {
			var option = select.options[i];

			if (option.__value === value) {
				option.selected = true;
				return;
			}
		}
	}

	function selectValue(select) {
		var selectedOption = select.querySelector(':checked') || select.options[0];
		return selectedOption && selectedOption.__value;
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop$1;
		this.fire('destroy');
		this.set = noop$1;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function destroyDev(detach) {
		destroy.call(this, detach);
		this.destroy = function() {
			console.warn('Component was already destroyed');
		};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get$1() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function _stage(newState) {
		assign(this._staged, newState);
	}

	function setDev(newState) {
		if (typeof newState !== 'object') {
			throw new Error(
				this._debugName + '.set was called without an object of data key-values to update.'
			);
		}

		this._checkReadOnly(newState);
		set.call(this, newState);
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var protoDev = {
		destroy: destroyDev,
		get: get$1,
		fire,
		on,
		set: setDev,
		_recompute: noop$1,
		_set,
		_stage,
		_mount,
		_differs
	};

	var js_cookie = {exports: {}};

	/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */

	(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	}(js_cookie));

	var Cookies = js_cookie.exports;

	const CSRF_COOKIE_NAME = 'crumb';
	const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
	const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

	/**
	 * The response body is automatically parsed according
	 * to the response content type.
	 *
	 * @exports httpReq
	 * @kind function
	 *
	 * @param {string} path               - the url path that gets appended to baseUrl
	 * @param {object} options.body       - raw body to be send with req
	 * @param {object} options.payload    - raw JSON payload to be send with req (will overwrite options.body)
	 * @param {boolean} options.raw       - disable parsing of response body, returns raw response
	 * @param {string} options.baseUrl    - base for url, defaults to dw api domain
	 * @param {*} options                 - see documentation for window.fetch for additional options
	 *
	 * @returns {Promise} promise of parsed response body or raw response
	 *
	 * @example
	 *  import httpReq from '@datawrapper/shared/httpReq';
	 *  let res = await httpReq('/v3/charts', {
	 *      method: 'post',
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 *  import { post } from '@datawrapper/shared/httpReq';
	 *  res = await post('/v3/charts', {
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 *  // send raw csv
	 *  await httpReq.put(`/v3/charts/${chartId}/data`, {
	 *       body: csvData,
	 *       headers: {
	 *           'Content-Type': 'text/csv'
	 *       }
	 *   });
	 */
	function httpReq(path, options = {}) {
	    if (!options.fetch) {
	        try {
	            options.fetch = window.fetch;
	        } catch (e) {
	            throw new Error('Neither options.fetch nor window.fetch is defined.');
	        }
	    }
	    if (!options.baseUrl) {
	        try {
	            options.baseUrl = `//${window.dw.backend.__api_domain}`;
	        } catch (e) {
	            throw new Error('Neither options.baseUrl nor window.dw is defined.');
	        }
	    }
	    const { payload, baseUrl, fetch, raw, ...opts } = {
	        payload: null,
	        raw: false,
	        method: 'GET',
	        mode: 'cors',
	        credentials: 'include',
	        ...options,
	        headers: {
	            'Content-Type': 'application/json',
	            ...options.headers
	        }
	    };
	    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	    if (payload) {
	        // overwrite body
	        opts.body = JSON.stringify(payload);
	    }

	    let promise;
	    if (!CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
	        const csrfCookieValue = Cookies.get(CSRF_COOKIE_NAME);
	        if (csrfCookieValue) {
	            opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	            promise = fetch(url, opts);
	        } else {
	            promise = httpReq('/v3/me', { fetch, baseUrl })
	                .then(() => {
	                    const csrfCookieValue = Cookies.get(CSRF_COOKIE_NAME);
	                    if (csrfCookieValue) {
	                        opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	                    }
	                })
	                .catch(() => {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
	                .then(() => fetch(url, opts));
	        }
	    } else {
	        promise = fetch(url, opts);
	    }
	    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
	    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
	    // all repositories that use @datawrapper/shared.

	    return promise.then(res => {
	        if (raw) return res;
	        if (!res.ok) throw new HttpReqError(res);
	        if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
	        // trim away the ;charset=utf-8 from content-type
	        const contentType = res.headers.get('content-type').split(';')[0];
	        if (contentType === 'application/json') {
	            return res.json();
	        }
	        if (contentType === 'image/png' || contentType === 'application/pdf') {
	            return res.blob();
	        }
	        // default to text for all other content types
	        return res.text();
	    });
	}

	/**
	 * Like `httpReq` but with fixed http method GET
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.get
	 * @kind function
	 */
	(httpReq.get = httpReqVerb('GET'));

	/**
	 * Like `httpReq` but with fixed http method PATCH
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.patch
	 * @kind function
	 */
	(httpReq.patch = httpReqVerb('PATCH'));

	/**
	 * Like `httpReq` but with fixed http method PUT
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.put
	 * @kind function
	 */
	(httpReq.put = httpReqVerb('PUT'));

	/**
	 * Like `httpReq` but with fixed http method POST
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.post
	 * @kind function
	 */
	(httpReq.post = httpReqVerb('POST'));

	/**
	 * Like `httpReq` but with fixed http method HEAD
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.head
	 * @kind function
	 */
	(httpReq.head = httpReqVerb('HEAD'));

	/**
	 * Like `httpReq` but with fixed http method DELETE
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.delete
	 * @kind function
	 */
	httpReq.delete = httpReqVerb('DELETE');

	function httpReqVerb(method) {
	    return (path, options) => {
	        if (options && options.method) {
	            throw new Error(
	                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
	            );
	        }
	        return httpReq(path, { ...options, method });
	    };
	}

	class HttpReqError extends Error {
	    constructor(res) {
	        super();
	        this.name = 'HttpReqError';
	        this.status = res.status;
	        this.statusText = res.statusText;
	        this.message = `[${res.status}] ${res.statusText}`;
	        this.response = res;
	    }
	}

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
	function clone(obj) {
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
	function get(object, path, defaultValue) {
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
	    return get(obj, path);
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
	function random(min, max) {
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
	var _escape = createEscaper(escapeMap);

	// Internal list of HTML entities for unescaping.
	var unescapeMap = invert(escapeMap);

	// Function for unescaping strings from HTML interpolation.
	var _unescape = createEscaper(unescapeMap);

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
	function contains(obj, item, fromIndex, guard) {
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
	function max(obj, iteratee, context) {
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
	function min(obj, iteratee, context) {
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
	    return obj[random(obj.length - 1)];
	  }
	  var sample = isArrayLike(obj) ? clone(obj) : values(obj);
	  var length = getLength(sample);
	  n = Math.max(Math.min(n, length), 0);
	  var last = length - 1;
	  for (var index = 0; index < n; index++) {
	    var rand = random(index, last);
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
	      return !contains(keys, key);
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
	    return !contains(rest, value);
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
	      if (!contains(seen, computed)) {
	        seen.push(computed);
	        result.push(value);
	      }
	    } else if (!contains(result, value)) {
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
	    if (contains(result, item)) continue;
	    var j;
	    for (j = 1; j < argsLength; j++) {
	      if (!contains(arguments[j], item)) break;
	    }
	    if (j === argsLength) result.push(item);
	  }
	  return result;
	}

	// Complement of zip. Unzip accepts an array of arrays and groups
	// each array's elements on shared indices.
	function unzip(array) {
	  var length = array && max(array, getLength).length || 0;
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
		clone: clone,
		tap: tap,
		get: get,
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
		random: random,
		now: now,
		escape: _escape,
		unescape: _unescape,
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
		contains: contains,
		includes: contains,
		include: contains,
		invoke: invoke,
		pluck: pluck,
		where: where,
		max: max,
		min: min,
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

	/* globals dw */

	const __messages = {};

	function initMessages(scope = 'core') {
	    // let's check if we're in a chart
	    if (scope === 'chart') {
	        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	            // use in-chart translations
	            __messages[scope] = window.__dw.vis.meta.locale || {};
	        }
	    } else {
	        // use backend translations
	        __messages[scope] =
	            scope === 'core'
	                ? dw.backend.__messages.core
	                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
	    }
	}

	/**
	 * translates a message key. translations are originally stored in a
	 * Google spreadsheet that we're pulling into Datawrapper using the
	 * `scripts/update-translations` script, which stores them as `:locale.json`
	 * files in the /locale folders (both in core as well as inside plugin folders)
	 *
	 * for the client-side translation to work we are also storing the translations
	 * in the global `window.dw.backend.__messages` object. plugins that need
	 * client-side translations must set `"svelte": true` in their plugin.json
	 *
	 * @param {string} key -- the key to be translated, e.g. "signup / hed"
	 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
	 * @returns {string} -- the translated text
	 */
	function __(key, scope = 'core') {
	    key = key.trim();
	    if (!__messages[scope]) initMessages(scope);
	    if (!__messages[scope][key]) return 'MISSING:' + key;
	    var translation = __messages[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, (m, i) => {
	            i = 2 + Number(i);
	            if (arguments[i] === undefined) return m;
	            return arguments[i];
	        });
	    }
	    return translation;
	}

	/* upload/TextAreaUpload.html generated by Svelte v2.16.1 */



	let app$1;
	const chart = dw.backend.currentChart;

	const updateData = throttle(() => {
	    const { chartData } = app$1.get();
	    httpReq.put(`/v3/charts/${chart.get('id')}/data`, {
	        body: chartData,
	        headers: {
	            'Content-Type': 'text/csv'
	        }
	    });
	}, 1000);

	function data$4() {
	    return {
	        placeholder: __('upload / paste here')
	    };
	}
	function oncreate$1() {
	    app$1 = this;
	}
	function onupdate$2({ changed, current, previous }) {
	    if (
	        changed.chartData &&
	        current.chartData &&
	        previous &&
	        previous.chartData !== current.chartData
	    ) {
	        updateData();
	    }
	}
	const file$3 = "upload/TextAreaUpload.html";

	function create_main_fragment$3(component, ctx) {
		var form, div, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ chartData: textarea.value });
			textarea_updating = false;
		}

		return {
			c: function create() {
				form = createElement("form");
				div = createElement("div");
				textarea = createElement("textarea");
				addListener(textarea, "input", textarea_input_handler);
				textarea.readOnly = ctx.readonly;
				textarea.id = "upload-data-text";
				setStyle(textarea, "resize", "none");
				textarea.placeholder = ctx.placeholder;
				textarea.className = "svelte-kl1kny";
				addLoc(textarea, file$3, 2, 8, 67);
				div.className = "control-group";
				addLoc(div, file$3, 1, 4, 31);
				form.className = "upload-form";
				addLoc(form, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, form, anchor);
				append(form, div);
				append(div, textarea);

				textarea.value = ctx.chartData;
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.chartData) textarea.value = ctx.chartData;
				if (changed.readonly) {
					textarea.readOnly = ctx.readonly;
				}

				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(form);
				}

				removeListener(textarea, "input", textarea_input_handler);
			}
		};
	}

	function TextAreaUpload(options) {
		this._debugName = '<TextAreaUpload>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$4(), options.data);
		if (!('chartData' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'chartData'");
		if (!('readonly' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'readonly'");
		if (!('placeholder' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'placeholder'");
		this._intro = true;
		this._handlers.update = [onupdate$2];

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TextAreaUpload.prototype, protoDev);

	TextAreaUpload.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* upload/UploadHelp.html generated by Svelte v2.16.1 */

	/* globals dw */
	function datasetsArray({ datasets }) {
	    return Object.keys(datasets).map(k => datasets[k]);
	}
	function data$3() {
	    return {
	        selectedDataset: '--'
	    };
	}
	function onupdate$1({ changed, current }) {
	    if (changed.selectedDataset && current.selectedDataset !== '--') {
	        const sel = current.selectedDataset;
	        this.set({ chartData: sel.data });
	        if (sel.presets) {
	            Object.keys(sel.presets).forEach(k => {
	                dw.backend.currentChart.set(k, sel.presets[k]);
	            });
	        }
	    }
	}
	const file$2 = "upload/UploadHelp.html";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.dataset = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var p0, text0_value = __("upload / quick help"), text0, text1, div, p1, text2_value = __("upload / try a dataset"), text2, text3, select, option, text4_value = __("upload / sample dataset"), text4, select_updating = false;

		var each_value = ctx.datasetsArray;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selectedDataset: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				p0 = createElement("p");
				text0 = createText(text0_value);
				text1 = createText("\n\n");
				div = createElement("div");
				p1 = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n    ");
				select = createElement("select");
				option = createElement("option");
				text4 = createText(text4_value);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(p0, file$2, 0, 0, 0);
				addLoc(p1, file$2, 3, 4, 70);
				option.__value = "--";
				option.value = option.__value;
				addLoc(option, file$2, 5, 8, 201);
				addListener(select, "change", select_change_handler);
				if (!('selectedDataset' in ctx)) component.root._beforecreate.push(select_change_handler);
				select.disabled = ctx.readonly;
				select.id = "demo-datasets";
				select.className = "svelte-16u58l0";
				addLoc(select, file$2, 4, 4, 114);
				div.className = "demo-datasets";
				addLoc(div, file$2, 2, 0, 38);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				append(p0, text0);
				insert(target, text1, anchor);
				insert(target, div, anchor);
				append(div, p1);
				append(p1, text2);
				append(div, text3);
				append(div, select);
				append(select, option);
				append(option, text4);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.selectedDataset);
			},

			p: function update(changed, ctx) {
				if (changed.datasetsArray) {
					each_value = ctx.datasetsArray;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.selectedDataset) selectOption(select, ctx.selectedDataset);
				if (changed.readonly) {
					select.disabled = ctx.readonly;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
					detachNode(text1);
					detachNode(div);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (9:12) {#each group.datasets as dataset}
	function create_each_block_1(component, ctx) {
		var option, text_value = ctx.dataset.title, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.dataset;
				option.value = option.__value;
				option.className = "demo-dataset";
				addLoc(option, file$2, 9, 12, 400);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.datasetsArray) && text_value !== (text_value = ctx.dataset.title)) {
					setData(text, text_value);
				}

				if ((changed.datasetsArray) && option_value_value !== (option_value_value = ctx.dataset)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (7:8) {#each datasetsArray as group}
	function create_each_block$2(component, ctx) {
		var optgroup, optgroup_label_value;

		var each_value_1 = ctx.group.datasets;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.group.type);
				addLoc(optgroup, file$2, 7, 8, 310);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.datasetsArray) {
					each_value_1 = ctx.group.datasets;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(optgroup, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}

				if ((changed.datasetsArray) && optgroup_label_value !== (optgroup_label_value = ctx.group.type)) {
					setAttribute(optgroup, "label", optgroup_label_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(optgroup);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	function UploadHelp(options) {
		this._debugName = '<UploadHelp>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);

		this._recompute({ datasets: 1 }, this._state);
		if (!('datasets' in this._state)) console.warn("<UploadHelp> was created without expected data property 'datasets'");
		if (!('readonly' in this._state)) console.warn("<UploadHelp> was created without expected data property 'readonly'");
		if (!('selectedDataset' in this._state)) console.warn("<UploadHelp> was created without expected data property 'selectedDataset'");
		this._intro = true;
		this._handlers.update = [onupdate$1];

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(() => {
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(UploadHelp.prototype, protoDev);

	UploadHelp.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('datasetsArray' in newState && !this._updatingReadonlyProperty) throw new Error("<UploadHelp>: Cannot set read-only property 'datasetsArray'");
	};

	UploadHelp.prototype._recompute = function _recompute(changed, state) {
		if (changed.datasets) {
			if (this._differs(state.datasetsArray, (state.datasetsArray = datasetsArray(state)))) changed.datasetsArray = true;
		}
	};

	/* upload/SelectSheet.html generated by Svelte v2.16.1 */



	/* globals dw */
	function data$2() {
	    return {
	        selected: false,
	        sheets: []
	    };
	}
	async function onupdate({ changed, current }) {
	    if (changed.sheets && current.sheets.length > 1) {
	        setTimeout(() => {
	            this.set({ selected: current.sheets[0] });
	        }, 300);
	    } else if (changed.sheets && current.sheets.length === 1) {
	        await httpReq.put(`/v3/charts/${dw.backend.currentChart.get('id')}/data`, {
	            body: current.sheets[0].csv,
	            headers: {
	                'Content-Type': 'text/csv'
	            }
	        });
	        window.location.href = 'describe';
	    }

	    if (changed.selected && current.selected.csv) {
	        this.set({ chartData: current.selected.csv });
	    }
	}
	const file$1 = "upload/SelectSheet.html";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.sheet = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div;

		function select_block_type(ctx) {
			if (!ctx.sheets.length) return create_if_block$1;
			if (ctx.sheets.length>1) return create_if_block_1$1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				addLoc(div, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (11:4) {:else}
	function create_else_block(component, ctx) {
		var p, raw_value = __('upload / xls / uploading data');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$1, 11, 4, 375);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop$1,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (4:29) 
	function create_if_block_1$1(component, ctx) {
		var p, text0_value = __("upload / select sheet"), text0, text1, select, select_updating = false, select_disabled_value;

		var each_value = ctx.sheets;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText(text0_value);
				text1 = createText("\n    ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(p, file$1, 4, 4, 141);
				addListener(select, "change", select_change_handler);
				if (!('selected' in ctx)) component.root._beforecreate.push(select_change_handler);
				select.disabled = select_disabled_value = !ctx.sheets.length;
				select.className = "svelte-16u58l0";
				addLoc(select, file$1, 5, 4, 184);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, text0);
				insert(target, text1, anchor);
				insert(target, select, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.selected);
			},

			p: function update(changed, ctx) {
				if (changed.sheets) {
					each_value = ctx.sheets;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.selected) selectOption(select, ctx.selected);
				if ((changed.sheets) && select_disabled_value !== (select_disabled_value = !ctx.sheets.length)) {
					select.disabled = select_disabled_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text1);
					detachNode(select);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (2:4) {#if !sheets.length}
	function create_if_block$1(component, ctx) {
		var div, raw_value = __('upload / parsing-xls');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-info";
				addLoc(div, file$1, 2, 4, 35);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: noop$1,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (7:8) {#each sheets as sheet}
	function create_each_block$1(component, ctx) {
		var option, text_value = ctx.sheet.name, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.sheet;
				option.value = option.__value;
				addLoc(option, file$1, 7, 8, 283);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sheets) && text_value !== (text_value = ctx.sheet.name)) {
					setData(text, text_value);
				}

				if ((changed.sheets) && option_value_value !== (option_value_value = ctx.sheet)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	function SelectSheet(options) {
		this._debugName = '<SelectSheet>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('sheets' in this._state)) console.warn("<SelectSheet> was created without expected data property 'sheets'");
		if (!('selected' in this._state)) console.warn("<SelectSheet> was created without expected data property 'selected'");
		this._intro = true;
		this._handlers.update = [onupdate];

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(() => {
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectSheet.prototype, protoDev);

	SelectSheet.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	// eslint-disable-next-line

	function readFile (file, callback) {
	    var reader = new FileReader();
	    reader.onload = function () {
	        try {
	            var array = new Uint8Array(reader.result);
	            var string = '';
	            let nonAscii = 0;
	            for (var i = 0; i < array.length; ++i) {
	                if (array[i] > 122) nonAscii++;
	                string += String.fromCharCode(array[i]);
	            }
	            // eslint-disable-next-line
	            let res = jschardet__default['default'].detect(string);
	            // jschardet performs poorly if there are not a lot of non-ascii characters
	            // in the input file, so we'll just ignore what it says and assume utf-8
	            // (unless jschardet is *really* sure ;)
	            if (res.confidence <= 0.95 && nonAscii < 10) res.encoding = 'utf-8';
	            reader = new FileReader();
	            reader.onload = () => callback(null, reader.result);
	            reader.readAsText(file, res.encoding);
	        } catch (e) {
	            console.warn(e);
	            callback(null, reader.result);
	        }
	    };
	    reader.readAsArrayBuffer(file);
	}

	/* global XLSX */

	/**
	 * parses an XLS spreadsheet file
	 */
	function readSpreadsheet (file, callback) {
	    const rABS =
	        typeof FileReader !== 'undefined' && (FileReader.prototype || {}).readAsBinaryString;
	    const reader = new FileReader();

	    reader.onload = function () {
	        try {
	            const data = !rABS ? new Uint8Array(reader.result) : reader.result;
	            const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
	            callback(
	                null,
	                wb.SheetNames.map(n => {
	                    return {
	                        name: n,
	                        sheet: wb.Sheets[n],
	                        csv: XLSX.utils.sheet_to_csv(wb.Sheets[n])
	                    };
	                })
	            );
	        } catch (e) {
	            console.error(e);
	            callback(null, reader.result);
	        }
	    };
	    reader.readAsBinaryString(file);
	}

	/* upload/App.html generated by Svelte v2.16.1 */



	let app;

	const coreUploads = [
	    {
	        id: 'copy',
	        title: __('upload / copy-paste'),
	        longTitle: __('upload / copy-paste / long'),
	        icon: 'fa fa-clipboard',
	        mainPanel: TextAreaUpload,
	        sidebar: UploadHelp,
	        action() {}
	    },
	    {
	        id: 'upload',
	        title: __('upload / upload-csv'),
	        longTitle: __('upload / upload-csv / long'),
	        icon: 'fa-file-excel-o fa',
	        mainPanel: TextAreaUpload,
	        sidebar: UploadHelp,
	        isFileUpload: true,
	        async onFileUpload(event) {
	            const file = event.target.files[0];
	            if (
	                file.type.substr(0, 5) === 'text/' ||
	                file.name.substr(file.name.length - 4) === '.csv'
	            ) {
	                app.set({ Sidebar: UploadHelp });
	                readFile(file, async (err, result) => {
	                    if (err) return console.error('could not read file', err);
	                    await httpReq.put(`/v3/charts/${dw.backend.currentChart.get('id')}/data`, {
	                        body: result,
	                        headers: {
	                            'Content-Type': 'text/csv'
	                        }
	                    });
	                    window.location.href = 'describe';
	                });
	            } else if (file.type.substr(0, 12) === 'application/') {
	                app.set({ Sidebar: SelectSheet, sheets: [] }); // reset
	                readSpreadsheet(file, (err, sheets) => {
	                    if (err) return app.set({ error: err });
	                    app.set({ sheets });
	                });
	            } else {
	                console.error(file.type);
	                console.error(file);
	                app.set({ error: __('upload / csv-required') });
	            }
	        },
	        action() {}
	    }
	];

	function data$1() {
	    return {
	        dragover: false,
	        MainPanel: TextAreaUpload,
	        Sidebar: UploadHelp,
	        active: coreUploads[0],
	        buttons: coreUploads,
	        sheets: [],
	        chart: {
	            id: ''
	        },
	        readonly: false,
	        chartData: '',
	        transpose: false,
	        firstRowIsHeader: true,
	        skipRows: 0
	    };
	}
	var methods = {
	    addButton(btn) {
	        coreUploads.push(btn);
	        this.set({ buttons: coreUploads });
	        const { defaultMethod } = this.get();
	        if (btn.id === defaultMethod) {
	            this.btnAction(btn);
	        }
	    },
	    btnAction(btn) {
	        this.set({ active: btn });
	        if (btn.id !== 'external-data') {
	            // turn off externalData, if still set
	            const { dw_chart } = this.store.get();
	            if (dw_chart.get('externalData')) {
	                dw_chart.set('externalData', '');
	                setTimeout(() => {
	                    dw.backend.currentChart.save();
	                }, 1000);
	            }
	        }
	        let activeKey = btn.id;
	        if (btn.id === 'upload') {
	            activeKey = 'copy';
	            setTimeout(() => {
	                // reset after 1sec
	                // this.set({active:coreUploads[0]});
	            }, 1000);
	        }
	        const { dw_chart } = this.store.get();
	        dw_chart.set('metadata.data.upload-method', activeKey);
	        if (btn.action) btn.action();
	        if (btn.mainPanel) this.set({ MainPanel: btn.mainPanel });
	        if (btn.sidebar) this.set({ Sidebar: btn.sidebar });
	    },
	    btnUpload(btn, event) {
	        if (btn.onFileUpload) btn.onFileUpload(event);
	    },
	    dragStart(event) {
	        const { active } = this.get();
	        if (active.id === 'copy') {
	            event.preventDefault();
	            this.set({ dragover: true });
	        }
	    },
	    resetDrag() {
	        this.set({ dragover: false });
	    },
	    onFileDrop(event) {
	        const { active } = this.get();
	        if (active.id !== 'copy') return;
	        // Prevent default behavior (Prevent file from being opened)
	        this.resetDrag();
	        event.preventDefault();
	        const files = [];
	        if (event.dataTransfer.items) {
	            // Use DataTransferItemList interface to access the file(s)
	            for (let i = 0; i < event.dataTransfer.items.length; i++) {
	                // If dropped items aren't files, reject them
	                if (event.dataTransfer.items[i].kind === 'file') {
	                    files.push(event.dataTransfer.items[i].getAsFile());
	                }
	            }
	            event.dataTransfer.items.clear();
	        } else {
	            // Use DataTransfer interface to access the file(s)
	            for (let i = 0; i < event.dataTransfer.files.length; i++) {
	                files.push(event.dataTransfer.files[i]);
	            }
	            event.dataTransfer.items.clear();
	        }
	        for (let i = 0; i < files.length; i++) {
	            if (files[i].type.substr(0, 5) === 'text/') {
	                return readFile(files[i], async (err, result) => {
	                    if (err) return console.error('could not read file', err);

	                    await httpReq.put(
	                        `/v3/charts/${dw.backend.currentChart.get('id')}/data`,
	                        {
	                            body: result,
	                            headers: {
	                                'Content-Type': 'text/csv'
	                            }
	                        }
	                    );

	                    window.location.href = 'describe';
	                });
	            }
	        }
	    }
	};

	function oncreate() {
	    app = this;
	    const { dw_chart } = this.store.get();
	    const method = dw_chart.get('metadata.data.upload-method', 'copy');
	    this.set({ defaultMethod: method });
	    coreUploads.forEach(u => {
	        if (u.id === method) {
	            this.set({ active: u });
	        }
	    });
	}
	const file = "upload/App.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.btnAction(ctx.btn);
	}

	function change_handler(event) {
		const { component, ctx } = this._svelte;

		component.btnUpload(ctx.btn, event);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.btn = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var div5, text0, div4, div1, div0, h3, raw_value = __('upload / title'), text1, ul, text2, text3, h4, text4_value = ctx.active.longTitle || ctx.active.title, text4, text5, switch_instance0_updating = {}, text6, div3, switch_instance1_updating = {}, text7, div2, a, text8_value = __("Proceed"), text8, text9, i, div4_style_value;

		var if_block0 = (ctx.dragover) && create_if_block_2();

		var each_value = ctx.buttons;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block(component, get_each_context(ctx, each_value, i_1));
		}

		var if_block1 = (ctx.error) && create_if_block(component, ctx);

		var switch_value = ctx.Sidebar;

		function switch_props(ctx) {
			var switch_instance0_initial_data = {};
			if (ctx.chartData
	                     !== void 0) {
				switch_instance0_initial_data.chartData = ctx.chartData
	                    ;
				switch_instance0_updating.chartData = true;
			}
			if (ctx.readonly
	                     !== void 0) {
				switch_instance0_initial_data.readonly = ctx.readonly
	                    ;
				switch_instance0_updating.readonly = true;
			}
			if (ctx.sheets
	                     !== void 0) {
				switch_instance0_initial_data.sheets = ctx.sheets
	                    ;
				switch_instance0_updating.sheets = true;
			}
			if (ctx.datasets
	                 !== void 0) {
				switch_instance0_initial_data.datasets = ctx.datasets
	                ;
				switch_instance0_updating.datasets = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance0_initial_data,
				_bind(changed, childState) {
					var newState = {};
					if (!switch_instance0_updating.chartData && changed.chartData) {
						newState.chartData = childState.chartData;
					}

					if (!switch_instance0_updating.readonly && changed.readonly) {
						newState.readonly = childState.readonly;
					}

					if (!switch_instance0_updating.sheets && changed.sheets) {
						newState.sheets = childState.sheets;
					}

					if (!switch_instance0_updating.datasets && changed.datasets) {
						newState.datasets = childState.datasets;
					}
					component._set(newState);
					switch_instance0_updating = {};
				}
			};
		}

		if (switch_value) {
			var switch_instance0 = new switch_value(switch_props(ctx));

			component.root._beforecreate.push(() => {
				switch_instance0._bind({ chartData: 1, readonly: 1, sheets: 1, datasets: 1 }, switch_instance0.get());
			});
		}

		var switch_value_1 = ctx.MainPanel;

		function switch_props_1(ctx) {
			var switch_instance1_initial_data = {};
			if (ctx.chartData  !== void 0) {
				switch_instance1_initial_data.chartData = ctx.chartData ;
				switch_instance1_updating.chartData = true;
			}
			if (ctx.readonly  !== void 0) {
				switch_instance1_initial_data.readonly = ctx.readonly ;
				switch_instance1_updating.readonly = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance1_initial_data,
				_bind(changed, childState) {
					var newState = {};
					if (!switch_instance1_updating.chartData && changed.chartData) {
						newState.chartData = childState.chartData;
					}

					if (!switch_instance1_updating.readonly && changed.readonly) {
						newState.readonly = childState.readonly;
					}
					component._set(newState);
					switch_instance1_updating = {};
				}
			};
		}

		if (switch_value_1) {
			var switch_instance1 = new switch_value_1(switch_props_1(ctx));

			component.root._beforecreate.push(() => {
				switch_instance1._bind({ chartData: 1, readonly: 1 }, switch_instance1.get());
			});
		}

		function drop_handler(event) {
			component.onFileDrop(event);
		}

		function dragover_handler(event) {
			component.dragStart(event);
		}

		function dragenter_handler(event) {
			component.dragStart(event);
		}

		function dragend_handler(event) {
			component.resetDrag();
		}

		function dragleave_handler(event) {
			component.resetDrag();
		}

		return {
			c: function create() {
				div5 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    \n    ");
				div4 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");
				h3 = createElement("h3");
				text1 = createText("\n\n                ");
				ul = createElement("ul");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text2 = createText("\n\n                ");
				if (if_block1) if_block1.c();
				text3 = createText("\n\n                ");
				h4 = createElement("h4");
				text4 = createText(text4_value);
				text5 = createText("\n\n                ");
				if (switch_instance0) switch_instance0._fragment.c();
				text6 = createText("\n        ");
				div3 = createElement("div");
				if (switch_instance1) switch_instance1._fragment.c();
				text7 = createText("\n\n            ");
				div2 = createElement("div");
				a = createElement("a");
				text8 = createText(text8_value);
				text9 = createText(" ");
				i = createElement("i");
				addLoc(h3, file, 16, 16, 546);
				ul.className = "import-methods svelte-oe6wy4";
				addLoc(ul, file, 18, 16, 601);
				h4.className = "svelte-oe6wy4";
				addLoc(h4, file, 44, 16, 1666);
				div0.className = "sidebar";
				addLoc(div0, file, 15, 12, 508);
				div1.className = "span5";
				addLoc(div1, file, 14, 8, 476);
				i.className = "icon-chevron-right icon-white";
				addLoc(i, file, 60, 36, 2250);
				a.href = "describe";
				a.className = "submit btn btn-primary svelte-oe6wy4";
				a.id = "describe-proceed";
				addLoc(a, file, 59, 16, 2141);
				div2.className = "buttons pull-right";
				addLoc(div2, file, 58, 12, 2092);
				div3.className = "span7";
				addLoc(div3, file, 55, 8, 1978);
				div4.className = "row";
				div4.style.cssText = div4_style_value = ctx.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none': '';
				addLoc(div4, file, 13, 4, 356);
				addListener(div5, "drop", drop_handler);
				addListener(div5, "dragover", dragover_handler);
				addListener(div5, "dragenter", dragenter_handler);
				addListener(div5, "dragend", dragend_handler);
				addListener(div5, "dragleave", dragleave_handler);
				div5.className = "chart-editor dw-create-upload upload-data";
				addLoc(div5, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				if (if_block0) if_block0.m(div5, null);
				append(div5, text0);
				append(div5, div4);
				append(div4, div1);
				append(div1, div0);
				append(div0, h3);
				h3.innerHTML = raw_value;
				append(div0, text1);
				append(div0, ul);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(ul, null);
				}

				append(div0, text2);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text3);
				append(div0, h4);
				append(h4, text4);
				append(div0, text5);

				if (switch_instance0) {
					switch_instance0._mount(div0, null);
				}

				append(div4, text6);
				append(div4, div3);

				if (switch_instance1) {
					switch_instance1._mount(div3, null);
				}

				append(div3, text7);
				append(div3, div2);
				append(div2, a);
				append(a, text8);
				append(a, text9);
				append(a, i);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.dragover) {
					if (!if_block0) {
						if_block0 = create_if_block_2();
						if_block0.c();
						if_block0.m(div5, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.active || changed.buttons) {
					each_value = ctx.buttons;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						const child_ctx = get_each_context(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(ul, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.error) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block(component, ctx);
						if_block1.c();
						if_block1.m(div0, text3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.active) && text4_value !== (text4_value = ctx.active.longTitle || ctx.active.title)) {
					setData(text4, text4_value);
				}

				var switch_instance0_changes = {};
				if (!switch_instance0_updating.chartData && changed.chartData) {
					switch_instance0_changes.chartData = ctx.chartData
	                    ;
					switch_instance0_updating.chartData = ctx.chartData
	                     !== void 0;
				}
				if (!switch_instance0_updating.readonly && changed.readonly) {
					switch_instance0_changes.readonly = ctx.readonly
	                    ;
					switch_instance0_updating.readonly = ctx.readonly
	                     !== void 0;
				}
				if (!switch_instance0_updating.sheets && changed.sheets) {
					switch_instance0_changes.sheets = ctx.sheets
	                    ;
					switch_instance0_updating.sheets = ctx.sheets
	                     !== void 0;
				}
				if (!switch_instance0_updating.datasets && changed.datasets) {
					switch_instance0_changes.datasets = ctx.datasets
	                ;
					switch_instance0_updating.datasets = ctx.datasets
	                 !== void 0;
				}

				if (switch_value !== (switch_value = ctx.Sidebar)) {
					if (switch_instance0) {
						switch_instance0.destroy();
					}

					if (switch_value) {
						switch_instance0 = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.chartData
	                     === void 0) changed.chartData = 1;
							if (ctx.readonly
	                     === void 0) changed.readonly = 1;
							if (ctx.sheets
	                     === void 0) changed.sheets = 1;
							if (ctx.datasets
	                 === void 0) changed.datasets = 1;
							switch_instance0._bind(changed, switch_instance0.get());
						});
						switch_instance0._fragment.c();
						switch_instance0._mount(div0, null);
					} else {
						switch_instance0 = null;
					}
				}

				else if (switch_value) {
					switch_instance0._set(switch_instance0_changes);
					switch_instance0_updating = {};
				}

				var switch_instance1_changes = {};
				if (!switch_instance1_updating.chartData && changed.chartData) {
					switch_instance1_changes.chartData = ctx.chartData ;
					switch_instance1_updating.chartData = ctx.chartData  !== void 0;
				}
				if (!switch_instance1_updating.readonly && changed.readonly) {
					switch_instance1_changes.readonly = ctx.readonly ;
					switch_instance1_updating.readonly = ctx.readonly  !== void 0;
				}

				if (switch_value_1 !== (switch_value_1 = ctx.MainPanel)) {
					if (switch_instance1) {
						switch_instance1.destroy();
					}

					if (switch_value_1) {
						switch_instance1 = new switch_value_1(switch_props_1(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.chartData  === void 0) changed.chartData = 1;
							if (ctx.readonly  === void 0) changed.readonly = 1;
							switch_instance1._bind(changed, switch_instance1.get());
						});
						switch_instance1._fragment.c();
						switch_instance1._mount(div3, text7);
					} else {
						switch_instance1 = null;
					}
				}

				else if (switch_value_1) {
					switch_instance1._set(switch_instance1_changes);
					switch_instance1_updating = {};
				}

				if ((changed.dragover) && div4_style_value !== (div4_style_value = ctx.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none': '')) {
					div4.style.cssText = div4_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div5);
				}

				if (if_block0) if_block0.d();

				destroyEach(each_blocks, detach);

				if (if_block1) if_block1.d();
				if (switch_instance0) switch_instance0.destroy();
				if (switch_instance1) switch_instance1.destroy();
				removeListener(div5, "drop", drop_handler);
				removeListener(div5, "dragover", dragover_handler);
				removeListener(div5, "dragenter", dragenter_handler);
				removeListener(div5, "dragend", dragend_handler);
				removeListener(div5, "dragleave", dragleave_handler);
			}
		};
	}

	// (9:4) {#if dragover}
	function create_if_block_2(component, ctx) {
		var div, raw_value = __('upload / drag-csv-here');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "draginfo svelte-oe6wy4";
				addLoc(div, file, 9, 4, 247);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (23:28) {#if btn.isFileUpload}
	function create_if_block_1(component, ctx) {
		var input;

		return {
			c: function create() {
				input = createElement("input");
				input._svelte = { component, ctx };

				addListener(input, "change", change_handler);
				input.accept = ".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf";
				input.className = "file-upload svelte-oe6wy4";
				setAttribute(input, "type", "file");
				addLoc(input, file, 23, 28, 875);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				input._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "change", change_handler);
			}
		};
	}

	// (20:20) {#each buttons as btn}
	function create_each_block(component, ctx) {
		var li, label, text0, i, i_class_value, text1, span, text2_value = ctx.btn.title, text2, li_class_value;

		var if_block = (ctx.btn.isFileUpload) && create_if_block_1(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				label = createElement("label");
				if (if_block) if_block.c();
				text0 = createText("\n                            ");
				i = createElement("i");
				text1 = createText("\n                            ");
				span = createElement("span");
				text2 = createText(text2_value);
				i.className = i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4";
				addLoc(i, file, 30, 28, 1220);
				span.className = "svelte-oe6wy4";
				addLoc(span, file, 31, 28, 1275);
				label.className = "svelte-oe6wy4";
				addLoc(label, file, 21, 24, 788);

				li._svelte = { component, ctx };

				addListener(li, "click", click_handler);
				li.className = li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-oe6wy4";
				addLoc(li, file, 20, 20, 692);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, label);
				if (if_block) if_block.m(label, null);
				append(label, text0);
				append(label, i);
				append(label, text1);
				append(label, span);
				append(span, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.btn.isFileUpload) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1(component, ctx);
						if_block.c();
						if_block.m(label, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.buttons) && i_class_value !== (i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4")) {
					i.className = i_class_value;
				}

				if ((changed.buttons) && text2_value !== (text2_value = ctx.btn.title)) {
					setData(text2, text2_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.active || changed.buttons) && li_class_value !== (li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-oe6wy4")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				if (if_block) if_block.d();
				removeListener(li, "click", click_handler);
			}
		};
	}

	// (38:16) {#if error}
	function create_if_block(component, ctx) {
		var div1, div0, text_1, raw_before;

		function click_handler_1(event) {
			component.set({error:false});
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "✕";
				text_1 = createText("\n                    ");
				raw_before = createElement('noscript');
				addListener(div0, "click", click_handler_1);
				div0.className = "action close";
				addLoc(div0, file, 39, 20, 1506);
				div1.className = "alert alert-error";
				addLoc(div1, file, 38, 16, 1454);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div1, text_1);
				append(div1, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.error);
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler_1);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('dragover' in this._state)) console.warn("<App> was created without expected data property 'dragover'");
		if (!('buttons' in this._state)) console.warn("<App> was created without expected data property 'buttons'");
		if (!('active' in this._state)) console.warn("<App> was created without expected data property 'active'");
		if (!('error' in this._state)) console.warn("<App> was created without expected data property 'error'");
		if (!('Sidebar' in this._state)) console.warn("<App> was created without expected data property 'Sidebar'");
		if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
		if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");
		if (!('sheets' in this._state)) console.warn("<App> was created without expected data property 'sheets'");
		if (!('datasets' in this._state)) console.warn("<App> was created without expected data property 'datasets'");
		if (!('MainPanel' in this._state)) console.warn("<App> was created without expected data property 'MainPanel'");
		this._intro = true;

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function Store(state, options) {
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs;
	}

	assign(Store.prototype, {
		_add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init(props) {
			const state = {};
			for (let i = 0; i < props.length; i += 1) {
				const prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove(component) {
			let i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set(newState, changed) {
			const previous = this._state;
			this._state = assign(assign({}, previous), newState);

			for (let i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed,
				previous,
				current: this._state
			});

			this._dependents
				.filter(dependent => {
					const componentState = {};
					let dirty = false;

					for (let j = 0; j < dependent.props.length; j += 1) {
						const prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(dependent => {
					dependent.component.set({});
				});

			this.fire('update', {
				changed,
				previous,
				current: this._state
			});
		},

		_sortComputedProperties() {
			const computed = this._computed;
			const sorted = this._sortedComputedProperties = [];
			const visited = blankObject();
			let currentKey;

			function visit(key) {
				const c = computed[key];

				if (c) {
					c.deps.forEach(dep => {
						if (dep === currentKey) {
							throw new Error(`Cyclical dependency detected between ${dep} <-> ${key}`);
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (const key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute(key, deps, fn) {
			let value;

			const c = {
				deps,
				update: (state, changed, dirty) => {
					const values = deps.map(dep => {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						const newValue = fn.apply(null, values);
						if (this._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			const state = assign({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire,

		get: get$1,

		on,

		set(newState) {
			const oldState = this._state;
			const changed = this._changed = {};
			let dirty = false;

			for (const key in newState) {
				if (this._computed[key]) throw new Error(`'${key}' is a read-only computed property`);
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._set(newState, changed);
		}
	});

	const store = new Store({});

	const data = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App, data, store };

	return main;

})));
//# sourceMappingURL=upload.js.map
