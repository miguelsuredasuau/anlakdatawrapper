(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/admin/users', factory) :
	(global['admin/users'] = factory());
}(this, (function () { 'use strict';

function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) { iterations[i].d(); }
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) { this._fragment.u(); }
	this._fragment.d();
	this._fragment = this._state = null;
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
	var this$1 = this;

	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) { return; }

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this$1, data);
			handler.__calling = false;
		}
	}
}

function getDev(key) {
	if (key) { console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead"); }
	return get.call(this, key);
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var fn = callback.bind(this);

	if (!options || options.init !== false) {
		fn(this.get()[key], undefined);
	}

	return this.on(options && options.defer ? 'update' : 'state', function(event) {
		if (event.changed[key]) { fn(event.current[key], event.previous && event.previous[key]); }
	});
}

function observeDev(key, callback, options) {
	console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

	var c = (key = '' + key).search(/[.[]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			{ message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'"; }

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
}

function on(eventName, handler) {
	if (eventName === 'teardown') { return this.on('destroy', handler); }

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) { handlers.splice(index, 1); }
		}
	};
}

function onDev(eventName, handler) {
	if (eventName === 'teardown') {
		console.warn(
			"Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2"
		);
		return this.on('destroy', handler);
	}

	return on.call(this, eventName, handler);
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) { return; }
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var this$1 = this;

	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
	}
	if (!dirty) { return; }

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) { this._bind(changed, this._state); }

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
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
	while (fns && fns.length) { fns.shift()(); }
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

function _unmount() {
	if (this._fragment) { this._fragment.u(); }
}

