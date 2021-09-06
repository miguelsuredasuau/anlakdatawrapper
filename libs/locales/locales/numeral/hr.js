(function() {
    // numeral.js locale configuration
    // locale : hrvatski (hr)
    // author : Kresimir Bernardic

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'bil.',
            trillion: 'tril.'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: 'kn'
        }
    };
})();
