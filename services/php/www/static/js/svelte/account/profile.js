!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/account/profile",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["account/profile"]=t()}(this,(function(){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function n(){}function r(e,t){for(var n in t)e[n]=t[n];return e}function s(e,t){e.appendChild(t)}function o(e,t,n){e.insertBefore(t,n)}function a(e){e.parentNode.removeChild(e)}function c(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function i(){return document.createDocumentFragment()}function u(e){return document.createElement(e)}function l(e){return document.createTextNode(e)}function d(){return document.createComment("")}function f(e,t,n,r){e.addEventListener(t,n,r)}function p(e,t,n,r){e.removeEventListener(t,n,r)}function h(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function w(e,t,n){e.style.setProperty(t,n)}function m(e,t,n){e.classList[n?"add":"remove"](t)}function g(){return Object.create(null)}function v(t,n){return t!=t?n==n:t!==n||t&&"object"===e(t)||"function"==typeof t}function _(e,t){return e!=e?t==t:e!==t}function b(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var s=n[r];if(!s.__calling)try{s.__calling=!0,s.call(this,t)}finally{s.__calling=!1}}}function y(e){e._lock=!0,O(e._beforecreate),O(e._oncreate),O(e._aftercreate),e._lock=!1}function P(){return this._state}function k(e,t){e._handlers=g(),e._slots=g(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function E(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function O(e){for(;e&&e.length;)e.shift()()}var S={destroy:function(e){this.destroy=n,this.fire("destroy"),this.set=n,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:P,fire:b,on:E,set:function(e){this._set(r({},e)),this.root._lock||y(this.root)},_recompute:n,_set:function(e){var t=this._state,n={},s=!1;for(var o in e=r(this._staged,e),this._staged={},e)this._differs(e[o],t[o])&&(n[o]=s=!0);s&&(this._state=r(r({},t),e),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:t}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:t})))},_stage:function(e){r(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:v},N={};function x(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(N[e]=window.__dw.vis.meta.locale||{}):N[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}function H(e){var t=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(e=e.trim(),N[n]||x(n),!N[n][e])return"MISSING:"+e;var r=N[n][e];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(e,n){return n=2+Number(n),void 0===t[n]?e:t[n]}))),r}function T(e,t){return(T=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function j(t,n){return!n||"object"!==e(n)&&"function"!=typeof n?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(t):n}function A(e){return(A=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function C(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function q(e,t,n){return(q=C()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var s=new(Function.bind.apply(e,r));return n&&T(s,n.prototype),s}).apply(null,arguments)}function R(e){var t="function"==typeof Map?new Map:void 0;return(R=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,r)}function r(){return q(e,arguments,A(this).constructor)}return r.prototype=Object.create(e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),T(r,e)})(e)}function L(e,t){if(null==e)return{};var n,r,s=function(e,t){if(null==e)return{};var n,r,s={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}var M={exports:{}};
/*!
   * JavaScript Cookie v2.2.1
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function s(){}function o(t,n,o){if("undefined"!=typeof document){"number"==typeof(o=e({path:"/"},s.defaults,o)).expires&&(o.expires=new Date(1*new Date+864e5*o.expires)),o.expires=o.expires?o.expires.toUTCString():"";try{var a=JSON.stringify(n);/^[\{\[]/.test(a)&&(n=a)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var c="";for(var i in o)o[i]&&(c+="; "+i,!0!==o[i]&&(c+="="+o[i].split(";")[0]));return document.cookie=t+"="+n+c}}function a(e,n){if("undefined"!=typeof document){for(var s={},o=document.cookie?document.cookie.split("; "):[],a=0;a<o.length;a++){var c=o[a].split("="),i=c.slice(1).join("=");n||'"'!==i.charAt(0)||(i=i.slice(1,-1));try{var u=t(c[0]);if(i=(r.read||r)(i,u)||t(i),n)try{i=JSON.parse(i)}catch(e){}if(s[u]=i,e===u)break}catch(e){}}return e?s[e]:s}}return s.set=o,s.get=function(e){return a(e,!1)},s.getJSON=function(e){return a(e,!0)},s.remove=function(t,n){o(t,"",e(n,{expires:-1}))},s.defaults={},s.withConverter=n,s}((function(){}))},e.exports=n()}(M);var D=M.exports;function U(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=A(e);if(t){var s=A(this).constructor;n=Reflect.construct(r,arguments,s)}else n=r.apply(this,arguments);return j(this,n)}}function I(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function B(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?I(Object(r),!0).forEach((function(n){t(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):I(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var F=new Set(["get","head","options","trace"]);function Y(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=B(B({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},t),{},{headers:B({"Content-Type":"application/json"},t.headers)}),s=r.payload,o=r.baseUrl,a=r.fetch,c=r.raw,i=L(r,["payload","baseUrl","fetch","raw"]),u="".concat(o.replace(/\/$/,""),"/").concat(e.replace(/^\//,""));if(s&&(i.body=JSON.stringify(s)),F.has(i.method.toLowerCase()))n=a(u,i);else{var l=D.get("crumb");l?(i.headers["X-CSRF-Token"]=l,n=a(u,i)):n=Y("/v3/me",{fetch:a,baseUrl:o}).then((function(){var e=D.get("crumb");e&&(i.headers["X-CSRF-Token"]=e)})).catch((function(){})).then((function(){return a(u,i)}))}return n.then((function(e){if(c)return e;if(!e.ok)throw new J(e);if(204===e.status||!e.headers.get("content-type"))return e;var t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()}))}function G(e){return function(t,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(e.toLowerCase(),"()"));return Y(t,B(B({},n),{},{method:e}))}}Y.get=G("GET"),Y.patch=G("PATCH"),Y.put=G("PUT"),Y.post=G("POST"),Y.head=G("HEAD"),Y.delete=G("DELETE");var J=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&T(e,t)}(n,e);var t=U(n);function n(e){var r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),(r=t.call(this)).name="HttpReqError",r.status=e.status,r.statusText=e.statusText,r.message="[".concat(e.status,"] ").concat(e.statusText),r.response=e,r}return n}(R(Error));function $(e,t){var n;return{c:function(){(n=u("label")).className="control-label svelte-1nkiaxn"},m:function(e,r){o(e,n,r),n.innerHTML=t.label},p:function(e,t){e.label&&(n.innerHTML=t.label)},d:function(e){e&&a(n)}}}function X(e,t){var n;return{c:function(){(n=u("div")).className="help success svelte-1nkiaxn"},m:function(e,r){o(e,n,r),n.innerHTML=t.success},p:function(e,t){e.success&&(n.innerHTML=t.success)},d:function(e){e&&a(n)}}}function z(e,t){var n;return{c:function(){(n=u("div")).className="help error svelte-1nkiaxn"},m:function(e,r){o(e,n,r),n.innerHTML=t.error},p:function(e,t){e.error&&(n.innerHTML=t.error)},d:function(e){e&&a(n)}}}function Z(e,t){var n;return{c:function(){(n=u("div")).className="help svelte-1nkiaxn"},m:function(e,r){o(e,n,r),n.innerHTML=t.help},p:function(e,t){e.help&&(n.innerHTML=t.help)},d:function(e){e&&a(n)}}}function K(e){var t,n,c,i,d,f,p,h,g,v,_,b,y;k(this,e),this._state=r({label:"",help:"",error:!1,success:!1,width:"auto",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(t=this,n=this._state,g=t._slotted.default,v=n.label&&$(0,n),_=n.success&&X(0,n),b=n.error&&z(0,n),y=!n.success&&!n.error&&n.help&&Z(0,n),{c:function(){c=u("div"),v&&v.c(),i=l("\n    "),d=u("div"),f=l("\n    "),_&&_.c(),p=l(" "),b&&b.c(),h=l(" "),y&&y.c(),d.className="form-controls svelte-1nkiaxn",c.className="form-block svelte-1nkiaxn",w(c,"width",n.width),c.dataset.uid=n.uid,m(c,"success",n.success),m(c,"error",n.error)},m:function(e,t){o(e,c,t),v&&v.m(c,null),s(c,i),s(c,d),g&&s(d,g),s(c,f),_&&_.m(c,null),s(c,p),b&&b.m(c,null),s(c,h),y&&y.m(c,null)},p:function(e,t){t.label?v?v.p(e,t):((v=$(0,t)).c(),v.m(c,i)):v&&(v.d(1),v=null),t.success?_?_.p(e,t):((_=X(0,t)).c(),_.m(c,p)):_&&(_.d(1),_=null),t.error?b?b.p(e,t):((b=z(0,t)).c(),b.m(c,h)):b&&(b.d(1),b=null),t.success||t.error||!t.help?y&&(y.d(1),y=null):y?y.p(e,t):((y=Z(0,t)).c(),y.m(c,null)),e.width&&w(c,"width",t.width),e.uid&&(c.dataset.uid=t.uid),e.success&&m(c,"success",t.success),e.error&&m(c,"error",t.error)},d:function(e){e&&a(c),v&&v.d(),g&&function(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}(d,g),_&&_.d(),b&&b.d(),y&&y.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}r(K.prototype,S);var Q,V=!1;function W(e){var t=e.password;return Q?Q(t):(!V&&t.length>4&&(V=!0,require(["zxcvbn"],(function(e){Q=e}))),!1)}function ee(e,t){return{c:n,m:n,d:n}}function te(e){var t,n,s;k(this,e),this._state=r({password:""},e.data),this._recompute({password:1,passwordStrength:1,passwordTooShort:1,passwordHelp:1},this._state),this._intro=!0,this._fragment=(t=this._state,s=t.password.length>=8&&ee(),{c:function(){s&&s.c(),n=d()},m:function(e,t){s&&s.m(e,t),o(e,n,t)},p:function(e,t){t.password.length>=8?s||((s=ee()).c(),s.m(n.parentNode,n)):s&&(s.d(1),s=null)},d:function(e){s&&s.d(e),e&&a(n)}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}function ne(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}function re(){}function se(e){var t=e();if(t&&t.then)return t.then(re)}function oe(e,t){try{var n=e()}catch(e){return t(e)}return n&&n.then?n.then(void 0,t):n}function ae(e,t){return e&&e.then?e.then(t):t(e)}r(te.prototype,S),te.prototype._recompute=function(e,t){e.password&&(this._differs(t.passwordTooShort,t.passwordTooShort=t.password.length<8)&&(e.passwordTooShort=!0),this._differs(t.passwordStrength,t.passwordStrength=W(t))&&(e.passwordStrength=!0)),(e.password||e.passwordStrength)&&this._differs(t.passwordHelp,t.passwordHelp=function(e){var t=e.password,n=e.passwordStrength;if(""===t||!n)return H("account / pwd-too-short").replace("%num",8);var r=["bad","weak","ok","good","excellent"][n.score];return H("account / password / ".concat(r))}(t))&&(e.passwordHelp=!0),(e.password||e.passwordTooShort||e.passwordStrength||e.passwordHelp)&&this._differs(t.passwordError,t.passwordError=function(e){var t=e.password,n=e.passwordTooShort,r=e.passwordStrength,s=e.passwordHelp;return!!t&&(n?H("account / pwd-too-short").replace("%num",8):!!(r&&r.score<2)&&s)}(t))&&(e.passwordError=!0),(e.passwordStrength||e.passwordHelp)&&this._differs(t.passwordSuccess,t.passwordSuccess=function(e){var t=e.passwordStrength,n=e.passwordHelp;return!!(t&&t.score>2)&&n}(t))&&(e.passwordSuccess=!0),(e.password||e.passwordTooShort)&&this._differs(t.passwordOk,t.passwordOk=function(e){var t=e.password,n=e.passwordTooShort;return t&&!n}(t))&&(e.passwordOk=!0)};var ce={changeEmail:function(){try{var e=this,t=e.get().email;e.set({savingEmail:!0});var n=[],r=[];return ae(oe((function(){return ne(Y.patch("/v3/me",{payload:{email:t}}),(function(t){n.push("Your email has been changed successfully. You will receive an email with a confirmation link."),e.set({email:t.email})}))}),(function(e){return se((function(){if("HttpReqError"===e.name)return ne(e.response.json(),(function(t){"Invalid request payload input"===t.message?r.push(H("account / change-email / error / invalid-email")):r.push(t.message?H("account / change-email / error / ".concat(t.message)):e.message)}));r.push("Unknown error: "+e)}))})),(function(){e.set({savingEmail:!1}),r.length?e.set({errors:r}):e.set({changeEmail:!1,messages:n,errors:[]})}))}catch(e){return Promise.reject(e)}},changePassword:function(){try{var e=this,t=e.get(),n=t.currentPassword,r=t.newPassword;e.set({savingPassword:!0});var s={password:r,oldPassword:n},o=[],a=[];return ae(oe((function(){return ne(Y.patch("/v3/me",{payload:s}),(function(){o.push("Your password has been changed!")}))}),(function(e){return se((function(){if("HttpReqError"===e.name)return ne(e.response.json(),(function(t){a.push(t.message||e.message)}));a.push("Unknown error: "+e)}))})),(function(){0===a.length?e.set({changePassword:!1,currentPassword:"",newPassword:"",messages:o,errors:[]}):e.set({errors:a}),e.set({savingPassword:!1})}))}catch(e){return Promise.reject(e)}},deleteAccount:function(){try{var e=this,t=e.get(),n=t.confirmPassword,r=t.confirmEmail;e.set({deletingAccount:!0});var s=[];return ae(oe((function(){return function(e,t){if(!t)return e&&e.then?e.then(re):Promise.resolve()}(Y.delete("/v3/me",{payload:{password:n,email:r}}))}),(function(e){return se((function(){if("HttpReqError"===e.name)return ne(e.response.json(),(function(t){"delete-or-transfer-teams-first"===t.message?s.push(H("account / delete / team-conflict")):s.push(t.message||e.message)}));s.push("Unknown error: "+e)}))})),(function(){e.set({deletingAccount:!1}),s.length?e.set({errors:s}):e.set({deleteAccount2:!1,deleteAccount3:!0})}))}catch(e){return Promise.reject(e)}}};function ie(e,t,n){var r=Object.create(e);return r.message=t[n],r}function ue(e,t,n){var r=Object.create(e);return r.message=t[n],r}function le(e,t){for(var n,r,i,l=t.messages,d=[],f=0;f<l.length;f+=1)d[f]=de(e,ue(t,l,f));return{c:function(){n=u("div"),r=u("div"),i=u("div");for(var e=0;e<d.length;e+=1)d[e].c();i.className="alert alert-success svelte-1uqq9ww",r.className="span6",n.className="row",w(n,"margin-top","20px")},m:function(e,t){o(e,n,t),s(n,r),s(r,i);for(var a=0;a<d.length;a+=1)d[a].m(i,null)},p:function(t,n){if(t.messages){l=n.messages;for(var r=0;r<l.length;r+=1){var s=ue(n,l,r);d[r]?d[r].p(t,s):(d[r]=de(e,s),d[r].c(),d[r].m(i,null))}for(;r<d.length;r+=1)d[r].d(1);d.length=l.length}},d:function(e){e&&a(n),c(d,e)}}}function de(e,t){var n,r=t.message;return{c:function(){(n=u("p")).className="svelte-1uqq9ww"},m:function(e,t){o(e,n,t),n.innerHTML=r},p:function(e,t){e.messages&&r!==(r=t.message)&&(n.innerHTML=r)},d:function(e){e&&a(n)}}}function fe(e,t){var n,r=t.errors.join("");return{c:function(){(n=u("div")).className="alert alert-warning"},m:function(e,t){o(e,n,t),n.innerHTML=r},p:function(e,t){e.errors&&r!==(r=t.errors.join(""))&&(n.innerHTML=r)},d:function(e){e&&a(n)}}}function pe(e,t){var r,c,i=H("account / email");function d(t){e.set({changeEmail:!0})}return{c:function(){r=u("button"),c=l(i),f(r,"click",d),r.className="btn btn-save btn-default"},m:function(e,t){o(e,r,t),s(r,c)},p:n,d:function(e){e&&a(r),p(r,"click",d)}}}function he(e,t){var n,r,c,i,d,h,w,m,g=H("Back"),v=H("account / email");function _(t){e.set({changeEmail:!1})}function b(t){e.changeEmail()}return{c:function(){n=u("button"),r=l(g),c=l("\n            "),i=u("button"),d=u("i"),w=l("  "),m=l(v),f(n,"click",_),n.className="btn btn-default",d.className=h="fa "+(t.savingEmail?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww",f(i,"click",b),i.className="btn btn-save btn-primary"},m:function(e,t){o(e,n,t),s(n,r),o(e,c,t),o(e,i,t),s(i,d),s(i,w),s(i,m)},p:function(e,t){e.savingEmail&&h!==(h="fa "+(t.savingEmail?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww")&&(d.className=h)},d:function(e){e&&a(n),p(n,"click",_),e&&(a(c),a(i)),p(i,"click",b)}}}function we(e,t){var n,r,c,d,m,g,v,_,b,y,P,k,E,O,S,N,x,T,j,A,C,q,R,L,M,D,U=H("account / password"),I=H("Back"),B=!1,F={},Y=H("account / invite / password-clear-text"),G=H("account / password");function J(t){e.set({changePassword:!1})}var $=t.changePassword&&t.errors&&t.errors.length&&ge(e,t);function X(){B=!0,e.set({currentPassword:_.value}),B=!1}var z={label:H("Current Password"),help:H("account / password / current-password-note")},Z=new K({root:e.root,store:e.store,slots:{default:i()},data:z});function Q(e){return e.showPasswordAsClearText?be:_e}var V=Q(t),W=V(e,t),ee={};void 0!==t.newPassword&&(ee.password=t.newPassword,F.password=!0),void 0!==t.passwordHelp&&(ee.passwordHelp=t.passwordHelp,F.passwordHelp=!0),void 0!==t.passwordSuccess&&(ee.passwordSuccess=t.passwordSuccess,F.passwordSuccess=!0),void 0!==t.passwordError&&(ee.passwordError=t.passwordError,F.passwordError=!0),void 0!==t.newPasswordOk&&(ee.passwordOk=t.newPasswordOk,F.passwordOk=!0);var ne=new te({root:e.root,store:e.store,data:ee,_bind:function(t,n){var r={};!F.password&&t.password&&(r.newPassword=n.password),!F.passwordHelp&&t.passwordHelp&&(r.passwordHelp=n.passwordHelp),!F.passwordSuccess&&t.passwordSuccess&&(r.passwordSuccess=n.passwordSuccess),!F.passwordError&&t.passwordError&&(r.passwordError=n.passwordError),!F.passwordOk&&t.passwordOk&&(r.newPasswordOk=n.passwordOk),e._set(r),F={}}});e.root._beforecreate.push((function(){ne._bind({password:1,passwordHelp:1,passwordSuccess:1,passwordError:1,passwordOk:1},ne.get())}));var re={error:t.passwordError,label:H("New Password"),success:t.passwordSuccess,help:t.passwordHelp},se=new K({root:e.root,store:e.store,slots:{default:i()},data:re});function oe(){e.set({showPasswordAsClearText:S.checked})}function ae(t){e.changePassword()}return{c:function(){n=u("h3"),r=l(U),c=l("\n            "),d=u("button"),m=l(I),g=l("\n        "),$&&$.c(),v=l("\n        "),_=u("input"),Z._fragment.c(),b=l("\n\n        "),W.c(),y=l("\n            "),P=u("div"),ne._fragment.c(),se._fragment.c(),k=l("\n        "),E=u("div"),O=u("label"),S=u("input"),N=l("\n                "),x=u("noscript"),T=l("\n\n        "),j=u("button"),A=u("i"),q=l("  "),R=l(G),M=l("\n        "),D=u("hr"),f(d,"click",J),d.className="btn btn-save btn-default btn-back",f(_,"input",X),h(_,"type","password"),_.className="input-xlarge",w(P,"width","287px"),f(S,"change",oe),h(S,"type","checkbox"),O.className="checkbox",E.className="control-group",w(E,"margin-top","-10px"),w(E,"margin-bottom","20px"),A.className=C="fa "+(t.savingPassword?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww",f(j,"click",ae),j.disabled=L=!(t.newPasswordOk&&t.currentPassword),j.className="btn btn-primary"},m:function(e,a){o(e,n,a),s(n,r),s(n,c),s(n,d),s(d,m),o(e,g,a),$&&$.m(e,a),o(e,v,a),s(Z._slotted.default,_),_.value=t.currentPassword,Z._mount(e,a),o(e,b,a),W.m(se._slotted.default,null),s(se._slotted.default,y),s(se._slotted.default,P),ne._mount(P,null),se._mount(e,a),o(e,k,a),o(e,E,a),s(E,O),s(O,S),S.checked=t.showPasswordAsClearText,s(O,N),s(O,x),x.insertAdjacentHTML("afterend",Y),o(e,T,a),o(e,j,a),s(j,A),s(j,q),s(j,R),o(e,M,a),o(e,D,a)},p:function(n,r){(t=r).changePassword&&t.errors&&t.errors.length?$?$.p(n,t):(($=ge(e,t)).c(),$.m(v.parentNode,v)):$&&($.d(1),$=null),!B&&n.currentPassword&&(_.value=t.currentPassword),V===(V=Q(t))&&W?W.p(n,t):(W.d(1),(W=V(e,t)).c(),W.m(y.parentNode,y));var s={};!F.password&&n.newPassword&&(s.password=t.newPassword,F.password=void 0!==t.newPassword),!F.passwordHelp&&n.passwordHelp&&(s.passwordHelp=t.passwordHelp,F.passwordHelp=void 0!==t.passwordHelp),!F.passwordSuccess&&n.passwordSuccess&&(s.passwordSuccess=t.passwordSuccess,F.passwordSuccess=void 0!==t.passwordSuccess),!F.passwordError&&n.passwordError&&(s.passwordError=t.passwordError,F.passwordError=void 0!==t.passwordError),!F.passwordOk&&n.newPasswordOk&&(s.passwordOk=t.newPasswordOk,F.passwordOk=void 0!==t.newPasswordOk),ne._set(s),F={};var o={};n.passwordError&&(o.error=t.passwordError),n.passwordSuccess&&(o.success=t.passwordSuccess),n.passwordHelp&&(o.help=t.passwordHelp),se._set(o),n.showPasswordAsClearText&&(S.checked=t.showPasswordAsClearText),n.savingPassword&&C!==(C="fa "+(t.savingPassword?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww")&&(A.className=C),(n.newPasswordOk||n.currentPassword)&&L!==(L=!(t.newPasswordOk&&t.currentPassword))&&(j.disabled=L)},d:function(e){e&&a(n),p(d,"click",J),e&&a(g),$&&$.d(e),e&&a(v),p(_,"input",X),Z.destroy(e),e&&a(b),W.d(),ne.destroy(),se.destroy(e),e&&(a(k),a(E)),p(S,"change",oe),e&&(a(T),a(j)),p(j,"click",ae),e&&(a(M),a(D))}}}function me(e,t){var r,o,a,c,d=H("account / password");function w(t){e.set({changePassword:!0})}var m={label:H("Password"),help:""},g=new K({root:e.root,store:e.store,slots:{default:i()},data:m});return{c:function(){r=u("input"),o=l("\n            "),a=u("button"),c=l(d),g._fragment.c(),r.disabled=!0,r.value="abcdefgh",h(r,"type","password"),f(a,"click",w),a.className="btn btn-save btn-default"},m:function(e,t){s(g._slotted.default,r),s(g._slotted.default,o),s(g._slotted.default,a),s(a,c),g._mount(e,t)},p:n,d:function(e){p(a,"click",w),g.destroy(e)}}}function ge(e,t){for(var n,r=t.errors,s=[],i=0;i<r.length;i+=1)s[i]=ve(e,ie(t,r,i));return{c:function(){n=u("div");for(var e=0;e<s.length;e+=1)s[e].c();n.className="alert svelte-1uqq9ww"},m:function(e,t){o(e,n,t);for(var r=0;r<s.length;r+=1)s[r].m(n,null)},p:function(t,o){if(t.errors){r=o.errors;for(var a=0;a<r.length;a+=1){var c=ie(o,r,a);s[a]?s[a].p(t,c):(s[a]=ve(e,c),s[a].c(),s[a].m(n,null))}for(;a<s.length;a+=1)s[a].d(1);s.length=r.length}},d:function(e){e&&a(n),c(s,e)}}}function ve(e,t){var n,r=t.message;return{c:function(){(n=u("p")).className="svelte-1uqq9ww"},m:function(e,t){o(e,n,t),n.innerHTML=r},p:function(e,t){e.errors&&r!==(r=t.message)&&(n.innerHTML=r)},d:function(e){e&&a(n)}}}function _e(e,t){var n,r=!1;function s(){r=!0,e.set({newPassword:n.value}),r=!1}return{c:function(){f(n=u("input"),"input",s),n.dataset.lpignore="true",h(n,"type","password"),n.className="input-xlarge"},m:function(e,r){o(e,n,r),n.value=t.newPassword},p:function(e,t){!r&&e.newPassword&&(n.value=t.newPassword)},d:function(e){e&&a(n),p(n,"input",s)}}}function be(e,t){var n,r=!1;function s(){r=!0,e.set({newPassword:n.value}),r=!1}return{c:function(){f(n=u("input"),"input",s),n.dataset.lpignore="true",h(n,"type","text"),n.className="input-xlarge"},m:function(e,r){o(e,n,r),n.value=t.newPassword},p:function(e,t){!r&&e.newPassword&&(n.value=t.newPassword)},d:function(e){e&&a(n),p(n,"input",s)}}}function ye(e,t){var r,o,a=H("account / delete");function c(t){e.set({deleteAccount:!0})}var d=new K({root:e.root,store:e.store,slots:{default:i()},data:{label:"Delete account",help:""}});return{c:function(){r=u("button"),o=l(a),d._fragment.c(),f(r,"click",c),r.className="btn btn-danger",h(r,"href","#")},m:function(e,t){s(d._slotted.default,r),s(r,o),d._mount(e,t)},p:n,d:function(e){p(r,"click",c),d.destroy(e)}}}function Pe(e,t){var r,c,i,d,h,w,m,g,v,_,b,y,P,k,E,O,S=H("account / confirm-account-deletion"),N=H("account / confirm-account-deletion / no"),x=H("account / or"),T=H("account / confirm-account-deletion / yes");function j(t){e.set({deleteAccount:!1})}function A(t){e.set({deleteAccount:!1,deleteAccount2:!0})}return{c:function(){r=u("h3"),c=u("i"),i=l(" "),d=l(S),h=l("\n        "),w=u("button"),m=u("i"),g=l("\n              "),v=l(N),_=l("\n\n        "),b=l(x),y=l("\n\n        "),P=u("button"),k=u("i"),E=l("   "),O=l(T),c.className="fa fa-times svelte-1uqq9ww",r.className="svelte-1uqq9ww",m.className="fa fa-chevron-left",f(w,"click",j),w.className="btn btn-back btn-primary",k.className="fa fa-times",f(P,"click",A),P.className="btn btn-default"},m:function(e,t){o(e,r,t),s(r,c),s(r,i),s(r,d),o(e,h,t),o(e,w,t),s(w,m),s(w,g),s(w,v),o(e,_,t),o(e,b,t),o(e,y,t),o(e,P,t),s(P,k),s(P,E),s(P,O)},p:n,d:function(e){e&&(a(r),a(h),a(w)),p(w,"click",j),e&&(a(_),a(b),a(y),a(P)),p(P,"click",A)}}}function ke(e,t){var n,r,c,d,m,g,v,_,b,y,P,k,E,O,S,N,x,T,j,A,C,q,R,L,M,D,U,I,B,F,Y,G,J,$,X,z,Z,Q=H("account / delete / hed"),V=H("account / delete / really"),W=H("account / confirm-account-deletion / free"),ee=H("You cannot login and logout anymore."),te=H("You cannot edit or remove your charts anymore."),ne=H("account / delete / charts-stay-online"),re=!1,se=!1,oe=H("account / delete / really-really"),ae=H("No, I changed my mind.."),ce=H("Yes, delete it!");function ie(){re=!0,e.set({confirmEmail:C.value}),re=!1}function ue(){se=!0,e.set({confirmPassword:R.value}),se=!1}var le={label:H("Please enter your password to confirm the deletion request:"),error:!(!t.errors||!t.errors.length)&&t.errors.join(". ")},de=new K({root:e.root,store:e.store,slots:{default:i()},data:le});function fe(t){e.set({deleteAccount2:!1})}function pe(t){e.deleteAccount()}return{c:function(){n=u("h2"),r=l(Q),c=l("\n        "),d=u("div"),m=u("p"),g=l(V),v=l("\n            "),_=u("ul"),b=u("li"),y=l(W),P=l("\n                "),k=u("li"),E=l(ee),O=l("\n                "),S=u("li"),N=l(te),x=l("\n            "),T=u("p"),j=l(ne),A=l("\n\n            "),C=u("input"),q=l("\n                "),R=u("input"),de._fragment.c(),L=l("\n            "),M=u("p"),D=l("\n            "),U=u("div"),I=u("button"),B=u("i"),F=l("  "),Y=l(ae),G=l("\n                "),J=u("button"),$=u("i"),z=l(" \n                    "),Z=l(ce),w(n,"margin-bottom","20px"),f(C,"input",ie),h(C,"type","email"),C.placeholder=H("E-Mail"),f(R,"input",ue),h(R,"type","password"),R.placeholder=H("Password"),M.className="lead",B.className="fa fa-chevron-left",f(I,"click",fe),I.className="btn btn-info",$.className=X="fa "+(t.deletingAccount?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww",f(J,"click",pe),J.className="btn btn-danger",U.className="control-group",d.className="delete-account"},m:function(e,a){o(e,n,a),s(n,r),o(e,c,a),o(e,d,a),s(d,m),s(m,g),s(d,v),s(d,_),s(_,b),s(b,y),s(_,P),s(_,k),s(k,E),s(_,O),s(_,S),s(S,N),s(d,x),s(d,T),s(T,j),s(d,A),s(de._slotted.default,C),C.value=t.confirmEmail,s(de._slotted.default,q),s(de._slotted.default,R),R.value=t.confirmPassword,de._mount(d,null),s(d,L),s(d,M),M.innerHTML=oe,s(d,D),s(d,U),s(U,I),s(I,B),s(I,F),s(I,Y),s(U,G),s(U,J),s(J,$),s(J,z),s(J,Z)},p:function(e,t){!re&&e.confirmEmail&&(C.value=t.confirmEmail),!se&&e.confirmPassword&&(R.value=t.confirmPassword);var n={};e.errors&&(n.error=!(!t.errors||!t.errors.length)&&t.errors.join(". ")),de._set(n),e.deletingAccount&&X!==(X="fa "+(t.deletingAccount?"fa-spin fa-spinner":"fa-check")+" svelte-1uqq9ww")&&($.className=X)},d:function(e){e&&(a(n),a(c),a(d)),p(C,"input",ie),p(R,"input",ue),de.destroy(),p(I,"click",fe),p(J,"click",pe)}}}function Ee(e,t){var r,c,i,d,f,p,h,m,g=H("account / delete / hed"),v=H("Your account has been deleted."),_=H("Goodbye!");return{c:function(){r=u("h2"),c=l(g),i=l("\n        "),d=u("h3"),f=l(v),p=l("\n        "),h=u("a"),m=l(_),w(r,"margin-bottom","20px"),h.href="/",h.className="btn btn-primary btn-large"},m:function(e,t){o(e,r,t),s(r,c),o(e,i,t),o(e,d,t),s(d,f),o(e,p,t),o(e,h,t),s(h,m)},p:n,d:function(e){e&&(a(r),a(i),a(d),a(p),a(h))}}}function Oe(e){k(this,e),this._state=r({changePassword:!1,changeEmail:!1,deleteAccount:!1,deleteAccount2:!1,deleteAccount3:!1,deletingAccount:!1,showPasswordInPlaintext:!1,messages:[],currentPassword:"",newPassword:"",newPasswordOk:!1,passwordError:!1,passwordHelp:!1,passwordSuccess:!1,confirmEmail:"",confirmPassword:"",email:"",savingEmail:!1,savingPassword:!1,showPasswordAsClearText:!1,errors:[],groups:[{title:"Account settings",tabs:[{title:"Profile",icon:"fa fa-fw fa-user"}]},{title:"Team settings",tabs:[]}]},e.data),this._intro=!0,this._fragment=function(e,t){var n,r,c,m,g,v,_,b,y,P,k,E,O,S,N,x,T,j=H("Edit profile"),A=!1,C=H("account / change-login"),q=t.messages&&t.messages.length&&le(e,t),R=t.changeEmail&&t.errors.length&&fe(e,t);function L(){A=!0,e.set({email:b.value}),A=!1}function M(e){return e.changeEmail?he:pe}var D=M(t),U=D(e,t),I={label:H("E-Mail"),help:t.changeEmail?H("account / confirm-email-change"):""},B=new K({root:e.root,store:e.store,slots:{default:i()},data:I});function F(e){return e.changePassword?we:me}var Y=F(t),G=Y(e,t);function J(e){return e.deleteAccount3?Ee:e.deleteAccount2?ke:e.deleteAccount?Pe:ye}var $=J(t),X=$(e,t);return{c:function(){n=u("h2"),r=l(j),c=l("\n\n"),q&&q.c(),m=l("\n\n"),g=u("div"),v=u("div"),R&&R.c(),_=l("\n        "),b=u("input"),P=l("\n            "),U.c(),k=d(),B._fragment.c(),E=l("\n\n        "),G.c(),O=l(" "),X.c(),S=l("\n    "),N=u("div"),x=u("p"),T=l(C),f(b,"input",L),b.disabled=y=!t.changeEmail,h(b,"type","email"),v.className="span6",x.className="help",N.className="span4",g.className="row edit-account",w(g,"margin-top",(t.messages&&t.messages.length?0:20)+"px")},m:function(e,a){o(e,n,a),s(n,r),o(e,c,a),q&&q.m(e,a),o(e,m,a),o(e,g,a),s(g,v),R&&R.m(v,null),s(v,_),s(B._slotted.default,b),b.value=t.email,s(B._slotted.default,P),U.m(B._slotted.default,null),s(B._slotted.default,k),B._mount(v,null),s(v,E),G.m(v,null),s(v,O),X.m(v,null),s(g,S),s(g,N),s(N,x),s(x,T)},p:function(t,n){n.messages&&n.messages.length?q?q.p(t,n):((q=le(e,n)).c(),q.m(m.parentNode,m)):q&&(q.d(1),q=null),n.changeEmail&&n.errors.length?R?R.p(t,n):((R=fe(e,n)).c(),R.m(v,_)):R&&(R.d(1),R=null),!A&&t.email&&(b.value=n.email),t.changeEmail&&y!==(y=!n.changeEmail)&&(b.disabled=y),D===(D=M(n))&&U?U.p(t,n):(U.d(1),(U=D(e,n)).c(),U.m(k.parentNode,k));var r={};t.changeEmail&&(r.help=n.changeEmail?H("account / confirm-email-change"):""),B._set(r),Y===(Y=F(n))&&G?G.p(t,n):(G.d(1),(G=Y(e,n)).c(),G.m(v,O)),$===($=J(n))&&X?X.p(t,n):(X.d(1),(X=$(e,n)).c(),X.m(v,null)),t.messages&&w(g,"margin-top",(n.messages&&n.messages.length?0:20)+"px")},d:function(e){e&&(a(n),a(c)),q&&q.d(e),e&&(a(m),a(g)),R&&R.d(),p(b,"input",L),U.d(),B.destroy(),G.d(),X.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),y(this))}function Se(e,t){this._handlers={},this._dependents=[],this._computed=g(),this._sortedComputedProperties=[],this._state=r({},e),this._differs=t&&t.immutable?_:v}r(Oe.prototype,S),r(Oe.prototype,ce),r(Se.prototype,{_add:function(e,t){this._dependents.push({component:e,props:t})},_init:function(e){for(var t={},n=0;n<e.length;n+=1){var r=e[n];t["$"+r]=this._state[r]}return t},_remove:function(e){for(var t=this._dependents.length;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set:function(e,t){var n=this,s=this._state;this._state=r(r({},s),e);for(var o=0;o<this._sortedComputedProperties.length;o+=1)this._sortedComputedProperties[o].update(this._state,t);this.fire("state",{changed:t,previous:s,current:this._state}),this._dependents.filter((function(e){for(var r={},s=!1,o=0;o<e.props.length;o+=1){var a=e.props[o];a in t&&(r["$"+a]=n._state[a],s=!0)}if(s)return e.component._stage(r),!0})).forEach((function(e){e.component.set({})})),this.fire("update",{changed:t,previous:s,current:this._state})},_sortComputedProperties:function(){var e,t=this._computed,n=this._sortedComputedProperties=[],r=g();function s(o){var a=t[o];a&&(a.deps.forEach((function(t){if(t===e)throw new Error("Cyclical dependency detected between ".concat(t," <-> ").concat(o));s(t)})),r[o]||(r[o]=!0,n.push(a)))}for(var o in this._computed)s(e=o)},compute:function(e,t,n){var s,o=this,a={deps:t,update:function(r,a,c){var i=t.map((function(e){return e in a&&(c=!0),r[e]}));if(c){var u=n.apply(null,i);o._differs(u,s)&&(s=u,a[e]=!0,r[e]=s)}}};this._computed[e]=a,this._sortComputedProperties();var c=r({},this._state),i={};a.update(c,i,!0),this._set(c,i)},fire:b,get:P,on:E,set:function(e){var t=this._state,n=this._changed={},r=!1;for(var s in e){if(this._computed[s])throw new Error("'".concat(s,"' is a read-only computed property"));this._differs(e[s],t[s])&&(n[s]=r=!0)}r&&this._set(e,n)}});return{App:Oe,data:{chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},store:new Se({})}}));