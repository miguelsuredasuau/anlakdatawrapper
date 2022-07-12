!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/publish/guest",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["publish/guest"]=t()}(this,(function(){"use strict";function e(){}function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e,t){e.appendChild(t)}function r(e,t,n){e.insertBefore(t,n)}function s(e){e.parentNode.removeChild(e)}function i(e,t){for(;e.nextSibling&&e.nextSibling!==t;)e.parentNode.removeChild(e.nextSibling)}function o(e){return document.createElement(e)}function a(e){return document.createTextNode(e)}function c(e,t,n,r){e.addEventListener(t,n,r)}function u(e,t,n,r){e.removeEventListener(t,n,r)}function l(e,t,n){e.style.setProperty(t,n)}function d(e,t,n){e.classList[n?"add":"remove"](t)}function p(){return Object.create(null)}function h(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function f(e,t){return e!=e?t==t:e!==t}function m(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var s=n[r];if(!s.__calling)try{s.__calling=!0,s.call(this,t)}finally{s.__calling=!1}}}function _(e){e._lock=!0,w(e._beforecreate),w(e._oncreate),w(e._aftercreate),e._lock=!1}function g(){return this._state}function v(e,t){e._handlers=p(),e._slots=p(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function b(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function w(e){for(;e&&e.length;)e.shift()()}var y={destroy:function(t){this.destroy=e,this.fire("destroy"),this.set=e,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:g,fire:m,on:b,set:function(e){this._set(t({},e)),this.root._lock||_(this.root)},_recompute:e,_set:function(e){var n=this._state,r={},s=!1;for(var i in e=t(this._staged,e),this._staged={},e)this._differs(e[i],n[i])&&(r[i]=s=!0);s&&(this._state=t(t({},n),e),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:n}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:n})))},_stage:function(e){t(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:h};const x=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,C=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function T(e,t){if(null===e)return null;if(void 0!==e){if((e=String(e)).indexOf("<")<0&&e.indexOf(">")<0)return e;if(e=k(e,t),"undefined"==typeof document)return e;var n=document.createElement("div");n.innerHTML=`<span>${e}</span>`,n.innerHTML=k(n.innerHTML,t&&!t.includes("<span>")?t+"<span>":t||void 0);for(var r=n.childNodes[0].querySelectorAll("*"),s=0;s<r.length;s++){if("a"===r[s].nodeName.toLowerCase()){"_self"!==r[s].getAttribute("target")&&r[s].setAttribute("target","_blank"),r[s].setAttribute("rel","nofollow noopener noreferrer");const e=(r[s].getAttribute("href")||"").toLowerCase().replace(/[^a-z0-9 -/:?=]/g,"").trim();(e.startsWith("javascript:")||e.startsWith("vbscript:")||e.startsWith("data:"))&&r[s].setAttribute("href","")}const e=[];for(var i=0;i<r[s].attributes.length;i++){var o=r[s].attributes[i];o.specified&&"on"===o.name.substr(0,2)&&e.push(o.name)}e.forEach(e=>r[s].removeAttribute(e))}return n.childNodes[0].innerHTML}}function k(e,t){t=(((void 0!==t?t||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");for(var n=e,r=e;;)if(r=(n=r).replace(C,"").replace(x,(function(e,n){return t.indexOf("<"+n.toLowerCase()+">")>-1?e:""})),n===r)return r}const A={};function L(e,t="core",n,...r){let s=function(e,t,n){try{return n[t][e]||e}catch(t){return e}}(e,t,n);return s="string"==typeof r[0]?function(e,t=[]){return e.replace(/\$(\d)/g,(e,n)=>void 0===t[+n]?e:T(t[+n],""))}(s,r):function(e,t={}){return Object.entries(t).forEach(([t,n])=>{e=e.replace(new RegExp(`%${t}%|%${t}(?!\\w)`,"g"),n)}),e}(s,r[0]),T(s,"<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br><a><em><i><strong><b><code><img><table><tr><th><td><small><span><div><sup><sub><tt>")}function N(e,t="core",...n){return e=e.trim(),A[t]||function(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(A[e]=window.__dw.vis.meta.locale||{}):A[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}(t),A[t][e]?L(e,t,A,...n):"MISSING:"+e}var E={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function s(){}function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({path:"/"},s.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var o=JSON.stringify(n);/^[\{\[]/.test(o)&&(n=o)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var a="";for(var c in i)i[c]&&(a+="; "+c,!0!==i[c]&&(a+="="+i[c].split(";")[0]));return document.cookie=t+"="+n+a}}function o(e,n){if("undefined"!=typeof document){for(var s={},i=document.cookie?document.cookie.split("; "):[],o=0;o<i.length;o++){var a=i[o].split("="),c=a.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var u=t(a[0]);if(c=(r.read||r)(c,u)||t(c),n)try{c=JSON.parse(c)}catch(e){}if(s[u]=c,e===u)break}catch(e){}}return e?s[e]:s}}return s.set=i,s.get=function(e){return o(e,!1)},s.getJSON=function(e){return o(e,!0)},s.remove=function(t,n){i(t,"",e(n,{expires:-1}))},s.defaults={},s.withConverter=n,s}((function(){}))},e.exports=n()}(E);var S=E.exports;const H=new Set(["get","head","options","trace"]);function M(e,t={}){if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const{payload:n,baseUrl:r,fetch:s,raw:i,...o}={payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include",...t,headers:{"Content-Type":"application/json",...t.headers}},a=`${r.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let c;if(n&&(o.body=JSON.stringify(n)),o.headers["Content-Type"].startsWith("multipart/")&&delete o.headers["Content-Type"],o.disableCSFR||H.has(o.method.toLowerCase()))c=s(a,o);else{const e=S.get("crumb");e?(o.headers["X-CSRF-Token"]=e,c=s(a,o)):c=M("/v3/me",{fetch:s,baseUrl:r}).then(()=>{const e=S.get("crumb");e&&(o.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>s(a,o))}return c.then(e=>{if(i)return e;if(!e.ok)throw new I(e);if(204===e.status||!e.headers.get("content-type"))return e;const t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}M.get=U("GET"),M.patch=U("PATCH"),M.put=U("PUT");const j=M.post=U("POST");function U(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return M(t,{...n,method:e})}}M.head=U("HEAD"),M.delete=U("DELETE");class I extends Error{constructor(e){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e}}function $(e,t){var i,a,c,u=e._slotted.labelExtra;return{c(){i=o("label"),a=o("noscript"),i.className="control-label svelte-150khnx"},m(e,s){r(e,i,s),n(i,a),a.insertAdjacentHTML("beforebegin",t.label),u&&(n(i,c||(c=document.createComment(""))),n(i,u))},p(e,t){e.label&&(!function(e){for(;e.previousSibling;)e.parentNode.removeChild(e.previousSibling)}(a),a.insertAdjacentHTML("beforebegin",t.label))},d(e){e&&s(i),u&&function(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}(c,u)}}}function O(e,t){var n;return{c(){(n=o("div")).className="help success svelte-150khnx"},m(e,s){r(e,n,s),n.innerHTML=t.success},p(e,t){e.success&&(n.innerHTML=t.success)},d(e){e&&s(n)}}}function R(e,t){var n;return{c(){(n=o("div")).className="help error svelte-150khnx"},m(e,s){r(e,n,s),n.innerHTML=t.error},p(e,t){e.error&&(n.innerHTML=t.error)},d(e){e&&s(n)}}}function P(e,t){var n;return{c(){(n=o("div")).className="help svelte-150khnx"},m(e,s){r(e,n,s),n.innerHTML=t.help},p(e,t){e.help&&(n.innerHTML=t.help)},d(e){e&&s(n)}}}function B(e){var i,c,u,p,h,f,m,_,g,b,w,y,x,C;v(this,e),this._state=t({label:"",help:"",compact:!1,class:"",error:!1,success:!1,width:"auto",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(i=this,c=this._state,b=i._slotted.default,w=c.label&&$(i,c),y=c.success&&O(0,c),x=c.error&&R(0,c),C=!c.success&&!c.error&&c.help&&P(0,c),{c(){u=o("div"),w&&w.c(),p=a("\n    "),h=o("div"),f=a("\n    "),y&&y.c(),m=a(" "),x&&x.c(),_=a(" "),C&&C.c(),h.className="form-controls svelte-150khnx",u.className=g="form-block "+c.class+" svelte-150khnx",l(u,"width",c.width),u.dataset.uid=c.uid,d(u,"compact",c.compact),d(u,"success",c.success),d(u,"error",c.error)},m(e,t){r(e,u,t),w&&w.m(u,null),n(u,p),n(u,h),b&&n(h,b),n(u,f),y&&y.m(u,null),n(u,m),x&&x.m(u,null),n(u,_),C&&C.m(u,null)},p(e,t){t.label?w?w.p(e,t):((w=$(i,t)).c(),w.m(u,p)):w&&(w.d(1),w=null),t.success?y?y.p(e,t):((y=O(0,t)).c(),y.m(u,m)):y&&(y.d(1),y=null),t.error?x?x.p(e,t):((x=R(0,t)).c(),x.m(u,_)):x&&(x.d(1),x=null),t.success||t.error||!t.help?C&&(C.d(1),C=null):C?C.p(e,t):((C=P(0,t)).c(),C.m(u,null)),e.class&&g!==(g="form-block "+t.class+" svelte-150khnx")&&(u.className=g),e.width&&l(u,"width",t.width),e.uid&&(u.dataset.uid=t.uid),(e.class||e.compact)&&d(u,"compact",t.compact),(e.class||e.success)&&d(u,"success",t.success),(e.class||e.error)&&d(u,"error",t.error)},d(e){e&&s(u),w&&w.d(),b&&function(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}(h,b),y&&y.d(),x&&x.d(),C&&C.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}t(B.prototype,y);var D={async createAccount(e){var t,n,r,s;this.set({signedUp:!0}),t="Chart Editor",n="send-embed-code",window._paq&&window._paq.push(["trackEvent",t,n,r,s]);try{await j("/v3/auth/signup",{payload:{email:e,invitation:!0,chartId:this.store.get().id}}),window.location.reload()}catch(e){if("HttpReqError"===e.name){const t=await e.response.json();this.set({error:t.message||e})}else this.set({error:"Unknown error: "+e})}}};function q(t,n){var i,c,u,l=N("publish / guest / h1"),d=N("publish / guest / p");return{c(){i=o("h2"),c=a("\n\n            "),u=o("p")},m(e,t){r(e,i,t),i.innerHTML=l,r(e,c,t),r(e,u,t),u.innerHTML=d},p:e,d(e){e&&(s(i),s(c),s(u))}}}function F(e,t){var n,a;return{c(){n=o("noscript"),a=o("noscript")},m(e,s){r(e,n,s),n.insertAdjacentHTML("afterend",t.guestAboveInvite),r(e,a,s)},p(e,t){e.guestAboveInvite&&(i(n,a),n.insertAdjacentHTML("afterend",t.guestAboveInvite))},d(e){e&&(i(n,a),s(n),s(a))}}}function z(e,t){var i,c;return{c(){i=o("div"),c=a(t.error),i.className="mt-2 alert alert-warning"},m(e,t){r(e,i,t),n(i,c)},p(e,t){e.error&&function(e,t){e.data=""+t}(c,t.error)},d(e){e&&s(i)}}}function W(e){v(this,e),this._state=t({error:"",email:"",guestAboveInvite:"",guestBelowInvite:"",signedUp:!1},e.data),this._intro=!0,this._fragment=function(e,t){var d,p,h,f,m,_,g,v,b,w,y,x,C,T,k,A,L,E,S,H,M,j,U=!1,I=N("publish / guest / cta"),$=N("publish / guest / back");function O(e){return e.guestAboveInvite?F:q}var R=O(t),P=R(e,t);function D(){U=!0,e.set({email:_.value}),U=!1}function W(n){e.createAccount(t.email)}var J={label:N("publish / guest / e-mail"),help:N("publish / guest / example-email")},G=new B({root:e.root,store:e.store,slots:{default:document.createDocumentFragment()},data:J}),X=t.error&&z(e,t);return{c(){var e,n,r;d=o("div"),p=o("div"),h=o("div"),P.c(),f=a("\n\n        "),m=o("div"),_=o("input"),g=a("\n\n                "),v=o("button"),b=o("i"),y=a("\n                      "),x=o("noscript"),G._fragment.c(),C=a("\n\n        "),T=o("noscript"),k=o("noscript"),A=a("\n\n        "),L=o("div"),E=o("button"),S=o("i"),H=a("   "),M=o("noscript"),j=a("\n\n            "),X&&X.c(),l(h,"margin-bottom","20px"),c(_,"input",D),e=_,n="type",null==(r="email")?e.removeAttribute(n):e.setAttribute(n,r),_.className="input-xlarge",b.className=w="fa "+(t.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),c(v,"click",W),v.className="btn btn-save btn-primary",l(v,"white-space","nowrap"),l(v,"margin-left","10px"),l(m,"display","flex"),S.className="fa fa-chevron-left",E.className="btn btn-save btn-default btn-back",l(L,"margin-top","30px"),p.className="span5",d.className="row publish-signup"},m(e,s){r(e,d,s),n(d,p),n(p,h),P.m(h,null),n(p,f),n(G._slotted.default,m),n(m,_),_.value=t.email,n(m,g),n(m,v),n(v,b),n(v,y),n(v,x),x.insertAdjacentHTML("afterend",I),G._mount(p,null),n(p,C),n(p,T),T.insertAdjacentHTML("afterend",t.guestBelowInvite),n(p,k),n(p,A),n(p,L),n(L,E),n(E,S),n(E,H),n(E,M),M.insertAdjacentHTML("afterend",$),n(L,j),X&&X.m(L,null)},p(n,r){R===(R=O(t=r))&&P?P.p(n,t):(P.d(1),(P=R(e,t)).c(),P.m(h,null)),!U&&n.email&&(_.value=t.email),n.signedUp&&w!==(w="fa "+(t.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(b.className=w),n.guestBelowInvite&&(i(T,k),T.insertAdjacentHTML("afterend",t.guestBelowInvite)),t.error?X?X.p(n,t):((X=z(e,t)).c(),X.m(L,null)):X&&(X.d(1),X=null)},d(e){e&&s(d),P.d(),u(_,"input",D),u(v,"click",W),G.destroy(),X&&X.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),_(this))}function J(e,n){this._handlers={},this._dependents=[],this._computed=p(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=n&&n.immutable?f:h}t(W.prototype,y),t(W.prototype,D),t(J.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let n=0;n<e.length;n+=1){const r=e[n];t["$"+r]=this._state[r]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,n){const r=this._state;this._state=t(t({},r),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,n);this.fire("state",{changed:n,previous:r,current:this._state}),this._dependents.filter(e=>{const t={};let r=!1;for(let s=0;s<e.props.length;s+=1){const i=e.props[s];i in n&&(t["$"+i]=this._state[i],r=!0)}if(r)return e.component._stage(t),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:n,previous:r,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],n=p();let r;function s(i){const o=e[i];o&&(o.deps.forEach(e=>{if(e===r)throw new Error(`Cyclical dependency detected between ${e} <-> ${i}`);s(e)}),n[i]||(n[i]=!0,t.push(o)))}for(const e in this._computed)s(r=e)},compute(e,n,r){let s;const i={deps:n,update:(t,i,o)=>{const a=n.map(e=>(e in i&&(o=!0),t[e]));if(o){const n=r.apply(null,a);this._differs(n,s)&&(s=n,i[e]=!0,t[e]=s)}}};this._computed[e]=i,this._sortComputedProperties();const o=t({},this._state),a={};i.update(o,a,!0),this._set(o,a)},fire:m,get:g,on:b,set(e){const t=this._state,n=this._changed={};let r=!1;for(const s in e){if(this._computed[s])throw new Error(`'${s}' is a read-only computed property`);this._differs(e[s],t[s])&&(n[s]=r=!0)}r&&this._set(e,n)}});return{App:W,store:new J({})}}));
