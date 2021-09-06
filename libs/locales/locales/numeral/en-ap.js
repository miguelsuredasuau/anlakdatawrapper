(function() {
    // numeral.js locale configuration
    // locale : American English

    return {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'K',
            million: 'M',
            billion: 'B',
            trillion: 'T'
        },
        ordinal: function(number) {
            var b = number % 10;
            return ~~((number % 100) / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    };
})();
