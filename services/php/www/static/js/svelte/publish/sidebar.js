!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("../../../../../../../../../../../static/js/svelte/publish.js")):"function"==typeof define&&define.amd?define(["../../../../../../../../../../../static/js/svelte/publish"],t):(e="undefined"!=typeof globalThis?globalThis:e||self)["publish/sidebar"]=t(e.Publish)}(this,(function(e){"use strict";function t(){}function n(e,t){for(var n in t)e[n]=t[n];return e}function r(e,t){for(var n in t)e[n]=1;return e}function s(e,t){e.appendChild(t)}function i(e,t,n){e.insertBefore(t,n)}function o(e){e.parentNode.removeChild(e)}function a(e,t){for(;e.nextSibling&&e.nextSibling!==t;)e.parentNode.removeChild(e.nextSibling)}function c(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function u(e){return document.createElement(e)}function l(e){return document.createTextNode(e)}function d(){return document.createComment("")}function h(e,t,n,r){e.addEventListener(t,n,r)}function p(e,t,n,r){e.removeEventListener(t,n,r)}function f(e,t,n){e.style.setProperty(t,n)}function m(e,t,n){e.classList[n?"add":"remove"](t)}function _(){return Object.create(null)}function g(e){e._lock=!0,v(e._beforecreate),v(e._oncreate),v(e._aftercreate),e._lock=!1}function b(e,t){e._handlers=_(),e._slots=_(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function v(e){for(;e&&e.length;)e.shift()()}function w(){this.store._remove(this)}var x={destroy:function(e){this.destroy=t,this.fire("destroy"),this.set=t,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var s=n[r];if(!s.__calling)try{s.__calling=!0,s.call(this,t)}finally{s.__calling=!1}}},on:function(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}},set:function(e){this._set(n({},e)),this.root._lock||g(this.root)},_recompute:t,_set:function(e){var t=this._state,r={},s=!1;for(var i in e=n(this._staged,e),this._staged={},e)this._differs(e[i],t[i])&&(r[i]=s=!0);s&&(this._state=n(n({},t),e),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:t}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:t})))},_stage:function(e){n(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:function(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}};const y={};function T(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(y[e]=window.__dw.vis.meta.locale||{}):y[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}function E(e,t="core"){if(e=e.trim(),y[t]||T(t),!y[t][e])return"MISSING:"+e;var n=y[t][e];return"string"==typeof n&&arguments.length>2&&(n=n.replace(/\$(\d)/g,(e,t)=>(t=2+Number(t),void 0===arguments[t]?e:arguments[t]))),n}var N={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function s(){}function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({path:"/"},s.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var o=JSON.stringify(n);/^[\{\[]/.test(o)&&(n=o)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var a="";for(var c in i)i[c]&&(a+="; "+c,!0!==i[c]&&(a+="="+i[c].split(";")[0]));return document.cookie=t+"="+n+a}}function o(e,n){if("undefined"!=typeof document){for(var s={},i=document.cookie?document.cookie.split("; "):[],o=0;o<i.length;o++){var a=i[o].split("="),c=a.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var u=t(a[0]);if(c=(r.read||r)(c,u)||t(c),n)try{c=JSON.parse(c)}catch(e){}if(s[u]=c,e===u)break}catch(e){}}return e?s[e]:s}}return s.set=i,s.get=function(e){return o(e,!1)},s.getJSON=function(e){return o(e,!0)},s.remove=function(t,n){i(t,"",e(n,{expires:-1}))},s.defaults={},s.withConverter=n,s}((function(){}))},e.exports=n()}(N);var k=N.exports;const L=new Set(["get","head","options","trace"]);function C(e,t={}){if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const{payload:n,baseUrl:r,fetch:s,raw:i,...o}={payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include",...t,headers:{"Content-Type":"application/json",...t.headers}},a=`${r.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let c;if(n&&(o.body=JSON.stringify(n)),o.headers["Content-Type"].startsWith("multipart/")&&delete o.headers["Content-Type"],o.disableCSFR||L.has(o.method.toLowerCase()))c=s(a,o);else{const e=k.get("crumb");e?(o.headers["X-CSRF-Token"]=e,c=s(a,o)):c=C("/v3/me",{fetch:s,baseUrl:r}).then(()=>{const e=k.get("crumb");e&&(o.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>s(a,o))}return c.then(e=>{if(i)return e;if(!e.ok)throw new j(e);if(204===e.status||!e.headers.get("content-type"))return e;const t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}C.get=H("GET"),C.patch=H("PATCH"),C.put=H("PUT");const S=C.post=H("POST");function H(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return C(t,{...n,method:e})}}C.head=H("HEAD"),C.delete=H("DELETE");class j extends Error{constructor(e){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e}}function A(e,t){var n,r,a,c=e._slotted.labelExtra;return{c(){n=u("label"),r=u("noscript"),n.className="control-label svelte-150khnx"},m(e,o){i(e,n,o),s(n,r),r.insertAdjacentHTML("beforebegin",t.label),c&&(s(n,a||(a=d())),s(n,c))},p(e,t){e.label&&(!function(e){for(;e.previousSibling;)e.parentNode.removeChild(e.previousSibling)}(r),r.insertAdjacentHTML("beforebegin",t.label))},d(e){e&&o(n),c&&function(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}(a,c)}}}function M(e,t){var n;return{c(){(n=u("div")).className="help success svelte-150khnx"},m(e,r){i(e,n,r),n.innerHTML=t.success},p(e,t){e.success&&(n.innerHTML=t.success)},d(e){e&&o(n)}}}function D(e,t){var n;return{c(){(n=u("div")).className="help error svelte-150khnx"},m(e,r){i(e,n,r),n.innerHTML=t.error},p(e,t){e.error&&(n.innerHTML=t.error)},d(e){e&&o(n)}}}function U(e,t){var n;return{c(){(n=u("div")).className="help svelte-150khnx"},m(e,r){i(e,n,r),n.innerHTML=t.help},p(e,t){e.help&&(n.innerHTML=t.help)},d(e){e&&o(n)}}}function P(e){var t,r,a,c,d,h,p,_,g,v,w,x,y,T;b(this,e),this._state=n({label:"",help:"",compact:!1,class:"",error:!1,success:!1,width:"auto",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(t=this,r=this._state,v=t._slotted.default,w=r.label&&A(t,r),x=r.success&&M(0,r),y=r.error&&D(0,r),T=!r.success&&!r.error&&r.help&&U(0,r),{c(){a=u("div"),w&&w.c(),c=l("\n    "),d=u("div"),h=l("\n    "),x&&x.c(),p=l(" "),y&&y.c(),_=l(" "),T&&T.c(),d.className="form-controls svelte-150khnx",a.className=g="form-block "+r.class+" svelte-150khnx",f(a,"width",r.width),a.dataset.uid=r.uid,m(a,"compact",r.compact),m(a,"success",r.success),m(a,"error",r.error)},m(e,t){i(e,a,t),w&&w.m(a,null),s(a,c),s(a,d),v&&s(d,v),s(a,h),x&&x.m(a,null),s(a,p),y&&y.m(a,null),s(a,_),T&&T.m(a,null)},p(e,n){n.label?w?w.p(e,n):((w=A(t,n)).c(),w.m(a,c)):w&&(w.d(1),w=null),n.success?x?x.p(e,n):((x=M(0,n)).c(),x.m(a,p)):x&&(x.d(1),x=null),n.error?y?y.p(e,n):((y=D(0,n)).c(),y.m(a,_)):y&&(y.d(1),y=null),n.success||n.error||!n.help?T&&(T.d(1),T=null):T?T.p(e,n):((T=U(0,n)).c(),T.m(a,null)),e.class&&g!==(g="form-block "+n.class+" svelte-150khnx")&&(a.className=g),e.width&&f(a,"width",n.width),e.uid&&(a.dataset.uid=n.uid),(e.class||e.compact)&&m(a,"compact",n.compact),(e.class||e.success)&&m(a,"success",n.success),(e.class||e.error)&&m(a,"error",n.error)},d(e){e&&o(a),w&&w.d(),v&&function(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}(d,v),x&&x.d(),y&&y.d(),T&&T.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}n(P.prototype,x);var R={async createAccount(e){var t,n,r,s;this.set({signedUp:!0}),t="Chart Editor",n="send-embed-code",window._paq&&window._paq.push(["trackEvent",t,n,r,s]);try{let t=null;t=void 0!==window.chart?window.chart.get().id:this.store.get().id;const n=await S("/v3/auth/signup",{payload:{email:e,invitation:!0,chartId:t}});this.get().fromSvelte?(this.set({signedUp:!1,error:""}),this.store.set({user:n})):window.location.reload()}catch(e){if("HttpReqError"===e.name){const t=await e.response.json();this.set({error:t.message||e})}else this.set({error:"Unknown error: "+e})}}};function O(e,t,n){const r=Object.create(e);return r.text=t[n],r}function $(e,t,n){const r=Object.create(e);return r.text=t[n],r}function q(e,n){var r,s,a,c=E("publish / guest / h1"),d=E("publish / guest / p");return{c(){r=u("h2"),s=l("\n\n            "),a=u("p")},m(e,t){i(e,r,t),r.innerHTML=c,i(e,s,t),i(e,a,t),a.innerHTML=d},p:t,d(e){e&&(o(r),o(s),o(a))}}}function I(e,t){for(var n,r=t.guest_text_above,s=[],a=0;a<r.length;a+=1)s[a]=F(e,$(t,r,a));return{c(){for(var e=0;e<s.length;e+=1)s[e].c();n=d()},m(e,t){for(var r=0;r<s.length;r+=1)s[r].m(e,t);i(e,n,t)},p(t,i){if(t.guest_text_above){r=i.guest_text_above;for(var o=0;o<r.length;o+=1){const a=$(i,r,o);s[o]?s[o].p(t,a):(s[o]=F(e,a),s[o].c(),s[o].m(n.parentNode,n))}for(;o<s.length;o+=1)s[o].d(1);s.length=r.length}},d(e){c(s,e),e&&o(n)}}}function F(e,t){var n,r,s=t.text;return{c(){n=u("noscript"),r=u("noscript")},m(e,t){i(e,n,t),n.insertAdjacentHTML("afterend",s),i(e,r,t)},p(e,t){e.guest_text_above&&s!==(s=t.text)&&(a(n,r),n.insertAdjacentHTML("afterend",s))},d(e){e&&(a(n,r),o(n),o(r))}}}function B(e,t){for(var n,r=t.guest_text_below,s=[],a=0;a<r.length;a+=1)s[a]=G(e,O(t,r,a));return{c(){for(var e=0;e<s.length;e+=1)s[e].c();n=d()},m(e,t){for(var r=0;r<s.length;r+=1)s[r].m(e,t);i(e,n,t)},p(t,i){if(t.guest_text_below){r=i.guest_text_below;for(var o=0;o<r.length;o+=1){const a=O(i,r,o);s[o]?s[o].p(t,a):(s[o]=G(e,a),s[o].c(),s[o].m(n.parentNode,n))}for(;o<s.length;o+=1)s[o].d(1);s.length=r.length}},d(e){c(s,e),e&&o(n)}}}function G(e,t){var n,r,s=t.text;return{c(){n=u("noscript"),r=u("noscript")},m(e,t){i(e,n,t),n.insertAdjacentHTML("afterend",s),i(e,r,t)},p(e,t){e.guest_text_below&&s!==(s=t.text)&&(a(n,r),n.insertAdjacentHTML("afterend",s))},d(e){e&&(a(n,r),o(n),o(r))}}}function J(e,t){var n,r;return{c(){n=u("div"),r=l(t.error),n.className="alert alert-warning"},m(e,t){i(e,n,t),s(n,r)},p(e,t){e.error&&function(e,t){e.data=""+t}(r,t.error)},d(e){e&&o(n)}}}function W(e){b(this,e),this._state=n({error:"",email:"",guest_text_above:[],guest_text_below:[],signedUp:!1},e.data),this._intro=!0,this._fragment=function(e,t){var n,r,a,c,d,m,_,g,b,v,w,x,y,T,N,k,L,C,S,H,j=!1,A=E("publish / guest / cta"),M=E("publish / guest / back");function D(e){return e.guest_text_above?I:q}var U=D(t),R=U(e,t);function O(){j=!0,e.set({email:m.value}),j=!1}function $(n){e.createAccount(t.email)}var F={label:E("publish / guest / e-mail"),help:E("publish / guest / example-email")},G=new P({root:e.root,store:e.store,slots:{default:document.createDocumentFragment()},data:F}),W=t.guest_text_below&&B(e,t),X=t.error&&J(e,t);return{c(){var e,s,i;n=u("div"),r=u("div"),a=u("div"),R.c(),c=l("\n\n        "),d=u("div"),m=u("input"),_=l("\n\n                "),g=u("button"),b=u("i"),w=l("\n                      "),x=u("noscript"),G._fragment.c(),y=l("\n\n        "),W&&W.c(),T=l("\n\n        "),N=u("div"),k=u("button"),L=u("i"),C=l("   "),S=u("noscript"),H=l("\n\n            "),X&&X.c(),f(a,"margin-bottom","20px"),h(m,"input",O),e=m,s="type",null==(i="email")?e.removeAttribute(s):e.setAttribute(s,i),m.className="input-xlarge",b.className=v="fa "+(t.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),h(g,"click",$),g.className="btn btn-save btn-primary",f(g,"white-space","nowrap"),f(g,"margin-left","10px"),f(d,"display","flex"),L.className="fa fa-chevron-left",k.className="btn btn-save btn-default btn-back",f(N,"margin-top","30px"),r.className="span5",n.className="row publish-signup"},m(e,o){i(e,n,o),s(n,r),s(r,a),R.m(a,null),s(r,c),s(G._slotted.default,d),s(d,m),m.value=t.email,s(d,_),s(d,g),s(g,b),s(g,w),s(g,x),x.insertAdjacentHTML("afterend",A),G._mount(r,null),s(r,y),W&&W.m(r,null),s(r,T),s(r,N),s(N,k),s(k,L),s(k,C),s(k,S),S.insertAdjacentHTML("afterend",M),s(N,H),X&&X.m(N,null)},p(n,s){U===(U=D(t=s))&&R?R.p(n,t):(R.d(1),(R=U(e,t)).c(),R.m(a,null)),!j&&n.email&&(m.value=t.email),n.signedUp&&v!==(v="fa "+(t.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(b.className=v),t.guest_text_below?W?W.p(n,t):((W=B(e,t)).c(),W.m(r,T)):W&&(W.d(1),W=null),t.error?X?X.p(n,t):((X=J(e,t)).c(),X.m(N,null)):X&&(X.d(1),X=null)},d(e){e&&o(n),R.d(),p(m,"input",O),p(g,"click",$),G.destroy(),W&&W.d(),X&&X.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),g(this))}n(W.prototype,x),n(W.prototype,R);var X={async resendActivation(){this.set({status:"sending"});try{await S("/v3/auth/resend-activation"),this.set({status:"success"})}catch(e){this.set({status:"error"})}}};function Z(e,t){var n,r,a,c,d,f=E("publish / pending-activation / resend");function m(t){e.resendActivation()}return{c(){n=u("button"),r=u("i"),c=l("\n             \n            "),d=u("noscript"),r.className=a="fa "+("sending"==t.status?"fa-spin fa-circle-o-notch":"fa-envelope"),h(n,"click",m),n.className="btn btn-primary"},m(e,t){i(e,n,t),s(n,r),s(n,c),s(n,d),d.insertAdjacentHTML("afterend",f)},p(e,t){e.status&&a!==(a="fa "+("sending"==t.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(r.className=a)},d(e){e&&o(n),p(n,"click",m)}}}function z(e,n){var r,s=E("publish / pending-activation / resend-error");return{c(){r=u("p")},m(e,t){i(e,r,t),r.innerHTML=s},p:t,d(e){e&&o(r)}}}function K(e,n){var r,s=E("publish / pending-activation / resend-success");return{c(){r=u("p")},m(e,t){i(e,r,t),r.innerHTML=s},p:t,d(e){e&&o(r)}}}function Q(e){b(this,e),this._state=n({status:""},e.data),this._intro=!0,this._fragment=function(e,t){var n,r,a,c,d,h,p=E("publish / pending-activation / h1"),m=E("publish / pending-activation / p");function _(e){return"success"==e.status?K:"error"==e.status?z:Z}var g=_(t),b=g(e,t);return{c(){n=u("div"),r=u("h2"),a=l("\n\n    "),c=u("p"),d=l("\n\n    "),h=u("div"),b.c(),f(h,"margin-top","20px")},m(e,t){i(e,n,t),s(n,r),r.innerHTML=p,s(n,a),s(n,c),c.innerHTML=m,s(n,d),s(n,h),b.m(h,null)},p(t,n){g===(g=_(n))&&b?b.p(t,n):(b.d(1),(b=g(e,n)).c(),b.m(h,null))},d(e){e&&o(n),b.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}function V(e,t=null){return new Promise((n,r)=>{const s=document.createElement("script");s.src=e,s.onload=()=>{t&&t(),n()},s.onerror=r,document.body.appendChild(s)})}function Y(e,t=null){return"string"==typeof e&&(e={src:e}),e.parentElement&&"function"==typeof e.parentElement.appendChild||(e.parentElement=document.head),new Promise((n,r)=>{const s=document.createElement("link");s.rel="stylesheet",s.href=e.src,s.onload=()=>{t&&t(),n()},s.onerror=r,e.parentElement.appendChild(s)})}function ee({current:e,changed:t}){if(t.afterEmbed&&e.afterEmbed){const t=e.afterEmbed[0];Promise.all([Y(t.css),V(t.js)]).then(()=>{require([t.module],e=>{this.set({beforeExport:e.App,beforeExportData:t.data||{}})})})}}function te(t,n){var r={beforeExport:n.beforeExport,beforeExportData:n.beforeExportData,redirectDisabled:n.redirectDisabled,embedTemplates:n.embedTemplates,embedType:n.embedType,pluginShareurls:n.pluginShareurls,shareurlType:n.shareurlType},s=new e.Publish({root:t.root,store:t.store,data:r});return{c(){s._fragment.c()},m(e,t){s._mount(e,t)},p(e,t){var n={};e.beforeExport&&(n.beforeExport=t.beforeExport),e.beforeExportData&&(n.beforeExportData=t.beforeExportData),e.redirectDisabled&&(n.redirectDisabled=t.redirectDisabled),e.embedTemplates&&(n.embedTemplates=t.embedTemplates),e.embedType&&(n.embedType=t.embedType),e.pluginShareurls&&(n.pluginShareurls=t.pluginShareurls),e.shareurlType&&(n.shareurlType=t.shareurlType),s._set(n)},d(e){s.destroy(e)}}}function ne(e,n){var r=new Q({root:e.root,store:e.store});return{c(){r._fragment.c()},m(e,t){r._mount(e,t)},p:t,d(e){r.destroy(e)}}}function re(e,t){var n={fromSvelte:"true",guest_text_above:t.guest_text_above,guest_text_below:t.guest_text_below},r=new W({root:e.root,store:e.store,data:n});return{c(){r._fragment.c()},m(e,t){r._mount(e,t)},p(e,t){var n={};e.guest_text_above&&(n.guest_text_above=t.guest_text_above),e.guest_text_below&&(n.guest_text_below=t.guest_text_below),r._set(n)},d(e){r.destroy(e)}}}function se(e){b(this,e),this._state=n(n(this.store._init(["user"]),{embedTemplates:[],embedType:"responsive",pluginShareurls:[],shareurlType:"default",beforeExport:null,beforeExportData:{},guest_text_above:"",guest_text_below:"",redirectDisabled:!1}),e.data),this.store._add(this,["user"]),this._intro=!0,this._handlers.state=[ee],this._handlers.destroy=[w],ee.call(this,{changed:r({},this._state),current:this._state}),this._fragment=function(e,t){var n;function r(e){return e.$user.isGuest?re:e.$user.isActivated?te:ne}var s=r(t),a=s(e,t);return{c(){n=u("div"),a.c()},m(e,t){i(e,n,t),a.m(n,null)},p(t,i){s===(s=r(i))&&a?a.p(t,i):(a.d(1),(a=s(e,i)).c(),a.m(n,null))},d(e){e&&o(n),a.d()}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:r({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),g(this))}function ie(e,t,n){var r=t.bind(this);return n&&!1===n.init||r(this.get()[e]),this.on(n&&n.defer?"update":"state",(function(t){var n=t.changed,s=t.current,i=t.previous;n[e]&&r(s[e],i&&i[e])}))}function oe(){this.store.observe=ie,this.store.observe("publishLogic",e=>{e&&e.mod?(Y(e.css),V(e.src,()=>{require([e.mod],t=>{this.set({PublishLogic:t.App}),this.refs.publish.set(e.data)})})):(this.set({PublishLogic:se}),this.refs.publish.set(e.data))})}function ae(e){b(this,e),this.refs={},this._state=n({PublishLogic:se},e.data),this._intro=!0,this._fragment=function(e,t){var n,r,a=t.PublishLogic;function c(t){return{root:e.root,store:e.store}}if(a)var l=new a(c());return{c(){n=u("div"),r=u("div"),l&&l._fragment.c(),r.className="publish-step is-published",n.className="dw-create-publish"},m(t,o){i(t,n,o),s(n,r),l&&(l._mount(r,null),e.refs.publish=l)},p(t,n){a!==(a=n.PublishLogic)&&(l&&l.destroy(),a?((l=new a(c()))._fragment.c(),l._mount(r,null),e.refs.publish=l):(l=null,e.refs.publish===l&&(e.refs.publish=null)))},d(e){e&&o(n),l&&l.destroy()}}}(this,this._state),this.root._oncreate.push(()=>{oe.call(this),this.fire("update",{changed:r({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),g(this))}return n(Q.prototype,x),n(Q.prototype,X),n(se.prototype,x),n(ae.prototype,x),{PublishSidebar:ae}}));
