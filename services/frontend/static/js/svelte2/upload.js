!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("../../../../../../../../../../static/vendor/jschardet/jschardet.min.js"),require("../../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js")):"function"==typeof define&&define.amd?define("svelte/upload",["../../../../../../../../../../static/vendor/jschardet/jschardet.min","../../../../../../../../../../static/vendor/xlsx/xlsx.full.min"],e):(t="undefined"!=typeof globalThis?globalThis:t||self).upload=e(t.jschardet)}(this,(function(t){"use strict";function e(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var a=e(t);function r(){}function s(t,e){for(var a in e)t[a]=e[a];return t}function n(t,e){for(var a in e)t[a]=1;return t}function o(t,e){t.appendChild(e)}function i(t,e,a){t.insertBefore(e,a)}function c(t){t.parentNode.removeChild(t)}function l(t,e){for(var a=0;a<t.length;a+=1)t[a]&&t[a].d(e)}function d(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function u(t,e,a,r){t.addEventListener(e,a,r)}function f(t,e,a,r){t.removeEventListener(e,a,r)}function p(t,e,a){null==a?t.removeAttribute(e):t.setAttribute(e,a)}function v(t,e){t.data=""+e}function _(t,e){for(var a=0;a<t.options.length;a+=1){var r=t.options[a];if(r.__value===e)return void(r.selected=!0)}}function g(t){var e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function m(t,e,a){t.classList[a?"add":"remove"](e)}function y(){return Object.create(null)}function b(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function D(t,e){return t!=t?e==e:t!==e}function w(t,e){var a=t in this._handlers&&this._handlers[t].slice();if(a)for(var r=0;r<a.length;r+=1){var s=a[r];if(!s.__calling)try{s.__calling=!0,s.call(this,e)}finally{s.__calling=!1}}}function x(t){t._lock=!0,S(t._beforecreate),S(t._oncreate),S(t._aftercreate),t._lock=!1}function N(){return this._state}function A(t,e){t._handlers=y(),t._slots=y(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function T(t,e){var a=this._handlers[t]||(this._handlers[t]=[]);return a.push(e),{cancel:function(){var t=a.indexOf(e);~t&&a.splice(t,1)}}}function S(t){for(;t&&t.length;)t.shift()()}var k={destroy:function(t){this.destroy=r,this.fire("destroy"),this.set=r,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:N,fire:w,on:T,set:function(t){this._set(s({},t)),this.root._lock||x(this.root)},_recompute:r,_set:function(t){var e=this._state,a={},r=!1;for(var n in t=s(this._staged,t),this._staged={},t)this._differs(t[n],e[n])&&(a[n]=r=!0);r&&(this._state=s(s({},e),t),this._recompute(a,this._state),this._bind&&this._bind(a,this._state),this._fragment&&(this.fire("state",{changed:a,current:this._state,previous:e}),this._fragment.p(a,this._state),this.fire("update",{changed:a,current:this._state,previous:e})))},_stage:function(t){s(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:b};const j=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,L=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function C(t,e){if(null===t)return null;if(void 0!==t){if((t=String(t)).indexOf("<")<0&&t.indexOf(">")<0)return t;if(t=M(t,e),"undefined"==typeof document)return t;var a=document.createElement("div");a.innerHTML=`<span>${t}</span>`,a.innerHTML=M(a.innerHTML,e&&!e.includes("<span>")?e+"<span>":e||void 0);for(var r=a.childNodes[0].querySelectorAll("*"),s=0;s<r.length;s++){if("a"===r[s].nodeName.toLowerCase()){"_self"!==r[s].getAttribute("target")&&r[s].setAttribute("target","_blank"),r[s].setAttribute("rel","nofollow noopener noreferrer");const t=(r[s].getAttribute("href")||"").toLowerCase().replace(/[^a-z0-9 -/:?=]/g,"").trim();(t.startsWith("javascript:")||t.startsWith("vbscript:")||t.startsWith("data:"))&&r[s].setAttribute("href","")}const t=[];for(var n=0;n<r[s].attributes.length;n++){var o=r[s].attributes[n];o.specified&&"on"===o.name.substr(0,2)&&t.push(o.name)}t.forEach(t=>r[s].removeAttribute(t))}return a.childNodes[0].innerHTML}}function M(t,e){e=(((void 0!==e?e||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");for(var a=t,r=t;;)if(r=(a=r).replace(L,"").replace(j,(function(t,a){return e.indexOf("<"+a.toLowerCase()+">")>-1?t:""})),a===r)return r}const P={};function F(t,e="core",a,...r){let s=function(t,e,a){try{return a[e][t]||t}catch(e){return t}}(t,e,a);return s="string"==typeof r[0]?function(t,e=[]){return t.replace(/\$(\d)/g,(t,a)=>void 0===e[+a]?t:C(e[+a],""))}(s,r):function(t,e={}){return Object.entries(e).forEach(([e,a])=>{t=t.replace(new RegExp(`%${e}%|%${e}(?!\\w)`,"g"),a)}),t}(s,r[0]),C(s,"<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br><a><em><i><strong><b><code><img><table><tr><th><td><small><span><div><sup><sub><tt>")}function O(t,e="core",...a){return t=t.trim(),P[e]||function(t="core"){"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(P[t]=window.__dw.vis.meta.locale||{}):P[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}(e),P[e][t]?F(t,e,P,...a):"MISSING:"+t}function E(t){A(this,t),this._state=s({placeholder:O("upload / paste here")},t.data),this._intro=!0,this._fragment=function(t,e){var a,r,s,n=!1;function l(){n=!0,t.set({chartData:s.value}),n=!1}return{c(){var t,n;a=d("form"),r=d("div"),u(s=d("textarea"),"input",l),s.readOnly=e.readonly,s.id="upload-data-text",t="resize",n="none",s.style.setProperty(t,n),s.placeholder=e.placeholder,s.className="svelte-kl1kny",r.className="control-group",a.className="upload-form"},m(t,n){i(t,a,n),o(a,r),o(r,s),s.value=e.chartData},p(t,e){!n&&t.chartData&&(s.value=e.chartData),t.readonly&&(s.readOnly=e.readonly),t.placeholder&&(s.placeholder=e.placeholder)},d(t){t&&c(a),f(s,"input",l)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function H({changed:t,current:e}){if(t.selectedDataset&&"--"!==e.selectedDataset){const t=e.selectedDataset;setTimeout(()=>{this.set({chartData:t.data})},100),t.presets&&Object.keys(t.presets).forEach(e=>{this.store.get().dw_chart.set(e,t.presets[e])})}}function R(t,e,a){const r=Object.create(t);return r.dataset=e[a],r}function U(t,e,a){const r=Object.create(t);return r.group=e[a],r}function $(t,e){var a,r,s,n=e.dataset.title;return{c(){a=d("option"),r=h(n),a.__value=s=e.dataset,a.value=a.__value,a.className="demo-dataset"},m(t,e){i(t,a,e),o(a,r)},p(t,e){t.datasetsArray&&n!==(n=e.dataset.title)&&v(r,n),t.datasetsArray&&s!==(s=e.dataset)&&(a.__value=s),a.value=a.__value},d(t){t&&c(a)}}}function q(t,e){for(var a,r,s=e.group.datasets,n=[],o=0;o<s.length;o+=1)n[o]=$(0,R(e,s,o));return{c(){a=d("optgroup");for(var t=0;t<n.length;t+=1)n[t].c();p(a,"label",r=e.group.type)},m(t,e){i(t,a,e);for(var r=0;r<n.length;r+=1)n[r].m(a,null)},p(t,e){if(t.datasetsArray){s=e.group.datasets;for(var o=0;o<s.length;o+=1){const r=R(e,s,o);n[o]?n[o].p(t,r):(n[o]=$(0,r),n[o].c(),n[o].m(a,null))}for(;o<n.length;o+=1)n[o].d(1);n.length=s.length}t.datasetsArray&&r!==(r=e.group.type)&&p(a,"label",r)},d(t){t&&c(a),l(n,t)}}}function z(t){A(this,t),this._state=s({selectedDataset:"--"},t.data),this._recompute({datasets:1},this._state),this._intro=!0,this._handlers.update=[H],this._fragment=function(t,e){for(var a,r,s,n,p,v,m,y,b,D,w=O("upload / quick help"),x=O("upload / try a dataset"),N=O("upload / sample dataset"),A=!1,T=e.datasetsArray,S=[],k=0;k<T.length;k+=1)S[k]=q(t,U(e,T,k));function j(){A=!0,t.set({selectedDataset:g(y)}),A=!1}return{c(){a=d("p"),r=h(w),s=h("\n\n"),n=d("div"),p=d("p"),v=h(x),m=h("\n    "),y=d("select"),b=d("option"),D=h(N);for(var o=0;o<S.length;o+=1)S[o].c();b.__value="--",b.value=b.__value,u(y,"change",j),"selectedDataset"in e||t.root._beforecreate.push(j),y.disabled=e.readonly,y.id="demo-datasets",y.className="svelte-16u58l0",n.className="demo-datasets"},m(t,c){i(t,a,c),o(a,r),i(t,s,c),i(t,n,c),o(n,p),o(p,v),o(n,m),o(n,y),o(y,b),o(b,D);for(var l=0;l<S.length;l+=1)S[l].m(y,null);_(y,e.selectedDataset)},p(e,a){if(e.datasetsArray){T=a.datasetsArray;for(var r=0;r<T.length;r+=1){const s=U(a,T,r);S[r]?S[r].p(e,s):(S[r]=q(t,s),S[r].c(),S[r].m(y,null))}for(;r<S.length;r+=1)S[r].d(1);S.length=T.length}!A&&e.selectedDataset&&_(y,a.selectedDataset),e.readonly&&(y.disabled=a.readonly)},d(t){t&&(c(a),c(s),c(n)),l(S,t),f(y,"change",j)}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:n({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function B({changed:t,current:e}){t.sheets&&e.sheets.length>1?setTimeout(()=>{this.set({selected:e.sheets[0]})},300):t.sheets&&1===e.sheets.length&&(this.set({chartData:e.sheets[0].csv}),this.store.get().dw_chart.onNextSave(()=>{window.location.href="describe"})),t.selected&&e.selected.csv&&this.set({chartData:e.selected.csv})}function I(t,e,a){const r=Object.create(t);return r.sheet=e[a],r}function W(t,e){var a,s,n=O("edit / upload / success-import");return{c(){a=d("p"),s=h(n)},m(t,e){i(t,a,e),o(a,s)},p:r,d(t){t&&c(a)}}}function X(t,e){for(var a,r,s,n,p,v=O("upload / select sheet"),m=!1,y=e.sheets,b=[],D=0;D<y.length;D+=1)b[D]=J(t,I(e,y,D));function w(){m=!0,t.set({selected:g(n)}),m=!1}return{c(){a=d("p"),r=h(v),s=h("\n    "),n=d("select");for(var o=0;o<b.length;o+=1)b[o].c();u(n,"change",w),"selected"in e||t.root._beforecreate.push(w),n.disabled=p=!e.sheets.length,n.className="svelte-16u58l0"},m(t,c){i(t,a,c),o(a,r),i(t,s,c),i(t,n,c);for(var l=0;l<b.length;l+=1)b[l].m(n,null);_(n,e.selected)},p(e,a){if(e.sheets){y=a.sheets;for(var r=0;r<y.length;r+=1){const s=I(a,y,r);b[r]?b[r].p(e,s):(b[r]=J(t,s),b[r].c(),b[r].m(n,null))}for(;r<b.length;r+=1)b[r].d(1);b.length=y.length}!m&&e.selected&&_(n,a.selected),e.sheets&&p!==(p=!a.sheets.length)&&(n.disabled=p)},d(t){t&&(c(a),c(s),c(n)),l(b,t),f(n,"change",w)}}}function G(t,e){var a,s=O("upload / parsing-xls");return{c(){(a=d("div")).className="alert alert-info"},m(t,e){i(t,a,e),a.innerHTML=s},p:r,d(t){t&&c(a)}}}function J(t,e){var a,r,s,n=e.sheet.name;return{c(){a=d("option"),r=h(n),a.__value=s=e.sheet,a.value=a.__value},m(t,e){i(t,a,e),o(a,r)},p(t,e){t.sheets&&n!==(n=e.sheet.name)&&v(r,n),t.sheets&&s!==(s=e.sheet)&&(a.__value=s),a.value=a.__value},d(t){t&&c(a)}}}function K(t){A(this,t),this._state=s({selected:!1,chartData:"",sheets:[]},t.data),this._intro=!0,this._handlers.update=[B],this._fragment=function(t,e){var a;function r(t){return t.sheets.length?t.sheets.length>1?X:W:G}var s=r(e),n=s(t,e);return{c(){a=d("div"),n.c()},m(t,e){i(t,a,e),n.m(a,null)},p(e,o){s===(s=r(o))&&n?n.p(e,o):(n.d(1),(n=s(t,o)).c(),n.m(a,null))},d(t){t&&c(a),n.d()}}}(this,this._state),this.root._oncreate.push(()=>{this.fire("update",{changed:n({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function Q(t,e){var r=new FileReader;r.onload=function(){try{var s=new Uint8Array(r.result),n="";let i=0;for(var o=0;o<s.length;++o)s[o]>122&&i++,n+=String.fromCharCode(s[o]);let c=a.default.detect(n);c.confidence<=.95&&i<10&&(c.encoding="utf-8"),(r=new FileReader).onload=()=>e(null,r.result),r.readAsText(t,c.encoding)}catch(t){console.warn(t),e(null,r.result)}},r.readAsArrayBuffer(t)}let V;s(E.prototype,k),s(z.prototype,k),z.prototype._recompute=function(t,e){t.datasets&&this._differs(e.datasetsArray,e.datasetsArray=function({datasets:t}){return Object.keys(t).map(e=>t[e])}(e))&&(t.datasetsArray=!0)},s(K.prototype,k);const Y=[{id:"copy",title:O("upload / copy-paste"),longTitle:O("upload / copy-paste / long"),icon:"fa fa-clipboard",mainPanel:E,sidebar:z,action(){}},{id:"upload",title:O("upload / upload-csv"),longTitle:O("upload / upload-csv / long"),icon:"fa-file-excel-o fa",mainPanel:E,sidebar:z,isFileUpload:!0,async onFileUpload(t){const e=t.target.files[0];"text/"===e.type.substr(0,5)||".csv"===e.name.substr(e.name.length-4)?(V.set({Sidebar:z}),Q(e,async(t,e)=>{if(t)return console.error("could not read file",t);V.set({chartData:e})})):"application/"===e.type.substr(0,12)?(V.set({Sidebar:K,sheets:[]}),function(t,e){const a="undefined"!=typeof FileReader&&(FileReader.prototype||{}).readAsBinaryString,r=new FileReader;r.onload=function(){try{const t=a?r.result:new Uint8Array(r.result),s=XLSX.read(t,{type:a?"binary":"array"});e(null,s.SheetNames.map(t=>({name:t,sheet:s.Sheets[t],csv:XLSX.utils.sheet_to_csv(s.Sheets[t])})))}catch(t){console.error(t),e(null,r.result)}},r.readAsBinaryString(t)}(e,(t,e)=>{if(t)return V.set({error:t});V.set({sheets:e})})):(console.error(e.type),console.error(e),V.set({error:O("upload / csv-required")}))},action(){}}];var Z={addButton(t){Y.push(t),this.set({buttons:Y});const{defaultMethod:e}=this.get();t.id===e&&this.btnAction(t)},btnAction(t){if(this.set({active:t}),"external-data"!==t.id){const{dw_chart:t}=this.store.get();t.get("externalData")&&t.set("externalData","")}let e=t.id;"upload"===t.id&&(e="copy",setTimeout(()=>{},1e3));const{dw_chart:a}=this.store.get();a.set("metadata.data.upload-method",e),t.action&&t.action(),t.mainPanel&&this.set({MainPanel:t.mainPanel}),t.sidebar&&this.set({Sidebar:t.sidebar})},btnUpload(t,e){const{dw_chart:a}=this.store.get();t.onFileUpload&&t.onFileUpload(e,a)},dragStart(t){const{active:e}=this.get();(function(t){if(!t.dataTransfer)return!!t.target&&!!t.target.files;return Array.prototype.some.call(t.dataTransfer.types,t=>"Files"===t||"application/x-moz-file"===t)&&Array.prototype.some.call(t.dataTransfer.items,t=>"file"===t.kind&&t.type.startsWith("text/"))})(t)&&"copy"===e.id&&(t.preventDefault(),this.set({dragover:!0}))},resetDrag(){this.set({dragover:!1})},onFileDrop(t){const{active:e}=this.get(),{dw_chart:a}=this.store.get();if("copy"!==e.id)return;this.resetDrag(),t.preventDefault();const r=[];if(t.dataTransfer.items){for(let e=0;e<t.dataTransfer.items.length;e++)"file"===t.dataTransfer.items[e].kind&&r.push(t.dataTransfer.items[e].getAsFile());t.dataTransfer.items.clear()}else{for(let e=0;e<t.dataTransfer.files.length;e++)r.push(t.dataTransfer.files[e]);t.dataTransfer.items.clear()}for(let t=0;t<r.length;t++)if("text/"===r[t].type.substr(0,5))return Q(r[t],async(t,e)=>{if(t)return console.error("could not read file",t);this.set({chartData:e}),a.onNextSave(()=>{window.location.href="describe"})})}};function tt(){V=this;const{dw_chart:t}=this.store.get(),e=t.get("metadata.data.upload-method","copy");this.set({defaultMethod:e}),Y.forEach(t=>{t.id===e&&this.set({active:t})})}function et({changed:t,current:e}){t.chartData&&this.fire("change",e.chartData)}function at(t){const{component:e,ctx:a}=this._svelte;e.btnAction(a.btn)}function rt(t){const{component:e,ctx:a}=this._svelte;e.btnUpload(a.btn,t)}function st(t,e,a){const r=Object.create(t);return r.btn=e[a],r}function nt(t,e){var a,r=O("upload / drag-csv-here");return{c(){(a=d("div")).className="draginfo svelte-p5uh6u"},m(t,e){i(t,a,e),a.innerHTML=r},d(t){t&&c(a)}}}function ot(t,e){var a;return{c(){(a=d("input"))._svelte={component:t,ctx:e},u(a,"change",rt),a.accept=".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf",a.className="file-upload svelte-p5uh6u",p(a,"type","file")},m(t,e){i(t,a,e)},p(t,r){e=r,a._svelte.ctx=e},d(t){t&&c(a),f(a,"change",rt)}}}function it(t,e){var a,r,s,n,l,p,_,g,m,y=e.btn.title,b=e.btn.isFileUpload&&ot(t,e);return{c(){a=d("li"),r=d("label"),b&&b.c(),s=h("\n                            "),n=d("i"),p=h("\n                            "),_=d("span"),g=h(y),n.className=l=e.btn.icon+" svelte-p5uh6u",_.className="svelte-p5uh6u",r.className="svelte-p5uh6u",a._svelte={component:t,ctx:e},u(a,"click",at),a.className=m="action "+(e.active==e.btn?"active":"")+" svelte-p5uh6u"},m(t,e){i(t,a,e),o(a,r),b&&b.m(r,null),o(r,s),o(r,n),o(r,p),o(r,_),o(_,g)},p(o,i){(e=i).btn.isFileUpload?b?b.p(o,e):((b=ot(t,e)).c(),b.m(r,s)):b&&(b.d(1),b=null),o.buttons&&l!==(l=e.btn.icon+" svelte-p5uh6u")&&(n.className=l),o.buttons&&y!==(y=e.btn.title)&&v(g,y),a._svelte.ctx=e,(o.active||o.buttons)&&m!==(m="action "+(e.active==e.btn?"active":"")+" svelte-p5uh6u")&&(a.className=m)},d(t){t&&c(a),b&&b.d(),f(a,"click",at)}}}function ct(t,e){var a,r,s,n;function l(e){t.set({error:!1})}return{c(){a=d("div"),(r=d("div")).textContent="✕",s=h("\n                    "),n=d("noscript"),u(r,"click",l),r.className="action close",a.className="alert alert-error"},m(t,c){i(t,a,c),o(a,r),o(a,s),o(a,n),n.insertAdjacentHTML("afterend",e.error)},p(t,e){t.error&&(!function(t){for(;t.nextSibling;)t.parentNode.removeChild(t.nextSibling)}(n),n.insertAdjacentHTML("afterend",e.error))},d(t){t&&c(a),f(r,"click",l)}}}function lt(t){A(this,t),this._state=s({dragover:!1,MainPanel:E,Sidebar:z,active:Y[0],buttons:Y,sheets:[],chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},t.data),this._intro=!0,this._handlers.state=[et],et.call(this,{changed:n({},this._state),current:this._state}),this._fragment=function(t,e){for(var a,r,s,n,p,_,g,y,b,D,w,x,N,A,T,S,k,j,L,C,M,P,F=O("upload / title"),E=e.active.longTitle||e.active.title,H={},R={},U=O("Proceed"),$=e.dragover&&nt(),q=e.buttons,z=[],B=0;B<q.length;B+=1)z[B]=it(t,st(e,q,B));var I=e.error&&ct(t,e),W=e.Sidebar;function X(e){var a={};return void 0!==e.chartData&&(a.chartData=e.chartData,H.chartData=!0),void 0!==e.readonly&&(a.readonly=e.readonly,H.readonly=!0),void 0!==e.sheets&&(a.sheets=e.sheets,H.sheets=!0),void 0!==e.datasets&&(a.datasets=e.datasets,H.datasets=!0),{root:t.root,store:t.store,data:a,_bind(e,a){var r={};!H.chartData&&e.chartData&&(r.chartData=a.chartData),!H.readonly&&e.readonly&&(r.readonly=a.readonly),!H.sheets&&e.sheets&&(r.sheets=a.sheets),!H.datasets&&e.datasets&&(r.datasets=a.datasets),t._set(r),H={}}}}if(W){var G=new W(X(e));t.root._beforecreate.push(()=>{G._bind({chartData:1,readonly:1,sheets:1,datasets:1},G.get())})}var J=e.MainPanel;function K(e){var a={};return void 0!==e.chartData&&(a.chartData=e.chartData,R.chartData=!0),void 0!==e.readonly&&(a.readonly=e.readonly,R.readonly=!0),{root:t.root,store:t.store,data:a,_bind(e,a){var r={};!R.chartData&&e.chartData&&(r.chartData=a.chartData),!R.readonly&&e.readonly&&(r.readonly=a.readonly),t._set(r),R={}}}}if(J){var Q=new J(K(e));t.root._beforecreate.push(()=>{Q._bind({chartData:1,readonly:1},Q.get())})}function V(e){t.onFileDrop(e)}function Y(e){t.dragStart(e)}function Z(e){t.dragStart(e)}function tt(e){t.resetDrag()}function et(e){t.resetDrag()}return{c(){a=d("div"),$&&$.c(),r=h("\n\n    \n    "),s=d("div"),n=d("div"),p=d("div"),_=d("h3"),g=h("\n\n                "),y=d("ul");for(var t=0;t<z.length;t+=1)z[t].c();b=h("\n\n                "),I&&I.c(),D=h("\n\n                "),w=d("h4"),x=h(E),N=h("\n\n                "),G&&G._fragment.c(),A=h("\n        "),T=d("div"),Q&&Q._fragment.c(),S=h("\n\n            "),k=d("div"),j=d("a"),L=h(U),C=h(" "),M=d("i"),y.className="import-methods svelte-p5uh6u",m(y,"readonly",e.readonly),w.className="svelte-p5uh6u",p.className="sidebar",n.className="column is-5",M.className="icon-chevron-right icon-white",j.href="describe",j.className="submit btn btn-primary svelte-p5uh6u",j.id="describe-proceed",k.className="buttons pull-right",T.className="column",s.className="columns is-variable is-5 is-8-widescreen",s.style.cssText=P=e.dragover?"opacity: 0.5;filter:blur(6px);background:white;pointer-events:none":"",u(a,"drop",V),u(a,"dragover",Y),u(a,"dragenter",Z),u(a,"dragend",tt),u(a,"dragleave",et),a.className="chart-editor dw-create-upload upload-data"},m(t,e){i(t,a,e),$&&$.m(a,null),o(a,r),o(a,s),o(s,n),o(n,p),o(p,_),_.innerHTML=F,o(p,g),o(p,y);for(var c=0;c<z.length;c+=1)z[c].m(y,null);o(p,b),I&&I.m(p,null),o(p,D),o(p,w),o(w,x),o(p,N),G&&G._mount(p,null),o(s,A),o(s,T),Q&&Q._mount(T,null),o(T,S),o(T,k),o(k,j),o(j,L),o(j,C),o(j,M)},p(n,o){if((e=o).dragover?$||(($=nt()).c(),$.m(a,r)):$&&($.d(1),$=null),n.active||n.buttons){q=e.buttons;for(var i=0;i<q.length;i+=1){const a=st(e,q,i);z[i]?z[i].p(n,a):(z[i]=it(t,a),z[i].c(),z[i].m(y,null))}for(;i<z.length;i+=1)z[i].d(1);z.length=q.length}n.readonly&&m(y,"readonly",e.readonly),e.error?I?I.p(n,e):((I=ct(t,e)).c(),I.m(p,D)):I&&(I.d(1),I=null),n.active&&E!==(E=e.active.longTitle||e.active.title)&&v(x,E);var c={};!H.chartData&&n.chartData&&(c.chartData=e.chartData,H.chartData=void 0!==e.chartData),!H.readonly&&n.readonly&&(c.readonly=e.readonly,H.readonly=void 0!==e.readonly),!H.sheets&&n.sheets&&(c.sheets=e.sheets,H.sheets=void 0!==e.sheets),!H.datasets&&n.datasets&&(c.datasets=e.datasets,H.datasets=void 0!==e.datasets),W!==(W=e.Sidebar)?(G&&G.destroy(),W?(G=new W(X(e)),t.root._beforecreate.push(()=>{const t={};void 0===e.chartData&&(t.chartData=1),void 0===e.readonly&&(t.readonly=1),void 0===e.sheets&&(t.sheets=1),void 0===e.datasets&&(t.datasets=1),G._bind(t,G.get())}),G._fragment.c(),G._mount(p,null)):G=null):W&&(G._set(c),H={});var l={};!R.chartData&&n.chartData&&(l.chartData=e.chartData,R.chartData=void 0!==e.chartData),!R.readonly&&n.readonly&&(l.readonly=e.readonly,R.readonly=void 0!==e.readonly),J!==(J=e.MainPanel)?(Q&&Q.destroy(),J?(Q=new J(K(e)),t.root._beforecreate.push(()=>{const t={};void 0===e.chartData&&(t.chartData=1),void 0===e.readonly&&(t.readonly=1),Q._bind(t,Q.get())}),Q._fragment.c(),Q._mount(T,S)):Q=null):J&&(Q._set(l),R={}),n.dragover&&P!==(P=e.dragover?"opacity: 0.5;filter:blur(6px);background:white;pointer-events:none":"")&&(s.style.cssText=P)},d(t){t&&c(a),$&&$.d(),l(z,t),I&&I.d(),G&&G.destroy(),Q&&Q.destroy(),f(a,"drop",V),f(a,"dragover",Y),f(a,"dragenter",Z),f(a,"dragend",tt),f(a,"dragleave",et)}}}(this,this._state),this.root._oncreate.push(()=>{tt.call(this),this.fire("update",{changed:n({},this._state),current:this._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function dt(t,e){this._handlers={},this._dependents=[],this._computed=y(),this._sortedComputedProperties=[],this._state=s({},t),this._differs=e&&e.immutable?D:b}s(lt.prototype,k),s(lt.prototype,Z),s(dt.prototype,{_add(t,e){this._dependents.push({component:t,props:e})},_init(t){const e={};for(let a=0;a<t.length;a+=1){const r=t[a];e["$"+r]=this._state[r]}return e},_remove(t){let e=this._dependents.length;for(;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set(t,e){const a=this._state;this._state=s(s({},a),t);for(let t=0;t<this._sortedComputedProperties.length;t+=1)this._sortedComputedProperties[t].update(this._state,e);this.fire("state",{changed:e,previous:a,current:this._state}),this._dependents.filter(t=>{const a={};let r=!1;for(let s=0;s<t.props.length;s+=1){const n=t.props[s];n in e&&(a["$"+n]=this._state[n],r=!0)}if(r)return t.component._stage(a),!0}).forEach(t=>{t.component.set({})}),this.fire("update",{changed:e,previous:a,current:this._state})},_sortComputedProperties(){const t=this._computed,e=this._sortedComputedProperties=[],a=y();let r;function s(n){const o=t[n];o&&(o.deps.forEach(t=>{if(t===r)throw new Error(`Cyclical dependency detected between ${t} <-> ${n}`);s(t)}),a[n]||(a[n]=!0,e.push(o)))}for(const t in this._computed)s(r=t)},compute(t,e,a){let r;const n={deps:e,update:(s,n,o)=>{const i=e.map(t=>(t in n&&(o=!0),s[t]));if(o){const e=a.apply(null,i);this._differs(e,r)&&(r=e,n[t]=!0,s[t]=r)}}};this._computed[t]=n,this._sortComputedProperties();const o=s({},this._state),i={};n.update(o,i,!0),this._set(o,i)},fire:w,get:N,on:T,set(t){const e=this._state,a=this._changed={};let r=!1;for(const s in t){if(this._computed[s])throw new Error(`'${s}' is a read-only computed property`);this._differs(t[s],e[s])&&(a[s]=r=!0)}r&&this._set(t,a)}});return{App:lt,data:{chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},store:new dt({})}}));
