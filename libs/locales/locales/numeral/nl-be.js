(function() {
    // numeral.js locale configuration
    // locale : dutch-belgium (nl-be)
    // author : Dieter Luypaert : https://github.com/moeriki
    // corrected : Olivier Godefroy : https://github.com/godefroyo

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: ' mln',
            billion: ' mld',
            trillion: ' bln'
        },
        ordinal: function(number) {
            var remainder = number % 100;

            return (number !== 0 && remainder <= 1) || remainder === 8 || remainder >= 20 ? 'ste' : 'de';
        },
        currency: {
            symbol: '€ '
        }
    };
})();
