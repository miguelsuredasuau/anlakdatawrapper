import test from 'ava';
import column from '../column.mjs';

const formats = {
    '1234.5': [-13363.28, 40211.93, 7947.34, 3818.72, 45181.09, 4017.77],
    '1234': '-13363|40212|7947|3819|45181|4018|38681|31552|-14216|38479|-24131|-48902|28567|743|28324|26446|35948|-43687|49140|17597|23847|12167|24885|31393|16453|-42788|21017|4647|10721|11091|27875|-13968|42165|487|-11276|25426|-34332|-33182|-23273|4333|13135|2753|41574|31647|-47673|25742|4758|-31039|-14942|-37304'.split(
        '|'
    ),
    '1234.56': '-13363.28|40211.93|7947.34|3818.72|45181.09|4017.77|38681.04|31551.56|-14216.48|38478.75|-24130.93|-48902.43|28566.59|743.02|28323.52|26445.68|35947.51|-43687.13|49140.37|17597.26|23847.35|12167.33|24885.12|31392.84|16453.37|-42788.16|21017.46|4647.01|10720.83|11090.89|27874.91|-13968.43|42165.49|487.35|-11275.56|25425.86|-34332.45|-33181.69|-23272.72|4332.98|13135.42|2753.29|41574.28|31646.61|-47672.87|25742.26|4757.60|-31038.57|-14942.06|-37303.72'.split(
        '|'
    ),
    '1,234': '-13,363|40,212|7,947|3,819|45,181|4,018|38,681|31,552|-14,216|38,479|-24,131|-48,902|28,567|743|28,324|26,446|35,948|-43,687|49,140|17,597|23,847|12,167|24,885|31,393|16,453|-42,788|21,017|4,647|10,721|11,091|27,875|-13,968|42,165|487|-11,276|25,426|-34,332|-33,182|-23,273|4,333|13,135|2,753|41,574|31,647|-47,673|25,742|4,758|-31,039|-14,942|-37,304'.split(
        '|'
    ),
    '1,234.56': '-13,363.28|40,211.93|7,947.34|3,818.72|45,181.09|4,017.77|38,681.04|31,551.56|-14,216.48|38,478.75|-24,130.93|-48,902.43|28,566.59|743.02|28,323.52|26,445.68|35,947.51|-43,687.13|49,140.37|17,597.26|23,847.35|12,167.33|24,885.12|31,392.84|16,453.37|-42,788.16|21,017.46|4,647.01|10,720.83|11,090.89|27,874.91|-13,968.43|42,165.49|487.35|-11,275.56|25,425.86|-34,332.45|-33,181.69|-23,272.72|4,332.98|13,135.42|2,753.29|41,574.28|31,646.61|-47,672.87|25,742.26|4,757.60|-31,038.57|-14,942.06|-37,303.72'.split(
        '|'
    ),
    '1234,56': '-13363,28|40211,93|7947,34|3818,72|45181,09|4017,77|38681,04|31551,56|-14216,48|38478,75|-24130,93|-48902,43|28566,59|743,02|28323,52|26445,68|35947,51|-43687,13|49140,37|17597,26|23847,35|12167,33|24885,12|31392,84|16453,37|-42788,16|21017,46|4647,01|10720,83|11090,89|27874,91|-13968,43|42165,49|487,35|-11275,56|25425,86|-34332,45|-33181,69|-23272,72|4332,98|13135,42|2753,29|41574,28|31646,61|-47672,87|25742,26|4757,60|-31038,57|-14942,06|-37303,72'.split(
        '|'
    ),
    '1.234': '-13.363|40.212|7.947|3.819|45.181|4.018|38.681|31.552|-14.216|38.479|-24.131|-48.902|28.567|743|28.324|26.446|35.948|-43.687|49.140|17.597|23.847|12.167|24.885|31.393|16.453|-42.788|21.017|4.647|10.721|11.091|27.875|-13.968|42.165|487|-11.276|25.426|-34.332|-33.182|-23.273|4.333|13.135|2.753|41.574|31.647|-47.673|25.742|4.758|-31.039|-14.942|-37.304'.split(
        '|'
    ),
    '1.234,56': '-13.363,28|40.211,93|7.947,34|3.818,72|45.181,09|4.017,77|38.681,04|31.551,56|-14.216,48|38.478,75|-24.130,93|-48.902,43|28.566,59|743,02|28.323,52|26.445,68|35.947,51|-43.687,13|49.140,37|17.597,26|23.847,35|12.167,33|24.885,12|31.392,84|16.453,37|-42.788,16|21.017,46|4.647,01|10.720,83|11.090,89|27.874,91|-13.968,43|42.165,49|487,35|-11.275,56|25.425,86|-34.332,45|-33.181,69|-23.272,72|4.332,98|13.135,42|2.753,29|41.574,28|31.646,61|-47.672,87|25.742,26|4.757,60|-31.038,57|-14.942,06|-37.303,72'.split(
        '|'
    ),
    '1 234': '-13 363|40 212|7 947|3 819|45 181|4 018|38 681|31 552|-14 216|38 479|-24 131|-48 902|28 567|743|28 324|26 446|35 948|-43 687|49 140|17 597|23 847|12 167|24 885|31 393|16 453|-42 788|21 017|4 647|10 721|11 091|27 875|-13 968|42 165|487|-11 276|25 426|-34 332|-33 182|-23 273|4 333|13 135|2 753|41 574|31 647|-47 673|25 742|4 758|-31 039|-14 942|-37 304'.split(
        '|'
    ),
    '1 234,56': '-13 363,28|40 211,93|7 947,34|3 818,72|45 181,09|4 017,77|38 681,04|31 551,56|-14 216,48|38 478,75|-24 130,93|-48 902,43|28 566,59|743,02|28 323,52|26 445,68|35 947,51|-43 687,13|49 140,37|17 597,26|23 847,35|12 167,33|24 885,12|31 392,84|16 453,37|-42 788,16|21 017,46|4 647,01|10 720,83|11 090,89|27 874,91|-13 968,43|42 165,49|487,35|-11 275,56|25 425,86|-34 332,45|-33 181,69|-23 272,72|4 332,98|13 135,42|2 753,29|41 574,28|31 646,61|-47 672,87|25 742,26|4 757,60|-31 038,57|-14 942,06|-37 303,72'.split(
        '|'
    ),
    '1 234 567': '-13 363 128|40 211 193|7 947 134|3 818 172|45 181 109|-4 017 177'.split('|'),
    '123/na': ':|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|:|29,9|29,8|30,0|30,4|30,7|30,9|30,1|31,0|30,6|30,5|30,6|30,6|31,8|31,7|31,7|31,5|31,4|31,3|32,1|32,1|31,7|29,9|29,8|29,8|29,7|29,5|29,4|29,3|29,2|29,1|27,9|27,9|27,8|28,2|28,0|27,8|28,4|28,2|28,1|27,8|27,7|27,6|28,3|28,1|28,0|27,9|27,8|27,7|26,9|26,8|26,7|26,6|26,6|26,5|26,1|26,1|26,1|26,1|26,0|25,9|26,6|26,5|26,5|27,7|27,5|27,4|27,5|27,4|27,3|28,6|28,3|28,0|27,2|26,6|26,5|26,1|25,5|25,8|26,1|26,3|26,3|25,8|25,2|24,7|25,0|25,4|26,2|26,2|26,5|26,8|26,9|26,9|26,1|24,8|25,1|24,9|25,1|24,8|24,8|24,8|24,5|24,9|25,0|25,8|27,2|25,0|24,3|24,0|23,3|22,8|22,3|22,4|22,8|22,7|22,5|21,8|21,7|21,7|22,6|23,1|22,0|21,2|21,2|21,8|21,8|22,2|21,9|22,9|23,9|25,0|25,0|24,8|25,2|25,0|24,6|24,6|25,3|26,5|27,3|27,9|28,8|29,6|30,3|30,5|31,2|32,3|31,9|32,6|32,6|33,9|34,9|36,3|37,2|37,5|39,5|40,7|44,2|42,6|43,6|44,3|45,8|46,7|47,4|50,1|51,3|52,1|52,5|52,3|53,1|54,0|55,4|56,1|57,0|58,0|56,3|58,8|58,4|59,1|:|:'.split(
        '|'
    ),
    'looks like dates': '1365|1458|1235|1382|1443|1581|1334|1794|1757|1801|3093|1913|1932|2182|1262|1987|1783|1778|2438|2726|1993|1694|1629|2324|2467|2044|3083|2257|2937|3204|2813|2338|2476|2713|2834|1838|1711|2632|2028'.split(
        '|'
    ),
    '12e-10': '6.3e-10|4.5e-9|1.7e-8|2.9e-8|5.7e-9|7.5e-9|9.7e-10'.split('|')
};
let key;
for (key in formats) {
    test(`parse numbers (${key})`, t => {
        const col = column('', formats[key]);
        t.is(col.type(), 'number');
    });
}

test('column aggregations', t => {
    const col = column('', formats['1234.5']);
    t.deepEqual(col.range(), [-13363.28, 45181.09]);
    t.is(col.sum(), 87813.57);
    t.is(col.total(), 87813.57);
    t.truthy(Math.abs(col.mean() - 14635.595) < 1e-5);
    t.is(col.median(), 5982.555);

    const col2 = column('', [null, ...formats['1234.5'], NaN]);
    t.deepEqual(col2.range(), [-13363.28, 45181.09]);
    t.is(col2.sum(), 87813.57);
    t.truthy(Math.abs(col2.mean() - 14635.595) < 1e-5);
    t.is(col2.median(), 5982.555);
});