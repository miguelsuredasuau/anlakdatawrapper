(function() {
    // numeral.js locale configuration
    // locale : Ukrainian for the Ukraine (uk-ua)
    // author : Michael Piefel : https://github.com/piefel (with help from Tetyana Kuzmenko)

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'тис.',
            million: 'млн',
            billion: 'млрд',
            trillion: 'блн'
        },
        ordinal: function() {
            // not ideal, but since in Ukrainian it can taken on
            // different forms (masculine, feminine, neuter)
            // this is all we can do
            return '';
        },
        currency: {
            symbol: '\u20B4'
        }
    };
})();
