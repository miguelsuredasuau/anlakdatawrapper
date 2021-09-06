(function() {
    // numeral.js locale configuration
    // locale : vietnam (vi)
    // author : Harry Nguyen : https://github.com/thaihoa311

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: ' nghìn',
            million: ' triệu',
            billion: ' tỷ',
            trillion: ' nghìn tỷ'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: '₫'
        }
    };
})();
