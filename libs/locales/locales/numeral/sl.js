(function() {
    // numeral.js locale configuration
    // locale : slovenian (sl)
    // author : Boštjan Pišler : https://github.com/BostjanPisler

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mio',
            billion: 'mrd',
            trillion: 'trilijon'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();
