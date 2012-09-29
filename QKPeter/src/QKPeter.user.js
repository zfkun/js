// ==UserScript==
// @id 			  QKPeter
// @name          QKPeter
// @namespace     http://www.7k7k.com
// @description   QKPeter
// @include       http://www.7k7k.com/swf/*.htm*
// @version       1.0.0
// @run-at        document-end
// ==/UserScript==

(function(){

function addScript(callback) {
  var script, i, n;
  if (typeof callback === 'function') {
      script = document.createElement("script");
      script.textContent = "(" + callback.toString() + ")(window);";
      document.body.appendChild(script);
  } else if (callback && (n = callback.length) > 0) {
    for (i = 0; i < n; i++) {
        addScript(callback[i]);
    }
  }
}










// Main function
function main(window, undefined) {
    var document = window.document,
        head,
        console = window.console,
        toString = Object.prototype.toString,
        class2type = {
            '[object Function]' : 'function',
            '[object String]' : 'string',
            '[object Array]' : 'array'
        },
        
        oriMonitor = window.ActivityMonitor,
        v4 = oriMonitor.v4,
        guid = oriMonitor.guid,
        LOC = encodeURIComponent(window.location.href),
        CALLBACK,
        API = 'http://stat.app.7k7k.com/index.php' +
              '?f=ipt.get.json&from={p}&uid={u}&key={k}&time={r}';
        
    function type(o) {
        return (o === null || o === undefined) ?
            String(o) :
            class2type[toString.call(o)] || 'object';
    }

    function isPlainObject(o) {
        return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
    }

    function isString(o) {
        return type(o) == 'string';
    }

    function isArray(o) {
        return type(o) == 'array';
    }

    function isFunction(o) {
        return type(o) == 'function';
    }

    function _mix(p, r, s, ov, deep) {
        if (ov || !(p in r)) {
            var target = r[p],src = s[p];
            if (target === src) {
                return;
            }
            if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                var clone = target && (isArray(target) || isPlainObject(target)) ?
                    target :
                    (isArray(src) ? [] : {});
                r[p] = mix(clone, src, ov, undefined, true);
            } else if (src !== undefined) {
                r[p] = s[p];
            }
        }
    }

    function mix(r, s, ov, wl, deep) {
        if (!s || !r) {
            return r;
        }
        if (ov === undefined) {
            ov = true;
        }
        var i, p, len;

        if (wl && (len = wl.length)) {
            for (i = 0; i < len; i++) {
                p = wl[i];
                if (p in s) {
                    _mix(p, r, s, ov, deep);
                }
            }
        } else {
            for (p in s) {
                _mix(p, r, s, ov, deep);
            }
        }
        return r;
    }

    function extend(r, s, px, sx) {
        if (!s || !r) {
            return r;
        }

        var create = Object.create ?
            function(proto, c) {
                return Object.create(proto, {
                    constructor: {
                        value: c
                    }
                });
            } :
            function (proto, c) {
                function F() {
                }

                F.prototype = proto;

                var o = new F();
                o.constructor = c;
                return o;
            },
            sp = s.prototype,
            rp;

        // add prototype chain
        rp = create(sp, r);
        r.prototype = mix(rp, r.prototype);
        r.superclass = create(sp, s);

        // add prototype overrides
        if (px) {
            mix(rp, px);
        }

        // add object overrides
        if (sx) {
            mix(r, sx);
        }

        return r;
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
    function now() {
        return (new Date()).getTime();
    }
    
    /**
     * get login user's id
     */
    function getUserId(key) {
        return parseInt(getCookie(key || 'userid')) || 0;
    }

    /**
     * cookie getter
     */
    function getCookie(name) {
        var ret, m;
        if (typeof name === 'string') {
            if ((m = String(document.cookie).match(
                new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                ret = m[1] ? decodeURIComponent(m[1]) : '';
            }
        }
        return ret;
    }




    /**
     *	Monitor
     *
     *	@superclass	window.ActivityMonitor
     */
    function Monitor(options) {
        var self = this, ops;

	if (!(self instanceof Monitor)) {
	    return new Monitor(options);
	}

        ops = isPlainObject(options) ? options : {};
        
        self.notify = isFunction(ops.notify) ? ops.notify : null;

        self.callback = isString(ops.callback) && ops.callback;

        self.interval = ops.interval || 60000;

        //self.guid = guid(true);
    };

    Monitor.prototype = {

	start: function() {
            var self = this, key, uid, url, script;

            // clear timer
            clearTimeout(self.timer);

            // doActive
            doActive(self);

            // delay for next
            self.timer = setTimeout(function() {
                self.start();
            }, self.interval);
	},

	stop: function() {
            var self = this;
            clearTimeout(self.timer);
	}

    };


    function doActive(host) {
        var key, uid, url, script;
        
        // params init
        key = guid(true);
        uid = getUserId();
        url = substitute(API, {p: LOC, u: uid, k: key, r: now()});

        // lazy init
        if (!head) {
            head = document['head'] || 
                   document.getElementsByTagName("head")[0] ||
                   document.documentElement;
        }
        if (!host.callback) {
            window[host.callback = host.callback || ('__accb' + v4())] = function(data) {
                doNotify(host, 'call', data);
            };
        }

        // requester init
        script = document.createElement('script');
        script.sync = 'sync';
        script.src = url + '&callback=' + host.callback;
        head.insertBefore(script, head.firstChild);
        script = null;
    }

    /**
     * doNotify
     *     notify to subscriber
     *
     * @param   host    {Object}    Monitor Instance
     * @param   type    {String}    event type of notify
     * @param   data    {Object}    event data, contains 'guid' and 'count'
     *
     */
    function doNotify(host, type, data) {
        if (host && isFunction(host.notify)) {
            try {
                host.notify.call(host.notify, type, { guid: host.key, count: 0, data: data });
            } catch (ex) {
                if (console) {
                    console.error('[Notify Error]: ' + ex.message);
                }
            }
        }
    }
    
    

    /*
    function viewShowTiper(list) {
        var el = $('#growth-msg'), html = '';
        if(!el[0]) {
           el = $('<div id="activityMod"></div>').
                appendTo(document.body).
                css({
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    zIndex: 9999
                });
        }

        if (!el.html()) {
        html += '<div class="alert_wrap"><div class="a_box">';
        html += '<div class="a_box_hd"><i class="l_corner"></i><i class="r_corner"></i>';
        html += '<div class="a_title"><h3>7k7k提醒您</h3><a class="a_close" href="#" onclick="$.growth.forceClose();return false;"></a></div>';
        html += '</div>';
        html += '<div class="a_box_bd">';
        html += '<div class="login_tip growth-msg-pp">您还没登录无法获得奖励，请 <a class="a_blue" href="http://login.7k7k.com/login" target="_blank">登录</a> 或 <a class="a_blue" href="http://login.7k7k.com/register" target="_blank">注册</a></div>';
        html += '<ul class="msg_list" id="growth-msg-list"></ul>';
        html += '<div class="login_btn growth-msg-pp"><a title="立即登录领取" href="http://login.7k7k.com/login" target="_blank">立即登录领取</a></div>';
        html += '</div>';
        html += '<div class="a_box_ft"><i class="lb_corner"></i><i class="rb_corner"></i><div></div></div>';
        html += '</div></div>';
        el.html(html);
        }

        el.show();
    }

    function myNotify(type, data) {
        var d;
        if (console) console.info('[Notify]: ', type, ' -> ', data);
        switch (type) {
            case 'call':
                if ((d = data.data) && d.status === 1 && (d = d.data)) {
                    if (isArray(d = d.feed) && d.length > 0) {
                        viewShowTiper(d);
                    } else {
                        viewShowTiper([]);
                    }
                }
                break;
            default:
                break;
        }
    }
    */

    Monitor({ interval : 10000, notify : growthNotifyInterface }).start();
}


// load libs
addScript(main);
})();