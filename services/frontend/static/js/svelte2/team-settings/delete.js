!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/team-settings/delete",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["team-settings/delete"]=t()}(this,(function(){"use strict";function e(){}function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e,t){for(var n in t)e[n]=1;return e}function i(e){e()}function s(e,t){e.appendChild(t)}function a(e,t,n){e.insertBefore(t,n)}function o(e){e.parentNode.removeChild(e)}function r(){return document.createDocumentFragment()}function d(e){return document.createElement(e)}function l(e){return document.createTextNode(e)}function c(){return document.createComment("")}function u(e,t,n,i){e.addEventListener(t,n,i)}function h(e,t,n,i){e.removeEventListener(t,n,i)}function p(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function f(e,t,n){e.classList[n?"add":"remove"](t)}function m(e){return e}function v(t,n,s,a,o){let r,d,l,c=s.call(t,n,a),u=!1;return{t:o?0:1,running:!1,program:null,pending:null,run(e,t){"function"==typeof c?b.wait().then(()=>{c=c(),this._run(e,t)}):this._run(e,t)},_run(t,i){r=c.duration||300,d=c.easing||m;const s={start:window.performance.now()+(c.delay||0),b:t,callback:i||e};o&&!u&&(c.css&&c.delay&&(l=n.style.cssText,n.style.cssText+=c.css(0,1)),c.tick&&c.tick(0,1),u=!0),t||(s.group=g.current,g.current.remaining+=1),c.delay?this.pending=s:this.start(s),this.running||(this.running=!0,b.add(this))},start(e){if(t.fire((e.b?"intro":"outro")+".start",{node:n}),e.a=this.t,e.delta=e.b-e.a,e.duration=r*Math.abs(e.b-e.a),e.end=e.start+e.duration,c.css){c.delay&&(n.style.cssText=l);const t=function({a:e,b:t,delta:n,duration:i},s,a){const o=16.666/i;let r="{\n";for(let t=0;t<=1;t+=o){const i=e+n*s(t);r+=100*t+`%{${a(i,1-i)}}\n`}return r+`100% {${a(t,1-t)}}\n}`}(e,d,c.css);b.addRule(t,e.name="__svelte_"+function(e){let t=5381,n=e.length;for(;n--;)t=(t<<5)-t^e.charCodeAt(n);return t>>>0}(t)),n.style.animation=(n.style.animation||"").split(", ").filter(t=>t&&(e.delta<0||!/__svelte/.test(t))).concat(`${e.name} ${e.duration}ms linear 1 forwards`).join(", ")}this.program=e,this.pending=null},update(e){const t=this.program;if(!t)return;const n=e-t.start;this.t=t.a+t.delta*d(n/t.duration),c.tick&&c.tick(this.t,1-this.t)},done(){const e=this.program;this.t=e.b,c.tick&&c.tick(this.t,1-this.t),t.fire((e.b?"intro":"outro")+".end",{node:n}),e.b||e.invalidated?c.css&&b.deleteRule(n,e.name):(e.group.callbacks.push(()=>{e.callback(),c.css&&b.deleteRule(n,e.name)}),0==--e.group.remaining&&e.group.callbacks.forEach(i)),this.running=!!this.pending},abort(e){this.program&&(e&&c.tick&&c.tick(1,0),c.css&&b.deleteRule(n,this.program.name),this.program=this.pending=null,this.running=!1)},invalidate(){this.program&&(this.program.invalidated=!0)}}}let g={};function _(){g.current={remaining:0,callbacks:[]}}var b={running:!1,transitions:[],bound:null,stylesheet:null,activeRules:{},promise:null,add(e){this.transitions.push(e),this.running||(this.running=!0,requestAnimationFrame(this.bound||(this.bound=this.next.bind(this))))},addRule(e,t){if(!this.stylesheet){const e=d("style");document.head.appendChild(e),b.stylesheet=e.sheet}this.activeRules[t]||(this.activeRules[t]=!0,this.stylesheet.insertRule(`@keyframes ${t} ${e}`,this.stylesheet.cssRules.length))},next(){this.running=!1;const e=window.performance.now();let t=this.transitions.length;for(;t--;){const n=this.transitions[t];n.program&&e>=n.program.end&&n.done(),n.pending&&e>=n.pending.start&&n.start(n.pending),n.running?(n.update(e),this.running=!0):n.pending||this.transitions.splice(t,1)}if(this.running)requestAnimationFrame(this.bound);else if(this.stylesheet){let e=this.stylesheet.cssRules.length;for(;e--;)this.stylesheet.deleteRule(e);this.activeRules={}}},deleteRule(e,t){e.style.animation=e.style.animation.split(", ").filter(e=>e&&-1===e.indexOf(t)).join(", ")},wait:()=>(b.promise||(b.promise=Promise.resolve(),b.promise.then(()=>{b.promise=null})),b.promise)};function y(){return Object.create(null)}function w(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function T(e,t){return e!=e?t==t:e!==t}function k(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var i=0;i<n.length;i+=1){var s=n[i];if(!s.__calling)try{s.__calling=!0,s.call(this,t)}finally{s.__calling=!1}}}function x(e){e._lock=!0,M(e._beforecreate),M(e._oncreate),M(e._aftercreate),e._lock=!1}function C(){return this._state}function N(e,t){e._handlers=y(),e._slots=y(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function S(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function M(e){for(;e&&e.length;)e.shift()()}var R={destroy:function(t){this.destroy=e,this.fire("destroy"),this.set=e,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:C,fire:k,on:S,set:function(e){this._set(t({},e)),this.root._lock||x(this.root)},_recompute:e,_set:function(e){var n=this._state,i={},s=!1;for(var a in e=t(this._staged,e),this._staged={},e)this._differs(e[a],n[a])&&(i[a]=s=!0);s&&(this._state=t(t({},n),e),this._recompute(i,this._state),this._bind&&this._bind(i,this._state),this._fragment&&(this.fire("state",{changed:i,current:this._state,previous:n}),this._fragment.p(i,this._state),this.fire("update",{changed:i,current:this._state,previous:n})))},_stage:function(e){t(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:w};const E={};function j(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(E[e]=window.__dw.vis.meta.locale||{}):E[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}function L(e,t="core"){if(e=e.trim(),E[t]||j(t),!E[t][e])return"MISSING:"+e;var n=E[t][e];return"string"==typeof n&&arguments.length>2&&(n=n.replace(/\$(\d)/g,(e,t)=>(t=2+Number(t),void 0===arguments[t]?e:arguments[t]))),n}var H={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var i in n)t[i]=n[i]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(i){function s(){}function a(t,n,a){if("undefined"!=typeof document){"number"==typeof(a=e({path:"/"},s.defaults,a)).expires&&(a.expires=new Date(1*new Date+864e5*a.expires)),a.expires=a.expires?a.expires.toUTCString():"";try{var o=JSON.stringify(n);/^[\{\[]/.test(o)&&(n=o)}catch(e){}n=i.write?i.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var r="";for(var d in a)a[d]&&(r+="; "+d,!0!==a[d]&&(r+="="+a[d].split(";")[0]));return document.cookie=t+"="+n+r}}function o(e,n){if("undefined"!=typeof document){for(var s={},a=document.cookie?document.cookie.split("; "):[],o=0;o<a.length;o++){var r=a[o].split("="),d=r.slice(1).join("=");n||'"'!==d.charAt(0)||(d=d.slice(1,-1));try{var l=t(r[0]);if(d=(i.read||i)(d,l)||t(d),n)try{d=JSON.parse(d)}catch(e){}if(s[l]=d,e===l)break}catch(e){}}return e?s[e]:s}}return s.set=a,s.get=function(e){return o(e,!1)},s.getJSON=function(e){return o(e,!0)},s.remove=function(t,n){a(t,"",e(n,{expires:-1}))},s.defaults={},s.withConverter=n,s}((function(){}))},e.exports=n()}(H);var $=H.exports;const F=new Set(["get","head","options","trace"]);function A(e,t={}){if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const{payload:n,baseUrl:i,fetch:s,raw:a,...o}={payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include",...t,headers:{"Content-Type":"application/json",...t.headers}},r=`${i.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let d;if(n&&(o.body=JSON.stringify(n)),o.headers["Content-Type"].startsWith("multipart/")&&delete o.headers["Content-Type"],o.disableCSFR||F.has(o.method.toLowerCase()))d=s(r,o);else{const e=$.get("crumb");e?(o.headers["X-CSRF-Token"]=e,d=s(r,o)):d=A("/v3/me",{fetch:s,baseUrl:i}).then(()=>{const e=$.get("crumb");e&&(o.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>s(r,o))}return d.then(e=>{if(a)return e;if(!e.ok)throw new U(e);if(204===e.status||!e.headers.get("content-type"))return e;const t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}function I(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return A(t,{...n,method:e})}}A.get=I("GET"),A.patch=I("PATCH"),A.put=I("PUT"),A.post=I("POST"),A.head=I("HEAD"),A.delete=I("DELETE");class U extends Error{constructor(e){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e}}function D(e){var t=e-1;return t*t*t+1}function P(e,t){var n=t.delay;void 0===n&&(n=0);var i=t.duration;void 0===i&&(i=400);var s=t.easing;void 0===s&&(s=D);var a=getComputedStyle(e),o=+a.opacity,r=parseFloat(a.height),d=parseFloat(a.paddingTop),l=parseFloat(a.paddingBottom),c=parseFloat(a.marginTop),u=parseFloat(a.marginBottom),h=parseFloat(a.borderTopWidth),p=parseFloat(a.borderBottomWidth);return{delay:n,duration:i,easing:s,css:function(e){return"overflow: hidden;opacity: "+Math.min(20*e,1)*o+";height: "+e*r+"px;padding-top: "+e*d+"px;padding-bottom: "+e*l+"px;margin-top: "+e*c+"px;margin-bottom: "+e*u+"px;border-top-width: "+e*h+"px;border-bottom-width: "+e*p+"px;"}}}var B={show(){const e=setTimeout(()=>{this.set({visible:!0})},400);this.set({t:e})},hide(){const{t:e}=this.get();clearTimeout(e),this.set({visible:!1})}};function O(e,t){var n,i,r,u,h,p=e._slotted.default,f="help"===t.type&&V(),m="upgrade-info"===t.type&&q();return{c(){n=d("div"),f&&f.c(),i=l(" "),m&&m.c(),r=l("\n        "),n.className=h="content "+t.type+" svelte-1o7i3l2"},m(e,t){a(e,n,t),f&&f.m(n,null),s(n,i),m&&m.m(n,null),s(n,r),p&&(s(n,u||(u=c())),s(n,p))},p(e,t){"help"===t.type?f||((f=V()).c(),f.m(n,i)):f&&(f.d(1),f=null),"upgrade-info"===t.type?m||((m=q()).c(),m.m(n,r)):m&&(m.d(1),m=null),e.type&&h!==(h="content "+t.type+" svelte-1o7i3l2")&&(n.className=h)},d(e){e&&o(n),f&&f.d(),m&&m.d(),p&&function(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}(u,p)}}}function V(e,t){var n;return{c(){(n=d("i")).className="hat-icon im im-graduation-hat svelte-1o7i3l2"},m(e,t){a(e,n,t)},d(e){e&&o(n)}}}function q(e,t){var n,i,r=L("upgrade-available");return{c(){n=d("div"),i=l(r),n.className="content-header svelte-1o7i3l2"},m(e,t){a(e,n,t),s(n,i)},d(e){e&&o(n)}}}function J(e){N(this,e),this.refs={},this._state=t({visible:!1,class:"",compact:!1,style:null,type:"help",uid:""},e.data),this._recompute({type:1},this._state),this._intro=!0,this._slotted=e.slots||{},this._fragment=function(e,t){var n,i,r,c,p,m=t.visible&&O(e,t);function v(t){e.show()}function g(t){e.hide()}return{c(){n=d("div"),i=d("span"),c=l("\n    "),m&&m.c(),i.className=r="help-icon "+t.type+" svelte-1o7i3l2",f(i,"visible",t.visible),u(n,"mouseenter",v),u(n,"mouseleave",g),n.className=p="help "+t.class+" "+t.type+" svelte-1o7i3l2",n.style.cssText=t.style,n.dataset.uid=t.uid,f(n,"compact",{compact:t.compact})},m(o,r){a(o,n,r),s(n,i),i.innerHTML=t.helpIcon,s(n,c),m&&m.m(n,null),e.refs.helpDisplay=n},p(t,s){t.helpIcon&&(i.innerHTML=s.helpIcon),t.type&&r!==(r="help-icon "+s.type+" svelte-1o7i3l2")&&(i.className=r),(t.type||t.visible)&&f(i,"visible",s.visible),s.visible?m?m.p(t,s):((m=O(e,s)).c(),m.m(n,null)):m&&(m.d(1),m=null),(t.class||t.type)&&p!==(p="help "+s.class+" "+s.type+" svelte-1o7i3l2")&&(n.className=p),t.style&&(n.style.cssText=s.style),t.uid&&(n.dataset.uid=s.uid),(t.class||t.type||t.compact)&&f(n,"compact",{compact:s.compact})},d(t){t&&o(n),m&&m.d(),h(n,"mouseenter",v),h(n,"mouseleave",g),e.refs.helpDisplay===n&&(e.refs.helpDisplay=null)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}t(J.prototype,R),t(J.prototype,B),J.prototype._recompute=function(e,t){e.type&&this._differs(t.helpIcon,t.helpIcon=function({type:e}){return"upgrade-info"===e?'<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>':"?"}(t))&&(e.helpIcon=!0)};var W={toggle(){const{disabled:e,indeterminate:t,inverted:n,value:i}=this.get(),s={value:t?!n:!i,indeterminate:!1};e||(this.set(s),this.fire("change",s))}};function G(){this.set({hasSlotContent:this.options.slots&&this.options.slots.default})}function X(e,t){var n,i={type:t.helpType||"help"},a=new J({root:e.root,store:e.store,slots:{default:r()},data:i});return{c(){n=d("div"),a._fragment.c()},m(e,i){s(a._slotted.default,n),n.innerHTML=t.help,a._mount(e,i)},p(e,t){e.help&&(n.innerHTML=t.help);var i={};e.helpType&&(i.type=t.helpType||"help"),a._set(i)},d(e){a.destroy(e)}}}function z(e,t){var n,s,r=t.hasSlotContent&&(!t.disabled||"on"==t.disabledState)&&t.effectiveValue&&!t.indeterminate&&K(e);return{c(){r&&r.c(),n=c()},m(e,t){r&&r.i(e,t),a(e,n,t),s=!0},p(t,i){!i.hasSlotContent||i.disabled&&"on"!=i.disabledState||!i.effectiveValue||i.indeterminate?r&&(_(),r.o((function(){r.d(1),r=null}))):(r||(r=K(e)).c(),r.i(n.parentNode,n))},i(e,t){s||this.m(e,t)},o:i,d(e){r&&r.d(e),e&&o(n)}}}function Z(e,t){var n,i,r,l;return{c(){n=d("div"),(i=d("div")).className="disabled-msg svelte-1ebojil"},m(e,o){a(e,n,o),s(n,i),i.innerHTML=t.disabledMessage,l=!0},p(e,t){l&&!e.disabledMessage||(i.innerHTML=t.disabledMessage)},i(t,i){l||(e.root._intro&&(r&&r.invalidate(),e.root._aftercreate.push(()=>{r||(r=v(e,n,P,{},!0)),r.run(1)})),this.m(t,i))},o(t){l&&(r||(r=v(e,n,P,{},!1)),r.run(0,()=>{t(),r=null}),l=!1)},d(e){e&&(o(n),r&&r.abort())}}}function K(e,t){var n,i,r,l=e._slotted.default;return{c(){(n=d("div")).className="switch-content svelte-1ebojil"},m(e,t){a(e,n,t),l&&s(n,l),r=!0},i(t,s){r||(e.root._intro&&(i&&i.invalidate(),e.root._aftercreate.push(()=>{i||(i=v(e,n,P,{},!0)),i.run(1)})),this.m(t,s))},o(t){r&&(i||(i=v(e,n,P,{},!1)),i.run(0,()=>{t(),i=null}),r=!1)},d(e){e&&o(n),l&&function(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}(n,l),e&&i&&i.abort()}}}function Q(e){N(this,e),this._state=t({value:!1,help:"",helpType:!1,disabledMessage:"",disabledState:"auto",disabled:!1,inverted:!1,highlight:!1,indeterminate:!1,hasSlotContent:!1,uid:""},e.data),this._recompute({value:1,inverted:1},this._state),this._intro=!0,this._slotted=e.slots||{},this._fragment=function(e,t){var n,i,r,c,m,v,g,b,y,w,T,k,x,C=t.help&&X(e,t);function N(){e.set({indeterminate:m.indeterminate})}function S(t){e.toggle()}var M=[Z,z],R=[];function E(e){return e.disabled&&e.disabledMessage?0:1}return k=E(t),x=R[k]=M[k](e,t),{c(){n=d("div"),C&&C.c(),i=l("\n\n    "),r=d("label"),c=d("button"),m=d("input"),g=l("\n            "),b=d("span"),y=l("\n        "),w=d("noscript"),T=l("\n\n    "),x.c(),u(m,"change",N),"indeterminate"in t||e.root._beforecreate.push(N),m.className=v="\n                    "+(t.disabled&&"on"==t.disabledState?"disabled-force-checked":t.disabled&&"off"==t.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil",m.disabled=t.disabled,m.checked=t.effectiveValue,p(m,"type","checkbox"),b.className="slider svelte-1ebojil",u(c,"click",S),c.className="switch svelte-1ebojil",r.className="switch-outer svelte-1ebojil",f(r,"disabled",t.disabled),n.className="vis-option-type-switch svelte-1ebojil",n.dataset.uid=t.uid},m(e,o){a(e,n,o),C&&C.m(n,null),s(n,i),s(n,r),s(r,c),s(c,m),m.indeterminate=t.indeterminate,s(c,g),s(c,b),s(r,y),s(r,w),w.insertAdjacentHTML("afterend",t.label),s(n,T),R[k].i(n,null)},p(t,s){s.help?C?C.p(t,s):((C=X(e,s)).c(),C.m(n,i)):C&&(C.d(1),C=null),t.indeterminate&&(m.indeterminate=s.indeterminate),(t.disabled||t.disabledState)&&v!==(v="\n                    "+(s.disabled&&"on"==s.disabledState?"disabled-force-checked":s.disabled&&"off"==s.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil")&&(m.className=v),t.disabled&&(m.disabled=s.disabled),t.effectiveValue&&(m.checked=s.effectiveValue),t.label&&(!function(e){for(;e.nextSibling;)e.parentNode.removeChild(e.nextSibling)}(w),w.insertAdjacentHTML("afterend",s.label)),t.disabled&&f(r,"disabled",s.disabled);var a=k;(k=E(s))===a?R[k].p(t,s):(_(),x.o((function(){R[a].d(1),R[a]=null})),(x=R[k])||(x=R[k]=M[k](e,s)).c(),x.i(n,null)),t.uid&&(n.dataset.uid=s.uid)},d(e){e&&o(n),C&&C.d(),h(m,"change",N),h(c,"click",S),R[k].d()}}}(this,this._state),this.root._oncreate.push(()=>{G.call(this),this.fire("update",{changed:n({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),x(this))}function Y(e,t){var n,i=new J({root:e.root,store:e.store,slots:{default:r()}});return{c(){n=d("div"),i._fragment.c()},m(e,a){s(i._slotted.default,n),n.innerHTML=t.help,i._mount(e,a)},p(e,t){e.help&&(n.innerHTML=t.help)},d(e){i.destroy(e)}}}function ee(e,t){var n,i,r,l;return{c(){n=d("div"),(i=d("div")).className="disabled-msg svelte-1rmafvf"},m(e,o){a(e,n,o),s(n,i),i.innerHTML=t.disabledMessage,l=!0},p(e,t){l&&!e.disabledMessage||(i.innerHTML=t.disabledMessage)},i(t,i){l||(e.root._intro&&(r&&r.invalidate(),e.root._aftercreate.push(()=>{r||(r=v(e,n,P,{},!0)),r.run(1)})),this.m(t,i))},o(t){l&&(r||(r=v(e,n,P,{},!1)),r.run(0,()=>{t(),r=null}),l=!1)},d(e){e&&(o(n),r&&r.abort())}}}function te(e){N(this,e),this._state=t({value:!1,disabled:!1,faded:!1,compact:!1,indeterminate:!1,disabledMessage:"",help:!1,uid:"",class:""},e.data),this._intro=!0,this._fragment=function(e,t){var n,i,r,c,m,v,g,b,y,w,T=t.help&&Y(e,t);function k(){e.set({value:c.checked,indeterminate:c.indeterminate})}var x=t.disabled&&t.disabledMessage&&ee(e,t);return{c(){T&&T.c(),n=l("\n"),i=d("div"),r=d("label"),c=d("input"),m=d("span"),v=l("\n        "),g=l(t.label),y=l("\n    "),x&&x.c(),u(c,"change",k),"value"in t&&"indeterminate"in t||e.root._beforecreate.push(k),p(c,"type","checkbox"),c.disabled=t.disabled,c.className="svelte-1rmafvf",m.className="css-ui svelte-1rmafvf",r.className=b="checkbox "+(t.disabled?"disabled":"")+" "+(t.faded?"faded":"")+" svelte-1rmafvf",i.className=w="control-group vis-option-group vis-option-type-checkbox "+t.class+" svelte-1rmafvf",i.dataset.uid=t.uid,f(i,"is-compact",t.compact)},m(e,o){T&&T.m(e,o),a(e,n,o),a(e,i,o),s(i,r),s(r,c),c.checked=t.value,c.indeterminate=t.indeterminate,s(r,m),s(r,v),s(r,g),s(i,y),x&&x.i(i,null)},p(t,s){s.help?T?T.p(t,s):((T=Y(e,s)).c(),T.m(n.parentNode,n)):T&&(T.d(1),T=null),t.value&&(c.checked=s.value),t.indeterminate&&(c.indeterminate=s.indeterminate),t.disabled&&(c.disabled=s.disabled),t.label&&function(e,t){e.data=""+t}(g,s.label),(t.disabled||t.faded)&&b!==(b="checkbox "+(s.disabled?"disabled":"")+" "+(s.faded?"faded":"")+" svelte-1rmafvf")&&(r.className=b),s.disabled&&s.disabledMessage?(x?x.p(t,s):(x=ee(e,s))&&x.c(),x.i(i,null)):x&&(_(),x.o((function(){x.d(1),x=null}))),t.class&&w!==(w="control-group vis-option-group vis-option-type-checkbox "+s.class+" svelte-1rmafvf")&&(i.className=w),t.uid&&(i.dataset.uid=s.uid),(t.class||t.compact)&&f(i,"is-compact",s.compact)},d(e){T&&T.d(e),e&&(o(n),o(i)),h(c,"change",k),x&&x.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),x(this))}t(Q.prototype,R),t(Q.prototype,W),Q.prototype._recompute=function(e,t){(e.value||e.inverted)&&this._differs(t.effectiveValue,t.effectiveValue=function({value:e,inverted:t}){return t?!e:e}(t))&&(e.effectiveValue=!0)},t(te.prototype,R);var ne={async deleteTeam(){this.set({deleting:!0}),await A.delete("/v3/teams/"+this.get().team.id),window.location="/"}};function ie(e,t){var n,i,s,r,u=L("teams / delete / really"),h={},p={label:L("teams / delete / really-yes")};void 0!==t.deleteTeam2&&(p.value=t.deleteTeam2,h.value=!0);var f=new te({root:e.root,store:e.store,data:p,_bind(t,n){var i={};!h.value&&t.value&&(i.deleteTeam2=n.value),e._set(i),h={}}});e.root._beforecreate.push(()=>{f._bind({value:1},f.get())});var m=t.deleteTeam2&&se(e,t);return{c(){n=d("p"),i=l("\n\n    "),f._fragment.c(),s=l("\n\n    "),m&&m.c(),r=c()},m(e,t){a(e,n,t),n.innerHTML=u,a(e,i,t),f._mount(e,t),a(e,s,t),m&&m.m(e,t),a(e,r,t)},p(n,i){t=i;var s={};!h.value&&n.deleteTeam2&&(s.value=t.deleteTeam2,h.value=void 0!==t.deleteTeam2),f._set(s),h={},t.deleteTeam2?m?m.p(n,t):((m=se(e,t)).c(),m.m(r.parentNode,r)):m&&(m.d(1),m=null)},d(e){e&&(o(n),o(i)),f.destroy(e),e&&o(s),m&&m.d(e),e&&o(r)}}}function se(e,t){var n,i,r,c,p,f=L("teams / delete / action");function m(t){e.deleteTeam()}return{c(){n=d("button"),i=d("i"),c=l("  "),p=d("noscript"),i.className=r="fa "+(t.deleting?"fa-spin fa-circle-o-notch":"fa-times"),u(n,"click",m),n.className="btn btn-danger"},m(e,t){a(e,n,t),s(n,i),s(n,c),s(n,p),p.insertAdjacentHTML("afterend",f)},p(e,t){e.deleting&&r!==(r="fa "+(t.deleting?"fa-spin fa-circle-o-notch":"fa-times"))&&(i.className=r)},d(e){e&&o(n),h(n,"click",m)}}}function ae(e){N(this,e),this._state=t({deleteTeam:!1,deleteTeam2:!1,deleting:!1},e.data),this._intro=!0,this._fragment=function(e,t){var n,i,u,h=L("teams / delete / p"),p={},f=t.deleteTeam&&ie(e,t),m={label:L("teams / delete / yes")};void 0!==t.deleteTeam&&(m.value=t.deleteTeam,p.value=!0);var v=new Q({root:e.root,store:e.store,slots:{default:r()},data:m,_bind(t,n){var i={};!p.value&&t.value&&(i.deleteTeam=n.value),e._set(i),p={}}});return e.root._beforecreate.push(()=>{v._bind({value:1},v.get())}),{c(){n=d("p"),i=l("\n\n"),f&&f.c(),u=c(),v._fragment.c()},m(e,t){a(e,n,t),n.innerHTML=h,a(e,i,t),f&&f.m(v._slotted.default,null),s(v._slotted.default,u),v._mount(e,t)},p(n,i){(t=i).deleteTeam?f?f.p(n,t):((f=ie(e,t)).c(),f.m(u.parentNode,u)):f&&(f.d(1),f=null);var s={};!p.value&&n.deleteTeam&&(s.value=t.deleteTeam,p.value=void 0!==t.deleteTeam),v._set(s),p={}},d(e){e&&(o(n),o(i)),f&&f.d(),v.destroy(e)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),x(this))}function oe(e,n){this._handlers={},this._dependents=[],this._computed=y(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=n&&n.immutable?T:w}t(ae.prototype,R),t(ae.prototype,ne),t(oe.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let n=0;n<e.length;n+=1){const i=e[n];t["$"+i]=this._state[i]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,n){const i=this._state;this._state=t(t({},i),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,n);this.fire("state",{changed:n,previous:i,current:this._state}),this._dependents.filter(e=>{const t={};let i=!1;for(let s=0;s<e.props.length;s+=1){const a=e.props[s];a in n&&(t["$"+a]=this._state[a],i=!0)}if(i)return e.component._stage(t),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:n,previous:i,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],n=y();let i;function s(a){const o=e[a];o&&(o.deps.forEach(e=>{if(e===i)throw new Error(`Cyclical dependency detected between ${e} <-> ${a}`);s(e)}),n[a]||(n[a]=!0,t.push(o)))}for(const e in this._computed)s(i=e)},compute(e,n,i){let s;const a={deps:n,update:(t,a,o)=>{const r=n.map(e=>(e in a&&(o=!0),t[e]));if(o){const n=i.apply(null,r);this._differs(n,s)&&(s=n,a[e]=!0,t[e]=s)}}};this._computed[e]=a,this._sortComputedProperties();const o=t({},this._state),r={};a.update(o,r,!0),this._set(o,r)},fire:k,get:C,on:S,set(e){const t=this._state,n=this._changed={};let i=!1;for(const s in e){if(this._computed[s])throw new Error(`'${s}' is a read-only computed property`);this._differs(e[s],t[s])&&(n[s]=i=!0)}i&&this._set(e,n)}});return{App:ae,store:new oe({})}}));
//# sourceMappingURL=delete.js.map
