!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/team-settings/products",e):(t="undefined"!=typeof globalThis?globalThis:t||self)["team-settings/products"]=e()}(this,(function(){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function n(){}function o(t,e){for(var n in e)t[n]=e[n];return t}function i(t,e){for(var n in e)t[n]=1;return t}function r(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n)}function a(t){t.parentNode.removeChild(t)}function s(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}function u(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function l(){return document.createDocumentFragment()}function d(t){return document.createElement(t)}function p(t){return document.createTextNode(t)}function f(){return document.createComment("")}function h(t,e,n,o){t.addEventListener(e,n,o)}function m(t,e,n,o){t.removeEventListener(e,n,o)}function v(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function g(t,e){t.data=""+e}function _(t,e,n){t.style.setProperty(e,n)}function b(t,e){for(var n=0;n<t.options.length;n+=1){var o=t.options[n];if(o.__value===e)return void(o.selected=!0)}}function y(t){var e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function w(t,e,n){t.classList[n?"add":"remove"](e)}function P(){return Object.create(null)}function N(e,n){return e!=e?n==n:e!==n||e&&"object"===t(e)||"function"==typeof e}function x(t,e){return t!=t?e==e:t!==e}function O(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var o=0;o<n.length;o+=1){var i=n[o];if(!i.__calling)try{i.__calling=!0,i.call(this,e)}finally{i.__calling=!1}}}function H(t){t._lock=!0,T(t._beforecreate),T(t._oncreate),T(t._aftercreate),t._lock=!1}function j(){return this._state}function k(t,e){t._handlers=P(),t._slots=P(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function C(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function T(t){for(;t&&t.length;)t.shift()()}var S={destroy:function(t){this.destroy=n,this.fire("destroy"),this.set=n,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:j,fire:O,on:C,set:function(t){this._set(o({},t)),this.root._lock||H(this.root)},_recompute:n,_set:function(t){var e=this._state,n={},i=!1;for(var r in t=o(this._staged,t),this._staged={},t)this._differs(t[r],e[r])&&(n[r]=i=!0);i&&(this._state=o(o({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){o(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:N},A={true:"ASC",false:"DESC"},E=A.true;var W={sort:function(t,e){t.preventDefault();var n,o=(n=this.get(),e===n.orderBy?A[n.order!==E]:E);this.set({orderBy:e,order:o}),this.fire("sort",{orderBy:e,order:o})}};function I(t){var e=this._svelte,n=e.component,o=e.ctx;n.sort(t,o.item.orderBy)}function B(t,e,n){var o=Object.create(t);return o.item=e[n],o}function R(t,e,n){var o=Object.create(t);return o.item=e[n],o}function D(t,e){var n;return{c:function(){_(n=d("col"),"width",e.item.width)},m:function(t,e){c(t,n,e)},p:function(t,e){t.columnHeaders&&_(n,"width",e.item.width)},d:function(t){t&&a(n)}}}function L(t,e){var n,o,i=e.item.title;return{c:function(){n=d("span"),o=p(i),n.className="col"},m:function(t,e){c(t,n,e),r(n,o)},p:function(t,e){t.columnHeaders&&i!==(i=e.item.title)&&g(o,i)},d:function(t){t&&a(n)}}}function M(t,e){var n,o,i,s,u=e.item.title;return{c:function(){n=d("a"),o=p(u),n._svelte={component:t,ctx:e},h(n,"click",I),n.className=i="\n                            sortable\n                            "+(e.isActive(e.item)?e.isAscending?"sortable-asc":"sortable-desc":"")+"\n                         svelte-l1s1ms",n.href=s="?orderBy=".concat(e.item.orderBy)},m:function(t,e){c(t,n,e),r(n,o)},p:function(t,r){e=r,t.columnHeaders&&u!==(u=e.item.title)&&g(o,u),n._svelte.ctx=e,(t.isActive||t.columnHeaders||t.isAscending)&&i!==(i="\n                            sortable\n                            "+(e.isActive(e.item)?e.isAscending?"sortable-asc":"sortable-desc":"")+"\n                         svelte-l1s1ms")&&(n.className=i),t.columnHeaders&&s!==(s="?orderBy=".concat(e.item.orderBy))&&(n.href=s)},d:function(t){t&&a(n),m(n,"click",I)}}}function z(t,e){var n,o;function i(t){return t.item.orderBy?M:L}var r=i(e),s=r(t,e);return{c:function(){n=d("th"),s.c(),n.className=o=(e.item.className?e.item.className:"")+" svelte-l1s1ms"},m:function(t,e){c(t,n,e),s.m(n,null)},p:function(e,c){r===(r=i(c))&&s?s.p(e,c):(s.d(1),(s=r(t,c)).c(),s.m(n,null)),e.columnHeaders&&o!==(o=(c.item.className?c.item.className:"")+" svelte-l1s1ms")&&(n.className=o)},d:function(t){t&&a(n),s.d()}}}function q(t){k(this,t),this._state=o({order:E,orderBy:"",uid:""},t.data),this._recompute({orderBy:1,order:1},this._state),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){for(var n,o,i,l,f,h,m,v,g=t._slotted.default,_=e.columnHeaders,b=[],y=0;y<_.length;y+=1)b[y]=D(t,R(e,_,y));var w=e.columnHeaders,P=[];for(y=0;y<w.length;y+=1)P[y]=z(t,B(e,w,y));return{c:function(){n=d("div"),o=d("table"),i=d("colgroup");for(var t=0;t<b.length;t+=1)b[t].c();l=p("\n\n        "),f=d("thead"),h=d("tr");for(t=0;t<P.length;t+=1)P[t].c();m=p("\n\n        "),v=d("tbody"),o.className="table svelte-l1s1ms",n.className="table-container svelte-l1s1ms",n.dataset.uid=e.uid},m:function(t,e){c(t,n,e),r(n,o),r(o,i);for(var a=0;a<b.length;a+=1)b[a].m(i,null);r(o,l),r(o,f),r(f,h);for(a=0;a<P.length;a+=1)P[a].m(h,null);r(o,m),r(o,v),g&&r(v,g)},p:function(e,o){if(e.columnHeaders){_=o.columnHeaders;for(var r=0;r<_.length;r+=1){var c=R(o,_,r);b[r]?b[r].p(e,c):(b[r]=D(t,c),b[r].c(),b[r].m(i,null))}for(;r<b.length;r+=1)b[r].d(1);b.length=_.length}if(e.columnHeaders||e.isActive||e.isAscending){w=o.columnHeaders;for(r=0;r<w.length;r+=1){var a=B(o,w,r);P[r]?P[r].p(e,a):(P[r]=z(t,a),P[r].c(),P[r].m(h,null))}for(;r<P.length;r+=1)P[r].d(1);P.length=w.length}e.uid&&(n.dataset.uid=o.uid)},d:function(t){t&&a(n),u(b,t),u(P,t),g&&s(v,g)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}o(q.prototype,S),o(q.prototype,W),q.prototype._recompute=function(t,e){var n;t.orderBy&&this._differs(e.isActive,e.isActive=(n=e.orderBy,function(t){return n===t.orderBy}))&&(t.isActive=!0),t.order&&this._differs(e.isAscending,e.isAscending=e.order===E)&&(t.isAscending=!0)};var U={};function F(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(U[t]=window.__dw.vis.meta.locale||{}):U[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}var $={show:function(){var t=this,e=setTimeout((function(){t.set({visible:!0})}),400);this.set({t:e})},hide:function(){var t=this.get().t;clearTimeout(t),this.set({visible:!1})}};function G(t,e){var n,o,i,s,u,l=t._slotted.default,h="help"===e.type&&J(),m="upgrade-info"===e.type&&X();return{c:function(){n=d("div"),h&&h.c(),o=p(" "),m&&m.c(),i=p("\n        "),n.className=u="content "+e.type+" svelte-1qzgns1"},m:function(t,e){c(t,n,e),h&&h.m(n,null),r(n,o),m&&m.m(n,null),r(n,i),l&&(r(n,s||(s=f())),r(n,l))},p:function(t,e){"help"===e.type?h||((h=J()).c(),h.m(n,o)):h&&(h.d(1),h=null),"upgrade-info"===e.type?m||((m=X()).c(),m.m(n,i)):m&&(m.d(1),m=null),t.type&&u!==(u="content "+e.type+" svelte-1qzgns1")&&(n.className=u)},d:function(t){t&&a(n),h&&h.d(),m&&m.d(),l&&function(t,e){for(;t.nextSibling;)e.appendChild(t.nextSibling)}(s,l)}}}function J(t,e){var n;return{c:function(){(n=d("i")).className="hat-icon im im-graduation-hat svelte-1qzgns1"},m:function(t,e){c(t,n,e)},d:function(t){t&&a(n)}}}function X(t,e){var n,o,i=function(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),U[n]||F(n),!U[n][t])return"MISSING:"+t;var o=U[n][t];return"string"==typeof o&&arguments.length>2&&(o=o.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),o}("upgrade-available");return{c:function(){n=d("div"),o=p(i),n.className="content-header svelte-1qzgns1"},m:function(t,e){c(t,n,e),r(n,o)},d:function(t){t&&a(n)}}}function Z(t){k(this,t),this.refs={},this._state=o({visible:!1,class:"",type:"help",uid:""},t.data),this._recompute({type:1},this._state),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,o,i,s,u,l=e.visible&&G(t,e);function f(e){t.show()}function v(e){t.hide()}return{c:function(){n=d("div"),o=d("span"),s=p("\n    "),l&&l.c(),o.className=i="help-icon "+e.type+" svelte-1qzgns1",w(o,"visible",e.visible),h(n,"mouseenter",f),h(n,"mouseleave",v),n.className=u="help "+e.class+" "+e.type+" svelte-1qzgns1",n.dataset.uid=e.uid},m:function(i,a){c(i,n,a),r(n,o),o.innerHTML=e.helpIcon,r(n,s),l&&l.m(n,null),t.refs.helpDisplay=n},p:function(e,r){e.helpIcon&&(o.innerHTML=r.helpIcon),e.type&&i!==(i="help-icon "+r.type+" svelte-1qzgns1")&&(o.className=i),(e.type||e.visible)&&w(o,"visible",r.visible),r.visible?l?l.p(e,r):((l=G(t,r)).c(),l.m(n,null)):l&&(l.d(1),l=null),(e.class||e.type)&&u!==(u="help "+r.class+" "+r.type+" svelte-1qzgns1")&&(n.className=u),e.uid&&(n.dataset.uid=r.uid)},d:function(e){e&&a(n),l&&l.d(),m(n,"mouseenter",f),m(n,"mouseleave",v),t.refs.helpDisplay===n&&(t.refs.helpDisplay=null)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}o(Z.prototype,S),o(Z.prototype,$),Z.prototype._recompute=function(t,e){t.type&&this._differs(e.helpIcon,e.helpIcon="upgrade-info"===e.type?'<svg width="18" height="18" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M15.035 1.963c-.256 0-.511.1-.707.295l-7.07 7.07a1 1 0 00.707 1.707h4.07v15a2 2 0 002 2h2a2 2 0 002-2v-15h4.07a.999.999 0 00.707-1.707l-7.07-7.07a.999.999 0 00-.707-.295z"/></svg>':"?")&&(t.helpIcon=!0)};var K="100px";function Q(t,e){var n,o={class:e.helpClass},i=new Z({root:t.root,store:t.store,slots:{default:l()},data:o});return{c:function(){n=d("div"),i._fragment.c()},m:function(t,o){r(i._slotted.default,n),n.innerHTML=e.help,i._mount(t,o)},p:function(t,e){t.help&&(n.innerHTML=e.help);var o={};t.helpClass&&(o.class=e.helpClass),i._set(o)},d:function(t){i.destroy(t)}}}function V(t,e){var n,o,i,s=e.labelHelp&&Y(t,e);return{c:function(){n=d("label"),o=d("noscript"),i=p(" "),s&&s.c(),_(n,"width",e.labelWidth||K),n.className="control-label svelte-1ykzs2h",w(n,"disabled",e.disabled)},m:function(t,a){c(t,n,a),r(n,o),o.insertAdjacentHTML("beforebegin",e.label),r(n,i),s&&s.m(n,null)},p:function(e,i){e.label&&(!function(t){for(;t.previousSibling;)t.parentNode.removeChild(t.previousSibling)}(o),o.insertAdjacentHTML("beforebegin",i.label)),i.labelHelp?s?s.p(e,i):((s=Y(t,i)).c(),s.m(n,null)):s&&(s.d(1),s=null),e.labelWidth&&_(n,"width",i.labelWidth||K),e.disabled&&w(n,"disabled",i.disabled)},d:function(t){t&&a(n),s&&s.d()}}}function Y(t,e){var n;return{c:function(){(n=d("p")).className="mini-help mt-1"},m:function(t,o){c(t,n,o),n.innerHTML=e.labelHelp},p:function(t,e){t.labelHelp&&(n.innerHTML=e.labelHelp)},d:function(t){t&&a(n)}}}function tt(t,e){var n,o;return{c:function(){_(n=d("p"),"padding-left",e.inline?0:e.labelWidth||K),n.className=o="mt-1 mini-help "+e.type+" svelte-1ykzs2h",w(n,"mini-help-block",!e.inline)},m:function(t,o){c(t,n,o),n.innerHTML=e.miniHelp},p:function(t,e){t.miniHelp&&(n.innerHTML=e.miniHelp),(t.inline||t.labelWidth)&&_(n,"padding-left",e.inline?0:e.labelWidth||K),t.type&&o!==(o="mt-1 mini-help "+e.type+" svelte-1ykzs2h")&&(n.className=o),(t.type||t.inline)&&w(n,"mini-help-block",!e.inline)},d:function(t){t&&a(n)}}}function et(t){var e,n,i,u,l,f,h,m,v,g,b,y;k(this,t),this._state=o({disabled:!1,help:!1,helpClass:!1,miniHelp:!1,label:!1,labelHelp:!1,class:"",inline:!1,labelWidth:!1,type:"default",valign:"baseline",uid:""},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,v=e._slotted.default,g=n.help&&Q(e,n),b=n.label&&V(e,n),y=n.miniHelp&&tt(0,n),{c:function(){g&&g.c(),i=p("\n\n"),u=d("div"),b&&b.c(),l=p("\n    "),f=d("div"),h=p("\n    "),y&&y.c(),f.className="controls svelte-1ykzs2h",_(f,"width","calc(100% - "+(n.labelWidth||K)+" - 32px)"),w(f,"form-inline",n.inline),u.className=m="control-group vis-option-group vis-option-group-"+n.type+" label-"+n.valign+" "+n.class+" svelte-1ykzs2h",u.dataset.uid=n.uid},m:function(t,e){g&&g.m(t,e),c(t,i,e),c(t,u,e),b&&b.m(u,null),r(u,l),r(u,f),v&&r(f,v),r(u,h),y&&y.m(u,null)},p:function(t,n){n.help?g?g.p(t,n):((g=Q(e,n)).c(),g.m(i.parentNode,i)):g&&(g.d(1),g=null),n.label?b?b.p(t,n):((b=V(e,n)).c(),b.m(u,l)):b&&(b.d(1),b=null),t.labelWidth&&_(f,"width","calc(100% - "+(n.labelWidth||K)+" - 32px)"),t.inline&&w(f,"form-inline",n.inline),n.miniHelp?y?y.p(t,n):((y=tt(0,n)).c(),y.m(u,null)):y&&(y.d(1),y=null),(t.type||t.valign||t.class)&&m!==(m="control-group vis-option-group vis-option-group-"+n.type+" label-"+n.valign+" "+n.class+" svelte-1ykzs2h")&&(u.className=m),t.uid&&(u.dataset.uid=n.uid)},d:function(t){g&&g.d(t),t&&(a(i),a(u)),b&&b.d(),v&&s(f,v),y&&y.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),H(this))}function nt(t,e,n){var o=Object.create(t);return o.opt=e[n],o}function ot(t,e,n){var o=Object.create(t);return o.optgroup=e[n],o}function it(t,e,n){var o=Object.create(t);return o.opt=e[n],o}function rt(t,e){for(var n,o=e.options,i=[],r=0;r<o.length;r+=1)i[r]=ct(t,it(e,o,r));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=f()},m:function(t,e){for(var o=0;o<i.length;o+=1)i[o].m(t,e);c(t,n,e)},p:function(e,r){if(e.options||e.value){o=r.options;for(var c=0;c<o.length;c+=1){var a=it(r,o,c);i[c]?i[c].p(e,a):(i[c]=ct(t,a),i[c].c(),i[c].m(n.parentNode,n))}for(;c<i.length;c+=1)i[c].d(1);i.length=o.length}},d:function(t){u(i,t),t&&a(n)}}}function ct(t,e){var n,o,i,s,u=e.opt.label;return{c:function(){n=d("option"),o=p(u),n.__value=i=e.opt.value,n.value=n.__value,n.selected=s=e.opt.value===e.value},m:function(t,e){c(t,n,e),r(n,o)},p:function(t,e){t.options&&u!==(u=e.opt.label)&&g(o,u),t.options&&i!==(i=e.opt.value)&&(n.__value=i),n.value=n.__value,(t.options||t.value)&&s!==(s=e.opt.value===e.value)&&(n.selected=s)},d:function(t){t&&a(n)}}}function at(t,e){for(var n,o=e.optgroups,i=[],r=0;r<o.length;r+=1)i[r]=ut(t,ot(e,o,r));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=f()},m:function(t,e){for(var o=0;o<i.length;o+=1)i[o].m(t,e);c(t,n,e)},p:function(e,r){if(e.optgroups||e.value){o=r.optgroups;for(var c=0;c<o.length;c+=1){var a=ot(r,o,c);i[c]?i[c].p(e,a):(i[c]=ut(t,a),i[c].c(),i[c].m(n.parentNode,n))}for(;c<i.length;c+=1)i[c].d(1);i.length=o.length}},d:function(t){u(i,t),t&&a(n)}}}function st(t,e){var n,o,i,s,u=e.opt.label;return{c:function(){n=d("option"),o=p(u),n.__value=i=e.opt.value,n.value=n.__value,n.selected=s=e.opt.value===e.value},m:function(t,e){c(t,n,e),r(n,o)},p:function(t,e){t.optgroups&&u!==(u=e.opt.label)&&g(o,u),t.optgroups&&i!==(i=e.opt.value)&&(n.__value=i),n.value=n.__value,(t.optgroups||t.value)&&s!==(s=e.opt.value===e.value)&&(n.selected=s)},d:function(t){t&&a(n)}}}function ut(t,e){for(var n,o,i=e.optgroup.options,r=[],s=0;s<i.length;s+=1)r[s]=st(0,nt(e,i,s));return{c:function(){n=d("optgroup");for(var t=0;t<r.length;t+=1)r[t].c();v(n,"label",o=e.optgroup.label)},m:function(t,e){c(t,n,e);for(var o=0;o<r.length;o+=1)r[o].m(n,null)},p:function(t,e){if(t.optgroups||t.value){i=e.optgroup.options;for(var c=0;c<i.length;c+=1){var a=nt(e,i,c);r[c]?r[c].p(t,a):(r[c]=st(0,a),r[c].c(),r[c].m(n,null))}for(;c<r.length;c+=1)r[c].d(1);r.length=i.length}t.optgroups&&o!==(o=e.optgroup.label)&&v(n,"label",o)},d:function(t){t&&a(n),u(r,t)}}}function lt(t){k(this,t),this._state=o({disabled:!1,width:"auto",labelWidth:"auto",options:[],optgroups:[],value:null,class:"",uid:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,o,i,s=!1,u=e.options.length&&rt(t,e),l=e.optgroups.length&&at(t,e);function p(){s=!0,t.set({value:y(n)}),s=!1}function v(e){t.fire("change",e)}return{c:function(){n=d("select"),u&&u.c(),o=f(),l&&l.c(),h(n,"change",p),"value"in e||t.root._beforecreate.push(p),h(n,"change",v),n.className=i="select-css "+e.class+" svelte-v0oq4b",n.disabled=e.disabled,_(n,"width",e.width),n.dataset.uid=e.uid},m:function(t,i){c(t,n,i),u&&u.m(n,null),r(n,o),l&&l.m(n,null),b(n,e.value)},p:function(e,r){r.options.length?u?u.p(e,r):((u=rt(t,r)).c(),u.m(n,o)):u&&(u.d(1),u=null),r.optgroups.length?l?l.p(e,r):((l=at(t,r)).c(),l.m(n,null)):l&&(l.d(1),l=null),!s&&e.value&&b(n,r.value),e.class&&i!==(i="select-css "+r.class+" svelte-v0oq4b")&&(n.className=i),e.disabled&&(n.disabled=r.disabled),e.width&&_(n,"width",r.width),e.uid&&(n.dataset.uid=r.uid)},d:function(t){t&&a(n),u&&u.d(),l&&l.d(),m(n,"change",p),m(n,"change",v)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),H(this))}function dt(t){k(this,t),this._state=o({disabled:!1,width:null,labelWidth:null,options:[],optgroups:[],valign:"middle",inline:!1,help:null,miniHelp:null,uid:""},t.data),this._recompute({inline:1,width:1,labelWidth:1},this._state),this._intro=!0,this._fragment=function(t,e){var n={},o={width:e.controlWidth,class:"mt-1"};void 0!==e.value&&(o.value=e.value,n.value=!0),void 0!==e.disabled&&(o.disabled=e.disabled,n.disabled=!0),void 0!==e.options&&(o.options=e.options,n.options=!0),void 0!==e.optgroups&&(o.optgroups=e.optgroups,n.optgroups=!0);var i=new lt({root:t.root,store:t.store,data:o,_bind:function(e,o){var i={};!n.value&&e.value&&(i.value=o.value),!n.disabled&&e.disabled&&(i.disabled=o.disabled),!n.options&&e.options&&(i.options=o.options),!n.optgroups&&e.optgroups&&(i.optgroups=o.optgroups),t._set(i),n={}}});t.root._beforecreate.push((function(){i._bind({value:1,disabled:1,options:1,optgroups:1},i.get())})),i.on("change",(function(e){t.fire("change",e)}));var r={type:"select",label:e.label,labelWidth:e.labelWidth,valign:e.valign,disabled:e.disabled,inline:e.inline,miniHelp:e.miniHelp,help:e.help,uid:e.uid,helpClass:"mt-1"},c=new et({root:t.root,store:t.store,slots:{default:l()},data:r});return{c:function(){i._fragment.c(),c._fragment.c()},m:function(t,e){i._mount(c._slotted.default,null),c._mount(t,e)},p:function(t,o){e=o;var r={};t.controlWidth&&(r.width=e.controlWidth),!n.value&&t.value&&(r.value=e.value,n.value=void 0!==e.value),!n.disabled&&t.disabled&&(r.disabled=e.disabled,n.disabled=void 0!==e.disabled),!n.options&&t.options&&(r.options=e.options,n.options=void 0!==e.options),!n.optgroups&&t.optgroups&&(r.optgroups=e.optgroups,n.optgroups=void 0!==e.optgroups),i._set(r),n={};var a={};t.label&&(a.label=e.label),t.labelWidth&&(a.labelWidth=e.labelWidth),t.valign&&(a.valign=e.valign),t.disabled&&(a.disabled=e.disabled),t.inline&&(a.inline=e.inline),t.miniHelp&&(a.miniHelp=e.miniHelp),t.help&&(a.help=e.help),t.uid&&(a.uid=e.uid),c._set(a)},d:function(t){i.destroy(),c.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),H(this))}o(et.prototype,S),o(lt.prototype,S),o(dt.prototype,S),dt.prototype._recompute=function(t,e){var n,o,i;(t.inline||t.width)&&this._differs(e.controlWidth,e.controlWidth=(o=(n=e).inline,i=n.width,o?i||"auto":i))&&(t.controlWidth=!0),(t.inline||t.labelWidth)&&this._differs(e.labelWidth,e.labelWidth=function(t){var e=t.inline,n=t.labelWidth;return e?n||"auto":n}(e))&&(t.labelWidth=!0)};var pt={};function ft(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(pt[t]=window.__dw.vis.meta.locale||{}):pt[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function ht(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),pt[n]||ft(n),!pt[n][t])return"MISSING:"+t;var o=pt[n][t];return"string"==typeof o&&arguments.length>2&&(o=o.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),o}function mt(t,e){return(mt=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function vt(e,n){return!n||"object"!==t(n)&&"function"!=typeof n?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(e):n}function gt(t){return(gt=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function _t(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function bt(t,e,n){return(bt=_t()?Reflect.construct:function(t,e,n){var o=[null];o.push.apply(o,e);var i=new(Function.bind.apply(t,o));return n&&mt(i,n.prototype),i}).apply(null,arguments)}function yt(t){var e="function"==typeof Map?new Map:void 0;return(yt=function(t){if(null===t||(n=t,-1===Function.toString.call(n).indexOf("[native code]")))return t;var n;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,o)}function o(){return bt(t,arguments,gt(this).constructor)}return o.prototype=Object.create(t.prototype,{constructor:{value:o,enumerable:!1,writable:!0,configurable:!0}}),mt(o,t)})(t)}function wt(t,e){if(null==t)return{};var n,o,i=function(t,e){if(null==t)return{};var n,o,i={},r=Object.keys(t);for(o=0;o<r.length;o++)n=r[o],e.indexOf(n)>=0||(i[n]=t[n]);return i}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(o=0;o<r.length;o++)n=r[o],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}var Pt={exports:{}};
/*!
   * JavaScript Cookie v2.2.1
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */!function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var o in n)e[o]=n[o]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(o){function i(){}function r(e,n,r){if("undefined"!=typeof document){"number"==typeof(r=t({path:"/"},i.defaults,r)).expires&&(r.expires=new Date(1*new Date+864e5*r.expires)),r.expires=r.expires?r.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(t){}n=o.write?o.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var a="";for(var s in r)r[s]&&(a+="; "+s,!0!==r[s]&&(a+="="+r[s].split(";")[0]));return document.cookie=e+"="+n+a}}function c(t,n){if("undefined"!=typeof document){for(var i={},r=document.cookie?document.cookie.split("; "):[],c=0;c<r.length;c++){var a=r[c].split("="),s=a.slice(1).join("=");n||'"'!==s.charAt(0)||(s=s.slice(1,-1));try{var u=e(a[0]);if(s=(o.read||o)(s,u)||e(s),n)try{s=JSON.parse(s)}catch(t){}if(i[u]=s,t===u)break}catch(t){}}return t?i[t]:i}}return i.set=r,i.get=function(t){return c(t,!1)},i.getJSON=function(t){return c(t,!0)},i.remove=function(e,n){r(e,"",t(n,{expires:-1}))},i.defaults={},i.withConverter=n,i}((function(){}))},t.exports=n()}(Pt);var Nt=Pt.exports;function xt(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,o=gt(t);if(e){var i=gt(this).constructor;n=Reflect.construct(o,arguments,i)}else n=o.apply(this,arguments);return vt(this,n)}}function Ot(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function Ht(t){for(var n=1;n<arguments.length;n++){var o=null!=arguments[n]?arguments[n]:{};n%2?Ot(Object(o),!0).forEach((function(n){e(t,n,o[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):Ot(Object(o)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))}))}return t}var jt=new Set(["get","head","options","trace"]);function kt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,o=Ht(Ht({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:Ht({"Content-Type":"application/json"},e.headers)}),i=o.payload,r=o.baseUrl,c=o.fetch,a=o.raw,s=wt(o,["payload","baseUrl","fetch","raw"]),u="".concat(r.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(i&&(s.body=JSON.stringify(i)),jt.has(s.method.toLowerCase()))n=c(u,s);else{var l=Nt.get("crumb");l?(s.headers["X-CSRF-Token"]=l,n=c(u,s)):n=kt("/v3/me",{fetch:c,baseUrl:r}).then((function(){var t=Nt.get("crumb");t&&(s.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return c(u,s)}))}return n.then((function(t){if(a)return t;if(!t.ok)throw new Tt(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}function Ct(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return kt(e,Ht(Ht({},n),{},{method:t}))}}kt.get=Ct("GET"),kt.patch=Ct("PATCH"),kt.put=Ct("PUT"),kt.post=Ct("POST"),kt.head=Ct("HEAD"),kt.delete=Ct("DELETE");var Tt=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&mt(t,e)}(n,t);var e=xt(n);function n(t){var o;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),(o=e.call(this)).name="HttpReqError",o.status=t.status,o.statusText=t.statusText,o.message="[".concat(t.status,"] ").concat(t.statusText),o.response=t,o}return n}(yt(Error));function St(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var At={edit:function(t){this.get().editId===t?(this.set({editId:!1}),this.update(t)):this.set({editId:t})},addProduct:function(){try{var t=this,e=t.get(),n=e.team,o=e.addProduct;return t.set({addingProduct:!0}),St(kt("/v3/teams/".concat(n.id,"/products"),{method:"post",payload:{productId:o}}),(function(){return St(kt("/v3/teams/".concat(n.id,"/products")),(function(e){t.set({products:e.list,addingProduct:!1})}))}))}catch(t){return Promise.reject(t)}},remove:function(t){try{var e=this;if(!window.confirm("Are you sure you want to remove this product?"))return;return St(kt("/v3/teams/".concat(e.get().team.id,"/products/").concat(t.id),{method:"delete"}),(function(){var n=e.get().products;n=n.filter((function(e){return e.id!==t.id})),e.set({products:n})}))}catch(t){return Promise.reject(t)}},update:function(t){try{var e=this,n=e.get(),o=n.updating,i=n.products.filter((function(e){return e.id===t}))[0];return o[i.id]=!0,e.set({updating:o}),St(kt("/v3/teams/".concat(e.get().team.id,"/products/").concat(i.id),{method:"put",payload:{expires:i.expires}}),(function(){(o=e.get().updating)[i.id]=!1,e.set({updating:o})}))}catch(t){return Promise.reject(t)}}};function Et(){var t=this,e=this.get();kt("/v3/teams/".concat(e.team.id,"/products")).then((function(e){return t.set({loadingTeamProducts:!1,products:e.list})})),kt("/v3/products").then((function(e){return t.set({loadingAllProducts:!1,allProducts:e.list})}))}function Wt(t){var e=this._svelte,n=e.component,o=e.ctx;n.remove(o.product)}function It(t){var e=this._svelte,n=e.component,o=e.ctx;n.edit(o.product.id)}function Bt(t){var e=this._svelte,n=e.component,o=e.ctx;n.edit(o.product.id)}function Rt(t,e,n){var o=Object.create(t);return o.product=e[n],o.each_value=e,o.i=n,o}function Dt(t,e){var n;function o(t){return t.loadingTeamProducts||t.loadingAllProducts?Mt:Lt}var i=o(e),r=i(t,e);return{c:function(){r.c(),n=f()},m:function(t,e){r.m(t,e),c(t,n,e)},p:function(e,c){i===(i=o(c))&&r?r.p(e,c):(r.d(1),(r=i(t,c)).c(),r.m(n.parentNode,n))},d:function(t){r.d(t),t&&a(n)}}}function Lt(t,e){var n,o,i=e.products.length>0&&zt(t,e),r=e.addableProducts.length&&Xt(t,e);return{c:function(){i&&i.c(),n=p("\n\n\n"),r&&r.c(),o=f()},m:function(t,e){i&&i.m(t,e),c(t,n,e),r&&r.m(t,e),c(t,o,e)},p:function(e,c){c.products.length>0?i?i.p(e,c):((i=zt(t,c)).c(),i.m(n.parentNode,n)):i&&(i.d(1),i=null),c.addableProducts.length?r?r.p(e,c):((r=Xt(t,c)).c(),r.m(o.parentNode,o)):r&&(r.d(1),r=null)},d:function(t){i&&i.d(t),t&&a(n),r&&r.d(t),t&&a(o)}}}function Mt(t,e){var o,i,s,u,l=ht("teams / products / loading");return{c:function(){o=d("p"),i=d("i"),s=p("   "),u=d("noscript"),i.className="fa fa-spin fa-circle-o-notch"},m:function(t,e){c(t,o,e),r(o,i),r(o,s),r(o,u),u.insertAdjacentHTML("afterend",l)},p:n,d:function(t){t&&a(o)}}}function zt(t,e){for(var n,o=e.products,i=[],c=0;c<o.length;c+=1)i[c]=Jt(t,Rt(e,o,c));var a={columnHeaders:e.productHeaders},s=new q({root:t.root,store:t.store,slots:{default:l()},data:a});return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=f(),s._fragment.c()},m:function(t,e){for(var o=0;o<i.length;o+=1)i[o].m(s._slotted.default,null);r(s._slotted.default,n),s._mount(t,e)},p:function(e,r){if(e.editId||e.products||e.updating){o=r.products;for(var c=0;c<o.length;c+=1){var a=Rt(r,o,c);i[c]?i[c].p(e,a):(i[c]=Jt(t,a),i[c].c(),i[c].m(n.parentNode,n))}for(;c<i.length;c+=1)i[c].d(1);i.length=o.length}var u={};e.productHeaders&&(u.columnHeaders=r.productHeaders),s._set(u)},d:function(t){u(i,t),s.destroy(t)}}}function qt(t,e){var n,o=e.product.expires||ht("teams / products / never");return{c:function(){n=p(o)},m:function(t,e){c(t,n,e)},p:function(t,e){t.products&&o!==(o=e.product.expires||ht("teams / products / never"))&&g(n,o)},d:function(t){t&&a(n)}}}function Ut(t,e){var n,o=!1;function i(){o=!0,e.each_value[e.i].expires=n.value,t.set({products:e.products}),o=!1}return{c:function(){h(n=d("input"),"input",i),v(n,"type","text")},m:function(t,o){c(t,n,o),n.value=e.product.expires},p:function(t,i){e=i,!o&&t.products&&(n.value=e.product.expires)},d:function(t){t&&a(n),m(n,"input",i)}}}function Ft(t,e){var n,o,i,s,u,l,f,v,g,_=ht("teams / edit"),b=ht("teams / remove");return{c:function(){n=d("button"),o=d("i"),i=p("  "),s=p(_),u=p("\n\n            "),l=d("button"),f=d("i"),v=p("  "),g=p(b),o.className="fa fa-edit",n._svelte={component:t,ctx:e},h(n,"click",It),n.className="btn",f.className="fa fa-times",l._svelte={component:t,ctx:e},h(l,"click",Wt),l.className="btn"},m:function(t,e){c(t,n,e),r(n,o),r(n,i),r(n,s),c(t,u,e),c(t,l,e),r(l,f),r(l,v),r(l,g)},p:function(t,o){e=o,n._svelte.ctx=e,l._svelte.ctx=e},d:function(t){t&&a(n),m(n,"click",It),t&&(a(u),a(l)),m(l,"click",Wt)}}}function $t(t,e){var o,i,s,u,l=ht("teams / save");return{c:function(){o=d("button"),i=d("i"),s=p("  "),u=p(l),i.className="fa fa-spin fa-circle-o-notch",o.disabled=!0,o.className="btn btn-primary"},m:function(t,e){c(t,o,e),r(o,i),r(o,s),r(o,u)},p:n,d:function(t){t&&a(o)}}}function Gt(t,e){var n,o,i,s,u=ht("teams / save");return{c:function(){n=d("button"),o=d("i"),i=p("  "),s=p(u),o.className="fa fa-check",n._svelte={component:t,ctx:e},h(n,"click",Bt),n.className="btn btn-primary"},m:function(t,e){c(t,n,e),r(n,o),r(n,i),r(n,s)},p:function(t,o){e=o,n._svelte.ctx=e},d:function(t){t&&a(n),m(n,"click",Bt)}}}function Jt(t,e){var n,o,i,s,u,l,f,h,m,v,_=e.product.id,b=e.product.name;function y(t){return t.editId===t.product.id?Ut:qt}var w=y(e),P=w(t,e);function N(t){return t.editId===t.product.id?Gt:t.updating[t.product.id]?$t:Ft}var x=N(e),O=x(t,e);return{c:function(){n=d("tr"),o=d("td"),i=p(_),s=p("\n        "),u=d("td"),l=p(b),f=p("\n        "),h=d("td"),P.c(),m=p("\n        "),v=d("td"),O.c()},m:function(t,e){c(t,n,e),r(n,o),r(o,i),r(n,s),r(n,u),r(u,l),r(n,f),r(n,h),P.m(h,null),r(n,m),r(n,v),O.m(v,null)},p:function(e,n){e.products&&_!==(_=n.product.id)&&g(i,_),e.products&&b!==(b=n.product.name)&&g(l,b),w===(w=y(n))&&P?P.p(e,n):(P.d(1),(P=w(t,n)).c(),P.m(h,null)),x===(x=N(n))&&O?O.p(e,n):(O.d(1),(O=x(t,n)).c(),O.m(v,null))},d:function(t){t&&a(n),P.d(),O.d()}}}function Xt(t,e){var n,o,i,s={},u={label:ht("teams / products / add-product"),options:e.addableProducts};void 0!==e.addProduct&&(u.value=e.addProduct,s.value=!0);var l=new dt({root:t.root,store:t.store,data:u,_bind:function(e,n){var o={};!s.value&&e.value&&(o.addProduct=n.value),t._set(o),s={}}});t.root._beforecreate.push((function(){l._bind({value:1},l.get())}));var f=e.addProduct&&Zt(t,e);return{c:function(){n=d("div"),o=d("div"),l._fragment.c(),i=p("\n\n    "),f&&f.c(),_(o,"display","block"),_(n,"display","flex")},m:function(t,e){c(t,n,e),r(n,o),l._mount(o,null),r(n,i),f&&f.m(n,null)},p:function(o,i){e=i;var r={};o.addableProducts&&(r.options=e.addableProducts),!s.value&&o.addProduct&&(r.value=e.addProduct,s.value=void 0!==e.addProduct),l._set(r),s={},e.addProduct?f?f.p(o,e):((f=Zt(t,e)).c(),f.m(n,null)):f&&(f.d(1),f=null)},d:function(t){t&&a(n),l.destroy(),f&&f.d()}}}function Zt(t,e){var n,o,i,s,u,l,f=ht("teams / products / add");function v(e){t.addProduct()}return{c:function(){n=d("div"),o=d("button"),i=d("i"),u=p("\n            "),l=d("noscript"),i.className=s="fa "+(e.addingProduct?"fa fa-spin fa-circle-o-notch":"fa-plus"),h(o,"click",v),o.className="btn btn-primary",_(o,"margin-left","10px"),_(n,"display","block")},m:function(t,e){c(t,n,e),r(n,o),r(o,i),r(o,u),r(o,l),l.insertAdjacentHTML("afterend",f)},p:function(t,e){t.addingProduct&&s!==(s="fa "+(e.addingProduct?"fa fa-spin fa-circle-o-notch":"fa-plus"))&&(i.className=s)},d:function(t){t&&a(n),m(o,"click",v)}}}function Kt(t){var e,n,r,s,u,l,h,m=this;k(this,t),this._state=o({productHeaders:[{title:ht("teams / products / id"),width:"10%"},{title:ht("teams / products / name"),width:"30%"},{title:ht("teams / products / expires"),width:"30%"},{title:ht("teams / products / actions"),width:"30%"}],editId:!1,updating:{},loadingTeamProducts:!0,loadingAllProducts:!0},t.data),this._recompute({products:1,allProducts:1},this._state),this._intro=!0,this._fragment=(e=this,n=this._state,l=ht("teams / products / p"),h=n.isAdmin&&Dt(e,n),{c:function(){r=d("p"),s=p("\n\n"),h&&h.c(),u=f(),_(r,"margin-bottom","10px")},m:function(t,e){c(t,r,e),r.innerHTML=l,c(t,s,e),h&&h.m(t,e),c(t,u,e)},p:function(t,n){n.isAdmin?h?h.p(t,n):((h=Dt(e,n)).c(),h.m(u.parentNode,u)):h&&(h.d(1),h=null)},d:function(t){t&&(a(r),a(s)),h&&h.d(t),t&&a(u)}}),this.root._oncreate.push((function(){Et.call(m),m.fire("update",{changed:i({},m._state),current:m._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),H(this))}function Qt(t,e){this._handlers={},this._dependents=[],this._computed=P(),this._sortedComputedProperties=[],this._state=o({},t),this._differs=e&&e.immutable?x:N}return o(Kt.prototype,S),o(Kt.prototype,At),Kt.prototype._recompute=function(t,e){var n,o,i;(t.products||t.allProducts)&&this._differs(e.addableProducts,e.addableProducts=(o=(n=e).products,(i=n.allProducts)&&o?i.filter((function(t){return!o.filter((function(e){return e.id===t.id})).length})).map((function(t){return{value:t.id,label:t.name}})):[]))&&(t.addableProducts=!0)},o(Qt.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var o=t[n];e["$"+o]=this._state[o]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,i=this._state;this._state=o(o({},i),t);for(var r=0;r<this._sortedComputedProperties.length;r+=1)this._sortedComputedProperties[r].update(this._state,e);this.fire("state",{changed:e,previous:i,current:this._state}),this._dependents.filter((function(t){for(var o={},i=!1,r=0;r<t.props.length;r+=1){var c=t.props[r];c in e&&(o["$"+c]=n._state[c],i=!0)}if(i)return t.component._stage(o),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:i,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],o=P();function i(r){var c=e[r];c&&(c.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(r));i(e)})),o[r]||(o[r]=!0,n.push(c)))}for(var r in this._computed)i(t=r)},compute:function(t,e,n){var i,r=this,c={deps:e,update:function(o,c,a){var s=e.map((function(t){return t in c&&(a=!0),o[t]}));if(a){var u=n.apply(null,s);r._differs(u,i)&&(i=u,c[t]=!0,o[t]=i)}}};this._computed[t]=c,this._sortComputedProperties();var a=o({},this._state),s={};c.update(a,s,!0),this._set(a,s)},fire:O,get:j,on:C,set:function(t){var e=this._state,n=this._changed={},o=!1;for(var i in t){if(this._computed[i])throw new Error("'".concat(i,"' is a read-only computed property"));this._differs(t[i],e[i])&&(n[i]=o=!0)}o&&this._set(t,n)}}),{App:Kt,store:new Qt({})}}));
