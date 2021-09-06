(function() {
    // numeral.js locale configuration
    // locale : German (de-DE) – useful in Germany

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: ' Tsd.',
            million: ' Mio.',
            billion: ' Mrd.',
            trillion: ' Bio.'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();
