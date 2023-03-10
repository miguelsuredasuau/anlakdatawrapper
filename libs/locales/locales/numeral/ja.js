(function() {
    // numeral.js locale configuration
    // locale : japanese
    // author : teppeis : https://github.com/teppeis

    return {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: '¥'
        }
    };
})();
