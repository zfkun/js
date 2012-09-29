;(function(exports, undefined) {
    'use strict';

    var WIN = exports.window,
        DOC = exports.document,
        toString = Object.prototype.toString,

        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        addEventListener = 'addEventListener',
        removeEventListener = 'removeEventListener',
        attachEvent = 'attachEvent',
        detachEvent = 'detachEvent',
        EVENT_SCROLL = 'scroll',
        EVENT_RESIZE = 'resize',

        Utils,
        GUID = 0,
        INSTANCES = {};

    Utils = {

        isArray: function(obj) {
            var t = toString.call(obj);
            return t === '[object Array]' || t === '[object HTMLOptionsCollection]';
        },

        param: function(obj) {
            var rs = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) rs.push(k + '=' + encodeURIComponent(obj[k]));
            }
            return rs.join('&');
        },

        isIE6:(function() {
            var UA = navigator.userAgent, ver;
            if (WIN.ActiveXObject) {
                ver = 6;
                if (WIN.XMLHttpRequest || (UA.indexOf("MSIE 7.0") >= 0)) ver = 7;
                if (WIN.XDomainRequest || (UA.indexOf("Trident/4.0") >= 0)) ver = 8;
                if (UA.indexOf("Trident/5.0") >= 0) ver = 9;
                if (UA.indexOf("Trident/6.0") >= 0) ver = 10;
            }
            return ver && ver < 7;
        })(),

        mix: function(receiver, supplier) {
            for (var key in supplier) {
                // if (supplier.hasOwnProperty(key)) {
                    receiver[key] = supplier[key];
                // }
            }
            return receiver;
        },

        each: function(list, fn, scope) {
            var items = this.isArray(list) ? list : [list], exit;

            for (var i = 0, n = items.length; i < n; i++) {
                if (fn.call(scope || fn, items[i], i, list) === false) break;
            }

            return this;
        },

        on: DOC[addEventListener] ?
            function(el, type, fn, capture) {
                if (el[addEventListener]) el[addEventListener](type, fn, !!capture);
                return this;
            } :
            function(el, type, fn) {
                if (el[attachEvent]) el[attachEvent]('on' + type, fn);
                return this;
            },

        un: DOC[removeEventListener] ?
            function(el, type, fn, capture) {
                if (el[removeEventListener]) el[removeEventListener](type, fn, !!capture);
                return this;
            } :
            function(el, type, fn) {
                if (el[detachEvent]) el[detachEvent]('on' + type, fn);
                return this;
            }

    };


    Utils.each(['Width', 'Height'], function(name) {

        Utils['viewport' + name] = function() {
            var prop = 'client' + name,
                body = DOC[BODY],
                docProp = DOC[DOC_ELEMENT][prop];

            return DOC['compatMode'] === 'CSS1Compat' && docProp || body && body[prop] || docProp;
        };

    });


    function Coupleter(options) {
        var self = this, ops;

        if (!(self instanceof Coupleter)) return new Coupleter(options);

        ops = self.options = Utils.mix(Utils.mix({}, Coupleter.Options), options || {});

        if (ops.data && (ops.data[0] || ops.data[1])) {
            INSTANCES[self.guid = ++GUID] = self;
            
            self.attach();

            if (ops.auto) self.render();
        }

        return self;
    }

    Utils.mix(Coupleter.prototype, {

        render: function() {
            var self = this, ops = self.options, params = Utils.param(ops.param);

            if (!self.doms) self.doms = [];
            
            Utils.each(ops.data, function(val, index) {
                if (val) {
                    var d = val.split(','), el;
                    DOC[BODY].appendChild(el = DOC.createElement('div'));
                    el.style.cssText = 'display:none;' +
                            'position:' + (Utils.isIE6 ? 'absolute' : 'fixed') + ';' +
                            'z-index:' + ops.zIndex + ';' +
                            'top:' + ops.margin[0] + 'px;' +
                            (index ? 'right' : 'left') + ':' + (0 + ops.margin[1]) + 'px;';
                    el.innerHTML = '<a href="' + d[1] + (params ? (d[1].indexOf('?') < 0 ? '?' : '&') + params : '') + '" target="_blank" title="' + (d[2] || '') + '"><img src="' + d[0] + '" width="' + ops.width + '" height="' + ops.height + '" /></a><a style="display:block;text-align:right;font-size:13px;background-color:#F2F2F2;margin-top:3px;" href="#" onclick="QKCoupleter.dispose(' + self.guid + ');return false;">关闭</a>';
                    self.doms.push(el);
                    el = null;
                }
            });

            this.handler();
        },

        display: function(isHide) {
            Utils.each(this.doms, function(dom) {
                if (dom) dom.style.display = isHide ? 'none' : '';
            });
        },

        attach: function() {
            var self = this;

            if (!self.bound) {
                self.bound = function(ev) {
                    self.handler(ev);
                };
                Utils.on(WIN, EVENT_RESIZE, self.bound).on(WIN, EVENT_SCROLL, self.bound);
            }

            return self;
        },

        detach: function() {
            var self = this;

            if (self.bound) {
                Utils.un(WIN, EVENT_RESIZE, self.bound).un(WIN, EVENT_SCROLL, self.bound);
            }

            return self;
        },

        dispose: function() {
            var self = this;
            self.detach().display(true);
            Utils.each(self.doms, function(dom){
                if (dom.parentNode) dom.parentNode.removeChild(dom);
            });
            self.bound = null;
            self.doms = null;
        },

        handler: function(ev) {
            // ev = ev || WIN.event;
            var self = this,
                ops = self.options,
                vpWith = Utils.viewportWidth(),
                needHide = vpWith < ops.min,
                topVal;

            if (!needHide) {
                if (vpWith <= ops.page) { // page width too big
                    needHide = true;
                } else if ((vpWith - ops.page) / 2 < (ops.width + ops.margin[1])) { // space not enough
                    needHide = true;
                }
            }

            if (Utils.isIE6) {
                topVal = (DOC[BODY] && DOC[BODY].scrollTop || DOC[DOC_ELEMENT] && DOC[DOC_ELEMENT].scrollTop) + ops.margin[0] + 'px';
                Utils.each(self.doms, function(dom) { dom.style.top = topVal; });
            }

            self.display(needHide);
        }

    });

    Utils.mix(Coupleter, {

        Options: {

            auto: true,          // auto render

            page: 990,           // page content width

            min: 1280,           // viewpoint min-width for show AD

            max: 3000,           // viewpoint max-width for show AD

            margin: [40, 10],    // margin for page (top/bottom, left/right)

            width: 120,          // AD-image's width
            
            height: 400,         // AD-image's height

            param: {             // custom param for click url
                by: 'coupleter'
            },

            zIndex: 9999,        // z-index of css for AD-image

            data: [              // AD images data
                // 'imageUrl,clickUrl,title',
                // ...
            ]

        },

        dispose: function(guid) {
            if (INSTANCES[guid]) {
                INSTANCES[guid].dispose();
                delete INSTANCES[guid];
            }
        }

    });

    exports.QKCoupleter = Coupleter;

})(this);