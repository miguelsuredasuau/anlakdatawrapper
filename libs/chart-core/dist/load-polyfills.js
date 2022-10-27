!function(){"use strict";var e=function(e,i,o){if(o||2===arguments.length)for(var n,r=0,s=i.length;r<s;r++)!n&&r in i||(n||(n=Array.prototype.slice.call(i,0,r)),n[r]=i[r]);return e.concat(n||Array.prototype.slice.call(i))},i=function(e,i,o){this.name=e,this.version=i,this.os=o,this.type="browser"},o=function(e){this.version=e,this.type="node",this.name="node",this.os=process.platform},n=function(e,i,o,n){this.name=e,this.version=i,this.os=o,this.bot=n,this.type="bot-device"},r=function(){this.type="bot",this.bot=!0,this.name="bot",this.version=null,this.os=null},s=function(){this.type="react-native",this.name="react-native",this.version=null,this.os=null},t=/(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/,a=[["aol",/AOLShield\/([0-9\._]+)/],["edge",/Edge\/([0-9\._]+)/],["edge-ios",/EdgiOS\/([0-9\._]+)/],["yandexbrowser",/YaBrowser\/([0-9\._]+)/],["kakaotalk",/KAKAOTALK\s([0-9\.]+)/],["samsung",/SamsungBrowser\/([0-9\.]+)/],["silk",/\bSilk\/([0-9._-]+)\b/],["miui",/MiuiBrowser\/([0-9\.]+)$/],["beaker",/BeakerBrowser\/([0-9\.]+)/],["edge-chromium",/EdgA?\/([0-9\.]+)/],["chromium-webview",/(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],["chrome",/(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],["phantomjs",/PhantomJS\/([0-9\.]+)(:?\s|$)/],["crios",/CriOS\/([0-9\.]+)(:?\s|$)/],["firefox",/Firefox\/([0-9\.]+)(?:\s|$)/],["fxios",/FxiOS\/([0-9\.]+)/],["opera-mini",/Opera Mini.*Version\/([0-9\.]+)/],["opera",/Opera\/([0-9\.]+)(?:\s|$)/],["opera",/OPR\/([0-9\.]+)(:?\s|$)/],["pie",/^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],["pie",/^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],["netfront",/^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],["ie",/Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],["ie",/MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],["ie",/MSIE\s(7\.0)/],["bb10",/BB10;\sTouch.*Version\/([0-9\.]+)/],["android",/Android\s([0-9\.]+)/],["ios",/Version\/([0-9\._]+).*Mobile.*Safari.*/],["safari",/Version\/([0-9\._]+).*Safari/],["facebook",/FB[AS]V\/([0-9\.]+)/],["instagram",/Instagram\s([0-9\.]+)/],["ios-webview",/AppleWebKit\/([0-9\.]+).*Mobile/],["ios-webview",/AppleWebKit\/([0-9\.]+).*Gecko\)$/],["curl",/^curl\/([0-9\.]+)$/],["searchbot",/alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/]],d=[["iOS",/iP(hone|od|ad)/],["Android OS",/Android/],["BlackBerry OS",/BlackBerry|BB10/],["Windows Mobile",/IEMobile/],["Amazon OS",/Kindle/],["Windows 3.11",/Win16/],["Windows 95",/(Windows 95)|(Win95)|(Windows_95)/],["Windows 98",/(Windows 98)|(Win98)/],["Windows 2000",/(Windows NT 5.0)|(Windows 2000)/],["Windows XP",/(Windows NT 5.1)|(Windows XP)/],["Windows Server 2003",/(Windows NT 5.2)/],["Windows Vista",/(Windows NT 6.0)/],["Windows 7",/(Windows NT 6.1)/],["Windows 8",/(Windows NT 6.2)/],["Windows 8.1",/(Windows NT 6.3)/],["Windows 10",/(Windows NT 10.0)/],["Windows ME",/Windows ME/],["Windows CE",/Windows CE|WinCE|Microsoft Pocket Internet Explorer/],["Open BSD",/OpenBSD/],["Sun OS",/SunOS/],["Chrome OS",/CrOS/],["Linux",/(Linux)|(X11)/],["Mac OS",/(Mac_PowerPC)|(Macintosh)/],["QNX",/QNX/],["BeOS",/BeOS/],["OS/2",/OS\/2/]],c={firefox:[50,88],chrome:[50,90],ie:[6,11],edge:[12,90],safari:[9,15]};const{browser:l,version:u}=function(){var c="undefined"==typeof document&&"undefined"!=typeof navigator&&"ReactNative"===navigator.product?new s:"undefined"!=typeof navigator?function(o){var s=function(e){return""!==e&&a.reduce((function(i,o){var n=o[0];if(i)return i;var r=o[1].exec(e);return!!r&&[n,r]}),!1)}(o);if(!s)return null;var c=s[0],l=s[1];if("searchbot"===c)return new r;var u=l[1]&&l[1].split(".").join("_").split("_").slice(0,3);u?u.length<3&&(u=e(e([],u,!0),function(e){for(var i=[],o=0;o<e;o++)i.push("0");return i}(3-u.length),!0)):u=[];var w=u.join("."),p=function(e){for(var i=0,o=d.length;i<o;i++){var n=d[i],r=n[0];if(n[1].exec(e))return r}return null}(o),h=t.exec(o);return h&&h[1]?new n(c,w,p,h[1]):new i(c,w,p)}(navigator.userAgent):"undefined"!=typeof process&&process.version?new o(process.version.slice(1)):null;return{browser:c.name,version:c.version?c.version.split(".")[0]:0}}(),{polyfillUri:w}=window.__DW_SVELTE_PROPS__;l&&c[l]&&u>=c[l][0]?u<=c[l][1]&&document.write(`<script type="text/javascript" src="${w}/${l}-${u}.js"><\/script>`):document.write(`<script type="text/javascript" src="${w}/all.js"><\/script>`)}();