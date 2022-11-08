(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/publish', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.publish = factory());
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

	/* globals dw */

	const __messages$1 = {};

	function initMessages$1(scope = 'core') {
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
	function __$1(key, scope = 'core') {
	    key = key.trim();
	    if (!__messages$1[scope]) initMessages$1(scope);
	    if (!__messages$1[scope][key]) return 'MISSING:' + key;
	    var translation = __messages$1[scope][key];

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

	/**
	 * tracks a custom event in Matomo
	 *
	 *
	 * @param {string} category - the event category
	 * @param {string} category - the event action
	 * @param {string} category - the event name
	 * @param {string|number} category - the event value, optional
	 */
	function trackEvent$1(category, action, name, value) {
	    if (window._paq) {
	        window._paq.push(['trackEvent', category, action, name, value]);
	    }
	}

	/* node_modules/@datawrapper/controls/IconDisplay.html generated by Svelte v2.16.1 */

	// Path to SVG tile set on https://app.datawrapper.de:
	const DEFAULT_ASSET_URL = '/lib/icons/symbol/svg/sprite.symbol.svg';

	function iconURL({ icon, assetURL }) {
		return `${assetURL || DEFAULT_ASSET_URL}#${icon}`;
	}

	function data$e() {
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
	const file$d = "node_modules/datawrapper/controls/IconDisplay.html";

	function create_main_fragment$d(component, ctx) {
		var span, svg, use, span_class_value;

		return {
			c: function create() {
				span = createElement("span");
				svg = createSvgElement("svg");
				use = createSvgElement("use");
				setStyle(use, "fill", ctx.color);
				setXlinkAttribute(use, "xlink:href", ctx.iconURL);
				addLoc(use, file$d, 7, 8, 263);
				setStyle(svg, "height", ctx.size);
				setStyle(svg, "width", ctx.size);
				setAttribute(svg, "class", "svelte-1th5ah8");
				addLoc(svg, file$d, 6, 4, 213);
				span.className = span_class_value = "svg-icon " + ctx.class + " svelte-1th5ah8";
				span.dataset.uid = ctx.uid;
				setStyle(span, "animation-timing-function", ctx.timing);
				setStyle(span, "animation-duration", ctx.duration);
				setStyle(span, "height", ctx.size);
				setStyle(span, "width", ctx.size);
				setStyle(span, "vertical-align", ctx.valign);
				toggleClass(span, "spin", ctx.spin);
				addLoc(span, file$d, 0, 0, 0);
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
		this._state = assign(data$e(), options.data);

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

		this._fragment = create_main_fragment$d(this, this._state);

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

	var upgradeIcon = '<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>';

	/* node_modules/@datawrapper/controls/AlertDisplay.html generated by Svelte v2.16.1 */


	function data$d() {
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
	var methods$7 = {
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

	const file$c = "node_modules/datawrapper/controls/AlertDisplay.html";

	function create_main_fragment$c(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block$b(component, ctx);

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
						if_block = create_if_block$b(component, ctx);
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
	function create_if_block$b(component, ctx) {
		var div, div_class_value;

		function select_block_type(ctx) {
			if (ctx.type ==='upgrade-info') return create_if_block_1$a;
			return create_else_block$4;
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
				addLoc(div, file$c, 1, 0, 14);
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
	function create_else_block$4(component, ctx) {
		var text0, slot_content_default = component._slotted.default, slot_content_default_before, slot_content_default_after, text1;

		var if_block = (ctx.closeable || ctx.title) && create_if_block_2$5(component, ctx);

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
						if_block = create_if_block_2$5(component, ctx);
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
	function create_if_block_1$a(component, ctx) {
		var div0, span0, text0, div1, span1, text1_value = __$1('upgrade-available'), text1, text2, raw1_value = __$1('upgrade-info'), raw1_before;

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
				addLoc(span0, file$c, 13, 22, 408);
				div0.className = "icon";
				addLoc(div0, file$c, 13, 4, 390);
				span1.className = "title svelte-1h26igv";
				addLoc(span1, file$c, 14, 9, 477);
				addLoc(div1, file$c, 14, 4, 472);
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
	function create_if_block_2$5(component, ctx) {
		var div, text0, text1, if_block2_anchor;

		var if_block0 = (ctx.title) && create_if_block_5$1(component, ctx);

		var if_block1 = (ctx.closeable) && create_if_block_4$1(component);

		var if_block2 = (ctx.title) && create_if_block_3$4();

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
				addLoc(div, file$c, 16, 4, 604);
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
						if_block1 = create_if_block_4$1(component);
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
						if_block2 = create_if_block_3$4();
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
				addLoc(div, file$c, 18, 8, 661);
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
	function create_if_block_4$1(component, ctx) {
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
				addLoc(button, file$c, 20, 8, 732);
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
	function create_if_block_3$4(component, ctx) {
		var hr;

		return {
			c: function create() {
				hr = createElement("hr");
				hr.className = "svelte-1h26igv";
				addLoc(hr, file$c, 24, 4, 868);
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
		this._state = assign(data$d(), options.data);
		if (!('visible' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'visible'");
		if (!('type' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'type'");
		if (!('title' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'title'");
		if (!('class' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'uid'");
		if (!('closeable' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'closeable'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$c(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(AlertDisplay.prototype, protoDev);
	assign(AlertDisplay.prototype, methods$7);

	AlertDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/publish/PublishButtonControl.html generated by Svelte v2.16.1 */



	function publishWait$1({ publishStarted, now }) {
	    return publishStarted > 0 ? now - publishStarted : 0;
	}
	function publishSuccess({ progress, publishing }) {
	    return progress && progress.includes('done') && !publishing;
	}
	function data$c() {
	    return {
	        published: false,
	        publishing: false,
	        publishStarted: 0,
	        now: 0,
	        publishError: false,
	        publishSuccess: false,
	        needsRepublish: false,
	        progress: [],
	        redirectDisabled: false,
	        publicVersion: 0,
	        assetURL: null
	    };
	}
	var methods$6 = {
	    publish() {
	        trackEvent$1('Chart Editor', 'publish');
	        this.fire('publish');
	    },
	    unpublish() {
	        trackEvent$1('Chart Editor', 'unpublish');
	        this.fire('unpublish');
	    }
	};

	const file$b = "node_modules/datawrapper/controls/publish/PublishButtonControl.html";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.step = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$b(component, ctx) {
		var div1, text0, div0, button, button_disabled_value, text1, text2, text3, text4, text5, if_block6_anchor;

		function select_block_type(ctx) {
			if (ctx.unpublishing) return create_if_block_12;
			if (ctx.unpublished) return create_if_block_13;
			if (!ctx.published && !ctx.publishing) return create_if_block_14;
			if (ctx.publishing) return create_if_block_15;
			if (ctx.needsRepublish && !ctx.publishing) return create_if_block_16;
			if (ctx.published && ctx.publishSuccess && !ctx.needsRepublish) return create_if_block_17;
			if (ctx.published && !ctx.needsRepublish) return create_if_block_18;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.unpublishing) return create_if_block_8;
			if (ctx.published) return create_if_block_9;
			return create_else_block_3;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block1 = current_block_type_1(component, ctx);

		function click_handler(event) {
			component.publish();
		}

		var if_block2 = (ctx.publishing && ctx.publishWait > 3000) && create_if_block_5(component, ctx);

		var if_block3 = (ctx.published && !ctx.publishing && !ctx.unpublishing) && create_if_block_4(component, ctx);

		var if_block4 = (ctx.publishError) && create_if_block_3$3(component, ctx);

		var if_block5 = (!ctx.published && !ctx.unpublished) && create_if_block_2$4();

		var if_block6 = (ctx.published && ctx.publishSuccess && ctx.publicVersion > 1) && create_if_block$a(component, ctx);

		var alertdisplay_initial_data = {
		 	type: ctx.redirectDisabled ? 'warning' : 'info',
		 	visible: ctx.published && ctx.publishSuccess && ctx.publicVersion > 1,
		 	class: "mt-4 mb-4"
		 };
		var alertdisplay = new AlertDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: alertdisplay_initial_data
		});

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				div0 = createElement("div");
				button = createElement("button");
				if_block1.c();
				text1 = createText("\n\n    \n    ");
				if (if_block2) if_block2.c();
				text2 = createText("\n\n\n");
				if (if_block3) if_block3.c();
				text3 = createText("\n\n\n");
				if (if_block4) if_block4.c();
				text4 = createText("\n\n\n");
				if (if_block5) if_block5.c();
				text5 = createText("\n\n\n");
				if (if_block6) if_block6.c();
				if_block6_anchor = createComment();
				alertdisplay._fragment.c();
				addListener(button, "click", click_handler);
				button.disabled = button_disabled_value = ctx.publishing || ctx.unpublishing;
				button.className = "button-wrapper svelte-1g9lhqv";
				toggleClass(button, "is-unpublishing", ctx.unpublishing);
				addLoc(button, file$b, 44, 8, 1931);
				div0.className = "action svelte-1g9lhqv";
				addLoc(div0, file$b, 43, 4, 1902);
				div1.className = "publish-status svelte-1g9lhqv";
				toggleClass(div1, "is-busy", ctx.publishing || ctx.unpublishing);
				toggleClass(div1, "is-published", ctx.published && !ctx.unpublishing && !ctx.publishing && !ctx.needsRepublish && !ctx.publishSuccess);
				toggleClass(div1, "alert", ctx.needsRepublish && !ctx.publishing);
				toggleClass(div1, "alert-success", ctx.publishSuccess);
				addLoc(div1, file$b, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) if_block0.m(div1, null);
				append(div1, text0);
				append(div1, div0);
				append(div0, button);
				if_block1.m(button, null);
				append(div1, text1);
				if (if_block2) if_block2.m(div1, null);
				insert(target, text2, anchor);
				if (if_block3) if_block3.m(target, anchor);
				insert(target, text3, anchor);
				if (if_block4) if_block4.m(target, anchor);
				insert(target, text4, anchor);
				if (if_block5) if_block5.m(target, anchor);
				insert(target, text5, anchor);
				if (if_block6) if_block6.m(alertdisplay._slotted.default, null);
				append(alertdisplay._slotted.default, if_block6_anchor);
				alertdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(div1, text0);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(component, ctx);
					if_block1.c();
					if_block1.m(button, null);
				}

				if ((changed.publishing || changed.unpublishing) && button_disabled_value !== (button_disabled_value = ctx.publishing || ctx.unpublishing)) {
					button.disabled = button_disabled_value;
				}

				if (changed.unpublishing) {
					toggleClass(button, "is-unpublishing", ctx.unpublishing);
				}

				if (ctx.publishing && ctx.publishWait > 3000) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_5(component, ctx);
						if_block2.c();
						if_block2.m(div1, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if ((changed.publishing || changed.unpublishing)) {
					toggleClass(div1, "is-busy", ctx.publishing || ctx.unpublishing);
				}

				if ((changed.published || changed.unpublishing || changed.publishing || changed.needsRepublish || changed.publishSuccess)) {
					toggleClass(div1, "is-published", ctx.published && !ctx.unpublishing && !ctx.publishing && !ctx.needsRepublish && !ctx.publishSuccess);
				}

				if ((changed.needsRepublish || changed.publishing)) {
					toggleClass(div1, "alert", ctx.needsRepublish && !ctx.publishing);
				}

				if (changed.publishSuccess) {
					toggleClass(div1, "alert-success", ctx.publishSuccess);
				}

				if (ctx.published && !ctx.publishing && !ctx.unpublishing) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_4(component, ctx);
						if_block3.c();
						if_block3.m(text3.parentNode, text3);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.publishError) {
					if (if_block4) {
						if_block4.p(changed, ctx);
					} else {
						if_block4 = create_if_block_3$3(component, ctx);
						if_block4.c();
						if_block4.m(text4.parentNode, text4);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (!ctx.published && !ctx.unpublished) {
					if (!if_block5) {
						if_block5 = create_if_block_2$4();
						if_block5.c();
						if_block5.m(text5.parentNode, text5);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (ctx.published && ctx.publishSuccess && ctx.publicVersion > 1) {
					if (if_block6) {
						if_block6.p(changed, ctx);
					} else {
						if_block6 = create_if_block$a(component, ctx);
						if_block6.c();
						if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
					}
				} else if (if_block6) {
					if_block6.d(1);
					if_block6 = null;
				}

				var alertdisplay_changes = {};
				if (changed.redirectDisabled) alertdisplay_changes.type = ctx.redirectDisabled ? 'warning' : 'info';
				if (changed.published || changed.publishSuccess || changed.publicVersion) alertdisplay_changes.visible = ctx.published && ctx.publishSuccess && ctx.publicVersion > 1;
				alertdisplay._set(alertdisplay_changes);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) if_block0.d();
				if_block1.d();
				removeListener(button, "click", click_handler);
				if (if_block2) if_block2.d();
				if (detach) {
					detachNode(text2);
				}

				if (if_block3) if_block3.d(detach);
				if (detach) {
					detachNode(text3);
				}

				if (if_block4) if_block4.d(detach);
				if (detach) {
					detachNode(text4);
				}

				if (if_block5) if_block5.d(detach);
				if (detach) {
					detachNode(text5);
				}

				if (if_block6) if_block6.d();
				alertdisplay.destroy(detach);
			}
		};
	}

	// (39:42) 
	function create_if_block_18(component, ctx) {
		var text, div, raw_value = __$1('publish / published');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-check",
		 	color: "#000000",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 40, 4, 1825);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (34:60) 
	function create_if_block_17(component, ctx) {
		var text, div, raw_value = __$1('publish / publish-success');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-check",
		 	color: "#000000",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 35, 4, 1579);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (29:43) 
	function create_if_block_16(component, ctx) {
		var text, div, raw_value = __$1('publish / republish');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-sync",
		 	color: "#FFB800",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 30, 4, 1337);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (24:24) 
	function create_if_block_15(component, ctx) {
		var text, div, raw_value = __$1("publish / progress / publishing");

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-sync",
		 	color: "#858585",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 25, 4, 1107);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (19:39) 
	function create_if_block_14(component, ctx) {
		var text, div, raw_value = __$1('publish / publish-btn-intro');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-dotted",
		 	color: "#858585",
		 	size: "30px",
		 	class: "pt-2"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message pt-2 svelte-1g9lhqv";
				addLoc(div, file$b, 20, 4, 892);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (14:25) 
	function create_if_block_13(component, ctx) {
		var text, div, raw_value = __$1("publish / progress / unpublished");

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-dotted",
		 	color: "#858585",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 15, 4, 640);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (9:4) {#if unpublishing}
	function create_if_block_12(component, ctx) {
		var text, div, raw_value = __$1("publish / progress / unpublishing");

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-sync",
		 	color: "#858585",
		 	size: "30px"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n    ");
				div = createElement("div");
				div.className = "message svelte-1g9lhqv";
				addLoc(div, file$b, 10, 4, 415);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}
			}
		};
	}

	// (78:12) {:else}
	function create_else_block_3(component, ctx) {
		var span;

		function select_block_type_3(ctx) {
			if (ctx.publishing) return create_if_block_11;
			return create_else_block_4;
		}

		var current_block_type = select_block_type_3(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				span = createElement("span");
				if_block.c();
				span.className = "button-publish svelte-1g9lhqv";
				toggleClass(span, "is-publishing", ctx.publishing);
				addLoc(span, file$b, 78, 12, 3114);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				if_block.m(span, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(span, null);
				}

				if (changed.publishing) {
					toggleClass(span, "is-publishing", ctx.publishing);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}

				if_block.d();
			}
		};
	}

	// (53:31) 
	function create_if_block_9(component, ctx) {
		var span;

		function select_block_type_2(ctx) {
			if (ctx.publishing) return create_if_block_10;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				span = createElement("span");
				if_block.c();
				span.className = "button-republish svelte-1g9lhqv";
				addLoc(span, file$b, 53, 12, 2271);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				if_block.m(span, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(span, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}

				if_block.d();
			}
		};
	}

	// (51:12) {#if unpublishing}
	function create_if_block_8(component, ctx) {
		var span, text_value = __$1('publish / unpublishing-btn'), text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "title";
				addLoc(span, file$b, 51, 12, 2163);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (91:16) {:else}
	function create_else_block_4(component, ctx) {
		var text0, span, text1_value = __$1('publish / publish-btn'), text1;

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "cloud-upload",
		 	size: "30px",
		 	color: "#ffffff",
		 	class: "cloud"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text0 = createText("\n                ");
				span = createElement("span");
				text1 = createText(text1_value);
				addLoc(span, file$b, 98, 16, 3811);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, span, anchor);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(span);
				}
			}
		};
	}

	// (80:16) {#if publishing}
	function create_if_block_11(component, ctx) {
		var text0, span, text1_value = __$1('publish / publishing-btn'), text1;

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "refresh",
		 	spin: true,
		 	size: "28px",
		 	color: "#ffffff",
		 	valign: "middle",
		 	class: "mr-1"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text0 = createText("\n                ");
				span = createElement("span");
				text1 = createText(text1_value);
				addLoc(span, file$b, 89, 16, 3502);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, span, anchor);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(span);
				}
			}
		};
	}

	// (66:16) {:else}
	function create_else_block_2(component, ctx) {
		var text0, span, text1_value = __$1('publish / republish-btn'), text1;

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "refresh",
		 	size: "28px",
		 	color: "#ffffff",
		 	valign: "middle",
		 	class: "mr-1"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text0 = createText("\n                ");
				span = createElement("span");
				text1 = createText(text1_value);
				span.className = "pl-1 svelte-1g9lhqv";
				addLoc(span, file$b, 74, 16, 2980);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, span, anchor);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(span);
				}
			}
		};
	}

	// (55:16) {#if publishing}
	function create_if_block_10(component, ctx) {
		var text0, span, text1_value = __$1('publish / publishing-btn'), text1;

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "refresh",
		 	spin: true,
		 	size: "28px",
		 	color: "#ffffff",
		 	valign: "middle",
		 	class: "mr-1"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text0 = createText("\n                ");
				span = createElement("span");
				text1 = createText(text1_value);
				span.className = "pl-1 svelte-1g9lhqv";
				addLoc(span, file$b, 64, 16, 2628);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, span, anchor);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(span);
				}
			}
		};
	}

	// (107:4) {#if publishing && publishWait > 3000}
	function create_if_block_5(component, ctx) {
		var ul;

		var each_value = ctx.progress;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context$1(ctx, each_value, i));
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "publish-progress unstyled svelte-1g9lhqv";
				addLoc(ul, file$b, 107, 4, 4041);
			},

			m: function mount(target, anchor) {
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.progress || changed.assetURL) {
					each_value = ctx.progress;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (112:8) {#if (step && step !== '')}
	function create_if_block_6(component, ctx) {
		var li, text, raw_value = __$1('publish / status / '+ctx.step), raw_before;

		function select_block_type_4(ctx) {
			if ((ctx.i < ctx.progress.length-1)) return create_if_block_7;
			return create_else_block_1;
		}

		var current_block_type = select_block_type_4(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				if_block.c();
				text = createText(" ");
				raw_before = createElement('noscript');
				li.className = "svelte-1g9lhqv";
				addLoc(li, file$b, 112, 8, 4215);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				if_block.m(li, null);
				append(li, text);
				append(li, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(li, text);
				}

				if ((changed.progress) && raw_value !== (raw_value = __$1('publish / status / '+ctx.step))) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				if_block.d();
			}
		};
	}

	// (123:12) {:else}
	function create_else_block_1(component, ctx) {

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "loading-spinner",
		 	size: "18px",
		 	valign: "middle",
		 	class: "mr-2",
		 	spin: true,
		 	timing: "steps(12)",
		 	duration: "1.5s"
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
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
			}
		};
	}

	// (114:12) {#if (i < progress.length-1)}
	function create_if_block_7(component, ctx) {

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "check-circle",
		 	size: "18px",
		 	color: "#468847",
		 	valign: "middle",
		 	class: "mr-2"
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
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
			}
		};
	}

	// (109:8) {#each progress as step,i}
	function create_each_block$2(component, ctx) {
		var if_block_anchor;

		var if_block = ((ctx.step && ctx.step !== '')) && create_if_block_6(component, ctx);

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
				if ((ctx.step && ctx.step !== '')) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_6(component, ctx);
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

	// (142:0) {#if published && !publishing && !unpublishing}
	function create_if_block_4(component, ctx) {
		var p, raw0_value = __$1('publish / unpublish-intro'), raw0_after, text0, button, text1, raw1_value = __$1('publish / unpublish-btn'), raw1_before;

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "undo",
		 	size: "1.2em",
		 	valign: "-0.2em"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		function click_handler(event) {
			component.unpublish();
		}

		return {
			c: function create() {
				p = createElement("p");
				raw0_after = createElement('noscript');
				text0 = createText("\n    ");
				button = createElement("button");
				icondisplay._fragment.c();
				text1 = createText("\n        ");
				raw1_before = createElement('noscript');
				addListener(button, "click", click_handler);
				button.className = "plain-link unpublish-button svelte-1g9lhqv";
				addLoc(button, file$b, 144, 4, 5057);
				p.className = "unpublish mt-2 mb-2 svelte-1g9lhqv";
				addLoc(p, file$b, 142, 0, 4977);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(p, text0);
				append(p, button);
				icondisplay._mount(button, null);
				append(button, text1);
				append(button, raw1_before);
				raw1_before.insertAdjacentHTML("afterend", raw1_value);
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}

				icondisplay.destroy();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (154:0) {#if publishError}
	function create_if_block_3$3(component, ctx) {
		var text;

		var alertdisplay_initial_data = {
		 	type: "error",
		 	visible: "true",
		 	class: "mt-4 mb-5"
		 };
		var alertdisplay = new AlertDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: alertdisplay_initial_data
		});

		return {
			c: function create() {
				text = createText(ctx.publishError);
				alertdisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				append(alertdisplay._slotted.default, text);
				alertdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.publishError) {
					setData(text, ctx.publishError);
				}
			},

			d: function destroy(detach) {
				alertdisplay.destroy(detach);
			}
		};
	}

	// (159:0) {#if !published && !unpublished}
	function create_if_block_2$4(component, ctx) {
		var p0, raw0_value = __$1('publish / publish-info-1'), text, p1, raw1_value = __$1('publish / publish-info-2');

		return {
			c: function create() {
				p0 = createElement("p");
				text = createText("\n");
				p1 = createElement("p");
				p0.className = "publish-info mt-4 svelte-1g9lhqv";
				addLoc(p0, file$b, 159, 0, 5526);
				p1.className = "publish-info mb-6 svelte-1g9lhqv";
				addLoc(p1, file$b, 160, 0, 5598);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				p0.innerHTML = raw0_value;
				insert(target, text, anchor);
				insert(target, p1, anchor);
				p1.innerHTML = raw1_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
					detachNode(text);
					detachNode(p1);
				}
			}
		};
	}

	// (170:4) {#if published && publishSuccess && publicVersion > 1}
	function create_if_block$a(component, ctx) {
		var div;

		function select_block_type_5(ctx) {
			if (ctx.redirectDisabled) return create_if_block_1$9;
			return create_else_block$3;
		}

		var current_block_type = select_block_type_5(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.className = "embed-alert svelte-1g9lhqv";
				addLoc(div, file$b, 170, 4, 5958);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
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

	// (175:8) {:else}
	function create_else_block$3(component, ctx) {
		var text, p, raw_value = __$1('publish / update-embed');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "info-circle",
		 	size: "20px",
		 	color: "#3a87ad"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n        ");
				p = createElement("p");
				p.className = "embed-message svelte-1g9lhqv";
				addLoc(p, file$b, 176, 8, 6274);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(p);
				}
			}
		};
	}

	// (172:8) {#if redirectDisabled}
	function create_if_block_1$9(component, ctx) {
		var text, p, raw_value = __$1('publish / replace-embed');

		var icondisplay_initial_data = {
		 	assetURL: ctx.assetURL,
		 	icon: "warning",
		 	size: "20px",
		 	color: "#FFB800"
		 };
		var icondisplay = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay_initial_data
		});

		return {
			c: function create() {
				icondisplay._fragment.c();
				text = createText("\n        ");
				p = createElement("p");
				p.className = "embed-message svelte-1g9lhqv";
				addLoc(p, file$b, 173, 8, 6101);
			},

			m: function mount(target, anchor) {
				icondisplay._mount(target, anchor);
				insert(target, text, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				var icondisplay_changes = {};
				if (changed.assetURL) icondisplay_changes.assetURL = ctx.assetURL;
				icondisplay._set(icondisplay_changes);
			},

			d: function destroy(detach) {
				icondisplay.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(p);
				}
			}
		};
	}

	function PublishButtonControl(options) {
		this._debugName = '<PublishButtonControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$c(), options.data);

		this._recompute({ publishStarted: 1, now: 1, progress: 1, publishing: 1 }, this._state);
		if (!('publishStarted' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'publishStarted'");
		if (!('now' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'now'");
		if (!('progress' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'progress'");
		if (!('publishing' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'publishing'");
		if (!('unpublishing' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'unpublishing'");
		if (!('published' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'published'");
		if (!('needsRepublish' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'needsRepublish'");

		if (!('assetURL' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'assetURL'");
		if (!('unpublished' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'unpublished'");

		if (!('publishError' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'publishError'");
		if (!('redirectDisabled' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'redirectDisabled'");
		if (!('publicVersion' in this._state)) console.warn("<PublishButtonControl> was created without expected data property 'publicVersion'");
		this._intro = true;

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(PublishButtonControl.prototype, protoDev);
	assign(PublishButtonControl.prototype, methods$6);

	PublishButtonControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('publishWait' in newState && !this._updatingReadonlyProperty) throw new Error("<PublishButtonControl>: Cannot set read-only property 'publishWait'");
		if ('publishSuccess' in newState && !this._updatingReadonlyProperty) throw new Error("<PublishButtonControl>: Cannot set read-only property 'publishSuccess'");
	};

	PublishButtonControl.prototype._recompute = function _recompute(changed, state) {
		if (changed.publishStarted || changed.now) {
			if (this._differs(state.publishWait, (state.publishWait = publishWait$1(state)))) changed.publishWait = true;
		}

		if (changed.progress || changed.publishing) {
			if (this._differs(state.publishSuccess, (state.publishSuccess = publishSuccess(state)))) changed.publishSuccess = true;
		}
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

	var hasOwnProperty$6 = Object.hasOwnProperty,
	    setPrototypeOf = Object.setPrototypeOf,
	    isFrozen = Object.isFrozen,
	    getPrototypeOf = Object.getPrototypeOf,
	    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var freeze = Object.freeze,
	    seal = Object.seal,
	    create = Object.create; // eslint-disable-line import/no-mutable-exports

	var _ref = typeof Reflect !== 'undefined' && Reflect,
	    apply$2 = _ref.apply,
	    construct = _ref.construct;

	if (!apply$2) {
	  apply$2 = function apply(fun, thisValue, args) {
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
	var arrayPush$2 = unapply(Array.prototype.push);
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

	    return apply$2(func, thisArg, args);
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
	    if (apply$2(hasOwnProperty$6, object, [property])) {
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
	    arrayPush$2(DOMPurify.removed, {
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
	      arrayPush$2(DOMPurify.removed, {
	        attribute: node.getAttributeNode(name),
	        from: node
	      });
	    } catch (_) {
	      arrayPush$2(DOMPurify.removed, {
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
	        arrayPush$2(DOMPurify.removed, {
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
	    arrayPush$2(hooks[entryPoint], hookFunction);
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

	/**
	 * tracks a custom event in Matomo
	 *
	 *
	 * @param {string} category - the event category
	 * @param {string} category - the event action
	 * @param {string} category - the event name
	 * @param {string|number} category - the event value, optional
	 */
	function trackEvent(category, action, name, value) {
	    if (window._paq) {
	        window._paq.push(['trackEvent', category, action, name, value]);
	    }
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

	/**
	 * Download and parse a remote JSON document. Use {@link httpReq} instead
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string} method - HTTP method, either GET, POST or PUT
	 * @param {string|undefined} credentials - set to "include" if cookies should be passed along CORS requests
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { fetchJSON } from '@datawrapper/shared/fetch';
	 * fetchJSON('http://api.example.org', 'GET', 'include');
	 */

	/**
	 * injects a `<script>` element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadScript } from '@datawrapper/shared/fetch';
	 *
	 * loadScript('/static/js/library.js', () => {
	 *     console.log('library is loaded');
	 * })
	 */
	function loadScript(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const script = document.createElement('script');
	        script.src = src;
	        script.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        script.onerror = reject;
	        document.body.appendChild(script);
	    });
	}

	/**
	 * @typedef {object} opts
	 * @property {string} src - stylesheet URL to load
	 * @property {DOMElement} parentElement - DOM element to append style tag to
	 */

	/**
	 * injects a `<link>` element to the page to load a new stylesheet
	 *
	 * @param {string|opts} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadStylesheet } from '@datawrapper/shared/fetch';
	 *
	 * loadStylesheet('/static/css/library.css', () => {
	 *     console.log('library styles are loaded');
	 * })
	 */
	function loadStylesheet(opts, callback = null) {
	    if (typeof opts === 'string') {
	        opts = {
	            src: opts
	        };
	    }

	    if (!opts.parentElement || typeof opts.parentElement.appendChild !== 'function') {
	        opts.parentElement = document.head;
	    }

	    return new Promise((resolve, reject) => {
	        const link = document.createElement('link');
	        link.rel = 'stylesheet';
	        link.href = opts.src;
	        link.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        link.onerror = reject;
	        opts.parentElement.appendChild(link);
	    });
	}

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

	var isArray$5 = Array.isArray;

	var isArray_1 = isArray$5;

	/** Detect free variable `global` from Node.js. */

	var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	var _freeGlobal = freeGlobal$1;

	var freeGlobal = _freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root$3 = freeGlobal || freeSelf || Function('return this')();

	var _root = root$3;

	var root$2 = _root;

	/** Built-in value references. */
	var Symbol$5 = root$2.Symbol;

	var _Symbol = Symbol$5;

	var Symbol$4 = _Symbol;

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$6.toString;

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
	  var isOwn = hasOwnProperty$5.call(value, symToStringTag$1),
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

	var objectProto$5 = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto$5.toString;

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
	function baseGetTag$3(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	var _baseGetTag = baseGetTag$3;

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

	function isObjectLike$3(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike$3;

	var baseGetTag$2 = _baseGetTag,
	    isObjectLike$2 = isObjectLike_1;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

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
	function isSymbol$3(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike$2(value) && baseGetTag$2(value) == symbolTag);
	}

	var isSymbol_1 = isSymbol$3;

	var isArray$4 = isArray_1,
	    isSymbol$2 = isSymbol_1;

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
	function isKey$1(value, object) {
	  if (isArray$4(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol$2(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	var _isKey = isKey$1;

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

	function isObject$3(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject$3;

	var baseGetTag$1 = _baseGetTag,
	    isObject$2 = isObject_1;

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
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
	function isFunction$1(value) {
	  if (!isObject$2(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag$1(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var isFunction_1 = isFunction$1;

	var root$1 = _root;

	/** Used to detect overreaching core-js shims. */
	var coreJsData$1 = root$1['__core-js_shared__'];

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
	function toSource$1(func) {
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

	var _toSource = toSource$1;

	var isFunction = isFunction_1,
	    isMasked = _isMasked,
	    isObject$1 = isObject_1,
	    toSource = _toSource;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto$4 = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty$4).replace(reRegExpChar, '\\$&')
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
	  if (!isObject$1(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
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
	function getNative$3(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative$3;

	var getNative$2 = _getNative;

	/* Built-in method references that are verified to be native. */
	var nativeCreate$4 = getNative$2(Object, 'create');

	var _nativeCreate = nativeCreate$4;

	var nativeCreate$3 = _nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear$1() {
	  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
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

	var nativeCreate$2 = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

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
	  if (nativeCreate$2) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$1 ? undefined : result;
	  }
	  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet$1;

	var nativeCreate$1 = _nativeCreate;

	/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

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
	  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$2.call(data, key);
	}

	var _hashHas = hashHas$1;

	var nativeCreate = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

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
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
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

	function eq$2(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	var eq_1 = eq$2;

	var eq$1 = eq_1;

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
	    if (eq$1(array[length][0], key)) {
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
	function ListCache$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache$1.prototype.clear = listCacheClear;
	ListCache$1.prototype['delete'] = listCacheDelete;
	ListCache$1.prototype.get = listCacheGet;
	ListCache$1.prototype.has = listCacheHas;
	ListCache$1.prototype.set = listCacheSet;

	var _ListCache = ListCache$1;

	var getNative$1 = _getNative,
	    root = _root;

	/* Built-in method references that are verified to be native. */
	var Map$1 = getNative$1(root, 'Map');

	var _Map = Map$1;

	var Hash = _Hash,
	    ListCache = _ListCache,
	    Map = _Map;

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
	    'map': new (Map || ListCache),
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
	function MapCache$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache$1.prototype.clear = mapCacheClear;
	MapCache$1.prototype['delete'] = mapCacheDelete;
	MapCache$1.prototype.get = mapCacheGet;
	MapCache$1.prototype.has = mapCacheHas;
	MapCache$1.prototype.set = mapCacheSet;

	var _MapCache = MapCache$1;

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
	function memoize$1(func, resolver) {
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
	  memoized.cache = new (memoize$1.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize$1.Cache = MapCache;

	var memoize_1 = memoize$1;

	var memoize = memoize_1;

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
	  var result = memoize(func, function(key) {
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

	function arrayMap$1(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	var _arrayMap = arrayMap$1;

	var Symbol$2 = _Symbol,
	    arrayMap = _arrayMap,
	    isArray$3 = isArray_1,
	    isSymbol$1 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
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
	  if (isArray$3(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString$1) + '';
	  }
	  if (isSymbol$1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
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
	function toString$1(value) {
	  return value == null ? '' : baseToString(value);
	}

	var toString_1 = toString$1;

	var isArray$2 = isArray_1,
	    isKey = _isKey,
	    stringToPath = _stringToPath,
	    toString = toString_1;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath$4(value, object) {
	  if (isArray$2(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}

	var _castPath = castPath$4;

	var isSymbol = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey$3(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	var _toKey = toKey$3;

	var castPath$3 = _castPath,
	    toKey$2 = _toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet$1(object, path) {
	  path = castPath$3(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey$2(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	var _baseGet = baseGet$1;

	var getNative = _getNative;

	var defineProperty$2 = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	var _defineProperty = defineProperty$2;

	var defineProperty$1 = _defineProperty;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue$1(object, key, value) {
	  if (key == '__proto__' && defineProperty$1) {
	    defineProperty$1(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	var _baseAssignValue = baseAssignValue$1;

	var baseAssignValue = _baseAssignValue,
	    eq = eq_1;

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue$1(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty$1.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	var _assignValue = assignValue$1;

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
	function isIndex$2(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	var _isIndex = isIndex$2;

	var assignValue = _assignValue,
	    castPath$2 = _castPath,
	    isIndex$1 = _isIndex,
	    isObject = isObject_1,
	    toKey$1 = _toKey;

	/**
	 * The base implementation of `_.set`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The path of the property to set.
	 * @param {*} value The value to set.
	 * @param {Function} [customizer] The function to customize path creation.
	 * @returns {Object} Returns `object`.
	 */
	function baseSet$1(object, path, value, customizer) {
	  if (!isObject(object)) {
	    return object;
	  }
	  path = castPath$2(path, object);

	  var index = -1,
	      length = path.length,
	      lastIndex = length - 1,
	      nested = object;

	  while (nested != null && ++index < length) {
	    var key = toKey$1(path[index]),
	        newValue = value;

	    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
	      return object;
	    }

	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject(objValue)
	          ? objValue
	          : (isIndex$1(path[index + 1]) ? [] : {});
	      }
	    }
	    assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}

	var _baseSet = baseSet$1;

	var baseGet = _baseGet,
	    baseSet = _baseSet,
	    castPath$1 = _castPath;

	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy$1(object, paths, predicate) {
	  var index = -1,
	      length = paths.length,
	      result = {};

	  while (++index < length) {
	    var path = paths[index],
	        value = baseGet(object, path);

	    if (predicate(value, path)) {
	      baseSet(result, castPath$1(path, object), value);
	    }
	  }
	  return result;
	}

	var _basePickBy = basePickBy$1;

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

	var baseGetTag = _baseGetTag,
	    isObjectLike$1 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments$1(value) {
	  return isObjectLike$1(value) && baseGetTag(value) == argsTag;
	}

	var _baseIsArguments = baseIsArguments$1;

	var baseIsArguments = _baseIsArguments,
	    isObjectLike = isObjectLike_1;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

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
	var isArguments$2 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	var isArguments_1 = isArguments$2;

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
	function isLength$1(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	var isLength_1 = isLength$1;

	var castPath = _castPath,
	    isArguments$1 = isArguments_1,
	    isArray$1 = isArray_1,
	    isIndex = _isIndex,
	    isLength = isLength_1,
	    toKey = _toKey;

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
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray$1(object) || isArguments$1(object));
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

	var basePickBy = _basePickBy,
	    hasIn = hasIn_1;

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property identifiers.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick$1(object, paths) {
	  return basePickBy(object, paths, function(value, path) {
	    return hasIn(object, path);
	  });
	}

	var _basePick = basePick$1;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */

	function arrayPush$1(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	var _arrayPush = arrayPush$1;

	var Symbol$1 = _Symbol,
	    isArguments = isArguments_1,
	    isArray = isArray_1;

	/** Built-in value references. */
	var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable$1(value) {
	  return isArray(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}

	var _isFlattenable = isFlattenable$1;

	var arrayPush = _arrayPush,
	    isFlattenable = _isFlattenable;

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten$1(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	var _baseFlatten = baseFlatten$1;

	var baseFlatten = _baseFlatten;

	/**
	 * Flattens `array` a single level deep.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flatten([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, [3, [4]], 5]
	 */
	function flatten$1(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? baseFlatten(array, 1) : [];
	}

	var flatten_1 = flatten$1;

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */

	function apply$1(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	var _apply = apply$1;

	var apply = _apply;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest$1(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}

	var _overRest = overRest$1;

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */

	function constant$1(value) {
	  return function() {
	    return value;
	  };
	}

	var constant_1 = constant$1;

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

	function identity$1(value) {
	  return value;
	}

	var identity_1 = identity$1;

	var constant = constant_1,
	    defineProperty = _defineProperty,
	    identity = identity_1;

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString$1 = !defineProperty ? identity : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};

	var _baseSetToString = baseSetToString$1;

	/** Used to detect hot functions by number of calls within a span of milliseconds. */

	var HOT_COUNT = 800,
	    HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut$1(func) {
	  var count = 0,
	      lastCalled = 0;

	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);

	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}

	var _shortOut = shortOut$1;

	var baseSetToString = _baseSetToString,
	    shortOut = _shortOut;

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString$1 = shortOut(baseSetToString);

	var _setToString = setToString$1;

	var flatten = flatten_1,
	    overRest = _overRest,
	    setToString = _setToString;

	/**
	 * A specialized version of `baseRest` which flattens the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @returns {Function} Returns the new function.
	 */
	function flatRest$1(func) {
	  return setToString(overRest(func, undefined, flatten), func + '');
	}

	var _flatRest = flatRest$1;

	var basePick = _basePick,
	    flatRest = _flatRest;

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to pick.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = flatRest(function(object, paths) {
	  return object == null ? {} : basePick(object, paths);
	});

	var pick_1 = pick;

	/* node_modules/@datawrapper/controls/ConfirmationModal.html generated by Svelte v2.16.1 */

	function data$b() {
	    return {
	        title: 'Title',
	        confirmButtonText: 'Confirm',
	        confirmButtonIcon: false,
	        backButtonText: 'Back',
	        open: false
	    };
	}
	var methods$5 = {
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

	const file$a = "node_modules/datawrapper/controls/ConfirmationModal.html";

	function create_main_fragment$a(component, ctx) {
		var if_block_anchor;

		function onwindowkeydown(event) {
			component.handleKeystroke(event.key);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.open) && create_if_block$9(component, ctx);

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
						if_block = create_if_block$9(component, ctx);
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
	function create_if_block$9(component, ctx) {
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

		var if_block = (ctx.confirmButtonIcon) && create_if_block_1$8(component, ctx);

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
				addLoc(button0, file$a, 3, 8, 93);
				h1.className = "modal-title mb-4 svelte-1f9lfqa";
				addLoc(h1, file$a, 7, 12, 300);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn back svelte-1f9lfqa";
				addLoc(button1, file$a, 10, 16, 429);
				addListener(button2, "click", click_handler_2);
				button2.className = "btn btn-danger svelte-1f9lfqa";
				addLoc(button2, file$a, 11, 16, 523);
				div0.className = "actions pt-4 mt-4 svelte-1f9lfqa";
				addLoc(div0, file$a, 9, 12, 381);
				div1.className = "modal-content svelte-1f9lfqa";
				addLoc(div1, file$a, 6, 8, 260);
				addListener(div2, "keyup", keyup_handler);
				div2.className = "modal-body";
				addLoc(div2, file$a, 2, 4, 35);
				div3.className = "modal";
				addLoc(div3, file$a, 1, 0, 11);
				addListener(div4, "click", click_handler_3);
				div4.className = "modal-backdrop";
				addLoc(div4, file$a, 25, 0, 971);
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
						if_block = create_if_block_1$8(component, ctx);
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
	function create_if_block_1$8(component, ctx) {

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
		this._state = assign(data$b(), options.data);
		if (!('open' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'open'");
		if (!('backButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'backButtonText'");
		if (!('title' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'title'");
		if (!('confirmButtonIcon' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonIcon'");
		if (!('confirmButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonText'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ConfirmationModal.prototype, protoDev);
	assign(ConfirmationModal.prototype, methods$5);

	ConfirmationModal.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/HelpDisplay.html generated by Svelte v2.16.1 */



	function helpIcon({ type }) {
	    return type === 'upgrade-info' ? upgradeIcon : '?';
	}
	function data$a() {
	    return {
	        visible: false,
	        class: '',
	        compact: false,
	        style: null,
	        type: 'help',
	        uid: ''
	    };
	}
	var methods$4 = {
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

	function create_main_fragment$9(component, ctx) {
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

		var if_block1 = (ctx.type === 'upgrade-info') && create_if_block_1$7();

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
						if_block1 = create_if_block_1$7();
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
	function create_if_block_1$7(component, ctx) {
		var div, text_value = __$1('upgrade-available'), text;

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
		this._state = assign(data$a(), options.data);

		this._recompute({ type: 1 }, this._state);
		if (!('type' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'type'");
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('compact' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'compact'");
		if (!('style' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'style'");
		if (!('uid' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'uid'");
		if (!('visible' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(HelpDisplay.prototype, protoDev);
	assign(HelpDisplay.prototype, methods$4);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('helpIcon' in newState && !this._updatingReadonlyProperty) throw new Error("<HelpDisplay>: Cannot set read-only property 'helpIcon'");
	};

	HelpDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.type) {
			if (this._differs(state.helpIcon, (state.helpIcon = helpIcon(state)))) changed.helpIcon = true;
		}
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$9() {
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

	const file$8 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$8(component, ctx) {
		var text0, div1, text1, div0, slot_content_default = component._slotted.default, text2, div1_class_value;

		var if_block0 = (ctx.help) && create_if_block_3$2(component, ctx);

		var if_block1 = (ctx.label) && create_if_block_1$6(component, ctx);

		var if_block2 = (ctx.miniHelp) && create_if_block$7(component, ctx);

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
				addLoc(div0, file$8, 17, 4, 457);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " " + ctx.class + " svelte-1ykzs2h";
				div1.dataset.uid = ctx.uid;
				addLoc(div1, file$8, 6, 0, 95);
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
						if_block0 = create_if_block_3$2(component, ctx);
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
						if_block1 = create_if_block_1$6(component, ctx);
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
						if_block2 = create_if_block$7(component, ctx);
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
	function create_if_block_3$2(component, ctx) {
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
				addLoc(div, file$8, 2, 4, 49);
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
	function create_if_block_1$6(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2$2(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
				label.className = "control-label svelte-1ykzs2h";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$8, 11, 4, 233);
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
						if_block = create_if_block_2$2(component, ctx);
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
	function create_if_block_2$2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$8, 13, 8, 368);
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
	function create_if_block$7(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				p.className = p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$8, 25, 4, 651);
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
		this._state = assign(data$9(), options.data);
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

	/* node_modules/@datawrapper/controls/RadioControl.html generated by Svelte v2.16.1 */

	function data$8() {
	    return {
	        value: null,
	        disabled: false,
	        disabledMessage: '',
	        indeterminate: false,
	        label: '',
	        labelWidth: 'auto',
	        help: null,
	        miniHelp: null,
	        valign: 'top',
	        inline: true,
	        uid: ''
	    };
	}
	function onstate$1({ changed, previous }) {
	    if (previous && changed.value) {
	        this.set({ indeterminate: false });
	    }
	}
	const file$7 = "node_modules/datawrapper/controls/RadioControl.html";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1, if_block_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context(ctx, each_value, i));
		}

		var controlgroup_initial_data = {
		 	type: "radio",
		 	labelWidth: ctx.labelWidth,
		 	valign: ctx.valign,
		 	label: ctx.label,
		 	disabled: ctx.disabled,
		 	help: ctx.help,
		 	miniHelp: ctx.miniHelp,
		 	uid: ctx.uid
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block = (ctx.disabled && ctx.disabledMessage) && create_if_block$6(component, ctx);

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n    ");
				controlgroup._fragment.c();
				text1 = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				div.className = "svelte-b3e9e4";
				toggleClass(div, "inline", ctx.inline);
				toggleClass(div, "indeterminate", ctx.indeterminate);
				addLoc(div, file$7, 1, 4, 97);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(controlgroup._slotted.default, text0);

				if (slot_content_default) {
					append(controlgroup._slotted.default, slot_content_default_before || (slot_content_default_before = createComment()));
					append(controlgroup._slotted.default, slot_content_default);
				}

				controlgroup._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.disabled || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.inline) {
					toggleClass(div, "inline", ctx.inline);
				}

				if (changed.indeterminate) {
					toggleClass(div, "indeterminate", ctx.indeterminate);
				}

				var controlgroup_changes = {};
				if (changed.labelWidth) controlgroup_changes.labelWidth = ctx.labelWidth;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.help) controlgroup_changes.help = ctx.help;
				if (changed.miniHelp) controlgroup_changes.miniHelp = ctx.miniHelp;
				if (changed.uid) controlgroup_changes.uid = ctx.uid;
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabledMessage) {
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
				destroyEach(each_blocks, detach);

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}

				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (7:12) {#if opt.help}
	function create_if_block_1$5(component, ctx) {
		var div, raw_value = ctx.opt.help;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-b3e9e4";
				addLoc(div, file$7, 7, 12, 476);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.options) && raw_value !== (raw_value = ctx.opt.help)) {
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

	// (3:8) {#each options as opt}
	function create_each_block$1(component, ctx) {
		var label, input, input_value_value, text0, span0, text1, span1, raw_value = ctx.opt.label, text2, label_title_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (ctx.opt.help) && create_if_block_1$5(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(" ");
				span1 = createElement("span");
				text2 = createText("\n            ");
				if (if_block) if_block.c();
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.opt.value;
				input.value = input.__value;
				input.disabled = ctx.disabled;
				input.className = "svelte-b3e9e4";
				addLoc(input, file$7, 4, 12, 262);
				span0.className = "css-ui svelte-b3e9e4";
				addLoc(span0, file$7, 5, 12, 349);
				span1.className = "inner-label svelte-b3e9e4";
				addLoc(span1, file$7, 5, 46, 383);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-b3e9e4";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$7, 3, 8, 175);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.value;

				append(label, text0);
				append(label, span0);
				append(label, text1);
				append(label, span1);
				span1.innerHTML = raw_value;
				append(label, text2);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.value) input.checked = input.__value === ctx.value;
				if ((changed.options) && input_value_value !== (input_value_value = ctx.opt.value)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if ((changed.options) && raw_value !== (raw_value = ctx.opt.label)) {
					span1.innerHTML = raw_value;
				}

				if (ctx.opt.help) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$5(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.options) && label_title_value !== (label_title_value = ctx.opt.tooltip||'')) {
					label.title = label_title_value;
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}

				if (changed.options) {
					toggleClass(label, "has-help", ctx.opt.help);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (16:0) {#if disabled && disabledMessage}
	function create_if_block$6(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "disabled-message svelte-b3e9e4";
				addLoc(div, file$7, 16, 0, 643);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.disabledMessage;
			},

			p: function update(changed, ctx) {
				if (changed.disabledMessage) {
					div.innerHTML = ctx.disabledMessage;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function RadioControl(options) {
		this._debugName = '<RadioControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);
		if (!('labelWidth' in this._state)) console.warn("<RadioControl> was created without expected data property 'labelWidth'");
		if (!('valign' in this._state)) console.warn("<RadioControl> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<RadioControl> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<RadioControl> was created without expected data property 'disabled'");
		if (!('help' in this._state)) console.warn("<RadioControl> was created without expected data property 'help'");
		if (!('miniHelp' in this._state)) console.warn("<RadioControl> was created without expected data property 'miniHelp'");
		if (!('uid' in this._state)) console.warn("<RadioControl> was created without expected data property 'uid'");
		if (!('options' in this._state)) console.warn("<RadioControl> was created without expected data property 'options'");
		if (!('value' in this._state)) console.warn("<RadioControl> was created without expected data property 'value'");
		if (!('disabledMessage' in this._state)) console.warn("<RadioControl> was created without expected data property 'disabledMessage'");
		this._bindingGroups = [[]];
		this._intro = true;

		this._handlers.state = [onstate$1];

		this._slotted = options.slots || {};

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$7(this, this._state);

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

	assign(RadioControl.prototype, protoDev);

	RadioControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

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

	/* publish/ShareEmbed.html generated by Svelte v2.16.1 */



	function shareUrl({ shareurlType, id, publicUrl, metadata, pluginShareurls }) {
	    if (shareurlType === 'default') return publicUrl;
	    let url = '';

	    pluginShareurls.forEach(t => {
	        if (t.id === shareurlType) {
	            url = t.url.replace(/%chart_id%/g, id);

	            url = url.replace(/%(.*?)%/g, (match, path) => {
	                return get({ id, metadata }, path);
	            });
	        }
	    });
	    return url;
	}
	function embedCode({ embedType, publicUrl, metadata }) {
	    if (!metadata) return '';
	    if (metadata.publish && !metadata.publish['embed-codes']) {
	        return `<iframe src="${publicUrl}" width="100%" height="${metadata.publish['embed-height']}" scrolling="no" frameborder="0" allowtransparency="true"></iframe>`;
	    }
	    if (metadata.publish['embed-codes']['embed-method-' + embedType]) {
	        return metadata.publish['embed-codes']['embed-method-' + embedType];
	    } else {
	        return '';
	    }
	}
	function shareOptions({ pluginShareurls }) {
	    const defaultOption = {
	        label: __('publish / share-url / fullscreen'),
	        value: 'default',
	        help: __('publish / help / share-url / fullscreen')
	    };

	    const pluginShareOptions = pluginShareurls.map(({ name, id }) => ({
	        label: name,
	        value: id,
	        help: __(`publish / help / share-url / ${id}`)
	    }));

	    return [defaultOption, ...pluginShareOptions];
	}
	function embedOptions({ embedTemplates }) {
	    return embedTemplates.map(({ title, id, text }) => ({
	        label: purifyHTML(title),
	        value: purifyHTML(id),
	        help: purifyHTML(text)
	    }));
	}
	function data$7() {
	    return {
	        embedTemplates: [],
	        pluginShareurls: [],
	        pending: false,
	        shareurlType: 'default',
	        embedType: 'responsive',
	        copySuccess: {}
	    };
	}
	var methods$3 = {
	    copy(targetRef) {
	        const { embedCode, shareUrl } = this.get();
	        const copyText = targetRef === 'embedcode' ? embedCode : shareUrl;

	        // create new element to preserve line breaks
	        const el = document.createElement('textarea');
	        el.value = copyText;
	        document.body.appendChild(el);
	        el.select();

	        try {
	            const successful = document.execCommand('copy');
	            if (successful) {
	                const { copySuccess } = this.get();
	                copySuccess[targetRef] = true;
	                this.set({ copySuccess });
	                setTimeout(() => {
	                    copySuccess[targetRef] = false;
	                    this.set({ copySuccess });
	                }, 2000);
	                trackEvent('Chart Editor', `${targetRef}-copy`);
	            }
	        } catch (err) {
	            console.error('Could not copy to clipboard.');
	        }

	        document.body.removeChild(el);
	        /*
	            make it look like the visible input
	            is the one that's actually selected
	        */
	        this.refs[targetRef].select();
	    }
	};

	const file$6 = "publish/ShareEmbed.html";

	function create_main_fragment$6(component, ctx) {
		var div8, h2, raw0_value = __('publish / share-embed'), text0, div3, text1, div2, label0, raw1_value = __('publish / share-url'), text2, div1, div0, input0, text3, a, text4, span0, text6, button0, text7, span1, text8_value = __('publish / copy-success'), text8, text9, radiocontrol0_updating = {}, text10, div7, text11, div6, label1, raw2_value = __('publish / embed'), text12, div5, div4, input1, text13, button1, text14, span2, text15_value = __('publish / copy-success'), text15, text16, radiocontrol1_updating = {}, text17, p, raw3_value = __('publish / embed / explanation');

		var icondisplay0_initial_data = {
		 	size: "30px",
		 	icon: "link",
		 	color: "#333333",
		 	class: "pt-5 pr-5"
		 };
		var icondisplay0 = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay0_initial_data
		});

		function focus_handler(event) {
			this.select();
		}

		var icondisplay1_initial_data = {
		 	icon: "external-link",
		 	size: "15px",
		 	valign: "-3px"
		 };
		var icondisplay1 = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay1_initial_data
		});

		var icondisplay2_initial_data = {
		 	size: "18px",
		 	icon: "copy-to-clipboard",
		 	class: "pt-1"
		 };
		var icondisplay2 = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay2_initial_data
		});

		function click_handler(event) {
			component.copy('shareurl');
		}

		var radiocontrol0_initial_data = { options: ctx.shareOptions, label: "" };
		if (ctx.shareurlType !== void 0) {
			radiocontrol0_initial_data.value = ctx.shareurlType;
			radiocontrol0_updating.value = true;
		}
		var radiocontrol0 = new RadioControl({
			root: component.root,
			store: component.store,
			data: radiocontrol0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radiocontrol0_updating.value && changed.value) {
					newState.shareurlType = childState.value;
				}
				component._set(newState);
				radiocontrol0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radiocontrol0._bind({ value: 1 }, radiocontrol0.get());
		});

		var icondisplay3_initial_data = {
		 	size: "30px",
		 	icon: "source-code",
		 	color: "#333333",
		 	class: "pt-5 pr-5",
		 	valign: "bottom"
		 };
		var icondisplay3 = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay3_initial_data
		});

		function focus_handler_1(event) {
			this.select();
		}

		var icondisplay4_initial_data = {
		 	size: "18px",
		 	icon: "copy-to-clipboard",
		 	class: "pt-1"
		 };
		var icondisplay4 = new IconDisplay({
			root: component.root,
			store: component.store,
			data: icondisplay4_initial_data
		});

		function click_handler_1(event) {
			component.copy('embedcode');
		}

		var radiocontrol1_initial_data = { options: ctx.embedOptions, label: "" };
		if (ctx.embedType !== void 0) {
			radiocontrol1_initial_data.value = ctx.embedType;
			radiocontrol1_updating.value = true;
		}
		var radiocontrol1 = new RadioControl({
			root: component.root,
			store: component.store,
			data: radiocontrol1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radiocontrol1_updating.value && changed.value) {
					newState.embedType = childState.value;
				}
				component._set(newState);
				radiocontrol1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radiocontrol1._bind({ value: 1 }, radiocontrol1.get());
		});

		return {
			c: function create() {
				div8 = createElement("div");
				h2 = createElement("h2");
				text0 = createText("\n    ");
				div3 = createElement("div");
				icondisplay0._fragment.c();
				text1 = createText("\n        ");
				div2 = createElement("div");
				label0 = createElement("label");
				text2 = createText("\n            ");
				div1 = createElement("div");
				div0 = createElement("div");
				input0 = createElement("input");
				text3 = createText("\n                    ");
				a = createElement("a");
				icondisplay1._fragment.c();
				text4 = createText("\n                        ");
				span0 = createElement("span");
				span0.textContent = "Open";
				text6 = createText("\n                ");
				button0 = createElement("button");
				icondisplay2._fragment.c();
				text7 = createText("\n                ");
				span1 = createElement("span");
				text8 = createText(text8_value);
				text9 = createText("\n            ");
				radiocontrol0._fragment.c();
				text10 = createText("\n\n    ");
				div7 = createElement("div");
				icondisplay3._fragment.c();
				text11 = createText("\n        ");
				div6 = createElement("div");
				label1 = createElement("label");
				text12 = createText("\n            ");
				div5 = createElement("div");
				div4 = createElement("div");
				input1 = createElement("input");
				text13 = createText("\n                ");
				button1 = createElement("button");
				icondisplay4._fragment.c();
				text14 = createText("\n                ");
				span2 = createElement("span");
				text15 = createText(text15_value);
				text16 = createText("\n\n            ");
				radiocontrol1._fragment.c();
				text17 = createText("\n\n            ");
				p = createElement("p");
				addLoc(h2, file$6, 1, 4, 44);
				label0.htmlFor = "share-url";
				label0.className = "svelte-1tny3g8";
				addLoc(label0, file$6, 5, 12, 259);
				addListener(input0, "focus", focus_handler);
				setAttribute(input0, "type", "text");
				input0.id = "share-url";
				input0.className = "passive-input svelte-1tny3g8";
				input0.value = ctx.shareUrl;
				input0.readOnly = true;
				addLoc(input0, file$6, 8, 20, 435);
				addLoc(span0, file$6, 19, 24, 941);
				a.target = "_blank";
				a.className = "btn btn-primary svelte-1tny3g8";
				a.href = ctx.shareUrl;
				addLoc(a, file$6, 17, 20, 768);
				div0.className = "copy-preview share-url svelte-1tny3g8";
				addLoc(div0, file$6, 7, 16, 378);
				addListener(button0, "click", click_handler);
				button0.className = "btn copy-button svelte-1tny3g8";
				button0.title = __('publish / copy');
				addLoc(button0, file$6, 22, 16, 1023);
				span1.className = "copy-success svelte-1tny3g8";
				toggleClass(span1, "show", ctx.copySuccess.shareurl);
				addLoc(span1, file$6, 29, 16, 1322);
				div1.className = "copy-group svelte-1tny3g8";
				addLoc(div1, file$6, 6, 12, 337);
				div2.className = "share-embed-item svelte-1tny3g8";
				addLoc(div2, file$6, 4, 8, 216);
				div3.className = "share-embed-block svelte-1tny3g8";
				addLoc(div3, file$6, 2, 4, 94);
				label1.htmlFor = "embed-code";
				label1.className = "svelte-1tny3g8";
				addLoc(label1, file$6, 46, 12, 1856);
				addListener(input1, "focus", focus_handler_1);
				setAttribute(input1, "type", "text");
				input1.id = "embed-code";
				input1.className = "passive-input svelte-1tny3g8";
				input1.value = ctx.embedCode;
				input1.readOnly = true;
				addLoc(input1, file$6, 49, 20, 2030);
				div4.className = "copy-preview embed-code svelte-1tny3g8";
				addLoc(div4, file$6, 48, 16, 1972);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn copy-button svelte-1tny3g8";
				button1.title = __('publish / copy');
				addLoc(button1, file$6, 59, 16, 2385);
				span2.className = "copy-success svelte-1tny3g8";
				toggleClass(span2, "show", ctx.copySuccess.embedcode);
				addLoc(span2, file$6, 66, 16, 2685);
				div5.className = "copy-group svelte-1tny3g8";
				addLoc(div5, file$6, 47, 12, 1931);
				p.className = "embed-explanation svelte-1tny3g8";
				addLoc(p, file$6, 73, 12, 2944);
				div6.className = "share-embed-item svelte-1tny3g8";
				addLoc(div6, file$6, 45, 8, 1813);
				div7.className = "share-embed-block svelte-1tny3g8";
				addLoc(div7, file$6, 37, 4, 1600);
				div8.className = "share-embed svelte-1tny3g8";
				toggleClass(div8, "pending", ctx.pending);
				addLoc(div8, file$6, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div8, anchor);
				append(div8, h2);
				h2.innerHTML = raw0_value;
				append(div8, text0);
				append(div8, div3);
				icondisplay0._mount(div3, null);
				append(div3, text1);
				append(div3, div2);
				append(div2, label0);
				label0.innerHTML = raw1_value;
				append(div2, text2);
				append(div2, div1);
				append(div1, div0);
				append(div0, input0);
				component.refs.shareurl = input0;
				append(div0, text3);
				append(div0, a);
				icondisplay1._mount(a, null);
				append(a, text4);
				append(a, span0);
				append(div1, text6);
				append(div1, button0);
				icondisplay2._mount(button0, null);
				append(div1, text7);
				append(div1, span1);
				append(span1, text8);
				append(div2, text9);
				radiocontrol0._mount(div2, null);
				append(div8, text10);
				append(div8, div7);
				icondisplay3._mount(div7, null);
				append(div7, text11);
				append(div7, div6);
				append(div6, label1);
				label1.innerHTML = raw2_value;
				append(div6, text12);
				append(div6, div5);
				append(div5, div4);
				append(div4, input1);
				component.refs.embedcode = input1;
				append(div5, text13);
				append(div5, button1);
				icondisplay4._mount(button1, null);
				append(div5, text14);
				append(div5, span2);
				append(span2, text15);
				append(div6, text16);
				radiocontrol1._mount(div6, null);
				append(div6, text17);
				append(div6, p);
				p.innerHTML = raw3_value;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.shareUrl) {
					input0.value = ctx.shareUrl;
					a.href = ctx.shareUrl;
				}

				if (changed.copySuccess) {
					toggleClass(span1, "show", ctx.copySuccess.shareurl);
				}

				var radiocontrol0_changes = {};
				if (changed.shareOptions) radiocontrol0_changes.options = ctx.shareOptions;
				if (!radiocontrol0_updating.value && changed.shareurlType) {
					radiocontrol0_changes.value = ctx.shareurlType;
					radiocontrol0_updating.value = ctx.shareurlType !== void 0;
				}
				radiocontrol0._set(radiocontrol0_changes);
				radiocontrol0_updating = {};

				if (changed.embedCode) {
					input1.value = ctx.embedCode;
				}

				if (changed.copySuccess) {
					toggleClass(span2, "show", ctx.copySuccess.embedcode);
				}

				var radiocontrol1_changes = {};
				if (changed.embedOptions) radiocontrol1_changes.options = ctx.embedOptions;
				if (!radiocontrol1_updating.value && changed.embedType) {
					radiocontrol1_changes.value = ctx.embedType;
					radiocontrol1_updating.value = ctx.embedType !== void 0;
				}
				radiocontrol1._set(radiocontrol1_changes);
				radiocontrol1_updating = {};

				if (changed.pending) {
					toggleClass(div8, "pending", ctx.pending);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div8);
				}

				icondisplay0.destroy();
				removeListener(input0, "focus", focus_handler);
				if (component.refs.shareurl === input0) component.refs.shareurl = null;
				icondisplay1.destroy();
				icondisplay2.destroy();
				removeListener(button0, "click", click_handler);
				radiocontrol0.destroy();
				icondisplay3.destroy();
				removeListener(input1, "focus", focus_handler_1);
				if (component.refs.embedcode === input1) component.refs.embedcode = null;
				icondisplay4.destroy();
				removeListener(button1, "click", click_handler_1);
				radiocontrol1.destroy();
			}
		};
	}

	function ShareEmbed(options) {
		this._debugName = '<ShareEmbed>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$7(), options.data);

		this._recompute({ shareurlType: 1, id: 1, publicUrl: 1, metadata: 1, pluginShareurls: 1, embedType: 1, embedTemplates: 1 }, this._state);
		if (!('shareurlType' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'shareurlType'");
		if (!('id' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'id'");
		if (!('publicUrl' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'publicUrl'");
		if (!('metadata' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'metadata'");
		if (!('pluginShareurls' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'pluginShareurls'");
		if (!('embedType' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'embedType'");
		if (!('embedTemplates' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'embedTemplates'");

		if (!('copySuccess' in this._state)) console.warn("<ShareEmbed> was created without expected data property 'copySuccess'");
		this._intro = true;

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ShareEmbed.prototype, protoDev);
	assign(ShareEmbed.prototype, methods$3);

	ShareEmbed.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<ShareEmbed>: Cannot set read-only property 'shareUrl'");
		if ('embedCode' in newState && !this._updatingReadonlyProperty) throw new Error("<ShareEmbed>: Cannot set read-only property 'embedCode'");
		if ('shareOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<ShareEmbed>: Cannot set read-only property 'shareOptions'");
		if ('embedOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<ShareEmbed>: Cannot set read-only property 'embedOptions'");
	};

	ShareEmbed.prototype._recompute = function _recompute(changed, state) {
		if (changed.shareurlType || changed.id || changed.publicUrl || changed.metadata || changed.pluginShareurls) {
			if (this._differs(state.shareUrl, (state.shareUrl = shareUrl(state)))) changed.shareUrl = true;
		}

		if (changed.embedType || changed.publicUrl || changed.metadata) {
			if (this._differs(state.embedCode, (state.embedCode = embedCode(state)))) changed.embedCode = true;
		}

		if (changed.pluginShareurls) {
			if (this._differs(state.shareOptions, (state.shareOptions = shareOptions(state)))) changed.shareOptions = true;
		}

		if (changed.embedTemplates) {
			if (this._differs(state.embedOptions, (state.embedOptions = embedOptions(state)))) changed.embedOptions = true;
		}
	};

	/* publish/Action.html generated by Svelte v2.16.1 */

	function data$6() {
	    return { loading: false };
	}
	const file$5 = "publish/Action.html";

	function create_main_fragment$5(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.loading) && create_if_block$5();

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
				if (ctx.loading) {
					if (!if_block) {
						if_block = create_if_block$5();
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

	// (2:0) {#if loading}
	function create_if_block$5(component, ctx) {
		var p, i, text;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText(" loading...");
				i.className = "fa fa-spinner fa-pulse fa-fw";
				addLoc(i, file$5, 2, 21, 60);
				p.className = "mini-help";
				addLoc(p, file$5, 2, 0, 39);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Action(options) {
		this._debugName = '<Action>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('loading' in this._state)) console.warn("<Action> was created without expected data property 'loading'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Action.prototype, protoDev);

	Action.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/Publish.html generated by Svelte v2.16.1 */



	let initial_auto_publish = true;

	function sortedChartActions({ chartActions, $actions }) {
	    return chartActions
	        .concat($actions)
	        .filter(a => a.id !== 'publish-s3')
	        .sort((a, b) => a.order - b.order);
	}
	function publishWait({ publishStarted, now }) {
	    return publishStarted > 0 ? now - publishStarted : 0;
	}
	function data$5() {
	    return {
	        active_action: '',
	        embedTemplates: [],
	        pluginShareurls: [],
	        published: false,
	        publishing: false,
	        publishStarted: 0,
	        unpublished: false,
	        unpublishing: false,
	        needsRepublish: false,
	        publish_error: false,
	        auto_publish: false,
	        progress: [],
	        redirectDisabled: false,
	        shareurlType: 'default',
	        embedType: 'responsive',
	        Action,
	        actionData: null,
	        store: null,
	        chartActions: [
	            {
	                id: 'duplicate',
	                icon: 'code-fork',
	                title: __('Duplicate'),
	                order: 500,
	                action: 'duplicate'
	            }
	        ],
	        publishHed: '',
	        publishIntro: '',
	        afterEmbed: [],
	        afterEmbedData: {},
	        exportHed: __('publish / export-duplicate'),
	        exportIntro: __('publish / export-duplicate / intro'),
	        embedCode: '',
	        statusUrl: false
	    };
	}
	var methods$2 = {
	    publish() {
	        this.set({
	            publishing: true,
	            publishStarted: new Date().getTime(),
	            now: new Date().getTime(),
	            progress: [],
	            unpublished: false,
	            publish_error: false
	        });

	        const { dw_chart } = this.store.get();

	        trackEvent('Chart Editor', 'publish');

	        const chartId = dw_chart.get().id;

	        dw_chart.onNextSave(() => {
	            this.set({
	                statusUrl: `/v3/charts/${chartId}/publish/status/${dw_chart.get(
                    'publicVersion'
                )}`
	            });
	            // publish chart
	            httpReq
	                .post(`/v3/charts/${chartId}/publish`)
	                .then(() => {
	                    this.set({
	                        published: true,
	                        progress: ['done'],
	                        needsRepublish: false
	                    });
	                    httpReq.get(`/v3/charts/${chartId}`).then(res => {
	                        trackEvent('Chart Editor', 'publish-success');
	                        this.publishFinished(res);
	                    });
	                })
	                .catch(error => {
	                    this.set({
	                        publish_error: error.message,
	                        publishing: false,
	                        progress: []
	                    });
	                    trackEvent('Chart Editor', 'publish-error', error.message);
	                });

	            setTimeout(() => {
	                const { publishing } = this.get();
	                if (publishing) this.updateStatus();
	            }, 1000);
	        });
	    },

	    unpublish() {
	        const chartId = this.store.get().id;

	        this.set({
	            progress: [],
	            unpublishing: true,
	            needs_republish: false
	        });

	        httpReq
	            .post(`/v3/charts/${chartId}/unpublish`)
	            .then(() => {
	                httpReq.get(`/v3/charts/${chartId}`).then(chartInfo => {
	                    // 'theme' on chartInfo is the theme id, but theme in the store is the theme object
	                    const { dw_chart } = this.store.get();
	                    dw_chart.attributes({
	                        ...dw_chart.attributes(),
	                        ...pick_1(chartInfo, [
	                            'lastEditStep',
	                            'lastModifiedAt',
	                            'metadata',
	                            'publicId',
	                            'publicUrl',
	                            'publicVersion',
	                            'publishedAt'
	                        ])
	                    });
	                    trackEvent('Chart Editor', 'unpublish-success');

	                    // slow down visual response, reduces flickering:
	                    setTimeout(() => {
	                        this.set({
	                            published: false,
	                            unpublishing: false,
	                            unpublished: true
	                        });
	                    }, 1000);
	                });
	            })
	            .catch(error => {
	                this.set({ publish_error: error.message, unpublishing: false });
	                trackEvent('Chart Editor', 'unpublish-error', error.message);
	            });
	    },

	    requestUnpublishConfirmation() {
	        this.set({ publish_error: null });
	        this.refs.confirmationModal.open();
	    },

	    updateStatus() {
	        const { statusUrl } = this.get();
	        if (!statusUrl) return;
	        httpReq.get(statusUrl).then(res => {
	            this.set({
	                progress: res.progress || [],
	                now: new Date().getTime()
	            });
	            const { publishing } = this.get();
	            if (publishing) {
	                setTimeout(() => {
	                    this.updateStatus();
	                }, 500);
	            }
	        });
	    },

	    publishFinished(chartInfo) {
	        this.set({
	            progress: ['done'],
	            published: true,
	            publishStarted: 0,
	            needs_republish: false,
	            publishing: false
	        });
	        this.store.set({
	            lastEditStep: 5
	        });

	        // 'theme' on chartInfo is the theme id, but theme in the store is the theme object
	        const { eventDispatch, dw_chart } = this.store.get();

	        dw_chart.attributes({
	            ...dw_chart.attributes(),
	            ...pick_1(chartInfo, [
	                'lastEditStep',
	                'lastModifiedAt',
	                'metadata',
	                'publicId',
	                'publicUrl',
	                'publicVersion',
	                'publishedAt'
	            ])
	        });

	        eventDispatch('publish', { chart: chartInfo });
	    },

	    select(action) {
	        // set hash which is used to show the action module
	        window.location.hash = action.id;

	        const { active_action } = this.get();
	        if (action.id === active_action) {
	            // unselect current action
	            this.refs.action.set({ show: false });
	            return this.set({ active_action: '', Action });
	        }
	        this.set({ active_action: action.id });
	        if (action.mod) {
	            if (action.mod.App) {
	                this.refs.action.set({ show: false });
	                if (action.mod.data) this.refs.action.set(action.mod.data); // TODO Remove once all action plugins support the 'data' property.
	                this.set({
	                    Action: action.mod.App,
	                    actionData: action.mod.data,
	                    store: this.store
	                });
	                this.refs.action.set({ show: true });
	            } else {
	                // todo: show loading indicator
	                this.set({ Action });
	                this.refs.action.set({ loading: true });
	                if (action.mod.css) {
	                    loadStylesheet({
	                        src: action.mod.css,
	                        parentElement: this.refs.exportAndDuplicate
	                    });
	                }
	                loadScript(action.mod.src, () => {
	                    setTimeout(() => {
	                        require([action.mod.id], mod => {
	                            // todo: HIDE loading indicator
	                            Object.assign(action.mod, mod);
	                            this.set({
	                                Action: action.mod.App,
	                                actionData: action.mod.data,
	                                store: this.store
	                            });
	                            this.refs.action.set({ show: true });
	                            if (mod.init) mod.init(this.refs.action);
	                            if (action.mod.data) this.refs.action.set(action.mod.data); // TODO Remove once all action plugins support the 'data' property.
	                        });
	                    }, 200);
	                });
	            }
	        } else if (action.action && this[action.action]) {
	            this.set({ Action });
	            this[action.action]();
	        } else if (typeof action.action === 'function') {
	            this.set({ Action });
	            action.action();
	        }
	    },

	    duplicate() {
	        const { dw_chart } = this.store.get();
	        trackEvent('Chart Editor', 'duplicate');
	        httpReq.post(`/v3/charts/${dw_chart.get('id')}/copy`).then(res => {
	            // redirect to copied chart
	            window.location.href = `/chart/${res.id}/edit`;
	        });
	    }
	};

	function oncreate() {
	    const { dw_chart, eventDispatch } = this.store.get();
	    this.set({ published: dw_chart.get('lastEditStep') > 4 });
	    // pass reference to publish step
	    eventDispatch('create', this);

	    // Immediately select an action, when location hash is already set.
	    const activeActionId = window.location.hash.slice(1);
	    if (activeActionId) {
	        const { chartActions, $actions } = this.get();
	        const activeAction = chartActions
	            .concat($actions)
	            .find(action => action.id === activeActionId);
	        if (activeAction) {
	            this.select(activeAction);
	        }
	    }
	}
	function onstate({ changed, current }) {
	    const { getUserData, setUserData } = this.store.get();
	    if (changed.embedType) {
	        const data = getUserData();
	        if (!current.embedType || !data) return;
	        data.embed_type = current.embedType;
	        setUserData(data);
	    }
	    if (changed.shareurlType) {
	        const data = getUserData();
	        if (!current.shareurlType || !data) return;
	        data.shareurl_type = current.shareurlType;
	        setUserData(data);
	    }
	    if (changed.published) {
	        const publishStep = window.document.querySelector(
	            '.dw-create-publish .publish-step'
	        );
	        if (publishStep) {
	            publishStep.classList[current.published ? 'add' : 'remove']('is-published');
	        }
	    }
	    if (changed.auto_publish) {
	        if (current.auto_publish && initial_auto_publish) {
	            this.publish();
	            initial_auto_publish = false;
	            window.history.replaceState('', '', window.location.pathname);
	        }
	    }
	}
	const file$4 = "publish/Publish.html";

	function click_handler(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.select(ctx.action);
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.action = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.comp = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var h20, raw0_value = __('publish / title'), text0, text1, text2, text3, div1, div0, h21, text4, text5, ul, text6, text7, p, raw2_value = __('publish / unpublish-confirmation / explanation');

		var publishbutton_initial_data = {
		 	published: ctx.published,
		 	publishing: ctx.publishing,
		 	publishStarted: ctx.publishStarted,
		 	now: ctx.now,
		 	progress: ctx.progress,
		 	unpublished: ctx.unpublished,
		 	unpublishing: ctx.unpublishing,
		 	redirectDisabled: ctx.redirectDisabled,
		 	needsRepublish: ctx.needsRepublish,
		 	publishError: ctx.publish_error,
		 	publicVersion: ctx.$publicVersion
		 };
		var publishbutton = new PublishButtonControl({
			root: component.root,
			store: component.store,
			data: publishbutton_initial_data
		});

		publishbutton.on("publish", function(event) {
			component.publish();
		});
		publishbutton.on("unpublish", function(event) {
			component.requestUnpublishConfirmation();
		});

		var if_block0 = (ctx.published) && create_if_block_3$1(component, ctx);

		var each0_value = ctx.afterEmbed;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1(component, get_each0_context(ctx, each0_value, i));
		}

		var if_block1 = (ctx.exportIntro) && create_if_block_2$1(component, ctx);

		var each1_value = ctx.sortedChartActions;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block(component, get_each1_context(ctx, each1_value, i));
		}

		var switch_value = ctx.Action;

		function switch_props(ctx) {
			var switch_instance_initial_data = {
			 	visible: true,
			 	show: false,
			 	data: ctx.actionData,
			 	store: ctx.store
			 };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		var confirmationmodal_initial_data = {
		 	confirmButtonText: __('publish / unpublish-confirmation / unpublish'),
		 	confirmButtonIcon: "undo",
		 	backButtonText: __('publish / unpublish-confirmation / back'),
		 	id: "modalConfirmation",
		 	title: __('publish / unpublish-confirmation / title')
		 };
		var confirmationmodal = new ConfirmationModal({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: confirmationmodal_initial_data
		});

		confirmationmodal.on("confirm", function(event) {
			component.unpublish();
		});

		component.refs.confirmationModal = confirmationmodal;

		return {
			c: function create() {
				h20 = createElement("h2");
				text0 = createText("\n\n");
				publishbutton._fragment.c();
				text1 = createText("\n\n");
				if (if_block0) if_block0.c();
				text2 = createText("\n\n\n");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text3 = createText("\n\n\n");
				div1 = createElement("div");
				div0 = createElement("div");
				h21 = createElement("h2");
				text4 = createText("\n        ");
				if (if_block1) if_block1.c();
				text5 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text6 = createText("\n\n    ");
				if (switch_instance) switch_instance._fragment.c();
				text7 = createText("\n\n");
				p = createElement("p");
				confirmationmodal._fragment.c();
				addLoc(h20, file$4, 0, 0, 0);
				h21.className = "pt-1";
				addLoc(h21, file$4, 39, 8, 812);
				addLoc(div0, file$4, 38, 4, 798);
				ul.className = "chart-actions";
				addLoc(ul, file$4, 45, 4, 943);
				div1.className = "export-and-duplicate";
				addLoc(div1, file$4, 37, 0, 736);
				addLoc(p, file$4, 83, 4, 2218);
			},

			m: function mount(target, anchor) {
				insert(target, h20, anchor);
				h20.innerHTML = raw0_value;
				insert(target, text0, anchor);
				publishbutton._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text2, anchor);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(target, anchor);
				}

				insert(target, text3, anchor);
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, h21);
				h21.innerHTML = ctx.exportHed;
				append(div0, text4);
				if (if_block1) if_block1.m(div0, null);
				append(div1, text5);
				append(div1, ul);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(ul, null);
				}

				append(div1, text6);

				if (switch_instance) {
					switch_instance._mount(div1, null);
					component.refs.action = switch_instance;
				}

				component.refs.exportAndDuplicate = div1;
				insert(target, text7, anchor);
				append(confirmationmodal._slotted.default, p);
				p.innerHTML = raw2_value;
				confirmationmodal._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var publishbutton_changes = {};
				if (changed.published) publishbutton_changes.published = ctx.published;
				if (changed.publishing) publishbutton_changes.publishing = ctx.publishing;
				if (changed.publishStarted) publishbutton_changes.publishStarted = ctx.publishStarted;
				if (changed.now) publishbutton_changes.now = ctx.now;
				if (changed.progress) publishbutton_changes.progress = ctx.progress;
				if (changed.unpublished) publishbutton_changes.unpublished = ctx.unpublished;
				if (changed.unpublishing) publishbutton_changes.unpublishing = ctx.unpublishing;
				if (changed.redirectDisabled) publishbutton_changes.redirectDisabled = ctx.redirectDisabled;
				if (changed.needsRepublish) publishbutton_changes.needsRepublish = ctx.needsRepublish;
				if (changed.publish_error) publishbutton_changes.publishError = ctx.publish_error;
				if (changed.$publicVersion) publishbutton_changes.publicVersion = ctx.$publicVersion;
				publishbutton._set(publishbutton_changes);

				if (ctx.published) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$1(component, ctx);
						if_block0.c();
						if_block0.m(text2.parentNode, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.afterEmbed) {
					each0_value = ctx.afterEmbed;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_1(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(text3.parentNode, text3);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.exportHed) {
					h21.innerHTML = ctx.exportHed;
				}

				if (ctx.exportIntro) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$1(component, ctx);
						if_block1.c();
						if_block1.m(div0, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.sortedChartActions || changed.active_action) {
					each1_value = ctx.sortedChartActions;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(ul, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				var switch_instance_changes = {};
				if (changed.actionData) switch_instance_changes.data = ctx.actionData;
				if (changed.store) switch_instance_changes.store = ctx.store;

				if (switch_value !== (switch_value = ctx.Action)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(div1, null);

						component.refs.action = switch_instance;
					} else {
						switch_instance = null;
						if (component.refs.action === switch_instance) {
							component.refs.action = null;
						}
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h20);
					detachNode(text0);
				}

				publishbutton.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text2);
				}

				destroyEach(each0_blocks, detach);

				if (detach) {
					detachNode(text3);
					detachNode(div1);
				}

				if (if_block1) if_block1.d();

				destroyEach(each1_blocks, detach);

				if (switch_instance) switch_instance.destroy();
				if (component.refs.exportAndDuplicate === div1) component.refs.exportAndDuplicate = null;
				if (detach) {
					detachNode(text7);
				}

				confirmationmodal.destroy(detach);
				if (component.refs.confirmationModal === confirmationmodal) component.refs.confirmationModal = null;
			}
		};
	}

	// (19:0) {#if published}
	function create_if_block_3$1(component, ctx) {
		var shareembed_updating = {};

		var shareembed_initial_data = {
		 	pluginShareurls: ctx.pluginShareurls,
		 	embedTemplates: ctx.embedTemplates,
		 	pending: ctx.publishing || ctx.unpublishing,
		 	metadata: ctx.$metadata,
		 	id: ctx.$id,
		 	publicUrl: ctx.$publicUrl
		 };
		if (ctx.shareurlType
	     !== void 0) {
			shareembed_initial_data.shareurlType = ctx.shareurlType
	    ;
			shareembed_updating.shareurlType = true;
		}
		if (ctx.embedType
	     !== void 0) {
			shareembed_initial_data.embedType = ctx.embedType
	    ;
			shareembed_updating.embedType = true;
		}
		var shareembed = new ShareEmbed({
			root: component.root,
			store: component.store,
			data: shareembed_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!shareembed_updating.shareurlType && changed.shareurlType) {
					newState.shareurlType = childState.shareurlType;
				}

				if (!shareembed_updating.embedType && changed.embedType) {
					newState.embedType = childState.embedType;
				}
				component._set(newState);
				shareembed_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			shareembed._bind({ shareurlType: 1, embedType: 1 }, shareembed.get());
		});

		return {
			c: function create() {
				shareembed._fragment.c();
			},

			m: function mount(target, anchor) {
				shareembed._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var shareembed_changes = {};
				if (changed.pluginShareurls) shareembed_changes.pluginShareurls = ctx.pluginShareurls;
				if (changed.embedTemplates) shareembed_changes.embedTemplates = ctx.embedTemplates;
				if (changed.publishing || changed.unpublishing) shareembed_changes.pending = ctx.publishing || ctx.unpublishing;
				if (changed.$metadata) shareembed_changes.metadata = ctx.$metadata;
				if (changed.$id) shareembed_changes.id = ctx.$id;
				if (changed.$publicUrl) shareembed_changes.publicUrl = ctx.$publicUrl;
				if (!shareembed_updating.shareurlType && changed.shareurlType) {
					shareembed_changes.shareurlType = ctx.shareurlType
	    ;
					shareembed_updating.shareurlType = ctx.shareurlType
	     !== void 0;
				}
				if (!shareembed_updating.embedType && changed.embedType) {
					shareembed_changes.embedType = ctx.embedType
	    ;
					shareembed_updating.embedType = ctx.embedType
	     !== void 0;
				}
				shareembed._set(shareembed_changes);
				shareembed_updating = {};
			},

			d: function destroy(detach) {
				shareembed.destroy(detach);
			}
		};
	}

	// (33:0) {#each afterEmbed as comp}
	function create_each_block_1(component, ctx) {
		var switch_instance_anchor;

		var switch_value = ctx.comp.app;

		function switch_props(ctx) {
			var switch_instance_initial_data = { data: ctx.comp.data };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		return {
			c: function create() {
				if (switch_instance) switch_instance._fragment.c();
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (switch_instance) {
					switch_instance._mount(target, anchor);
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, ctx) {
				var switch_instance_changes = {};
				if (changed.afterEmbed) switch_instance_changes.data = ctx.comp.data;

				if (switch_value !== (switch_value = ctx.comp.app)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(switch_instance_anchor);
				}

				if (switch_instance) switch_instance.destroy(detach);
			}
		};
	}

	// (41:8) {#if exportIntro}
	function create_if_block_2$1(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$4, 41, 8, 886);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.exportIntro;
			},

			p: function update(changed, ctx) {
				if (changed.exportIntro) {
					p.innerHTML = ctx.exportIntro;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (47:45) {#if action}
	function create_if_block$4(component, ctx) {
		var li, a, i, i_class_value, span, raw_value = ctx.action.title, a_href_value, text, li_class_value;

		var if_block = (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") && create_if_block_1$4(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				span = createElement("span");
				text = createText("\n            ");
				if (if_block) if_block.c();
				i.className = i_class_value = "fa fa-" + ctx.action.icon;
				addLoc(i, file$4, 55, 16, 1355);
				span.className = "title";
				addLoc(span, file$4, 55, 51, 1390);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				setAttribute(a, "role", "button");
				a.href = a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id;
				addLoc(a, file$4, 50, 12, 1170);
				li.className = li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':'');
				addLoc(li, file$4, 47, 8, 1036);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i);
				append(a, span);
				span.innerHTML = raw_value;
				append(li, text);
				if (if_block) if_block.m(li, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.sortedChartActions) && i_class_value !== (i_class_value = "fa fa-" + ctx.action.icon)) {
					i.className = i_class_value;
				}

				if ((changed.sortedChartActions) && raw_value !== (raw_value = ctx.action.title)) {
					span.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if ((changed.sortedChartActions) && a_href_value !== (a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id)) {
					a.href = a_href_value;
				}

				if (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$4(component, ctx);
						if_block.c();
						if_block.m(li, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.sortedChartActions || changed.active_action) && li_class_value !== (li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':''))) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (58:12) {#if action.banner && action.banner.text != "FALSE" && action.banner.text != "-"}
	function create_if_block_1$4(component, ctx) {
		var div, text_value = ctx.action.banner.text, text, div_style_value;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "banner";
				div.style.cssText = div_style_value = ctx.action.banner.style;
				addLoc(div, file$4, 58, 12, 1561);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedChartActions) && text_value !== (text_value = ctx.action.banner.text)) {
					setData(text, text_value);
				}

				if ((changed.sortedChartActions) && div_style_value !== (div_style_value = ctx.action.banner.style)) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (47:8) {#each sortedChartActions as action}
	function create_each_block(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.action) && create_if_block$4(component, ctx);

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
				if (ctx.action) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$4(component, ctx);
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

	function Publish(options) {
		this._debugName = '<Publish>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Publish> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["actions","publicVersion","metadata","id","publicUrl"]), data$5()), options.data);
		this.store._add(this, ["actions","publicVersion","metadata","id","publicUrl"]);

		this._recompute({ chartActions: 1, $actions: 1, publishStarted: 1, now: 1 }, this._state);
		if (!('chartActions' in this._state)) console.warn("<Publish> was created without expected data property 'chartActions'");
		if (!('$actions' in this._state)) console.warn("<Publish> was created without expected data property '$actions'");
		if (!('publishStarted' in this._state)) console.warn("<Publish> was created without expected data property 'publishStarted'");
		if (!('now' in this._state)) console.warn("<Publish> was created without expected data property 'now'");
		if (!('published' in this._state)) console.warn("<Publish> was created without expected data property 'published'");
		if (!('publishing' in this._state)) console.warn("<Publish> was created without expected data property 'publishing'");
		if (!('progress' in this._state)) console.warn("<Publish> was created without expected data property 'progress'");
		if (!('unpublished' in this._state)) console.warn("<Publish> was created without expected data property 'unpublished'");
		if (!('unpublishing' in this._state)) console.warn("<Publish> was created without expected data property 'unpublishing'");
		if (!('redirectDisabled' in this._state)) console.warn("<Publish> was created without expected data property 'redirectDisabled'");
		if (!('needsRepublish' in this._state)) console.warn("<Publish> was created without expected data property 'needsRepublish'");
		if (!('publish_error' in this._state)) console.warn("<Publish> was created without expected data property 'publish_error'");
		if (!('$publicVersion' in this._state)) console.warn("<Publish> was created without expected data property '$publicVersion'");
		if (!('pluginShareurls' in this._state)) console.warn("<Publish> was created without expected data property 'pluginShareurls'");
		if (!('embedTemplates' in this._state)) console.warn("<Publish> was created without expected data property 'embedTemplates'");
		if (!('shareurlType' in this._state)) console.warn("<Publish> was created without expected data property 'shareurlType'");
		if (!('embedType' in this._state)) console.warn("<Publish> was created without expected data property 'embedType'");
		if (!('$metadata' in this._state)) console.warn("<Publish> was created without expected data property '$metadata'");
		if (!('$id' in this._state)) console.warn("<Publish> was created without expected data property '$id'");
		if (!('$publicUrl' in this._state)) console.warn("<Publish> was created without expected data property '$publicUrl'");
		if (!('afterEmbed' in this._state)) console.warn("<Publish> was created without expected data property 'afterEmbed'");
		if (!('exportHed' in this._state)) console.warn("<Publish> was created without expected data property 'exportHed'");
		if (!('exportIntro' in this._state)) console.warn("<Publish> was created without expected data property 'exportIntro'");

		if (!('active_action' in this._state)) console.warn("<Publish> was created without expected data property 'active_action'");
		if (!('Action' in this._state)) console.warn("<Publish> was created without expected data property 'Action'");
		if (!('actionData' in this._state)) console.warn("<Publish> was created without expected data property 'actionData'");
		if (!('store' in this._state)) console.warn("<Publish> was created without expected data property 'store'");
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$4(this, this._state);

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

	assign(Publish.prototype, protoDev);
	assign(Publish.prototype, methods$2);

	Publish.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('sortedChartActions' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'sortedChartActions'");
		if ('publishWait' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'publishWait'");
	};

	Publish.prototype._recompute = function _recompute(changed, state) {
		if (changed.chartActions || changed.$actions) {
			if (this._differs(state.sortedChartActions, (state.sortedChartActions = sortedChartActions(state)))) changed.sortedChartActions = true;
		}

		if (changed.publishStarted || changed.now) {
			if (this._differs(state.publishWait, (state.publishWait = publishWait(state)))) changed.publishWait = true;
		}
	};

	/* node_modules/@datawrapper/controls/FormBlock.html generated by Svelte v2.16.1 */

	function data$4() {
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
	const file$3 = "node_modules/datawrapper/controls/FormBlock.html";

	function create_main_fragment$3(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_3(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1$3(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block$3(component, ctx);

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
				addLoc(div0, file$3, 11, 4, 248);
				div1.className = div1_class_value = "form-block " + ctx.class + " svelte-150khnx";
				setStyle(div1, "width", ctx.width);
				div1.dataset.uid = ctx.uid;
				toggleClass(div1, "compact", ctx.compact);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file$3, 0, 0, 0);
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
						if_block2 = create_if_block_1$3(component, ctx);
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
						if_block3 = create_if_block$3(component, ctx);
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
				addLoc(label, file$3, 9, 4, 157);
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
				addLoc(div, file$3, 15, 4, 326);
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
	function create_if_block_1$3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-150khnx";
				addLoc(div, file$3, 17, 4, 400);
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
	function create_if_block$3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-150khnx";
				addLoc(div, file$3, 19, 4, 491);
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
		this._state = assign(data$4(), options.data);
		if (!('class' in this._state)) console.warn("<FormBlock> was created without expected data property 'class'");
		if (!('width' in this._state)) console.warn("<FormBlock> was created without expected data property 'width'");
		if (!('uid' in this._state)) console.warn("<FormBlock> was created without expected data property 'uid'");
		if (!('label' in this._state)) console.warn("<FormBlock> was created without expected data property 'label'");
		if (!('success' in this._state)) console.warn("<FormBlock> was created without expected data property 'success'");
		if (!('error' in this._state)) console.warn("<FormBlock> was created without expected data property 'error'");
		if (!('help' in this._state)) console.warn("<FormBlock> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(FormBlock.prototype, protoDev);

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/guest/Guest.html generated by Svelte v2.16.1 */



	function data$3() {
	    return {
	        error: '',
	        email: '',
	        guestAboveInvite: '',
	        guestBelowInvite: '',
	        signedUp: false
	    };
	}
	var methods$1 = {
	    async createAccount(email) {
	        this.set({ signedUp: true });
	        trackEvent('Chart Editor', 'send-embed-code');
	        try {
	            await post('/v3/auth/signup', {
	                payload: {
	                    email,
	                    invitation: true,
	                    chartId: this.store.get().id
	                }
	            });
	            window.location.reload();
	        } catch (e) {
	            if (e.name === 'HttpReqError') {
	                const res = await e.response.json();
	                this.set({ error: res.message || e });
	            } else {
	                this.set({ error: `Unknown error: ${e}` });
	            }
	        }
	    },
	    navigateTo(stepId) {
	        const { navigateTo } = this.get();
	        navigateTo({ id: stepId });
	    }
	};

	const file$2 = "publish/guest/Guest.html";

	function create_main_fragment$2(component, ctx) {
		var div4, div3, div0, text0, div1, input, input_updating = false, text1, button, i0, i0_class_value, text2, raw0_value = __('publish / guest / cta'), raw0_before, text3, raw1_before, raw1_after, text4, div2, a, i1, text5, raw2_value = __('publish / guest / back'), raw2_before, text6;

		function select_block_type(ctx) {
			if (ctx.guestAboveInvite) return create_if_block_1$2;
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ email: input.value });
			input_updating = false;
		}

		function click_handler(event) {
			component.createAccount(ctx.email);
		}

		var formblock_initial_data = { label: __('publish / guest / e-mail'), help: __('publish / guest / example-email') };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function click_handler_1(event) {
			event.preventDefault();
			component.navigateTo('visualize');
		}

		var if_block1 = (ctx.error) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				if_block0.c();
				text0 = createText("\n\n        ");
				div1 = createElement("div");
				input = createElement("input");
				text1 = createText("\n\n                ");
				button = createElement("button");
				i0 = createElement("i");
				text2 = createText("\n                      ");
				raw0_before = createElement('noscript');
				formblock._fragment.c();
				text3 = createText("\n\n        ");
				raw1_before = createElement('noscript');
				raw1_after = createElement('noscript');
				text4 = createText("\n\n        ");
				div2 = createElement("div");
				a = createElement("a");
				i1 = createElement("i");
				text5 = createText(" ");
				raw2_before = createElement('noscript');
				text6 = createText("\n\n            ");
				if (if_block1) if_block1.c();
				setStyle(div0, "margin-bottom", "20px");
				addLoc(div0, file$2, 2, 8, 65);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "email");
				input.className = "input-xlarge";
				addLoc(input, file$2, 15, 16, 512);
				i0.className = i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin': 'fa-envelope');
				addLoc(i0, file$2, 22, 20, 810);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-primary";
				setStyle(button, "white-space", "nowrap");
				setStyle(button, "margin-left", "10px");
				addLoc(button, file$2, 17, 16, 592);
				setStyle(div1, "display", "flex");
				addLoc(div1, file$2, 14, 12, 468);
				i1.className = "icon-chevron-left";
				addLoc(i1, file$2, 36, 16, 1290);
				addListener(a, "click", click_handler_1);
				a.href = "visualize";
				a.className = "btn btn-save btn-default btn-back";
				addLoc(a, file$2, 31, 12, 1100);
				setStyle(div2, "margin-top", "30px");
				addLoc(div2, file$2, 30, 8, 1057);
				div3.className = "span5";
				addLoc(div3, file$2, 1, 4, 37);
				div4.className = "row publish-signup";
				addLoc(div4, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div0);
				if_block0.m(div0, null);
				append(div3, text0);
				append(formblock._slotted.default, div1);
				append(div1, input);

				input.value = ctx.email;

				append(div1, text1);
				append(div1, button);
				append(button, i0);
				append(button, text2);
				append(button, raw0_before);
				raw0_before.insertAdjacentHTML("afterend", raw0_value);
				formblock._mount(div3, null);
				append(div3, text3);
				append(div3, raw1_before);
				raw1_before.insertAdjacentHTML("afterend", ctx.guestBelowInvite);
				append(div3, raw1_after);
				append(div3, text4);
				append(div3, div2);
				append(div2, a);
				append(a, i1);
				append(a, text5);
				append(a, raw2_before);
				raw2_before.insertAdjacentHTML("afterend", raw2_value);
				append(div2, text6);
				if (if_block1) if_block1.m(div2, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}

				if (!input_updating && changed.email) input.value = ctx.email;
				if ((changed.signedUp) && i0_class_value !== (i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin': 'fa-envelope'))) {
					i0.className = i0_class_value;
				}

				if (changed.guestBelowInvite) {
					detachBetween(raw1_before, raw1_after);
					raw1_before.insertAdjacentHTML("afterend", ctx.guestBelowInvite);
				}

				if (ctx.error) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$2(component, ctx);
						if_block1.c();
						if_block1.m(div2, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				if_block0.d();
				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler);
				formblock.destroy();
				removeListener(a, "click", click_handler_1);
				if (if_block1) if_block1.d();
			}
		};
	}

	// (4:60) {:else}
	function create_else_block$2(component, ctx) {
		var h2, raw0_value = __('publish / guest / h1'), text, p, raw1_value = __('publish / guest / p');

		return {
			c: function create() {
				h2 = createElement("h2");
				text = createText("\n\n            ");
				p = createElement("p");
				addLoc(h2, file$2, 4, 12, 179);
				addLoc(p, file$2, 6, 12, 236);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw0_value;
				insert(target, text, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw1_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text);
					detachNode(p);
				}
			}
		};
	}

	// (4:12) {#if guestAboveInvite}
	function create_if_block_1$2(component, ctx) {
		var raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", ctx.guestAboveInvite);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.guestAboveInvite) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", ctx.guestAboveInvite);
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

	// (40:12) {#if error}
	function create_if_block$2(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.error);
				div.className = "mt-2 alert alert-warning";
				addLoc(div, file$2, 40, 12, 1415);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					setData(text, ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Guest(options) {
		this._debugName = '<Guest>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('guestAboveInvite' in this._state)) console.warn("<Guest> was created without expected data property 'guestAboveInvite'");
		if (!('email' in this._state)) console.warn("<Guest> was created without expected data property 'email'");
		if (!('signedUp' in this._state)) console.warn("<Guest> was created without expected data property 'signedUp'");
		if (!('guestBelowInvite' in this._state)) console.warn("<Guest> was created without expected data property 'guestBelowInvite'");
		if (!('error' in this._state)) console.warn("<Guest> was created without expected data property 'error'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Guest.prototype, protoDev);
	assign(Guest.prototype, methods$1);

	Guest.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/pending-activation/PendingActivation.html generated by Svelte v2.16.1 */



	function data$2() {
	    return {
	        status: ''
	    };
	}
	var methods = {
	    async resendActivation() {
	        this.set({
	            status: 'sending'
	        });

	        try {
	            await post('/v3/auth/resend-activation');
	            this.set({ status: 'success' });
	        } catch (err) {
	            this.set({ status: 'error' });
	        }
	    }
	};

	const file$1 = "publish/pending-activation/PendingActivation.html";

	function create_main_fragment$1(component, ctx) {
		var div1, h2, raw0_value = __("publish / pending-activation / h1"), text0, p, raw1_value = __("publish / pending-activation / p"), text1, div0;

		function select_block_type(ctx) {
			if (ctx.status == 'success') return create_if_block$1;
			if (ctx.status == 'error') return create_if_block_1$1;
			return create_else_block$1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				h2 = createElement("h2");
				text0 = createText("\n\n    ");
				p = createElement("p");
				text1 = createText("\n\n    ");
				div0 = createElement("div");
				if_block.c();
				addLoc(h2, file$1, 3, 4, 69);
				addLoc(p, file$1, 5, 4, 131);
				setStyle(div0, "margin-top", "20px");
				addLoc(div0, file$1, 7, 4, 190);
				addLoc(div1, file$1, 2, 0, 59);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h2);
				h2.innerHTML = raw0_value;
				append(div1, text0);
				append(div1, p);
				p.innerHTML = raw1_value;
				append(div1, text1);
				append(div1, div0);
				if_block.m(div0, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div0, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if_block.d();
			}
		};
	}

	// (13:8) {:else}
	function create_else_block$1(component, ctx) {
		var button, i, i_class_value, text, raw_value = __("publish / pending-activation / resend"), raw_before;

		function click_handler(event) {
			component.resendActivation();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText("\n             \n            ");
				raw_before = createElement('noscript');
				i.className = i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope');
				addLoc(i, file$1, 14, 12, 538);
				addListener(button, "click", click_handler);
				button.className = "btn btn-primary";
				addLoc(button, file$1, 13, 8, 463);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.status) && i_class_value !== (i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope'))) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (11:35) 
	function create_if_block_1$1(component, ctx) {
		var p, raw_value = __("publish / pending-activation / resend-error");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$1, 11, 8, 374);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (9:8) {#if status == 'success'}
	function create_if_block$1(component, ctx) {
		var p, raw_value = __("publish / pending-activation / resend-success");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$1, 9, 8, 263);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function PendingActivation(options) {
		this._debugName = '<PendingActivation>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('status' in this._state)) console.warn("<PendingActivation> was created without expected data property 'status'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(PendingActivation.prototype, protoDev);
	assign(PendingActivation.prototype, methods);

	PendingActivation.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/PublishSidebar.html generated by Svelte v2.16.1 */



	function data$1() {
	    return {
	        embedTemplates: [],
	        embedType: 'responsive',
	        pluginShareurls: [],
	        shareurlType: 'default',
	        afterEmbed: [],
	        guestAboveInvite: '',
	        guestBelowInvite: '',
	        redirectDisabled: false,
	        needsRepublish: false
	    };
	}
	const file = "publish/PublishSidebar.html";

	function create_main_fragment(component, ctx) {
		var div1, div0;

		function select_block_type(ctx) {
			if (ctx.$user.isGuest) return create_if_block;
			if (!ctx.$user.isActivated) return create_if_block_1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if_block.c();
				div0.className = "publish-step is-published";
				addLoc(div0, file, 2, 4, 97);
				div1.className = "dw-create-publish";
				addLoc(div1, file, 1, 0, 61);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if_block.m(div0, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div0, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if_block.d();
			}
		};
	}

	// (8:8) {:else}
	function create_else_block(component, ctx) {

		var publish_initial_data = {
		 	afterEmbed: ctx.afterEmbed,
		 	redirectDisabled: ctx.redirectDisabled,
		 	embedTemplates: ctx.embedTemplates,
		 	embedType: ctx.embedType,
		 	pluginShareurls: ctx.pluginShareurls,
		 	shareurlType: ctx.shareurlType,
		 	",": true,
		 	needsRepublish: ctx.needsRepublish
		 };
		var publish = new Publish({
			root: component.root,
			store: component.store,
			data: publish_initial_data
		});

		publish.on("publish", function(event) {
			component.fire("publish", event);
		});

		return {
			c: function create() {
				publish._fragment.c();
			},

			m: function mount(target, anchor) {
				publish._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var publish_changes = {};
				if (changed.afterEmbed) publish_changes.afterEmbed = ctx.afterEmbed;
				if (changed.redirectDisabled) publish_changes.redirectDisabled = ctx.redirectDisabled;
				if (changed.embedTemplates) publish_changes.embedTemplates = ctx.embedTemplates;
				if (changed.embedType) publish_changes.embedType = ctx.embedType;
				if (changed.pluginShareurls) publish_changes.pluginShareurls = ctx.pluginShareurls;
				if (changed.shareurlType) publish_changes.shareurlType = ctx.shareurlType;
				if (changed.needsRepublish) publish_changes.needsRepublish = ctx.needsRepublish;
				publish._set(publish_changes);
			},

			d: function destroy(detach) {
				publish.destroy(detach);
			}
		};
	}

	// (6:36) 
	function create_if_block_1(component, ctx) {

		var pendingactivation = new PendingActivation({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				pendingactivation._fragment.c();
			},

			m: function mount(target, anchor) {
				pendingactivation._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				pendingactivation.destroy(detach);
			}
		};
	}

	// (4:8) {#if $user.isGuest}
	function create_if_block(component, ctx) {

		var guest_initial_data = {
		 	fromSvelte: "true",
		 	guestAboveInvite: ctx.guestAboveInvite,
		 	guestBelowInvite: ctx.guestBelowInvite,
		 	navigateTo: ctx.navigateTo
		 };
		var guest = new Guest({
			root: component.root,
			store: component.store,
			data: guest_initial_data
		});

		return {
			c: function create() {
				guest._fragment.c();
			},

			m: function mount(target, anchor) {
				guest._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var guest_changes = {};
				if (changed.guestAboveInvite) guest_changes.guestAboveInvite = ctx.guestAboveInvite;
				if (changed.guestBelowInvite) guest_changes.guestBelowInvite = ctx.guestBelowInvite;
				if (changed.navigateTo) guest_changes.navigateTo = ctx.navigateTo;
				guest._set(guest_changes);
			},

			d: function destroy(detach) {
				guest.destroy(detach);
			}
		};
	}

	function PublishSidebar(options) {
		this._debugName = '<PublishSidebar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<PublishSidebar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["user"]), data$1()), options.data);
		this.store._add(this, ["user"]);
		if (!('$user' in this._state)) console.warn("<PublishSidebar> was created without expected data property '$user'");
		if (!('guestAboveInvite' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'guestAboveInvite'");
		if (!('guestBelowInvite' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'guestBelowInvite'");
		if (!('navigateTo' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'navigateTo'");
		if (!('afterEmbed' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'afterEmbed'");
		if (!('redirectDisabled' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'redirectDisabled'");
		if (!('embedTemplates' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'embedTemplates'");
		if (!('embedType' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'embedType'");
		if (!('pluginShareurls' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'pluginShareurls'");
		if (!('shareurlType' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'shareurlType'");
		if (!('needsRepublish' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'needsRepublish'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(PublishSidebar.prototype, protoDev);

	PublishSidebar.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	/* eslint camelcase: "off" */
	const store = new Store({});

	const data = {
	    chart: {
	        id: ''
	    },
	    embedTemplates: [],
	    pluginShareurls: [],
	    published: false,
	    publishing: false,
	    needs_republish: false,
	    publish_error: false,
	    auto_publish: false,
	    progress: [],
	    shareurlType: 'default',
	    embedType: 'responsive'
	};

	var main = { App: PublishSidebar, data, store };

	return main;

})));
//# sourceMappingURL=publish.js.map
