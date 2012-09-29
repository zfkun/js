/**
 * Path UI
 * @author zfkun<zfkun@msn.com>
 */
;(function($, exports, undefined) {
    'use strict';

    /**
     * Path
     * @param {Element|Selector} container container of UI
     * @param {Object}  options   settings
     */
    function Path(container, options) {
        var self = this;

        if (!$(container)[0]) {
            throw 'Path Container Error';
        }

        if (!(self instanceof Path)) {
            return new Path(container, options);
        }

        $.extend(self.options = {}, Path.Options, options);

        self.container = $( container );

        self._init();
    }


    // static
    $.extend(Path, {

        Options : {

            // container's size
            size    : [110, 124],

            // container's positon
            xy      : [16, 226],

            // container's z-index
            zIndex  : 100,

            // menu's size
            menuSize: [65, 65],

            // button's size
            itemSize: [30, 30],

            // container's class name
            modCls  : 'path',

            // item(menu/button)'s class name
            itemCls : 'path-item',

            // animate's duration
            duration: 100,

            // animate's rate
            rate    : 100

        }

    });


    // public
    $.extend(Path.prototype, {

        _init : function() {
            var self        = this,
                container   = self.container,
                ops         = self.options,
                itemCls     = ops.itemCls,
                zIndex      = ops.zIndex,
                itemSize    = ops.itemSize,
                menuSize    = ops.menuSize,
                xy          = self.xy = { menu : ops.button[0][0] };

            // init container layout
            container.hide().addClass( ops.modCls ).css({
                position    : 'relative',
                zIndex      : zIndex,
                background  : 'url(about:blank)',
                width       : ops.size[0],
                height      : ops.size[1],
                left        : ops.xy[0],
                top         : ops.xy[1]
            }).show();

            // path-buttons's xy
            xy.button = [
                // button's center.x  ===  menu's center.x
                // (66 - 30) / 2 + 0
                (menuSize[0] - itemSize[0]) / 2 + xy.menu[0],

                // button's center.y  ===  menu's center.y
                // (66 - 30) / 2 + 50
                // (menuSize[1] - itemSize[1]) / 2 + xy.menu[1]
                (menuSize[1] - itemSize[1]) / 2 + xy.menu[1]
            ];

            // init buttons dom
            self.buttons = [];
            $.each(ops.button, function(i, v) {
                var isMenu = i === 0,
                    node = $('<a hideFocus="true"></a>')
                        .appendTo(container)
                        .attr({
                            // ui
                            'class'     : itemCls + ' ' + v[1],
                            title       : v[2],
                            href        : v[3],
                            target      : v[4] || '_blank',

                            // for IE
                            hideFocus   : 'true'
                        })
                        .css({
                            cursor      : 'pointer',

                            position    : 'absolute',

                            left        : (isMenu ? xy.menu : xy.button)[0],

                            top         : (isMenu ? xy.menu : xy.button)[1],

                            width       : isMenu ? menuSize[0] : itemSize[0],

                            height      : isMenu ? menuSize[1] : itemSize[1],

                            // for '<a>'
                            outline     : 'none',

                            // container < button < menu
                            zIndex      : zIndex + (isMenu ? 2 : 1)
                        });

                if (i === 0) self.menu = node;
                else self.buttons.push( node );
            });

            // attach event
            self._attach();
        },

        /**
         * attach events
         * @return {Path} instance of Path
         */
        _attach : function() {
            var self = this, ops = self.options, timer, seed, times, menuXY, buttonXY;

            if (self._task) return self;

            menuXY    = self.xy.menu;
            buttonXY  = self.xy.button;
            seed      = ops.duration;
            times     = self.buttons.length * seed;

            self._task = function( isShow ) {
                // fixed for FF
                isShow = isShow === true;

                $(self.buttons).each(function(i, button){
                    // path-button' index = i(options.button' index) + 1(menu's index === 0)
                    var xy = ops.button[i + 1][0];
                    $(button).stop().animate(
                        {
                            left : isShow ? menuXY[0] + xy[0] : buttonXY[0],
                            top  : isShow ? menuXY[1] + xy[1] : buttonXY[1]
                        },

                        // duration seed
                        seed + (isShow ? ops.rate * i : (times - ops.rate * i))
                    );
                });
            };

            self.menu.mouseenter(function(ev){
                clearTimeout(timer);
                self._task(true);
            });

            self.container.mouseleave(function(ev){
                clearTimeout(timer);
                timer = setTimeout(self._task, 100);
            });

            return self;
        },

        /**
         * update button's DOM attribute
         * @param  {String}     to   path-button's name
         * @param  {Element}    node reference Element
         * @return {Path}      instance of Path
         */
        notify : function(to, node) {
            var data;
            if (to === 'menu' && node && $(node)[0] && (data = {})) {
                $.each(['href', 'target'], function(i, attribute) {
                    data[attribute] = $(node).attr(attribute);
                });

                $(this.menu).attr( data );
            }

            return this;
        }

    });


    // exports
    exports.Path = Path;

})(jQuery, window);
