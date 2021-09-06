(function() {
    // numeral.js locale configuration
    // locale : korean
    // author : Rich Daley : https://github.com/pedantic-git

    return {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '천',
            million: '백만',
            billion: '십억',
            trillion: '일조'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: '₩'
        }
    };
})();
