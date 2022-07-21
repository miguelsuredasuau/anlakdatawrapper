(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?module.exports=f():typeof define==='function'&&define.amd?define(f):(g=typeof globalThis!=='undefined'?globalThis:g||self,g.chart=f());})(this,(function(){'use strict';function run(fn) {
  return fn();
}

function blank_object() {
  return Object.create(null);
}

function run_all(fns) {
  fns.forEach(run);
}

let current_component;

function set_current_component(component) {
  current_component = component;
}

function get_current_component() {
  if (!current_component) throw new Error(`Function called outside component initialization`);
  return current_component;
}

function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}

function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
Promise.resolve();

const escaped = {
  '"': '&quot;',
  "'": '&#39;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

function escape$1(html) {
  return String(html).replace(/["'&<>]/g, match => escaped[match]);
}

function each$1(items, fn) {
  let str = '';

  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }

  return str;
}

const missing_component = {
  $$render: () => ''
};

function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === 'svelte:component') name += ' this={...}';
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }

  return component;
}

let on_destroy;

function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : []),
      // these will be immediately discarded
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({
      $$
    });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }

  return {
    render: (props = {}, options = {}) => {
      on_destroy = [];
      const result = {
        title: '',
        head: '',
        css: new Set()
      };
      const html = $$render(result, props, {}, options);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map(css => css.code).join('\n'),
          map: null // TODO

        },
        head: result.title + result.head
      };
    },
    $$render
  };
}

function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value) return '';
  return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape$1(value)) : `"${value}"`}`}`;
}const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
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
  input = String(input); // pass if neither < or > exist in string

  if (input.indexOf('<') < 0 && input.indexOf('>') < 0) {
    return input;
  }

  input = stripTags(input, allowed); // remove all event attributes

  if (typeof document === 'undefined') return input;
  var d = document.createElement('div');
  d.innerHTML = `<span>${input}</span>`; // strip tags again, because `document.createElement()` closes unclosed tags and therefore
  // creates new elements that might not be allowed

  d.innerHTML = stripTags(d.innerHTML, allowed && !allowed.includes('<span>') ? allowed + '<span>' : allowed || undefined);
  var sel = d.childNodes[0].querySelectorAll('*');

  for (var i = 0; i < sel.length; i++) {
    if (sel[i].nodeName.toLowerCase() === 'a') {
      // special treatment for <a> elements
      if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
      sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
      const hrefNormalized = (sel[i].getAttribute('href') || '').toLowerCase() // remove invalid uri characters
      .replace(/[^a-z0-9 -/:?=]/g, '').trim();

      if (hrefNormalized.startsWith('javascript:') || hrefNormalized.startsWith('vbscript:') || hrefNormalized.startsWith('data:')) {
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
  allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  var before = input;
  var after = input; // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
  // eslint-disable-next-line no-constant-condition

  while (true) {
    before = after;
    after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    }); // return once no more tags are removed

    if (before === after) {
      return after;
    }
  }
}var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}var chroma$2 = {exports: {}};/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

