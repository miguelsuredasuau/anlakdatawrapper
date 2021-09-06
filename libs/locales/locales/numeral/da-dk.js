(function() {
    // numeral.js locale configuration
    // locale : danish denmark (dk)
    // author : Michael Storgaard : https://github.com/mstorgaard

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mio',
            billion: 'mia',
            trillion: 'b'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: 'DKK'
        }
    };
})();
