export default function(columnType) {
    if (columnType === 'number') {
        // todo: translate labels
        return [
            { l: '1,000[.00]', f: '0,0.[00]' },
            { l: '0', f: '0' },
            { l: '0.0', f: '0.0' },
            { l: '0.00', f: '0.00' },
            { l: '0.000', f: '0.000' },
            { l: '0.[0]', f: '0.[0]' },
            { l: '0.[00]', f: '0.[00]' },
            { l: '0%', f: '0%' },
            { l: '0.0%', f: '0.0%' },
            { l: '0.00%', f: '0.00%' },
            { l: '0.[0]%', f: '0.[0]%' },
            { l: '0.[00]%', f: '0.[00]%' },
            { l: '10,000', f: '0,0' },
            { l: '1st', f: '0o' },
            { l: '123k', f: '0a' },
            { l: '123.4k', f: '0.[0]a' },
            { l: '123.45k', f: '0.[00]a' }
        ];
    }
    if (columnType === 'date') {
        // todo translate
        return [
            { l: '2015, 2016', f: 'YYYY' },
            { l: "2015, '16, '17", f: "YYYY~~'YY" },
            { l: '2015 Q1, 2015 Q2', f: 'YYYY [Q]Q' },
            { l: '2015, Q2, Q3', f: 'YYYY|[Q]Q' },
            { l: '2015, Feb, Mar', f: 'YYYY|MMM' },
            { l: '2015-16, 2016-17', f: 'BB' },
            { l: '’15-’16, ’16-’17', f: 'B' },
            { l: '’15, ’16', f: '’YY' },
            { l: 'April, May', f: 'MMMM' },
            { l: 'Apr, May', f: 'MMM' },
            { l: 'Apr ’15, May ’15', f: 'MMM ’YY' },
            { l: 'April, 2, 3', f: 'MMM|DD' }
        ];
    }

    return [];
}