(function (module, exports) {
(function (global, factory) {
    module.exports = factory() ;
})(commonjsGlobal, (function () {
    var limit$2 = function (x, min, max) {
        if ( min === void 0 ) min=0;
        if ( max === void 0 ) max=1;

        return x < min ? min : x > max ? max : x;
    };

    var limit$1 = limit$2;

    var clip_rgb$3 = function (rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i=0; i<=3; i++) {
            if (i < 3) {
                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                rgb[i] = limit$1(rgb[i], 0, 255);
            } else if (i === 3) {
                rgb[i] = limit$1(rgb[i], 0, 1);
            }
        }
        return rgb;
    };

    // ported from jQuery's $.type
    var classToType = {};
    for (var i$1 = 0, list$1 = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i$1 < list$1.length; i$1 += 1) {
        var name = list$1[i$1];

        classToType[("[object " + name + "]")] = name.toLowerCase();
    }
    var type$p = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
    };

    var type$o = type$p;

    var unpack$B = function (args, keyOrder) {
        if ( keyOrder === void 0 ) keyOrder=null;

    	// if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
    	if (type$o(args[0]) == 'object' && keyOrder) {
    		return keyOrder.split('')
    			.filter(function (k) { return args[0][k] !== undefined; })
    			.map(function (k) { return args[0][k]; });
    	}
    	// otherwise we just return the first argument
    	// (which we suppose is an array of args)
        return args[0];
    };

    var type$n = type$p;

    var last$4 = function (args) {
        if (args.length < 2) { return null; }
        var l = args.length-1;
        if (type$n(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
    };

    var PI$2 = Math.PI;

    var utils = {
    	clip_rgb: clip_rgb$3,
    	limit: limit$2,
    	type: type$p,
    	unpack: unpack$B,
    	last: last$4,
    	PI: PI$2,
    	TWOPI: PI$2*2,
    	PITHIRD: PI$2/3,
    	DEG2RAD: PI$2 / 180,
    	RAD2DEG: 180 / PI$2
    };

    var input$h = {
    	format: {},
    	autodetect: []
    };

    var last$3 = utils.last;
    var clip_rgb$2 = utils.clip_rgb;
    var type$m = utils.type;
    var _input = input$h;

    var Color$D = function Color() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var me = this;
        if (type$m(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor) {
            // the argument is already a Color instance
            return args[0];
        }

        // last argument could be the mode
        var mode = last$3(args);
        var autodetect = false;

        if (!mode) {
            autodetect = true;
            if (!_input.sorted) {
                _input.autodetect = _input.autodetect.sort(function (a,b) { return b.p - a.p; });
                _input.sorted = true;
            }
            // auto-detect format
            for (var i = 0, list = _input.autodetect; i < list.length; i += 1) {
                var chk = list[i];

                mode = chk.test.apply(chk, args);
                if (mode) { break; }
            }
        }

        if (_input.format[mode]) {
            var rgb = _input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
            me._rgb = clip_rgb$2(rgb);
        } else {
            throw new Error('unknown format: '+args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
    };

    Color$D.prototype.toString = function toString () {
        if (type$m(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
    };

    var Color_1 = Color$D;

    var chroma$k = function () {
    	var args = [], len = arguments.length;
    	while ( len-- ) args[ len ] = arguments[ len ];

    	return new (Function.prototype.bind.apply( chroma$k.Color, [ null ].concat( args) ));
    };

    chroma$k.Color = Color_1;
    chroma$k.version = '2.4.2';

    var chroma_1 = chroma$k;

    var unpack$A = utils.unpack;
    var max$2 = Math.max;

    var rgb2cmyk$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$A(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max$2(r,max$2(g,b));
        var f = k < 1 ? 1 / (1-k) : 0;
        var c = (1-r-k) * f;
        var m = (1-g-k) * f;
        var y = (1-b-k) * f;
        return [c,m,y,k];
    };

    var rgb2cmyk_1 = rgb2cmyk$1;

    var unpack$z = utils.unpack;

    var cmyk2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$z(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0,0,0,alpha]; }
        return [
            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
            alpha
        ];
    };

    var cmyk2rgb_1 = cmyk2rgb;

    var chroma$j = chroma_1;
    var Color$C = Color_1;
    var input$g = input$h;
    var unpack$y = utils.unpack;
    var type$l = utils.type;

    var rgb2cmyk = rgb2cmyk_1;

    Color$C.prototype.cmyk = function() {
        return rgb2cmyk(this._rgb);
    };

    chroma$j.cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$C, [ null ].concat( args, ['cmyk']) ));
    };

    input$g.format.cmyk = cmyk2rgb_1;

    input$g.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$y(args, 'cmyk');
            if (type$l(args) === 'array' && args.length === 4) {
                return 'cmyk';
            }
        }
    });

    var unpack$x = utils.unpack;
    var last$2 = utils.last;
    var rnd = function (a) { return Math.round(a*100)/100; };

    /*
     * supported arguments:
     * - hsl2css(h,s,l)
     * - hsl2css(h,s,l,a)
     * - hsl2css([h,s,l], mode)
     * - hsl2css([h,s,l,a], mode)
     * - hsl2css({h,s,l,a}, mode)
     */
    var hsl2css$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hsla = unpack$x(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1]*100) + '%';
        hsla[2] = rnd(hsla[2]*100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
            mode = 'hsla';
        } else {
            hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
    };

    var hsl2css_1 = hsl2css$1;

    var unpack$w = utils.unpack;

    /*
     * supported arguments:
     * - rgb2hsl(r,g,b)
     * - rgb2hsl(r,g,b,a)
     * - rgb2hsl([r,g,b])
     * - rgb2hsl([r,g,b,a])
     * - rgb2hsl({r,g,b,a})
     */
    var rgb2hsl$3 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$w(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min){
            s = 0;
            h = Number.NaN;
        } else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
        return [h,s,l];
    };

    var rgb2hsl_1 = rgb2hsl$3;

    var unpack$v = utils.unpack;
    var last$1 = utils.last;
    var hsl2css = hsl2css_1;
    var rgb2hsl$2 = rgb2hsl_1;
    var round$6 = Math.round;

    /*
     * supported arguments:
     * - rgb2css(r,g,b)
     * - rgb2css(r,g,b,a)
     * - rgb2css([r,g,b], mode)
     * - rgb2css([r,g,b,a], mode)
     * - rgb2css({r,g,b,a}, mode)
     */
    var rgb2css$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$v(args, 'rgba');
        var mode = last$1(args) || 'rgb';
        if (mode.substr(0,3) == 'hsl') {
            return hsl2css(rgb2hsl$2(rgba), mode);
        }
        rgba[0] = round$6(rgba[0]);
        rgba[1] = round$6(rgba[1]);
        rgba[2] = round$6(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
            mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
    };

    var rgb2css_1 = rgb2css$1;

    var unpack$u = utils.unpack;
    var round$5 = Math.round;

    var hsl2rgb$1 = function () {
        var assign;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$u(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r,g,b;
        if (s === 0) {
            r = g = b = l*255;
        } else {
            var t3 = [0,0,0];
            var c = [0,0,0];
            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
            var t1 = 2 * l - t2;
            var h_ = h / 360;
            t3[0] = h_ + 1/3;
            t3[1] = h_;
            t3[2] = h_ - 1/3;
            for (var i=0; i<3; i++) {
                if (t3[i] < 0) { t3[i] += 1; }
                if (t3[i] > 1) { t3[i] -= 1; }
                if (6 * t3[i] < 1)
                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                else if (2 * t3[i] < 1)
                    { c[i] = t2; }
                else if (3 * t3[i] < 2)
                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                else
                    { c[i] = t1; }
            }
            (assign = [round$5(c[0]*255),round$5(c[1]*255),round$5(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
            // keep alpha channel
            return [r,g,b,args[3]];
        }
        return [r,g,b,1];
    };

    var hsl2rgb_1 = hsl2rgb$1;

    var hsl2rgb = hsl2rgb_1;
    var input$f = input$h;

    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

    var round$4 = Math.round;

    var css2rgb$1 = function (css) {
        css = css.toLowerCase().trim();
        var m;

        if (input$f.format.named) {
            try {
                return input$f.format.named(css);
            } catch (e) {
                // eslint-disable-next-line
            }
        }

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
            var rgb = m.slice(1,4);
            for (var i=0; i<3; i++) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;  // default alpha
            return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
            var rgb$1 = m.slice(1,5);
            for (var i$1=0; i$1<4; i$1++) {
                rgb$1[i$1] = +rgb$1[i$1];
            }
            return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
            var rgb$2 = m.slice(1,4);
            for (var i$2=0; i$2<3; i$2++) {
                rgb$2[i$2] = round$4(rgb$2[i$2] * 2.55);
            }
            rgb$2[3] = 1;  // default alpha
            return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
            var rgb$3 = m.slice(1,5);
            for (var i$3=0; i$3<3; i$3++) {
                rgb$3[i$3] = round$4(rgb$3[i$3] * 2.55);
            }
            rgb$3[3] = +rgb$3[3];
            return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
            var hsl = m.slice(1,4);
            hsl[1] *= 0.01;
            hsl[2] *= 0.01;
            var rgb$4 = hsl2rgb(hsl);
            rgb$4[3] = 1;
            return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
            var hsl$1 = m.slice(1,4);
            hsl$1[1] *= 0.01;
            hsl$1[2] *= 0.01;
            var rgb$5 = hsl2rgb(hsl$1);
            rgb$5[3] = +m[4];  // default alpha = 1
            return rgb$5;
        }
    };

    css2rgb$1.test = function (s) {
        return RE_RGB.test(s) ||
            RE_RGBA.test(s) ||
            RE_RGB_PCT.test(s) ||
            RE_RGBA_PCT.test(s) ||
            RE_HSL.test(s) ||
            RE_HSLA.test(s);
    };

    var css2rgb_1 = css2rgb$1;

    var chroma$i = chroma_1;
    var Color$B = Color_1;
    var input$e = input$h;
    var type$k = utils.type;

    var rgb2css = rgb2css_1;
    var css2rgb = css2rgb_1;

    Color$B.prototype.css = function(mode) {
        return rgb2css(this._rgb, mode);
    };

    chroma$i.css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$B, [ null ].concat( args, ['css']) ));
    };

    input$e.format.css = css2rgb;

    input$e.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$k(h) === 'string' && css2rgb.test(h)) {
                return 'css';
            }
        }
    });

    var Color$A = Color_1;
    var chroma$h = chroma_1;
    var input$d = input$h;
    var unpack$t = utils.unpack;

    input$d.format.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$t(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
    };

    chroma$h.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$A, [ null ].concat( args, ['gl']) ));
    };

    Color$A.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
    };

    var unpack$s = utils.unpack;

    var rgb2hcg$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$s(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
            h = Number.NaN;
        } else {
            if (r === max) { h = (g - b) / delta; }
            if (g === max) { h = 2+(b - r) / delta; }
            if (b === max) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, c, _g];
    };

    var rgb2hcg_1 = rgb2hcg$1;

    var unpack$r = utils.unpack;
    var floor$3 = Math.floor;

    /*
     * this is basically just HSV with some minor tweaks
     *
     * hue.. [0..360]
     * chroma .. [0..1]
     * grayness .. [0..1]
     */

    var hcg2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$r(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r,g,b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
            r = g = b = _g;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;
            var i = floor$3(h);
            var f = h - i;
            var p = _g * (1 - c);
            var q = p + _c * (1 - f);
            var t = p + _c * f;
            var v = p + _c;
            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var hcg2rgb_1 = hcg2rgb;

    var unpack$q = utils.unpack;
    var type$j = utils.type;
    var chroma$g = chroma_1;
    var Color$z = Color_1;
    var input$c = input$h;

    var rgb2hcg = rgb2hcg_1;

    Color$z.prototype.hcg = function() {
        return rgb2hcg(this._rgb);
    };

    chroma$g.hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$z, [ null ].concat( args, ['hcg']) ));
    };

    input$c.format.hcg = hcg2rgb_1;

    input$c.autodetect.push({
        p: 1,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$q(args, 'hcg');
            if (type$j(args) === 'array' && args.length === 3) {
                return 'hcg';
            }
        }
    });

    var unpack$p = utils.unpack;
    var last = utils.last;
    var round$3 = Math.round;

    var rgb2hex$2 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$p(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
            mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
            case 'rgba': return ("#" + str + hxa);
            case 'argb': return ("#" + hxa + str);
            default: return ("#" + str);
        }
    };

    var rgb2hex_1 = rgb2hex$2;

    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

    var hex2rgb$1 = function (hex) {
        if (hex.match(RE_HEX)) {
            // remove optional leading #
            if (hex.length === 4 || hex.length === 7) {
                hex = hex.substr(1);
            }
            // expand short-notation to full six-digit
            if (hex.length === 3) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var u = parseInt(hex, 16);
            var r = u >> 16;
            var g = u >> 8 & 0xFF;
            var b = u & 0xFF;
            return [r,g,b,1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
            if (hex.length === 5 || hex.length === 9) {
                // remove optional leading #
                hex = hex.substr(1);
            }
            // expand short-notation to full eight-digit
            if (hex.length === 4) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
            }
            var u$1 = parseInt(hex, 16);
            var r$1 = u$1 >> 24 & 0xFF;
            var g$1 = u$1 >> 16 & 0xFF;
            var b$1 = u$1 >> 8 & 0xFF;
            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
            return [r$1,g$1,b$1,a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
    };

    var hex2rgb_1 = hex2rgb$1;

    var chroma$f = chroma_1;
    var Color$y = Color_1;
    var type$i = utils.type;
    var input$b = input$h;

    var rgb2hex$1 = rgb2hex_1;

    Color$y.prototype.hex = function(mode) {
        return rgb2hex$1(this._rgb, mode);
    };

    chroma$f.hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$y, [ null ].concat( args, ['hex']) ));
    };

    input$b.format.hex = hex2rgb_1;
    input$b.autodetect.push({
        p: 4,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$i(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
                return 'hex';
            }
        }
    });

    var unpack$o = utils.unpack;
    var TWOPI$2 = utils.TWOPI;
    var min$2 = Math.min;
    var sqrt$4 = Math.sqrt;
    var acos = Math.acos;

    var rgb2hsi$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min$2(r,g,b);
        var i = (r+g+b) / 3;
        var s = i > 0 ? 1 - min_/i : 0;
        if (s === 0) {
            h = NaN;
        } else {
            h = ((r-g)+(r-b)) / 2;
            h /= sqrt$4((r-g)*(r-g) + (r-b)*(g-b));
            h = acos(h);
            if (b > g) {
                h = TWOPI$2 - h;
            }
            h /= TWOPI$2;
        }
        return [h*360,s,i];
    };

    var rgb2hsi_1 = rgb2hsi$1;

    var unpack$n = utils.unpack;
    var limit = utils.limit;
    var TWOPI$1 = utils.TWOPI;
    var PITHIRD = utils.PITHIRD;
    var cos$4 = Math.cos;

    /*
     * hue [0..360]
     * saturation [0..1]
     * intensity [0..1]
     */
    var hsi2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$n(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r,g,b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1/3) {
            b = (1-s)/3;
            r = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
            g = 1 - (b+r);
        } else if (h < 2/3) {
            h -= 1/3;
            r = (1-s)/3;
            g = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
            b = 1 - (r+g);
        } else {
            h -= 2/3;
            g = (1-s)/3;
            b = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
            r = 1 - (g+b);
        }
        r = limit(i*r*3);
        g = limit(i*g*3);
        b = limit(i*b*3);
        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
    };

    var hsi2rgb_1 = hsi2rgb;

    var unpack$m = utils.unpack;
    var type$h = utils.type;
    var chroma$e = chroma_1;
    var Color$x = Color_1;
    var input$a = input$h;

    var rgb2hsi = rgb2hsi_1;

    Color$x.prototype.hsi = function() {
        return rgb2hsi(this._rgb);
    };

    chroma$e.hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$x, [ null ].concat( args, ['hsi']) ));
    };

    input$a.format.hsi = hsi2rgb_1;

    input$a.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$m(args, 'hsi');
            if (type$h(args) === 'array' && args.length === 3) {
                return 'hsi';
            }
        }
    });

    var unpack$l = utils.unpack;
    var type$g = utils.type;
    var chroma$d = chroma_1;
    var Color$w = Color_1;
    var input$9 = input$h;

    var rgb2hsl$1 = rgb2hsl_1;

    Color$w.prototype.hsl = function() {
        return rgb2hsl$1(this._rgb);
    };

    chroma$d.hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$w, [ null ].concat( args, ['hsl']) ));
    };

    input$9.format.hsl = hsl2rgb_1;

    input$9.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$l(args, 'hsl');
            if (type$g(args) === 'array' && args.length === 3) {
                return 'hsl';
            }
        }
    });

    var unpack$k = utils.unpack;
    var min$1 = Math.min;
    var max$1 = Math.max;

    /*
     * supported arguments:
     * - rgb2hsv(r,g,b)
     * - rgb2hsv([r,g,b])
     * - rgb2hsv({r,g,b})
     */
    var rgb2hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$k(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h,s,v;
        v = max_ / 255.0;
        if (max_ === 0) {
            h = Number.NaN;
            s = 0;
        } else {
            s = delta / max_;
            if (r === max_) { h = (g - b) / delta; }
            if (g === max_) { h = 2+(b - r) / delta; }
            if (b === max_) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, s, v]
    };

    var rgb2hsv$1 = rgb2hsl;

    var unpack$j = utils.unpack;
    var floor$2 = Math.floor;

    var hsv2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$j(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r,g,b;
        v *= 255;
        if (s === 0) {
            r = g = b = v;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;

            var i = floor$2(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r,g,b,args.length > 3?args[3]:1];
    };

    var hsv2rgb_1 = hsv2rgb;

    var unpack$i = utils.unpack;
    var type$f = utils.type;
    var chroma$c = chroma_1;
    var Color$v = Color_1;
    var input$8 = input$h;

    var rgb2hsv = rgb2hsv$1;

    Color$v.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
    };

    chroma$c.hsv = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$v, [ null ].concat( args, ['hsv']) ));
    };

    input$8.format.hsv = hsv2rgb_1;

    input$8.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$i(args, 'hsv');
            if (type$f(args) === 'array' && args.length === 3) {
                return 'hsv';
            }
        }
    });

    var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
    };

    var LAB_CONSTANTS$3 = labConstants;
    var unpack$h = utils.unpack;
    var pow$a = Math.pow;

    var rgb2lab$2 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$h(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r,g,b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
    };

    var rgb_xyz = function (r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow$a((r + 0.055) / 1.055, 2.4);
    };

    var xyz_lab = function (t) {
        if (t > LAB_CONSTANTS$3.t3) { return pow$a(t, 1 / 3); }
        return t / LAB_CONSTANTS$3.t2 + LAB_CONSTANTS$3.t0;
    };

    var rgb2xyz = function (r,g,b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS$3.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS$3.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS$3.Zn);
        return [x,y,z];
    };

    var rgb2lab_1 = rgb2lab$2;

    var LAB_CONSTANTS$2 = labConstants;
    var unpack$g = utils.unpack;
    var pow$9 = Math.pow;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var lab2rgb$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$g(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x,y,z, r,g,b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = LAB_CONSTANTS$2.Yn * lab_xyz(y);
        x = LAB_CONSTANTS$2.Xn * lab_xyz(x);
        z = LAB_CONSTANTS$2.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r,g,b_,args.length > 3 ? args[3] : 1];
    };

    var xyz_rgb = function (r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$9(r, 1 / 2.4) - 0.055)
    };

    var lab_xyz = function (t) {
        return t > LAB_CONSTANTS$2.t1 ? t * t * t : LAB_CONSTANTS$2.t2 * (t - LAB_CONSTANTS$2.t0)
    };

    var lab2rgb_1 = lab2rgb$1;

    var unpack$f = utils.unpack;
    var type$e = utils.type;
    var chroma$b = chroma_1;
    var Color$u = Color_1;
    var input$7 = input$h;

    var rgb2lab$1 = rgb2lab_1;

    Color$u.prototype.lab = function() {
        return rgb2lab$1(this._rgb);
    };

    chroma$b.lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$u, [ null ].concat( args, ['lab']) ));
    };

    input$7.format.lab = lab2rgb_1;

    input$7.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$f(args, 'lab');
            if (type$e(args) === 'array' && args.length === 3) {
                return 'lab';
            }
        }
    });

    var unpack$e = utils.unpack;
    var RAD2DEG = utils.RAD2DEG;
    var sqrt$3 = Math.sqrt;
    var atan2$2 = Math.atan2;
    var round$2 = Math.round;

    var lab2lch$2 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$e(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$3(a * a + b * b);
        var h = (atan2$2(b, a) * RAD2DEG + 360) % 360;
        if (round$2(c*10000) === 0) { h = Number.NaN; }
        return [l, c, h];
    };

    var lab2lch_1 = lab2lch$2;

    var unpack$d = utils.unpack;
    var rgb2lab = rgb2lab_1;
    var lab2lch$1 = lab2lch_1;

    var rgb2lch$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab(r,g,b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch$1(l,a,b_);
    };

    var rgb2lch_1 = rgb2lch$1;

    var unpack$c = utils.unpack;
    var DEG2RAD = utils.DEG2RAD;
    var sin$3 = Math.sin;
    var cos$3 = Math.cos;

    var lch2lab$2 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$c(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$3(h) * c, sin$3(h) * c]
    };

    var lch2lab_1 = lch2lab$2;

    var unpack$b = utils.unpack;
    var lch2lab$1 = lch2lab_1;
    var lab2rgb = lab2rgb_1;

    var lch2rgb$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$b(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab$1 (l,c,h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb (L,a,b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var lch2rgb_1 = lch2rgb$1;

    var unpack$a = utils.unpack;
    var lch2rgb = lch2rgb_1;

    var hcl2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hcl = unpack$a(args, 'hcl').reverse();
        return lch2rgb.apply(void 0, hcl);
    };

    var hcl2rgb_1 = hcl2rgb;

    var unpack$9 = utils.unpack;
    var type$d = utils.type;
    var chroma$a = chroma_1;
    var Color$t = Color_1;
    var input$6 = input$h;

    var rgb2lch = rgb2lch_1;

    Color$t.prototype.lch = function() { return rgb2lch(this._rgb); };
    Color$t.prototype.hcl = function() { return rgb2lch(this._rgb).reverse(); };

    chroma$a.lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$t, [ null ].concat( args, ['lch']) ));
    };
    chroma$a.hcl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$t, [ null ].concat( args, ['hcl']) ));
    };

    input$6.format.lch = lch2rgb_1;
    input$6.format.hcl = hcl2rgb_1;

    ['lch','hcl'].forEach(function (m) { return input$6.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$9(args, m);
            if (type$d(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    }); });

    /**
    	X11 color names

    	http://www.w3.org/TR/css3-color/#svg-color
    */

    var w3cx11$1 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

    var w3cx11_1 = w3cx11$1;

    var Color$s = Color_1;
    var input$5 = input$h;
    var type$c = utils.type;

    var w3cx11 = w3cx11_1;
    var hex2rgb = hex2rgb_1;
    var rgb2hex = rgb2hex_1;

    Color$s.prototype.name = function() {
        var hex = rgb2hex(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11); i < list.length; i += 1) {
            var n = list[i];

            if (w3cx11[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
    };

    input$5.format.named = function (name) {
        name = name.toLowerCase();
        if (w3cx11[name]) { return hex2rgb(w3cx11[name]); }
        throw new Error('unknown color name: '+name);
    };

    input$5.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$c(h) === 'string' && w3cx11[h.toLowerCase()]) {
                return 'named';
            }
        }
    });

    var unpack$8 = utils.unpack;

    var rgb2num$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$8(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
    };

    var rgb2num_1 = rgb2num$1;

    var type$b = utils.type;

    var num2rgb = function (num) {
        if (type$b(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
            var r = num >> 16;
            var g = (num >> 8) & 0xFF;
            var b = num & 0xFF;
            return [r,g,b,1];
        }
        throw new Error("unknown num color: "+num);
    };

    var num2rgb_1 = num2rgb;

    var chroma$9 = chroma_1;
    var Color$r = Color_1;
    var input$4 = input$h;
    var type$a = utils.type;

    var rgb2num = rgb2num_1;

    Color$r.prototype.num = function() {
        return rgb2num(this._rgb);
    };

    chroma$9.num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$r, [ null ].concat( args, ['num']) ));
    };

    input$4.format.num = num2rgb_1;

    input$4.autodetect.push({
        p: 5,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length === 1 && type$a(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                return 'num';
            }
        }
    });

    var chroma$8 = chroma_1;
    var Color$q = Color_1;
    var input$3 = input$h;
    var unpack$7 = utils.unpack;
    var type$9 = utils.type;
    var round$1 = Math.round;

    Color$q.prototype.rgb = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        if (rnd === false) { return this._rgb.slice(0,3); }
        return this._rgb.slice(0,3).map(round$1);
    };

    Color$q.prototype.rgba = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        return this._rgb.slice(0,4).map(function (v,i) {
            return i<3 ? (rnd === false ? v : round$1(v)) : v;
        });
    };

    chroma$8.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$q, [ null ].concat( args, ['rgb']) ));
    };

    input$3.format.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$7(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
    };

    input$3.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$7(args, 'rgba');
            if (type$9(args) === 'array' && (args.length === 3 ||
                args.length === 4 && type$9(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                return 'rgb';
            }
        }
    });

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     */

    var log$1 = Math.log;

    var temperature2rgb$1 = function (kelvin) {
        var temp = kelvin / 100;
        var r,g,b;
        if (temp < 66) {
            r = 255;
            g = temp < 6 ? 0 : -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log$1(g);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log$1(b);
        } else {
            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log$1(r);
            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log$1(g);
            b = 255;
        }
        return [r,g,b,1];
    };

    var temperature2rgb_1 = temperature2rgb$1;

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     **/

    var temperature2rgb = temperature2rgb_1;
    var unpack$6 = utils.unpack;
    var round = Math.round;

    var rgb2temperature$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$6(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            var rgb$1 = temperature2rgb(temp);
            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                maxTemp = temp;
            } else {
                minTemp = temp;
            }
        }
        return round(temp);
    };

    var rgb2temperature_1 = rgb2temperature$1;

    var chroma$7 = chroma_1;
    var Color$p = Color_1;
    var input$2 = input$h;

    var rgb2temperature = rgb2temperature_1;

    Color$p.prototype.temp =
    Color$p.prototype.kelvin =
    Color$p.prototype.temperature = function() {
        return rgb2temperature(this._rgb);
    };

    chroma$7.temp =
    chroma$7.kelvin =
    chroma$7.temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$p, [ null ].concat( args, ['temp']) ));
    };

    input$2.format.temp =
    input$2.format.kelvin =
    input$2.format.temperature = temperature2rgb_1;

    var unpack$5 = utils.unpack;
    var cbrt = Math.cbrt;
    var pow$8 = Math.pow;
    var sign$1 = Math.sign;

    var rgb2oklab$2 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        // OKLab color space implementation taken from
        // https://bottosson.github.io/posts/oklab/
        var ref = unpack$5(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = [rgb2lrgb(r / 255), rgb2lrgb(g / 255), rgb2lrgb(b / 255)];
        var lr = ref$1[0];
        var lg = ref$1[1];
        var lb = ref$1[2];
        var l = cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
        var m = cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
        var s = cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

        return [
            0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
        ];
    };

    var rgb2oklab_1 = rgb2oklab$2;

    function rgb2lrgb(c) {
        var abs = Math.abs(c);
        if (abs < 0.04045) {
            return c / 12.92;
        }
        return (sign$1(c) || 1) * pow$8((abs + 0.055) / 1.055, 2.4);
    }

    var unpack$4 = utils.unpack;
    var pow$7 = Math.pow;
    var sign = Math.sign;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var oklab2rgb$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$4(args, 'lab');
        var L = args[0];
        var a = args[1];
        var b = args[2];

        var l = pow$7(L + 0.3963377774 * a + 0.2158037573 * b, 3);
        var m = pow$7(L - 0.1055613458 * a - 0.0638541728 * b, 3);
        var s = pow$7(L - 0.0894841775 * a - 1.291485548 * b, 3);

        return [
            255 * lrgb2rgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
            255 * lrgb2rgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            255 * lrgb2rgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
            args.length > 3 ? args[3] : 1
        ];
    };

    var oklab2rgb_1 = oklab2rgb$1;

    function lrgb2rgb(c) {
        var abs = Math.abs(c);
        if (abs > 0.0031308) {
            return (sign(c) || 1) * (1.055 * pow$7(abs, 1 / 2.4) - 0.055);
        }
        return c * 12.92;
    }

    var unpack$3 = utils.unpack;
    var type$8 = utils.type;
    var chroma$6 = chroma_1;
    var Color$o = Color_1;
    var input$1 = input$h;

    var rgb2oklab$1 = rgb2oklab_1;

    Color$o.prototype.oklab = function () {
        return rgb2oklab$1(this._rgb);
    };

    chroma$6.oklab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$o, [ null ].concat( args, ['oklab']) ));
    };

    input$1.format.oklab = oklab2rgb_1;

    input$1.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$3(args, 'oklab');
            if (type$8(args) === 'array' && args.length === 3) {
                return 'oklab';
            }
        }
    });

    var unpack$2 = utils.unpack;
    var rgb2oklab = rgb2oklab_1;
    var lab2lch = lab2lch_1;

    var rgb2oklch$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$2(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2oklab(r, g, b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch(l, a, b_);
    };

    var rgb2oklch_1 = rgb2oklch$1;

    var unpack$1 = utils.unpack;
    var lch2lab = lch2lab_1;
    var oklab2rgb = oklab2rgb_1;

    var oklch2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$1(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab(l, c, h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = oklab2rgb(L, a, b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var oklch2rgb_1 = oklch2rgb;

    var unpack = utils.unpack;
    var type$7 = utils.type;
    var chroma$5 = chroma_1;
    var Color$n = Color_1;
    var input = input$h;

    var rgb2oklch = rgb2oklch_1;

    Color$n.prototype.oklch = function () {
        return rgb2oklch(this._rgb);
    };

    chroma$5.oklch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color$n, [ null ].concat( args, ['oklch']) ));
    };

    input.format.oklch = oklch2rgb_1;

    input.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack(args, 'oklch');
            if (type$7(args) === 'array' && args.length === 3) {
                return 'oklch';
            }
        }
    });

    var Color$m = Color_1;
    var type$6 = utils.type;

    Color$m.prototype.alpha = function(a, mutate) {
        if ( mutate === void 0 ) mutate=false;

        if (a !== undefined && type$6(a) === 'number') {
            if (mutate) {
                this._rgb[3] = a;
                return this;
            }
            return new Color$m([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
    };

    var Color$l = Color_1;

    Color$l.prototype.clipped = function() {
        return this._rgb._clipped || false;
    };

    var Color$k = Color_1;
    var LAB_CONSTANTS$1 = labConstants;

    Color$k.prototype.darken = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lab = me.lab();
    	lab[0] -= LAB_CONSTANTS$1.Kn * amount;
    	return new Color$k(lab, 'lab').alpha(me.alpha(), true);
    };

    Color$k.prototype.brighten = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.darken(-amount);
    };

    Color$k.prototype.darker = Color$k.prototype.darken;
    Color$k.prototype.brighter = Color$k.prototype.brighten;

    var Color$j = Color_1;

    Color$j.prototype.get = function (mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
            if (i > -1) { return src[i]; }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var Color$i = Color_1;
    var type$5 = utils.type;
    var pow$6 = Math.pow;

    var EPS = 1e-7;
    var MAX_ITER = 20;

    Color$i.prototype.luminance = function(lum) {
        if (lum !== undefined && type$5(lum) === 'number') {
            if (lum === 0) {
                // return pure black
                return new Color$i([0,0,0,this._rgb[3]], 'rgb');
            }
            if (lum === 1) {
                // return pure white
                return new Color$i([255,255,255,this._rgb[3]], 'rgb');
            }
            // compute new color using...
            var cur_lum = this.luminance();
            var mode = 'rgb';
            var max_iter = MAX_ITER;

            var test = function (low, high) {
                var mid = low.interpolate(high, 0.5, mode);
                var lm = mid.luminance();
                if (Math.abs(lum - lm) < EPS || !max_iter--) {
                    // close enough
                    return mid;
                }
                return lm > lum ? test(low, mid) : test(mid, high);
            };

            var rgb = (cur_lum > lum ? test(new Color$i([0,0,0]), this) : test(this, new Color$i([255,255,255]))).rgb();
            return new Color$i(rgb.concat( [this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
    };


    var rgb2luminance = function (r,g,b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    var luminance_x = function (x) {
        x /= 255;
        return x <= 0.03928 ? x/12.92 : pow$6((x+0.055)/1.055, 2.4);
    };

    var interpolator$1 = {};

    var Color$h = Color_1;
    var type$4 = utils.type;
    var interpolator = interpolator$1;

    var mix$1 = function (col1, col2, f) {
        if ( f === void 0 ) f=0.5;
        var rest = [], len = arguments.length - 3;
        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
            // fall back to the first supported mode
            mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
            throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$4(col1) !== 'object') { col1 = new Color$h(col1); }
        if (type$4(col2) !== 'object') { col2 = new Color$h(col2); }
        return interpolator[mode](col1, col2, f)
            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    };

    var Color$g = Color_1;
    var mix = mix$1;

    Color$g.prototype.mix =
    Color$g.prototype.interpolate = function(col2, f) {
    	if ( f === void 0 ) f=0.5;
    	var rest = [], len = arguments.length - 2;
    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
    };

    var Color$f = Color_1;

    Color$f.prototype.premultiply = function(mutate) {
    	if ( mutate === void 0 ) mutate=false;

    	var rgb = this._rgb;
    	var a = rgb[3];
    	if (mutate) {
    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
    		return this;
    	} else {
    		return new Color$f([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
    	}
    };

    var Color$e = Color_1;
    var LAB_CONSTANTS = labConstants;

    Color$e.prototype.saturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lch = me.lch();
    	lch[1] += LAB_CONSTANTS.Kn * amount;
    	if (lch[1] < 0) { lch[1] = 0; }
    	return new Color$e(lch, 'lch').alpha(me.alpha(), true);
    };

    Color$e.prototype.desaturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.saturate(-amount);
    };

    var Color$d = Color_1;
    var type$3 = utils.type;

    Color$d.prototype.set = function (mc, value, mutate) {
        if ( mutate === void 0 ) mutate = false;

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
            if (i > -1) {
                if (type$3(value) == 'string') {
                    switch (value.charAt(0)) {
                        case '+':
                            src[i] += +value;
                            break;
                        case '-':
                            src[i] += +value;
                            break;
                        case '*':
                            src[i] *= +value.substr(1);
                            break;
                        case '/':
                            src[i] /= +value.substr(1);
                            break;
                        default:
                            src[i] = +value;
                    }
                } else if (type$3(value) === 'number') {
                    src[i] = value;
                } else {
                    throw new Error("unsupported value for Color.set");
                }
                var out = new Color$d(src, mode);
                if (mutate) {
                    this._rgb = out._rgb;
                    return this;
                }
                return out;
            }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var Color$c = Color_1;

    var rgb = function (col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color$c(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'rgb'
        )
    };

    // register interpolator
    interpolator$1.rgb = rgb;

    var Color$b = Color_1;
    var sqrt$2 = Math.sqrt;
    var pow$5 = Math.pow;

    var lrgb = function (col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color$b(
            sqrt$2(pow$5(x1,2) * (1-f) + pow$5(x2,2) * f),
            sqrt$2(pow$5(y1,2) * (1-f) + pow$5(y2,2) * f),
            sqrt$2(pow$5(z1,2) * (1-f) + pow$5(z2,2) * f),
            'rgb'
        )
    };

    // register interpolator
    interpolator$1.lrgb = lrgb;

    var Color$a = Color_1;

    var lab = function (col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color$a(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'lab'
        )
    };

    // register interpolator
    interpolator$1.lab = lab;

    var Color$9 = Color_1;

    var _hsx = function (col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
            xyz0 = col1.hsl();
            xyz1 = col2.hsl();
        } else if (m === 'hsv') {
            xyz0 = col1.hsv();
            xyz1 = col2.hsv();
        } else if (m === 'hcg') {
            xyz0 = col1.hcg();
            xyz1 = col2.hcg();
        } else if (m === 'hsi') {
            xyz0 = col1.hsi();
            xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
            m = 'hcl';
            xyz0 = col1.hcl();
            xyz1 = col2.hcl();
        } else if (m === 'oklch') {
            xyz0 = col1.oklch().reverse();
            xyz1 = col2.oklch().reverse();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h' || m === 'oklch') {
            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
            // both colors have hue
            if (hue1 > hue0 && hue1 - hue0 > 180) {
                dh = hue1 - (hue0 + 360);
            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                dh = hue1 + 360 - hue0;
            } else {
                dh = hue1 - hue0;
            }
            hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
            hue = hue0;
            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
            hue = hue1;
            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
            hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1 - lbv0);
        return m === 'oklch' ? new Color$9([lbv, sat, hue], m) : new Color$9([hue, sat, lbv], m);
    };

    var interpolate_hsx$5 = _hsx;

    var lch = function (col1, col2, f) {
    	return interpolate_hsx$5(col1, col2, f, 'lch');
    };

    // register interpolator
    interpolator$1.lch = lch;
    interpolator$1.hcl = lch;

    var Color$8 = Color_1;

    var num = function (col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color$8(c1 + f * (c2-c1), 'num')
    };

    // register interpolator
    interpolator$1.num = num;

    var interpolate_hsx$4 = _hsx;

    var hcg = function (col1, col2, f) {
    	return interpolate_hsx$4(col1, col2, f, 'hcg');
    };

    // register interpolator
    interpolator$1.hcg = hcg;

    var interpolate_hsx$3 = _hsx;

    var hsi = function (col1, col2, f) {
    	return interpolate_hsx$3(col1, col2, f, 'hsi');
    };

    // register interpolator
    interpolator$1.hsi = hsi;

    var interpolate_hsx$2 = _hsx;

    var hsl = function (col1, col2, f) {
    	return interpolate_hsx$2(col1, col2, f, 'hsl');
    };

    // register interpolator
    interpolator$1.hsl = hsl;

    var interpolate_hsx$1 = _hsx;

    var hsv = function (col1, col2, f) {
    	return interpolate_hsx$1(col1, col2, f, 'hsv');
    };

    // register interpolator
    interpolator$1.hsv = hsv;

    var Color$7 = Color_1;

    var oklab = function (col1, col2, f) {
        var xyz0 = col1.oklab();
        var xyz1 = col2.oklab();
        return new Color$7(
            xyz0[0] + f * (xyz1[0] - xyz0[0]),
            xyz0[1] + f * (xyz1[1] - xyz0[1]),
            xyz0[2] + f * (xyz1[2] - xyz0[2]),
            'oklab'
        );
    };

    // register interpolator
    interpolator$1.oklab = oklab;

    var interpolate_hsx = _hsx;

    var oklch = function (col1, col2, f) {
        return interpolate_hsx(col1, col2, f, 'oklch');
    };

    // register interpolator
    interpolator$1.oklch = oklch;

    var Color$6 = Color_1;
    var clip_rgb$1 = utils.clip_rgb;
    var pow$4 = Math.pow;
    var sqrt$1 = Math.sqrt;
    var PI$1 = Math.PI;
    var cos$2 = Math.cos;
    var sin$2 = Math.sin;
    var atan2$1 = Math.atan2;

    var average = function (colors, mode, weights) {
        if ( mode === void 0 ) mode='lrgb';
        if ( weights === void 0 ) weights=null;

        var l = colors.length;
        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
        // normalize weights
        var k = l / weights.reduce(function(a, b) { return a + b; });
        weights.forEach(function (w,i) { weights[i] *= k; });
        // convert colors to Color objects
        colors = colors.map(function (c) { return new Color$6(c); });
        if (mode === 'lrgb') {
            return _average_lrgb(colors, weights)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i=0; i<xyz.length; i++) {
            xyz[i] = (xyz[i] || 0) * weights[0];
            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                var A = xyz[i] / 180 * PI$1;
                dx += cos$2(A) * weights[0];
                dy += sin$2(A) * weights[0];
            }
        }

        var alpha = first.alpha() * weights[0];
        colors.forEach(function (c,ci) {
            var xyz2 = c.get(mode);
            alpha += c.alpha() * weights[ci+1];
            for (var i=0; i<xyz.length; i++) {
                if (!isNaN(xyz2[i])) {
                    cnt[i] += weights[ci+1];
                    if (mode.charAt(i) === 'h') {
                        var A = xyz2[i] / 180 * PI$1;
                        dx += cos$2(A) * weights[ci+1];
                        dy += sin$2(A) * weights[ci+1];
                    } else {
                        xyz[i] += xyz2[i] * weights[ci+1];
                    }
                }
            }
        });

        for (var i$1=0; i$1<xyz.length; i$1++) {
            if (mode.charAt(i$1) === 'h') {
                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                while (A$1 < 0) { A$1 += 360; }
                while (A$1 >= 360) { A$1 -= 360; }
                xyz[i$1] = A$1;
            } else {
                xyz[i$1] = xyz[i$1]/cnt[i$1];
            }
        }
        alpha /= l;
        return (new Color$6(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
    };


    var _average_lrgb = function (colors, weights) {
        var l = colors.length;
        var xyz = [0,0,0,0];
        for (var i=0; i < colors.length; i++) {
            var col = colors[i];
            var f = weights[i] / l;
            var rgb = col._rgb;
            xyz[0] += pow$4(rgb[0],2) * f;
            xyz[1] += pow$4(rgb[1],2) * f;
            xyz[2] += pow$4(rgb[2],2) * f;
            xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$1(xyz[0]);
        xyz[1] = sqrt$1(xyz[1]);
        xyz[2] = sqrt$1(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color$6(clip_rgb$1(xyz));
    };

    // minimal multi-purpose interface

    // @requires utils color analyze

    var chroma$4 = chroma_1;
    var type$2 = utils.type;

    var pow$3 = Math.pow;

    var scale$2 = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma$4('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0,0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
            colors = colors || ['#fff', '#000'];
            if (colors && type$2(colors) === 'string' && chroma$4.brewer &&
                chroma$4.brewer[colors.toLowerCase()]) {
                colors = chroma$4.brewer[colors.toLowerCase()];
            }
            if (type$2(colors) === 'array') {
                // handle single color
                if (colors.length === 1) {
                    colors = [colors[0], colors[0]];
                }
                // make a copy of the colors
                colors = colors.slice(0);
                // convert to chroma classes
                for (var c=0; c<colors.length; c++) {
                    colors[c] = chroma$4(colors[c]);
                }
                // auto-fill color position
                _pos.length = 0;
                for (var c$1=0; c$1<colors.length; c$1++) {
                    _pos.push(c$1/(colors.length-1));
                }
            }
            resetCache();
            return _colors = colors;
        };

        var getClass = function(value) {
            if (_classes != null) {
                var n = _classes.length-1;
                var i = 0;
                while (i < n && value >= _classes[i]) {
                    i++;
                }
                return i-1;
            }
            return 0;
        };

        var tMapLightness = function (t) { return t; };
        var tMapDomain = function (t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
            var col, t;
            if (bypassMap == null) { bypassMap = false; }
            if (isNaN(val) || (val === null)) { return _nacol; }
            if (!bypassMap) {
                if (_classes && (_classes.length > 2)) {
                    // find the class
                    var c = getClass(val);
                    t = c / (_classes.length-2);
                } else if (_max !== _min) {
                    // just interpolate between min/max
                    t = (val - _min) / (_max - _min);
                } else {
                    t = 1;
                }
            } else {
                t = val;
            }

            // domain map
            t = tMapDomain(t);

            if (!bypassMap) {
                t = tMapLightness(t);  // lightness correction
            }

            if (_gamma !== 1) { t = pow$3(t, _gamma); }

            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

            t = Math.min(1, Math.max(0, t));

            var k = Math.floor(t * 10000);

            if (_useCache && _colorCache[k]) {
                col = _colorCache[k];
            } else {
                if (type$2(_colors) === 'array') {
                    //for i in [0.._pos.length-1]
                    for (var i=0; i<_pos.length; i++) {
                        var p = _pos[i];
                        if (t <= p) {
                            col = _colors[i];
                            break;
                        }
                        if ((t >= p) && (i === (_pos.length-1))) {
                            col = _colors[i];
                            break;
                        }
                        if (t > p && t < _pos[i+1]) {
                            t = (t-p)/(_pos[i+1]-p);
                            col = chroma$4.interpolate(_colors[i], _colors[i+1], t, _mode);
                            break;
                        }
                    }
                } else if (type$2(_colors) === 'function') {
                    col = _colors(t);
                }
                if (_useCache) { _colorCache[k] = col; }
            }
            return col;
        };

        var resetCache = function () { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
            var c = chroma$4(getColor(v));
            if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
            if (classes != null) {
                if (type$2(classes) === 'array') {
                    _classes = classes;
                    _domain = [classes[0], classes[classes.length-1]];
                } else {
                    var d = chroma$4.analyze(_domain);
                    if (classes === 0) {
                        _classes = [d.min, d.max];
                    } else {
                        _classes = chroma$4.limits(d, 'e', classes);
                    }
                }
                return f;
            }
            return _classes;
        };


        f.domain = function(domain) {
            if (!arguments.length) {
                return _domain;
            }
            _min = domain[0];
            _max = domain[domain.length-1];
            _pos = [];
            var k = _colors.length;
            if ((domain.length === k) && (_min !== _max)) {
                // update positions
                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                    var d = list[i];

                  _pos.push((d-_min) / (_max-_min));
                }
            } else {
                for (var c=0; c<k; c++) {
                    _pos.push(c/(k-1));
                }
                if (domain.length > 2) {
                    // set domain map
                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
                        tMapDomain = function (t) {
                            if (t <= 0 || t >= 1) { return t; }
                            var i = 0;
                            while (t >= tBreaks[i+1]) { i++; }
                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
                            return out;
                        };
                    }

                }
            }
            _domain = [_min, _max];
            return f;
        };

        f.mode = function(_m) {
            if (!arguments.length) {
                return _mode;
            }
            _mode = _m;
            resetCache();
            return f;
        };

        f.range = function(colors, _pos) {
            setColors(colors);
            return f;
        };

        f.out = function(_o) {
            _out = _o;
            return f;
        };

        f.spread = function(val) {
            if (!arguments.length) {
                return _spread;
            }
            _spread = val;
            return f;
        };

        f.correctLightness = function(v) {
            if (v == null) { v = true; }
            _correctLightness = v;
            resetCache();
            if (_correctLightness) {
                tMapLightness = function(t) {
                    var L0 = getColor(0, true).lab()[0];
                    var L1 = getColor(1, true).lab()[0];
                    var pol = L0 > L1;
                    var L_actual = getColor(t, true).lab()[0];
                    var L_ideal = L0 + ((L1 - L0) * t);
                    var L_diff = L_actual - L_ideal;
                    var t0 = 0;
                    var t1 = 1;
                    var max_iter = 20;
                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                        (function() {
                            if (pol) { L_diff *= -1; }
                            if (L_diff < 0) {
                                t0 = t;
                                t += (t1 - t) * 0.5;
                            } else {
                                t1 = t;
                                t += (t0 - t) * 0.5;
                            }
                            L_actual = getColor(t, true).lab()[0];
                            return L_diff = L_actual - L_ideal;
                        })();
                    }
                    return t;
                };
            } else {
                tMapLightness = function (t) { return t; };
            }
            return f;
        };

        f.padding = function(p) {
            if (p != null) {
                if (type$2(p) === 'number') {
                    p = [p,p];
                }
                _padding = p;
                return f;
            } else {
                return _padding;
            }
        };

        f.colors = function(numColors, out) {
            // If no arguments are given, return the original colors that were provided
            if (arguments.length < 2) { out = 'hex'; }
            var result = [];

            if (arguments.length === 0) {
                result = _colors.slice(0);

            } else if (numColors === 1) {
                result = [f(0.5)];

            } else if (numColors > 1) {
                var dm = _domain[0];
                var dd = _domain[1] - dm;
                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

            } else { // returns all colors based on the defined classes
                colors = [];
                var samples = [];
                if (_classes && (_classes.length > 2)) {
                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        samples.push((_classes[i-1]+_classes[i])*0.5);
                    }
                } else {
                    samples = _domain;
                }
                result = samples.map(function (v) { return f(v); });
            }

            if (chroma$4[out]) {
                result = result.map(function (c) { return c[out](); });
            }
            return result;
        };

        f.cache = function(c) {
            if (c != null) {
                _useCache = c;
                return f;
            } else {
                return _useCache;
            }
        };

        f.gamma = function(g) {
            if (g != null) {
                _gamma = g;
                return f;
            } else {
                return _gamma;
            }
        };

        f.nodata = function(d) {
            if (d != null) {
                _nacol = chroma$4(d);
                return f;
            } else {
                return _nacol;
            }
        };

        return f;
    };

    function __range__(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }

    //
    // interpolates between a set of colors uzing a bezier spline
    //

    // @requires utils lab
    var Color$5 = Color_1;

    var scale$1 = scale$2;

    // nth row of the pascal triangle
    var binom_row = function(n) {
        var row = [1, 1];
        for (var i = 1; i < n; i++) {
            var newrow = [1];
            for (var j = 1; j <= row.length; j++) {
                newrow[j] = (row[j] || 0) + row[j - 1];
            }
            row = newrow;
        }
        return row;
    };

    var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function (c) { return new Color$5(c); });
        if (colors.length === 2) {
            // linear interpolation
            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                return new Color$5(lab, 'lab');
            };
        } else if (colors.length === 3) {
            // quadratic bezier interpolation
            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                return new Color$5(lab, 'lab');
            };
        } else if (colors.length === 4) {
            // cubic bezier interpolation
            var lab3;
            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                return new Color$5(lab, 'lab');
            };
        } else if (colors.length >= 5) {
            // general case (degree n bezier)
            var labs, row, n;
            labs = colors.map(function (c) { return c.lab(); });
            n = colors.length - 1;
            row = binom_row(n);
            I = function (t) {
                var u = 1 - t;
                var lab = ([0, 1, 2].map(function (i) { return labs.reduce(function (sum, el, j) { return (sum + row[j] * Math.pow( u, (n - j) ) * Math.pow( t, j ) * el[i]); }, 0); }));
                return new Color$5(lab, 'lab');
            };
        } else {
            throw new RangeError("No point in running bezier with only one color.")
        }
        return I;
    };

    var bezier_1 = function (colors) {
        var f = bezier(colors);
        f.scale = function () { return scale$1(f); };
        return f;
    };

    /*
     * interpolates between a set of colors uzing a bezier spline
     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
     */

    var chroma$3 = chroma_1;

    var blend = function (bottom, top, mode) {
        if (!blend[mode]) {
            throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
    };

    var blend_f = function (f) { return function (bottom,top) {
            var c0 = chroma$3(top).rgb();
            var c1 = chroma$3(bottom).rgb();
            return chroma$3.rgb(f(c0, c1));
        }; };

    var each = function (f) { return function (c0, c1) {
            var out = [];
            out[0] = f(c0[0], c1[0]);
            out[1] = f(c0[1], c1[1]);
            out[2] = f(c0[2], c1[2]);
            return out;
        }; };

    var normal = function (a) { return a; };
    var multiply = function (a,b) { return a * b / 255; };
    var darken = function (a,b) { return a > b ? b : a; };
    var lighten = function (a,b) { return a > b ? a : b; };
    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
    var dodge = function (a,b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
    };

    // # add = (a,b) ->
    // #     if (a + b > 255) then 255 else a + b

    blend.normal = blend_f(each(normal));
    blend.multiply = blend_f(each(multiply));
    blend.screen = blend_f(each(screen));
    blend.overlay = blend_f(each(overlay));
    blend.darken = blend_f(each(darken));
    blend.lighten = blend_f(each(lighten));
    blend.dodge = blend_f(each(dodge));
    blend.burn = blend_f(each(burn));
    // blend.add = blend_f(each(add));

    var blend_1 = blend;

    // cubehelix interpolation
    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
    // http://astron-soc.in/bulletin/11June/289392011.pdf

    var type$1 = utils.type;
    var clip_rgb = utils.clip_rgb;
    var TWOPI = utils.TWOPI;
    var pow$2 = Math.pow;
    var sin$1 = Math.sin;
    var cos$1 = Math.cos;
    var chroma$2 = chroma_1;

    var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if ( start === void 0 ) start=300;
        if ( rotations === void 0 ) rotations=-1.5;
        if ( hue === void 0 ) hue=1;
        if ( gamma === void 0 ) gamma=1;
        if ( lightness === void 0 ) lightness=[0,1];

        var dh = 0, dl;
        if (type$1(lightness) === 'array') {
            dl = lightness[1] - lightness[0];
        } else {
            dl = 0;
            lightness = [lightness, lightness];
        }

        var f = function(fract) {
            var a = TWOPI * (((start+120)/360) + (rotations * fract));
            var l = pow$2(lightness[0] + (dl * fract), gamma);
            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
            var amp = (h * l * (1-l)) / 2;
            var cos_a = cos$1(a);
            var sin_a = sin$1(a);
            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
            var b = l + (amp * (+1.97294 * cos_a));
            return chroma$2(clip_rgb([r*255,g*255,b*255,1]));
        };

        f.start = function(s) {
            if ((s == null)) { return start; }
            start = s;
            return f;
        };

        f.rotations = function(r) {
            if ((r == null)) { return rotations; }
            rotations = r;
            return f;
        };

        f.gamma = function(g) {
            if ((g == null)) { return gamma; }
            gamma = g;
            return f;
        };

        f.hue = function(h) {
            if ((h == null)) { return hue; }
            hue = h;
            if (type$1(hue) === 'array') {
                dh = hue[1] - hue[0];
                if (dh === 0) { hue = hue[1]; }
            } else {
                dh = 0;
            }
            return f;
        };

        f.lightness = function(h) {
            if ((h == null)) { return lightness; }
            if (type$1(h) === 'array') {
                lightness = h;
                dl = h[1] - h[0];
            } else {
                lightness = [h,h];
                dl = 0;
            }
            return f;
        };

        f.scale = function () { return chroma$2.scale(f); };

        f.hue(hue);

        return f;
    };

    var Color$4 = Color_1;
    var digits = '0123456789abcdef';

    var floor$1 = Math.floor;
    var random = Math.random;

    var random_1 = function () {
        var code = '#';
        for (var i=0; i<6; i++) {
            code += digits.charAt(floor$1(random() * 16));
        }
        return new Color$4(code, 'hex');
    };

    var type = type$p;
    var log = Math.log;
    var pow$1 = Math.pow;
    var floor = Math.floor;
    var abs$1 = Math.abs;


    var analyze = function (data, key) {
        if ( key === void 0 ) key=null;

        var r = {
            min: Number.MAX_VALUE,
            max: Number.MAX_VALUE*-1,
            sum: 0,
            values: [],
            count: 0
        };
        if (type(data) === 'object') {
            data = Object.values(data);
        }
        data.forEach(function (val) {
            if (key && type(val) === 'object') { val = val[key]; }
            if (val !== undefined && val !== null && !isNaN(val)) {
                r.values.push(val);
                r.sum += val;
                if (val < r.min) { r.min = val; }
                if (val > r.max) { r.max = val; }
                r.count += 1;
            }
        });

        r.domain = [r.min, r.max];

        r.limits = function (mode, num) { return limits(r, mode, num); };

        return r;
    };


    var limits = function (data, mode, num) {
        if ( mode === void 0 ) mode='equal';
        if ( num === void 0 ) num=7;

        if (type(data) == 'array') {
            data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function (a,b) { return a-b; });

        if (num === 1) { return [min,max]; }

        var limits = [];

        if (mode.substr(0,1) === 'c') { // continuous
            limits.push(min);
            limits.push(max);
        }

        if (mode.substr(0,1) === 'e') { // equal interval
            limits.push(min);
            for (var i=1; i<num; i++) {
                limits.push(min+((i/num)*(max-min)));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'l') { // log scale
            if (min <= 0) {
                throw new Error('Logarithmic scales are only possible for values > 0');
            }
            var min_log = Math.LOG10E * log(min);
            var max_log = Math.LOG10E * log(max);
            limits.push(min);
            for (var i$1=1; i$1<num; i$1++) {
                limits.push(pow$1(10, min_log + ((i$1/num) * (max_log - min_log))));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'q') { // quantile scale
            limits.push(min);
            for (var i$2=1; i$2<num; i$2++) {
                var p = ((values.length-1) * i$2)/num;
                var pb = floor(p);
                if (pb === p) {
                    limits.push(values[pb]);
                } else { // p > pb
                    var pr = p - pb;
                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                }
            }
            limits.push(max);

        }

        else if (mode.substr(0,1) === 'k') { // k-means clustering
            /*
            implementation based on
            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
            simplified for 1-d input values
            */
            var cluster;
            var n = values.length;
            var assignments = new Array(n);
            var clusterSizes = new Array(num);
            var repeat = true;
            var nb_iters = 0;
            var centroids = null;

            // get seed values
            centroids = [];
            centroids.push(min);
            for (var i$3=1; i$3<num; i$3++) {
                centroids.push(min + ((i$3/num) * (max-min)));
            }
            centroids.push(max);

            while (repeat) {
                // assignment step
                for (var j=0; j<num; j++) {
                    clusterSizes[j] = 0;
                }
                for (var i$4=0; i$4<n; i$4++) {
                    var value = values[i$4];
                    var mindist = Number.MAX_VALUE;
                    var best = (void 0);
                    for (var j$1=0; j$1<num; j$1++) {
                        var dist = abs$1(centroids[j$1]-value);
                        if (dist < mindist) {
                            mindist = dist;
                            best = j$1;
                        }
                        clusterSizes[best]++;
                        assignments[i$4] = best;
                    }
                }

                // update centroids step
                var newCentroids = new Array(num);
                for (var j$2=0; j$2<num; j$2++) {
                    newCentroids[j$2] = null;
                }
                for (var i$5=0; i$5<n; i$5++) {
                    cluster = assignments[i$5];
                    if (newCentroids[cluster] === null) {
                        newCentroids[cluster] = values[i$5];
                    } else {
                        newCentroids[cluster] += values[i$5];
                    }
                }
                for (var j$3=0; j$3<num; j$3++) {
                    newCentroids[j$3] *= 1/clusterSizes[j$3];
                }

                // check convergence
                repeat = false;
                for (var j$4=0; j$4<num; j$4++) {
                    if (newCentroids[j$4] !== centroids[j$4]) {
                        repeat = true;
                        break;
                    }
                }

                centroids = newCentroids;
                nb_iters++;

                if (nb_iters > 200) {
                    repeat = false;
                }
            }

            // finished k-means clustering
            // the next part is borrowed from gabrielflor.it
            var kClusters = {};
            for (var j$5=0; j$5<num; j$5++) {
                kClusters[j$5] = [];
            }
            for (var i$6=0; i$6<n; i$6++) {
                cluster = assignments[i$6];
                kClusters[cluster].push(values[i$6]);
            }
            var tmpKMeansBreaks = [];
            for (var j$6=0; j$6<num; j$6++) {
                tmpKMeansBreaks.push(kClusters[j$6][0]);
                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
            }
            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
            limits.push(tmpKMeansBreaks[0]);
            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                var v = tmpKMeansBreaks[i$7];
                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                    limits.push(v);
                }
            }
        }
        return limits;
    };

    var analyze_1 = {analyze: analyze, limits: limits};

    var Color$3 = Color_1;


    var contrast = function (a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color$3(a);
        b = new Color$3(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    };

    var Color$2 = Color_1;
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    var min = Math.min;
    var max = Math.max;
    var atan2 = Math.atan2;
    var abs = Math.abs;
    var cos = Math.cos;
    var sin = Math.sin;
    var exp = Math.exp;
    var PI = Math.PI;

    var deltaE = function(a, b, Kl, Kc, Kh) {
        if ( Kl === void 0 ) Kl=1;
        if ( Kc === void 0 ) Kc=1;
        if ( Kh === void 0 ) Kh=1;

        // Delta E (CIE 2000)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
        var rad2deg = function(rad) {
            return 360 * rad / (2 * PI);
        };
        var deg2rad = function(deg) {
            return (2 * PI * deg) / 360;
        };
        a = new Color$2(a);
        b = new Color$2(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var avgL = (L1 + L2)/2;
        var C1 = sqrt(pow(a1, 2) + pow(b1, 2));
        var C2 = sqrt(pow(a2, 2) + pow(b2, 2));
        var avgC = (C1 + C2)/2;
        var G = 0.5*(1-sqrt(pow(avgC, 7)/(pow(avgC, 7) + pow(25, 7))));
        var a1p = a1*(1+G);
        var a2p = a2*(1+G);
        var C1p = sqrt(pow(a1p, 2) + pow(b1, 2));
        var C2p = sqrt(pow(a2p, 2) + pow(b2, 2));
        var avgCp = (C1p + C2p)/2;
        var arctan1 = rad2deg(atan2(b1, a1p));
        var arctan2 = rad2deg(atan2(b2, a2p));
        var h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360;
        var h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360;
        var avgHp = abs(h1p - h2p) > 180 ? (h1p + h2p + 360)/2 : (h1p + h2p)/2;
        var T = 1 - 0.17*cos(deg2rad(avgHp - 30)) + 0.24*cos(deg2rad(2*avgHp)) + 0.32*cos(deg2rad(3*avgHp + 6)) - 0.2*cos(deg2rad(4*avgHp - 63));
        var deltaHp = h2p - h1p;
        deltaHp = abs(deltaHp) <= 180 ? deltaHp : h2p <= h1p ? deltaHp + 360 : deltaHp - 360;
        deltaHp = 2*sqrt(C1p*C2p)*sin(deg2rad(deltaHp)/2);
        var deltaL = L2 - L1;
        var deltaCp = C2p - C1p;    
        var sl = 1 + (0.015*pow(avgL - 50, 2))/sqrt(20 + pow(avgL - 50, 2));
        var sc = 1 + 0.045*avgCp;
        var sh = 1 + 0.015*avgCp*T;
        var deltaTheta = 30*exp(-pow((avgHp - 275)/25, 2));
        var Rc = 2*sqrt(pow(avgCp, 7)/(pow(avgCp, 7) + pow(25, 7)));
        var Rt = -Rc*sin(2*deg2rad(deltaTheta));
        var result = sqrt(pow(deltaL/(Kl*sl), 2) + pow(deltaCp/(Kc*sc), 2) + pow(deltaHp/(Kh*sh), 2) + Rt*(deltaCp/(Kc*sc))*(deltaHp/(Kh*sh)));
        return max(0, min(100, result));
    };

    var Color$1 = Color_1;

    // simple Euclidean distance
    var distance = function(a, b, mode) {
        if ( mode === void 0 ) mode='lab';

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color$1(a);
        b = new Color$1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
            var d = (l1[i] || 0) - (l2[i] || 0);
            sum_sq += d*d;
        }
        return Math.sqrt(sum_sq);
    };

    var Color = Color_1;

    var valid = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        try {
            new (Function.prototype.bind.apply( Color, [ null ].concat( args) ));
            return true;
        } catch (e) {
            return false;
        }
    };

    // some pre-defined color scales:
    var chroma$1 = chroma_1;

    var scale = scale$2;

    var scales = {
    	cool: function cool() { return scale([chroma$1.hsl(180,1,.9), chroma$1.hsl(250,.7,.4)]) },
    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
    };

    /**
        ColorBrewer colors for chroma.js

        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
        Pennsylvania State University.

        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software distributed
        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
        CONDITIONS OF ANY KIND, either express or implied. See the License for the
        specific language governing permissions and limitations under the License.
    */

    var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    // add lowercase aliases for case-insensitive matches
    for (var i = 0, list = Object.keys(colorbrewer); i < list.length; i += 1) {
        var key = list[i];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
    }

    var colorbrewer_1 = colorbrewer;

    var chroma = chroma_1;

    // feel free to comment out anything to rollup
    // a smaller chroma.js built

    // io --> convert colors

















    // operators --> modify existing Colors










    // interpolators












    // generators -- > create new colors
    chroma.average = average;
    chroma.bezier = bezier_1;
    chroma.blend = blend_1;
    chroma.cubehelix = cubehelix;
    chroma.mix = chroma.interpolate = mix$1;
    chroma.random = random_1;
    chroma.scale = scale$2;

    // other utility methods
    chroma.analyze = analyze_1.analyze;
    chroma.contrast = contrast;
    chroma.deltaE = deltaE;
    chroma.distance = distance;
    chroma.limits = analyze_1.limits;
    chroma.valid = valid;

    // scale
    chroma.scales = scales;

    // colors
    chroma.colors = w3cx11_1;
    chroma.brewer = colorbrewer_1;

    var chroma_js = chroma;

    return chroma_js;

}));
}(chroma$2));

