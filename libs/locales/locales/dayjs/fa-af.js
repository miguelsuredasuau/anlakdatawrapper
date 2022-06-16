(function() {
    // dayjs locale configuration
    // locale : Persian (Afghanistan) - Dari (fa_AF)
    // author : Patrick Boehler (RFE/RL) (frontId: msg_onpt8at)
    return {
        name: 'fa-AF',
        weekdays: 'یکشنبه_دوشنبه_سه شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekdaysShort: 'یکشنبه_دوشنبه_سه شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekdaysMin: 'یکشنبه_دوشنبه_سه شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekStart: 6,
        months: 'جنوری_فبروری_مارچ_اپریل_می_جون_جولای_اگست_سپتمبر_اکتوبر_نومبر_دسمبر'.split('_'),
        monthsShort: 'جنوری_فبروری_مارچ_اپریل_می_جون_جولای_اگست_سپتمبر_اکتوبر_نومبر_دسمبر'.split('_'),
        ordinal: function(n) {
            return n;
        },
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        relativeTime: {
            future: 'در %s',
            past: '%s پیش',
            s: 'چند ثانیه',
            m: 'یک دقیقه',
            mm: '%d دقیقه',
            h: 'یک ساعت',
            hh: '%d ساعت',
            d: 'یک روز',
            dd: '%d روز',
            M: 'یک ماه',
            MM: '%d ماه',
            y: 'یک سال',
            yy: '%d سال'
        }
    };
})();
