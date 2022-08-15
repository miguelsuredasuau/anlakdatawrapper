!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/account/myteams",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["account/myteams"]=t()}(this,(function(){"use strict";function e(){}function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e,t){for(var n in t)e[n]=1;return e}function r(e,t){e.appendChild(t)}function a(e,t,n){e.insertBefore(t,n)}function s(e){e.parentNode.removeChild(e)}function o(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function i(){return document.createDocumentFragment()}function c(e){return document.createElement(e)}function u(e){return document.createTextNode(e)}function l(){return document.createComment("")}function m(e,t,n,r){e.addEventListener(t,n,r)}function d(e,t,n,r){e.removeEventListener(t,n,r)}function p(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function h(e,t){e.data=""+t}function f(e,t,n){e.style.setProperty(t,n)}function v(e,t){for(var n=0;n<e.options.length;n+=1){var r=e.options[n];if(r.__value===t)return void(r.selected=!0)}}function g(e){var t=e.querySelector(":checked")||e.options[0];return t&&t.__value}function _(e,t,n){e.classList[n?"add":"remove"](t)}function b(e,n){var r,a=n.token={};function s(e,r,s,o){if(n.token!==a)return;n.resolved=s&&{[s]:o};const i=t(t({},n.ctx),n.resolved),c=e&&(n.current=e)(n.component,i);n.block&&(n.blocks?n.blocks.forEach((e,t)=>{t!==r&&e&&e.o(()=>{e.d(1),n.blocks[t]=null})}):n.block.d(1),c.c(),c[c.i?"i":"m"](n.mount(),n.anchor),n.component.root.set({})),n.block=c,n.blocks&&(n.blocks[r]=c)}if((r=e)&&"function"==typeof r.then){if(e.then(e=>{s(n.then,1,n.value,e)},e=>{s(n.catch,2,n.error,e)}),n.current!==n.pending)return s(n.pending,0),!0}else{if(n.current!==n.then)return s(n.then,1,n.value,e),!0;n.resolved={[n.value]:e}}}function w(){return Object.create(null)}function T(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function y(e,t){return e!=e?t==t:e!==t}function N(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var a=n[r];if(!a.__calling)try{a.__calling=!0,a.call(this,t)}finally{a.__calling=!1}}}function k(e){e._lock=!0,S(e._beforecreate),S(e._oncreate),S(e._aftercreate),e._lock=!1}function x(){return this._state}function C(e,t){e._handlers=w(),e._slots=w(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function L(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function S(e){for(;e&&e.length;)e.shift()()}var A={destroy:function(t){this.destroy=e,this.fire("destroy"),this.set=e,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:x,fire:N,on:L,set:function(e){this._set(t({},e)),this.root._lock||k(this.root)},_recompute:e,_set:function(e){var n=this._state,r={},a=!1;for(var s in e=t(this._staged,e),this._staged={},e)this._differs(e[s],n[s])&&(r[s]=a=!0);a&&(this._state=t(t({},n),e),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:n}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:n})))},_stage:function(e){t(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:T};const E=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,H=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function M(e,t){if(null===e)return null;if(void 0!==e){if((e=String(e)).indexOf("<")<0&&e.indexOf(">")<0)return e;if(e=O(e,t),"undefined"==typeof document)return e;var n=document.createElement("div");n.innerHTML=`<span>${e}</span>`,n.innerHTML=O(n.innerHTML,t&&!t.includes("<span>")?t+"<span>":t||void 0);for(var r=n.childNodes[0].querySelectorAll("*"),a=0;a<r.length;a++){if("a"===r[a].nodeName.toLowerCase()){"_self"!==r[a].getAttribute("target")&&r[a].setAttribute("target","_blank"),r[a].setAttribute("rel","nofollow noopener noreferrer");const e=(r[a].getAttribute("href")||"").toLowerCase().replace(/[^a-z0-9 -/:?=]/g,"").trim();(e.startsWith("javascript:")||e.startsWith("vbscript:")||e.startsWith("data:"))&&r[a].setAttribute("href","")}const e=[];for(var s=0;s<r[a].attributes.length;s++){var o=r[a].attributes[s];o.specified&&"on"===o.name.substr(0,2)&&e.push(o.name)}e.forEach(e=>r[a].removeAttribute(e))}return n.childNodes[0].innerHTML}}function O(e,t){t=(((void 0!==t?t||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");for(var n=e,r=e;;)if(r=(n=r).replace(H,"").replace(E,(function(e,n){return t.indexOf("<"+n.toLowerCase()+">")>-1?e:""})),n===r)return r}const j={};function $(e,t="core",n,...r){let a=function(e,t,n){try{return n[t][e]||e}catch(t){return e}}(e,t,n);return a="string"==typeof r[0]?function(e,t=[]){return e.replace(/\$(\d)/g,(e,n)=>void 0===t[+n]?e:M(t[+n],""))}(a,r):function(e,t={}){return Object.entries(t).forEach(([t,n])=>{e=e.replace(new RegExp(`%${t}%|%${t}(?!\\w)`,"g"),n)}),e}(a,r[0]),M(a,"<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br><a><em><i><strong><b><code><img><table><tr><th><td><small><span><div><sup><sub><tt>")}function R(e,t="core",...n){return e=e.trim(),j[t]||function(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(j[e]=window.__dw.vis.meta.locale||{}):j[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}(t),j[t][e]?$(e,t,j,...n):"MISSING:"+e}function U(e,t=11,n=7){return"string"!=typeof e||e.length<t+n+3?e:e.substring(0,t).trim()+"…"+e.substring(e.length-n).trim()}function P(e,t){var n,o,i,u=e._slotted.labelExtra;return{c(){n=c("label"),o=c("noscript"),n.className="control-label svelte-150khnx"},m(e,s){a(e,n,s),r(n,o),o.insertAdjacentHTML("beforebegin",t.label),u&&(r(n,i||(i=l())),r(n,u))},p(e,t){e.label&&(!function(e){for(;e.previousSibling;)e.parentNode.removeChild(e.previousSibling)}(o),o.insertAdjacentHTML("beforebegin",t.label))},d(e){e&&s(n),u&&function(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}(i,u)}}}function D(e,t){var n;return{c(){(n=c("div")).className="help success svelte-150khnx"},m(e,r){a(e,n,r),n.innerHTML=t.success},p(e,t){e.success&&(n.innerHTML=t.success)},d(e){e&&s(n)}}}function I(e,t){var n;return{c(){(n=c("div")).className="help error svelte-150khnx"},m(e,r){a(e,n,r),n.innerHTML=t.error},p(e,t){e.error&&(n.innerHTML=t.error)},d(e){e&&s(n)}}}function q(e,t){var n;return{c(){(n=c("div")).className="help svelte-150khnx"},m(e,r){a(e,n,r),n.innerHTML=t.help},p(e,t){e.help&&(n.innerHTML=t.help)},d(e){e&&s(n)}}}function F(e){var n,o,i,l,m,d,p,h,v,g,b,w,T,y;C(this,e),this._state=t({label:"",help:"",compact:!1,class:"",error:!1,success:!1,width:"auto",uid:""},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=(n=this,o=this._state,g=n._slotted.default,b=o.label&&P(n,o),w=o.success&&D(0,o),T=o.error&&I(0,o),y=!o.success&&!o.error&&o.help&&q(0,o),{c(){i=c("div"),b&&b.c(),l=u("\n    "),m=c("div"),d=u("\n    "),w&&w.c(),p=u(" "),T&&T.c(),h=u(" "),y&&y.c(),m.className="form-controls svelte-150khnx",i.className=v="form-block "+o.class+" svelte-150khnx",f(i,"width",o.width),i.dataset.uid=o.uid,_(i,"compact",o.compact),_(i,"success",o.success),_(i,"error",o.error)},m(e,t){a(e,i,t),b&&b.m(i,null),r(i,l),r(i,m),g&&r(m,g),r(i,d),w&&w.m(i,null),r(i,p),T&&T.m(i,null),r(i,h),y&&y.m(i,null)},p(e,t){t.label?b?b.p(e,t):((b=P(n,t)).c(),b.m(i,l)):b&&(b.d(1),b=null),t.success?w?w.p(e,t):((w=D(0,t)).c(),w.m(i,p)):w&&(w.d(1),w=null),t.error?T?T.p(e,t):((T=I(0,t)).c(),T.m(i,h)):T&&(T.d(1),T=null),t.success||t.error||!t.help?y&&(y.d(1),y=null):y?y.p(e,t):((y=q(0,t)).c(),y.m(i,null)),e.class&&v!==(v="form-block "+t.class+" svelte-150khnx")&&(i.className=v),e.width&&f(i,"width",t.width),e.uid&&(i.dataset.uid=t.uid),(e.class||e.compact)&&_(i,"compact",t.compact),(e.class||e.success)&&_(i,"success",t.success),(e.class||e.error)&&_(i,"error",t.error)},d(e){e&&s(i),b&&b.d(),g&&function(e,t){for(;e.firstChild;)t.appendChild(e.firstChild)}(m,g),w&&w.d(),T&&T.d(),y&&y.d()}}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}function W(e,t,n){const r=Object.create(e);return r.opt=t[n],r}function z(e,t,n){const r=Object.create(e);return r.optgroup=t[n],r}function B(e,t,n){const r=Object.create(e);return r.opt=t[n],r}function J(e,t){for(var n,r=t.options,i=[],c=0;c<r.length;c+=1)i[c]=G(e,B(t,r,c));return{c(){for(var e=0;e<i.length;e+=1)i[e].c();n=l()},m(e,t){for(var r=0;r<i.length;r+=1)i[r].m(e,t);a(e,n,t)},p(t,a){if(t.options||t.value){r=a.options;for(var s=0;s<r.length;s+=1){const o=B(a,r,s);i[s]?i[s].p(t,o):(i[s]=G(e,o),i[s].c(),i[s].m(n.parentNode,n))}for(;s<i.length;s+=1)i[s].d(1);i.length=r.length}},d(e){o(i,e),e&&s(n)}}}function G(e,t){var n,o,i,l,m=t.opt.label;return{c(){n=c("option"),o=u(m),n.__value=i=t.opt.value,n.value=n.__value,n.selected=l=t.opt.value===t.value},m(e,t){a(e,n,t),r(n,o)},p(e,t){e.options&&m!==(m=t.opt.label)&&h(o,m),e.options&&i!==(i=t.opt.value)&&(n.__value=i),n.value=n.__value,(e.options||e.value)&&l!==(l=t.opt.value===t.value)&&(n.selected=l)},d(e){e&&s(n)}}}function X(e,t){for(var n,r=t.optgroups,i=[],c=0;c<r.length;c+=1)i[c]=K(e,z(t,r,c));return{c(){for(var e=0;e<i.length;e+=1)i[e].c();n=l()},m(e,t){for(var r=0;r<i.length;r+=1)i[r].m(e,t);a(e,n,t)},p(t,a){if(t.optgroups||t.value){r=a.optgroups;for(var s=0;s<r.length;s+=1){const o=z(a,r,s);i[s]?i[s].p(t,o):(i[s]=K(e,o),i[s].c(),i[s].m(n.parentNode,n))}for(;s<i.length;s+=1)i[s].d(1);i.length=r.length}},d(e){o(i,e),e&&s(n)}}}function Z(e,t){var n,o,i,l,m=t.opt.label;return{c(){n=c("option"),o=u(m),n.__value=i=t.opt.value,n.value=n.__value,n.selected=l=t.opt.value===t.value},m(e,t){a(e,n,t),r(n,o)},p(e,t){e.optgroups&&m!==(m=t.opt.label)&&h(o,m),e.optgroups&&i!==(i=t.opt.value)&&(n.__value=i),n.value=n.__value,(e.optgroups||e.value)&&l!==(l=t.opt.value===t.value)&&(n.selected=l)},d(e){e&&s(n)}}}function K(e,t){for(var n,r,i=t.optgroup.options,u=[],l=0;l<i.length;l+=1)u[l]=Z(0,W(t,i,l));return{c(){n=c("optgroup");for(var e=0;e<u.length;e+=1)u[e].c();p(n,"label",r=t.optgroup.label)},m(e,t){a(e,n,t);for(var r=0;r<u.length;r+=1)u[r].m(n,null)},p(e,t){if(e.optgroups||e.value){i=t.optgroup.options;for(var a=0;a<i.length;a+=1){const r=W(t,i,a);u[a]?u[a].p(e,r):(u[a]=Z(0,r),u[a].c(),u[a].m(n,null))}for(;a<u.length;a+=1)u[a].d(1);u.length=i.length}e.optgroups&&r!==(r=t.optgroup.label)&&p(n,"label",r)},d(e){e&&s(n),o(u,e)}}}function Q(e){C(this,e),this._state=t({disabled:!1,width:"auto",options:[],optgroups:[],value:null,class:"",uid:""},e.data),this._intro=!0,this._fragment=function(e,t){var n,o,i,u=!1,p=t.options.length&&J(e,t),h=t.optgroups.length&&X(e,t);function _(){u=!0,e.set({value:g(n)}),u=!1}function b(t){e.fire("change",t)}return{c(){n=c("select"),p&&p.c(),o=l(),h&&h.c(),m(n,"change",_),"value"in t||e.root._beforecreate.push(_),m(n,"change",b),n.className=i="select-css "+t.class+" svelte-v0oq4b",n.disabled=t.disabled,f(n,"width",t.width),n.dataset.uid=t.uid},m(e,s){a(e,n,s),p&&p.m(n,null),r(n,o),h&&h.m(n,null),v(n,t.value)},p(t,r){r.options.length?p?p.p(t,r):((p=J(e,r)).c(),p.m(n,o)):p&&(p.d(1),p=null),r.optgroups.length?h?h.p(t,r):((h=X(e,r)).c(),h.m(n,null)):h&&(h.d(1),h=null),!u&&t.value&&v(n,r.value),t.class&&i!==(i="select-css "+r.class+" svelte-v0oq4b")&&(n.className=i),t.disabled&&(n.disabled=r.disabled),t.width&&f(n,"width",r.width),t.uid&&(n.dataset.uid=r.uid)},d(e){e&&s(n),p&&p.d(),h&&h.d(),d(n,"change",_),d(n,"change",b)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),k(this))}t(F.prototype,A),t(Q.prototype,A);var V={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function a(){}function s(t,n,s){if("undefined"!=typeof document){"number"==typeof(s=e({path:"/"},a.defaults,s)).expires&&(s.expires=new Date(1*new Date+864e5*s.expires)),s.expires=s.expires?s.expires.toUTCString():"";try{var o=JSON.stringify(n);/^[\{\[]/.test(o)&&(n=o)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var i="";for(var c in s)s[c]&&(i+="; "+c,!0!==s[c]&&(i+="="+s[c].split(";")[0]));return document.cookie=t+"="+n+i}}function o(e,n){if("undefined"!=typeof document){for(var a={},s=document.cookie?document.cookie.split("; "):[],o=0;o<s.length;o++){var i=s[o].split("="),c=i.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var u=t(i[0]);if(c=(r.read||r)(c,u)||t(c),n)try{c=JSON.parse(c)}catch(e){}if(a[u]=c,e===u)break}catch(e){}}return e?a[e]:a}}return a.set=s,a.get=function(e){return o(e,!1)},a.getJSON=function(e){return o(e,!0)},a.remove=function(t,n){s(t,"",e(n,{expires:-1}))},a.defaults={},a.withConverter=n,a}((function(){}))},e.exports=n()}(V);var Y=V.exports;const ee=new Set(["get","head","options","trace"]);function te(e,t={}){if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const{payload:n,baseUrl:r,fetch:a,raw:s,...o}={payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include",...t,headers:{"Content-Type":"application/json",...t.headers}},i=`${r.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let c;if(n&&(o.body=JSON.stringify(n)),o.headers["Content-Type"].startsWith("multipart/")&&delete o.headers["Content-Type"],o.disableCSFR||ee.has(o.method.toLowerCase()))c=a(i,o);else{const e=Y.get("crumb");e?(o.headers["X-CSRF-Token"]=e,c=a(i,o)):c=te("/v3/me",{fetch:a,baseUrl:r}).then(()=>{const e=Y.get("crumb");e&&(o.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>a(i,o))}return c.then(e=>{if(s)return e;if(!e.ok)throw new re(e);if(204===e.status||!e.headers.get("content-type"))return e;const t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}function ne(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return te(t,{...n,method:e})}}te.get=ne("GET"),te.patch=ne("PATCH"),te.put=ne("PUT"),te.post=ne("POST"),te.head=ne("HEAD"),te.delete=ne("DELETE");class re extends Error{constructor(e){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e}}var ae={createTeam(e,t){const{user:n}=this.get(),r={name:e};n.isAdmin&&t&&(r.id=String(t).trim().toLowerCase()),this.set({awaitCreateTeam:te("/v3/teams",{method:"post",payload:r}).then(e=>{window.location.href=`/team/${e.id}/settings`})})},leaveTeam(e){const{user:t,teams:n}=this.get();window.confirm(R("account / my-teams / leave-team / confirm","core",{team:e.name}))&&te(`/v3/teams/${e.id}/members/${t.id}`,{method:"delete"}).then(()=>{window.alert(R("account / my-teams / leave-team / done")),n.splice(n.findIndex(t=>t.id===e.id),1),this.set({teams:n})}).catch(e=>{window.alert("There was a problem with your request. Please contact support@datawrapper.de"),console.error(e)})}};function se({changed:e,current:t,previous:n}){if(n&&e.currentTeam&&void 0!==t.currentTeam){te.patch("/v3/me/settings",{payload:{activeTeam:t.currentTeam||null}}).then(()=>this.set({newActiveTeamState:"success"})).catch(()=>this.set({newActiveTeamState:"error"}))}}function oe(e){const{component:t,ctx:n}=this._svelte;t.leaveTeam(n.team)}function ie(e,t,n){const r=Object.create(e);return r.team=t[n],r}function ce(t,n){var r,o=R("account / my-teams / no-teams-yet");return{c(){r=c("p")},m(e,t){a(e,r,t),r.innerHTML=o},p:e,d(e){e&&s(r)}}}function ue(e,t){for(var n,i,l,m,d,p,h,f,v,g,_,b,w,T,y,N,k,x,C,L,S,A,E=R("account / my-teams / your-teams"),H=R("account / my-teams / name"),M=R("account / my-teams / your-role"),O=R("account / my-teams / num-charts"),j=R("account / my-teams / num-members"),$=R("account / my-teams / leave-team"),U=t.user.isAdmin&&le(),P=t.teams,D=[],I=0;I<P.length;I+=1)D[I]=we(e,ie(t,P,I));return{c(){n=c("p"),i=u("\n\n"),l=c("table"),m=c("thead"),d=c("tr"),p=c("th"),h=u(H),f=u("\n            "),U&&U.c(),v=u("\n            "),g=c("th"),_=u(M),b=u("\n            "),w=c("th"),T=u(O),y=u("\n            "),N=c("th"),k=u(j),x=u("\n            "),C=c("th"),L=u($),S=u("\n    "),A=c("tbody");for(var e=0;e<D.length;e+=1)D[e].c();l.className="table"},m(e,t){a(e,n,t),n.innerHTML=E,a(e,i,t),a(e,l,t),r(l,m),r(m,d),r(d,p),r(p,h),r(d,f),U&&U.m(d,null),r(d,v),r(d,g),r(g,_),r(d,b),r(d,w),r(w,T),r(d,y),r(d,N),r(N,k),r(d,x),r(d,C),r(C,L),r(l,S),r(l,A);for(var s=0;s<D.length;s+=1)D[s].m(A,null)},p(t,n){if(n.user.isAdmin?U||((U=le()).c(),U.m(d,v)):U&&(U.d(1),U=null),t.teams||t.currentTeam||t.user){P=n.teams;for(var r=0;r<P.length;r+=1){const a=ie(n,P,r);D[r]?D[r].p(t,a):(D[r]=we(e,a),D[r].c(),D[r].m(A,null))}for(;r<D.length;r+=1)D[r].d(1);D.length=P.length}},d(e){e&&(s(n),s(i),s(l)),U&&U.d(),o(D,e)}}}function le(e,t){var n,o,i=R("account / my-teams / id");return{c(){n=c("th"),o=u(i)},m(e,t){a(e,n,t),r(n,o)},d(e){e&&s(n)}}}function me(e,t){var n,o,i,l=U(t.team.name,20,10);return{c(){n=c("a"),o=u(l),n.href=i="/team/"+t.team.id+"/settings"},m(e,t){a(e,n,t),r(n,o)},p(e,t){e.teams&&l!==(l=U(t.team.name,20,10))&&h(o,l),e.teams&&i!==(i="/team/"+t.team.id+"/settings")&&(n.href=i)},d(e){e&&s(n)}}}function de(e,t){var n,r=U(t.team.name,20,10);return{c(){n=u(r)},m(e,t){a(e,n,t)},p(e,t){e.teams&&r!==(r=U(t.team.name,20,10))&&h(n,r)},d(e){e&&s(n)}}}function pe(e,t){var n;return{c(){(n=c("i")).className="fa fa-check-circle"},m(e,t){a(e,n,t)},d(e){e&&s(n)}}}function he(e,t){var n,o,i=t.team.id;return{c(){n=c("td"),o=u(i),n.className="slug svelte-t3x94h"},m(e,t){a(e,n,t),r(n,o)},p(e,t){e.teams&&i!==(i=t.team.id)&&h(o,i)},d(e){e&&s(n)}}}function fe(e,t){var n,o,i,m,d,p=t.team.members,f=t.team.invites&&ge(e,t);return{c(){n=c("a"),o=u(p),m=u(" "),f&&f.c(),d=l(),n.href=i="/team/"+t.team.id+"/members"},m(e,t){a(e,n,t),r(n,o),a(e,m,t),f&&f.m(e,t),a(e,d,t)},p(t,r){t.teams&&p!==(p=r.team.members)&&h(o,p),t.teams&&i!==(i="/team/"+r.team.id+"/members")&&(n.href=i),r.team.invites?f?f.p(t,r):((f=ge(e,r)).c(),f.m(d.parentNode,d)):f&&(f.d(1),f=null)},d(e){e&&(s(n),s(m)),f&&f.d(e),e&&s(d)}}}function ve(e,t){var n,r=t.team.members;return{c(){n=u(r)},m(e,t){a(e,n,t)},p(e,t){e.teams&&r!==(r=t.team.members)&&h(n,r)},d(e){e&&s(n)}}}function ge(e,t){var n,o,i,l,m=t.team.invites;return{c(){n=c("span"),o=u("(+"),i=u(m),l=u(")"),n.className="invites svelte-t3x94h"},m(e,t){a(e,n,t),r(n,o),r(n,i),r(n,l)},p(e,t){e.teams&&m!==(m=t.team.invites)&&h(i,m)},d(e){e&&s(n)}}}function _e(e,t){var n,o,i,l,m,d=R("account / my-teams / delete-team");return{c(){n=c("a"),o=c("i"),i=u(" "),l=u(d),o.className="fa fa-trash",n.href=m="/team/"+t.team.id+"/delete",n.className="btn btn-small btn-danger"},m(e,t){a(e,n,t),r(n,o),r(n,i),r(n,l)},p(e,t){e.teams&&m!==(m="/team/"+t.team.id+"/delete")&&(n.href=m)},d(e){e&&s(n)}}}function be(e,t){var n,o,i,l,p=R("account / my-teams / leave-team");return{c(){n=c("button"),o=c("i"),i=u(" "),l=u(p),o.className="fa fa-sign-out",n._svelte={component:e,ctx:t},m(n,"click",oe),n.className="btn btn-small"},m(e,t){a(e,n,t),r(n,o),r(n,i),r(n,l)},p(e,r){t=r,n._svelte.ctx=t},d(e){e&&s(n),d(n,"click",oe)}}}function we(e,t){var n,o,i,l,m,d,p,f,v,g,b,w,T,y,N,k=R("teams / role / "+t.team.role),x=t.team.charts;function C(e){return"member"!==e.team.role||e.user.isAdmin?me:de}var L=C(t),S=L(e,t),A=t.team.id===t.currentTeam&&pe(),E=t.user.isAdmin&&he(0,t);function H(e){return"member"===e.team.role?ve:fe}var M=H(t),O=M(e,t);function j(e){return"owner"!==e.team.role?be:_e}var $=j(t),U=$(e,t);return{c(){n=c("tr"),o=c("td"),S.c(),i=u(" "),A&&A.c(),l=u("\n            "),E&&E.c(),m=u("\n            "),d=c("td"),p=u("\n            "),f=c("td"),v=c("a"),g=u(x),w=u("\n            "),T=c("td"),O.c(),y=u("\n\n            "),N=c("td"),U.c(),v.href=b="/team/"+t.team.id,_(n,"current",t.team.id===t.currentTeam)},m(e,t){a(e,n,t),r(n,o),S.m(o,null),r(o,i),A&&A.m(o,null),r(n,l),E&&E.m(n,null),r(n,m),r(n,d),d.innerHTML=k,r(n,p),r(n,f),r(f,v),r(v,g),r(n,w),r(n,T),O.m(T,null),r(n,y),r(n,N),U.m(N,null)},p(t,r){L===(L=C(r))&&S?S.p(t,r):(S.d(1),(S=L(e,r)).c(),S.m(o,i)),r.team.id===r.currentTeam?A||((A=pe()).c(),A.m(o,null)):A&&(A.d(1),A=null),r.user.isAdmin?E?E.p(t,r):((E=he(0,r)).c(),E.m(n,m)):E&&(E.d(1),E=null),t.teams&&k!==(k=R("teams / role / "+r.team.role))&&(d.innerHTML=k),t.teams&&x!==(x=r.team.charts)&&h(g,x),t.teams&&b!==(b="/team/"+r.team.id)&&(v.href=b),M===(M=H(r))&&O?O.p(t,r):(O.d(1),(O=M(e,r)).c(),O.m(T,null)),$===($=j(r))&&U?U.p(t,r):(U.d(1),(U=$(e,r)).c(),U.m(N,null)),(t.teams||t.currentTeam)&&_(n,"current",r.team.id===r.currentTeam)},d(e){e&&s(n),S.d(),A&&A.d(),E&&E.d(),O.d(),U.d()}}}function Te(e,t){var n,o,l,h,f,v,g,_,b,w,T,y,N,k=R("team-create / p"),x=!1,C=R("team-create / button"),L=R("team-create / return");function S(){x=!0,e.set({newTeamName:l.value}),x=!1}var A={label:R("team-create / name"),help:R("team-create / help")},E=new F({root:e.root,store:e.store,slots:{default:i()},data:A}),H=t.user.isAdmin&&Ne(e,t);function M(e){return e.awaitCreateTeam?xe:ke}var O=M(t),j=O(e,t);function $(n){e.createTeam(t.newTeamName,t.newTeamSlug)}function U(t){e.set({createTeam:!1})}return{c(){n=c("p"),o=u("\n\n        "),l=c("input"),E._fragment.c(),f=u("\n        "),H&&H.c(),v=u("\n\n        "),g=c("button"),j.c(),_=u("   "),b=u(C),T=u("\n        "),y=c("button"),N=u(L),m(l,"input",S),p(l,"type","text"),l.placeholder=R("team-create / untitled"),l.maxLength=h=t.user.isAdmin?80:50,m(g,"click",$),g.className="btn btn-primary",g.disabled=w=!t.newTeamName.length,m(y,"click",U),y.className="btn"},m(e,s){a(e,n,s),n.innerHTML=k,a(e,o,s),r(E._slotted.default,l),l.value=t.newTeamName,E._mount(e,s),a(e,f,s),H&&H.m(e,s),a(e,v,s),a(e,g,s),j.m(g,null),r(g,_),r(g,b),a(e,T,s),a(e,y,s),r(y,N)},p(n,r){t=r,!x&&n.newTeamName&&(l.value=t.newTeamName),n.user&&h!==(h=t.user.isAdmin?80:50)&&(l.maxLength=h),t.user.isAdmin?H?H.p(n,t):((H=Ne(e,t)).c(),H.m(v.parentNode,v)):H&&(H.d(1),H=null),O===(O=M(t))&&j?j.p(n,t):(j.d(1),(j=O(e,t)).c(),j.m(g,_)),n.newTeamName&&w!==(w=!t.newTeamName.length)&&(g.disabled=w)},d(e){e&&(s(n),s(o)),d(l,"input",S),E.destroy(e),e&&s(f),H&&H.d(e),e&&(s(v),s(g)),j.d(),d(g,"click",$),e&&(s(T),s(y)),d(y,"click",U)}}}function ye(e,t){var n,o,i,l,p,h,f,v=R("account / my-teams / why-teams"),g=R("account / my-teams / create-btn");function b(t){e.set({createTeam:!0})}return{c(){n=c("div"),o=c("p"),i=u("\n            "),l=c("button"),p=c("i"),h=u(" "),f=c("noscript"),p.className="fa fa-plus fa-fw",m(l,"click",b),l.className="btn btn-large",_(l,"btn-primary",!t.teams.length),n.className="hed svelte-t3x94h"},m(e,t){a(e,n,t),r(n,o),o.innerHTML=v,r(n,i),r(n,l),r(l,p),r(l,h),r(l,f),f.insertAdjacentHTML("afterend",g)},p(e,t){e.teams&&_(l,"btn-primary",!t.teams.length)},d(e){e&&s(n),d(l,"click",b)}}}function Ne(e,t){var n,a=!1;function s(){a=!0,e.set({newTeamSlug:n.value}),a=!1}var o={label:R("team-create / slug"),help:R("team-create / slug-help")},u=new F({root:e.root,store:e.store,slots:{default:i()},data:o});return{c(){n=c("input"),u._fragment.c(),m(n,"input",s),p(n,"type","text"),n.placeholder=t.autoslug},m(e,a){r(u._slotted.default,n),n.value=t.newTeamSlug,u._mount(e,a)},p(e,t){!a&&e.newTeamSlug&&(n.value=t.newTeamSlug),e.autoslug&&(n.placeholder=t.autoslug)},d(e){d(n,"input",s),u.destroy(e)}}}function ke(t,n){var r;return{c(){(r=c("i")).className="fa fa-plus fa-fw"},m(e,t){a(e,r,t)},p:e,d(e){e&&s(r)}}}function xe(e,t){var n,r;let o={component:e,ctx:t,current:null,pending:Se,then:Le,catch:Ce,value:"null",error:"null"};return b(r=t.awaitCreateTeam,o),{c(){n=l(),o.block.c()},m(e,t){a(e,n,t),o.block.m(e,o.anchor=t),o.mount=()=>n.parentNode,o.anchor=n},p(e,n){t=n,o.ctx=t,"awaitCreateTeam"in e&&r!==(r=t.awaitCreateTeam)&&b(r,o)},d(e){e&&s(n),o.block.d(e),o=null}}}function Ce(e,t){var n;return{c(){(n=c("i")).className="fa fa-exclamation-triangle"},m(e,t){a(e,n,t)},d(e){e&&s(n)}}}function Le(e,t){var n;return{c(){(n=c("i")).className="fa fa-check fa-fw"},m(e,t){a(e,n,t)},d(e){e&&s(n)}}}function Se(e,t){var n,r;return{c(){n=u(" "),(r=c("i")).className="fa fa-spinner fa-spin"},m(e,t){a(e,n,t),a(e,r,t)},d(e){e&&(s(n),s(r))}}}function Ae(e,t){var n,o,l,m,d,p,h,f=R("account / my-teams / select-active"),v=R("account / my-teams / what-is-active"),g={},_={width:"250px",options:t.teamOptions};void 0!==t.currentTeam&&(_.value=t.currentTeam,g.value=!0);var b=new Q({root:e.root,store:e.store,data:_,_bind(t,n){var r={};!g.value&&t.value&&(r.currentTeam=n.value),e._set(r),g={}}});function w(e){return"success"===e.newActiveTeamState?He:"error"===e.newActiveTeamState?Ee:void 0}e.root._beforecreate.push(()=>{b._bind({value:1},b.get())});var T=w(t),y=T&&T(e,t),N={width:"350px",help:R("account / my-teams / active-hint")},k=new F({root:e.root,store:e.store,slots:{default:i()},data:N});return{c(){n=c("div"),o=c("h3"),l=u("\n        "),m=c("p"),d=u("\n        "),p=c("div"),b._fragment.c(),h=u("\n                "),y&&y.c(),k._fragment.c(),o.className="svelte-t3x94h",p.className="flex",n.className="span5"},m(e,t){a(e,n,t),r(n,o),o.innerHTML=f,r(n,l),r(n,m),m.innerHTML=v,r(n,d),r(k._slotted.default,p),b._mount(p,null),r(p,h),y&&y.m(p,null),k._mount(n,null)},p(n,r){t=r;var a={};n.teamOptions&&(a.options=t.teamOptions),!g.value&&n.currentTeam&&(a.value=t.currentTeam,g.value=void 0!==t.currentTeam),b._set(a),g={},T!==(T=w(t))&&(y&&y.d(1),(y=T&&T(e,t))&&y.c(),y&&y.m(p,null))},d(e){e&&s(n),b.destroy(),y&&y.d(),k.destroy()}}}function Ee(e,t){var n;return{c(){(n=c("i")).className="fa fa-exclamation-triangle"},m(e,t){a(e,n,t)},d(e){e&&s(n)}}}function He(e,t){var n;return{c(){(n=c("i")).className="fa fa-check fa-fw"},m(e,t){a(e,n,t)},d(e){e&&s(n)}}}function Me(e){C(this,e),this._state=t({teams:[],awaitCreateTeam:null,currentTeam:"",createTeam:!1,newTeamName:"",newTeamSlug:"",newActiveTeamState:null},e.data),this._recompute({teams:1,newTeamName:1},this._state),this._intro=!0,this._handlers.state=[se],se.call(this,{changed:n({},this._state),current:this._state}),this._fragment=function(e,t){var n,o,i,l,m,d,p=R("account / my-teams / create");function h(e){return e.teams.length?ue:ce}var f=h(t),v=f(e,t);function g(e){return e.createTeam?Te:ye}var _=g(t),b=_(e,t),w=t.teams.length>0&&Ae(e,t);return{c(){v.c(),n=u("\n\n"),o=c("div"),i=c("div"),l=c("h3"),m=u("\n        "),b.c(),d=u("\n    "),w&&w.c(),l.className="svelte-t3x94h",i.className="span5",o.className="row"},m(e,t){v.m(e,t),a(e,n,t),a(e,o,t),r(o,i),r(i,l),l.innerHTML=p,r(i,m),b.m(i,null),r(o,d),w&&w.m(o,null)},p(t,r){f===(f=h(r))&&v?v.p(t,r):(v.d(1),(v=f(e,r)).c(),v.m(n.parentNode,n)),_===(_=g(r))&&b?b.p(t,r):(b.d(1),(b=_(e,r)).c(),b.m(i,null)),r.teams.length>0?w?w.p(t,r):((w=Ae(e,r)).c(),w.m(o,null)):w&&(w.d(1),w=null)},d(e){v.d(e),e&&(s(n),s(o)),b.d(),w&&w.d()}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:n({},this._state),current:this._state})}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),k(this))}function Oe(e,n){this._handlers={},this._dependents=[],this._computed=w(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=n&&n.immutable?y:T}t(Me.prototype,A),t(Me.prototype,ae),Me.prototype._recompute=function(e,t){e.teams&&this._differs(t.teamOptions,t.teamOptions=function({teams:e}){return e.map(({id:e,name:t})=>({value:e,label:t})).concat({value:null,label:R("nav / no-team")})}(t))&&(e.teamOptions=!0),e.newTeamName&&this._differs(t.autoslug,t.autoslug=function({newTeamName:e}){return e.toLowerCase().replace(/\W/g,"")}(t))&&(e.autoslug=!0)},t(Oe.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let n=0;n<e.length;n+=1){const r=e[n];t["$"+r]=this._state[r]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,n){const r=this._state;this._state=t(t({},r),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,n);this.fire("state",{changed:n,previous:r,current:this._state}),this._dependents.filter(e=>{const t={};let r=!1;for(let a=0;a<e.props.length;a+=1){const s=e.props[a];s in n&&(t["$"+s]=this._state[s],r=!0)}if(r)return e.component._stage(t),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:n,previous:r,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],n=w();let r;function a(s){const o=e[s];o&&(o.deps.forEach(e=>{if(e===r)throw new Error(`Cyclical dependency detected between ${e} <-> ${s}`);a(e)}),n[s]||(n[s]=!0,t.push(o)))}for(const e in this._computed)a(r=e)},compute(e,n,r){let a;const s={deps:n,update:(t,s,o)=>{const i=n.map(e=>(e in s&&(o=!0),t[e]));if(o){const n=r.apply(null,i);this._differs(n,a)&&(a=n,s[e]=!0,t[e]=a)}}};this._computed[e]=s,this._sortComputedProperties();const o=t({},this._state),i={};s.update(o,i,!0),this._set(o,i)},fire:N,get:x,on:L,set(e){const t=this._state,n=this._changed={};let r=!1;for(const a in e){if(this._computed[a])throw new Error(`'${a}' is a read-only computed property`);this._differs(e[a],t[a])&&(n[a]=r=!0)}r&&this._set(e,n)}});return{App:Me,data:{chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},store:new Oe({})}}));
//# sourceMappingURL=myteams.js.map