var chroma$1 = chroma$2.exports;const DEFAULT_ALLOWED = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';
function clean(s, alsoAllow = '') {
  return purifyHTML(s, DEFAULT_ALLOWED + alsoAllow);
}
function isTransparentColor(color) {
  return color === 'transparent' || !chroma$1(color).alpha();
}
const FLAG_BOOL_FALSE = new Set(['0', 'false', 'null']);

function parseFlags(getValue, flagTypes) {
  return Object.fromEntries(Object.entries(flagTypes).map(([key, type]) => {
    const val = getValue(key);

    if (type === Boolean) {
      return [key, !!val && !FLAG_BOOL_FALSE.has(val)];
    }

    return [key, val && type(val)];
  }));
}
function parseFlagsFromURL(searchString, flagTypes) {
  const urlParams = new URLSearchParams(searchString);
  return parseFlags(key => urlParams.get(key), flagTypes);
}/* lib/Block.svelte generated by Svelte v3.23.2 */
const Block = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    block
  } = $$props;
  if ($$props.block === void 0 && $$bindings.block && block !== void 0) $$bindings.block(block);
  return `${block.prepend ? `<span class="${"prepend"}">${clean(block.prepend)}</span>` : ``}
<span class="${"block-inner"}">${validate_component(block.component || missing_component, "svelte:component").$$render($$result, {
    props: block.props
  }, {}, {})}</span>
${block.append ? `<span class="${"append"}">${clean(block.append)}</span>` : ``}`;
});/* lib/BlocksRegion.svelte generated by Svelte v3.23.2 */
const BlocksRegion = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    id
  } = $$props;
  let {
    name
  } = $$props;
  let {
    blocks
  } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.blocks === void 0 && $$bindings.blocks && blocks !== void 0) $$bindings.blocks(blocks);
  return `${blocks.length ? `<div${add_attribute("id", id, 0)}${add_attribute("class", name, 0)}>${each$1(blocks, block => `${block.tag === "h3" ? `<h3 class="${"block " + escape$1(block.id) + "-block"}">${validate_component(Block, "Block").$$render($$result, {
    block
  }, {}, {})}
                </h3>` : `${block.tag === "p" ? `<p class="${"block " + escape$1(block.id) + "-block"}">${validate_component(Block, "Block").$$render($$result, {
    block
  }, {}, {})}
                </p>` : `<div class="${"block " + escape$1(block.id) + "-block"}"${add_attribute("style", block.id.includes("svg-rule") ? "font-size:0px;" : "", 0)}>${validate_component(Block, "Block").$$render($$result, {
    block
  }, {}, {})}
                </div>`}`}`)}</div>` : ``}`;
});const ALLOWED_SVG_ELEMENTS = ['a', 'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs', 'desc', 'discard', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject', 'g', 'hatch', 'hatchpath', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tspan', 'use', 'view'].map(tag => `<${tag}>`).join('');

function purifyXml(input, allowed) {
  // Replace void tags (e.g. `<circle />`) with immediately closed tags
  // (e.g. `<circle></circle>`), otherwise purifyHtml leaves the tags open and closes them only
  // sometime later, which results in a functionally different markup.
  return purifyHTML(input && input.replace(/<([A-Za-z]+)(.+?)\s*\/>/g, '<$1$2></$1>'), allowed);
}

