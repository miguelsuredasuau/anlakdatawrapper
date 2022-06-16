(function () {
    // numeral.js locale configuration
    // locale : Persian (Afghanistan) - Dari (fa_AF)
    // author : Patrick Boehler (RFE/RL) (frontId: msg_oob5j9h)

    return {
        delimiters: {
            thousands: '٬',
            decimal: '٫'
        },
        abbreviations: {
            thousand: ' هزار',
            million: ' میلیون',
            billion: ' میلیارد',
            trillion: ' تریلیون'
        },
        ordinal: function () {
            return ' ';
        },
        currency: {
            symbol: '؋'
        }
    };
})();