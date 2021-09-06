(function() {
    // numeral.js locale configuration
    // locale : polish (pl)
    // author : Dominik Bulaj : https://github.com/dominikbulaj

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'tys.',
            million: 'mln',
            billion: 'mld',
            trillion: 'bln'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: 'PLN'
        }
    };
})();