function purifySvg(input) {
  return purifyXml(input, ALLOWED_SVG_ELEMENTS);
}/* lib/Menu.svelte generated by Svelte v3.23.2 */
const css$3 = {
  code: ".menu.svelte-1lt126s.svelte-1lt126s{cursor:pointer;position:absolute;top:0px;right:0px;z-index:1}.ha-menu.svelte-1lt126s.svelte-1lt126s{margin:4px 10px 3px 3px;width:18px;padding:3px 0px;border-top:2px solid black;border-bottom:2px solid black}.ha-menu.svelte-1lt126s div.svelte-1lt126s{height:2px;width:100%;background:black}.ha-menu.svelte-1lt126s.svelte-1lt126s:hover{border-top-color:#ccc;border-bottom-color:#ccc}.ha-menu.svelte-1lt126s:hover div.svelte-1lt126s{background:#ccc}.menu-content.svelte-1lt126s.svelte-1lt126s{position:absolute;top:30px;right:4px;background:white;border:1px solid #ccc;z-index:100;box-shadow:0px 0px 4px 1px rgba(0, 0, 0, 0.1)}.menu-content > .dw-chart-menu a{padding:10px;display:block;color:initial;border-bottom:1px solid #ccc}.menu-content > .dw-chart-menu a:hover{background:rgba(0, 0, 0, 0.05)}.menu-content > .dw-chart-menu .block:last-child a{border-bottom:none}",
  map: "{\"version\":3,\"file\":\"Menu.svelte\",\"sources\":[\"Menu.svelte\"],\"sourcesContent\":[\"<script>\\n    import BlocksRegion from './BlocksRegion.svelte';\\n    import purifySvg from '@datawrapper/shared/purifySvg.js';\\n\\n    export let id;\\n    export let name;\\n    export let blocks;\\n    export let props;\\n\\n    let open = false;\\n\\n    function toggle() {\\n        open = !open;\\n    }\\n\\n    function hide() {\\n        open = false;\\n    }\\n</script>\\n\\n<style>\\n    .menu {\\n        cursor: pointer;\\n\\n        position: absolute;\\n        top: 0px;\\n        right: 0px;\\n        z-index: 1;\\n    }\\n\\n    .ha-menu {\\n        margin: 4px 10px 3px 3px;\\n        width: 18px;\\n        padding: 3px 0px;\\n\\n        border-top: 2px solid black;\\n        border-bottom: 2px solid black;\\n    }\\n\\n    .ha-menu div {\\n        height: 2px;\\n        width: 100%;\\n        background: black;\\n    }\\n\\n    .ha-menu:hover {\\n        border-top-color: #ccc;\\n        border-bottom-color: #ccc;\\n    }\\n\\n    .ha-menu:hover div {\\n        background: #ccc;\\n    }\\n\\n    .menu-content {\\n        position: absolute;\\n        top: 30px;\\n        right: 4px;\\n        background: white;\\n        border: 1px solid #ccc;\\n        z-index: 100;\\n        box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.1);\\n    }\\n\\n    :global(.menu-content > .dw-chart-menu a) {\\n        padding: 10px;\\n        display: block;\\n        color: initial;\\n        border-bottom: 1px solid #ccc;\\n    }\\n\\n    :global(.menu-content > .dw-chart-menu a:hover) {\\n        background: rgba(0, 0, 0, 0.05);\\n    }\\n\\n    :global(.menu-content > .dw-chart-menu .block:last-child a) {\\n        border-bottom: none;\\n    }\\n</style>\\n\\n<svelte:window on:click={hide} />\\n\\n{#if blocks.length}\\n    <div class:ha-menu={!props.icon} class=\\\"menu container\\\" on:click|stopPropagation={toggle}>\\n        {#if props.icon}\\n            {@html purifySvg(props.icon)}\\n        {:else}\\n            <div />\\n        {/if}\\n    </div>\\n\\n    <div class=\\\"menu-content container\\\" on:click|stopPropagation class:hidden={!open}>\\n        <BlocksRegion {id} {name} {blocks} />\\n    </div>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAqBI,KAAK,8BAAC,CAAC,AACH,MAAM,CAAE,OAAO,CAEf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,CAAC,AACd,CAAC,AAED,QAAQ,8BAAC,CAAC,AACN,MAAM,CAAE,GAAG,CAAC,IAAI,CAAC,GAAG,CAAC,GAAG,CACxB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,GAAG,CAAC,GAAG,CAEhB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAC3B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AAClC,CAAC,AAED,uBAAQ,CAAC,GAAG,eAAC,CAAC,AACV,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACrB,CAAC,AAED,sCAAQ,MAAM,AAAC,CAAC,AACZ,gBAAgB,CAAE,IAAI,CACtB,mBAAmB,CAAE,IAAI,AAC7B,CAAC,AAED,uBAAQ,MAAM,CAAC,GAAG,eAAC,CAAC,AAChB,UAAU,CAAE,IAAI,AACpB,CAAC,AAED,aAAa,8BAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,GAAG,CACV,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAClD,CAAC,AAEO,gCAAgC,AAAE,CAAC,AACvC,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,OAAO,CACd,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,AACjC,CAAC,AAEO,sCAAsC,AAAE,CAAC,AAC7C,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,AACnC,CAAC,AAEO,kDAAkD,AAAE,CAAC,AACzD,aAAa,CAAE,IAAI,AACvB,CAAC\"}"
};
const Menu = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    id
  } = $$props;
  let {
    name
  } = $$props;
  let {
    blocks
  } = $$props;
  let {
    props
  } = $$props;

  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.blocks === void 0 && $$bindings.blocks && blocks !== void 0) $$bindings.blocks(blocks);
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  $$result.css.add(css$3);
  return `

${blocks.length ? `<div class="${["menu container svelte-1lt126s", !props.icon ? "ha-menu" : ""].join(" ").trim()}">${props.icon ? `${purifySvg(props.icon)}` : `<div class="${"svelte-1lt126s"}"></div>`}</div>

    <div class="${["menu-content container svelte-1lt126s", "hidden" ].join(" ").trim()}">${validate_component(BlocksRegion, "BlocksRegion").$$render($$result, {
    id,
    name,
    blocks
  }, {}, {})}</div>` : ``}`;
});/* lib/blocks/Headline.svelte generated by Svelte v3.23.2 */
const Headline = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    purifyHtml
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let chart = props.chart;
  return `${purifyHtml(chart.title)}`;
});/* lib/blocks/Description.svelte generated by Svelte v3.23.2 */
const allowedTags = "<table><thead><tbody><tfoot><caption><colgroup><col><tr><td><th><details><summary>";
const Description = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let chart = props.chart;
  let description = get(chart, "metadata.describe.intro");
  return `${clean(description, allowedTags)}`;
});const allowedSourceUrlRegExp = /^(https?|ftp):\/\//i;
/**
 * Checks that passed `sourceUrl` can safely be rendered in chart HTML and shown publicly.
 *
 * Most importantly, this function doesn't allow 'javascript:' URLs, so that users can't put such
 * links in their charts and thus put the readers of the charts in danger.
 *
 * @param {string} sourceUrl
 * @returns {boolean}
 */

function isAllowedSourceUrl(sourceUrl) {
  return allowedSourceUrlRegExp.test(sourceUrl);
}/* lib/blocks/Source.svelte generated by Svelte v3.23.2 */
const Source = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    __,
    get,
    purifyHtml
  } = props;

  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let {
    chart,
    theme,
    postEvent
  } = props;
  let caption = get(theme, "data.options.blocks.source.data.caption", __("Source"));
  let sourceName = get(chart, "metadata.describe.source-name");
  let sourceUrl = get(chart, "metadata.describe.source-url");
  let allowedSourceUrl = isAllowedSourceUrl(sourceUrl);
  return `${sourceName ? `<span class="${"source-caption"}">${escape$1(caption)}:</span>
    ${sourceUrl && allowedSourceUrl ? `<a class="${"source"}" target="${"_blank"}" rel="${"noopener noreferrer"}"${add_attribute("href", sourceUrl, 0)}>${purifyHtml(sourceName)}</a>` : `<span class="${"source"}"${add_attribute("title", sourceUrl && !allowedSourceUrl ? sourceUrl : null, 0)}>${purifyHtml(sourceName)}</span>`}` : ``}`;
});/* lib/blocks/Byline.svelte generated by Svelte v3.23.2 */
const Byline = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    purifyHtml,
    __
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let chart = props.chart;
  let theme = props.theme;
  let caption = props.caption;
  let bylineCaption = get(theme, `data.options.blocks.byline.data.${caption}Caption`, __(caption === "map" ? "Map:" : caption === "table" ? "Table:" : "Chart:"));
  let byline = get(chart, "metadata.describe.byline", false);
  let forkCaption = get(theme, "data.options.blocks.byline.data.forkCaption", __("footer / based-on"));
  let needBrackets = chart.basedOnByline && byline;
  let basedOnByline = (needBrackets ? "(" : "") + forkCaption + " " + purifyHtml(chart.basedOnByline) + (needBrackets ? ")" : "");
  return `<span class="${"byline-caption"}">${escape$1(bylineCaption)}</span>
<span class="${"byline-content"}">${escape$1(byline)}</span>
${chart.basedOnByline ? `${purifyHtml(basedOnByline)}` : ``}`;
});/* lib/blocks/Notes.svelte generated by Svelte v3.23.2 */
const Notes = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let chart = props.chart;
  return `${clean(get(chart, "metadata.annotate.notes"), "<details><summary>")}`;
});/* lib/blocks/GetTheData.svelte generated by Svelte v3.23.2 */

const GetTheData = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    __,
    purifyHtml
  } = props;

  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let {
    chart,
    dwChart,
    teamPublicSettings,
    theme,
    postEvent
  } = props;
  let externalData = get(chart, "externalData");
  let caption = get(theme, "data.options.blocks.get-the-data.data.caption", __("Get the data"));
  return `<a class="${"dw-data-link"}" aria-label="${escape$1(__(caption)) + ": " + escape$1(purifyHtml(chart.title, ""))}"${add_attribute("target", externalData ? "_blank" : "_self", 0)}${add_attribute("href", externalData || "javascript:void(0)", 0)}>${escape$1(__(caption))}</a>`;
});/* lib/blocks/EditInDatawrapper.svelte generated by Svelte v3.23.2 */
const EditInDatawrapper = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    __
  } = props;

  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let {
    chart,
    theme,
    config
  } = props;
  let forkable = get(chart, "forkable", false);
  let showEditInDatawrapperLink = get(chart, "metadata.publish.blocks.edit-in-datawrapper", false);
  let caption = get(theme, "data.options.blocks.edit.data.caption", "edit-in-datawrapper");
  return `${forkable && showEditInDatawrapperLink ? `<a href="${"#/edit-in-datawrapper"}">${escape$1(__(caption))}</a>` : ``}`;
});/* lib/blocks/Embed.svelte generated by Svelte v3.23.2 */
const css$2 = {
  code: ".embed-code.svelte-1f8d99s.svelte-1f8d99s{position:absolute;bottom:35px;left:8px;max-width:350px;border:1px solid #e5e5e5;background:#fff;box-shadow:0px 4px 10px rgba(0, 0, 0, 0.15);border-radius:4px;padding:15px 20px;font-size:14px;z-index:100}.embed-code.svelte-1f8d99s .close.svelte-1f8d99s{width:15px;height:15px;right:10px;top:10px;position:absolute;fill:#4f4f4f;cursor:pointer}.embed-code.svelte-1f8d99s .close.svelte-1f8d99s:hover,.embed-code.svelte-1f8d99s .close.svelte-1f8d99s:focus{fill:#111}.embed-code.svelte-1f8d99s button.svelte-1f8d99s{cursor:pointer;border:1px solid #ccc;border-bottom-color:#b3b3b3;box-shadow:none;border-radius:4px;width:40px;height:30px;box-shadow:0px 1px 2px rgba(0, 0, 0, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.05)}.embed-code.svelte-1f8d99s button.svelte-1f8d99s:hover,.embed-code.svelte-1f8d99s button.svelte-1f8d99s:active{background-color:#e6e6e6}.embed-code.svelte-1f8d99s button svg.svelte-1f8d99s{width:20px;height:20px}.embed-code.svelte-1f8d99s button path.svelte-1f8d99s{fill:#4f4f4f}.embed-code.svelte-1f8d99s p.svelte-1f8d99s{margin:0px 0px 12px 0px;width:calc(100% - 30px);font-size:14px;line-height:20px}.embed-code.svelte-1f8d99s div.actions.svelte-1f8d99s{display:flex;justify-content:space-between}input.svelte-1f8d99s.svelte-1f8d99s{width:100%;background:#f5f5f5;border:1px solid #dddddd;box-sizing:border-box;border-radius:4px;padding:4px;font-size:14px;line-height:14px;color:#4f4f4f;margin-right:10px}",
  map: "{\"version\":3,\"file\":\"Embed.svelte\",\"sources\":[\"Embed.svelte\"],\"sourcesContent\":[\"<script>\\n    import { clean } from '../shared.mjs';\\n\\n    // external props\\n    export let props;\\n    const { get, __ } = props;\\n    $: ({ chart, theme, postEvent } = props);\\n\\n    // internal props\\n    $: embed = get(theme, 'data.options.blocks.embed.data', {});\\n    $: embedCode = get(\\n        chart,\\n        'metadata.publish.embed-codes.embed-method-responsive',\\n        '<!-- embed code will be here after publishing -->'\\n    );\\n\\n    let modalIsHidden = true;\\n\\n    function handleClick(e) {\\n        e.preventDefault();\\n        modalIsHidden = !modalIsHidden;\\n        postEvent(`embed.modal.${modalIsHidden ? 'close' : 'open'}`);\\n    }\\n\\n    let inputRef;\\n\\n    function copy() {\\n        postEvent('embed.copy');\\n        inputRef.focus();\\n        inputRef.select();\\n        document.execCommand('copy');\\n    }\\n</script>\\n\\n<style>\\n    .embed-code {\\n        position: absolute;\\n        bottom: 35px;\\n        left: 8px;\\n        max-width: 350px;\\n        border: 1px solid #e5e5e5;\\n        background: #fff;\\n        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);\\n        border-radius: 4px;\\n        padding: 15px 20px;\\n        font-size: 14px;\\n        z-index: 100;\\n    }\\n\\n    .embed-code .close {\\n        width: 15px;\\n        height: 15px;\\n        right: 10px;\\n        top: 10px;\\n        position: absolute;\\n        fill: #4f4f4f;\\n        cursor: pointer;\\n    }\\n    .embed-code .close:hover,\\n    .embed-code .close:focus {\\n        fill: #111;\\n    }\\n\\n    .embed-code button {\\n        cursor: pointer;\\n        border: 1px solid #ccc;\\n        border-bottom-color: #b3b3b3;\\n        box-shadow: none;\\n        border-radius: 4px;\\n        width: 40px;\\n        height: 30px;\\n        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.05);\\n    }\\n    .embed-code button:hover,\\n    .embed-code button:active {\\n        background-color: #e6e6e6;\\n    }\\n\\n    .embed-code button svg {\\n        width: 20px;\\n        height: 20px;\\n    }\\n\\n    .embed-code button path {\\n        fill: #4f4f4f;\\n    }\\n\\n    .embed-code p {\\n        margin: 0px 0px 12px 0px;\\n        width: calc(100% - 30px);\\n        font-size: 14px;\\n        line-height: 20px;\\n    }\\n\\n    .embed-code div.actions {\\n        display: flex;\\n        justify-content: space-between;\\n    }\\n\\n    input {\\n        width: 100%;\\n        background: #f5f5f5;\\n        border: 1px solid #dddddd;\\n        box-sizing: border-box;\\n        border-radius: 4px;\\n        padding: 4px;\\n        font-size: 14px;\\n        line-height: 14px;\\n        color: #4f4f4f;\\n        margin-right: 10px;\\n    }\\n</style>\\n\\n<a href=\\\"#embed\\\" class=\\\"chart-action-embed\\\" on:click={handleClick}>\\n    {embed.caption || __('Embed')}\\n</a>\\n{#if !modalIsHidden}\\n    <div class=\\\"embed-code\\\">\\n        <div class=\\\"close\\\" on:click={handleClick}>\\n            <svg viewBox=\\\"0 0 30 30\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\">\\n                <path\\n                    d=\\\"M7 4a.995.995 0 0 0-.707.293l-2 2a.999.999 0 0 0 0 1.414L11.586 15l-7.293\\n                    7.293a.999.999 0 0 0 0 1.414l2 2a.999.999 0 0 0 1.414 0L15 18.414l7.293\\n                    7.293a.999.999 0 0 0 1.414 0l2-2a.999.999 0 0 0 0-1.414L18.414\\n                    15l7.293-7.293a.999.999 0 0 0 0-1.414l-2-2a.999.999 0 0 0-1.414 0L15 11.586\\n                    7.707 4.293A.996.996 0 0 0 7 4z\\\"\\n                />\\n            </svg>\\n        </div>\\n        <p>\\n            {@html clean(\\n                embed.text || 'You can copy and paste this <b>code to embed</b> the visualization:'\\n            )}\\n        </p>\\n\\n        <div class=\\\"actions\\\">\\n            <input bind:this={inputRef} type=\\\"text\\\" readonly value={embedCode} />\\n            <button on:click={copy}>\\n                <svg viewBox=\\\"0 0 30 30\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\">\\n                    <path\\n                        d=\\\"M15 0c-1.645 0-3 1.355-3 3H8C6.346 3 5 4.346 5 6v17c0 1.654 1.346 3 3\\n                        3h14c1.654 0 3-1.346 3-3V6c0-1.654-1.346-3-3-3h-4c0-1.645-1.355-3-3-3zm0\\n                        2c.564 0 1 .436 1 1 0 .564-.436 1-1 1-.564 0-1-.436-1-1 0-.564.436-1 1-1zM8\\n                        5h4v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5h4c.551 0 1 .449 1 1v17c0 .551-.449 1-1\\n                        1H8c-.551 0-1-.449-1-1V6c0-.551.449-1 1-1zm4 7a1 1 0 1 0 0 2 1 1 0 0 0\\n                        0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1\\n                        1 0 1 0 0 2 1 1 0 0 0 0-2zm-16 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm16 0a1 1 0 1 0\\n                        0 2 1 1 0 0 0 0-2zm-16 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm16 0a1 1 0 1 0 0 2 1 1\\n                        0 0 0 0-2zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-16 4a1 1 0 1 0 0 2 1 1 0 0 0\\n                        0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm4 0a1\\n                        1 0 1 0 0 2 1 1 0 0 0 0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z\\\"\\n                    />\\n                </svg>\\n            </button>\\n        </div>\\n    </div>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAmCI,WAAW,8BAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC5C,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,GAAG,AAChB,CAAC,AAED,0BAAW,CAAC,MAAM,eAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,IAAI,CACT,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,OAAO,CACb,MAAM,CAAE,OAAO,AACnB,CAAC,AACD,0BAAW,CAAC,qBAAM,MAAM,CACxB,0BAAW,CAAC,qBAAM,MAAM,AAAC,CAAC,AACtB,IAAI,CAAE,IAAI,AACd,CAAC,AAED,0BAAW,CAAC,MAAM,eAAC,CAAC,AAChB,MAAM,CAAE,OAAO,CACf,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,mBAAmB,CAAE,OAAO,CAC5B,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,AAC5F,CAAC,AACD,0BAAW,CAAC,qBAAM,MAAM,CACxB,0BAAW,CAAC,qBAAM,OAAO,AAAC,CAAC,AACvB,gBAAgB,CAAE,OAAO,AAC7B,CAAC,AAED,0BAAW,CAAC,MAAM,CAAC,GAAG,eAAC,CAAC,AACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AAChB,CAAC,AAED,0BAAW,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AACrB,IAAI,CAAE,OAAO,AACjB,CAAC,AAED,0BAAW,CAAC,CAAC,eAAC,CAAC,AACX,MAAM,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,GAAG,CACxB,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACxB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,AACrB,CAAC,AAED,0BAAW,CAAC,GAAG,QAAQ,eAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,AAClC,CAAC,AAED,KAAK,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,UAAU,CAAE,UAAU,CACtB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CACZ,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OAAO,CACd,YAAY,CAAE,IAAI,AACtB,CAAC\"}"
};
const Embed = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    __
  } = props;

  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  $$result.css.add(css$2);
  let {
    chart,
    theme,
    postEvent
  } = props;
  let embed = get(theme, "data.options.blocks.embed.data", {});
  get(chart, "metadata.publish.embed-codes.embed-method-responsive", "<!-- embed code will be here after publishing -->");
  return `<a href="${"#embed"}" class="${"chart-action-embed"}">${escape$1(embed.caption || __("Embed"))}</a>
${``}`;
});/* lib/blocks/LogoInner.svelte generated by Svelte v3.23.2 */
const LogoInner = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    logo
  } = $$props;
  let {
    purifyHtml
  } = $$props;
  let {
    theme
  } = $$props;
  if ($$props.logo === void 0 && $$bindings.logo && logo !== void 0) $$bindings.logo(logo);
  if ($$props.purifyHtml === void 0 && $$bindings.purifyHtml && purifyHtml !== void 0) $$bindings.purifyHtml(purifyHtml);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  return `${logo.imgSrc ? `<img${add_attribute("height", logo.height, 0)}${add_attribute("src", logo.imgSrc, 0)}${add_attribute("alt", "altText" in logo ? logo.altText : theme.title, 0)}>` : ``}
${logo.text ? `<span class="${"logo-text"}">${purifyHtml(logo.text)}</span>` : ``}`;
});/* lib/blocks/Logo.svelte generated by Svelte v3.23.2 */
const Logo = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    purifyHtml
  } = props;
  let logo;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let {
    chart,
    theme,
    logoId
  } = props;

  {
    {
      const metadataLogo = get(chart, "metadata.publish.blocks.logo");
      const themeLogoOptions = get(theme, "data.options.blocks.logo.data.options", []);
      const thisLogoId = logoId || metadataLogo.id;
      logo = themeLogoOptions.find(logo => logo.id === thisLogoId); // fallback to first logo in theme options

      if (!thisLogoId || !logo) logo = themeLogoOptions[0] || {};
    }
  }

  return `${logo.url ? `<a${add_attribute("href", logo.url, 0)}${add_attribute("title", logo.linkTitle || logo.url, 0)} target="${"_blank"}" rel="${"noopener noreferrer"}">${validate_component(LogoInner, "LogoInner").$$render($$result, {
    logo,
    purifyHtml,
    theme
  }, {}, {})}</a>` : `${validate_component(LogoInner, "LogoInner").$$render($$result, {
    logo,
    purifyHtml,
    theme
  }, {}, {})}`}`;
});/* lib/blocks/Rectangle.svelte generated by Svelte v3.23.2 */

function px(val) {
  return typeof val === "string" ? val : val + "px";
}

const Rectangle = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let theme = props.theme;
  let data = get(theme, "data.options.blocks.rectangle.data", {});
  let width = get(data, "width", 50);
  let height = get(data, "height", 5);
  let background = get(data, "background", "red");
  return `<div class="${"export-rect"}" style="${"width: " + escape$1(px(width)) + "; height: " + escape$1(px(height)) + "; background: " + escape$1(background) + ";"}"></div>`;
});/**
 * returns the estimated width of a given text in Roboto.
 * this method has proven to be a good compromise between pixel-perfect
 * but expensive text measuring methods using canvas or getClientBoundingRect
 * and just multiplying the number of characters with a fixed width.
 *
 * be warned that this is just a rough estimate of the text width. the
 * character widths will vary from typeface to typeface and may be
 * off quite a bit for some fonts (like monospace fonts).
 *
 * @exports estimateTextWidth
 * @kind function
 *
 * @param {string} text - the text to measure
 * @param {number} fontSize - the output font size (optional, default is 14)
 *
 * @example
 * import estimateTextWidth from '@datawrapper/shared/estimateTextWidth';
 * // or import {estimateTextWidth} from '@datawrapper/shared';
 * const width = estimateTextWidth('my text', 12);
 *
 * @export
 * @returns {number}
 */
