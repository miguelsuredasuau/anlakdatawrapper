(function() {
    // locale : Macedonian
    // author : Macedonian team at RFE/RL (frontID: msg_nb7n0p1)

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'илјади',
            million: 'милиони',
            billion: 'милијарди',
            trillion: 'трилиони'
        },
        ordinal: function(number) {
            return '.';
        },
        currency: {
            symbol: 'ден.'
        }
    };
})();