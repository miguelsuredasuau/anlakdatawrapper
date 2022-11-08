(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/account/security', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['account/security'] = factory());
}(this, (function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function isPromise(value) {
		return value && typeof value.then === 'function';
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

	function createComment() {
		return document.createComment('');
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

	function handlePromise(promise, info) {
		var token = info.token = {};

		function update(type, index, key, value) {
			if (info.token !== token) return;

			info.resolved = key && { [key]: value };

			const child_ctx = assign(assign({}, info.ctx), info.resolved);
			const block = type && (info.current = type)(info.component, child_ctx);

			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							block.o(() => {
								block.d(1);
								info.blocks[i] = null;
							});
						}
					});
				} else {
					info.block.d(1);
				}

				block.c();
				block[block.i ? 'i' : 'm'](info.mount(), info.anchor);

				info.component.root.set({}); // flush any handlers that were created
			}

			info.block = block;
			if (info.blocks) info.blocks[index] = block;
		}

		if (isPromise(promise)) {
			promise.then(value => {
				update(info.then, 1, info.value, value);
			}, error => {
				update(info.catch, 2, info.error, error);
			});

			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}

			info.resolved = { [info.value]: promise };
		}
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

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

	function get() {
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
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
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
	 * @param {string} options.disableCSFR    - set to true to disable CSFR cookies
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
	            options.baseUrl = window.dw.backend.__api_domain.startsWith('http')
	                ? window.dw.backend.__api_domain
	                : `//${window.dw.backend.__api_domain}`;
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
	    if (opts.headers['Content-Type'].startsWith('multipart/')) {
	        // removing 'Content-Type' will ensure that fetch
	        // sets the correct content type and boundary parameter
	        delete opts.headers['Content-Type'];
	    }

	    let promise;
	    if (!opts.disableCSFR && !CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
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

	var qrcode$1 = {exports: {}};

	(function (module, exports) {
	//---------------------------------------------------------------------
	//
	// QR Code Generator for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//  http://www.opensource.org/licenses/mit-license.php
	//
	// The word 'QR Code' is registered trademark of
	// DENSO WAVE INCORPORATED
	//  http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------

	var qrcode = function() {

	  //---------------------------------------------------------------------
	  // qrcode
	  //---------------------------------------------------------------------

	  /**
	   * qrcode
	   * @param typeNumber 1 to 40
	   * @param errorCorrectionLevel 'L','M','Q','H'
	   */
	  var qrcode = function(typeNumber, errorCorrectionLevel) {

	    var PAD0 = 0xEC;
	    var PAD1 = 0x11;

	    var _typeNumber = typeNumber;
	    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
	    var _modules = null;
	    var _moduleCount = 0;
	    var _dataCache = null;
	    var _dataList = [];

	    var _this = {};

	    var makeImpl = function(test, maskPattern) {

	      _moduleCount = _typeNumber * 4 + 17;
	      _modules = function(moduleCount) {
	        var modules = new Array(moduleCount);
	        for (var row = 0; row < moduleCount; row += 1) {
	          modules[row] = new Array(moduleCount);
	          for (var col = 0; col < moduleCount; col += 1) {
	            modules[row][col] = null;
	          }
	        }
	        return modules;
	      }(_moduleCount);

	      setupPositionProbePattern(0, 0);
	      setupPositionProbePattern(_moduleCount - 7, 0);
	      setupPositionProbePattern(0, _moduleCount - 7);
	      setupPositionAdjustPattern();
	      setupTimingPattern();
	      setupTypeInfo(test, maskPattern);

	      if (_typeNumber >= 7) {
	        setupTypeNumber(test);
	      }

	      if (_dataCache == null) {
	        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
	      }

	      mapData(_dataCache, maskPattern);
	    };

	    var setupPositionProbePattern = function(row, col) {

	      for (var r = -1; r <= 7; r += 1) {

	        if (row + r <= -1 || _moduleCount <= row + r) continue;

	        for (var c = -1; c <= 7; c += 1) {

	          if (col + c <= -1 || _moduleCount <= col + c) continue;

	          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
	              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
	              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
	            _modules[row + r][col + c] = true;
	          } else {
	            _modules[row + r][col + c] = false;
	          }
	        }
	      }
	    };

	    var getBestMaskPattern = function() {

	      var minLostPoint = 0;
	      var pattern = 0;

	      for (var i = 0; i < 8; i += 1) {

	        makeImpl(true, i);

	        var lostPoint = QRUtil.getLostPoint(_this);

	        if (i == 0 || minLostPoint > lostPoint) {
	          minLostPoint = lostPoint;
	          pattern = i;
	        }
	      }

	      return pattern;
	    };

	    var setupTimingPattern = function() {

	      for (var r = 8; r < _moduleCount - 8; r += 1) {
	        if (_modules[r][6] != null) {
	          continue;
	        }
	        _modules[r][6] = (r % 2 == 0);
	      }

	      for (var c = 8; c < _moduleCount - 8; c += 1) {
	        if (_modules[6][c] != null) {
	          continue;
	        }
	        _modules[6][c] = (c % 2 == 0);
	      }
	    };

	    var setupPositionAdjustPattern = function() {

	      var pos = QRUtil.getPatternPosition(_typeNumber);

	      for (var i = 0; i < pos.length; i += 1) {

	        for (var j = 0; j < pos.length; j += 1) {

	          var row = pos[i];
	          var col = pos[j];

	          if (_modules[row][col] != null) {
	            continue;
	          }

	          for (var r = -2; r <= 2; r += 1) {

	            for (var c = -2; c <= 2; c += 1) {

	              if (r == -2 || r == 2 || c == -2 || c == 2
	                  || (r == 0 && c == 0) ) {
	                _modules[row + r][col + c] = true;
	              } else {
	                _modules[row + r][col + c] = false;
	              }
	            }
	          }
	        }
	      }
	    };

	    var setupTypeNumber = function(test) {

	      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

	      for (var i = 0; i < 18; i += 1) {
	        var mod = (!test && ( (bits >> i) & 1) == 1);
	        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
	      }

	      for (var i = 0; i < 18; i += 1) {
	        var mod = (!test && ( (bits >> i) & 1) == 1);
	        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
	      }
	    };

	    var setupTypeInfo = function(test, maskPattern) {

	      var data = (_errorCorrectionLevel << 3) | maskPattern;
	      var bits = QRUtil.getBCHTypeInfo(data);

	      // vertical
	      for (var i = 0; i < 15; i += 1) {

	        var mod = (!test && ( (bits >> i) & 1) == 1);

	        if (i < 6) {
	          _modules[i][8] = mod;
	        } else if (i < 8) {
	          _modules[i + 1][8] = mod;
	        } else {
	          _modules[_moduleCount - 15 + i][8] = mod;
	        }
	      }

	      // horizontal
	      for (var i = 0; i < 15; i += 1) {

	        var mod = (!test && ( (bits >> i) & 1) == 1);

	        if (i < 8) {
	          _modules[8][_moduleCount - i - 1] = mod;
	        } else if (i < 9) {
	          _modules[8][15 - i - 1 + 1] = mod;
	        } else {
	          _modules[8][15 - i - 1] = mod;
	        }
	      }

	      // fixed module
	      _modules[_moduleCount - 8][8] = (!test);
	    };

	    var mapData = function(data, maskPattern) {

	      var inc = -1;
	      var row = _moduleCount - 1;
	      var bitIndex = 7;
	      var byteIndex = 0;
	      var maskFunc = QRUtil.getMaskFunction(maskPattern);

	      for (var col = _moduleCount - 1; col > 0; col -= 2) {

	        if (col == 6) col -= 1;

	        while (true) {

	          for (var c = 0; c < 2; c += 1) {

	            if (_modules[row][col - c] == null) {

	              var dark = false;

	              if (byteIndex < data.length) {
	                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
	              }

	              var mask = maskFunc(row, col - c);

	              if (mask) {
	                dark = !dark;
	              }

	              _modules[row][col - c] = dark;
	              bitIndex -= 1;

	              if (bitIndex == -1) {
	                byteIndex += 1;
	                bitIndex = 7;
	              }
	            }
	          }

	          row += inc;

	          if (row < 0 || _moduleCount <= row) {
	            row -= inc;
	            inc = -inc;
	            break;
	          }
	        }
	      }
	    };

	    var createBytes = function(buffer, rsBlocks) {

	      var offset = 0;

	      var maxDcCount = 0;
	      var maxEcCount = 0;

	      var dcdata = new Array(rsBlocks.length);
	      var ecdata = new Array(rsBlocks.length);

	      for (var r = 0; r < rsBlocks.length; r += 1) {

	        var dcCount = rsBlocks[r].dataCount;
	        var ecCount = rsBlocks[r].totalCount - dcCount;

	        maxDcCount = Math.max(maxDcCount, dcCount);
	        maxEcCount = Math.max(maxEcCount, ecCount);

	        dcdata[r] = new Array(dcCount);

	        for (var i = 0; i < dcdata[r].length; i += 1) {
	          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
	        }
	        offset += dcCount;

	        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
	        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

	        var modPoly = rawPoly.mod(rsPoly);
	        ecdata[r] = new Array(rsPoly.getLength() - 1);
	        for (var i = 0; i < ecdata[r].length; i += 1) {
	          var modIndex = i + modPoly.getLength() - ecdata[r].length;
	          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
	        }
	      }

	      var totalCodeCount = 0;
	      for (var i = 0; i < rsBlocks.length; i += 1) {
	        totalCodeCount += rsBlocks[i].totalCount;
	      }

	      var data = new Array(totalCodeCount);
	      var index = 0;

	      for (var i = 0; i < maxDcCount; i += 1) {
	        for (var r = 0; r < rsBlocks.length; r += 1) {
	          if (i < dcdata[r].length) {
	            data[index] = dcdata[r][i];
	            index += 1;
	          }
	        }
	      }

	      for (var i = 0; i < maxEcCount; i += 1) {
	        for (var r = 0; r < rsBlocks.length; r += 1) {
	          if (i < ecdata[r].length) {
	            data[index] = ecdata[r][i];
	            index += 1;
	          }
	        }
	      }

	      return data;
	    };

	    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

	      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

	      var buffer = qrBitBuffer();

	      for (var i = 0; i < dataList.length; i += 1) {
	        var data = dataList[i];
	        buffer.put(data.getMode(), 4);
	        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
	        data.write(buffer);
	      }

	      // calc num max data.
	      var totalDataCount = 0;
	      for (var i = 0; i < rsBlocks.length; i += 1) {
	        totalDataCount += rsBlocks[i].dataCount;
	      }

	      if (buffer.getLengthInBits() > totalDataCount * 8) {
	        throw 'code length overflow. ('
	          + buffer.getLengthInBits()
	          + '>'
	          + totalDataCount * 8
	          + ')';
	      }

	      // end code
	      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
	        buffer.put(0, 4);
	      }

	      // padding
	      while (buffer.getLengthInBits() % 8 != 0) {
	        buffer.putBit(false);
	      }

	      // padding
	      while (true) {

	        if (buffer.getLengthInBits() >= totalDataCount * 8) {
	          break;
	        }
	        buffer.put(PAD0, 8);

	        if (buffer.getLengthInBits() >= totalDataCount * 8) {
	          break;
	        }
	        buffer.put(PAD1, 8);
	      }

	      return createBytes(buffer, rsBlocks);
	    };

	    _this.addData = function(data, mode) {

	      mode = mode || 'Byte';

	      var newData = null;

	      switch(mode) {
	      case 'Numeric' :
	        newData = qrNumber(data);
	        break;
	      case 'Alphanumeric' :
	        newData = qrAlphaNum(data);
	        break;
	      case 'Byte' :
	        newData = qr8BitByte(data);
	        break;
	      case 'Kanji' :
	        newData = qrKanji(data);
	        break;
	      default :
	        throw 'mode:' + mode;
	      }

	      _dataList.push(newData);
	      _dataCache = null;
	    };

	    _this.isDark = function(row, col) {
	      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
	        throw row + ',' + col;
	      }
	      return _modules[row][col];
	    };

	    _this.getModuleCount = function() {
	      return _moduleCount;
	    };

	    _this.make = function() {
	      if (_typeNumber < 1) {
	        var typeNumber = 1;

	        for (; typeNumber < 40; typeNumber++) {
	          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
	          var buffer = qrBitBuffer();

	          for (var i = 0; i < _dataList.length; i++) {
	            var data = _dataList[i];
	            buffer.put(data.getMode(), 4);
	            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
	            data.write(buffer);
	          }

	          var totalDataCount = 0;
	          for (var i = 0; i < rsBlocks.length; i++) {
	            totalDataCount += rsBlocks[i].dataCount;
	          }

	          if (buffer.getLengthInBits() <= totalDataCount * 8) {
	            break;
	          }
	        }

	        _typeNumber = typeNumber;
	      }

	      makeImpl(false, getBestMaskPattern() );
	    };

	    _this.createTableTag = function(cellSize, margin) {

	      cellSize = cellSize || 2;
	      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

	      var qrHtml = '';

	      qrHtml += '<table style="';
	      qrHtml += ' border-width: 0px; border-style: none;';
	      qrHtml += ' border-collapse: collapse;';
	      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
	      qrHtml += '">';
	      qrHtml += '<tbody>';

	      for (var r = 0; r < _this.getModuleCount(); r += 1) {

	        qrHtml += '<tr>';

	        for (var c = 0; c < _this.getModuleCount(); c += 1) {
	          qrHtml += '<td style="';
	          qrHtml += ' border-width: 0px; border-style: none;';
	          qrHtml += ' border-collapse: collapse;';
	          qrHtml += ' padding: 0px; margin: 0px;';
	          qrHtml += ' width: ' + cellSize + 'px;';
	          qrHtml += ' height: ' + cellSize + 'px;';
	          qrHtml += ' background-color: ';
	          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
	          qrHtml += ';';
	          qrHtml += '"/>';
	        }

	        qrHtml += '</tr>';
	      }

	      qrHtml += '</tbody>';
	      qrHtml += '</table>';

	      return qrHtml;
	    };

	    _this.createSvgTag = function(cellSize, margin, alt, title) {

	      var opts = {};
	      if (typeof arguments[0] == 'object') {
	        // Called by options.
	        opts = arguments[0];
	        // overwrite cellSize and margin.
	        cellSize = opts.cellSize;
	        margin = opts.margin;
	        alt = opts.alt;
	        title = opts.title;
	      }

	      cellSize = cellSize || 2;
	      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

	      // Compose alt property surrogate
	      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
	      alt.text = alt.text || null;
	      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

	      // Compose title property surrogate
	      title = (typeof title === 'string') ? {text: title} : title || {};
	      title.text = title.text || null;
	      title.id = (title.text) ? title.id || 'qrcode-title' : null;

	      var size = _this.getModuleCount() * cellSize + margin * 2;
	      var c, mc, r, mr, qrSvg='', rect;

	      rect = 'l' + cellSize + ',0 0,' + cellSize +
	        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

	      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
	      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
	      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
	      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
	      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
	          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
	      qrSvg += '>';
	      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
	          escapeXml(title.text) + '</title>' : '';
	      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
	          escapeXml(alt.text) + '</description>' : '';
	      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
	      qrSvg += '<path d="';

	      for (r = 0; r < _this.getModuleCount(); r += 1) {
	        mr = r * cellSize + margin;
	        for (c = 0; c < _this.getModuleCount(); c += 1) {
	          if (_this.isDark(r, c) ) {
	            mc = c*cellSize+margin;
	            qrSvg += 'M' + mc + ',' + mr + rect;
	          }
	        }
	      }

	      qrSvg += '" stroke="transparent" fill="black"/>';
	      qrSvg += '</svg>';

	      return qrSvg;
	    };

	    _this.createDataURL = function(cellSize, margin) {

	      cellSize = cellSize || 2;
	      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

	      var size = _this.getModuleCount() * cellSize + margin * 2;
	      var min = margin;
	      var max = size - margin;

	      return createDataURL(size, size, function(x, y) {
	        if (min <= x && x < max && min <= y && y < max) {
	          var c = Math.floor( (x - min) / cellSize);
	          var r = Math.floor( (y - min) / cellSize);
	          return _this.isDark(r, c)? 0 : 1;
	        } else {
	          return 1;
	        }
	      } );
	    };

	    _this.createImgTag = function(cellSize, margin, alt) {

	      cellSize = cellSize || 2;
	      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

	      var size = _this.getModuleCount() * cellSize + margin * 2;

	      var img = '';
	      img += '<img';
	      img += '\u0020src="';
	      img += _this.createDataURL(cellSize, margin);
	      img += '"';
	      img += '\u0020width="';
	      img += size;
	      img += '"';
	      img += '\u0020height="';
	      img += size;
	      img += '"';
	      if (alt) {
	        img += '\u0020alt="';
	        img += escapeXml(alt);
	        img += '"';
	      }
	      img += '/>';

	      return img;
	    };

	    var escapeXml = function(s) {
	      var escaped = '';
	      for (var i = 0; i < s.length; i += 1) {
	        var c = s.charAt(i);
	        switch(c) {
	        case '<': escaped += '&lt;'; break;
	        case '>': escaped += '&gt;'; break;
	        case '&': escaped += '&amp;'; break;
	        case '"': escaped += '&quot;'; break;
	        default : escaped += c; break;
	        }
	      }
	      return escaped;
	    };

	    var _createHalfASCII = function(margin) {
	      var cellSize = 1;
	      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

	      var size = _this.getModuleCount() * cellSize + margin * 2;
	      var min = margin;
	      var max = size - margin;

	      var y, x, r1, r2, p;

	      var blocks = {
	        '██': '█',
	        '█ ': '▀',
	        ' █': '▄',
	        '  ': ' '
	      };

	      var blocksLastLineNoMargin = {
	        '██': '▀',
	        '█ ': '▀',
	        ' █': ' ',
	        '  ': ' '
	      };

	      var ascii = '';
	      for (y = 0; y < size; y += 2) {
	        r1 = Math.floor((y - min) / cellSize);
	        r2 = Math.floor((y + 1 - min) / cellSize);
	        for (x = 0; x < size; x += 1) {
	          p = '█';

	          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
	            p = ' ';
	          }

	          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
	            p += ' ';
	          }
	          else {
	            p += '█';
	          }

	          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
	          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
	        }

	        ascii += '\n';
	      }

	      if (size % 2 && margin > 0) {
	        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
	      }

	      return ascii.substring(0, ascii.length-1);
	    };

	    _this.createASCII = function(cellSize, margin) {
	      cellSize = cellSize || 1;

	      if (cellSize < 2) {
	        return _createHalfASCII(margin);
	      }

	      cellSize -= 1;
	      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

	      var size = _this.getModuleCount() * cellSize + margin * 2;
	      var min = margin;
	      var max = size - margin;

	      var y, x, r, p;

	      var white = Array(cellSize+1).join('██');
	      var black = Array(cellSize+1).join('  ');

	      var ascii = '';
	      var line = '';
	      for (y = 0; y < size; y += 1) {
	        r = Math.floor( (y - min) / cellSize);
	        line = '';
	        for (x = 0; x < size; x += 1) {
	          p = 1;

	          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
	            p = 0;
	          }

	          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
	          line += p ? white : black;
	        }

	        for (r = 0; r < cellSize; r += 1) {
	          ascii += line + '\n';
	        }
	      }

	      return ascii.substring(0, ascii.length-1);
	    };

	    _this.renderTo2dContext = function(context, cellSize) {
	      cellSize = cellSize || 2;
	      var length = _this.getModuleCount();
	      for (var row = 0; row < length; row++) {
	        for (var col = 0; col < length; col++) {
	          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
	          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
	        }
	      }
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // qrcode.stringToBytes
	  //---------------------------------------------------------------------

	  qrcode.stringToBytesFuncs = {
	    'default' : function(s) {
	      var bytes = [];
	      for (var i = 0; i < s.length; i += 1) {
	        var c = s.charCodeAt(i);
	        bytes.push(c & 0xff);
	      }
	      return bytes;
	    }
	  };

	  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

	  //---------------------------------------------------------------------
	  // qrcode.createStringToBytes
	  //---------------------------------------------------------------------

	  /**
	   * @param unicodeData base64 string of byte array.
	   * [16bit Unicode],[16bit Bytes], ...
	   * @param numChars
	   */
	  qrcode.createStringToBytes = function(unicodeData, numChars) {

	    // create conversion map.

	    var unicodeMap = function() {

	      var bin = base64DecodeInputStream(unicodeData);
	      var read = function() {
	        var b = bin.read();
	        if (b == -1) throw 'eof';
	        return b;
	      };

	      var count = 0;
	      var unicodeMap = {};
	      while (true) {
	        var b0 = bin.read();
	        if (b0 == -1) break;
	        var b1 = read();
	        var b2 = read();
	        var b3 = read();
	        var k = String.fromCharCode( (b0 << 8) | b1);
	        var v = (b2 << 8) | b3;
	        unicodeMap[k] = v;
	        count += 1;
	      }
	      if (count != numChars) {
	        throw count + ' != ' + numChars;
	      }

	      return unicodeMap;
	    }();

	    var unknownChar = '?'.charCodeAt(0);

	    return function(s) {
	      var bytes = [];
	      for (var i = 0; i < s.length; i += 1) {
	        var c = s.charCodeAt(i);
	        if (c < 128) {
	          bytes.push(c);
	        } else {
	          var b = unicodeMap[s.charAt(i)];
	          if (typeof b == 'number') {
	            if ( (b & 0xff) == b) {
	              // 1byte
	              bytes.push(b);
	            } else {
	              // 2bytes
	              bytes.push(b >>> 8);
	              bytes.push(b & 0xff);
	            }
	          } else {
	            bytes.push(unknownChar);
	          }
	        }
	      }
	      return bytes;
	    };
	  };

	  //---------------------------------------------------------------------
	  // QRMode
	  //---------------------------------------------------------------------

	  var QRMode = {
	    MODE_NUMBER :    1 << 0,
	    MODE_ALPHA_NUM : 1 << 1,
	    MODE_8BIT_BYTE : 1 << 2,
	    MODE_KANJI :     1 << 3
	  };

	  //---------------------------------------------------------------------
	  // QRErrorCorrectionLevel
	  //---------------------------------------------------------------------

	  var QRErrorCorrectionLevel = {
	    L : 1,
	    M : 0,
	    Q : 3,
	    H : 2
	  };

	  //---------------------------------------------------------------------
	  // QRMaskPattern
	  //---------------------------------------------------------------------

	  var QRMaskPattern = {
	    PATTERN000 : 0,
	    PATTERN001 : 1,
	    PATTERN010 : 2,
	    PATTERN011 : 3,
	    PATTERN100 : 4,
	    PATTERN101 : 5,
	    PATTERN110 : 6,
	    PATTERN111 : 7
	  };

	  //---------------------------------------------------------------------
	  // QRUtil
	  //---------------------------------------------------------------------

	  var QRUtil = function() {

	    var PATTERN_POSITION_TABLE = [
	      [],
	      [6, 18],
	      [6, 22],
	      [6, 26],
	      [6, 30],
	      [6, 34],
	      [6, 22, 38],
	      [6, 24, 42],
	      [6, 26, 46],
	      [6, 28, 50],
	      [6, 30, 54],
	      [6, 32, 58],
	      [6, 34, 62],
	      [6, 26, 46, 66],
	      [6, 26, 48, 70],
	      [6, 26, 50, 74],
	      [6, 30, 54, 78],
	      [6, 30, 56, 82],
	      [6, 30, 58, 86],
	      [6, 34, 62, 90],
	      [6, 28, 50, 72, 94],
	      [6, 26, 50, 74, 98],
	      [6, 30, 54, 78, 102],
	      [6, 28, 54, 80, 106],
	      [6, 32, 58, 84, 110],
	      [6, 30, 58, 86, 114],
	      [6, 34, 62, 90, 118],
	      [6, 26, 50, 74, 98, 122],
	      [6, 30, 54, 78, 102, 126],
	      [6, 26, 52, 78, 104, 130],
	      [6, 30, 56, 82, 108, 134],
	      [6, 34, 60, 86, 112, 138],
	      [6, 30, 58, 86, 114, 142],
	      [6, 34, 62, 90, 118, 146],
	      [6, 30, 54, 78, 102, 126, 150],
	      [6, 24, 50, 76, 102, 128, 154],
	      [6, 28, 54, 80, 106, 132, 158],
	      [6, 32, 58, 84, 110, 136, 162],
	      [6, 26, 54, 82, 110, 138, 166],
	      [6, 30, 58, 86, 114, 142, 170]
	    ];
	    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
	    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
	    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

	    var _this = {};

	    var getBCHDigit = function(data) {
	      var digit = 0;
	      while (data != 0) {
	        digit += 1;
	        data >>>= 1;
	      }
	      return digit;
	    };

	    _this.getBCHTypeInfo = function(data) {
	      var d = data << 10;
	      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
	        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
	      }
	      return ( (data << 10) | d) ^ G15_MASK;
	    };

	    _this.getBCHTypeNumber = function(data) {
	      var d = data << 12;
	      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
	        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
	      }
	      return (data << 12) | d;
	    };

	    _this.getPatternPosition = function(typeNumber) {
	      return PATTERN_POSITION_TABLE[typeNumber - 1];
	    };

	    _this.getMaskFunction = function(maskPattern) {

	      switch (maskPattern) {

	      case QRMaskPattern.PATTERN000 :
	        return function(i, j) { return (i + j) % 2 == 0; };
	      case QRMaskPattern.PATTERN001 :
	        return function(i, j) { return i % 2 == 0; };
	      case QRMaskPattern.PATTERN010 :
	        return function(i, j) { return j % 3 == 0; };
	      case QRMaskPattern.PATTERN011 :
	        return function(i, j) { return (i + j) % 3 == 0; };
	      case QRMaskPattern.PATTERN100 :
	        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
	      case QRMaskPattern.PATTERN101 :
	        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
	      case QRMaskPattern.PATTERN110 :
	        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
	      case QRMaskPattern.PATTERN111 :
	        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

	      default :
	        throw 'bad maskPattern:' + maskPattern;
	      }
	    };

	    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
	      var a = qrPolynomial([1], 0);
	      for (var i = 0; i < errorCorrectLength; i += 1) {
	        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
	      }
	      return a;
	    };

	    _this.getLengthInBits = function(mode, type) {

	      if (1 <= type && type < 10) {

	        // 1 - 9

	        switch(mode) {
	        case QRMode.MODE_NUMBER    : return 10;
	        case QRMode.MODE_ALPHA_NUM : return 9;
	        case QRMode.MODE_8BIT_BYTE : return 8;
	        case QRMode.MODE_KANJI     : return 8;
	        default :
	          throw 'mode:' + mode;
	        }

	      } else if (type < 27) {

	        // 10 - 26

	        switch(mode) {
	        case QRMode.MODE_NUMBER    : return 12;
	        case QRMode.MODE_ALPHA_NUM : return 11;
	        case QRMode.MODE_8BIT_BYTE : return 16;
	        case QRMode.MODE_KANJI     : return 10;
	        default :
	          throw 'mode:' + mode;
	        }

	      } else if (type < 41) {

	        // 27 - 40

	        switch(mode) {
	        case QRMode.MODE_NUMBER    : return 14;
	        case QRMode.MODE_ALPHA_NUM : return 13;
	        case QRMode.MODE_8BIT_BYTE : return 16;
	        case QRMode.MODE_KANJI     : return 12;
	        default :
	          throw 'mode:' + mode;
	        }

	      } else {
	        throw 'type:' + type;
	      }
	    };

	    _this.getLostPoint = function(qrcode) {

	      var moduleCount = qrcode.getModuleCount();

	      var lostPoint = 0;

	      // LEVEL1

	      for (var row = 0; row < moduleCount; row += 1) {
	        for (var col = 0; col < moduleCount; col += 1) {

	          var sameCount = 0;
	          var dark = qrcode.isDark(row, col);

	          for (var r = -1; r <= 1; r += 1) {

	            if (row + r < 0 || moduleCount <= row + r) {
	              continue;
	            }

	            for (var c = -1; c <= 1; c += 1) {

	              if (col + c < 0 || moduleCount <= col + c) {
	                continue;
	              }

	              if (r == 0 && c == 0) {
	                continue;
	              }

	              if (dark == qrcode.isDark(row + r, col + c) ) {
	                sameCount += 1;
	              }
	            }
	          }

	          if (sameCount > 5) {
	            lostPoint += (3 + sameCount - 5);
	          }
	        }
	      }
	      // LEVEL2

	      for (var row = 0; row < moduleCount - 1; row += 1) {
	        for (var col = 0; col < moduleCount - 1; col += 1) {
	          var count = 0;
	          if (qrcode.isDark(row, col) ) count += 1;
	          if (qrcode.isDark(row + 1, col) ) count += 1;
	          if (qrcode.isDark(row, col + 1) ) count += 1;
	          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
	          if (count == 0 || count == 4) {
	            lostPoint += 3;
	          }
	        }
	      }

	      // LEVEL3

	      for (var row = 0; row < moduleCount; row += 1) {
	        for (var col = 0; col < moduleCount - 6; col += 1) {
	          if (qrcode.isDark(row, col)
	              && !qrcode.isDark(row, col + 1)
	              &&  qrcode.isDark(row, col + 2)
	              &&  qrcode.isDark(row, col + 3)
	              &&  qrcode.isDark(row, col + 4)
	              && !qrcode.isDark(row, col + 5)
	              &&  qrcode.isDark(row, col + 6) ) {
	            lostPoint += 40;
	          }
	        }
	      }

	      for (var col = 0; col < moduleCount; col += 1) {
	        for (var row = 0; row < moduleCount - 6; row += 1) {
	          if (qrcode.isDark(row, col)
	              && !qrcode.isDark(row + 1, col)
	              &&  qrcode.isDark(row + 2, col)
	              &&  qrcode.isDark(row + 3, col)
	              &&  qrcode.isDark(row + 4, col)
	              && !qrcode.isDark(row + 5, col)
	              &&  qrcode.isDark(row + 6, col) ) {
	            lostPoint += 40;
	          }
	        }
	      }

	      // LEVEL4

	      var darkCount = 0;

	      for (var col = 0; col < moduleCount; col += 1) {
	        for (var row = 0; row < moduleCount; row += 1) {
	          if (qrcode.isDark(row, col) ) {
	            darkCount += 1;
	          }
	        }
	      }

	      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	      lostPoint += ratio * 10;

	      return lostPoint;
	    };

	    return _this;
	  }();

	  //---------------------------------------------------------------------
	  // QRMath
	  //---------------------------------------------------------------------

	  var QRMath = function() {

	    var EXP_TABLE = new Array(256);
	    var LOG_TABLE = new Array(256);

	    // initialize tables
	    for (var i = 0; i < 8; i += 1) {
	      EXP_TABLE[i] = 1 << i;
	    }
	    for (var i = 8; i < 256; i += 1) {
	      EXP_TABLE[i] = EXP_TABLE[i - 4]
	        ^ EXP_TABLE[i - 5]
	        ^ EXP_TABLE[i - 6]
	        ^ EXP_TABLE[i - 8];
	    }
	    for (var i = 0; i < 255; i += 1) {
	      LOG_TABLE[EXP_TABLE[i] ] = i;
	    }

	    var _this = {};

	    _this.glog = function(n) {

	      if (n < 1) {
	        throw 'glog(' + n + ')';
	      }

	      return LOG_TABLE[n];
	    };

	    _this.gexp = function(n) {

	      while (n < 0) {
	        n += 255;
	      }

	      while (n >= 256) {
	        n -= 255;
	      }

	      return EXP_TABLE[n];
	    };

	    return _this;
	  }();

	  //---------------------------------------------------------------------
	  // qrPolynomial
	  //---------------------------------------------------------------------

	  function qrPolynomial(num, shift) {

	    if (typeof num.length == 'undefined') {
	      throw num.length + '/' + shift;
	    }

	    var _num = function() {
	      var offset = 0;
	      while (offset < num.length && num[offset] == 0) {
	        offset += 1;
	      }
	      var _num = new Array(num.length - offset + shift);
	      for (var i = 0; i < num.length - offset; i += 1) {
	        _num[i] = num[i + offset];
	      }
	      return _num;
	    }();

	    var _this = {};

	    _this.getAt = function(index) {
	      return _num[index];
	    };

	    _this.getLength = function() {
	      return _num.length;
	    };

	    _this.multiply = function(e) {

	      var num = new Array(_this.getLength() + e.getLength() - 1);

	      for (var i = 0; i < _this.getLength(); i += 1) {
	        for (var j = 0; j < e.getLength(); j += 1) {
	          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
	        }
	      }

	      return qrPolynomial(num, 0);
	    };

	    _this.mod = function(e) {

	      if (_this.getLength() - e.getLength() < 0) {
	        return _this;
	      }

	      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

	      var num = new Array(_this.getLength() );
	      for (var i = 0; i < _this.getLength(); i += 1) {
	        num[i] = _this.getAt(i);
	      }

	      for (var i = 0; i < e.getLength(); i += 1) {
	        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
	      }

	      // recursive call
	      return qrPolynomial(num, 0).mod(e);
	    };

	    return _this;
	  }
	  //---------------------------------------------------------------------
	  // QRRSBlock
	  //---------------------------------------------------------------------

	  var QRRSBlock = function() {

	    var RS_BLOCK_TABLE = [

	      // L
	      // M
	      // Q
	      // H

	      // 1
	      [1, 26, 19],
	      [1, 26, 16],
	      [1, 26, 13],
	      [1, 26, 9],

	      // 2
	      [1, 44, 34],
	      [1, 44, 28],
	      [1, 44, 22],
	      [1, 44, 16],

	      // 3
	      [1, 70, 55],
	      [1, 70, 44],
	      [2, 35, 17],
	      [2, 35, 13],

	      // 4
	      [1, 100, 80],
	      [2, 50, 32],
	      [2, 50, 24],
	      [4, 25, 9],

	      // 5
	      [1, 134, 108],
	      [2, 67, 43],
	      [2, 33, 15, 2, 34, 16],
	      [2, 33, 11, 2, 34, 12],

	      // 6
	      [2, 86, 68],
	      [4, 43, 27],
	      [4, 43, 19],
	      [4, 43, 15],

	      // 7
	      [2, 98, 78],
	      [4, 49, 31],
	      [2, 32, 14, 4, 33, 15],
	      [4, 39, 13, 1, 40, 14],

	      // 8
	      [2, 121, 97],
	      [2, 60, 38, 2, 61, 39],
	      [4, 40, 18, 2, 41, 19],
	      [4, 40, 14, 2, 41, 15],

	      // 9
	      [2, 146, 116],
	      [3, 58, 36, 2, 59, 37],
	      [4, 36, 16, 4, 37, 17],
	      [4, 36, 12, 4, 37, 13],

	      // 10
	      [2, 86, 68, 2, 87, 69],
	      [4, 69, 43, 1, 70, 44],
	      [6, 43, 19, 2, 44, 20],
	      [6, 43, 15, 2, 44, 16],

	      // 11
	      [4, 101, 81],
	      [1, 80, 50, 4, 81, 51],
	      [4, 50, 22, 4, 51, 23],
	      [3, 36, 12, 8, 37, 13],

	      // 12
	      [2, 116, 92, 2, 117, 93],
	      [6, 58, 36, 2, 59, 37],
	      [4, 46, 20, 6, 47, 21],
	      [7, 42, 14, 4, 43, 15],

	      // 13
	      [4, 133, 107],
	      [8, 59, 37, 1, 60, 38],
	      [8, 44, 20, 4, 45, 21],
	      [12, 33, 11, 4, 34, 12],

	      // 14
	      [3, 145, 115, 1, 146, 116],
	      [4, 64, 40, 5, 65, 41],
	      [11, 36, 16, 5, 37, 17],
	      [11, 36, 12, 5, 37, 13],

	      // 15
	      [5, 109, 87, 1, 110, 88],
	      [5, 65, 41, 5, 66, 42],
	      [5, 54, 24, 7, 55, 25],
	      [11, 36, 12, 7, 37, 13],

	      // 16
	      [5, 122, 98, 1, 123, 99],
	      [7, 73, 45, 3, 74, 46],
	      [15, 43, 19, 2, 44, 20],
	      [3, 45, 15, 13, 46, 16],

	      // 17
	      [1, 135, 107, 5, 136, 108],
	      [10, 74, 46, 1, 75, 47],
	      [1, 50, 22, 15, 51, 23],
	      [2, 42, 14, 17, 43, 15],

	      // 18
	      [5, 150, 120, 1, 151, 121],
	      [9, 69, 43, 4, 70, 44],
	      [17, 50, 22, 1, 51, 23],
	      [2, 42, 14, 19, 43, 15],

	      // 19
	      [3, 141, 113, 4, 142, 114],
	      [3, 70, 44, 11, 71, 45],
	      [17, 47, 21, 4, 48, 22],
	      [9, 39, 13, 16, 40, 14],

	      // 20
	      [3, 135, 107, 5, 136, 108],
	      [3, 67, 41, 13, 68, 42],
	      [15, 54, 24, 5, 55, 25],
	      [15, 43, 15, 10, 44, 16],

	      // 21
	      [4, 144, 116, 4, 145, 117],
	      [17, 68, 42],
	      [17, 50, 22, 6, 51, 23],
	      [19, 46, 16, 6, 47, 17],

	      // 22
	      [2, 139, 111, 7, 140, 112],
	      [17, 74, 46],
	      [7, 54, 24, 16, 55, 25],
	      [34, 37, 13],

	      // 23
	      [4, 151, 121, 5, 152, 122],
	      [4, 75, 47, 14, 76, 48],
	      [11, 54, 24, 14, 55, 25],
	      [16, 45, 15, 14, 46, 16],

	      // 24
	      [6, 147, 117, 4, 148, 118],
	      [6, 73, 45, 14, 74, 46],
	      [11, 54, 24, 16, 55, 25],
	      [30, 46, 16, 2, 47, 17],

	      // 25
	      [8, 132, 106, 4, 133, 107],
	      [8, 75, 47, 13, 76, 48],
	      [7, 54, 24, 22, 55, 25],
	      [22, 45, 15, 13, 46, 16],

	      // 26
	      [10, 142, 114, 2, 143, 115],
	      [19, 74, 46, 4, 75, 47],
	      [28, 50, 22, 6, 51, 23],
	      [33, 46, 16, 4, 47, 17],

	      // 27
	      [8, 152, 122, 4, 153, 123],
	      [22, 73, 45, 3, 74, 46],
	      [8, 53, 23, 26, 54, 24],
	      [12, 45, 15, 28, 46, 16],

	      // 28
	      [3, 147, 117, 10, 148, 118],
	      [3, 73, 45, 23, 74, 46],
	      [4, 54, 24, 31, 55, 25],
	      [11, 45, 15, 31, 46, 16],

	      // 29
	      [7, 146, 116, 7, 147, 117],
	      [21, 73, 45, 7, 74, 46],
	      [1, 53, 23, 37, 54, 24],
	      [19, 45, 15, 26, 46, 16],

	      // 30
	      [5, 145, 115, 10, 146, 116],
	      [19, 75, 47, 10, 76, 48],
	      [15, 54, 24, 25, 55, 25],
	      [23, 45, 15, 25, 46, 16],

	      // 31
	      [13, 145, 115, 3, 146, 116],
	      [2, 74, 46, 29, 75, 47],
	      [42, 54, 24, 1, 55, 25],
	      [23, 45, 15, 28, 46, 16],

	      // 32
	      [17, 145, 115],
	      [10, 74, 46, 23, 75, 47],
	      [10, 54, 24, 35, 55, 25],
	      [19, 45, 15, 35, 46, 16],

	      // 33
	      [17, 145, 115, 1, 146, 116],
	      [14, 74, 46, 21, 75, 47],
	      [29, 54, 24, 19, 55, 25],
	      [11, 45, 15, 46, 46, 16],

	      // 34
	      [13, 145, 115, 6, 146, 116],
	      [14, 74, 46, 23, 75, 47],
	      [44, 54, 24, 7, 55, 25],
	      [59, 46, 16, 1, 47, 17],

	      // 35
	      [12, 151, 121, 7, 152, 122],
	      [12, 75, 47, 26, 76, 48],
	      [39, 54, 24, 14, 55, 25],
	      [22, 45, 15, 41, 46, 16],

	      // 36
	      [6, 151, 121, 14, 152, 122],
	      [6, 75, 47, 34, 76, 48],
	      [46, 54, 24, 10, 55, 25],
	      [2, 45, 15, 64, 46, 16],

	      // 37
	      [17, 152, 122, 4, 153, 123],
	      [29, 74, 46, 14, 75, 47],
	      [49, 54, 24, 10, 55, 25],
	      [24, 45, 15, 46, 46, 16],

	      // 38
	      [4, 152, 122, 18, 153, 123],
	      [13, 74, 46, 32, 75, 47],
	      [48, 54, 24, 14, 55, 25],
	      [42, 45, 15, 32, 46, 16],

	      // 39
	      [20, 147, 117, 4, 148, 118],
	      [40, 75, 47, 7, 76, 48],
	      [43, 54, 24, 22, 55, 25],
	      [10, 45, 15, 67, 46, 16],

	      // 40
	      [19, 148, 118, 6, 149, 119],
	      [18, 75, 47, 31, 76, 48],
	      [34, 54, 24, 34, 55, 25],
	      [20, 45, 15, 61, 46, 16]
	    ];

	    var qrRSBlock = function(totalCount, dataCount) {
	      var _this = {};
	      _this.totalCount = totalCount;
	      _this.dataCount = dataCount;
	      return _this;
	    };

	    var _this = {};

	    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

	      switch(errorCorrectionLevel) {
	      case QRErrorCorrectionLevel.L :
	        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	      case QRErrorCorrectionLevel.M :
	        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	      case QRErrorCorrectionLevel.Q :
	        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	      case QRErrorCorrectionLevel.H :
	        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	      default :
	        return undefined;
	      }
	    };

	    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

	      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

	      if (typeof rsBlock == 'undefined') {
	        throw 'bad rs block @ typeNumber:' + typeNumber +
	            '/errorCorrectionLevel:' + errorCorrectionLevel;
	      }

	      var length = rsBlock.length / 3;

	      var list = [];

	      for (var i = 0; i < length; i += 1) {

	        var count = rsBlock[i * 3 + 0];
	        var totalCount = rsBlock[i * 3 + 1];
	        var dataCount = rsBlock[i * 3 + 2];

	        for (var j = 0; j < count; j += 1) {
	          list.push(qrRSBlock(totalCount, dataCount) );
	        }
	      }

	      return list;
	    };

	    return _this;
	  }();

	  //---------------------------------------------------------------------
	  // qrBitBuffer
	  //---------------------------------------------------------------------

	  var qrBitBuffer = function() {

	    var _buffer = [];
	    var _length = 0;

	    var _this = {};

	    _this.getBuffer = function() {
	      return _buffer;
	    };

	    _this.getAt = function(index) {
	      var bufIndex = Math.floor(index / 8);
	      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	    };

	    _this.put = function(num, length) {
	      for (var i = 0; i < length; i += 1) {
	        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
	      }
	    };

	    _this.getLengthInBits = function() {
	      return _length;
	    };

	    _this.putBit = function(bit) {

	      var bufIndex = Math.floor(_length / 8);
	      if (_buffer.length <= bufIndex) {
	        _buffer.push(0);
	      }

	      if (bit) {
	        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
	      }

	      _length += 1;
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // qrNumber
	  //---------------------------------------------------------------------

	  var qrNumber = function(data) {

	    var _mode = QRMode.MODE_NUMBER;
	    var _data = data;

	    var _this = {};

	    _this.getMode = function() {
	      return _mode;
	    };

	    _this.getLength = function(buffer) {
	      return _data.length;
	    };

	    _this.write = function(buffer) {

	      var data = _data;

	      var i = 0;

	      while (i + 2 < data.length) {
	        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
	        i += 3;
	      }

	      if (i < data.length) {
	        if (data.length - i == 1) {
	          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
	        } else if (data.length - i == 2) {
	          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
	        }
	      }
	    };

	    var strToNum = function(s) {
	      var num = 0;
	      for (var i = 0; i < s.length; i += 1) {
	        num = num * 10 + chatToNum(s.charAt(i) );
	      }
	      return num;
	    };

	    var chatToNum = function(c) {
	      if ('0' <= c && c <= '9') {
	        return c.charCodeAt(0) - '0'.charCodeAt(0);
	      }
	      throw 'illegal char :' + c;
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // qrAlphaNum
	  //---------------------------------------------------------------------

	  var qrAlphaNum = function(data) {

	    var _mode = QRMode.MODE_ALPHA_NUM;
	    var _data = data;

	    var _this = {};

	    _this.getMode = function() {
	      return _mode;
	    };

	    _this.getLength = function(buffer) {
	      return _data.length;
	    };

	    _this.write = function(buffer) {

	      var s = _data;

	      var i = 0;

	      while (i + 1 < s.length) {
	        buffer.put(
	          getCode(s.charAt(i) ) * 45 +
	          getCode(s.charAt(i + 1) ), 11);
	        i += 2;
	      }

	      if (i < s.length) {
	        buffer.put(getCode(s.charAt(i) ), 6);
	      }
	    };

	    var getCode = function(c) {

	      if ('0' <= c && c <= '9') {
	        return c.charCodeAt(0) - '0'.charCodeAt(0);
	      } else if ('A' <= c && c <= 'Z') {
	        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
	      } else {
	        switch (c) {
	        case ' ' : return 36;
	        case '$' : return 37;
	        case '%' : return 38;
	        case '*' : return 39;
	        case '+' : return 40;
	        case '-' : return 41;
	        case '.' : return 42;
	        case '/' : return 43;
	        case ':' : return 44;
	        default :
	          throw 'illegal char :' + c;
	        }
	      }
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // qr8BitByte
	  //---------------------------------------------------------------------

	  var qr8BitByte = function(data) {

	    var _mode = QRMode.MODE_8BIT_BYTE;
	    var _bytes = qrcode.stringToBytes(data);

	    var _this = {};

	    _this.getMode = function() {
	      return _mode;
	    };

	    _this.getLength = function(buffer) {
	      return _bytes.length;
	    };

	    _this.write = function(buffer) {
	      for (var i = 0; i < _bytes.length; i += 1) {
	        buffer.put(_bytes[i], 8);
	      }
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // qrKanji
	  //---------------------------------------------------------------------

	  var qrKanji = function(data) {

	    var _mode = QRMode.MODE_KANJI;

	    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
	    if (!stringToBytes) {
	      throw 'sjis not supported.';
	    }
	    !function(c, code) {
	      // self test for sjis support.
	      var test = stringToBytes(c);
	      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
	        throw 'sjis not supported.';
	      }
	    }('\u53cb', 0x9746);

	    var _bytes = stringToBytes(data);

	    var _this = {};

	    _this.getMode = function() {
	      return _mode;
	    };

	    _this.getLength = function(buffer) {
	      return ~~(_bytes.length / 2);
	    };

	    _this.write = function(buffer) {

	      var data = _bytes;

	      var i = 0;

	      while (i + 1 < data.length) {

	        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

	        if (0x8140 <= c && c <= 0x9FFC) {
	          c -= 0x8140;
	        } else if (0xE040 <= c && c <= 0xEBBF) {
	          c -= 0xC140;
	        } else {
	          throw 'illegal char at ' + (i + 1) + '/' + c;
	        }

	        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

	        buffer.put(c, 13);

	        i += 2;
	      }

	      if (i < data.length) {
	        throw 'illegal char at ' + (i + 1);
	      }
	    };

	    return _this;
	  };

	  //=====================================================================
	  // GIF Support etc.
	  //

	  //---------------------------------------------------------------------
	  // byteArrayOutputStream
	  //---------------------------------------------------------------------

	  var byteArrayOutputStream = function() {

	    var _bytes = [];

	    var _this = {};

	    _this.writeByte = function(b) {
	      _bytes.push(b & 0xff);
	    };

	    _this.writeShort = function(i) {
	      _this.writeByte(i);
	      _this.writeByte(i >>> 8);
	    };

	    _this.writeBytes = function(b, off, len) {
	      off = off || 0;
	      len = len || b.length;
	      for (var i = 0; i < len; i += 1) {
	        _this.writeByte(b[i + off]);
	      }
	    };

	    _this.writeString = function(s) {
	      for (var i = 0; i < s.length; i += 1) {
	        _this.writeByte(s.charCodeAt(i) );
	      }
	    };

	    _this.toByteArray = function() {
	      return _bytes;
	    };

	    _this.toString = function() {
	      var s = '';
	      s += '[';
	      for (var i = 0; i < _bytes.length; i += 1) {
	        if (i > 0) {
	          s += ',';
	        }
	        s += _bytes[i];
	      }
	      s += ']';
	      return s;
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // base64EncodeOutputStream
	  //---------------------------------------------------------------------

	  var base64EncodeOutputStream = function() {

	    var _buffer = 0;
	    var _buflen = 0;
	    var _length = 0;
	    var _base64 = '';

	    var _this = {};

	    var writeEncoded = function(b) {
	      _base64 += String.fromCharCode(encode(b & 0x3f) );
	    };

	    var encode = function(n) {
	      if (n < 0) ; else if (n < 26) {
	        return 0x41 + n;
	      } else if (n < 52) {
	        return 0x61 + (n - 26);
	      } else if (n < 62) {
	        return 0x30 + (n - 52);
	      } else if (n == 62) {
	        return 0x2b;
	      } else if (n == 63) {
	        return 0x2f;
	      }
	      throw 'n:' + n;
	    };

	    _this.writeByte = function(n) {

	      _buffer = (_buffer << 8) | (n & 0xff);
	      _buflen += 8;
	      _length += 1;

	      while (_buflen >= 6) {
	        writeEncoded(_buffer >>> (_buflen - 6) );
	        _buflen -= 6;
	      }
	    };

	    _this.flush = function() {

	      if (_buflen > 0) {
	        writeEncoded(_buffer << (6 - _buflen) );
	        _buffer = 0;
	        _buflen = 0;
	      }

	      if (_length % 3 != 0) {
	        // padding
	        var padlen = 3 - _length % 3;
	        for (var i = 0; i < padlen; i += 1) {
	          _base64 += '=';
	        }
	      }
	    };

	    _this.toString = function() {
	      return _base64;
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // base64DecodeInputStream
	  //---------------------------------------------------------------------

	  var base64DecodeInputStream = function(str) {

	    var _str = str;
	    var _pos = 0;
	    var _buffer = 0;
	    var _buflen = 0;

	    var _this = {};

	    _this.read = function() {

	      while (_buflen < 8) {

	        if (_pos >= _str.length) {
	          if (_buflen == 0) {
	            return -1;
	          }
	          throw 'unexpected end of file./' + _buflen;
	        }

	        var c = _str.charAt(_pos);
	        _pos += 1;

	        if (c == '=') {
	          _buflen = 0;
	          return -1;
	        } else if (c.match(/^\s$/) ) {
	          // ignore if whitespace.
	          continue;
	        }

	        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
	        _buflen += 6;
	      }

	      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
	      _buflen -= 8;
	      return n;
	    };

	    var decode = function(c) {
	      if (0x41 <= c && c <= 0x5a) {
	        return c - 0x41;
	      } else if (0x61 <= c && c <= 0x7a) {
	        return c - 0x61 + 26;
	      } else if (0x30 <= c && c <= 0x39) {
	        return c - 0x30 + 52;
	      } else if (c == 0x2b) {
	        return 62;
	      } else if (c == 0x2f) {
	        return 63;
	      } else {
	        throw 'c:' + c;
	      }
	    };

	    return _this;
	  };

	  //---------------------------------------------------------------------
	  // gifImage (B/W)
	  //---------------------------------------------------------------------

	  var gifImage = function(width, height) {

	    var _width = width;
	    var _height = height;
	    var _data = new Array(width * height);

	    var _this = {};

	    _this.setPixel = function(x, y, pixel) {
	      _data[y * _width + x] = pixel;
	    };

	    _this.write = function(out) {

	      //---------------------------------
	      // GIF Signature

	      out.writeString('GIF87a');

	      //---------------------------------
	      // Screen Descriptor

	      out.writeShort(_width);
	      out.writeShort(_height);

	      out.writeByte(0x80); // 2bit
	      out.writeByte(0);
	      out.writeByte(0);

	      //---------------------------------
	      // Global Color Map

	      // black
	      out.writeByte(0x00);
	      out.writeByte(0x00);
	      out.writeByte(0x00);

	      // white
	      out.writeByte(0xff);
	      out.writeByte(0xff);
	      out.writeByte(0xff);

	      //---------------------------------
	      // Image Descriptor

	      out.writeString(',');
	      out.writeShort(0);
	      out.writeShort(0);
	      out.writeShort(_width);
	      out.writeShort(_height);
	      out.writeByte(0);

	      //---------------------------------
	      // Local Color Map

	      //---------------------------------
	      // Raster Data

	      var lzwMinCodeSize = 2;
	      var raster = getLZWRaster(lzwMinCodeSize);

	      out.writeByte(lzwMinCodeSize);

	      var offset = 0;

	      while (raster.length - offset > 255) {
	        out.writeByte(255);
	        out.writeBytes(raster, offset, 255);
	        offset += 255;
	      }

	      out.writeByte(raster.length - offset);
	      out.writeBytes(raster, offset, raster.length - offset);
	      out.writeByte(0x00);

	      //---------------------------------
	      // GIF Terminator
	      out.writeString(';');
	    };

	    var bitOutputStream = function(out) {

	      var _out = out;
	      var _bitLength = 0;
	      var _bitBuffer = 0;

	      var _this = {};

	      _this.write = function(data, length) {

	        if ( (data >>> length) != 0) {
	          throw 'length over';
	        }

	        while (_bitLength + length >= 8) {
	          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
	          length -= (8 - _bitLength);
	          data >>>= (8 - _bitLength);
	          _bitBuffer = 0;
	          _bitLength = 0;
	        }

	        _bitBuffer = (data << _bitLength) | _bitBuffer;
	        _bitLength = _bitLength + length;
	      };

	      _this.flush = function() {
	        if (_bitLength > 0) {
	          _out.writeByte(_bitBuffer);
	        }
	      };

	      return _this;
	    };

	    var getLZWRaster = function(lzwMinCodeSize) {

	      var clearCode = 1 << lzwMinCodeSize;
	      var endCode = (1 << lzwMinCodeSize) + 1;
	      var bitLength = lzwMinCodeSize + 1;

	      // Setup LZWTable
	      var table = lzwTable();

	      for (var i = 0; i < clearCode; i += 1) {
	        table.add(String.fromCharCode(i) );
	      }
	      table.add(String.fromCharCode(clearCode) );
	      table.add(String.fromCharCode(endCode) );

	      var byteOut = byteArrayOutputStream();
	      var bitOut = bitOutputStream(byteOut);

	      // clear code
	      bitOut.write(clearCode, bitLength);

	      var dataIndex = 0;

	      var s = String.fromCharCode(_data[dataIndex]);
	      dataIndex += 1;

	      while (dataIndex < _data.length) {

	        var c = String.fromCharCode(_data[dataIndex]);
	        dataIndex += 1;

	        if (table.contains(s + c) ) {

	          s = s + c;

	        } else {

	          bitOut.write(table.indexOf(s), bitLength);

	          if (table.size() < 0xfff) {

	            if (table.size() == (1 << bitLength) ) {
	              bitLength += 1;
	            }

	            table.add(s + c);
	          }

	          s = c;
	        }
	      }

	      bitOut.write(table.indexOf(s), bitLength);

	      // end code
	      bitOut.write(endCode, bitLength);

	      bitOut.flush();

	      return byteOut.toByteArray();
	    };

	    var lzwTable = function() {

	      var _map = {};
	      var _size = 0;

	      var _this = {};

	      _this.add = function(key) {
	        if (_this.contains(key) ) {
	          throw 'dup key:' + key;
	        }
	        _map[key] = _size;
	        _size += 1;
	      };

	      _this.size = function() {
	        return _size;
	      };

	      _this.indexOf = function(key) {
	        return _map[key];
	      };

	      _this.contains = function(key) {
	        return typeof _map[key] != 'undefined';
	      };

	      return _this;
	    };

	    return _this;
	  };

	  var createDataURL = function(width, height, getPixel) {
	    var gif = gifImage(width, height);
	    for (var y = 0; y < height; y += 1) {
	      for (var x = 0; x < width; x += 1) {
	        gif.setPixel(x, y, getPixel(x, y) );
	      }
	    }

	    var b = byteArrayOutputStream();
	    gif.write(b);

	    var base64 = base64EncodeOutputStream();
	    var bytes = b.toByteArray();
	    for (var i = 0; i < bytes.length; i += 1) {
	      base64.writeByte(bytes[i]);
	    }
	    base64.flush();

	    return 'data:image/gif;base64,' + base64;
	  };

	  //---------------------------------------------------------------------
	  // returns qrcode function.

	  return qrcode;
	}();

	// multibyte support
	!function() {

	  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
	    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
	    function toUTF8Array(str) {
	      var utf8 = [];
	      for (var i=0; i < str.length; i++) {
	        var charcode = str.charCodeAt(i);
	        if (charcode < 0x80) utf8.push(charcode);
	        else if (charcode < 0x800) {
	          utf8.push(0xc0 | (charcode >> 6),
	              0x80 | (charcode & 0x3f));
	        }
	        else if (charcode < 0xd800 || charcode >= 0xe000) {
	          utf8.push(0xe0 | (charcode >> 12),
	              0x80 | ((charcode>>6) & 0x3f),
	              0x80 | (charcode & 0x3f));
	        }
	        // surrogate pair
	        else {
	          i++;
	          // UTF-16 encodes 0x10000-0x10FFFF by
	          // subtracting 0x10000 and splitting the
	          // 20 bits of 0x0-0xFFFFF into two halves
	          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
	            | (str.charCodeAt(i) & 0x3ff));
	          utf8.push(0xf0 | (charcode >>18),
	              0x80 | ((charcode>>12) & 0x3f),
	              0x80 | ((charcode>>6) & 0x3f),
	              0x80 | (charcode & 0x3f));
	        }
	      }
	      return utf8;
	    }
	    return toUTF8Array(s);
	  };

	}();

	(function (factory) {
	  {
	      module.exports = factory();
	  }
	}(function () {
	    return qrcode;
	}));
	}(qrcode$1));

	var qrcodeGenerator = qrcode$1.exports;

	/* account/Security.html generated by Svelte v2.16.1 */



	function qrcode(provider, user) {
	    const code = qrcodeGenerator(0, 'M');
	    code.addData(
	        `otpauth://totp/${user.email || user.name}?issuer=${provider.data.issuer}&secret=${
            provider.data.secret
        }`
	    );
	    code.make();
	    return code.createDataURL(32);
	}

	function data$1() {
	    return {
	        otpProviders: [],
	        otp: ''
	    };
	}
	var methods = {
	    loadProviders(reset) {
	        this.set({
	            otp: '',
	            awaitOtpProviders: httpReq.get(`/v3/me/otp`).then(res => {
	                this.set({ otpProviders: res });
	            })
	        });
	        if (reset) {
	            setTimeout(() => {
	                this.set({ awaitEnable: false, awaitDisable: false });
	            }, 3000);
	        }
	    },
	    enable(provider) {
	        this.set({
	            enableProvider: provider.id,
	            awaitEnable: false,
	            awaitDisable: false,
	            otp: ''
	        });
	    },
	    doEnable(provider) {
	        const { otp } = this.get();
	        if (otp) {
	            this.set({
	                enableProvider: null,
	                awaitEnable: httpReq
	                    .post(`/v3/me/otp/${provider.id}`, {
	                        payload: provider.data.secret
	                            ? { otp: `${provider.data.secret}:${otp}` }
	                            : { otp }
	                    })
	                    .then(() => this.loadProviders(true))
	            });
	        }
	    },
	    disable(provider) {
	        if (window.confirm(`Do you really want to disable ${provider.title}?`)) {
	            this.set({
	                awaitDisable: httpReq
	                    .delete(`/v3/me/otp/${provider.id}`)
	                    .then(() => this.loadProviders(true))
	            });
	        }
	    }
	};

	function oncreate() {
	    this.loadProviders();
	}
	const file = "account/Security.html";

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.enable(ctx.provider);
	}

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.disable(ctx.provider);
	}

	function submit_handler_1(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.doEnable(ctx.provider);
	}

	function submit_handler(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.doEnable(ctx.provider);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.provider = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var h2, text1, p, text2, b, text4, text5, if_block_anchor;

		var if_block = (ctx.awaitOtpProviders) && create_if_block(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				h2.textContent = "Two-factor authentication";
				text1 = createText("\n\n");
				p = createElement("p");
				text2 = createText("Secure your account by configuring two-factor authenticating using\n    ");
				b = createElement("b");
				b.textContent = "One-Time Password (OTP)";
				text4 = createText(" providers:");
				text5 = createText("\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				addLoc(h2, file, 0, 0, 0);
				addLoc(b, file, 4, 4, 115);
				addLoc(p, file, 2, 0, 36);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				insert(target, text1, anchor);
				insert(target, p, anchor);
				append(p, text2);
				append(p, b);
				append(p, text4);
				insert(target, text5, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.awaitOtpProviders) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(p);
					detachNode(text5);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (7:0) {#if awaitOtpProviders}
	function create_if_block(component, ctx) {
		var promise, text, div, table;

		let info = {
			component,
			ctx,
			current: null,
			pending: create_pending_block_2,
			then: create_then_block_2,
			catch: create_catch_block_2,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitOtpProviders, info);

		var each_value = ctx.otpProviders;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				info.block.c();

				text = createText("\n");
				div = createElement("div");
				table = createElement("table");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				table.className = "table span7 mt-4 svelte-ltmj4";
				addLoc(table, file, 9, 4, 288);
				div.className = "row";
				addLoc(div, file, 8, 0, 266);
			},

			m: function mount(target, anchor) {
				info.block.m(target, info.anchor = anchor);
				info.mount = () => text.parentNode;
				info.anchor = text;

				insert(target, text, anchor);
				insert(target, div, anchor);
				append(div, table);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(table, null);
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				('awaitOtpProviders' in changed) && promise !== (promise = ctx.awaitOtpProviders) && handlePromise(promise, info);

				if (changed.otpProviders || changed.enableProvider || changed.awaitDisable || changed.awaitEnable || changed.otp || changed.user) {
					each_value = ctx.otpProviders;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(table, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				info.block.d(detach);
				info = null;

				if (detach) {
					detachNode(text);
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (1:0) <h2>Two-factor authentication</h2>  <p>     Secure your account by configuring two-factor authenticating using     <b>One-Time Password (OTP)</b> providers: </p> {#if awaitOtpProviders}
	function create_catch_block_2(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (1:0) <h2>Two-factor authentication</h2>  <p>     Secure your account by configuring two-factor authenticating using     <b>One-Time Password (OTP)</b> providers: </p> {#if awaitOtpProviders}
	function create_then_block_2(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (7:49) Loading <i class="fa fa-spinner fa-spin"></i> {/await}
	function create_pending_block_2(component, ctx) {
		var text, i;

		return {
			c: function create() {
				text = createText("Loading ");
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file, 6, 57, 219);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
					detachNode(i);
				}
			}
		};
	}

	// (23:16) {:else}
	function create_else_block_1(component, ctx) {
		var div, i, text;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText(" not enabled");
				i.className = "fa fa-times-circle";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file, 24, 20, 914);
				div.className = "muted";
				addLoc(div, file, 23, 16, 874);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (19:24) {#if provider.enabled}
	function create_if_block_8(component, ctx) {
		var div, i, text;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText(" enabled");
				i.className = "fa fa-check-circle";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file, 20, 20, 749);
				div.className = "text-success";
				addLoc(div, file, 19, 16, 702);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (15:16) {#if !provider.installed}
	function create_if_block_7(component, ctx) {
		var div, i, text;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText(" not installed");
				i.className = "fa fa-times-circle";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file, 16, 20, 548);
				div.className = "text-error";
				addLoc(div, file, 15, 16, 503);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (30:16) {#if enableProvider === provider.id}
	function create_if_block_5(component, ctx) {
		var if_block_anchor;

		function select_block_type_1(ctx) {
			if (ctx.provider.data.qrcode) return create_if_block_6;
			return create_else_block;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (46:16) {:else}
	function create_else_block(component, ctx) {
		var form, input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ otp: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				form = createElement("form");
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.placeholder = "Enter a one-time password to activate device";
				input.className = "input-xxlarge span4 my-0";
				input.autocomplete = "off";
				setAttribute(input, "type", "password");
				input.dataset.lpignore = "true";
				input.autofocus = true;
				addLoc(input, file, 47, 20, 2055);

				form._svelte = { component, ctx };

				addListener(form, "submit", submit_handler_1);
				form.className = "my-0";
				addLoc(form, file, 46, 16, 1969);
			},

			m: function mount(target, anchor) {
				insert(target, form, anchor);
				append(form, input);

				input.value = ctx.otp;

				input.focus();
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.otp) input.value = ctx.otp;
				form._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(form);
				}

				removeListener(input, "input", input_input_handler);
				removeListener(form, "submit", submit_handler_1);
			}
		};
	}

	// (30:53) {#if provider.data.qrcode}
	function create_if_block_6(component, ctx) {
		var p, text1, img, img_src_value, text2, form, input0, input0_updating = false, text3, input1;

		function input0_input_handler() {
			input0_updating = true;
			component.set({ otp: input0.value });
			input0_updating = false;
		}

		return {
			c: function create() {
				p = createElement("p");
				p.textContent = "Scan this QR Code with your Authenticator app and enter a code to confirm";
				text1 = createText("\n                ");
				img = createElement("img");
				text2 = createText("\n                ");
				form = createElement("form");
				input0 = createElement("input");
				text3 = createText("\n                    ");
				input1 = createElement("input");
				addLoc(p, file, 30, 16, 1174);
				img.src = img_src_value = qrcode(ctx.provider, ctx.user);
				img.width = "200";
				img.alt = "";
				addLoc(img, file, 31, 16, 1271);
				addListener(input0, "input", input0_input_handler);
				input0.placeholder = "123456";
				input0.className = "input-xxlarge span2 my-0";
				input0.autocomplete = "off";
				setAttribute(input0, "type", "text");
				setStyle(input0, "font-family", "'Roboto Mono'");
				input0.dataset.lpignore = "true";
				input0.autofocus = true;
				addLoc(input0, file, 33, 20, 1431);
				setAttribute(input1, "type", "submit");
				input1.className = "btn btn-primary";
				input1.value = "Confirm";
				addLoc(input1, file, 43, 20, 1841);

				form._svelte = { component, ctx };

				addListener(form, "submit", submit_handler);
				form.className = "my-0";
				addLoc(form, file, 32, 16, 1345);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				insert(target, text1, anchor);
				insert(target, img, anchor);
				insert(target, text2, anchor);
				insert(target, form, anchor);
				append(form, input0);

				input0.value = ctx.otp;

				append(form, text3);
				append(form, input1);
				input0.focus();
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.otpProviders || changed.user) && img_src_value !== (img_src_value = qrcode(ctx.provider, ctx.user))) {
					img.src = img_src_value;
				}

				if (!input0_updating && changed.otp) input0.value = ctx.otp;
				form._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text1);
					detachNode(img);
					detachNode(text2);
					detachNode(form);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(form, "submit", submit_handler);
			}
		};
	}

	// (58:28) {#if awaitEnable}
	function create_if_block_4(component, ctx) {
		var await_block_anchor, promise;

		let info = {
			component,
			ctx,
			current: null,
			pending: create_pending_block_1,
			then: create_then_block_1,
			catch: create_catch_block_1,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitEnable, info);

		return {
			c: function create() {
				await_block_anchor = createComment();

				info.block.c();
			},

			m: function mount(target, anchor) {
				insert(target, await_block_anchor, anchor);

				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				('awaitEnable' in changed) && promise !== (promise = ctx.awaitEnable) && handlePromise(promise, info);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(await_block_anchor);
				}

				info.block.d(detach);
				info = null;
			}
		};
	}

	// (62:16) {:catch}
	function create_catch_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.textContent = "Error: could not enable provider. Did you enter a valid OTP?";
				div.className = "text-error";
				addLoc(div, file, 62, 16, 2695);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (60:16) {:then}
	function create_then_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.textContent = "Success!";
				div.className = "text-success";
				addLoc(div, file, 60, 16, 2613);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (58:66)                  <i class="fa fa-spinner fa-spin"></i>                 {:then}
	function create_pending_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file, 58, 16, 2535);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (66:31) {#if awaitDisable}
	function create_if_block_3(component, ctx) {
		var await_block_anchor, promise;

		let info = {
			component,
			ctx,
			current: null,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitDisable, info);

		return {
			c: function create() {
				await_block_anchor = createComment();

				info.block.c();
			},

			m: function mount(target, anchor) {
				insert(target, await_block_anchor, anchor);

				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				('awaitDisable' in changed) && promise !== (promise = ctx.awaitDisable) && handlePromise(promise, info);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(await_block_anchor);
				}

				info.block.d(detach);
				info = null;
			}
		};
	}

	// (1:0) <h2>Two-factor authentication</h2>  <p>     Secure your account by configuring two-factor authenticating using     <b>One-Time Password (OTP)</b> providers: </p> {#if awaitOtpProviders}
	function create_catch_block(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (1:0) <h2>Two-factor authentication</h2>  <p>     Secure your account by configuring two-factor authenticating using     <b>One-Time Password (OTP)</b> providers: </p> {#if awaitOtpProviders}
	function create_then_block(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (66:71)                  <i class="fa fa-spinner fa-spin"></i>                 {:catch}
	function create_pending_block(component, ctx) {
		var i, text, div;

		return {
			c: function create() {
				i = createElement("i");
				text = createText("\n                }\n                ");
				div = createElement("div");
				div.textContent = "Error: could not disable provider";
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file, 66, 16, 2912);
				div.className = "text-error";
				addLoc(div, file, 68, 16, 2991);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (75:56) 
	function create_if_block_2(component, ctx) {
		var button;

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "enable";
				button._svelte = { component, ctx };

				addListener(button, "click", click_handler_1);
				button.className = "btn btn-primary";
				addLoc(button, file, 75, 16, 3315);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (73:16) {#if provider.enabled}
	function create_if_block_1(component, ctx) {
		var button;

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "disable";
				button._svelte = { component, ctx };

				addListener(button, "click", click_handler);
				button.className = "btn";
				addLoc(button, file, 73, 16, 3176);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (11:8) {#each otpProviders as provider}
	function create_each_block(component, ctx) {
		var tr, th, text0_value = ctx.provider.title || ctx.provider.id, text0, text1, td0, text2, td1, text3, text4, text5, td2, text6;

		function select_block_type(ctx) {
			if (!ctx.provider.installed) return create_if_block_7;
			if (ctx.provider.enabled) return create_if_block_8;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.enableProvider === ctx.provider.id) && create_if_block_5(component, ctx);

		var if_block2 = (ctx.awaitEnable) && create_if_block_4(component, ctx);

		var if_block3 = (ctx.awaitDisable) && create_if_block_3(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.provider.enabled) return create_if_block_1;
			if (ctx.enableProvider !== ctx.provider.id) return create_if_block_2;
		}

		var current_block_type_1 = select_block_type_2(ctx);
		var if_block4 = current_block_type_1 && current_block_type_1(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				th = createElement("th");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				td0 = createElement("td");
				if_block0.c();
				text2 = createText("\n            ");
				td1 = createElement("td");
				if (if_block1) if_block1.c();
				text3 = createText(" ");
				if (if_block2) if_block2.c();
				text4 = createText(" ");
				if (if_block3) if_block3.c();
				text5 = createText("\n            ");
				td2 = createElement("td");
				if (if_block4) if_block4.c();
				text6 = createText("\n        ");
				th.className = "svelte-ltmj4";
				addLoc(th, file, 12, 12, 387);
				td0.className = "svelte-ltmj4";
				addLoc(td0, file, 13, 12, 440);
				setAttribute(td1, "width", "50%");
				td1.className = "svelte-ltmj4";
				addLoc(td1, file, 28, 12, 1061);
				td2.className = "svelte-ltmj4";
				addLoc(td2, file, 71, 12, 3116);
				addLoc(tr, file, 11, 8, 370);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, th);
				append(th, text0);
				append(tr, text1);
				append(tr, td0);
				if_block0.m(td0, null);
				append(tr, text2);
				append(tr, td1);
				if (if_block1) if_block1.m(td1, null);
				append(td1, text3);
				if (if_block2) if_block2.m(td1, null);
				append(td1, text4);
				if (if_block3) if_block3.m(td1, null);
				append(tr, text5);
				append(tr, td2);
				if (if_block4) if_block4.m(td2, null);
				append(tr, text6);
			},

			p: function update(changed, ctx) {
				if ((changed.otpProviders) && text0_value !== (text0_value = ctx.provider.title || ctx.provider.id)) {
					setData(text0, text0_value);
				}

				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(td0, null);
				}

				if (ctx.enableProvider === ctx.provider.id) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_5(component, ctx);
						if_block1.c();
						if_block1.m(td1, text3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.awaitEnable) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_4(component, ctx);
						if_block2.c();
						if_block2.m(td1, text4);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.awaitDisable) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_3(component, ctx);
						if_block3.c();
						if_block3.m(td1, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if (if_block4) if_block4.d(1);
					if_block4 = current_block_type_1 && current_block_type_1(component, ctx);
					if (if_block4) if_block4.c();
					if (if_block4) if_block4.m(td2, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
			}
		};
	}

	function Security(options) {
		this._debugName = '<Security>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('awaitOtpProviders' in this._state)) console.warn("<Security> was created without expected data property 'awaitOtpProviders'");
		if (!('otpProviders' in this._state)) console.warn("<Security> was created without expected data property 'otpProviders'");
		if (!('enableProvider' in this._state)) console.warn("<Security> was created without expected data property 'enableProvider'");
		if (!('user' in this._state)) console.warn("<Security> was created without expected data property 'user'");
		if (!('otp' in this._state)) console.warn("<Security> was created without expected data property 'otp'");
		if (!('awaitEnable' in this._state)) console.warn("<Security> was created without expected data property 'awaitEnable'");
		if (!('awaitDisable' in this._state)) console.warn("<Security> was created without expected data property 'awaitDisable'");
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

	assign(Security.prototype, protoDev);
	assign(Security.prototype, methods);

	Security.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

		get,

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

	var main = { App: Security, data, store };

	return main;

})));
//# sourceMappingURL=security.js.map
