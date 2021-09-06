(function() {
    return {
        name: 'en',
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        formats: {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A'
        },
        ordinal: function(n) {
            var s = ['th', 'st', 'nd', 'rd'];
            var v = n % 100;
            return '[' + n + (s[(v - 20) % 10] || s[v] || s[0]) + ']';
        }
    };
})();