function estimateTextWidth(text, fontSize = 14) {
  const f = fontSize / 14;
  return text.split('').reduce((w, char) => w + (CHAR_W[char] || CHAR_W.a), 0) * f;
}
const CHAR_W = {
  a: 9,
  A: 10,
  b: 9,
  B: 10,
  c: 8,
  C: 10,
  d: 9,
  D: 11,
  e: 9,
  E: 9,
  f: 5,
  F: 8,
  g: 9,
  G: 11,
  h: 9,
  H: 11,
  i: 4,
  I: 4,
  j: 4,
  J: 4,
  k: 8,
  K: 9,
  l: 4,
  L: 8,
  m: 14,
  M: 12,
  n: 9,
  N: 10,
  o: 9,
  O: 11,
  p: 9,
  P: 8,
  q: 9,
  Q: 11,
  r: 6,
  R: 10,
  s: 7,
  S: 9,
  t: 5,
  T: 9,
  u: 9,
  U: 10,
  v: 8,
  V: 10,
  w: 11,
  W: 14,
  x: 8,
  X: 10,
  y: 8,
  Y: 9,
  z: 7,
  Z: 10,
  '.': 4,
  '!': 4,
  '|': 4,
  ',': 4,
  ':': 5,
  ';': 5,
  '-': 5,
  '+': 12,
  ' ': 4
};/* lib/blocks/Watermark.svelte generated by Svelte v3.23.2 */
const css$1 = {
  code: "div.svelte-111z7el{position:fixed;opacity:0.182;font-weight:700;font-size:0;white-space:nowrap;left:-100px;top:0px;right:-100px;line-height:100vh;bottom:0;text-align:center;pointer-events:none;transform-origin:middle center}",
  map: "{\"version\":3,\"file\":\"Watermark.svelte\",\"sources\":[\"Watermark.svelte\"],\"sourcesContent\":[\"<script>\\n    import estimateTextWidth from '@datawrapper/shared/estimateTextWidth';\\n\\n    export let props;\\n    const { get, purifyHtml } = props;\\n    $: ({ chart, theme } = props);\\n\\n    $: monospace = get(theme, 'data.options.watermark.monospace', false);\\n    $: field = get(theme, 'data.options.watermark.custom-field');\\n    $: text = get(theme, 'data.options.watermark')\\n        ? field\\n            ? get(chart, `metadata.custom.${field}`, '')\\n            : get(theme, 'data.options.watermark.text', 'CONFIDENTIAL')\\n        : false;\\n\\n    let width;\\n    let height;\\n\\n    $: angle = -Math.atan(height / width);\\n    $: angleDeg = (angle * 180) / Math.PI;\\n\\n    $: diagonal = Math.sqrt(width * width + height * height);\\n\\n    // estimateTextWidth works reasonable well for normal fonts\\n    // set theme.data.options.watermark.monospace to true if you\\n    // have a monospace font\\n    $: estWidth = monospace ? text.length * 20 : estimateTextWidth(text, 20);\\n    $: fontSize = `${Math.round(20 * ((diagonal * 0.75) / estWidth))}px`;\\n</script>\\n\\n<style>\\n    div {\\n        position: fixed;\\n        opacity: 0.182;\\n        font-weight: 700;\\n        font-size: 0;\\n        white-space: nowrap;\\n        left: -100px;\\n        top: 0px;\\n        right: -100px;\\n        line-height: 100vh;\\n        bottom: 0;\\n        text-align: center;\\n        pointer-events: none;\\n        transform-origin: middle center;\\n    }\\n</style>\\n\\n<svelte:window bind:innerWidth={width} bind:innerHeight={height} />\\n\\n<div\\n    class=\\\"watermark noscript\\\"\\n    style=\\\"transform:rotate({angle}rad); font-size: {fontSize}\\\"\\n    data-rotate={angleDeg}\\n>\\n    <span>\\n        {@html purifyHtml(text)}\\n    </span>\\n</div>\\n\"],\"names\":[],\"mappings\":\"AA+BI,GAAG,eAAC,CAAC,AACD,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,KAAK,CACd,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,CAAC,CACZ,WAAW,CAAE,MAAM,CACnB,IAAI,CAAE,MAAM,CACZ,GAAG,CAAE,GAAG,CACR,KAAK,CAAE,MAAM,CACb,WAAW,CAAE,KAAK,CAClB,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,IAAI,CACpB,gBAAgB,CAAE,MAAM,CAAC,MAAM,AACnC,CAAC\"}"
};
const Watermark = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get,
    purifyHtml
  } = props;
  let width;
  let height;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  $$result.css.add(css$1);
  let {
    chart,
    theme
  } = props;
  let monospace = get(theme, "data.options.watermark.monospace", false);
  let field = get(theme, "data.options.watermark.custom-field");
  let text = get(theme, "data.options.watermark") ? field ? get(chart, `metadata.custom.${field}`, "") : get(theme, "data.options.watermark.text", "CONFIDENTIAL") : false;
  let angle = -Math.atan(height / width);
  let angleDeg = angle * 180 / Math.PI;
  let diagonal = Math.sqrt(width * width + height * height);
  let estWidth = monospace ? text.length * 20 : estimateTextWidth(text, 20);
  let fontSize = `${Math.round(20 * (diagonal * 0.75 / estWidth))}px`;
  return `

<div class="${"watermark noscript svelte-111z7el"}" style="${"transform:rotate(" + escape$1(angle) + "rad); font-size: " + escape$1(fontSize)}"${add_attribute("data-rotate", angleDeg, 0)}><span>${purifyHtml(text)}</span></div>`;
});/* lib/blocks/HorizontalRule.svelte generated by Svelte v3.23.2 */
const HorizontalRule = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get
  } = props;
  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  let theme = props.theme;
  let data = get(theme, `data.options.blocks.${props.id}.data`, {});
  let border = get(data, "border", "1px solid #cccccc");
  let margin = get(data, "margin", "0px");
  return `<hr class="${"dw-line"}" style="${"border: 0; border-bottom: " + escape$1(border) + "; margin: " + escape$1(margin) + ";"}">`;
});/* lib/blocks/svgRule.svelte generated by Svelte v3.23.2 */
const css = {
  code: "svg.svelte-eczzvz{width:100%;overflow-x:hidden}",
  map: "{\"version\":3,\"file\":\"svgRule.svelte\",\"sources\":[\"svgRule.svelte\"],\"sourcesContent\":[\"<script>\\n    import { onMount } from 'svelte';\\n    // external props\\n    export let props;\\n    const { get } = props;\\n    let svg;\\n    let length = 0;\\n\\n    onMount(() => {\\n        length = svg.getBoundingClientRect().width;\\n    });\\n\\n    if (typeof window !== 'undefined') {\\n        window.addEventListener('resize', () => {\\n            length = svg.getBoundingClientRect().width;\\n        });\\n    }\\n\\n    $: theme = props.theme;\\n\\n    $: data = get(theme, `data.options.blocks.${props.id}.data`, {});\\n    $: margin = get(data, 'margin', '0px');\\n    $: color = get(data, 'color', '#000000');\\n    $: width = get(data, 'width', 1);\\n    $: strokeDasharray = get(data, 'strokeDasharray', 'none');\\n    $: strokeLinecap = get(data, 'strokeLinecap', 'butt');\\n</script>\\n\\n<style type=\\\"text/css\\\">\\n    svg {\\n        width: 100%;\\n\\n        /*For IE*/\\n        overflow-x: hidden;\\n    }\\n</style>\\n\\n<svg bind:this={svg} style=\\\"height:{Math.max(width, 1)}px; margin:{margin};\\\">\\n    <line\\n        style=\\\"stroke:{color}; stroke-width:{width}; stroke-dasharray:{strokeDasharray};\\n        stroke-linecap: {strokeLinecap};\\\"\\n        x1=\\\"0\\\"\\n        y1={width / 2}\\n        x2={length}\\n        y2={width / 2}\\n    />\\n</svg>\\n\"],\"names\":[],\"mappings\":\"AA6BI,GAAG,cAAC,CAAC,AACD,KAAK,CAAE,IAAI,CAGX,UAAU,CAAE,MAAM,AACtB,CAAC\"}"
};
const SvgRule = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    props
  } = $$props;
  const {
    get
  } = props;
  let svg;
  let length = 0;
  onMount(() => {
    length = svg.getBoundingClientRect().width;
  });

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      length = svg.getBoundingClientRect().width;
    });
  }

  if ($$props.props === void 0 && $$bindings.props && props !== void 0) $$bindings.props(props);
  $$result.css.add(css);
  let theme = props.theme;
  let data = get(theme, `data.options.blocks.${props.id}.data`, {});
  let margin = get(data, "margin", "0px");
  let color = get(data, "color", "#000000");
  let width = get(data, "width", 1);
  let strokeDasharray = get(data, "strokeDasharray", "none");
  let strokeLinecap = get(data, "strokeLinecap", "butt");
  return `<svg style="${"height:" + escape$1(Math.max(width, 1)) + "px; margin:" + escape$1(margin) + ";"}" class="${"svelte-eczzvz"}"${add_attribute("this", svg, 1)}><line style="${"stroke:" + escape$1(color) + "; stroke-width:" + escape$1(width) + "; stroke-dasharray:" + escape$1(strokeDasharray) + ";\n        stroke-linecap: " + escape$1(strokeLinecap) + ";"}" x1="${"0"}"${add_attribute("y1", width / 2, 0)}${add_attribute("x2", length, 0)}${add_attribute("y2", width / 2, 0)}></line></svg>`;
});/**
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
function get$1(object, key = null, _default = null) {
  if (!key) return object;
  const keys = Array.isArray(key) ? key : key.split('.');
  let pt = object;

  for (let i = 0; i < keys.length; i++) {
    if (pt === null || pt === undefined) break; // break out of the loop
    // move one more level in

    pt = pt[keys[i]];
  }

  return pt === undefined || pt === null ? _default : pt;
}/**
 * safely set object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports set
 * @kind function
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} value - the value to be set
 *
 * @returns the value
 */
function set(object, key, value) {
  const keys = Array.isArray(key) ? key : key.split('.');
  const lastKey = keys.pop();
  let pt = object; // resolve property until the parent dict

  keys.forEach(key => {
    if (pt[key] === undefined || pt[key] === null) {
      pt[key] = {};
    }

    pt = pt[key];
  }); // check if new value is set

  if (JSON.stringify(pt[lastKey]) !== JSON.stringify(value)) {
    pt[lastKey] = value;
    return true;
  }

  return false;
}var publish = [metadata => {
  const oldVal = get$1(metadata, 'publish.blocks.logo');

  if (typeof oldVal === 'boolean') {
    set(metadata, 'publish.blocks.logo', {
      enabled: oldVal
    });
  }
}];const migrations = [...publish];
function migrate (metadata) {
  migrations.forEach(migrate => migrate(metadata));
}// Current version.
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
    slice$1 = ArrayProto.slice,
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
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;// Some functions take a variable number of arguments, or a few expected
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
}// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString.call(obj) === tag;
  };
}var isString = tagTester('String');var isNumber = tagTester('Number');var isDate = tagTester('Date');var isRegExp = tagTester('RegExp');var isError = tagTester('Error');var isSymbol = tagTester('Symbol');var isArrayBuffer = tagTester('ArrayBuffer');var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;var hasObjectTag = tagTester('Object');// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
var hasStringTagBug = (
      supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8)))
    ),
    isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = (hasStringTagBug ? ie10IsDataView : isDataView);// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
var isArray = nativeIsArray || tagTester('Array');// Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has$1(obj, 'callee');
    };
  }
}());

var isArguments$1 = isArguments;// Is a given object a finite number?
function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}// Is the given value `NaN`?
function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}// Internal helper to obtain the `byteLength` property of an object.
var getByteLength = shallowProperty('byteLength');// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
var isBufferLike = createSizePropertyCheck(getByteLength);// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView$1(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);// Internal helper to obtain the `length` property of an object.
var getLength = shallowProperty('length');// Internal helper to create a simple lookup structure.
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
}// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}// Is a given array, string, or object empty?
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
}// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}// If Underscore is called as a function, it returns a wrapped object that can
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
};// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}// We use this string twice, so give it a name for minification.
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
}// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}// Since the regular `Object.prototype.toString` type tests don't work for
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
    setMethods = ['add'].concat(commonInit, forEachName, hasName);var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');var isWeakSet = tagTester('WeakSet');// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }
  return names.sort();
}// An internal function for creating assigner functions.
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
}// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);// Create a naked function reference for surrogate-prototype-swapping.
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
}// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _$1.toPath(path);
}// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}// Shortcut function for checking if an object has a given property directly on
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
}// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}// Internal function that returns an efficient (for current engines) version
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
}// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}// Returns the results of applying the `iteratee` to each element of `obj`.
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
}// Predicate-generating function. Often useful outside of Underscore.
function noop(){}// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}// Return a random integer between `min` and `max` (inclusive).
function random$1(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};// Internal helper to generate functions for escaping and unescaping strings
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
}// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};// Function for escaping strings to HTML interpolation.
var escape = createEscaper(escapeMap);// Internal list of HTML entities for unescaping.
var unescapeMap = invert(escapeMap);// Function for unescaping strings from HTML interpolation.
var unescape = createEscaper(unescapeMap);// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};// When customizing `_.templateSettings`, if you don't want to define an
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
}// Traverses the children of `obj` along `path`. If a child is a function, it
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
}// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _$1(obj);
  instance._chain = true;
  return instance;
}// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}// Partially apply a function by creating a version that has had some of its
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

partial.placeholder = _$1;// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
var bind = restArguments(function(func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var isArrayLike = createSizePropertyCheck(getLength);// Internal implementation of a recursive `flatten` function.
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
}// Bind a number of an object's methods to that object. Remaining arguments
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
});// Memoize an expensive function by storing its results.
function memoize$1(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _$1, 1);// Returns a function, that, when invoked, will only be triggered at most once
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
}// When a sequence of calls of the returned function ends, the argument
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
}// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}// Returns a function that is the composition of a list of functions, each
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
}// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}// Returns a function that will only be executed up to (but not including) the
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
}// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}// Internal function to generate `_.findIndex` and `_.findLastIndex`.
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
}// Returns the first index on an array-like that passes a truth test.
var findIndex = createPredicateIndexFinder(1);// Returns the last index on an array-like that passes a truth test.
var findLastIndex = createPredicateIndexFinder(-1);// Use a comparator function to figure out the smallest index at which
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
}// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
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
      idx = predicateFind(slice$1.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
var lastIndexOf = createIndexFinder(-1, findLastIndex);// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}// The cornerstone for collection functions, an `each`
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
}// Return the results of applying the iteratee to each element.
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
}// Internal helper to create a reducing function, iterating left or right.
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
}// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}// Determine if the array or object contains a given item (using `===`).
function contains$1(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}// Invoke a method (with arguments) on every item in a collection.
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
});// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}// Return the maximum element (or element-based computation).
function max$1(obj, iteratee, context) {
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
}// Return the minimum element (or element-based computation).
function min$1(obj, iteratee, context) {
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
}// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random$1(obj.length - 1)];
  }
  var sample = isArrayLike(obj) ? clone(obj) : values(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random$1(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}// Sort the object's values by a criterion produced by an iteratee.
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
}// An internal function used for aggregate "group by" operations.
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
}// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
});// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key]++; else result[key] = 1;
});// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice$1.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}// Return a copy of the object only containing the allowed properties.
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
});// Return a copy of the object without the disallowed properties.
var omit = restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten$1(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains$1(keys, key);
    };
  }
  return pick(obj, iteratee, context);
});// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice$1.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice$1.call(array, n == null || guard ? 1 : n);
}// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return flatten$1(array, depth, false);
}// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains$1(rest, value);
  });
});// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});// Produce a duplicate-free version of the array. If the array has already
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
      if (!contains$1(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains$1(result, value)) {
      result.push(value);
    }
  }
  return result;
}// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(flatten$1(arrays, true, true));
});// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains$1(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains$1(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = array && max$1(array, getLength).length || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);// Converts lists into objects. Pass either a single array of `[key, value]`
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
}// Generate an integer Array containing an arithmetic progression. A port of
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
}// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice$1.call(array, i, i += count));
  }
  return result;
}// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}// Add your own custom functions to the Underscore object.
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
}// Add all mutator `Array` functions to the wrapper.
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
});// Named Exports
var allExports=/*#__PURE__*/Object.freeze({__proto__:null,VERSION:VERSION,restArguments:restArguments,isObject:isObject,isNull:isNull,isUndefined:isUndefined,isBoolean:isBoolean,isElement:isElement,isString:isString,isNumber:isNumber,isDate:isDate,isRegExp:isRegExp,isError:isError,isSymbol:isSymbol,isArrayBuffer:isArrayBuffer,isDataView:isDataView$1,isArray:isArray,isFunction:isFunction$1,isArguments:isArguments$1,isFinite:isFinite$1,isNaN:isNaN$1,isTypedArray:isTypedArray$1,isEmpty:isEmpty,isMatch:isMatch,isEqual:isEqual,isMap:isMap,isWeakMap:isWeakMap,isSet:isSet,isWeakSet:isWeakSet,keys:keys,allKeys:allKeys,values:values,pairs:pairs,invert:invert,functions:functions,methods:functions,extend:extend,extendOwn:extendOwn,assign:extendOwn,defaults:defaults,create:create,clone:clone,tap:tap,get:get,has:has,mapObject:mapObject,identity:identity,constant:constant,noop:noop,toPath:toPath$1,property:property,propertyOf:propertyOf,matcher:matcher,matches:matcher,times:times,random:random$1,now:now,escape:escape,unescape:unescape,templateSettings:templateSettings,template:template,result:result,uniqueId:uniqueId,chain:chain,iteratee:iteratee,partial:partial,bind:bind,bindAll:bindAll,memoize:memoize$1,delay:delay,defer:defer,throttle:throttle,debounce:debounce,wrap:wrap,negate:negate,compose:compose,after:after,before:before,once:once,findKey:findKey,findIndex:findIndex,findLastIndex:findLastIndex,sortedIndex:sortedIndex,indexOf:indexOf,lastIndexOf:lastIndexOf,find:find,detect:find,findWhere:findWhere,each:each,forEach:each,map:map,collect:map,reduce:reduce,foldl:reduce,inject:reduce,reduceRight:reduceRight,foldr:reduceRight,filter:filter,select:filter,reject:reject,every:every,all:every,some:some,any:some,contains:contains$1,includes:contains$1,include:contains$1,invoke:invoke,pluck:pluck,where:where,max:max$1,min:min$1,shuffle:shuffle,sample:sample,sortBy:sortBy,groupBy:groupBy,indexBy:indexBy,countBy:countBy,partition:partition,toArray:toArray,size:size,pick:pick,omit:omit,first:first,head:first,take:first,initial:initial,last:last,rest:rest,tail:rest,drop:rest,compact:compact,flatten:flatten,without:without,uniq:uniq,unique:uniq,union:union,intersection:intersection,difference:difference,unzip:unzip,transpose:unzip,zip:zip,object:object,range:range,chunk:chunk,mixin:mixin,'default':_$1});// Default Export

// Add all of the Underscore functions to the wrapper object.
var _ = mixin(allExports);
// Legacy Node.js API.
_._ = _;const begin = /^ */.source;
const end = /[*']* *$/.source;
const s0 = /[ \-/.]?/.source; // optional separator

const s1 = /[ \-/.]/.source; // mandatory separator

const s2 = /[ \-/.;,]/.source; // mandatory separator

const s3 = /[ \-|T]/.source; // mandatory separator

const sM = /[ \-/.m]/.source; // mandatory separator

const rx = {
  YY: {
    parse: /['’‘]?(\d{2})/
  },
  YYYY: {
    test: /([12]\d{3})/,
    parse: /(\d{4})/
  },
  YYYY2: {
    test: /(?:1[7-9]|20)\d{2}/,
    parse: /(\d{4})/
  },
  H: {
    parse: /h([12])/
  },
  Q: {
    parse: /q([1234])/
  },
  W: {
    parse: /w([0-5]?[0-9])/
  },
  MM: {
    test: /(0?[1-9]|1[0-2])/,
    parse: /(0?[1-9]|1[0-2])/
  },
  DD: {
    parse: /(0?[1-9]|[1-2][0-9]|3[01])/
  },
  DOW: {
    parse: /([0-7])/
  },
  HHMM: {
    parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/
  }
};
const MONTHS = {
  // feel free to add more localized month names
  0: ['jan', 'january', 'januar', 'jänner', 'jän', 'janv', 'janvier', 'ene', 'enero', 'gen', 'gennaio', 'janeiro'],
  1: ['feb', 'february', 'febr', 'februar', 'fév', 'févr', 'février', 'febrero', 'febbraio', 'fev', 'fevereiro'],
  2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
  3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
  4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
  5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
  6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
  7: ['aug', 'august', 'août', 'ago', 'agosto'],
  8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
  9: ['oct', 'october', 'okt', 'oktober', 'octobre', 'octubre', 'ott', 'ottobre', 'out', 'outubro'],
  10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
  11: ['dec', 'december', 'dez', 'des', 'dezember', 'déc', 'décembre', 'dic', 'diciembre', 'dicembre', 'desember', 'dezembro']
};
const shortMonthKey = {};
each(MONTHS, function (abbr, m) {
  each(abbr, function (a) {
    shortMonthKey[a] = m;
  });
});
rx.MMM = {
  parse: new RegExp('(' + flatten(values(MONTHS)).join('|') + ')')
};
each(rx, function (r) {
  r.parse = r.parse.source;
  if (isRegExp(r.test)) r.test = r.test.source;else r.test = r.parse;
});
({
  // each format has two regex, a strict one for format guessing
  // based on a sample and a lazy one for parsing
  YYYY: {
    test: reg(rx.YYYY2.test),
    parse: reg(rx.YYYY2.parse),
    precision: 'year'
  },
  'YYYY-H': {
    test: reg(rx.YYYY.test, s0, rx.H.test),
    parse: reg(rx.YYYY.parse, s0, rx.H.parse),
    precision: 'half'
  },
  'H-YYYY': {
    test: reg(rx.H.test, s1, rx.YYYY.test),
    parse: reg(rx.H.parse, s1, rx.YYYY.parse),
    precision: 'half'
  },
  'YYYY-Q': {
    test: reg(rx.YYYY.test, s0, rx.Q.test),
    parse: reg(rx.YYYY.parse, s0, rx.Q.parse),
    precision: 'quarter'
  },
  'Q-YYYY': {
    test: reg(rx.Q.test, s1, rx.YYYY.test),
    parse: reg(rx.Q.parse, s1, rx.YYYY.parse),
    precision: 'quarter'
  },
  'YYYY-M': {
    test: reg(rx.YYYY.test, sM, rx.MM.test),
    parse: reg(rx.YYYY.parse, sM, rx.MM.parse),
    precision: 'month'
  },
  'M-YYYY': {
    test: reg(rx.MM.test, s1, rx.YYYY.test),
    parse: reg(rx.MM.parse, s1, rx.YYYY.parse),
    precision: 'month'
  },
  'YYYY-MMM': {
    test: reg(rx.YYYY.test, s1, rx.MMM.parse),
    parse: reg(rx.YYYY.parse, s1, rx.MMM.parse),
    precision: 'month'
  },
  'MMM-YYYY': {
    test: reg(rx.MMM.parse, s1, rx.YYYY.test),
    parse: reg(rx.MMM.parse, s1, rx.YYYY.parse),
    precision: 'month'
  },
  'MMM-YY': {
    test: reg(rx.MMM.parse, s1, rx.YY.test),
    parse: reg(rx.MMM.parse, s1, rx.YY.parse),
    precision: 'month'
  },
  MMM: {
    test: reg(rx.MMM.parse),
    parse: reg(rx.MMM.parse),
    precision: 'month'
  },
  'YYYY-WW': {
    test: reg(rx.YYYY.test, s0, rx.W.test),
    parse: reg(rx.YYYY.parse, s0, rx.W.parse),
    precision: 'week'
  },
  'WW-YYYY': {
    test: reg(rx.W.test, s1, rx.YYYY.test),
    parse: reg(rx.W.parse, s1, rx.YYYY.parse),
    precision: 'week'
  },
  'MM/DD/YYYY': {
    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test),
    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse),
    precision: 'day'
  },
  'MM/DD/YY': {
    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YY.test),
    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YY.parse),
    precision: 'day'
  },
  'DD/MM/YY': {
    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YY.test),
    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YY.parse),
    precision: 'day'
  },
  'DD/MM/YYYY': {
    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test),
    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse),
    precision: 'day'
  },
  'DD/MMM/YYYY': {
    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YYYY.test),
    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YYYY.parse),
    precision: 'day'
  },
  'DD/MMM/YY': {
    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YY.test),
    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YY.parse),
    precision: 'day'
  },
  'YYYY-MM-DD': {
    test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test),
    parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse),
    precision: 'day'
  },
  'MMM-DD-YYYY': {
    test: reg(rx.MMM.test, s1, rx.DD.test, s2, rx.YYYY.test),
    parse: reg(rx.MMM.parse, s1, rx.DD.parse, s2, rx.YYYY.parse),
    precision: 'day'
  },
  'YYYY-WW-d': {
    // year + ISO week + [day]
    test: reg(rx.YYYY.test, s0, rx.W.test, s1, rx.DOW.test),
    parse: reg(rx.YYYY.parse, s0, rx.W.parse, s1, rx.DOW.parse),
    precision: 'day'
  },
  // dates with a time
  'MM/DD/YYYY HH:MM': {
    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
    precision: 'day-minutes'
  },
  'DD.MM.YYYY HH:MM': {
    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
    precision: 'day-minutes'
  },
  'YYYY-MM-DD HH:MM': {
    test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
    parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse, s3, rx.HHMM.parse),
    precision: 'day-minutes'
  },
  ISO8601: {
    test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)/,
    parse: function (str) {
      return str;
    },
    precision: 'day-seconds'
  }
});

