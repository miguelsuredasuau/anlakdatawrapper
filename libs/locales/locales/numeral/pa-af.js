(function () {
    // numeral.js locale configuration
    // locale : Pashto (Afghanistan) (pa_AF)
    // author : Patrick Boehler (RFE/RL) (frontId: msg_oob5j9h)

    return {
        delimiters: {
            thousands: '٬',
            decimal: '٫'
        },
        abbreviations: {
            thousand: ' زر',
            million: ' ملیونه',
            billion: ' میلیارده',
            trillion: ' تریلیونه'
        },
        ordinal: function () {
            return ' ';
        },
        currency: {
            symbol: '؋'
        }
    };
})();