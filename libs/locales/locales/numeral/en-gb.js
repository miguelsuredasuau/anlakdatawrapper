(function() {
    // numeral.js locale configuration
    // locale : english united kingdom (uk)
    // author : Dan Ristic : https://github.com/dristic

    return {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'bn',
            trillion: 't'
        },
        ordinal: function(number) {
            var b = number % 10;
            return ~~((number % 100) / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
        },
        currency: {
            symbol: '£'
        }
    };
})();
