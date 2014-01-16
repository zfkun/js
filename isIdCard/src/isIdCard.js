/**
 * IdCard Checker
 * 
 * @author zfkun <zfkun@msn.com>
 */
;(function( window ) {
    var RE_STRUCT = /^\d{17}(\d|x)$/i,

        CITY_CODE = {
            '11':1, '12':1, '13':1, '14':1, '15':1,
            '21':1, '22':1, '23':1,
            '31':1, '32':1, '33':1, '34':1, '35':1, '36':1, '37':1,
            '41':1, '42':1, '43':1, '44':1, '45':1, '46':1,
            '50':1, '51':1, '52':1, '53':1, '54':1,
            '61':1, '62':1, '63':1, '64':1, '65':1,
            '71':1,
            '81':1, '82':1,
            '91':1
        };


    /**
     * check string for idCard
     * 
     * @inner
     * @param {string} s idCard string
     * @return {boolean}
     */
    function isIdCard( s ) {
        var sId = '';

        if ( s.length === 15 ) {
            sId = s.substr( 0, 6 ) + "19" + s.substr( 6, 9 ) + "0";
        } else if ( s.length === 18 ) {
            sId = s;
        } else {
            return !1;
        }

        if ( !RE_STRUCT.test( sId ) ) {
            return !1;
        }

        sId = sId.replace( /x$/i, "a" );

        if ( !CITY_CODE[ sId.substr( 0, 2 ) ] ) {
            return !1;
        }

        var sBirthday = sId.substr( 6, 4 ) + "/" +
                        Number( sId.substr( 10, 2 ) ) + "/" +
                        Number( sId.substr( 12, 2 ) );
        
        var d = new Date( sBirthday );
        d = d.getFullYear() + "/" + ( d.getMonth() + 1 ) + "/" + d.getDate();
        if ( sBirthday !== d ) {
            return !1;
        }

        var iSum = 0;
        if ( s.length === 18 ) {
            for ( var i = 17; i >= 0; i -- ) {
                iSum += ( Math.pow( 2, i ) % 11 ) * parseInt( sId.charAt( 17 - i ), 11 );
            }

            if ( iSum % 11 != 1 ) {
                return !1;
            }
        }

        return !0;
    }

    window.isIdCard = isIdCard;

})( this );
