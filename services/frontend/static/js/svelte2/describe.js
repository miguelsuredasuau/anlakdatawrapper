(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple'), require('cm/addon/hint/show-hint'), require('cm/addon/edit/matchbrackets'), require('cm/addon/display/placeholder'), require('Handsontable'), require('dayjs')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple', 'cm/addon/hint/show-hint', 'cm/addon/edit/matchbrackets', 'cm/addon/display/placeholder', 'Handsontable', 'dayjs'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.describe = factory(global.CodeMirror, null, null, null, null, null, global.HOT, global.dayjs));
}(this, (function (CodeMirror, javascript, simple, showHint, matchbrackets, placeholder, HOT, dayjs) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var CodeMirror__default = /*#__PURE__*/_interopDefaultLegacy(CodeMirror);
	var HOT__default = /*#__PURE__*/_interopDefaultLegacy(HOT);
	var dayjs__default = /*#__PURE__*/_interopDefaultLegacy(dayjs);

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

	function run(fn) {
		fn();
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

	function detachBefore(after) {
		while (after.previousSibling) {
			after.parentNode.removeChild(after.previousSibling);
		}
	}

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
	}

	function reinsertAfter(before, target) {
		while (before.nextSibling) target.appendChild(before.nextSibling);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createFragment() {
		return document.createDocumentFragment();
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createSvgElement(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
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

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}

	function linear$2(t) {
		return t;
	}

	function generateRule({ a, b, delta, duration }, ease, fn) {
		const step = 16.666 / duration;
		let keyframes = '{\n';

		for (let p = 0; p <= 1; p += step) {
			const t = a + delta * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}

		return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		let hash = 5381;
		let i = str.length;

		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro) {
		let obj = fn.call(component, node, params);
		let duration;
		let ease;
		let cssText;

		let initialised = false;

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,

			run(b, callback) {
				if (typeof obj === 'function') {
					transitionManager.wait().then(() => {
						obj = obj();
						this._run(b, callback);
					});
				} else {
					this._run(b, callback);
				}
			},

			_run(b, callback) {
				duration = obj.duration || 300;
				ease = obj.easing || linear$2;

				const program = {
					start: window.performance.now() + (obj.delay || 0),
					b,
					callback: callback || noop$1
				};

				if (intro && !initialised) {
					if (obj.css && obj.delay) {
						cssText = node.style.cssText;
						node.style.cssText += obj.css(0, 1);
					}

					if (obj.tick) obj.tick(0, 1);
					initialised = true;
				}

				if (!b) {
					program.group = outros.current;
					outros.current.remaining += 1;
				}

				if (obj.delay) {
					this.pending = program;
				} else {
					this.start(program);
				}

				if (!this.running) {
					this.running = true;
					transitionManager.add(this);
				}
			},

			start(program) {
				component.fire(`${program.b ? 'intro' : 'outro'}.start`, { node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) node.style.cssText = cssText;

					const rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
						.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update(now) {
				const program = this.program;
				if (!program) return;

				const p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) obj.tick(this.t, 1 - this.t);
			},

			done() {
				const program = this.program;
				this.t = program.b;

				if (obj.tick) obj.tick(this.t, 1 - this.t);

				component.fire(`${program.b ? 'intro' : 'outro'}.end`, { node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(() => {
						program.callback();
						if (obj.css) transitionManager.deleteRule(node, program.name);
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) transitionManager.deleteRule(node, program.name);
				}

				this.running = !!this.pending;
			},

			abort(reset) {
				if (this.program) {
					if (reset && obj.tick) obj.tick(1, 0);
					if (obj.css) transitionManager.deleteRule(node, this.program.name);
					this.program = this.pending = null;
					this.running = false;
				}
			},

			invalidate() {
				if (this.program) {
					this.program.invalidated = true;
				}
			}
		};
	}

	let outros = {};

	function groupOutros() {
		outros.current = {
			remaining: 0,
			callbacks: []
		};
	}

	var transitionManager = {
		running: false,
		transitions: [],
		bound: null,
		stylesheet: null,
		activeRules: {},
		promise: null,

		add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule(rule, name) {
			if (!this.stylesheet) {
				const style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
			}
		},

		next() {
			this.running = false;

			const now = window.performance.now();
			let i = this.transitions.length;

			while (i--) {
				const transition = this.transitions[i];

				if (transition.program && now >= transition.program.end) {
					transition.done();
				}

				if (transition.pending && now >= transition.pending.start) {
					transition.start(transition.pending);
				}

				if (transition.running) {
					transition.update(now);
					this.running = true;
				} else if (!transition.pending) {
					this.transitions.splice(i, 1);
				}
			}

			if (this.running) {
				requestAnimationFrame(this.bound);
			} else if (this.stylesheet) {
				let i = this.stylesheet.cssRules.length;
				while (i--) this.stylesheet.deleteRule(i);
				this.activeRules = {};
			}
		},

		deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(anim => anim && anim.indexOf(name) === -1)
				.join(', ');
		},

		wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(() => {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

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

	function get$4() {
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

	function removeFromStore() {
		this.store._remove(this);
	}

	var protoDev = {
		destroy: destroyDev,
		get: get$4,
		fire,
		on,
		set: setDev,
		_recompute: noop$1,
		_set,
		_stage,
		_mount,
		_differs
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */

	function isObject$7(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject$7;

	/** Detect free variable `global` from Node.js. */

	var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	var _freeGlobal = freeGlobal$1;

	var freeGlobal = _freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root$a = freeGlobal || freeSelf || Function('return this')();

	var _root = root$a;

	var root$9 = _root;

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now$2 = function() {
	  return root$9.Date.now();
	};

	var now_1 = now$2;

	/** Used to match a single whitespace character. */

	var reWhitespace = /\s/;

	/**
	 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
	 * character of `string`.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {number} Returns the index of the last non-whitespace character.
	 */
	function trimmedEndIndex$1(string) {
	  var index = string.length;

	  while (index-- && reWhitespace.test(string.charAt(index))) {}
	  return index;
	}

	var _trimmedEndIndex = trimmedEndIndex$1;

	var trimmedEndIndex = _trimmedEndIndex;

	/** Used to match leading whitespace. */
	var reTrimStart = /^\s+/;

	/**
	 * The base implementation of `_.trim`.
	 *
	 * @private
	 * @param {string} string The string to trim.
	 * @returns {string} Returns the trimmed string.
	 */
	function baseTrim$1(string) {
	  return string
	    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
	    : string;
	}

	var _baseTrim = baseTrim$1;

	var root$8 = _root;

	/** Built-in value references. */
	var Symbol$5 = root$8.Symbol;

	var _Symbol = Symbol$5;

	var Symbol$4 = _Symbol;

	/** Used for built-in method references. */
	var objectProto$d = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$c = objectProto$d.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$d.toString;

	/** Built-in value references. */
	var symToStringTag$1 = Symbol$4 ? Symbol$4.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag$1(value) {
	  var isOwn = hasOwnProperty$c.call(value, symToStringTag$1),
	      tag = value[symToStringTag$1];

	  try {
	    value[symToStringTag$1] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString$1.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag$1] = tag;
	    } else {
	      delete value[symToStringTag$1];
	    }
	  }
	  return result;
	}

	var _getRawTag = getRawTag$1;

	/** Used for built-in method references. */

	var objectProto$c = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto$c.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString$1(value) {
	  return nativeObjectToString.call(value);
	}

	var _objectToString = objectToString$1;

	var Symbol$3 = _Symbol,
	    getRawTag = _getRawTag,
	    objectToString = _objectToString;

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol$3 ? Symbol$3.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag$5(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	var _baseGetTag = baseGetTag$5;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */

	function isObjectLike$5(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike$5;

	var baseGetTag$4 = _baseGetTag,
	    isObjectLike$4 = isObjectLike_1;

	/** `Object#toString` result references. */
	var symbolTag$1 = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol$5(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike$4(value) && baseGetTag$4(value) == symbolTag$1);
	}

	var isSymbol_1 = isSymbol$5;

	var baseTrim = _baseTrim,
	    isObject$6 = isObject_1,
	    isSymbol$4 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber$2(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol$4(value)) {
	    return NAN;
	  }
	  if (isObject$6(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject$6(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = baseTrim(value);
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	var toNumber_1 = toNumber$2;

	var isObject$5 = isObject_1,
	    now$1 = now_1,
	    toNumber$1 = toNumber_1;

	/** Error message constants. */
	var FUNC_ERROR_TEXT$1 = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax$1 = Math.max,
	    nativeMin = Math.min;

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce$1(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT$1);
	  }
	  wait = toNumber$1(wait) || 0;
	  if (isObject$5(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax$1(toNumber$1(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;

	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }

	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }

	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        timeWaiting = wait - timeSinceLastCall;

	    return maxing
	      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
	      : timeWaiting;
	  }

	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }

	  function timerExpired() {
	    var time = now$1();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }

	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }

	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }

	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now$1());
	  }

	  function debounced() {
	    var time = now$1(),
	        isInvoking = shouldInvoke(time);

	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;

	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        clearTimeout(timerId);
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	var debounce_1 = debounce$1;

	var baseGetTag$3 = _baseGetTag,
	    isObject$4 = isObject_1;

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag$1 = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction$4(value) {
	  if (!isObject$4(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag$3(value);
	  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var isFunction_1 = isFunction$4;

	var root$7 = _root;

	/** Used to detect overreaching core-js shims. */
	var coreJsData$1 = root$7['__core-js_shared__'];

	var _coreJsData = coreJsData$1;

	var coreJsData = _coreJsData;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked$1(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	var _isMasked = isMasked$1;

	/** Used for built-in method references. */

	var funcProto$1 = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource$2(func) {
	  if (func != null) {
	    try {
	      return funcToString$1.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	var _toSource = toSource$2;

	var isFunction$3 = isFunction_1,
	    isMasked = _isMasked,
	    isObject$3 = isObject_1,
	    toSource$1 = _toSource;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto$b = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$b = objectProto$b.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty$b).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative$1(value) {
	  if (!isObject$3(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction$3(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource$1(value));
	}

	var _baseIsNative = baseIsNative$1;

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */

	function getValue$1(object, key) {
	  return object == null ? undefined : object[key];
	}

	var _getValue = getValue$1;

	var baseIsNative = _baseIsNative,
	    getValue = _getValue;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative$7(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative$7;

	var getNative$6 = _getNative;

	var defineProperty$1 = (function() {
	  try {
	    var func = getNative$6(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	var _defineProperty = defineProperty$1;

	var defineProperty = _defineProperty;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue$2(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	var _baseAssignValue = baseAssignValue$2;

	/**
	 * A specialized version of `baseAggregator` for arrays.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */

	function arrayAggregator$1(array, setter, iteratee, accumulator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    var value = array[index];
	    setter(accumulator, value, iteratee(value), array);
	  }
	  return accumulator;
	}

	var _arrayAggregator = arrayAggregator$1;

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */

	function createBaseFor$1(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	var _createBaseFor = createBaseFor$1;

	var createBaseFor = _createBaseFor;

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor$1 = createBaseFor();

	var _baseFor = baseFor$1;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */

	function baseTimes$1(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	var _baseTimes = baseTimes$1;

	var baseGetTag$2 = _baseGetTag,
	    isObjectLike$3 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments$1(value) {
	  return isObjectLike$3(value) && baseGetTag$2(value) == argsTag$2;
	}

	var _baseIsArguments = baseIsArguments$1;

	var baseIsArguments = _baseIsArguments,
	    isObjectLike$2 = isObjectLike_1;

	/** Used for built-in method references. */
	var objectProto$a = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$a = objectProto$a.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$a.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments$4 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike$2(value) && hasOwnProperty$a.call(value, 'callee') &&
	    !propertyIsEnumerable$1.call(value, 'callee');
	};

	var isArguments_1 = isArguments$4;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */

	var isArray$a = Array.isArray;

	var isArray_1 = isArray$a;

	var isBuffer$2 = {exports: {}};

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */

	function stubFalse() {
	  return false;
	}

	var stubFalse_1 = stubFalse;

	(function (module, exports) {
	var root = _root,
	    stubFalse = stubFalse_1;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer;
	}(isBuffer$2, isBuffer$2.exports));

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER$1 = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex$3(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	var _isIndex = isIndex$3;

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength$3(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	var isLength_1 = isLength$3;

	var baseGetTag$1 = _baseGetTag,
	    isLength$2 = isLength_1,
	    isObjectLike$1 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag$2 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    objectTag$2 = '[object Object]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$2 = '[object Set]',
	    stringTag$1 = '[object String]',
	    weakMapTag$1 = '[object WeakMap]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$2 = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
	typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
	typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] =
	typedArrayTags[errorTag$1] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] =
	typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] =
	typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] =
	typedArrayTags[weakMapTag$1] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray$1(value) {
	  return isObjectLike$1(value) &&
	    isLength$2(value.length) && !!typedArrayTags[baseGetTag$1(value)];
	}

	var _baseIsTypedArray = baseIsTypedArray$1;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */

	function baseUnary$1(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	var _baseUnary = baseUnary$1;

	var _nodeUtil = {exports: {}};

	(function (module, exports) {
	var freeGlobal = _freeGlobal;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;
	}(_nodeUtil, _nodeUtil.exports));

	var baseIsTypedArray = _baseIsTypedArray,
	    baseUnary = _baseUnary,
	    nodeUtil = _nodeUtil.exports;

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray$4 = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	var isTypedArray_1 = isTypedArray$4;

	var baseTimes = _baseTimes,
	    isArguments$3 = isArguments_1,
	    isArray$9 = isArray_1,
	    isBuffer$1 = isBuffer$2.exports,
	    isIndex$2 = _isIndex,
	    isTypedArray$3 = isTypedArray_1;

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$9.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys$1(value, inherited) {
	  var isArr = isArray$9(value),
	      isArg = !isArr && isArguments$3(value),
	      isBuff = !isArr && !isArg && isBuffer$1(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray$3(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$9.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex$2(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _arrayLikeKeys = arrayLikeKeys$1;

	/** Used for built-in method references. */

	var objectProto$8 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype$1(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

	  return value === proto;
	}

	var _isPrototype = isPrototype$1;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */

	function overArg$1(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	var _overArg = overArg$1;

	var overArg = _overArg;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys$2 = overArg(Object.keys, Object);

	var _nativeKeys = nativeKeys$2;

	var isPrototype = _isPrototype,
	    nativeKeys$1 = _nativeKeys;

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$7.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys$1(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys$1(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _baseKeys = baseKeys$1;

	var isFunction$2 = isFunction_1,
	    isLength$1 = isLength_1;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike$4(value) {
	  return value != null && isLength$1(value.length) && !isFunction$2(value);
	}

	var isArrayLike_1 = isArrayLike$4;

	var arrayLikeKeys = _arrayLikeKeys,
	    baseKeys = _baseKeys,
	    isArrayLike$3 = isArrayLike_1;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys$4(object) {
	  return isArrayLike$3(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	var keys_1 = keys$4;

	var baseFor = _baseFor,
	    keys$3 = keys_1;

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn$1(object, iteratee) {
	  return object && baseFor(object, iteratee, keys$3);
	}

	var _baseForOwn = baseForOwn$1;

	var isArrayLike$2 = isArrayLike_1;

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach$1(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike$2(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	var _createBaseEach = createBaseEach$1;

	var baseForOwn = _baseForOwn,
	    createBaseEach = _createBaseEach;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach$1 = createBaseEach(baseForOwn);

	var _baseEach = baseEach$1;

	var baseEach = _baseEach;

	/**
	 * Aggregates elements of `collection` on `accumulator` with keys transformed
	 * by `iteratee` and values set by `setter`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function baseAggregator$1(collection, setter, iteratee, accumulator) {
	  baseEach(collection, function(value, key, collection) {
	    setter(accumulator, value, iteratee(value), collection);
	  });
	  return accumulator;
	}

	var _baseAggregator = baseAggregator$1;

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */

	function listCacheClear$1() {
	  this.__data__ = [];
	  this.size = 0;
	}

	var _listCacheClear = listCacheClear$1;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */

	function eq$4(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	var eq_1 = eq$4;

	var eq$3 = eq_1;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf$4(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq$3(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	var _assocIndexOf = assocIndexOf$4;

	var assocIndexOf$3 = _assocIndexOf;

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$3(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	var _listCacheDelete = listCacheDelete$1;

	var assocIndexOf$2 = _assocIndexOf;

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$2(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	var _listCacheGet = listCacheGet$1;

	var assocIndexOf$1 = _assocIndexOf;

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas$1(key) {
	  return assocIndexOf$1(this.__data__, key) > -1;
	}

	var _listCacheHas = listCacheHas$1;

	var assocIndexOf = _assocIndexOf;

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet$1(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	var _listCacheSet = listCacheSet$1;

	var listCacheClear = _listCacheClear,
	    listCacheDelete = _listCacheDelete,
	    listCacheGet = _listCacheGet,
	    listCacheHas = _listCacheHas,
	    listCacheSet = _listCacheSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache$4(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache$4.prototype.clear = listCacheClear;
	ListCache$4.prototype['delete'] = listCacheDelete;
	ListCache$4.prototype.get = listCacheGet;
	ListCache$4.prototype.has = listCacheHas;
	ListCache$4.prototype.set = listCacheSet;

	var _ListCache = ListCache$4;

	var ListCache$3 = _ListCache;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear$1() {
	  this.__data__ = new ListCache$3;
	  this.size = 0;
	}

	var _stackClear = stackClear$1;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function stackDelete$1(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	var _stackDelete = stackDelete$1;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function stackGet$1(key) {
	  return this.__data__.get(key);
	}

	var _stackGet = stackGet$1;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function stackHas$1(key) {
	  return this.__data__.has(key);
	}

	var _stackHas = stackHas$1;

	var getNative$5 = _getNative,
	    root$6 = _root;

	/* Built-in method references that are verified to be native. */
	var Map$4 = getNative$5(root$6, 'Map');

	var _Map = Map$4;

	var getNative$4 = _getNative;

	/* Built-in method references that are verified to be native. */
	var nativeCreate$5 = getNative$4(Object, 'create');

	var _nativeCreate = nativeCreate$5;

	var nativeCreate$4 = _nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear$1() {
	  this.__data__ = nativeCreate$4 ? nativeCreate$4(null) : {};
	  this.size = 0;
	}

	var _hashClear = hashClear$1;

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function hashDelete$1(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _hashDelete = hashDelete$1;

	var nativeCreate$3 = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$6.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet$1(key) {
	  var data = this.__data__;
	  if (nativeCreate$3) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$2 ? undefined : result;
	  }
	  return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet$1;

	var nativeCreate$2 = _nativeCreate;

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$5.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas$1(key) {
	  var data = this.__data__;
	  return nativeCreate$2 ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
	}

	var _hashHas = hashHas$1;

	var nativeCreate$1 = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet$1(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	var _hashSet = hashSet$1;

	var hashClear = _hashClear,
	    hashDelete = _hashDelete,
	    hashGet = _hashGet,
	    hashHas = _hashHas,
	    hashSet = _hashSet;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash$1.prototype.clear = hashClear;
	Hash$1.prototype['delete'] = hashDelete;
	Hash$1.prototype.get = hashGet;
	Hash$1.prototype.has = hashHas;
	Hash$1.prototype.set = hashSet;

	var _Hash = Hash$1;

	var Hash = _Hash,
	    ListCache$2 = _ListCache,
	    Map$3 = _Map;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear$1() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map$3 || ListCache$2),
	    'string': new Hash
	  };
	}

	var _mapCacheClear = mapCacheClear$1;

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */

	function isKeyable$1(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	var _isKeyable = isKeyable$1;

	var isKeyable = _isKeyable;

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData$4(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	var _getMapData = getMapData$4;

	var getMapData$3 = _getMapData;

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete$1(key) {
	  var result = getMapData$3(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _mapCacheDelete = mapCacheDelete$1;

	var getMapData$2 = _getMapData;

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet$1(key) {
	  return getMapData$2(this, key).get(key);
	}

	var _mapCacheGet = mapCacheGet$1;

	var getMapData$1 = _getMapData;

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas$1(key) {
	  return getMapData$1(this, key).has(key);
	}

	var _mapCacheHas = mapCacheHas$1;

	var getMapData = _getMapData;

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet$1(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	var _mapCacheSet = mapCacheSet$1;

	var mapCacheClear = _mapCacheClear,
	    mapCacheDelete = _mapCacheDelete,
	    mapCacheGet = _mapCacheGet,
	    mapCacheHas = _mapCacheHas,
	    mapCacheSet = _mapCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache$3(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache$3.prototype.clear = mapCacheClear;
	MapCache$3.prototype['delete'] = mapCacheDelete;
	MapCache$3.prototype.get = mapCacheGet;
	MapCache$3.prototype.has = mapCacheHas;
	MapCache$3.prototype.set = mapCacheSet;

	var _MapCache = MapCache$3;

	var ListCache$1 = _ListCache,
	    Map$2 = _Map,
	    MapCache$2 = _MapCache;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet$1(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache$1) {
	    var pairs = data.__data__;
	    if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache$2(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	var _stackSet = stackSet$1;

	var ListCache = _ListCache,
	    stackClear = _stackClear,
	    stackDelete = _stackDelete,
	    stackGet = _stackGet,
	    stackHas = _stackHas,
	    stackSet = _stackSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack$2(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack$2.prototype.clear = stackClear;
	Stack$2.prototype['delete'] = stackDelete;
	Stack$2.prototype.get = stackGet;
	Stack$2.prototype.has = stackHas;
	Stack$2.prototype.set = stackSet;

	var _Stack = Stack$2;

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd$1(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	var _setCacheAdd = setCacheAdd$1;

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */

	function setCacheHas$1(value) {
	  return this.__data__.has(value);
	}

	var _setCacheHas = setCacheHas$1;

	var MapCache$1 = _MapCache,
	    setCacheAdd = _setCacheAdd,
	    setCacheHas = _setCacheHas;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache$1(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache$1;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
	SetCache$1.prototype.has = setCacheHas;

	var _SetCache = SetCache$1;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */

	function arraySome$1(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	var _arraySome = arraySome$1;

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function cacheHas$1(cache, key) {
	  return cache.has(key);
	}

	var _cacheHas = cacheHas$1;

	var SetCache = _SetCache,
	    arraySome = _arraySome,
	    cacheHas = _cacheHas;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$5 = 1,
	    COMPARE_UNORDERED_FLAG$3 = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Check that cyclic values are equal.
	  var arrStacked = stack.get(array);
	  var othStacked = stack.get(other);
	  if (arrStacked && othStacked) {
	    return arrStacked == other && othStacked == array;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	var _equalArrays = equalArrays$2;

	var root$5 = _root;

	/** Built-in value references. */
	var Uint8Array$2 = root$5.Uint8Array;

	var _Uint8Array = Uint8Array$2;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */

	function mapToArray$1(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	var _mapToArray = mapToArray$1;

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */

	function setToArray$1(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	var _setToArray = setToArray$1;

	var Symbol$2 = _Symbol,
	    Uint8Array$1 = _Uint8Array,
	    eq$2 = eq_1,
	    equalArrays$1 = _equalArrays,
	    mapToArray = _mapToArray,
	    setToArray = _setToArray;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$4 = 1,
	    COMPARE_UNORDERED_FLAG$2 = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag$1 = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag$1 = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
	    symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq$2(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag$1:
	      var convert = mapToArray;

	    case setTag$1:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$2;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	var _equalByTag = equalByTag$1;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */

	function arrayPush$2(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	var _arrayPush = arrayPush$2;

	var arrayPush$1 = _arrayPush,
	    isArray$8 = isArray_1;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray$8(object) ? result : arrayPush$1(result, symbolsFunc(object));
	}

	var _baseGetAllKeys = baseGetAllKeys$1;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */

	function arrayFilter$2(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	var _arrayFilter = arrayFilter$2;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */

	function stubArray$1() {
	  return [];
	}

	var stubArray_1 = stubArray$1;

	var arrayFilter$1 = _arrayFilter,
	    stubArray = stubArray_1;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter$1(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

	var _getSymbols = getSymbols$1;

	var baseGetAllKeys = _baseGetAllKeys,
	    getSymbols = _getSymbols,
	    keys$2 = keys_1;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys$1(object) {
	  return baseGetAllKeys(object, keys$2, getSymbols);
	}

	var _getAllKeys = getAllKeys$1;

	var getAllKeys = _getAllKeys;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$3.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty$5.call(other, key))) {
	      return false;
	    }
	  }
	  // Check that cyclic values are equal.
	  var objStacked = stack.get(object);
	  var othStacked = stack.get(other);
	  if (objStacked && othStacked) {
	    return objStacked == other && othStacked == object;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	var _equalObjects = equalObjects$1;

	var getNative$3 = _getNative,
	    root$4 = _root;

	/* Built-in method references that are verified to be native. */
	var DataView$2 = getNative$3(root$4, 'DataView');

	var _DataView = DataView$2;

	var getNative$2 = _getNative,
	    root$3 = _root;

	/* Built-in method references that are verified to be native. */
	var Promise$2 = getNative$2(root$3, 'Promise');

	var _Promise = Promise$2;

	var getNative$1 = _getNative,
	    root$2 = _root;

	/* Built-in method references that are verified to be native. */
	var Set$2 = getNative$1(root$2, 'Set');

	var _Set = Set$2;

	var getNative = _getNative,
	    root$1 = _root;

	/* Built-in method references that are verified to be native. */
	var WeakMap$1 = getNative(root$1, 'WeakMap');

	var _WeakMap = WeakMap$1;

	var DataView$1 = _DataView,
	    Map$1 = _Map,
	    Promise$1 = _Promise,
	    Set$1 = _Set,
	    WeakMap = _WeakMap,
	    baseGetTag = _baseGetTag,
	    toSource = _toSource;

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView$1),
	    mapCtorString = toSource(Map$1),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set$1),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag$1 = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView$1 && getTag$1(new DataView$1(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map$1 && getTag$1(new Map$1) != mapTag) ||
	    (Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag) ||
	    (Set$1 && getTag$1(new Set$1) != setTag) ||
	    (WeakMap && getTag$1(new WeakMap) != weakMapTag)) {
	  getTag$1 = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	var _getTag = getTag$1;

	var Stack$1 = _Stack,
	    equalArrays = _equalArrays,
	    equalByTag = _equalByTag,
	    equalObjects = _equalObjects,
	    getTag = _getTag,
	    isArray$7 = isArray_1,
	    isBuffer = isBuffer$2.exports,
	    isTypedArray$2 = isTypedArray_1;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$2.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray$7(object),
	      othIsArr = isArray$7(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack$1);
	    return (objIsArr || isTypedArray$2(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$4.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$4.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack$1);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack$1);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	var _baseIsEqualDeep = baseIsEqualDeep$1;

	var baseIsEqualDeep = _baseIsEqualDeep,
	    isObjectLike = isObjectLike_1;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual$2(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
	}

	var _baseIsEqual = baseIsEqual$2;

	var Stack = _Stack,
	    baseIsEqual$1 = _baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch$1(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	var _baseIsMatch = baseIsMatch$1;

	var isObject$2 = isObject_1;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable$2(value) {
	  return value === value && !isObject$2(value);
	}

	var _isStrictComparable = isStrictComparable$2;

	var isStrictComparable$1 = _isStrictComparable,
	    keys$1 = keys_1;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData$1(object) {
	  var result = keys$1(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable$1(value)];
	  }
	  return result;
	}

	var _getMatchData = getMatchData$1;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */

	function matchesStrictComparable$2(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	var _matchesStrictComparable = matchesStrictComparable$2;

	var baseIsMatch = _baseIsMatch,
	    getMatchData = _getMatchData,
	    matchesStrictComparable$1 = _matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches$1(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	var _baseMatches = baseMatches$1;

	var isArray$6 = isArray_1,
	    isSymbol$3 = isSymbol_1;

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey$3(value, object) {
	  if (isArray$6(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol$3(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	var _isKey = isKey$3;

	var MapCache = _MapCache;

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize$2(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize$2.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize$2.Cache = MapCache;

	var memoize_1 = memoize$2;

	var memoize$1 = memoize_1;

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped$1(func) {
	  var result = memoize$1(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	var _memoizeCapped = memoizeCapped$1;

	var memoizeCapped = _memoizeCapped;

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath$1 = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	var _stringToPath = stringToPath$1;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */

	function arrayMap$2(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	var _arrayMap = arrayMap$2;

	var Symbol$1 = _Symbol,
	    arrayMap$1 = _arrayMap,
	    isArray$5 = isArray_1,
	    isSymbol$2 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY$2 = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString$1(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray$5(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap$1(value, baseToString$1) + '';
	  }
	  if (isSymbol$2(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
	}

	var _baseToString = baseToString$1;

	var baseToString = _baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString$2(value) {
	  return value == null ? '' : baseToString(value);
	}

	var toString_1 = toString$2;

	var isArray$4 = isArray_1,
	    isKey$2 = _isKey,
	    stringToPath = _stringToPath,
	    toString$1 = toString_1;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath$2(value, object) {
	  if (isArray$4(value)) {
	    return value;
	  }
	  return isKey$2(value, object) ? [value] : stringToPath(toString$1(value));
	}

	var _castPath = castPath$2;

	var isSymbol$1 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey$4(value) {
	  if (typeof value == 'string' || isSymbol$1(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
	}

	var _toKey = toKey$4;

	var castPath$1 = _castPath,
	    toKey$3 = _toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet$2(object, path) {
	  path = castPath$1(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey$3(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	var _baseGet = baseGet$2;

	var baseGet$1 = _baseGet;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get$3(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet$1(object, path);
	  return result === undefined ? defaultValue : result;
	}

	var get_1 = get$3;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */

	function baseHasIn$1(object, key) {
	  return object != null && key in Object(object);
	}

	var _baseHasIn = baseHasIn$1;

	var castPath = _castPath,
	    isArguments$2 = isArguments_1,
	    isArray$3 = isArray_1,
	    isIndex$1 = _isIndex,
	    isLength = isLength_1,
	    toKey$2 = _toKey;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath$1(object, path, hasFunc) {
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey$2(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex$1(key, length) &&
	    (isArray$3(object) || isArguments$2(object));
	}

	var _hasPath = hasPath$1;

	var baseHasIn = _baseHasIn,
	    hasPath = _hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn$1(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	var hasIn_1 = hasIn$1;

	var baseIsEqual = _baseIsEqual,
	    get$2 = get_1,
	    hasIn = hasIn_1,
	    isKey$1 = _isKey,
	    isStrictComparable = _isStrictComparable,
	    matchesStrictComparable = _matchesStrictComparable,
	    toKey$1 = _toKey;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty$1(path, srcValue) {
	  if (isKey$1(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey$1(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get$2(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	var _baseMatchesProperty = baseMatchesProperty$1;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */

	function identity$6(value) {
	  return value;
	}

	var identity_1 = identity$6;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */

	function baseProperty$1(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	var _baseProperty = baseProperty$1;

	var baseGet = _baseGet;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep$1(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	var _basePropertyDeep = basePropertyDeep$1;

	var baseProperty = _baseProperty,
	    basePropertyDeep = _basePropertyDeep,
	    isKey = _isKey,
	    toKey = _toKey;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property$2(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}

	var property_1 = property$2;

	var baseMatches = _baseMatches,
	    baseMatchesProperty = _baseMatchesProperty,
	    identity$5 = identity_1,
	    isArray$2 = isArray_1,
	    property$1 = property_1;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee$2(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity$5;
	  }
	  if (typeof value == 'object') {
	    return isArray$2(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property$1(value);
	}

	var _baseIteratee = baseIteratee$2;

	var arrayAggregator = _arrayAggregator,
	    baseAggregator = _baseAggregator,
	    baseIteratee$1 = _baseIteratee,
	    isArray$1 = isArray_1;

	/**
	 * Creates a function like `_.groupBy`.
	 *
	 * @private
	 * @param {Function} setter The function to set accumulator values.
	 * @param {Function} [initializer] The accumulator object initializer.
	 * @returns {Function} Returns the new aggregator function.
	 */
	function createAggregator$2(setter, initializer) {
	  return function(collection, iteratee) {
	    var func = isArray$1(collection) ? arrayAggregator : baseAggregator,
	        accumulator = initializer ? initializer() : {};

	    return func(collection, setter, baseIteratee$1(iteratee), accumulator);
	  };
	}

	var _createAggregator = createAggregator$2;

	var baseAssignValue$1 = _baseAssignValue,
	    createAggregator$1 = _createAggregator;

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$1.hasOwnProperty;

	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The order of grouped values
	 * is determined by the order they occur in `collection`. The corresponding
	 * value of each key is an array of elements responsible for generating the
	 * key. The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.groupBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': [4.2], '6': [6.1, 6.3] }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.groupBy(['one', 'two', 'three'], 'length');
	 * // => { '3': ['one', 'two'], '5': ['three'] }
	 */
	var groupBy$1 = createAggregator$1(function(result, value, key) {
	  if (hasOwnProperty$3.call(result, key)) {
	    result[key].push(value);
	  } else {
	    baseAssignValue$1(result, key, [value]);
	  }
	});

	var groupBy_1 = groupBy$1;

	/**
	 * Clones an object
	 *
	 * @exports clone
	 * @kind function
	 *
	 * @param {*} object - the thing that should be cloned
	 * @returns {*} - the cloned thing
	 */
	function clone$2(o) {
	    if (!o || typeof o !== 'object') return o;
	    try {
	        return JSON.parse(JSON.stringify(o));
	    } catch (e) {
	        return o;
	    }
	}

	/*! @license DOMPurify 2.4.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.4.0/LICENSE */

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (_isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	var hasOwnProperty$2 = Object.hasOwnProperty,
	    setPrototypeOf = Object.setPrototypeOf,
	    isFrozen = Object.isFrozen,
	    getPrototypeOf = Object.getPrototypeOf,
	    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var freeze = Object.freeze,
	    seal = Object.seal,
	    create$1 = Object.create; // eslint-disable-line import/no-mutable-exports

	var _ref = typeof Reflect !== 'undefined' && Reflect,
	    apply = _ref.apply,
	    construct = _ref.construct;

	if (!apply) {
	  apply = function apply(fun, thisValue, args) {
	    return fun.apply(thisValue, args);
	  };
	}

	if (!freeze) {
	  freeze = function freeze(x) {
	    return x;
	  };
	}

	if (!seal) {
	  seal = function seal(x) {
	    return x;
	  };
	}

	if (!construct) {
	  construct = function construct(Func, args) {
	    return _construct(Func, _toConsumableArray(args));
	  };
	}

	var arrayForEach = unapply(Array.prototype.forEach);
	var arrayPop = unapply(Array.prototype.pop);
	var arrayPush = unapply(Array.prototype.push);
	var stringToLowerCase = unapply(String.prototype.toLowerCase);
	var stringMatch = unapply(String.prototype.match);
	var stringReplace = unapply(String.prototype.replace);
	var stringIndexOf = unapply(String.prototype.indexOf);
	var stringTrim = unapply(String.prototype.trim);
	var regExpTest = unapply(RegExp.prototype.test);
	var typeErrorCreate = unconstruct(TypeError);
	function unapply(func) {
	  return function (thisArg) {
	    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      args[_key - 1] = arguments[_key];
	    }

	    return apply(func, thisArg, args);
	  };
	}
	function unconstruct(func) {
	  return function () {
	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    return construct(func, args);
	  };
	}
	/* Add properties to a lookup table */

	function addToSet(set, array, transformCaseFunc) {
	  transformCaseFunc = transformCaseFunc ? transformCaseFunc : stringToLowerCase;

	  if (setPrototypeOf) {
	    // Make 'in' and truthy checks like Boolean(set.constructor)
	    // independent of any properties defined on Object.prototype.
	    // Prevent prototype setters from intercepting set as a this value.
	    setPrototypeOf(set, null);
	  }

	  var l = array.length;

	  while (l--) {
	    var element = array[l];

	    if (typeof element === 'string') {
	      var lcElement = transformCaseFunc(element);

	      if (lcElement !== element) {
	        // Config presets (e.g. tags.js, attrs.js) are immutable.
	        if (!isFrozen(array)) {
	          array[l] = lcElement;
	        }

	        element = lcElement;
	      }
	    }

	    set[element] = true;
	  }

	  return set;
	}
	/* Shallow clone an object */

	function clone$1(object) {
	  var newObject = create$1(null);
	  var property;

	  for (property in object) {
	    if (apply(hasOwnProperty$2, object, [property])) {
	      newObject[property] = object[property];
	    }
	  }

	  return newObject;
	}
	/* IE10 doesn't support __lookupGetter__ so lets'
	 * simulate it. It also automatically checks
	 * if the prop is function or getter and behaves
	 * accordingly. */

	function lookupGetter(object, prop) {
	  while (object !== null) {
	    var desc = getOwnPropertyDescriptor(object, prop);

	    if (desc) {
	      if (desc.get) {
	        return unapply(desc.get);
	      }

	      if (typeof desc.value === 'function') {
	        return unapply(desc.value);
	      }
	    }

	    object = getPrototypeOf(object);
	  }

	  function fallbackValue(element) {
	    console.warn('fallback value for', element);
	    return null;
	  }

	  return fallbackValue;
	}

	var html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']); // SVG

	var svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
	var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']); // List of SVG elements that are disallowed by default.
	// We still need to know them so that we can do namespace
	// checks properly in case one wants to add them to
	// allow-list.

	var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
	var mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']); // Similarly to SVG, we want to know all MathML elements,
	// even those that we disallow by default.

	var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
	var text = freeze(['#text']);

	var html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
	var svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
	var mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
	var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

	var MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

	var ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
	var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

	var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

	var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
	);
	var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
	var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
	);
	var DOCTYPE_NAME = seal(/^html$/i);

	var getGlobal = function getGlobal() {
	  return typeof window === 'undefined' ? null : window;
	};
	/**
	 * Creates a no-op policy for internal use only.
	 * Don't export this function outside this module!
	 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
	 * @param {Document} document The document object (to determine policy name suffix)
	 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
	 * are not supported).
	 */


	var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
	  if (_typeof(trustedTypes) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
	    return null;
	  } // Allow the callers to control the unique policy name
	  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
	  // Policy creation with duplicate names throws in Trusted Types.


	  var suffix = null;
	  var ATTR_NAME = 'data-tt-policy-suffix';

	  if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
	    suffix = document.currentScript.getAttribute(ATTR_NAME);
	  }

	  var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

	  try {
	    return trustedTypes.createPolicy(policyName, {
	      createHTML: function createHTML(html) {
	        return html;
	      },
	      createScriptURL: function createScriptURL(scriptUrl) {
	        return scriptUrl;
	      }
	    });
	  } catch (_) {
	    // Policy creation failed (most likely another DOMPurify script has
	    // already run). Skip creating the policy, as this will only cause errors
	    // if TT are enforced.
	    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
	    return null;
	  }
	};

	function createDOMPurify() {
	  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

	  var DOMPurify = function DOMPurify(root) {
	    return createDOMPurify(root);
	  };
	  /**
	   * Version label, exposed for easier checks
	   * if DOMPurify is up to date or not
	   */


	  DOMPurify.version = '2.4.0';
	  /**
	   * Array of elements that DOMPurify removed during sanitation.
	   * Empty if nothing was removed.
	   */

	  DOMPurify.removed = [];

	  if (!window || !window.document || window.document.nodeType !== 9) {
	    // Not running in a browser, provide a factory function
	    // so that you can pass your own Window
	    DOMPurify.isSupported = false;
	    return DOMPurify;
	  }

	  var originalDocument = window.document;
	  var document = window.document;
	  var DocumentFragment = window.DocumentFragment,
	      HTMLTemplateElement = window.HTMLTemplateElement,
	      Node = window.Node,
	      Element = window.Element,
	      NodeFilter = window.NodeFilter,
	      _window$NamedNodeMap = window.NamedNodeMap,
	      NamedNodeMap = _window$NamedNodeMap === void 0 ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
	      HTMLFormElement = window.HTMLFormElement,
	      DOMParser = window.DOMParser,
	      trustedTypes = window.trustedTypes;
	  var ElementPrototype = Element.prototype;
	  var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
	  var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
	  var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
	  var getParentNode = lookupGetter(ElementPrototype, 'parentNode'); // As per issue #47, the web-components registry is inherited by a
	  // new document created via createHTMLDocument. As per the spec
	  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
	  // a new empty registry is used when creating a template contents owner
	  // document, so we use that as our parent document to ensure nothing
	  // is inherited.

	  if (typeof HTMLTemplateElement === 'function') {
	    var template = document.createElement('template');

	    if (template.content && template.content.ownerDocument) {
	      document = template.content.ownerDocument;
	    }
	  }

	  var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);

	  var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
	  var _document = document,
	      implementation = _document.implementation,
	      createNodeIterator = _document.createNodeIterator,
	      createDocumentFragment = _document.createDocumentFragment,
	      getElementsByTagName = _document.getElementsByTagName;
	  var importNode = originalDocument.importNode;
	  var documentMode = {};

	  try {
	    documentMode = clone$1(document).documentMode ? document.documentMode : {};
	  } catch (_) {}

	  var hooks = {};
	  /**
	   * Expose whether this browser supports running the full DOMPurify.
	   */

	  DOMPurify.isSupported = typeof getParentNode === 'function' && implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;
	  var MUSTACHE_EXPR$1 = MUSTACHE_EXPR,
	      ERB_EXPR$1 = ERB_EXPR,
	      DATA_ATTR$1 = DATA_ATTR,
	      ARIA_ATTR$1 = ARIA_ATTR,
	      IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA,
	      ATTR_WHITESPACE$1 = ATTR_WHITESPACE;
	  var IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
	  /**
	   * We consider the elements and attributes below to be safe. Ideally
	   * don't add any new ones but feel free to remove unwanted ones.
	   */

	  /* allowed element names */

	  var ALLOWED_TAGS = null;
	  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(svgFilters), _toConsumableArray(mathMl$1), _toConsumableArray(text)));
	  /* Allowed attribute names */

	  var ALLOWED_ATTR = null;
	  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(mathMl), _toConsumableArray(xml)));
	  /*
	   * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
	   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
	   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
	   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
	   */

	  var CUSTOM_ELEMENT_HANDLING = Object.seal(Object.create(null, {
	    tagNameCheck: {
	      writable: true,
	      configurable: false,
	      enumerable: true,
	      value: null
	    },
	    attributeNameCheck: {
	      writable: true,
	      configurable: false,
	      enumerable: true,
	      value: null
	    },
	    allowCustomizedBuiltInElements: {
	      writable: true,
	      configurable: false,
	      enumerable: true,
	      value: false
	    }
	  }));
	  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

	  var FORBID_TAGS = null;
	  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

	  var FORBID_ATTR = null;
	  /* Decide if ARIA attributes are okay */

	  var ALLOW_ARIA_ATTR = true;
	  /* Decide if custom data attributes are okay */

	  var ALLOW_DATA_ATTR = true;
	  /* Decide if unknown protocols are okay */

	  var ALLOW_UNKNOWN_PROTOCOLS = false;
	  /* Output should be safe for common template engines.
	   * This means, DOMPurify removes data attributes, mustaches and ERB
	   */

	  var SAFE_FOR_TEMPLATES = false;
	  /* Decide if document with <html>... should be returned */

	  var WHOLE_DOCUMENT = false;
	  /* Track whether config is already set on this instance of DOMPurify. */

	  var SET_CONFIG = false;
	  /* Decide if all elements (e.g. style, script) must be children of
	   * document.body. By default, browsers might move them to document.head */

	  var FORCE_BODY = false;
	  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
	   * string (or a TrustedHTML object if Trusted Types are supported).
	   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
	   */

	  var RETURN_DOM = false;
	  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
	   * string  (or a TrustedHTML object if Trusted Types are supported) */

	  var RETURN_DOM_FRAGMENT = false;
	  /* Try to return a Trusted Type object instead of a string, return a string in
	   * case Trusted Types are not supported  */

	  var RETURN_TRUSTED_TYPE = false;
	  /* Output should be free from DOM clobbering attacks?
	   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
	   */

	  var SANITIZE_DOM = true;
	  /* Achieve full DOM Clobbering protection by isolating the namespace of named
	   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
	   *
	   * HTML/DOM spec rules that enable DOM Clobbering:
	   *   - Named Access on Window (§7.3.3)
	   *   - DOM Tree Accessors (§3.1.5)
	   *   - Form Element Parent-Child Relations (§4.10.3)
	   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
	   *   - HTMLCollection (§4.2.10.2)
	   *
	   * Namespace isolation is implemented by prefixing `id` and `name` attributes
	   * with a constant string, i.e., `user-content-`
	   */

	  var SANITIZE_NAMED_PROPS = false;
	  var SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
	  /* Keep element content when removing element? */

	  var KEEP_CONTENT = true;
	  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
	   * of importing it into a new Document and returning a sanitized copy */

	  var IN_PLACE = false;
	  /* Allow usage of profiles like html, svg and mathMl */

	  var USE_PROFILES = {};
	  /* Tags to ignore content of when KEEP_CONTENT is true */

	  var FORBID_CONTENTS = null;
	  var DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
	  /* Tags that are safe for data: URIs */

	  var DATA_URI_TAGS = null;
	  var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
	  /* Attributes safe for values like "javascript:" */

	  var URI_SAFE_ATTRIBUTES = null;
	  var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
	  var MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
	  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
	  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
	  /* Document namespace */

	  var NAMESPACE = HTML_NAMESPACE;
	  var IS_EMPTY_INPUT = false;
	  /* Parsing of strict XHTML documents */

	  var PARSER_MEDIA_TYPE;
	  var SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
	  var DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
	  var transformCaseFunc;
	  /* Keep a reference to config to pass to hooks */

	  var CONFIG = null;
	  /* Ideally, do not touch anything below this line */

	  /* ______________________________________________ */

	  var formElement = document.createElement('form');

	  var isRegexOrFunction = function isRegexOrFunction(testValue) {
	    return testValue instanceof RegExp || testValue instanceof Function;
	  };
	  /**
	   * _parseConfig
	   *
	   * @param  {Object} cfg optional config literal
	   */
	  // eslint-disable-next-line complexity


	  var _parseConfig = function _parseConfig(cfg) {
	    if (CONFIG && CONFIG === cfg) {
	      return;
	    }
	    /* Shield configuration object from tampering */


	    if (!cfg || _typeof(cfg) !== 'object') {
	      cfg = {};
	    }
	    /* Shield configuration object from prototype pollution */


	    cfg = clone$1(cfg);
	    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
	    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

	    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? function (x) {
	      return x;
	    } : stringToLowerCase;
	    /* Set configuration parameters */

	    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
	    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
	    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone$1(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
	    cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
	    transformCaseFunc // eslint-disable-line indent
	    ) // eslint-disable-line indent
	    : DEFAULT_URI_SAFE_ATTRIBUTES;
	    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone$1(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
	    cfg.ADD_DATA_URI_TAGS, // eslint-disable-line indent
	    transformCaseFunc // eslint-disable-line indent
	    ) // eslint-disable-line indent
	    : DEFAULT_DATA_URI_TAGS;
	    FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
	    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
	    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
	    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
	    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

	    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

	    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

	    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

	    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

	    RETURN_DOM = cfg.RETURN_DOM || false; // Default false

	    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

	    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false

	    FORCE_BODY = cfg.FORCE_BODY || false; // Default false

	    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

	    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false

	    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

	    IN_PLACE = cfg.IN_PLACE || false; // Default false

	    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$1;
	    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;

	    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
	      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
	    }

	    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
	      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
	    }

	    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
	      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
	    }

	    if (SAFE_FOR_TEMPLATES) {
	      ALLOW_DATA_ATTR = false;
	    }

	    if (RETURN_DOM_FRAGMENT) {
	      RETURN_DOM = true;
	    }
	    /* Parse profile info */


	    if (USE_PROFILES) {
	      ALLOWED_TAGS = addToSet({}, _toConsumableArray(text));
	      ALLOWED_ATTR = [];

	      if (USE_PROFILES.html === true) {
	        addToSet(ALLOWED_TAGS, html$1);
	        addToSet(ALLOWED_ATTR, html);
	      }

	      if (USE_PROFILES.svg === true) {
	        addToSet(ALLOWED_TAGS, svg$1);
	        addToSet(ALLOWED_ATTR, svg);
	        addToSet(ALLOWED_ATTR, xml);
	      }

	      if (USE_PROFILES.svgFilters === true) {
	        addToSet(ALLOWED_TAGS, svgFilters);
	        addToSet(ALLOWED_ATTR, svg);
	        addToSet(ALLOWED_ATTR, xml);
	      }

	      if (USE_PROFILES.mathMl === true) {
	        addToSet(ALLOWED_TAGS, mathMl$1);
	        addToSet(ALLOWED_ATTR, mathMl);
	        addToSet(ALLOWED_ATTR, xml);
	      }
	    }
	    /* Merge configuration parameters */


	    if (cfg.ADD_TAGS) {
	      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
	        ALLOWED_TAGS = clone$1(ALLOWED_TAGS);
	      }

	      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
	    }

	    if (cfg.ADD_ATTR) {
	      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
	        ALLOWED_ATTR = clone$1(ALLOWED_ATTR);
	      }

	      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
	    }

	    if (cfg.ADD_URI_SAFE_ATTR) {
	      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
	    }

	    if (cfg.FORBID_CONTENTS) {
	      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
	        FORBID_CONTENTS = clone$1(FORBID_CONTENTS);
	      }

	      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
	    }
	    /* Add #text in case KEEP_CONTENT is set to true */


	    if (KEEP_CONTENT) {
	      ALLOWED_TAGS['#text'] = true;
	    }
	    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */


	    if (WHOLE_DOCUMENT) {
	      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
	    }
	    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */


	    if (ALLOWED_TAGS.table) {
	      addToSet(ALLOWED_TAGS, ['tbody']);
	      delete FORBID_TAGS.tbody;
	    } // Prevent further manipulation of configuration.
	    // Not available in IE8, Safari 5, etc.


	    if (freeze) {
	      freeze(cfg);
	    }

	    CONFIG = cfg;
	  };

	  var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
	  var HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']); // Certain elements are allowed in both SVG and HTML
	  // namespace. We need to specify them explicitly
	  // so that they don't get erroneously deleted from
	  // HTML namespace.

	  var COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
	  /* Keep track of all possible SVG and MathML tags
	   * so that we can perform the namespace checks
	   * correctly. */

	  var ALL_SVG_TAGS = addToSet({}, svg$1);
	  addToSet(ALL_SVG_TAGS, svgFilters);
	  addToSet(ALL_SVG_TAGS, svgDisallowed);
	  var ALL_MATHML_TAGS = addToSet({}, mathMl$1);
	  addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
	  /**
	   *
	   *
	   * @param  {Element} element a DOM element whose namespace is being checked
	   * @returns {boolean} Return false if the element has a
	   *  namespace that a spec-compliant parser would never
	   *  return. Return true otherwise.
	   */

	  var _checkValidNamespace = function _checkValidNamespace(element) {
	    var parent = getParentNode(element); // In JSDOM, if we're inside shadow DOM, then parentNode
	    // can be null. We just simulate parent in this case.

	    if (!parent || !parent.tagName) {
	      parent = {
	        namespaceURI: HTML_NAMESPACE,
	        tagName: 'template'
	      };
	    }

	    var tagName = stringToLowerCase(element.tagName);
	    var parentTagName = stringToLowerCase(parent.tagName);

	    if (element.namespaceURI === SVG_NAMESPACE) {
	      // The only way to switch from HTML namespace to SVG
	      // is via <svg>. If it happens via any other tag, then
	      // it should be killed.
	      if (parent.namespaceURI === HTML_NAMESPACE) {
	        return tagName === 'svg';
	      } // The only way to switch from MathML to SVG is via
	      // svg if parent is either <annotation-xml> or MathML
	      // text integration points.


	      if (parent.namespaceURI === MATHML_NAMESPACE) {
	        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
	      } // We only allow elements that are defined in SVG
	      // spec. All others are disallowed in SVG namespace.


	      return Boolean(ALL_SVG_TAGS[tagName]);
	    }

	    if (element.namespaceURI === MATHML_NAMESPACE) {
	      // The only way to switch from HTML namespace to MathML
	      // is via <math>. If it happens via any other tag, then
	      // it should be killed.
	      if (parent.namespaceURI === HTML_NAMESPACE) {
	        return tagName === 'math';
	      } // The only way to switch from SVG to MathML is via
	      // <math> and HTML integration points


	      if (parent.namespaceURI === SVG_NAMESPACE) {
	        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
	      } // We only allow elements that are defined in MathML
	      // spec. All others are disallowed in MathML namespace.


	      return Boolean(ALL_MATHML_TAGS[tagName]);
	    }

	    if (element.namespaceURI === HTML_NAMESPACE) {
	      // The only way to switch from SVG to HTML is via
	      // HTML integration points, and from MathML to HTML
	      // is via MathML text integration points
	      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
	        return false;
	      }

	      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
	        return false;
	      } // We disallow tags that are specific for MathML
	      // or SVG and should never appear in HTML namespace


	      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
	    } // The code should never reach this place (this means
	    // that the element somehow got namespace that is not
	    // HTML, SVG or MathML). Return false just in case.


	    return false;
	  };
	  /**
	   * _forceRemove
	   *
	   * @param  {Node} node a DOM node
	   */


	  var _forceRemove = function _forceRemove(node) {
	    arrayPush(DOMPurify.removed, {
	      element: node
	    });

	    try {
	      // eslint-disable-next-line unicorn/prefer-dom-node-remove
	      node.parentNode.removeChild(node);
	    } catch (_) {
	      try {
	        node.outerHTML = emptyHTML;
	      } catch (_) {
	        node.remove();
	      }
	    }
	  };
	  /**
	   * _removeAttribute
	   *
	   * @param  {String} name an Attribute name
	   * @param  {Node} node a DOM node
	   */


	  var _removeAttribute = function _removeAttribute(name, node) {
	    try {
	      arrayPush(DOMPurify.removed, {
	        attribute: node.getAttributeNode(name),
	        from: node
	      });
	    } catch (_) {
	      arrayPush(DOMPurify.removed, {
	        attribute: null,
	        from: node
	      });
	    }

	    node.removeAttribute(name); // We void attribute values for unremovable "is"" attributes

	    if (name === 'is' && !ALLOWED_ATTR[name]) {
	      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
	        try {
	          _forceRemove(node);
	        } catch (_) {}
	      } else {
	        try {
	          node.setAttribute(name, '');
	        } catch (_) {}
	      }
	    }
	  };
	  /**
	   * _initDocument
	   *
	   * @param  {String} dirty a string of dirty markup
	   * @return {Document} a DOM, filled with the dirty markup
	   */


	  var _initDocument = function _initDocument(dirty) {
	    /* Create a HTML document */
	    var doc;
	    var leadingWhitespace;

	    if (FORCE_BODY) {
	      dirty = '<remove></remove>' + dirty;
	    } else {
	      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
	      var matches = stringMatch(dirty, /^[\r\n\t ]+/);
	      leadingWhitespace = matches && matches[0];
	    }

	    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml') {
	      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
	      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
	    }

	    var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
	    /*
	     * Use the DOMParser API by default, fallback later if needs be
	     * DOMParser not work for svg when has multiple root element.
	     */

	    if (NAMESPACE === HTML_NAMESPACE) {
	      try {
	        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
	      } catch (_) {}
	    }
	    /* Use createHTMLDocument in case DOMParser is not available */


	    if (!doc || !doc.documentElement) {
	      doc = implementation.createDocument(NAMESPACE, 'template', null);

	      try {
	        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? '' : dirtyPayload;
	      } catch (_) {// Syntax error if dirtyPayload is invalid xml
	      }
	    }

	    var body = doc.body || doc.documentElement;

	    if (dirty && leadingWhitespace) {
	      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
	    }
	    /* Work on whole document or just its body */


	    if (NAMESPACE === HTML_NAMESPACE) {
	      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
	    }

	    return WHOLE_DOCUMENT ? doc.documentElement : body;
	  };
	  /**
	   * _createIterator
	   *
	   * @param  {Document} root document/fragment to create iterator for
	   * @return {Iterator} iterator instance
	   */


	  var _createIterator = function _createIterator(root) {
	    return createNodeIterator.call(root.ownerDocument || root, root, // eslint-disable-next-line no-bitwise
	    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
	  };
	  /**
	   * _isClobbered
	   *
	   * @param  {Node} elm element to check for clobbering attacks
	   * @return {Boolean} true if clobbered, false if safe
	   */


	  var _isClobbered = function _isClobbered(elm) {
	    return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function');
	  };
	  /**
	   * _isNode
	   *
	   * @param  {Node} obj object to check whether it's a DOM node
	   * @return {Boolean} true is object is a DOM node
	   */


	  var _isNode = function _isNode(object) {
	    return _typeof(Node) === 'object' ? object instanceof Node : object && _typeof(object) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
	  };
	  /**
	   * _executeHook
	   * Execute user configurable hooks
	   *
	   * @param  {String} entryPoint  Name of the hook's entry point
	   * @param  {Node} currentNode node to work on with the hook
	   * @param  {Object} data additional hook parameters
	   */


	  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
	    if (!hooks[entryPoint]) {
	      return;
	    }

	    arrayForEach(hooks[entryPoint], function (hook) {
	      hook.call(DOMPurify, currentNode, data, CONFIG);
	    });
	  };
	  /**
	   * _sanitizeElements
	   *
	   * @protect nodeName
	   * @protect textContent
	   * @protect removeChild
	   *
	   * @param   {Node} currentNode to check for permission to exist
	   * @return  {Boolean} true if node was killed, false if left alive
	   */


	  var _sanitizeElements = function _sanitizeElements(currentNode) {
	    var content;
	    /* Execute a hook if present */

	    _executeHook('beforeSanitizeElements', currentNode, null);
	    /* Check if element is clobbered or can clobber */


	    if (_isClobbered(currentNode)) {
	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Check if tagname contains Unicode */


	    if (regExpTest(/[\u0080-\uFFFF]/, currentNode.nodeName)) {
	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Now let's check the element's type and name */


	    var tagName = transformCaseFunc(currentNode.nodeName);
	    /* Execute a hook if present */

	    _executeHook('uponSanitizeElement', currentNode, {
	      tagName: tagName,
	      allowedTags: ALLOWED_TAGS
	    });
	    /* Detect mXSS attempts abusing namespace confusion */


	    if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Mitigate a problem with templates inside select */


	    if (tagName === 'select' && regExpTest(/<template/i, currentNode.innerHTML)) {
	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Remove element if anything forbids its presence */


	    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
	      /* Check if we have a custom element to handle */
	      if (!FORBID_TAGS[tagName] && _basicCustomElementTest(tagName)) {
	        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
	        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) return false;
	      }
	      /* Keep content except for bad-listed elements */


	      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
	        var parentNode = getParentNode(currentNode) || currentNode.parentNode;
	        var childNodes = getChildNodes(currentNode) || currentNode.childNodes;

	        if (childNodes && parentNode) {
	          var childCount = childNodes.length;

	          for (var i = childCount - 1; i >= 0; --i) {
	            parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
	          }
	        }
	      }

	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Check whether element has a valid namespace */


	    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
	      _forceRemove(currentNode);

	      return true;
	    }

	    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
	      _forceRemove(currentNode);

	      return true;
	    }
	    /* Sanitize element content to be template-safe */


	    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
	      /* Get the element's text content */
	      content = currentNode.textContent;
	      content = stringReplace(content, MUSTACHE_EXPR$1, ' ');
	      content = stringReplace(content, ERB_EXPR$1, ' ');

	      if (currentNode.textContent !== content) {
	        arrayPush(DOMPurify.removed, {
	          element: currentNode.cloneNode()
	        });
	        currentNode.textContent = content;
	      }
	    }
	    /* Execute a hook if present */


	    _executeHook('afterSanitizeElements', currentNode, null);

	    return false;
	  };
	  /**
	   * _isValidAttribute
	   *
	   * @param  {string} lcTag Lowercase tag name of containing element.
	   * @param  {string} lcName Lowercase attribute name.
	   * @param  {string} value Attribute value.
	   * @return {Boolean} Returns true if `value` is valid, otherwise false.
	   */
	  // eslint-disable-next-line complexity


	  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
	    /* Make sure attribute cannot clobber */
	    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
	      return false;
	    }
	    /* Allow valid data-* attributes: At least one character after "-"
	        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
	        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
	        We don't need to check the value; it's always URI safe. */


	    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
	      if ( // First condition does a very basic check if a) it's basically a valid custom element tagname AND
	      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
	      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
	      _basicCustomElementTest(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) || // Alternative, second condition checks if it's an `is`-attribute, AND
	      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
	      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
	        return false;
	      }
	      /* Check value is safe. First, is attr inert? If so, is safe */

	    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if (!value) ; else {
	      return false;
	    }

	    return true;
	  };
	  /**
	   * _basicCustomElementCheck
	   * checks if at least one dash is included in tagName, and it's not the first char
	   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
	   * @param {string} tagName name of the tag of the node to sanitize
	   */


	  var _basicCustomElementTest = function _basicCustomElementTest(tagName) {
	    return tagName.indexOf('-') > 0;
	  };
	  /**
	   * _sanitizeAttributes
	   *
	   * @protect attributes
	   * @protect nodeName
	   * @protect removeAttribute
	   * @protect setAttribute
	   *
	   * @param  {Node} currentNode to sanitize
	   */


	  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
	    var attr;
	    var value;
	    var lcName;
	    var l;
	    /* Execute a hook if present */

	    _executeHook('beforeSanitizeAttributes', currentNode, null);

	    var attributes = currentNode.attributes;
	    /* Check if we have attributes; if not we might have a text node */

	    if (!attributes) {
	      return;
	    }

	    var hookEvent = {
	      attrName: '',
	      attrValue: '',
	      keepAttr: true,
	      allowedAttributes: ALLOWED_ATTR
	    };
	    l = attributes.length;
	    /* Go backwards over all attributes; safely remove bad ones */

	    while (l--) {
	      attr = attributes[l];
	      var _attr = attr,
	          name = _attr.name,
	          namespaceURI = _attr.namespaceURI;
	      value = name === 'value' ? attr.value : stringTrim(attr.value);
	      lcName = transformCaseFunc(name);
	      /* Execute a hook if present */

	      hookEvent.attrName = lcName;
	      hookEvent.attrValue = value;
	      hookEvent.keepAttr = true;
	      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set

	      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);

	      value = hookEvent.attrValue;
	      /* Did the hooks approve of the attribute? */

	      if (hookEvent.forceKeepAttr) {
	        continue;
	      }
	      /* Remove attribute */


	      _removeAttribute(name, currentNode);
	      /* Did the hooks approve of the attribute? */


	      if (!hookEvent.keepAttr) {
	        continue;
	      }
	      /* Work around a security issue in jQuery 3.0 */


	      if (regExpTest(/\/>/i, value)) {
	        _removeAttribute(name, currentNode);

	        continue;
	      }
	      /* Sanitize attribute content to be template-safe */


	      if (SAFE_FOR_TEMPLATES) {
	        value = stringReplace(value, MUSTACHE_EXPR$1, ' ');
	        value = stringReplace(value, ERB_EXPR$1, ' ');
	      }
	      /* Is `value` valid for this attribute? */


	      var lcTag = transformCaseFunc(currentNode.nodeName);

	      if (!_isValidAttribute(lcTag, lcName, value)) {
	        continue;
	      }
	      /* Full DOM Clobbering protection via namespace isolation,
	       * Prefix id and name attributes with `user-content-`
	       */


	      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
	        // Remove the attribute with this value
	        _removeAttribute(name, currentNode); // Prefix the value and later re-create the attribute with the sanitized value


	        value = SANITIZE_NAMED_PROPS_PREFIX + value;
	      }
	      /* Handle attributes that require Trusted Types */


	      if (trustedTypesPolicy && _typeof(trustedTypes) === 'object' && typeof trustedTypes.getAttributeType === 'function') {
	        if (namespaceURI) ; else {
	          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
	            case 'TrustedHTML':
	              value = trustedTypesPolicy.createHTML(value);
	              break;

	            case 'TrustedScriptURL':
	              value = trustedTypesPolicy.createScriptURL(value);
	              break;
	          }
	        }
	      }
	      /* Handle invalid data-* attribute set by try-catching it */


	      try {
	        if (namespaceURI) {
	          currentNode.setAttributeNS(namespaceURI, name, value);
	        } else {
	          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
	          currentNode.setAttribute(name, value);
	        }

	        arrayPop(DOMPurify.removed);
	      } catch (_) {}
	    }
	    /* Execute a hook if present */


	    _executeHook('afterSanitizeAttributes', currentNode, null);
	  };
	  /**
	   * _sanitizeShadowDOM
	   *
	   * @param  {DocumentFragment} fragment to iterate over recursively
	   */


	  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
	    var shadowNode;

	    var shadowIterator = _createIterator(fragment);
	    /* Execute a hook if present */


	    _executeHook('beforeSanitizeShadowDOM', fragment, null);

	    while (shadowNode = shadowIterator.nextNode()) {
	      /* Execute a hook if present */
	      _executeHook('uponSanitizeShadowNode', shadowNode, null);
	      /* Sanitize tags and elements */


	      if (_sanitizeElements(shadowNode)) {
	        continue;
	      }
	      /* Deep shadow DOM detected */


	      if (shadowNode.content instanceof DocumentFragment) {
	        _sanitizeShadowDOM(shadowNode.content);
	      }
	      /* Check attributes, sanitize if necessary */


	      _sanitizeAttributes(shadowNode);
	    }
	    /* Execute a hook if present */


	    _executeHook('afterSanitizeShadowDOM', fragment, null);
	  };
	  /**
	   * Sanitize
	   * Public method providing core sanitation functionality
	   *
	   * @param {String|Node} dirty string or DOM node
	   * @param {Object} configuration object
	   */
	  // eslint-disable-next-line complexity


	  DOMPurify.sanitize = function (dirty) {
	    var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var body;
	    var importedNode;
	    var currentNode;
	    var oldNode;
	    var returnNode;
	    /* Make sure we have a string to sanitize.
	      DO NOT return early, as this will return the wrong type if
	      the user has requested a DOM object rather than a string */

	    IS_EMPTY_INPUT = !dirty;

	    if (IS_EMPTY_INPUT) {
	      dirty = '<!-->';
	    }
	    /* Stringify, in case dirty is an object */


	    if (typeof dirty !== 'string' && !_isNode(dirty)) {
	      // eslint-disable-next-line no-negated-condition
	      if (typeof dirty.toString !== 'function') {
	        throw typeErrorCreate('toString is not a function');
	      } else {
	        dirty = dirty.toString();

	        if (typeof dirty !== 'string') {
	          throw typeErrorCreate('dirty is not a string, aborting');
	        }
	      }
	    }
	    /* Check we can run. Otherwise fall back or ignore */


	    if (!DOMPurify.isSupported) {
	      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
	        if (typeof dirty === 'string') {
	          return window.toStaticHTML(dirty);
	        }

	        if (_isNode(dirty)) {
	          return window.toStaticHTML(dirty.outerHTML);
	        }
	      }

	      return dirty;
	    }
	    /* Assign config vars */


	    if (!SET_CONFIG) {
	      _parseConfig(cfg);
	    }
	    /* Clean up removed elements */


	    DOMPurify.removed = [];
	    /* Check if dirty is correctly typed for IN_PLACE */

	    if (typeof dirty === 'string') {
	      IN_PLACE = false;
	    }

	    if (IN_PLACE) {
	      /* Do some early pre-sanitization to avoid unsafe root nodes */
	      if (dirty.nodeName) {
	        var tagName = transformCaseFunc(dirty.nodeName);

	        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
	          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
	        }
	      }
	    } else if (dirty instanceof Node) {
	      /* If dirty is a DOM element, append to an empty document to avoid
	         elements being stripped by the parser */
	      body = _initDocument('<!---->');
	      importedNode = body.ownerDocument.importNode(dirty, true);

	      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
	        /* Node is already a body, use as is */
	        body = importedNode;
	      } else if (importedNode.nodeName === 'HTML') {
	        body = importedNode;
	      } else {
	        // eslint-disable-next-line unicorn/prefer-dom-node-append
	        body.appendChild(importedNode);
	      }
	    } else {
	      /* Exit directly if we have nothing to do */
	      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
	      dirty.indexOf('<') === -1) {
	        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
	      }
	      /* Initialize the document to work on */


	      body = _initDocument(dirty);
	      /* Check we have a DOM node from the data */

	      if (!body) {
	        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
	      }
	    }
	    /* Remove first element node (ours) if FORCE_BODY is set */


	    if (body && FORCE_BODY) {
	      _forceRemove(body.firstChild);
	    }
	    /* Get node iterator */


	    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);
	    /* Now start iterating over the created document */


	    while (currentNode = nodeIterator.nextNode()) {
	      /* Fix IE's strange behavior with manipulated textNodes #89 */
	      if (currentNode.nodeType === 3 && currentNode === oldNode) {
	        continue;
	      }
	      /* Sanitize tags and elements */


	      if (_sanitizeElements(currentNode)) {
	        continue;
	      }
	      /* Shadow DOM detected, sanitize it */


	      if (currentNode.content instanceof DocumentFragment) {
	        _sanitizeShadowDOM(currentNode.content);
	      }
	      /* Check attributes, sanitize if necessary */


	      _sanitizeAttributes(currentNode);

	      oldNode = currentNode;
	    }

	    oldNode = null;
	    /* If we sanitized `dirty` in-place, return it. */

	    if (IN_PLACE) {
	      return dirty;
	    }
	    /* Return sanitized string or DOM */


	    if (RETURN_DOM) {
	      if (RETURN_DOM_FRAGMENT) {
	        returnNode = createDocumentFragment.call(body.ownerDocument);

	        while (body.firstChild) {
	          // eslint-disable-next-line unicorn/prefer-dom-node-append
	          returnNode.appendChild(body.firstChild);
	        }
	      } else {
	        returnNode = body;
	      }

	      if (ALLOWED_ATTR.shadowroot) {
	        /*
	          AdoptNode() is not used because internal state is not reset
	          (e.g. the past names map of a HTMLFormElement), this is safe
	          in theory but we would rather not risk another attack vector.
	          The state that is cloned by importNode() is explicitly defined
	          by the specs.
	        */
	        returnNode = importNode.call(originalDocument, returnNode, true);
	      }

	      return returnNode;
	    }

	    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
	    /* Serialize doctype if allowed */

	    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
	      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
	    }
	    /* Sanitize final string template-safe */


	    if (SAFE_FOR_TEMPLATES) {
	      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$1, ' ');
	      serializedHTML = stringReplace(serializedHTML, ERB_EXPR$1, ' ');
	    }

	    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
	  };
	  /**
	   * Public method to set the configuration once
	   * setConfig
	   *
	   * @param {Object} cfg configuration object
	   */


	  DOMPurify.setConfig = function (cfg) {
	    _parseConfig(cfg);

	    SET_CONFIG = true;
	  };
	  /**
	   * Public method to remove the configuration
	   * clearConfig
	   *
	   */


	  DOMPurify.clearConfig = function () {
	    CONFIG = null;
	    SET_CONFIG = false;
	  };
	  /**
	   * Public method to check if an attribute value is valid.
	   * Uses last set config, if any. Otherwise, uses config defaults.
	   * isValidAttribute
	   *
	   * @param  {string} tag Tag name of containing element.
	   * @param  {string} attr Attribute name.
	   * @param  {string} value Attribute value.
	   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
	   */


	  DOMPurify.isValidAttribute = function (tag, attr, value) {
	    /* Initialize shared config vars if necessary. */
	    if (!CONFIG) {
	      _parseConfig({});
	    }

	    var lcTag = transformCaseFunc(tag);
	    var lcName = transformCaseFunc(attr);
	    return _isValidAttribute(lcTag, lcName, value);
	  };
	  /**
	   * AddHook
	   * Public method to add DOMPurify hooks
	   *
	   * @param {String} entryPoint entry point for the hook to add
	   * @param {Function} hookFunction function to execute
	   */


	  DOMPurify.addHook = function (entryPoint, hookFunction) {
	    if (typeof hookFunction !== 'function') {
	      return;
	    }

	    hooks[entryPoint] = hooks[entryPoint] || [];
	    arrayPush(hooks[entryPoint], hookFunction);
	  };
	  /**
	   * RemoveHook
	   * Public method to remove a DOMPurify hook at a given entryPoint
	   * (pops it from the stack of hooks if more are present)
	   *
	   * @param {String} entryPoint entry point for the hook to remove
	   * @return {Function} removed(popped) hook
	   */


	  DOMPurify.removeHook = function (entryPoint) {
	    if (hooks[entryPoint]) {
	      return arrayPop(hooks[entryPoint]);
	    }
	  };
	  /**
	   * RemoveHooks
	   * Public method to remove all DOMPurify hooks at a given entryPoint
	   *
	   * @param  {String} entryPoint entry point for the hooks to remove
	   */


	  DOMPurify.removeHooks = function (entryPoint) {
	    if (hooks[entryPoint]) {
	      hooks[entryPoint] = [];
	    }
	  };
	  /**
	   * RemoveAllHooks
	   * Public method to remove all DOMPurify hooks
	   *
	   */


	  DOMPurify.removeAllHooks = function () {
	    hooks = {};
	  };

	  return DOMPurify;
	}

	var purify = createDOMPurify();

	const DEFAULT_ALLOWED = [
	    'a',
	    'span',
	    'b',
	    'br',
	    'i',
	    'strong',
	    'sup',
	    'sub',
	    'strike',
	    'u',
	    'em',
	    'tt'
	];

	/**
	 * Set default TARGET and REL for A tags.
	 *
	 * Don't overwrite target="_self".
	 */
	purify.addHook('afterSanitizeElements', function (el) {
	    if (el.nodeName.toLowerCase() === 'a') {
	        if (el.getAttribute('target') !== '_self') {
	            el.setAttribute('target', '_blank');
	        }
	        el.setAttribute('rel', 'nofollow noopener noreferrer');
	    }
	});

	/**
	 * Remove all HTML tags from given `input` string, except `allowed` tags.
	 *
	 * @exports purifyHTML
	 * @kind function
	 *
	 * @param {string} input - dirty HTML input
	 * @param {string} [string[]] - list of allowed tags; see DEFAULT_ALLOWED for the default value
	 * @return {string} - the cleaned HTML output
	 */
	function purifyHTML(input, allowed = DEFAULT_ALLOWED) {
	    if (!input) {
	        return input;
	    }
	    if (typeof allowed === 'string') {
	        allowed = Array.from(allowed.toLowerCase().matchAll(/<([a-z][a-z0-9]*)>/g)).map(m => m[1]);
	    }
	    return purify.sanitize(input, {
	        ALLOWED_TAGS: allowed,
	        ADD_ATTR: ['target'],
	        FORCE_BODY: true // Makes sure that top-level SCRIPT tags are kept if explicitly allowed.
	    });
	}

	const ALLOWED_HTML =
	    '<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br>' + // Block elements (Markdown official)
	    '<a><em><i><strong><b><code><img>' + // Inline elements (Markdown official)
	    '<table><tr><th><td>' + // Tables
	    '<small><span><div><sup><sub><tt>'; // Additional tags to support advanced customization

	const __messages$1 = {};

	function initMessages$1(scope = 'core') {
	    /* globals dw */

	    // let's check if we're in a chart
	    if (scope === 'chart') {
	        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	            // use in-chart translations
	            __messages$1[scope] = window.__dw.vis.meta.locale || {};
	        }
	    } else {
	        // use backend translations
	        __messages$1[scope] =
	            scope === 'core'
	                ? dw.backend.__messages.core
	                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
	    }
	}

	function getText(key, scope, messages) {
	    try {
	        const msg = messages[scope];
	        return msg[key] || key;
	    } catch (e) {
	        return key;
	    }
	}

	/**
	 * Replaces named placeholders marked with %, such as %name% or %id.
	 */
	function replaceNamedPlaceholders(text, replacements = {}) {
	    Object.entries(replacements).forEach(([k, v]) => {
	        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), v);
	    });
	    return text;
	}

	/**
	 * Replaces numbered placeholders marked with $, such as $0, $1 etc.
	 */
	function replaceNumberedPlaceholders(text, replacements = []) {
	    return text.replace(/\$(\d)/g, (m, i) => {
	        if (replacements[+i] === undefined) return m;
	        return purifyHTML(replacements[+i], '');
	    });
	}

	/**
	 * Translates a message key, replaces placeholders within translated strings, and sanitizes the
	 * result of the translation so that it can be safely used in HTML.
	 *
	 * @param {string} key -- the key to be translated, e.g. "signup / hed"
	 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
	 * @param {object} messages -- translation strings in the format of { scope: { key: value }}
	 * @param {string|object} replacements -- replacements for placeholders in the translations strings
	 * @returns {string} -- the translated text
	 */
	function translate(key, scope = 'core', messages, ...replacements) {
	    let text = getText(key, scope, messages);
	    if (typeof replacements[0] === 'string') {
	        // use legacy, parameterized string replacements ($0, $1, etc.)
	        text = replaceNumberedPlaceholders(text, replacements);
	    } else {
	        // use object for string replacement (i.e. %key% for { key: 'value' })
	        text = replaceNamedPlaceholders(text, replacements[0]);
	    }
	    return purifyHTML(text, ALLOWED_HTML);
	}

	/**
	 * Helper for finding a translation key based on a globally accessible dictionary (to be used
	 * e.g. in visualization plugins and legacy Svelte 2 code).
	 *
	 * Translates a message key, replaces placeholders within translated strings, and sanitizes the
	 * result of the translation so that it can be safely used in HTML.
	 *
	 * For the client-side translation to work we are pulling the translations from the global
	 * `window.dw.backend.__messages` object. plugins that need client-side translations must set
	 * `"svelte": true` in their plugin.json.
	 *
	 * @param {string} key -- the key to be translated, e.g. "signup / hed"
	 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
	 * @param {string|object} replacements -- replacements for placeholders in the translations strings
	 * @returns {string} -- the translated text
	 */
	function __$1(key, scope = 'core', ...replacements) {
	    key = key.trim();
	    if (!__messages$1[scope]) initMessages$1(scope);
	    if (!__messages$1[scope][key]) return 'MISSING:' + key;
	    return translate(key, scope, __messages$1, ...replacements);
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

	function contains$1(array, obj) {
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
	    return contains$1(value, token.value);
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

	function random$1(a) {
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

	function max$2(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.max.apply(Math, array);
	  } else {
	    return Math.max.apply(Math, arguments);
	  }
	}

	function min$2(array) {
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
	        RANDOM: random$1,
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
	            return min$2(v);
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
	            return max$2(filterNumbers.apply(this, arguments));
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

	function getComputedColumns(chart) {
	    let virtualColumns = chart.get('metadata.describe.computed-columns', []);
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
	    return virtualColumns;
	}

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

	var upgradeIcon = '<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>';

	/* node_modules/@datawrapper/controls/HelpDisplay.html generated by Svelte v2.16.1 */



	function helpIcon({ type }) {
	    return type === 'upgrade-info' ? upgradeIcon : '?';
	}
	function data$b() {
	    return {
	        visible: false,
	        class: '',
	        compact: false,
	        style: null,
	        type: 'help',
	        uid: ''
	    };
	}
	var methods$6 = {
	    show() {
	        const t = setTimeout(() => {
	            this.set({ visible: true });
	        }, 400);
	        this.set({ t });
	    },
	    hide() {
	        const { t } = this.get();
	        clearTimeout(t);
	        this.set({ visible: false });
	    }
	};

	const file$9 = "node_modules/datawrapper/controls/HelpDisplay.html";

	function create_main_fragment$b(component, ctx) {
		var div, span, span_class_value, text, div_class_value;

		var if_block = (ctx.visible) && create_if_block$8(component, ctx);

		function mouseenter_handler(event) {
			component.show();
		}

		function mouseleave_handler(event) {
			component.hide();
		}

		return {
			c: function create() {
				div = createElement("div");
				span = createElement("span");
				text = createText("\n    ");
				if (if_block) if_block.c();
				span.className = span_class_value = "help-icon " + ctx.type + " svelte-1h0yjz4";
				toggleClass(span, "visible", ctx.visible);
				addLoc(span, file$9, 9, 4, 180);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = div_class_value = "help " + ctx.class + " " + ctx.type + " svelte-1h0yjz4";
				div.style.cssText = ctx.style;
				div.dataset.uid = ctx.uid;
				toggleClass(div, "compact", {compact: ctx.compact});
				addLoc(div, file$9, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				span.innerHTML = ctx.helpIcon;
				append(div, text);
				if (if_block) if_block.m(div, null);
				component.refs.helpDisplay = div;
			},

			p: function update(changed, ctx) {
				if (changed.helpIcon) {
					span.innerHTML = ctx.helpIcon;
				}

				if ((changed.type) && span_class_value !== (span_class_value = "help-icon " + ctx.type + " svelte-1h0yjz4")) {
					span.className = span_class_value;
				}

				if ((changed.type || changed.visible)) {
					toggleClass(span, "visible", ctx.visible);
				}

				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$8(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.class || changed.type) && div_class_value !== (div_class_value = "help " + ctx.class + " " + ctx.type + " svelte-1h0yjz4")) {
					div.className = div_class_value;
				}

				if (changed.style) {
					div.style.cssText = ctx.style;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
				}

				if ((changed.class || changed.type || changed.compact)) {
					toggleClass(div, "compact", {compact: ctx.compact});
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
				if (component.refs.helpDisplay === div) component.refs.helpDisplay = null;
			}
		};
	}

	// (11:4) {#if visible}
	function create_if_block$8(component, ctx) {
		var div, text0, text1, slot_content_default = component._slotted.default, slot_content_default_before, div_class_value;

		var if_block0 = (ctx.type === 'help') && create_if_block_2$3();

		var if_block1 = (ctx.type === 'upgrade-info') && create_if_block_1$6();

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if (if_block1) if_block1.c();
				text1 = createText("\n        ");
				div.className = div_class_value = "content " + ctx.type + " svelte-1h0yjz4";
				addLoc(div, file$9, 11, 4, 283);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				if (if_block1) if_block1.m(div, null);
				append(div, text1);

				if (slot_content_default) {
					append(div, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.type === 'help') {
					if (!if_block0) {
						if_block0 = create_if_block_2$3();
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.type === 'upgrade-info') {
					if (!if_block1) {
						if_block1 = create_if_block_1$6();
						if_block1.c();
						if_block1.m(div, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.type) && div_class_value !== (div_class_value = "content " + ctx.type + " svelte-1h0yjz4")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}
			}
		};
	}

	// (13:8) {#if type === 'help'}
	function create_if_block_2$3(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "hat-icon im im-graduation-hat svelte-1h0yjz4";
				addLoc(i, file$9, 13, 8, 350);
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

	// (15:14) {#if type === 'upgrade-info'}
	function create_if_block_1$6(component, ctx) {
		var div, text_value = __('upgrade-available'), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "content-header svelte-1h0yjz4";
				addLoc(div, file$9, 15, 8, 448);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function HelpDisplay(options) {
		this._debugName = '<HelpDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$b(), options.data);

		this._recompute({ type: 1 }, this._state);
		if (!('type' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'type'");
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('compact' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'compact'");
		if (!('style' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'style'");
		if (!('uid' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'uid'");
		if (!('visible' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(HelpDisplay.prototype, protoDev);
	assign(HelpDisplay.prototype, methods$6);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('helpIcon' in newState && !this._updatingReadonlyProperty) throw new Error("<HelpDisplay>: Cannot set read-only property 'helpIcon'");
	};

	HelpDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.type) {
			if (this._differs(state.helpIcon, (state.helpIcon = helpIcon(state)))) changed.helpIcon = true;
		}
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
	const patch = (httpReq.patch = httpReqVerb('PATCH'));

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

	/* describe/ComputedColumnEditor.html generated by Svelte v2.16.1 */



	/* globals dw */

	function formatRows(rows) {
	    let curSpanStart = 0;
	    const parts = [];
	    for (let i = 1; i < rows.length; i++) {
	        if (rows[i] - rows[curSpanStart] > i - curSpanStart) {
	            // we skipped a row, finish current span
	            parts.push(
	                i > curSpanStart + 1
	                    ? `${rows[curSpanStart]}-${rows[i - 1]}`
	                    : rows[curSpanStart]
	            );
	            curSpanStart = i;
	        }
	    }
	    parts.push(
	        rows.length > curSpanStart + 1
	            ? `${rows[curSpanStart]}-${rows[rows.length - 1]}`
	            : rows[curSpanStart]
	    );
	    return parts.join(', ');
	}

	function title$1({ name }) {
	    return __$1('describe / edit-column', 'core', { s: `"${name}"` });
	}
	function metaColumns({ columns, column }) {
	    const metaColumns = [];
	    if (!columns) return metaColumns;
	    const columnVarName = columnNameToVariable(column.origName());
	    for (const col of columns) {
	        if (col.name() === column.name()) {
	            // Skip the current column.
	            continue;
	        }
	        const colVarName = columnNameToVariable(
	            col.isComputed ? col.origName() : col.name()
	        );
	        if (!colVarName) {
	            // Skip a column with empty name to prevent Code Mirror crash.
	            continue;
	        }
	        if (colVarName === columnVarName) {
	            // Skip a normal column that has the same variable name as the current
	            // column, because chart-core treats that as a circular dependency.
	            continue;
	        }
	        metaColumns.push({
	            key: colVarName,
	            title: col.title(),
	            type: col.isComputed ? 'computed' : col.type()
	        });
	    }
	    return metaColumns;
	}
	function keywords({ metaColumns }) {
	    const keywords = [];
	    metaColumns.forEach(function (col) {
	        if (col.type === 'number' || col.type === 'computed') {
	            keywords.push(col.key + '__sum');
	            keywords.push(col.key + '__min');
	            keywords.push(col.key + '__max');
	            keywords.push(col.key + '__mean');
	            keywords.push(col.key + '__median');
	        } else if (col.type === 'date') {
	            keywords.push(col.key + '__min');
	            keywords.push(col.key + '__max');
	        }
	        keywords.push(col.key);
	    });
	    return keywords.sort((a, b) => b.length - a.length);
	}
	function context({ metaColumns }) {
	    const res = { ROWNUMBER: 1 };
	    const keywords = ['sum', 'round', 'min', 'max', 'median', 'mean'];
	    metaColumns.forEach(function (col) {
	        res[col.key] =
	            col.type === 'number' ? 42 : col.type === 'text' ? 'answer' : new Date();
	        if (col.type === 'number' || col.type === 'computed') {
	            keywords.forEach(kw => {
	                res[`${col.key}__${kw}`] = 42;
	            });
	        }
	    });
	    return res;
	}
	function looksLikeColumnData({ formula, error }) {
	    const lines = formula.split('\n');
	    if (lines.length > 4 && !formula.includes('(')) {
	        if (error) {
	            return true;
	        }
	    }
	    return false;
	}
	function computedColumns({ $dw_chart }) {
	    return getComputedColumns($dw_chart);
	}
	function error({ formula, context }) {
	    try {
	        if (formula.trim() !== '') {
	            Parser.evaluate(formula, context);
	        }
	        return null;
	    } catch (e) {
	        return e.message;
	    }
	}
	function errDisplay({ error, parserErrors }) {
	    if (parserErrors.length) {
	        return Object.entries(groupBy_1(parserErrors, d => d.message))
	            .map(([message, err]) => {
	                return (
	                    message +
	                    (err[0].row !== 'all'
	                        ? ` (rows ${formatRows(err.map(d => d.row + 2))})`
	                        : '')
	                );
	            })
	            .join('<br />');
	    }
	    return error || false;
	}
	function errNiceDisplay({ errDisplay }) {
	    if (!errDisplay) return errDisplay;
	    return errDisplay
	        .replace('unexpected TOP', __$1('cc / formula / error / unexpected top'))
	        .replace(': Expected EOF', '')
	        .replace('unexpected TPAREN', __$1('cc / formula / error / unexpected tparen'))
	        .replace('unexpected TBRACKET', __$1('cc / formula / error / unexpected tparen'))
	        .replace('unexpected TEOF: EOF', __$1('cc / formula / error / unexpected teof'))
	        .replace('unexpected TCOMMA', __$1('cc / formula / error / unexpected tcomma'))
	        .replace(
	            'unexpected TSEMICOLON',
	            __$1('cc / formula / error / unexpected tsemicolon')
	        )
	        .replace('undefined variable', __$1('cc / formula / error / undefined variable'))
	        .replace('parse error', __$1('cc / formula / error / parser error'))
	        .replace('Unknown character', __$1('cc / formula / error / unknown-character'))
	        .replace('unexpected', __$1('cc / formula / error / unexpected'))
	        .replace(
	            'member access is not permitted',
	            __$1('cc / formula / error / member-access')
	        );
	}
	function formulaHint({ errDisplay, formula }) {
	    if (formula.trim().charAt(0) === '=') {
	        return __$1('cc / formula / hint / equal-sign');
	    }
	    if (!errDisplay || typeof errDisplay !== 'string') return '';
	    const errors = errDisplay.split('<br />');
	    for (let i = 0; i < errors.length; i++) {
	        if (errors[i].startsWith('undefined variable:')) {
	            // let's see if we know this variable
	            const name = errors[i].split(': ')[1].split('(row')[0].trim();
	            if (
	                Parser.keywords.includes(name.toUpperCase()) &&
	                !Parser.keywords.includes(name)
	            ) {
	                return `${__$1(
                    'cc / formula / hint / use'
                )} <tt>${name.toUpperCase()}</tt> ${__$1(
                    'cc / formula / hint / instead-of'
                )} <tt>${name}</tt>`;
	            }
	            if (name === 'row') {
	                return `${__$1('cc / formula / hint / use')} <tt>ROWNUMBER</tt> ${__$1(
                    'cc / formula / hint / instead-of'
                )} <tt>row</tt>`;
	            }
	        }
	    }
	    // check for Math.X
	    const m = (formula || '').match(/Math\.([a-zA-Z0-9]+)/);
	    if (m && Parser.keywords.includes(m[1].toUpperCase())) {
	        return `${__$1('cc / formula / hint / use')} <tt>${m[1].toUpperCase()}</tt> ${__$1(
            'cc / formula / hint / instead-of'
        )} <tt>${m[0]}</tt>`;
	    }
	    // check for some other functions string
	    const hints = [
	        { s: 'substr', h: 'SUBSTR(x, start, length)' },
	        { s: 'substring', h: 'SUBSTR(x, start, length)' },
	        { s: 'replace', h: 'REPLACE(x, old, new)' },
	        { s: 'indexOf', h: 'INDEXOF(x, search)' },
	        { s: 'toFixed', h: 'ROUND(x, decimals)' },
	        { s: 'length', h: 'LENGTH(x)' },
	        { s: 'trim', h: 'TRIM(x)' },
	        { s: 'split', h: 'SPLIT(x, sep)' },
	        { s: 'join', h: 'JOIN(x, sep)' },
	        { s: 'getFullYear', h: 'YEAR(x)' },
	        { s: 'getMonth', h: 'MONTH(x)' },
	        { s: 'getDate', h: 'DAY(x)' },
	        { s: 'includes', h: 'y in x' }
	    ];
	    for (let i = 0; i < hints.length; i++) {
	        const { s, h } = hints[i];
	        const reg = new RegExp('([a-z0-9_]+)\\.' + s + '\\(');
	        const m = formula.match(reg);
	        if (m) {
	            return `${__$1('cc / formula / hint / use')} <tt>${h.replace(
                '%x',
                m[1]
            )}</tt> ${__$1('cc / formula / hint / instead-of')}<tt>x.${s}()</tt>`;
	        }
	    }
	    if (errDisplay.includes('"&"') && formula.includes('&&')) {
	        return `${__$1('cc / formula / hint / use')} <tt>x and y</tt> ${__$1(
            'cc / formula / hint / instead-of'
        )} <tt>x && y</tt>`;
	    }
	    if (errDisplay.includes('is not a function') && formula.includes('||')) {
	        return `${__$1('cc / formula / hint / use')} <tt>x or y</tt> ${__$1(
            'cc / formula / hint / instead-of'
        )} <tt>x || y</tt>`;
	    }
	    return '';
	}
	function data$a() {
	    return {
	        name: '',
	        formula: '',
	        parserErrors: [],
	        checking: false,
	        didYouKnow: true
	    };
	}
	var methods$5 = {
	    insert(column) {
	        const { cm } = this.get();
	        cm.replaceSelection(column.key);
	        cm.focus();
	    },
	    unmarkErrors() {
	        window.document
	            .querySelectorAll('span.parser-error')
	            .forEach(node => node.classList.remove('parser-error'));
	    },
	    removeColumn() {
	        const { column } = this.get();
	        const { dw_chart: dwChart } = this.store.get();
	        const ds = dwChart.dataset();
	        const customCols = clone$2(getComputedColumns(dwChart)).filter(
	            col => col.name !== column.origName()
	        );
	        // get old column index
	        const colIndex = ds.columnOrder()[ds.indexOf(column.name())];
	        // delete all changes that have been made to this column
	        const changes = dwChart.get('metadata.data.changes', []);
	        const newChanges = [];
	        changes.forEach(c => {
	            if (c.column === colIndex) return; // skip
	            // move changes for succeeding columns
	            if (c.column > colIndex) c.column--;
	            newChanges.push(c);
	        });
	        dwChart.set('metadata.describe.computed-columns', customCols);
	        dwChart.set('metadata.data.changes', newChanges);
	        this.fire('unselect');
	    },
	    copyFormulaToData() {
	        const { column, formula } = this.get();
	        const col = dw.column('', formula.split('\n'));
	        // remove existing data changes for this column
	        const newFormula = `[${col
            .values()
            .map((d, i) =>
                (d instanceof Date && !isNaN(d)) || typeof d === 'string'
                    ? JSON.stringify(col.raw(i))
                    : d
            )
            .join(',\n')}][ROWNUMBER]`;
	        // apply new changes
	        this.set({ formula: newFormula, parserErrors: [] });
	        this.setFormula(newFormula, column.name(), column.origName());
	    },
	    setFormula(formula, name, origName) {
	        if (formula === undefined) return;
	        const { dw_chart: dwChart, tableDataset } = this.store.get();
	        // try out formula first
	        const { cm } = this.get();
	        this.set({ formula });
	        const parserErrors = [];
	        // update codemirror
	        if (formula !== cm.getValue()) {
	            cm.setValue(formula);
	        }
	        // remove custom error marks
	        setTimeout(() => this.unmarkErrors());
	        // update dw.chart
	        const customCols = clone$2(getComputedColumns(dwChart));
	        const thisCol = customCols.find(d => d.name === origName);
	        if (!thisCol) {
	            // try again later
	            return setTimeout(() => {
	                this.setFormula(formula, name, origName);
	            }, 100);
	        }
	        if (thisCol.formula !== formula) {
	            thisCol.formula = formula;
	            dwChart.set('metadata.describe.computed-columns', customCols);
	            // check for errors later
	            this.set({ checking: true });
	        } else {
	            this.set({ checking: false });
	            let column;
	            try {
	                column = tableDataset.column(name);
	            } catch (e) {
	                console.error(`Failed to load column "${name}"`);
	            }
	            if (column && column.errors) {
	                column.errors.forEach(err => parserErrors.push(err));
	            }
	        }

	        this.set({ parserErrors });
	    },
	    async closeDidYouKnow() {
	        try {
	            await patch('/v3/me/data', {
	                payload: {
	                    'new-computed-columns-syntax': 1
	                }
	            });
	            window.dw.backend.__userData['new-computed-columns-syntax'] = 1;
	        } catch (err) {
	            console.error(err);
	        }
	        this.set({ didYouKnow: false });
	    }
	};

	function oncreate$4() {
	    const app = this;
	    const { column, computedColumns } = this.get();

	    const { dw_chart: dwChart } = this.store.get();

	    const thisCol = computedColumns.find(d => d.name === column.origName());

	    if (window.dw.backend.__userData['new-computed-columns-syntax']) {
	        this.set({
	            didYouKnow: !JSON.parse(
	                window.dw.backend.__userData['new-computed-columns-syntax'] || 'false'
	            )
	        });
	    }

	    this.set({
	        formula: thisCol.formula || '',
	        name: column.origName()
	    });

	    const errReg = /(?:parse error) \[(\d+):(\d+)\]:/;

	    this.on('hotRendered', () => {
	        const { checking, formula } = this.get();
	        if (!checking) return;

	        const parserErrors = [];
	        if (column.formula === formula) {
	            (column.errors || []).forEach(err => {
	                parserErrors.push(err);
	            });
	        }
	        this.unmarkErrors();
	        this.set({ parserErrors, checking: false });
	    });

	    function scriptHint(editor) {
	        // Find the token at the cursor
	        const cur = editor.getCursor();
	        const token = editor.getTokenAt(cur);
	        let match = [];

	        const { keywords } = app.get();
	        if (token.type === 'variable-x') {
	            match = keywords.filter(function (chk) {
	                return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
	            });
	        } else if (token.type === 'keyword-x') {
	            match = Parser.keywords.filter(function (chk) {
	                return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
	            });
	        }

	        return {
	            list: match.sort(),
	            from: CodeMirror__default['default'].Pos(cur.line, token.start),
	            to: CodeMirror__default['default'].Pos(cur.line, token.end)
	        };
	    }

	    // CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
	    //     return scriptHint(editor, options);
	    // });

	    const cm = CodeMirror__default['default'].fromTextArea(this.refs.code, {
	        value: this.get().formula || '',
	        mode: 'simple',
	        indentUnit: 2,
	        tabSize: 2,
	        lineWrapping: true,
	        matchBrackets: true,
	        placeholder: '',
	        continueComments: 'Enter',
	        extraKeys: {
	            Tab: 'autocomplete'
	        },
	        hintOptions: {
	            hint: scriptHint
	        }
	    });

	    window.CodeMirror = CodeMirror__default['default'];

	    this.set({ cm });

	    let changeNameTimer;
	    const changeName = newName => {
	        clearTimeout(changeNameTimer);
	        // Save 'column' in a closure, so we remember which column we're renaming when
	        // column selection changes while the timeout is running.
	        const { column } = this.get();
	        changeNameTimer = setTimeout(() => {
	            let { computedColumns } = this.get();
	            if (!computedColumns) {
	                // This can happen when editing computed columns frenetically.
	                console.error('Computed columns are not loaded');
	                return;
	            }
	            computedColumns = clone$2(computedColumns);
	            const computedColumn = computedColumns.find(d => d.name === column.origName());
	            if (!computedColumn) {
	                console.error(`Computed column "${column.origName()}" was not found`);
	                return;
	            }
	            const existingComputedColIndex = computedColumns.findIndex(
	                d => d.name === newName
	            );
	            if (existingComputedColIndex !== -1) {
	                computedColumns.splice(existingComputedColIndex, 1);
	            }
	            computedColumn.name = newName;
	            column.name(newName);
	            dwChart.set('metadata.describe.computed-columns', computedColumns);
	            this.store.set({ dwChart });
	        }, 1500);
	    };

	    const { formula, keywords } = this.get();

	    cmInit(keywords);
	    this.setFormula(formula, column.name(), column.origName());

	    this.on('state', ({ changed, current, previous }) => {
	        // update if column changes
	        if (changed.column) {
	            const col = current.column;

	            if (col && current.computedColumns) {
	                const theCol = current.computedColumns.find(d => d.name === col.origName());
	                const formula = theCol ? theCol.formula : '';
	                this.set({ formula, name: col.origName() });
	                this.setFormula(formula, col.name(), col.origName());
	                cm.setValue(formula);
	            }
	        }

	        if (changed.name && previous.name) {
	            changeName(current.name);
	        }

	        if (changed.metaColumns) {
	            cmInit(current.keywords);
	        }

	        if (changed.errDisplay) {
	            // check for new error
	            if (current.errDisplay && errReg.test(current.errDisplay)) {
	                const m = current.errDisplay.match(errReg);
	                const line = Number(m[1]) - 1;
	                const ch = Number(m[2]) - 1;
	                cm.markText(
	                    { line, ch },
	                    { line, ch: ch + 1 },
	                    {
	                        className: 'parser-error'
	                    }
	                );
	            }
	        }
	    });

	    function cmInit(keywords) {
	        const columnsRegex = new RegExp(`(?:${keywords.join('|')})`);
	        const functionRegex = new RegExp(`(?:${Parser.keywords.join('|')})`);
	        CodeMirror__default['default'].defineSimpleMode('simplemode', {
	            // The start state contains the rules that are intially used
	            start: [
	                // The regex matches the token, the token property contains the type
	                { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string' },
	                { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: 'string' },
	                // You can match multiple tokens at once. Note that the captured
	                // groups must span the whole string in this case
	                // {
	                //     regex: /(function)(\s+)([a-z$][\w$]*)/,
	                //     token: ['keyword', null, 'keyword']
	                // },
	                // Rules are matched in the order in which they appear, so there is
	                // no ambiguity between this one and the one above
	                { regex: functionRegex, token: 'keyword' },
	                { regex: /true|false|PI|E/, token: 'atom' },
	                {
	                    regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
	                    token: 'number'
	                },
	                // { regex: /\/\/.*/, token: 'comment' },
	                { regex: columnsRegex, token: 'variable-2' },
	                { regex: /\/(?:[^\\]|\\.)*?\//, token: 'variable-3' },
	                // A next property will cause the mode to move to a different state
	                // { regex: /\/\*/, token: 'comment', next: 'comment' },
	                { regex: /[-+/*=<>!^%]+/, token: 'operator' },
	                // indent and dedent properties guide autoindentation
	                { regex: /[[(]/, indent: true },
	                { regex: /[\])]/, dedent: true },
	                { regex: /[a-z$][\w$]*/, token: 'variable-x' },
	                { regex: /[A-Z_][\w$]*/, token: 'keyword-x' }
	            ],
	            // The meta property contains global information about the mode. It
	            // can contain properties like lineComment, which are supported by
	            // all modes, and also directives like dontIndentStates, which are
	            // specific to simple modes.
	            meta: {}
	        });

	        cm.setOption('mode', 'simplemode');
	    }

	    const setFormulaThrottled = debounce_1((formula, name, origName) => {
	        this.setFormula(formula, name, origName);
	    }, 1500);

	    cm.on('change', cm => {
	        const { column } = app.get();
	        this.set({ checking: true });
	        setFormulaThrottled(cm.getValue(), column.name(), column.origName());
	    });
	}
	const file$8 = "describe/ComputedColumnEditor.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.insert(ctx.col);
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.col = list[i];
		return child_ctx;
	}

	function create_main_fragment$a(component, ctx) {
		var div, text0, h3, text1, text2, p0, text3_value = __$1('computed columns / modal / intro'), text3, text4, label0, text5_value = __$1('computed columns / modal / name'), text5, text6, input, input_updating = false, text7, label1, text8_value = __$1('computed columns / modal / formula'), text8, text9, text10, span, raw_value = __$1('cc / formula / help'), text11, textarea, text12, text13, text14, text15, p1, text16_value = __$1('computed columns / modal / available columns'), text16, text17, text18, ul, text19, button, i, text20, text21_value = __$1('computed columns / modal / remove'), text21;

		var if_block0 = (ctx.didYouKnow) && create_if_block_4$1(component);

		function input_input_handler() {
			input_updating = true;
			component.set({ name: input.value });
			input_updating = false;
		}

		var if_block1 = (ctx.checking && !ctx.error) && create_if_block_3$2();

		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var if_block2 = (ctx.errDisplay) && create_if_block_2$2(component, ctx);

		var if_block3 = (ctx.formulaHint) && create_if_block_1$5(component, ctx);

		var if_block4 = (ctx.looksLikeColumnData) && create_if_block$7(component);

		var each_value = ctx.metaColumns;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block$3(component, get_each_context$2(ctx, each_value, i_1));
		}

		function click_handler_1(event) {
			component.removeColumn();
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				h3 = createElement("h3");
				text1 = createText(ctx.title);
				text2 = createText("\n    ");
				p0 = createElement("p");
				text3 = createText(text3_value);
				text4 = createText("\n\n    ");
				label0 = createElement("label");
				text5 = createText(text5_value);
				text6 = createText("\n    ");
				input = createElement("input");
				text7 = createText("\n\n    ");
				label1 = createElement("label");
				text8 = createText(text8_value);
				text9 = createText("\n\n        \n        ");
				if (if_block1) if_block1.c();
				text10 = createText("\n\n        ");
				span = createElement("span");
				helpdisplay._fragment.c();
				text11 = createText("\n    ");
				textarea = createElement("textarea");
				text12 = createText("\n\n    \n    ");
				if (if_block2) if_block2.c();
				text13 = createText("\n\n    \n    ");
				if (if_block3) if_block3.c();
				text14 = createText("\n\n    \n    ");
				if (if_block4) if_block4.c();
				text15 = createText("\n\n    ");
				p1 = createElement("p");
				text16 = createText(text16_value);
				text17 = createText(":");
				text18 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text19 = createText("\n\n");
				button = createElement("button");
				i = createElement("i");
				text20 = createText(" ");
				text21 = createText(text21_value);
				h3.className = "first";
				addLoc(h3, file$8, 22, 4, 766);
				addLoc(p0, file$8, 23, 4, 801);
				label0.className = "svelte-1cx0ai0";
				addLoc(label0, file$8, 25, 4, 854);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				addLoc(input, file$8, 26, 4, 913);
				addLoc(span, file$8, 37, 12, 1188);
				label1.className = "svelte-1cx0ai0";
				addLoc(label1, file$8, 28, 4, 958);
				textarea.className = "code svelte-1cx0ai0";
				toggleClass(textarea, "error", ctx.errDisplay);
				addLoc(textarea, file$8, 40, 4, 1275);
				setStyle(p1, "margin-top", "1em");
				addLoc(p1, file$8, 69, 4, 2105);
				ul.className = "col-select svelte-1cx0ai0";
				addLoc(ul, file$8, 71, 4, 2195);
				setStyle(div, "margin-bottom", "15px");
				addLoc(div, file$8, 0, 0, 0);
				i.className = "fa fa-trash";
				addLoc(i, file$8, 79, 4, 2400);
				addListener(button, "click", click_handler_1);
				button.className = "btn btn-danger";
				addLoc(button, file$8, 78, 0, 2338);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, h3);
				append(h3, text1);
				append(div, text2);
				append(div, p0);
				append(p0, text3);
				append(div, text4);
				append(div, label0);
				append(label0, text5);
				append(div, text6);
				append(div, input);

				input.value = ctx.name;

				append(div, text7);
				append(div, label1);
				append(label1, text8);
				append(label1, text9);
				if (if_block1) if_block1.m(label1, null);
				append(label1, text10);
				append(helpdisplay._slotted.default, span);
				span.innerHTML = raw_value;
				helpdisplay._mount(label1, null);
				append(div, text11);
				append(div, textarea);
				component.refs.code = textarea;
				append(div, text12);
				if (if_block2) if_block2.m(div, null);
				append(div, text13);
				if (if_block3) if_block3.m(div, null);
				append(div, text14);
				if (if_block4) if_block4.m(div, null);
				append(div, text15);
				append(div, p1);
				append(p1, text16);
				append(p1, text17);
				append(div, text18);
				append(div, ul);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(ul, null);
				}

				insert(target, text19, anchor);
				insert(target, button, anchor);
				append(button, i);
				append(button, text20);
				append(button, text21);
			},

			p: function update(changed, ctx) {
				if (ctx.didYouKnow) {
					if (!if_block0) {
						if_block0 = create_if_block_4$1(component);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.title) {
					setData(text1, ctx.title);
				}

				if (!input_updating && changed.name) input.value = ctx.name;

				if (ctx.checking && !ctx.error) {
					if (!if_block1) {
						if_block1 = create_if_block_3$2();
						if_block1.c();
						if_block1.m(label1, text10);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.errDisplay) {
					toggleClass(textarea, "error", ctx.errDisplay);
				}

				if (ctx.errDisplay) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_2$2(component, ctx);
						if_block2.c();
						if_block2.m(div, text13);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.formulaHint) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_1$5(component, ctx);
						if_block3.c();
						if_block3.m(div, text14);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.looksLikeColumnData) {
					if (!if_block4) {
						if_block4 = create_if_block$7(component);
						if_block4.c();
						if_block4.m(div, text15);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (changed.metaColumns) {
					each_value = ctx.metaColumns;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block$3(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(ul, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				removeListener(input, "input", input_input_handler);
				if (if_block1) if_block1.d();
				helpdisplay.destroy();
				if (component.refs.code === textarea) component.refs.code = null;
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(text19);
					detachNode(button);
				}

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (2:4) {#if didYouKnow}
	function create_if_block_4$1(component, ctx) {
		var div1, div0, i0, text0, h3, text1_value = __$1('cc / formula / did-you-know / title'), text1, text2, p0, text3_value = __$1('cc / formula / did-you-know / text'), text3, text4, p1, text5_value = __$1('cc / formula / did-you-know / link'), text5, text6, i1, text7, a, text8_value = __$1('cc / formula / did-you-know / link2'), text8;

		function click_handler(event) {
			component.closeDidYouKnow();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n        ");
				h3 = createElement("h3");
				text1 = createText(text1_value);
				text2 = createText("\n\n        ");
				p0 = createElement("p");
				text3 = createText(text3_value);
				text4 = createText("\n\n        ");
				p1 = createElement("p");
				text5 = createText(text5_value);
				text6 = createText(" ");
				i1 = createElement("i");
				text7 = createText("\n            ");
				a = createElement("a");
				text8 = createText(text8_value);
				i0.className = "im im-check-mark-circle";
				addLoc(i0, file$8, 4, 12, 200);
				addListener(div0, "click", click_handler);
				div0.className = "close";
				addLoc(div0, file$8, 3, 8, 139);
				addLoc(h3, file$8, 6, 8, 263);
				addLoc(p0, file$8, 8, 8, 325);
				i1.className = "im im-graduation-hat svelte-1cx0ai0";
				addLoc(i1, file$8, 11, 55, 443);
				a.href = "https://academy.datawrapper.de/article/249-calculations-in-added-columns-and-tooltips";
				a.target = "_blank";
				addLoc(a, file$8, 12, 12, 492);
				addLoc(p1, file$8, 10, 8, 384);
				div1.className = "did-you-know svelte-1cx0ai0";
				setStyle(div1, "margin-top", "10px");
				setStyle(div1, "margin-bottom", "1em");
				addLoc(div1, file$8, 2, 4, 59);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, i0);
				append(div1, text0);
				append(div1, h3);
				append(h3, text1);
				append(div1, text2);
				append(div1, p0);
				append(p0, text3);
				append(div1, text4);
				append(div1, p1);
				append(p1, text5);
				append(p1, text6);
				append(p1, i1);
				append(p1, text7);
				append(p1, a);
				append(a, text8);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler);
			}
		};
	}

	// (33:8) {#if checking && !error}
	function create_if_block_3$2(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				setStyle(i, "color", "#ccc");
				i.className = "fa fa-cog fa-spin";
				addLoc(i, file$8, 33, 8, 1085);
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

	// (44:4) {#if errDisplay}
	function create_if_block_2$2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help errors svelte-1cx0ai0";
				addLoc(p, file$8, 44, 4, 1391);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.errNiceDisplay;
			},

			p: function update(changed, ctx) {
				if (changed.errNiceDisplay) {
					p.innerHTML = ctx.errNiceDisplay;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (49:4) {#if formulaHint}
	function create_if_block_1$5(component, ctx) {
		var p, i, text, raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText(" ");
				raw_before = createElement('noscript');
				i.className = "hat-icon im im-graduation-hat svelte-1cx0ai0";
				addLoc(i, file$8, 50, 8, 1553);
				p.className = "mini-help formula-hint svelte-1cx0ai0";
				addLoc(p, file$8, 49, 4, 1510);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.formulaHint);
			},

			p: function update(changed, ctx) {
				if (changed.formulaHint) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.formulaHint);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (56:4) {#if looksLikeColumnData}
	function create_if_block$7(component, ctx) {
		var div, i, text0, text1_value = __$1('cc / formula / hint / insert-data'), text1, text2, a, text3_value = __$1('cc / formula / hint / insert-data / action'), text3;

		function click_handler(event) {
			event.preventDefault();
			component.copyFormulaToData();
		}

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text0 = createText("\n        ");
				text1 = createText(text1_value);
				text2 = createText("\n        ");
				a = createElement("a");
				text3 = createText(text3_value);
				i.className = "hat-icon im im-graduation-hat svelte-1cx0ai0";
				addLoc(i, file$8, 57, 8, 1749);
				addListener(a, "click", click_handler);
				setStyle(a, "color", "white");
				setStyle(a, "font-weight", "bold");
				a.href = "/#apply";
				addLoc(a, file$8, 59, 8, 1853);
				div.className = "mini-help formula-hint svelte-1cx0ai0";
				addLoc(div, file$8, 56, 4, 1704);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text0);
				append(div, text1);
				append(div, text2);
				append(div, a);
				append(a, text3);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (73:8) {#each metaColumns as col}
	function create_each_block$3(component, ctx) {
		var li, text_value = ctx.col.key, text;

		return {
			c: function create() {
				li = createElement("li");
				text = createText(text_value);
				li._svelte = { component, ctx };

				addListener(li, "click", click_handler$1);
				li.className = "svelte-1cx0ai0";
				addLoc(li, file$8, 73, 8, 2262);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.metaColumns) && text_value !== (text_value = ctx.col.key)) {
					setData(text, text_value);
				}

				li._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(li, "click", click_handler$1);
			}
		};
	}

	function ComputedColumnEditor(options) {
		this._debugName = '<ComputedColumnEditor>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ComputedColumnEditor> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["dw_chart"]), data$a()), options.data);
		this.store._add(this, ["dw_chart"]);

		this._recompute({ name: 1, columns: 1, column: 1, metaColumns: 1, formula: 1, context: 1, error: 1, $dw_chart: 1, parserErrors: 1, errDisplay: 1 }, this._state);
		if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");
		if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");
		if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");

		if (!('formula' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'formula'");

		if (!('$dw_chart' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property '$dw_chart'");

		if (!('parserErrors' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'parserErrors'");

		if (!('didYouKnow' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'didYouKnow'");

		if (!('checking' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'checking'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$a(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$4.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ComputedColumnEditor.prototype, protoDev);
	assign(ComputedColumnEditor.prototype, methods$5);

	ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'title'");
		if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
		if ('keywords' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'keywords'");
		if ('context' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'context'");
		if ('error' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'error'");
		if ('looksLikeColumnData' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'looksLikeColumnData'");
		if ('computedColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'computedColumns'");
		if ('errDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'errDisplay'");
		if ('errNiceDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'errNiceDisplay'");
		if ('formulaHint' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'formulaHint'");
	};

	ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
		if (changed.name) {
			if (this._differs(state.title, (state.title = title$1(state)))) changed.title = true;
		}

		if (changed.columns || changed.column) {
			if (this._differs(state.metaColumns, (state.metaColumns = metaColumns(state)))) changed.metaColumns = true;
		}

		if (changed.metaColumns) {
			if (this._differs(state.keywords, (state.keywords = keywords(state)))) changed.keywords = true;
			if (this._differs(state.context, (state.context = context(state)))) changed.context = true;
		}

		if (changed.formula || changed.context) {
			if (this._differs(state.error, (state.error = error(state)))) changed.error = true;
		}

		if (changed.formula || changed.error) {
			if (this._differs(state.looksLikeColumnData, (state.looksLikeColumnData = looksLikeColumnData(state)))) changed.looksLikeColumnData = true;
		}

		if (changed.$dw_chart) {
			if (this._differs(state.computedColumns, (state.computedColumns = computedColumns(state)))) changed.computedColumns = true;
		}

		if (changed.error || changed.parserErrors) {
			if (this._differs(state.errDisplay, (state.errDisplay = errDisplay(state)))) changed.errDisplay = true;
		}

		if (changed.errDisplay) {
			if (this._differs(state.errNiceDisplay, (state.errNiceDisplay = errNiceDisplay(state)))) changed.errNiceDisplay = true;
		}

		if (changed.errDisplay || changed.formula) {
			if (this._differs(state.formulaHint, (state.formulaHint = formulaHint(state)))) changed.formulaHint = true;
		}
	};

	function cubicOut(t) {
	  var f = t - 1.0;
	  return f * f * f + 1.0
	}

	function slide(
		node,
		ref
	) {
		var delay = ref.delay; if ( delay === void 0 ) delay = 0;
		var duration = ref.duration; if ( duration === void 0 ) duration = 400;
		var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;

		var style = getComputedStyle(node);
		var opacity = +style.opacity;
		var height = parseFloat(style.height);
		var paddingTop = parseFloat(style.paddingTop);
		var paddingBottom = parseFloat(style.paddingBottom);
		var marginTop = parseFloat(style.marginTop);
		var marginBottom = parseFloat(style.marginBottom);
		var borderTopWidth = parseFloat(style.borderTopWidth);
		var borderBottomWidth = parseFloat(style.borderBottomWidth);

		return {
			delay: delay,
			duration: duration,
			easing: easing,
			css: function (t) { return "overflow: hidden;" +
				"opacity: " + (Math.min(t * 20, 1) * opacity) + ";" +
				"height: " + (t * height) + "px;" +
				"padding-top: " + (t * paddingTop) + "px;" +
				"padding-bottom: " + (t * paddingBottom) + "px;" +
				"margin-top: " + (t * marginTop) + "px;" +
				"margin-bottom: " + (t * marginBottom) + "px;" +
				"border-top-width: " + (t * borderTopWidth) + "px;" +
				"border-bottom-width: " + (t * borderBottomWidth) + "px;"; }
		};
	}

	/* node_modules/@datawrapper/controls/CheckboxControl.html generated by Svelte v2.16.1 */



	function data$9() {
	    return {
	        value: false,
	        disabled: false,
	        faded: false,
	        compact: false,
	        indeterminate: false,
	        disabledMessage: '',
	        help: false,
	        uid: '',
	        class: ''
	    };
	}
	const file$7 = "node_modules/datawrapper/controls/CheckboxControl.html";

	function create_main_fragment$9(component, ctx) {
		var text0, div, label, input, text1, span, text2, text3, label_class_value, text4, div_class_value;

		var if_block0 = (ctx.help) && create_if_block_1$4(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		var if_block1 = (ctx.disabled && ctx.disabledMessage) && create_if_block$6(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n");
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				text1 = createText("\n        ");
				span = createElement("span");
				text2 = createText("\n        ");
				text3 = createText(ctx.label);
				text4 = createText("\n    ");
				if (if_block1) if_block1.c();
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.disabled = ctx.disabled;
				input.className = "svelte-1rmafvf";
				addLoc(input, file$7, 11, 8, 294);
				span.className = "css-ui svelte-1rmafvf";
				addLoc(span, file$7, 12, 8, 390);
				label.className = label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1rmafvf";
				addLoc(label, file$7, 10, 4, 213);
				div.className = div_class_value = "control-group vis-option-group vis-option-type-checkbox " + ctx.class + " svelte-1rmafvf";
				div.dataset.uid = ctx.uid;
				toggleClass(div, "is-compact", ctx.compact);
				addLoc(div, file$7, 5, 0, 74);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, label);
				append(label, input);

				input.checked = ctx.value;
				input.indeterminate = ctx.indeterminate ;

				append(label, text1);
				append(label, span);
				append(label, text2);
				append(label, text3);
				append(div, text4);
				if (if_block1) if_block1.i(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$4(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) input.checked = ctx.value;
				if (changed.indeterminate) input.indeterminate = ctx.indeterminate ;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					setData(text3, ctx.label);
				}

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1rmafvf")) {
					label.className = label_class_value;
				}

				if (ctx.disabled && ctx.disabledMessage) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$6(component, ctx);
						if (if_block1) if_block1.c();
					}

					if_block1.i(div, null);
				} else if (if_block1) {
					groupOutros();
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}

				if ((changed.class) && div_class_value !== (div_class_value = "control-group vis-option-group vis-option-type-checkbox " + ctx.class + " svelte-1rmafvf")) {
					div.className = div_class_value;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
				}

				if ((changed.class || changed.compact)) {
					toggleClass(div, "is-compact", ctx.compact);
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}

				removeListener(input, "change", input_change_handler);
				if (if_block1) if_block1.d();
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_1$4(component, ctx) {
		var div;

		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				helpdisplay._fragment.c();
				addLoc(div, file$7, 2, 4, 29);
			},

			m: function mount(target, anchor) {
				append(helpdisplay._slotted.default, div);
				div.innerHTML = ctx.help;
				helpdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				helpdisplay.destroy(detach);
			}
		};
	}

	// (16:4) {#if disabled && disabledMessage}
	function create_if_block$6(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-1rmafvf";
				addLoc(div0, file$7, 17, 8, 523);
				addLoc(div1, file$7, 16, 4, 492);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				div0.innerHTML = ctx.disabledMessage;
				current = true;
			},

			p: function update(changed, ctx) {
				if (!current || changed.disabledMessage) {
					div0.innerHTML = ctx.disabledMessage;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;
				if (component.root._intro) {
					if (div1_transition) div1_transition.invalidate();

					component.root._aftercreate.push(() => {
						if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, true);
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, false);
				div1_transition.run(0, () => {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) div1_transition.abort();
				}
			}
		};
	}

	function CheckboxControl(options) {
		this._debugName = '<CheckboxControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$9(), options.data);
		if (!('help' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'help'");
		if (!('class' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'class'");
		if (!('compact' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'compact'");
		if (!('uid' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'uid'");
		if (!('disabled' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'disabled'");
		if (!('faded' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'faded'");
		if (!('value' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'label'");
		if (!('disabledMessage' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'disabledMessage'");
		this._intro = true;

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CheckboxControl.prototype, protoDev);

	CheckboxControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$8() {
	    return {
	        disabled: false,
	        help: false,
	        helpClass: false,
	        miniHelp: false,
	        label: false,
	        labelHelp: false,
	        class: '',
	        inline: false,
	        labelWidth: false,
	        type: 'default',
	        valign: 'baseline',
	        uid: ''
	    };
	}
	var def = {
	    labelWidth: '100px'
	};

	const file$6 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$8(component, ctx) {
		var text0, div1, text1, div0, slot_content_default = component._slotted.default, text2, div1_class_value;

		var if_block0 = (ctx.help) && create_if_block_3$1(component, ctx);

		var if_block1 = (ctx.label) && create_if_block_1$3(component, ctx);

		var if_block2 = (ctx.miniHelp) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div1 = createElement("div");
				if (if_block1) if_block1.c();
				text1 = createText("\n    ");
				div0 = createElement("div");
				text2 = createText("\n    ");
				if (if_block2) if_block2.c();
				div0.className = "controls svelte-1ykzs2h";
				setStyle(div0, "width", "calc(100% - " + (ctx.labelWidth||def.labelWidth) + " - 32px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file$6, 17, 4, 457);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " " + ctx.class + " svelte-1ykzs2h";
				div1.dataset.uid = ctx.uid;
				addLoc(div1, file$6, 6, 0, 95);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				if (if_block1) if_block1.m(div1, null);
				append(div1, text1);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				append(div1, text2);
				if (if_block2) if_block2.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$1(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.label) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$3(component, ctx);
						if_block1.c();
						if_block1.m(div1, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.labelWidth) {
					setStyle(div0, "width", "calc(100% - " + (ctx.labelWidth||def.labelWidth) + " - 32px)");
				}

				if (changed.inline) {
					toggleClass(div0, "form-inline", ctx.inline);
				}

				if (ctx.miniHelp) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$5(component, ctx);
						if_block2.c();
						if_block2.m(div1, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if ((changed.type || changed.valign || changed.class) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " " + ctx.class + " svelte-1ykzs2h")) {
					div1.className = div1_class_value;
				}

				if (changed.uid) {
					div1.dataset.uid = ctx.uid;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div1);
				}

				if (if_block1) if_block1.d();

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (if_block2) if_block2.d();
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_3$1(component, ctx) {
		var div;

		var helpdisplay_initial_data = { class: ctx.helpClass };
		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: helpdisplay_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				helpdisplay._fragment.c();
				addLoc(div, file$6, 2, 4, 49);
			},

			m: function mount(target, anchor) {
				append(helpdisplay._slotted.default, div);
				div.innerHTML = ctx.help;
				helpdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}

				var helpdisplay_changes = {};
				if (changed.helpClass) helpdisplay_changes.class = ctx.helpClass;
				helpdisplay._set(helpdisplay_changes);
			},

			d: function destroy(detach) {
				helpdisplay.destroy(detach);
			}
		};
	}

	// (11:4) {#if label}
	function create_if_block_1$3(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2$1(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
				label.className = "control-label svelte-1ykzs2h";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$6, 11, 4, 233);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				append(label, text);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				}

				if (ctx.labelHelp) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2$1(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.labelWidth) {
					setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (13:24) {#if labelHelp}
	function create_if_block_2$1(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$6, 13, 8, 368);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.labelHelp;
			},

			p: function update(changed, ctx) {
				if (changed.labelHelp) {
					p.innerHTML = ctx.labelHelp;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (25:4) {#if miniHelp}
	function create_if_block$5(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				p.className = p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$6, 25, 4, 651);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.miniHelp;
			},

			p: function update(changed, ctx) {
				if (changed.miniHelp) {
					p.innerHTML = ctx.miniHelp;
				}

				if (changed.inline || changed.labelWidth) {
					setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h")) {
					p.className = p_class_value;
				}

				if ((changed.type || changed.inline)) {
					toggleClass(p, "mini-help-block", !ctx.inline);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function ControlGroup(options) {
		this._debugName = '<ControlGroup>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		if (!('helpClass' in this._state)) console.warn("<ControlGroup> was created without expected data property 'helpClass'");
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('class' in this._state)) console.warn("<ControlGroup> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<ControlGroup> was created without expected data property 'uid'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('labelWidth' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelWidth'");
		if (!('labelHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelHelp'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('miniHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'miniHelp'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/SelectInput.html generated by Svelte v2.16.1 */

	function data$7() {
	    return {
	        disabled: false,
	        width: 'auto',
	        options: [],
	        optgroups: [],
	        value: null,
	        class: '',
	        uid: ''
	    };
	}
	const file$5 = "node_modules/datawrapper/controls/SelectInput.html";

	function get_each_context_2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
		var select, if_block0_anchor, select_updating = false, select_class_value;

		var if_block0 = (ctx.options.length) && create_if_block_1$2(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$4(component, ctx);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		function change_handler(event) {
			component.fire('change', event);
		}

		return {
			c: function create() {
				select = createElement("select");
				if (if_block0) if_block0.c();
				if_block0_anchor = createComment();
				if (if_block1) if_block1.c();
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
				addListener(select, "change", change_handler);
				select.className = select_class_value = "select-css " + ctx.class + " svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				select.dataset.uid = ctx.uid;
				addLoc(select, file$5, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if (if_block0) if_block0.m(select, null);
				append(select, if_block0_anchor);
				if (if_block1) if_block1.m(select, null);

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (ctx.options.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$2(component, ctx);
						if_block0.c();
						if_block0.m(select, if_block0_anchor);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.optgroups.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$4(component, ctx);
						if_block1.c();
						if_block1.m(select, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!select_updating && changed.value) selectOption(select, ctx.value);
				if ((changed.class) && select_class_value !== (select_class_value = "select-css " + ctx.class + " svelte-v0oq4b")) {
					select.className = select_class_value;
				}

				if (changed.disabled) {
					select.disabled = ctx.disabled;
				}

				if (changed.width) {
					setStyle(select, "width", ctx.width);
				}

				if (changed.uid) {
					select.dataset.uid = ctx.uid;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(select);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(select, "change", select_change_handler);
				removeListener(select, "change", change_handler);
			}
		};
	}

	// (9:4) {#if options.length}
	function create_if_block_1$2(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2$1(component, get_each_context$1(ctx, each_value, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (9:25) {#each options as opt}
	function create_each_block_2$1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$5, 9, 4, 229);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.options) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.options) && option_value_value !== (option_value_value = ctx.opt.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if ((changed.options || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (11:18) {#if optgroups.length}
	function create_if_block$4(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.optgroups || changed.value) {
					each_value_1 = ctx.optgroups;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (13:8) {#each optgroup.options as opt}
	function create_each_block_1$1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$5, 13, 8, 470);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.optgroups) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.optgroups) && option_value_value !== (option_value_value = ctx.opt.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if ((changed.optgroups || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (11:41) {#each optgroups as optgroup}
	function create_each_block$2(component, ctx) {
		var optgroup, optgroup_label_value;

		var each_value_2 = ctx.optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$5, 11, 4, 386);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.optgroups || changed.value) {
					each_value_2 = ctx.optgroup.options;

					for (var i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(optgroup, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_2.length;
				}

				if ((changed.optgroups) && optgroup_label_value !== (optgroup_label_value = ctx.optgroup.label)) {
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

	function SelectInput(options) {
		this._debugName = '<SelectInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$7(), options.data);
		if (!('class' in this._state)) console.warn("<SelectInput> was created without expected data property 'class'");
		if (!('disabled' in this._state)) console.warn("<SelectInput> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<SelectInput> was created without expected data property 'width'");
		if (!('uid' in this._state)) console.warn("<SelectInput> was created without expected data property 'uid'");
		if (!('options' in this._state)) console.warn("<SelectInput> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectInput> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectInput.prototype, protoDev);

	SelectInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/SelectControl.html generated by Svelte v2.16.1 */



	function controlWidth({ inline, width }) {
		return inline ? width || 'auto' : width;
	}

	function labelWidth({ inline, labelWidth }) {
		return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$6() {
	    return {
	        disabled: false,
	        width: null,
	        labelWidth: null,
	        options: [],
	        optgroups: [],
	        valign: 'middle',
	        inline: false,
	        help: null,
	        miniHelp: null,
	        uid: ''
	    };
	}
	function create_main_fragment$6(component, ctx) {
		var selectinput_updating = {};

		var selectinput_initial_data = { width: ctx.controlWidth, class: "mt-1" };
		if (ctx.value
	         !== void 0) {
			selectinput_initial_data.value = ctx.value
	        ;
			selectinput_updating.value = true;
		}
		if (ctx.disabled
	         !== void 0) {
			selectinput_initial_data.disabled = ctx.disabled
	        ;
			selectinput_updating.disabled = true;
		}
		if (ctx.options
	         !== void 0) {
			selectinput_initial_data.options = ctx.options
	        ;
			selectinput_updating.options = true;
		}
		if (ctx.optgroups
	         !== void 0) {
			selectinput_initial_data.optgroups = ctx.optgroups
	        ;
			selectinput_updating.optgroups = true;
		}
		var selectinput = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!selectinput_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!selectinput_updating.options && changed.options) {
					newState.options = childState.options;
				}

				if (!selectinput_updating.optgroups && changed.optgroups) {
					newState.optgroups = childState.optgroups;
				}
				component._set(newState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1, disabled: 1, options: 1, optgroups: 1 }, selectinput.get());
		});

		selectinput.on("change", function(event) {
			component.fire('change', event);
		});

		var controlgroup_initial_data = {
		 	type: "select",
		 	label: ctx.label,
		 	labelWidth: ctx.labelWidth,
		 	valign: ctx.valign,
		 	disabled: ctx.disabled,
		 	inline: ctx.inline,
		 	miniHelp: ctx.miniHelp,
		 	help: ctx.help,
		 	uid: ctx.uid,
		 	helpClass: "mt-1"
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				selectinput._fragment.c();
				controlgroup._fragment.c();
			},

			m: function mount(target, anchor) {
				selectinput._mount(controlgroup._slotted.default, null);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.controlWidth) selectinput_changes.width = ctx.controlWidth;
				if (!selectinput_updating.value && changed.value) {
					selectinput_changes.value = ctx.value
	        ;
					selectinput_updating.value = ctx.value
	         !== void 0;
				}
				if (!selectinput_updating.disabled && changed.disabled) {
					selectinput_changes.disabled = ctx.disabled
	        ;
					selectinput_updating.disabled = ctx.disabled
	         !== void 0;
				}
				if (!selectinput_updating.options && changed.options) {
					selectinput_changes.options = ctx.options
	        ;
					selectinput_updating.options = ctx.options
	         !== void 0;
				}
				if (!selectinput_updating.optgroups && changed.optgroups) {
					selectinput_changes.optgroups = ctx.optgroups
	        ;
					selectinput_updating.optgroups = ctx.optgroups
	         !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};

				var controlgroup_changes = {};
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.labelWidth) controlgroup_changes.labelWidth = ctx.labelWidth;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.inline) controlgroup_changes.inline = ctx.inline;
				if (changed.miniHelp) controlgroup_changes.miniHelp = ctx.miniHelp;
				if (changed.help) controlgroup_changes.help = ctx.help;
				if (changed.uid) controlgroup_changes.uid = ctx.uid;
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				selectinput.destroy();
				controlgroup.destroy(detach);
			}
		};
	}

	function SelectControl(options) {
		this._debugName = '<SelectControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);

		this._recompute({ inline: 1, width: 1, labelWidth: 1 }, this._state);
		if (!('inline' in this._state)) console.warn("<SelectControl> was created without expected data property 'inline'");
		if (!('width' in this._state)) console.warn("<SelectControl> was created without expected data property 'width'");

		if (!('label' in this._state)) console.warn("<SelectControl> was created without expected data property 'label'");
		if (!('valign' in this._state)) console.warn("<SelectControl> was created without expected data property 'valign'");
		if (!('disabled' in this._state)) console.warn("<SelectControl> was created without expected data property 'disabled'");
		if (!('miniHelp' in this._state)) console.warn("<SelectControl> was created without expected data property 'miniHelp'");
		if (!('help' in this._state)) console.warn("<SelectControl> was created without expected data property 'help'");
		if (!('uid' in this._state)) console.warn("<SelectControl> was created without expected data property 'uid'");

		if (!('value' in this._state)) console.warn("<SelectControl> was created without expected data property 'value'");
		if (!('options' in this._state)) console.warn("<SelectControl> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectControl> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectControl.prototype, protoDev);

	SelectControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('controlWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectControl>: Cannot set read-only property 'controlWidth'");
		if ('labelWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectControl>: Cannot set read-only property 'labelWidth'");
	};

	SelectControl.prototype._recompute = function _recompute(changed, state) {
		if (changed.inline || changed.width) {
			if (this._differs(state.controlWidth, (state.controlWidth = controlWidth(state)))) changed.controlWidth = true;
		}

		if (changed.inline || changed.labelWidth) {
			if (this._differs(state.labelWidth, (state.labelWidth = labelWidth(state)))) changed.labelWidth = true;
		}
	};

	/**
	 * Converts an array with properties back to a normal object.
	 *
	 * @exports arrayToObject
	 * @kind function
	 *
	 * @description
	 * This function fixes an uglyness when working with PHP backends.
	 * in PHP, there is no distiction between arrays and objects, so
	 * PHP converts an empty object {} to a empty array [].
	 * When this empty array then ends up in client-side JS functions which
	 * might start to assign values to the array using `arr.foo = "bar"`
	 * which results in a data structure like this:
	 *
	 * @example
	 * console.log(arr);
	 * []
	 *   foo: "bar"
	 *   length: 0
	 *   <prototype>: Array []
	 *
	 * console.log(arrayToObject(arr));
	 * Object { foo: "bar" }
	 *
	 * @param {array} o - the input
	 * @returns {object}
	 */
	function arrayToObject(o) {
	    if (Array.isArray(o)) {
	        const obj = {};
	        Object.keys(o).forEach(k => (obj[k] = o[k]));
	        return obj;
	    }
	    return o;
	}

	/* describe/CustomColumnFormat.html generated by Svelte v2.16.1 */



	function title({ column }) {
	    return __$1('describe / edit-column', 'core', {
	        s: `"${column ? column.title() || column.name() : '--'}"`
	    });
	}
	function data$5() {
	    return {
	        columnFormat: {
	            type: 'auto',
	            ignore: false,
	            'number-divisor': 0,
	            'number-format': 'auto',
	            'number-prepend': '',
	            'number-append': ''
	        },
	        colTypes: [],
	        divisors_opts: [
	            { value: 0, label: __$1('describe / column-format / no-change') },
	            { value: 'auto', label: __$1('describe / column-format / automatic') }
	        ],
	        divisors: [
	            {
	                label: __$1('describe / column-format / divide-by'),
	                options: [
	                    { value: 3, label: '1000' },
	                    { value: 6, label: __$1('describe / column-format / million') },
	                    { value: 9, label: __$1('describe / column-format / billion') }
	                ]
	            },
	            {
	                label: __$1('describe / column-format / multiply-by'),
	                options: [
	                    { value: -2, label: '100' },
	                    { value: -3, label: '1000' },
	                    { value: -6, label: __$1('describe / column-format / million') },
	                    { value: -9, label: __$1('describe / column-format / billion') },
	                    { value: -12, label: __$1('describe / column-format / trillion') }
	                ]
	            }
	        ],
	        numberFormats: [
	            {
	                label: __$1('Decimal places'),
	                options: [
	                    { value: 'n3', label: '3 (1,234.568)' },
	                    { value: 'n2', label: '2 (1,234.57)' },
	                    { value: 'n1', label: '1 (1,234.6)' },
	                    { value: 'n0', label: '0 (1,235)' }
	                ]
	            },
	            {
	                label: __$1('Significant digits'),
	                options: [
	                    { value: 's6', label: '6 (1,234.57)' },
	                    { value: 's5', label: '5 (123.45)' },
	                    { value: 's4', label: '4 (12.34)' },
	                    { value: 's3', label: '3 (1.23)' },
	                    { value: 's2', label: '2 (0.12)' },
	                    { value: 's1', label: '1 (0.01)' }
	                ]
	            }
	        ],
	        roundOptions: [
	            { value: '-', label: __$1('describe / column-format / individual') },
	            { value: 'auto', label: __$1('describe / column-format / auto-detect') }
	        ]
	    };
	}
	var methods$4 = {
	    autoDivisor() {
	        const { dw_chart: dwChart } = this.store.get();
	        const { column } = this.get();
	        const mtrSuf = dw.utils.metricSuffix(dwChart.locale());
	        const values = column.values();
	        const dim = dw.utils.significantDimension(values);
	        let div = dim < -2 ? Math.round((dim * -1) / 3) * 3 : dim > 4 ? dim * -1 : 0;
	        const nvalues = values.map(function (v) {
	            return v / Math.pow(10, div);
	        });
	        let ndim = dw.utils.significantDimension(nvalues);
	        if (ndim <= 0)
	            ndim = nvalues.reduce(function (acc, cur) {
	                return Math.max(acc, Math.min(3, dw.utils.tailLength(cur)));
	            }, 0);

	        if (ndim === div) {
	            div = 0;
	            ndim = 0;
	        }
	        if (div > 15) {
	            div = 0;
	            ndim = 0;
	        }

	        this.set({
	            columnFormat: {
	                'number-divisor': div,
	                'number-format': 'n' + Math.max(0, ndim),
	                'number-prepend': '',
	                'number-append': div ? mtrSuf[div] || ' × 10<sup>' + div + '</sup>' : ''
	            }
	        });
	    },
	    getColumnFormat(column) {
	        const { dw_chart: dwChart } = this.store.get();
	        const columnFormats = arrayToObject(dwChart.get('metadata.data.column-format', {}));
	        let columnFormat = clone$2(columnFormats[column.name()]);
	        if (!columnFormat || columnFormat === 'auto' || columnFormat.length !== undefined) {
	            // no valid column format
	            columnFormat = {
	                type: 'auto',
	                ignore: false,
	                'number-divisor': 0,
	                'number-prepend': '',
	                'number-append': '',
	                'number-format': 'auto'
	            };
	        }
	        return columnFormat;
	    }
	};

	function oncreate$3() {
	    const { column } = this.get();

	    this.set({
	        colTypes: [
	            { value: 'auto', label: 'auto (' + column.type() + ')' },
	            { value: 'text', label: 'Text' },
	            { value: 'number', label: 'Number' },
	            { value: 'date', label: 'Date' }
	        ]
	    });

	    this.set({ columnFormat: this.getColumnFormat(column) });

	    this.on('state', ({ changed, current }) => {
	        if (changed.column) {
	            const col = current.column;
	            this.set({ columnFormat: this.getColumnFormat(col) });
	            const { colTypes } = this.get();
	            colTypes[0].label = 'auto (' + column.type() + ')';
	        }

	        if (changed.columnFormat) {
	            const colFormat = current.columnFormat;
	            const { dw_chart: dwChart } = this.store.get();
	            const column = current.column;
	            const columnFormats = arrayToObject(
	                clone$2(dwChart.get('metadata.data.column-format', {}))
	            );
	            const oldFormat = columnFormats[column.name()];
	            if (!oldFormat || JSON.stringify(oldFormat) !== JSON.stringify(colFormat)) {
	                if (colFormat['number-divisor'] === 'auto') {
	                    // stop here and compute divisor automatically
	                    setTimeout(() => this.autoDivisor(), 100);
	                    return;
	                }
	                columnFormats[column.name()] = clone$2(colFormat);
	                dwChart.set('metadata.data.column-format', columnFormats);
	            }
	        }
	    });
	}
	const file$4 = "describe/CustomColumnFormat.html";

	function create_main_fragment$5(component, ctx) {
		var div1, h3, text0, text1, div0, selectcontrol_updating = {}, text2, checkboxcontrol_updating = {}, text3, hr, text4;

		var selectcontrol_initial_data = {
		 	label: __$1('Column type'),
		 	options: ctx.colTypes,
		 	width: "180px"
		 };
		if (ctx.columnFormat.type !== void 0) {
			selectcontrol_initial_data.value = ctx.columnFormat.type;
			selectcontrol_updating.value = true;
		}
		var selectcontrol = new SelectControl({
			root: component.root,
			store: component.store,
			data: selectcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectcontrol_updating.value && changed.value) {
					ctx.columnFormat.type = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				selectcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectcontrol._bind({ value: 1 }, selectcontrol.get());
		});

		var checkboxcontrol_initial_data = { label: __$1('Hide column from visualization') };
		if (ctx.columnFormat.ignore !== void 0) {
			checkboxcontrol_initial_data.value = ctx.columnFormat.ignore;
			checkboxcontrol_updating.value = true;
		}
		var checkboxcontrol = new CheckboxControl({
			root: component.root,
			store: component.store,
			data: checkboxcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkboxcontrol_updating.value && changed.value) {
					ctx.columnFormat.ignore = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				checkboxcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkboxcontrol._bind({ value: 1 }, checkboxcontrol.get());
		});

		var if_block = (ctx.column && ctx.column.type() == 'number') && create_if_block$3(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				h3 = createElement("h3");
				text0 = createText(ctx.title);
				text1 = createText("\n\n    ");
				div0 = createElement("div");
				selectcontrol._fragment.c();
				text2 = createText("\n\n        ");
				checkboxcontrol._fragment.c();
				text3 = createText("\n\n        ");
				hr = createElement("hr");
				text4 = createText("\n\n        ");
				if (if_block) if_block.c();
				h3.className = "first";
				addLoc(h3, file$4, 1, 4, 10);
				addLoc(hr, file$4, 16, 8, 404);
				div0.className = "form-horizontal";
				addLoc(div0, file$4, 3, 4, 46);
				addLoc(div1, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h3);
				append(h3, text0);
				append(div1, text1);
				append(div1, div0);
				selectcontrol._mount(div0, null);
				append(div0, text2);
				checkboxcontrol._mount(div0, null);
				append(div0, text3);
				append(div0, hr);
				append(div0, text4);
				if (if_block) if_block.m(div0, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.title) {
					setData(text0, ctx.title);
				}

				var selectcontrol_changes = {};
				if (changed.colTypes) selectcontrol_changes.options = ctx.colTypes;
				if (!selectcontrol_updating.value && changed.columnFormat) {
					selectcontrol_changes.value = ctx.columnFormat.type;
					selectcontrol_updating.value = ctx.columnFormat.type !== void 0;
				}
				selectcontrol._set(selectcontrol_changes);
				selectcontrol_updating = {};

				var checkboxcontrol_changes = {};
				if (!checkboxcontrol_updating.value && changed.columnFormat) {
					checkboxcontrol_changes.value = ctx.columnFormat.ignore;
					checkboxcontrol_updating.value = ctx.columnFormat.ignore !== void 0;
				}
				checkboxcontrol._set(checkboxcontrol_changes);
				checkboxcontrol_updating = {};

				if (ctx.column && ctx.column.type() == 'number') {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$3(component, ctx);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				selectcontrol.destroy();
				checkboxcontrol.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (19:8) {#if column && column.type() == 'number'}
	function create_if_block$3(component, ctx) {
		var selectcontrol0_updating = {}, text0, selectcontrol1_updating = {}, text1, div1, label, text2_value = __$1("Prepend/Append"), text2, text3, div0, input0, input0_updating = false, text4, input1, input1_updating = false;

		var selectcontrol0_initial_data = {
		 	label: __$1('Round numbers to'),
		 	options: ctx.roundOptions,
		 	optgroups: ctx.numberFormats,
		 	width: "180px"
		 };
		if (ctx.columnFormat['number-format'] !== void 0) {
			selectcontrol0_initial_data.value = ctx.columnFormat['number-format'];
			selectcontrol0_updating.value = true;
		}
		var selectcontrol0 = new SelectControl({
			root: component.root,
			store: component.store,
			data: selectcontrol0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectcontrol0_updating.value && changed.value) {
					ctx.columnFormat['number-format'] = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				selectcontrol0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectcontrol0._bind({ value: 1 }, selectcontrol0.get());
		});

		var selectcontrol1_initial_data = {
		 	label: __$1('Divide numbers by'),
		 	options: ctx.divisors_opts,
		 	optgroups: ctx.divisors,
		 	width: "180px"
		 };
		if (ctx.columnFormat['number-divisor'] !== void 0) {
			selectcontrol1_initial_data.value = ctx.columnFormat['number-divisor'];
			selectcontrol1_updating.value = true;
		}
		var selectcontrol1 = new SelectControl({
			root: component.root,
			store: component.store,
			data: selectcontrol1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectcontrol1_updating.value && changed.value) {
					ctx.columnFormat['number-divisor'] = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				selectcontrol1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectcontrol1._bind({ value: 1 }, selectcontrol1.get());
		});

		function input0_input_handler() {
			input0_updating = true;
			ctx.columnFormat['number-prepend'] = input0.value;
			component.set({ columnFormat: ctx.columnFormat });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			ctx.columnFormat['number-append'] = input1.value;
			component.set({ columnFormat: ctx.columnFormat });
			input1_updating = false;
		}

		return {
			c: function create() {
				selectcontrol0._fragment.c();
				text0 = createText("\n\n        ");
				selectcontrol1._fragment.c();
				text1 = createText("\n\n        ");
				div1 = createElement("div");
				label = createElement("label");
				text2 = createText(text2_value);
				text3 = createText("\n            ");
				div0 = createElement("div");
				input0 = createElement("input");
				text4 = createText("\n                #\n                ");
				input1 = createElement("input");
				label.className = "control-label svelte-1qp115j";
				addLoc(label, file$4, 36, 12, 1007);
				addListener(input0, "input", input0_input_handler);
				input0.autocomplete = "screw-you-google-chrome";
				setStyle(input0, "width", "6ex");
				setStyle(input0, "text-align", "right");
				input0.dataset.lpignore = "true";
				input0.name = "prepend";
				setAttribute(input0, "type", "text");
				addLoc(input0, file$4, 38, 16, 1132);
				addListener(input1, "input", input1_input_handler);
				input1.autocomplete = "screw-you-google-chrome";
				setStyle(input1, "width", "6ex");
				input1.dataset.lpignore = "true";
				input1.name = "append";
				setAttribute(input1, "type", "text");
				addLoc(input1, file$4, 47, 16, 1481);
				div0.className = "controls form-inline svelte-1qp115j";
				addLoc(div0, file$4, 37, 12, 1081);
				div1.className = "control-group vis-option-type-select";
				addLoc(div1, file$4, 35, 8, 944);
			},

			m: function mount(target, anchor) {
				selectcontrol0._mount(target, anchor);
				insert(target, text0, anchor);
				selectcontrol1._mount(target, anchor);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, label);
				append(label, text2);
				append(div1, text3);
				append(div1, div0);
				append(div0, input0);

				input0.value = ctx.columnFormat['number-prepend'];

				append(div0, text4);
				append(div0, input1);

				input1.value = ctx.columnFormat['number-append'];
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectcontrol0_changes = {};
				if (changed.roundOptions) selectcontrol0_changes.options = ctx.roundOptions;
				if (changed.numberFormats) selectcontrol0_changes.optgroups = ctx.numberFormats;
				if (!selectcontrol0_updating.value && changed.columnFormat) {
					selectcontrol0_changes.value = ctx.columnFormat['number-format'];
					selectcontrol0_updating.value = ctx.columnFormat['number-format'] !== void 0;
				}
				selectcontrol0._set(selectcontrol0_changes);
				selectcontrol0_updating = {};

				var selectcontrol1_changes = {};
				if (changed.divisors_opts) selectcontrol1_changes.options = ctx.divisors_opts;
				if (changed.divisors) selectcontrol1_changes.optgroups = ctx.divisors;
				if (!selectcontrol1_updating.value && changed.columnFormat) {
					selectcontrol1_changes.value = ctx.columnFormat['number-divisor'];
					selectcontrol1_updating.value = ctx.columnFormat['number-divisor'] !== void 0;
				}
				selectcontrol1._set(selectcontrol1_changes);
				selectcontrol1_updating = {};

				if (!input0_updating && changed.columnFormat) input0.value = ctx.columnFormat['number-prepend'];
				if (!input1_updating && changed.columnFormat) input1.value = ctx.columnFormat['number-append'];
			},

			d: function destroy(detach) {
				selectcontrol0.destroy(detach);
				if (detach) {
					detachNode(text0);
				}

				selectcontrol1.destroy(detach);
				if (detach) {
					detachNode(text1);
					detachNode(div1);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
			}
		};
	}

	function CustomColumnFormat(options) {
		this._debugName = '<CustomColumnFormat>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);

		this._recompute({ column: 1 }, this._state);
		if (!('column' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'column'");

		if (!('colTypes' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'colTypes'");
		if (!('columnFormat' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'columnFormat'");
		if (!('roundOptions' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'roundOptions'");
		if (!('numberFormats' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'numberFormats'");
		if (!('divisors_opts' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors_opts'");
		if (!('divisors' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$3.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CustomColumnFormat.prototype, protoDev);
	assign(CustomColumnFormat.prototype, methods$4);

	CustomColumnFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomColumnFormat>: Cannot set read-only property 'title'");
	};

	CustomColumnFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.column) {
			if (this._differs(state.title, (state.title = title(state)))) changed.title = true;
		}
	};

	/* Built-in method references for those with the same name as other `lodash` methods. */

	var nativeCeil = Math.ceil,
	    nativeMax = Math.max;

	/**
	 * The base implementation of `_.range` and `_.rangeRight` which doesn't
	 * coerce arguments.
	 *
	 * @private
	 * @param {number} start The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} step The value to increment or decrement by.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Array} Returns the range of numbers.
	 */
	function baseRange$1(start, end, step, fromRight) {
	  var index = -1,
	      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	      result = Array(length);

	  while (length--) {
	    result[fromRight ? length : ++index] = start;
	    start += step;
	  }
	  return result;
	}

	var _baseRange = baseRange$1;

	var eq$1 = eq_1,
	    isArrayLike$1 = isArrayLike_1,
	    isIndex = _isIndex,
	    isObject$1 = isObject_1;

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall$1(value, index, object) {
	  if (!isObject$1(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike$1(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq$1(object[index], value);
	  }
	  return false;
	}

	var _isIterateeCall = isIterateeCall$1;

	var toNumber = toNumber_1;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite$1(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	var toFinite_1 = toFinite$1;

	var baseRange = _baseRange,
	    isIterateeCall = _isIterateeCall,
	    toFinite = toFinite_1;

	/**
	 * Creates a `_.range` or `_.rangeRight` function.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new range function.
	 */
	function createRange$1(fromRight) {
	  return function(start, end, step) {
	    if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
	      end = step = undefined;
	    }
	    // Ensure the sign of `-0` is preserved.
	    start = toFinite(start);
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    } else {
	      end = toFinite(end);
	    }
	    step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
	    return baseRange(start, end, step, fromRight);
	  };
	}

	var _createRange = createRange$1;

	var createRange = _createRange;

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
	 * `start` is specified without an `end` or `step`. If `end` is not specified,
	 * it's set to `start` with `start` then set to `0`.
	 *
	 * **Note:** JavaScript follows the IEEE-754 standard for resolving
	 * floating-point values which can produce unexpected results.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {number} [start=0] The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} [step=1] The value to increment or decrement by.
	 * @returns {Array} Returns the range of numbers.
	 * @see _.inRange, _.rangeRight
	 * @example
	 *
	 * _.range(4);
	 * // => [0, 1, 2, 3]
	 *
	 * _.range(-4);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 5);
	 * // => [1, 2, 3, 4]
	 *
	 * _.range(0, 20, 5);
	 * // => [0, 5, 10, 15]
	 *
	 * _.range(0, -4, -1);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 4, 0);
	 * // => [1, 1, 1]
	 *
	 * _.range(0);
	 * // => []
	 */
	var range$1 = createRange();

	var range_1 = range$1;

	var baseAssignValue = _baseAssignValue,
	    createAggregator = _createAggregator;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto.hasOwnProperty;

	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The corresponding value of
	 * each key is the number of times the key was returned by `iteratee`. The
	 * iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.5.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.countBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': 1, '6': 2 }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.countBy(['one', 'two', 'three'], 'length');
	 * // => { '3': 2, '5': 1 }
	 */
	var countBy$1 = createAggregator(function(result, value, key) {
	  if (hasOwnProperty$1.call(result, key)) {
	    ++result[key];
	  } else {
	    baseAssignValue(result, key, 1);
	  }
	});

	var countBy_1 = countBy$1;

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
	 * Automatically converts a numeric value to a string. this is better
	 * than the default number to string conversion in JS which sometimes
	 * produces ugly strings like "3.999999998"
	 *
	 * @exports toFixed
	 * @kind function
	 *
	 * @example
	 * import toFixed from '@datawrapper/shared/toFixed';
	 * // returns '3.1'
	 * toFixed(3.100001)
	 *
	 * @param {number} value
	 * @returns {string}
	 */
	function toFixed(value) {
	    return (+value).toFixed(tailLength(value));
	}

	function ascending(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector(f) {
	  let delta = f;
	  let compare = f;

	  if (f.length === 1) {
	    delta = (d, x) => f(d) - x;
	    compare = ascendingComparator(f);
	  }

	  function left(a, x, lo, hi) {
	    if (lo == null) lo = 0;
	    if (hi == null) hi = a.length;
	    while (lo < hi) {
	      const mid = (lo + hi) >>> 1;
	      if (compare(a[mid], x) < 0) lo = mid + 1;
	      else hi = mid;
	    }
	    return lo;
	  }

	  function right(a, x, lo, hi) {
	    if (lo == null) lo = 0;
	    if (hi == null) hi = a.length;
	    while (lo < hi) {
	      const mid = (lo + hi) >>> 1;
	      if (compare(a[mid], x) > 0) hi = mid;
	      else lo = mid + 1;
	    }
	    return lo;
	  }

	  function center(a, x, lo, hi) {
	    if (lo == null) lo = 0;
	    if (hi == null) hi = a.length;
	    const i = left(a, x, lo, hi - 1);
	    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
	  }

	  return {left, center, right};
	}

	function ascendingComparator(f) {
	  return (d, x) => ascending(f(d), x);
	}

	function number$1(x) {
	  return x === null ? NaN : +x;
	}

	function* numbers(values, valueof) {
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        yield value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        yield value;
	      }
	    }
	  }
	}

	const ascendingBisect = bisector(ascending);
	const bisectRight = ascendingBisect.right;
	bisector(number$1).center;
	var bisect = bisectRight;

	function count(values, valueof) {
	  let count = 0;
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        ++count;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        ++count;
	      }
	    }
	  }
	  return count;
	}

	function extent(values, valueof) {
	  let min;
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  }
	  return [min, max];
	}

	function identity$4(x) {
	  return x;
	}

	var array = Array.prototype;

	var slice$1 = array.slice;

	function constant$2(x) {
	  return function() {
	    return x;
	  };
	}

	var e10 = Math.sqrt(50),
	    e5 = Math.sqrt(10),
	    e2 = Math.sqrt(2);

	function ticks$1(start, stop, count) {
	  var reverse,
	      i = -1,
	      n,
	      ticks,
	      step;

	  stop = +stop, start = +start, count = +count;
	  if (start === stop && count > 0) return [start];
	  if (reverse = stop < start) n = start, start = stop, stop = n;
	  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

	  if (step > 0) {
	    start = Math.ceil(start / step);
	    stop = Math.floor(stop / step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) * step;
	  } else {
	    step = -step;
	    start = Math.ceil(start * step);
	    stop = Math.floor(stop * step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) / step;
	  }

	  if (reverse) ticks.reverse();

	  return ticks;
	}

	function tickIncrement(start, stop, count) {
	  var step = (stop - start) / Math.max(0, count),
	      power = Math.floor(Math.log(step) / Math.LN10),
	      error = step / Math.pow(10, power);
	  return power >= 0
	      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
	      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
	}

	function tickStep(start, stop, count) {
	  var step0 = Math.abs(stop - start) / Math.max(0, count),
	      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	      error = step0 / step1;
	  if (error >= e10) step1 *= 10;
	  else if (error >= e5) step1 *= 5;
	  else if (error >= e2) step1 *= 2;
	  return stop < start ? -step1 : step1;
	}

	function nice(start, stop, count) {
	  let prestep;
	  while (true) {
	    const step = tickIncrement(start, stop, count);
	    if (step === prestep || step === 0 || !isFinite(step)) {
	      return [start, stop];
	    } else if (step > 0) {
	      start = Math.floor(start / step) * step;
	      stop = Math.ceil(stop / step) * step;
	    } else if (step < 0) {
	      start = Math.ceil(start * step) / step;
	      stop = Math.floor(stop * step) / step;
	    }
	    prestep = step;
	  }
	}

	function thresholdSturges(values) {
	  return Math.ceil(Math.log(count(values)) / Math.LN2) + 1;
	}

	function histogram() {
	  var value = identity$4,
	      domain = extent,
	      threshold = thresholdSturges;

	  function histogram(data) {
	    if (!Array.isArray(data)) data = Array.from(data);

	    var i,
	        n = data.length,
	        x,
	        values = new Array(n);

	    for (i = 0; i < n; ++i) {
	      values[i] = value(data[i], i, data);
	    }

	    var xz = domain(values),
	        x0 = xz[0],
	        x1 = xz[1],
	        tz = threshold(values, x0, x1);

	    // Convert number of thresholds into uniform thresholds,
	    // and nice the default domain accordingly.
	    if (!Array.isArray(tz)) {
	      tz = +tz;
	      if (domain === extent) [x0, x1] = nice(x0, x1, tz);
	      tz = ticks$1(x0, x1, tz);
	      if (tz[tz.length - 1] === x1) tz.pop(); // exclusive
	    }

	    // Remove any thresholds outside the domain.
	    var m = tz.length;
	    while (tz[0] <= x0) tz.shift(), --m;
	    while (tz[m - 1] > x1) tz.pop(), --m;

	    var bins = new Array(m + 1),
	        bin;

	    // Initialize bins.
	    for (i = 0; i <= m; ++i) {
	      bin = bins[i] = [];
	      bin.x0 = i > 0 ? tz[i - 1] : x0;
	      bin.x1 = i < m ? tz[i] : x1;
	    }

	    // Assign data to bins by value, ignoring any outside the domain.
	    for (i = 0; i < n; ++i) {
	      x = values[i];
	      if (x0 <= x && x <= x1) {
	        bins[bisect(tz, x, 0, m)].push(data[i]);
	      }
	    }

	    return bins;
	  }

	  histogram.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant$2(_), histogram) : value;
	  };

	  histogram.domain = function(_) {
	    return arguments.length ? (domain = typeof _ === "function" ? _ : constant$2([_[0], _[1]]), histogram) : domain;
	  };

	  histogram.thresholds = function(_) {
	    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant$2(slice$1.call(_)) : constant$2(_), histogram) : threshold;
	  };

	  return histogram;
	}

	function max$1(values, valueof) {
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  }
	  return max;
	}

	function min$1(values, valueof) {
	  let min;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  }
	  return min;
	}

	// Based on https://github.com/mourner/quickselect
	// ISC license, Copyright 2018 Vladimir Agafonkin.
	function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending) {
	  while (right > left) {
	    if (right - left > 600) {
	      const n = right - left + 1;
	      const m = k - left + 1;
	      const z = Math.log(n);
	      const s = 0.5 * Math.exp(2 * z / 3);
	      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
	      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
	      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
	      quickselect(array, k, newLeft, newRight, compare);
	    }

	    const t = array[k];
	    let i = left;
	    let j = right;

	    swap(array, left, k);
	    if (compare(array[right], t) > 0) swap(array, left, right);

	    while (i < j) {
	      swap(array, i, j), ++i, --j;
	      while (compare(array[i], t) < 0) ++i;
	      while (compare(array[j], t) > 0) --j;
	    }

	    if (compare(array[left], t) === 0) swap(array, left, j);
	    else ++j, swap(array, j, right);

	    if (j <= k) left = j + 1;
	    if (k <= j) right = j - 1;
	  }
	  return array;
	}

	function swap(array, i, j) {
	  const t = array[i];
	  array[i] = array[j];
	  array[j] = t;
	}

	function quantile(values, p, valueof) {
	  values = Float64Array.from(numbers(values, valueof));
	  if (!(n = values.length)) return;
	  if ((p = +p) <= 0 || n < 2) return min$1(values);
	  if (p >= 1) return max$1(values);
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = max$1(quickselect(values, i0).subarray(0, i0 + 1)),
	      value1 = min$1(values.subarray(i0 + 1));
	  return value0 + (value1 - value0) * (i - i0);
	}

	function mean(values, valueof) {
	  let count = 0;
	  let sum = 0;
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        ++count, sum += value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        ++count, sum += value;
	      }
	    }
	  }
	  if (count) return sum / count;
	}

	function median(values, valueof) {
	  return quantile(values, 0.5, valueof);
	}

	function sequence(start, stop, step) {
	  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	  var i = -1,
	      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	      range = new Array(n);

	  while (++i < n) {
	    range[i] = start + i * step;
	  }

	  return range;
	}

	function initRange(domain, range) {
	  switch (arguments.length) {
	    case 0: break;
	    case 1: this.range(domain); break;
	    default: this.range(range).domain(domain); break;
	  }
	  return this;
	}

	const implicit = Symbol("implicit");

	function ordinal() {
	  var index = new Map(),
	      domain = [],
	      range = [],
	      unknown = implicit;

	  function scale(d) {
	    var key = d + "", i = index.get(key);
	    if (!i) {
	      if (unknown !== implicit) return unknown;
	      index.set(key, i = domain.push(d));
	    }
	    return range[(i - 1) % range.length];
	  }

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [], index = new Map();
	    for (const value of _) {
	      const key = value + "";
	      if (index.has(key)) continue;
	      index.set(key, domain.push(value));
	    }
	    return scale;
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = Array.from(_), scale) : range.slice();
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  scale.copy = function() {
	    return ordinal(domain, range).unknown(unknown);
	  };

	  initRange.apply(scale, arguments);

	  return scale;
	}

	function band() {
	  var scale = ordinal().unknown(undefined),
	      domain = scale.domain,
	      ordinalRange = scale.range,
	      r0 = 0,
	      r1 = 1,
	      step,
	      bandwidth,
	      round = false,
	      paddingInner = 0,
	      paddingOuter = 0,
	      align = 0.5;

	  delete scale.unknown;

	  function rescale() {
	    var n = domain().length,
	        reverse = r1 < r0,
	        start = reverse ? r1 : r0,
	        stop = reverse ? r0 : r1;
	    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
	    if (round) step = Math.floor(step);
	    start += (stop - start - step * (n - paddingInner)) * align;
	    bandwidth = step * (1 - paddingInner);
	    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
	    var values = sequence(n).map(function(i) { return start + step * i; });
	    return ordinalRange(reverse ? values.reverse() : values);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.range = function(_) {
	    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
	  };

	  scale.rangeRound = function(_) {
	    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
	  };

	  scale.bandwidth = function() {
	    return bandwidth;
	  };

	  scale.step = function() {
	    return step;
	  };

	  scale.round = function(_) {
	    return arguments.length ? (round = !!_, rescale()) : round;
	  };

	  scale.padding = function(_) {
	    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
	  };

	  scale.paddingInner = function(_) {
	    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
	  };

	  scale.paddingOuter = function(_) {
	    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
	  };

	  scale.align = function(_) {
	    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	  };

	  scale.copy = function() {
	    return band(domain(), [r0, r1])
	        .round(round)
	        .paddingInner(paddingInner)
	        .paddingOuter(paddingOuter)
	        .align(align);
	  };

	  return initRange.apply(rescale(), arguments);
	}

	function define(constructor, factory, prototype) {
	  constructor.prototype = factory.prototype = prototype;
	  prototype.constructor = constructor;
	}

	function extend$1(parent, definition) {
	  var prototype = Object.create(parent.prototype);
	  for (var key in definition) prototype[key] = definition[key];
	  return prototype;
	}

	function Color() {}

	var darker = 0.7;
	var brighter = 1 / darker;

	var reI = "\\s*([+-]?\\d+)\\s*",
	    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
	    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
	    reHex = /^#([0-9a-f]{3,8})$/,
	    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
	    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
	    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
	    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
	    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
	    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

	var named = {
	  aliceblue: 0xf0f8ff,
	  antiquewhite: 0xfaebd7,
	  aqua: 0x00ffff,
	  aquamarine: 0x7fffd4,
	  azure: 0xf0ffff,
	  beige: 0xf5f5dc,
	  bisque: 0xffe4c4,
	  black: 0x000000,
	  blanchedalmond: 0xffebcd,
	  blue: 0x0000ff,
	  blueviolet: 0x8a2be2,
	  brown: 0xa52a2a,
	  burlywood: 0xdeb887,
	  cadetblue: 0x5f9ea0,
	  chartreuse: 0x7fff00,
	  chocolate: 0xd2691e,
	  coral: 0xff7f50,
	  cornflowerblue: 0x6495ed,
	  cornsilk: 0xfff8dc,
	  crimson: 0xdc143c,
	  cyan: 0x00ffff,
	  darkblue: 0x00008b,
	  darkcyan: 0x008b8b,
	  darkgoldenrod: 0xb8860b,
	  darkgray: 0xa9a9a9,
	  darkgreen: 0x006400,
	  darkgrey: 0xa9a9a9,
	  darkkhaki: 0xbdb76b,
	  darkmagenta: 0x8b008b,
	  darkolivegreen: 0x556b2f,
	  darkorange: 0xff8c00,
	  darkorchid: 0x9932cc,
	  darkred: 0x8b0000,
	  darksalmon: 0xe9967a,
	  darkseagreen: 0x8fbc8f,
	  darkslateblue: 0x483d8b,
	  darkslategray: 0x2f4f4f,
	  darkslategrey: 0x2f4f4f,
	  darkturquoise: 0x00ced1,
	  darkviolet: 0x9400d3,
	  deeppink: 0xff1493,
	  deepskyblue: 0x00bfff,
	  dimgray: 0x696969,
	  dimgrey: 0x696969,
	  dodgerblue: 0x1e90ff,
	  firebrick: 0xb22222,
	  floralwhite: 0xfffaf0,
	  forestgreen: 0x228b22,
	  fuchsia: 0xff00ff,
	  gainsboro: 0xdcdcdc,
	  ghostwhite: 0xf8f8ff,
	  gold: 0xffd700,
	  goldenrod: 0xdaa520,
	  gray: 0x808080,
	  green: 0x008000,
	  greenyellow: 0xadff2f,
	  grey: 0x808080,
	  honeydew: 0xf0fff0,
	  hotpink: 0xff69b4,
	  indianred: 0xcd5c5c,
	  indigo: 0x4b0082,
	  ivory: 0xfffff0,
	  khaki: 0xf0e68c,
	  lavender: 0xe6e6fa,
	  lavenderblush: 0xfff0f5,
	  lawngreen: 0x7cfc00,
	  lemonchiffon: 0xfffacd,
	  lightblue: 0xadd8e6,
	  lightcoral: 0xf08080,
	  lightcyan: 0xe0ffff,
	  lightgoldenrodyellow: 0xfafad2,
	  lightgray: 0xd3d3d3,
	  lightgreen: 0x90ee90,
	  lightgrey: 0xd3d3d3,
	  lightpink: 0xffb6c1,
	  lightsalmon: 0xffa07a,
	  lightseagreen: 0x20b2aa,
	  lightskyblue: 0x87cefa,
	  lightslategray: 0x778899,
	  lightslategrey: 0x778899,
	  lightsteelblue: 0xb0c4de,
	  lightyellow: 0xffffe0,
	  lime: 0x00ff00,
	  limegreen: 0x32cd32,
	  linen: 0xfaf0e6,
	  magenta: 0xff00ff,
	  maroon: 0x800000,
	  mediumaquamarine: 0x66cdaa,
	  mediumblue: 0x0000cd,
	  mediumorchid: 0xba55d3,
	  mediumpurple: 0x9370db,
	  mediumseagreen: 0x3cb371,
	  mediumslateblue: 0x7b68ee,
	  mediumspringgreen: 0x00fa9a,
	  mediumturquoise: 0x48d1cc,
	  mediumvioletred: 0xc71585,
	  midnightblue: 0x191970,
	  mintcream: 0xf5fffa,
	  mistyrose: 0xffe4e1,
	  moccasin: 0xffe4b5,
	  navajowhite: 0xffdead,
	  navy: 0x000080,
	  oldlace: 0xfdf5e6,
	  olive: 0x808000,
	  olivedrab: 0x6b8e23,
	  orange: 0xffa500,
	  orangered: 0xff4500,
	  orchid: 0xda70d6,
	  palegoldenrod: 0xeee8aa,
	  palegreen: 0x98fb98,
	  paleturquoise: 0xafeeee,
	  palevioletred: 0xdb7093,
	  papayawhip: 0xffefd5,
	  peachpuff: 0xffdab9,
	  peru: 0xcd853f,
	  pink: 0xffc0cb,
	  plum: 0xdda0dd,
	  powderblue: 0xb0e0e6,
	  purple: 0x800080,
	  rebeccapurple: 0x663399,
	  red: 0xff0000,
	  rosybrown: 0xbc8f8f,
	  royalblue: 0x4169e1,
	  saddlebrown: 0x8b4513,
	  salmon: 0xfa8072,
	  sandybrown: 0xf4a460,
	  seagreen: 0x2e8b57,
	  seashell: 0xfff5ee,
	  sienna: 0xa0522d,
	  silver: 0xc0c0c0,
	  skyblue: 0x87ceeb,
	  slateblue: 0x6a5acd,
	  slategray: 0x708090,
	  slategrey: 0x708090,
	  snow: 0xfffafa,
	  springgreen: 0x00ff7f,
	  steelblue: 0x4682b4,
	  tan: 0xd2b48c,
	  teal: 0x008080,
	  thistle: 0xd8bfd8,
	  tomato: 0xff6347,
	  turquoise: 0x40e0d0,
	  violet: 0xee82ee,
	  wheat: 0xf5deb3,
	  white: 0xffffff,
	  whitesmoke: 0xf5f5f5,
	  yellow: 0xffff00,
	  yellowgreen: 0x9acd32
	};

	define(Color, color, {
	  copy: function(channels) {
	    return Object.assign(new this.constructor, this, channels);
	  },
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  hex: color_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: color_formatHex,
	  formatHsl: color_formatHsl,
	  formatRgb: color_formatRgb,
	  toString: color_formatRgb
	});

	function color_formatHex() {
	  return this.rgb().formatHex();
	}

	function color_formatHsl() {
	  return hslConvert(this).formatHsl();
	}

	function color_formatRgb() {
	  return this.rgb().formatRgb();
	}

	function color(format) {
	  var m, l;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
	      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
	      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
	      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
	      : null) // invalid hex
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
	      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	      : null;
	}

	function rgbn(n) {
	  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	}

	function rgba(r, g, b, a) {
	  if (a <= 0) r = g = b = NaN;
	  return new Rgb(r, g, b, a);
	}

	function rgbConvert(o) {
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Rgb;
	  o = o.rgb();
	  return new Rgb(o.r, o.g, o.b, o.opacity);
	}

	function rgb$1(r, g, b, opacity) {
	  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	}

	function Rgb(r, g, b, opacity) {
	  this.r = +r;
	  this.g = +g;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Rgb, rgb$1, extend$1(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  rgb: function() {
	    return this;
	  },
	  displayable: function() {
	    return (-0.5 <= this.r && this.r < 255.5)
	        && (-0.5 <= this.g && this.g < 255.5)
	        && (-0.5 <= this.b && this.b < 255.5)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: rgb_formatHex,
	  formatRgb: rgb_formatRgb,
	  toString: rgb_formatRgb
	}));

	function rgb_formatHex() {
	  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
	}

	function rgb_formatRgb() {
	  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	  return (a === 1 ? "rgb(" : "rgba(")
	      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	      + (a === 1 ? ")" : ", " + a + ")");
	}

	function hex(value) {
	  value = Math.max(0, Math.min(255, Math.round(value) || 0));
	  return (value < 16 ? "0" : "") + value.toString(16);
	}

	function hsla(h, s, l, a) {
	  if (a <= 0) h = s = l = NaN;
	  else if (l <= 0 || l >= 1) h = s = NaN;
	  else if (s <= 0) h = NaN;
	  return new Hsl(h, s, l, a);
	}

	function hslConvert(o) {
	  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Hsl;
	  if (o instanceof Hsl) return o;
	  o = o.rgb();
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      min = Math.min(r, g, b),
	      max = Math.max(r, g, b),
	      h = NaN,
	      s = max - min,
	      l = (max + min) / 2;
	  if (s) {
	    if (r === max) h = (g - b) / s + (g < b) * 6;
	    else if (g === max) h = (b - r) / s + 2;
	    else h = (r - g) / s + 4;
	    s /= l < 0.5 ? max + min : 2 - max - min;
	    h *= 60;
	  } else {
	    s = l > 0 && l < 1 ? 0 : h;
	  }
	  return new Hsl(h, s, l, o.opacity);
	}

	function hsl(h, s, l, opacity) {
	  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	}

	function Hsl(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hsl, hsl, extend$1(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = this.h % 360 + (this.h < 0) * 360,
	        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	        l = this.l,
	        m2 = l + (l < 0.5 ? l : 1 - l) * s,
	        m1 = 2 * l - m2;
	    return new Rgb(
	      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	      hsl2rgb(h, m1, m2),
	      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	      this.opacity
	    );
	  },
	  displayable: function() {
	    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	        && (0 <= this.l && this.l <= 1)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  formatHsl: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "hsl(" : "hsla(")
	        + (this.h || 0) + ", "
	        + (this.s || 0) * 100 + "%, "
	        + (this.l || 0) * 100 + "%"
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

	var constant$1 = x => () => x;

	function linear$1(a, d) {
	  return function(t) {
	    return a + t * d;
	  };
	}

	function exponential(a, b, y) {
	  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	    return Math.pow(a + t * b, y);
	  };
	}

	function gamma(y) {
	  return (y = +y) === 1 ? nogamma : function(a, b) {
	    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
	  };
	}

	function nogamma(a, b) {
	  var d = b - a;
	  return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
	}

	var rgb = (function rgbGamma(y) {
	  var color = gamma(y);

	  function rgb(start, end) {
	    var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
	        g = color(start.g, end.g),
	        b = color(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb.gamma = rgbGamma;

	  return rgb;
	})(1);

	function numberArray(a, b) {
	  if (!b) b = [];
	  var n = a ? Math.min(b.length, a.length) : 0,
	      c = b.slice(),
	      i;
	  return function(t) {
	    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
	    return c;
	  };
	}

	function isNumberArray(x) {
	  return ArrayBuffer.isView(x) && !(x instanceof DataView);
	}

	function genericArray(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(na),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	}

	function date(a, b) {
	  var d = new Date;
	  return a = +a, b = +b, function(t) {
	    return d.setTime(a * (1 - t) + b * t), d;
	  };
	}

	function interpolateNumber(a, b) {
	  return a = +a, b = +b, function(t) {
	    return a * (1 - t) + b * t;
	  };
	}

	function object$1(a, b) {
	  var i = {},
	      c = {},
	      k;

	  if (a === null || typeof a !== "object") a = {};
	  if (b === null || typeof b !== "object") b = {};

	  for (k in b) {
	    if (k in a) {
	      i[k] = interpolate(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function(t) {
	    for (k in i) c[k] = i[k](t);
	    return c;
	  };
	}

	var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
	    reB = new RegExp(reA.source, "g");

	function zero(b) {
	  return function() {
	    return b;
	  };
	}

	function one(b) {
	  return function(t) {
	    return b(t) + "";
	  };
	}

	function string(a, b) {
	  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	      am, // current match in a
	      bm, // current match in b
	      bs, // string preceding current number in b, if any
	      i = -1, // index in s
	      s = [], // string constants and placeholders
	      q = []; // number interpolators

	  // Coerce inputs to strings.
	  a = a + "", b = b + "";

	  // Interpolate pairs of numbers in a & b.
	  while ((am = reA.exec(a))
	      && (bm = reB.exec(b))) {
	    if ((bs = bm.index) > bi) { // a string precedes the next number in b
	      bs = b.slice(bi, bs);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }
	    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	      if (s[i]) s[i] += bm; // coalesce with previous string
	      else s[++i] = bm;
	    } else { // interpolate non-matching numbers
	      s[++i] = null;
	      q.push({i: i, x: interpolateNumber(am, bm)});
	    }
	    bi = reB.lastIndex;
	  }

	  // Add remains of b.
	  if (bi < b.length) {
	    bs = b.slice(bi);
	    if (s[i]) s[i] += bs; // coalesce with previous string
	    else s[++i] = bs;
	  }

	  // Special optimization for only a single match.
	  // Otherwise, interpolate each of the numbers and rejoin the string.
	  return s.length < 2 ? (q[0]
	      ? one(q[0].x)
	      : zero(b))
	      : (b = q.length, function(t) {
	          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	          return s.join("");
	        });
	}

	function interpolate(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant$1(b)
	      : (t === "number" ? interpolateNumber
	      : t === "string" ? ((c = color(b)) ? (b = c, rgb) : string)
	      : b instanceof color ? rgb
	      : b instanceof Date ? date
	      : isNumberArray(b) ? numberArray
	      : Array.isArray(b) ? genericArray
	      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object$1
	      : interpolateNumber)(a, b);
	}

	function interpolateRound(a, b) {
	  return a = +a, b = +b, function(t) {
	    return Math.round(a * (1 - t) + b * t);
	  };
	}

	function constants(x) {
	  return function() {
	    return x;
	  };
	}

	function number(x) {
	  return +x;
	}

	var unit = [0, 1];

	function identity$3(x) {
	  return x;
	}

	function normalize(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constants(isNaN(b) ? NaN : 0.5);
	}

	function clamper(a, b) {
	  var t;
	  if (a > b) t = a, a = b, b = t;
	  return function(x) { return Math.max(a, Math.min(b, x)); };
	}

	// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
	function bimap(domain, range, interpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
	  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range, interpolate) {
	  var j = Math.min(domain.length, range.length) - 1,
	      d = new Array(j),
	      r = new Array(j),
	      i = -1;

	  // Reverse descending domains.
	  if (domain[j] < domain[0]) {
	    domain = domain.slice().reverse();
	    range = range.slice().reverse();
	  }

	  while (++i < j) {
	    d[i] = normalize(domain[i], domain[i + 1]);
	    r[i] = interpolate(range[i], range[i + 1]);
	  }

	  return function(x) {
	    var i = bisect(domain, x, 1, j) - 1;
	    return r[i](d[i](x));
	  };
	}

	function copy(source, target) {
	  return target
	      .domain(source.domain())
	      .range(source.range())
	      .interpolate(source.interpolate())
	      .clamp(source.clamp())
	      .unknown(source.unknown());
	}

	function transformer() {
	  var domain = unit,
	      range = unit,
	      interpolate$1 = interpolate,
	      transform,
	      untransform,
	      unknown,
	      clamp = identity$3,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    var n = Math.min(domain.length, range.length);
	    if (clamp !== identity$3) clamp = clamper(domain[0], domain[n - 1]);
	    piecewise = n > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
	  }

	  scale.invert = function(y) {
	    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = _ ? true : identity$3, rescale()) : clamp !== identity$3;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  return function(t, u) {
	    transform = t, untransform = u;
	    return rescale();
	  };
	}

	function continuous() {
	  return transformer()(identity$3, identity$3);
	}

	function formatDecimal(x) {
	  return Math.abs(x = Math.round(x)) >= 1e21
	      ? x.toLocaleString("en").replace(/,/g, "")
	      : x.toString(10);
	}

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimalParts(1.23) returns ["123", 0].
	function formatDecimalParts(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	}

	function exponent(x) {
	  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
	}

	function formatGroup(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	}

	function formatNumerals(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	}

	// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
	var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	  var match;
	  return new FormatSpecifier({
	    fill: match[1],
	    align: match[2],
	    sign: match[3],
	    symbol: match[4],
	    zero: match[5],
	    width: match[6],
	    comma: match[7],
	    precision: match[8] && match[8].slice(1),
	    trim: match[9],
	    type: match[10]
	  });
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
	  this.align = specifier.align === undefined ? ">" : specifier.align + "";
	  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
	  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
	  this.zero = !!specifier.zero;
	  this.width = specifier.width === undefined ? undefined : +specifier.width;
	  this.comma = !!specifier.comma;
	  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
	  this.trim = !!specifier.trim;
	  this.type = specifier.type === undefined ? "" : specifier.type + "";
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
	      + (this.trim ? "~" : "")
	      + this.type;
	};

	// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
	function formatTrim(s) {
	  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (s[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
	    }
	  }
	  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
	}

	var prefixExponent;

	function formatPrefixAuto(x, p) {
	  var d = formatDecimalParts(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	}

	function formatRounded(x, p) {
	  var d = formatDecimalParts(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	}

	var formatTypes = {
	  "%": (x, p) => (x * 100).toFixed(p),
	  "b": (x) => Math.round(x).toString(2),
	  "c": (x) => x + "",
	  "d": formatDecimal,
	  "e": (x, p) => x.toExponential(p),
	  "f": (x, p) => x.toFixed(p),
	  "g": (x, p) => x.toPrecision(p),
	  "o": (x) => Math.round(x).toString(8),
	  "p": (x, p) => formatRounded(x * 100, p),
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": (x) => Math.round(x).toString(16).toUpperCase(),
	  "x": (x) => Math.round(x).toString(16)
	};

	function identity$2(x) {
	  return x;
	}

	var map$1 = Array.prototype.map,
	    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map$1.call(locale.grouping, Number), locale.thousands + ""),
	      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
	      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
	      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
	      numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map$1.call(locale.numerals, String)),
	      percent = locale.percent === undefined ? "%" : locale.percent + "",
	      minus = locale.minus === undefined ? "−" : locale.minus + "",
	      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        trim = specifier.trim,
	        type = specifier.type;

	    // The "n" type is an alias for ",g".
	    if (type === "n") comma = true, type = "g";

	    // The "" type, and any invalid type, is an alias for ".12~g".
	    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

	    // If zero fill is specified, padding goes after sign and before digits.
	    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision === undefined ? 6
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
	        var valueNegative = value < 0 || 1 / value < 0;

	        // Perform the initial formatting.
	        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

	        // Trim insignificant zeros.
	        if (trim) value = formatTrim(value);

	        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
	        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
	        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	}

	var locale$1;
	var format;
	var formatPrefix;

	defaultLocale({
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""]
	});

	function defaultLocale(definition) {
	  locale$1 = formatLocale(definition);
	  format = locale$1.format;
	  formatPrefix = locale$1.formatPrefix;
	  return locale$1;
	}

	function precisionFixed(step) {
	  return Math.max(0, -exponent(Math.abs(step)));
	}

	function precisionPrefix(step, value) {
	  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
	}

	function precisionRound(step, max) {
	  step = Math.abs(step), max = Math.abs(max) - step;
	  return Math.max(0, exponent(max) - exponent(step)) + 1;
	}

	function tickFormat(start, stop, count, specifier) {
	  var step = tickStep(start, stop, count),
	      precision;
	  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	  switch (specifier.type) {
	    case "s": {
	      var value = Math.max(Math.abs(start), Math.abs(stop));
	      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
	      return formatPrefix(specifier, value);
	    }
	    case "":
	    case "e":
	    case "g":
	    case "p":
	    case "r": {
	      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
	      break;
	    }
	    case "f":
	    case "%": {
	      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	      break;
	    }
	  }
	  return format(specifier);
	}

	function linearish(scale) {
	  var domain = scale.domain;

	  scale.ticks = function(count) {
	    var d = domain();
	    return ticks$1(d[0], d[d.length - 1], count == null ? 10 : count);
	  };

	  scale.tickFormat = function(count, specifier) {
	    var d = domain();
	    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
	  };

	  scale.nice = function(count) {
	    if (count == null) count = 10;

	    var d = domain();
	    var i0 = 0;
	    var i1 = d.length - 1;
	    var start = d[i0];
	    var stop = d[i1];
	    var prestep;
	    var step;
	    var maxIter = 10;

	    if (stop < start) {
	      step = start, start = stop, stop = step;
	      step = i0, i0 = i1, i1 = step;
	    }
	    
	    while (maxIter-- > 0) {
	      step = tickIncrement(start, stop, count);
	      if (step === prestep) {
	        d[i0] = start;
	        d[i1] = stop;
	        return domain(d);
	      } else if (step > 0) {
	        start = Math.floor(start / step) * step;
	        stop = Math.ceil(stop / step) * step;
	      } else if (step < 0) {
	        start = Math.ceil(start * step) / step;
	        stop = Math.floor(stop * step) / step;
	      } else {
	        break;
	      }
	      prestep = step;
	    }

	    return scale;
	  };

	  return scale;
	}

	function linear() {
	  var scale = continuous();

	  scale.copy = function() {
	    return copy(scale, linear());
	  };

	  initRange.apply(scale, arguments);

	  return linearish(scale);
	}

	/* describe/Histogram.html generated by Svelte v2.16.1 */



	var xScale_ = linear();
	var xScaleBand_ = band();
	var yScale_ = linear();

	const pct = val => {
	    if (!val) return '0%';
	    if (val < 0.01) return '<1%';
	    return (val * 100).toFixed(0) + '%';
	};

	function NAs({ values }) {
	    return values.filter(d => typeof d === 'string' || Number.isNaN(d)).length;
	}
	function stats({ validValues, format }) {
	    const xmin = min$1(validValues);
	    const xmax = max$1(validValues);
	    const xmean = mean(validValues);
	    const xmed = median(validValues);
	    return [
	        { x: xmin, label: format(xmin), name: __$1('describe / histogram / min') },
	        { x: xmax, label: format(xmax), name: __$1('describe / histogram / max') },
	        { x: xmean, label: format(xmean), name: __$1('describe / histogram / mean') },
	        { x: xmed, label: format(xmed), name: __$1('describe / histogram / median') }
	    ];
	}
	function validValues({ values }) {
	    return values.filter(d => typeof d === 'number' && !Number.isNaN(d));
	}
	function ticks({ xScale, format }) {
	    return xScale.ticks(4).map(x => {
	        return { x, label: format(x) };
	    });
	}
	function bins({ niceDomain, validValues }) {
	    // const tickCnt = Math.min(_uniq(validValues).length, 14);
	    const dom = niceDomain;
	    // const classw = (s[1]-s[0]);
	    const bins = histogram().domain(dom).thresholds(thresholdSturges)(validValues);
	    const binWidths = countBy_1(bins.map(b => b.x1 - b.x0));
	    if (bins.length > 2 && Object.keys(binWidths).length > 1) {
	        // check first and last bin
	        const binw = bins[1].x1 - bins[1].x0;
	        const lst = dom[0] + Math.ceil((dom[1] - dom[0]) / binw) * binw;
	        return histogram()
	            .domain([dom[0], lst])
	            .thresholds(range_1(dom[0], lst + binw * 0.4, binw))(validValues);
	    }
	    return bins;
	}
	function niceDomain({ validValues }) {
	    return linear().domain(extent(validValues)).nice().domain();
	}
	function xScaleBand({ bins, innerWidth }) {
	    return xScaleBand_
	        .domain(bins.map(d => d.x0))
	        .paddingInner(0.1)
	        .rangeRound([0, innerWidth])
	        .align(0);
	}
	function xScale({ niceDomain, bins, xScaleBand }) {
	    return xScale_.domain(niceDomain).rangeRound([0, xScaleBand.step() * bins.length]);
	}
	function yScale({ innerHeight, bins }) {
	    return yScale_
	        .domain([
	            0,
	            max$1(bins, function (d) {
	                return d.length;
	            })
	        ])
	        .range([innerHeight, 0]);
	}
	function barWidth({ bins, xScale }) {
	    return xScale(bins[0].x1) - xScale(bins[0].x0) - 1;
	}
	function innerWidth({ width, padding }) {
	    return width - padding.left - padding.right;
	}
	function innerHeight({ height, padding }) {
	    return height - padding.bottom - padding.top;
	}
	function data$4() {
	    return {
	        format: d => d,
	        t: 0,
	        padding: { top: 10, right: 65, bottom: 20, left: 5 },
	        height: 200,
	        width: 500,
	        values: [],
	        highlight: false
	    };
	}
	function tooltip(bin, i, bins, len) {
	    const tt =
	        i === 0
	            ? __$1('describe / histogram / tooltip / first')
	            : i === bins.length - 1
	            ? __$1('describe / histogram / tooltip / last')
	            : __$1('describe / histogram / tooltip');
	    return tt
	        .replace('$1', bin.length)
	        .replace('$2', pct(bin.length / len))
	        .replace('$3', toFixed(bin.x0))
	        .replace('$4', toFixed(bin.x1));
	}
	var methods$3 = {
	    show(value) {
	        this.set({ highlight: value });
	    },
	    resize: function () {
	        var bcr = this.refs.svg.getBoundingClientRect();

	        this.set({
	            width: bcr.right - bcr.left,
	            height: bcr.bottom - bcr.top
	        });
	    }
	};

	function oncreate$2() {
	    this.resize();
	}
	const file$3 = "describe/Histogram.html";

	function mouseenter_handler(event) {
		const { component, ctx } = this._svelte;

		component.show(ctx.s);
	}

	function mouseleave_handler(event) {
		const { component } = this._svelte;

		component.show(false);
	}

	function get_each2_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.s = list[i];
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.bin = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tick = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var h3, text0_value = __$1('describe / histogram'), text0, text1, svg, g2, g0, each0_anchor, g0_transform_value, g1, g2_transform_value, text2, ul, text3, text4, p, raw_value = __$1("describe / histogram / learn-more");

		var each0_value = ctx.ticks;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_2(component, get_each0_context(ctx, each0_value, i));
		}

		var if_block0 = (ctx.highlight) && create_if_block_1$1(component, ctx);

		var each1_value = ctx.bins;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_1(component, get_each1_context(ctx, each1_value, i));
		}

		var each2_value = ctx.stats;

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block$1(component, get_each2_context(ctx, each2_value, i));
		}

		var if_block1 = (ctx.NAs>0) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n");
				svg = createSvgElement("svg");
				g2 = createSvgElement("g");
				g0 = createSvgElement("g");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				each0_anchor = createComment();
				if (if_block0) if_block0.c();
				g1 = createSvgElement("g");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text2 = createText("\n");
				ul = createElement("ul");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				text3 = createText(" ");
				if (if_block1) if_block1.c();
				text4 = createText("\n");
				p = createElement("p");
				h3.className = "svelte-p5ucpx";
				addLoc(h3, file$3, 0, 0, 0);
				setAttribute(g0, "class", "axis x-axis svelte-p5ucpx");
				setAttribute(g0, "transform", g0_transform_value = "translate(0, " + ctx.innerHeight + ")");
				addLoc(g0, file$3, 4, 8, 140);
				setAttribute(g1, "class", "bars svelte-p5ucpx");
				addLoc(g1, file$3, 27, 8, 1085);
				setAttribute(g2, "transform", g2_transform_value = "translate(" + ([ctx.padding.left,ctx.padding.top]) + ")");
				addLoc(g2, file$3, 3, 4, 76);
				setAttribute(svg, "class", "svelte-p5ucpx");
				addLoc(svg, file$3, 1, 0, 38);
				ul.className = "svelte-p5ucpx";
				addLoc(ul, file$3, 40, 0, 1560);
				p.className = "learn-more";
				addLoc(p, file$3, 50, 0, 1862);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, svg, anchor);
				append(svg, g2);
				append(g2, g0);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(g0, null);
				}

				append(g0, each0_anchor);
				if (if_block0) if_block0.m(g0, null);
				append(g2, g1);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(g1, null);
				}

				component.refs.svg = svg;
				insert(target, text2, anchor);
				insert(target, ul, anchor);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(ul, null);
				}

				append(ul, text3);
				if (if_block1) if_block1.m(ul, null);
				insert(target, text4, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if (changed.xScale || changed.ticks) {
					each0_value = ctx.ticks;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_2(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(g0, each0_anchor);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (ctx.highlight) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$1(component, ctx);
						if_block0.c();
						if_block0.m(g0, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((changed.innerHeight) && g0_transform_value !== (g0_transform_value = "translate(0, " + ctx.innerHeight + ")")) {
					setAttribute(g0, "transform", g0_transform_value);
				}

				if (changed.xScaleBand || changed.bins || changed.yScale || changed.innerHeight || changed.validValues) {
					each1_value = ctx.bins;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_1(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(g1, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if ((changed.padding) && g2_transform_value !== (g2_transform_value = "translate(" + ([ctx.padding.left,ctx.padding.top]) + ")")) {
					setAttribute(g2, "transform", g2_transform_value);
				}

				if (changed.stats) {
					each2_value = ctx.stats;

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block$1(component, child_ctx);
							each2_blocks[i].c();
							each2_blocks[i].m(ul, text3);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if (ctx.NAs>0) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$2(component, ctx);
						if_block1.c();
						if_block1.m(ul, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(svg);
				}

				destroyEach(each0_blocks, detach);

				if (if_block0) if_block0.d();

				destroyEach(each1_blocks, detach);

				if (component.refs.svg === svg) component.refs.svg = null;
				if (detach) {
					detachNode(text2);
					detachNode(ul);
				}

				destroyEach(each2_blocks, detach);

				if (if_block1) if_block1.d();
				if (detach) {
					detachNode(text4);
					detachNode(p);
				}
			}
		};
	}

	// (6:12) {#each ticks as tick}
	function create_each_block_2(component, ctx) {
		var g, line, text1, text0_value = ctx.tick.label, text0, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				line = createSvgElement("line");
				text1 = createSvgElement("text");
				text0 = createText(text0_value);
				setAttribute(line, "y2", "3");
				setAttribute(line, "class", "svelte-p5ucpx");
				addLoc(line, file$3, 7, 16, 325);
				setAttribute(text1, "y", "5");
				setAttribute(text1, "class", "svelte-p5ucpx");
				addLoc(text1, file$3, 8, 16, 357);
				setAttribute(g, "class", "tick svelte-p5ucpx");
				setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)");
				addLoc(g, file$3, 6, 12, 250);
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, line);
				append(g, text1);
				append(text1, text0);
			},

			p: function update(changed, ctx) {
				if ((changed.ticks) && text0_value !== (text0_value = ctx.tick.label)) {
					setData(text0, text0_value);
				}

				if ((changed.xScale || changed.ticks) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(g);
				}
			}
		};
	}

	// (11:20) {#if highlight}
	function create_if_block_1$1(component, ctx) {
		var polygon, polygon_transform_value;

		return {
			c: function create() {
				polygon = createSvgElement("polygon");
				setAttribute(polygon, "transform", polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)");
				setAttribute(polygon, "points", "0,0,4,6,-4,6");
				addLoc(polygon, file$3, 11, 12, 454);
			},

			m: function mount(target, anchor) {
				insert(target, polygon, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.xScale || changed.highlight) && polygon_transform_value !== (polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)")) {
					setAttribute(polygon, "transform", polygon_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(polygon);
				}
			}
		};
	}

	// (29:12) {#each bins as bin, i}
	function create_each_block_1(component, ctx) {
		var g, title, text_value = tooltip(ctx.bin,ctx.i,ctx.bins,ctx.validValues.length), text, rect, rect_width_value, rect_height_value, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				title = createSvgElement("title");
				text = createText(text_value);
				rect = createSvgElement("rect");
				addLoc(title, file$3, 30, 16, 1246);
				setAttribute(rect, "width", rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20);
				setAttribute(rect, "height", rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length));
				setAttribute(rect, "class", "svelte-p5ucpx");
				addLoc(rect, file$3, 31, 16, 1318);
				setAttribute(g, "class", "bar");
				setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")");
				addLoc(g, file$3, 29, 12, 1149);
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, title);
				append(title, text);
				append(g, rect);
			},

			p: function update(changed, ctx) {
				if ((changed.bins || changed.validValues) && text_value !== (text_value = tooltip(ctx.bin,ctx.i,ctx.bins,ctx.validValues.length))) {
					setData(text, text_value);
				}

				if ((changed.bins || changed.xScaleBand) && rect_width_value !== (rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20)) {
					setAttribute(rect, "width", rect_width_value);
				}

				if ((changed.innerHeight || changed.yScale || changed.bins) && rect_height_value !== (rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length))) {
					setAttribute(rect, "height", rect_height_value);
				}

				if ((changed.xScaleBand || changed.bins || changed.yScale) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(g);
				}
			}
		};
	}

	// (42:4) {#each stats as s}
	function create_each_block$1(component, ctx) {
		var li, text0_value = ctx.s.name, text0, text1, tt, text2_value = ctx.s.label, text2;

		return {
			c: function create() {
				li = createElement("li");
				text0 = createText(text0_value);
				text1 = createText(": ");
				tt = createElement("tt");
				text2 = createText(text2_value);
				tt._svelte = { component, ctx };

				addListener(tt, "mouseleave", mouseleave_handler);
				addListener(tt, "mouseenter", mouseenter_handler);
				tt.className = "svelte-p5ucpx";
				addLoc(tt, file$3, 42, 18, 1606);
				li.className = "svelte-p5ucpx";
				addLoc(li, file$3, 42, 4, 1592);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text0);
				append(li, text1);
				append(li, tt);
				append(tt, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.stats) && text0_value !== (text0_value = ctx.s.name)) {
					setData(text0, text0_value);
				}

				if ((changed.stats) && text2_value !== (text2_value = ctx.s.label)) {
					setData(text2, text2_value);
				}

				tt._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(tt, "mouseleave", mouseleave_handler);
				removeListener(tt, "mouseenter", mouseenter_handler);
			}
		};
	}

	// (44:12) {#if NAs>0}
	function create_if_block$2(component, ctx) {
		var li, text0_value = __$1('describe / histogram / invalid'), text0, text1, tt, text2, text3, text4_value = pct(ctx.NAs/ctx.values.length), text4, text5;

		return {
			c: function create() {
				li = createElement("li");
				text0 = createText(text0_value);
				text1 = createText(":\n        ");
				tt = createElement("tt");
				text2 = createText(ctx.NAs);
				text3 = createText(" (");
				text4 = createText(text4_value);
				text5 = createText(")");
				setStyle(tt, "color", "#c71e1d");
				tt.className = "svelte-p5ucpx";
				addLoc(tt, file$3, 46, 8, 1771);
				li.className = "svelte-p5ucpx";
				addLoc(li, file$3, 44, 4, 1710);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text0);
				append(li, text1);
				append(li, tt);
				append(tt, text2);
				append(li, text3);
				append(li, text4);
				append(li, text5);
			},

			p: function update(changed, ctx) {
				if (changed.NAs) {
					setData(text2, ctx.NAs);
				}

				if ((changed.NAs || changed.values) && text4_value !== (text4_value = pct(ctx.NAs/ctx.values.length))) {
					setData(text4, text4_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	function Histogram(options) {
		this._debugName = '<Histogram>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$4(), options.data);

		this._recompute({ values: 1, validValues: 1, format: 1, niceDomain: 1, width: 1, padding: 1, bins: 1, innerWidth: 1, xScaleBand: 1, xScale: 1, height: 1, innerHeight: 1 }, this._state);
		if (!('values' in this._state)) console.warn("<Histogram> was created without expected data property 'values'");

		if (!('format' in this._state)) console.warn("<Histogram> was created without expected data property 'format'");






		if (!('width' in this._state)) console.warn("<Histogram> was created without expected data property 'width'");
		if (!('padding' in this._state)) console.warn("<Histogram> was created without expected data property 'padding'");
		if (!('height' in this._state)) console.warn("<Histogram> was created without expected data property 'height'");

		if (!('highlight' in this._state)) console.warn("<Histogram> was created without expected data property 'highlight'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$2.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Histogram.prototype, protoDev);
	assign(Histogram.prototype, methods$3);

	Histogram.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('NAs' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'NAs'");
		if ('validValues' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'validValues'");
		if ('stats' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'stats'");
		if ('niceDomain' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'niceDomain'");
		if ('bins' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'bins'");
		if ('innerWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerWidth'");
		if ('xScaleBand' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScaleBand'");
		if ('xScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScale'");
		if ('ticks' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'ticks'");
		if ('innerHeight' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerHeight'");
		if ('yScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'yScale'");
		if ('barWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'barWidth'");
	};

	Histogram.prototype._recompute = function _recompute(changed, state) {
		if (changed.values) {
			if (this._differs(state.NAs, (state.NAs = NAs(state)))) changed.NAs = true;
			if (this._differs(state.validValues, (state.validValues = validValues(state)))) changed.validValues = true;
		}

		if (changed.validValues || changed.format) {
			if (this._differs(state.stats, (state.stats = stats(state)))) changed.stats = true;
		}

		if (changed.validValues) {
			if (this._differs(state.niceDomain, (state.niceDomain = niceDomain(state)))) changed.niceDomain = true;
		}

		if (changed.niceDomain || changed.validValues) {
			if (this._differs(state.bins, (state.bins = bins(state)))) changed.bins = true;
		}

		if (changed.width || changed.padding) {
			if (this._differs(state.innerWidth, (state.innerWidth = innerWidth(state)))) changed.innerWidth = true;
		}

		if (changed.bins || changed.innerWidth) {
			if (this._differs(state.xScaleBand, (state.xScaleBand = xScaleBand(state)))) changed.xScaleBand = true;
		}

		if (changed.niceDomain || changed.bins || changed.xScaleBand) {
			if (this._differs(state.xScale, (state.xScale = xScale(state)))) changed.xScale = true;
		}

		if (changed.xScale || changed.format) {
			if (this._differs(state.ticks, (state.ticks = ticks(state)))) changed.ticks = true;
		}

		if (changed.height || changed.padding) {
			if (this._differs(state.innerHeight, (state.innerHeight = innerHeight(state)))) changed.innerHeight = true;
		}

		if (changed.innerHeight || changed.bins) {
			if (this._differs(state.yScale, (state.yScale = yScale(state)))) changed.yScale = true;
		}

		if (changed.bins || changed.xScale) {
			if (this._differs(state.barWidth, (state.barWidth = barWidth(state)))) changed.barWidth = true;
		}
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
	function identity$1(value) {
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
	  if (value == null) return identity$1;
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
	  if (isArrayLike(obj)) return map(obj, identity$1);
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
		get: get$1,
		has: has,
		mapObject: mapObject,
		identity: identity$1,
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

	/**
	 * Creates a date formatter based on a dw date column object
	 *
	 * @exports dateColumnFormatter
	 * @kind function
	 *
	 * @description
	 * This function returns a date formatting function based on a
	 * dw column object. The implementation is backwards-compatible with
	 * our old Globalize-based date formatting, but uses dayjs under the
	 * hood.
	 *
	 * @param {object} column - the date column object
	 * @returns {function}
	 */

	function dateColumnFormatter(column, { normalizeDatesToEn = true } = {}) {
	    const format = column.format();
	    if (!format) return identity$1;

	    /*
	     * When using dayjs to format, for chart rendering we need to normalize to 'en'
	     * to ensure consistency, as render context may have, or
	     * may at any point alter the locale of the dayjs instance (and formatted dates get used as keys in metadata, so they should be constant)
	     */
	    const formatDate = (d, fmt) => {
	        if (!normalizeDatesToEn) return dayjs__default['default'](d).format(fmt);

	        const initialLocale = dayjs__default['default'].locale();
	        dayjs__default['default'].locale('en');
	        const formatted = dayjs__default['default'](d).format(fmt);
	        dayjs__default['default'].locale(initialLocale);
	        return formatted;
	    };

	    switch (column.precision()) {
	        case 'year':
	            return function (d) {
	                return !isDate(d) ? d : d.getFullYear();
	            };
	        case 'half':
	            return function (d) {
	                return !isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
	            };
	        case 'quarter':
	            return function (d) {
	                return !isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
	            };
	        case 'month':
	            return function (d) {
	                return !isDate(d) ? d : formatDate(d, 'MMM YY');
	            };
	        case 'week':
	            return function (d) {
	                return !isDate(d) ? d : dateToIsoWeek(d).slice(0, 2).join(' W');
	            };
	        case 'day':
	            return function (d, verbose) {
	                return !isDate(d) ? d : formatDate(d, verbose ? 'dddd, MMMM DD, YYYY' : 'l');
	            };
	        case 'day-minutes':
	            return function (d, verbose) {
	                return !isDate(d)
	                    ? d
	                    : formatDate(d, 'MMM DD' + (verbose ? ', YYYY' : '')).replace(/ /g, '&nbsp;') +
	                          ' - ' +
	                          formatDate(d, 'LT').replace(' ', '&nbsp;');
	            };
	        case 'day-seconds':
	            return function (d, verbose) {
	                return !isDate(d)
	                    ? d
	                    : (verbose
	                          ? formatDate(d, 'MMM DD, YYYY').replace(/ /g, '&nbsp;') + ' - '
	                          : '') + formatDate(d, 'LTS').replace(' ', '&nbsp;');
	            };
	    }
	}

	function dateToIsoWeek(date) {
	    const d = date.getUTCDay();
	    const t = new Date(date.valueOf());
	    t.setDate(t.getDate() - ((d + 6) % 7) + 3);
	    const isoYear = t.getUTCFullYear();
	    const w = Math.floor((t.getTime() - new Date(isoYear, 0, 1, -6)) / 864e5);
	    return [isoYear, 1 + Math.floor(w / 7), d > 0 ? d : 7];
	}

	/**
	 * special number formatting that can deal with microtypography
	 * and "prepend currencies" (e.g., −$1234.57)
	 *
	 * @exports formatNumber
	 * @kind function
	 *
	 * @param {object} numeral - Numeral.js instance
	 * @param {number} value - the number to format
	 * @param {object} options - options, see below
	 * @param {string} options.format - numeral.js compatible number format
	 * @param {string} options.prepend - string to prepend to number
	 * @param {string} options.append - string to append to number
	 * @param {string} options.minusChar - custom character to use for minus
	 * @param {number} options.multiply - multiply number before applying format
	 *
	 * @example
	 * // returns '1234.57'
	 * formatNumber(numeral, 1234.567)
	 *
	 * @example
	 * // returns '−$1234.57'
	 * formatNumber(numeral, -1234.567, { prepend: '$' })
	 *
	 * @export
	 * @returns {string} - the formatted number
	 */
	function formatNumber(numeral, value, options) {
	    options = {
	        format: '0.[00]',
	        prepend: '',
	        append: '',
	        minusChar: '−',
	        plusMinusChar: '±',
	        multiply: 1,
	        ...options
	    };
	    if (value === undefined || isNaN(value) || value === '' || value === null) {
	        return '';
	    }
	    const { append, prepend, minusChar, plusMinusChar, multiply } = options;
	    let { format } = options;
	    if (format.includes('%') && Number.isFinite(value)) {
	        // numeraljs will multiply percentages with 100
	        // which we don't want to happen
	        value *= 0.01;
	    }
	    value *= multiply;
	    const parenthesesFormat = format.indexOf('(') > -1;
	    const specialThousandsFormat = format.indexOf(';') > -1;

	    format = format.replace(/;/g, ',');
	    let fmt = numeral(parenthesesFormat ? value : Math.abs(value)).format(format);

	    if (specialThousandsFormat) {
	        const locale = numeral.options.currentLocale;
	        const separator = numeral.locales[locale].delimiters.thousands;
	        const val = format.includes('%') ? value / 0.01 : value;
	        fmt = Math.abs(val) < 10000 ? fmt.replace(separator, '') : fmt;
	    }

	    if (
	        prepend &&
	        !parenthesesFormat &&
	        value < 0 &&
	        currencies.has(prepend.trim().toLowerCase())
	    ) {
	        // pull minus sign to front
	        return `${minusChar}${prepend}${fmt.replace('+', '')}${append}`;
	    } else if (
	        prepend &&
	        value >= 0 &&
	        currencies.has(prepend.trim().toLowerCase()) &&
	        format.includes('+')
	    ) {
	        // pull plus sign to front
	        return `${value === 0 ? plusMinusChar : '+'}${prepend}${fmt.replace('+', '')}${append}`;
	    } else if (value === 0 && format.includes('+')) {
	        return `${prepend}${fmt.replace('+', plusMinusChar)}${append}`;
	    }
	    if (value < 0 && !parenthesesFormat) {
	        return `${prepend}${minusChar}${fmt.replace('+', '')}${append}`;
	    }
	    return `${prepend}${fmt}${append}`;
	}

	/*
	 * list of currency signs that sometimes preceed the value
	 * @todo: extend this list if users requesting it :)
	 */
	const currencies = new Set([
	    '฿',
	    '₿',
	    '¢',
	    '$',
	    '€',
	    'eur',
	    '£',
	    'gbp',
	    '¥',
	    'yen',
	    'usd',
	    'cad',
	    'us$',
	    'ca$',
	    'can$'
	]);

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
	 * Creates a number formatter based on a number column configuration
	 *
	 * @exports numberColumnFormatter
	 * @kind function
	 *
	 * @description
	 * This function returns a number formatting function based on a
	 * column configuration object stored in metadata.data.column-format.
	 * The implementation is backwards-compatible with our old
	 * Globalize-based number formatting, but uses numeral under the hood.
	 *
	 * @param {object} numeral - Numeral.js instance
	 * @param {object} config - the column configuration from metadata
	 * @returns {function}
	 */

	function numberColumnFormatter(numeral, config) {
	    const format = config['number-format'] || '-';
	    const div = Number(config['number-divisor'] || 0);
	    const append = (config['number-append'] || '').replace(/ /g, '\u00A0');
	    const prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');

	    return function (val, full, round) {
	        if (isNaN(val)) return val;
	        var _fmt = format;
	        var digits = 0;
	        if (div !== 0 && _fmt === '-') digits = 1;
	        if (_fmt.substr(0, 1) === 's') {
	            // significant figures
	            digits = Math.max(0, signDigitsDecimalPlaces(val, +_fmt.substr(1)));
	        }
	        if (round) digits = 0;
	        if (_fmt === '-') {
	            // guess number format based on single number
	            digits = equalish(val, Math.round(val))
	                ? 0
	                : equalish(val, Math.round(val * 10) * 0.1)
	                ? 1
	                : equalish(val, Math.round(val * 100) * 0.01)
	                ? 2
	                : equalish(val, Math.round(val * 1000) * 0.001)
	                ? 3
	                : equalish(val, Math.round(val * 10000) * 0.0001)
	                ? 4
	                : equalish(val, Math.round(val * 100000) * 0.00001)
	                ? 5
	                : 6;
	        }

	        if (_fmt[0] === 'n') {
	            digits = Number(_fmt.substr(1, _fmt.length));
	        }

	        let numeralFormat = '0,0';
	        for (var i = 0; i < digits; i++) {
	            if (i === 0) numeralFormat += '.';
	            numeralFormat += '0';
	        }

	        return formatNumber(numeral, val, {
	            format: numeralFormat,
	            prepend: full ? prepend : '',
	            append: full ? append : '',
	            multiply: Math.pow(10, div * -1)
	        });
	    };
	}

	function signDigitsDecimalPlaces(num, sig) {
	    if (num === 0) return 0;
	    return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
	}

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

	const identity = d => d;

	/**
	 * Creates a column formatter
	 *
	 * @exports columnFormatter
	 * @kind function
	 *
	 * @description
	 * This function returns a formatting function based, given a column object,
	 * a metadata object and the axis column name.
	 *
	 * @param {object} numeral - Numeral.js instance
	 * @param {object} column - the date column object
	 * @param {object} metadata - the full metadata object
	 * @param {string} axis - the column name of the axis
	 * @returns {function}
	 */
	function columnFormatter(numeral, column, metadata, axis, options = {}) {
	    return column.type() === 'date'
	        ? dateColumnFormatter(column.type(true), options)
	        : column.type() === 'number'
	        ? numberColumnFormatter(numeral, get(metadata, `data.column-format.${axis}`, {}))
	        : identity;
	}

	function dataCellChanged(col, row, { changes = [], transpose }) {
	    const r = transpose ? 'column' : 'row';
	    const c = transpose ? 'row' : 'column';
	    return !!changes.find(change => col === change[c] && row === change[r]);
	}

	/**
	 * getCellRenderer defines what classes are set on each HOT cell
	 */
	function getCellRenderer (app, chart, dataset, Handsontable) {
	    const { numeral } = app.get();
	    const colTypeIcons = {
	        date: 'fa fa-clock-o'
	    };
	    function HtmlCellRender(instance, TD, row, col, prop, value) {
	        var escaped = purifyHTML(Handsontable.helper.stringify(value));
	        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
	    }
	    return function (instance, td, row, col, prop, value, cellProperties) {
	        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
	        const column = dataset.column(col);
	        const { searchResults, currentResult, activeColumn } = app.get();
	        const colFormat = app.getColumnFormat(column.name());
	        row = instance.toPhysicalRow(row);
	        if (row > 0) {
	            const formatter = columnFormatter(
	                numeral,
	                column,
	                chart.get().metadata,
	                column.name(),
	                {
	                    normalizeDatesToEn: false
	                }
	            );
	            value =
	                column.val(row - 1) === null || column.val(row - 1) === ''
	                    ? '–'
	                    : formatter(column.val(row - 1), true);
	        }
	        if (parseInt(value) < 0) {
	            // if row contains negative number
	            td.classList.add('negative');
	        }
	        td.classList.add(column.type() + 'Type');
	        td.dataset.column = col;

	        if (column.type() === 'text' && value && value.length > 70) {
	            value = value.substr(0, 60) + '…';
	        }

	        if (row === 0) {
	            td.classList.add('firstRow');
	            if (colTypeIcons[column.type()]) {
	                value = '<i class="' + colTypeIcons[column.type()] + '"></i> ' + value;
	            }
	        } else {
	            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
	        }
	        if (colFormat.ignore) {
	            td.classList.add('ignored');
	        }
	        if (activeColumn && activeColumn.name() === column.name()) {
	            td.classList.add('active');
	        }
	        const rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row);
	        searchResults.forEach(res => {
	            if (res.row === rowPosition && res.col === col) {
	                td.classList.add('htSearchResult');
	            }
	        });
	        if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
	            td.classList.add('htCurrentSearchResult');
	        }
	        if (
	            row > 0 &&
	            !column.type(true).isValid(column.val(row - 1)) &&
	            column.val(row - 1) !== null &&
	            column.val(row - 1) !== ''
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (row > 0 && (column.val(row - 1) === null || column.val(row - 1) === '')) {
	            td.classList.add('noData');
	        }
	        if (
	            column.isComputed &&
	            column.errors.length &&
	            column.errors.find(err => err.row === 'all' || err.row === row - 1)
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (cellProperties.readOnly) td.classList.add('readOnly');

	        const dataOptions = chart.getMetadata('data');
	        const columnInOrder = dataset.columnOrder()[col];
	        if (dataCellChanged(columnInOrder, row, dataOptions)) {
	            td.classList.add('changed');
	        }

	        HtmlCellRender(instance, td, row, col, prop, value);
	    };
	}

	/* describe/hot/Handsontable.html generated by Svelte v2.16.1 */



	let app = null;
	let searchTimer = null;

	function currentResult({ searchResults, searchIndex }) {
	    if (!searchResults || !searchResults.length) return null;
	    const l = searchResults.length;
	    if (searchIndex < 0 || searchIndex >= l) {
	        while (searchIndex < 0) searchIndex += l;
	        if (searchIndex > l) searchIndex %= l;
	    }
	    return searchResults[searchIndex];
	}
	function data$3() {
	    return {
	        hot: null,
	        data: '',
	        readonly: false,
	        numeral: null,
	        skipRows: 0,
	        firstRowIsHeader: true,
	        fixedColumnsLeft: 0,
	        searchIndex: 0,
	        sortBy: '-',
	        transpose: false,
	        activeColumn: null,
	        search: '',
	        searchResults: []
	    };
	}
	var methods$2 = {
	    render() {
	        const { hot } = this.get();
	        hot.render();
	    },
	    doSearch() {
	        const { hot, search } = this.get();
	        clearTimeout(searchTimer);
	        searchTimer = setTimeout(() => {
	            if (!hot || !search) {
	                this.set({ searchResults: [] });
	            } else {
	                const searchPlugin = hot.getPlugin('search');
	                const searchResults = searchPlugin.query(search);
	                this.set({ searchResults });
	            }
	        }, 300);
	    },
	    update() {
	        const { data, hot, tableDataset } = this.get();

	        if (!data) return;

	        // get chart
	        const { dw_chart: dwChart } = this.store.get();

	        this.set({ columnOrder: tableDataset.columnOrder() });

	        // construct HoT data array
	        const hotData = [[]];
	        tableDataset.eachColumn(c => hotData[0].push(c.title()));

	        tableDataset.eachRow(r => {
	            const row = [];
	            tableDataset.eachColumn(col => row.push(col.raw(r)));
	            hotData.push(row);
	        });

	        // pass data to hot
	        hot.loadData(hotData);

	        const cellRenderer = getCellRenderer(this, dwChart, tableDataset, HOT__default['default']);

	        hot.updateSettings({
	            cells: (row, col) => {
	                const { readonly } = this.get();
	                return {
	                    readOnly:
	                        readonly ||
	                        (tableDataset.hasColumn(col) &&
	                            tableDataset.column(col).isComputed &&
	                            row === 0),
	                    renderer: cellRenderer
	                };
	            },
	            manualColumnMove: []
	        });

	        this.set({
	            hasChanges: clone$2(dwChart.get('metadata.data.changes', [])).length > 0
	        });

	        HOT__default['default'].hooks.once('afterRender', () => this.initCustomEvents());
	        HOT__default['default'].hooks.once('afterRender', () => this.fire('afterRender'));
	        hot.render();
	    },
	    dataChanged(cells) {
	        const { hot, tableDataset } = this.get();
	        const chart = this.store.get().dw_chart;
	        cells.forEach(([row, col, oldValue, newValue]) => {
	            if (oldValue !== newValue) {
	                const { transpose } = this.get();
	                const changes = clone$2(chart.get('metadata.data.changes', []));
	                row = hot.toPhysicalRow(row);
	                col = tableDataset.columnOrder()[col];
	                if (transpose) {
	                    // swap row and col
	                    const tmp = row;
	                    row = col;
	                    col = tmp;
	                }
	                // store new change
	                changes.push({
	                    column: col,
	                    row,
	                    value: newValue,
	                    previous: oldValue,
	                    time: new Date().getTime()
	                });
	                chart.set('metadata.data.changes', changes);
	            }
	        });
	    },
	    columnMoved(srcColumns, tgtIndex) {
	        const { hot } = this.get();
	        if (!srcColumns.length) return;
	        const { columnOrder } = this.get();
	        const newOrder = columnOrder.slice(0);
	        const after = columnOrder[tgtIndex];
	        const elements = newOrder.splice(srcColumns[0], srcColumns.length);
	        const insertAt =
	            after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
	        newOrder.splice(insertAt, 0, ...elements);
	        this.store.get().dw_chart.set('metadata.data.column-order', newOrder.slice(0));
	        this.set({ columnOrder: newOrder });
	        // update selection
	        HOT__default['default'].hooks.once('afterRender', () => {
	            setTimeout(() => {
	                this.fire('resetSort');
	                hot.selectCell(
	                    0,
	                    -1,
	                    insertAt,
	                    hot.countRows() - 1,
	                    insertAt + elements.length - 1
	                );
	            }, 10);
	        });
	    },
	    updateHeight() {
	        const h = this.refs.hot
	            .querySelector('.ht_master.handsontable .wtHolder .wtHider')
	            .getBoundingClientRect().height;
	        this.refs.hot.style.height = Math.min(500, h + 10) + 'px';
	    },
	    updateColumnSelection() {
	        const { activeColumn, multiSelection, hot } = this.get();
	        const newSelection = this.getSelectedColumns();

	        // toggle selection of single column
	        if (newSelection.length === 1) {
	            const [newActive] = newSelection;
	            if (activeColumn && activeColumn.name() === newActive.name()) {
	                app.set({ activeColumn: null, multiSelection: false });
	                hot.deselectCell();
	            } else {
	                app.set({ activeColumn: newActive, multiSelection: false });
	            }
	            return;
	        }

	        // toggle selection of multiple columns
	        if (newSelection.length > 1) {
	            if (multiSelection) {
	                app.set({ activeColumn: null, multiSelection: false });
	                hot.deselectCell();
	            } else {
	                app.set({ activeColumn: null, multiSelection: newSelection });
	            }
	            return;
	        }

	        // no columns selected
	        app.set({ activeColumn: null, multiSelection: false });
	    },
	    getSelectedColumns() {
	        const { tableDataset, hot } = this.get();
	        const [[r1, c1, r2, c2]] = hot.getSelected();
	        const sel = [];
	        if (Math.abs(r1 - r2) === tableDataset.numRows()) {
	            for (let i = Math.min(c1, c2); i <= Math.max(c1, c2); i++) {
	                sel.push(tableDataset.column(i));
	            }
	        }
	        return sel;
	    },
	    initCustomEvents() {
	        // wait a bit to make sure HoT is rendered
	        setTimeout(() => {
	            // catch click events on 'transpose' cell
	            this.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(th => {
	                th.removeEventListener('click', topLeftCornerClick);
	                th.addEventListener('click', topLeftCornerClick);
	            });
	        }, 500);
	    },

	    getColumnFormat(name) {
	        const { dw_chart: dwChart } = this.store.get();
	        const colFormats = dwChart.get('metadata.data.column-format', {});
	        return colFormats[name] || { type: 'auto', ignore: false };
	    }
	};

	function oncreate$1() {
	    app = this;
	    HOT__default['default'].hooks.once('afterRender', () => this.initCustomEvents());

	    this.refs.hot.getRootNode().addEventListener('keyup', evt => {
	        const { activeColumn, tableDataset } = this.get();
	        if (!activeColumn) return;

	        if (
	            evt.target.tagName.toLowerCase() === 'input' ||
	            evt.target.tagName.toLowerCase() === 'textarea'
	        )
	            return;

	        if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
	            evt.preventDefault();
	            evt.stopPropagation();
	            const currentIndex = tableDataset.indexOf(activeColumn.name());
	            if (evt.key === 'ArrowRight') {
	                // select next column
	                this.set({
	                    activeColumn: tableDataset.column(
	                        (currentIndex + 1) % tableDataset.numColumns()
	                    )
	                });
	            } else {
	                // select prev column
	                this.set({
	                    activeColumn: tableDataset.column(
	                        (currentIndex - 1 + tableDataset.numColumns()) %
	                            tableDataset.numColumns()
	                    )
	                });
	            }
	        }
	    });

	    const { dw_chart: dwChart } = this.store.get();
	    const hot = new HOT__default['default'](this.refs.hot, {
	        data: [],
	        rowHeaders: i => {
	            const ti = HOT__default['default'].hooks.run(hot, 'modifyRow', i);
	            return ti + 1;
	        },
	        colHeaders: true,
	        fixedRowsTop: 1,
	        fixedColumnsLeft: this.get().fixedColumnsLeft,
	        filters: true,
	        startRows: 13,
	        startCols: 8,
	        fillHandle: false,
	        stretchH: 'all',
	        height: 500,
	        manualColumnMove: true,
	        selectionMode: 'range',
	        autoColumnSize: { useHeaders: true, syncLimit: 5 },
	        activeHeaderClassName: 'selected',

	        // // sorting
	        sortIndicator: true,
	        columnSorting: true,
	        sortFunction: function (sortOrder, columnMeta) {
	            if (columnMeta.col > -1) {
	                const column = dwChart.dataset().column(columnMeta.col);
	                const colType = column.type();
	                return (a, b) => {
	                    if (a[0] === 0) return -1;
	                    // replace with values
	                    a[1] = column.val(a[0] - 1);
	                    b[1] = column.val(b[0] - 1);
	                    if (colType === 'number') {
	                        // sort NaNs at bottom
	                        if (isNaN(a[1]))
	                            a[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                        if (isNaN(b[1]))
	                            b[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                    }
	                    if (colType === 'date') {
	                        if (typeof a[1] === 'string') a[1] = new Date(110, 0, 1);
	                        if (typeof b[1] === 'string') b[1] = new Date(110, 0, 1);
	                    }
	                    return (
	                        (sortOrder === 'desc' ? -1 : 1) *
	                        (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)
	                    );
	                };
	            }
	            return (a, b) => a[0] - b[0];
	        },
	        afterGetColHeader: (col, th) => {
	            const { tableDataset, activeColumn, multiSelection } = this.get();
	            if (!tableDataset || !tableDataset.hasColumn(col)) return;

	            const columnName = tableDataset.column(col).name();
	            const isSelected = activeColumn && activeColumn.name() === columnName;
	            const isInMultiSelection =
	                multiSelection &&
	                multiSelection.find(column => column.name() === columnName);

	            // apply header styling for selected columns
	            if (isSelected || isInMultiSelection) {
	                th.classList.add('selected');
	            }

	            // apply header styling for hidden columns
	            if (this.getColumnFormat(columnName).ignore) {
	                th.classList.add('ignored');
	            }
	        },
	        // // search
	        search: 'search'
	    });

	    window.HT = hot;
	    this.set({ hot });

	    HOT__default['default'].hooks.add('afterSetDataAtCell', a => this.dataChanged(a));
	    HOT__default['default'].hooks.add('afterColumnMove', (a, b) => this.columnMoved(a, b));
	    HOT__default['default'].hooks.add('afterRender', () => this.updateHeight());
	    HOT__default['default'].hooks.add('beforeOnCellMouseUp', () => this.updateColumnSelection());
	}
	function onstate$1({ changed, current, previous }) {
	    const hot = current.hot;
	    if (!hot) return;

	    if (changed.hot) {
	        this.update();
	    }
	    if (changed.tableDataset) {
	        this.update();
	    }
	    if (changed.search && previous) {
	        this.doSearch();
	        this.set({ searchIndex: 0 });
	    }
	    if (changed.searchResults) {
	        hot.render();
	    }
	    if (changed.currentResult && current.currentResult) {
	        hot.render();
	        const res = current.currentResult;
	        hot.scrollViewportTo(res.row, res.col);
	        setTimeout(() => {
	            // one more time
	            hot.scrollViewportTo(res.row, res.col);
	        }, 100);
	    }
	    if (changed.activeColumn) {
	        setTimeout(() => hot.render(), 10);
	    }
	    if (changed.fixedColumnsLeft) {
	        hot.updateSettings({ fixedColumnsLeft: current.fixedColumnsLeft });
	    }
	    if (changed.sorting) {
	        const chart = this.store.get().dw_chart;
	        hot.getPlugin('columnSorting').sort(
	            chart.dataset().indexOf(current.sorting.sortBy),
	            current.sorting.sortDir ? 'asc' : 'desc'
	        );
	    }
	}
	function topLeftCornerClick(evt) {
	    evt.preventDefault();
	    const { transpose } = app.get();
	    app.set({ transpose: !transpose });
	}

	const file$2 = "describe/hot/Handsontable.html";

	function create_main_fragment$3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.id = "data-preview";
				addLoc(div, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				component.refs.hot = div;
			},

			p: noop$1,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (component.refs.hot === div) component.refs.hot = null;
			}
		};
	}

	function Handsontable(options) {
		this._debugName = '<Handsontable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$3(), options.data);

		this._recompute({ searchResults: 1, searchIndex: 1 }, this._state);
		if (!('searchResults' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchResults'");
		if (!('searchIndex' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchIndex'");
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

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

	assign(Handsontable.prototype, protoDev);
	assign(Handsontable.prototype, methods$2);

	Handsontable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable>: Cannot set read-only property 'currentResult'");
	};

	Handsontable.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchResults || changed.searchIndex) {
			if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) changed.currentResult = true;
		}
	};

	/* node_modules/@datawrapper/controls/DropdownInput.html generated by Svelte v2.16.1 */

	function data$2() {
	    return {
	        visible: false,
	        disabled: false,
	        width: 'auto',
	        uid: ''
	    };
	}
	var methods$1 = {
	    toggle(event) {
	        event.preventDefault();
	        const { visible, disabled } = this.get();
	        if (disabled) return;
	        this.set({ visible: !visible });
	    },
	    windowClick(event) {
	        if (!event.target) return;
	        /*
	         * when the control is inside of a svelte2 wrapper web component,
	         * the event.target is the wrapper, and not what was actually clicked,
	         * so we need to check for this
	         */
	        const isSvelte2Wrapper = event.target.tagName === 'SVELTE2-WRAPPER';
	        if (isSvelte2Wrapper && !event.composedPath().length) return;

	        const targetToCheck = isSvelte2Wrapper ? event.composedPath()[0] : event.target;
	        const buttonRef = this.refs && this.refs.button;

	        if (buttonRef && buttonRef === targetToCheck) return;

	        // this is a hack for the colorpicker, need to find out how to get rid of
	        if (event.target.classList.contains('hex')) return;
	        this.set({ visible: false });
	    }
	};

	const file$1 = "node_modules/datawrapper/controls/DropdownInput.html";

	function create_main_fragment$2(component, ctx) {
		var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text;

		function onwindowclick(event) {
			component.windowClick(event);	}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle(event);
		}

		var if_block = (ctx.visible) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				a = createElement("a");
				if (!slot_content_button) {
					button = createElement("button");
					i = createElement("i");
				}
				text = createText("\n    ");
				if (if_block) if_block.c();
				if (!slot_content_button) {
					i.className = i_class_value = "fa fa-chevron-" + (ctx.visible ? 'up' : 'down') + " svelte-1jdtmzv";
					addLoc(i, file$1, 6, 16, 297);
					button.className = "btn btn-small";
					addLoc(button, file$1, 5, 12, 250);
				}
				addListener(a, "click", click_handler);
				a.href = "#dropdown-btn";
				a.className = "base-drop-btn svelte-1jdtmzv";
				addLoc(a, file$1, 3, 4, 126);
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
				div.dataset.uid = ctx.uid;
				addLoc(div, file$1, 2, 0, 49);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, a);
				if (!slot_content_button) {
					append(a, button);
					append(button, i);
				}

				else {
					append(a, slot_content_button);
				}

				component.refs.button = a;
				append(div, text);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (!slot_content_button) {
					if ((changed.visible) && i_class_value !== (i_class_value = "fa fa-chevron-" + (ctx.visible ? 'up' : 'down') + " svelte-1jdtmzv")) {
						i.className = i_class_value;
				}

				}

				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$1(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("click", onwindowclick);

				if (detach) {
					detachNode(div);
				}

				if (slot_content_button) {
					reinsertChildren(a, slot_content_button);
				}

				removeListener(a, "click", click_handler);
				if (component.refs.button === a) component.refs.button = null;
				if (if_block) if_block.d();
			}
		};
	}

	// (11:4) {#if visible}
	function create_if_block$1(component, ctx) {
		var div1, slot_content_content = component._slotted.content, div0;

		return {
			c: function create() {
				div1 = createElement("div");
				if (!slot_content_content) {
					div0 = createElement("div");
					div0.textContent = "DropdownControl content";
				}
				if (!slot_content_content) {
					div0.className = "base-dropdown-inner svelte-1jdtmzv";
					addLoc(div0, file$1, 13, 12, 536);
				}
				setStyle(div1, "width", ctx.width);
				div1.className = "dropdown-menu base-dropdown-content svelte-1jdtmzv";
				addLoc(div1, file$1, 11, 4, 422);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (!slot_content_content) {
					append(div1, div0);
				}

				else {
					append(div1, slot_content_content);
				}
			},

			p: function update(changed, ctx) {
				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (slot_content_content) {
					reinsertChildren(div1, slot_content_content);
				}
			}
		};
	}

	function DropdownInput(options) {
		this._debugName = '<DropdownInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$2(), options.data);
		if (!('uid' in this._state)) console.warn("<DropdownInput> was created without expected data property 'uid'");
		if (!('visible' in this._state)) console.warn("<DropdownInput> was created without expected data property 'visible'");
		if (!('width' in this._state)) console.warn("<DropdownInput> was created without expected data property 'width'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(DropdownInput.prototype, protoDev);
	assign(DropdownInput.prototype, methods$1);

	DropdownInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/editor/LocaleSelectInput.html generated by Svelte v2.16.1 */

	function options({ $locales }) {
	    return $locales.map(t => {
	        return {
	            value: t.value,
	            label: `${t.label} (${t.value})`
	        };
	    });
	}
	function onstate() {
	    const { language } = this.store.get();

	    // ensure correct formatting is saved (eg "en-US" and not "en_US")
	    if (language) {
	        this.store.set({ language: language.replace('_', '-') });
	    }
	}
	function create_main_fragment$1(component, ctx) {
		var selectinput_updating = {};

		var selectinput_initial_data = {
		 	options: ctx.options,
		 	width: "200px",
		 	labelWidth: "80px"
		 };
		if (ctx.$language !== void 0) {
			selectinput_initial_data.value = ctx.$language;
			selectinput_updating.value = true;
		}
		var selectinput = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!selectinput_updating.value && changed.value) {
					newStoreState.language = childState.value;
				}
				component.store.set(newStoreState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1 }, selectinput.get());
		});

		return {
			c: function create() {
				selectinput._fragment.c();
			},

			m: function mount(target, anchor) {
				selectinput._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.options) selectinput_changes.options = ctx.options;
				if (!selectinput_updating.value && changed.$language) {
					selectinput_changes.value = ctx.$language;
					selectinput_updating.value = ctx.$language !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};
			},

			d: function destroy(detach) {
				selectinput.destroy(detach);
			}
		};
	}

	function LocaleSelectInput(options) {
		this._debugName = '<LocaleSelectInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<LocaleSelectInput> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["locales","language"]), options.data);
		this.store._add(this, ["locales","language"]);

		this._recompute({ $locales: 1 }, this._state);
		if (!('$locales' in this._state)) console.warn("<LocaleSelectInput> was created without expected data property '$locales'");

		if (!('$language' in this._state)) console.warn("<LocaleSelectInput> was created without expected data property '$language'");
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

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

	assign(LocaleSelectInput.prototype, protoDev);

	LocaleSelectInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('options' in newState && !this._updatingReadonlyProperty) throw new Error("<LocaleSelectInput>: Cannot set read-only property 'options'");
	};

	LocaleSelectInput.prototype._recompute = function _recompute(changed, state) {
		if (changed.$locales) {
			if (this._differs(state.options, (state.options = options(state)))) changed.options = true;
		}
	};

	/* describe/App.html generated by Svelte v2.16.1 */



	const syncKeys = {
	    transpose: 'metadata.data.transpose',
	    firstRowIsHeader: 'metadata.data.horizontal-header',
	    $language: 'language'
	};

	function locale({ $language }) {
		return $language;
	}

	function searchIndexSafe({ searchIndex, searchResults }) {
	    if (searchIndex < 0) searchIndex += searchResults.length;
	    searchIndex = searchIndex % searchResults.length;
	    return searchIndex;
	}
	function customColumn({ activeColumn, forceColumnFormat }) {
	    return activeColumn && !forceColumnFormat && activeColumn.isComputed
	        ? activeColumn
	        : false;
	}
	function columnFormat({ activeColumn, forceColumnFormat }) {
	    return activeColumn && (!activeColumn.isComputed || forceColumnFormat)
	        ? activeColumn
	        : false;
	}
	function activeValues({ activeColumn }) {
	    return activeColumn ? activeColumn.values() : [];
	}
	function activeFormat({ activeColumn, $dw_chart: $dwChart, numeral }) {
	    return activeColumn
	        ? columnFormatter(
	              numeral,
	              activeColumn,
	              $dwChart.get().metadata,
	              activeColumn.name()
	          )
	        : d => d;
	}
	function columns({ activeColumn, $tableDataset }) {
	    return $tableDataset ? $tableDataset.columns() : [];
	}
	function normalColumns({ columns }) {
	    return columns.filter(col => !col.isComputed);
	}
	function sorting({ sortBy, sortDir }) {
	    return { sortBy, sortDir };
	}
	function resultsDisplay({ searchResults, searchIndexSafe }) {
	    if (searchResults.length > 0) {
	        return `${searchIndexSafe + 1} ${__$1('describe / search / of')} ${
            searchResults.length
        } ${__$1('describe / search / results')}`;
	    } else {
	        return __$1('describe / search / no-matches');
	    }
	}
	function data$1() {
	    return {
	        locale: 'en-US',
	        search: '',
	        chartData: '',
	        readonly: false,
	        numeral: null,
	        dayjsLocale: null,
	        showLocaleSelect: true,
	        transpose: false,
	        hasChanges: false,
	        firstRowIsHeader: true,
	        fixedColumnsLeft: 0,
	        searchIndex: 0,
	        activeColumn: false,
	        customColumn: false,
	        columnFormat: false,
	        multiSelection: false,
	        forceColumnFormat: false,
	        searchResults: [],
	        sortBy: '-',
	        sortDir: true
	    };
	}
	var methods = {
	    nextResult(diff) {
	        let { searchIndex } = this.get();
	        const { searchResults } = this.get();
	        searchIndex += diff;
	        if (searchIndex < 0) searchIndex += searchResults.length;
	        searchIndex = searchIndex % searchResults.length;
	        this.set({ searchIndex });
	    },
	    keyPress(event) {
	        if (event.key === 'F3' || event.key === 'Enter') {
	            this.nextResult(event.shiftKey ? -1 : 1);
	        }
	    },
	    toggleTranspose() {
	        this.set({ transpose: !this.get().transpose });
	    },
	    revertChanges() {
	        const chart = this.store.get().dw_chart;
	        chart.setMetadata('data.changes', []);
	    },
	    addComputedColumn() {
	        const { dw_chart: dwChart, tableDataset } = this.store.get();
	        const getColumnName = i => `Column ${i}`;

	        // Find new column name
	        let index = 0;
	        while (tableDataset.hasColumn(getColumnName(++index)));
	        const columnName = getColumnName(index);

	        // Update active column
	        const updateActiveColumn = this.store.on('state', ({ current }) => {
	            this.set({
	                activeColumn: current.tableDataset.column(columnName),
	                multiSelection: false
	            });
	            updateActiveColumn.cancel();
	        });

	        // Update computed columns
	        const computed = getComputedColumns(dwChart);
	        computed.push({ name: columnName, formula: '' });
	        dwChart.setMetadata('describe.computed-columns', computed);
	        dwChart.saveSoon();
	    },
	    sort(event, col, ascending) {
	        event.preventDefault();
	        event.stopPropagation();
	        this.set({ sortBy: col, sortDir: ascending });
	    },
	    force(event, val = true) {
	        event.preventDefault();
	        this.set({ forceColumnFormat: val });
	    },
	    hideMultiple(columns, hide) {
	        const chart = this.store.get().dw_chart;
	        const colFmt = clone$2(chart.get('metadata.data.column-format', {}));
	        columns.forEach(col => {
	            if (colFmt[col.name()]) colFmt[col.name()].ignore = hide;
	            else {
	                colFmt[col.name()] = { type: 'auto', ignore: hide };
	            }
	        });
	        chart.setMetadata('data.column-format', colFmt);
	        this.set({ multiSelection: false, activeColumn: null });
	    },
	    afterRender() {
	        // called once the hot is done rendering
	        if (this.refs.ccEd) {
	            this.refs.ccEd.fire('hotRendered');
	        }
	    },
	    navigateTo(stepId) {
	        const { navigateTo } = this.get();
	        navigateTo({ id: stepId });
	    }
	};

	function oncreate() {
	    const { dw_chart: dwChart } = this.store.get();

	    // initialize app data from existing metadata
	    const initialState = Object.entries(syncKeys).reduce(
	        (toSet, [svelteKey, metadataKey]) => {
	            const metadataValue = get(dwChart.get(), metadataKey);
	            if (metadataValue !== null) toSet[svelteKey] = metadataValue;
	            return toSet;
	        },
	        {}
	    );

	    this.set(initialState);

	    if (dwChart.get('metadata.data.changes', []).length > 1) {
	        this.set({ hasChanges: true });
	    }

	    dwChart.onChange((chart, key, value) => {
	        const entry = Object.entries(syncKeys).find(
	            ([, metadataKey]) => metadataKey === key
	        );
	        if (entry) {
	            this.set({ [entry[0]]: value });
	        }
	    });
	    window.addEventListener('keypress', event => {
	        if (event.ctrlKey && event.key === 'f') {
	            // note that some browser may reject to pass on this event
	            event.preventDefault();
	            const activeElement = this.refs.parent.getRootNode().activeElement;
	            if (this.refs.search !== activeElement) {
	                this.refs.search.focus();
	            } else {
	                this.nextResult(+1);
	            }
	        }
	    });
	}
	function onupdate({ changed, current }) {
	    if (changed.activeColumn && !current.activeColumn) {
	        this.set({ forceColumnFormat: false });
	    }
	    if (changed.dayjsLocale && current.dayjsLocale) {
	        dayjs__default['default'].locale(current.dayjsLocale);
	        this.refs.hot.render();
	    }
	    Object.entries(syncKeys).forEach(([svelteKey, metadataKey]) => {
	        if (changed[svelteKey]) {
	            const svelteValue = current[svelteKey];
	            const { dw_chart: dwChart } = this.store.get();
	            if (svelteKey === '$language') {
	                if (!svelteValue) return;
	                dwChart.set('language', svelteValue);
	                dwChart.locale(svelteValue, () => {
	                    this.refs.hot.render();
	                });
	            } else {
	                dwChart.set(metadataKey, svelteValue);
	            }
	        }
	    });

	    // Reset selection when data is transposed:
	    if (changed.transpose) {
	        this.set({
	            activeColumn: null,
	            multiSelection: false
	        });
	    }
	}
	const file = "describe/App.html";

	function click_handler_2(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), true);
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), false);
	}

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), true);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.col = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var div11, div10, div2, div1, text0, hr, text1, div0, a0, i0, text2, text3_value = __$1('Back'), text3, text4, a1, text5_value = __$1('Proceed'), text5, text6, i1, text7, div9, div3, raw0_value = __$1('describe / info-table-header'), raw0_after, text8, img0, text9, div7, div4, button0, raw1_value = __$1('describe / sort-by'), raw1_after, text10, span, text11, ul, li, a2, raw2_value = __$1('describe / no-sorting'), li_class_value, text12, text13, div6, i2, text14, div5, input, input_updating = false, input_class_value, text15, div5_class_value, text16, text17, handsontable_updating = {}, text18, div8, button1, img1, text19, text20_value = __$1(`describe / transpose-long`), text20, text21, button2, i3, text22, text23_value = __$1(`computed columns / add-btn`), text23, text24, text25, button3, i4, text26, text27_value = __$1(`Revert changes`), text27, text28, button3_class_value;

		function select_block_type(ctx) {
			if (ctx.multiSelection) return create_if_block_2;
			if (ctx.activeColumn) return create_if_block_3;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function click_handler(event) {
			event.preventDefault();
			component.navigateTo('upload');
		}

		function click_handler_1(event) {
			event.preventDefault();
			component.navigateTo('visualize');
		}

		function click_handler_2(event) {
			component.sort(event, '-');
		}

		var each_value = ctx.normalColumns;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		var dropdowninput = new DropdownInput({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() }
		});

		function input_input_handler() {
			input_updating = true;
			component.set({ search: input.value });
			input_updating = false;
		}

		function keypress_handler(event) {
			component.keyPress(event);
		}

		var if_block1 = (ctx.searchResults.length > 0) && create_if_block_1(component);

		var if_block2 = (ctx.search) && create_if_block(component, ctx);

		var handsontable_initial_data = {
		 	numeral: ctx.numeral,
		 	tableDataset: ctx.$tableDataset
		 };
		if (ctx.chartData !== void 0) {
			handsontable_initial_data.data = ctx.chartData;
			handsontable_updating.data = true;
		}
		if (ctx.transpose
	                 !== void 0) {
			handsontable_initial_data.transpose = ctx.transpose
	                ;
			handsontable_updating.transpose = true;
		}
		if (ctx.firstRowIsHeader
	                 !== void 0) {
			handsontable_initial_data.firstRowIsHeader = ctx.firstRowIsHeader
	                ;
			handsontable_updating.firstRowIsHeader = true;
		}
		if (ctx.fixedColumnsLeft
	                 !== void 0) {
			handsontable_initial_data.fixedColumnsLeft = ctx.fixedColumnsLeft
	                ;
			handsontable_updating.fixedColumnsLeft = true;
		}
		if (ctx.activeColumn
	                 !== void 0) {
			handsontable_initial_data.activeColumn = ctx.activeColumn
	                ;
			handsontable_updating.activeColumn = true;
		}
		if (ctx.readonly
	                 !== void 0) {
			handsontable_initial_data.readonly = ctx.readonly
	                ;
			handsontable_updating.readonly = true;
		}
		if (ctx.sorting
	                 !== void 0) {
			handsontable_initial_data.sorting = ctx.sorting
	                ;
			handsontable_updating.sorting = true;
		}
		if (ctx.search
	                 !== void 0) {
			handsontable_initial_data.search = ctx.search
	                ;
			handsontable_updating.search = true;
		}
		if (ctx.searchResults
	                 !== void 0) {
			handsontable_initial_data.searchResults = ctx.searchResults
	                ;
			handsontable_updating.searchResults = true;
		}
		if (ctx.searchIndex
	                 !== void 0) {
			handsontable_initial_data.searchIndex = ctx.searchIndex
	                ;
			handsontable_updating.searchIndex = true;
		}
		if (ctx.multiSelection
	                 !== void 0) {
			handsontable_initial_data.multiSelection = ctx.multiSelection
	                ;
			handsontable_updating.multiSelection = true;
		}
		if (ctx.hasChanges
	                 !== void 0) {
			handsontable_initial_data.hasChanges = ctx.hasChanges
	                ;
			handsontable_updating.hasChanges = true;
		}
		var handsontable = new Handsontable({
			root: component.root,
			store: component.store,
			data: handsontable_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!handsontable_updating.data && changed.data) {
					newState.chartData = childState.data;
				}

				if (!handsontable_updating.transpose && changed.transpose) {
					newState.transpose = childState.transpose;
				}

				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					newState.firstRowIsHeader = childState.firstRowIsHeader;
				}

				if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
					newState.fixedColumnsLeft = childState.fixedColumnsLeft;
				}

				if (!handsontable_updating.activeColumn && changed.activeColumn) {
					newState.activeColumn = childState.activeColumn;
				}

				if (!handsontable_updating.readonly && changed.readonly) {
					newState.readonly = childState.readonly;
				}

				if (!handsontable_updating.sorting && changed.sorting) {
					newState.sorting = childState.sorting;
				}

				if (!handsontable_updating.search && changed.search) {
					newState.search = childState.search;
				}

				if (!handsontable_updating.searchResults && changed.searchResults) {
					newState.searchResults = childState.searchResults;
				}

				if (!handsontable_updating.searchIndex && changed.searchIndex) {
					newState.searchIndex = childState.searchIndex;
				}

				if (!handsontable_updating.multiSelection && changed.multiSelection) {
					newState.multiSelection = childState.multiSelection;
				}

				if (!handsontable_updating.hasChanges && changed.hasChanges) {
					newState.hasChanges = childState.hasChanges;
				}
				component._set(newState);
				handsontable_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			handsontable._bind({ data: 1, transpose: 1, firstRowIsHeader: 1, fixedColumnsLeft: 1, activeColumn: 1, readonly: 1, sorting: 1, search: 1, searchResults: 1, searchIndex: 1, multiSelection: 1, hasChanges: 1 }, handsontable.get());
		});

		handsontable.on("resetSort", function(event) {
			component.set({sortBy:'-'});
		});
		handsontable.on("afterRender", function(event) {
			component.afterRender();
		});

		component.refs.hot = handsontable;

		function click_handler_3(event) {
			component.toggleTranspose();
		}

		function click_handler_4(event) {
			component.addComputedColumn();
		}

		function click_handler_5(event) {
			component.revertChanges();
		}

		return {
			c: function create() {
				div11 = createElement("div");
				div10 = createElement("div");
				div2 = createElement("div");
				div1 = createElement("div");
				if_block0.c();
				text0 = createText("\n\n                ");
				hr = createElement("hr");
				text1 = createText("\n\n                ");
				div0 = createElement("div");
				a0 = createElement("a");
				i0 = createElement("i");
				text2 = createText(" ");
				text3 = createText(text3_value);
				text4 = createText("\n                    ");
				a1 = createElement("a");
				text5 = createText(text5_value);
				text6 = createText(" ");
				i1 = createElement("i");
				text7 = createText("\n        ");
				div9 = createElement("div");
				div3 = createElement("div");
				raw0_after = createElement('noscript');
				text8 = createText("\n                ");
				img0 = createElement("img");
				text9 = createText("\n            ");
				div7 = createElement("div");
				div4 = createElement("div");
				button0 = createElement("button");
				raw1_after = createElement('noscript');
				text10 = createText("… ");
				span = createElement("span");
				text11 = createText("\n                        ");
				ul = createElement("ul");
				li = createElement("li");
				a2 = createElement("a");
				text12 = createText("\n                            ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				dropdowninput._fragment.c();
				text13 = createText("\n\n                ");
				div6 = createElement("div");
				i2 = createElement("i");
				text14 = createText("\n                    ");
				div5 = createElement("div");
				input = createElement("input");
				text15 = createText("\n                        ");
				if (if_block1) if_block1.c();
				text16 = createText("\n\n                    ");
				if (if_block2) if_block2.c();
				text17 = createText("\n\n            ");
				handsontable._fragment.c();
				text18 = createText("\n\n            ");
				div8 = createElement("div");
				button1 = createElement("button");
				img1 = createElement("img");
				text19 = createText("\n                    ");
				text20 = createText(text20_value);
				text21 = createText("\n\n                ");
				button2 = createElement("button");
				i3 = createElement("i");
				text22 = createText(" ");
				text23 = createText(text23_value);
				text24 = createText("…");
				text25 = createText("\n\n                ");
				button3 = createElement("button");
				i4 = createElement("i");
				text26 = createText(" ");
				text27 = createText(text27_value);
				text28 = createText("…");
				addLoc(hr, file, 61, 16, 2757);
				i0.className = "icon-chevron-left";
				addLoc(i0, file, 69, 24, 3026);
				addListener(a0, "click", click_handler);
				a0.href = "upload";
				a0.className = "btn submit";
				addLoc(a0, file, 64, 20, 2825);
				i1.className = "icon-chevron-right icon-white";
				addLoc(i1, file, 77, 40, 3412);
				addListener(a1, "click", click_handler_1);
				a1.href = "visualize";
				a1.className = "submit btn btn-primary";
				a1.dataset.uid = "describe-proceed-button";
				addLoc(a1, file, 71, 20, 3118);
				div0.className = "btn-group";
				addLoc(div0, file, 63, 16, 2781);
				div1.className = "sidebar";
				addLoc(div1, file, 3, 12, 166);
				div2.className = "column is-4 is-3-widescreen";
				addLoc(div2, file, 2, 8, 112);
				img0.alt = "arrow";
				img0.src = "/static/img/arrow.svg";
				addLoc(img0, file, 85, 16, 3680);
				div3.className = "help svelte-130nws0";
				addLoc(div3, file, 83, 12, 3586);
				span.className = "caret";
				addLoc(span, file, 91, 62, 4047);
				setAttribute(button0, "slot", "button");
				button0.className = "btn dropdown-toggle";
				button0.dataset.toggle = "dropdown";
				addLoc(button0, file, 90, 24, 3911);
				addListener(a2, "click", click_handler_2);
				a2.href = "#s";
				a2.className = "svelte-130nws0";
				addLoc(a2, file, 95, 32, 4270);
				li.className = li_class_value = "" + ('-'==ctx.sortBy?'active':'') + " svelte-130nws0";
				addLoc(li, file, 94, 28, 4199);
				setAttribute(ul, "slot", "content");
				ul.className = "sort-menu svelte-130nws0";
				addLoc(ul, file, 93, 24, 4133);
				div4.className = "sort-box svelte-130nws0";
				addLoc(div4, file, 88, 16, 3828);
				i2.className = "im im-magnifier svelte-130nws0";
				addLoc(i2, file, 119, 20, 5564);
				addListener(input, "input", input_input_handler);
				addListener(input, "keypress", keypress_handler);
				input.autocomplete = "screw-you-google-chrome";
				setAttribute(input, "type", "search");
				input.placeholder = __$1('describe / search / placeholder');
				input.className = input_class_value = "" + (ctx.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-130nws0";
				addLoc(input, file, 121, 24, 5703);
				div5.className = div5_class_value = ctx.searchResults.length > 0 ? 'input-append' : '';
				addLoc(div5, file, 120, 20, 5616);
				div6.className = "search-box form-search svelte-130nws0";
				addLoc(div6, file, 118, 16, 5507);
				div7.className = "pull-right";
				setStyle(div7, "margin-bottom", "10px");
				addLoc(div7, file, 87, 12, 3759);
				img1.alt = "transpose";
				img1.src = "/static/css/chart-editor/transpose.png";
				img1.className = "svelte-130nws0";
				addLoc(img1, file, 170, 20, 7673);
				addListener(button1, "click", click_handler_3);
				button1.className = "btn transpose svelte-130nws0";
				addLoc(button1, file, 169, 16, 7593);
				i3.className = "fa fa-calculator";
				addLoc(i3, file, 175, 20, 7928);
				addListener(button2, "click", click_handler_4);
				button2.className = "btn computed-columns";
				addLoc(button2, file, 174, 16, 7839);
				i4.className = "fa fa-undo";
				addLoc(i4, file, 183, 20, 8236);
				addListener(button3, "click", click_handler_5);
				button3.className = button3_class_value = "btn " + (ctx.hasChanges?'':'disabled') + " svelte-130nws0";
				button3.id = "reset-data-changes";
				addLoc(button3, file, 178, 16, 8040);
				div8.className = "buttons below-table pull-right svelte-130nws0";
				addLoc(div8, file, 168, 12, 7532);
				div9.className = "column pt-5";
				addLoc(div9, file, 82, 8, 3548);
				div10.className = "columns is-variable is-5-widescreen is-8-fullhd";
				addLoc(div10, file, 1, 4, 42);
				div11.className = "chart-editor";
				addLoc(div11, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div11, anchor);
				append(div11, div10);
				append(div10, div2);
				append(div2, div1);
				if_block0.m(div1, null);
				append(div1, text0);
				append(div1, hr);
				append(div1, text1);
				append(div1, div0);
				append(div0, a0);
				append(a0, i0);
				append(a0, text2);
				append(a0, text3);
				append(div0, text4);
				append(div0, a1);
				append(a1, text5);
				append(a1, text6);
				append(a1, i1);
				append(div10, text7);
				append(div10, div9);
				append(div9, div3);
				append(div3, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(div3, text8);
				append(div3, img0);
				append(div9, text9);
				append(div9, div7);
				append(div7, div4);
				append(dropdowninput._slotted.button, button0);
				append(button0, raw1_after);
				raw1_after.insertAdjacentHTML("beforebegin", raw1_value);
				append(button0, text10);
				append(button0, span);
				append(dropdowninput._slotted.default, text11);
				append(dropdowninput._slotted.content, ul);
				append(ul, li);
				append(li, a2);
				a2.innerHTML = raw2_value;
				append(ul, text12);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				dropdowninput._mount(div4, null);
				append(div7, text13);
				append(div7, div6);
				append(div6, i2);
				append(div6, text14);
				append(div6, div5);
				append(div5, input);
				component.refs.search = input;

				input.value = ctx.search;

				append(div5, text15);
				if (if_block1) if_block1.m(div5, null);
				append(div6, text16);
				if (if_block2) if_block2.m(div6, null);
				append(div9, text17);
				handsontable._mount(div9, null);
				append(div9, text18);
				append(div9, div8);
				append(div8, button1);
				append(button1, img1);
				append(button1, text19);
				append(button1, text20);
				append(div8, text21);
				append(div8, button2);
				append(button2, i3);
				append(button2, text22);
				append(button2, text23);
				append(button2, text24);
				append(div8, text25);
				append(div8, button3);
				append(button3, i4);
				append(button3, text26);
				append(button3, text27);
				append(button3, text28);
				component.refs.parent = div11;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div1, text0);
				}

				if ((changed.sortBy) && li_class_value !== (li_class_value = "" + ('-'==ctx.sortBy?'active':'') + " svelte-130nws0")) {
					li.className = li_class_value;
				}

				if (changed.normalColumns || changed.sortBy) {
					each_value = ctx.normalColumns;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!input_updating && changed.search) input.value = ctx.search;
				if ((changed.searchResults) && input_class_value !== (input_class_value = "" + (ctx.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-130nws0")) {
					input.className = input_class_value;
				}

				if (ctx.searchResults.length > 0) {
					if (!if_block1) {
						if_block1 = create_if_block_1(component);
						if_block1.c();
						if_block1.m(div5, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.searchResults) && div5_class_value !== (div5_class_value = ctx.searchResults.length > 0 ? 'input-append' : '')) {
					div5.className = div5_class_value;
				}

				if (ctx.search) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block(component, ctx);
						if_block2.c();
						if_block2.m(div6, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				var handsontable_changes = {};
				if (changed.numeral) handsontable_changes.numeral = ctx.numeral;
				if (changed.$tableDataset) handsontable_changes.tableDataset = ctx.$tableDataset;
				if (!handsontable_updating.data && changed.chartData) {
					handsontable_changes.data = ctx.chartData;
					handsontable_updating.data = ctx.chartData !== void 0;
				}
				if (!handsontable_updating.transpose && changed.transpose) {
					handsontable_changes.transpose = ctx.transpose
	                ;
					handsontable_updating.transpose = ctx.transpose
	                 !== void 0;
				}
				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					handsontable_changes.firstRowIsHeader = ctx.firstRowIsHeader
	                ;
					handsontable_updating.firstRowIsHeader = ctx.firstRowIsHeader
	                 !== void 0;
				}
				if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
					handsontable_changes.fixedColumnsLeft = ctx.fixedColumnsLeft
	                ;
					handsontable_updating.fixedColumnsLeft = ctx.fixedColumnsLeft
	                 !== void 0;
				}
				if (!handsontable_updating.activeColumn && changed.activeColumn) {
					handsontable_changes.activeColumn = ctx.activeColumn
	                ;
					handsontable_updating.activeColumn = ctx.activeColumn
	                 !== void 0;
				}
				if (!handsontable_updating.readonly && changed.readonly) {
					handsontable_changes.readonly = ctx.readonly
	                ;
					handsontable_updating.readonly = ctx.readonly
	                 !== void 0;
				}
				if (!handsontable_updating.sorting && changed.sorting) {
					handsontable_changes.sorting = ctx.sorting
	                ;
					handsontable_updating.sorting = ctx.sorting
	                 !== void 0;
				}
				if (!handsontable_updating.search && changed.search) {
					handsontable_changes.search = ctx.search
	                ;
					handsontable_updating.search = ctx.search
	                 !== void 0;
				}
				if (!handsontable_updating.searchResults && changed.searchResults) {
					handsontable_changes.searchResults = ctx.searchResults
	                ;
					handsontable_updating.searchResults = ctx.searchResults
	                 !== void 0;
				}
				if (!handsontable_updating.searchIndex && changed.searchIndex) {
					handsontable_changes.searchIndex = ctx.searchIndex
	                ;
					handsontable_updating.searchIndex = ctx.searchIndex
	                 !== void 0;
				}
				if (!handsontable_updating.multiSelection && changed.multiSelection) {
					handsontable_changes.multiSelection = ctx.multiSelection
	                ;
					handsontable_updating.multiSelection = ctx.multiSelection
	                 !== void 0;
				}
				if (!handsontable_updating.hasChanges && changed.hasChanges) {
					handsontable_changes.hasChanges = ctx.hasChanges
	                ;
					handsontable_updating.hasChanges = ctx.hasChanges
	                 !== void 0;
				}
				handsontable._set(handsontable_changes);
				handsontable_updating = {};

				if ((changed.hasChanges) && button3_class_value !== (button3_class_value = "btn " + (ctx.hasChanges?'':'disabled') + " svelte-130nws0")) {
					button3.className = button3_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div11);
				}

				if_block0.d();
				removeListener(a0, "click", click_handler);
				removeListener(a1, "click", click_handler_1);
				removeListener(a2, "click", click_handler_2);

				destroyEach(each_blocks, detach);

				dropdowninput.destroy();
				removeListener(input, "input", input_input_handler);
				removeListener(input, "keypress", keypress_handler);
				if (component.refs.search === input) component.refs.search = null;
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				handsontable.destroy();
				if (component.refs.hot === handsontable) component.refs.hot = null;
				removeListener(button1, "click", click_handler_3);
				removeListener(button2, "click", click_handler_4);
				removeListener(button3, "click", click_handler_5);
				if (component.refs.parent === div11) component.refs.parent = null;
			}
		};
	}

	// (52:16) {:else}
	function create_else_block(component, ctx) {
		var h3, text0_value = __$1(`Make sure the data looks right`), text0, text1, p, raw_value = __$1(`describe / data-looks-right`), text2, checkboxcontrol_updating = {}, text3, if_block_anchor;

		var checkboxcontrol_initial_data = { label: __$1("First row as label") };
		if (ctx.firstRowIsHeader !== void 0) {
			checkboxcontrol_initial_data.value = ctx.firstRowIsHeader;
			checkboxcontrol_updating.value = true;
		}
		var checkboxcontrol = new CheckboxControl({
			root: component.root,
			store: component.store,
			data: checkboxcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkboxcontrol_updating.value && changed.value) {
					newState.firstRowIsHeader = childState.value;
				}
				component._set(newState);
				checkboxcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkboxcontrol._bind({ value: 1 }, checkboxcontrol.get());
		});

		var if_block = (ctx.showLocaleSelect) && create_if_block_8(component);

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n                ");
				p = createElement("p");
				text2 = createText("\n                ");
				checkboxcontrol._fragment.c();
				text3 = createText(" ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				h3.className = "first";
				addLoc(h3, file, 52, 16, 2256);
				addLoc(p, file, 53, 16, 2336);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text2, anchor);
				checkboxcontrol._mount(target, anchor);
				insert(target, text3, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var checkboxcontrol_changes = {};
				if (!checkboxcontrol_updating.value && changed.firstRowIsHeader) {
					checkboxcontrol_changes.value = ctx.firstRowIsHeader;
					checkboxcontrol_updating.value = ctx.firstRowIsHeader !== void 0;
				}
				checkboxcontrol._set(checkboxcontrol_changes);
				checkboxcontrol_updating = {};

				if (ctx.showLocaleSelect) {
					if (!if_block) {
						if_block = create_if_block_8(component);
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
					detachNode(h3);
					detachNode(text1);
					detachNode(p);
					detachNode(text2);
				}

				checkboxcontrol.destroy(detach);
				if (detach) {
					detachNode(text3);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (22:38) 
	function create_if_block_3(component, ctx) {
		var text, if_block1_anchor;

		function select_block_type_1(ctx) {
			if (ctx.customColumn) return create_if_block_5;
			if (ctx.columnFormat) return create_if_block_6;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		var if_block1 = (ctx.activeColumn.type() == 'number') && create_if_block_4(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n                \n                ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(text.parentNode, text);
				}

				if (ctx.activeColumn.type() == 'number') {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_4(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (6:16) {#if multiSelection}
	function create_if_block_2(component, ctx) {
		var h3, text0_value = __$1('describe / show-hide-multi'), text0, text1, ul, li0, button0, i0, text2, text3_value = __$1('describe / show-selected'), text3, text4, li1, button1, i1, text5, text6_value = __$1('describe / hide-selected'), text6;

		function click_handler(event) {
			component.hideMultiple(ctx.multiSelection, false);
		}

		function click_handler_1(event) {
			component.hideMultiple(ctx.multiSelection, true);
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n                ");
				ul = createElement("ul");
				li0 = createElement("li");
				button0 = createElement("button");
				i0 = createElement("i");
				text2 = createText(" ");
				text3 = createText(text3_value);
				text4 = createText("\n                    ");
				li1 = createElement("li");
				button1 = createElement("button");
				i1 = createElement("i");
				text5 = createText(" ");
				text6 = createText(text6_value);
				h3.className = "first";
				addLoc(h3, file, 6, 16, 296);
				i0.className = "fa fa-eye";
				addLoc(i0, file, 10, 28, 564);
				addListener(button0, "click", click_handler);
				button0.className = "btn";
				addLoc(button0, file, 9, 24, 468);
				setStyle(li0, "margin-bottom", "5px");
				addLoc(li0, file, 8, 20, 412);
				i1.className = "fa fa-eye-slash";
				addLoc(i1, file, 15, 28, 827);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn";
				addLoc(button1, file, 14, 24, 732);
				addLoc(li1, file, 13, 20, 703);
				ul.className = "unstyled";
				addLoc(ul, file, 7, 16, 370);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, ul, anchor);
				append(ul, li0);
				append(li0, button0);
				append(button0, i0);
				append(button0, text2);
				append(button0, text3);
				append(ul, text4);
				append(ul, li1);
				append(li1, button1);
				append(button1, i1);
				append(button1, text5);
				append(button1, text6);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;

			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(ul);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (56:19) {#if showLocaleSelect}
	function create_if_block_8(component, ctx) {
		var h4, text0_value = __$1(`describe / locale-select / hed`), text0, text1, p, raw_value = __$1(`describe / locale-select / body`), text2;

		var localeselectinput = new LocaleSelectInput({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				h4 = createElement("h4");
				text0 = createText(text0_value);
				text1 = createText("\n                ");
				p = createElement("p");
				text2 = createText("\n                ");
				localeselectinput._fragment.c();
				h4.className = "mt-5";
				addLoc(h4, file, 56, 16, 2544);
				addLoc(p, file, 57, 16, 2621);
			},

			m: function mount(target, anchor) {
				insert(target, h4, anchor);
				append(h4, text0);
				insert(target, text1, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text2, anchor);
				localeselectinput._mount(target, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h4);
					detachNode(text1);
					detachNode(p);
					detachNode(text2);
				}

				localeselectinput.destroy(detach);
			}
		};
	}

	// (38:38) 
	function create_if_block_6(component, ctx) {
		var customcolumnformat_updating = {}, text, if_block_anchor;

		var customcolumnformat_initial_data = {};
		if (ctx.columnFormat !== void 0) {
			customcolumnformat_initial_data.column = ctx.columnFormat;
			customcolumnformat_updating.column = true;
		}
		if (ctx.normalColumns !== void 0) {
			customcolumnformat_initial_data.columns = ctx.normalColumns;
			customcolumnformat_updating.columns = true;
		}
		var customcolumnformat = new CustomColumnFormat({
			root: component.root,
			store: component.store,
			data: customcolumnformat_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!customcolumnformat_updating.column && changed.column) {
					newState.columnFormat = childState.column;
				}

				if (!customcolumnformat_updating.columns && changed.columns) {
					newState.normalColumns = childState.columns;
				}
				component._set(newState);
				customcolumnformat_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			customcolumnformat._bind({ column: 1, columns: 1 }, customcolumnformat.get());
		});

		var if_block = (ctx.columnFormat.isComputed) && create_if_block_7(component);

		return {
			c: function create() {
				customcolumnformat._fragment.c();
				text = createText("\n                ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				customcolumnformat._mount(target, anchor);
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var customcolumnformat_changes = {};
				if (!customcolumnformat_updating.column && changed.columnFormat) {
					customcolumnformat_changes.column = ctx.columnFormat;
					customcolumnformat_updating.column = ctx.columnFormat !== void 0;
				}
				if (!customcolumnformat_updating.columns && changed.normalColumns) {
					customcolumnformat_changes.columns = ctx.normalColumns;
					customcolumnformat_updating.columns = ctx.normalColumns !== void 0;
				}
				customcolumnformat._set(customcolumnformat_changes);
				customcolumnformat_updating = {};

				if (ctx.columnFormat.isComputed) {
					if (!if_block) {
						if_block = create_if_block_7(component);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				customcolumnformat.destroy(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (25:16) {#if customColumn}
	function create_if_block_5(component, ctx) {
		var computedcolumneditor_updating = {}, text0, button, text1_value = __$1('describe / edit-format'), text1;

		var computedcolumneditor_initial_data = {};
		if (ctx.customColumn !== void 0) {
			computedcolumneditor_initial_data.column = ctx.customColumn;
			computedcolumneditor_updating.column = true;
		}
		if (ctx.columns
	                 !== void 0) {
			computedcolumneditor_initial_data.columns = ctx.columns
	                ;
			computedcolumneditor_updating.columns = true;
		}
		var computedcolumneditor = new ComputedColumnEditor({
			root: component.root,
			store: component.store,
			data: computedcolumneditor_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!computedcolumneditor_updating.column && changed.column) {
					newState.customColumn = childState.column;
				}

				if (!computedcolumneditor_updating.columns && changed.columns) {
					newState.columns = childState.columns;
				}
				component._set(newState);
				computedcolumneditor_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			computedcolumneditor._bind({ column: 1, columns: 1 }, computedcolumneditor.get());
		});

		computedcolumneditor.on("unselect", function(event) {
			component.set({activeColumn:false});
		});

		component.refs.ccEd = computedcolumneditor;

		function click_handler(event) {
			component.force(event, true);
		}

		return {
			c: function create() {
				computedcolumneditor._fragment.c();
				text0 = createText("\n\n                ");
				button = createElement("button");
				text1 = createText(text1_value);
				addListener(button, "click", click_handler);
				button.className = "btn";
				addLoc(button, file, 32, 16, 1391);
			},

			m: function mount(target, anchor) {
				computedcolumneditor._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, button, anchor);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var computedcolumneditor_changes = {};
				if (!computedcolumneditor_updating.column && changed.customColumn) {
					computedcolumneditor_changes.column = ctx.customColumn;
					computedcolumneditor_updating.column = ctx.customColumn !== void 0;
				}
				if (!computedcolumneditor_updating.columns && changed.columns) {
					computedcolumneditor_changes.columns = ctx.columns
	                ;
					computedcolumneditor_updating.columns = ctx.columns
	                 !== void 0;
				}
				computedcolumneditor._set(computedcolumneditor_changes);
				computedcolumneditor_updating = {};
			},

			d: function destroy(detach) {
				computedcolumneditor.destroy(detach);
				if (component.refs.ccEd === computedcolumneditor) component.refs.ccEd = null;
				if (detach) {
					detachNode(text0);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (40:16) {#if columnFormat.isComputed}
	function create_if_block_7(component, ctx) {
		var button, i, text0, text1_value = __$1('describe / edit-formula'), text1;

		function click_handler(event) {
			component.force(event, false);
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-chevron-left";
				addLoc(i, file, 41, 20, 1832);
				addListener(button, "click", click_handler);
				button.className = "btn";
				addLoc(button, file, 40, 16, 1760);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (47:16) {#if activeColumn.type() == 'number'}
	function create_if_block_4(component, ctx) {
		var histogram_updating = {};

		var histogram_initial_data = {};
		if (ctx.activeValues !== void 0) {
			histogram_initial_data.values = ctx.activeValues;
			histogram_updating.values = true;
		}
		if (ctx.activeFormat !== void 0) {
			histogram_initial_data.format = ctx.activeFormat;
			histogram_updating.format = true;
		}
		var histogram = new Histogram({
			root: component.root,
			store: component.store,
			data: histogram_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!histogram_updating.values && changed.values) {
					newState.activeValues = childState.values;
				}

				if (!histogram_updating.format && changed.format) {
					newState.activeFormat = childState.format;
				}
				component._set(newState);
				histogram_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			histogram._bind({ values: 1, format: 1 }, histogram.get());
		});

		return {
			c: function create() {
				histogram._fragment.c();
			},

			m: function mount(target, anchor) {
				histogram._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var histogram_changes = {};
				if (!histogram_updating.values && changed.activeValues) {
					histogram_changes.values = ctx.activeValues;
					histogram_updating.values = ctx.activeValues !== void 0;
				}
				if (!histogram_updating.format && changed.activeFormat) {
					histogram_changes.format = ctx.activeFormat;
					histogram_updating.format = ctx.activeFormat !== void 0;
				}
				histogram._set(histogram_changes);
				histogram_updating = {};
			},

			d: function destroy(detach) {
				histogram.destroy(detach);
			}
		};
	}

	// (100:28) {#each normalColumns as col}
	function create_each_block(component, ctx) {
		var li, a, i0, i0_class_value, text0, i1, i1_class_value, text1, text2_value = ctx.col.title(), text2, a_href_value, li_class_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i0 = createElement("i");
				text0 = createText("\n                                    ");
				i1 = createElement("i");
				text1 = createText("   ");
				text2 = createText(text2_value);
				i0._svelte = { component, ctx };

				addListener(i0, "click", click_handler);
				i0.className = i0_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-130nws0";
				addLoc(i0, file, 102, 36, 4721);

				i1._svelte = { component, ctx };

				addListener(i1, "click", click_handler_1);
				i1.className = i1_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-130nws0";
				addLoc(i1, file, 106, 36, 4990);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler_2);
				a.href = a_href_value = "#/" + ctx.col.name();
				a.className = "svelte-130nws0";
				addLoc(a, file, 101, 32, 4618);
				li.className = li_class_value = "" + (ctx.col.name()==ctx.sortBy?'active':'') + " svelte-130nws0";
				addLoc(li, file, 100, 28, 4540);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i0);
				append(a, text0);
				append(a, i1);
				append(a, text1);
				append(a, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				i0._svelte.ctx = ctx;
				if ((changed.normalColumns) && i0_class_value !== (i0_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-130nws0")) {
					i0.className = i0_class_value;
				}

				i1._svelte.ctx = ctx;
				if ((changed.normalColumns) && i1_class_value !== (i1_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-130nws0")) {
					i1.className = i1_class_value;
				}

				if ((changed.normalColumns) && text2_value !== (text2_value = ctx.col.title())) {
					setData(text2, text2_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.normalColumns) && a_href_value !== (a_href_value = "#/" + ctx.col.name())) {
					a.href = a_href_value;
				}

				if ((changed.normalColumns || changed.sortBy) && li_class_value !== (li_class_value = "" + (ctx.col.name()==ctx.sortBy?'active':'') + " svelte-130nws0")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(i0, "click", click_handler);
				removeListener(i1, "click", click_handler_1);
				removeListener(a, "click", click_handler_2);
			}
		};
	}

	// (131:24) {#if searchResults.length > 0}
	function create_if_block_1(component, ctx) {
		var div, button0, i0, text, button1, i1;

		function click_handler_3(event) {
			component.nextResult(-1);
		}

		function click_handler_4(event) {
			component.nextResult(+1);
		}

		return {
			c: function create() {
				div = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text = createText("\n                            ");
				button1 = createElement("button");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-up";
				addLoc(i0, file, 133, 32, 6377);
				addListener(button0, "click", click_handler_3);
				button0.className = "btn svelte-130nws0";
				addLoc(button0, file, 132, 28, 6298);
				i1.className = "fa fa-chevron-down";
				addLoc(i1, file, 136, 32, 6555);
				addListener(button1, "click", click_handler_4);
				button1.className = "btn svelte-130nws0";
				addLoc(button1, file, 135, 28, 6476);
				div.className = "btn-group";
				addLoc(div, file, 131, 24, 6246);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, button0);
				append(button0, i0);
				append(div, text);
				append(div, button1);
				append(button1, i1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button0, "click", click_handler_3);
				removeListener(button1, "click", click_handler_4);
			}
		};
	}

	// (143:20) {#if search}
	function create_if_block(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.resultsDisplay);
				div.className = "results svelte-130nws0";
				addLoc(div, file, 143, 20, 6770);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.resultsDisplay) {
					setData(text, ctx.resultsDisplay);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<App> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["language","dw_chart","tableDataset"]), data$1()), options.data);
		this.store._add(this, ["language","dw_chart","tableDataset"]);

		this._recompute({ $language: 1, searchIndex: 1, searchResults: 1, activeColumn: 1, forceColumnFormat: 1, $dw_chart: 1, numeral: 1, $tableDataset: 1, columns: 1, sortBy: 1, sortDir: 1, searchIndexSafe: 1 }, this._state);
		if (!('$language' in this._state)) console.warn("<App> was created without expected data property '$language'");
		if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
		if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
		if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
		if (!('forceColumnFormat' in this._state)) console.warn("<App> was created without expected data property 'forceColumnFormat'");
		if (!('$dw_chart' in this._state)) console.warn("<App> was created without expected data property '$dw_chart'");
		if (!('numeral' in this._state)) console.warn("<App> was created without expected data property 'numeral'");
		if (!('$tableDataset' in this._state)) console.warn("<App> was created without expected data property '$tableDataset'");

		if (!('sortBy' in this._state)) console.warn("<App> was created without expected data property 'sortBy'");
		if (!('sortDir' in this._state)) console.warn("<App> was created without expected data property 'sortDir'");

		if (!('multiSelection' in this._state)) console.warn("<App> was created without expected data property 'multiSelection'");





		if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
		if (!('showLocaleSelect' in this._state)) console.warn("<App> was created without expected data property 'showLocaleSelect'");
		if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");

		if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
		if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
		if (!('fixedColumnsLeft' in this._state)) console.warn("<App> was created without expected data property 'fixedColumnsLeft'");
		if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");

		if (!('hasChanges' in this._state)) console.warn("<App> was created without expected data property 'hasChanges'");
		this._intro = true;
		this._handlers.update = [onupdate];

		this._handlers.destroy = [removeFromStore];

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
		if ('locale' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'locale'");
		if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
		if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
		if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
		if ('activeValues' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeValues'");
		if ('activeFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeFormat'");
		if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
		if ('normalColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'normalColumns'");
		if ('sorting' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'sorting'");
		if ('resultsDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'resultsDisplay'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.$language) {
			if (this._differs(state.locale, (state.locale = locale(state)))) changed.locale = true;
		}

		if (changed.searchIndex || changed.searchResults) {
			if (this._differs(state.searchIndexSafe, (state.searchIndexSafe = searchIndexSafe(state)))) changed.searchIndexSafe = true;
		}

		if (changed.activeColumn || changed.forceColumnFormat) {
			if (this._differs(state.customColumn, (state.customColumn = customColumn(state)))) changed.customColumn = true;
			if (this._differs(state.columnFormat, (state.columnFormat = columnFormat(state)))) changed.columnFormat = true;
		}

		if (changed.activeColumn) {
			if (this._differs(state.activeValues, (state.activeValues = activeValues(state)))) changed.activeValues = true;
		}

		if (changed.activeColumn || changed.$dw_chart || changed.numeral) {
			if (this._differs(state.activeFormat, (state.activeFormat = activeFormat(state)))) changed.activeFormat = true;
		}

		if (changed.activeColumn || changed.$tableDataset) {
			if (this._differs(state.columns, (state.columns = columns(state)))) changed.columns = true;
		}

		if (changed.columns) {
			if (this._differs(state.normalColumns, (state.normalColumns = normalColumns(state)))) changed.normalColumns = true;
		}

		if (changed.sortBy || changed.sortDir) {
			if (this._differs(state.sorting, (state.sorting = sorting(state)))) changed.sorting = true;
		}

		if (changed.searchResults || changed.searchIndexSafe) {
			if (this._differs(state.resultsDisplay, (state.resultsDisplay = resultsDisplay(state)))) changed.resultsDisplay = true;
		}
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

		get: get$4,

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
//# sourceMappingURL=describe.js.map
