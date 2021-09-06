(function() {
    // locale : swedish (sv)
    // author : Elana Levin Schtulberg

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: 'kr'
        }
    };
})();