function reg() {
  return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
}var TEOF = 'TEOF';
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
};function TokenStream(parser, expression) {
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
  } else if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName()) {
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
      if (i === this.pos || c !== '_' && c !== '.' && (c < '0' || c > '9')) {
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
      if (i === this.pos || c !== '_' && (c < '0' || c > '9')) {
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
      } else if (i === this.pos || !hasLetter || c !== '_' && (c < '0' || c > '9')) {
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

    if (c >= '0' && c <= '9' || !foundDot && c === '.') {
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
};var INUMBER = 'INUMBER';
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
}function contains(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }

  return false;
}function ParserState(parser, tokenStream, options) {
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
  return this.nextToken = this.tokens.next();
};

ParserState.prototype.tokenMatches = function (token, value) {
  if (typeof value === 'undefined') {
    return true;
  } else if (Array.isArray(value)) {
    return contains(value, token.value);
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
      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || this.nextToken.type === TPAREN && this.nextToken.value === ')') {
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
        throw new Error('access to member "' + this.nextToken.value + '" is not permitted');
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
};function add(a, b) {
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
function random(a) {
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
  exp = -+exp; // If the value is not a number or the exp is not an integer...

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  } // Shift


  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp))); // Shift back

  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
}
function arrayIndex(array, index) {
  return array[index | 0];
}
function max(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}
function min(array) {
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
}function evaluate(tokens, expr, values) {
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
      nstack.push(function () {
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
        }; // f.name = n1


        Object.defineProperty(f, 'name', {
          value: n1,
          writable: false
        });
        values[n1] = f;
        return f;
      }());
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
  } // Explicitly return zero to avoid test issues caused by -0


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
}function Expression(tokens, parser) {
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

function trim$1(s) {
  return s.trim();
}

const RESTRICT_MEMBER_ACCESS = new Set(['__proto__', 'prototype', 'constructor']); // parser

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
    in: (needle, haystack) => Array.isArray(haystack) ? haystack.includes(needle) : String(haystack).includes(needle),
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
    return (arguments.length === 1 && Array.isArray(array) ? array : Array.from(arguments)).slice(0).filter(v => !isNaN(v) && Number.isFinite(v));
  } // fallback regular expressions for browsers without
  // support for the unicode flag //u


  let PROPER_REGEX = /\w*/g;
  let TITLE_REGEX = /\w\S*/g;
  const ESCAPE_REGEX = /[\\^$*+?.()|[\]{}]/g;

  try {
    PROPER_REGEX = new RegExp('\\p{L}*', 'ug');
    TITLE_REGEX = new RegExp('[\\p{L}\\p{N}]\\S*', 'ug');
  } catch (e) {// continue regardless of error
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
    RANDOM: random,

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
      return min(v);
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
      return max(filterNumbers.apply(this, arguments));
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
    TRIM: trim$1,

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
      return str.replace(new RegExp(String(search).replace(ESCAPE_REGEX, '\\$&'), 'g'), replace);
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
      return String(str).replace(PROPER_REGEX, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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
      return String(str).replace(TITLE_REGEX, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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

      return sepLast ? [arr.slice(0, arr.length - 1).join(sep), arr[arr.length - 1]].join(sepLast) : arr.join(sep);
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
      return arr.map(item => Object.prototype.hasOwnProperty.call(item, key) ? item[key] : null);
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
      if (typeof test !== 'function') throw new Error('Second argument to FIND is not a function');
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
      if (typeof test !== 'function') throw new Error('Second argument to EVERY is not a function');
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
      if (typeof test !== 'function') throw new Error('Second argument to SOME is not a function');
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

Parser.keywords = ['ABS', 'ACOS', 'ACOSH', 'and', 'ASIN', 'ASINH', 'ATAN', 'ATAN2', 'ATANH', 'CBRT', 'CEIL', 'CONCAT', 'COS', 'COSH', 'DATEDIFF', 'DAY', 'E', 'EVERY', 'EXP', 'EXPM1', 'FIND', 'FLOOR', 'HOURS', 'IF', 'in', 'INDEXOF', 'ISNULL', 'JOIN', 'LENGTH', 'LN', 'LOG', 'LOG10', 'LOG1P', 'LOG2', 'LOWER', 'MAP', 'MAX', 'MEAN', 'MEDIAN', 'MIN', 'MINUTES', 'MONTH', 'NOT', 'NOT', 'or', 'PI', 'PLUCK', 'POW', 'PROPER', 'RANDOM', 'RANGE', 'REPLACE', 'REPLACE_REGEX', 'ROUND', 'SECONDS', 'SIGN', 'SIN', 'SINH', 'SLICE', 'SOME', 'SORT', 'SPLIT', 'SQRT', 'SUBSTR', 'SUM', 'TAN', 'TANH', 'TIMEDIFF', 'TITLE', 'TRIM', 'TRUNC', 'UPPER', 'WEEKDAY', 'YEAR'];
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
};function width(element) {
  const w = parseFloat(getComputedStyle(element, null).width.replace('px', ''));
  return isNaN(w) ? 0 : w;
}
function domReady(callback) {
  if (/complete|interactive|loaded/.test(document.readyState)) {
    // dom is already loaded
    callback();
  } else {
    // wait for dom to load
    window.addEventListener('DOMContentLoaded', () => {
      callback();
    });
  }
}var fontfaceobserver_standalone = {exports: {}};/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */

(function (module) {
(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b);}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a();}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a();});}function t(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c);}
function u(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";";}function z(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function A(a,b){function c(){var a=k;z(a)&&a.a.parentNode&&b(a.g);}var k=a;l(a.b,c);l(a.c,c);z(a);}function B(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal";}var C=null,D=null,E=null,F=null;function G(){if(null===D)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);D=!!a&&603>parseInt(a[1],10);}else D=!1;return D}function J(){null===F&&(F=!!document.fonts);return F}
function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif";}catch(b){}E=""!==a.style.font;}return E}function L(a,b){return [a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
B.prototype.load=function(a,b){var c=this,k=a||"BESbswy",r=0,n=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=n?b(Error(""+n+"ms timeout exceeded")):document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25);},b);}e();}),N=new Promise(function(a,c){r=setTimeout(function(){c(Error(""+n+"ms timeout exceeded"));},n);});Promise.race([N,M]).then(function(){clearTimeout(r);a(c);},
b);}else m(function(){function v(){var b;if(b=-1!=f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===C&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),C=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=C&&(f==w&&g==w&&h==w||f==x&&g==x&&h==x||f==y&&g==y&&h==y)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(r),a(c));}function I(){if((new Date).getTime()-H>=n)d.parentNode&&d.parentNode.removeChild(d),b(Error(""+
n+"ms timeout exceeded"));else {var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,g=p.a.offsetWidth,h=q.a.offsetWidth,v();r=setTimeout(I,50);}}var e=new t(k),p=new t(k),q=new t(k),f=-1,g=-1,h=-1,w=-1,x=-1,y=-1,d=document.createElement("div");d.dir="ltr";u(e,L(c,"sans-serif"));u(p,L(c,"serif"));u(q,L(c,"monospace"));d.appendChild(e.a);d.appendChild(p.a);d.appendChild(q.a);document.body.appendChild(d);w=e.a.offsetWidth;x=p.a.offsetWidth;y=q.a.offsetWidth;I();A(e,function(a){f=a;v();});u(e,
L(c,'"'+c.family+'",sans-serif'));A(p,function(a){g=a;v();});u(p,L(c,'"'+c.family+'",serif'));A(q,function(a){h=a;v();});u(q,L(c,'"'+c.family+'",monospace'));});})};module.exports=B;}());
}(fontfaceobserver_standalone));

var FontFaceObserver = fontfaceobserver_standalone.exports;/**
 * Function that returns a promise, that resolves when all fonts,
 * specified in fontsJSON and typographyJSON have been loaded.
 *
 * @exports observeFonts
 * @kind function
 *
 * @param {Object|Array} fontsJSON
 * @param {Object} typographyJSON
 * @returns {Promise}
 */

function observeFonts(fontsJSON, typographyJSON) {
  /* Render vis again after fonts have been loaded */
  const fonts = new Set(Array.isArray(fontsJSON) ? [] : Object.keys(fontsJSON).filter(key => fontsJSON[key].type === 'font'));
  Object.keys(typographyJSON.fontFamilies || {}).forEach(fontFamily => {
    typographyJSON.fontFamilies[fontFamily].forEach(fontface => {
      /* If this font is being used in a font family */
      if (fonts.has(fontface.name)) {
        /* Remove it form the list of fonts to wait for */
        fonts.delete(fontface.name);
        /* And add it again with theme-defined weight and style */

        fonts.add({
          family: fontFamily,
          props: {
            weight: fontface.weight || 400,
            style: fontface.style || 'normal'
          }
        });
      }
    });
  });
  const observers = [];
  fonts.forEach(font => {
    const obs = typeof font === 'string' ? new FontFaceObserver(font) : new FontFaceObserver(font.family, font.props);
    observers.push(obs.load(null, 5000));
  });
  return Promise.all(observers);
}var emotionCssCreateInstance_cjs = {exports: {}};var emotionCssCreateInstance_cjs_prod = {};/*

Based off glamor's StyleSheet, thanks Sunil ❤️

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance

// usage

import { StyleSheet } from '@emotion/sheet'

let styleSheet = new StyleSheet({ key: '', container: document.head })

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/
// $FlowFixMe
function sheetForTag(tag) {
  if (tag.sheet) {
    // $FlowFixMe
    return tag.sheet;
  } // this weirdness brought to you by firefox

  /* istanbul ignore next */


  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      // $FlowFixMe
      return document.styleSheets[i];
    }
  }
}

function createStyleElement(options) {
  var tag = document.createElement('style');
  tag.setAttribute('data-emotion', options.key);

  if (options.nonce !== undefined) {
    tag.setAttribute('nonce', options.nonce);
  }

  tag.appendChild(document.createTextNode(''));
  tag.setAttribute('data-s', '');
  return tag;
}

var StyleSheet = /*#__PURE__*/function () {
  function StyleSheet(options) {
    var _this = this;

    this._insertTag = function (tag) {
      var before;

      if (_this.tags.length === 0) {
        before = _this.prepend ? _this.container.firstChild : _this.before;
      } else {
        before = _this.tags[_this.tags.length - 1].nextSibling;
      }

      _this.container.insertBefore(tag, before);

      _this.tags.push(tag);
    };

    this.isSpeedy = options.speedy === undefined ? "production" === 'production' : options.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

    this.key = options.key;
    this.container = options.container;
    this.prepend = options.prepend;
    this.before = null;
  }

  var _proto = StyleSheet.prototype;

  _proto.hydrate = function hydrate(nodes) {
    nodes.forEach(this._insertTag);
  };

  _proto.insert = function insert(rule) {
    // the max length is how many rules we have per style tag, it's 65000 in speedy mode
    // it's 1 in dev because we insert source maps that map a single rule to a location
    // and you can only have one source map per style tag
    if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
      this._insertTag(createStyleElement(this));
    }

    var tag = this.tags[this.tags.length - 1];

    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);

      try {
        // this is the ultrafast version, works across browsers
        // the big drawback is that the css won't be editable in devtools
        sheet.insertRule(rule, sheet.cssRules.length);
      } catch (e) {
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }

    this.ctr++;
  };

  _proto.flush = function flush() {
    // $FlowFixMe
    this.tags.forEach(function (tag) {
      return tag.parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;
  };

  return StyleSheet;
}();var MS = '-ms-';
var MOZ = '-moz-';
var WEBKIT = '-webkit-';

var COMMENT = 'comm';
var RULESET = 'rule';
var DECLARATION = 'decl';
var IMPORT = '@import';
var KEYFRAMES = '@keyframes';/**
 * @param {number}
 * @return {number}
 */
var abs = Math.abs;

/**
 * @param {number}
 * @return {string}
 */
var from = String.fromCharCode;

/**
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
function hash (value, length) {
	return (((((((length << 2) ^ charat(value, 0)) << 2) ^ charat(value, 1)) << 2) ^ charat(value, 2)) << 2) ^ charat(value, 3)
}

/**
 * @param {string} value
 * @return {string}
 */
function trim (value) {
	return value.trim()
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @return {string?}
 */
function match (value, pattern) {
	return (value = pattern.exec(value)) ? value[0] : value
}

/**
 * @param {string} value
 * @param {(string|RegExp)} pattern
 * @param {string} replacement
 * @return {string}
 */
function replace (value, pattern, replacement) {
	return value.replace(pattern, replacement)
}

/**
 * @param {string} value
 * @param {string} value
 * @return {number}
 */
function indexof (value, search) {
	return value.indexOf(search)
}

/**
 * @param {string} value
 * @param {number} index
 * @return {number}
 */
function charat (value, index) {
	return value.charCodeAt(index) | 0
}

/**
 * @param {string} value
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function substr (value, begin, end) {
	return value.slice(begin, end)
}

/**
 * @param {string} value
 * @return {number}
 */
function strlen (value) {
	return value.length
}

/**
 * @param {any[]} value
 * @return {number}
 */
function sizeof (value) {
	return value.length
}

/**
 * @param {any} value
 * @param {any[]} array
 * @return {any}
 */
function append (value, array) {
	return array.push(value), value
}

/**
 * @param {string[]} array
 * @param {function} callback
 * @return {string}
 */
function combine (array, callback) {
	return array.map(callback).join('')
}var line = 1;
var column = 1;
var length = 0;
var position = 0;
var character = 0;
var characters = '';

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {string} type
 * @param {string[]} props
 * @param {object[]} children
 * @param {number} length
 */
function node (value, root, parent, type, props, children, length) {
	return {value: value, root: root, parent: parent, type: type, props: props, children: children, line: line, column: column, length: length, return: ''}
}

/**
 * @param {string} value
 * @param {object} root
 * @param {string} type
 */
function copy (value, root, type) {
	return node(value, root.root, root.parent, type, root.props, root.children, 0)
}

/**
 * @return {number}
 */
function char () {
	return character
}

/**
 * @return {number}
 */
function prev () {
	character = position > 0 ? charat(characters, --position) : 0;

	if (column--, character === 10)
		column = 1, line--;

	return character
}

/**
 * @return {number}
 */
function next () {
	character = position < length ? charat(characters, position++) : 0;

	if (column++, character === 10)
		column = 1, line++;

	return character
}

/**
 * @return {number}
 */
function peek () {
	return charat(characters, position)
}

/**
 * @return {number}
 */
function caret () {
	return position
}

/**
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function slice (begin, end) {
	return substr(characters, begin, end)
}

/**
 * @param {number} type
 * @return {number}
 */
function token (type) {
	switch (type) {
		// \0 \t \n \r \s whitespace token
		case 0: case 9: case 10: case 13: case 32:
			return 5
		// ! + , / > @ ~ isolate token
		case 33: case 43: case 44: case 47: case 62: case 64: case 126:
		// ; { } breakpoint token
		case 59: case 123: case 125:
			return 4
		// : accompanied token
		case 58:
			return 3
		// " ' ( [ opening delimit token
		case 34: case 39: case 40: case 91:
			return 2
		// ) ] closing delimit token
		case 41: case 93:
			return 1
	}

	return 0
}

/**
 * @param {string} value
 * @return {any[]}
 */
function alloc (value) {
	return line = column = 1, length = strlen(characters = value), position = 0, []
}

/**
 * @param {any} value
 * @return {any}
 */
function dealloc (value) {
	return characters = '', value
}

/**
 * @param {number} type
 * @return {string}
 */
function delimit (type) {
	return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)))
}

/**
 * @param {number} type
 * @return {string}
 */
function whitespace (type) {
	while (character = peek())
		if (character < 33)
			next();
		else
			break

	return token(type) > 2 || token(character) > 3 ? '' : ' '
}

/**
 * @param {number} index
 * @param {number} count
 * @return {string}
 */
function escaping (index, count) {
	while (--count && next())
		// not 0-9 A-F a-f
		if (character < 48 || character > 102 || (character > 57 && character < 65) || (character > 70 && character < 97))
			break

	return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32))
}

/**
 * @param {number} type
 * @return {number}
 */
function delimiter (type) {
	while (next())
		switch (character) {
			// ] ) " '
			case type:
				return position
			// " '
			case 34: case 39:
				return delimiter(type === 34 || type === 39 ? type : character)
			// (
			case 40:
				if (type === 41)
					delimiter(type);
				break
			// \
			case 92:
				next();
				break
		}

	return position
}

/**
 * @param {number} type
 * @param {number} index
 * @return {number}
 */
function commenter (type, index) {
	while (next())
		// //
		if (type + character === 47 + 10)
			break
		// /*
		else if (type + character === 42 + 42 && peek() === 47)
			break

	return '/*' + slice(index, position - 1) + '*' + from(type === 47 ? type : next())
}

/**
 * @param {number} index
 * @return {string}
 */
function identifier (index) {
	while (!token(peek()))
		next();

	return slice(index, position)
}/**
 * @param {string} value
 * @return {object[]}
 */
function compile (value) {
	return dealloc(parse('', null, null, null, [''], value = alloc(value), 0, [0], value))
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {string[]} rule
 * @param {string[]} rules
 * @param {string[]} rulesets
 * @param {number[]} pseudo
 * @param {number[]} points
 * @param {string[]} declarations
 * @return {object}
 */
function parse (value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
	var index = 0;
	var offset = 0;
	var length = pseudo;
	var atrule = 0;
	var property = 0;
	var previous = 0;
	var variable = 1;
	var scanning = 1;
	var ampersand = 1;
	var character = 0;
	var type = '';
	var props = rules;
	var children = rulesets;
	var reference = rule;
	var characters = type;

	while (scanning)
		switch (previous = character, character = next()) {
			// " ' [ (
			case 34: case 39: case 91: case 40:
				characters += delimit(character);
				break
			// \t \n \r \s
			case 9: case 10: case 13: case 32:
				characters += whitespace(previous);
				break
			// \
			case 92:
				characters += escaping(caret() - 1, 7);
				continue
			// /
			case 47:
				switch (peek()) {
					case 42: case 47:
						append(comment(commenter(next(), caret()), root, parent), declarations);
						break
					default:
						characters += '/';
				}
				break
			// {
			case 123 * variable:
				points[index++] = strlen(characters) * ampersand;
			// } ; \0
			case 125 * variable: case 59: case 0:
				switch (character) {
					// \0 }
					case 0: case 125: scanning = 0;
					// ;
					case 59 + offset:
						if (property > 0 && (strlen(characters) - length))
							append(property > 32 ? declaration(characters + ';', rule, parent, length - 1) : declaration(replace(characters, ' ', '') + ';', rule, parent, length - 2), declarations);
						break
					// @ ;
					case 59: characters += ';';
					// { rule/at-rule
					default:
						append(reference = ruleset(characters, root, parent, index, offset, rules, points, type, props = [], children = [], length), rulesets);

						if (character === 123)
							if (offset === 0)
								parse(characters, root, reference, reference, props, rulesets, length, points, children);
							else
								switch (atrule) {
									// d m s
									case 100: case 109: case 115:
										parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length), children), rules, children, length, points, rule ? props : children);
										break
									default:
										parse(characters, reference, reference, reference, [''], children, length, points, children);
								}
				}

				index = offset = property = 0, variable = ampersand = 1, type = characters = '', length = pseudo;
				break
			// :
			case 58:
				length = 1 + strlen(characters), property = previous;
			default:
				if (variable < 1)
					if (character == 123)
						--variable;
					else if (character == 125 && variable++ == 0 && prev() == 125)
						continue

				switch (characters += from(character), character * variable) {
					// &
					case 38:
						ampersand = offset > 0 ? 1 : (characters += '\f', -1);
						break
					// ,
					case 44:
						points[index++] = (strlen(characters) - 1) * ampersand, ampersand = 1;
						break
					// @
					case 64:
						// -
						if (peek() === 45)
							characters += delimit(next());

						atrule = peek(), offset = strlen(type = characters += identifier(caret())), character++;
						break
					// -
					case 45:
						if (previous === 45 && strlen(characters) == 2)
							variable = 0;
				}
		}

	return rulesets
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} index
 * @param {number} offset
 * @param {string[]} rules
 * @param {number[]} points
 * @param {string} type
 * @param {string[]} props
 * @param {string[]} children
 * @param {number} length
 * @return {object}
 */
function ruleset (value, root, parent, index, offset, rules, points, type, props, children, length) {
	var post = offset - 1;
	var rule = offset === 0 ? rules : [''];
	var size = sizeof(rule);

	for (var i = 0, j = 0, k = 0; i < index; ++i)
		for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size; ++x)
			if (z = trim(j > 0 ? rule[x] + ' ' + y : replace(y, /&\f/g, rule[x])))
				props[k++] = z;

	return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length)
}

/**
 * @param {number} value
 * @param {object} root
 * @param {object?} parent
 * @return {object}
 */
function comment (value, root, parent) {
	return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0)
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} length
 * @return {object}
 */
function declaration (value, root, parent, length) {
	return node(value, root, parent, DECLARATION, substr(value, 0, length), substr(value, length + 1, -1), length)
}/**
 * @param {string} value
 * @param {number} length
 * @return {string}
 */
function prefix (value, length) {
	switch (hash(value, length)) {
		// color-adjust
		case 5103:
			return WEBKIT + 'print-' + value + value
		// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
		case 5737: case 4201: case 3177: case 3433: case 1641: case 4457: case 2921:
		// text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
		case 5572: case 6356: case 5844: case 3191: case 6645: case 3005:
		// mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
		case 6391: case 5879: case 5623: case 6135: case 4599: case 4855:
		// background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
		case 4215: case 6389: case 5109: case 5365: case 5621: case 3829:
			return WEBKIT + value + value
		// appearance, user-select, transform, hyphens, text-size-adjust
		case 5349: case 4246: case 4810: case 6968: case 2756:
			return WEBKIT + value + MOZ + value + MS + value + value
		// flex, flex-direction
		case 6828: case 4268:
			return WEBKIT + value + MS + value + value
		// order
		case 6165:
			return WEBKIT + value + MS + 'flex-' + value + value
		// align-items
		case 5187:
			return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + 'box-$1$2' + MS + 'flex-$1$2') + value
		// align-self
		case 5443:
			return WEBKIT + value + MS + 'flex-item-' + replace(value, /flex-|-self/, '') + value
		// align-content
		case 4675:
			return WEBKIT + value + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/, '') + value
		// flex-shrink
		case 5548:
			return WEBKIT + value + MS + replace(value, 'shrink', 'negative') + value
		// flex-basis
		case 5292:
			return WEBKIT + value + MS + replace(value, 'basis', 'preferred-size') + value
		// flex-grow
		case 6060:
			return WEBKIT + 'box-' + replace(value, '-grow', '') + WEBKIT + value + MS + replace(value, 'grow', 'positive') + value
		// transition
		case 4554:
			return WEBKIT + replace(value, /([^-])(transform)/g, '$1' + WEBKIT + '$2') + value
		// cursor
		case 6187:
			return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + '$1'), /(image-set)/, WEBKIT + '$1'), value, '') + value
		// background, background-image
		case 5495: case 3959:
			return replace(value, /(image-set\([^]*)/, WEBKIT + '$1' + '$`$1')
		// justify-content
		case 4968:
			return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + 'box-pack:$3' + MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + WEBKIT + value + value
		// (margin|padding)-inline-(start|end)
		case 4095: case 3583: case 4068: case 2532:
			return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + value
		// (min|max)?(width|height|inline-size|block-size)
		case 8116: case 7059: case 5753: case 5535:
		case 5445: case 5701: case 4933: case 4677:
		case 5533: case 5789: case 5021: case 4765:
			// stretch, max-content, min-content, fill-available
			if (strlen(value) - 1 - length > 6)
				switch (charat(value, length + 1)) {
					// (m)ax-content, (m)in-content
					case 109:
						// -
						if (charat(value, length + 4) !== 45)
							break
					// (f)ill-available, (f)it-content
					case 102:
						return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + (charat(value, length + 3) == 108 ? '$3' : '$2-$3')) + value
					// (s)tretch
					case 115:
						return ~indexof(value, 'stretch') ? prefix(replace(value, 'stretch', 'fill-available'), length) + value : value
				}
			break
		// position: sticky
		case 4949:
			// (s)ticky?
			if (charat(value, length + 1) !== 115)
				break
		// display: (flex|inline-flex)
		case 6444:
			switch (charat(value, strlen(value) - 3 - (~indexof(value, '!important') && 10))) {
				// stic(k)y
				case 107:
					return replace(value, ':', ':' + WEBKIT) + value
				// (inline-)?fl(e)x
				case 101:
					return replace(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + WEBKIT + (charat(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + WEBKIT + '$2$3' + '$1' + MS + '$2box$3') + value
			}
			break
		// writing-mode
		case 5936:
			switch (charat(value, length + 11)) {
				// vertical-l(r)
				case 114:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + value
				// vertical-r(l)
				case 108:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value
				// horizontal(-)tb
				case 45:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + value
			}

			return WEBKIT + value + MS + value + value
	}

	return value
}/**
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
function serialize$1 (children, callback) {
	var output = '';
	var length = sizeof(children);

	for (var i = 0; i < length; i++)
		output += callback(children[i], i, children, callback) || '';

	return output
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
function stringify (element, index, children, callback) {
	switch (element.type) {
		case IMPORT: case DECLARATION: return element.return = element.return || element.value
		case COMMENT: return ''
		case RULESET: element.value = element.props.join(',');
	}

	return strlen(children = serialize$1(element.children, callback)) ? element.return = element.value + '{' + children + '}' : ''
}/**
 * @param {function[]} collection
 * @return {function}
 */
