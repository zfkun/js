/**
 * Activity Monitor
 *
 * @author  zfkun<zfkun@msn.com>
 *
 * @example
	  // simple
	  ActivityMonitor().start();

	  // advanced
	  function myNotify(type, data){
		if (window.console) console.info('notify['+type+']:', ' ' , data);
	  }
	  // 1.
	  ActivityMonitor({
		stopAt : 5, // just enabled for guestor
		warnAt : 2, // enabled for guestor
		notifyBy : 3,
		notify : window.myNotifyFn,
		interval : 2000,
		warnBy : [1000 * 1, 1000 * 6], // then, "warnAt" would not work.
		uri : 'http://stat.app.7k7k.com/index.php?f=ipt.get.json&from={p}&aid={a}&uid={u}&key={k}&stay={s}&time={r}'
	  }).start();
 */
(function(exports) {
	var win = exports.window,
		doc = exports.document,
		loger = exports.console,
		w3c = !!doc.addEventListener,

		LOC = encodeURIComponent(exports.location.href),
		STOP_AT = 0,
		WARN_AT = 0,
		CALL_AT = 1,
		NOTIFY_BY = 0,
		WARN_BY = [1000 * 60 * 5, 1000 * 60 * 60],
		INTERVAL = 60000,
		STATUS_BY = 3000,
		WHEN_ENTER = true,
        WHEN_LEAVE = true,
        URI = 'http://stat.app.7k7k.com/index.php?f=ipt.get.json&from={p}&aid={a}&uid={u}&key={k}&stay={s}&time={r}',
		GUID = 'guid',
		CALLBACK,

		STATUS_LAST,
		INSTANCES = [],

		EVENT_TYPE_MOUSEMOVE = 'mousemove',
		EVENT_TYPE_MOUSEDOWN = 'mousedown',
		EVENT_TYPE_KEYDOWN = 'keydown',
		EVENT_TYPE_BEFOREUNLOAD = 'beforeunload',


		addEvent = w3c ? function(o, type, fn) {
			o.addEventListener(type, fn, false);
		} : function(o, type, fn) {
			o.attachEvent('on' + type, fn);
		},

		removeEvent = w3c ? function(o, type, fn) {
			o.removeEventListener(type, fn, false);
		} : function(o, type, fn) {
			o.detachEvent('on' + type, fn);
		},

		addEvents = function(o, types, fn) {
			var i, n, ts = (types || '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').split(' ');
			for (i = 0, n = ts.length; i < n; i++) {
				addEvent(o, ts[i], fn);
			}
		};

	/**
	 * Activity Monitor class
	 *
	 * @param   options {Object}
	 */
	function Monitor(options) {
		var self = this;

		if (!(self instanceof Monitor)) {
			return new Monitor(options);
		}

		// cache reference
		INSTANCES[self.GID = Monitor.guid()] = self;

		// set current visitor's status, start checker thread
		STATUS_LAST = userStatusCheck(true);

		// check options
		if (options) {
			STOP_AT = options.stopAt || STOP_AT;
			WARN_AT = options.warnAt || WARN_AT;
			CALL_AT = options.callAt || CALL_AT;
			NOTIFY_BY = options.notifyBy || NOTIFY_BY;
			WARN_BY = options.warnBy || WARN_BY;
			INTERVAL = options.interval || INTERVAL;
			STATUS_BY = options.statusBy === 0 ? 0 : options.statusBy || STATUS_BY;
            WHEN_ENTER = typeof options.whenEnter === 'boolean' ? options.whenEnter : WHEN_ENTER;
            WHEN_LEAVE = typeof options.whenLeave === 'boolean' ? options.whenLeave : WHEN_LEAVE;
			URI = options.uri || URI;
			CALLBACK = options.callback || CALLBACK;
			self._notify = options.notify;
		}

		// make aid
		self.gid = Monitor.guid();

		// make GUID
		self.key = Monitor.guid(true);

		// init main
		self._init();

		return self;
	}

	Monitor.prototype = {

		_init: function() {
			var self = this, now = nowTime();

			self.initTime = now;
			self.lastTime = now;
			self.sendCount = 0;
			self.warnCount = 0;

            // stat visitor's page-enter-time, send at first.
            if (WHEN_ENTER) {
				(new Image()).src = substitute(URI, {
				    p: LOC,
				    u: getUserId(),
				    a: self.gid,
				    k: self.key,
				    s: getStayTime(self, -1),
				    r: now
				});
            }

			// stat visitor's page-stay-time, send at onbeforeunload.
			if (WHEN_LEAVE) {
                addEvent(win, EVENT_TYPE_BEFOREUNLOAD, function() {
				    removeEvent(win, EVENT_TYPE_BEFOREUNLOAD, arguments.callee);
				    (new Image()).src = substitute(URI, {
					    p: LOC,
					    u: getUserId(),
					    a: self.gid,
					    k: self.key,
					    s: getStayTime(self),
					    r: nowTime()
				    });

				    // hack for request auto abort at IE & FF
				    setTimeout(function() {},1000);
			    });
            }

			// callback notify
			if (CALL_AT > 0) {
				self.called = 0;
				exports[self.callback = CALLBACK || ('__accb' + Monitor.v4())] = function(data) {
					var count;
					if ((count = ++self.called) % CALL_AT === 0) {
						notify(self, 'call', {guid: self.key, count: count, data: data});
					}
				};
			}

			// dispose
			self._init = null;
		},

		destory: function() {
			var gid = this.GID;
			if (gid) {
				INSTANCES[gid] = null;
				delete INSTANCES[gid];
			}
		},

		/**
		 * Start Monitor
		 */
		start: function() {
			var self = this;

			// Mouse Event
			if (!self._fn) {
				self._fn = function(e) {
					e = e || event;
					var x = e.pageX || e.clientX, y = e.pageY || e.clientY;
					if (self.x !== x && self.y !== y) {
						self.x = x;
						self.y = y;
						onActivity(self);
					}
				};
				addEvent(doc, EVENT_TYPE_MOUSEMOVE, self._fn);
			}

			// Key Event
			if (!self._do) {
				self._do = function() {
					onActivity(self);
				};
				addEvents(doc, EVENT_TYPE_KEYDOWN + ' ' + EVENT_TYPE_MOUSEDOWN, self._do);
			}

			return self;
		},

		/**
		 * Stop Monitor
		 */
		stop: function() {
			var self = this;

			// reset flags
			self.lastTime = nowTime();
			self.sendCount = 0;
			self.warnCount = 0;

			// dispose event listeners
			removeEvent(doc, EVENT_TYPE_MOUSEMOVE, self._fn);
			removeEvent(doc, EVENT_TYPE_KEYDOWN, self._do);
			removeEvent(doc, EVENT_TYPE_MOUSEDOWN, self._do);

			// memory free
			self._fn = self._do = null;

			return self;
		},

		statusChange: function(newStatus) {
			var self = this, key;

			// reset guid
			key = self.key = Monitor.guid(true);

			//console.info('[statusChange]: ', newStatus, self.sendCount, key);

			// notify
			notify(self, 'status', {
				guid: key,
				count: self.sendCount,
				newVal: newStatus
			});

			// restart
			self.stop().start();
		}

	};

	/**
	 * v4 for GUID
	 *
	 * @return  {String} random string of length 4.
	 *
	 */
	Monitor.v4 = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};

	/**
	 * GUID Maker
	 *
	 * @return  {String}	GUID string.
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
	 * get Time of PageStay
	 */
	function getStayTime(host, time) {
		return arguments.length > 1 ? time : Math.max(0, nowTime() - host.initTime);
	}


	/**
	 *
	 */
	function userStatusCheck(isNoNotify) {
		var isLogin = getUserId() > 0;

		// notify all instance
		if (!isNoNotify && STATUS_LAST !== isLogin) {
			STATUS_LAST = isLogin;
			for (var gid in INSTANCES) {
				if (INSTANCES[gid]) {
					try {
						INSTANCES[gid].statusChange(isLogin);
					} catch (e) {
						if (loger && loger.log) {
							loger.log('[statusChange error]: ' + e.message);
						}
					}
				}
			}
		}

		// waiting for next
		if (STATUS_BY > 0) {
			setTimeout(userStatusCheck, STATUS_BY);
		}

		return isLogin;
	}

	/**
	 * on mouse or keyboard move/down
	 *
	 * @param   host	{Object}	ActivityMonitor Instance.
	 *
	 */
	function onActivity(host) {
		var ops = host.options,
			t = nowTime(),
			r = t - host.lastTime,
			count,
			uri,
			head,
			img,
			uid,
			d,
            aliveBy = 1;

		// if alive ?
		if (
			// exceptions
			r <= 0 ||
			// login user
			(STATUS_LAST && r >= INTERVAL && (aliveBy = 2)) ||
			//
			((!WARN_BY || !WARN_BY.length) && r >= INTERVAL && (aliveBy = 3)) ||
			// guest user && (next WARN_BY delay-time) > 0
			(!STATUS_LAST && r >= (WARN_BY[host.warnCount] || WARN_BY[WARN_BY.length - 1]) && (aliveBy = 4))
		) {

			// guest user && WARN_AT > 0 && have warned
            //console.info(aliveBy, WARN_AT, host.warnCount);
            if (aliveBy === 4 && WARN_AT && WARN_AT <= host.warnCount ) {
                return;
            }

            //console.info('[onActivity]: ', r, STATUS_LAST, WARN_BY[host.warnCount]);

			// restore time
			host.lastTime = t;

			// get current visitor's userId
			uid = getUserId();

			// uri of api
			uri = substitute(URI, {p: LOC, u: uid, a: host.gid, k: host.key, s: getStayTime(host), r: t});

			// make requestor
			if (CALL_AT > 0 && host.callback) {
				img = document.createElement('script');

				head = doc['head'] ||
					doc.getElementsByTagName('head')[0] ||
					doc.documentElement;

				img.async = 'async';
				img.src = uri + '&callback=' + host.callback;

				head.insertBefore(img, head.firstChild);
			} else {
				img = new Image(1, 1);
				img.src = uri;
			}

			// record sended count
			count = ++host.sendCount;

			// notify's data
			d = { guid: host.key, count: count };

			// notify by step
			if (NOTIFY_BY > 0 && (count % NOTIFY_BY) === 0) {
				notify(host, 'send', d);
			}

			// if guestor : just send WARN_AT count, then fire notify event
			if ((!STATUS_LAST && WARN_BY && WARN_BY.length) ||
				(WARN_AT > 0 && count >= WARN_AT && uid <= 0 && !host.warnCount)
				) {
				// set flag
				++host.warnCount;

				// give "warnCount", if need.
				d.warn = host.warnCount;

				// notify
				notify(host, 'warn', d);
			}

			// check counter for stoped
			if (STOP_AT > 0 && count >= STOP_AT && uid <= 0) {
				// stop
				host.stop();

				// notify
				notify(host, 'stop', d);
			}
		}
	}

	/**
	 * notify to subscriber
	 *
	 * @param   host	{Object}	ActivityMonitor Instance.
	 * @param   type	{String}	event type of notify.
	 * @param   data	{Object}	event data, contains 'guid' and 'count'.
	 *
	 */
	function notify(host, type, data) {
		if (host && typeof host._notify === 'function') {
			try {
				// call subscriber
				host._notify.call(host._notify, type, data);
			} catch (ex) {
				if (loger && loger.log) {
					loger.log('[notify error]: ' + ex.message);
				}
			}
		}
	}


	/**
	 * Utils of 'substitute'
	 */
	function substitute(str, o, regexp) {
		return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
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
