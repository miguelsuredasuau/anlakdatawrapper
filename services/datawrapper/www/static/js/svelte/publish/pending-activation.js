!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/publish/pending-activation",e):(t="undefined"!=typeof globalThis?globalThis:t||self)["publish/pending-activation"]=e()}(this,(function(){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function n(){}function r(t,e){for(var n in e)t[n]=e[n];return t}function o(t,e){t.appendChild(e)}function i(t,e,n){t.insertBefore(e,n)}function c(t){t.parentNode.removeChild(t)}function s(t){return document.createElement(t)}function a(t){return document.createTextNode(t)}function u(){return Object.create(null)}function f(e,n){return e!=e?n==n:e!==n||e&&"object"===t(e)||"function"==typeof e}function p(t,e){return t!=t?e==e:t!==e}function d(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}}function h(){return this._state}function l(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function v(t){for(;t&&t.length;)t.shift()()}var _={destroy:function(t){this.destroy=n,this.fire("destroy"),this.set=n,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:h,fire:d,on:l,set:function(t){var e;this._set(r({},t)),this.root._lock||((e=this.root)._lock=!0,v(e._beforecreate),v(e._oncreate),v(e._aftercreate),e._lock=!1)},_recompute:n,_set:function(t){var e=this._state,n={},o=!1;for(var i in t=r(this._staged,t),this._staged={},t)this._differs(t[i],e[i])&&(n[i]=o=!0);o&&(this._state=r(r({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){r(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:f},m={};function y(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(m[t]=window.__dw.vis.meta.locale||{}):m[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function g(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),m[n]||y(n),!m[n][t])return"MISSING:"+t;var r=m[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}function b(t,e){return(b=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function w(e,n){return!n||"object"!==t(n)&&"function"!=typeof n?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(e):n}function O(t){return(O=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function j(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function P(t,e,n){return(P=j()?Reflect.construct:function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&b(o,n.prototype),o}).apply(null,arguments)}function E(t){var e="function"==typeof Map?new Map:void 0;return(E=function(t){if(null===t||(n=t,-1===Function.toString.call(n).indexOf("[native code]")))return t;var n;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,r)}function r(){return P(t,arguments,O(this).constructor)}return r.prototype=Object.create(t.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),b(r,t)})(t)}function S(t,e){if(null==t)return{};var n,r,o=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}var x={exports:{}};
/*!
   * JavaScript Cookie v2.2.1
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */!function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var a in i)i[a]&&(s+="; "+a,!0!==i[a]&&(s+="="+i[a].split(";")[0]));return document.cookie=e+"="+n+s}}function c(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],c=0;c<i.length;c++){var s=i[c].split("="),a=s.slice(1).join("=");n||'"'!==a.charAt(0)||(a=a.slice(1,-1));try{var u=e(s[0]);if(a=(r.read||r)(a,u)||e(a),n)try{a=JSON.parse(a)}catch(t){}if(o[u]=a,t===u)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return c(t,!1)},o.getJSON=function(t){return c(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}(x);var C=x.exports;function T(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=O(t);if(e){var o=O(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return w(this,n)}}function R(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function k(t){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?R(Object(r),!0).forEach((function(n){e(t,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):R(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var D=new Set(["get","head","options","trace"]);function N(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=k(k({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:k({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,c=r.fetch,s=r.raw,a=S(r,["payload","baseUrl","fetch","raw"]),u="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(a.body=JSON.stringify(o)),D.has(a.method.toLowerCase()))n=c(u,a);else{var f=C.get("crumb");f?(a.headers["X-CSRF-Token"]=f,n=c(u,a)):n=N("/v3/me",{fetch:c,baseUrl:i}).then((function(){var t=C.get("crumb");t&&(a.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return c(u,a)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new A(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}N.get=L("GET"),N.patch=L("PATCH"),N.put=L("PUT");var U=N.post=L("POST");function L(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return N(e,k(k({},n),{},{method:t}))}}N.head=L("HEAD"),N.delete=L("DELETE");var A=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&b(t,e)}(n,t);var e=T(n);function n(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),(r=e.call(this)).name="HttpReqError",r.status=t.status,r.statusText=t.statusText,r.message="[".concat(t.status,"] ").concat(t.statusText),r.response=t,r}return n}(E(Error));function H(){}var I={resendActivation:function(){try{var t=this;return t.set({status:"sending"}),function(t){if(t&&t.then)return t.then(H)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return e=U("/v3/auth/resend-activation"),n=function(){t.set({status:"success"})},r?n?n(e):e:(e&&e.then||(e=Promise.resolve(e)),n?e.then(n):e);var e,n,r}),(function(){t.set({status:"error"})})))}catch(t){return Promise.reject(t)}}};function M(t,e){var n,r,u,f,p,d=g("publish / pending-activation / resend");function h(e){t.resendActivation()}return{c:function(){var t,o,i;n=s("button"),r=s("i"),f=a("\n             \n            "),p=s("noscript"),r.className=u="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"),t="click",o=h,n.addEventListener(t,o,i),n.className="btn btn-primary"},m:function(t,e){i(t,n,e),o(n,r),o(n,f),o(n,p),p.insertAdjacentHTML("afterend",d)},p:function(t,e){t.status&&u!==(u="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(r.className=u)},d:function(t){var e,r,o;t&&c(n),e="click",r=h,n.removeEventListener(e,r,o)}}}function B(t,e){var r,o=g("publish / pending-activation / resend-error");return{c:function(){r=s("p")},m:function(t,e){i(t,r,e),r.innerHTML=o},p:n,d:function(t){t&&c(r)}}}function F(t,e){var r,o=g("publish / pending-activation / resend-success");return{c:function(){r=s("p")},m:function(t,e){i(t,r,e),r.innerHTML=o},p:n,d:function(t){t&&c(r)}}}function J(t){!function(t,e){t._handlers=u(),t._slots=u(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this._state=r({status:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,u,f,p,d,h=g("publish / pending-activation / h1"),l=g("publish / pending-activation / p");function v(t){return"success"==t.status?F:"error"==t.status?B:M}var _=v(e),m=_(t,e);return{c:function(){var t,e;n=s("div"),r=s("h2"),u=a("\n\n    "),f=s("p"),p=a("\n\n    "),d=s("div"),m.c(),t="margin-top",e="20px",d.style.setProperty(t,e)},m:function(t,e){i(t,n,e),o(n,r),r.innerHTML=h,o(n,u),o(n,f),f.innerHTML=l,o(n,p),o(n,d),m.m(d,null)},p:function(e,n){_===(_=v(n))&&m?m.p(e,n):(m.d(1),(m=_(t,n)).c(),m.m(d,null))},d:function(t){t&&c(n),m.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function $(t,e){this._handlers={},this._dependents=[],this._computed=u(),this._sortedComputedProperties=[],this._state=r({},t),this._differs=e&&e.immutable?p:f}return r(J.prototype,_),r(J.prototype,I),r($.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var r=t[n];e["$"+r]=this._state[r]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,o=this._state;this._state=r(r({},o),t);for(var i=0;i<this._sortedComputedProperties.length;i+=1)this._sortedComputedProperties[i].update(this._state,e);this.fire("state",{changed:e,previous:o,current:this._state}),this._dependents.filter((function(t){for(var r={},o=!1,i=0;i<t.props.length;i+=1){var c=t.props[i];c in e&&(r["$"+c]=n._state[c],o=!0)}if(o)return t.component._stage(r),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:o,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],r=u();function o(i){var c=e[i];c&&(c.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(i));o(e)})),r[i]||(r[i]=!0,n.push(c)))}for(var i in this._computed)o(t=i)},compute:function(t,e,n){var o,i=this,c={deps:e,update:function(r,c,s){var a=e.map((function(t){return t in c&&(s=!0),r[t]}));if(s){var u=n.apply(null,a);i._differs(u,o)&&(o=u,c[t]=!0,r[t]=o)}}};this._computed[t]=c,this._sortComputedProperties();var s=r({},this._state),a={};c.update(s,a,!0),this._set(s,a)},fire:d,get:h,on:l,set:function(t){var e=this._state,n=this._changed={},r=!1;for(var o in t){if(this._computed[o])throw new Error("'".concat(o,"' is a read-only computed property"));this._differs(t[o],e[o])&&(n[o]=r=!0)}r&&this._set(t,n)}}),{App:J,store:new $({})}}));