function middleware (collection) {
	var length = sizeof(collection);

	return function (element, index, children, callback) {
		var output = '';

		for (var i = 0; i < length; i++)
			output += collection[i](element, index, children, callback) || '';

		return output
	}
}

/**
 * @param {function} callback
 * @return {function}
 */
function rulesheet (callback) {
	return function (element) {
		if (!element.root)
			if (element = element.return)
				callback(element);
	}
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 */
function prefixer (element, index, children, callback) {
	if (!element.return)
		switch (element.type) {
			case DECLARATION: element.return = prefix(element.value, element.length);
				break
			case KEYFRAMES:
				return serialize$1([copy(replace(element.value, '@', '@' + WEBKIT), element, '')], callback)
			case RULESET:
				if (element.length)
					return combine(element.props, function (value) {
						switch (match(value, /(::plac\w+|:read-\w+)/)) {
							// :read-(only|write)
							case ':read-only': case ':read-write':
								return serialize$1([copy(replace(value, /:(read-\w+)/, ':' + MOZ + '$1'), element, '')], callback)
							// :placeholder
							case '::placeholder':
								return serialize$1([
									copy(replace(value, /:(plac\w+)/, ':' + WEBKIT + 'input-$1'), element, ''),
									copy(replace(value, /:(plac\w+)/, ':' + MOZ + '$1'), element, ''),
									copy(replace(value, /:(plac\w+)/, MS + 'input-$1'), element, '')
								], callback)
						}

						return ''
					})
		}
}var weakMemoize = function weakMemoize(func) {
  // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps
  var cache = new WeakMap();
  return function (arg) {
    if (cache.has(arg)) {
      // $FlowFixMe
      return cache.get(arg);
    }

    var ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};function memoize(fn) {
  var cache = Object.create(null);
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}var toRules = function toRules(parsed, points) {
  // pretend we've started with a comma
  var index = -1;
  var character = 44;

  do {
    switch (token(character)) {
      case 0:
        // &\f
        if (character === 38 && peek() === 12) {
          // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
          // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
          // and when it should just concatenate the outer and inner selectors
          // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
          points[index] = 1;
        }

        parsed[index] += identifier(position - 1);
        break;

      case 2:
        parsed[index] += delimit(character);
        break;

      case 4:
        // comma
        if (character === 44) {
          // colon
          parsed[++index] = peek() === 58 ? '&\f' : '';
          points[index] = parsed[index].length;
          break;
        }

      // fallthrough

      default:
        parsed[index] += from(character);
    }
  } while (character = next());

  return parsed;
};

var getRules = function getRules(value, points) {
  return dealloc(toRules(alloc(value), points));
}; // WeakSet would be more appropriate, but only WeakMap is supported in IE11


var fixedElements = /* #__PURE__ */new WeakMap();
var compat = function compat(element) {
  if (element.type !== 'rule' || !element.parent || // .length indicates if this rule contains pseudo or not
  !element.length) {
    return;
  }

  var value = element.value,
      parent = element.parent;
  var isImplicitRule = element.column === parent.column && element.line === parent.line;

  while (parent.type !== 'rule') {
    parent = parent.parent;
    if (!parent) return;
  } // short-circuit for the simplest case


  if (element.props.length === 1 && value.charCodeAt(0) !== 58
  /* colon */
  && !fixedElements.get(parent)) {
    return;
  } // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
  // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"


  if (isImplicitRule) {
    return;
  }

  fixedElements.set(element, true);
  var points = [];
  var rules = getRules(value, points);
  var parentRules = parent.props;

  for (var i = 0, k = 0; i < rules.length; i++) {
    for (var j = 0; j < parentRules.length; j++, k++) {
      element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
    }
  }
};
var removeLabel = function removeLabel(element) {
  if (element.type === 'decl') {
    var value = element.value;

    if ( // charcode for l
    value.charCodeAt(0) === 108 && // charcode for b
    value.charCodeAt(2) === 98) {
      // this ignores label
      element["return"] = '';
      element.value = '';
    }
  }
};

var isBrowser$1 = typeof document !== 'undefined';
var getServerStylisCache = isBrowser$1 ? undefined : weakMemoize(function () {
  return memoize(function () {
    var cache = {};
    return function (name) {
      return cache[name];
    };
  });
});
var defaultStylisPlugins = [prefixer];

var createCache$1 = function createCache(options) {
  var key = options.key;

  if (isBrowser$1 && key === 'css') {
    var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
    // document.head is a safe place to move them to

    Array.prototype.forEach.call(ssrStyles, function (node) {
      document.head.appendChild(node);
      node.setAttribute('data-s', '');
    });
  }

  var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;

  var inserted = {}; // $FlowFixMe

  var container;
  var nodesToHydrate = [];

  if (isBrowser$1) {
    container = options.container || document.head;
    Array.prototype.forEach.call(document.querySelectorAll("style[data-emotion]"), function (node) {
      var attrib = node.getAttribute("data-emotion").split(' ');

      if (attrib[0] !== key) {
        return;
      } // $FlowFixMe


      for (var i = 1; i < attrib.length; i++) {
        inserted[attrib[i]] = true;
      }

      nodesToHydrate.push(node);
    });
  }

  var _insert;

  var omnipresentPlugins = [compat, removeLabel];

  if (isBrowser$1) {
    var currentSheet;
    var finalizingPlugins = [stringify, rulesheet(function (rule) {
      currentSheet.insert(rule);
    })];
    var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));

    var stylis = function stylis(styles) {
      return serialize$1(compile(styles), serializer);
    };

    _insert = function insert(selector, serialized, sheet, shouldCache) {
      currentSheet = sheet;

      stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);

      if (shouldCache) {
        cache.inserted[serialized.name] = true;
      }
    };
  } else {
    var _finalizingPlugins = [stringify];

    var _serializer = middleware(omnipresentPlugins.concat(stylisPlugins, _finalizingPlugins));

    var _stylis = function _stylis(styles) {
      return serialize$1(compile(styles), _serializer);
    }; // $FlowFixMe


    var serverStylisCache = getServerStylisCache(stylisPlugins)(key);

    var getRules = function getRules(selector, serialized) {
      var name = serialized.name;

      if (serverStylisCache[name] === undefined) {
        serverStylisCache[name] = _stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
      }

      return serverStylisCache[name];
    };

    _insert = function _insert(selector, serialized, sheet, shouldCache) {
      var name = serialized.name;
      var rules = getRules(selector, serialized);

      if (cache.compat === undefined) {
        // in regular mode, we don't set the styles on the inserted cache
        // since we don't need to and that would be wasting memory
        // we return them so that they are rendered in a style tag
        if (shouldCache) {
          cache.inserted[name] = true;
        }

        return rules;
      } else {
        // in compat mode, we put the styles on the inserted cache so
        // that emotion-server can pull out the styles
        // except when we don't want to cache it which was in Global but now
        // is nowhere but we don't want to do a major right now
        // and just in case we're going to leave the case here
        // it's also not affecting client side bundle size
        // so it's really not a big deal
        if (shouldCache) {
          cache.inserted[name] = rules;
        } else {
          return rules;
        }
      }
    };
  }

  var cache = {
    key: key,
    sheet: new StyleSheet({
      key: key,
      container: container,
      nonce: options.nonce,
      speedy: options.speedy,
      prepend: options.prepend
    }),
    nonce: options.nonce,
    inserted: inserted,
    registered: {},
    insert: _insert
  };
  cache.sheet.hydrate(nodesToHydrate);
  return cache;
};var emotionCache_esm=/*#__PURE__*/Object.freeze({__proto__:null,'default':createCache$1});var require$$0 = /*@__PURE__*/getAugmentedNamespace(emotionCache_esm);/* eslint-disable */
// Inspired by https://github.com/garycourt/murmurhash-js
// Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
function murmur2(str) {
  // 'm' and 'r' are mixing constants generated offline.
  // They're not really 'magic', they just happen to work well.
  // const m = 0x5bd1e995;
  // const r = 24;
  // Initialize the hash
  var h = 0; // Mix 4 bytes at a time into the hash

  var k,
      i = 0,
      len = str.length;

  for (; len >= 4; ++i, len -= 4) {
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
    k =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
    k ^=
    /* k >>> r: */
    k >>> 24;
    h =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
    /* Math.imul(h, m): */
    (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Handle the last few bytes of the input array


  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Do a few final mixes of the hash to ensure the last few
  // bytes are well-incorporated.


  h ^= h >>> 13;
  h =
  /* Math.imul(h, m): */
  (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  return ((h ^ h >>> 15) >>> 0).toString(36);
}var unitlessKeys = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

var isCustomProperty = function isCustomProperty(property) {
  return property.charCodeAt(1) === 45;
};

var isProcessableValue = function isProcessableValue(value) {
  return value != null && typeof value !== 'boolean';
};

var processStyleName = /* #__PURE__ */memoize(function (styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
});

var processStyleValue = function processStyleValue(key, value) {
  switch (key) {
    case 'animation':
    case 'animationName':
      {
        if (typeof value === 'string') {
          return value.replace(animationRegex, function (match, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
  }

  if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
    return value + 'px';
  }

  return value;
};

function handleInterpolation(mergedProps, registered, interpolation) {
  if (interpolation == null) {
    return '';
  }

  if (interpolation.__emotion_styles !== undefined) {

    return interpolation;
  }

  switch (typeof interpolation) {
    case 'boolean':
      {
        return '';
      }

    case 'object':
      {
        if (interpolation.anim === 1) {
          cursor = {
            name: interpolation.name,
            styles: interpolation.styles,
            next: cursor
          };
          return interpolation.name;
        }

        if (interpolation.styles !== undefined) {
          var next = interpolation.next;

          if (next !== undefined) {
            // not the most efficient thing ever but this is a pretty rare case
            // and there will be very few iterations of this generally
            while (next !== undefined) {
              cursor = {
                name: next.name,
                styles: next.styles,
                next: cursor
              };
              next = next.next;
            }
          }

          var styles = interpolation.styles + ";";

          return styles;
        }

        return createStringFromObject(mergedProps, registered, interpolation);
      }

    case 'function':
      {
        if (mergedProps !== undefined) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result);
        }

        break;
      }
  } // finalize string values (regular strings and functions interpolated into css calls)


  if (registered == null) {
    return interpolation;
  }

  var cached = registered[interpolation];
  return cached !== undefined ? cached : interpolation;
}

function createStringFromObject(mergedProps, registered, obj) {
  var string = '';

  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
    }
  } else {
    for (var _key in obj) {
      var value = obj[_key];

      if (typeof value !== 'object') {
        if (registered != null && registered[value] !== undefined) {
          string += _key + "{" + registered[value] + "}";
        } else if (isProcessableValue(value)) {
          string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
        }
      } else {
        if (_key === 'NO_COMPONENT_SELECTOR' && "production" !== 'production') {
          throw new Error('Component selectors can only be used in conjunction with @emotion/babel-plugin.');
        }

        if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value);

          switch (_key) {
            case 'animation':
            case 'animationName':
              {
                string += processStyleName(_key) + ":" + interpolated + ";";
                break;
              }

            default:
              {

                string += _key + "{" + interpolated + "}";
              }
          }
        }
      }
    }
  }

  return string;
}

var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
// keyframes are stored on the SerializedStyles object as a linked list


var cursor;
var serializeStyles = function serializeStyles(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
    return args[0];
  }

  var stringMode = true;
  var styles = '';
  cursor = undefined;
  var strings = args[0];

  if (strings == null || strings.raw === undefined) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings);
  } else {

    styles += strings[0];
  } // we start at 1 since we've already handled the first arg


  for (var i = 1; i < args.length; i++) {
    styles += handleInterpolation(mergedProps, registered, args[i]);

    if (stringMode) {

      styles += strings[i];
    }
  }


  labelPattern.lastIndex = 0;
  var identifierName = '';
  var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

  while ((match = labelPattern.exec(styles)) !== null) {
    identifierName += '-' + // $FlowFixMe we know it's not null
    match[1];
  }

  var name = murmur2(styles) + identifierName;

  return {
    name: name,
    styles: styles,
    next: cursor
  };
};var emotionSerialize_esm=/*#__PURE__*/Object.freeze({__proto__:null,serializeStyles:serializeStyles});var require$$1 = /*@__PURE__*/getAugmentedNamespace(emotionSerialize_esm);var isBrowser = typeof document !== 'undefined';
function getRegisteredStyles(registered, registeredStyles, classNames) {
  var rawClassName = '';
  classNames.split(' ').forEach(function (className) {
    if (registered[className] !== undefined) {
      registeredStyles.push(registered[className] + ";");
    } else {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var insertStyles = function insertStyles(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;

  if ( // we only need to add the styles to the registered cache if the
  // class name could be used further down
  // the tree but if it's a string tag, we know it won't
  // so we don't have to add it to registered cache.
  // this improves memory usage since we can avoid storing the whole style string
  (isStringTag === false || // we need to always store it if we're in compat mode and
  // in node since emotion-server relies on whether a style is in
  // the registered cache to know whether a style is global or not
  // also, note that this check will be dead code eliminated in the browser
  isBrowser === false && cache.compat !== undefined) && cache.registered[className] === undefined) {
    cache.registered[className] = serialized.styles;
  }

  if (cache.inserted[serialized.name] === undefined) {
    var stylesForSSR = '';
    var current = serialized;

    do {
      var maybeStyles = cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);

      if (!isBrowser && maybeStyles !== undefined) {
        stylesForSSR += maybeStyles;
      }

      current = current.next;
    } while (current !== undefined);

    if (!isBrowser && stylesForSSR.length !== 0) {
      return stylesForSSR;
    }
  }
};var emotionUtils_esm=/*#__PURE__*/Object.freeze({__proto__:null,getRegisteredStyles:getRegisteredStyles,insertStyles:insertStyles});var require$$2 = /*@__PURE__*/getAugmentedNamespace(emotionUtils_esm);Object.defineProperty(emotionCssCreateInstance_cjs_prod, "__esModule", {
  value: !0
});

var createCache = require$$0, serialize = require$$1, utils = require$$2;

function _interopDefault$1(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

var createCache__default = _interopDefault$1(createCache);

function insertWithoutScoping(cache, serialized) {
  if (void 0 === cache.inserted[serialized.name]) return cache.insert("", serialized, cache.sheet, !0);
}

function merge(registered, css, className) {
  var registeredStyles = [], rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);
  return registeredStyles.length < 2 ? className : rawClassName + css(registeredStyles);
}

var createEmotion$1 = function(options) {
  var cache = createCache__default.default(options);
  cache.sheet.speedy = function(value) {
    this.isSpeedy = value;
  }, cache.compat = !0;
  var css = function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
    var serialized = serialize.serializeStyles(args, cache.registered, void 0);
    return utils.insertStyles(cache, serialized, !1), cache.key + "-" + serialized.name;
  };
  return {
    css: css,
    cx: function() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
      return merge(cache.registered, css, classnames(args));
    },
    injectGlobal: function() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) args[_key3] = arguments[_key3];
      var serialized = serialize.serializeStyles(args, cache.registered);
      insertWithoutScoping(cache, serialized);
    },
    keyframes: function() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
      var serialized = serialize.serializeStyles(args, cache.registered), animation = "animation-" + serialized.name;
      return insertWithoutScoping(cache, {
        name: serialized.name,
        styles: "@keyframes " + animation + "{" + serialized.styles + "}"
      }), animation;
    },
    hydrate: function(ids) {
      ids.forEach((function(key) {
        cache.inserted[key] = !0;
      }));
    },
    flush: function() {
      cache.registered = {}, cache.inserted = {}, cache.sheet.flush();
    },
    sheet: cache.sheet,
    cache: cache,
    getRegisteredStyles: utils.getRegisteredStyles.bind(null, cache.registered),
    merge: merge.bind(null, cache.registered, css)
  };
}, classnames = function classnames(args) {
  for (var cls = "", i = 0; i < args.length; i++) {
    var arg = args[i];
    if (null != arg) {
      var toAdd = void 0;
      switch (typeof arg) {
       case "boolean":
        break;

       case "object":
        if (Array.isArray(arg)) toAdd = classnames(arg); else for (var k in toAdd = "", 
        arg) arg[k] && k && (toAdd && (toAdd += " "), toAdd += k);
        break;

       default:
        toAdd = arg;
      }
      toAdd && (cls && (cls += " "), cls += toAdd);
    }
  }
  return cls;
};

emotionCssCreateInstance_cjs_prod.default = createEmotion$1;{
  emotionCssCreateInstance_cjs.exports = emotionCssCreateInstance_cjs_prod;
}

var createEmotion = emotionCssCreateInstance_cjs.exports;var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;/**
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
}/**
 * Inverts a color to have a similar contrast against an inverted background
 *
 * Accepts color definitions in formats supported by chroma.js
 * (e.g. 'red', '#FF0000', [255, 0, 0])
 *
 * @exports invertColor
 * @kind function
 *
 * @param {string|Array|Object} baseColor - the color to be inverted
 * @param {string|Array|Object} darkBackgroundColor - the inverted background color
 * @param {string|Array|Object} lightBackgroundColor - the original background color
 * @param {number} gamma - gamma exponent for lightness correction
 *
 * @example
 * import invertColor from '@datawrapper/shared/invertColor.cjs';

 * const darkModeColor = invertColor('#ff99gg', 'black', 'white');
 *
 * @export
 * @returns {string} hex color
 */
const chroma = chroma$2.exports;
const MAX_ITER = 10;
const EPS = 0.01;

var invertColor = function invertColor(baseColor, darkBackgroundColor, lightBackgroundColor, gamma = 0.8) {
  const color = chroma(baseColor).alpha(1);
  const alpha = chroma(baseColor).alpha();
  if (alpha === 0) return baseColor;
  const prevL = color.lab()[0];
  const bgLightL = chroma(lightBackgroundColor).lab()[0];
  const bgDarkL = chroma(darkBackgroundColor).lab()[0];
  const contrast = computeContrast(baseColor, lightBackgroundColor); // contrast 1:1, return bg

  if (Math.abs(contrast - 1) < EPS) return darkBackgroundColor;
  const origIsDarker = bgLightL > prevL;
  const result = origIsDarker ? test(bgDarkL, 100, MAX_ITER) : test(0, bgDarkL, MAX_ITER); // gamma correction

  const resL = result.lab()[0];
  const correctedL = Math.pow(resL / 100, gamma) * 100;
  const invertedColor = result.set('lab.l', correctedL).hex();
  if (alpha === 1) return invertedColor; // restore opacity, but adjust

  const perceivedColor = chroma.mix(darkBackgroundColor, invertedColor, alpha, 'rgb');
  const perceivedContrast = chroma.contrast(darkBackgroundColor, perceivedColor);
  const boostedContrast = perceivedContrast * getContrastBoost(perceivedContrast, 1.05);
  const newAlpha = correctOpacity(invertedColor, darkBackgroundColor, alpha, boostedContrast);
  return chroma(invertedColor).alpha(newAlpha).hex();

  function test(low, high, i) {
    const mid = (low + high) * 0.5;
    const col = chroma(baseColor).set('lab.l', mid);
    const colContrast = computeContrast(darkBackgroundColor, col);

    if (Math.abs(colContrast - contrast) < EPS || !i) {
      // close enough
      return col;
    }

    const colIsLighter = mid > bgDarkL;
    const goodSide = colIsLighter && origIsDarker || !colIsLighter && origIsDarker;
    return goodSide && colContrast > contrast || !goodSide && colContrast < contrast ? test(low, mid, i - 1) : test(mid, high, i - 1);
  }
};

function computeContrast(colA, colB) {
  // TODO: maybe find a better contrast computation some day
  // as there are some problems with W3C contrast ratios
  return chroma.contrast(colA, colB);
}

function getContrastBoost(contrast, maxBoost) {
  const cMin = 1.5;
  const cMax = 3;
  return 1 + (contrast < cMin ? 1 : contrast > cMax ? 0 : 1 - (contrast - cMin) / (cMax - cMin)) * (maxBoost - 1);
}

function correctOpacity(color, background, opacity, targetContrast) {
  const MAX_ITER = 10;
  const EPS = 0.01;
  const fgOpaque = chroma.mix(background, color, opacity, 'rgb');
  const contrast = chroma.contrast(fgOpaque, background);

  if (contrast - targetContrast > -EPS || !opacity) {
    // we do have enough contrast, keep opacity
    return opacity;
  }

  return test(opacity, 1, MAX_ITER);

  function test(low, high, i) {
    const mid = (low + high) / 2;
    const fgOpaque = chroma.mix(background, color, mid, 'rgb');
    const contrast = chroma.contrast(fgOpaque, background);

    if (Math.abs(contrast - targetContrast) < EPS || !i) {
      // close enough
      return mid;
    }

    return contrast < targetContrast ? test(mid, high, i - 1) : test(low, mid, i - 1);
  }
}function getVersion(RE) {
  return function (userAgent) {
    const raw = userAgent.toLowerCase().match(RE);
    return raw ? parseInt(raw[1], 10) : false;
  };
}

var getVersion$1 = {
  chrome: getVersion(/chrom(?:e|ium)\/([0-9]+)\./),
  firefox: getVersion(/firefox\/([0-9]+\.*[0-9]*)/),
  safari: getVersion(/version\/([0-9]+).[0-9]+.[0-9]+ safari/),
  ie: getVersion(/(?:msie |rv:)([0-9]+).[0-9]+/),
  edge: getVersion(/edge\/([0-9]+).[0-9]+.[0-9]+/)
};function getBrowser() {
  const userAgent = navigator.userAgent; // Firefox 1.0+

  const isFirefox = typeof InstallTrigger !== 'undefined'; // Safari 3.0+ "[object HTMLElementConstructor]"

  const isSafari = /constructor/i.test(window.HTMLElement) || function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
  }(!window.safari || window.safari.pushNotification); // Internet Explorer 6-11


  const isIE =
  /* @cc_on!@ */
  !!document.documentMode; // Edge 20+

  const isEdge = !isIE && !!window.StyleMedia; // Chrome, Chromium 1+ or Chrome WebView (from https://stackoverflow.com/questions/9847580)

  const isChromeBrowser = /HeadlessChrome/.test(userAgent) || !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  const isChromeWebView = /; wv/.test(userAgent) && /Chrome/.test(userAgent);
  const isSamsungInternet = /SAMSUNG/.test(userAgent) && /Chrome/.test(userAgent);
  const isChrome = isChromeBrowser || isChromeWebView || isSamsungInternet;
  const browser = isChrome ? 'chrome' : isFirefox ? 'firefox' : isSafari ? 'safari' : isIE ? 'ie' : isEdge ? 'edge' : false;
  const version = browser && getVersion$1[browser] ? getVersion$1[browser](userAgent) : false;
  return {
    browser: browser,
    version: version
  };
}/* lib/Visualization.svelte generated by Svelte v3.23.2 */
const allowedAriaDescriptionTags = "<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt><table><thead><tbody><tfoot><caption><colgroup><col><tr><td><th>";

function byPriority(a, b) {
  return (a.priority !== undefined ? a.priority : 999) - (b.priority !== undefined ? b.priority : 999);
}

function getCaption(id) {
  if (id === "d3-maps-choropleth" || id === "d3-maps-symbols" || id === "locator-map") return "map";else if (id === "tables") return "table";
  return "chart";
}

