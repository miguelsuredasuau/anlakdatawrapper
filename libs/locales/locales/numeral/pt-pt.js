(function() {
    // numeral.js locale configuration
    // locale : portuguese (pt-pt)
    // author : Diogo Resende : https://github.com/dresende

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
            return 'º';
        },
        currency: {
            symbol: '€'
        }
    };
})();
