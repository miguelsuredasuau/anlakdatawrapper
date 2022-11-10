!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("@datawrapper/controls/SwitchControl.html"),require("@datawrapper/controls/CheckboxControl.html")):"function"==typeof define&&define.amd?define("svelte/team-settings/delete",["@datawrapper/controls/SwitchControl.html","@datawrapper/controls/CheckboxControl.html"],t):(e="undefined"!=typeof globalThis?globalThis:e||self)["team-settings/delete"]=t(e.SwitchControl,e.CheckboxControl)}(this,(function(e,t){"use strict";function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var r=n(e),o=n(t);function i(){}function a(e,t){for(var n in t)e[n]=t[n];return e}function s(e,t){e.appendChild(t)}function l(e,t,n){e.insertBefore(t,n)}function c(e){e.parentNode.removeChild(e)}function u(e){return document.createElement(e)}function f(e){return document.createTextNode(e)}function d(){return document.createComment("")}function p(){return Object.create(null)}function m(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function h(e,t){return e!=e?t==t:e!==t}function g(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,t)}finally{o.__calling=!1}}}function y(e){e._lock=!0,v(e._beforecreate),v(e._oncreate),v(e._aftercreate),e._lock=!1}function _(){return this._state}function b(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function v(e){for(;e&&e.length;)e.shift()()}var w={destroy:function(e){this.destroy=i,this.fire("destroy"),this.set=i,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:_,fire:g,on:b,set:function(e){this._set(a({},e)),this.root._lock||y(this.root)},_recompute:i,_set:function(e){var t=this._state,n={},r=!1;for(var o in e=a(this._staged,e),this._staged={},e)this._differs(e[o],t[o])&&(n[o]=r=!0);r&&(this._state=a(a({},t),e),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:t}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:t})))},_stage:function(e){a(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:m},T="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function E(e){if(e.__esModule)return e;var t=Object.defineProperty({},"__esModule",{value:!0});return Object.keys(e).forEach((function(n){var r=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(t,n,r.get?r:{enumerable:!0,get:function(){return e[n]}})})),t}var N={};
/*! @license DOMPurify 2.4.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.4.0/LICENSE */function A(e){return(A="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function x(e,t){return(x=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function O(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function k(e,t,n){return(k=O()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var o=new(Function.bind.apply(e,r));return n&&x(o,n.prototype),o}).apply(null,arguments)}function C(e){return function(e){if(Array.isArray(e))return S(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return S(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return S(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function S(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var D=Object.hasOwnProperty,M=Object.setPrototypeOf,R=Object.isFrozen,L=Object.getPrototypeOf,I=Object.getOwnPropertyDescriptor,j=Object.freeze,F=Object.seal,U=Object.create,P="undefined"!=typeof Reflect&&Reflect,H=P.apply,z=P.construct;H||(H=function(e,t,n){return e.apply(t,n)}),j||(j=function(e){return e}),F||(F=function(e){return e}),z||(z=function(e,t){return k(e,C(t))});var B,G=Q(Array.prototype.forEach),W=Q(Array.prototype.pop),$=Q(Array.prototype.push),q=Q(String.prototype.toLowerCase),V=Q(String.prototype.match),Y=Q(String.prototype.replace),K=Q(String.prototype.indexOf),J=Q(String.prototype.trim),X=Q(RegExp.prototype.test),Z=(B=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return z(B,t)});function Q(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return H(e,t,r)}}function ee(e,t,n){n=n||q,M&&M(e,null);for(var r=t.length;r--;){var o=t[r];if("string"==typeof o){var i=n(o);i!==o&&(R(t)||(t[r]=i),o=i)}e[o]=!0}return e}function te(e){var t,n=U(null);for(t in e)H(D,e,[t])&&(n[t]=e[t]);return n}function ne(e,t){for(;null!==e;){var n=I(e,t);if(n){if(n.get)return Q(n.get);if("function"==typeof n.value)return Q(n.value)}e=L(e)}return function(e){return console.warn("fallback value for",e),null}}var re=j(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),oe=j(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),ie=j(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),ae=j(["animate","color-profile","cursor","discard","fedropshadow","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),se=j(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),le=j(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),ce=j(["#text"]),ue=j(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),fe=j(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),de=j(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),pe=j(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),me=F(/\{\{[\w\W]*|[\w\W]*\}\}/gm),he=F(/<%[\w\W]*|[\w\W]*%>/gm),ge=F(/^data-[\-\w.\u00B7-\uFFFF]/),ye=F(/^aria-[\-\w]+$/),_e=F(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),be=F(/^(?:\w+script|data):/i),ve=F(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),we=F(/^html$/i),Te=function(){return"undefined"==typeof window?null:window},Ee=function(e,t){if("object"!==A(e)||"function"!=typeof e.createPolicy)return null;var n=null;t.currentScript&&t.currentScript.hasAttribute("data-tt-policy-suffix")&&(n=t.currentScript.getAttribute("data-tt-policy-suffix"));var r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{createHTML:function(e){return e},createScriptURL:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+r+" could not be created."),null}};var Ne=function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Te(),n=function(t){return e(t)};if(n.version="2.4.0",n.removed=[],!t||!t.document||9!==t.document.nodeType)return n.isSupported=!1,n;var r=t.document,o=t.document,i=t.DocumentFragment,a=t.HTMLTemplateElement,s=t.Node,l=t.Element,c=t.NodeFilter,u=t.NamedNodeMap,f=void 0===u?t.NamedNodeMap||t.MozNamedAttrMap:u,d=t.HTMLFormElement,p=t.DOMParser,m=t.trustedTypes,h=l.prototype,g=ne(h,"cloneNode"),y=ne(h,"nextSibling"),_=ne(h,"childNodes"),b=ne(h,"parentNode");if("function"==typeof a){var v=o.createElement("template");v.content&&v.content.ownerDocument&&(o=v.content.ownerDocument)}var w=Ee(m,r),T=w?w.createHTML(""):"",E=o,N=E.implementation,x=E.createNodeIterator,O=E.createDocumentFragment,k=E.getElementsByTagName,S=r.importNode,D={};try{D=te(o).documentMode?o.documentMode:{}}catch(e){}var M={};n.isSupported="function"==typeof b&&N&&void 0!==N.createHTMLDocument&&9!==D;var R,L,I=me,F=he,U=ge,P=ye,H=be,z=ve,B=_e,Q=null,Ne=ee({},[].concat(C(re),C(oe),C(ie),C(se),C(ce))),Ae=null,xe=ee({},[].concat(C(ue),C(fe),C(de),C(pe))),Oe=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),ke=null,Ce=null,Se=!0,De=!0,Me=!1,Re=!1,Le=!1,Ie=!1,je=!1,Fe=!1,Ue=!1,Pe=!1,He=!0,ze=!1,Be="user-content-",Ge=!0,We=!1,$e={},qe=null,Ve=ee({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Ye=null,Ke=ee({},["audio","video","img","source","image","track"]),Je=null,Xe=ee({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Ze="http://www.w3.org/1998/Math/MathML",Qe="http://www.w3.org/2000/svg",et="http://www.w3.org/1999/xhtml",tt=et,nt=!1,rt=["application/xhtml+xml","text/html"],ot="text/html",it=null,at=o.createElement("form"),st=function(e){return e instanceof RegExp||e instanceof Function},lt=function(e){it&&it===e||(e&&"object"===A(e)||(e={}),e=te(e),R=R=-1===rt.indexOf(e.PARSER_MEDIA_TYPE)?ot:e.PARSER_MEDIA_TYPE,L="application/xhtml+xml"===R?function(e){return e}:q,Q="ALLOWED_TAGS"in e?ee({},e.ALLOWED_TAGS,L):Ne,Ae="ALLOWED_ATTR"in e?ee({},e.ALLOWED_ATTR,L):xe,Je="ADD_URI_SAFE_ATTR"in e?ee(te(Xe),e.ADD_URI_SAFE_ATTR,L):Xe,Ye="ADD_DATA_URI_TAGS"in e?ee(te(Ke),e.ADD_DATA_URI_TAGS,L):Ke,qe="FORBID_CONTENTS"in e?ee({},e.FORBID_CONTENTS,L):Ve,ke="FORBID_TAGS"in e?ee({},e.FORBID_TAGS,L):{},Ce="FORBID_ATTR"in e?ee({},e.FORBID_ATTR,L):{},$e="USE_PROFILES"in e&&e.USE_PROFILES,Se=!1!==e.ALLOW_ARIA_ATTR,De=!1!==e.ALLOW_DATA_ATTR,Me=e.ALLOW_UNKNOWN_PROTOCOLS||!1,Re=e.SAFE_FOR_TEMPLATES||!1,Le=e.WHOLE_DOCUMENT||!1,Fe=e.RETURN_DOM||!1,Ue=e.RETURN_DOM_FRAGMENT||!1,Pe=e.RETURN_TRUSTED_TYPE||!1,je=e.FORCE_BODY||!1,He=!1!==e.SANITIZE_DOM,ze=e.SANITIZE_NAMED_PROPS||!1,Ge=!1!==e.KEEP_CONTENT,We=e.IN_PLACE||!1,B=e.ALLOWED_URI_REGEXP||B,tt=e.NAMESPACE||et,e.CUSTOM_ELEMENT_HANDLING&&st(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(Oe.tagNameCheck=e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),e.CUSTOM_ELEMENT_HANDLING&&st(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(Oe.attributeNameCheck=e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),e.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(Oe.allowCustomizedBuiltInElements=e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Re&&(De=!1),Ue&&(Fe=!0),$e&&(Q=ee({},C(ce)),Ae=[],!0===$e.html&&(ee(Q,re),ee(Ae,ue)),!0===$e.svg&&(ee(Q,oe),ee(Ae,fe),ee(Ae,pe)),!0===$e.svgFilters&&(ee(Q,ie),ee(Ae,fe),ee(Ae,pe)),!0===$e.mathMl&&(ee(Q,se),ee(Ae,de),ee(Ae,pe))),e.ADD_TAGS&&(Q===Ne&&(Q=te(Q)),ee(Q,e.ADD_TAGS,L)),e.ADD_ATTR&&(Ae===xe&&(Ae=te(Ae)),ee(Ae,e.ADD_ATTR,L)),e.ADD_URI_SAFE_ATTR&&ee(Je,e.ADD_URI_SAFE_ATTR,L),e.FORBID_CONTENTS&&(qe===Ve&&(qe=te(qe)),ee(qe,e.FORBID_CONTENTS,L)),Ge&&(Q["#text"]=!0),Le&&ee(Q,["html","head","body"]),Q.table&&(ee(Q,["tbody"]),delete ke.tbody),j&&j(e),it=e)},ct=ee({},["mi","mo","mn","ms","mtext"]),ut=ee({},["foreignobject","desc","title","annotation-xml"]),ft=ee({},["title","style","font","a","script"]),dt=ee({},oe);ee(dt,ie),ee(dt,ae);var pt=ee({},se);ee(pt,le);var mt=function(e){var t=b(e);t&&t.tagName||(t={namespaceURI:et,tagName:"template"});var n=q(e.tagName),r=q(t.tagName);return e.namespaceURI===Qe?t.namespaceURI===et?"svg"===n:t.namespaceURI===Ze?"svg"===n&&("annotation-xml"===r||ct[r]):Boolean(dt[n]):e.namespaceURI===Ze?t.namespaceURI===et?"math"===n:t.namespaceURI===Qe?"math"===n&&ut[r]:Boolean(pt[n]):e.namespaceURI===et&&(!(t.namespaceURI===Qe&&!ut[r])&&(!(t.namespaceURI===Ze&&!ct[r])&&(!pt[n]&&(ft[n]||!dt[n]))))},ht=function(e){$(n.removed,{element:e});try{e.parentNode.removeChild(e)}catch(t){try{e.outerHTML=T}catch(t){e.remove()}}},gt=function(e,t){try{$(n.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){$(n.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!Ae[e])if(Fe||Ue)try{ht(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},yt=function(e){var t,n;if(je)e="<remove></remove>"+e;else{var r=V(e,/^[\r\n\t ]+/);n=r&&r[0]}"application/xhtml+xml"===R&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");var i=w?w.createHTML(e):e;if(tt===et)try{t=(new p).parseFromString(i,R)}catch(e){}if(!t||!t.documentElement){t=N.createDocument(tt,"template",null);try{t.documentElement.innerHTML=nt?"":i}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(o.createTextNode(n),a.childNodes[0]||null),tt===et?k.call(t,Le?"html":"body")[0]:Le?t.documentElement:a},_t=function(e){return x.call(e.ownerDocument||e,e,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT,null,!1)},bt=function(e){return e instanceof d&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof f)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore)},vt=function(e){return"object"===A(s)?e instanceof s:e&&"object"===A(e)&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName},wt=function(e,t,r){M[e]&&G(M[e],(function(e){e.call(n,t,r,it)}))},Tt=function(e){var t;if(wt("beforeSanitizeElements",e,null),bt(e))return ht(e),!0;if(X(/[\u0080-\uFFFF]/,e.nodeName))return ht(e),!0;var r=L(e.nodeName);if(wt("uponSanitizeElement",e,{tagName:r,allowedTags:Q}),e.hasChildNodes()&&!vt(e.firstElementChild)&&(!vt(e.content)||!vt(e.content.firstElementChild))&&X(/<[/\w]/g,e.innerHTML)&&X(/<[/\w]/g,e.textContent))return ht(e),!0;if("select"===r&&X(/<template/i,e.innerHTML))return ht(e),!0;if(!Q[r]||ke[r]){if(!ke[r]&&Nt(r)){if(Oe.tagNameCheck instanceof RegExp&&X(Oe.tagNameCheck,r))return!1;if(Oe.tagNameCheck instanceof Function&&Oe.tagNameCheck(r))return!1}if(Ge&&!qe[r]){var o=b(e)||e.parentNode,i=_(e)||e.childNodes;if(i&&o)for(var a=i.length-1;a>=0;--a)o.insertBefore(g(i[a],!0),y(e))}return ht(e),!0}return e instanceof l&&!mt(e)?(ht(e),!0):"noscript"!==r&&"noembed"!==r||!X(/<\/no(script|embed)/i,e.innerHTML)?(Re&&3===e.nodeType&&(t=e.textContent,t=Y(t,I," "),t=Y(t,F," "),e.textContent!==t&&($(n.removed,{element:e.cloneNode()}),e.textContent=t)),wt("afterSanitizeElements",e,null),!1):(ht(e),!0)},Et=function(e,t,n){if(He&&("id"===t||"name"===t)&&(n in o||n in at))return!1;if(De&&!Ce[t]&&X(U,t));else if(Se&&X(P,t));else if(!Ae[t]||Ce[t]){if(!(Nt(e)&&(Oe.tagNameCheck instanceof RegExp&&X(Oe.tagNameCheck,e)||Oe.tagNameCheck instanceof Function&&Oe.tagNameCheck(e))&&(Oe.attributeNameCheck instanceof RegExp&&X(Oe.attributeNameCheck,t)||Oe.attributeNameCheck instanceof Function&&Oe.attributeNameCheck(t))||"is"===t&&Oe.allowCustomizedBuiltInElements&&(Oe.tagNameCheck instanceof RegExp&&X(Oe.tagNameCheck,n)||Oe.tagNameCheck instanceof Function&&Oe.tagNameCheck(n))))return!1}else if(Je[t]);else if(X(B,Y(n,z,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==K(n,"data:")||!Ye[e]){if(Me&&!X(H,Y(n,z,"")));else if(n)return!1}else;return!0},Nt=function(e){return e.indexOf("-")>0},At=function(e){var t,r,o,i;wt("beforeSanitizeAttributes",e,null);var a=e.attributes;if(a){var s={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:Ae};for(i=a.length;i--;){var l=t=a[i],c=l.name,u=l.namespaceURI;if(r="value"===c?t.value:J(t.value),o=L(c),s.attrName=o,s.attrValue=r,s.keepAttr=!0,s.forceKeepAttr=void 0,wt("uponSanitizeAttribute",e,s),r=s.attrValue,!s.forceKeepAttr&&(gt(c,e),s.keepAttr))if(X(/\/>/i,r))gt(c,e);else{Re&&(r=Y(r,I," "),r=Y(r,F," "));var f=L(e.nodeName);if(Et(f,o,r)){if(!ze||"id"!==o&&"name"!==o||(gt(c,e),r=Be+r),w&&"object"===A(m)&&"function"==typeof m.getAttributeType)if(u);else switch(m.getAttributeType(f,o)){case"TrustedHTML":r=w.createHTML(r);break;case"TrustedScriptURL":r=w.createScriptURL(r)}try{u?e.setAttributeNS(u,c,r):e.setAttribute(c,r),W(n.removed)}catch(e){}}}}wt("afterSanitizeAttributes",e,null)}},xt=function e(t){var n,r=_t(t);for(wt("beforeSanitizeShadowDOM",t,null);n=r.nextNode();)wt("uponSanitizeShadowNode",n,null),Tt(n)||(n.content instanceof i&&e(n.content),At(n));wt("afterSanitizeShadowDOM",t,null)};return n.sanitize=function(e){var o,a,l,c,u,f=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if((nt=!e)&&(e="\x3c!--\x3e"),"string"!=typeof e&&!vt(e)){if("function"!=typeof e.toString)throw Z("toString is not a function");if("string"!=typeof(e=e.toString()))throw Z("dirty is not a string, aborting")}if(!n.isSupported){if("object"===A(t.toStaticHTML)||"function"==typeof t.toStaticHTML){if("string"==typeof e)return t.toStaticHTML(e);if(vt(e))return t.toStaticHTML(e.outerHTML)}return e}if(Ie||lt(f),n.removed=[],"string"==typeof e&&(We=!1),We){if(e.nodeName){var d=L(e.nodeName);if(!Q[d]||ke[d])throw Z("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof s)1===(a=(o=yt("\x3c!----\x3e")).ownerDocument.importNode(e,!0)).nodeType&&"BODY"===a.nodeName||"HTML"===a.nodeName?o=a:o.appendChild(a);else{if(!Fe&&!Re&&!Le&&-1===e.indexOf("<"))return w&&Pe?w.createHTML(e):e;if(!(o=yt(e)))return Fe?null:Pe?T:""}o&&je&&ht(o.firstChild);for(var p=_t(We?e:o);l=p.nextNode();)3===l.nodeType&&l===c||Tt(l)||(l.content instanceof i&&xt(l.content),At(l),c=l);if(c=null,We)return e;if(Fe){if(Ue)for(u=O.call(o.ownerDocument);o.firstChild;)u.appendChild(o.firstChild);else u=o;return Ae.shadowroot&&(u=S.call(r,u,!0)),u}var m=Le?o.outerHTML:o.innerHTML;return Le&&Q["!doctype"]&&o.ownerDocument&&o.ownerDocument.doctype&&o.ownerDocument.doctype.name&&X(we,o.ownerDocument.doctype.name)&&(m="<!DOCTYPE "+o.ownerDocument.doctype.name+">\n"+m),Re&&(m=Y(m,I," "),m=Y(m,F," ")),w&&Pe?w.createHTML(m):m},n.setConfig=function(e){lt(e),Ie=!0},n.clearConfig=function(){it=null,Ie=!1},n.isValidAttribute=function(e,t,n){it||lt({});var r=L(e),o=L(t);return Et(r,o,n)},n.addHook=function(e,t){"function"==typeof t&&(M[e]=M[e]||[],$(M[e],t))},n.removeHook=function(e){if(M[e])return W(M[e])},n.removeHooks=function(e){M[e]&&(M[e]=[])},n.removeAllHooks=function(){M={}},n}(),Ae=E(Object.freeze({__proto__:null,default:Ne})),xe={};Object.defineProperty(xe,"__esModule",{value:!0}),xe.createPermanentMemoizer=void 0;xe.createPermanentMemoizer=(e,t,{maxsize:n}={})=>{let r=new Map;return{get:o=>{const i=e(o);if(r.has(i))return r.get(i);const a=t(o);return n&&r.size>=n&&(r=new Map),r.set(i,a),a}}};const Oe=(T&&T.__importDefault||function(e){return e&&e.__esModule?e:{default:e}})(Ae),ke=xe,Ce=["a","span","b","br","i","strong","sup","sub","strike","u","em","tt"].sort();Oe.default.addHook("afterSanitizeElements",(function(e){"a"===e.nodeName.toLowerCase()&&("_self"!==e.getAttribute("target")&&e.setAttribute("target","_blank"),e.setAttribute("rel","nofollow noopener noreferrer"))}));const Se=(0,ke.createPermanentMemoizer)(e=>String(e),e=>{const t={ALLOWED_TAGS:void 0===e?Ce:"string"==typeof e?e.toLowerCase().slice(1,-1).split("><"):e,ADD_ATTR:["target"],FORCE_BODY:!0};return(0,ke.createPermanentMemoizer)(e=>e,e=>Oe.default.sanitize(e,t),{maxsize:1e5})},{maxsize:1e5});var De=function(e,t){return e?Se.get(t).get(e):e},Me=T&&T.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(N,"__esModule",{value:!0}),N.keyExists=Fe=N.__=N.translate=void 0;const Re=Me(De),Le={};function Ie(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(Le[e]=window.__dw.vis.meta.locale||{}):dw.backend.__messages&&(Le[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e]))}function je(e,t="core",n,...r){let o=function(e,t,n){try{return n[t][e]||e}catch(t){return e}}(e,t,n);if((e=>"string"==typeof e[0])(r)){o=function(e,t=[]){return e.replace(/\$(\d)/g,(e,n)=>void 0===t[+n]?e:(0,Re.default)(t[+n],""))}(o,r)}else o=function(e,t={}){return Object.entries(t).forEach(([t,n])=>{e=e.replace(new RegExp(`%${t}%|%${t}(?!\\w)`,"g"),""+n)}),e}(o,r[0]);return(0,Re.default)(o,"<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br><a><em><i><strong><b><code><img><table><tr><th><td><small><span><div><sup><sub><tt>")}N.translate=je;var Fe=N.__=function(e,t="core",...n){return e=e.trim(),Le[t]||Ie(t),Le[t][e]?je(e,t,Le,...n):"MISSING:"+e};N.keyExists=function(e,t="core"){return Le[t]||Ie(t),!!Le[t][e]};var Ue={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var a=JSON.stringify(n);/^[\{\[]/.test(a)&&(n=a)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var l in i)i[l]&&(s+="; "+l,!0!==i[l]&&(s+="="+i[l].split(";")[0]));return document.cookie=t+"="+n+s}}function a(e,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],a=0;a<i.length;a++){var s=i[a].split("="),l=s.slice(1).join("=");n||'"'!==l.charAt(0)||(l=l.slice(1,-1));try{var c=t(s[0]);if(l=(r.read||r)(l,c)||t(l),n)try{l=JSON.parse(l)}catch(e){}if(o[c]=l,e===c)break}catch(e){}}return e?o[e]:o}}return o.set=i,o.get=function(e){return a(e,!1)},o.getJSON=function(e){return a(e,!0)},o.remove=function(t,n){i(t,"",e(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},e.exports=n()}(Ue);var Pe={};Object.defineProperty(Pe,"__esModule",{value:!0}),Pe.getValueOrDefault=void 0;Pe.getValueOrDefault=(e,t,n)=>e&&t(e)?e:n();var He=T&&T.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{l(r.next(e))}catch(e){i(e)}}function s(e){try{l(r.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}l((r=r.apply(e,t||[])).next())}))},ze=T&&T.__rest||function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};const Be=(T&&T.__importDefault||function(e){return e&&e.__esModule?e:{default:e}})(Ue.exports),Ge=Pe,We=N,$e=new Set(["get","head","options","trace"]);function qe(e,t={}){var{fetch:n,baseUrl:r}=t,o=ze(t,["fetch","baseUrl"]);const i=(0,Ge.getValueOrDefault)(n,()=>!0,()=>{try{const e=window.fetch;if(!e)throw new Error;return e}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}}),a=(0,Ge.getValueOrDefault)(r,()=>!0,()=>{const e=window.dw.backend.__api_domain;if(!e)throw new Error("Neither options.baseUrl nor window.dw is defined.");return e.startsWith("http")?e:"//"+e}),s=Object.assign(Object.assign({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},o),{headers:Object.assign({"Content-Type":"application/json"},o.headers)}),{payload:l,raw:c}=s,u=ze(s,["payload","raw"]),f=`${a.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let d;if(l&&(u.body=JSON.stringify(l)),u.headers["Content-Type"].startsWith("multipart/")&&delete u.headers["Content-Type"],u.disableCSRF||$e.has(u.method.toLowerCase()))d=i(f,u);else{const e=Be.default.get("crumb");e?(u.headers["X-CSRF-Token"]=e,d=i(f,u)):d=qe("/v3/me",{fetch:i,baseUrl:a}).then(()=>{const e=Be.default.get("crumb");e&&(u.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>He(this,void 0,void 0,(function*(){return yield i(f,u)})))}return d.then(e=>{if(c)return e;if(!e.ok)return e.json().then(t=>{throw new Ye(e,t)});if(204===e.status||!e.headers.get("content-type"))return e;const t=(e.headers.get("content-type")||"").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}function Ve(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return qe(t,Object.assign(Object.assign({},n),{method:e}))}}qe.get=Ve("GET"),qe.patch=Ve("PATCH"),qe.put=Ve("PUT"),qe.post=Ve("POST"),qe.head=Ve("HEAD"),qe.delete=Ve("DELETE");class Ye extends Error{constructor(e,t){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e,this.response.json=()=>Promise.resolve(t),t&&(this.type=t.type,this.type&&(0,We.keyExists)(this.type)&&(this.translationKey=this.type),this.details=t.details,Array.isArray(this.details)&&this.details.forEach(e=>{if(e&&e.type){const t=[this.type,e.type].join(" / ");(0,We.keyExists)(t)&&(e.translationKey=t)}}))}}qe.HttpReqError=Ye;var Ke=qe;var Je={async deleteTeam(){this.set({deleting:!0}),await Ke.delete("/v3/teams/"+this.get().team.id),window.location="/"}};function Xe(e,t){var n,r,i,a,s=Fe("teams / delete / really"),p={},m={label:Fe("teams / delete / really-yes")};void 0!==t.deleteTeam2&&(m.value=t.deleteTeam2,p.value=!0);var h=new o.default({root:e.root,store:e.store,data:m,_bind(t,n){var r={};!p.value&&t.value&&(r.deleteTeam2=n.value),e._set(r),p={}}});e.root._beforecreate.push(()=>{h._bind({value:1},h.get())});var g=t.deleteTeam2&&Ze(e,t);return{c(){n=u("p"),r=f("\n\n    "),h._fragment.c(),i=f("\n\n    "),g&&g.c(),a=d()},m(e,t){l(e,n,t),n.innerHTML=s,l(e,r,t),h._mount(e,t),l(e,i,t),g&&g.m(e,t),l(e,a,t)},p(n,r){t=r;var o={};!p.value&&n.deleteTeam2&&(o.value=t.deleteTeam2,p.value=void 0!==t.deleteTeam2),h._set(o),p={},t.deleteTeam2?g?g.p(n,t):((g=Ze(e,t)).c(),g.m(a.parentNode,a)):g&&(g.d(1),g=null)},d(e){e&&(c(n),c(r)),h.destroy(e),e&&c(i),g&&g.d(e),e&&c(a)}}}function Ze(e,t){var n,r,o,i,a,d=Fe("teams / delete / action");function p(t){e.deleteTeam()}return{c(){var e,s,l;n=u("button"),r=u("i"),i=f("  "),a=u("noscript"),r.className=o="fa "+(t.deleting?"fa-spin fa-circle-o-notch":"fa-times"),e="click",s=p,n.addEventListener(e,s,l),n.className="btn btn-danger"},m(e,t){l(e,n,t),s(n,r),s(n,i),s(n,a),a.insertAdjacentHTML("afterend",d)},p(e,t){e.deleting&&o!==(o="fa "+(t.deleting?"fa-spin fa-circle-o-notch":"fa-times"))&&(r.className=o)},d(e){var t,r,o;e&&c(n),t="click",r=p,n.removeEventListener(t,r,o)}}}function Qe(e){!function(e,t){e._handlers=p(),e._slots=p(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}(this,e),this._state=a({deleteTeam:!1,deleteTeam2:!1,deleting:!1},e.data),this._intro=!0,this._fragment=function(e,t){var n,o,i,a=Fe("teams / delete / p"),p={},m=t.deleteTeam&&Xe(e,t),h={label:Fe("teams / delete / yes")};void 0!==t.deleteTeam&&(h.value=t.deleteTeam,p.value=!0);var g=new r.default({root:e.root,store:e.store,slots:{default:document.createDocumentFragment()},data:h,_bind(t,n){var r={};!p.value&&t.value&&(r.deleteTeam=n.value),e._set(r),p={}}});return e.root._beforecreate.push(()=>{g._bind({value:1},g.get())}),{c(){n=u("p"),o=f("\n\n"),m&&m.c(),i=d(),g._fragment.c()},m(e,t){l(e,n,t),n.innerHTML=a,l(e,o,t),m&&m.m(g._slotted.default,null),s(g._slotted.default,i),g._mount(e,t)},p(n,r){(t=r).deleteTeam?m?m.p(n,t):((m=Xe(e,t)).c(),m.m(i.parentNode,i)):m&&(m.d(1),m=null);var o={};!p.value&&n.deleteTeam&&(o.value=t.deleteTeam,p.value=void 0!==t.deleteTeam),g._set(o),p={}},d(e){e&&(c(n),c(o)),m&&m.d(),g.destroy(e)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),y(this))}function et(e,t){this._handlers={},this._dependents=[],this._computed=p(),this._sortedComputedProperties=[],this._state=a({},e),this._differs=t&&t.immutable?h:m}a(Qe.prototype,w),a(Qe.prototype,Je),a(et.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let n=0;n<e.length;n+=1){const r=e[n];t["$"+r]=this._state[r]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,t){const n=this._state;this._state=a(a({},n),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,t);this.fire("state",{changed:t,previous:n,current:this._state}),this._dependents.filter(e=>{const n={};let r=!1;for(let o=0;o<e.props.length;o+=1){const i=e.props[o];i in t&&(n["$"+i]=this._state[i],r=!0)}if(r)return e.component._stage(n),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:t,previous:n,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],n=p();let r;function o(i){const a=e[i];a&&(a.deps.forEach(e=>{if(e===r)throw new Error(`Cyclical dependency detected between ${e} <-> ${i}`);o(e)}),n[i]||(n[i]=!0,t.push(a)))}for(const e in this._computed)o(r=e)},compute(e,t,n){let r;const o={deps:t,update:(o,i,a)=>{const s=t.map(e=>(e in i&&(a=!0),o[e]));if(a){const t=n.apply(null,s);this._differs(t,r)&&(r=t,i[e]=!0,o[e]=r)}}};this._computed[e]=o,this._sortComputedProperties();const i=a({},this._state),s={};o.update(i,s,!0),this._set(i,s)},fire:g,get:_,on:b,set(e){const t=this._state,n=this._changed={};let r=!1;for(const o in e){if(this._computed[o])throw new Error(`'${o}' is a read-only computed property`);this._differs(e[o],t[o])&&(n[o]=r=!0)}r&&this._set(e,n)}});return{App:Qe,store:new et({})}}));
//# sourceMappingURL=delete.js.map
