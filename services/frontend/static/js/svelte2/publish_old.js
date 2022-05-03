(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/publish_old', factory) :
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

	function data$9() {
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
		this._state = assign(data$9(), options.data);

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

	var upgradeIcon = '<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>';

	/* node_modules/@datawrapper/controls/AlertDisplay.html generated by Svelte v2.16.1 */


	function data$8() {
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

	const file$7 = "node_modules/datawrapper/controls/AlertDisplay.html";

	function create_main_fragment$7(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block$6(component, ctx);

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
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if visible}
	function create_if_block$6(component, ctx) {
		var div, div_class_value;

		function select_block_type(ctx) {
			if (ctx.type ==='upgrade-info') return create_if_block_1$5;
			return create_else_block$1;
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
				addLoc(div, file$7, 1, 0, 14);
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
	function create_else_block$1(component, ctx) {
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
	function create_if_block_1$5(component, ctx) {
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
				addLoc(span0, file$7, 13, 22, 408);
				div0.className = "icon";
				addLoc(div0, file$7, 13, 4, 390);
				span1.className = "title svelte-1h26igv";
				addLoc(span1, file$7, 14, 9, 477);
				addLoc(div1, file$7, 14, 4, 472);
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

		var if_block1 = (ctx.closeable) && create_if_block_4$1(component);

		var if_block2 = (ctx.title) && create_if_block_3$2();

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
				addLoc(div, file$7, 16, 4, 604);
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
						if_block2 = create_if_block_3$2();
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
				addLoc(div, file$7, 18, 8, 661);
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
				addLoc(button, file$7, 20, 8, 732);
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
	function create_if_block_3$2(component, ctx) {
		var hr;

		return {
			c: function create() {
				hr = createElement("hr");
				hr.className = "svelte-1h26igv";
				addLoc(hr, file$7, 24, 4, 868);
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
		this._state = assign(data$8(), options.data);
		if (!('visible' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'visible'");
		if (!('type' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'type'");
		if (!('title' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'title'");
		if (!('class' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'uid'");
		if (!('closeable' in this._state)) console.warn("<AlertDisplay> was created without expected data property 'closeable'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$7(this, this._state);

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

	/* node_modules/@datawrapper/controls/publish/PublishButtonControl.html generated by Svelte v2.16.1 */



	function publishWait$1({ publishStarted, now }) {
	    return publishStarted > 0 ? now - publishStarted : 0;
	}
	function publishSuccess({ progress, publishing }) {
	    return progress && progress.includes('done') && !publishing;
	}
	function data$7() {
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
	var methods$4 = {
	    publish() {
	        trackEvent$1('Chart Editor', 'publish');
	        this.fire('publish');
	    },
	    unpublish() {
	        trackEvent$1('Chart Editor', 'unpublish');
	        this.fire('unpublish');
	    }
	};

	const file$6 = "node_modules/datawrapper/controls/publish/PublishButtonControl.html";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.step = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$6(component, ctx) {
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

		var if_block4 = (ctx.publishError) && create_if_block_3$1(component, ctx);

		var if_block5 = (!ctx.published && !ctx.unpublished) && create_if_block_2$2();

		var if_block6 = (ctx.published && ctx.publishSuccess && ctx.publicVersion > 1) && create_if_block$5(component, ctx);

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
				button.className = "button-wrapper svelte-di7o7w";
				toggleClass(button, "is-unpublishing", ctx.unpublishing);
				addLoc(button, file$6, 44, 8, 1931);
				div0.className = "action svelte-di7o7w";
				addLoc(div0, file$6, 43, 4, 1902);
				div1.className = "publish-status svelte-di7o7w";
				toggleClass(div1, "is-busy", ctx.publishing || ctx.unpublishing);
				toggleClass(div1, "is-published", ctx.published && !ctx.unpublishing && !ctx.publishing && !ctx.needsRepublish && !ctx.publishSuccess);
				toggleClass(div1, "alert", ctx.needsRepublish && !ctx.publishing);
				toggleClass(div1, "alert-success", ctx.publishSuccess);
				addLoc(div1, file$6, 0, 0, 0);
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
						if_block4 = create_if_block_3$1(component, ctx);
						if_block4.c();
						if_block4.m(text4.parentNode, text4);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (!ctx.published && !ctx.unpublished) {
					if (!if_block5) {
						if_block5 = create_if_block_2$2();
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
						if_block6 = create_if_block$5(component, ctx);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 40, 4, 1825);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 35, 4, 1579);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 30, 4, 1337);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 25, 4, 1107);
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
				div.className = "message pt-2 svelte-di7o7w";
				addLoc(div, file$6, 20, 4, 892);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 15, 4, 640);
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
				div.className = "message svelte-di7o7w";
				addLoc(div, file$6, 10, 4, 415);
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
				span.className = "button-publish svelte-di7o7w";
				toggleClass(span, "is-publishing", ctx.publishing);
				addLoc(span, file$6, 78, 12, 3088);
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
				span.className = "button-republish";
				addLoc(span, file$6, 53, 12, 2271);
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
				addLoc(span, file$6, 51, 12, 2163);
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
				addLoc(span, file$6, 98, 16, 3785);
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
				addLoc(span, file$6, 89, 16, 3476);
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
				addLoc(span, file$6, 74, 16, 2967);
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
				addLoc(span, file$6, 64, 16, 2628);
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
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "publish-progress unstyled svelte-di7o7w";
				addLoc(ul, file$6, 107, 4, 4015);
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
							each_blocks[i] = create_each_block$1(component, child_ctx);
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
				li.className = "svelte-di7o7w";
				addLoc(li, file$6, 112, 8, 4189);
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
	function create_each_block$1(component, ctx) {
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
				button.className = "plain-link unpublish-button svelte-di7o7w";
				addLoc(button, file$6, 144, 4, 5031);
				p.className = "unpublish mt-2 mb-2 svelte-di7o7w";
				addLoc(p, file$6, 142, 0, 4951);
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
	function create_if_block_3$1(component, ctx) {
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
	function create_if_block_2$2(component, ctx) {
		var p0, raw0_value = __$1('publish / publish-info-1'), text, p1, raw1_value = __$1('publish / publish-info-2');

		return {
			c: function create() {
				p0 = createElement("p");
				text = createText("\n");
				p1 = createElement("p");
				p0.className = "publish-info mt-4 svelte-di7o7w";
				addLoc(p0, file$6, 159, 0, 5500);
				p1.className = "publish-info mb-6 svelte-di7o7w";
				addLoc(p1, file$6, 160, 0, 5572);
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
	function create_if_block$5(component, ctx) {
		var div;

		function select_block_type_5(ctx) {
			if (ctx.redirectDisabled) return create_if_block_1$4;
			return create_else_block;
		}

		var current_block_type = select_block_type_5(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.className = "embed-alert svelte-di7o7w";
				addLoc(div, file$6, 170, 4, 5932);
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
	function create_else_block(component, ctx) {
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
				p.className = "embed-message svelte-di7o7w";
				addLoc(p, file$6, 176, 8, 6248);
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
	function create_if_block_1$4(component, ctx) {
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
				p.className = "embed-message svelte-di7o7w";
				addLoc(p, file$6, 173, 8, 6075);
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
		this._state = assign(data$7(), options.data);

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

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(PublishButtonControl.prototype, protoDev);
	assign(PublishButtonControl.prototype, methods$4);

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

	/* node_modules/@datawrapper/controls/ConfirmationModal.html generated by Svelte v2.16.1 */

	function data$6() {
	    return {
	        title: 'Title',
	        confirmButtonText: 'Confirm',
	        confirmButtonIcon: false,
	        backButtonText: 'Back',
	        open: false
	    };
	}
	var methods$3 = {
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

	const file$5 = "node_modules/datawrapper/controls/ConfirmationModal.html";

	function create_main_fragment$5(component, ctx) {
		var if_block_anchor;

		function onwindowkeydown(event) {
			component.handleKeystroke(event.key);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.open) && create_if_block$4(component, ctx);

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
				window.removeEventListener("keydown", onwindowkeydown);

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if open}
	function create_if_block$4(component, ctx) {
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

		var if_block = (ctx.confirmButtonIcon) && create_if_block_1$3(component, ctx);

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
				addLoc(button0, file$5, 3, 8, 93);
				h1.className = "modal-title mb-4 svelte-1f9lfqa";
				addLoc(h1, file$5, 7, 12, 300);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn back svelte-1f9lfqa";
				addLoc(button1, file$5, 10, 16, 429);
				addListener(button2, "click", click_handler_2);
				button2.className = "btn btn-danger svelte-1f9lfqa";
				addLoc(button2, file$5, 11, 16, 523);
				div0.className = "actions pt-4 mt-4 svelte-1f9lfqa";
				addLoc(div0, file$5, 9, 12, 381);
				div1.className = "modal-content svelte-1f9lfqa";
				addLoc(div1, file$5, 6, 8, 260);
				addListener(div2, "keyup", keyup_handler);
				div2.className = "modal-body";
				addLoc(div2, file$5, 2, 4, 35);
				div3.className = "modal";
				addLoc(div3, file$5, 1, 0, 11);
				addListener(div4, "click", click_handler_3);
				div4.className = "modal-backdrop";
				addLoc(div4, file$5, 25, 0, 971);
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
						if_block = create_if_block_1$3(component, ctx);
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
	function create_if_block_1$3(component, ctx) {

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
		this._state = assign(data$6(), options.data);
		if (!('open' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'open'");
		if (!('backButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'backButtonText'");
		if (!('title' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'title'");
		if (!('confirmButtonIcon' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonIcon'");
		if (!('confirmButtonText' in this._state)) console.warn("<ConfirmationModal> was created without expected data property 'confirmButtonText'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ConfirmationModal.prototype, protoDev);
	assign(ConfirmationModal.prototype, methods$3);

	ConfirmationModal.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/HelpDisplay.html generated by Svelte v2.16.1 */



	function helpIcon({ type }) {
	    return type === 'upgrade-info' ? upgradeIcon : '?';
	}
	function data$5() {
	    return {
	        visible: false,
	        class: '',
	        type: 'help',
	        uid: ''
	    };
	}
	var methods$2 = {
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

	const file$4 = "node_modules/datawrapper/controls/HelpDisplay.html";

	function create_main_fragment$4(component, ctx) {
		var div, span, span_class_value, text, div_class_value;

		var if_block = (ctx.visible) && create_if_block$3(component, ctx);

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
				span.className = span_class_value = "help-icon " + ctx.type + " svelte-1qzgns1";
				toggleClass(span, "visible", ctx.visible);
				addLoc(span, file$4, 7, 4, 138);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = div_class_value = "help " + ctx.class + " " + ctx.type + " svelte-1qzgns1";
				div.dataset.uid = ctx.uid;
				addLoc(div, file$4, 0, 0, 0);
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

				if ((changed.type) && span_class_value !== (span_class_value = "help-icon " + ctx.type + " svelte-1qzgns1")) {
					span.className = span_class_value;
				}

				if ((changed.type || changed.visible)) {
					toggleClass(span, "visible", ctx.visible);
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

				if ((changed.class || changed.type) && div_class_value !== (div_class_value = "help " + ctx.class + " " + ctx.type + " svelte-1qzgns1")) {
					div.className = div_class_value;
				}

				if (changed.uid) {
					div.dataset.uid = ctx.uid;
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

	// (9:4) {#if visible}
	function create_if_block$3(component, ctx) {
		var div, text0, text1, slot_content_default = component._slotted.default, slot_content_default_before, div_class_value;

		var if_block0 = (ctx.type === 'help') && create_if_block_2$1();

		var if_block1 = (ctx.type === 'upgrade-info') && create_if_block_1$2();

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if (if_block1) if_block1.c();
				text1 = createText("\n        ");
				div.className = div_class_value = "content " + ctx.type + " svelte-1qzgns1";
				addLoc(div, file$4, 9, 4, 241);
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
						if_block0 = create_if_block_2$1();
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.type === 'upgrade-info') {
					if (!if_block1) {
						if_block1 = create_if_block_1$2();
						if_block1.c();
						if_block1.m(div, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.type) && div_class_value !== (div_class_value = "content " + ctx.type + " svelte-1qzgns1")) {
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

	// (11:8) {#if type === 'help'}
	function create_if_block_2$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "hat-icon im im-graduation-hat svelte-1qzgns1";
				addLoc(i, file$4, 11, 8, 308);
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

	// (13:14) {#if type === 'upgrade-info'}
	function create_if_block_1$2(component, ctx) {
		var div, text_value = __$1('upgrade-available'), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "content-header svelte-1qzgns1";
				addLoc(div, file$4, 13, 8, 406);
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
		this._state = assign(data$5(), options.data);

		this._recompute({ type: 1 }, this._state);
		if (!('type' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'type'");
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('uid' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'uid'");
		if (!('visible' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(HelpDisplay.prototype, protoDev);
	assign(HelpDisplay.prototype, methods$2);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('helpIcon' in newState && !this._updatingReadonlyProperty) throw new Error("<HelpDisplay>: Cannot set read-only property 'helpIcon'");
	};

	HelpDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.type) {
			if (this._differs(state.helpIcon, (state.helpIcon = helpIcon(state)))) changed.helpIcon = true;
		}
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$4() {
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

	const file$3 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$3(component, ctx) {
		var text0, div1, text1, div0, slot_content_default = component._slotted.default, text2, div1_class_value;

		var if_block0 = (ctx.help) && create_if_block_3(component, ctx);

		var if_block1 = (ctx.label) && create_if_block_1$1(component, ctx);

		var if_block2 = (ctx.miniHelp) && create_if_block$2(component, ctx);

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
				addLoc(div0, file$3, 17, 4, 457);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " " + ctx.class + " svelte-1ykzs2h";
				div1.dataset.uid = ctx.uid;
				addLoc(div1, file$3, 6, 0, 95);
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
						if_block0 = create_if_block_3(component, ctx);
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
						if_block1 = create_if_block_1$1(component, ctx);
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
						if_block2 = create_if_block$2(component, ctx);
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
	function create_if_block_3(component, ctx) {
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
				addLoc(div, file$3, 2, 4, 49);
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
	function create_if_block_1$1(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
				label.className = "control-label svelte-1ykzs2h";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$3, 11, 4, 233);
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
						if_block = create_if_block_2(component, ctx);
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
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$3, 13, 8, 368);
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
	function create_if_block$2(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				p.className = p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$3, 25, 4, 651);
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
		this._state = assign(data$4(), options.data);
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

		this._fragment = create_main_fragment$3(this, this._state);

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

	function data$3() {
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
	const file$2 = "node_modules/datawrapper/controls/RadioControl.html";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1, if_block_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
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

		var if_block = (ctx.disabled && ctx.disabledMessage) && create_if_block$1(component, ctx);

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
				addLoc(div, file$2, 1, 4, 97);
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
							each_blocks[i] = create_each_block(component, child_ctx);
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
						if_block = create_if_block$1(component, ctx);
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
	function create_if_block_1(component, ctx) {
		var div, raw_value = ctx.opt.help;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-b3e9e4";
				addLoc(div, file$2, 7, 12, 476);
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
	function create_each_block(component, ctx) {
		var label, input, input_value_value, text0, span0, text1, span1, raw_value = ctx.opt.label, text2, label_title_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (ctx.opt.help) && create_if_block_1(component, ctx);

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
				addLoc(input, file$2, 4, 12, 262);
				span0.className = "css-ui svelte-b3e9e4";
				addLoc(span0, file$2, 5, 12, 349);
				span1.className = "inner-label svelte-b3e9e4";
				addLoc(span1, file$2, 5, 46, 383);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-b3e9e4";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$2, 3, 8, 175);
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
						if_block = create_if_block_1(component, ctx);
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
	function create_if_block$1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "disabled-message svelte-b3e9e4";
				addLoc(div, file$2, 16, 0, 643);
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
		this._state = assign(data$3(), options.data);
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
	function data$2() {
	    return {
	        embedTemplates: [],
	        pluginShareurls: [],
	        pending: false,
	        shareurlType: 'default',
	        embedType: 'responsive',
	        copySuccess: {}
	    };
	}
	var methods$1 = {
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

	const file$1 = "publish/ShareEmbed.html";

	function create_main_fragment$1(component, ctx) {
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
				addLoc(h2, file$1, 1, 4, 44);
				label0.htmlFor = "share-url";
				label0.className = "svelte-1tny3g8";
				addLoc(label0, file$1, 5, 12, 259);
				addListener(input0, "focus", focus_handler);
				setAttribute(input0, "type", "text");
				input0.id = "share-url";
				input0.className = "passive-input svelte-1tny3g8";
				input0.value = ctx.shareUrl;
				input0.readOnly = true;
				addLoc(input0, file$1, 8, 20, 435);
				addLoc(span0, file$1, 19, 24, 941);
				a.target = "_blank";
				a.className = "btn btn-primary svelte-1tny3g8";
				a.href = ctx.shareUrl;
				addLoc(a, file$1, 17, 20, 768);
				div0.className = "copy-preview share-url svelte-1tny3g8";
				addLoc(div0, file$1, 7, 16, 378);
				addListener(button0, "click", click_handler);
				button0.className = "btn copy-button svelte-1tny3g8";
				button0.title = __('publish / copy');
				addLoc(button0, file$1, 22, 16, 1023);
				span1.className = "copy-success svelte-1tny3g8";
				toggleClass(span1, "show", ctx.copySuccess.shareurl);
				addLoc(span1, file$1, 29, 16, 1322);
				div1.className = "copy-group svelte-1tny3g8";
				addLoc(div1, file$1, 6, 12, 337);
				div2.className = "share-embed-item svelte-1tny3g8";
				addLoc(div2, file$1, 4, 8, 216);
				div3.className = "share-embed-block svelte-1tny3g8";
				addLoc(div3, file$1, 2, 4, 94);
				label1.htmlFor = "embed-code";
				label1.className = "svelte-1tny3g8";
				addLoc(label1, file$1, 46, 12, 1856);
				addListener(input1, "focus", focus_handler_1);
				setAttribute(input1, "type", "text");
				input1.id = "embed-code";
				input1.className = "passive-input svelte-1tny3g8";
				input1.value = ctx.embedCode;
				input1.readOnly = true;
				addLoc(input1, file$1, 49, 20, 2030);
				div4.className = "copy-preview embed-code svelte-1tny3g8";
				addLoc(div4, file$1, 48, 16, 1972);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn copy-button svelte-1tny3g8";
				button1.title = __('publish / copy');
				addLoc(button1, file$1, 59, 16, 2385);
				span2.className = "copy-success svelte-1tny3g8";
				toggleClass(span2, "show", ctx.copySuccess.embedcode);
				addLoc(span2, file$1, 66, 16, 2685);
				div5.className = "copy-group svelte-1tny3g8";
				addLoc(div5, file$1, 47, 12, 1931);
				p.className = "embed-explanation svelte-1tny3g8";
				addLoc(p, file$1, 73, 12, 2944);
				div6.className = "share-embed-item svelte-1tny3g8";
				addLoc(div6, file$1, 45, 8, 1813);
				div7.className = "share-embed-block svelte-1tny3g8";
				addLoc(div7, file$1, 37, 4, 1600);
				div8.className = "share-embed svelte-1tny3g8";
				toggleClass(div8, "pending", ctx.pending);
				addLoc(div8, file$1, 0, 0, 0);
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
		this._state = assign(data$2(), options.data);

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

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ShareEmbed.prototype, protoDev);
	assign(ShareEmbed.prototype, methods$1);

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

	/* publish/PublishOld.html generated by Svelte v2.16.1 */



	let initial_auto_publish = true;

	function publishWait({ publishStarted, now }) {
	    return publishStarted > 0 ? now - publishStarted : 0;
	}
	function data$1() {
	    return {
	        chart: {
	            id: ''
	        },
	        embedTemplates: [],
	        pluginShareurls: [],
	        published: false,
	        publishing: false,
	        publishStarted: 0,
	        unpublished: false,
	        unpublishing: false,
	        needs_republish: false,
	        publish_error: false,
	        auto_publish: false,
	        progress: [],
	        shareurlType: 'default',
	        embedType: 'responsive',
	        statusUrl: false,
	        redirect_disabled: false
	    };
	}
	var methods = {
	    publish() {
	        const me = this;
	        const { dw_chart } = this.store.get();
	        // wait another 100ms until the page is ready
	        if (!dw_chart.save) {
	            setTimeout(() => {
	                me.publish();
	            }, 100);
	            return;
	        }
	        const { chart } = me.get();

	        me.set({
	            publishing: true,
	            publishStarted: new Date().getTime(),
	            now: new Date().getTime(),
	            progress: [],
	            unpublished: false,
	            publish_error: false
	        });

	        // update charts
	        me.set({ chart });

	        trackEvent('Chart Editor', 'publish');

	        dw_chart
	            .attributes(chart)
	            .save()
	            .then(() => {
	                this.set({
	                    statusUrl: `/v3/charts/${chart.id}/publish/status/${chart.publicVersion}`
	                });
	                // publish chart
	                httpReq
	                    .post(`/v3/charts/${chart.id}/publish`)
	                    .then(() => {
	                        httpReq.get(`/v3/charts/${chart.id}`).then(res => {
	                            trackEvent('Chart Editor', 'publish-success');
	                            me.publishFinished(res);
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
	                    const { publishing } = me.get();
	                    if (publishing) me.updateStatus();
	                }, 1000);
	            });
	    },

	    unpublish() {
	        const { chart } = this.get();

	        this.set({
	            progress: [],
	            unpublishing: true,
	            needs_republish: false
	        });

	        httpReq
	            .post(`/v3/charts/${chart.id}/unpublish`)
	            .then(() => {
	                httpReq.get(`/v3/charts/${chart.id}`).then(chartUpdates => {
	                    this.set({ chart: chartUpdates });
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
	        const me = this;
	        const { statusUrl } = me.get();
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
	        const { dw_chart } = this.store.get();
	        this.set({
	            progress: ['done'],
	            published: true,
	            publishStarted: 0,
	            needs_republish: false,
	            publishing: false,
	            chart: chartInfo
	        });

	        window.parent.postMessage(
	            {
	                source: 'datawrapper',
	                type: 'chart-publish',
	                chartId: chartInfo.id
	            },
	            '*'
	        );

	        dw_chart.attributes(chartInfo);
	    }
	};

	function onstate({ changed, current }) {
	    const userDataReady = window.dw && window.dw.backend && window.dw.backend.setUserData;
	    if (changed.embedType && userDataReady) {
	        const data = window.dw.backend.__userData;
	        if (!current.embedType || !data) return;
	        data.embed_type = current.embedType;
	        window.dw.backend.setUserData(data);
	    }
	    if (changed.shareurl_type && userDataReady) {
	        const data = window.dw.backend.__userData;
	        if (!current.shareurlType || !data) return;
	        data.shareurl_type = current.shareurlType;
	        window.dw.backend.setUserData(data);
	    }
	    if (changed.published) ;
	    if (changed.auto_publish) {
	        if (current.auto_publish && initial_auto_publish) {
	            this.publish();
	            initial_auto_publish = false;
	            window.history.replaceState('', '', window.location.pathname);
	        }
	    }
	}
	const file = "publish/PublishOld.html";

	function create_main_fragment(component, ctx) {
		var h2, raw0_value = __('publish / title'), text0, text1, text2, p, raw1_value = __('publish / unpublish-confirmation / explanation');

		var publishbutton_initial_data = {
		 	published: ctx.published,
		 	publishing: ctx.publishing,
		 	publishStarted: ctx.publishStarted,
		 	now: ctx.now,
		 	progress: ctx.progress,
		 	unpublished: ctx.unpublished,
		 	unpublishing: ctx.unpublishing,
		 	redirectDisabled: ctx.redirect_disabled,
		 	needsRepublish: ctx.needs_republish,
		 	publishError: ctx.publish_error,
		 	publicVersion: ctx.chart.publicVersion
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

		var if_block = (ctx.published) && create_if_block(component, ctx);

		var confirmationmodal_initial_data = {
		 	confirmButtonText: __('publish / unpublish-confirmation / unpublish'),
		 	confirmButtonIcon: "undo",
		 	backButtonText: __('publish / unpublish-confirmation / back'),
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
				h2 = createElement("h2");
				text0 = createText("\n\n");
				publishbutton._fragment.c();
				text1 = createText("\n\n");
				if (if_block) if_block.c();
				text2 = createText("\n\n");
				p = createElement("p");
				confirmationmodal._fragment.c();
				addLoc(h2, file, 0, 0, 0);
				addLoc(p, file, 39, 4, 973);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw0_value;
				insert(target, text0, anchor);
				publishbutton._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, text2, anchor);
				append(confirmationmodal._slotted.default, p);
				p.innerHTML = raw1_value;
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
				if (changed.redirect_disabled) publishbutton_changes.redirectDisabled = ctx.redirect_disabled;
				if (changed.needs_republish) publishbutton_changes.needsRepublish = ctx.needs_republish;
				if (changed.publish_error) publishbutton_changes.publishError = ctx.publish_error;
				if (changed.chart) publishbutton_changes.publicVersion = ctx.chart.publicVersion;
				publishbutton._set(publishbutton_changes);

				if (ctx.published) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(text2.parentNode, text2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text0);
				}

				publishbutton.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(text2);
				}

				confirmationmodal.destroy(detach);
				if (component.refs.confirmationModal === confirmationmodal) component.refs.confirmationModal = null;
			}
		};
	}

	// (19:0) {#if published}
	function create_if_block(component, ctx) {

		var shareembed_initial_data = {
		 	pluginShareurls: ctx.pluginShareurls,
		 	embedTemplates: ctx.embedTemplates,
		 	pending: ctx.publishing || ctx.unpublishing,
		 	shareurlType: ctx.shareurlType,
		 	embedType: ctx.embedType,
		 	metadata: ctx.chart.metadata,
		 	id: ctx.chart.id,
		 	publicUrl: ctx.chart.publicUrl
		 };
		var shareembed = new ShareEmbed({
			root: component.root,
			store: component.store,
			data: shareembed_initial_data
		});

		return {
			c: function create() {
				shareembed._fragment.c();
			},

			m: function mount(target, anchor) {
				shareembed._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var shareembed_changes = {};
				if (changed.pluginShareurls) shareembed_changes.pluginShareurls = ctx.pluginShareurls;
				if (changed.embedTemplates) shareembed_changes.embedTemplates = ctx.embedTemplates;
				if (changed.publishing || changed.unpublishing) shareembed_changes.pending = ctx.publishing || ctx.unpublishing;
				if (changed.shareurlType) shareembed_changes.shareurlType = ctx.shareurlType;
				if (changed.embedType) shareembed_changes.embedType = ctx.embedType;
				if (changed.chart) shareembed_changes.metadata = ctx.chart.metadata;
				if (changed.chart) shareembed_changes.id = ctx.chart.id;
				if (changed.chart) shareembed_changes.publicUrl = ctx.chart.publicUrl;
				shareembed._set(shareembed_changes);
			},

			d: function destroy(detach) {
				shareembed.destroy(detach);
			}
		};
	}

	function PublishOld(options) {
		this._debugName = '<PublishOld>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$1(), options.data);

		this._recompute({ publishStarted: 1, now: 1 }, this._state);
		if (!('publishStarted' in this._state)) console.warn("<PublishOld> was created without expected data property 'publishStarted'");
		if (!('now' in this._state)) console.warn("<PublishOld> was created without expected data property 'now'");
		if (!('published' in this._state)) console.warn("<PublishOld> was created without expected data property 'published'");
		if (!('publishing' in this._state)) console.warn("<PublishOld> was created without expected data property 'publishing'");
		if (!('progress' in this._state)) console.warn("<PublishOld> was created without expected data property 'progress'");
		if (!('unpublished' in this._state)) console.warn("<PublishOld> was created without expected data property 'unpublished'");
		if (!('unpublishing' in this._state)) console.warn("<PublishOld> was created without expected data property 'unpublishing'");
		if (!('redirect_disabled' in this._state)) console.warn("<PublishOld> was created without expected data property 'redirect_disabled'");
		if (!('needs_republish' in this._state)) console.warn("<PublishOld> was created without expected data property 'needs_republish'");
		if (!('publish_error' in this._state)) console.warn("<PublishOld> was created without expected data property 'publish_error'");
		if (!('chart' in this._state)) console.warn("<PublishOld> was created without expected data property 'chart'");
		if (!('pluginShareurls' in this._state)) console.warn("<PublishOld> was created without expected data property 'pluginShareurls'");
		if (!('embedTemplates' in this._state)) console.warn("<PublishOld> was created without expected data property 'embedTemplates'");
		if (!('shareurlType' in this._state)) console.warn("<PublishOld> was created without expected data property 'shareurlType'");
		if (!('embedType' in this._state)) console.warn("<PublishOld> was created without expected data property 'embedType'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment(this, this._state);

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

	assign(PublishOld.prototype, protoDev);
	assign(PublishOld.prototype, methods);

	PublishOld.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('publishWait' in newState && !this._updatingReadonlyProperty) throw new Error("<PublishOld>: Cannot set read-only property 'publishWait'");
	};

	PublishOld.prototype._recompute = function _recompute(changed, state) {
		if (changed.publishStarted || changed.now) {
			if (this._differs(state.publishWait, (state.publishWait = publishWait(state)))) changed.publishWait = true;
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

	var main = { App: PublishOld, data, store };

	return main;

})));
//# sourceMappingURL=publish_old.js.map
