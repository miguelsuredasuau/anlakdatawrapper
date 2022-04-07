(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../../../../static/vendor/jschardet/jschardet.min', '../../../../../../../../../static/vendor/xlsx/xlsx.full.min'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.upload = factory(global.jschardet));
}(this, (function (jschardet) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var jschardet__default = /*#__PURE__*/_interopDefaultLegacy(jschardet);

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

	function data$4() {
	    return {
	        placeholder: __('upload / paste here')
	    };
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

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TextAreaUpload.prototype, protoDev);

	TextAreaUpload.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* upload/UploadHelp.html generated by Svelte v2.16.1 */

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
	        setTimeout(() => {
	            this.set({ chartData: sel.data });
	        }, 100);
	        if (sel.presets) {
	            Object.keys(sel.presets).forEach(k => {
	                this.store.get().dw_chart.set(k, sel.presets[k]);
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

	function data$2() {
	    return {
	        selected: false,
	        chartData: '',
	        sheets: []
	    };
	}
	function onupdate({ changed, current }) {
	    if (changed.sheets && current.sheets.length > 1) {
	        setTimeout(() => {
	            this.set({
	                selected: current.sheets[0]
	            });
	        }, 300);
	    } else if (changed.sheets && current.sheets.length === 1) {
	        this.set({ chartData: current.sheets[0].csv });
	        this.store.get().dw_chart.onNextSave(() => {
	            window.location.href = 'describe';
	        });
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
		var p, text_value = __('edit / upload / success-import'), text;

		return {
			c: function create() {
				p = createElement("p");
				text = createText(text_value);
				addLoc(p, file$1, 11, 4, 375);
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

			p: noop,

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
	                    app.set({ chartData: result });
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
	        const { dw_chart } = this.store.get();
	        if (btn.onFileUpload) btn.onFileUpload(event, dw_chart);
	    },
	    dragStart(event) {
	        const { active } = this.get();
	        if (isEventWithTextFiles(event) && active.id === 'copy') {
	            event.preventDefault();
	            this.set({ dragover: true });
	        }
	    },
	    resetDrag() {
	        this.set({ dragover: false });
	    },
	    onFileDrop(event) {
	        const { active } = this.get();
	        const { dw_chart } = this.store.get();
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
	                    this.set({
	                        chartData: result
	                    });
	                    dw_chart.onNextSave(() => {
	                        window.location.href = 'describe';
	                    });
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
	function onstate({ changed, current }) {
	    if (changed.chartData) {
	        this.fire('change', current.chartData);
	    }
	}
	function isEventWithTextFiles(event) {
	    if (!event.dataTransfer) {
	        return !!event.target && !!event.target.files;
	    }
	    return (
	        Array.prototype.some.call(
	            event.dataTransfer.types,
	            type => type === 'Files' || type === 'application/x-moz-file'
	        ) &&
	        Array.prototype.some.call(
	            event.dataTransfer.items,
	            item => item.kind === 'file' && item.type.startsWith('text/')
	        )
	    );
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
				addLoc(h3, file, 16, 16, 589);
				ul.className = "import-methods svelte-2180z6";
				addLoc(ul, file, 18, 16, 644);
				h4.className = "svelte-2180z6";
				addLoc(h4, file, 44, 16, 1709);
				div0.className = "sidebar";
				addLoc(div0, file, 15, 12, 551);
				div1.className = "column is-5";
				addLoc(div1, file, 14, 8, 513);
				i.className = "icon-chevron-right icon-white";
				addLoc(i, file, 60, 36, 2294);
				a.href = "describe";
				a.className = "submit btn btn-primary svelte-2180z6";
				a.id = "describe-proceed";
				addLoc(a, file, 59, 16, 2185);
				div2.className = "buttons pull-right";
				addLoc(div2, file, 58, 12, 2136);
				div3.className = "column";
				addLoc(div3, file, 55, 8, 2021);
				div4.className = "columns is-variable is-5 is-8-widescreen";
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
				div.className = "draginfo svelte-2180z6";
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
				input.className = "file-upload svelte-2180z6";
				setAttribute(input, "type", "file");
				addLoc(input, file, 23, 28, 918);
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
				i.className = i_class_value = "" + ctx.btn.icon + " svelte-2180z6";
				addLoc(i, file, 30, 28, 1263);
				span.className = "svelte-2180z6";
				addLoc(span, file, 31, 28, 1318);
				label.className = "svelte-2180z6";
				addLoc(label, file, 21, 24, 831);

				li._svelte = { component, ctx };

				addListener(li, "click", click_handler);
				li.className = li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-2180z6";
				addLoc(li, file, 20, 20, 735);
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

				if ((changed.buttons) && i_class_value !== (i_class_value = "" + ctx.btn.icon + " svelte-2180z6")) {
					i.className = i_class_value;
				}

				if ((changed.buttons) && text2_value !== (text2_value = ctx.btn.title)) {
					setData(text2, text2_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.active || changed.buttons) && li_class_value !== (li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-2180z6")) {
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
				addLoc(div0, file, 39, 20, 1549);
				div1.className = "alert alert-error";
				addLoc(div1, file, 38, 16, 1497);
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

		this._handlers.state = [onstate];

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

	var main = { App, data, store };

	return main;

})));
//# sourceMappingURL=upload.js.map
