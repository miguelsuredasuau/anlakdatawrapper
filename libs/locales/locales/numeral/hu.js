(function() {
    // numeral.js locale configuration
    // locale : Hungarian (hu)
    // author : Peter Bakondy : https://github.com/pbakondy

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'E', // ezer
            million: 'M', // millió
            billion: 'Mrd', // milliárd
            trillion: 'T' // trillió
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: ' Ft'
        }
    };
})();
