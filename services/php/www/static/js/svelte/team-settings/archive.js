!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/team-settings/archive",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["team-settings/archive"]=t()}(this,(function(){"use strict";function e(){}function t(e,t){for(var s in t)e[s]=t[s];return e}function s(e,t){for(var s in t)e[s]=1;return e}function i(e){e()}function n(e,t){e.appendChild(t)}function l(e,t,s){e.insertBefore(t,s)}function a(e){e.parentNode.removeChild(e)}function o(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}function r(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}function d(e,t){for(var s=0;s<e.length;s+=1)e[s]&&e[s].d(t)}function u(){return document.createDocumentFragment()}function c(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function h(){return document.createComment("")}function m(e,t,s,i){e.addEventListener(t,s,i)}function f(e,t,s,i){e.removeEventListener(t,s,i)}function v(e,t,s){null==s?e.removeAttribute(t):e.setAttribute(t,s)}function g(e,t){e.data=""+t}function _(e,t,s){e.style.setProperty(t,s)}function b(e,t){for(var s=0;s<e.options.length;s+=1){var i=e.options[s];if(i.__value===t)return void(i.selected=!0)}}function y(e){var t=e.querySelector(":checked")||e.options[0];return t&&t.__value}function w(e,t,s){e.classList[s?"add":"remove"](t)}function H(e){return e}function k(t,s,n,l,a){let o,r,d,u=n.call(t,s,l),c=!1;return{t:a?0:1,running:!1,program:null,pending:null,run(e,t){"function"==typeof u?N.wait().then(()=>{u=u(),this._run(e,t)}):this._run(e,t)},_run(t,i){o=u.duration||300,r=u.easing||H;const n={start:window.performance.now()+(u.delay||0),b:t,callback:i||e};a&&!c&&(u.css&&u.delay&&(d=s.style.cssText,s.style.cssText+=u.css(0,1)),u.tick&&u.tick(0,1),c=!0),t||(n.group=T.current,T.current.remaining+=1),u.delay?this.pending=n:this.start(n),this.running||(this.running=!0,N.add(this))},start(e){if(t.fire((e.b?"intro":"outro")+".start",{node:s}),e.a=this.t,e.delta=e.b-e.a,e.duration=o*Math.abs(e.b-e.a),e.end=e.start+e.duration,u.css){u.delay&&(s.style.cssText=d);const t=function({a:e,b:t,delta:s,duration:i},n,l){const a=16.666/i;let o="{\n";for(let t=0;t<=1;t+=a){const i=e+s*n(t);o+=100*t+`%{${l(i,1-i)}}\n`}return o+`100% {${l(t,1-t)}}\n}`}(e,r,u.css);N.addRule(t,e.name="__svelte_"+function(e){let t=5381,s=e.length;for(;s--;)t=(t<<5)-t^e.charCodeAt(s);return t>>>0}(t)),s.style.animation=(s.style.animation||"").split(", ").filter(t=>t&&(e.delta<0||!/__svelte/.test(t))).concat(`${e.name} ${e.duration}ms linear 1 forwards`).join(", ")}this.program=e,this.pending=null},update(e){const t=this.program;if(!t)return;const s=e-t.start;this.t=t.a+t.delta*r(s/t.duration),u.tick&&u.tick(this.t,1-this.t)},done(){const e=this.program;this.t=e.b,u.tick&&u.tick(this.t,1-this.t),t.fire((e.b?"intro":"outro")+".end",{node:s}),e.b||e.invalidated?u.css&&N.deleteRule(s,e.name):(e.group.callbacks.push(()=>{e.callback(),u.css&&N.deleteRule(s,e.name)}),0==--e.group.remaining&&e.group.callbacks.forEach(i)),this.running=!!this.pending},abort(e){this.program&&(e&&u.tick&&u.tick(1,0),u.css&&N.deleteRule(s,this.program.name),this.program=this.pending=null,this.running=!1)},invalidate(){this.program&&(this.program.invalidated=!0)}}}let T={};function x(){T.current={remaining:0,callbacks:[]}}var N={running:!1,transitions:[],bound:null,stylesheet:null,activeRules:{},promise:null,add(e){this.transitions.push(e),this.running||(this.running=!0,requestAnimationFrame(this.bound||(this.bound=this.next.bind(this))))},addRule(e,t){if(!this.stylesheet){const e=c("style");document.head.appendChild(e),N.stylesheet=e.sheet}this.activeRules[t]||(this.activeRules[t]=!0,this.stylesheet.insertRule(`@keyframes ${t} ${e}`,this.stylesheet.cssRules.length))},next(){this.running=!1;const e=window.performance.now();let t=this.transitions.length;for(;t--;){const s=this.transitions[t];s.program&&e>=s.program.end&&s.done(),s.pending&&e>=s.pending.start&&s.start(s.pending),s.running?(s.update(e),this.running=!0):s.pending||this.transitions.splice(t,1)}if(this.running)requestAnimationFrame(this.bound);else if(this.stylesheet){let e=this.stylesheet.cssRules.length;for(;e--;)this.stylesheet.deleteRule(e);this.activeRules={}}},deleteRule(e,t){e.style.animation=e.style.animation.split(", ").filter(e=>e&&-1===e.indexOf(t)).join(", ")},wait:()=>(N.promise||(N.promise=Promise.resolve(),N.promise.then(()=>{N.promise=null})),N.promise)};function F(){return Object.create(null)}function M(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function C(e,t){return e!=e?t==t:e!==t}function L(e,t){var s=e in this._handlers&&this._handlers[e].slice();if(s)for(var i=0;i<s.length;i+=1){var n=s[i];if(!n.__calling)try{n.__calling=!0,n.call(this,t)}finally{n.__calling=!1}}}function S(e){e._lock=!0,O(e._beforecreate),O(e._oncreate),O(e._aftercreate),e._lock=!1}function j(){return this._state}function W(e,t){e._handlers=F(),e._slots=F(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function E(e,t){var s=this._handlers[e]||(this._handlers[e]=[]);return s.push(t),{cancel:function(){var e=s.indexOf(t);~e&&s.splice(e,1)}}}function O(e){for(;e&&e.length;)e.shift()()}var $={destroy:function(t){this.destroy=e,this.fire("destroy"),this.set=e,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:j,fire:L,on:E,set:function(e){this._set(t({},e)),this.root._lock||S(this.root)},_recompute:e,_set:function(e){var s=this._state,i={},n=!1;for(var l in e=t(this._staged,e),this._staged={},e)this._differs(e[l],s[l])&&(i[l]=n=!0);n&&(this._state=t(t({},s),e),this._recompute(i,this._state),this._bind&&this._bind(i,this._state),this._fragment&&(this.fire("state",{changed:i,current:this._state,previous:s}),this._fragment.p(i,this._state),this.fire("update",{changed:i,current:this._state,previous:s})))},_stage:function(e){t(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:M};function z(e,t){var s;return{c(){(s=c("label")).className="control-label svelte-1nkiaxn"},m(e,i){l(e,s,i),s.innerHTML=t.label},p(e,t){e.label&&(s.innerHTML=t.label)},d(e){e&&a(s)}}}function q(e,t){var s;return{c(){(s=c("div")).className="help success svelte-1nkiaxn"},m(e,i){l(e,s,i),s.innerHTML=t.success},p(e,t){e.success&&(s.innerHTML=t.success)},d(e){e&&a(s)}}}function R(e,t){var s;return{c(){(s=c("div")).className="help error svelte-1nkiaxn"},m(e,i){l(e,s,i),s.innerHTML=t.error},p(e,t){e.error&&(s.innerHTML=t.error)},d(e){e&&a(s)}}}function A(e,t){var s;return{c(){(s=c("div")).className="help svelte-1nkiaxn"},m(e,i){l(e,s,i),s.innerHTML=t.help},p(e,t){e.help&&(s.innerHTML=t.help)},d(e){e&&a(s)}}}function I(e){var s,i,r,d,u,h,m,f,v,g,b,y,H;W(this,e),this._state=t({label:"",help:"",error:!1,success:!1,width:"auto",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(s=this,i=this._state,v=s._slotted.default,g=i.label&&z(0,i),b=i.success&&q(0,i),y=i.error&&R(0,i),H=!i.success&&!i.error&&i.help&&A(0,i),{c(){r=c("div"),g&&g.c(),d=p("\n    "),u=c("div"),h=p("\n    "),b&&b.c(),m=p(" "),y&&y.c(),f=p(" "),H&&H.c(),u.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",_(r,"width",i.width),r.dataset.uid=i.uid,w(r,"success",i.success),w(r,"error",i.error)},m(e,t){l(e,r,t),g&&g.m(r,null),n(r,d),n(r,u),v&&n(u,v),n(r,h),b&&b.m(r,null),n(r,m),y&&y.m(r,null),n(r,f),H&&H.m(r,null)},p(e,t){t.label?g?g.p(e,t):((g=z(0,t)).c(),g.m(r,d)):g&&(g.d(1),g=null),t.success?b?b.p(e,t):((b=q(0,t)).c(),b.m(r,m)):b&&(b.d(1),b=null),t.error?y?y.p(e,t):((y=R(0,t)).c(),y.m(r,f)):y&&(y.d(1),y=null),t.success||t.error||!t.help?H&&(H.d(1),H=null):H?H.p(e,t):((H=A(0,t)).c(),H.m(r,null)),e.width&&_(r,"width",t.width),e.uid&&(r.dataset.uid=t.uid),e.success&&w(r,"success",t.success),e.error&&w(r,"error",t.error)},d(e){e&&a(r),g&&g.d(),v&&o(u,v),b&&b.d(),y&&y.d(),H&&H.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}t(I.prototype,$);const P={};function V(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(P[e]=window.__dw.vis.meta.locale||{}):P[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}var G={show(){const e=setTimeout(()=>{this.set({visible:!0})},400);this.set({t:e})},hide(){const{t:e}=this.get();clearTimeout(e),this.set({visible:!1})}};function B(e,t){var s,i,o,d,u,m=e._slotted.default,f="help"===t.type&&D(),v="upgrade-info"===t.type&&J();return{c(){s=c("div"),f&&f.c(),i=p(" "),v&&v.c(),o=p("\n        "),s.className=u="content "+t.type+" svelte-1qzgns1"},m(e,t){l(e,s,t),f&&f.m(s,null),n(s,i),v&&v.m(s,null),n(s,o),m&&(n(s,d||(d=h())),n(s,m))},p(e,t){"help"===t.type?f||((f=D()).c(),f.m(s,i)):f&&(f.d(1),f=null),"upgrade-info"===t.type?v||((v=J()).c(),v.m(s,o)):v&&(v.d(1),v=null),e.type&&u!==(u="content "+t.type+" svelte-1qzgns1")&&(s.className=u)},d(e){e&&a(s),f&&f.d(),v&&v.d(),m&&r(d,m)}}}function D(e,t){var s;return{c(){(s=c("i")).className="hat-icon im im-graduation-hat svelte-1qzgns1"},m(e,t){l(e,s,t)},d(e){e&&a(s)}}}function J(e,t){var s,i,o=function(e,t="core"){if(e=e.trim(),P[t]||V(t),!P[t][e])return"MISSING:"+e;var s=P[t][e];return"string"==typeof s&&arguments.length>2&&(s=s.replace(/\$(\d)/g,(e,t)=>(t=2+Number(t),void 0===arguments[t]?e:arguments[t]))),s}("upgrade-available");return{c(){s=c("div"),i=p(o),s.className="content-header svelte-1qzgns1"},m(e,t){l(e,s,t),n(s,i)},d(e){e&&a(s)}}}function K(e){W(this,e),this.refs={},this._state=t({visible:!1,class:"",type:"help",uid:""},e.data),this._recompute({type:1},this._state),this._intro=!0,this._slotted=e.slots||{},this._fragment=function(e,t){var s,i,o,r,d,u=t.visible&&B(e,t);function h(t){e.show()}function v(t){e.hide()}return{c(){s=c("div"),i=c("span"),r=p("\n    "),u&&u.c(),i.className=o="help-icon "+t.type+" svelte-1qzgns1",w(i,"visible",t.visible),m(s,"mouseenter",h),m(s,"mouseleave",v),s.className=d="help "+t.class+" "+t.type+" svelte-1qzgns1",s.dataset.uid=t.uid},m(a,o){l(a,s,o),n(s,i),i.innerHTML=t.helpIcon,n(s,r),u&&u.m(s,null),e.refs.helpDisplay=s},p(t,n){t.helpIcon&&(i.innerHTML=n.helpIcon),t.type&&o!==(o="help-icon "+n.type+" svelte-1qzgns1")&&(i.className=o),(t.type||t.visible)&&w(i,"visible",n.visible),n.visible?u?u.p(t,n):((u=B(e,n)).c(),u.m(s,null)):u&&(u.d(1),u=null),(t.class||t.type)&&d!==(d="help "+n.class+" "+n.type+" svelte-1qzgns1")&&(s.className=d),t.uid&&(s.dataset.uid=n.uid)},d(t){t&&a(s),u&&u.d(),f(s,"mouseenter",h),f(s,"mouseleave",v),e.refs.helpDisplay===s&&(e.refs.helpDisplay=null)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}t(K.prototype,$),t(K.prototype,G),K.prototype._recompute=function(e,t){e.type&&this._differs(t.helpIcon,t.helpIcon=function({type:e}){return"upgrade-info"===e?'<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>':"?"}(t))&&(e.helpIcon=!0)};var Q="100px";function U(e,t){var s,i={class:t.helpClass},l=new K({root:e.root,store:e.store,slots:{default:u()},data:i});return{c(){s=c("div"),l._fragment.c()},m(e,i){n(l._slotted.default,s),s.innerHTML=t.help,l._mount(e,i)},p(e,t){e.help&&(s.innerHTML=t.help);var i={};e.helpClass&&(i.class=t.helpClass),l._set(i)},d(e){l.destroy(e)}}}function X(e,t){var s,i,o,r=t.labelHelp&&Y(e,t);return{c(){s=c("label"),i=c("noscript"),o=p(" "),r&&r.c(),_(s,"width",t.labelWidth||Q),s.className="control-label svelte-1ykzs2h",w(s,"disabled",t.disabled)},m(e,a){l(e,s,a),n(s,i),i.insertAdjacentHTML("beforebegin",t.label),n(s,o),r&&r.m(s,null)},p(t,n){t.label&&(!function(e){for(;e.previousSibling;)e.parentNode.removeChild(e.previousSibling)}(i),i.insertAdjacentHTML("beforebegin",n.label)),n.labelHelp?r?r.p(t,n):((r=Y(e,n)).c(),r.m(s,null)):r&&(r.d(1),r=null),t.labelWidth&&_(s,"width",n.labelWidth||Q),t.disabled&&w(s,"disabled",n.disabled)},d(e){e&&a(s),r&&r.d()}}}function Y(e,t){var s;return{c(){(s=c("p")).className="mini-help mt-1"},m(e,i){l(e,s,i),s.innerHTML=t.labelHelp},p(e,t){e.labelHelp&&(s.innerHTML=t.labelHelp)},d(e){e&&a(s)}}}function Z(e,t){var s,i;return{c(){_(s=c("p"),"padding-left",t.inline?0:t.labelWidth||Q),s.className=i="mt-1 mini-help "+t.type+" svelte-1ykzs2h",w(s,"mini-help-block",!t.inline)},m(e,i){l(e,s,i),s.innerHTML=t.miniHelp},p(e,t){e.miniHelp&&(s.innerHTML=t.miniHelp),(e.inline||e.labelWidth)&&_(s,"padding-left",t.inline?0:t.labelWidth||Q),e.type&&i!==(i="mt-1 mini-help "+t.type+" svelte-1ykzs2h")&&(s.className=i),(e.type||e.inline)&&w(s,"mini-help-block",!t.inline)},d(e){e&&a(s)}}}function ee(e){var s,i,r,d,u,h,m,f,v,g,b,y;W(this,e),this._state=t({disabled:!1,help:!1,helpClass:!1,miniHelp:!1,label:!1,labelHelp:!1,class:"",inline:!1,labelWidth:!1,type:"default",valign:"baseline",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(s=this,i=this._state,v=s._slotted.default,g=i.help&&U(s,i),b=i.label&&X(s,i),y=i.miniHelp&&Z(0,i),{c(){g&&g.c(),r=p("\n\n"),d=c("div"),b&&b.c(),u=p("\n    "),h=c("div"),m=p("\n    "),y&&y.c(),h.className="controls svelte-1ykzs2h",_(h,"width","calc(100% - "+(i.labelWidth||Q)+" - 32px)"),w(h,"form-inline",i.inline),d.className=f="control-group vis-option-group vis-option-group-"+i.type+" label-"+i.valign+" "+i.class+" svelte-1ykzs2h",d.dataset.uid=i.uid},m(e,t){g&&g.m(e,t),l(e,r,t),l(e,d,t),b&&b.m(d,null),n(d,u),n(d,h),v&&n(h,v),n(d,m),y&&y.m(d,null)},p(e,t){t.help?g?g.p(e,t):((g=U(s,t)).c(),g.m(r.parentNode,r)):g&&(g.d(1),g=null),t.label?b?b.p(e,t):((b=X(s,t)).c(),b.m(d,u)):b&&(b.d(1),b=null),e.labelWidth&&_(h,"width","calc(100% - "+(t.labelWidth||Q)+" - 32px)"),e.inline&&w(h,"form-inline",t.inline),t.miniHelp?y?y.p(e,t):((y=Z(0,t)).c(),y.m(d,null)):y&&(y.d(1),y=null),(e.type||e.valign||e.class)&&f!==(f="control-group vis-option-group vis-option-group-"+t.type+" label-"+t.valign+" "+t.class+" svelte-1ykzs2h")&&(d.className=f),e.uid&&(d.dataset.uid=t.uid)},d(e){g&&g.d(e),e&&(a(r),a(d)),b&&b.d(),v&&o(h,v),y&&y.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),S(this))}function te({changed:e,previous:t}){t&&e.value&&this.set({indeterminate:!1})}function se(e,t,s){const i=Object.create(e);return i.opt=t[s],i}function ie(e,t){var s,i=t.opt.help;return{c(){(s=c("div")).className="help svelte-b3e9e4"},m(e,t){l(e,s,t),s.innerHTML=i},p(e,t){e.options&&i!==(i=t.opt.help)&&(s.innerHTML=i)},d(e){e&&a(s)}}}function ne(e,t){var s,i,o,r,d,u,h,g,_,b=t.opt.label;function y(){e.set({value:i.__value})}var H=t.opt.help&&ie(0,t);return{c(){s=c("label"),i=c("input"),r=p("\n            "),d=c("span"),u=p(" "),h=c("span"),g=p("\n            "),H&&H.c(),e._bindingGroups[0].push(i),m(i,"change",y),v(i,"type","radio"),i.__value=o=t.opt.value,i.value=i.__value,i.disabled=t.disabled,i.className="svelte-b3e9e4",d.className="css-ui svelte-b3e9e4",h.className="inner-label svelte-b3e9e4",s.title=_=t.opt.tooltip||"",s.className="svelte-b3e9e4",w(s,"disabled",t.disabled),w(s,"has-help",t.opt.help)},m(e,a){l(e,s,a),n(s,i),i.checked=i.__value===t.value,n(s,r),n(s,d),n(s,u),n(s,h),h.innerHTML=b,n(s,g),H&&H.m(s,null)},p(e,t){e.value&&(i.checked=i.__value===t.value),e.options&&o!==(o=t.opt.value)&&(i.__value=o),i.value=i.__value,e.disabled&&(i.disabled=t.disabled),e.options&&b!==(b=t.opt.label)&&(h.innerHTML=b),t.opt.help?H?H.p(e,t):((H=ie(0,t)).c(),H.m(s,null)):H&&(H.d(1),H=null),e.options&&_!==(_=t.opt.tooltip||"")&&(s.title=_),e.disabled&&w(s,"disabled",t.disabled),e.options&&w(s,"has-help",t.opt.help)},d(t){t&&a(s),e._bindingGroups[0].splice(e._bindingGroups[0].indexOf(i),1),f(i,"change",y),H&&H.d()}}}function le(e,t){var s;return{c(){(s=c("div")).className="disabled-message svelte-b3e9e4"},m(e,i){l(e,s,i),s.innerHTML=t.disabledMessage},p(e,t){e.disabledMessage&&(s.innerHTML=t.disabledMessage)},d(e){e&&a(s)}}}function ae(e){W(this,e),this._state=t({value:null,disabled:!1,disabledMessage:"",indeterminate:!1,label:"",labelWidth:"auto",help:null,miniHelp:null,valign:"top",inline:!0,uid:""},e.data),this._bindingGroups=[[]],this._intro=!0,this._handlers.state=[te],this._slotted=e.slots||{},te.call(this,{changed:s({},this._state),current:this._state}),this._fragment=function(e,t){for(var s,i,o,m,f,v=e._slotted.default,g=t.options,_=[],b=0;b<g.length;b+=1)_[b]=ne(e,se(t,g,b));var y={type:"radio",labelWidth:t.labelWidth,valign:t.valign,label:t.label,disabled:t.disabled,help:t.help,miniHelp:t.miniHelp,uid:t.uid},H=new ee({root:e.root,store:e.store,slots:{default:u()},data:y}),k=t.disabled&&t.disabledMessage&&le(e,t);return{c(){s=c("div");for(var e=0;e<_.length;e+=1)_[e].c();i=p("\n    "),H._fragment.c(),m=p("\n\n"),k&&k.c(),f=h(),s.className="svelte-b3e9e4",w(s,"inline",t.inline),w(s,"indeterminate",t.indeterminate)},m(e,t){n(H._slotted.default,s);for(var a=0;a<_.length;a+=1)_[a].m(s,null);n(H._slotted.default,i),v&&(n(H._slotted.default,o||(o=h())),n(H._slotted.default,v)),H._mount(e,t),l(e,m,t),k&&k.m(e,t),l(e,f,t)},p(t,i){if(t.options||t.disabled||t.value){g=i.options;for(var n=0;n<g.length;n+=1){const l=se(i,g,n);_[n]?_[n].p(t,l):(_[n]=ne(e,l),_[n].c(),_[n].m(s,null))}for(;n<_.length;n+=1)_[n].d(1);_.length=g.length}t.inline&&w(s,"inline",i.inline),t.indeterminate&&w(s,"indeterminate",i.indeterminate);var l={};t.labelWidth&&(l.labelWidth=i.labelWidth),t.valign&&(l.valign=i.valign),t.label&&(l.label=i.label),t.disabled&&(l.disabled=i.disabled),t.help&&(l.help=i.help),t.miniHelp&&(l.miniHelp=i.miniHelp),t.uid&&(l.uid=i.uid),H._set(l),i.disabled&&i.disabledMessage?k?k.p(t,i):((k=le(e,i)).c(),k.m(f.parentNode,f)):k&&(k.d(1),k=null)},d(e){d(_,e),v&&r(o,v),H.destroy(e),e&&a(m),k&&k.d(e),e&&a(f)}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:s({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),S(this))}function oe(e,t,s){const i=Object.create(e);return i.opt=t[s],i}function re(e,t,s){const i=Object.create(e);return i.optgroup=t[s],i}function de(e,t,s){const i=Object.create(e);return i.opt=t[s],i}function ue(e,t){for(var s,i=t.options,n=[],o=0;o<i.length;o+=1)n[o]=ce(e,de(t,i,o));return{c(){for(var e=0;e<n.length;e+=1)n[e].c();s=h()},m(e,t){for(var i=0;i<n.length;i+=1)n[i].m(e,t);l(e,s,t)},p(t,l){if(t.options||t.value){i=l.options;for(var a=0;a<i.length;a+=1){const o=de(l,i,a);n[a]?n[a].p(t,o):(n[a]=ce(e,o),n[a].c(),n[a].m(s.parentNode,s))}for(;a<n.length;a+=1)n[a].d(1);n.length=i.length}},d(e){d(n,e),e&&a(s)}}}function ce(e,t){var s,i,o,r,d=t.opt.label;return{c(){s=c("option"),i=p(d),s.__value=o=t.opt.value,s.value=s.__value,s.selected=r=t.opt.value===t.value},m(e,t){l(e,s,t),n(s,i)},p(e,t){e.options&&d!==(d=t.opt.label)&&g(i,d),e.options&&o!==(o=t.opt.value)&&(s.__value=o),s.value=s.__value,(e.options||e.value)&&r!==(r=t.opt.value===t.value)&&(s.selected=r)},d(e){e&&a(s)}}}function pe(e,t){for(var s,i=t.optgroups,n=[],o=0;o<i.length;o+=1)n[o]=me(e,re(t,i,o));return{c(){for(var e=0;e<n.length;e+=1)n[e].c();s=h()},m(e,t){for(var i=0;i<n.length;i+=1)n[i].m(e,t);l(e,s,t)},p(t,l){if(t.optgroups||t.value){i=l.optgroups;for(var a=0;a<i.length;a+=1){const o=re(l,i,a);n[a]?n[a].p(t,o):(n[a]=me(e,o),n[a].c(),n[a].m(s.parentNode,s))}for(;a<n.length;a+=1)n[a].d(1);n.length=i.length}},d(e){d(n,e),e&&a(s)}}}function he(e,t){var s,i,o,r,d=t.opt.label;return{c(){s=c("option"),i=p(d),s.__value=o=t.opt.value,s.value=s.__value,s.selected=r=t.opt.value===t.value},m(e,t){l(e,s,t),n(s,i)},p(e,t){e.optgroups&&d!==(d=t.opt.label)&&g(i,d),e.optgroups&&o!==(o=t.opt.value)&&(s.__value=o),s.value=s.__value,(e.optgroups||e.value)&&r!==(r=t.opt.value===t.value)&&(s.selected=r)},d(e){e&&a(s)}}}function me(e,t){for(var s,i,n=t.optgroup.options,o=[],r=0;r<n.length;r+=1)o[r]=he(0,oe(t,n,r));return{c(){s=c("optgroup");for(var e=0;e<o.length;e+=1)o[e].c();v(s,"label",i=t.optgroup.label)},m(e,t){l(e,s,t);for(var i=0;i<o.length;i+=1)o[i].m(s,null)},p(e,t){if(e.optgroups||e.value){n=t.optgroup.options;for(var l=0;l<n.length;l+=1){const i=oe(t,n,l);o[l]?o[l].p(e,i):(o[l]=he(0,i),o[l].c(),o[l].m(s,null))}for(;l<o.length;l+=1)o[l].d(1);o.length=n.length}e.optgroups&&i!==(i=t.optgroup.label)&&v(s,"label",i)},d(e){e&&a(s),d(o,e)}}}function fe(e){W(this,e),this._state=t({disabled:!1,width:"auto",labelWidth:"auto",options:[],optgroups:[],value:null,class:"",uid:""},e.data),this._intro=!0,this._fragment=function(e,t){var s,i,o,r=!1,d=t.options.length&&ue(e,t),u=t.optgroups.length&&pe(e,t);function p(){r=!0,e.set({value:y(s)}),r=!1}function v(t){e.fire("change",t)}return{c(){s=c("select"),d&&d.c(),i=h(),u&&u.c(),m(s,"change",p),"value"in t||e.root._beforecreate.push(p),m(s,"change",v),s.className=o="select-css "+t.class+" svelte-v0oq4b",s.disabled=t.disabled,_(s,"width",t.width),s.dataset.uid=t.uid},m(e,a){l(e,s,a),d&&d.m(s,null),n(s,i),u&&u.m(s,null),b(s,t.value)},p(t,n){n.options.length?d?d.p(t,n):((d=ue(e,n)).c(),d.m(s,i)):d&&(d.d(1),d=null),n.optgroups.length?u?u.p(t,n):((u=pe(e,n)).c(),u.m(s,null)):u&&(u.d(1),u=null),!r&&t.value&&b(s,n.value),t.class&&o!==(o="select-css "+n.class+" svelte-v0oq4b")&&(s.className=o),t.disabled&&(s.disabled=n.disabled),t.width&&_(s,"width",n.width),t.uid&&(s.dataset.uid=n.uid)},d(e){e&&a(s),d&&d.d(),u&&u.d(),f(s,"change",p),f(s,"change",v)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),S(this))}function ve(e){var t=e-1;return t*t*t+1}function ge(e,t){var s=t.delay;void 0===s&&(s=0);var i=t.duration;void 0===i&&(i=400);var n=t.easing;void 0===n&&(n=ve);var l=getComputedStyle(e),a=+l.opacity,o=parseFloat(l.height),r=parseFloat(l.paddingTop),d=parseFloat(l.paddingBottom),u=parseFloat(l.marginTop),c=parseFloat(l.marginBottom),p=parseFloat(l.borderTopWidth),h=parseFloat(l.borderBottomWidth);return{delay:s,duration:i,easing:n,css:function(e){return"overflow: hidden;opacity: "+Math.min(20*e,1)*a+";height: "+e*o+"px;padding-top: "+e*r+"px;padding-bottom: "+e*d+"px;margin-top: "+e*u+"px;margin-bottom: "+e*c+"px;border-top-width: "+e*p+"px;border-bottom-width: "+e*h+"px;"}}}t(ee.prototype,$),t(ae.prototype,$),t(fe.prototype,$);var _e={toggle(){const{disabled:e,indeterminate:t,inverted:s,value:i}=this.get(),n={value:t?!s:!i,indeterminate:!1};e||(this.set(n),this.fire("change",n))}};function be(){this.set({hasSlotContent:this.options.slots&&this.options.slots.default})}function ye(e,t){var s,i={type:t.helpType||"help"},l=new K({root:e.root,store:e.store,slots:{default:u()},data:i});return{c(){s=c("div"),l._fragment.c()},m(e,i){n(l._slotted.default,s),s.innerHTML=t.help,l._mount(e,i)},p(e,t){e.help&&(s.innerHTML=t.help);var i={};e.helpType&&(i.type=t.helpType||"help"),l._set(i)},d(e){l.destroy(e)}}}function we(e,t){var s,n,o=t.hasSlotContent&&(!t.disabled||"on"==t.disabledState)&&t.effectiveValue&&!t.indeterminate&&ke(e);return{c(){o&&o.c(),s=h()},m(e,t){o&&o.i(e,t),l(e,s,t),n=!0},p(t,i){!i.hasSlotContent||i.disabled&&"on"!=i.disabledState||!i.effectiveValue||i.indeterminate?o&&(x(),o.o((function(){o.d(1),o=null}))):(o||(o=ke(e)).c(),o.i(s.parentNode,s))},i(e,t){n||this.m(e,t)},o:i,d(e){o&&o.d(e),e&&a(s)}}}function He(e,t){var s,i,o,r;return{c(){s=c("div"),(i=c("div")).className="disabled-msg svelte-1ebojil"},m(e,a){l(e,s,a),n(s,i),i.innerHTML=t.disabledMessage,r=!0},p(e,t){r&&!e.disabledMessage||(i.innerHTML=t.disabledMessage)},i(t,i){r||(e.root._intro&&(o&&o.invalidate(),e.root._aftercreate.push(()=>{o||(o=k(e,s,ge,{},!0)),o.run(1)})),this.m(t,i))},o(t){r&&(o||(o=k(e,s,ge,{},!1)),o.run(0,()=>{t(),o=null}),r=!1)},d(e){e&&(a(s),o&&o.abort())}}}function ke(e,t){var s,i,r,d=e._slotted.default;return{c(){(s=c("div")).className="switch-content svelte-1ebojil"},m(e,t){l(e,s,t),d&&n(s,d),r=!0},i(t,n){r||(e.root._intro&&(i&&i.invalidate(),e.root._aftercreate.push(()=>{i||(i=k(e,s,ge,{},!0)),i.run(1)})),this.m(t,n))},o(t){r&&(i||(i=k(e,s,ge,{},!1)),i.run(0,()=>{t(),i=null}),r=!1)},d(e){e&&a(s),d&&o(s,d),e&&i&&i.abort()}}}function Te(e){W(this,e),this._state=t({value:!1,help:"",helpType:!1,disabledMessage:"",disabledState:"auto",disabled:!1,inverted:!1,highlight:!1,indeterminate:!1,hasSlotContent:!1,uid:""},e.data),this._recompute({value:1,inverted:1},this._state),this._intro=!0,this._slotted=e.slots||{},this._fragment=function(e,t){var s,i,o,r,d,u,h,g,_,b,y,H,k,T=t.help&&ye(e,t);function N(){e.set({indeterminate:d.indeterminate})}function F(t){e.toggle()}var M=[He,we],C=[];function L(e){return e.disabled&&e.disabledMessage?0:1}return H=L(t),k=C[H]=M[H](e,t),{c(){s=c("div"),T&&T.c(),i=p("\n\n    "),o=c("label"),r=c("button"),d=c("input"),h=p("\n            "),g=c("span"),_=p("\n        "),b=c("noscript"),y=p("\n\n    "),k.c(),m(d,"change",N),"indeterminate"in t||e.root._beforecreate.push(N),d.className=u="\n                    "+(t.disabled&&"on"==t.disabledState?"disabled-force-checked":t.disabled&&"off"==t.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil",d.disabled=t.disabled,d.checked=t.effectiveValue,v(d,"type","checkbox"),g.className="slider svelte-1ebojil",m(r,"click",F),r.className="switch svelte-1ebojil",o.className="switch-outer svelte-1ebojil",w(o,"disabled",t.disabled),s.className="vis-option-type-switch svelte-1ebojil",s.dataset.uid=t.uid},m(e,a){l(e,s,a),T&&T.m(s,null),n(s,i),n(s,o),n(o,r),n(r,d),d.indeterminate=t.indeterminate,n(r,h),n(r,g),n(o,_),n(o,b),b.insertAdjacentHTML("afterend",t.label),n(s,y),C[H].i(s,null)},p(t,n){n.help?T?T.p(t,n):((T=ye(e,n)).c(),T.m(s,i)):T&&(T.d(1),T=null),t.indeterminate&&(d.indeterminate=n.indeterminate),(t.disabled||t.disabledState)&&u!==(u="\n                    "+(n.disabled&&"on"==n.disabledState?"disabled-force-checked":n.disabled&&"off"==n.disabledState?"disabled-force-unchecked":"")+"\n                 svelte-1ebojil")&&(d.className=u),t.disabled&&(d.disabled=n.disabled),t.effectiveValue&&(d.checked=n.effectiveValue),t.label&&(!function(e){for(;e.nextSibling;)e.parentNode.removeChild(e.nextSibling)}(b),b.insertAdjacentHTML("afterend",n.label)),t.disabled&&w(o,"disabled",n.disabled);var l=H;(H=L(n))===l?C[H].p(t,n):(x(),k.o((function(){C[l].d(1),C[l]=null})),(k=C[H])||(k=C[H]=M[H](e,n)).c(),k.i(s,null)),t.uid&&(s.dataset.uid=n.uid)},d(e){e&&a(s),T&&T.d(),f(d,"change",N),f(r,"click",F),C[H].d()}}}(this,this._state),this.root._oncreate.push(()=>{be.call(this),this.fire("update",{changed:s({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),S(this))}function xe(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}t(Te.prototype,$),t(Te.prototype,_e),Te.prototype._recompute=function(e,t){(e.value||e.inverted)&&this._differs(t.effectiveValue,t.effectiveValue=function({value:e,inverted:t}){return t?!e:e}(t))&&(e.effectiveValue=!0)};const Ne={};function Fe(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(Ne[e]=window.__dw.vis.meta.locale||{}):Ne[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}function Me(e,t="core"){if(e=e.trim(),Ne[t]||Fe(t),!Ne[t][e])return"MISSING:"+e;var s=Ne[t][e];return"string"==typeof s&&arguments.length>2&&(s=s.replace(/\$(\d)/g,(e,t)=>(t=2+Number(t),void 0===arguments[t]?e:arguments[t]))),s}function Ce({changed:e,current:t}){const{settings:s,team:i}=t;if(s&&(e.settings||e.team)){if(s.displayCustomField.enabled&&""===s.displayCustomField.key){const{customFieldOptions:e}=this.get(),t=e[0];t&&t.value&&(s.displayCustomField.key=t.value)}this.fire("change",{team:i,settings:s})}}function Le(e,t){var s={},i={},n={options:t.customFieldOptions};void 0!==t.settings.displayCustomField.key&&(n.value=t.settings.displayCustomField.key,s.value=!0);var l=new fe({root:e.root,store:e.store,data:n,_bind(i,n){var l={};!s.value&&i.value&&(t.settings.displayCustomField.key=n.value,l.settings=t.settings),e._set(l),s={}}});e.root._beforecreate.push(()=>{l._bind({value:1},l.get())});var a={label:Me("teams / archive / custom-fields / label"),disabled:!t.customFieldExists};void 0!==t.settings.displayCustomField.enabled&&(a.value=t.settings.displayCustomField.enabled,i.value=!0);var o=new Te({root:e.root,store:e.store,slots:{default:u()},data:a,_bind(s,n){var l={};!i.value&&s.value&&(t.settings.displayCustomField.enabled=n.value,l.settings=t.settings),e._set(l),i={}}});e.root._beforecreate.push(()=>{o._bind({value:1},o.get())});var r={label:Me("teams / archive / custom-fields"),help:t.customFieldsHelpText},d=new I({root:e.root,store:e.store,slots:{default:u()},data:r});return{c(){l._fragment.c(),o._fragment.c(),d._fragment.c()},m(e,t){l._mount(o._slotted.default,null),o._mount(d._slotted.default,null),d._mount(e,t)},p(e,n){t=n;var a={};e.customFieldOptions&&(a.options=t.customFieldOptions),!s.value&&e.settings&&(a.value=t.settings.displayCustomField.key,s.value=void 0!==t.settings.displayCustomField.key),l._set(a),s={};var r={};e.customFieldExists&&(r.disabled=!t.customFieldExists),!i.value&&e.settings&&(r.value=t.settings.displayCustomField.enabled,i.value=void 0!==t.settings.displayCustomField.enabled),o._set(r),i={};var u={};e.customFieldsHelpText&&(u.help=t.customFieldsHelpText),d._set(u)},d(e){l.destroy(),o.destroy(),d.destroy(e)}}}function Se(e){W(this,e),this._state=t({customFieldsEnabled:!1},e.data),this._recompute({settings:1,team:1},this._state),this._intro=!0,this._handlers.state=[Ce],Ce.call(this,{changed:s({},this._state),current:this._state}),this._fragment=function(e,t){var s,i,o,r,d,h,m,f,v,g,_,b,y,w=Me("teams / archive / p"),H={},k=Me("teams / archive / thumbnails / h3"),T=Me("teams / archive / thumbnails / p"),x={},N={label:"",options:[{label:Me("teams / defaults / expanded"),value:"expanded"},{label:Me("teams / defaults / collapsed"),value:"collapsed"}]};void 0!==t.settings.folders&&(N.value=t.settings.folders,H.value=!0);var F=new ae({root:e.root,store:e.store,data:N,_bind(s,i){var n={};!H.value&&s.value&&(t.settings.folders=i.value,n.settings=t.settings),e._set(n),H={}}});e.root._beforecreate.push(()=>{F._bind({value:1},F.get())});var M={label:Me("teams / defaults / folder-status"),help:Me("teams / defaults / folder-status / p")},C=new I({root:e.root,store:e.store,slots:{default:u()},data:M}),L={label:Me("teams / archive / locale / label")};void 0!==t.settings.displayLocale&&(L.value=t.settings.displayLocale,x.value=!0);var S=new Te({root:e.root,store:e.store,data:L,_bind(s,i){var n={};!x.value&&s.value&&(t.settings.displayLocale=i.value,n.settings=t.settings),e._set(n),x={}}});e.root._beforecreate.push(()=>{S._bind({value:1},S.get())});var j={label:Me("teams / archive / locale"),help:t.localeHelpText},W=new I({root:e.root,store:e.store,slots:{default:u()},data:j}),E=t.customFieldsEnabled&&Le(e,t);return{c(){s=c("div"),i=c("div"),o=c("p"),r=p(w),d=p("\n        "),F._fragment.c(),C._fragment.c(),h=p("\n        "),m=c("h3"),f=p(k),v=p("\n        "),g=c("p"),_=p(T),b=p("\n        "),S._fragment.c(),W._fragment.c(),y=p("\n        "),E&&E.c(),i.className="span6",s.className="row"},m(e,t){l(e,s,t),n(s,i),n(i,o),n(o,r),n(i,d),F._mount(C._slotted.default,null),C._mount(i,null),n(i,h),n(i,m),n(m,f),n(i,v),n(i,g),n(g,_),n(i,b),S._mount(W._slotted.default,null),W._mount(i,null),n(i,y),E&&E.m(i,null)},p(s,n){t=n;var l={};!H.value&&s.settings&&(l.value=t.settings.folders,H.value=void 0!==t.settings.folders),F._set(l),H={};var a={};!x.value&&s.settings&&(a.value=t.settings.displayLocale,x.value=void 0!==t.settings.displayLocale),S._set(a),x={};var o={};s.localeHelpText&&(o.help=t.localeHelpText),W._set(o),t.customFieldsEnabled?E?E.p(s,t):((E=Le(e,t)).c(),E.m(i,null)):E&&(E.d(1),E=null)},d(e){e&&a(s),F.destroy(),C.destroy(),S.destroy(),W.destroy(),E&&E.d()}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:s({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),S(this))}function je(e,s){this._handlers={},this._dependents=[],this._computed=F(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=s&&s.immutable?C:M}t(Se.prototype,$),Se.prototype._recompute=function(e,t){e.settings&&(this._differs(t.customFieldExists,t.customFieldExists=function({settings:e}){return(e.customFields||[]).length>0}(t))&&(e.customFieldExists=!0),this._differs(t.customFieldOptions,t.customFieldOptions=function({settings:e}){return(e.customFields||[]).map(e=>({value:e.key,label:e.title}))}(t))&&(e.customFieldOptions=!0)),e.team&&(this._differs(t.customFieldsHelpText,t.customFieldsHelpText=function({team:e}){const t=`/team/${e.id}/custom-fields`;return Me("teams / archive / custom-fields / p").replace("$1",t).replace("$2",xe(e.name))}(t))&&(e.customFieldsHelpText=!0),this._differs(t.localeHelpText,t.localeHelpText=function({team:e}){return Me("teams / archive / locale / p").replace("$1",xe(e.name))}(t))&&(e.localeHelpText=!0))},t(je.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let s=0;s<e.length;s+=1){const i=e[s];t["$"+i]=this._state[i]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,s){const i=this._state;this._state=t(t({},i),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,s);this.fire("state",{changed:s,previous:i,current:this._state}),this._dependents.filter(e=>{const t={};let i=!1;for(let n=0;n<e.props.length;n+=1){const l=e.props[n];l in s&&(t["$"+l]=this._state[l],i=!0)}if(i)return e.component._stage(t),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:s,previous:i,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],s=F();let i;function n(l){const a=e[l];a&&(a.deps.forEach(e=>{if(e===i)throw new Error(`Cyclical dependency detected between ${e} <-> ${l}`);n(e)}),s[l]||(s[l]=!0,t.push(a)))}for(const e in this._computed)n(i=e)},compute(e,s,i){let n;const l={deps:s,update:(t,l,a)=>{const o=s.map(e=>(e in l&&(a=!0),t[e]));if(a){const s=i.apply(null,o);this._differs(s,n)&&(n=s,l[e]=!0,t[e]=n)}}};this._computed[e]=l,this._sortComputedProperties();const a=t({},this._state),o={};l.update(a,o,!0),this._set(a,o)},fire:L,get:j,on:E,set(e){const t=this._state,s=this._changed={};let i=!1;for(const n in e){if(this._computed[n])throw new Error(`'${n}' is a read-only computed property`);this._differs(e[n],t[n])&&(s[n]=i=!0)}i&&this._set(e,s)}});return{App:Se,store:new je({})}}));
