!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/publish/pending-activation",t):(e="undefined"!=typeof globalThis?globalThis:e||self)["publish/pending-activation"]=t()}(this,(function(){"use strict";function e(){}function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e,t){e.appendChild(t)}function r(e,t,n){e.insertBefore(t,n)}function o(e){e.parentNode.removeChild(e)}function i(e){return document.createElement(e)}function a(e){return document.createTextNode(e)}function s(){return Object.create(null)}function c(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function l(e,t){return e!=e?t==t:e!==t}function u(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,t)}finally{o.__calling=!1}}}function f(){return this._state}function p(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function d(e){for(;e&&e.length;)e.shift()()}var m={destroy:function(t){this.destroy=e,this.fire("destroy"),this.set=e,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:f,fire:u,on:p,set:function(e){var n;this._set(t({},e)),this.root._lock||((n=this.root)._lock=!0,d(n._beforecreate),d(n._oncreate),d(n._aftercreate),n._lock=!1)},_recompute:e,_set:function(e){var n=this._state,r={},o=!1;for(var i in e=t(this._staged,e),this._staged={},e)this._differs(e[i],n[i])&&(r[i]=o=!0);o&&(this._state=t(t({},n),e),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:n}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:n})))},_stage:function(e){t(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:c};
/*! @license DOMPurify 2.4.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.4.0/LICENSE */function h(e){return(h="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function g(e,t){return(g=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function y(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function b(e,t,n){return(b=y()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var o=new(Function.bind.apply(e,r));return n&&g(o,n.prototype),o}).apply(null,arguments)}function _(e){return function(e){if(Array.isArray(e))return v(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return v(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return v(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var w=Object.hasOwnProperty,T=Object.setPrototypeOf,E=Object.isFrozen,N=Object.getPrototypeOf,A=Object.getOwnPropertyDescriptor,x=Object.freeze,k=Object.seal,S=Object.create,C="undefined"!=typeof Reflect&&Reflect,O=C.apply,R=C.construct;O||(O=function(e,t,n){return e.apply(t,n)}),x||(x=function(e){return e}),k||(k=function(e){return e}),R||(R=function(e,t){return b(e,_(t))});var D,L=G(Array.prototype.forEach),M=G(Array.prototype.pop),I=G(Array.prototype.push),U=G(String.prototype.toLowerCase),F=G(String.prototype.match),H=G(String.prototype.replace),j=G(String.prototype.indexOf),z=G(String.prototype.trim),P=G(RegExp.prototype.test),B=(D=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return R(D,t)});function G(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return O(e,t,r)}}function W(e,t,n){n=n||U,T&&T(e,null);for(var r=t.length;r--;){var o=t[r];if("string"==typeof o){var i=n(o);i!==o&&(E(t)||(t[r]=i),o=i)}e[o]=!0}return e}function $(e){var t,n=S(null);for(t in e)O(w,e,[t])&&(n[t]=e[t]);return n}function q(e,t){for(;null!==e;){var n=A(e,t);if(n){if(n.get)return G(n.get);if("function"==typeof n.value)return G(n.value)}e=N(e)}return function(e){return console.warn("fallback value for",e),null}}var Y=x(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),J=x(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),K=x(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),V=x(["animate","color-profile","cursor","discard","fedropshadow","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),X=x(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),Z=x(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Q=x(["#text"]),ee=x(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),te=x(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),ne=x(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),re=x(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),oe=k(/\{\{[\w\W]*|[\w\W]*\}\}/gm),ie=k(/<%[\w\W]*|[\w\W]*%>/gm),ae=k(/^data-[\-\w.\u00B7-\uFFFF]/),se=k(/^aria-[\-\w]+$/),ce=k(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),le=k(/^(?:\w+script|data):/i),ue=k(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),fe=k(/^html$/i),pe=function(){return"undefined"==typeof window?null:window},de=function(e,t){if("object"!==h(e)||"function"!=typeof e.createPolicy)return null;var n=null;t.currentScript&&t.currentScript.hasAttribute("data-tt-policy-suffix")&&(n=t.currentScript.getAttribute("data-tt-policy-suffix"));var r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{createHTML:function(e){return e},createScriptURL:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+r+" could not be created."),null}};var me=function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:pe(),n=function(t){return e(t)};if(n.version="2.4.0",n.removed=[],!t||!t.document||9!==t.document.nodeType)return n.isSupported=!1,n;var r=t.document,o=t.document,i=t.DocumentFragment,a=t.HTMLTemplateElement,s=t.Node,c=t.Element,l=t.NodeFilter,u=t.NamedNodeMap,f=void 0===u?t.NamedNodeMap||t.MozNamedAttrMap:u,p=t.HTMLFormElement,d=t.DOMParser,m=t.trustedTypes,g=c.prototype,y=q(g,"cloneNode"),b=q(g,"nextSibling"),v=q(g,"childNodes"),w=q(g,"parentNode");if("function"==typeof a){var T=o.createElement("template");T.content&&T.content.ownerDocument&&(o=T.content.ownerDocument)}var E=de(m,r),N=E?E.createHTML(""):"",A=o,k=A.implementation,S=A.createNodeIterator,C=A.createDocumentFragment,O=A.getElementsByTagName,R=r.importNode,D={};try{D=$(o).documentMode?o.documentMode:{}}catch(e){}var G={};n.isSupported="function"==typeof w&&k&&void 0!==k.createHTMLDocument&&9!==D;var me,he,ge=oe,ye=ie,be=ae,_e=se,ve=le,we=ue,Te=ce,Ee=null,Ne=W({},[].concat(_(Y),_(J),_(K),_(X),_(Q))),Ae=null,xe=W({},[].concat(_(ee),_(te),_(ne),_(re))),ke=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Se=null,Ce=null,Oe=!0,Re=!0,De=!1,Le=!1,Me=!1,Ie=!1,Ue=!1,Fe=!1,He=!1,je=!1,ze=!0,Pe=!1,Be="user-content-",Ge=!0,We=!1,$e={},qe=null,Ye=W({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Je=null,Ke=W({},["audio","video","img","source","image","track"]),Ve=null,Xe=W({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Ze="http://www.w3.org/1998/Math/MathML",Qe="http://www.w3.org/2000/svg",et="http://www.w3.org/1999/xhtml",tt=et,nt=!1,rt=["application/xhtml+xml","text/html"],ot="text/html",it=null,at=o.createElement("form"),st=function(e){return e instanceof RegExp||e instanceof Function},ct=function(e){it&&it===e||(e&&"object"===h(e)||(e={}),e=$(e),me=me=-1===rt.indexOf(e.PARSER_MEDIA_TYPE)?ot:e.PARSER_MEDIA_TYPE,he="application/xhtml+xml"===me?function(e){return e}:U,Ee="ALLOWED_TAGS"in e?W({},e.ALLOWED_TAGS,he):Ne,Ae="ALLOWED_ATTR"in e?W({},e.ALLOWED_ATTR,he):xe,Ve="ADD_URI_SAFE_ATTR"in e?W($(Xe),e.ADD_URI_SAFE_ATTR,he):Xe,Je="ADD_DATA_URI_TAGS"in e?W($(Ke),e.ADD_DATA_URI_TAGS,he):Ke,qe="FORBID_CONTENTS"in e?W({},e.FORBID_CONTENTS,he):Ye,Se="FORBID_TAGS"in e?W({},e.FORBID_TAGS,he):{},Ce="FORBID_ATTR"in e?W({},e.FORBID_ATTR,he):{},$e="USE_PROFILES"in e&&e.USE_PROFILES,Oe=!1!==e.ALLOW_ARIA_ATTR,Re=!1!==e.ALLOW_DATA_ATTR,De=e.ALLOW_UNKNOWN_PROTOCOLS||!1,Le=e.SAFE_FOR_TEMPLATES||!1,Me=e.WHOLE_DOCUMENT||!1,Fe=e.RETURN_DOM||!1,He=e.RETURN_DOM_FRAGMENT||!1,je=e.RETURN_TRUSTED_TYPE||!1,Ue=e.FORCE_BODY||!1,ze=!1!==e.SANITIZE_DOM,Pe=e.SANITIZE_NAMED_PROPS||!1,Ge=!1!==e.KEEP_CONTENT,We=e.IN_PLACE||!1,Te=e.ALLOWED_URI_REGEXP||Te,tt=e.NAMESPACE||et,e.CUSTOM_ELEMENT_HANDLING&&st(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(ke.tagNameCheck=e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),e.CUSTOM_ELEMENT_HANDLING&&st(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(ke.attributeNameCheck=e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),e.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(ke.allowCustomizedBuiltInElements=e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Le&&(Re=!1),He&&(Fe=!0),$e&&(Ee=W({},_(Q)),Ae=[],!0===$e.html&&(W(Ee,Y),W(Ae,ee)),!0===$e.svg&&(W(Ee,J),W(Ae,te),W(Ae,re)),!0===$e.svgFilters&&(W(Ee,K),W(Ae,te),W(Ae,re)),!0===$e.mathMl&&(W(Ee,X),W(Ae,ne),W(Ae,re))),e.ADD_TAGS&&(Ee===Ne&&(Ee=$(Ee)),W(Ee,e.ADD_TAGS,he)),e.ADD_ATTR&&(Ae===xe&&(Ae=$(Ae)),W(Ae,e.ADD_ATTR,he)),e.ADD_URI_SAFE_ATTR&&W(Ve,e.ADD_URI_SAFE_ATTR,he),e.FORBID_CONTENTS&&(qe===Ye&&(qe=$(qe)),W(qe,e.FORBID_CONTENTS,he)),Ge&&(Ee["#text"]=!0),Me&&W(Ee,["html","head","body"]),Ee.table&&(W(Ee,["tbody"]),delete Se.tbody),x&&x(e),it=e)},lt=W({},["mi","mo","mn","ms","mtext"]),ut=W({},["foreignobject","desc","title","annotation-xml"]),ft=W({},["title","style","font","a","script"]),pt=W({},J);W(pt,K),W(pt,V);var dt=W({},X);W(dt,Z);var mt=function(e){var t=w(e);t&&t.tagName||(t={namespaceURI:et,tagName:"template"});var n=U(e.tagName),r=U(t.tagName);return e.namespaceURI===Qe?t.namespaceURI===et?"svg"===n:t.namespaceURI===Ze?"svg"===n&&("annotation-xml"===r||lt[r]):Boolean(pt[n]):e.namespaceURI===Ze?t.namespaceURI===et?"math"===n:t.namespaceURI===Qe?"math"===n&&ut[r]:Boolean(dt[n]):e.namespaceURI===et&&(!(t.namespaceURI===Qe&&!ut[r])&&(!(t.namespaceURI===Ze&&!lt[r])&&(!dt[n]&&(ft[n]||!pt[n]))))},ht=function(e){I(n.removed,{element:e});try{e.parentNode.removeChild(e)}catch(t){try{e.outerHTML=N}catch(t){e.remove()}}},gt=function(e,t){try{I(n.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){I(n.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!Ae[e])if(Fe||He)try{ht(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},yt=function(e){var t,n;if(Ue)e="<remove></remove>"+e;else{var r=F(e,/^[\r\n\t ]+/);n=r&&r[0]}"application/xhtml+xml"===me&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");var i=E?E.createHTML(e):e;if(tt===et)try{t=(new d).parseFromString(i,me)}catch(e){}if(!t||!t.documentElement){t=k.createDocument(tt,"template",null);try{t.documentElement.innerHTML=nt?"":i}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(o.createTextNode(n),a.childNodes[0]||null),tt===et?O.call(t,Me?"html":"body")[0]:Me?t.documentElement:a},bt=function(e){return S.call(e.ownerDocument||e,e,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT,null,!1)},_t=function(e){return e instanceof p&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof f)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore)},vt=function(e){return"object"===h(s)?e instanceof s:e&&"object"===h(e)&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName},wt=function(e,t,r){G[e]&&L(G[e],(function(e){e.call(n,t,r,it)}))},Tt=function(e){var t;if(wt("beforeSanitizeElements",e,null),_t(e))return ht(e),!0;if(P(/[\u0080-\uFFFF]/,e.nodeName))return ht(e),!0;var r=he(e.nodeName);if(wt("uponSanitizeElement",e,{tagName:r,allowedTags:Ee}),e.hasChildNodes()&&!vt(e.firstElementChild)&&(!vt(e.content)||!vt(e.content.firstElementChild))&&P(/<[/\w]/g,e.innerHTML)&&P(/<[/\w]/g,e.textContent))return ht(e),!0;if("select"===r&&P(/<template/i,e.innerHTML))return ht(e),!0;if(!Ee[r]||Se[r]){if(!Se[r]&&Nt(r)){if(ke.tagNameCheck instanceof RegExp&&P(ke.tagNameCheck,r))return!1;if(ke.tagNameCheck instanceof Function&&ke.tagNameCheck(r))return!1}if(Ge&&!qe[r]){var o=w(e)||e.parentNode,i=v(e)||e.childNodes;if(i&&o)for(var a=i.length-1;a>=0;--a)o.insertBefore(y(i[a],!0),b(e))}return ht(e),!0}return e instanceof c&&!mt(e)?(ht(e),!0):"noscript"!==r&&"noembed"!==r||!P(/<\/no(script|embed)/i,e.innerHTML)?(Le&&3===e.nodeType&&(t=e.textContent,t=H(t,ge," "),t=H(t,ye," "),e.textContent!==t&&(I(n.removed,{element:e.cloneNode()}),e.textContent=t)),wt("afterSanitizeElements",e,null),!1):(ht(e),!0)},Et=function(e,t,n){if(ze&&("id"===t||"name"===t)&&(n in o||n in at))return!1;if(Re&&!Ce[t]&&P(be,t));else if(Oe&&P(_e,t));else if(!Ae[t]||Ce[t]){if(!(Nt(e)&&(ke.tagNameCheck instanceof RegExp&&P(ke.tagNameCheck,e)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(e))&&(ke.attributeNameCheck instanceof RegExp&&P(ke.attributeNameCheck,t)||ke.attributeNameCheck instanceof Function&&ke.attributeNameCheck(t))||"is"===t&&ke.allowCustomizedBuiltInElements&&(ke.tagNameCheck instanceof RegExp&&P(ke.tagNameCheck,n)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(n))))return!1}else if(Ve[t]);else if(P(Te,H(n,we,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==j(n,"data:")||!Je[e]){if(De&&!P(ve,H(n,we,"")));else if(n)return!1}else;return!0},Nt=function(e){return e.indexOf("-")>0},At=function(e){var t,r,o,i;wt("beforeSanitizeAttributes",e,null);var a=e.attributes;if(a){var s={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:Ae};for(i=a.length;i--;){var c=t=a[i],l=c.name,u=c.namespaceURI;if(r="value"===l?t.value:z(t.value),o=he(l),s.attrName=o,s.attrValue=r,s.keepAttr=!0,s.forceKeepAttr=void 0,wt("uponSanitizeAttribute",e,s),r=s.attrValue,!s.forceKeepAttr&&(gt(l,e),s.keepAttr))if(P(/\/>/i,r))gt(l,e);else{Le&&(r=H(r,ge," "),r=H(r,ye," "));var f=he(e.nodeName);if(Et(f,o,r)){if(!Pe||"id"!==o&&"name"!==o||(gt(l,e),r=Be+r),E&&"object"===h(m)&&"function"==typeof m.getAttributeType)if(u);else switch(m.getAttributeType(f,o)){case"TrustedHTML":r=E.createHTML(r);break;case"TrustedScriptURL":r=E.createScriptURL(r)}try{u?e.setAttributeNS(u,l,r):e.setAttribute(l,r),M(n.removed)}catch(e){}}}}wt("afterSanitizeAttributes",e,null)}},xt=function e(t){var n,r=bt(t);for(wt("beforeSanitizeShadowDOM",t,null);n=r.nextNode();)wt("uponSanitizeShadowNode",n,null),Tt(n)||(n.content instanceof i&&e(n.content),At(n));wt("afterSanitizeShadowDOM",t,null)};return n.sanitize=function(e){var o,a,c,l,u,f=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if((nt=!e)&&(e="\x3c!--\x3e"),"string"!=typeof e&&!vt(e)){if("function"!=typeof e.toString)throw B("toString is not a function");if("string"!=typeof(e=e.toString()))throw B("dirty is not a string, aborting")}if(!n.isSupported){if("object"===h(t.toStaticHTML)||"function"==typeof t.toStaticHTML){if("string"==typeof e)return t.toStaticHTML(e);if(vt(e))return t.toStaticHTML(e.outerHTML)}return e}if(Ie||ct(f),n.removed=[],"string"==typeof e&&(We=!1),We){if(e.nodeName){var p=he(e.nodeName);if(!Ee[p]||Se[p])throw B("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof s)1===(a=(o=yt("\x3c!----\x3e")).ownerDocument.importNode(e,!0)).nodeType&&"BODY"===a.nodeName||"HTML"===a.nodeName?o=a:o.appendChild(a);else{if(!Fe&&!Le&&!Me&&-1===e.indexOf("<"))return E&&je?E.createHTML(e):e;if(!(o=yt(e)))return Fe?null:je?N:""}o&&Ue&&ht(o.firstChild);for(var d=bt(We?e:o);c=d.nextNode();)3===c.nodeType&&c===l||Tt(c)||(c.content instanceof i&&xt(c.content),At(c),l=c);if(l=null,We)return e;if(Fe){if(He)for(u=C.call(o.ownerDocument);o.firstChild;)u.appendChild(o.firstChild);else u=o;return Ae.shadowroot&&(u=R.call(r,u,!0)),u}var m=Me?o.outerHTML:o.innerHTML;return Me&&Ee["!doctype"]&&o.ownerDocument&&o.ownerDocument.doctype&&o.ownerDocument.doctype.name&&P(fe,o.ownerDocument.doctype.name)&&(m="<!DOCTYPE "+o.ownerDocument.doctype.name+">\n"+m),Le&&(m=H(m,ge," "),m=H(m,ye," ")),E&&je?E.createHTML(m):m},n.setConfig=function(e){ct(e),Ie=!0},n.clearConfig=function(){it=null,Ie=!1},n.isValidAttribute=function(e,t,n){it||ct({});var r=he(e),o=he(t);return Et(r,o,n)},n.addHook=function(e,t){"function"==typeof t&&(G[e]=G[e]||[],I(G[e],t))},n.removeHook=function(e){if(G[e])return M(G[e])},n.removeHooks=function(e){G[e]&&(G[e]=[])},n.removeAllHooks=function(){G={}},n}();const he=["a","span","b","br","i","strong","sup","sub","strike","u","em","tt"];function ge(e,t=he){return e?("string"==typeof t&&(t=Array.from(t.toLowerCase().matchAll(/<([a-z][a-z0-9]*)>/g)).map(e=>e[1])),me.sanitize(e,{ALLOWED_TAGS:t,ADD_ATTR:["target"],FORCE_BODY:!0})):e}me.addHook("afterSanitizeElements",(function(e){"a"===e.nodeName.toLowerCase()&&("_self"!==e.getAttribute("target")&&e.setAttribute("target","_blank"),e.setAttribute("rel","nofollow noopener noreferrer"))}));const ye={};function be(e,t="core",n,...r){let o=function(e,t,n){try{return n[t][e]||e}catch(t){return e}}(e,t,n);return o="string"==typeof r[0]?function(e,t=[]){return e.replace(/\$(\d)/g,(e,n)=>void 0===t[+n]?e:ge(t[+n],""))}(o,r):function(e,t={}){return Object.entries(t).forEach(([t,n])=>{e=e.replace(new RegExp(`%${t}%|%${t}(?!\\w)`,"g"),n)}),e}(o,r[0]),ge(o,"<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br><a><em><i><strong><b><code><img><table><tr><th><td><small><span><div><sup><sub><tt>")}function _e(e,t="core",...n){return e=e.trim(),ye[t]||function(e="core"){"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(ye[e]=window.__dw.vis.meta.locale||{}):ye[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}(t),ye[t][e]?be(e,t,ye,...n):"MISSING:"+e}var ve={exports:{}};
/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */!function(e,t){var n;n=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var a=JSON.stringify(n);/^[\{\[]/.test(a)&&(n=a)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var c in i)i[c]&&(s+="; "+c,!0!==i[c]&&(s+="="+i[c].split(";")[0]));return document.cookie=t+"="+n+s}}function a(e,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],a=0;a<i.length;a++){var s=i[a].split("="),c=s.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var l=t(s[0]);if(c=(r.read||r)(c,l)||t(c),n)try{c=JSON.parse(c)}catch(e){}if(o[l]=c,e===l)break}catch(e){}}return e?o[e]:o}}return o.set=i,o.get=function(e){return a(e,!1)},o.getJSON=function(e){return a(e,!0)},o.remove=function(t,n){i(t,"",e(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},e.exports=n()}(ve);var we=ve.exports,Te=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};const Ee=new Set(["get","head","options","trace"]);function Ne(e,t={}){if(!t.fetch)try{t.fetch=window.fetch}catch(e){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!t.baseUrl)try{t.baseUrl=window.dw.backend.__api_domain.startsWith("http")?window.dw.backend.__api_domain:"//"+window.dw.backend.__api_domain}catch(e){throw new Error("Neither options.baseUrl nor window.dw is defined.")}const n=Object.assign(Object.assign({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},t),{headers:Object.assign({"Content-Type":"application/json"},t.headers)}),{payload:r,baseUrl:o,fetch:i,raw:a}=n,s=Te(n,["payload","baseUrl","fetch","raw"]),c=`${o.replace(/\/$/,"")}/${e.replace(/^\//,"")}`;let l;if(r&&(s.body=JSON.stringify(r)),s.headers["Content-Type"].startsWith("multipart/")&&delete s.headers["Content-Type"],s.disableCSFR||Ee.has(s.method.toLowerCase()))l=i(c,s);else{const e=we.get("crumb");e?(s.headers["X-CSRF-Token"]=e,l=i(c,s)):l=Ne("/v3/me",{fetch:i,baseUrl:o}).then(()=>{const e=we.get("crumb");e&&(s.headers["X-CSRF-Token"]=e)}).catch(()=>{}).then(()=>i(c,s))}return l.then(e=>{if(a)return e;if(!e.ok)throw new ke(e);if(204===e.status||!e.headers.get("content-type"))return e;const t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()})}Ne.get=xe("GET"),Ne.patch=xe("PATCH"),Ne.put=xe("PUT");const Ae=Ne.post=xe("POST");function xe(e){return(t,n)=>{if(n&&n.method)throw new Error(`Setting option.method is not allowed in httpReq.${e.toLowerCase()}()`);return Ne(t,Object.assign(Object.assign({},n),{method:e}))}}Ne.head=xe("HEAD"),Ne.delete=xe("DELETE");class ke extends Error{constructor(e){super(),this.name="HttpReqError",this.status=e.status,this.statusText=e.statusText,this.message=`[${e.status}] ${e.statusText}`,this.response=e}}var Se={async resendActivation(){this.set({status:"sending"});try{await Ae("/v3/auth/resend-activation"),this.set({status:"success"})}catch(e){this.set({status:"error"})}}};function Ce(e,t){var s,c,l,u,f,p=_e("publish / pending-activation / resend");function d(t){e.resendActivation()}return{c(){var e,n,r;s=i("button"),c=i("i"),u=a("\n             \n            "),f=i("noscript"),c.className=l="fa "+("sending"==t.status?"fa-spin fa-circle-o-notch":"fa-envelope"),e="click",n=d,s.addEventListener(e,n,r),s.className="btn btn-primary"},m(e,t){r(e,s,t),n(s,c),n(s,u),n(s,f),f.insertAdjacentHTML("afterend",p)},p(e,t){e.status&&l!==(l="fa "+("sending"==t.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(c.className=l)},d(e){var t,n,r;e&&o(s),t="click",n=d,s.removeEventListener(t,n,r)}}}function Oe(t,n){var a,s=_e("publish / pending-activation / resend-error");return{c(){a=i("p")},m(e,t){r(e,a,t),a.innerHTML=s},p:e,d(e){e&&o(a)}}}function Re(t,n){var a,s=_e("publish / pending-activation / resend-success");return{c(){a=i("p")},m(e,t){r(e,a,t),a.innerHTML=s},p:e,d(e){e&&o(a)}}}function De(e){!function(e,t){e._handlers=s(),e._slots=s(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}(this,e),this._state=t({status:""},e.data),this._intro=!0,this._fragment=function(e,t){var s,c,l,u,f,p,d=_e("publish / pending-activation / h1"),m=_e("publish / pending-activation / p");function h(e){return"success"==e.status?Re:"error"==e.status?Oe:Ce}var g=h(t),y=g(e,t);return{c(){var e,t;s=i("div"),c=i("h2"),l=a("\n\n    "),u=i("p"),f=a("\n\n    "),p=i("div"),y.c(),e="margin-top",t="20px",p.style.setProperty(e,t)},m(e,t){r(e,s,t),n(s,c),c.innerHTML=d,n(s,l),n(s,u),u.innerHTML=m,n(s,f),n(s,p),y.m(p,null)},p(t,n){g===(g=h(n))&&y?y.p(t,n):(y.d(1),(y=g(e,n)).c(),y.m(p,null))},d(e){e&&o(s),y.d()}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}function Le(e,n){this._handlers={},this._dependents=[],this._computed=s(),this._sortedComputedProperties=[],this._state=t({},e),this._differs=n&&n.immutable?l:c}t(De.prototype,m),t(De.prototype,Se),t(Le.prototype,{_add(e,t){this._dependents.push({component:e,props:t})},_init(e){const t={};for(let n=0;n<e.length;n+=1){const r=e[n];t["$"+r]=this._state[r]}return t},_remove(e){let t=this._dependents.length;for(;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set(e,n){const r=this._state;this._state=t(t({},r),e);for(let e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,n);this.fire("state",{changed:n,previous:r,current:this._state}),this._dependents.filter(e=>{const t={};let r=!1;for(let o=0;o<e.props.length;o+=1){const i=e.props[o];i in n&&(t["$"+i]=this._state[i],r=!0)}if(r)return e.component._stage(t),!0}).forEach(e=>{e.component.set({})}),this.fire("update",{changed:n,previous:r,current:this._state})},_sortComputedProperties(){const e=this._computed,t=this._sortedComputedProperties=[],n=s();let r;function o(i){const a=e[i];a&&(a.deps.forEach(e=>{if(e===r)throw new Error(`Cyclical dependency detected between ${e} <-> ${i}`);o(e)}),n[i]||(n[i]=!0,t.push(a)))}for(const e in this._computed)o(r=e)},compute(e,n,r){let o;const i={deps:n,update:(t,i,a)=>{const s=n.map(e=>(e in i&&(a=!0),t[e]));if(a){const n=r.apply(null,s);this._differs(n,o)&&(o=n,i[e]=!0,t[e]=o)}}};this._computed[e]=i,this._sortComputedProperties();const a=t({},this._state),s={};i.update(a,s,!0),this._set(a,s)},fire:u,get:f,on:p,set(e){const t=this._state,n=this._changed={};let r=!1;for(const o in e){if(this._computed[o])throw new Error(`'${o}' is a read-only computed property`);this._differs(e[o],t[o])&&(n[o]=r=!0)}r&&this._set(e,n)}});return{App:De,store:new Le({})}}));
//# sourceMappingURL=pending-activation.js.map
