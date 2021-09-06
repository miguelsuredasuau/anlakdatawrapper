(function () {
// numeral.js locale configuration
// locale : greek (el)
// author : Vagelis Antoniadis : https://github.com/vanton1

    return {
        delimiters: {
            thousands: String.fromCharCode(160),
            decimal: ','
        },
        abbreviations: {
            thousand: 'χιλ',
            million: 'εκ',
            billion: 'δισ',
            trillion: 'τρισ'
        },
        ordinal : function (number) {
        // In Greek there 3 genders of nouns.
        // I just put here the masculin form for the ordinal
            return 'ος';
        },
        currency: {
            symbol: '€'
        }
    };
})();