(function() {
    // numeral.js locale configuration
    // locale : Kyrgyz (ky)
    // author : Taken from Russian, Anatoli Papirovski : https://github.com/apapirovski

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: ' тыс',
            million: ' млн',
            billion: ' млрд',
            trillion: ' трлн'
        },
        ordinal: function() {
            // not ideal, but since in Russian it can taken on
            // different forms (masculine, feminine, neuter)
            // this is all we can do
            return '.';
        },
        currency: {
            symbol: 'сом'
        }
    };
})();
