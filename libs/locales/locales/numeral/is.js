(function() {
    // author : Statistics Iceland (customer) odinn.th.kjartansson@hagstofa.is
    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'þús',
            million: 'millj.',
            billion: 'bma.',
            trillion: 'billj.'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: 'kr.'
        }
    };
})();