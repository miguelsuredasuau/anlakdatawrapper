(function() {
    // locale : albanian (sq) 
    // author : Aya Tanikawa, susuril-fl@rferl.org 

    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mijë',
            million: 'milion',
            billion: 'miliard',
            trillion: 'trilion'
        },
        ordinal: function() {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };
})();