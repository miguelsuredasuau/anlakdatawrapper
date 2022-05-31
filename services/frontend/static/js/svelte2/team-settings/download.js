!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/team-settings/download",e):(t="undefined"!=typeof globalThis?globalThis:t||self)["team-settings/download"]=e()}(this,(function(){"use strict";function t(){}function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t,e){for(var i in e)t[i]=1;return t}function s(t){t()}function n(t,e){t.appendChild(e)}function a(t,e,i){t.insertBefore(e,i)}function o(t){t.parentNode.removeChild(t)}function r(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function d(){return document.createComment("")}function c(t,e,i,s){t.addEventListener(e,i,s)}function h(t,e,i,s){t.removeEventListener(e,i,s)}function u(t,e,i){t.classList[i?"add":"remove"](e)}function p(t){return t}function f(e,i,n,a,o){let r,l,d,c=n.call(e,i,a),h=!1;return{t:o?0:1,running:!1,program:null,pending:null,run(t,e){"function"==typeof c?g.wait().then(()=>{c=c(),this._run(t,e)}):this._run(t,e)},_run(e,s){r=c.duration||300,l=c.easing||p;const n={start:window.performance.now()+(c.delay||0),b:e,callback:s||t};o&&!h&&(c.css&&c.delay&&(d=i.style.cssText,i.style.cssText+=c.css(0,1)),c.tick&&c.tick(0,1),h=!0),e||(n.group=m.current,m.current.remaining+=1),c.delay?this.pending=n:this.start(n),this.running||(this.running=!0,g.add(this))},start(t){if(e.fire((t.b?"intro":"outro")+".start",{node:i}),t.a=this.t,t.delta=t.b-t.a,t.duration=r*Math.abs(t.b-t.a),t.end=t.start+t.duration,c.css){c.delay&&(i.style.cssText=d);const e=function({a:t,b:e,delta:i,duration:s},n,a){const o=16.666/s;let r="{\n";for(let e=0;e<=1;e+=o){const s=t+i*n(e);r+=100*e+`%{${a(s,1-s)}}\n`}return r+`100% {${a(e,1-e)}}\n}`}(t,l,c.css);g.addRule(e,t.name="__svelte_"+function(t){let e=5381,i=t.length;for(;i--;)e=(e<<5)-e^t.charCodeAt(i);return e>>>0}(e)),i.style.animation=(i.style.animation||"").split(", ").filter(e=>e&&(t.delta<0||!/__svelte/.test(e))).concat(`${t.name} ${t.duration}ms linear 1 forwards`).join(", ")}this.program=t,this.pending=null},update(t){const e=this.program;if(!e)return;const i=t-e.start;this.t=e.a+e.delta*l(i/e.duration),c.tick&&c.tick(this.t,1-this.t)},done(){const t=this.program;this.t=t.b,c.tick&&c.tick(this.t,1-this.t),e.fire((t.b?"intro":"outro")+".end",{node:i}),t.b||t.invalidated?c.css&&g.deleteRule(i,t.name):(t.group.callbacks.push(()=>{t.callback(),c.css&&g.deleteRule(i,t.name)}),0==--t.group.remaining&&t.group.callbacks.forEach(s)),this.running=!!this.pending},abort(t){this.program&&(t&&c.tick&&c.tick(1,0),c.css&&g.deleteRule(i,this.program.name),this.program=this.pending=null,this.running=!1)},invalidate(){this.program&&(this.program.invalidated=!0)}}}let m={};function _(){m.current={remaining:0,callbacks:[]}}var g={running:!1,transitions:[],bound:null,stylesheet:null,activeRules:{},promise:null,add(t){this.transitions.push(t),this.running||(this.running=!0,requestAnimationFrame(this.bound||(this.bound=this.next.bind(this))))},addRule(t,e){if(!this.stylesheet){const t=r("style");document.head.appendChild(t),g.stylesheet=t.sheet}this.activeRules[e]||(this.activeRules[e]=!0,this.stylesheet.insertRule(`@keyframes ${e} ${t}`,this.stylesheet.cssRules.length))},next(){this.running=!1;const t=window.performance.now();let e=this.transitions.length;for(;e--;){const i=this.transitions[e];i.program&&t>=i.program.end&&i.done(),i.pending&&t>=i.pending.start&&i.start(i.pending),i.running?(i.update(t),this.running=!0):i.pending||this.transitions.splice(e,1)}if(this.running)requestAnimationFrame(this.bound);else if(this.stylesheet){let t=this.stylesheet.cssRules.length;for(;t--;)this.stylesheet.deleteRule(t);this.activeRules={}}},deleteRule(t,e){t.style.animation=t.style.animation.split(", ").filter(t=>t&&-1===t.indexOf(e)).join(", ")},wait:()=>(g.promise||(g.promise=Promise.resolve(),g.promise.then(()=>{g.promise=null})),g.promise)};function v(){return Object.create(null)}function b(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function y(t,e){return t!=t?e==e:t!==e}function w(t,e){var i=t in this._handlers&&this._handlers[t].slice();if(i)for(var s=0;s<i.length;s+=1){var n=i[s];if(!n.__calling)try{n.__calling=!0,n.call(this,e)}finally{n.__calling=!1}}}function k(t){t._lock=!0,C(t._beforecreate),C(t._oncreate),C(t._aftercreate),t._lock=!1}function x(){return this._state}function N(t,e){t._handlers=v(),t._slots=v(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function T(t,e){var i=this._handlers[t]||(this._handlers[t]=[]);return i.push(e),{cancel:function(){var t=i.indexOf(e);~t&&i.splice(t,1)}}}function C(t){for(;t&&t.length;)t.shift()()}var S={destroy:function(e){this.destroy=t,this.fire("destroy"),this.set=t,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:x,fire:w,on:T,set:function(t){this._set(e({},t)),this.root._lock||k(this.root)},_recompute:t,_set:function(t){var i=this._state,s={},n=!1;for(var a in t=e(this._staged,t),this._staged={},t)this._differs(t[a],i[a])&&(s[a]=n=!0);n&&(this._state=e(e({},i),t),this._recompute(s,this._state),this._bind&&this._bind(s,this._state),this._fragment&&(this.fire("state",{changed:s,current:this._state,previous:i}),this._fragment.p(s,this._state),this.fire("update",{changed:s,current:this._state,previous:i})))},_stage:function(t){e(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:b};function M(t){var e=t-1;return e*e*e+1}function j(t,e){var i=e.delay;void 0===i&&(i=0);var s=e.duration;void 0===s&&(s=400);var n=e.easing;void 0===n&&(n=M);var a=getComputedStyle(t),o=+a.opacity,r=parseFloat(a.height),l=parseFloat(a.paddingTop),d=parseFloat(a.paddingBottom),c=parseFloat(a.marginTop),h=parseFloat(a.marginBottom),u=parseFloat(a.borderTopWidth),p=parseFloat(a.borderBottomWidth);return{delay:i,duration:s,easing:n,css:function(t){return"overflow: hidden;opacity: "+Math.min(20*t,1)*o+";height: "+t*r+"px;padding-top: "+t*l+"px;padding-bottom: "+t*d+"px;margin-top: "+t*c+"px;margin-bottom: "+t*h+"px;border-top-width: "+t*u+"px;border-bottom-width: "+t*p+"px;"}}}const L={};function R(t="core"){"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(L[t]=window.__dw.vis.meta.locale||{}):L[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function $(t,e="core"){if(t=t.trim(),L[e]||R(e),!L[e][t])return"MISSING:"+t;var i=L[e][t];return"string"==typeof i&&arguments.length>2&&(i=i.replace(/\$(\d)/g,(t,e)=>(e=2+Number(e),void 0===arguments[e]?t:arguments[e]))),i}var F={show(){const t=setTimeout(()=>{this.set({visible:!0})},400);this.set({t:t})},hide(){const{t:t}=this.get();clearTimeout(t),this.set({visible:!1})}};function z(t,e){var i,s,c,h,u,p=t._slotted.default,f="help"===e.type&&D(),m="upgrade-info"===e.type&&A();return{c(){i=r("div"),f&&f.c(),s=l(" "),m&&m.c(),c=l("\n        "),i.className=u="content "+e.type+" svelte-1o7i3l2"},m(t,e){a(t,i,e),f&&f.m(i,null),n(i,s),m&&m.m(i,null),n(i,c),p&&(n(i,h||(h=d())),n(i,p))},p(t,e){"help"===e.type?f||((f=D()).c(),f.m(i,s)):f&&(f.d(1),f=null),"upgrade-info"===e.type?m||((m=A()).c(),m.m(i,c)):m&&(m.d(1),m=null),t.type&&u!==(u="content "+e.type+" svelte-1o7i3l2")&&(i.className=u)},d(t){t&&o(i),f&&f.d(),m&&m.d(),p&&function(t,e){for(;t.nextSibling;)e.appendChild(t.nextSibling)}(h,p)}}}function D(t,e){var i;return{c(){(i=r("i")).className="hat-icon im im-graduation-hat svelte-1o7i3l2"},m(t,e){a(t,i,e)},d(t){t&&o(i)}}}function A(t,e){var i,s,d=$("upgrade-available");return{c(){i=r("div"),s=l(d),i.className="content-header svelte-1o7i3l2"},m(t,e){a(t,i,e),n(i,s)},d(t){t&&o(i)}}}function E(t){N(this,t),this.refs={},this._state=e({visible:!1,class:"",compact:!1,style:null,type:"help",uid:""},t.data),this._recompute({type:1},this._state),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var i,s,d,p,f,m=e.visible&&z(t,e);function _(e){t.show()}function g(e){t.hide()}return{c(){i=r("div"),s=r("span"),p=l("\n    "),m&&m.c(),s.className=d="help-icon "+e.type+" svelte-1o7i3l2",u(s,"visible",e.visible),c(i,"mouseenter",_),c(i,"mouseleave",g),i.className=f="help "+e.class+" "+e.type+" svelte-1o7i3l2",i.style.cssText=e.style,i.dataset.uid=e.uid,u(i,"compact",{compact:e.compact})},m(o,r){a(o,i,r),n(i,s),s.innerHTML=e.helpIcon,n(i,p),m&&m.m(i,null),t.refs.helpDisplay=i},p(e,n){e.helpIcon&&(s.innerHTML=n.helpIcon),e.type&&d!==(d="help-icon "+n.type+" svelte-1o7i3l2")&&(s.className=d),(e.type||e.visible)&&u(s,"visible",n.visible),n.visible?m?m.p(e,n):((m=z(t,n)).c(),m.m(i,null)):m&&(m.d(1),m=null),(e.class||e.type)&&f!==(f="help "+n.class+" "+n.type+" svelte-1o7i3l2")&&(i.className=f),e.style&&(i.style.cssText=n.style),e.uid&&(i.dataset.uid=n.uid),(e.class||e.type||e.compact)&&u(i,"compact",{compact:n.compact})},d(e){e&&o(i),m&&m.d(),h(i,"mouseenter",_),h(i,"mouseleave",g),t.refs.helpDisplay===i&&(t.refs.helpDisplay=null)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}e(E.prototype,S),e(E.prototype,F),E.prototype._recompute=function(t,e){t.type&&this._differs(e.helpIcon,e.helpIcon=function({type:t}){return"upgrade-info"===t?'<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>':"?"}(e))&&(t.helpIcon=!0)};var H={toggle(){const{disabled:t,indeterminate:e,inverted:i,value:s}=this.get(),n={value:e?!i:!s,indeterminate:!1};t||(this.set(n),this.fire("change",n))}};function I(){this.set({hasSlotContent:this.options.slots&&this.options.slots.default})}function V(t,e){var i,s={type:e.helpType||"help"},a=new E({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:s});return{c(){i=r("div"),a._fragment.c()},m(t,s){n(a._slotted.default,i),i.innerHTML=e.help,a._mount(t,s)},p(t,e){t.help&&(i.innerHTML=e.help);var s={};t.helpType&&(s.type=e.helpType||"help"),a._set(s)},d(t){a.destroy(t)}}}function P(t,e){var i,n,r=e.hasSlotContent&&(!e.disabled||"on"==e.disabledState)&&e.effectiveValue&&!e.indeterminate&&O(t);return{c(){r&&r.c(),i=d()},m(t,e){r&&r.i(t,e),a(t,i,e),n=!0},p(e,s){!s.hasSlotContent||s.disabled&&"on"!=s.disabledState||!s.effectiveValue||s.indeterminate?r&&(_(),r.o((function(){r.d(1),r=null}))):(r||(r=O(t)).c(),r.i(i.parentNode,i))},i(t,e){n||this.m(t,e)},o:s,d(t){r&&r.d(t),t&&o(i)}}}function B(t,e){var i,s,l,d;return{c(){i=r("div"),(s=r("div")).className="disabled-msg svelte-1ebojil"},m(t,o){a(t,i,o),n(i,s),s.innerHTML=e.disabledMessage,d=!0},p(t,e){d&&!t.disabledMessage||(s.innerHTML=e.disabledMessage)},i(e,s){d||(t.root._intro&&(l&&l.invalidate(),t.root._aftercreate.push(()=>{l||(l=f(t,i,j,{},!0)),l.run(1)})),this.m(e,s))},o(e){d&&(l||(l=f(t,i,j,{},!1)),l.run(0,()=>{e(),l=null}),d=!1)},d(t){t&&(o(i),l&&l.abort())}}}function O(t,e){var i,s,l,d=t._slotted.default;return{c(){(i=r("div")).className="switch-content svelte-1ebojil"},m(t,e){a(t,i,e),d&&n(i,d),l=!0},i(e,n){l||(t.root._intro&&(s&&s.invalidate(),t.root._aftercreate.push(()=>{s||(s=f(t,i,j,{},!0)),s.run(1)})),this.m(e,n))},o(e){l&&(s||(s=f(t,i,j,{},!1)),s.run(0,()=>{e(),s=null}),l=!1)},d(t){t&&o(i),d&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(i,d),t&&s&&s.abort()}}}function q(t){N(this,t),this._state=e({value:!1,help:"",helpType:!1,disabledMessage:"",disabledState:"auto",disabled:!1,inverted:!1,highlight:!1,indeterminate:!1,hasSlotContent:!1,uid:""},t.data),this._recompute({value:1,inverted:1},this._state),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var i,s,d,p,f,m,g,v,b,y,w,k,x,N=e.help&&V(t,e);function T(){t.set({indeterminate:f.indeterminate})}function C(e){t.toggle()}var S=[B,P],M=[];function j(t){return t.disabled&&t.disabledMessage?0:1}return k=j(e),x=M[k]=S[k](t,e),{c(){var n,a,o;i=r("div"),N&&N.c(),s=l("\n\n    "),d=r("label"),p=r("button"),f=r("input"),g=l("\n            "),v=r("span"),b=l("\n        "),y=r("noscript"),w=l("\n\n    "),x.c(),c(f,"change",T),"indeterminate"in e||t.root._beforecreate.push(T),f.className=m="\n                    "+(e.disabled&&"on"==e.disabledState?"disabled-force-checked":e.disabled&&"off"==e.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil",f.disabled=e.disabled,f.checked=e.effectiveValue,n=f,a="type",null==(o="checkbox")?n.removeAttribute(a):n.setAttribute(a,o),v.className="slider svelte-1ebojil",c(p,"click",C),p.className="switch svelte-1ebojil",d.className="switch-outer svelte-1ebojil",u(d,"disabled",e.disabled),i.className="vis-option-type-switch svelte-1ebojil",i.dataset.uid=e.uid},m(t,o){a(t,i,o),N&&N.m(i,null),n(i,s),n(i,d),n(d,p),n(p,f),f.indeterminate=e.indeterminate,n(p,g),n(p,v),n(d,b),n(d,y),y.insertAdjacentHTML("afterend",e.label),n(i,w),M[k].i(i,null)},p(e,n){n.help?N?N.p(e,n):((N=V(t,n)).c(),N.m(i,s)):N&&(N.d(1),N=null),e.indeterminate&&(f.indeterminate=n.indeterminate),(e.disabled||e.disabledState)&&m!==(m="\n                    "+(n.disabled&&"on"==n.disabledState?"disabled-force-checked":n.disabled&&"off"==n.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil")&&(f.className=m),e.disabled&&(f.disabled=n.disabled),e.effectiveValue&&(f.checked=n.effectiveValue),e.label&&(!function(t){for(;t.nextSibling;)t.parentNode.removeChild(t.nextSibling)}(y),y.insertAdjacentHTML("afterend",n.label)),e.disabled&&u(d,"disabled",n.disabled);var a=k;(k=j(n))===a?M[k].p(e,n):(_(),x.o((function(){M[a].d(1),M[a]=null})),(x=M[k])||(x=M[k]=S[k](t,n)).c(),x.i(i,null)),e.uid&&(i.dataset.uid=n.uid)},d(t){t&&o(i),N&&N.d(),h(f,"change",T),h(p,"click",C),M[k].d()}}}(this,this._state),this.root._oncreate.push(()=>{I.call(this),this.fire("update",{changed:i({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),k(this))}function W({changed:t,current:e}){e.settings&&(t.settings||t.team)&&this.fire("change",{team:e.team,settings:e.settings})}function G(t){N(this,t),this._state=e({settings:{}},t.data),this._intro=!0,this._handlers.state=[W],W.call(this,{changed:i({},this._state),current:this._state}),this._fragment=function(t,e){var i,s,d,c,h,u,p,f,m,_,g,v=$("teams / download / p"),b=$("teams / download / data-localized"),y={},w=$("teams / download / data-localized / help"),k={label:$("teams / download / data-localized / switch")};void 0!==e.settings.downloadDataLocalized&&(k.value=e.settings.downloadDataLocalized,y.value=!0);var x=new q({root:t.root,store:t.store,data:k,_bind(i,s){var n={};!y.value&&i.value&&(e.settings.downloadDataLocalized=s.value,n.settings=e.settings),t._set(n),y={}}});return t.root._beforecreate.push(()=>{x._bind({value:1},x.get())}),{c(){i=r("div"),s=r("div"),d=r("p"),c=l(v),h=l("\n\n        "),u=r("h3"),p=l(b),f=l("\n\n        "),x._fragment.c(),m=l("\n        "),_=r("p"),g=l(w),d.className="mb-6",u.className="mb-4",s.className="span6",i.className="row"},m(t,e){a(t,i,e),n(i,s),n(s,d),n(d,c),n(s,h),n(s,u),n(u,p),n(s,f),x._mount(s,null),n(s,m),n(s,_),n(_,g)},p(t,i){e=i;var s={};!y.value&&t.settings&&(s.value=e.settings.downloadDataLocalized,y.value=void 0!==e.settings.downloadDataLocalized),x._set(s),y={}},d(t){t&&o(i),x.destroy()}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:i({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),k(this))}function J(t,i){this._handlers={},this._dependents=[],this._computed=v(),this._sortedComputedProperties=[],this._state=e({},t),this._differs=i&&i.immutable?y:b}e(q.prototype,S),e(q.prototype,H),q.prototype._recompute=function(t,e){(t.value||t.inverted)&&this._differs(e.effectiveValue,e.effectiveValue=function({value:t,inverted:e}){return e?!t:t}(e))&&(t.effectiveValue=!0)},e(G.prototype,S),e(J.prototype,{_add(t,e){this._dependents.push({component:t,props:e})},_init(t){const e={};for(let i=0;i<t.length;i+=1){const s=t[i];e["$"+s]=this._state[s]}return e},_remove(t){let e=this._dependents.length;for(;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set(t,i){const s=this._state;this._state=e(e({},s),t);for(let t=0;t<this._sortedComputedProperties.length;t+=1)this._sortedComputedProperties[t].update(this._state,i);this.fire("state",{changed:i,previous:s,current:this._state}),this._dependents.filter(t=>{const e={};let s=!1;for(let n=0;n<t.props.length;n+=1){const a=t.props[n];a in i&&(e["$"+a]=this._state[a],s=!0)}if(s)return t.component._stage(e),!0}).forEach(t=>{t.component.set({})}),this.fire("update",{changed:i,previous:s,current:this._state})},_sortComputedProperties(){const t=this._computed,e=this._sortedComputedProperties=[],i=v();let s;function n(a){const o=t[a];o&&(o.deps.forEach(t=>{if(t===s)throw new Error(`Cyclical dependency detected between ${t} <-> ${a}`);n(t)}),i[a]||(i[a]=!0,e.push(o)))}for(const t in this._computed)n(s=t)},compute(t,i,s){let n;const a={deps:i,update:(e,a,o)=>{const r=i.map(t=>(t in a&&(o=!0),e[t]));if(o){const i=s.apply(null,r);this._differs(i,n)&&(n=i,a[t]=!0,e[t]=n)}}};this._computed[t]=a,this._sortComputedProperties();const o=e({},this._state),r={};a.update(o,r,!0),this._set(o,r)},fire:w,get:x,on:T,set(t){const e=this._state,i=this._changed={};let s=!1;for(const n in t){if(this._computed[n])throw new Error(`'${n}' is a read-only computed property`);this._differs(t[n],e[n])&&(i[n]=s=!0)}s&&this._set(t,i)}});return{App:G,store:new J({})}}));
