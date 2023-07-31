var SassDoc;
(function (SassDoc) {
    var Application = (function () {
        function Application() {
            var _this = this;
            this.idx = lunr.Index.load(sassdocIndex);
            this.header = document.querySelector('.header');
            this.footer = document.querySelector('.ui-footer');
            this.sidebar = document.querySelector('.nav-wrapper__nav');
            this.searchInput = document.getElementById('search-docs');
            this.searchBox = document.getElementById('search-results');
            this.scrollPosition = 0;
            this.updating = false;
            this.sidebarHeight = this.sidebar.offsetHeight;
            this.headerHeight = this.header.offsetHeight;
            this.searchHeight = this.searchInput.offsetHeight;
            this.renderListItems = function (items, onClickHandler) {
                return items.map(function (item) { return _this.renderListItem(item, onClickHandler); }).join('');
            };
            this.renderListItem = function (item, handler) {
                var arr = item.ref.split('-');
                var type = arr[0];
                var name = arr.slice(1).join('-');
                clickHandler = handler;
                return "\n            <li class=\"search-form__results-list-item\">\n                <a href=#" + item.ref + " onclick=\"clickHandler()\">\n                    <span class=\"item--" + type + "\">" + type.substring(0, 3) + "</span>\n                    <span>" + name + "</span>\n                </a>\n            </li>\n            ";
            };
            this.listTemplate = function (items) {
                return "\n            <ul class=\"search-form__results-list\">\n                " + _this.renderListItems(items, _this.hideSearchResults) + "\n            </ul>\n        ";
            };
            this.onToggleHandler = function (group, parent) {
                var subnav = document.querySelectorAll("." + group);
                parent.classList.toggle(parent.classList[0] + "--collapsed");
                for (var _i = 0, subnav_1 = subnav; _i < subnav_1.length; _i++) {
                    var nav = subnav_1[_i];
                    nav.classList.toggle(nav.classList[0] + "--collapsed");
                }
            };
            this.showSearchResults = function () {
                _this.searchBox.classList.remove('search-form__results--hidden');
            };
            this.hideSearchResults = function () {
                _this.searchBox.classList.add('search-form__results--hidden');
            };
            window.addEventListener('scroll', this.onScrollHandler.bind(this), false);
            this.searchInput.addEventListener('input', this.search.bind(this), false);
            this.toggle('.nav-group__header', 'click');
            hljs.initHighlightingOnLoad();
        }
        Application.prototype.toggle = function (selector, trigger) {
            var _this = this;
            var items = document.querySelectorAll(selector);
            var _loop_1 = function (item) {
                var group = item.dataset.toggles;
                item.addEventListener(trigger, function () { return _this.onToggleHandler(group, item); });
            };
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                _loop_1(item);
            }
        };
        Application.prototype.search = function (e) {
            var term = e.target.value;
            var result;
            if (term) {
                result = this.idx.search(term + "~1");
                this.renderSearchItems(this.searchBox, this.listTemplate, result);
            }
            else {
                this.renderSearchItems(this.searchBox, function () { return ''; }, null);
                return;
            }
        };
        Application.prototype.renderSearchItems = function (target, template, data) {
            if (data) {
                target.innerHTML = template(data);
                this.showSearchResults();
            }
            else {
                this.hideSearchResults();
            }
        };
        Application.prototype.onScrollHandler = function () {
            this.scrollPosition = window.pageYOffset;
            this.requestSidebarUpdate();
        };
        Application.prototype.requestSidebarUpdate = function () {
            if (!this.updating) {
                window.requestAnimationFrame(this.updateSidebar.bind(this));
            }
            this.updating = true;
        };
        Application.prototype.updateSidebar = function () {
            var proposedHeight = this.footer.offsetTop - this.scrollPosition - (this.headerHeight + this.searchHeight);
            if (this.sidebarHeight > proposedHeight) {
                this.sidebar.style.height = proposedHeight + "px";
            }
            else {
                this.sidebar.style.height = "calc(100% - " + (this.headerHeight + this.searchHeight) + "px)";
            }
            this.updating = false;
        };
        return Application;
    }());
    var application = new Application();
})(SassDoc || (SassDoc = {}));

