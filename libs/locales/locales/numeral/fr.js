(function() {
    // numeral.js locale configuration
    // locale : french (fr)
    // author : Adam Draper : https://github.com/adamwdraper

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function(number) {
            return number === 1 ? 'er' : 'e';
        },
        currency: {
            symbol: '€'
        }
    };
})();
