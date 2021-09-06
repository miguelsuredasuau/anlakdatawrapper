(function() {
    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'mila',
            million: 'mil',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function(number) {
            return 'º';
        },
        currency: {
            symbol: 'CHF'
        }
    };
})();
