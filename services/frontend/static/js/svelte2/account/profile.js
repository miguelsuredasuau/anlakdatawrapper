(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/account/profile', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['account/profile'] = factory());
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

	function detachBefore(after) {
		while (after.previousSibling) {
			after.parentNode.removeChild(after.previousSibling);
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

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
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

	var hasOwnProperty = Object.hasOwnProperty,
	    setPrototypeOf = Object.setPrototypeOf,
	    isFrozen = Object.isFrozen,
	    getPrototypeOf = Object.getPrototypeOf,
	    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var freeze = Object.freeze,
	    seal = Object.seal,
	    create = Object.create; // eslint-disable-line import/no-mutable-exports

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

	function clone(object) {
	  var newObject = create(null);
	  var property;

	  for (property in object) {
	    if (apply(hasOwnProperty, object, [property])) {
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
	    documentMode = clone(document).documentMode ? document.documentMode : {};
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


	    cfg = clone(cfg);
	    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
	    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE; // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.

	    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? function (x) {
	      return x;
	    } : stringToLowerCase;
	    /* Set configuration parameters */

	    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
	    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
	    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), // eslint-disable-line indent
	    cfg.ADD_URI_SAFE_ATTR, // eslint-disable-line indent
	    transformCaseFunc // eslint-disable-line indent
	    ) // eslint-disable-line indent
	    : DEFAULT_URI_SAFE_ATTRIBUTES;
	    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), // eslint-disable-line indent
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
	        ALLOWED_TAGS = clone(ALLOWED_TAGS);
	      }

	      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
	    }

	    if (cfg.ADD_ATTR) {
	      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
	        ALLOWED_ATTR = clone(ALLOWED_ATTR);
	      }

	      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
	    }

	    if (cfg.ADD_URI_SAFE_ATTR) {
	      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
	    }

	    if (cfg.FORBID_CONTENTS) {
	      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
	        FORBID_CONTENTS = clone(FORBID_CONTENTS);
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

	const __messages = {};

	function initMessages(scope = 'core') {
	    /* globals dw */

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
	function __(key, scope = 'core', ...replacements) {
	    key = key.trim();
	    if (!__messages[scope]) initMessages(scope);
	    if (!__messages[scope][key]) return 'MISSING:' + key;
	    return translate(key, scope, __messages, ...replacements);
	}

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

	/* node_modules/@datawrapper/controls/FormBlock.html generated by Svelte v2.16.1 */

	function data$3() {
	    return {
	        label: '',
	        help: '',
	        compact: false,
	        class: '',
	        error: false,
	        success: false,
	        width: 'auto',
	        uid: ''
	    };
	}
	const file$1 = "node_modules/datawrapper/controls/FormBlock.html";

	function create_main_fragment$2(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_3$1(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2$1(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1$1(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				text2 = createText(" ");
				if (if_block2) if_block2.c();
				text3 = createText(" ");
				if (if_block3) if_block3.c();
				div0.className = "form-controls svelte-150khnx";
				addLoc(div0, file$1, 11, 4, 248);
				div1.className = div1_class_value = "form-block " + ctx.class + " svelte-150khnx";
				setStyle(div1, "width", ctx.width);
				div1.dataset.uid = ctx.uid;
				toggleClass(div1, "compact", ctx.compact);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) if_block0.m(div1, null);
				append(div1, text0);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				append(div1, text1);
				if (if_block1) if_block1.m(div1, null);
				append(div1, text2);
				if (if_block2) if_block2.m(div1, null);
				append(div1, text3);
				if (if_block3) if_block3.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$1(component, ctx);
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.success) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$1(component, ctx);
						if_block1.c();
						if_block1.m(div1, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.error) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1$1(component, ctx);
						if_block2.c();
						if_block2.m(div1, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (!ctx.success && !ctx.error && ctx.help) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block$2(component, ctx);
						if_block3.c();
						if_block3.m(div1, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if ((changed.class) && div1_class_value !== (div1_class_value = "form-block " + ctx.class + " svelte-150khnx")) {
					div1.className = div1_class_value;
				}

				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}

				if (changed.uid) {
					div1.dataset.uid = ctx.uid;
				}

				if ((changed.class || changed.compact)) {
					toggleClass(div1, "compact", ctx.compact);
				}

				if ((changed.class || changed.success)) {
					toggleClass(div1, "success", ctx.success);
				}

				if ((changed.class || changed.error)) {
					toggleClass(div1, "error", ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) if_block0.d();

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
			}
		};
	}

	// (9:4) {#if label}
	function create_if_block_3$1(component, ctx) {
		var label, raw_after, slot_content_labelExtra = component._slotted.labelExtra, slot_content_labelExtra_before;

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				label.className = "control-label svelte-150khnx";
				addLoc(label, file$1, 9, 4, 157);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", ctx.label);

				if (slot_content_labelExtra) {
					append(label, slot_content_labelExtra_before || (slot_content_labelExtra_before = createComment()));
					append(label, slot_content_labelExtra);
				}
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				if (slot_content_labelExtra) {
					reinsertAfter(slot_content_labelExtra_before, slot_content_labelExtra);
				}
			}
		};
	}

	// (15:4) {#if success}
	function create_if_block_2$1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help success svelte-150khnx";
				addLoc(div, file$1, 15, 4, 326);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.success;
			},

			p: function update(changed, ctx) {
				if (changed.success) {
					div.innerHTML = ctx.success;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (17:10) {#if error}
	function create_if_block_1$1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-150khnx";
				addLoc(div, file$1, 17, 4, 400);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.error;
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					div.innerHTML = ctx.error;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (19:10) {#if !success && !error && help}
	function create_if_block$2(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-150khnx";
				addLoc(div, file$1, 19, 4, 491);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function FormBlock(options) {
		this._debugName = '<FormBlock>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('class' in this._state)) console.warn("<FormBlock> was created without expected data property 'class'");
		if (!('width' in this._state)) console.warn("<FormBlock> was created without expected data property 'width'");
		if (!('uid' in this._state)) console.warn("<FormBlock> was created without expected data property 'uid'");
		if (!('label' in this._state)) console.warn("<FormBlock> was created without expected data property 'label'");
		if (!('success' in this._state)) console.warn("<FormBlock> was created without expected data property 'success'");
		if (!('error' in this._state)) console.warn("<FormBlock> was created without expected data property 'error'");
		if (!('help' in this._state)) console.warn("<FormBlock> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(FormBlock.prototype, protoDev);

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* shared/CheckPassword.html generated by Svelte v2.16.1 */

	const MIN_CHARACTERS = 8;

	let zxcvbn;
	let zxcvbnLoading = false;

	function loadZxcvbn() {
	    zxcvbnLoading = true;
	    require(['zxcvbn'], pkg => {
	        zxcvbn = pkg;
	    });
	}

	function passwordTooShort({ password }) {
	    return password.length < MIN_CHARACTERS;
	}
	function passwordStrength({ password }) {
	    if (!zxcvbn) {
	        if (!zxcvbnLoading && password.length > 4) {
	            loadZxcvbn();
	        }
	        return false;
	    }
	    return zxcvbn(password);
	}
	function passwordHelp({ password, passwordStrength }) {
	    if (password === '' || !passwordStrength) {
	        return __('account / pwd-too-short', 'core', { num: MIN_CHARACTERS });
	    }
	    const score = ['bad', 'weak', 'ok', 'good', 'excellent'][passwordStrength.score];
	    return __(`account / password / ${score}`);
	}
	function passwordError({ password, passwordTooShort, passwordStrength, passwordHelp }) {
	    if (!password) return false;
	    if (passwordTooShort)
	        return __('account / pwd-too-short', 'core', { num: MIN_CHARACTERS });
	    if (passwordStrength && passwordStrength.score < 2) return passwordHelp;
	    return false;
	}
	function passwordSuccess({ passwordStrength, passwordHelp }) {
	    return passwordStrength && passwordStrength.score > 2 ? passwordHelp : false;
	}
	function passwordOk({ password, passwordTooShort }) {
	    return password && !passwordTooShort;
	}
	function data$2() {
		return {
	    password: ''
	};
	}

	function create_main_fragment$1(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.password.length>=MIN_CHARACTERS) && create_if_block$1();

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.password.length>=MIN_CHARACTERS) {
					if (!if_block) {
						if_block = create_if_block$1();
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if password.length>=MIN_CHARACTERS}
	function create_if_block$1(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	function CheckPassword(options) {
		this._debugName = '<CheckPassword>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);

		this._recompute({ password: 1, passwordStrength: 1, passwordTooShort: 1, passwordHelp: 1 }, this._state);
		if (!('password' in this._state)) console.warn("<CheckPassword> was created without expected data property 'password'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(CheckPassword.prototype, protoDev);

	CheckPassword.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('passwordTooShort' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordTooShort'");
		if ('passwordStrength' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordStrength'");
		if ('passwordHelp' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordHelp'");
		if ('passwordError' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordError'");
		if ('passwordSuccess' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordSuccess'");
		if ('passwordOk' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordOk'");
	};

	CheckPassword.prototype._recompute = function _recompute(changed, state) {
		if (changed.password) {
			if (this._differs(state.passwordTooShort, (state.passwordTooShort = passwordTooShort(state)))) changed.passwordTooShort = true;
			if (this._differs(state.passwordStrength, (state.passwordStrength = passwordStrength(state)))) changed.passwordStrength = true;
		}

		if (changed.password || changed.passwordStrength) {
			if (this._differs(state.passwordHelp, (state.passwordHelp = passwordHelp(state)))) changed.passwordHelp = true;
		}

		if (changed.password || changed.passwordTooShort || changed.passwordStrength || changed.passwordHelp) {
			if (this._differs(state.passwordError, (state.passwordError = passwordError(state)))) changed.passwordError = true;
		}

		if (changed.passwordStrength || changed.passwordHelp) {
			if (this._differs(state.passwordSuccess, (state.passwordSuccess = passwordSuccess(state)))) changed.passwordSuccess = true;
		}

		if (changed.password || changed.passwordTooShort) {
			if (this._differs(state.passwordOk, (state.passwordOk = passwordOk(state)))) changed.passwordOk = true;
		}
	};

	/* account/EditProfile.html generated by Svelte v2.16.1 */



	function changeEmailFormBlockError({ changeEmail, error }) {
	    return (
	        changeEmail &&
	        error &&
	        error.details &&
	        error.details
	            .filter(({ path }) => path === 'email')
	            .map(({ translationKey }) =>
	                __(translationKey || 'account / change-email / unknown-error')
	            )
	            .join('. ')
	    );
	}
	function deleteAccountFormBlockError({ deleteAccount2, error }) {
	    return (
	        deleteAccount2 &&
	        error &&
	        error.details &&
	        error.details
	            .filter(({ path }) => ['email', 'password'].includes(path))
	            .map(({ translationKey }) =>
	                __(translationKey || 'account / delete / unknown-error')
	            )
	            .join('. ')
	    );
	}
	function data$1() {
	    return {
	        changePassword: false,
	        changeEmail: false,
	        emailChanged: false,
	        deleteAccount: false,
	        deleteAccount2: false,
	        deleteAccount3: false,
	        deletingAccount: false,
	        showPasswordInPlaintext: false,
	        messages: [],
	        currentPassword: '',
	        newPassword: '',
	        newPasswordOk: false,
	        passwordError: false,
	        passwordHelp: false,
	        passwordSuccess: false,
	        confirmEmail: '',
	        confirmPassword: '',
	        email: '',
	        newEmail: '',
	        savingEmail: false,
	        savingPassword: false,
	        showPasswordAsClearText: false,
	        error: null,
	        groups: [
	            {
	                title: 'Account settings',
	                tabs: [
	                    {
	                        title: 'Profile',
	                        icon: 'fa fa-fw fa-user'
	                    }
	                ]
	            },
	            {
	                title: 'Team settings',
	                tabs: []
	            }
	        ]
	    };
	}
	var methods = {
	    initChangeEmail() {
	        const { email } = this.get();
	        this.set({
	            changeEmail: true,
	            newEmail: email
	        });
	    },
	    async changeEmail() {
	        const { newEmail } = this.get();

	        this.set({ savingEmail: true });

	        try {
	            await httpReq.patch('/v3/me', {
	                payload: { email: newEmail }
	            });
	            this.set({
	                changeEmail: false,
	                messages: [
	                    'Your email has been changed successfully. You will receive an email with a confirmation link.'
	                ],
	                error: null
	            });
	        } catch (error) {
	            this.set({ error });
	        }

	        this.set({ savingEmail: false });
	    },
	    async changePassword() {
	        const { currentPassword, newPassword, email } = this.get();

	        this.set({ savingPassword: true });

	        const payload = {
	            password: newPassword,
	            oldPassword: currentPassword
	        };

	        try {
	            await httpReq.patch('/v3/me', { payload });
	            const params = new URLSearchParams();
	            params.append('ref', '/account');
	            params.append('email', email);
	            params.append('passwordChanged', 'true');
	            window.location.href = `/signin?${params}`;
	            this.set({
	                changePassword: false,
	                currentPassword: '',
	                newPassword: '',
	                error: null
	            });
	        } catch (error) {
	            this.set({ error });
	        }

	        this.set({ savingPassword: false });
	    },
	    async deleteAccount() {
	        const { confirmPassword, confirmEmail } = this.get();

	        this.set({ deletingAccount: true });

	        try {
	            await httpReq.delete('/v3/me', {
	                payload: {
	                    password: confirmPassword,
	                    email: confirmEmail
	                }
	            });
	            this.set({
	                deleteAccount2: false,
	                deleteAccount3: true
	            });
	        } catch (error) {
	            this.set({
	                error,
	                deletingAccount: false
	            });
	        }
	    }
	};

	function oncreate() {
	    const { emailChanged } = this.get();
	    if (emailChanged) {
	        this.set({
	            messages: [__('account / profile / email-changed')]
	        });
	        // remove ?token query string
	        window.history.replaceState('', '', window.location.pathname);
	    }
	}
	const file = "account/EditProfile.html";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var text0, div2, div0, text1, if_block2_anchor, text2, text3, text4, div1, p, text5_value = __("account / change-login"), text5;

		var if_block0 = (ctx.messages && ctx.messages.length) && create_if_block_9(component, ctx);

		var if_block1 = (ctx.changeEmail && ctx.error) && create_if_block_8(component, ctx);

		function select_block_type(ctx) {
			if (ctx.changeEmail) return create_if_block_7;
			return create_else_block_3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block2 = current_block_type(component, ctx);

		var formblock_initial_data = {
		 	label: __('E-Mail'),
		 	help: ctx.changeEmail ? __('account / confirm-email-change') : '',
		 	error: ctx.changeEmailFormBlockError
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function select_block_type_1(ctx) {
			if (!ctx.changePassword) return create_if_block_4;
			return create_else_block_1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block3 = current_block_type_1(component, ctx);

		function select_block_type_3(ctx) {
			if (ctx.deleteAccount3) return create_if_block;
			if (ctx.deleteAccount2) return create_if_block_1;
			if (ctx.deleteAccount) return create_if_block_3;
			return create_else_block;
		}

		var current_block_type_2 = select_block_type_3(ctx);
		var if_block4 = current_block_type_2(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div2 = createElement("div");
				div0 = createElement("div");
				if (if_block1) if_block1.c();
				text1 = createText("\n        ");
				if_block2.c();
				if_block2_anchor = createComment();
				formblock._fragment.c();
				text2 = createText("\n\n        ");
				if_block3.c();
				text3 = createText(" ");
				if_block4.c();
				text4 = createText("\n    ");
				div1 = createElement("div");
				p = createElement("p");
				text5 = createText(text5_value);
				div0.className = "span6";
				addLoc(div0, file, 13, 4, 379);
				p.className = "help";
				addLoc(p, file, 189, 8, 7359);
				div1.className = "span4";
				addLoc(div1, file, 188, 4, 7331);
				div2.className = "row edit-account";
				setStyle(div2, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				addLoc(div2, file, 12, 0, 280);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div2, anchor);
				append(div2, div0);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text1);
				if_block2.m(formblock._slotted.default, null);
				append(formblock._slotted.default, if_block2_anchor);
				formblock._mount(div0, null);
				append(div0, text2);
				if_block3.m(div0, null);
				append(div0, text3);
				if_block4.m(div0, null);
				append(div2, text4);
				append(div2, div1);
				append(div1, p);
				append(p, text5);
			},

			p: function update(changed, ctx) {
				if (ctx.messages && ctx.messages.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_9(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.changeEmail && ctx.error) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_8(component, ctx);
						if_block1.c();
						if_block1.m(div0, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type(component, ctx);
					if_block2.c();
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}

				var formblock_changes = {};
				if (changed.changeEmail) formblock_changes.help = ctx.changeEmail ? __('account / confirm-email-change') : '';
				if (changed.changeEmailFormBlockError) formblock_changes.error = ctx.changeEmailFormBlockError;
				formblock._set(formblock_changes);

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type_1(component, ctx);
					if_block3.c();
					if_block3.m(div0, text3);
				}

				if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if_block4.d(1);
					if_block4 = current_block_type_2(component, ctx);
					if_block4.c();
					if_block4.m(div0, null);
				}

				if (changed.messages) {
					setStyle(div2, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div2);
				}

				if (if_block1) if_block1.d();
				if_block2.d();
				formblock.destroy();
				if_block3.d();
				if_block4.d();
			}
		};
	}

	// (1:0) {#if messages && messages.length }
	function create_if_block_9(component, ctx) {
		var div2, div1, div0;

		var each_value = ctx.messages;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div0.className = "alert alert-success svelte-1uqq9ww";
				addLoc(div0, file, 3, 8, 110);
				div1.className = "span6";
				addLoc(div1, file, 2, 4, 82);
				div2.className = "row";
				setStyle(div2, "margin-top", "20px");
				addLoc(div2, file, 1, 0, 35);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.messages) {
					each_value = ctx.messages;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (5:12) {#each messages as message}
	function create_each_block(component, ctx) {
		var p, raw_value = ctx.message;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "svelte-1uqq9ww";
				addLoc(p, file, 5, 12, 196);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.messages) && raw_value !== (raw_value = ctx.message)) {
					p.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (15:8) {#if changeEmail && error}
	function create_if_block_8(component, ctx) {
		var div, raw_value = __(ctx.error.translationKey || 'account / change-email / unknown-error');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-danger";
				addLoc(div, file, 15, 8, 442);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.error) && raw_value !== (raw_value = __(ctx.error.translationKey || 'account / change-email / unknown-error'))) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (34:12) {:else}
	function create_else_block_3(component, ctx) {
		var input, text0, button, text1_value = __( "account / email"), text1;

		function click_handler(event) {
			component.initChangeEmail();
		}

		return {
			c: function create() {
				input = createElement("input");
				text0 = createText("\n            ");
				button = createElement("button");
				text1 = createText(text1_value);
				input.disabled = "disabled";
				input.value = ctx.email;
				setAttribute(input, "type", "email");
				addLoc(input, file, 34, 12, 1289);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				addLoc(button, file, 35, 12, 1360);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
				insert(target, text0, anchor);
				insert(target, button, anchor);
				append(button, text1);
			},

			p: function update(changed, ctx) {
				if (changed.email) {
					input.value = ctx.email;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
					detachNode(text0);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (25:12) {#if changeEmail}
	function create_if_block_7(component, ctx) {
		var input, input_updating = false, text0, button0, text1_value = __( "Back"), text1, text2, button1, i, i_class_value, text3, text4_value = __(
	                "account / email"), text4;

		function input_input_handler() {
			input_updating = true;
			component.set({ newEmail: input.value });
			input_updating = false;
		}

		function click_handler(event) {
			component.set({changeEmail: false, error: null});
		}

		function click_handler_1(event) {
			component.changeEmail();
		}

		return {
			c: function create() {
				input = createElement("input");
				text0 = createText("\n            ");
				button0 = createElement("button");
				text1 = createText(text1_value);
				text2 = createText("\n            ");
				button1 = createElement("button");
				i = createElement("i");
				text3 = createText("  ");
				text4 = createText(text4_value);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "email");
				addLoc(input, file, 25, 12, 826);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-default";
				addLoc(button0, file, 26, 12, 883);
				i.className = i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i, file, 30, 16, 1115);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-save btn-primary";
				addLoc(button1, file, 29, 12, 1032);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.newEmail;

				insert(target, text0, anchor);
				insert(target, button0, anchor);
				append(button0, text1);
				insert(target, text2, anchor);
				insert(target, button1, anchor);
				append(button1, i);
				append(button1, text3);
				append(button1, text4);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newEmail) input.value = ctx.newEmail;
				if ((changed.savingEmail) && i_class_value !== (i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
				if (detach) {
					detachNode(text0);
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text2);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (52:8) {:else}
	function create_else_block_1(component, ctx) {
		var h3, text0_value = __("account / password"), text0, text1, button0, text2_value = __("Back"), text2, text3, text4, input0, input0_updating = false, text5, text6, div0, checkpassword_updating = {}, text7, div1, label, input1, text8, raw_value = __("account / invite / password-clear-text"), raw_before, text9, button1, i, i_class_value, text10, text11_value = __("account / password"), text11, button1_disabled_value, text12, hr;

		function click_handler(event) {
			component.set({changePassword: false, error: null});
		}

		var if_block0 = (ctx.changePassword && ctx.error) && create_if_block_6(component, ctx);

		function input0_input_handler() {
			input0_updating = true;
			component.set({ currentPassword: input0.value });
			input0_updating = false;
		}

		var formblock0_initial_data = {
		 	label: __('Current Password'),
		 	help: __('account / password / current-password-note')
		 };
		var formblock0 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock0_initial_data
		});

		function select_block_type_2(ctx) {
			if (ctx.showPasswordAsClearText) return create_if_block_5;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block1 = current_block_type(component, ctx);

		var checkpassword_initial_data = {};
		if (ctx.newPassword !== void 0) {
			checkpassword_initial_data.password = ctx.newPassword;
			checkpassword_updating.password = true;
		}
		if (ctx.passwordHelp
	                     !== void 0) {
			checkpassword_initial_data.passwordHelp = ctx.passwordHelp
	                    ;
			checkpassword_updating.passwordHelp = true;
		}
		if (ctx.passwordSuccess
	                     !== void 0) {
			checkpassword_initial_data.passwordSuccess = ctx.passwordSuccess
	                    ;
			checkpassword_updating.passwordSuccess = true;
		}
		if (ctx.passwordError
	                     !== void 0) {
			checkpassword_initial_data.passwordError = ctx.passwordError
	                    ;
			checkpassword_updating.passwordError = true;
		}
		if (ctx.newPasswordOk !== void 0) {
			checkpassword_initial_data.passwordOk = ctx.newPasswordOk;
			checkpassword_updating.passwordOk = true;
		}
		var checkpassword = new CheckPassword({
			root: component.root,
			store: component.store,
			data: checkpassword_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkpassword_updating.password && changed.password) {
					newState.newPassword = childState.password;
				}

				if (!checkpassword_updating.passwordHelp && changed.passwordHelp) {
					newState.passwordHelp = childState.passwordHelp;
				}

				if (!checkpassword_updating.passwordSuccess && changed.passwordSuccess) {
					newState.passwordSuccess = childState.passwordSuccess;
				}

				if (!checkpassword_updating.passwordError && changed.passwordError) {
					newState.passwordError = childState.passwordError;
				}

				if (!checkpassword_updating.passwordOk && changed.passwordOk) {
					newState.newPasswordOk = childState.passwordOk;
				}
				component._set(newState);
				checkpassword_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkpassword._bind({ password: 1, passwordHelp: 1, passwordSuccess: 1, passwordError: 1, passwordOk: 1 }, checkpassword.get());
		});

		var formblock1_initial_data = {
		 	error: ctx.passwordError,
		 	label: __('New Password'),
		 	success: ctx.passwordSuccess,
		 	help: ctx.passwordHelp
		 };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		function input1_change_handler() {
			component.set({ showPasswordAsClearText: input1.checked });
		}

		function click_handler_1(event) {
			component.changePassword();
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				button0 = createElement("button");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				if (if_block0) if_block0.c();
				text4 = createText("\n        ");
				input0 = createElement("input");
				formblock0._fragment.c();
				text5 = createText("\n\n        ");
				if_block1.c();
				text6 = createText("\n            ");
				div0 = createElement("div");
				checkpassword._fragment.c();
				formblock1._fragment.c();
				text7 = createText("\n        ");
				div1 = createElement("div");
				label = createElement("label");
				input1 = createElement("input");
				text8 = createText("\n                ");
				raw_before = createElement('noscript');
				text9 = createText("\n\n        ");
				button1 = createElement("button");
				i = createElement("i");
				text10 = createText("  ");
				text11 = createText(text11_value);
				text12 = createText("\n        ");
				hr = createElement("hr");
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-default btn-back";
				addLoc(button0, file, 54, 12, 2006);
				addLoc(h3, file, 52, 8, 1948);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "password");
				input0.className = "input-xlarge";
				addLoc(input0, file, 70, 12, 2582);
				setStyle(div0, "width", "287px");
				addLoc(div0, file, 89, 12, 3236);
				addListener(input1, "change", input1_change_handler);
				setAttribute(input1, "type", "checkbox");
				addLoc(input1, file, 101, 16, 3707);
				label.className = "checkbox";
				addLoc(label, file, 100, 12, 3666);
				div1.className = "control-group";
				setStyle(div1, "margin-top", "-10px");
				setStyle(div1, "margin-bottom", "20px");
				addLoc(div1, file, 99, 8, 3579);
				i.className = i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i, file, 111, 12, 4055);
				addListener(button1, "click", click_handler_1);
				button1.disabled = button1_disabled_value = !(ctx.newPasswordOk && ctx.currentPassword);
				button1.className = "btn btn-primary";
				addLoc(button1, file, 106, 8, 3886);
				addLoc(hr, file, 114, 8, 4202);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				append(h3, text1);
				append(h3, button0);
				append(button0, text2);
				insert(target, text3, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text4, anchor);
				append(formblock0._slotted.default, input0);

				input0.value = ctx.currentPassword;

				formblock0._mount(target, anchor);
				insert(target, text5, anchor);
				if_block1.m(formblock1._slotted.default, null);
				append(formblock1._slotted.default, text6);
				append(formblock1._slotted.default, div0);
				checkpassword._mount(div0, null);
				formblock1._mount(target, anchor);
				insert(target, text7, anchor);
				insert(target, div1, anchor);
				append(div1, label);
				append(label, input1);

				input1.checked = ctx.showPasswordAsClearText;

				append(label, text8);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, text9, anchor);
				insert(target, button1, anchor);
				append(button1, i);
				append(button1, text10);
				append(button1, text11);
				insert(target, text12, anchor);
				insert(target, hr, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.changePassword && ctx.error) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(text4.parentNode, text4);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input0_updating && changed.currentPassword) input0.value = ctx.currentPassword;

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(text6.parentNode, text6);
				}

				var checkpassword_changes = {};
				if (!checkpassword_updating.password && changed.newPassword) {
					checkpassword_changes.password = ctx.newPassword;
					checkpassword_updating.password = ctx.newPassword !== void 0;
				}
				if (!checkpassword_updating.passwordHelp && changed.passwordHelp) {
					checkpassword_changes.passwordHelp = ctx.passwordHelp
	                    ;
					checkpassword_updating.passwordHelp = ctx.passwordHelp
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordSuccess && changed.passwordSuccess) {
					checkpassword_changes.passwordSuccess = ctx.passwordSuccess
	                    ;
					checkpassword_updating.passwordSuccess = ctx.passwordSuccess
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordError && changed.passwordError) {
					checkpassword_changes.passwordError = ctx.passwordError
	                    ;
					checkpassword_updating.passwordError = ctx.passwordError
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordOk && changed.newPasswordOk) {
					checkpassword_changes.passwordOk = ctx.newPasswordOk;
					checkpassword_updating.passwordOk = ctx.newPasswordOk !== void 0;
				}
				checkpassword._set(checkpassword_changes);
				checkpassword_updating = {};

				var formblock1_changes = {};
				if (changed.passwordError) formblock1_changes.error = ctx.passwordError;
				if (changed.passwordSuccess) formblock1_changes.success = ctx.passwordSuccess;
				if (changed.passwordHelp) formblock1_changes.help = ctx.passwordHelp;
				formblock1._set(formblock1_changes);

				if (changed.showPasswordAsClearText) input1.checked = ctx.showPasswordAsClearText;
				if ((changed.savingPassword) && i_class_value !== (i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
					i.className = i_class_value;
				}

				if ((changed.newPasswordOk || changed.currentPassword) && button1_disabled_value !== (button1_disabled_value = !(ctx.newPasswordOk && ctx.currentPassword))) {
					button1.disabled = button1_disabled_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text3);
				}

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text4);
				}

				removeListener(input0, "input", input0_input_handler);
				formblock0.destroy(detach);
				if (detach) {
					detachNode(text5);
				}

				if_block1.d();
				checkpassword.destroy();
				formblock1.destroy(detach);
				if (detach) {
					detachNode(text7);
					detachNode(div1);
				}

				removeListener(input1, "change", input1_change_handler);
				if (detach) {
					detachNode(text9);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
				if (detach) {
					detachNode(text12);
					detachNode(hr);
				}
			}
		};
	}

	// (42:8) {#if !changePassword}
	function create_if_block_4(component, ctx) {
		var input, text0, button, text1_value = __("account / password"), text1;

		function click_handler(event) {
			component.set({changePassword: true, error: null});
		}

		var formblock_initial_data = { label: __('Password'), help: "" };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				input = createElement("input");
				text0 = createText("\n            ");
				button = createElement("button");
				text1 = createText(text1_value);
				formblock._fragment.c();
				input.disabled = true;
				input.value = "abcdefgh";
				setAttribute(input, "type", "password");
				addLoc(input, file, 43, 12, 1633);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				addLoc(button, file, 44, 12, 1697);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, input);
				append(formblock._slotted.default, text0);
				append(formblock._slotted.default, button);
				append(button, text1);
				formblock._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				removeListener(button, "click", click_handler);
				formblock.destroy(detach);
			}
		};
	}

	// (62:8) {#if changePassword && error}
	function create_if_block_6(component, ctx) {
		var div, raw_value = __(ctx.error.translationKey || 'account / change-password / unknown-error');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-danger";
				addLoc(div, file, 62, 8, 2268);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.error) && raw_value !== (raw_value = __(ctx.error.translationKey || 'account / change-password / unknown-error'))) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (82:12) {:else}
	function create_else_block_2(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ newPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				setAttribute(input, "type", "password");
				input.className = "input-xlarge";
				addLoc(input, file, 82, 12, 3037);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.newPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newPassword) input.value = ctx.newPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (80:12) {#if showPasswordAsClearText}
	function create_if_block_5(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ newPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				setAttribute(input, "type", "text");
				input.className = "input-xlarge";
				addLoc(input, file, 80, 12, 2916);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.newPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newPassword) input.value = ctx.newPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (177:8) {:else}
	function create_else_block(component, ctx) {
		var button, text_value = __("account / delete"), text;

		function click_handler(event) {
			component.set({deleteAccount: true, error: null});
		}

		var formblock_initial_data = { label: "Delete account", help: "" };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				button = createElement("button");
				text = createText(text_value);
				formblock._fragment.c();
				addListener(button, "click", click_handler);
				button.className = "btn btn-danger";
				setAttribute(button, "href", "#");
				addLoc(button, file, 178, 12, 7063);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, button);
				append(button, text);
				formblock._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				removeListener(button, "click", click_handler);
				formblock.destroy(detach);
			}
		};
	}

	// (159:31) 
	function create_if_block_3(component, ctx) {
		var h3, i0, text0, text1_value = __("account / confirm-account-deletion"), text1, text2, button0, i1, text3, text4_value = __("account / confirm-account-deletion / no"), text4, text5, text6_value = __("account / or"), text6, text7, button1, i2, text8, text9_value = __("account / confirm-account-deletion / yes"), text9;

		function click_handler(event) {
			component.set({deleteAccount: false, error: null});
		}

		function click_handler_1(event) {
			component.set({deleteAccount: false, deleteAccount2: true, error: null});
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				i0 = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				text2 = createText("\n        ");
				button0 = createElement("button");
				i1 = createElement("i");
				text3 = createText("\n              ");
				text4 = createText(text4_value);
				text5 = createText("\n\n        ");
				text6 = createText(text6_value);
				text7 = createText("\n\n        ");
				button1 = createElement("button");
				i2 = createElement("i");
				text8 = createText("   ");
				text9 = createText(text9_value);
				i0.className = "fa fa-times svelte-1uqq9ww";
				addLoc(i0, file, 159, 12, 6340);
				h3.className = "svelte-1uqq9ww";
				addLoc(h3, file, 159, 8, 6336);
				i1.className = "fa fa-chevron-left";
				addLoc(i1, file, 164, 12, 6565);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-back btn-primary";
				addLoc(button0, file, 160, 8, 6426);
				i2.className = "fa fa-times";
				addLoc(i2, file, 174, 12, 6880);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-default";
				addLoc(button1, file, 170, 8, 6728);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, i0);
				append(h3, text0);
				append(h3, text1);
				insert(target, text2, anchor);
				insert(target, button0, anchor);
				append(button0, i1);
				append(button0, text3);
				append(button0, text4);
				insert(target, text5, anchor);
				insert(target, text6, anchor);
				insert(target, text7, anchor);
				insert(target, button1, anchor);
				append(button1, i2);
				append(button1, text8);
				append(button1, text9);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text2);
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text5);
					detachNode(text6);
					detachNode(text7);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (121:32) 
	function create_if_block_1(component, ctx) {
		var h2, text0_value = __("account / delete / hed"), text0, text1, div1, p0, text2_value = __("account / delete / really"), text2, text3, ul, li0, text4_value = __("account / confirm-account-deletion / free"), text4, text5, li1, text6_value = __("You cannot login and logout anymore."), text6, text7, li2, text8_value = __("You cannot edit or remove your charts anymore."), text8, text9, p1, text10_value = __("account / delete / charts-stay-online"), text10, text11, text12, input0, input0_updating = false, text13, input1, input1_updating = false, text14, p2, raw_value = __("account / delete / really-really"), text15, div0, button0, i0, text16, text17_value = __("No, I changed my mind.."), text17, text18, button1, i1, i1_class_value, text19, text20_value = __("Yes, delete it!"), text20;

		var if_block = (ctx.error) && create_if_block_2(component, ctx);

		function input0_input_handler() {
			input0_updating = true;
			component.set({ confirmEmail: input0.value });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			component.set({ confirmPassword: input1.value });
			input1_updating = false;
		}

		var formblock_initial_data = {
		 	label: __('Please enter your password to confirm the deletion request:'),
		 	error: ctx.deleteAccountFormBlockError
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function click_handler(event) {
			component.set({deleteAccount2: false, error: null});
		}

		function click_handler_1(event) {
			component.deleteAccount();
		}

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				div1 = createElement("div");
				p0 = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n            ");
				ul = createElement("ul");
				li0 = createElement("li");
				text4 = createText(text4_value);
				text5 = createText("\n                ");
				li1 = createElement("li");
				text6 = createText(text6_value);
				text7 = createText("\n                ");
				li2 = createElement("li");
				text8 = createText(text8_value);
				text9 = createText("\n            ");
				p1 = createElement("p");
				text10 = createText(text10_value);
				text11 = createText("\n\n            ");
				if (if_block) if_block.c();
				text12 = createText("\n            ");
				input0 = createElement("input");
				text13 = createText("\n                ");
				input1 = createElement("input");
				formblock._fragment.c();
				text14 = createText("\n            ");
				p2 = createElement("p");
				text15 = createText("\n            ");
				div0 = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text16 = createText("  ");
				text17 = createText(text17_value);
				text18 = createText("\n                ");
				button1 = createElement("button");
				i1 = createElement("i");
				text19 = createText(" \n                    ");
				text20 = createText(text20_value);
				setStyle(h2, "margin-bottom", "20px");
				addLoc(h2, file, 121, 8, 4499);
				addLoc(p0, file, 123, 12, 4618);
				addLoc(li0, file, 125, 16, 4694);
				addLoc(li1, file, 126, 16, 4771);
				addLoc(li2, file, 127, 16, 4843);
				addLoc(ul, file, 124, 12, 4673);
				addLoc(p1, file, 129, 12, 4939);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "email");
				input0.placeholder = __('E-Mail');
				addLoc(input0, file, 140, 16, 5389);
				addListener(input1, "input", input1_input_handler);
				setAttribute(input1, "type", "password");
				input1.placeholder = __('Password');
				addLoc(input1, file, 141, 16, 5485);
				p2.className = "lead";
				addLoc(p2, file, 147, 12, 5686);
				i0.className = "fa fa-chevron-left";
				addLoc(i0, file, 150, 20, 5913);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-info";
				addLoc(button0, file, 149, 16, 5810);
				i1.className = i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i1, file, 153, 20, 6109);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-danger";
				addLoc(button1, file, 152, 16, 6030);
				div0.className = "control-group";
				addLoc(div0, file, 148, 12, 5766);
				div1.className = "delete-account";
				addLoc(div1, file, 122, 8, 4577);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, p0);
				append(p0, text2);
				append(div1, text3);
				append(div1, ul);
				append(ul, li0);
				append(li0, text4);
				append(ul, text5);
				append(ul, li1);
				append(li1, text6);
				append(ul, text7);
				append(ul, li2);
				append(li2, text8);
				append(div1, text9);
				append(div1, p1);
				append(p1, text10);
				append(div1, text11);
				if (if_block) if_block.m(div1, null);
				append(div1, text12);
				append(formblock._slotted.default, input0);

				input0.value = ctx.confirmEmail;

				append(formblock._slotted.default, text13);
				append(formblock._slotted.default, input1);

				input1.value = ctx.confirmPassword;

				formblock._mount(div1, null);
				append(div1, text14);
				append(div1, p2);
				p2.innerHTML = raw_value;
				append(div1, text15);
				append(div1, div0);
				append(div0, button0);
				append(button0, i0);
				append(button0, text16);
				append(button0, text17);
				append(div0, text18);
				append(div0, button1);
				append(button1, i1);
				append(button1, text19);
				append(button1, text20);
			},

			p: function update(changed, ctx) {
				if (ctx.error) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2(component, ctx);
						if_block.c();
						if_block.m(div1, text12);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!input0_updating && changed.confirmEmail) input0.value = ctx.confirmEmail;
				if (!input1_updating && changed.confirmPassword) input1.value = ctx.confirmPassword;

				var formblock_changes = {};
				if (changed.deleteAccountFormBlockError) formblock_changes.error = ctx.deleteAccountFormBlockError;
				formblock._set(formblock_changes);

				if ((changed.deletingAccount) && i1_class_value !== (i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
					i1.className = i1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(div1);
				}

				if (if_block) if_block.d();
				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
				formblock.destroy();
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (116:14) {#if deleteAccount3}
	function create_if_block(component, ctx) {
		var h2, text0_value = __("account / delete / hed"), text0, text1, h3, text2_value = __("Your account has been deleted."), text2, text3, a, text4_value = __("Goodbye!"), text4;

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				h3 = createElement("h3");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				a = createElement("a");
				text4 = createText(text4_value);
				setStyle(h2, "margin-bottom", "20px");
				addLoc(h2, file, 116, 8, 4252);
				addLoc(h3, file, 117, 8, 4330);
				a.href = "/";
				a.className = "btn btn-primary btn-large";
				addLoc(a, file, 118, 8, 4388);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				insert(target, h3, anchor);
				append(h3, text2);
				insert(target, text3, anchor);
				insert(target, a, anchor);
				append(a, text4);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(h3);
					detachNode(text3);
					detachNode(a);
				}
			}
		};
	}

	// (132:12) {#if error}
	function create_if_block_2(component, ctx) {
		var div, raw_value = __(ctx.error.translationKey || 'account / delete / unknown-error');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-danger";
				addLoc(div, file, 132, 12, 5031);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.error) && raw_value !== (raw_value = __(ctx.error.translationKey || 'account / delete / unknown-error'))) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function EditProfile(options) {
		this._debugName = '<EditProfile>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ changeEmail: 1, error: 1, deleteAccount2: 1 }, this._state);
		if (!('changeEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'changeEmail'");
		if (!('error' in this._state)) console.warn("<EditProfile> was created without expected data property 'error'");
		if (!('deleteAccount2' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount2'");
		if (!('messages' in this._state)) console.warn("<EditProfile> was created without expected data property 'messages'");

		if (!('newEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'newEmail'");
		if (!('savingEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'savingEmail'");
		if (!('email' in this._state)) console.warn("<EditProfile> was created without expected data property 'email'");
		if (!('changePassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'changePassword'");
		if (!('currentPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'currentPassword'");
		if (!('passwordError' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordError'");
		if (!('passwordSuccess' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordSuccess'");
		if (!('passwordHelp' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordHelp'");
		if (!('showPasswordAsClearText' in this._state)) console.warn("<EditProfile> was created without expected data property 'showPasswordAsClearText'");
		if (!('newPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'newPassword'");
		if (!('newPasswordOk' in this._state)) console.warn("<EditProfile> was created without expected data property 'newPasswordOk'");
		if (!('savingPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'savingPassword'");
		if (!('deleteAccount3' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount3'");

		if (!('confirmEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'confirmEmail'");
		if (!('confirmPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'confirmPassword'");
		if (!('deletingAccount' in this._state)) console.warn("<EditProfile> was created without expected data property 'deletingAccount'");
		if (!('deleteAccount' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount'");
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

	assign(EditProfile.prototype, protoDev);
	assign(EditProfile.prototype, methods);

	EditProfile.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('changeEmailFormBlockError' in newState && !this._updatingReadonlyProperty) throw new Error("<EditProfile>: Cannot set read-only property 'changeEmailFormBlockError'");
		if ('deleteAccountFormBlockError' in newState && !this._updatingReadonlyProperty) throw new Error("<EditProfile>: Cannot set read-only property 'deleteAccountFormBlockError'");
	};

	EditProfile.prototype._recompute = function _recompute(changed, state) {
		if (changed.changeEmail || changed.error) {
			if (this._differs(state.changeEmailFormBlockError, (state.changeEmailFormBlockError = changeEmailFormBlockError(state)))) changed.changeEmailFormBlockError = true;
		}

		if (changed.deleteAccount2 || changed.error) {
			if (this._differs(state.deleteAccountFormBlockError, (state.deleteAccountFormBlockError = deleteAccountFormBlockError(state)))) changed.deleteAccountFormBlockError = true;
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

	var main = { App: EditProfile, data, store };

	return main;

})));
//# sourceMappingURL=profile.js.map