const Visualization = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
  let {
    chart
  } = $$props;
  let {
    visualization = {}
  } = $$props;
  let {
    teamPublicSettings = {}
  } = $$props;
  let {
    theme = {}
  } = $$props;
  let {
    themeDataDark = {}
  } = $$props;
  let {
    themeDataLight = {}
  } = $$props;
  let {
    locales = {}
  } = $$props;
  let {
    textDirection = "ltr"
  } = $$props;
  let {
    translations
  } = $$props;
  let {
    blocks = {}
  } = $$props;
  let {
    chartAfterBodyHTML = ""
  } = $$props;
  let {
    isIframe
  } = $$props;
  let {
    isPreview
  } = $$props;
  let {
    assets
  } = $$props;
  let {
    styleHolder
  } = $$props;
  let {
    origin
  } = $$props;
  let {
    externalDataUrl
  } = $$props;
  let {
    outerContainer
  } = $$props;
  let {
    isStyleTransparent = false
  } = $$props;
  let {
    isStylePlain = false
  } = $$props;
  let {
    isStyleStatic = false
  } = $$props;
  let {
    isStyleDark = false
  } = $$props;
  let {
    isAutoDark = false
  } = $$props;
  let {
    forceLogo = "auto"
  } = $$props;
  let {
    logoId = null
  } = $$props;
  let {
    frontendDomain = "app.datawrapper.de"
  } = $$props; // .dw-chart-body

  let target, dwChart, vis;

  let postEvent = () => {};

  const flags = {
    isIframe
  };
  let useFallbackImage = false;
  const FLAG_TYPES = {
    plain: Boolean,
    static: Boolean,
    svgonly: Boolean,
    map2svg: Boolean,
    transparent: Boolean,
    fitchart: Boolean,
    fitheight: Boolean,
    theme: String,
    search: String
  };
  const datasetName = `dataset.${get$1(chart.metadata, "data.json") ? "json" : "csv"}`; // apply core metadata migrations

  migrate(chart.metadata);
  const coreBlocks = [{
    id: "headline",
    tag: "h3",
    region: "header",
    priority: 10,
    test: ({
      chart
    }) => chart.title && !get$1(chart, "metadata.describe.hide-title"),
    component: Headline
  }, {
    id: "description",
    tag: "p",
    region: "header",
    priority: 20,
    test: ({
      chart
    }) => get$1(chart, "metadata.describe.intro"),
    component: Description
  }, {
    id: "notes",
    region: "aboveFooter",
    priority: 10,
    test: ({
      chart
    }) => get$1(chart, "metadata.annotate.notes"),
    component: Notes
  }, {
    id: "byline",
    region: "footerLeft",
    test: ({
      chart
    }) => get$1(chart, "metadata.describe.byline", false) || chart.basedOnByline,
    priority: 10,
    component: Byline
  }, {
    id: "source",
    region: "footerLeft",
    test: ({
      chart
    }) => get$1(chart, "metadata.describe.source-name"),
    priority: 20,
    component: Source
  }, {
    id: "get-the-data",
    region: "footerLeft",
    test: ({
      chart,
      isStyleStatic
    }) => get$1(chart, "metadata.publish.blocks.get-the-data") && !isStyleStatic && chart.type !== "locator-map",
    priority: 30,
    component: GetTheData
  }, {
    id: "edit",
    region: "footerLeft",
    test: ({
      chart,
      isStyleStatic
    }) => get$1(chart, "forkable") && get$1(chart, "metadata.publish.blocks.edit-in-datawrapper", false) && !isStyleStatic,
    priority: 31,
    component: EditInDatawrapper
  }, {
    id: "embed",
    region: "footerLeft",
    test: ({
      chart,
      isStyleStatic
    }) => get$1(chart, "metadata.publish.blocks.embed") && !isStyleStatic,
    priority: 40,
    component: Embed
  }, {
    id: "logo",
    region: "footerRight",
    test: ({
      chart,
      theme
    }) => {
      const metadataLogo = get$1(chart, "metadata.publish.blocks.logo", {
        enabled: false
      });
      const themeLogoOptions = get$1(theme, "data.options.blocks.logo.data.options", []);
      const thisLogoId = logoId || metadataLogo.id;
      let logo = themeLogoOptions.find(logo => logo.id === thisLogoId); // fallback to first logo in theme options

      if (!thisLogoId || !logo) logo = themeLogoOptions[0] || {}; // selected logo has no image or text

      if (!logo.imgSrc && !logo.text) return false;
      if (forceLogo === "on") return true;
      if (forceLogo === "off") return false; // support both old & new metadata

      return isObject(metadataLogo) ? metadataLogo.enabled : metadataLogo;
    },
    priority: 10,
    component: Logo
  }, {
    id: "rectangle",
    region: "header",
    test: ({
      theme
    }) => !!get$1(theme, "data.options.blocks.rectangle"),
    priority: 1,
    component: Rectangle
  }, {
    id: "watermark",
    region: "afterBody",
    test: ({
      theme
    }) => {
      const field = get$1(theme, "data.options.watermark.custom-field");
      return get$1(theme, "data.options.watermark") ? field ? get$1(chart, `metadata.custom.${field}`, "") : get$1(theme, "data.options.watermark.text", "CONFIDENTIAL") : false;
    },
    priority: 1,
    component: Watermark
  }, hr(0, "hr"), hr(1, "hr"), hr(2, "hr"), hr(0, "svg-rule"), hr(1, "svg-rule"), hr(2, "svg-rule")];

  function hr(index, type) {
    const id = `${type}${index ? index : ""}`;
    return {
      id,
      region: "header",
      test: ({
        theme
      }) => !!get$1(theme, `data.options.blocks.${id}`),
      priority: 0,
      component: type === "hr" ? HorizontalRule : SvgRule
    };
  }

  let pluginBlocks = [];

  async function loadBlocks(blocks) {
    function url(src) {
      return origin && src.indexOf("http") !== 0 ? `${origin}/${src}` : src;
    }

    if (blocks.length) {
      await Promise.all(blocks.map(d => {
        return new Promise(resolve => {
          const p = [loadScript(url(d.source.js))];

          if (d.source.css) {
            p.push(loadStylesheet({
              src: url(d.source.css),
              parentElement: styleHolder
            }));
          }

          Promise.all(p).then(resolve).catch(err => {
            // log error
            const url = err.target ? err.target.getAttribute("src") || err.target.getAttribute("href") : null;
            if (url) console.warn("could not load ", url);else console.error("Unknown error", err); // but resolve anyway

            resolve();
          });
        });
      })); // all scripts are loaded

      blocks.forEach(d => {
        d.blocks.forEach(block => {
          if (!dw.block.has(block.component)) {
            return console.warn(`component ${block.component} from chart block ${block.id} not found`);
          }

          pluginBlocks.push({ ...block,
            component: dw.block(block.component)
          });
        });
      }); // trigger svelte update after modifying array

      pluginBlocks = pluginBlocks;
    }
  }

  function getBlocks(allBlocks, region, props) {
    return allBlocks.filter(d => d.region === region).filter(d => !d.test || d.test({ ...d.props,
      ...props
    })).filter(d => d.visible !== undefined ? d.visible : true).sort(byPriority);
  }

  function applyThemeBlockConfig(blocks, theme, blockProps) {
    return blocks.map(block => {
      block.props = { ...(block.data || {}),
        ...blockProps,
        config: {
          frontendDomain
        },
        id: block.id
      };

      if (block.component.test) {
        block.test = block.component.test;
      }

      const options = get$1(theme, "data.options.blocks", {})[block.id];
      if (!options) return block;
      return { ...block,
        ...options
      };
    });
  }

  const caption = getCaption(visualization.id);

  function __(key, ...args) {
    if (typeof key !== "string") {
      key = "";
      console.error(new TypeError(`function __ called without required 'key' parameter!
Please make sure you called __(key) with a key of type "string".
`));
    }

    key = key.trim();
    let translation = translations[key] || key;

    if (args.length) {
      translation = translation.replace(/\$(\d)/g, (m, i) => {
        i = +i;
        return args[i] || m;
      });
    }

    return translation;
  }

  async function run() {
    if (typeof dw === "undefined") return; // register theme

    dw.theme.register(theme.id, theme.data); // register locales

    Object.keys(locales).forEach(vendor => {
      if (locales[vendor] === "null") {
        locales[vendor] = null;
      }

      if (locales[vendor] && locales[vendor].base) {
        // eslint-disable-next-line
        const localeBase = eval(locales[vendor].base);
        locales[vendor] = cjs(localeBase, locales[vendor].custom);
      }
    }); // read flags

    const newFlags = isIframe ? parseFlagsFromURL(window.location.search, FLAG_TYPES) : {}; // TODO parseFlagsFromElement(scriptEl, FLAG_TYPES);

    Object.assign(flags, newFlags);
    const useDwCdn = get$1(chart, "metadata.data.use-datawrapper-cdn", true);
    const externalJSON = useDwCdn && get$1(chart, "metadata.data.external-metadata", "").length ? `//${externalDataUrl}/${chart.id}.metadata.json` : get$1(chart, "metadata.data.external-metadata");

    if (!isPreview && externalJSON && get$1(chart, "metadata.data.upload-method") === "external-data") {
      try {
        const now = new Date().getTime();
        const ts = useDwCdn ? now - now % 60000 : now;
        const url = `${externalJSON}${externalJSON.includes("?") ? "&" : "?"}v=${ts}`;
        const res = await window.fetch(url);
        const obj = await res.json();

        if (obj.title) {
          chart.title = obj.title;
          delete obj.title;
        }

        chart.metadata = cjs(chart.metadata, obj);
        chart = chart;
      } catch (e) {
        console.warn("Invalid external metadata JSON, falling back on chart metadata");
      }
    } // initialize dw.chart object


    dwChart = dw.chart(chart).locale((chart.language || "en-US").substr(0, 2)).translations(translations).theme(dw.theme(chart.theme)).flags(flags); // register chart assets

    const assetPromises = [];

    for (const [name, {
      url,
      value,
      load = true
    }] of Object.entries(assets)) {
      const isDataset = name === datasetName;
      const useLiveData = !isPreview && chart.externalData;

      if (!isDataset || !useLiveData) {
        if (url) {
          if (load) {
            const assetName = name;
            assetPromises.push( // eslint-disable-next-line
            new Promise(async resolve => {
              const res = await fetch(assets[assetName].url);
              const text = await res.text();
              dwChart.asset(assetName, text);
              resolve();
            }));
          } else {
            dwChart.asset(name, url);
          }
        } else {
          dwChart.asset(name, value);
        }
      }
    }

    await Promise.all(assetPromises); // initialize dw.vis object

    vis = dw.visualization(visualization.id, target);
    vis.meta = visualization;
    vis.lang = chart.language || "en-US";
    vis.textDirection = textDirection; // load chart data and assets

    await dwChart.load(dwChart.asset(datasetName) || "", isPreview ? undefined : chart.externalData);
    dwChart.locales = locales;
    dwChart.vis(vis); // load & register blocks

    await loadBlocks(blocks); // initialize emotion instance

    if (!dwChart.emotion) {
      dwChart.emotion = createEmotion.default({
        key: `datawrapper-${chart.id}`,
        container: isIframe ? document.head : styleHolder
      });
    } // add theme._computed to theme.data for better dark mode support


    theme.data._computed = theme._computed;
    const browserSupportsPrefersColorScheme = CSS.supports("color-scheme", "dark"); // we only apply dark mode if base theme is light

    const lightBg = get$1(themeDataLight, "colors.background", "#ffffff");

    if (chroma$1(lightBg).luminance() >= 0.3) {
      vis.initDarkMode(onDarkModeChange, initDarkModeColormap({
        themeDataDark,
        themeDataLight
      }));
      if (isStyleDark) vis.darkMode(true);
    }

    if (!isPreview && isAutoDark) {
      const matchMediaQuery = window.matchMedia("(prefers-color-scheme: dark)"); // for browsers that don't support prefers-color-scheme

      if (!browserSupportsPrefersColorScheme) updateActiveCSS(matchMediaQuery.matches);
      matchMediaQuery.addEventListener("change", e => {
        updateDarkModeState(e.matches);
      });
    }

    if (!useFallbackImage) {
      // render chart
      dwChart.render(outerContainer); // await necessary reload triggers

      observeFonts(theme.fonts, theme.data.typography).then(() => dwChart.render(outerContainer)).catch(() => dwChart.render(outerContainer)); // iPhone/iPad fix

      if (/iP(hone|od|ad)/.test(navigator.platform)) {
        window.onload = dwChart.render(outerContainer);
      }

      isIframe && initResizeHandler(target);
    }

    function updateActiveCSS(isDark) {
      // @todo: access these without using document
      const cssLight = document.getElementById("css-light");
      const cssDark = document.getElementById("css-dark");
      (isDark ? cssLight : cssDark).setAttribute("media", "--disabled--");
      (isDark ? cssDark : cssLight).removeAttribute("media");
    }

    function updateDarkModeState(isDark) {
      if (!browserSupportsPrefersColorScheme) updateActiveCSS(isDark);
      vis.darkMode(isDark);
    }

    function onDarkModeChange(isDark) {
      /*
      * Preserve pre-existing theme object,
      * as render code generally captures vis.theme() in variable just once.
      *
      * @todo: Implement more foolproof solution. E.g using svelte/store
      */
      const newThemeData = isDark ? themeDataDark : themeDataLight;
      Object.keys(theme.data).forEach(key => {
        if (key !== "_computed") delete theme.data[key];
        if (newThemeData[key]) theme.data[key] = newThemeData[key];
      }); // swap active css

      if (isPreview || !isAutoDark || isAutoDark && !browserSupportsPrefersColorScheme) {
        updateActiveCSS(isDark);
      } // revert dark palette to prevent double-mapping


      if (isDark) {
        set(theme.data, "colors.palette", get$1(themeDataLight, "colors.palette", []));
      }

      outerContainer.classList.toggle("is-dark-mode", isDark);
      dwChart.render(outerContainer);
    }

    function initResizeHandler(container) {
      let reloadTimer;

      function resize() {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(function () {
          dwChart.vis().fire("resize");
          dwChart.render(outerContainer);
        }, 200);
      }

      let currentWidth = width(container);

      const resizeFixed = () => {
        const w = width(container);

        if (currentWidth !== w) {
          currentWidth = w;
          resize();
        }
      };

      const fixedHeight = dwChart.getHeightMode() === "fixed";
      const resizeHandler = fixedHeight ? resizeFixed : resize;
      window.addEventListener("resize", resizeHandler);
    }

    return dwChart;
  }

  onMount(async () => {
    useFallbackImage = getBrowser().browser === "ie" && !isPreview;
    const dwChart = await run();
    outerContainer.classList.toggle("dir-rtl", textDirection === "rtl");

    if (isIframe) {
      // set some classes - still needed?
      document.body.classList.toggle("plain", isStylePlain);
      document.body.classList.toggle("static", isStyleStatic);
      document.body.classList.toggle("png-export", isStyleStatic);
      document.body.classList.toggle("transparent", isStyleTransparent);

      if (isStyleStatic) {
        document.body.style["pointer-events"] = "none";
      }

      if (isStyleStatic && !isStyleTransparent) {
        const bodyBackground = get$1(theme.data, "style.body.background", "transparent");
        const previewBackground = get$1(theme.data, "colors.background");

        if (previewBackground && isTransparentColor(bodyBackground)) {
          document.body.style.background = previewBackground;
        }
      } // fire events on hashchange


      domReady(() => {
        postEvent = dwChart.createPostEvent();
        window.addEventListener("hashchange", () => {
          postEvent("hash.change", {
            hash: window.location.hash
          });
        });
      }); // watch for height changes - still needed?

      let currentHeight = document.body.offsetHeight;
      afterUpdate(() => {
        const newHeight = document.body.offsetHeight;

        if (currentHeight !== newHeight && typeof dwChart.render === "function") {
          dwChart.render(outerContainer);
          currentHeight = newHeight;
        }
      }); // provide external APIs

      window.__dw = window.__dw || {};
      window.__dw.params = {
        data: dwChart.asset(datasetName),
        visJSON: visualization
      };
      window.__dw.vis = vis;

      window.__dw.render = () => {
        dwChart.render(outerContainer);
      };

      window.fontsJSON = theme.fonts;
    }
  });

  function initDarkModeColormap({
    themeDataLight,
    themeDataDark
  }) {
    const colorCache = new Map();
    const darkPalette = get$1(themeDataDark, "colors.palette", []);
    const lightPalette = get$1(themeDataLight, "colors.palette", []);
    const lightBg = get$1(themeDataLight, "colors.background", "#ffffff");
    const darkBg = get$1(themeDataDark, "colors.background");
    const themeColorMap = Object.fromEntries(lightPalette.map((light, i) => [light, darkPalette[i]]));
    return function (color, {
      forceInvert,
      noInvert
    } = {}) {
      const darkModeNoInvert = !vis.get("dark-mode-invert", true);
      if (noInvert || darkModeNoInvert && !forceInvert) return color;
      if (!chroma$1.valid(color)) return color;

      if (themeColorMap[color]) {
        // theme has a hard replacement color
        return themeColorMap[color];
      }

      if (colorCache.has(color)) {
        // we've already mapped this color
        return colorCache.get(color);
      }

      colorCache.set(color, invertColor(color, darkBg, lightBg, 0.85));
      return colorCache.get(color);
    };
  }

  let contentBelowChart;
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);
  if ($$props.visualization === void 0 && $$bindings.visualization && visualization !== void 0) $$bindings.visualization(visualization);
  if ($$props.teamPublicSettings === void 0 && $$bindings.teamPublicSettings && teamPublicSettings !== void 0) $$bindings.teamPublicSettings(teamPublicSettings);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  if ($$props.themeDataDark === void 0 && $$bindings.themeDataDark && themeDataDark !== void 0) $$bindings.themeDataDark(themeDataDark);
  if ($$props.themeDataLight === void 0 && $$bindings.themeDataLight && themeDataLight !== void 0) $$bindings.themeDataLight(themeDataLight);
  if ($$props.locales === void 0 && $$bindings.locales && locales !== void 0) $$bindings.locales(locales);
  if ($$props.textDirection === void 0 && $$bindings.textDirection && textDirection !== void 0) $$bindings.textDirection(textDirection);
  if ($$props.translations === void 0 && $$bindings.translations && translations !== void 0) $$bindings.translations(translations);
  if ($$props.blocks === void 0 && $$bindings.blocks && blocks !== void 0) $$bindings.blocks(blocks);
  if ($$props.chartAfterBodyHTML === void 0 && $$bindings.chartAfterBodyHTML && chartAfterBodyHTML !== void 0) $$bindings.chartAfterBodyHTML(chartAfterBodyHTML);
  if ($$props.isIframe === void 0 && $$bindings.isIframe && isIframe !== void 0) $$bindings.isIframe(isIframe);
  if ($$props.isPreview === void 0 && $$bindings.isPreview && isPreview !== void 0) $$bindings.isPreview(isPreview);
  if ($$props.assets === void 0 && $$bindings.assets && assets !== void 0) $$bindings.assets(assets);
  if ($$props.styleHolder === void 0 && $$bindings.styleHolder && styleHolder !== void 0) $$bindings.styleHolder(styleHolder);
  if ($$props.origin === void 0 && $$bindings.origin && origin !== void 0) $$bindings.origin(origin);
  if ($$props.externalDataUrl === void 0 && $$bindings.externalDataUrl && externalDataUrl !== void 0) $$bindings.externalDataUrl(externalDataUrl);
  if ($$props.outerContainer === void 0 && $$bindings.outerContainer && outerContainer !== void 0) $$bindings.outerContainer(outerContainer);
  if ($$props.isStyleTransparent === void 0 && $$bindings.isStyleTransparent && isStyleTransparent !== void 0) $$bindings.isStyleTransparent(isStyleTransparent);
  if ($$props.isStylePlain === void 0 && $$bindings.isStylePlain && isStylePlain !== void 0) $$bindings.isStylePlain(isStylePlain);
  if ($$props.isStyleStatic === void 0 && $$bindings.isStyleStatic && isStyleStatic !== void 0) $$bindings.isStyleStatic(isStyleStatic);
  if ($$props.isStyleDark === void 0 && $$bindings.isStyleDark && isStyleDark !== void 0) $$bindings.isStyleDark(isStyleDark);
  if ($$props.isAutoDark === void 0 && $$bindings.isAutoDark && isAutoDark !== void 0) $$bindings.isAutoDark(isAutoDark);
  if ($$props.forceLogo === void 0 && $$bindings.forceLogo && forceLogo !== void 0) $$bindings.forceLogo(forceLogo);
  if ($$props.logoId === void 0 && $$bindings.logoId && logoId !== void 0) $$bindings.logoId(logoId);
  if ($$props.frontendDomain === void 0 && $$bindings.frontendDomain && frontendDomain !== void 0) $$bindings.frontendDomain(frontendDomain);

  {
    if (!get$1(chart, "metadata.publish.blocks")) {
      // no footer settings found in metadata, apply theme defaults
      set(chart, "metadata.publish.blocks", get$1(theme.data, "metadata.publish.blocks"));
    }
  }

  let ariaDescription = get$1(chart, "metadata.describe.aria-description", "");
  purifyHTML(get$1(chart, "metadata.publish.custom-css", ""), "");
  let blockProps = {
    __,
    purifyHtml: clean,
    get: get$1,
    postEvent,
    teamPublicSettings,
    theme,
    chart,
    dwChart,
    vis,
    caption,
    logoId
  };
  let allBlocks = applyThemeBlockConfig([...coreBlocks, ...pluginBlocks], theme, blockProps);
  let regions = {
    header: getBlocks(allBlocks, "header", {
      chart,
      theme,
      isStyleStatic
    }),
    aboveFooter: getBlocks(allBlocks, "aboveFooter", {
      chart,
      theme,
      isStyleStatic
    }),
    footerLeft: getBlocks(allBlocks, "footerLeft", {
      chart,
      theme,
      isStyleStatic
    }),
    footerCenter: getBlocks(allBlocks, "footerCenter", {
      chart,
      theme,
      isStyleStatic
    }),
    footerRight: getBlocks(allBlocks, "footerRight", {
      chart,
      theme,
      isStyleStatic
    }),
    belowFooter: getBlocks(allBlocks, "belowFooter", {
      chart,
      theme,
      isStyleStatic
    }),
    afterBody: getBlocks(allBlocks, "afterBody", {
      chart,
      theme,
      isStyleStatic
    }),
    menu: getBlocks(allBlocks, "menu", {
      chart,
      theme,
      isStyleStatic
    })
  };
  let menu = get$1(theme, "data.options.menu", {});
  contentBelowChart = !isStylePlain && (regions.aboveFooter.length || regions.footerLeft.length || regions.footerCenter.length || regions.footerRight.length || regions.belowFooter.length || regions.afterBody.length);
  return `${!isStylePlain ? `${validate_component(BlocksRegion, "BlocksRegion").$$render($$result, {
    name: "dw-chart-header",
    blocks: regions.header,
    id: "header"
  }, {}, {})}

    ${!isStyleStatic ? `${validate_component(Menu, "Menu").$$render($$result, {
    name: "dw-chart-menu",
    props: menu,
    blocks: regions.menu
  }, {}, {})}` : ``}` : ``}

${ariaDescription ? `<div class="${"sr-only"}">${purifyHTML(ariaDescription, allowedAriaDescriptionTags)}</div>` : ``}

<div id="${"chart"}"${add_attribute("aria-hidden", !!ariaDescription, 0)} class="${["dw-chart-body", contentBelowChart ? "content-below-chart" : ""].join(" ").trim()}"${add_attribute("this", target, 1)}>${useFallbackImage ? `<img style="${"max-width: 100%"}" src="${"../plain.png"}" aria-hidden="${"true"}" alt="${"fallback image"}">
        <p style="${"opacity:0.6;padding:1ex; text-align:center"}">${escape$1(__("fallback-image-note"))}</p>` : ``}</div>

${get$1(theme, "data.template.afterChart") ? `${theme.data.template.afterChart}` : ``}

${!isStylePlain ? `${validate_component(BlocksRegion, "BlocksRegion").$$render($$result, {
    name: "dw-above-footer",
    blocks: regions.aboveFooter
  }, {}, {})}

    <div id="${"footer"}" class="${"dw-chart-footer"}">${each$1(["Left", "Center", "Right"], orientation => `<div class="${"footer-" + escape$1(orientation.toLowerCase())}">${each$1(regions["footer" + orientation], (block, i) => `${i ? `<span class="${"separator separator-before-" + escape$1(block.id)}"></span>` : ``}
                    <span class="${"footer-block " + escape$1(block.id) + "-block"}">${block.prepend ? `<span class="${"prepend"}">${clean(block.prepend)}
                            </span>` : ``}
                        <span class="${"block-inner"}">${validate_component(block.component || missing_component, "svelte:component").$$render($$result, {
    props: block.props
  }, {}, {})}</span>
                        ${block.append ? `<span class="${"append"}">${clean(block.append)}
                            </span>` : ``}
                    </span>`)}
            </div>`)}</div>

    ${validate_component(BlocksRegion, "BlocksRegion").$$render($$result, {
    name: "dw-below-footer",
    blocks: regions.belowFooter
  }, {}, {})}` : ``}

<div class="${"dw-after-body"}">${each$1(regions.afterBody, block => `${validate_component(block.component || missing_component, "svelte:component").$$render($$result, {
    props: block.props
  }, {}, {})}`)}</div>

${chartAfterBodyHTML ? `${chartAfterBodyHTML}` : ``}`;
});return Visualization;}));