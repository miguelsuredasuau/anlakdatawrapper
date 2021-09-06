(function() {
    // numeral.js locale configuration
    // locale : Finnish
    // author : Sami Saada : https://github.com/samitheberber

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'G',
            trillion: 'T'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();
