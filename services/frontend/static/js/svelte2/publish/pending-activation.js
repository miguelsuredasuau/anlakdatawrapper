!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/publish/pending-activation",e):(t="undefined"!=typeof globalThis?globalThis:t||self)["publish/pending-activation"]=e()}(this,(function(){"use strict";function t(){}function e(t,e){for(var n in e)t[n]=e[n];return t}function n(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n)}function r(t){t.parentNode.removeChild(t)}function i(t){return document.createElement(t)}function o(t){return document.createTextNode(t)}function a(){return Object.create(null)}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function d(t,e){return t!=t?e==e:t!==e}function h(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var s=0;s<n.length;s+=1){var r=n[s];if(!r.__calling)try{r.__calling=!0,r.call(this,e)}finally{r.__calling=!1}}}function u(){return this._state}function p(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function f(t){for(;t&&t.length;)t.shift()()}var l={destroy:function(e){this.destroy=t,this.fire("destroy"),this.set=t,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:u,fire:h,on:p,set:function(t){var n;this._set(e({},t)),this.root._lock||((n=this.root)._lock=!0,f(n._beforecreate),f(n._oncreate),f(n._aftercreate),n._lock=!1)},_recompute:t,_set:function(t){var n=this._state,s={},r=!1;for(var i in t=e(this._staged,t),this._staged={},t)this._differs(t[i],n[i])&&(s[i]=r=!0);r&&(this._state=e(e({},n),t),this._recompute(s,this._state),this._bind&&this._bind(s,this._state),this._fragment&&(this.fire("state",{changed:s,current:this._state,previous:n}),this._fragment.p(s,this._state),this.fire("update",{changed:s,current:this._state,previous:n})))},_stage:function(t){e(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:c};const _={};function m(t="core"){"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(_[t]=window.__dw.vis.meta.locale||{}):_[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function g(t,e="core"){if(t=t.trim(),_[e]||m(e),!_[e][t])return"MISSING:"+t;var n=_[e][t];return"string"==typeof n&&arguments.length>2&&(n=n.replace(/\$(\d)/g,(t,e)=>(e=2+Number(e),void 0===arguments[e]?t:arguments[e]))),n}var v={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var s in n)e[s]=n[s]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(s){function r(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},r.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var o=JSON.stringify(n);/^[\{\[]/.test(o)&&(n=o)}catch(t){}n=s.write?s.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var a="";for(var c in i)i[c]&&(a+="; "+c,!0!==i[c]&&(a+="="+i[c].split(";")[0]));return document.cookie=e+"="+n+a}}function o(t,n){if("undefined"!=typeof document){for(var r={},i=document.cookie?document.cookie.split("; "):[],o=0;o<i.length;o++){var a=i[o].split("="),c=a.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var d=e(a[0]);if(c=(s.read||s)(c,d)||e(c),n)try{c=JSON.parse(c)}catch(t){}if(r[d]=c,t===d)break}catch(t){}}return t?r[t]:r}}return r.set=i,r.get=function(t){return o(t,!1)},r.getJSON=function(t){return o(t,!0)},r.remove=function(e,n){i(e,"",t(n,{expires:-1}))},r.defaults={},r.withConverter=n,r}((function(){}))},t.exports=n()}(v);var w=v.exports;const b=new Set(["get","head","options","trace"]);function y(t,e={}){if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const{payload:n,baseUrl:s,fetch:r,raw:i,...o}={payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include",...e,headers:{"Content-Type":"application/json",...e.headers}},a=`${s.replace(/\/$/,"")}/${t.replace(/^\//,"")}`;let c;if(n&&(o.body=JSON.stringify(n)),o.headers["Content-Type"].startsWith("multipart/")&&delete o.headers["Content-Type"],o.disableCSFR||b.has(o.method.toLowerCase()))c=r(a,o);else{const t=w.get("crumb");t?(o.headers["X-CSRF-Token"]=t,c=r(a,o)):c=y("/v3/me",{fetch:r,baseUrl:s}).then(()=>{const t=w.get("crumb");t&&(o.headers["X-CSRF-Token"]=t)}).catch(()=>{}).then(()=>r(a,o))}return c.then(t=>{if(i)return t;if(!t.ok)throw new E(t);if(204===t.status||!t.headers.get("content-type"))return t;const e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()})}y.get=T("GET"),y.patch=T("PATCH"),y.put=T("PUT");const C=y.post=T("POST");function T(t){return(e,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${t.toLowerCase()}()`);return y(e,{...n,method:t})}}y.head=T("HEAD"),y.delete=T("DELETE");class E extends Error{constructor(t){super(),this.name="HttpReqError",this.status=t.status,this.statusText=t.statusText,this.message=`[${t.status}] ${t.statusText}`,this.response=t}}var x={async resendActivation(){this.set({status:"sending"});try{await C("/v3/auth/resend-activation"),this.set({status:"success"})}catch(t){this.set({status:"error"})}}};function k(t,e){var a,c,d,h,u,p=g("publish / pending-activation / resend");function f(e){t.resendActivation()}return{c(){var t,n,s;a=i("button"),c=i("i"),h=o("\n             \n            "),u=i("noscript"),c.className=d="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"),t="click",n=f,a.addEventListener(t,n,s),a.className="btn btn-primary"},m(t,e){s(t,a,e),n(a,c),n(a,h),n(a,u),u.insertAdjacentHTML("afterend",p)},p(t,e){t.status&&d!==(d="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(c.className=d)},d(t){var e,n,s;t&&r(a),e="click",n=f,a.removeEventListener(e,n,s)}}}function S(e,n){var o,a=g("publish / pending-activation / resend-error");return{c(){o=i("p")},m(t,e){s(t,o,e),o.innerHTML=a},p:t,d(t){t&&r(o)}}}function N(e,n){var o,a=g("publish / pending-activation / resend-success");return{c(){o=i("p")},m(t,e){s(t,o,e),o.innerHTML=a},p:t,d(t){t&&r(o)}}}function U(t){!function(t,e){t._handlers=a(),t._slots=a(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this._state=e({status:""},t.data),this._intro=!0,this._fragment=function(t,e){var a,c,d,h,u,p,f=g("publish / pending-activation / h1"),l=g("publish / pending-activation / p");function _(t){return"success"==t.status?N:"error"==t.status?S:k}var m=_(e),v=m(t,e);return{c(){var t,e;a=i("div"),c=i("h2"),d=o("\n\n    "),h=i("p"),u=o("\n\n    "),p=i("div"),v.c(),t="margin-top",e="20px",p.style.setProperty(t,e)},m(t,e){s(t,a,e),n(a,c),c.innerHTML=f,n(a,d),n(a,h),h.innerHTML=l,n(a,u),n(a,p),v.m(p,null)},p(e,n){m===(m=_(n))&&v?v.p(e,n):(v.d(1),(v=m(t,n)).c(),v.m(p,null))},d(t){t&&r(a),v.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function $(t,n){this._handlers={},this._dependents=[],this._computed=a(),this._sortedComputedProperties=[],this._state=e({},t),this._differs=n&&n.immutable?d:c}e(U.prototype,l),e(U.prototype,x),e($.prototype,{_add(t,e){this._dependents.push({component:t,props:e})},_init(t){const e={};for(let n=0;n<t.length;n+=1){const s=t[n];e["$"+s]=this._state[s]}return e},_remove(t){let e=this._dependents.length;for(;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set(t,n){const s=this._state;this._state=e(e({},s),t);for(let t=0;t<this._sortedComputedProperties.length;t+=1)this._sortedComputedProperties[t].update(this._state,n);this.fire("state",{changed:n,previous:s,current:this._state}),this._dependents.filter(t=>{const e={};let s=!1;for(let r=0;r<t.props.length;r+=1){const i=t.props[r];i in n&&(e["$"+i]=this._state[i],s=!0)}if(s)return t.component._stage(e),!0}).forEach(t=>{t.component.set({})}),this.fire("update",{changed:n,previous:s,current:this._state})},_sortComputedProperties(){const t=this._computed,e=this._sortedComputedProperties=[],n=a();let s;function r(i){const o=t[i];o&&(o.deps.forEach(t=>{if(t===s)throw new Error(`Cyclical dependency detected between ${t} <-> ${i}`);r(t)}),n[i]||(n[i]=!0,e.push(o)))}for(const t in this._computed)r(s=t)},compute(t,n,s){let r;const i={deps:n,update:(e,i,o)=>{const a=n.map(t=>(t in i&&(o=!0),e[t]));if(o){const n=s.apply(null,a);this._differs(n,r)&&(r=n,i[t]=!0,e[t]=r)}}};this._computed[t]=i,this._sortComputedProperties();const o=e({},this._state),a={};i.update(o,a,!0),this._set(o,a)},fire:h,get:u,on:p,set(t){const e=this._state,n=this._changed={};let s=!1;for(const r in t){if(this._computed[r])throw new Error(`'${r}' is a read-only computed property`);this._differs(t[r],e[r])&&(n[r]=s=!0)}s&&this._set(t,n)}});return{App:U,store:new $({})}}));
//# sourceMappingURL=pending-activation.js.map
