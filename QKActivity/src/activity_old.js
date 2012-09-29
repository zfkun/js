/**
 * Activity Monitor
 *
 * @author  zfkun<zfkun@msn.com>
 *
 * @example
      // 1
      ActivityMonitor().start();
      
      // 2
      var myMonitor = ActivityMonitor({
        interval : 3000,
        uri : 'http://test.7k7k.com/monitor?p={p}&u={u}&m={m}&k={k}&r={r}'
      }).start();
 */
(function (exports) {
    var doc = exports.document,
        w3c = !!doc.addEventListener,
        
        LOC = encodeURIComponent(exports.location.href),
        INTERVAL = 60000,
        URI = 'http://115.182.59.105/stat.php?p={p}&u={u}&m={m}&k={k}&r={r}',
        GUID = 'guid',
        
        addEvent = w3c ? function (o, type, fn) {
            o.addEventListener(type, fn, false);
        } : function (o, type, fn) {
            o.attachEvent('on' + type, fn);
        },
        
        removeEvent = w3c ? function (o, type, fn) {
            o.removeEventListener(type, fn, false);
        } : function (o, type, fn) {
            o.detachEvent('on' + type, fn);
        };
    
    /**
     * Activity Monitor class
     *
     * @param   options {Object}    { interval : 60000, url : '' }
     */
    function Monitor(options) {
        var self = this;
        
        if (!(self instanceof Monitor)) {
            return new Monitor(options);
        }
        
        if (options) {
            INTERVAL = options.interval || INTERVAL;
            URI = options.uri || URI;
        }
        
        // make GUID
        self.key = Monitor.guid(true);

        // stay minute
        self.minute = 0;

        self._init();
        
        return self;
    }

    Monitor.prototype = {

        _init : function () {
            this.time = nowTime();
        },
        
        /**
         * Start Monitor
         */
        start : function () {
            var self = this;
            
            // activity event monitor
            if (!self.fn) {
                self._fn = function (e) {
                    //removeEvent(doc, 'mousemove', self._fn);
                    e = e || event;
                    var x = e.pageX || e.clientX, y = e.pageY || e.clientY;
                    if (self.x !== x && self.y !== y) {
                        self.x = x;
                        self.y = y;
                        self.alive = 1;
                    }
                };
                addEvent(doc, 'mousemove', self._fn);
            }
            
            // poll checker
            onTime(self, true);
            
            return self;
        },
        
        /**
         * Stop Monitor
         */
        stop : function () {
            var self = this;
            self._timer = clearTimeout(self._timer);
            return self;
        }
    };
    
    /**
     * v4 for GUID
     *
     * @return  {String} random string of length 4
     *
     */
    Monitor.v4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    
    /**
     * GUID Maker
     *
     * @return  {String}    GUID string
     *
     */
    Monitor.guid = function(useCookie) {
        var g = useCookie ? getCookie(GUID) : '';
        
        if (useCookie && typeof g === 'string' && g.length > 0) {
            return g;
        }
        
        g = '';
        
        for (var i = 0; i < 8; i++) {
            g += Monitor.v4();
        }
        
        g += nowTime();
        
        if (useCookie) {
            setCookie(GUID, g, 1, '7k7k.com', '/');
        }
        
        return g;
    };
    
    
    /**
     * call at every minute
     *
     * @param   host    {Object}    ActivityMonitor Instance
     *
     */
    function onTime(host, isFirst) {
        if (!isFirst) {
            ++host.minute;

            // if alive ?
            if (host.alive === 1) {
                host.alive = 0;

                var img = new Image(1, 1);
                img.src = substitute(URI, {
                    p : LOC,
                    u : getCookie('userid') | 0,
                    m : host.minute,
                    k : host.key,
                    r : nowTime()
                });
                
                //addEvent(doc, 'mousemove', host._fn);
            }

        }
        
        // continue, waiting for nexttime
        host._timer = setTimeout(function (){
            onTime(host);
        }, INTERVAL);
    }
    
    
    /**
     * Utils of 'substitute'
     */
    function substitute(str, o, regexp) {
        return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (o[name] !== undefined) ? o[name] : '';
        });
    }
    
    /**
     * time of now
     */
    function nowTime() {
        return (new Date()).getTime();
    }
    
    /**
     * cookie getter
     */
    function getCookie(name) {
        var ret, m;
        if (typeof name === 'string') {
            if ((m = String(doc.cookie).match(
                new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                ret = m[1] ? decodeURIComponent(m[1]) : '';
            }
        }
        return ret;
    }
    
    function setCookie(name, val, expires, domain, path, secure) {
        var text = String(encodeURIComponent(val)), date = expires;

        // by day
        if (typeof date === 'number') {
            date = new Date();
            date.setTime(date.getTime() + expires * 86400000);
        }
        // expiration date
        if (date instanceof Date) {
            text += '; expires=' + date.toUTCString();
        }

        // domain
        if (typeof domain === 'string' && domain != '') {
            text += '; domain=' + domain;
        }

        // path
        if (typeof path === 'string' && path != '') {
            text += '; path=' + path;
        }

        // secure
        if (secure) {
            text += '; secure';
        }

        doc.cookie = name + '=' + text;
    }
    
    // publish
    exports.ActivityMonitor = Monitor;

})(window);