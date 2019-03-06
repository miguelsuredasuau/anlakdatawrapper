!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/highlight",t):e.highlight=t()}(this,function(){"use strict";function e(){}function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e,t){t.appendChild(e)}function i(e,t,n){t.insertBefore(e,n)}function r(e){e.parentNode.removeChild(e)}function o(e){for(var t=0;t<e.length;t+=1)e[t]&&e[t].d()}function s(e){return document.createElement(e)}function a(e){return document.createTextNode(e)}function h(e,t,n){e.addEventListener(t,n,!1)}function u(e,t,n){e.removeEventListener(t,n,!1)}function c(e,t,n){e.style.setProperty(t,n)}function l(e,t){for(var n=0;n<e.options.length;n+=1){var i=e.options[n];if(i.__value===t)return void(i.selected=!0)}}function f(){return Object.create(null)}function d(t){this.destroy=e,this.fire("destroy"),this.set=this.get=e,!1!==t&&this._fragment.u(),this._fragment.d(),this._fragment=this._state=null}function _(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function v(e,t){return e!=e?t==t:e!==t}function g(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var i=0;i<n.length;i+=1){var r=n[i];r.__calling||(r.__calling=!0,r.call(this,t),r.__calling=!1)}}function p(e){return e?this._state[e]:this._state}function m(e,t,n){var i=t.bind(this);return n&&!1===n.init||i(this.get()[e],void 0),this.on(n&&n.defer?"update":"state",function(t){t.changed[e]&&i(t.current[e],t.previous&&t.previous[e])})}function y(e,t){if("teardown"===e)return this.on("destroy",t);var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function b(e){for(;e&&e.length;)e.shift()()}function x(){this.store._remove(this)}var k={destroy:d,get:p,fire:g,observe:m,on:y,set:function(e){this._set(t({},e)),this.root._lock||(this.root._lock=!0,b(this.root._beforecreate),b(this.root._oncreate),b(this.root._aftercreate),this.root._lock=!1)},teardown:d,_recompute:e,_set:function(e){var n=this._state,i={},r=!1;for(var o in e)this._differs(e[o],n[o])&&(i[o]=r=!0);r&&(this._state=t(t({},n),e),this._recompute(i,this._state),this._bind&&this._bind(i,this._state),this._fragment&&(this.fire("state",{changed:i,current:this._state,previous:n}),this._fragment.p(i,this._state),this.fire("update",{changed:i,current:this._state,previous:n})))},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_unmount:function(){this._fragment&&this._fragment.u()},_differs:_};function w(e,t){var n=arguments;if(void 0===t&&(t="core"),e=e.trim(),!dw.backend.__messages[t])return"MISSING:"+e;var i=dw.backend.__messages[t][e]||dw.backend.__messages.core[e]||e;if(arguments.length>2)for(var r=2;r<arguments.length;r++){var o=r-1;i=i.replace("$"+o,n[r])}return i}function N(e){var t=typeof e;return"function"===t||"object"===t&&!!e}var E,O=Array.prototype,S=Object.prototype,j=O.slice,C=S.toString,P=S.hasOwnProperty,M=Object.keys;function L(e,t){return null!=e&&P.call(e,t)}function $(e){if(!N(e))return[];if(M)return M(e);var t=[];for(var n in e)L(e,n)&&t.push(n);return X&&function(e,t){var n=Y.length,i=e.constructor,r=T(i)&&i.prototype||S,o="constructor";L(e,o)&&!I(t,o)&&t.push(o);for(;n--;)(o=Y[n])in e&&e[o]!==r[o]&&!I(t,o)&&t.push(o)}(e,t),t}var A=function(e,t,n){return function(i,r,o){var s=0,a=V(i);if("number"==typeof o)e>0?s=o>=0?o:Math.max(o+a,s):a=o>=0?Math.min(o+1,a):o+a+1;else if(n&&o&&a)return o=n(i,r),i[o]===r?o:-1;if(r!=r)return(o=t(j.call(i,s,a),H))>=0?o+s:-1;for(o=e>0?s:a-1;o>=0&&o<a;o+=e)if(i[o]===r)return o;return-1}}(1,(E=1,function(e,t,n){t=Q(t,n);for(var i=V(e),r=E>0?0:i-1;r>=0&&r<i;r+=E)if(t(e[r],r,e))return r;return-1}),function(e,t,n,i){for(var r=(n=Q(n,i,1))(t),o=0,s=V(e);o<s;){var a=Math.floor((o+s)/2);n(e[a])<r?o=a+1:s=a}return o});function I(e,t,n,i){return W(e)||(e=function(e){for(var t=$(e),n=t.length,i=Array(n),r=0;r<n;r++)i[r]=e[t[r]];return i}(e)),("number"!=typeof n||i)&&(n=0),A(e,t,n)>=0}var T=("function"!=typeof/./&&"object"!=typeof Int8Array&&"undefined"!=typeof document&&"function"!=typeof document.childNodes?function(e){return"function"==typeof e||!1}:null)||function(e){return"[object Function]"===C.call(e)};!function(){C.call(arguments)}();function H(e){return function(e){return"[object Number]"===C.call(e)}(e)&&isNaN(e)}var J=K;function q(e){return e}var z,B,F=(z=$,function(e){var t=arguments,n=arguments.length;if(B&&(e=Object(e)),n<2||null==e)return e;for(var i=1;i<n;i++)for(var r=t[i],o=z(r),s=o.length,a=0;a<s;a++){var h=o[a];!N(e)||B&&void 0!==e[h]||(e[h]=r[h])}return e});function G(e){return e=F({},e),function(t){return function(e,t){var n=$(t),i=n.length;if(null==e)return!i;for(var r=Object(e),o=0;o<i;o++){var s=n[o];if(t[s]!==r[s]||!(s in r))return!1}return!0}(t,e)}}function D(e,t,n){if(void 0===t)return e;switch(null==n?3:n){case 1:return function(n){return e.call(t,n)};case 3:return function(n,i,r){return e.call(t,n,i,r)};case 4:return function(n,i,r,o){return e.call(t,n,i,r,o)}}return function(){return e.apply(t,arguments)}}function K(e,t){return Q(e,t,1/0)}function Q(e,t,n){return J!==K?J(e,t):null==e?q:T(e)?D(e,t,n):N(e)?G(e):R(e)}function R(e){return function(t){return null==t?void 0:t[e]}}var U=Math.pow(2,53)-1,V=R("length"),W=function(e){var t=V(e);return"number"==typeof t&&t>=0&&t<=U};var X=!{toString:null}.propertyIsEnumerable("toString"),Y=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];!function(e){for(var t={},n=$(e),i=0,r=n.length;i<r;i++)t[e[n[i]]]=n[i]}({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"});var Z,ee,te=(Z=function(e,t,n){e[n]=t},function(e,t,n){var i=ee?[[],[]]:{};return t=Q(t,n),function(e,t,n){var i,r;if(t=D(t,n),W(e))for(i=0,r=e.length;i<r;i++)t(e[i],i,e);else{var o=$(e);for(i=0,r=o.length;i<r;i++)t(e[o[i]],o[i],e)}}(e,function(n,r){var o=t(n,r,e);Z(i,n,o)}),i});var ne={add:function(e){var t=this,n=this.get().highlighted;n.indexOf(e)<0&&n.push(e),this.set({highlighted:n}),setTimeout(function(){return t.set({selected:"---"})},30)},remove:function(e){var t=this.get().highlighted;t.splice(t.indexOf(e),1),this.set({highlighted:t})}};function ie(e){return JSON.parse(JSON.stringify(e))}function re(t,o){var h,u,c,l=o.element,f=(o.each_value,o.element_index,l.label);return{c:function(){h=s("option"),u=a(f),this.h()},h:function(){h.__value=c=l.key,h.value=h.__value},m:function(e,t){i(h,e,t),n(u,h)},p:function(e,t){l=t.element,t.each_value,t.element_index,e.elements&&f!==(f=l.label)&&(u.data=f),e.elements&&c!==(c=l.key)&&(h.__value=c),h.value=h.__value},u:function(){r(h)},d:e}}function oe(e,t){var o,c,l,f,d,_,v,g=t.el,p=(t.each_value_1,t.el_index,g.key);return{c:function(){o=s("span"),c=s("i"),l=a(" "),f=a(p),v=a("\n         "),this.h()},h:function(){h(c,"click",se),c.className="fa fa-remove",c._svelte={component:e,each_value_1:t.each_value_1,el_index:t.el_index},o.dataset.series=d=g.key,o.className=_="badge "+(g.valid?"badge-info":"")},m:function(e,t){i(o,e,t),n(c,o),n(l,o),n(f,o),i(v,e,t)},p:function(e,t){g=t.el,t.each_value_1,t.el_index,c._svelte.each_value_1=t.each_value_1,c._svelte.el_index=t.el_index,e.highlightedElements&&p!==(p=g.key)&&(f.data=p),e.highlightedElements&&d!==(d=g.key)&&(o.dataset.series=d),e.highlightedElements&&_!==(_="badge "+(g.valid?"badge-info":""))&&(o.className=_)},u:function(){r(o),r(v)},d:function(){u(c,"click",se)}}}function se(e){var t=this._svelte.component,n=this._svelte.each_value_1[this._svelte.el_index];t.remove(n.key)}function ae(e){!function(e,t){e._handlers=f(),e._bind=t._bind,e.options=t,e.root=t.root||e,e.store=e.root.store||t.store}(this,e),this._state=t(t(this.store._init(["vis"]),{selected:"---",highlighted:[]}),e.data),this.store._add(this,["vis"]),this._recompute({$vis:1,highlighted:1,elements:1},this._state),this._handlers.destroy=[x];var d=this;e.root||(this._oncreate=[],this._beforecreate=[]),this._fragment=function(e,f){for(var d,_,v,g,p,m,y,b,x,k,N,E,O=w("Highlight the most import elements (optional)"),S=w("select element"),j=!1,C=f.elements,P=[],M=0;M<C.length;M+=1)P[M]=re(0,t(t({},f),{each_value:C,element:C[M],element_index:M}));function L(){j=!0,e.set({selected:function(e){var t=e.querySelector(":checked")||e.options[0];return t&&t.__value}(p)}),j=!1}var $=f.highlightedElements,A=[];for(M=0;M<$.length;M+=1)A[M]=oe(e,t(t({},f),{each_value_1:$,el:$[M],el_index:M}));return{c:function(){d=s("div"),_=s("label"),v=a("\n    "),g=s("div"),p=s("select"),m=s("option"),y=a("- "),b=s("noscript"),x=s("noscript"),k=a(" -");for(var e=0;e<P.length;e+=1)P[e].c();for(N=a("\n    "),E=s("p"),e=0;e<A.length;e+=1)A[e].c();this.h()},h:function(){_.className="separator",m.__value="---",m.value=m.__value,h(p,"change",L),"selected"in f||e.root._beforecreate.push(L),p.id="highlight-series",p.className="span2",E.className="highlighted-series",c(E,"margin-top","5px"),d.className="story-highlight control-group",c(d,"clear","both")},m:function(e,t){i(d,e,t),n(_,d),_.innerHTML=O,n(v,d),n(g,d),n(p,g),n(m,p),n(y,m),n(b,m),b.insertAdjacentHTML("afterend",S),n(x,m),n(k,m);for(var r=0;r<P.length;r+=1)P[r].m(p,null);for(l(p,f.selected),n(N,d),n(E,d),r=0;r<A.length;r+=1)A[r].m(E,null)},p:function(n,i){var r=i.elements;if(n.elements){for(var o=0;o<r.length;o+=1){var s=t(t({},i),{each_value:r,element:r[o],element_index:o});P[o]?P[o].p(n,s):(P[o]=re(0,s),P[o].c(),P[o].m(p,null))}for(;o<P.length;o+=1)P[o].u(),P[o].d();P.length=r.length}j||l(p,i.selected);var a=i.highlightedElements;if(n.highlightedElements){for(o=0;o<a.length;o+=1){var h=t(t({},i),{each_value_1:a,el:a[o],el_index:o});A[o]?A[o].p(n,h):(A[o]=oe(e,h),A[o].c(),A[o].m(E,null))}for(;o<A.length;o+=1)A[o].u(),A[o].d();A.length=a.length}},u:function(){_.innerHTML="",function(e,t){for(;e.nextSibling&&e.nextSibling!==t;)e.parentNode.removeChild(e.nextSibling)}(b,x),r(d);for(var e=0;e<P.length;e+=1)P[e].u();for(e=0;e<A.length;e+=1)A[e].u()},d:function(){o(P),u(p,"change",L),o(A)}}}(this,this._state),this.root._oncreate.push(function(){(function(){var e=this;this.store.observe("vis",function(t){t&&(e.set({highlighted:ie(t.get("highlighted-series"))}),t.chart().onChange(function(n,i){"metadata.visualize.highlighted-series"===i&&e.set({highlighted:ie(t.get("highlighted-series"))})}))}),this.observe("highlighted",function(t){var n=e.store.get().vis;n&&JSON.stringify(n.get("highlighted-series"))!==JSON.stringify(t)&&n&&n.chart().set("metadata.visualize.highlighted-series",ie(t))}),this.observe("selected",function(t){t&&"---"!==t&&e.add(t)})}).call(d),d.fire("update",{changed:{highlighted:1,elements:1,$vis:1,selected:1,highlightedElements:1},current:d._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),b(this._beforecreate),b(this._oncreate))}function he(e,n){this._observers={pre:f(),post:f()},this._handlers={},this._dependents=[],this._computed=f(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=n&&n.immutable?v:_}t(ae.prototype,k),t(ae.prototype,ne),ae.prototype._recompute=function(e,t){var n;e.$vis&&this._differs(t.elements,t.elements=(n=t.$vis)?n.keys().sort().map(function(e){var t=n.keyLabel(e);return{key:e,label:e+(e!==t?" ("+t+")":"")}}):[])&&(e.elements=!0),(e.highlighted||e.elements)&&this._differs(t.highlightedElements,t.highlightedElements=function(e){var t=e.highlighted,n=e.elements,i=te(n,"key");return t.map(function(e){return{key:e,valid:i[e]}})}(t))&&(e.highlightedElements=!0)},t(he.prototype,{_add:function(e,t){this._dependents.push({component:e,props:t})},_init:function(e){for(var t={},n=0;n<e.length;n+=1){var i=e[n];t["$"+i]=this._state[i]}return t},_remove:function(e){for(var t=this._dependents.length;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_sortComputedProperties:function(){var e,t=this._computed,n=this._sortedComputedProperties=[],i=f();function r(o){if(e[o])throw new Error("Cyclical dependency detected");if(!i[o]){i[o]=!0;var s=t[o];s&&(e[o]=!0,s.deps.forEach(r),n.push(s))}}for(var o in this._computed)e=f(),r(o)},compute:function(e,t,n){var i,r=this,o={deps:t,update:function(o,s,a){var h=t.map(function(e){return e in s&&(a=!0),o[e]});if(a){var u=n.apply(null,h);r._differs(u,i)&&(i=u,s[e]=!0,o[e]=i)}}};o.update(this._state,{},!0),this._computed[e]=o,this._sortComputedProperties()},fire:g,get:p,observe:m,on:y,onchange:function(e){return console.warn("store.onchange is deprecated in favour of store.on('state', event => {...})"),this.on("state",function(t){e(t.current,t.changed)})},set:function(e){var n=this._state,i=this._changed={},r=!1;for(var o in e){if(this._computed[o])throw new Error("'"+o+"' is a read-only property");this._differs(e[o],n[o])&&(i[o]=r=!0)}if(r){this._state=t(t({},n),e);for(var s=0;s<this._sortedComputedProperties.length;s+=1)this._sortedComputedProperties[s].update(this._state,i);this.fire("state",{changed:i,current:this._state,previous:n});var a=this._dependents.slice();for(s=0;s<a.length;s+=1){var h=a[s],u={};r=!1;for(var c=0;c<h.props.length;c+=1){var l=h.props[c];l in i&&(u["$"+l]=this._state[l],r=!0)}r&&h.component.set(u)}this.fire("update",{changed:i,current:this._state,previous:n})}}});return{App:ae,data:{chart:{id:""}},store:new he({}),init:function(e){window.dw.backend.on("dataset-loaded",function(){e.store.set({dataset:chart.dataset()})}).on("theme-changed-and-loaded",function(){e.store.set({theme:window.dw.theme(chart.get("theme"))})}).on("backend-vis-loaded",function(t){e.store.set({vis:t})})}}});
