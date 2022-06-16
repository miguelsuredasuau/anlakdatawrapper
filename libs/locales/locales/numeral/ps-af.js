(function () {
    // numeral.js locale configuration
    // locale : arabic kuwait (kw)
    // author : Nusret Parlak : https://github.com/nusretparlak

    return {
        delimiters: {
            thousands: '٬',
            decimal: '٫'
        },
        abbreviations: {
            thousand: ' ألف',
            million: ' مليون',
            billion: ' مليار',
            trillion: ' تريليون'
        },
        ordinal: function () {
            return ' ';
        },
        currency: {
            symbol: '؋'
        }
    };
})();