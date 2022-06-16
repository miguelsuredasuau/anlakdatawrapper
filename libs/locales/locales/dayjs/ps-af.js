(function() {
    // dayjs locale configuration
    // locale : Pashto (Afghanistan) (ps_AF)
    // author : Patrick Boehler (RFE/RL) (frontId: msg_onpt8at)
    return {
        name: 'pa-AF',
        weekdays: 'یکشنبه_دوشنبه_سې شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekdaysShort: 'یکشنبه_دوشنبه_سې شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekdaysMin: 'یکشنبه_دوشنبه_سې شنبه_چهارشنبه_پنجشنبه_جمعه_شنبه'.split('_'),
        weekStart: 6,
        months: 'جنوري_فبروري_مارچ_اپرېل_مې_جون_جولای_اګسټ_سپټمبر_اکټوبر_نومبر_ډسمبر'.split('_'),
        monthsShort: 'جنوري_فبروري_مارچ_اپرېل_مې_جون_جولای_اګسټ_سپټمبر_اکټوبر_نومبر_ډسمبر'.split('_'),
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
