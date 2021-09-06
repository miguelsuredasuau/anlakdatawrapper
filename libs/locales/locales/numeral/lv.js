(function() {
    // numeral.js locale configuration
    // locale : Latvian (lv)
    // author : Lauris Bukšis-Haberkorns : https://github.com/Lafriks

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: ' tūkst.',
            million: ' milj.',
            billion: ' mljrd.',
            trillion: ' trilj.'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();
