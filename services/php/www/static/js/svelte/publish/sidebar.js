!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("../../../../../../../../../../static/js/svelte/publish.js")):"function"==typeof define&&define.amd?define(["../../../../../../../../../../static/js/svelte/publish"],e):(t="undefined"!=typeof globalThis?globalThis:t||self)["publish/sidebar"]=e(t.Publish)}(this,(function(t){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function r(){}function o(t,e){for(var n in e)t[n]=e[n];return t}function i(t,e){for(var n in e)t[n]=1;return t}function c(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n)}function u(t){t.parentNode.removeChild(t)}function a(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function f(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function l(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function p(){return document.createComment("")}function h(t,e,n,r){t.addEventListener(e,n,r)}function m(t,e,n,r){t.removeEventListener(e,n,r)}function v(t,e,n){t.style.setProperty(e,n)}function b(t,e,n){t.classList[n?"add":"remove"](e)}function g(){return Object.create(null)}function _(t){t._lock=!0,w(t._beforecreate),w(t._oncreate),w(t._aftercreate),t._lock=!1}function y(t,e){t._handlers=g(),t._slots=g(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function w(t){for(;t&&t.length;)t.shift()()}function x(){this.store._remove(this)}var T={destroy:function(t){this.destroy=r,this.fire("destroy"),this.set=r,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(o({},t)),this.root._lock||_(this.root)},_recompute:r,_set:function(t){var e=this._state,n={},r=!1;for(var i in t=o(this._staged,t),this._staged={},t)this._differs(t[i],e[i])&&(n[i]=r=!0);r&&(this._state=o(o({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){o(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,n){return t!=t?n==n:t!==n||t&&"object"===e(t)||"function"==typeof t}},O={};function j(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(O[t]=window.__dw.vis.meta.locale||{}):O[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function E(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),O[n]||j(n),!O[n][t])return"MISSING:"+t;var r=O[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}function S(t,e){return(S=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function P(t,n){return!n||"object"!==e(n)&&"function"!=typeof n?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):n}function L(t){return(L=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function N(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function k(t,e,n){return(k=N()?Reflect.construct:function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&S(o,n.prototype),o}).apply(null,arguments)}function C(t){var e="function"==typeof Map?new Map:void 0;return(C=function(t){if(null===t||(n=t,-1===Function.toString.call(n).indexOf("[native code]")))return t;var n;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,r)}function r(){return k(t,arguments,L(this).constructor)}return r.prototype=Object.create(t.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),S(r,t)})(t)}function H(t,e){if(null==t)return{};var n,r,o=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}var M={exports:{}};
/*!
   * JavaScript Cookie v2.2.1
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */!function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var u in i)i[u]&&(s+="; "+u,!0!==i[u]&&(s+="="+i[u].split(";")[0]));return document.cookie=e+"="+n+s}}function c(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],c=0;c<i.length;c++){var s=i[c].split("="),u=s.slice(1).join("=");n||'"'!==u.charAt(0)||(u=u.slice(1,-1));try{var a=e(s[0]);if(u=(r.read||r)(u,a)||e(u),n)try{u=JSON.parse(u)}catch(t){}if(o[a]=u,t===a)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return c(t,!1)},o.getJSON=function(t){return c(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}(M);var A=M.exports;function R(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=L(t);if(e){var o=L(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return P(this,n)}}function D(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function U(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?D(Object(r),!0).forEach((function(e){n(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):D(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var I=new Set(["get","head","options","trace"]);function q(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=U(U({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:U({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,c=r.fetch,s=r.raw,u=H(r,["payload","baseUrl","fetch","raw"]),a="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(u.body=JSON.stringify(o)),I.has(u.method.toLowerCase()))n=c(a,u);else{var f=A.get("crumb");f?(u.headers["X-CSRF-Token"]=f,n=c(a,u)):n=q("/v3/me",{fetch:c,baseUrl:i}).then((function(){var t=A.get("crumb");t&&(u.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return c(a,u)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new G(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}q.get=F("GET"),q.patch=F("PATCH"),q.put=F("PUT");var B=q.post=F("POST");function F(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return q(e,U(U({},n),{},{method:t}))}}q.head=F("HEAD"),q.delete=F("DELETE");var G=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&S(t,e)}(n,t);var e=R(n);function n(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),(r=e.call(this)).name="HttpReqError",r.status=t.status,r.statusText=t.statusText,r.message="[".concat(t.status,"] ").concat(t.statusText),r.response=t,r}return n}(C(Error));function J(t,e){var n;return{c:function(){(n=l("label")).className="control-label svelte-1nkiaxn"},m:function(t,r){s(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label)},d:function(t){t&&u(n)}}}function $(t,e){var n;return{c:function(){(n=l("div")).className="help success svelte-1nkiaxn"},m:function(t,r){s(t,n,r),n.innerHTML=e.success},p:function(t,e){t.success&&(n.innerHTML=e.success)},d:function(t){t&&u(n)}}}function X(t,e){var n;return{c:function(){(n=l("div")).className="help error svelte-1nkiaxn"},m:function(t,r){s(t,n,r),n.innerHTML=e.error},p:function(t,e){t.error&&(n.innerHTML=e.error)},d:function(t){t&&u(n)}}}function Z(t,e){var n;return{c:function(){(n=l("div")).className="help svelte-1nkiaxn"},m:function(t,r){s(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){t&&u(n)}}}function z(t){var e,n,r,i,a,f,p,h,m,g,_,w,x;y(this,t),this._state=o({label:"",help:"",error:!1,success:!1,width:"auto",uid:""},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,m=e._slotted.default,g=n.label&&J(0,n),_=n.success&&$(0,n),w=n.error&&X(0,n),x=!n.success&&!n.error&&n.help&&Z(0,n),{c:function(){r=l("div"),g&&g.c(),i=d("\n    "),a=l("div"),f=d("\n    "),_&&_.c(),p=d(" "),w&&w.c(),h=d(" "),x&&x.c(),a.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",v(r,"width",n.width),r.dataset.uid=n.uid,b(r,"success",n.success),b(r,"error",n.error)},m:function(t,e){s(t,r,e),g&&g.m(r,null),c(r,i),c(r,a),m&&c(a,m),c(r,f),_&&_.m(r,null),c(r,p),w&&w.m(r,null),c(r,h),x&&x.m(r,null)},p:function(t,e){e.label?g?g.p(t,e):((g=J(0,e)).c(),g.m(r,i)):g&&(g.d(1),g=null),e.success?_?_.p(t,e):((_=$(0,e)).c(),_.m(r,p)):_&&(_.d(1),_=null),e.error?w?w.p(t,e):((w=X(0,e)).c(),w.m(r,h)):w&&(w.d(1),w=null),e.success||e.error||!e.help?x&&(x.d(1),x=null):x?x.p(t,e):((x=Z(0,e)).c(),x.m(r,null)),t.width&&v(r,"width",e.width),t.uid&&(r.dataset.uid=e.uid),t.success&&b(r,"success",e.success),t.error&&b(r,"error",e.error)},d:function(t){t&&u(r),g&&g.d(),m&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(a,m),_&&_.d(),w&&w.d(),x&&x.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function K(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function Q(){}o(z.prototype,T);var V={createAccount:function(t){try{var e=this;return e.set({signedUp:!0}),n="Chart Editor",r="send-embed-code",window._paq&&window._paq.push(["trackEvent",n,r,o,i]),function(t){if(t&&t.then)return t.then(Q)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){var n=null;return n=void 0!==window.chart?window.chart.get().id:e.store.get().id,K(B("/v3/auth/signup",{payload:{email:t,invitation:!0,chartId:n}}),(function(t){e.get().fromSvelte?(e.set({signedUp:!1,error:""}),e.store.set({user:t})):window.location.reload()}))}),(function(t){return function(t){var e=t();if(e&&e.then)return e.then(Q)}((function(){if("HttpReqError"===t.name)return K(t.response.json(),(function(n){e.set({error:n.message||t})}));e.set({error:"Unknown error: ".concat(t)})}))})))}catch(t){return Promise.reject(t)}var n,r,o,i}};function W(t,e,n){var r=Object.create(t);return r.text=e[n],r}function Y(t,e,n){var r=Object.create(t);return r.text=e[n],r}function tt(t,e){var n,o,i,c=E("publish / guest / h1"),a=E("publish / guest / p");return{c:function(){n=l("h2"),o=d("\n\n            "),i=l("p")},m:function(t,e){s(t,n,e),n.innerHTML=c,s(t,o,e),s(t,i,e),i.innerHTML=a},p:r,d:function(t){t&&(u(n),u(o),u(i))}}}function et(t,e){for(var n,r=e.guest_text_above,o=[],i=0;i<r.length;i+=1)o[i]=nt(t,Y(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=p()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);s(t,n,e)},p:function(e,i){if(e.guest_text_above){r=i.guest_text_above;for(var c=0;c<r.length;c+=1){var s=Y(i,r,c);o[c]?o[c].p(e,s):(o[c]=nt(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){f(o,t),t&&u(n)}}}function nt(t,e){var n,r,o=e.text;return{c:function(){n=l("noscript"),r=l("noscript")},m:function(t,e){s(t,n,e),n.insertAdjacentHTML("afterend",o),s(t,r,e)},p:function(t,e){t.guest_text_above&&o!==(o=e.text)&&(a(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(a(n,r),u(n),u(r))}}}function rt(t,e){for(var n,r=e.guest_text_below,o=[],i=0;i<r.length;i+=1)o[i]=ot(t,W(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=p()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);s(t,n,e)},p:function(e,i){if(e.guest_text_below){r=i.guest_text_below;for(var c=0;c<r.length;c+=1){var s=W(i,r,c);o[c]?o[c].p(e,s):(o[c]=ot(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){f(o,t),t&&u(n)}}}function ot(t,e){var n,r,o=e.text;return{c:function(){n=l("noscript"),r=l("noscript")},m:function(t,e){s(t,n,e),n.insertAdjacentHTML("afterend",o),s(t,r,e)},p:function(t,e){t.guest_text_below&&o!==(o=e.text)&&(a(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(a(n,r),u(n),u(r))}}}function it(t,e){var n,r;return{c:function(){n=l("div"),r=d(e.error),n.className="alert alert-warning"},m:function(t,e){s(t,n,e),c(n,r)},p:function(t,e){t.error&&function(t,e){t.data=""+e}(r,e.error)},d:function(t){t&&u(n)}}}function ct(t){y(this,t),this._state=o({error:"",email:"",guest_text_above:[],guest_text_below:[],signedUp:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,a,f,p,b,g,_,y,w,x,T,O,j,S,P,L,N,k=!1,C=E("publish / guest / cta"),H=E("publish / guest / back");function M(t){return t.guest_text_above?et:tt}var A=M(e),R=A(t,e);function D(){k=!0,t.set({email:f.value}),k=!1}function U(n){t.createAccount(e.email)}var I={label:E("publish / guest / e-mail"),help:E("publish / guest / example-email")},q=new z({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:I}),B=e.guest_text_below&&rt(t,e),F=e.error&&it(t,e);return{c:function(){var t,c,s;n=l("div"),r=l("div"),o=l("div"),R.c(),i=d("\n\n        "),a=l("div"),f=l("input"),p=d("\n\n                "),b=l("button"),g=l("i"),y=d("\n                      "),w=l("noscript"),q._fragment.c(),x=d("\n\n        "),B&&B.c(),T=d("\n\n        "),O=l("div"),j=l("button"),S=l("i"),P=d("   "),L=l("noscript"),N=d("\n\n            "),F&&F.c(),v(o,"margin-bottom","20px"),h(f,"input",D),t=f,c="type",null==(s="email")?t.removeAttribute(c):t.setAttribute(c,s),f.className="input-xlarge",g.className=_="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),h(b,"click",U),b.className="btn btn-save btn-primary",v(b,"white-space","nowrap"),v(b,"margin-left","10px"),v(a,"display","flex"),S.className="fa fa-chevron-left",j.className="btn btn-save btn-default btn-back",v(O,"margin-top","30px"),r.className="span5",n.className="row publish-signup"},m:function(t,u){s(t,n,u),c(n,r),c(r,o),R.m(o,null),c(r,i),c(q._slotted.default,a),c(a,f),f.value=e.email,c(a,p),c(a,b),c(b,g),c(b,y),c(b,w),w.insertAdjacentHTML("afterend",C),q._mount(r,null),c(r,x),B&&B.m(r,null),c(r,T),c(r,O),c(O,j),c(j,S),c(j,P),c(j,L),L.insertAdjacentHTML("afterend",H),c(O,N),F&&F.m(O,null)},p:function(n,i){A===(A=M(e=i))&&R?R.p(n,e):(R.d(1),(R=A(t,e)).c(),R.m(o,null)),!k&&n.email&&(f.value=e.email),n.signedUp&&_!==(_="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(g.className=_),e.guest_text_below?B?B.p(n,e):((B=rt(t,e)).c(),B.m(r,T)):B&&(B.d(1),B=null),e.error?F?F.p(n,e):((F=it(t,e)).c(),F.m(O,null)):F&&(F.d(1),F=null)},d:function(t){t&&u(n),R.d(),m(f,"input",D),m(b,"click",U),q.destroy(),B&&B.d(),F&&F.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),_(this))}function st(){}o(ct.prototype,T),o(ct.prototype,V);var ut={resendActivation:function(){try{var t=this;return t.set({status:"sending"}),function(t){if(t&&t.then)return t.then(st)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return e=B("/v3/auth/resend-activation"),n=function(){t.set({status:"success"})},r?n?n(e):e:(e&&e.then||(e=Promise.resolve(e)),n?e.then(n):e);var e,n,r}),(function(){t.set({status:"error"})})))}catch(t){return Promise.reject(t)}}};function at(t,e){var n,r,o,i,a,f=E("publish / pending-activation / resend");function p(e){t.resendActivation()}return{c:function(){n=l("button"),r=l("i"),i=d("\n             \n            "),a=l("noscript"),r.className=o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"),h(n,"click",p),n.className="btn btn-primary"},m:function(t,e){s(t,n,e),c(n,r),c(n,i),c(n,a),a.insertAdjacentHTML("afterend",f)},p:function(t,e){t.status&&o!==(o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(r.className=o)},d:function(t){t&&u(n),m(n,"click",p)}}}function ft(t,e){var n,o=E("publish / pending-activation / resend-error");return{c:function(){n=l("p")},m:function(t,e){s(t,n,e),n.innerHTML=o},p:r,d:function(t){t&&u(n)}}}function lt(t,e){var n,o=E("publish / pending-activation / resend-success");return{c:function(){n=l("p")},m:function(t,e){s(t,n,e),n.innerHTML=o},p:r,d:function(t){t&&u(n)}}}function dt(t){y(this,t),this._state=o({status:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,a,f,p=E("publish / pending-activation / h1"),h=E("publish / pending-activation / p");function m(t){return"success"==t.status?lt:"error"==t.status?ft:at}var b=m(e),g=b(t,e);return{c:function(){n=l("div"),r=l("h2"),o=d("\n\n    "),i=l("p"),a=d("\n\n    "),f=l("div"),g.c(),v(f,"margin-top","20px")},m:function(t,e){s(t,n,e),c(n,r),r.innerHTML=p,c(n,o),c(n,i),i.innerHTML=h,c(n,a),c(n,f),g.m(f,null)},p:function(e,n){b===(b=m(n))&&g?g.p(e,n):(g.d(1),(g=b(t,n)).c(),g.m(f,null))},d:function(t){t&&u(n),g.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function pt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,r){var o=document.createElement("script");o.src=t,o.onload=function(){e&&e(),n()},o.onerror=r,document.body.appendChild(o)}))}function ht(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return"string"==typeof t&&(t={src:t}),t.parentElement&&"function"==typeof t.parentElement.appendChild||(t.parentElement=document.head),new Promise((function(n,r){var o=document.createElement("link");o.rel="stylesheet",o.href=t.src,o.onload=function(){e&&e(),n()},o.onerror=r,t.parentElement.appendChild(o)}))}function mt(t){var e=this,n=t.current;if(t.changed.afterEmbed&&n.afterEmbed){var r=n.afterEmbed[0];Promise.all([ht(r.css),pt(r.js)]).then((function(){require([r.module],(function(t){e.set({beforeExport:t.App})}))}))}}function vt(e,n){var r={beforeExport:n.beforeExport,redirectDisabled:n.redirectDisabled,embedTemplates:n.embedTemplates,embedType:n.embedType,pluginShareurls:n.pluginShareurls,shareurlType:n.shareurlType},o=new t.Publish({root:e.root,store:e.store,data:r});return{c:function(){o._fragment.c()},m:function(t,e){o._mount(t,e)},p:function(t,e){var n={};t.beforeExport&&(n.beforeExport=e.beforeExport),t.redirectDisabled&&(n.redirectDisabled=e.redirectDisabled),t.embedTemplates&&(n.embedTemplates=e.embedTemplates),t.embedType&&(n.embedType=e.embedType),t.pluginShareurls&&(n.pluginShareurls=e.pluginShareurls),t.shareurlType&&(n.shareurlType=e.shareurlType),o._set(n)},d:function(t){o.destroy(t)}}}function bt(t,e){var n=new dt({root:t.root,store:t.store});return{c:function(){n._fragment.c()},m:function(t,e){n._mount(t,e)},p:r,d:function(t){n.destroy(t)}}}function gt(t,e){var n={fromSvelte:"true",guest_text_above:e.guest_text_above,guest_text_below:e.guest_text_below},r=new ct({root:t.root,store:t.store,data:n});return{c:function(){r._fragment.c()},m:function(t,e){r._mount(t,e)},p:function(t,e){var n={};t.guest_text_above&&(n.guest_text_above=e.guest_text_above),t.guest_text_below&&(n.guest_text_below=e.guest_text_below),r._set(n)},d:function(t){r.destroy(t)}}}function _t(t){var e=this;y(this,t),this._state=o(o(this.store._init(["user"]),{embedTemplates:[],embedType:"responsive",pluginShareurls:[],shareurlType:"default",beforeExport:null,guest_text_above:"",guest_text_below:"",redirectDisabled:!1}),t.data),this.store._add(this,["user"]),this._intro=!0,this._handlers.state=[mt],this._handlers.destroy=[x],mt.call(this,{changed:i({},this._state),current:this._state}),this._fragment=function(t,e){var n;function r(t){return t.$user.isGuest?gt:t.$user.isActivated?vt:bt}var o=r(e),i=o(t,e);return{c:function(){n=l("div"),i.c()},m:function(t,e){s(t,n,e),i.m(n,null)},p:function(e,c){o===(o=r(c))&&i?i.p(e,c):(i.d(1),(i=o(t,c)).c(),i.m(n,null))},d:function(t){t&&u(n),i.d()}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),_(this))}function yt(t,e,n){var r=e.bind(this);return n&&!1===n.init||r(this.get()[t]),this.on(n&&n.defer?"update":"state",(function(e){var n=e.changed,o=e.current,i=e.previous;n[t]&&r(o[t],i&&i[t])}))}function wt(){var t=this;this.store.observe=yt,this.store.observe("publishLogic",(function(e){e&&e.mod?(ht(e.css),pt(e.src,(function(){require([e.mod],(function(n){t.set({PublishLogic:n.App}),t.refs.publish.set(e.data)}))}))):(t.set({PublishLogic:_t}),t.refs.publish.set(e.data))}))}function xt(t){var e=this;y(this,t),this.refs={},this._state=o({PublishLogic:_t},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o=e.PublishLogic;function i(e){return{root:t.root,store:t.store}}if(o)var a=new o(i());return{c:function(){n=l("div"),r=l("div"),a&&a._fragment.c(),r.className="publish-step is-published",n.className="dw-create-publish"},m:function(e,o){s(e,n,o),c(n,r),a&&(a._mount(r,null),t.refs.publish=a)},p:function(e,n){o!==(o=n.PublishLogic)&&(a&&a.destroy(),o?((a=new o(i()))._fragment.c(),a._mount(r,null),t.refs.publish=a):(a=null,t.refs.publish===a&&(t.refs.publish=null)))},d:function(t){t&&u(n),a&&a.destroy()}}}(this,this._state),this.root._oncreate.push((function(){wt.call(e),e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),_(this))}return o(dt.prototype,T),o(dt.prototype,ut),o(_t.prototype,T),o(xt.prototype,T),{PublishSidebar:xt}}));