/*! highlight.js v9.12.0 | BSD3 License | git.io/hljslicense */
!function(e){var n="object"==typeof window&&window||"object"==typeof self&&self;"undefined"!=typeof exports?e(exports):n&&(n.hljs=e({}),"function"==typeof define&&define.amd&&define([],function(){return n.hljs}))}(function(e){function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0===t.index}function a(e){return k.test(e)}function i(e){var n,t,r,i,o=e.className+" ";if(o+=e.parentNode?e.parentNode.className:"",t=B.exec(o))return w(t[1])?t[1]:"no-highlight";for(o=o.split(/\s+/),n=0,r=o.length;r>n;n++)if(i=o[n],a(i)||w(i))return i}function o(e){var n,t={},r=Array.prototype.slice.call(arguments,1);for(n in e)t[n]=e[n];return r.forEach(function(e){for(n in e)t[n]=e[n]}),t}function u(e){var n=[];return function r(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3===i.nodeType?a+=i.nodeValue.length:1===i.nodeType&&(n.push({event:"start",offset:a,node:i}),a=r(i,a),t(i).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:i}));return a}(e,0),n}function c(e,r,a){function i(){return e.length&&r.length?e[0].offset!==r[0].offset?e[0].offset<r[0].offset?e:r:"start"===r[0].event?e:r:e.length?e:r}function o(e){function r(e){return" "+e.nodeName+'="'+n(e.value).replace('"',"&quot;")+'"'}s+="<"+t(e)+E.map.call(e.attributes,r).join("")+">"}function u(e){s+="</"+t(e)+">"}function c(e){("start"===e.event?o:u)(e.node)}for(var l=0,s="",f=[];e.length||r.length;){var g=i();if(s+=n(a.substring(l,g[0].offset)),l=g[0].offset,g===e){f.reverse().forEach(u);do c(g.splice(0,1)[0]),g=i();while(g===e&&g.length&&g[0].offset===l);f.reverse().forEach(o)}else"start"===g[0].event?f.push(g[0].node):f.pop(),c(g.splice(0,1)[0])}return s+n(a.substr(l))}function l(e){return e.v&&!e.cached_variants&&(e.cached_variants=e.v.map(function(n){return o(e,{v:null},n)})),e.cached_variants||e.eW&&[o(e)]||[e]}function s(e){function n(e){return e&&e.source||e}function t(t,r){return new RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var o={},u=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");o[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?u("keyword",a.k):x(a.k).forEach(function(e){u(e,a.k[e])}),a.k=o}a.lR=t(a.l||/\w+/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),null==a.r&&(a.r=1),a.c||(a.c=[]),a.c=Array.prototype.concat.apply([],a.c.map(function(e){return l("self"===e?a:e)})),a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var c=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=c.length?t(c.join("|"),!0):{exec:function(){return null}}}}r(e)}function f(e,t,a,i){function o(e,n){var t,a;for(t=0,a=n.c.length;a>t;t++)if(r(n.c[t].bR,e))return n.c[t]}function u(e,n){if(r(e.eR,n)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?u(e.parent,n):void 0}function c(e,n){return!a&&r(n.iR,e)}function l(e,n){var t=N.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function p(e,n,t,r){var a=r?"":I.classPrefix,i='<span class="'+a,o=t?"":C;return i+=e+'">',i+n+o}function h(){var e,t,r,a;if(!E.k)return n(k);for(a="",t=0,E.lR.lastIndex=0,r=E.lR.exec(k);r;)a+=n(k.substring(t,r.index)),e=l(E,r),e?(B+=e[1],a+=p(e[0],n(r[0]))):a+=n(r[0]),t=E.lR.lastIndex,r=E.lR.exec(k);return a+n(k.substr(t))}function d(){var e="string"==typeof E.sL;if(e&&!y[E.sL])return n(k);var t=e?f(E.sL,k,!0,x[E.sL]):g(k,E.sL.length?E.sL:void 0);return E.r>0&&(B+=t.r),e&&(x[E.sL]=t.top),p(t.language,t.value,!1,!0)}function b(){L+=null!=E.sL?d():h(),k=""}function v(e){L+=e.cN?p(e.cN,"",!0):"",E=Object.create(e,{parent:{value:E}})}function m(e,n){if(k+=e,null==n)return b(),0;var t=o(n,E);if(t)return t.skip?k+=n:(t.eB&&(k+=n),b(),t.rB||t.eB||(k=n)),v(t,n),t.rB?0:n.length;var r=u(E,n);if(r){var a=E;a.skip?k+=n:(a.rE||a.eE||(k+=n),b(),a.eE&&(k=n));do E.cN&&(L+=C),E.skip||(B+=E.r),E=E.parent;while(E!==r.parent);return r.starts&&v(r.starts,""),a.rE?0:n.length}if(c(n,E))throw new Error('Illegal lexeme "'+n+'" for mode "'+(E.cN||"<unnamed>")+'"');return k+=n,n.length||1}var N=w(e);if(!N)throw new Error('Unknown language: "'+e+'"');s(N);var R,E=i||N,x={},L="";for(R=E;R!==N;R=R.parent)R.cN&&(L=p(R.cN,"",!0)+L);var k="",B=0;try{for(var M,j,O=0;;){if(E.t.lastIndex=O,M=E.t.exec(t),!M)break;j=m(t.substring(O,M.index),M[0]),O=M.index+j}for(m(t.substr(O)),R=E;R.parent;R=R.parent)R.cN&&(L+=C);return{r:B,value:L,language:e,top:E}}catch(T){if(T.message&&-1!==T.message.indexOf("Illegal"))return{r:0,value:n(t)};throw T}}function g(e,t){t=t||I.languages||x(y);var r={r:0,value:n(e)},a=r;return t.filter(w).forEach(function(n){var t=f(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}),a.language&&(r.second_best=a),r}function p(e){return I.tabReplace||I.useBR?e.replace(M,function(e,n){return I.useBR&&"\n"===e?"<br>":I.tabReplace?n.replace(/\t/g,I.tabReplace):""}):e}function h(e,n,t){var r=n?L[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}function d(e){var n,t,r,o,l,s=i(e);a(s)||(I.useBR?(n=document.createElementNS("http://www.w3.org/1999/xhtml","div"),n.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):n=e,l=n.textContent,r=s?f(s,l,!0):g(l),t=u(n),t.length&&(o=document.createElementNS("http://www.w3.org/1999/xhtml","div"),o.innerHTML=r.value,r.value=c(t,u(o),l)),r.value=p(r.value),e.innerHTML=r.value,e.className=h(e.className,s,r.language),e.result={language:r.language,re:r.r},r.second_best&&(e.second_best={language:r.second_best.language,re:r.second_best.r}))}function b(e){I=o(I,e)}function v(){if(!v.called){v.called=!0;var e=document.querySelectorAll("pre code");E.forEach.call(e,d)}}function m(){addEventListener("DOMContentLoaded",v,!1),addEventListener("load",v,!1)}function N(n,t){var r=y[n]=t(e);r.aliases&&r.aliases.forEach(function(e){L[e]=n})}function R(){return x(y)}function w(e){return e=(e||"").toLowerCase(),y[e]||y[L[e]]}var E=[],x=Object.keys,y={},L={},k=/^(no-?highlight|plain|text)$/i,B=/\blang(?:uage)?-([\w-]+)\b/i,M=/((^(<[^>]+>|\t|)+|(?:\n)))/gm,C="</span>",I={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0};return e.highlight=f,e.highlightAuto=g,e.fixMarkup=p,e.highlightBlock=d,e.configure=b,e.initHighlighting=v,e.initHighlightingOnLoad=m,e.registerLanguage=N,e.listLanguages=R,e.getLanguage=w,e.inherit=o,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},e.C=function(n,t,r){var a=e.inherit({cN:"comment",b:n,e:t,c:[]},r||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e.METHOD_GUARD={b:"\\.\\s*"+e.UIR,r:0},e});hljs.registerLanguage("scss",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",i={cN:"variable",b:"(\\$"+t+")\\b"},r={cN:"number",b:"#[0-9A-Fa-f]+"};({cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:!0,i:"[^\\s]",starts:{eW:!0,eE:!0,c:[r,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"meta",b:"!important"}]}});return{cI:!0,i:"[=/|']",c:[e.CLCM,e.CBCM,{cN:"selector-id",b:"\\#[A-Za-z0-9_-]+",r:0},{cN:"selector-class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"selector-attr",b:"\\[",e:"\\]",i:"$"},{cN:"selector-tag",b:"\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b",r:0},{b:":(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)"},{b:"::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)"},i,{cN:"attribute",b:"\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b",i:"[^\\s]"},{b:"\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b"},{b:":",e:";",c:[i,r,e.CSSNM,e.QSM,e.ASM,{cN:"meta",b:"!important"}]},{b:"@",e:"[{;]",k:"mixin include extend for if else each while charset import debug media page content font-face namespace warn",c:[i,e.QSM,e.ASM,r,e.CSSNM,{b:"\\s[A-Za-z0-9_.-]+",r:0}]}]}});hljs.registerLanguage("xml",function(s){var e="[A-Za-z0-9\\._:-]+",t={eW:!0,i:/</,r:0,c:[{cN:"attr",b:e,r:0},{b:/=\s*/,r:0,c:[{cN:"string",endsParent:!0,v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s"'=<>`]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist"],cI:!0,c:[{cN:"meta",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},s.C("<!--","-->",{r:10}),{b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{b:/<\?(php)?/,e:/\?>/,sL:"php",c:[{b:"/\\*",e:"\\*/",skip:!0}]},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{name:"style"},c:[t],starts:{e:"</style>",rE:!0,sL:["css","xml"]}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{name:"script"},c:[t],starts:{e:"</script>",rE:!0,sL:["actionscript","javascript","handlebars","xml"]}},{cN:"meta",v:[{b:/<\?xml/,e:/\?>/,r:10},{b:/<\?\w+/,e:/\?>/}]},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"name",b:/[^\/><\s]+/,r:0},t]}]}});hljs.registerLanguage("typescript",function(e){var r={keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class public private protected get set super static implements enum export import declare type namespace abstract as from extends async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document any number boolean string void Promise"};return{aliases:["ts"],k:r,c:[{cN:"meta",b:/^\s*['"]use strict['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{cN:"function",b:"(\\(.*?\\)|"+e.IR+")\\s*=>",rB:!0,e:"\\s*=>",c:[{cN:"params",v:[{b:e.IR},{b:/\(\s*\)/},{b:/\(/,e:/\)/,eB:!0,eE:!0,k:r,c:["self",e.CLCM,e.CBCM]}]}]}],r:0},{cN:"function",b:"function",e:/[\{;]/,eE:!0,k:r,c:["self",e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:r,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/%/,r:0},{bK:"constructor",e:/\{/,eE:!0,c:["self",{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:r,c:[e.CLCM,e.CBCM],i:/["'\(]/}]},{b:/module\./,k:{built_in:"module"},r:0},{bK:"module",e:/\{/,eE:!0},{bK:"interface",e:/\{/,eE:!0,k:"interface extends"},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{cN:"meta",b:"@[A-Za-z]+"}]}});
(function (window, $, Modernizr) {
    Array.prototype.clean = function (deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    var $window = $(window),
        $topButton = $('#top-button'),
        $sidebar = $('.nav-sidebar'),
        $body = $('body'),
        $content;

    var _private = {
        currentPageInfo: {}
    };

    var common = {

        contentContainerId: '#document-content-container',

        contentElementId: '#document-content',

        $errorPublishedMessage: $('#error-published-message'),

        contentFolderName: 'help',

        homePages: ["index", "home-page"],

        topicAPI: "",

        isOnline: false,

        baseURI: window.baseURI || "",

        footer: $('#footer-container'),

        currentPageInfo: function (info) {
            if (info) {

                if (_private.currentPageInfo.pageName != info.pageName) {

                    // Google Analytics
                    //ga('send', 'pageview', location. name);

                    //tabs:
                    //$('<div>', { id: 'Syntax-VBAll' }).append($('#Syntax-VB')).append('&nbsp;').append($('#Syntax-VBUsage')).appendTo('.TabContainer');
                    //$(".TabContainer").tabs({
                    //    active: 1,
                    //    activate: function (event, ui) {
                    //        if (ui.newTab.children('a').attr('href') == "#Syntax-CS") {
                    //            $("div.FilteredContentCS").show();
                    //            $("div.FilteredContentVB").hide()
                    //        }
                    //        else {
                    //            $("div.FilteredContentCS").hide();
                    //            $("div.FilteredContentVB").show()
                    //        }
                    //    }
                    //});
                }
                _private.currentPageInfo = info;

                //if (info.title && common.shouldUsePushState()) {
                //    window.document.title = igViewer.locale.pageTitleFormat.replace("{0}", info.title);

                //    var emailLink = $("#fine-print a").not(".github-link");
                //    var href = emailLink.attr("href");
                //    href = href.split('=')[0] + '=' + info.title + " (" + info.pageName + ")";
                //    emailLink.attr("href", href);
                //}
                return;
            }

            return _private.currentPageInfo;
        },

        versionQuery: function (q) {
            var query = q || window.location.search;
            var version = query.match(/[\?&]v=(\d\d\.\d)/);
            if (version && version[1]) {
                return '?v=' + version[1];
            }
            return "";
        },

        isContentPage: function () {
            if (common.path && common.path.length) {
                return true;
            }

            if (common.isOnIndexPage()) {
                return true;
            }

            return false;
        },

        getPageInfo: function (fileName, title) {
            var pageName = fileName.replace(/\.html(?=\?|$)/i, '').toLowerCase();
            // TODO: better home pages handling
            if (common.isOnIndexPage(pageName) && !common.isOnline && common.baseURI) {
                common.baseURI = "../";
            }

            var ext = common.baseURI + fileName,
                noExt = common.baseURI + pageName,
                api = common.topicAPI + pageName;

            var info = {
                title: title,
                fileName: fileName,
                pageName: pageName,
                path: {
                    navigation: common.isOnline ? noExt : ext,
                    service: common.isOnline ? api : ext,
                    noExt: noExt,
                    api: api,
                    ext: ext
                },
                isContentPage: common.isContentPage()
            };

            return info;
        },

        getPageNameFromLocation: function () {
            var pathParts = window.location.pathname.split('/');
            pathParts = pathParts.clean('');
            var name = common.isOnline ? "" : common.homePages[2];

            if (pathParts.length > 1) {
                name = common.isOnline ? pathParts.pop().toLowerCase() : pathParts.pop();
            }

            //append version to the path:
            name += common.versionQuery();

            return decodeURIComponent(name);
        },

        isOnIndexPage: function (page) {
            if (!page) {
                var pathname = location.protocol + "//" + location.host + location.pathname;
                if (pathname === common.baseURI) {
                    return true;
                }
                page = pathname.replace(common.baseURI, "");
            };
            return jQuery.inArray(page, common.homePages) !== -1;
        },

        isCurrentPage: function (path, query) {
            path = path || window.location.protocol + "//" + window.location.host + window.location.pathname;
            path += common.versionQuery(query);
            return common.currentPageInfo().path.navigation == path;
        },

        isUsingWebServer: function () {
            var protocol = window.location.protocol;
            return (protocol === 'http:' || protocol === 'https:');
        },

        isSmallDeviceWidth: function () {
            return $window.width() < 768;
        },

        shouldUsePushState: function () {
            if (Modernizr.history) {
                return common.isUsingWebServer();
            }
            return false;
        },

        hasLocationHash: function () {
            return window.location.hash && window.location.hash.length > 0;
        },

        refreshHash: function () {
            //D.P. this actually works better than changing the hash back and forth, no extra history entries.
            if (common.hasLocationHash()) {
                window.location.assign(window.location.href);
            }
        },

        scrollToTop: function () {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        },

        adjustTopLinkPos: function () {
        	var scrollPos = $window.height() + $window.scrollTop();
        	var footerTop = common.footer.offset().top;
            if (scrollPos > footerTop) {
                $topButton.css({ position: "absolute" });
            }
            else {
                $topButton.css({ position: "fixed" });
            }
        },

        publishErrorToServer: function (error) {
            var errorText;

            if (error.message) {
                errorText = ' Message: ' + error.message;
            }

            if (error.stack) {
                errorText += ' Stack: ' + error.stack;
            }

            var msg = {
                errorText: errorText,
                url: window.document.location.href
            };

            $.post('api/error', msg);

            common.$errorPublishedMessage.fadeIn();
        },

        syncSidebarHeight: function () {
            var contentMinHeight = undefined,
                sidebarHeight = $sidebar.height();
            $content = $content || $(common.contentContainerId).parent();
            contentMinHeight = $content.data("defaultMinHeight");
            if (contentMinHeight === undefined) {
                contentMinHeight = parseInt($content.css("minHeight"), 10);
                $content.data("defaultMinHeight", contentMinHeight);
            }

            if (sidebarHeight > contentMinHeight) {
                $content.css("minHeight", sidebarHeight);
            } else {
                $content.css("minHeight", contentMinHeight);
            }
        },

        toAbsoluteURL: function (relative) {
            var a = window.document.createElement('a');
            a.href = relative;
            return a.href;
        },

        getProductList: function () {
            var value = $body.attr('data-product-list');
            var list = [];

            if (value !== undefined) {
                list = value.split('|');
            }

            return list;
        }
    };

    $topButton.children('button').click(function (e) {
        common.scrollToTop();
        this.blur();
    });

    common.$errorPublishedMessage.on("click", ".close", function (e) {
        common.$errorPublishedMessage.fadeOut();
    });

    common.isOnline = $('body').attr('data-mode') === "online";
    common.baseURI = common.toAbsoluteURL(common.baseURI);

    common.currentPageInfo(common.getPageInfo(common.getPageNameFromLocation()));

    common.adjustTopLinkPos();
    common.refreshHash();
    $window.scroll(common.adjustTopLinkPos);
    $window.one("load", function () {
        common.syncSidebarHeight();
    });
    //window.setTimeout(function () {
    //    $("#wrong-version").slideUp(500);
    //}, 5000);
    
    window.igViewer = window.igViewer || {};
    window.igViewer.common = common;

}(window, jQuery, Modernizr));
(function ($, Modernizr, window, igViewer) {

	var $window, $navContainer, $navButton;

	var svc = {

	    addImgResponsiveClass: function (element) {
	        var images = element.find('img');
	        images.each(function (imgIndex, img) {
	            var $img = $(img);
	            if (!$img.attr('class')) {
	                $img.addClass('img-responsive');
	            } else if ($img.attr('class').indexOf('img-responsive') === -1) {
	                $img.addClass('img-responsive');
	            }
	        });
	    }
	};

	$(function () {
	    var width,
            $element = $(".main-box");

	    $window = $(window);
	    $navButton = $('#nav-button');
	    $navContainer = $('#nav-container');

	    if ($element.length === 1) {
	        svc.addImgResponsiveClass($element);
	    }

	    var showOrHideNavigation = function () {
	        if ($(window).width() == width) {
	            return;
	        }
	        // cache width to stop misfires
	        width = $window.width();

	        if (window.matchMedia && window.matchMedia("print").matches) return;
	        var mode = (igViewer.common.isSmallDeviceWidth()) ? 'hide' : 'show';
	        // $navContainer.collapse(mode);
	        //$navContainer[mode](350); // jquery version
	        igViewer.common.syncSidebarHeight();
	    };

	    //init collapse widget w/o toggle
	    // $navContainer.collapse({ toggle: false });
	    showOrHideNavigation();

	    $window.on('resize', showOrHideNavigation);

	    $navButton.click(function (e) {
	        // $navContainer.collapse('toggle');
	        //$navContainer.toggle(350); // jquery version

	        var isHidden = parseInt($navContainer.height()) === 0,
				label = (isHidden) ? igViewer.locale.navHideLabel : igViewer.locale.navShowLabel;

	        $navButton.text(label).blur();

	        if (label === igViewer.locale.navShowLabel) {
	            igViewer.common.scrollToTop();
	        }
	    });
	});

	igViewer = igViewer || {};
	igViewer.renderingService = svc;

}(jQuery, Modernizr, window, window.igViewer));

(function() {
    // function initTabs() {
    //     var tabs = $('#tabs');
    //     if (tabs.length > 0) {
    //         $('#tabs').on('tabscreate', function(event, ui) {
    //             $('#document-content-container, #fine-print').fadeIn();
    //         });
    //     } else {
    //         $('#document-content-container, #fine-print').fadeIn();
    //     }
    // }

    function initNavigation() {
         var navBaseUrl = $('body').data('base-url');
         if (!navBaseUrl.length) {
             return;
         }

         var navUrl = navBaseUrl + '/navigation';

         var request = $.ajax({
             url: navUrl,
             type: 'get',
             xhrFields: {
                 withCredentials: false
             }
         }).done(function(data) {
             var nav = $(data);
             var header = nav.find('#header')[0].outerHTML;
             $('#header').replaceWith(header);

             var logOutLink = $('#logOutLink');
             if (logOutLink.length !== 0) {
                 // Removing query string. It might contain bad ReturnUrl.
                 var newLink = logOutLink.attr('href').split('?')[0];
                 logOutLink.attr('href', newLink);
             }

             var footer = nav.find('footer.ui-footer')[0].outerHTML;
             $('footer.ui-footer').replaceWith(footer);

             var copyrightFooter = nav.find('#footer')[0].outerHTML;
             $('#footer').replaceWith(copyrightFooter);

             window.igViewer.common.footer = $('#footer-container');

             igNavigation.init();
         });
        window.igViewer.common.footer = $('#footer-container');

        igNavigation.init();
    }

    //     $.ajax({
    //         url: secondaryHeaderUrl,
    //         type: 'get'
    //     }).done(function(data) {
    //         $('#secondaryHeader').replaceWith(data);
    //     });
    // }

    // initTabs();

    initNavigation();
    // initSecondaryHeader();

    $(document).ready(function() {
        window.igViewer.common.adjustTopLinkPos();
    });
})();
