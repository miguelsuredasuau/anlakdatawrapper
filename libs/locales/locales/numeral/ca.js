(function () {
     // numeral.js language configuration
     // language : catalan Spain
     // author : Jaume sala : https://github.com/jaumesala
    return {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'mm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var r = number % 10;
            return (number >= 10 ) ? 'è' :
                (r === 1 || r === 3) ? 'r' :
                    (r === 2) ? 'n' :
                        (r === 4) ? 't' : 'è';
        },
        currency: {
            symbol: '€'
        }
    };
}());
