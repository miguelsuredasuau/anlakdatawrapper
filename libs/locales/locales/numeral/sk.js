(function() {
    // numeral.js locale configuration
    // locale : slovak (sk)
    // author : Ahmed Al Hafoudh : http://www.freevision.sk

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();
