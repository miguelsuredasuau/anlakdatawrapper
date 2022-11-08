(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/team-settings/products', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['team-settings/products'] = factory());
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

	function data$5() {
		return {
	    order: DEFAULT_ORDER,
	    orderBy: '',
	    uid: ''
	};
	}

	var methods$2 = {
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

	const file$4 = "node_modules/datawrapper/controls/TableDisplay.html";

	function click_handler$1(event) {
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

	function create_main_fragment$5(component, ctx) {
		var div, table, colgroup, text0, thead, tr, text1, tbody, slot_content_default = component._slotted.default;

		var each0_value = ctx.columnHeaders;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1$1(component, get_each0_context(ctx, each0_value, i));
		}

		var each1_value = ctx.columnHeaders;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block$2(component, get_each1_context(ctx, each1_value, i));
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
				addLoc(colgroup, file$4, 2, 8, 81);
				addLoc(tr, file$4, 9, 12, 251);
				addLoc(thead, file$4, 8, 8, 231);
				addLoc(tbody, file$4, 39, 8, 1257);
				table.className = "table svelte-l1s1ms";
				addLoc(table, file$4, 1, 4, 51);
				div.className = "table-container svelte-l1s1ms";
				div.dataset.uid = ctx.uid;
				addLoc(div, file$4, 0, 0, 0);
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
							each1_blocks[i] = create_each_block$2(component, child_ctx);
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
				addLoc(col, file$4, 4, 12, 146);
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
	function create_else_block$1(component, ctx) {
		var span, text_value = ctx.item.title, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "col";
				addLoc(span, file$4, 32, 20, 1103);
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
	function create_if_block$4(component, ctx) {
		var a, text_value = ctx.item.title, text, a_class_value, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler$1);
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
				addLoc(a, file$4, 13, 20, 429);
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

				removeListener(a, "click", click_handler$1);
			}
		};
	}

	// (11:16) {#each columnHeaders as item}
	function create_each_block$2(component, ctx) {
		var th, th_class_value;

		function select_block_type(ctx) {
			if (ctx.item.orderBy) return create_if_block$4;
			return create_else_block$1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				th = createElement("th");
				if_block.c();
				th.className = th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-l1s1ms";
				addLoc(th, file$4, 11, 16, 318);
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
		this._state = assign(data$5(), options.data);

		this._recompute({ orderBy: 1, order: 1 }, this._state);
		if (!('orderBy' in this._state)) console.warn("<TableDisplay> was created without expected data property 'orderBy'");
		if (!('order' in this._state)) console.warn("<TableDisplay> was created without expected data property 'order'");
		if (!('uid' in this._state)) console.warn("<TableDisplay> was created without expected data property 'uid'");
		if (!('columnHeaders' in this._state)) console.warn("<TableDisplay> was created without expected data property 'columnHeaders'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TableDisplay.prototype, protoDev);
	assign(TableDisplay.prototype, methods$2);

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

	var upgradeIcon = '<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>';

	/* node_modules/@datawrapper/controls/HelpDisplay.html generated by Svelte v2.16.1 */



	function helpIcon({ type }) {
	    return type === 'upgrade-info' ? upgradeIcon : '?';
	}
	function data$4() {
	    return {
	        visible: false,
	        class: '',
	        compact: false,
	        style: null,
	        type: 'help',
	        uid: ''
	    };
	}
	var methods$1 = {
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

	const file$3 = "node_modules/datawrapper/controls/HelpDisplay.html";

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
				span.className = span_class_value = "help-icon " + ctx.type + " svelte-1h0yjz4";
				toggleClass(span, "visible", ctx.visible);
				addLoc(span, file$3, 9, 4, 180);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = div_class_value = "help " + ctx.class + " " + ctx.type + " svelte-1h0yjz4";
				div.style.cssText = ctx.style;
				div.dataset.uid = ctx.uid;
				toggleClass(div, "compact", {compact: ctx.compact});
				addLoc(div, file$3, 0, 0, 0);
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
						if_block = create_if_block$3(component, ctx);
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
	function create_if_block$3(component, ctx) {
		var div, text0, text1, slot_content_default = component._slotted.default, slot_content_default_before, div_class_value;

		var if_block0 = (ctx.type === 'help') && create_if_block_2$2();

		var if_block1 = (ctx.type === 'upgrade-info') && create_if_block_1$3();

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if (if_block1) if_block1.c();
				text1 = createText("\n        ");
				div.className = div_class_value = "content " + ctx.type + " svelte-1h0yjz4";
				addLoc(div, file$3, 11, 4, 283);
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
						if_block0 = create_if_block_2$2();
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.type === 'upgrade-info') {
					if (!if_block1) {
						if_block1 = create_if_block_1$3();
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
	function create_if_block_2$2(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "hat-icon im im-graduation-hat svelte-1h0yjz4";
				addLoc(i, file$3, 13, 8, 350);
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
	function create_if_block_1$3(component, ctx) {
		var div, text_value = __$1('upgrade-available'), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "content-header svelte-1h0yjz4";
				addLoc(div, file$3, 15, 8, 448);
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
		this._state = assign(data$4(), options.data);

		this._recompute({ type: 1 }, this._state);
		if (!('type' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'type'");
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('compact' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'compact'");
		if (!('style' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'style'");
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
	assign(HelpDisplay.prototype, methods$1);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('helpIcon' in newState && !this._updatingReadonlyProperty) throw new Error("<HelpDisplay>: Cannot set read-only property 'helpIcon'");
	};

	HelpDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.type) {
			if (this._differs(state.helpIcon, (state.helpIcon = helpIcon(state)))) changed.helpIcon = true;
		}
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$3() {
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

	const file$2 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$3(component, ctx) {
		var text0, div1, text1, div0, slot_content_default = component._slotted.default, text2, div1_class_value;

		var if_block0 = (ctx.help) && create_if_block_3$1(component, ctx);

		var if_block1 = (ctx.label) && create_if_block_1$2(component, ctx);

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
				addLoc(div0, file$2, 17, 4, 457);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " " + ctx.class + " svelte-1ykzs2h";
				div1.dataset.uid = ctx.uid;
				addLoc(div1, file$2, 6, 0, 95);
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
						if_block1 = create_if_block_1$2(component, ctx);
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
				addLoc(div, file$2, 2, 4, 49);
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
	function create_if_block_1$2(component, ctx) {
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
				addLoc(label, file$2, 11, 4, 233);
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
				addLoc(p, file$2, 13, 8, 368);
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
				addLoc(p, file$2, 25, 4, 651);
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
		this._state = assign(data$3(), options.data);
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

	/* node_modules/@datawrapper/controls/SelectInput.html generated by Svelte v2.16.1 */

	function data$2() {
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
	const file$1 = "node_modules/datawrapper/controls/SelectInput.html";

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

	function create_main_fragment$2(component, ctx) {
		var select, if_block0_anchor, select_updating = false, select_class_value;

		var if_block0 = (ctx.options.length) && create_if_block_1$1(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$1(component, ctx);

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
				addLoc(select, file$1, 0, 0, 0);
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
						if_block0 = create_if_block_1$1(component, ctx);
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
						if_block1 = create_if_block$1(component, ctx);
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
	function create_if_block_1$1(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context$1(ctx, each_value, i));
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
				addLoc(option, file$1, 9, 4, 229);
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
	function create_if_block$1(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context_1(ctx, each_value_1, i));
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
							each_blocks[i] = create_each_block$1(component, child_ctx);
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
				addLoc(option, file$1, 13, 8, 470);
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
	function create_each_block$1(component, ctx) {
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
				addLoc(optgroup, file$1, 11, 4, 386);
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
		this._state = assign(data$2(), options.data);
		if (!('class' in this._state)) console.warn("<SelectInput> was created without expected data property 'class'");
		if (!('disabled' in this._state)) console.warn("<SelectInput> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<SelectInput> was created without expected data property 'width'");
		if (!('uid' in this._state)) console.warn("<SelectInput> was created without expected data property 'uid'");
		if (!('options' in this._state)) console.warn("<SelectInput> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectInput> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

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

	function data$1() {
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
	function create_main_fragment$1(component, ctx) {
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
		this._state = assign(data$1(), options.data);

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

		this._fragment = create_main_fragment$1(this, this._state);

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

	/* team-settings/tabs/ProductTable.html generated by Svelte v2.16.1 */



	function addableProducts({ products, allProducts }) {
	    if (!allProducts || !products) return [];

	    const addableProducts = [
	        {
	            value: null,
	            label: '---'
	        }
	    ];
	    addableProducts.push(
	        ...allProducts
	            .filter(el => {
	                return !products.filter(pr => pr.id === el.id).length;
	            })
	            .map(el => {
	                return {
	                    value: el.id,
	                    label: el.name
	                };
	            })
	    );
	    return addableProducts;
	}
	function data() {
	    return {
	        productHeaders: [
	            { title: __('teams / products / id'), width: '10%' },
	            { title: __('teams / products / name'), width: '30%' },
	            { title: __('teams / products / expires'), width: '30%' },
	            { title: __('teams / products / actions'), width: '30%' }
	        ],
	        editId: false,
	        updating: {},
	        loadingTeamProducts: true,
	        loadingAllProducts: true
	    };
	}
	var methods = {
	    edit(productId) {
	        if (this.get().editId === productId) {
	            this.set({ editId: false });
	            this.update(productId);
	        } else {
	            this.set({
	                editId: productId
	            });
	        }
	    },
	    async addProduct() {
	        const { team, addProduct } = this.get();

	        this.set({ addingProduct: true });

	        await httpReq(`/v3/teams/${team.id}/products`, {
	            method: 'post',
	            payload: {
	                productId: addProduct
	            }
	        });

	        const products = await httpReq(`/v3/teams/${team.id}/products`);
	        this.set({ products: products.list, addingProduct: false });
	    },
	    async remove(product) {
	        if (!window.confirm('Are you sure you want to remove this product?')) return;

	        await httpReq(`/v3/teams/${this.get().team.id}/products/${product.id}`, {
	            method: 'delete'
	        });

	        var { products } = this.get();
	        products = products.filter(el => el.id !== product.id);
	        this.set({ products });
	    },
	    async update(productId) {
	        var { updating, products } = this.get();
	        const product = products.filter(u => u.id === productId)[0];
	        updating[product.id] = true;
	        this.set({ updating });

	        await httpReq(`/v3/teams/${this.get().team.id}/products/${product.id}`, {
	            method: 'put',
	            payload: {
	                expires: product.expires
	            }
	        });

	        updating = this.get().updating;
	        updating[product.id] = false;
	        this.set({ updating });
	    }
	};

	function oncreate() {
	    const current = this.get();

	    httpReq(`/v3/teams/${current.team.id}/products`).then(products =>
	        this.set({ loadingTeamProducts: false, products: products.list })
	    );

	    httpReq(`/v3/products`).then(allProducts =>
	        this.set({ loadingAllProducts: false, allProducts: allProducts.list })
	    );
	}
	const file = "team-settings/tabs/ProductTable.html";

	function click_handler_2(event) {
		const { component, ctx } = this._svelte;

		component.remove(ctx.product);
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.edit(ctx.product.id);
	}

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.edit(ctx.product.id);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.product = list[i];
		child_ctx.each_value = list;
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var p, raw_value = __('teams / products / p'), text, if_block_anchor;

		var if_block = (ctx.isAdmin) && create_if_block(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.isAdmin) {
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
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (3:0) {#if isAdmin}
	function create_if_block(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.loadingTeamProducts || ctx.loadingAllProducts) return create_if_block_1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
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
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
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

	// (5:0) {:else}
	function create_else_block(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.products.length > 0) && create_if_block_4(component, ctx);

		var if_block1 = (ctx.addableProducts.length) && create_if_block_2(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n\n");
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
				if (ctx.products.length > 0) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.addableProducts.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2(component, ctx);
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

	// (3:14) {#if loadingTeamProducts || loadingAllProducts}
	function create_if_block_1(component, ctx) {
		var p, i, text, raw_value = __('teams / products / loading'), raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText("   ");
				raw_before = createElement('noscript');
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file, 3, 3, 137);
				addLoc(p, file, 3, 0, 134);
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

	// (8:0) {#if products.length > 0}
	function create_if_block_4(component, ctx) {
		var each_anchor;

		var each_value = ctx.products;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		var tabledisplay_initial_data = { columnHeaders: ctx.productHeaders };
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
				if (changed.editId || changed.products || changed.updating) {
					each_value = ctx.products;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
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
				if (changed.productHeaders) tabledisplay_changes.columnHeaders = ctx.productHeaders;
				tabledisplay._set(tabledisplay_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				tabledisplay.destroy(detach);
			}
		};
	}

	// (17:12) {:else}
	function create_else_block_2(component, ctx) {
		var text_value = ctx.product.expires || __('teams / products / never'), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.products) && text_value !== (text_value = ctx.product.expires || __('teams / products / never'))) {
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

	// (15:12) {#if editId === product.id }
	function create_if_block_7(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			ctx.each_value[ctx.i].expires = input.value;
			component.set({ products: ctx.products });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				addLoc(input, file, 15, 12, 518);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.product.expires;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.products) input.value = ctx.product.expires;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (28:12) {:else}
	function create_else_block_1(component, ctx) {
		var button0, i0, text0, text1_value = __('teams / edit' ), text1, text2, button1, i1, text3, text4_value = __('teams / remove' ), text4;

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
				addLoc(i0, file, 29, 16, 1193);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1);
				button0.className = "btn";
				addLoc(button0, file, 28, 12, 1128);
				i1.className = "fa fa-times";
				addLoc(i1, file, 33, 16, 1349);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2);
				button1.className = "btn";
				addLoc(button1, file, 32, 12, 1285);
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

	// (24:42) 
	function create_if_block_6(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file, 25, 16, 999);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file, 24, 12, 941);
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

	// (20:12) {#if editId === product.id }
	function create_if_block_5(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file, 21, 16, 806);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler);
				button.className = "btn btn-primary";
				addLoc(button, file, 20, 12, 729);
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

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (10:4) {#each products as product, i}
	function create_each_block(component, ctx) {
		var tr, td0, text0_value = ctx.product.id, text0, text1, td1, text2_value = ctx.product.name, text2, text3, td2, text4, td3;

		function select_block_type_1(ctx) {
			if (ctx.editId === ctx.product.id) return create_if_block_7;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.editId === ctx.product.id) return create_if_block_5;
			if (ctx.updating[ctx.product.id]) return create_if_block_6;
			return create_else_block_1;
		}

		var current_block_type_1 = select_block_type_2(ctx);
		var if_block1 = current_block_type_1(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				td1 = createElement("td");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				td2 = createElement("td");
				if_block0.c();
				text4 = createText("\n        ");
				td3 = createElement("td");
				if_block1.c();
				addLoc(td0, file, 11, 8, 394);
				addLoc(td1, file, 12, 8, 426);
				addLoc(td2, file, 13, 8, 460);
				addLoc(td3, file, 18, 8, 671);
				addLoc(tr, file, 10, 4, 381);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, text0);
				append(tr, text1);
				append(tr, td1);
				append(td1, text2);
				append(tr, text3);
				append(tr, td2);
				if_block0.m(td2, null);
				append(tr, text4);
				append(tr, td3);
				if_block1.m(td3, null);
			},

			p: function update(changed, ctx) {
				if ((changed.products) && text0_value !== (text0_value = ctx.product.id)) {
					setData(text0, text0_value);
				}

				if ((changed.products) && text2_value !== (text2_value = ctx.product.name)) {
					setData(text2, text2_value);
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(td2, null);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(component, ctx);
					if_block1.c();
					if_block1.m(td3, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if_block0.d();
				if_block1.d();
			}
		};
	}

	// (44:0) {#if addableProducts.length }
	function create_if_block_2(component, ctx) {
		var selectcontrol_updating = {}, text, if_block_anchor;

		var selectcontrol_initial_data = {
		 	label: __('teams / products / add-product'),
		 	options: ctx.addableProducts
		 };
		if (ctx.addProduct !== void 0) {
			selectcontrol_initial_data.value = ctx.addProduct;
			selectcontrol_updating.value = true;
		}
		var selectcontrol = new SelectControl({
			root: component.root,
			store: component.store,
			data: selectcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectcontrol_updating.value && changed.value) {
					newState.addProduct = childState.value;
				}
				component._set(newState);
				selectcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectcontrol._bind({ value: 1 }, selectcontrol.get());
		});

		var if_block = (ctx.addProduct) && create_if_block_3(component, ctx);

		return {
			c: function create() {
				selectcontrol._fragment.c();
				text = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				selectcontrol._mount(target, anchor);
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectcontrol_changes = {};
				if (changed.addableProducts) selectcontrol_changes.options = ctx.addableProducts;
				if (!selectcontrol_updating.value && changed.addProduct) {
					selectcontrol_changes.value = ctx.addProduct;
					selectcontrol_updating.value = ctx.addProduct !== void 0;
				}
				selectcontrol._set(selectcontrol_changes);
				selectcontrol_updating = {};

				if (ctx.addProduct) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_3(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				selectcontrol.destroy(detach);
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

	// (51:0) {#if addProduct}
	function create_if_block_3(component, ctx) {
		var button, i, i_class_value, text, raw_value = __('teams / products / add'), raw_before;

		function click_handler_3(event) {
			component.addProduct();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText("\n    ");
				raw_before = createElement('noscript');
				i.className = i_class_value = "fa " + (ctx.addingProduct ? 'fa fa-spin fa-circle-o-notch' : 'fa-plus');
				addLoc(i, file, 52, 4, 1771);
				addListener(button, "click", click_handler_3);
				button.className = "btn btn-primary";
				addLoc(button, file, 51, 0, 1710);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.addingProduct) && i_class_value !== (i_class_value = "fa " + (ctx.addingProduct ? 'fa fa-spin fa-circle-o-notch' : 'fa-plus'))) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler_3);
			}
		};
	}

	function ProductTable(options) {
		this._debugName = '<ProductTable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);

		this._recompute({ products: 1, allProducts: 1 }, this._state);
		if (!('products' in this._state)) console.warn("<ProductTable> was created without expected data property 'products'");
		if (!('allProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'allProducts'");
		if (!('isAdmin' in this._state)) console.warn("<ProductTable> was created without expected data property 'isAdmin'");
		if (!('loadingTeamProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'loadingTeamProducts'");
		if (!('loadingAllProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'loadingAllProducts'");
		if (!('productHeaders' in this._state)) console.warn("<ProductTable> was created without expected data property 'productHeaders'");
		if (!('editId' in this._state)) console.warn("<ProductTable> was created without expected data property 'editId'");
		if (!('updating' in this._state)) console.warn("<ProductTable> was created without expected data property 'updating'");

		if (!('addProduct' in this._state)) console.warn("<ProductTable> was created without expected data property 'addProduct'");
		if (!('addingProduct' in this._state)) console.warn("<ProductTable> was created without expected data property 'addingProduct'");
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

	assign(ProductTable.prototype, protoDev);
	assign(ProductTable.prototype, methods);

	ProductTable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('addableProducts' in newState && !this._updatingReadonlyProperty) throw new Error("<ProductTable>: Cannot set read-only property 'addableProducts'");
	};

	ProductTable.prototype._recompute = function _recompute(changed, state) {
		if (changed.products || changed.allProducts) {
			if (this._differs(state.addableProducts, (state.addableProducts = addableProducts(state)))) changed.addableProducts = true;
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

	var main = { App: ProductTable, store };

	return main;

})));
//# sourceMappingURL=products.js.map
