/**
 * QKCity
 *
 * @author  zfkun<zfkun@msn.com>
 *
 */
(function(require, exports, module){
var CITY_CACHE;

function $id(o) {
    return typeof o === 'string' ? document.getElementById(o) : o;
}

function $addEvent(element, type, fn) {
    if (element.addEventListener) {
        element.addEventListener(type, fn, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + type, fn);
    } else {
        element["on" + type] = fn;
    }
};

function $isPlainObject(o) {
    return o && Object.prototype.toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
};
function $each(list, fn) {
    var i, n;
    if ($isPlainObject(list)) {
        for (i in list) {
            fn(list[i], i);
        }
    } else if (list) {
        n = list.length;
        for (i = 0; i < n; i++) {
            fn(list[i], i);
        }
    }
};
function $selectIsValid(select) {
    return select && (select.tagName || '').toLowerCase() === 'select' && !select.disabled;
}

function QKCity(selects, values, options) {
	var self = this, ops;
	
    //
    if (!(self instanceof QKCity)) {
        return new QKCity(selects, values, options);
    }
    
    //
    if (!selects || !selects.length) {
        return self;
    }
    
    // 
    ops = $isPlainObject(options) ? options : {};
    
    self.offEmpty = !!ops.offEmpty;
    self.selects = [];
    self.binds = [];
    self.emptyTexts = [];
    
    // attach events of onchange
    $each(selects, function(select, i) {
        var el = self.selects[i] = $id(select);
        $addEvent(
            el,
            'change',
            self.binds[i] = function() {
                QKCity.update(self, i, true);
            }
        );

        // render emptyTexts
        if (!self.offEmpty) {
            el.options.add(
                new Option(
                    self.emptyTexts[i] = el.getAttribute('data-emptyText') || QKCity.emptyText,
                    0
                )
            );
        }
        
        el = null;
    });
    
    
    //QKCity.update(self, 0, true, values);
    QKCity.fill(self, 0, true, 0, values ? values[0] : 0);
    QKCity.update(self, 0, true, values);
    
    return self;
};
QKCity.fill = function(host, index, clean, parentVal, selectedVal) {
    var select, selectedIndex;
    
    if (!host || !host.selects || !(select = host.selects[index])) {
        return;
    }
    
    // clean
    if (clean) {
        select.options.length = 0;
    }
    
    // render emptyText at first
    if (!host.offEmpty) {
        select.options.add(new Option(host.emptyTexts[index], 0));
    }
    
    // render options
    var i = host.offEmpty ? -1 : 0;
    $each(QKCity.getCitys(index, parentVal), function(city) {
        // append new Option
        select.options.add(new Option(city.name, city.id));
        
        // count and check (selected item)
        ++i;
        if (selectedVal > 0 && selectedVal === city.id) {
            selectedIndex = i;
        }
    });

    // auto-select 
    select.selectedIndex = selectedIndex || 0;
    
    // change disabled status
    select.disabled = select.options.length <= (host.offEmpty ? 0 : 1);
    
    i = select = null;
};
QKCity.update = function(host, index, clean, selectedVals) {
    var next = index + 1, selects, val;

    if ((selects = host.selects) && selects[index] && selects[next]) {
        
        val = (selectedVals ? selectedVals[next] : 0) || 0;
        
        // fill Next-Select's Options
        QKCity.fill(host, next, clean, selects[index].value || 0, val);

        // recursion
        if (selects[next + 1]) {
            QKCity.update(host, next, clean, selectedVals);
        }
    }
};
QKCity.getCitys = function(index, parentVal) {
    var cache;
    
    // if leve-deep > 0, then make sure "parentVal" > 0
    if (index > 0 && parentVal <= 0) {
        return []; 
    }
    
    //console.info('[getCitys]: ', index, parentVal);

    // lazy init
    CITY_CACHE = CITY_CACHE || [];
    
    // deep 0
    if (!CITY_CACHE[0]) {
        cache = CITY_CACHE[0] = {};
        $each(QKCity.DATAS, function(city, i){
            cache[city.id] = city;
        });
    }
    
    
    
    // deep 1 ~ index
    for (var i = 1; i <= index; i++) {
        if (!CITY_CACHE[i]) {
            cache = CITY_CACHE[i] = {};
            $each(CITY_CACHE[i - 1], function(city) {
                $each(city.child || [], function(child){
                    cache[child.id] = child;
                });
            });
        }
    }
    
    // if is not firset, then need to known prev-select's info   
    return parentVal > 0 ? (CITY_CACHE[index - 1][parentVal] || {}).child || [] : CITY_CACHE[index];
};
QKCity.emptyText = '-\u8BF7\u9009\u62E9-';
exports.QKCity = QKCity;
})(null, window);