(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/team-settings/members', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['team-settings/members'] = factory());
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

	function detachBetween(before, after) {
		while (before.nextSibling && before.nextSibling !== after) {
			before.parentNode.removeChild(before.nextSibling);
		}
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

	function reinsertBetween(before, after, target) {
		while (before.nextSibling && before.nextSibling !== after) {
			target.appendChild(before.parentNode.removeChild(before.nextSibling));
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

	function setXlinkAttribute(node, attribute, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
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

	function removeFromStore() {
		this.store._remove(this);
	}

	var protoDev = {
		destroy: destroyDev,
		get: get$1,
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

	/* node_modules/@datawrapper/controls/TableDisplay.html generated by Svelte v2.16.1 */

	const ORDER = { true: 'ASC', false: 'DESC' };
	const DEFAULT_ORDER = ORDER.true;

	function isActive({ orderBy }) {
		return item =>
	    orderBy === item.orderBy;
	}

	function isAscending({ order }) {
		return order === DEFAULT_ORDER;
	}

	function data$a() {
		return {
	    order: DEFAULT_ORDER,
	    orderBy: '',
	    uid: ''
	};
	}

	var methods$7 = {
	    sort(event, orderBy) {
	        event.preventDefault();

	        // if `orderBy` didn't change, invert sort order:
	        const order = (current => {
	            if (orderBy === current.orderBy) {
	                return ORDER[current.order !== DEFAULT_ORDER];
	            } else {
	                return DEFAULT_ORDER;
	            }
	        })(this.get());

	        this.set({ orderBy, order });
	        this.fire('sort', { orderBy, order });
	    }
	};

	const file$a = "node_modules/datawrapper/controls/TableDisplay.html";

	function click_handler$2(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.item.orderBy);
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$a(component, ctx) {
		var div, table, colgroup, text0, thead, tr, text1, tbody, slot_content_default = component._slotted.default;

		var each0_value = ctx.columnHeaders;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1$1(component, get_each0_context(ctx, each0_value, i));
		}

		var each1_value = ctx.columnHeaders;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block$3(component, get_each1_context(ctx, each1_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				table = createElement("table");
				colgroup = createElement("colgroup");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text0 = createText("\n\n        ");
				thead = createElement("thead");
				tr = createElement("tr");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text1 = createText("\n\n        ");
				tbody = createElement("tbody");
				addLoc(colgroup, file$a, 2, 8, 81);
				addLoc(tr, file$a, 9, 12, 251);
				addLoc(thead, file$a, 8, 8, 231);
				addLoc(tbody, file$a, 39, 8, 1257);
				table.className = "table svelte-l1s1ms";
				addLoc(table, file$a, 1, 4, 51);
				div.className = "table-container svelte-l1s1ms";
				div.dataset.uid = ctx.uid;
				addLoc(div, file$a, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, table);
				append(table, colgroup);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(colgroup, null);
				}

				append(table, text0);
				append(table, thead);
				append(thead, tr);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(tr, null);
				}

				append(table, text1);
				append(table, tbody);

				if (slot_content_default) {
					append(tbody, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (changed.columnHeaders) {
					each0_value = ctx.columnHeaders;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_1$1(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(colgroup, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.columnHeaders || changed.isActive || changed.isAscending) {
					each1_value = ctx.columnHeaders;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block$3(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(tr, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				if (slot_content_default) {
					reinsertChildren(tbody, slot_content_default);
				}
			}
		};
	}

	// (4:12) {#each columnHeaders as item}
	function create_each_block_1$1(component, ctx) {
		var col;

		return {
			c: function create() {
				col = createElement("col");
				setStyle(col, "width", ctx.item.width);
				addLoc(col, file$a, 4, 12, 146);
			},

			m: function mount(target, anchor) {
				insert(target, col, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.columnHeaders) {
					setStyle(col, "width", ctx.item.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(col);
				}
			}
		};
	}

	// (32:20) {:else}
	function create_else_block$3(component, ctx) {
		var span, text_value = ctx.item.title, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "col";
				addLoc(span, file$a, 32, 20, 1103);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.columnHeaders) && text_value !== (text_value = ctx.item.title)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (13:20) {#if item.orderBy}
	function create_if_block$8(component, ctx) {
		var a, text_value = ctx.item.title, text, a_class_value, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler$2);
				a.className = a_class_value = "\n                            sortable\n                            " + (ctx.isActive(ctx.item)
	                            ?
	                            ctx.isAscending
	                            ?
	                            'sortable-asc'
	                            :
	                            'sortable-desc'
	                            :
	                            '') + "\n                        " + " svelte-l1s1ms";
				a.href = a_href_value = `?orderBy=${ctx.item.orderBy}`;
				addLoc(a, file$a, 13, 20, 429);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.columnHeaders) && text_value !== (text_value = ctx.item.title)) {
					setData(text, text_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.isActive || changed.columnHeaders || changed.isAscending) && a_class_value !== (a_class_value = "\n                            sortable\n                            " + (ctx.isActive(ctx.item)
	                            ?
	                            ctx.isAscending
	                            ?
	                            'sortable-asc'
	                            :
	                            'sortable-desc'
	                            :
	                            '') + "\n                        " + " svelte-l1s1ms")) {
					a.className = a_class_value;
				}

				if ((changed.columnHeaders) && a_href_value !== (a_href_value = `?orderBy=${ctx.item.orderBy}`)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler$2);
			}
		};
	}

	// (11:16) {#each columnHeaders as item}
	function create_each_block$3(component, ctx) {
		var th, th_class_value;

		function select_block_type(ctx) {
			if (ctx.item.orderBy) return create_if_block$8;
			return create_else_block$3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				th = createElement("th");
				if_block.c();
				th.className = th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-l1s1ms";
				addLoc(th, file$a, 11, 16, 318);
			},

			m: function mount(target, anchor) {
				insert(target, th, anchor);
				if_block.m(th, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(th, null);
				}

				if ((changed.columnHeaders) && th_class_value !== (th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-l1s1ms")) {
					th.className = th_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(th);
				}

				if_block.d();
			}
		};
	}

	function TableDisplay(options) {
		this._debugName = '<TableDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$a(), options.data);

		this._recompute({ orderBy: 1, order: 1 }, this._state);
		if (!('orderBy' in this._state)) console.warn("<TableDisplay> was created without expected data property 'orderBy'");
		if (!('order' in this._state)) console.warn("<TableDisplay> was created without expected data property 'order'");
		if (!('uid' in this._state)) console.warn("<TableDisplay> was created without expected data property 'uid'");
		if (!('columnHeaders' in this._state)) console.warn("<TableDisplay> was created without expected data property 'columnHeaders'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TableDisplay.prototype, protoDev);
	assign(TableDisplay.prototype, methods$7);

	TableDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isActive' in newState && !this._updatingReadonlyProperty) throw new Error("<TableDisplay>: Cannot set read-only property 'isActive'");
		if ('isAscending' in newState && !this._updatingReadonlyProperty) throw new Error("<TableDisplay>: Cannot set read-only property 'isAscending'");
	};

	TableDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.orderBy) {
			if (this._differs(state.isActive, (state.isActive = isActive(state)))) changed.isActive = true;
		}

		if (changed.order) {
			if (this._differs(state.isAscending, (state.isAscending = isAscending(state)))) changed.isAscending = true;
		}
	};

	/* node_modules/@datawrapper/controls/SelectInput.html generated by Svelte v2.16.1 */

	function data$9() {
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
	const file$9 = "node_modules/datawrapper/controls/SelectInput.html";

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

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$9(component, ctx) {
		var select, if_block0_anchor, select_updating = false, select_class_value;

		var if_block0 = (ctx.options.length) && create_if_block_1$5(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$7(component, ctx);

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
				addLoc(select, file$9, 0, 0, 0);
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
						if_block0 = create_if_block_1$5(component, ctx);
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
						if_block1 = create_if_block$7(component, ctx);
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
	function create_if_block_1$5(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context$2(ctx, each_value, i));
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
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
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
	function create_each_block_2(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$9, 9, 4, 229);
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
	function create_if_block$7(component, ctx) {
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
	function create_each_block_1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$9, 13, 8, 470);
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
			each_blocks[i] = create_each_block_1(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$9, 11, 4, 386);
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
							each_blocks[i] = create_each_block_1(component, child_ctx);
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
		this._state = assign(data$9(), options.data);
		if (!('class' in this._state)) console.warn("<SelectInput> was created without expected data property 'class'");
		if (!('disabled' in this._state)) console.warn("<SelectInput> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<SelectInput> was created without expected data property 'width'");
		if (!('uid' in this._state)) console.warn("<SelectInput> was created without expected data property 'uid'");
		if (!('options' in this._state)) console.warn("<SelectInput> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectInput> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$9(this, this._state);

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

	/* node_modules/@datawrapper/controls/IconDisplay.html generated by Svelte v2.16.1 */

	// Path to SVG tile set on https://app.datawrapper.de:
	const DEFAULT_ASSET_URL = '/lib/icons/symbol/svg/sprite.symbol.svg';

	function iconURL({ icon, assetURL }) {
		return `${assetURL || DEFAULT_ASSET_URL}#${icon}`;
	}

	function data$8() {
	    return {
	        icon: 'api',
	        size: '1em',
	        color: 'inherit',
	        valign: 'baseline',
	        class: '',
	        style: '',
	        assetURL: null,
	        spin: false,
	        timing: 'linear',
	        duration: '2s',
	        uid: ''
	    };
	}
	const file$8 = "node_modules/datawrapper/controls/IconDisplay.html";

	function create_main_fragment$8(component, ctx) {
		var span, svg, use, span_class_value;

		return {
			c: function create() {
				span = createElement("span");
				svg = createSvgElement("svg");
				use = createSvgElement("use");
				setStyle(use, "fill", ctx.color);
				setXlinkAttribute(use, "xlink:href", ctx.iconURL);
				addLoc(use, file$8, 7, 8, 263);
				setStyle(svg, "height", ctx.size);
				setStyle(svg, "width", ctx.size);
				setAttribute(svg, "class", "svelte-1th5ah8");
				addLoc(svg, file$8, 6, 4, 213);
				span.className = span_class_value = "svg-icon " + ctx.class + " svelte-1th5ah8";
				span.dataset.uid = ctx.uid;
				setStyle(span, "animation-timing-function", ctx.timing);
				setStyle(span, "animation-duration", ctx.duration);
				setStyle(span, "height", ctx.size);
				setStyle(span, "width", ctx.size);
				setStyle(span, "vertical-align", ctx.valign);
				toggleClass(span, "spin", ctx.spin);
				addLoc(span, file$8, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, svg);
				append(svg, use);
			},

			p: function update(changed, ctx) {
				if (changed.color) {
					setStyle(use, "fill", ctx.color);
				}

				if (changed.iconURL) {
					setXlinkAttribute(use, "xlink:href", ctx.iconURL);
				}

				if (changed.size) {
					setStyle(svg, "height", ctx.size);
					setStyle(svg, "width", ctx.size);
				}

				if ((changed.class) && span_class_value !== (span_class_value = "svg-icon " + ctx.class + " svelte-1th5ah8")) {
					span.className = span_class_value;
				}

				if (changed.uid) {
					span.dataset.uid = ctx.uid;
				}

				if (changed.timing) {
					setStyle(span, "animation-timing-function", ctx.timing);
				}

				if (changed.duration) {
					setStyle(span, "animation-duration", ctx.duration);
				}

				if (changed.size) {
					setStyle(span, "height", ctx.size);
					setStyle(span, "width", ctx.size);
				}

				if (changed.valign) {
					setStyle(span, "vertical-align", ctx.valign);
				}

				if ((changed.class || changed.spin)) {
					toggleClass(span, "spin", ctx.spin);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	function IconDisplay(options) {
		this._debugName = '<IconDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);

		this._recompute({ icon: 1, assetURL: 1 }, this._state);
		if (!('icon' in this._state)) console.warn("<IconDisplay> was created without expected data property 'icon'");
		if (!('assetURL' in this._state)) console.warn("<IconDisplay> was created without expected data property 'assetURL'");
		if (!('class' in this._state)) console.warn("<IconDisplay> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<IconDisplay> was created without expected data property 'uid'");
		if (!('timing' in this._state)) console.warn("<IconDisplay> was created without expected data property 'timing'");
		if (!('duration' in this._state)) console.warn("<IconDisplay> was created without expected data property 'duration'");
		if (!('size' in this._state)) console.warn("<IconDisplay> was created without expected data property 'size'");
		if (!('valign' in this._state)) console.warn("<IconDisplay> was created without expected data property 'valign'");
		if (!('color' in this._state)) console.warn("<IconDisplay> was created without expected data property 'color'");
		this._intro = true;

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(IconDisplay.prototype, protoDev);

	IconDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('iconURL' in newState && !this._updatingReadonlyProperty) throw new Error("<IconDisplay>: Cannot set read-only property 'iconURL'");
	};

	IconDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.icon || changed.assetURL) {
			if (this._differs(state.iconURL, (state.iconURL = iconURL(state)))) changed.iconURL = true;
		}
	};

	/* node_modules/@datawrapper/controls/ConfirmationModal.html generated by Svelte v2.16.1 */

	function data$7() {
	    return {
	        title: 'Title',
	        confirmButtonText: 'Confirm',
	        confirmButtonIcon: false,
	        backButtonText: 'Back',
	        open: false
	    };
	}
	var methods$6 = {
	    open() {
	        this.set({ open: true });
	    },
	    dismiss() {
	        this.set({ open: false });
	        this.fire('dismiss');
	    },
	    confirm() {
	        this.set({ open: false });
	        this.fire('confirm');
	    },
	    handleKeystroke(key) {
	        const { open } = this.get();
	        if (open && key === 'Escape') {
	            this.dismiss();
	        }
	    }
	};

	const file$7 = "node_modules/datawrapper/controls/ConfirmationModal.html";

	function create_main_fragment$7(component, ctx) {
		var if_block_anchor;

		function onwindowkeydown(event) {
			component.handleKeystroke(event.key);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.open) && create_if_block$6(component, ctx);

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
				if (ctx.open) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$6(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("keydown", onwindowkeydown);

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if open}
	function create_if_block$6(component, ctx) {
		var div3, div2, button0, text0, div1, h1, text1, slot_content_default = component._slotted.default, slot_content_default_before, slot_content_default_after, text2, div0, button1, text3, button2, text4, raw2_before, text5, div4;

		var icondisplay_initial_data = { icon: "close", size: "20px" };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		function click_handler(event) {
			component.dismiss();
		}

		function click_handler_1(event) {
			component.dismiss();
		}

		var if_block = (ctx.confirmButtonIcon) && create_if_block_1$4(component, ctx);

		function click_handler_2(event) {
			component.confirm();
		}

		function keyup_handler(event) {
			event.stopPropagation();
			component.fire("keyup", event);
		}

		function click_handler_3(event) {
			component.dismiss();
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div2 = createElement("div");
				button0 = createElement("button");
				icondisplay._fragment.c();
				text0 = createText("\n        ");
				div1 = createElement("div");
				h1 = createElement("h1");
				text1 = createText("\n            ");
				text2 = createText("\n            ");
				div0 = createElement("div");
				button1 = createElement("button");
				text3 = createText("\n                ");
				button2 = createElement("button");
				if (if_block) if_block.c();
				text4 = createText(" ");
				raw2_before = createElement('noscript');
				text5 = createText("\n");
				div4 = createElement("div");
				addListener(button0, "click", click_handler);
				button0.type = "button";
				button0.className = "close svelte-1f9lfqa";
				setAttribute(button0, "aria-label", ctx.backButtonText);
				addLoc(button0, file$7, 3, 8, 93);
				h1.className = "modal-title mb-4 svelte-1f9lfqa";
				addLoc(h1, file$7, 7, 12, 300);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn back svelte-1f9lfqa";
				addLoc(button1, file$7, 10, 16, 429);
				addListener(button2, "click", click_handler_2);
				button2.className = "btn btn-danger svelte-1f9lfqa";
				addLoc(button2, file$7, 11, 16, 523);
				div0.className = "actions pt-4 mt-4 svelte-1f9lfqa";
				addLoc(div0, file$7, 9, 12, 381);
				div1.className = "modal-content svelte-1f9lfqa";
				addLoc(div1, file$7, 6, 8, 260);
				addListener(div2, "keyup", keyup_handler);
				div2.className = "modal-body";
				addLoc(div2, file$7, 2, 4, 35);
				div3.className = "modal";
				addLoc(div3, file$7, 1, 0, 11);
				addListener(div4, "click", click_handler_3);
				div4.className = "modal-backdrop";
				addLoc(div4, file$7, 25, 0, 971);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div2);
				append(div2, button0);
				icondisplay._mount(button0, null);
				append(div2, text0);
				append(div2, div1);
				append(div1, h1);
				h1.innerHTML = ctx.title;
				append(div1, text1);

				if (slot_content_default) {
					append(div1, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div1, slot_content_default);
					append(div1, slot_content_default_after || (slot_content_default_after = createComment()));
				}

				append(div1, text2);
				append(div1, div0);
				append(div0, button1);
				button1.innerHTML = ctx.backButtonText;
				append(div0, text3);
				append(div0, button2);
				if (if_block) if_block.m(button2, null);
				append(button2, text4);
				append(button2, raw2_before);
				raw2_before.insertAdjacentHTML("afterend", ctx.confirmButtonText);
				insert(target, text5, anchor);
				insert(target, div4, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.backButtonText) {
					setAttribute(button0, "aria-label", ctx.backButtonText);
				}

				if (changed.title) {
					h1.innerHTML = ctx.title;
				}

				if (changed.backButtonText) {
					button1.innerHTML = ctx.backButtonText;
				}

				if (ctx.confirmButtonIcon) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$4(component, ctx);
						if_block.c();
						if_block.m(button2, text4);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.confirmButtonText) {
					detachAfter(raw2_before);
					raw2_before.insertAdjacentHTML("afterend", ctx.confirmButtonText);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				icondisplay.destroy();
				removeListener(button0, "click", click_handler);

				if (slot_content_default) {
					reinsertBetween(slot_content_default_before, slot_content_default_after, slot_content_default);
					detachNode(slot_content_default_before);
					detachNode(slot_content_default_after);
				}

				removeListener(button1, "click", click_handler_1);
				if (if_block) if_block.d();
				removeListener(button2, "click", click_handler_2);
				removeListener(div2, "keyup", keyup_handler);
				if (detach) {
					detachNode(text5);
					detachNode(div4);
				}

				removeListener(div4, "click", click_handler_3);
			}
		};
	}

	// (13:20) {#if confirmButtonIcon}
	function create_if_block_1$4(component, ctx) {

		var icondisplay_initial_data = {
		 	icon: ctx.confirmButtonIcon,
		 	class: "mr-1",
		 	size: "1.3em",
		 	valign: "-0.3em"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.confirmButtonIcon) icondisplay_changes.icon = ctx.confirmButtonIcon;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
			}
		};
	}

	function ConfirmationModal(options) {
		this._debugName = '<ConfirmationModal>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$7(), options.data);
		if (!('open' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'open'");
		if (!('backButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'backButtonText'");
		if (!('title' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'title'");
		if (!('confirmButtonIcon' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonIcon'");
		if (!('confirmButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonText'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ConfirmationModal.prototype, protoDev);
	assign(ConfirmationModal.prototype, methods$6);

	ConfirmationModal.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var upgradeIcon = '<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>';

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

	/* node_modules/@datawrapper/controls/AlertDisplay.html generated by Svelte v2.16.1 */


	function data$6() {
	    return {
	        visible: false,
	        type: '',
	        closeable: true,
	        class: '',
	        closeFunc: false,
	        uid: '',
	        title: ''
	    };
	}
	var methods$5 = {
	    close() {
	        const { closeFunc } = this.get();
	        if (closeFunc) {
	            closeFunc();
	        } else {
	            this.set({ visible: false });
	            this.fire('close');
	        }
	    }
	};

	const file$6 = "node_modules/datawrapper/controls/AlertDisplay.html";

	function create_main_fragment$6(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block$5(component, ctx);

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
				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$5(component, ctx);
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

	// (1:0) {#if visible}
	function create_if_block$5(component, ctx) {
		var div, div_class_value;

		function select_block_type(ctx) {
			if (ctx.type ==='upgrade-info') return create_if_block_1$3;
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.className = div_class_value = "alert " + ctx.class + " svelte-1h26igv";
				div.dataset.uid = ctx.uid;
				toggleClass(div, "alert-intro", ctx.type==='intro');
				toggleClass(div, "alert-success", ctx.type==='success');
				toggleClass(div, "alert-warning", ctx.type==='warning');
				toggleClass(div, "alert-error", ctx.type==='error');
				toggleClass(div, "alert-info", ctx.type==='info');
				toggleClass(div, "alert-upgrade-info", ctx.type==='upgrade-info');
				toggleClass(div, "has-header", !!ctx.title);
				addLoc(div, file$6, 1, 0, 14);
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

				if ((changed.class) && div_class_value !== (div_class_value = "alert " + ctx.class + " svelte-1h26igv")) {
					div.className = div_class_value;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
				}

				if ((changed.class || changed.type)) {
					toggleClass(div, "alert-intro", ctx.type==='intro');
					toggleClass(div, "alert-success", ctx.type==='success');
					toggleClass(div, "alert-warning", ctx.type==='warning');
					toggleClass(div, "alert-error", ctx.type==='error');
					toggleClass(div, "alert-info", ctx.type==='info');
					toggleClass(div, "alert-upgrade-info", ctx.type==='upgrade-info');
				}

				if ((changed.class || changed.title)) {
					toggleClass(div, "has-header", !!ctx.title);
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

	// (16:4) {:else}
	function create_else_block$2(component, ctx) {
		var text0, slot_content_default = component._slotted.default, slot_content_default_before, slot_content_default_after, text1;

		var if_block = (ctx.closeable || ctx.title) && create_if_block_2$3(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				text0 = createText("\n    ");
				if (!slot_content_default) {
					text1 = createText("content");
				}
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, text0, anchor);
				if (!slot_content_default) {
					insert(target, text1, anchor);
				}

				else {
					insert(target, slot_content_default_before || (slot_content_default_before = createComment()), anchor);
					insert(target, slot_content_default, anchor);
					insert(target, slot_content_default_after || (slot_content_default_after = createComment()), anchor);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.closeable || ctx.title) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2$3(component, ctx);
						if_block.c();
						if_block.m(text0.parentNode, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(text0);

				if (!slot_content_default) {
						detachNode(text1);
				}

				}

				else {
					reinsertBetween(slot_content_default_before, slot_content_default_after, slot_content_default);
					detachNode(slot_content_default_before);
					detachNode(slot_content_default_after);
				}
			}
		};
	}

	// (13:4) {#if type ==='upgrade-info'}
	function create_if_block_1$3(component, ctx) {
		var div0, span0, text0, div1, span1, text1_value = __('upgrade-available'), text1, text2, raw1_value = __('upgrade-info'), raw1_before;

		return {
			c: function create() {
				div0 = createElement("div");
				span0 = createElement("span");
				text0 = createText("\n    ");
				div1 = createElement("div");
				span1 = createElement("span");
				text1 = createText(text1_value);
				text2 = createText(" ");
				raw1_before = createElement('noscript');
				span0.className = "upgrade-icon svelte-1h26igv";
				addLoc(span0, file$6, 13, 22, 408);
				div0.className = "icon";
				addLoc(div0, file$6, 13, 4, 390);
				span1.className = "title svelte-1h26igv";
				addLoc(span1, file$6, 14, 9, 477);
				addLoc(div1, file$6, 14, 4, 472);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, span0);
				span0.innerHTML = upgradeIcon;
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				append(div1, span1);
				append(span1, text1);
				append(div1, text2);
				append(div1, raw1_before);
				raw1_before.insertAdjacentHTML("afterend", raw1_value);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
					detachNode(text0);
					detachNode(div1);
				}
			}
		};
	}

	// (16:12) {#if closeable || title}
	function create_if_block_2$3(component, ctx) {
		var div, text0, text1, if_block2_anchor;

		var if_block0 = (ctx.title) && create_if_block_5$1(component, ctx);

		var if_block1 = (ctx.closeable) && create_if_block_4$2(component);

		var if_block2 = (ctx.title) && create_if_block_3$3();

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if (if_block1) if_block1.c();
				text1 = createText("\n    ");
				if (if_block2) if_block2.c();
				if_block2_anchor = createComment();
				div.className = "svelte-1h26igv";
				toggleClass(div, "header", !!ctx.title);
				addLoc(div, file$6, 16, 4, 604);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				if (if_block1) if_block1.m(div, null);
				insert(target, text1, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, if_block2_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.title) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_5$1(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.closeable) {
					if (!if_block1) {
						if_block1 = create_if_block_4$2(component);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.title) {
					toggleClass(div, "header", !!ctx.title);
				}

				if (ctx.title) {
					if (!if_block2) {
						if_block2 = create_if_block_3$3();
						if_block2.c();
						if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (detach) {
					detachNode(text1);
				}

				if (if_block2) if_block2.d(detach);
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (18:8) {#if title}
	function create_if_block_5$1(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.title);
				div.className = "title svelte-1h26igv";
				addLoc(div, file$6, 18, 8, 661);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.title) {
					setData(text, ctx.title);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (20:14) {#if closeable}
	function create_if_block_4$2(component, ctx) {
		var button;

		function click_handler(event) {
			component.close();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "×";
				addListener(button, "click", click_handler);
				button.type = "button";
				setAttribute(button, "aria-label", "close");
				button.className = "close svelte-1h26igv";
				addLoc(button, file$6, 20, 8, 732);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (24:4) {#if title}
	function create_if_block_3$3(component, ctx) {
		var hr;

		return {
			c: function create() {
				hr = createElement("hr");
				hr.className = "svelte-1h26igv";
				addLoc(hr, file$6, 24, 4, 868);
			},

			m: function mount(target, anchor) {
				insert(target, hr, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(hr);
				}
			}
		};
	}

	function AlertDisplay(options) {
		this._debugName = '<AlertDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('visible' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'visible'");
		if (!('type' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'type'");
		if (!('title' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'title'");
		if (!('class' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'uid'");
		if (!('closeable' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'closeable'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(AlertDisplay.prototype, protoDev);
	assign(AlertDisplay.prototype, methods$5);

	AlertDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	const get = (httpReq.get = httpReqVerb('GET'));

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
	const post = (httpReq.post = httpReqVerb('POST'));

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

	/* team-settings/tabs/members/UserTable.html generated by Svelte v2.16.1 */



	const teamRoleOptions = [
	    { value: 'owner', label: __$1('teams / role / owner').replace('&shy;', '') },
	    { value: 'admin', label: __$1('teams / role / admin').replace('&shy;', '') },
	    { value: 'member', label: __$1('teams / role / member').replace('&shy;', '') }
	];

	async function getHttpErrorMessage(ex) {
	    if (ex.name === 'HttpReqError') {
	        try {
	            const json = await ex.response.json();
	            return json.message;
	        } catch (ex) {
	            // do nothing
	        }
	    }
	    return ex.message;
	}

	function roles({ isAdmin, isTeamOwner }) {
	    return isAdmin || isTeamOwner ? teamRoleOptions : teamRoleOptions.slice(1);
	}
	function sortedUsers({ users, isAdmin }) {
	    return users
	        .sort((a, b) => {
	            const roles = ['owner', 'admin', 'member'];

	            if (roles.indexOf(a.role) > roles.indexOf(b.role)) {
	                return 1;
	            } else if (roles.indexOf(a.role) < roles.indexOf(b.role)) {
	                return -1;
	            } else {
	                return a.email > b.email ? 1 : a.email < b.email ? -1 : 0;
	            }
	        })
	        .filter(user => isAdmin || !user.isAdmin);
	}
	function userHeaders({ isAdmin }) {
	    const userHeaders = [
	        { title: __$1('teams / user'), width: '25%' },
	        { title: 'ID', width: '10%' },
	        { title: 'Charts', width: '15%' },
	        { title: __$1('teams / status'), width: '15%' },
	        { title: __$1('teams / actions'), width: '30%' }
	    ];

	    if (!isAdmin) userHeaders.splice(1, 1);

	    return userHeaders;
	}
	function numUsers({ sortedUsers }) {
	    return sortedUsers.filter(user => !user.invitePending).length;
	}
	function numUsersPending({ sortedUsers }) {
	    return sortedUsers.filter(user => user.invitePending).length;
	}
	function numCharts({ users }) {
	    let total = 0;
	    users.forEach(user => {
	        total += user.charts;
	    });
	    return total;
	}
	function numChartsCaption({ numCharts, isAdmin, team }) {
	    if (numCharts === 1) {
	        return __$1('teams / charts-total / 1');
	    } else if (numCharts > 1) {
	        if (isAdmin) {
	            return __$1('teams / charts-total-admin', 'core', {
	                i: numCharts,
	                link: `/admin/chart/by/team/${team.id}`
	            });
	        } else {
	            return __$1('teams / charts-total', 'core', {
	                i: numCharts
	            });
	        }
	    } else {
	        return '';
	    }
	}
	function ownerChangeMessage({ users, editId, team, isTeamOwner }) {
	    const user = users.find(u => u.id === editId);
	    const owner = users.find(u => u.id !== editId && u.role === 'owner');
	    const userEmail = user ? user.name || user.email || user.id : 'non-existent';
	    const ownerEmail = owner ? owner.name || owner.email || owner.id : 'non-existent';
	    return __$1('teams / change-owner-confirmation / message', 'core', {
	        member: `<b>${purifyHTML(userEmail, [])}</b>`,
	        team: `<b>${team.name}</b>`,
	        message: isTeamOwner
	            ? __$1('teams / change-owner-confirmation / owner-message')
	            : __$1('teams / change-owner-confirmation / non-owner-message', 'core', {
	                  member: `<b>${ownerEmail}</b>`
	              })
	    });
	}
	function ownerChangeTitle({ users, editId }) {
	    const user = users.find(u => u.id === editId);
	    const userEmail = user ? user.name || user.email || user.id : 'non-existent';
	    return __$1('teams / change-owner-confirmation / title', 'core', {
	        member: userEmail
	    });
	}
	function data$5() {
	    return {
	        editId: false,
	        error: null,
	        updating: {},
	        users: [],
	        products: []
	    };
	}
	function role(role) {
	    return {
	        member: __$1('teams / role / member'),
	        admin: __$1('teams / role / admin'),
	        owner: __$1('teams / role / owner')
	    }[role];
	}
	var methods$4 = {
	    toggleEdit(userId) {
	        if (this.get().editId === userId) {
	            this.requestUpdateRole(userId);
	        } else {
	            this.set({
	                editId: userId
	            });
	        }
	    },
	    async removeUser(user) {
	        if (!window.confirm(__$1('teams / remove / alert'))) return;

	        try {
	            this.set({ error: null });
	            await httpReq.delete(`/v3/teams/${this.get().team.id}/members/${user.id}`);
	        } catch (ex) {
	            this.set({ error: await getHttpErrorMessage(ex) });
	            return;
	        }

	        var { users } = this.get();
	        users = users.filter(el => el.id !== user.id);
	        this.set({ users });
	    },
	    async requestUpdateRole(userId) {
	        var { users } = this.get();
	        const user = users.filter(u => u.id === userId)[0];

	        if (user.role === 'owner') {
	            // ownership transfer --> ask for confirmation first
	            this.refs.confirmationModal.open();
	            return;
	        }
	        await this.updateRole(userId);
	    },
	    async updateRole(userId) {
	        var { updating, users } = this.get();
	        const user = users.filter(u => u.id === userId)[0];
	        updating[user.id] = true;
	        this.set({ updating });

	        try {
	            this.set({ error: null });
	            await httpReq.put(`/v3/teams/${this.get().team.id}/members/${user.id}/status`, {
	                payload: {
	                    status: user.role
	                }
	            });
	        } catch (ex) {
	            this.set({ error: await getHttpErrorMessage(ex), updating: false });
	        }

	        updating = this.get().updating;
	        updating[user.id] = false;
	        this.set({ updating, editId: false });
	        this.fire('updateUsers');
	    }
	};

	const file$5 = "team-settings/tabs/members/UserTable.html";

	function click_handler_2(event) {
		const { component, ctx } = this._svelte;

		component.removeUser(ctx.user);
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.toggleEdit(ctx.user.id);
	}

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.toggleEdit(ctx.user.id);
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.user = list[i];
		child_ctx.each_value = list;
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$5(component, ctx) {
		var p0, text0, raw0_before, raw0_after, text1, text2, text3, p1, text4, if_block3_anchor;

		function select_block_type(ctx) {
			if (ctx.numUsers === 1) return create_if_block_13;
			if (ctx.numUsers > 1) return create_if_block_14;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.numUsersPending === 1) return create_if_block_11;
			if (ctx.numUsersPending > 1) return create_if_block_12;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block1 = current_block_type_1 && current_block_type_1(component, ctx);

		var if_block2 = (ctx.sortedUsers.length) && create_if_block_1$2(component, ctx);

		var if_block3 = (ctx.products.length) && create_if_block$4(component);

		var confirmationmodal_initial_data = {
		 	confirmButtonText: __$1('teams / change-owner-confirmation / confirm'),
		 	backButtonText: __$1('teams / change-owner-confirmation / back'),
		 	title: ctx.ownerChangeTitle
		 };
		var confirmationmodal = new ConfirmationModal({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: confirmationmodal_initial_data
		});

		confirmationmodal.on("confirm", function(event) {
			component.updateRole(ctx.editId);
		});

		component.refs.confirmationModal = confirmationmodal;

		return {
			c: function create() {
				p0 = createElement("p");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				raw0_before = createElement('noscript');
				raw0_after = createElement('noscript');
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				text2 = createText("\n\n");
				if (if_block2) if_block2.c();
				text3 = createText("\n\n");
				p1 = createElement("p");
				text4 = createText("\n    ");
				if (if_block3) if_block3.c();
				if_block3_anchor = createComment();
				confirmationmodal._fragment.c();
				addLoc(p0, file$5, 0, 0, 0);
				addLoc(p1, file$5, 71, 4, 2678);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				if (if_block0) if_block0.m(p0, null);
				append(p0, text0);
				append(p0, raw0_before);
				raw0_before.insertAdjacentHTML("afterend", ctx.numChartsCaption);
				append(p0, raw0_after);
				append(p0, text1);
				if (if_block1) if_block1.m(p0, null);
				insert(target, text2, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, text3, anchor);
				append(confirmationmodal._slotted.default, p1);
				p1.innerHTML = ctx.ownerChangeMessage;
				append(confirmationmodal._slotted.default, text4);
				if (if_block3) if_block3.m(confirmationmodal._slotted.default, null);
				append(confirmationmodal._slotted.default, if_block3_anchor);
				confirmationmodal._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(p0, text0);
				}

				if (changed.numChartsCaption) {
					detachBetween(raw0_before, raw0_after);
					raw0_before.insertAdjacentHTML("afterend", ctx.numChartsCaption);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if (if_block1) if_block1.d(1);
					if_block1 = current_block_type_1 && current_block_type_1(component, ctx);
					if (if_block1) if_block1.c();
					if (if_block1) if_block1.m(p0, null);
				}

				if (ctx.sortedUsers.length) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1$2(component, ctx);
						if_block2.c();
						if_block2.m(text3.parentNode, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (changed.ownerChangeMessage) {
					p1.innerHTML = ctx.ownerChangeMessage;
				}

				if (ctx.products.length) {
					if (!if_block3) {
						if_block3 = create_if_block$4(component);
						if_block3.c();
						if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				var confirmationmodal_changes = {};
				if (changed.ownerChangeTitle) confirmationmodal_changes.title = ctx.ownerChangeTitle;
				confirmationmodal._set(confirmationmodal_changes);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (detach) {
					detachNode(text2);
				}

				if (if_block2) if_block2.d(detach);
				if (detach) {
					detachNode(text3);
				}

				if (if_block3) if_block3.d();
				confirmationmodal.destroy(detach);
				if (component.refs.confirmationModal === confirmationmodal) component.refs.confirmationModal = null;
			}
		};
	}

	// (5:26) 
	function create_if_block_14(component, ctx) {
		var text_value = __$1('teams / total', 'core', { i: ctx.numUsers }), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.numUsers) && text_value !== (text_value = __$1('teams / total', 'core', { i: ctx.numUsers }))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (3:4) {#if numUsers === 1}
	function create_if_block_13(component, ctx) {
		var text_value = __$1('teams / total / 1'), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (11:33) 
	function create_if_block_12(component, ctx) {
		var text_value = __$1('teams / total-pending', 'core', { i: ctx.numUsersPending }), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.numUsersPending) && text_value !== (text_value = __$1('teams / total-pending', 'core', { i: ctx.numUsersPending }))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (9:4) {#if numUsersPending === 1 }
	function create_if_block_11(component, ctx) {
		var text_value = __$1('teams / total-pending / 1'), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (16:0) {#if sortedUsers.length}
	function create_if_block_1$2(component, ctx) {
		var each_anchor;

		var each_value = ctx.sortedUsers;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		var tabledisplay_initial_data = { columnHeaders: ctx.userHeaders };
		var tabledisplay = new TableDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: tabledisplay_initial_data
		});

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				tabledisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tabledisplay._slotted.default, null);
				}

				append(tabledisplay._slotted.default, each_anchor);
				tabledisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.sortedUsers || changed.error || changed.isAdmin || changed.isTeamOwner || changed.userId || changed.editId || changed.updating || changed.roles) {
					each_value = ctx.sortedUsers;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var tabledisplay_changes = {};
				if (changed.userHeaders) tabledisplay_changes.columnHeaders = ctx.userHeaders;
				tabledisplay._set(tabledisplay_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				tabledisplay.destroy(detach);
			}
		};
	}

	// (21:27) {#if user.invitePending}
	function create_if_block_10(component, ctx) {
		var div, text_value = __$1('teams / invite-pending' ), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "invite-pending-note svelte-cbldz";
				addLoc(div, file$5, 21, 12, 651);
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

	// (25:8) {#if isAdmin}
	function create_if_block_9(component, ctx) {
		var td, a, text_value = ctx.user.id, text, a_href_value;

		return {
			c: function create() {
				td = createElement("td");
				a = createElement("a");
				text = createText(text_value);
				a.href = a_href_value = "/admin/chart/by/user/" + ctx.user.id;
				addLoc(a, file$5, 26, 12, 803);
				addLoc(td, file$5, 25, 8, 786);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				append(td, a);
				append(a, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && text_value !== (text_value = ctx.user.id)) {
					setData(text, text_value);
				}

				if ((changed.sortedUsers) && a_href_value !== (a_href_value = "/admin/chart/by/user/" + ctx.user.id)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(td);
				}
			}
		};
	}

	// (30:39) {:else}
	function create_else_block_2(component, ctx) {
		var text_value = ctx.user.charts, text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && text_value !== (text_value = ctx.user.charts)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (30:12) {#if user.invitePending}
	function create_if_block_8(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("-");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (35:12) {:else}
	function create_else_block_1$1(component, ctx) {
		var raw_value = role(ctx.user.role), raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && raw_value !== (raw_value = role(ctx.user.role))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (32:12) {#if editId === user.id }
	function create_if_block_7(component, ctx) {
		var selectinput_updating = {}, text0, p, text1_value = __$1('teams / role / p' ), text1;

		var selectinput_initial_data = { width: "200px", options: ctx.roles };
		if (ctx.user.role !== void 0) {
			selectinput_initial_data.value = ctx.user.role;
			selectinput_updating.value = true;
		}
		var selectinput = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput_updating.value && changed.value) {
					ctx.user.role = childState.value;

					newState.sortedUsers = ctx.sortedUsers;
				}
				component._set(newState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1 }, selectinput.get());
		});

		return {
			c: function create() {
				selectinput._fragment.c();
				text0 = createText("\n            ");
				p = createElement("p");
				text1 = createText(text1_value);
				p.className = "mini-help";
				addLoc(p, file$5, 33, 12, 1108);
			},

			m: function mount(target, anchor) {
				selectinput._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, p, anchor);
				append(p, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.roles) selectinput_changes.options = ctx.roles;
				if (!selectinput_updating.value && changed.sortedUsers) {
					selectinput_changes.value = ctx.user.role;
					selectinput_updating.value = ctx.user.role !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};
			},

			d: function destroy(detach) {
				selectinput.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(p);
				}
			}
		};
	}

	// (55:66) 
	function create_if_block_6(component, ctx) {
		var p, text_value = __$1('teams / edit-role / owner / info'), text;

		return {
			c: function create() {
				p = createElement("p");
				text = createText(text_value);
				p.className = "mini-help";
				addLoc(p, file$5, 55, 12, 2185);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, text);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (38:12) {#if (isAdmin && !isTeamOwner) || (isTeamOwner && user.id !== userId) || (user.role !==             'owner') }
	function create_if_block_3$2(component, ctx) {
		var if_block_anchor;

		function select_block_type_5(ctx) {
			if (ctx.editId === ctx.user.id) return create_if_block_4$1;
			if (ctx.updating[ctx.user.id]) return create_if_block_5;
			return create_else_block$1;
		}

		var current_block_type = select_block_type_5(ctx);
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
				if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
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

	// (47:12) {:else}
	function create_else_block$1(component, ctx) {
		var button0, i0, text0, text1_value = __$1('teams / edit' ), text1, text2, button1, i1, text3, text4_value = __$1('teams / remove' ), text4;

		return {
			c: function create() {
				button0 = createElement("button");
				i0 = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				text2 = createText("\n\n            ");
				button1 = createElement("button");
				i1 = createElement("i");
				text3 = createText("  ");
				text4 = createText(text4_value);
				i0.className = "fa fa-edit";
				addLoc(i0, file$5, 48, 16, 1867);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1);
				button0.className = "btn";
				addLoc(button0, file$5, 47, 12, 1799);
				i1.className = "fa fa-times";
				addLoc(i1, file$5, 52, 16, 2024);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2);
				button1.className = "btn";
				addLoc(button1, file$5, 51, 12, 1959);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, i0);
				append(button0, text0);
				append(button0, text1);
				insert(target, text2, anchor);
				insert(target, button1, anchor);
				append(button1, i1);
				append(button1, text3);
				append(button1, text4);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button0._svelte.ctx = ctx;
				button1._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler_1);
				if (detach) {
					detachNode(text2);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_2);
			}
		};
	}

	// (43:39) 
	function create_if_block_5(component, ctx) {
		var button, i, text0, text1_value = __$1('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file$5, 44, 16, 1670);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file$5, 43, 12, 1612);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}
			}
		};
	}

	// (39:23) {#if editId === user.id }
	function create_if_block_4$1(component, ctx) {
		var button, i, text0, text1_value = __$1('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file$5, 40, 16, 1480);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$1);
				button.className = "btn btn-primary";
				addLoc(button, file$5, 39, 12, 1400);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler$1);
			}
		};
	}

	// (57:18) {#if error}
	function create_if_block_2$2(component, ctx) {
		var text;

		var alertdisplay_initial_data = { type: "error", visible: true };
		var alertdisplay = new AlertDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: alertdisplay_initial_data
		});

		return {
			c: function create() {
				text = createText(ctx.error);
				alertdisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				append(alertdisplay._slotted.default, text);
				alertdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					setData(text, ctx.error);
				}
			},

			d: function destroy(detach) {
				alertdisplay.destroy(detach);
			}
		};
	}

	// (18:4) {#each sortedUsers as user, i}
	function create_each_block$1(component, ctx) {
		var tr, td0, text0_value = ctx.user.email, text0, text1, text2, text3, td1, text4, td2, text5, td3, text6;

		var if_block0 = (ctx.user.invitePending) && create_if_block_10();

		var if_block1 = (ctx.isAdmin) && create_if_block_9(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.user.invitePending) return create_if_block_8;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block2 = current_block_type(component, ctx);

		function select_block_type_3(ctx) {
			if (ctx.editId === ctx.user.id) return create_if_block_7;
			return create_else_block_1$1;
		}

		var current_block_type_1 = select_block_type_3(ctx);
		var if_block3 = current_block_type_1(component, ctx);

		function select_block_type_4(ctx) {
			if ((ctx.isAdmin && !ctx.isTeamOwner) || (ctx.isTeamOwner && ctx.user.id !== ctx.userId) || (ctx.user.role !==
	            'owner')) return create_if_block_3$2;
			if (ctx.isTeamOwner && (ctx.user.role === 'owner')) return create_if_block_6;
		}

		var current_block_type_2 = select_block_type_4(ctx);
		var if_block4 = current_block_type_2 && current_block_type_2(component, ctx);

		var if_block5 = (ctx.error) && create_if_block_2$2(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				text0 = createText(text0_value);
				text1 = createText(" ");
				if (if_block0) if_block0.c();
				text2 = createText("\n        ");
				if (if_block1) if_block1.c();
				text3 = createText("\n        ");
				td1 = createElement("td");
				if_block2.c();
				text4 = createText("\n        ");
				td2 = createElement("td");
				if_block3.c();
				text5 = createText("\n        ");
				td3 = createElement("td");
				if (if_block4) if_block4.c();
				text6 = createText(" ");
				if (if_block5) if_block5.c();
				addLoc(td0, file$5, 19, 8, 582);
				addLoc(td1, file$5, 29, 8, 896);
				addLoc(td2, file$5, 30, 8, 970);
				addLoc(td3, file$5, 36, 8, 1234);
				tr.className = "svelte-cbldz";
				toggleClass(tr, "invite-pending", ctx.user.invitePending);
				addLoc(tr, file$5, 18, 4, 527);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, text0);
				append(td0, text1);
				if (if_block0) if_block0.m(td0, null);
				append(tr, text2);
				if (if_block1) if_block1.m(tr, null);
				append(tr, text3);
				append(tr, td1);
				if_block2.m(td1, null);
				append(tr, text4);
				append(tr, td2);
				if_block3.m(td2, null);
				append(tr, text5);
				append(tr, td3);
				if (if_block4) if_block4.m(td3, null);
				append(td3, text6);
				if (if_block5) if_block5.m(td3, null);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && text0_value !== (text0_value = ctx.user.email)) {
					setData(text0, text0_value);
				}

				if (ctx.user.invitePending) {
					if (!if_block0) {
						if_block0 = create_if_block_10();
						if_block0.c();
						if_block0.m(td0, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.isAdmin) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_9(component, ctx);
						if_block1.c();
						if_block1.m(tr, text3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type(component, ctx);
					if_block2.c();
					if_block2.m(td1, null);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_3(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type_1(component, ctx);
					if_block3.c();
					if_block3.m(td2, null);
				}

				if (current_block_type_2 === (current_block_type_2 = select_block_type_4(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if (if_block4) if_block4.d(1);
					if_block4 = current_block_type_2 && current_block_type_2(component, ctx);
					if (if_block4) if_block4.c();
					if (if_block4) if_block4.m(td3, text6);
				}

				if (ctx.error) {
					if (if_block5) {
						if_block5.p(changed, ctx);
					} else {
						if_block5 = create_if_block_2$2(component, ctx);
						if_block5.c();
						if_block5.m(td3, null);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (changed.sortedUsers) {
					toggleClass(tr, "invite-pending", ctx.user.invitePending);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if_block2.d();
				if_block3.d();
				if (if_block4) if_block4.d();
				if (if_block5) if_block5.d();
			}
		};
	}

	// (73:4) {#if products.length}
	function create_if_block$4(component, ctx) {
		var div, raw_value = __$1('teams / change-owner-confirmation / warning');

		var alertdisplay_initial_data = {
		 	type: "'warning'",
		 	closeable: false,
		 	visible: true,
		 	class: "spacing-helper"
		 };
		var alertdisplay = new AlertDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: alertdisplay_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				alertdisplay._fragment.c();
				div.className = "confirmation-warning svelte-cbldz";
				addLoc(div, file$5, 74, 8, 2842);
			},

			m: function mount(target, anchor) {
				append(alertdisplay._slotted.default, div);
				div.innerHTML = raw_value;
				alertdisplay._mount(target, anchor);
			},

			d: function destroy(detach) {
				alertdisplay.destroy(detach);
			}
		};
	}

	function UserTable(options) {
		this._debugName = '<UserTable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$5(), options.data);

		this._recompute({ isAdmin: 1, isTeamOwner: 1, users: 1, sortedUsers: 1, numCharts: 1, team: 1, editId: 1 }, this._state);
		if (!('isAdmin' in this._state)) console.warn("<UserTable> was created without expected data property 'isAdmin'");
		if (!('isTeamOwner' in this._state)) console.warn("<UserTable> was created without expected data property 'isTeamOwner'");
		if (!('users' in this._state)) console.warn("<UserTable> was created without expected data property 'users'");


		if (!('team' in this._state)) console.warn("<UserTable> was created without expected data property 'team'");
		if (!('editId' in this._state)) console.warn("<UserTable> was created without expected data property 'editId'");





		if (!('userId' in this._state)) console.warn("<UserTable> was created without expected data property 'userId'");
		if (!('updating' in this._state)) console.warn("<UserTable> was created without expected data property 'updating'");
		if (!('error' in this._state)) console.warn("<UserTable> was created without expected data property 'error'");


		if (!('products' in this._state)) console.warn("<UserTable> was created without expected data property 'products'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(UserTable.prototype, protoDev);
	assign(UserTable.prototype, methods$4);

	UserTable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('roles' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'roles'");
		if ('sortedUsers' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'sortedUsers'");
		if ('userHeaders' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'userHeaders'");
		if ('numUsers' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numUsers'");
		if ('numUsersPending' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numUsersPending'");
		if ('numCharts' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numCharts'");
		if ('numChartsCaption' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numChartsCaption'");
		if ('ownerChangeMessage' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'ownerChangeMessage'");
		if ('ownerChangeTitle' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'ownerChangeTitle'");
	};

	UserTable.prototype._recompute = function _recompute(changed, state) {
		if (changed.isAdmin || changed.isTeamOwner) {
			if (this._differs(state.roles, (state.roles = roles(state)))) changed.roles = true;
		}

		if (changed.users || changed.isAdmin) {
			if (this._differs(state.sortedUsers, (state.sortedUsers = sortedUsers(state)))) changed.sortedUsers = true;
		}

		if (changed.isAdmin) {
			if (this._differs(state.userHeaders, (state.userHeaders = userHeaders(state)))) changed.userHeaders = true;
		}

		if (changed.sortedUsers) {
			if (this._differs(state.numUsers, (state.numUsers = numUsers(state)))) changed.numUsers = true;
			if (this._differs(state.numUsersPending, (state.numUsersPending = numUsersPending(state)))) changed.numUsersPending = true;
		}

		if (changed.users) {
			if (this._differs(state.numCharts, (state.numCharts = numCharts(state)))) changed.numCharts = true;
		}

		if (changed.numCharts || changed.isAdmin || changed.team) {
			if (this._differs(state.numChartsCaption, (state.numChartsCaption = numChartsCaption(state)))) changed.numChartsCaption = true;
		}

		if (changed.users || changed.editId || changed.team || changed.isTeamOwner) {
			if (this._differs(state.ownerChangeMessage, (state.ownerChangeMessage = ownerChangeMessage(state)))) changed.ownerChangeMessage = true;
		}

		if (changed.users || changed.editId) {
			if (this._differs(state.ownerChangeTitle, (state.ownerChangeTitle = ownerChangeTitle(state)))) changed.ownerChangeTitle = true;
		}
	};

	/* node_modules/@datawrapper/controls/DropdownInput.html generated by Svelte v2.16.1 */

	function data$4() {
	    return {
	        visible: false,
	        disabled: false,
	        width: 'auto',
	        uid: ''
	    };
	}
	var methods$3 = {
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

	const file$4 = "node_modules/datawrapper/controls/DropdownInput.html";

	function create_main_fragment$4(component, ctx) {
		var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text;

		function onwindowclick(event) {
			component.windowClick(event);	}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle(event);
		}

		var if_block = (ctx.visible) && create_if_block$3(component, ctx);

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
					addLoc(i, file$4, 6, 16, 297);
					button.className = "btn btn-small";
					addLoc(button, file$4, 5, 12, 250);
				}
				addListener(a, "click", click_handler);
				a.href = "#dropdown-btn";
				a.className = "base-drop-btn svelte-1jdtmzv";
				addLoc(a, file$4, 3, 4, 126);
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
				div.dataset.uid = ctx.uid;
				addLoc(div, file$4, 2, 0, 49);
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
						if_block = create_if_block$3(component, ctx);
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
	function create_if_block$3(component, ctx) {
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
					addLoc(div0, file$4, 13, 12, 536);
				}
				setStyle(div1, "width", ctx.width);
				div1.className = "dropdown-menu base-dropdown-content svelte-1jdtmzv";
				addLoc(div1, file$4, 11, 4, 422);
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
		this._state = assign(data$4(), options.data);
		if (!('uid' in this._state)) console.warn("<DropdownInput> was created without expected data property 'uid'");
		if (!('visible' in this._state)) console.warn("<DropdownInput> was created without expected data property 'visible'");
		if (!('width' in this._state)) console.warn("<DropdownInput> was created without expected data property 'width'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(DropdownInput.prototype, protoDev);
	assign(DropdownInput.prototype, methods$3);

	DropdownInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/DropdownListInput.html generated by Svelte v2.16.1 */

	function data$3() {
	    return {
	        label: '',
	        icon: false,
	        split: false,
	        items: [],
	        btnClass: 'btn',
	        uid: ''
	    };
	}
	var methods$2 = {
	    fireClick() {
	        this.fire('click');
	    },
	    action(item) {
	        if (!item.disabled) item.action(this);
	    }
	};

	const file$3 = "node_modules/datawrapper/controls/DropdownListInput.html";

	function click_handler(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.action(ctx.item);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
		var div, text0, button, text1, ul;

		var if_block0 = (ctx.split) && create_if_block_3$1(component, ctx);

		function select_block_type(ctx) {
			if (ctx.split) return create_if_block$2;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		var each_value = ctx.items;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		var dropdowninput_initial_data = {
		 	disabled: ctx.disabled,
		 	uid: ctx.uid
		 };
		var dropdowninput = new DropdownInput({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() },
			data: dropdowninput_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n        ");
				button = createElement("button");
				if_block1.c();
				text1 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				dropdowninput._fragment.c();
				button.disabled = ctx.disabled;
				button.className = "" + ctx.btnClass + " svelte-1qu0vk";
				addLoc(button, file$3, 72, 8, 1676);
				setAttribute(div, "slot", "button");
				div.className = "btn-group";
				addLoc(div, file$3, 62, 4, 1338);
				setAttribute(ul, "slot", "content");
				ul.className = "svelte-1qu0vk";
				addLoc(ul, file$3, 83, 4, 2032);
			},

			m: function mount(target, anchor) {
				append(dropdowninput._slotted.button, div);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, button);
				if_block1.m(button, null);
				append(dropdowninput._slotted.default, text1);
				append(dropdowninput._slotted.content, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				dropdowninput._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.split) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$1(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(button, null);
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if (changed.btnClass) {
					button.className = "" + ctx.btnClass + " svelte-1qu0vk";
				}

				if (changed.items) {
					each_value = ctx.items;

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

				var dropdowninput_changes = {};
				if (changed.disabled) dropdowninput_changes.disabled = ctx.disabled;
				if (changed.uid) dropdowninput_changes.uid = ctx.uid;
				dropdowninput._set(dropdowninput_changes);
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d();
				if_block1.d();

				destroyEach(each_blocks, detach);

				dropdowninput.destroy(detach);
			}
		};
	}

	// (64:8) {#if split}
	function create_if_block_3$1(component, ctx) {
		var button, text, raw_before, button_class_value;

		var if_block = (ctx.icon) && create_if_block_4(component, ctx);

		function click_handler(event) {
			event.preventDefault();
			event.stopPropagation();
			component.fireClick();
		}

		return {
			c: function create() {
				button = createElement("button");
				if (if_block) if_block.c();
				text = createText(" ");
				raw_before = createElement('noscript');
				addListener(button, "click", click_handler);
				button.disabled = ctx.disabled;
				button.className = button_class_value = "split-button-label " + ctx.btnClass + " svelte-1qu0vk";
				addLoc(button, file$3, 64, 8, 1404);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				if (if_block) if_block.m(button, null);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
			},

			p: function update(changed, ctx) {
				if (ctx.icon) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4(component, ctx);
						if_block.c();
						if_block.m(button, text);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if ((changed.btnClass) && button_class_value !== (button_class_value = "split-button-label " + ctx.btnClass + " svelte-1qu0vk")) {
					button.className = button_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				if (if_block) if_block.d();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (70:12) {#if icon}
	function create_if_block_4(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "" + ctx.icon + " svelte-1qu0vk";
				addLoc(i, file$3, 69, 22, 1594);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.icon) {
					i.className = "" + ctx.icon + " svelte-1qu0vk";
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (76:12) {:else}
	function create_else_block(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.icon) && create_if_block_2$1(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.label) return create_if_block_1$1;
			return create_else_block_1;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block1 = current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText(" ");
				if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.icon) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$1(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (74:12) {#if split}
	function create_if_block$2(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$3, 74, 12, 1762);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (76:20) {#if icon}
	function create_if_block_2$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "" + ctx.icon + " svelte-1qu0vk";
				addLoc(i, file$3, 75, 30, 1820);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.icon) {
					i.className = "" + ctx.icon + " svelte-1qu0vk";
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (78:12) {:else}
	function create_else_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "im im-menu-dot-h svelte-1qu0vk";
				addLoc(i, file$3, 78, 12, 1941);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (76:58) {#if label}
	function create_if_block_1$1(component, ctx) {
		var raw_before, raw_after, text, span;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text = createText("\n            ");
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$3, 76, 12, 1886);
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
				insert(target, raw_after, anchor);
				insert(target, text, anchor);
				insert(target, span, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
					detachNode(text);
					detachNode(span);
				}
			}
		};
	}

	// (85:8) {#each items as item}
	function create_each_block(component, ctx) {
		var li, a, raw_value = ctx.item.label, text;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				text = createText("\n        ");
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				a.href = "#/action";
				a.className = "svelte-1qu0vk";
				toggleClass(a, "disabled", ctx.item.disabled);
				addLoc(a, file$3, 86, 12, 2107);
				li.className = "svelte-1qu0vk";
				addLoc(li, file$3, 85, 8, 2090);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				a.innerHTML = raw_value;
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.items) && raw_value !== (raw_value = ctx.item.label)) {
					a.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if (changed.items) {
					toggleClass(a, "disabled", ctx.item.disabled);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	function DropdownListInput(options) {
		this._debugName = '<DropdownListInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('disabled' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'disabled'");
		if (!('uid' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'uid'");
		if (!('split' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'split'");
		if (!('btnClass' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'btnClass'");
		if (!('icon' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'icon'");
		if (!('label' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'label'");
		if (!('items' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'items'");
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DropdownListInput.prototype, protoDev);
	assign(DropdownListInput.prototype, methods$2);

	DropdownListInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/FormBlock.html generated by Svelte v2.16.1 */

	function data$2() {
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
	const file$2 = "node_modules/datawrapper/controls/FormBlock.html";

	function create_main_fragment$2(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_3(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block$1(component, ctx);

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
				addLoc(div0, file$2, 11, 4, 248);
				div1.className = div1_class_value = "form-block " + ctx.class + " svelte-150khnx";
				setStyle(div1, "width", ctx.width);
				div1.dataset.uid = ctx.uid;
				toggleClass(div1, "compact", ctx.compact);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file$2, 0, 0, 0);
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
						if_block0 = create_if_block_3(component, ctx);
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
						if_block1 = create_if_block_2(component, ctx);
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
						if_block2 = create_if_block_1(component, ctx);
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
						if_block3 = create_if_block$1(component, ctx);
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
	function create_if_block_3(component, ctx) {
		var label, raw_after, slot_content_labelExtra = component._slotted.labelExtra, slot_content_labelExtra_before;

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				label.className = "control-label svelte-150khnx";
				addLoc(label, file$2, 9, 4, 157);
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
	function create_if_block_2(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help success svelte-150khnx";
				addLoc(div, file$2, 15, 4, 326);
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
	function create_if_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-150khnx";
				addLoc(div, file$2, 17, 4, 400);
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
	function create_if_block$1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-150khnx";
				addLoc(div, file$2, 19, 4, 491);
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
		this._state = assign(data$2(), options.data);
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

	var escapeHtml = function escapeHtml(unsafe) {
	    return unsafe
	        .replace(/&/g, '&amp;')
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
	        .replace(/"/g, '&quot;')
	        .replace(/'/g, '&#039;');
	};

	/* team-settings/tabs/members/InviteUser.html generated by Svelte v2.16.1 */



	function successMessage({ invitedEmail, currentAction }) {
	    const { isComplete, isError, type, role } = currentAction;
	    if (!isComplete || isError) return;

	    const message = __$1(`teams / invite-user / ${type} / success`);
	    return message
	        .replace('$1', escapeHtml(invitedEmail))
	        .replace('$2', __$1(`teams / role / ${role}`));
	}
	function errorMessage({ invitedEmail, currentAction }) {
	    const { isComplete, isError, errorCode, responseData, type } = currentAction;
	    if (!isComplete || !isError) return;

	    // we only want to show specific error messages
	    // if an error code is known to us,
	    // otherwise we show a generic 'server error' message
	    const errorType = [400, 401, 406].includes(errorCode) ? errorCode : 'other';
	    const maxTeamInvites =
	        errorCode === 406 && responseData && responseData.maxTeamInvites
	            ? responseData.maxTeamInvites
	            : null;

	    const message = __$1(`teams / invite-user / ${type} / error / ${errorType}`);
	    return message.replace('$1', invitedEmail).replace('$2', maxTeamInvites);
	}
	function isValidEmail({ inviteeEmail }) {
	    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
	        inviteeEmail
	    );
	}
	function inviteOptions({
	    isAdmin,
	    isTeamOwner,
	    isValidEmail,
	    inviteeExistsLoading,
	    inviteeExists
	}) {
	    const options = [
	        {
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__$1(
                'teams / role / member'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('member');
	            }
	        },
	        {
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__$1(
                'teams / role / admin'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('admin');
	            }
	        }
	    ];

	    if (isAdmin || isTeamOwner) {
	        options.push({
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__$1(
                'teams / role / owner'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('owner');
	            }
	        });
	    }

	    if (isAdmin) {
	        options.push(
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__$1('teams / add-as').replace(
                    '%s',
                    __$1('teams / role / member')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('member');
	                }
	            },
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__$1('teams / add-as').replace(
                    '%s',
                    __$1('teams / role / admin')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('admin');
	                }
	            },
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__$1('teams / add-as').replace(
                    '%s',
                    __$1('teams / role / owner')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('owner');
	                }
	            }
	        );
	    }

	    return options;
	}
	function data$1() {
	    return {
	        inviteeEmail: '',
	        invitedEmail: '',
	        currentAction: {
	            updatingUsers: false,
	            isComplete: false,
	            isError: false,
	            errorCode: null,
	            responseData: null,
	            type: '',
	            role: ''
	        }
	    };
	}
	var methods$1 = {
	    async addUser(role) {
	        const { inviteeExists, inviteeUserId } = this.get();
	        if (!inviteeExists) return;

	        this.set({ currentAction: { updatingUsers: true, isComplete: false } });

	        const response = await post(`/v3/teams/${this.get().team.id}/members`, {
	            raw: true,
	            payload: {
	                userId: inviteeUserId,
	                role
	            }
	        });

	        const responseJSON = !response.ok ? await response.json() : null;

	        const currentAction = {
	            updatingUsers: false,
	            isComplete: true,
	            isError: !response.ok,
	            errorCode: !response.ok ? response.status : null,
	            responseData: responseJSON && responseJSON.data ? responseJSON.data : null,
	            type: 'add',
	            role
	        };

	        this.set({ invitedEmail: this.get().inviteeEmail, currentAction });
	        this.fire('updateUsers');
	    },
	    async inviteUser(role) {
	        const { inviteeEmail } = this.get();

	        this.set({ currentAction: { updatingUsers: true, isComplete: false } });

	        const response = await post(`/v3/teams/${this.get().team.id}/invites`, {
	            raw: true,
	            payload: {
	                email: inviteeEmail,
	                role
	            }
	        });

	        const responseJSON = !response.ok ? await response.json() : null;

	        const currentAction = {
	            updatingUsers: false,
	            isComplete: true,
	            isError: !response.ok,
	            errorCode: !response.ok ? response.status : null,
	            responseData: responseJSON && responseJSON.data ? responseJSON.data : null,
	            type: 'invite',
	            role
	        };

	        this.set({ invitedEmail: this.get().inviteeEmail, currentAction });
	        this.fire('updateUsers');
	    },
	    async debounceCheckUser() {
	        if (!this.get().isAdmin) return;

	        window.clearTimeout(window.checkUser);
	        this.set({ inviteeExistsLoading: true });
	        window.checkUser = setTimeout(() => {
	            this.checkUser();
	        }, 200);
	    },
	    async checkUser() {
	        let { inviteeEmail } = this.get();
	        const { isValidEmail } = this.get();
	        if (!isValidEmail) {
	            this.set({ inviteeExistsLoading: false });
	            return;
	        }

	        const json = await get(`/v3/users?search=${encodeURIComponent(inviteeEmail)}`);

	        this.set({ inviteeExistsLoading: false, inviteeExists: false });

	        if (json.list.length > 0) {
	            inviteeEmail = this.get().inviteeEmail;
	            json.list.forEach(el => {
	                if (el.email.toLowerCase() === inviteeEmail.toLowerCase()) {
	                    this.set({
	                        inviteeExists: true,
	                        inviteeUserId: el.id
	                    });
	                }
	            });
	        }
	    }
	};

	function oncreate$1() {
	    window.teamSettingsInvite = this;
	}
	function onstate$1({ changed }) {
	    if (changed.inviteeEmail) {
	        this.set({ inviteeExists: false });
	        this.debounceCheckUser();
	    }
	}
	const file$1 = "team-settings/tabs/members/InviteUser.html";

	function create_main_fragment$1(component, ctx) {
		var div, input, input_updating = false, text;

		function input_input_handler() {
			input_updating = true;
			component.set({ inviteeEmail: input.value });
			input_updating = false;
		}

		var dropdownlistinput_initial_data = {
		 	disabled: !ctx.isValidEmail,
		 	label: "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __$1('teams / invite' ),
		 	items: ctx.inviteOptions
		 };
		var dropdownlistinput = new DropdownListInput({
			root: component.root,
			store: component.store,
			data: dropdownlistinput_initial_data
		});

		var formblock_initial_data = {
		 	label: __$1('teams / invite-user' ),
		 	help: __$1('teams / invite-user / help' ),
		 	success: ctx.successMessage,
		 	error: ctx.errorMessage
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				input = createElement("input");
				text = createText(" \n        ");
				dropdownlistinput._fragment.c();
				formblock._fragment.c();
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.width = "1px";
				input.placeholder = __$1('teams / invite-user / eg' );
				input.className = "svelte-m6ws61";
				addLoc(input, file$1, 7, 8, 190);
				div.className = "flex svelte-m6ws61";
				addLoc(div, file$1, 6, 4, 163);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, div);
				append(div, input);

				input.value = ctx.inviteeEmail;

				append(div, text);
				dropdownlistinput._mount(div, null);
				formblock._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.inviteeEmail) input.value = ctx.inviteeEmail;

				var dropdownlistinput_changes = {};
				if (changed.isValidEmail) dropdownlistinput_changes.disabled = !ctx.isValidEmail;
				if (changed.currentAction) dropdownlistinput_changes.label = "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __$1('teams / invite' );
				if (changed.inviteOptions) dropdownlistinput_changes.items = ctx.inviteOptions;
				dropdownlistinput._set(dropdownlistinput_changes);

				var formblock_changes = {};
				if (changed.successMessage) formblock_changes.success = ctx.successMessage;
				if (changed.errorMessage) formblock_changes.error = ctx.errorMessage;
				formblock._set(formblock_changes);
			},

			d: function destroy(detach) {
				removeListener(input, "input", input_input_handler);
				dropdownlistinput.destroy();
				formblock.destroy(detach);
			}
		};
	}

	function InviteUser(options) {
		this._debugName = '<InviteUser>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ invitedEmail: 1, currentAction: 1, inviteeEmail: 1, isAdmin: 1, isTeamOwner: 1, isValidEmail: 1, inviteeExistsLoading: 1, inviteeExists: 1 }, this._state);
		if (!('invitedEmail' in this._state)) console.warn("<InviteUser> was created without expected data property 'invitedEmail'");
		if (!('currentAction' in this._state)) console.warn("<InviteUser> was created without expected data property 'currentAction'");
		if (!('inviteeEmail' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeEmail'");
		if (!('isAdmin' in this._state)) console.warn("<InviteUser> was created without expected data property 'isAdmin'");
		if (!('isTeamOwner' in this._state)) console.warn("<InviteUser> was created without expected data property 'isTeamOwner'");

		if (!('inviteeExistsLoading' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeExistsLoading'");
		if (!('inviteeExists' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeExists'");
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$1(this, this._state);

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

	assign(InviteUser.prototype, protoDev);
	assign(InviteUser.prototype, methods$1);

	InviteUser.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('successMessage' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'successMessage'");
		if ('errorMessage' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'errorMessage'");
		if ('isValidEmail' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'isValidEmail'");
		if ('inviteOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'inviteOptions'");
	};

	InviteUser.prototype._recompute = function _recompute(changed, state) {
		if (changed.invitedEmail || changed.currentAction) {
			if (this._differs(state.successMessage, (state.successMessage = successMessage(state)))) changed.successMessage = true;
			if (this._differs(state.errorMessage, (state.errorMessage = errorMessage(state)))) changed.errorMessage = true;
		}

		if (changed.inviteeEmail) {
			if (this._differs(state.isValidEmail, (state.isValidEmail = isValidEmail(state)))) changed.isValidEmail = true;
		}

		if (changed.isAdmin || changed.isTeamOwner || changed.isValidEmail || changed.inviteeExistsLoading || changed.inviteeExists) {
			if (this._differs(state.inviteOptions, (state.inviteOptions = inviteOptions(state)))) changed.inviteOptions = true;
		}
	};

	/* team-settings/tabs/Members.html generated by Svelte v2.16.1 */



	function newRole({ users, userId }) {
	    if (!users || !users.length || !userId) return false;
	    const user = users.find(el => el.id === userId);
	    if (user) return user.role;
	    else return 'admin';
	}
	function isTeamOwner({ $role }) {
	    return $role === 'owner';
	}
	function isTeamAdmin({ $role }) {
	    return $role === 'admin';
	}
	function data() {
	    return {
	        editIndex: 0,
	        updating: {},
	        updatingUsers: false,
	        awaitLoadingUsers: false,
	        products: []
	    };
	}
	var methods = {
	    updateUsers() {
	        const { team } = this.get();
	        this.set({
	            awaitLoadingUsers: httpReq
	                .get(`/v3/teams/${team.id}/members?limit=1000`)
	                .then(res => {
	                    this.set({ users: res.list });
	                }),
	            awaitLoadingProducts: httpReq.get(`/v3/teams/${team.id}/products`).then(res => {
	                this.set({ products: res.list });
	            })
	        });
	    }
	};

	function oncreate() {
	    this.updateUsers();
	}
	function onstate({ changed, current }) {
	    if (changed.newRole && current.newRole) {
	        this.store.set({
	            role: current.newRole
	        });
	    }
	}
	const file = "team-settings/tabs/Members.html";

	function create_main_fragment(component, ctx) {
		var p, raw0_value = __$1('teams / p'), text0, div2, div0, inviteuser_updating = {}, text1, div1, table, thead, tr0, td0, text2, th0, raw1_value = __$1('teams / role / member'), text3, th1, raw2_value = __$1('teams / role / admin'), text4, th2, raw3_value = __$1('teams / role / owner'), text5, tbody, tr1, td1, raw4_value = __$1('teams / roles / edit-charts' ), text6, td2, i0, text7, td3, i1, text8, td4, i2, text9, tr2, td5, raw5_value = __$1('teams / roles / edit-folders' ), text10, td6, i3, text11, td7, i4, text12, td8, i5, text13, tr3, td9, raw6_value = __$1('teams / roles / access-settings' ), text14, td10, i6, text15, td11, i7, text16, td12, i8, text17, tr4, td13, raw7_value = __$1('teams / roles / invite-users' ), text18, td14, i9, text19, td15, i10, text20, td16, i11, text21, tr5, td17, raw8_value = __$1('teams / roles / subscription-options' ), text22, td18, i12, text23, td19, i13, text24, td20, i14, text25, tr6, td21, raw9_value = __$1('teams / roles / remove-team' ), text26, td22, i15, text27, td23, i16, text28, td24, i17, text29, if_block_anchor;

		var inviteuser_initial_data = {
		 	isTeamOwner: ctx.isTeamOwner,
		 	isAdmin: ctx.isAdmin
		 };
		if (ctx.team
	             !== void 0) {
			inviteuser_initial_data.team = ctx.team
	            ;
			inviteuser_updating.team = true;
		}
		if (ctx.updatingUsers
	             !== void 0) {
			inviteuser_initial_data.updatingUsers = ctx.updatingUsers
	            ;
			inviteuser_updating.updatingUsers = true;
		}
		var inviteuser = new InviteUser({
			root: component.root,
			store: component.store,
			data: inviteuser_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!inviteuser_updating.team && changed.team) {
					newState.team = childState.team;
				}

				if (!inviteuser_updating.updatingUsers && changed.updatingUsers) {
					newState.updatingUsers = childState.updatingUsers;
				}
				component._set(newState);
				inviteuser_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			inviteuser._bind({ team: 1, updatingUsers: 1 }, inviteuser.get());
		});

		inviteuser.on("updateUsers", function(event) {
			component.updateUsers();
		});

		var if_block = (ctx.awaitLoadingUsers) && create_if_block(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n");
				div2 = createElement("div");
				div0 = createElement("div");
				inviteuser._fragment.c();
				text1 = createText("\n    ");
				div1 = createElement("div");
				table = createElement("table");
				thead = createElement("thead");
				tr0 = createElement("tr");
				td0 = createElement("td");
				text2 = createText("\n                    ");
				th0 = createElement("th");
				text3 = createText("\n                    ");
				th1 = createElement("th");
				text4 = createText("\n                    ");
				th2 = createElement("th");
				text5 = createText("\n            ");
				tbody = createElement("tbody");
				tr1 = createElement("tr");
				td1 = createElement("td");
				text6 = createText("\n                    ");
				td2 = createElement("td");
				i0 = createElement("i");
				text7 = createText("\n                    ");
				td3 = createElement("td");
				i1 = createElement("i");
				text8 = createText("\n                    ");
				td4 = createElement("td");
				i2 = createElement("i");
				text9 = createText("\n\n                ");
				tr2 = createElement("tr");
				td5 = createElement("td");
				text10 = createText("\n                    ");
				td6 = createElement("td");
				i3 = createElement("i");
				text11 = createText("\n                    ");
				td7 = createElement("td");
				i4 = createElement("i");
				text12 = createText("\n                    ");
				td8 = createElement("td");
				i5 = createElement("i");
				text13 = createText("\n\n                ");
				tr3 = createElement("tr");
				td9 = createElement("td");
				text14 = createText("\n                    ");
				td10 = createElement("td");
				i6 = createElement("i");
				text15 = createText("\n                    ");
				td11 = createElement("td");
				i7 = createElement("i");
				text16 = createText("\n                    ");
				td12 = createElement("td");
				i8 = createElement("i");
				text17 = createText("\n\n                ");
				tr4 = createElement("tr");
				td13 = createElement("td");
				text18 = createText("\n                    ");
				td14 = createElement("td");
				i9 = createElement("i");
				text19 = createText("\n                    ");
				td15 = createElement("td");
				i10 = createElement("i");
				text20 = createText("\n                    ");
				td16 = createElement("td");
				i11 = createElement("i");
				text21 = createText("\n\n                ");
				tr5 = createElement("tr");
				td17 = createElement("td");
				text22 = createText("\n                    ");
				td18 = createElement("td");
				i12 = createElement("i");
				text23 = createText("\n                    ");
				td19 = createElement("td");
				i13 = createElement("i");
				text24 = createText("\n                    ");
				td20 = createElement("td");
				i14 = createElement("i");
				text25 = createText("\n\n                ");
				tr6 = createElement("tr");
				td21 = createElement("td");
				text26 = createText("\n                    ");
				td22 = createElement("td");
				i15 = createElement("i");
				text27 = createText("\n                    ");
				td23 = createElement("td");
				i16 = createElement("i");
				text28 = createText("\n                    ");
				td24 = createElement("td");
				i17 = createElement("i");
				text29 = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file, 0, 0, 0);
				div0.className = "span4";
				addLoc(div0, file, 3, 4, 110);
				td0.className = "svelte-hgmegl";
				addLoc(td0, file, 16, 20, 492);
				th0.className = "svelte-hgmegl";
				addLoc(th0, file, 17, 20, 519);
				th1.className = "svelte-hgmegl";
				addLoc(th1, file, 18, 20, 584);
				th2.className = "svelte-hgmegl";
				addLoc(th2, file, 19, 20, 648);
				addLoc(tr0, file, 15, 16, 467);
				addLoc(thead, file, 14, 12, 443);
				td1.className = "svelte-hgmegl";
				addLoc(td1, file, 24, 20, 796);
				i0.className = "im im-check-mark svelte-hgmegl";
				addLoc(i0, file, 25, 24, 874);
				td2.className = "svelte-hgmegl";
				addLoc(td2, file, 25, 20, 870);
				i1.className = "im im-check-mark svelte-hgmegl";
				addLoc(i1, file, 26, 24, 936);
				td3.className = "svelte-hgmegl";
				addLoc(td3, file, 26, 20, 932);
				i2.className = "im im-check-mark svelte-hgmegl";
				addLoc(i2, file, 27, 24, 998);
				td4.className = "svelte-hgmegl";
				addLoc(td4, file, 27, 20, 994);
				addLoc(tr1, file, 23, 16, 771);
				td5.className = "svelte-hgmegl";
				addLoc(td5, file, 31, 20, 1100);
				i3.className = "im im-check-mark svelte-hgmegl";
				addLoc(i3, file, 32, 24, 1179);
				td6.className = "svelte-hgmegl";
				addLoc(td6, file, 32, 20, 1175);
				i4.className = "im im-check-mark svelte-hgmegl";
				addLoc(i4, file, 33, 24, 1241);
				td7.className = "svelte-hgmegl";
				addLoc(td7, file, 33, 20, 1237);
				i5.className = "im im-check-mark svelte-hgmegl";
				addLoc(i5, file, 34, 24, 1303);
				td8.className = "svelte-hgmegl";
				addLoc(td8, file, 34, 20, 1299);
				addLoc(tr2, file, 30, 16, 1075);
				td9.className = "svelte-hgmegl";
				addLoc(td9, file, 38, 20, 1405);
				i6.className = "im im-x-mark svelte-hgmegl";
				addLoc(i6, file, 39, 24, 1487);
				td10.className = "svelte-hgmegl";
				addLoc(td10, file, 39, 20, 1483);
				i7.className = "im im-check-mark svelte-hgmegl";
				addLoc(i7, file, 40, 24, 1545);
				td11.className = "svelte-hgmegl";
				addLoc(td11, file, 40, 20, 1541);
				i8.className = "im im-check-mark svelte-hgmegl";
				addLoc(i8, file, 41, 24, 1607);
				td12.className = "svelte-hgmegl";
				addLoc(td12, file, 41, 20, 1603);
				addLoc(tr3, file, 37, 16, 1380);
				td13.className = "svelte-hgmegl";
				addLoc(td13, file, 45, 20, 1709);
				i9.className = "im im-x-mark svelte-hgmegl";
				addLoc(i9, file, 46, 24, 1788);
				td14.className = "svelte-hgmegl";
				addLoc(td14, file, 46, 20, 1784);
				i10.className = "im im-check-mark svelte-hgmegl";
				addLoc(i10, file, 47, 24, 1846);
				td15.className = "svelte-hgmegl";
				addLoc(td15, file, 47, 20, 1842);
				i11.className = "im im-check-mark svelte-hgmegl";
				addLoc(i11, file, 48, 24, 1908);
				td16.className = "svelte-hgmegl";
				addLoc(td16, file, 48, 20, 1904);
				addLoc(tr4, file, 44, 16, 1684);
				td17.className = "svelte-hgmegl";
				addLoc(td17, file, 52, 20, 2010);
				i12.className = "im im-x-mark svelte-hgmegl";
				addLoc(i12, file, 53, 24, 2097);
				td18.className = "svelte-hgmegl";
				addLoc(td18, file, 53, 20, 2093);
				i13.className = "im im-x-mark svelte-hgmegl";
				addLoc(i13, file, 54, 24, 2155);
				td19.className = "svelte-hgmegl";
				addLoc(td19, file, 54, 20, 2151);
				i14.className = "im im-check-mark svelte-hgmegl";
				addLoc(i14, file, 55, 24, 2213);
				td20.className = "svelte-hgmegl";
				addLoc(td20, file, 55, 20, 2209);
				addLoc(tr5, file, 51, 16, 1985);
				td21.className = "svelte-hgmegl";
				addLoc(td21, file, 59, 20, 2315);
				i15.className = "im im-x-mark svelte-hgmegl";
				addLoc(i15, file, 60, 24, 2393);
				td22.className = "svelte-hgmegl";
				addLoc(td22, file, 60, 20, 2389);
				i16.className = "im im-x-mark svelte-hgmegl";
				addLoc(i16, file, 61, 24, 2451);
				td23.className = "svelte-hgmegl";
				addLoc(td23, file, 61, 20, 2447);
				i17.className = "im im-check-mark svelte-hgmegl";
				addLoc(i17, file, 62, 24, 2509);
				td24.className = "svelte-hgmegl";
				addLoc(td24, file, 62, 20, 2505);
				addLoc(tr6, file, 58, 16, 2290);
				tbody.className = "svelte-hgmegl";
				addLoc(tbody, file, 22, 12, 747);
				table.className = "role-descriptions svelte-hgmegl";
				setStyle(table, "margin-left", "3em");
				addLoc(table, file, 13, 8, 372);
				div1.className = "span6";
				addLoc(div1, file, 12, 4, 344);
				div2.className = "row";
				setStyle(div2, "margin-bottom", "2em");
				addLoc(div2, file, 2, 0, 61);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw0_value;
				insert(target, text0, anchor);
				insert(target, div2, anchor);
				append(div2, div0);
				inviteuser._mount(div0, null);
				append(div2, text1);
				append(div2, div1);
				append(div1, table);
				append(table, thead);
				append(thead, tr0);
				append(tr0, td0);
				append(tr0, text2);
				append(tr0, th0);
				th0.innerHTML = raw1_value;
				append(tr0, text3);
				append(tr0, th1);
				th1.innerHTML = raw2_value;
				append(tr0, text4);
				append(tr0, th2);
				th2.innerHTML = raw3_value;
				append(table, text5);
				append(table, tbody);
				append(tbody, tr1);
				append(tr1, td1);
				td1.innerHTML = raw4_value;
				append(tr1, text6);
				append(tr1, td2);
				append(td2, i0);
				append(tr1, text7);
				append(tr1, td3);
				append(td3, i1);
				append(tr1, text8);
				append(tr1, td4);
				append(td4, i2);
				append(tbody, text9);
				append(tbody, tr2);
				append(tr2, td5);
				td5.innerHTML = raw5_value;
				append(tr2, text10);
				append(tr2, td6);
				append(td6, i3);
				append(tr2, text11);
				append(tr2, td7);
				append(td7, i4);
				append(tr2, text12);
				append(tr2, td8);
				append(td8, i5);
				append(tbody, text13);
				append(tbody, tr3);
				append(tr3, td9);
				td9.innerHTML = raw6_value;
				append(tr3, text14);
				append(tr3, td10);
				append(td10, i6);
				append(tr3, text15);
				append(tr3, td11);
				append(td11, i7);
				append(tr3, text16);
				append(tr3, td12);
				append(td12, i8);
				append(tbody, text17);
				append(tbody, tr4);
				append(tr4, td13);
				td13.innerHTML = raw7_value;
				append(tr4, text18);
				append(tr4, td14);
				append(td14, i9);
				append(tr4, text19);
				append(tr4, td15);
				append(td15, i10);
				append(tr4, text20);
				append(tr4, td16);
				append(td16, i11);
				append(tbody, text21);
				append(tbody, tr5);
				append(tr5, td17);
				td17.innerHTML = raw8_value;
				append(tr5, text22);
				append(tr5, td18);
				append(td18, i12);
				append(tr5, text23);
				append(tr5, td19);
				append(td19, i13);
				append(tr5, text24);
				append(tr5, td20);
				append(td20, i14);
				append(tbody, text25);
				append(tbody, tr6);
				append(tr6, td21);
				td21.innerHTML = raw9_value;
				append(tr6, text26);
				append(tr6, td22);
				append(td22, i15);
				append(tr6, text27);
				append(tr6, td23);
				append(td23, i16);
				append(tr6, text28);
				append(tr6, td24);
				append(td24, i17);
				insert(target, text29, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var inviteuser_changes = {};
				if (changed.isTeamOwner) inviteuser_changes.isTeamOwner = ctx.isTeamOwner;
				if (changed.isAdmin) inviteuser_changes.isAdmin = ctx.isAdmin;
				if (!inviteuser_updating.team && changed.team) {
					inviteuser_changes.team = ctx.team
	            ;
					inviteuser_updating.team = ctx.team
	             !== void 0;
				}
				if (!inviteuser_updating.updatingUsers && changed.updatingUsers) {
					inviteuser_changes.updatingUsers = ctx.updatingUsers
	            ;
					inviteuser_updating.updatingUsers = ctx.updatingUsers
	             !== void 0;
				}
				inviteuser._set(inviteuser_changes);
				inviteuser_updating = {};

				if (ctx.awaitLoadingUsers) {
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
					detachNode(p);
					detachNode(text0);
					detachNode(div2);
				}

				inviteuser.destroy();
				if (detach) {
					detachNode(text29);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (70:0) {#if awaitLoadingUsers}
	function create_if_block(component, ctx) {
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

		handlePromise(promise = ctx.awaitLoadingUsers, info);

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

				if (('awaitLoadingUsers' in changed) && promise !== (promise = ctx.awaitLoadingUsers) && handlePromise(promise, info)) ; else {
					info.block.p(changed, assign(assign({}, ctx), info.resolved));
				}
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

	// (85:0) {:catch}
	function create_catch_block(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("error!");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (72:0) {:then}
	function create_then_block(component, ctx) {
		var usertable_updating = {};

		var usertable_initial_data = {
		 	isAdmin: ctx.isAdmin,
		 	isTeamOwner: ctx.isTeamOwner,
		 	isTeamAdmin: ctx.isTeamAdmin,
		 	team: ctx.team
		 };
		if (ctx.userId
	     !== void 0) {
			usertable_initial_data.userId = ctx.userId
	    ;
			usertable_updating.userId = true;
		}
		if (ctx.users
	     !== void 0) {
			usertable_initial_data.users = ctx.users
	    ;
			usertable_updating.users = true;
		}
		if (ctx.products
	     !== void 0) {
			usertable_initial_data.products = ctx.products
	    ;
			usertable_updating.products = true;
		}
		if (ctx.editIndex
	     !== void 0) {
			usertable_initial_data.editIndex = ctx.editIndex
	    ;
			usertable_updating.editIndex = true;
		}
		if (ctx.updating
	     !== void 0) {
			usertable_initial_data.updating = ctx.updating
	    ;
			usertable_updating.updating = true;
		}
		var usertable = new UserTable({
			root: component.root,
			store: component.store,
			data: usertable_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!usertable_updating.userId && changed.userId) {
					newState.userId = childState.userId;
				}

				if (!usertable_updating.users && changed.users) {
					newState.users = childState.users;
				}

				if (!usertable_updating.products && changed.products) {
					newState.products = childState.products;
				}

				if (!usertable_updating.editIndex && changed.editIndex) {
					newState.editIndex = childState.editIndex;
				}

				if (!usertable_updating.updating && changed.updating) {
					newState.updating = childState.updating;
				}
				component._set(newState);
				usertable_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			usertable._bind({ userId: 1, users: 1, products: 1, editIndex: 1, updating: 1 }, usertable.get());
		});

		usertable.on("updateUsers", function(event) {
			component.updateUsers();
		});

		return {
			c: function create() {
				usertable._fragment.c();
			},

			m: function mount(target, anchor) {
				usertable._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var usertable_changes = {};
				if (changed.isAdmin) usertable_changes.isAdmin = ctx.isAdmin;
				if (changed.isTeamOwner) usertable_changes.isTeamOwner = ctx.isTeamOwner;
				if (changed.isTeamAdmin) usertable_changes.isTeamAdmin = ctx.isTeamAdmin;
				if (changed.team) usertable_changes.team = ctx.team;
				if (!usertable_updating.userId && changed.userId) {
					usertable_changes.userId = ctx.userId
	    ;
					usertable_updating.userId = ctx.userId
	     !== void 0;
				}
				if (!usertable_updating.users && changed.users) {
					usertable_changes.users = ctx.users
	    ;
					usertable_updating.users = ctx.users
	     !== void 0;
				}
				if (!usertable_updating.products && changed.products) {
					usertable_changes.products = ctx.products
	    ;
					usertable_updating.products = ctx.products
	     !== void 0;
				}
				if (!usertable_updating.editIndex && changed.editIndex) {
					usertable_changes.editIndex = ctx.editIndex
	    ;
					usertable_updating.editIndex = ctx.editIndex
	     !== void 0;
				}
				if (!usertable_updating.updating && changed.updating) {
					usertable_changes.updating = ctx.updating
	    ;
					usertable_updating.updating = ctx.updating
	     !== void 0;
				}
				usertable._set(usertable_changes);
				usertable_updating = {};
			},

			d: function destroy(detach) {
				usertable.destroy(detach);
			}
		};
	}

	// (70:50)  <p><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp; { @html __('teams / loading' ) }
	function create_pending_block(component, ctx) {
		var p, i, text, raw_value = __$1('teams / loading' ), raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText("   ");
				raw_before = createElement('noscript');
				i.className = "fa fa-circle-o-notch fa-spin";
				addLoc(i, file, 70, 3, 2680);
				addLoc(p, file, 70, 0, 2677);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Members(options) {
		this._debugName = '<Members>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Members> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["role"]), data()), options.data);
		this.store._add(this, ["role"]);

		this._recompute({ users: 1, userId: 1, $role: 1 }, this._state);
		if (!('users' in this._state)) console.warn("<Members> was created without expected data property 'users'");
		if (!('userId' in this._state)) console.warn("<Members> was created without expected data property 'userId'");
		if (!('$role' in this._state)) console.warn("<Members> was created without expected data property '$role'");
		if (!('team' in this._state)) console.warn("<Members> was created without expected data property 'team'");

		if (!('isAdmin' in this._state)) console.warn("<Members> was created without expected data property 'isAdmin'");
		if (!('updatingUsers' in this._state)) console.warn("<Members> was created without expected data property 'updatingUsers'");
		if (!('awaitLoadingUsers' in this._state)) console.warn("<Members> was created without expected data property 'awaitLoadingUsers'");

		if (!('products' in this._state)) console.warn("<Members> was created without expected data property 'products'");
		if (!('editIndex' in this._state)) console.warn("<Members> was created without expected data property 'editIndex'");
		if (!('updating' in this._state)) console.warn("<Members> was created without expected data property 'updating'");
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

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

	assign(Members.prototype, protoDev);
	assign(Members.prototype, methods);

	Members.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('newRole' in newState && !this._updatingReadonlyProperty) throw new Error("<Members>: Cannot set read-only property 'newRole'");
		if ('isTeamOwner' in newState && !this._updatingReadonlyProperty) throw new Error("<Members>: Cannot set read-only property 'isTeamOwner'");
		if ('isTeamAdmin' in newState && !this._updatingReadonlyProperty) throw new Error("<Members>: Cannot set read-only property 'isTeamAdmin'");
	};

	Members.prototype._recompute = function _recompute(changed, state) {
		if (changed.users || changed.userId) {
			if (this._differs(state.newRole, (state.newRole = newRole(state)))) changed.newRole = true;
		}

		if (changed.$role) {
			if (this._differs(state.isTeamOwner, (state.isTeamOwner = isTeamOwner(state)))) changed.isTeamOwner = true;
			if (this._differs(state.isTeamAdmin, (state.isTeamAdmin = isTeamAdmin(state)))) changed.isTeamAdmin = true;
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

	var main = { App: Members, store };

	return main;

})));
//# sourceMappingURL=members.js.map