var protoDev = {
	destroy: destroyDev,
	get: getDev,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount,
	_differs: _differs
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var strictUriEncode = function (str) { return encodeURIComponent(str).replace(/[!'()*]/g, function (x) { return ("%" + (x.charCodeAt(0).toString(16).toUpperCase())); }); };

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

var decodeUriComponent = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

var queryString = createCommonjsModule(function (module, exports) {



function encoderForArrayFormat(options) {
	switch (options.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, options),
					'[',
					index,
					']'
				].join('') : [
					encode(key, options),
					'[',
					encode(index, options),
					']=',
					encode(value, options)
				].join('');
			};
		case 'bracket':
			return function (key, value) {
				return value === null ? [encode(key, options), '[]'].join('') : [
					encode(key, options),
					'[]=',
					encode(value, options)
				].join('');
			};
		default:
			return function (key, value) {
				return value === null ? encode(key, options) : [
					encode(key, options),
					'=',
					encode(value, options)
				].join('');
			};
	}
}

function parserForArrayFormat(options) {
	var result;

	switch (options.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};
		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, options) {
	if (options.encode) {
		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function decode(value, options) {
	if (options.decode) {
		return decodeUriComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	}

	if (typeof input === 'object') {
		return keysSorter(Object.keys(input))
			.sort(function (a, b) { return Number(a) - Number(b); })
			.map(function (key) { return input[key]; });
	}

	return input;
}

function extract(input) {
	var queryStart = input.indexOf('?');
	if (queryStart === -1) {
		return '';
	}

	return input.slice(queryStart + 1);
}

function parse(input, options) {
	options = Object.assign({decode: true, arrayFormat: 'none'}, options);

	var formatter = parserForArrayFormat(options);

	// Create an object with no prototype
	var ret = Object.create(null);

	if (typeof input !== 'string') {
		return ret;
	}

	input = input.trim().replace(/^[?#&]/, '');

	if (!input) {
		return ret;
	}

	for (var i = 0, list = input.split('&'); i < list.length; i += 1) {
		var param = list[i];

		var ref = param.replace(/\+/g, ' ').split('=');
		var key = ref[0];
		var value = ref[1];

		// Missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		value = value === undefined ? null : decode(value, options);

		formatter(decode(key, options), value, ret);
	}

	return Object.keys(ret).sort().reduce(function (result, key) {
		var value = ret[key];
		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
			// Sort object keys, not values
			result[key] = keysSorter(value);
		} else {
			result[key] = value;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = function (obj, options) {
	if (!obj) {
		return '';
	}

	options = Object.assign({
		encode: true,
		strict: true,
		arrayFormat: 'none'
	}, options);

	var formatter = encoderForArrayFormat(options);
	var keys = Object.keys(obj);

	if (options.sort !== false) {
		keys.sort(options.sort);
	}

	return keys.map(function (key) {
		var value = obj[key];

		if (value === undefined) {
			return '';
		}

		if (value === null) {
			return encode(key, options);
		}

		if (Array.isArray(value)) {
			var result = [];

			for (var i = 0, list = value.slice(); i < list.length; i += 1) {
				var value2 = list[i];

				if (value2 === undefined) {
					continue;
				}

				result.push(formatter(key, value2, result.length));
			}

			return result.join('&');
		}

		return encode(key, options) + '=' + encode(value, options);
	}).filter(function (x) { return x.length > 0; }).join('&');
};

exports.parseUrl = function (input, options) {
	var hashStart = input.indexOf('#');
	if (hashStart !== -1) {
		input = input.slice(0, hashStart);
	}

	return {
		url: input.split('?')[0] || '',
		query: parse(extract(input), options)
	};
};
});
var queryString_1 = queryString.extract;
var queryString_2 = queryString.parse;
var queryString_3 = queryString.stringify;
var queryString_4 = queryString.parseUrl;

/* globals dw */

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
 * @export
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @returns {string} -- the translated text
 */

// TODO: Clarify whether this makes sense!
var dw = window.dw;

function __(key, scope) {
    var arguments$1 = arguments;
    if ( scope === void 0 ) scope = 'core';

    key = key.trim();
    if (!dw.backend.__messages[scope]) { return 'MISSING:' + key; }
    var translation = dw.backend.__messages[scope][key] || dw.backend.__messages.core[key] || key;

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var index = i - 1;
            translation = translation.replace('$' + index, arguments$1[i]);
        }
    }

    return translation;
}

// quick reference variables for speed access

// `_isArray` : an object's function

function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method: method,
        body: body,
        mode: 'cors',
        credentials: credentials
    };

    var promise = window
        .fetch(url, opts)
        .then(function (res) {
            if (res.status !== 200) { return new Error(res.statusText); }
            return res.text();
        })
        .then(function (text) {
            try {
                return JSON.parse(text);
            } catch (Error) {
                // could not parse json, so just return text
                console.warn('malformed json input', text);
                return text;
            }
        })
        .catch(function (err) {
            console.error(err);
        });

    return callback ? promise.then(callback) : promise;
}

function getJSON(url, credentials, callback) {
    if (arguments.length === 2) {
        callback = credentials;
        credentials = 'include';
    }

    return fetchJSON(url, 'GET', credentials, null, callback);
}

/* admin/users/UserAdminDetails.html generated by Svelte v1.64.0 */

var methods = {
    close: function close() {
        this.fire('close');
    }
};

function create_main_fragment(component, state) {
	var section, div, div_1, div_2, button, text_2, h4, text_3_value = state.user.email, text_3, text_5, div_3, ul, li, b, text_7, text_8_value = state.user.id, text_8, li_1, b_1, text_10, text_11_value = state.user.name || "–", text_11, li_2, b_2, text_13, text_14_value = state.user.email, text_14, li_3, b_3, text_16, a, text_17_value = state.user.chartCount, text_17, a_href_value, li_4, b_4, text_21, text_22_value = state.user.createdAt, text_22, li_5, b_5, text_24, text_25_value = state.user.role, text_25, text_26, hr, text_27, h4_1, text_29, p, text_31, hr_1, text_32, h4_2, text_34, p_1, text_36, hr_2, text_37, h4_3, text_39, p_2, text_41, hr_3, text_42, h4_4, text_44, p_3, text_47, div_4, button_1, text_49, button_2;

	function click_handler(event) {
		component.close();
	}

	function click_handler_1(event) {
		component.close();
	}

	return {
		c: function create() {
			section = createElement("section");
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			button = createElement("button");
			button.innerHTML = "<span aria-hidden=\"true\">×</span>";
			text_2 = createText("\n                ");
			h4 = createElement("h4");
			text_3 = createText(text_3_value);
			text_5 = createText("\n            ");
			div_3 = createElement("div");
			ul = createElement("ul");
			li = createElement("li");
			b = createElement("b");
			b.textContent = "ID:";
			text_7 = createText(" ");
			text_8 = createText(text_8_value);
			li_1 = createElement("li");
			b_1 = createElement("b");
			b_1.textContent = "Name:";
			text_10 = createText(" ");
			text_11 = createText(text_11_value);
			li_2 = createElement("li");
			b_2 = createElement("b");
			b_2.textContent = "E-Mail:";
			text_13 = createText(" ");
			text_14 = createText(text_14_value);
			li_3 = createElement("li");
			b_3 = createElement("b");
			b_3.textContent = "Charts:";
			text_16 = createText("\n                        ");
			a = createElement("a");
			text_17 = createText(text_17_value);
			li_4 = createElement("li");
			b_4 = createElement("b");
			b_4.textContent = "Created At:";
			text_21 = createText(" ");
			text_22 = createText(text_22_value);
			li_5 = createElement("li");
			b_5 = createElement("b");
			b_5.textContent = "Role:";
			text_24 = createText(" ");
			text_25 = createText(text_25_value);
			text_26 = createText("\n\n                ");
			hr = createElement("hr");
			text_27 = createText("\n\n                ");
			h4_1 = createElement("h4");
			h4_1.textContent = "History";
			text_29 = createText("\n                ");
			p = createElement("p");
			p.textContent = "-";
			text_31 = createText("\n\n                ");
			hr_1 = createElement("hr");
			text_32 = createText("\n\n                ");
			h4_2 = createElement("h4");
			h4_2.textContent = "Private Plugins";
			text_34 = createText("\n                ");
			p_1 = createElement("p");
			p_1.textContent = "-";
			text_36 = createText("\n\n                ");
			hr_2 = createElement("hr");
			text_37 = createText("\n\n                ");
			h4_3 = createElement("h4");
			h4_3.textContent = "Products";
			text_39 = createText("\n                ");
			p_2 = createElement("p");
			p_2.textContent = "-";
			text_41 = createText("\n\n                ");
			hr_3 = createElement("hr");
			text_42 = createText("\n\n                ");
			h4_4 = createElement("h4");
			h4_4.textContent = "Organizations";
			text_44 = createText("\n                ");
			p_3 = createElement("p");
			p_3.textContent = "-";
			text_47 = createText("\n            ");
			div_4 = createElement("div");
			button_1 = createElement("button");
			button_1.textContent = "Close";
			text_49 = createText("\n                ");
			button_2 = createElement("button");
			button_2.textContent = "Save changes";
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler);
			button.type = "button";
			button.className = "close";
			setAttribute(button, "aria-label", "Close");
			h4.className = "modal-title";
			div_2.className = "modal-header";
			b.className = "svelte-1fdkti1";
			b_1.className = "svelte-1fdkti1";
			b_2.className = "svelte-1fdkti1";
			b_3.className = "svelte-1fdkti1";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			b_4.className = "svelte-1fdkti1";
			b_5.className = "svelte-1fdkti1";
			ul.className = "unstyled props svelte-1fdkti1";
			div_3.className = "modal-body";
			addListener(button_1, "click", click_handler_1);
			button_1.type = "button";
			button_1.className = "btn btn-default";
			button_2.type = "button";
			button_2.className = "btn btn-primary";
			div_4.className = "modal-footer";
			div_1.className = "modal-content";
			div.className = "modal-dialog";
			setAttribute(div, "role", "document");
			section.className = "modal";
			section.tabIndex = "-1";
			setAttribute(section, "role", "dialog");
		},

		m: function mount(target, anchor) {
			insertNode(section, target, anchor);
			appendNode(div, section);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(button, div_2);
			appendNode(text_2, div_2);
			appendNode(h4, div_2);
			appendNode(text_3, h4);
			appendNode(text_5, div_1);
			appendNode(div_3, div_1);
			appendNode(ul, div_3);
			appendNode(li, ul);
			appendNode(b, li);
			appendNode(text_7, li);
			appendNode(text_8, li);
			appendNode(li_1, ul);
			appendNode(b_1, li_1);
			appendNode(text_10, li_1);
			appendNode(text_11, li_1);
			appendNode(li_2, ul);
			appendNode(b_2, li_2);
			appendNode(text_13, li_2);
			appendNode(text_14, li_2);
			appendNode(li_3, ul);
			appendNode(b_3, li_3);
			appendNode(text_16, li_3);
			appendNode(a, li_3);
			appendNode(text_17, a);
			appendNode(li_4, ul);
			appendNode(b_4, li_4);
			appendNode(text_21, li_4);
			appendNode(text_22, li_4);
			appendNode(li_5, ul);
			appendNode(b_5, li_5);
			appendNode(text_24, li_5);
			appendNode(text_25, li_5);
			appendNode(text_26, div_3);
			appendNode(hr, div_3);
			appendNode(text_27, div_3);
			appendNode(h4_1, div_3);
			appendNode(text_29, div_3);
			appendNode(p, div_3);
			appendNode(text_31, div_3);
			appendNode(hr_1, div_3);
			appendNode(text_32, div_3);
			appendNode(h4_2, div_3);
			appendNode(text_34, div_3);
			appendNode(p_1, div_3);
			appendNode(text_36, div_3);
			appendNode(hr_2, div_3);
			appendNode(text_37, div_3);
			appendNode(h4_3, div_3);
			appendNode(text_39, div_3);
			appendNode(p_2, div_3);
			appendNode(text_41, div_3);
			appendNode(hr_3, div_3);
			appendNode(text_42, div_3);
			appendNode(h4_4, div_3);
			appendNode(text_44, div_3);
			appendNode(p_3, div_3);
			appendNode(text_47, div_1);
			appendNode(div_4, div_1);
			appendNode(button_1, div_4);
			appendNode(text_49, div_4);
			appendNode(button_2, div_4);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_3_value !== (text_3_value = state.user.email)) {
				text_3.data = text_3_value;
			}

			if ((changed.user) && text_8_value !== (text_8_value = state.user.id)) {
				text_8.data = text_8_value;
			}

			if ((changed.user) && text_11_value !== (text_11_value = state.user.name || "–")) {
				text_11.data = text_11_value;
			}

			if ((changed.user) && text_14_value !== (text_14_value = state.user.email)) {
				text_14.data = text_14_value;
			}

			if ((changed.user) && text_17_value !== (text_17_value = state.user.chartCount)) {
				text_17.data = text_17_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}

			if ((changed.user) && text_22_value !== (text_22_value = state.user.createdAt)) {
				text_22.data = text_22_value;
			}

			if ((changed.user) && text_25_value !== (text_25_value = state.user.role)) {
				text_25.data = text_25_value;
			}
		},

		u: function unmount() {
			detachNode(section);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

function UserAdminDetails(options) {
	this._debugName = '<UserAdminDetails>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('user' in this._state)) { console.warn("<UserAdminDetails> was created without expected data property 'user'"); }

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(UserAdminDetails.prototype, protoDev);
assign(UserAdminDetails.prototype, methods);

UserAdminDetails.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/UserAdminTableHeader.html generated by Svelte v1.64.0 */

var methods$1 = {
    sort: function sort(event, orderBy) {
        event.preventDefault();
        this.fire('sort', orderBy);
    }
};

function create_main_fragment$1(component, state) {
	var thead, tr;

	var each_value = state.headerItems;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			item_index: i
		}));
	}

	return {
		c: function create() {
			thead = createElement("thead");
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},

		m: function mount(target, anchor) {
			insertNode(thead, target, anchor);
			appendNode(tr, thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.headerItems;

			if (changed.headerItems) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						item_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}
		},

		u: function unmount() {
			detachNode(thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (3:8) {#each headerItems as item}
function create_each_block(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var th;

	function select_block_type(state) {
		if (item.orderBy) { return create_if_block; }
		return create_if_block_1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			th = createElement("th");
			if_block.c();
		},

		m: function mount(target, anchor) {
			insertNode(th, target, anchor);
			if_block.m(th, null);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(th, null);
			}
		},

		u: function unmount() {
			detachNode(th);
			if_block.u();
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (5:12) {#if item.orderBy}
function create_if_block(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var a, text_value = item.name, text, a_href_value;

	return {
		c: function create() {
			a = createElement("a");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = a_href_value = "?orderBy=" + (item.orderBy);

			a._svelte = {
				component: component,
				each_value: state.each_value,
				item_index: state.item_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(a, target, anchor);
			appendNode(text, a);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.headerItems) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}

			if ((changed.headerItems) && a_href_value !== (a_href_value = "?orderBy=" + (item.orderBy))) {
				a.href = a_href_value;
			}

			a._svelte.each_value = state.each_value;
			a._svelte.item_index = state.item_index;
		},

		u: function unmount() {
			detachNode(a);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
		}
	};
}

// (7:12) {:else}
function create_if_block_1(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var span, text_value = item.name, text;

	return {
		c: function create() {
			span = createElement("span");
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(text, span);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.headerItems) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, item_index = this._svelte.item_index, item = each_value[item_index];
	component.sort(event, item.orderBy);
}

function UserAdminTableHeader(options) {
	this._debugName = '<UserAdminTableHeader>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('headerItems' in this._state)) { console.warn("<UserAdminTableHeader> was created without expected data property 'headerItems'"); }

	this._fragment = create_main_fragment$1(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(UserAdminTableHeader.prototype, protoDev);
assign(UserAdminTableHeader.prototype, methods$1);

UserAdminTableHeader.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/UserAdminTableRow.html generated by Svelte v1.64.0 */

function isCurrentStatus(ref) {
	var user = ref.user;

	return function (status) { return user.role === status; };
}

function status(ref) {
	var user = ref.user;
	var statusOptions = ref.statusOptions;

	return statusOptions.find(function (ref) {
		var slug = ref.slug;

		return slug === user.role;
	});
}

function data() {
    return {
        user: {},
        edit: false,

        // TODO: status options should probably be dynamic – how to load them?
        statusOptions: [
            { slug: 0, name: 'Administrator', icon: 'fire' },
            { slug: 1, name: 'Graphic Editor', icon: 'user' },
            { slug: 2, name: 'Pending', icon: 'user' },
            { slug: 3, name: 'Pending', icon: 'user' },
            { slug: 5, name: 'Editor', icon: 'user' }
        ]
    };
}
var methods$2 = {
    save: function save() {
        // TODO: save changes through API
        this.set({ edit: false });
    },

    navigate: function navigate(event, userId) {
        event.preventDefault();
        this.fire('navigate', userId);
    }
};

function create_main_fragment$2(component, state) {
	var tr, td, a, text_value = state.user.id, text, a_href_value, text_3, tr_class_value;

	function click_handler(event) {
		var state = component.get();
		component.navigate(event, state.user.id);
	}

	function select_block_type(state) {
		if (!state.edit) { return create_if_block$1; }
		return create_if_block_1$1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			tr = createElement("tr");
			td = createElement("td");
			a = createElement("a");
			text = createText(text_value);
			text_3 = createText("\n    ");
			if_block.c();
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = a_href_value = "?currentUser=" + state.user.id;
			td.className = "id out";
			tr.className = tr_class_value = "user role-" + state.user.role + " svelte-1n6kbpi";
		},

		m: function mount(target, anchor) {
			insertNode(tr, target, anchor);
			appendNode(td, tr);
			appendNode(a, td);
			appendNode(text, a);
			appendNode(text_3, tr);
			if_block.m(tr, null);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.id)) {
				text.data = text_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "?currentUser=" + state.user.id)) {
				a.href = a_href_value;
			}

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(tr, null);
			}

			if ((changed.user) && tr_class_value !== (tr_class_value = "user role-" + state.user.role + " svelte-1n6kbpi")) {
				tr.className = tr_class_value;
			}
		},

		u: function unmount() {
			detachNode(tr);
			if_block.u();
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
			if_block.d();
		}
	};
}

// (35:12) {#each statusOptions as status}
function create_each_block$1(component, state) {
	var status_1 = state.status, each_value = state.each_value, status_index = state.status_index;
	var option, text_value = __(status_1.name, 'admin-users'), text, option_value_value, option_selected_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = status_1.slug;
			option.value = option.__value;
			option.selected = option_selected_value = state.isCurrentStatus(status_1.slug);
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			status_1 = state.status;
			each_value = state.each_value;
			status_index = state.status_index;
			if ((changed.statusOptions) && text_value !== (text_value = __(status_1.name, 'admin-users'))) {
				text.data = text_value;
			}

			if ((changed.statusOptions) && option_value_value !== (option_value_value = status_1.slug)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
			if ((changed.isCurrentStatus || changed.statusOptions) && option_selected_value !== (option_selected_value = state.isCurrentStatus(status_1.slug))) {
				option.selected = option_selected_value;
			}
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (7:4) {#if !edit}
function create_if_block$1(component, state) {
	var td, text_value = state.user.name || '', text, text_1, td_1, text_2_value = state.user.email, text_2, text_3, td_2, i, i_class_value, text_4, text_5_value = __(state.status.name, 'admin-users'), text_5, text_7, td_3, text_8_value = state.user.createdAt, text_8, text_9, td_4, a, text_10_value = state.user.chartCount, text_10, a_href_value, text_12, td_5, button, i_1, i_1_title_value, text_14, button_1, i_2, i_2_title_value;

	function click_handler(event) {
		component.set({ edit: true });
	}

	return {
		c: function create() {
			td = createElement("td");
			text = createText(text_value);
			text_1 = createText("\n    ");
			td_1 = createElement("td");
			text_2 = createText(text_2_value);
			text_3 = createText("\n    ");
			td_2 = createElement("td");
			i = createElement("i");
			text_4 = createText("\n        ");
			text_5 = createText(text_5_value);
			text_7 = createText("\n    ");
			td_3 = createElement("td");
			text_8 = createText(text_8_value);
			text_9 = createText("\n    ");
			td_4 = createElement("td");
			a = createElement("a");
			text_10 = createText(text_10_value);
			text_12 = createText("\n    ");
			td_5 = createElement("td");
			button = createElement("button");
			i_1 = createElement("i");
			text_14 = createText("\n        ");
			button_1 = createElement("button");
			i_2 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			td.className = "name out";
			td_1.className = "email out";
			i.className = i_class_value = "icon-" + state.status.icon + " svelte-1n6kbpi";
			i.title = "Editor";
			td_3.className = "creation out";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			td_4.className = "center";
			i_1.className = "icon-pencil";
			i_1.title = i_1_title_value = __('edit', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-1n6kbpi";
			i_2.className = "icon-envelope";
			i_2.title = i_2_title_value = __('reset the password and send a mail', 'admin-users');
			button_1.className = "action svelte-1n6kbpi";
			td_5.className = "actions svelte-1n6kbpi";
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			appendNode(text, td);
			insertNode(text_1, target, anchor);
			insertNode(td_1, target, anchor);
			appendNode(text_2, td_1);
			insertNode(text_3, target, anchor);
			insertNode(td_2, target, anchor);
			appendNode(i, td_2);
			appendNode(text_4, td_2);
			appendNode(text_5, td_2);
			insertNode(text_7, target, anchor);
			insertNode(td_3, target, anchor);
			appendNode(text_8, td_3);
			insertNode(text_9, target, anchor);
			insertNode(td_4, target, anchor);
			appendNode(a, td_4);
			appendNode(text_10, a);
			insertNode(text_12, target, anchor);
			insertNode(td_5, target, anchor);
			appendNode(button, td_5);
			appendNode(i_1, button);
			appendNode(text_14, td_5);
			appendNode(button_1, td_5);
			appendNode(i_2, button_1);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.name || '')) {
				text.data = text_value;
			}

			if ((changed.user) && text_2_value !== (text_2_value = state.user.email)) {
				text_2.data = text_2_value;
			}

			if ((changed.status) && i_class_value !== (i_class_value = "icon-" + state.status.icon + " svelte-1n6kbpi")) {
				i.className = i_class_value;
			}

			if ((changed.status) && text_5_value !== (text_5_value = __(state.status.name, 'admin-users'))) {
				text_5.data = text_5_value;
			}

			if ((changed.user) && text_8_value !== (text_8_value = state.user.createdAt)) {
				text_8.data = text_8_value;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.chartCount)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_1);
			detachNode(td_1);
			detachNode(text_3);
			detachNode(td_2);
			detachNode(text_7);
			detachNode(td_3);
			detachNode(text_9);
			detachNode(td_4);
			detachNode(text_12);
			detachNode(td_5);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

// (26:4) {:else}
function create_if_block_1$1(component, state) {
	var td, input, input_value_value, text_1, td_1, input_1, input_1_value_value, text_3, td_2, select, text_5, td_3, text_7, td_4, a, text_8_value = state.user.chartCount, text_8, a_href_value, text_10, td_5, button, i, i_title_value, text_12, button_1, i_1, i_1_title_value;

	var each_value = state.statusOptions;

	var each_blocks = [];

	for (var i_2 = 0; i_2 < each_value.length; i_2 += 1) {
		each_blocks[i_2] = create_each_block$1(component, assign(assign({}, state), {
			each_value: each_value,
			status: each_value[i_2],
			status_index: i_2
		}));
	}

	function click_handler(event) {
		component.save();
	}

	function click_handler_1(event) {
		component.set({ edit: false });
	}

	return {
		c: function create() {
			td = createElement("td");
			input = createElement("input");
			text_1 = createText("\n    ");
			td_1 = createElement("td");
			input_1 = createElement("input");
			text_3 = createText("\n    ");
			td_2 = createElement("td");
			select = createElement("select");

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].c();
			}

			text_5 = createText("\n    ");
			td_3 = createElement("td");
			td_3.textContent = "2019-01-31 11:46:25";
			text_7 = createText("\n    ");
			td_4 = createElement("td");
			a = createElement("a");
			text_8 = createText(text_8_value);
			text_10 = createText("\n    ");
			td_5 = createElement("td");
			button = createElement("button");
			i = createElement("i");
			text_12 = createText("\n        ");
			button_1 = createElement("button");
			i_1 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			setAttribute(input, "type", "text");
			input.value = input_value_value = state.user.name;
			input.className = "svelte-1n6kbpi";
			setAttribute(input_1, "type", "email");
			input_1.value = input_1_value_value = state.user.email;
			input_1.className = "svelte-1n6kbpi";
			td_1.className = "email";
			select.name = "status";
			select.className = "svelte-1n6kbpi";
			td_3.className = "creation out";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			td_4.className = "center";
			i.className = "icon-ok";
			i.title = i_title_value = __('save', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-1n6kbpi";
			i_1.className = "icon-remove";
			i_1.title = i_1_title_value = __('cancel', 'admin-users');
			addListener(button_1, "click", click_handler_1);
			button_1.className = "action svelte-1n6kbpi";
			td_5.className = "actions svelte-1n6kbpi";
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			appendNode(input, td);
			insertNode(text_1, target, anchor);
			insertNode(td_1, target, anchor);
			appendNode(input_1, td_1);
			insertNode(text_3, target, anchor);
			insertNode(td_2, target, anchor);
			appendNode(select, td_2);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].m(select, null);
			}

			insertNode(text_5, target, anchor);
			insertNode(td_3, target, anchor);
			insertNode(text_7, target, anchor);
			insertNode(td_4, target, anchor);
			appendNode(a, td_4);
			appendNode(text_8, a);
			insertNode(text_10, target, anchor);
			insertNode(td_5, target, anchor);
			appendNode(button, td_5);
			appendNode(i, button);
			appendNode(text_12, td_5);
			appendNode(button_1, td_5);
			appendNode(i_1, button_1);
		},

		p: function update(changed, state) {
			if ((changed.user) && input_value_value !== (input_value_value = state.user.name)) {
				input.value = input_value_value;
			}

			if ((changed.user) && input_1_value_value !== (input_1_value_value = state.user.email)) {
				input_1.value = input_1_value_value;
			}

			var each_value = state.statusOptions;

			if (changed.statusOptions || changed.isCurrentStatus) {
				for (var i_2 = 0; i_2 < each_value.length; i_2 += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						status: each_value[i_2],
						status_index: i_2
					});

					if (each_blocks[i_2]) {
						each_blocks[i_2].p(changed, each_context);
					} else {
						each_blocks[i_2] = create_each_block$1(component, each_context);
						each_blocks[i_2].c();
						each_blocks[i_2].m(select, null);
					}
				}

				for (; i_2 < each_blocks.length; i_2 += 1) {
					each_blocks[i_2].u();
					each_blocks[i_2].d();
				}
				each_blocks.length = each_value.length;
			}

			if ((changed.user) && text_8_value !== (text_8_value = state.user.chartCount)) {
				text_8.data = text_8_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_1);
			detachNode(td_1);
			detachNode(text_3);
			detachNode(td_2);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].u();
			}

			detachNode(text_5);
			detachNode(td_3);
			detachNode(text_7);
			detachNode(td_4);
			detachNode(text_10);
			detachNode(td_5);
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

function UserAdminTableRow(options) {
	this._debugName = '<UserAdminTableRow>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ user: 1, statusOptions: 1 }, this._state);
	if (!('user' in this._state)) { console.warn("<UserAdminTableRow> was created without expected data property 'user'"); }
	if (!('statusOptions' in this._state)) { console.warn("<UserAdminTableRow> was created without expected data property 'statusOptions'"); }
	if (!('edit' in this._state)) { console.warn("<UserAdminTableRow> was created without expected data property 'edit'"); }

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(UserAdminTableRow.prototype, protoDev);
assign(UserAdminTableRow.prototype, methods$2);

UserAdminTableRow.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('isCurrentStatus' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserAdminTableRow>: Cannot set read-only property 'isCurrentStatus'"); }
	if ('status' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserAdminTableRow>: Cannot set read-only property 'status'"); }
};

UserAdminTableRow.prototype._recompute = function _recompute(changed, state) {
	if (changed.user) {
		if (this._differs(state.isCurrentStatus, (state.isCurrentStatus = isCurrentStatus(state)))) { changed.isCurrentStatus = true; }
	}

	if (changed.user || changed.statusOptions) {
		if (this._differs(state.status, (state.status = status(state)))) { changed.status = true; }
	}
};

/* admin/users/UserAdminPagination.html generated by Svelte v1.64.0 */

function items(ref) {
    var pages = ref.pages;
    var url = ref.url;
    var currentPageNum = ref.currentPageNum;

    var firstItem = pages[0].state;
    var lastItem = pages[pages.length - 1].state;
    var getUrl = url || (function (state) { return ("?" + (queryString_3(state))); });

    return [
        {
            text: '«',
            href: getUrl(firstItem),
            active: currentPageNum === 0,
            state: firstItem
        } ].concat( pages.map(function (ref, i) {
        	var state = ref.state;

        	return ({
            text: i + 1,
            href: getUrl(state),
            active: currentPageNum === i,
            state: state
        });
    }),
        [{
            text: '»',
            href: getUrl(lastItem),
            active: currentPageNum === pages.length - 1,
            state: lastItem
        }]
    );
}

var methods$3 = {
    navigate: function navigate(event, state) {
        event.preventDefault();
        this.fire('navigate', state);
    }
};

function create_main_fragment$3(component, state) {
	var div, ul;

	var each_value = state.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			item_index: i
		}));
	}

	return {
		c: function create() {
			div = createElement("div");
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			div.className = "pagination";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(ul, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.items;

			if (changed.items) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						item_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(ul, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (3:8) {#each items as item}
function create_each_block$2(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var li, a, text_value = item.text, text, a_href_value, li_class_value;

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler$1);
			a.href = a_href_value = item.href;

			a._svelte = {
				component: component,
				each_value: state.each_value,
				item_index: state.item_index
			};

			li.className = li_class_value = item.active ? 'active' : '';
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);
			appendNode(text, a);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.items) && text_value !== (text_value = item.text)) {
				text.data = text_value;
			}

			if ((changed.items) && a_href_value !== (a_href_value = item.href)) {
				a.href = a_href_value;
			}

			a._svelte.each_value = state.each_value;
			a._svelte.item_index = state.item_index;

			if ((changed.items) && li_class_value !== (li_class_value = item.active ? 'active' : '')) {
				li.className = li_class_value;
			}
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler$1);
		}
	};
}

function click_handler$1(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, item_index = this._svelte.item_index, item = each_value[item_index];
	component.navigate(event, item.state);
}

function UserAdminPagination(options) {
	this._debugName = '<UserAdminPagination>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	this._recompute({ pages: 1, url: 1, currentPageNum: 1 }, this._state);
	if (!('pages' in this._state)) { console.warn("<UserAdminPagination> was created without expected data property 'pages'"); }
	if (!('url' in this._state)) { console.warn("<UserAdminPagination> was created without expected data property 'url'"); }
	if (!('currentPageNum' in this._state)) { console.warn("<UserAdminPagination> was created without expected data property 'currentPageNum'"); }

	this._fragment = create_main_fragment$3(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(UserAdminPagination.prototype, protoDev);
assign(UserAdminPagination.prototype, methods$3);

UserAdminPagination.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('items' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserAdminPagination>: Cannot set read-only property 'items'"); }
};

UserAdminPagination.prototype._recompute = function _recompute(changed, state) {
	if (changed.pages || changed.url || changed.currentPageNum) {
		if (this._differs(state.items, (state.items = items(state)))) { changed.items = true; }
	}
};

/* admin/users/UserAdmin.html generated by Svelte v1.64.0 */

var BASE_URL = '//api.datawrapper.local:18080/v3/users';

function currentPageNum(ref) {
	var limit = ref.limit;
	var offset = ref.offset;

	return Math.ceil(offset / limit);
}

function paginationItems(ref) {
	var total = ref.total;
	var limit = ref.limit;
	var offset = ref.offset;

	return Array.from({ length: Math.ceil(total / limit) }, function (v, i) { return ({
        state: { limit: limit, offset: i * limit }
    }); });
}

function data$1() {
    return {
        list: [],
        orderBy: 'id',
        loader: null,
        offset: 0,
        limit: 10,
        total: 0,
        columnHeaders: [
            { name: '#', orderBy: 'id' },
            { name: __('Name', 'admin-users'), orderBy: 'name' },
            { name: __('Sign-in', 'admin-users'), orderBy: 'email' },
            { name: __('Status', 'admin-users') },
            { name: __('Created at', 'admin-users'), orderBy: 'createdAt' },
            { name: __('Charts', 'admin-users') },
            { name: __('Actions', 'admin-users') }
        ]
    };
}
var methods$4 = {
    sort: function sort(orderBy) {
        this.set({ orderBy: orderBy, offset: 0 });
        var state = { orderBy: orderBy };
        window.history.replaceState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    gotoPage: function gotoPage(ref) {
        var offset = ref.offset;
        var limit = ref.limit;

        this.set({ offset: offset, limit: limit });
        var ref$1 = this.get();
        var orderBy = ref$1.orderBy;
        var state = { offset: offset, limit: limit, orderBy: orderBy };
        window.history.replaceState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    showDetails: function showDetails(currentUser) {
        this.set({ currentUser: currentUser });
        window.history.replaceState({ currentUser: currentUser }, '', ("?currentUser=" + currentUser));
        this.loadUserDetails();
    },

    closeDetails: function closeDetails() {
        var state = { currentUser: null, userDetails: null };
        this.set(state);
        window.history.replaceState(state, '', '?');
    },

    loadUserList: function loadUserList() {
        var this$1 = this;

        var ref = this.get();
        var offset = ref.offset;
        var limit = ref.limit;
        var orderBy = ref.orderBy;
        var loader = getJSON((BASE_URL + "?" + (queryString_3({ offset: offset, limit: limit, orderBy: orderBy }))), function (data) {
            if (data && data.list) {
                var total = data.total;
                var list = data.list;
                this$1.set({ list: list, total: total });
            }
        });
        this.set({ loader: loader });
    },

    loadUserDetails: function loadUserDetails() {
        var this$1 = this;

        var ref = this.get();
        var currentUser = ref.currentUser;
        if (currentUser) {
            getJSON((BASE_URL + "/" + currentUser), function (data) {
                if (data) { this$1.set({ userDetails: data }); }
            });
        }
    }
};

function oncreate() {
    var ref = queryString_2(window.location.search);
    var offset = ref.offset;
    var limit = ref.limit;
    var orderBy = ref.orderBy;
    var currentUser = ref.currentUser;
    this.set({ offset: offset, limit: limit, orderBy: orderBy, currentUser: currentUser });
    this.loadUserList();
    this.loadUserDetails();
}
function create_main_fragment$4(component, state) {
	var div, text, table, text_1, tbody, text_4;

	var if_block = (state.userDetails) && create_if_block$2(component, state);

	var useradmintableheader_initial_data = { headerItems: state.columnHeaders };
	var useradmintableheader = new UserAdminTableHeader({
		root: component.root,
		data: useradmintableheader_initial_data
	});

	useradmintableheader.on("sort", function(event) {
		component.sort(event);
	});

	var each_value = state.list;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
			each_value: each_value,
			user: each_value[i],
			user_index: i
		}));
	}

	var if_block_1 = (state.paginationItems.length > 0) && create_if_block_1$2(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			text = createText("\n\n    ");
			table = createElement("table");
			useradmintableheader._fragment.c();
			text_1 = createText("\n\n        ");
			tbody = createElement("tbody");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_4 = createText("\n\n    ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			tbody.className = "users";
			table.className = "table users";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
			appendNode(text, div);
			appendNode(table, div);
			useradmintableheader._mount(table, null);
			appendNode(text_1, table);
			appendNode(tbody, table);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			appendNode(text_4, div);
			if (if_block_1) { if_block_1.m(div, null); }
		},

		p: function update(changed, state) {
			if (state.userDetails) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$2(component, state);
					if_block.c();
					if_block.m(div, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var useradmintableheader_changes = {};
			if (changed.columnHeaders) { useradmintableheader_changes.headerItems = state.columnHeaders; }
			useradmintableheader._set(useradmintableheader_changes);

			var each_value = state.list;

			if (changed.list) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						user: each_value[i],
						user_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$3(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (state.paginationItems.length > 0) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$2(component, state);
					if_block_1.c();
					if_block_1.m(div, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			useradmintableheader.destroy(false);

			destroyEach(each_blocks);

			if (if_block_1) { if_block_1.d(); }
		}
	};
}

// (2:4) {#if userDetails}
function create_if_block$2(component, state) {

	var useradmindetails_initial_data = { user: state.userDetails };
	var useradmindetails = new UserAdminDetails({
		root: component.root,
		data: useradmindetails_initial_data
	});

	useradmindetails.on("close", function(event) {
		component.closeDetails();
	});

	return {
		c: function create() {
			useradmindetails._fragment.c();
		},

		m: function mount(target, anchor) {
			useradmindetails._mount(target, anchor);
		},

		p: function update(changed, state) {
			var useradmindetails_changes = {};
			if (changed.userDetails) { useradmindetails_changes.user = state.userDetails; }
			useradmindetails._set(useradmindetails_changes);
		},

		u: function unmount() {
			useradmindetails._unmount();
		},

		d: function destroy$$1() {
			useradmindetails.destroy(false);
		}
	};
}

// (10:12) {#each list as user}
function create_each_block$3(component, state) {
	var user = state.user, each_value = state.each_value, user_index = state.user_index;

	var useradmintablerow_initial_data = { user: user };
	var useradmintablerow = new UserAdminTableRow({
		root: component.root,
		data: useradmintablerow_initial_data
	});

	useradmintablerow.on("navigate", function(event) {
		component.showDetails(event);
	});

	return {
		c: function create() {
			useradmintablerow._fragment.c();
		},

		m: function mount(target, anchor) {
			useradmintablerow._mount(target, anchor);
		},

		p: function update(changed, state) {
			user = state.user;
			each_value = state.each_value;
			user_index = state.user_index;
			var useradmintablerow_changes = {};
			if (changed.list) { useradmintablerow_changes.user = user; }
			useradmintablerow._set(useradmintablerow_changes);
		},

		u: function unmount() {
			useradmintablerow._unmount();
		},

		d: function destroy$$1() {
			useradmintablerow.destroy(false);
		}
	};
}

// (16:4) {#if paginationItems.length > 0}
function create_if_block_1$2(component, state) {
	var div;

	var useradminpagination_initial_data = {
	 	pages: state.paginationItems,
	 	currentPageNum: state.currentPageNum
	 };
	var useradminpagination = new UserAdminPagination({
		root: component.root,
		data: useradminpagination_initial_data
	});

	useradminpagination.on("navigate", function(event) {
		component.gotoPage(event);
	});

	return {
		c: function create() {
			div = createElement("div");
			useradminpagination._fragment.c();
			this.h();
		},

		h: function hydrate() {
			div.className = "pull-right";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			useradminpagination._mount(div, null);
		},

		p: function update(changed, state) {
			var useradminpagination_changes = {};
			if (changed.paginationItems) { useradminpagination_changes.pages = state.paginationItems; }
			if (changed.currentPageNum) { useradminpagination_changes.currentPageNum = state.currentPageNum; }
			useradminpagination._set(useradminpagination_changes);
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			useradminpagination.destroy(false);
		}
	};
}

function UserAdmin(options) {
	this._debugName = '<UserAdmin>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$1(), options.data);
	this._recompute({ limit: 1, offset: 1, total: 1 }, this._state);
	if (!('limit' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'limit'"); }
	if (!('offset' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'offset'"); }
	if (!('total' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'total'"); }
	if (!('userDetails' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'userDetails'"); }
	if (!('columnHeaders' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'columnHeaders'"); }
	if (!('list' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'list'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { limit: 1, offset: 1, total: 1, userDetails: 1, columnHeaders: 1, list: 1, paginationItems: 1, currentPageNum: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(UserAdmin.prototype, protoDev);
assign(UserAdmin.prototype, methods$4);

UserAdmin.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentPageNum' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserAdmin>: Cannot set read-only property 'currentPageNum'"); }
	if ('paginationItems' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserAdmin>: Cannot set read-only property 'paginationItems'"); }
};

UserAdmin.prototype._recompute = function _recompute(changed, state) {
	if (changed.limit || changed.offset) {
		if (this._differs(state.currentPageNum, (state.currentPageNum = currentPageNum(state)))) { changed.currentPageNum = true; }
	}

	if (changed.total || changed.limit || changed.offset) {
		if (this._differs(state.paginationItems, (state.paginationItems = paginationItems(state)))) { changed.paginationItems = true; }
	}
};

function Store(state, options) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._handlers = {};
	this._dependents = [];

	this._computed = blankObject();
	this._sortedComputedProperties = [];

	this._state = assign({}, state);
	this._differs = options && options.immutable ? _differsImmutable : _differs;
}

assign(Store.prototype, {
	_add: function(component, props) {
		this._dependents.push({
			component: component,
			props: props
		});
	},

	_init: function(props) {
		var this$1 = this;

		var state = {};
		for (var i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this$1._state[prop];
		}
		return state;
	},

	_remove: function(component) {
		var this$1 = this;

		var i = this._dependents.length;
		while (i--) {
			if (this$1._dependents[i].component === component) {
				this$1._dependents.splice(i, 1);
				return;
			}
		}
	},

	_sortComputedProperties: function() {
		var this$1 = this;

		var computed = this._computed;
		var sorted = this._sortedComputedProperties = [];
		var cycles;
		var visited = blankObject();

		function visit(key) {
			if (cycles[key]) {
				throw new Error('Cyclical dependency detected');
			}

			if (visited[key]) { return; }
			visited[key] = true;

			var c = computed[key];

			if (c) {
				cycles[key] = true;
				c.deps.forEach(visit);
				sorted.push(c);
			}
		}

		for (var key in this$1._computed) {
			cycles = blankObject();
			visit(key);
		}
	},

	compute: function(key, deps, fn) {
		var store = this;
		var value;

		var c = {
			deps: deps,
			update: function(state, changed, dirty) {
				var values = deps.map(function(dep) {
					if (dep in changed) { dirty = true; }
					return state[dep];
				});

				if (dirty) {
					var newValue = fn.apply(null, values);
					if (store._differs(newValue, value)) {
						value = newValue;
						changed[key] = true;
						state[key] = value;
					}
				}
			}
		};

		c.update(this._state, {}, true);

		this._computed[key] = c;
		this._sortComputedProperties();
	},

	fire: fire,

	get: get,

	// TODO remove this method
	observe: observe,

	on: on,

	onchange: function(callback) {
		// TODO remove this method
		console.warn("store.onchange is deprecated in favour of store.on('state', event => {...})");

		return this.on('state', function(event) {
			callback(event.current, event.changed);
		});
	},

	set: function(newState) {
		var this$1 = this;

		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (this$1._computed[key]) { throw new Error("'" + key + "' is a read-only property"); }
			if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
		}
		if (!dirty) { return; }

		this._state = assign(assign({}, oldState), newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this$1._sortedComputedProperties[i].update(this$1._state, changed);
		}

		this.fire('state', {
			changed: changed,
			current: this._state,
			previous: oldState
		});

		var dependents = this._dependents.slice(); // guard against mutations
		for (var i = 0; i < dependents.length; i += 1) {
			var dependent = dependents[i];
			var componentState = {};
			dirty = false;

			for (var j = 0; j < dependent.props.length; j += 1) {
				var prop = dependent.props[j];
				if (prop in changed) {
					componentState['$' + prop] = this$1._state[prop];
					dirty = true;
				}
			}

			if (dirty) { dependent.component.set(componentState); }
		}

		this.fire('update', {
			changed: changed,
			current: this._state,
			previous: oldState
		});
	}
});

var store = new Store({});

var main = { App: UserAdmin, store: store, data: {} };

return main;

})));
//# sourceMappingURL=users.js.map