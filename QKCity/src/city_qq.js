/**
 * QKCity
 *
 * @author  zfkun<zfkun@msn.com>
 *
 */
(function(exports){
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
}

function $isPlainObject(o) {
    return o && Object.prototype.toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
}

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
}

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
    QKCity.fill(self, 0, true, 0, 0, values ? values[0] : 0);
    QKCity.update(self, 0, true, values);
    
    return self;
}

QKCity.fill = function(host, index, clean, parentVal, superVal, selectedVal) {
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
    $each(QKCity.getCitys(index, parentVal, superVal), function(city) {
        // append new Option
        select.options.add(new Option(city.name, city.id));
        
        // count and check (selected item)
        ++i;
        if (selectedVal > 0 && selectedVal == city.id) {
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
        QKCity.fill(host, next, clean, selects[index].value || 0, (index > 0 ? selects[index - 1].value || 0 : selects[index].value || 0), val);

        // recursion
        if (selects[next + 1]) {
            QKCity.update(host, next, clean, selectedVals);
        }
    }
};

QKCity.getCitys = function(index, parentVal, superVal) {
    var ret = {}, datas;

    switch (index) {
        case 0:
            datas = QKCity.DATAS;
            break;
        case 1:
            datas = QKCity.DATAS[parentVal];
            break;
        case 2:
            datas = (QKCity.DATAS[superVal] || {})[parentVal];
            break;
    }

    $each(datas || {}, function(v, k) {
        if (k !== 'n' && k > 0) {
            ret[k] = { id: k | 0, name: v.n };
        }
    });

    return ret;
}

QKCity.emptyText = '-\u8BF7\u9009\u62E9-';

exports.QKCity = QKCity;

})(window);