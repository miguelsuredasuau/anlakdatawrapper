(function() {
    // numeral.js locale configuration
    // locale : spanish Spain
    // author : Hernan Garcia : https://github.com/hgarcia

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function(number) {
            var b = number % 10;
            return b === 1 || b === 3 ? 'er' : b === 2 ? 'do' : b === 7 || b === 0 ? 'mo' : b === 8 ? 'vo' : b === 9 ? 'no' : 'to';
        },
        currency: {
            symbol: '€'
        }
    };
})();
