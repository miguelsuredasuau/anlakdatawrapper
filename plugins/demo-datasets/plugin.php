<?php

class DatawrapperPlugin_DemoDatasets extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        foreach ($this->getDemoDatasets() as $key => $dataset) {
            DatawrapperHooks::register(DatawrapperHooks::GET_DEMO_DATASETS, function() use ($dataset){
                return $dataset;
            });
        }
    }

    function getDemoDatasets() {
        $datasets = array();

        $datasets[] = array(
            'id' => 'how-the-iphone-shaped-apple',
            'title' => __('How the iPhone shaped Apple'),
            'type' => __('d3-lines / title', 'd3-lines'),
            'presets' => array(
                'type' => 'd3-lines',
                'metadata.describe.source-name' => 'Apple',
                'metadata.describe.source-url' => 'https://www.apple.com/newsroom/',
                'metadata.describe.intro' => 'Apple sales by product in shipped units, 2000 to 2017.',
                'metadata.annotate.notes' => 'Apple stopped to report iPod sales at the end of 2014.',
            ),
            'data' =>
"Quarter;iPhone;iPad;Mac;iPod
Q3 2000;;;1.1;
Q4 2000;;;0.6;
Q1 2001;;;0.7;
Q2 2001;;;0.8;
Q3 2001;;;0.8;
Q4 2001;;;0.7;
Q1 2002;;;0.8;
Q2 2002;;;0.8;
Q3 2002;;;0.7;
Q4 2002;;;0.7;
Q1 2003;;;0.7;
Q2 2003;;;0.8;
Q3 2003;;;0.8;0.3
Q4 2003;;;0.8;0.7
Q1 2004;;;0.7;0.8
Q2 2004;;;0.9;0.9
Q3 2004;;;0.8;2
Q4 2004;;;1;4.6
Q1 2005;;;1.1;5.3
Q2 2005;;;1.2;6.2
Q3 2005;;;1.2;6.4
Q4 2005;;;1.3;14
Q1 2006;;;1.11;8.5
Q2 2006;;;1.33;8.1
Q3 2006;;;1.61;8.7
Q4 2006;;;1.61;21
Q1 2007;;;1.52;10.5
Q2 2007;0.27;;1.76;9.9
Q3 2007;1.12;;2.16;10.2
Q4 2007;2.32;;2.32;22.1
Q1 2008;1.7;;2.29;10.6
Q2 2008;0.72;;2.5;11
Q3 2008;6.89;;2.61;11
Q4 2008;4.36;;2.52;22.7
Q1 2009;3.79;;2.22;11
Q2 2009;5.21;;2.6;10.2
Q3 2009;7.37;;3.05;10.2
Q4 2009;8.74;;3.36;20.1
Q1 2010;8.75;;2.94;10.9
Q2 2010;8.4;3.27;3.47;9.4
Q3 2010;14.1;4.19;3.89;9
Q4 2010;16.24;7.33;4.13;19.4
Q1 2011;18.65;4.69;3.76;9
Q2 2011;20.34;9.25;3.95;7.5
Q3 2011;17.07;11.12;4.89;6.6
Q4 2011;37.04;15.43;5.2;15.4
Q1 2012;35.06;11.8;4.02;7.7
Q2 2012;26.03;17.04;4.02;6.7
Q3 2012;26.91;14.04;4.92;5.3
Q4 2012;47.79;22.86;4.06;12.7
Q1 2013;37.43;19.48;3.95;5.6
Q2 2013;31.24;14.62;3.75;4.6
Q3 2013;33.8;14.08;4.57;3.5
Q4 2013;51.03;26.04;4.84;6
Q1 2014;43.72;16.35;4.14;2.8
Q2 2014;35.2;13.28;4.41;2.9
Q3 2014;39.27;12.32;5.52;2.6
Q4 2014;74.47;21.42;5.52;3.6
Q1 2015;61.17;12.62;4.56;
Q2 2015;47.53;10.93;4.8;
Q3 2015;48.05;9.88;5.71;
Q4 2015;74.78;16.12;5.31;
Q1 2016;51.19;10.25;4.03;
Q2 2016;40.4;9.95;4.25;
Q3 2016;45.51;9.27;4.89;
Q4 2016;78.29;13.08;5.37;
Q1 2017;50.76;8.92;4.2;
Q2 2017;41.03;11.42;4.26;
Q3 2017;46.68;10.33;5.39;
Q4 2017;77.32;13.17;5.11;
Q1 2018;52.22;9.11;4.08;
Q2 2018;41.3;11.55;3.72;
Q3 2018;46.89;9.7;5.3;
Q4 2018;68.4;12.9;5.43;
Q1 2019;36.8;9.9;3.79;
Q2 2019;33.8;12.3;4.16;
Q3 2019;46.6;11.8;5.14;
Q4 2019;73.8;15.9;5.25;
Q1 2020;36.7;7.7;3.75;
Q2 2020;37.6;12.4;5.09;
Q3 2020;41.7;14;6.73;
Q4 2020;87.5;19.1;6.45;
Q1 2021;55.2;12.7;5.57;
Q2 2021;44.2;12.9;6.09;
Q3 2021;50.4;14.7;7.22;
Q4 2021;84.9;17.5;6.85;"
        );


        $datasets[] = array(
            'id' => 'co2-emissions',
            'type' => __('d3-area / title', 'd3-lines'),
            'presets' => array(
                'type' => 'd3-area',
                'metadata.describe.intro' => 'Global CO2 emissions from fossil-fuel burning, cement manufacture, and gas flaring, in million metric tonnes, 1850-2014',
                'metadata.describe.source-name' => 'Carbon Dioxide Information Analysis Center',
                'metadata.describe.source-url' => 'http://cdiac.ess-dive.lbl.gov/trends/emis/tre_glob_2014.html',
            ),
            'title' => __("Global CO2 Emissions"),
            'data' =>
"Year;Liquid fuel;Solid fuel;Gas fuel;Cement production;Gas flaring
1850;0;54;0;0;0
1851;0;54;0;0;0
1852;0;57;0;0;0
1853;0;59;0;0;0
1854;0;69;0;0;0
1855;0;71;0;0;0
1856;0;76;0;0;0
1857;0;77;0;0;0
1858;0;78;0;0;0
1859;0;83;0;0;0
1860;0;91;0;0;0
1861;0;95;0;0;0
1862;0;96;0;0;0
1863;0;103;0;0;0
1864;0;112;0;0;0
1865;0;119;0;0;0
1866;0;122;0;0;0
1867;0;130;0;0;0
1868;0;134;0;0;0
1869;0;142;0;0;0
1870;1;146;0;0;0
1871;1;156;0;0;0
1872;1;173;0;0;0
1873;1;183;0;0;0
1874;1;173;0;0;0
1875;1;187;0;0;0
1876;1;190;0;0;0
1877;2;192;0;0;0
1878;2;194;0;0;0
1879;3;207;0;0;0
1880;3;233;0;0;0
1881;4;239;0;0;0
1882;4;252;0;0;0
1883;3;269;0;0;0
1884;4;271;0;0;0
1885;4;273;1;0;0
1886;5;275;2;0;0
1887;5;287;3;0;0
1888;5;317;5;0;0
1889;6;318;3;0;0
1890;8;345;3;0;0
1891;9;360;2;0;0
1892;9;363;2;0;0
1893;10;358;2;0;0
1894;9;372;2;0;0
1895;11;393;2;0;0
1896;12;405;2;0;0
1897;13;425;2;0;0
1898;13;449;2;0;0
1899;14;491;3;0;0
1900;16;515;3;0;0
1901;18;531;4;0;0
1902;19;543;4;0;0
1903;20;593;4;0;0
1904;23;597;4;0;0
1905;23;636;5;0;0
1906;23;680;5;0;0
1907;28;750;5;0;0
1908;30;714;5;0;0
1909;32;747;6;0;0
1910;34;778;7;0;0
1911;36;792;7;0;0
1912;37;834;8;0;0
1913;41;895;8;0;0
1914;42;800;8;0;0
1915;45;784;9;0;0
1916;48;842;10;0;0
1917;54;891;11;0;0
1918;53;873;10;0;0
1919;61;735;10;0;0
1920;78;843;11;0;0
1921;84;709;10;0;0
1922;94;740;11;0;0
1923;111;845;14;0;0
1924;110;836;16;0;0
1925;116;842;17;0;0
1926;119;846;19;0;0
1927;136;905;21;0;0
1928;143;890;23;10;0
1929;160;947;28;10;0
1930;152;862;28;10;0
1931;147;759;25;8;0
1932;141;675;24;7;0
1933;154;708;25;7;0
1934;162;775;28;8;0
1935;176;811;30;9;0
1936;192;893;34;11;0
1937;219;941;38;11;0
1938;214;880;37;12;0
1939;222;918;38;13;0
1940;229;1017;42;11;0
1941;236;1043;42;12;0
1942;222;1063;45;11;0
1943;239;1092;50;10;0
1944;275;1047;54;7;0
1945;275;820;59;7;0
1946;292;875;61;10;0
1947;322;992;67;12;0
1948;364;1015;76;14;0
1949;362;960;81;16;0
1950;423;1070;97;18;23
1951;479;1129;115;20;24
1952;504;1119;124;22;26
1953;533;1125;131;24;27
1954;557;1116;138;27;27
1955;625;1208;150;30;31
1956;679;1273;161;32;32
1957;714;1309;178;34;35
1958;731;1336;192;36;35
1959;789;1382;206;40;36
1960;849;1410;227;43;39
1961;904;1349;240;45;42
1962;980;1351;263;49;44
1963;1052;1396;286;51;47
1964;1137;1435;316;57;51
1965;1219;1460;337;59;55
1966;1323;1478;364;63;60
1967;1423;1448;392;65;66
1968;1551;1448;424;70;73
1969;1673;1486;467;74;80
1970;1839;1556;493;78;87
1971;1947;1559;530;84;88
1972;2057;1576;560;89;95
1973;2241;1581;588;95;110
1974;2245;1579;597;96;107
1975;2132;1673;604;95;92
1976;2314;1710;630;103;108
1977;2398;1756;650;108;104
1978;2392;1780;680;116;106
1979;2544;1875;721;119;98
1980;2422;1935;737;120;86
1981;2289;1908;755;121;65
1982;2196;1976;738;121;64
1983;2176;1977;739;125;58
1984;2199;2074;807;128;51
1985;2186;2216;835;131;49
1986;2293;2277;830;137;46
1987;2306;2339;892;143;44
1988;2412;2387;935;152;50
1989;2459;2428;982;156;41
1990;2492;2359;1026;157;40
1991;2601;2284;1051;161;45
1992;2499;2290;1085;167;36
1993;2515;2225;1117;176;37
1994;2539;2278;1133;186;39
1995;2560;2359;1151;197;39
1996;2626;2382;1198;203;40
1997;2701;2409;1197;209;40
1998;2763;2343;1224;209;36
1999;2741;2310;1258;217;35
2000;2845;2327;1289;226;46
2001;2848;2445;1316;237;47
2002;2832;2518;1342;252;49
2003;2958;2695;1397;276;48
2004;3043;2906;1443;298;54
2005;3068;3108;1485;320;60
2006;3091;3293;1534;356;62
2007;3071;3422;1562;382;66
2008;3103;3587;1630;388;69
2009;3042;3590;1584;415;66
2010;3107;3812;1696;446;67
2011;3134;4055;1756;494;64
2012;3200;4106;1783;519;65
2013;3220;4126;1806;554;68
2014;3280;4117;1823;568;68"
        );


//         $datasets[] = array(
//             'id' => 'social-network',
//             'title' => __('Social network usage by high-schoolers'),
//             'type' => __('Split bars'),
//             'presets' => array(
//                 'type' => 'd3-bars-split',
//                 'metadata.describe.source-name' => 'eMarketer',
//                 'metadata.describe.source-url' => 'http://www.emarketer.com/Article/How-Elusive-Generation-Z-After-All/1011466',
//                 'metadata.publish.embed-width' => 650,
//                 'metadata.publish.embed-height' => 240,
//                 'metadata.describe.intro' => 'Social network sites used by US High School graduates, by frequency, 2014',
//                 'metadata.data.transpose' => true
//             ),
//             'data' =>
// "Usage;Facebook;Instagram;Twitter;Google+;Tumblr;Pinterest
// A few times a day;47;43;28;16;11;10
// Once a day;14;8;7;7;4;6
// A few times a week;12;7;7;8;6;10
// Occasionally;14;8;13;21;12;18
// I don't use it;13;34;45;48;66;56"
//         );



        $datasets[] = array(
            'id' => 'trust-in-media-reporting',
            'title' => __('Trust in Media Reporting'),
            'chartid' => '',
            'type' => __('stacked bars', 'd3-bars'),
            'presets' => array(
                'type' => 'd3-bars-stacked',
                'metadata.describe.source-name' => 'Infratest dimap',
                'metadata.describe.source-url' => 'http://www.infratest-dimap.de/umfragen-analysen/bundesweit/umfragen/aktuell/wenig-vertrauen-in-medienberichterstattung/',
                'metadata.visualize.thick' => true,
                'metadata.visualize.rules' => true,
                'metadata.visualize.block-labels' => true,
                'metadata.visualize.value-label-format' => "0%",
                'metadata.publish.embed-width' => 600,
                'metadata.publish.embed-height' => 360,
                'metadata.describe.intro' => 'Trust in Media Reporting regarding widely reported topics of 2015',
                'metadata.data.transpose' => false
            ),
            'data' =>
"Topic;Very high trust;High trust;No answer;Low trust;Very low trust
Mediterranean Migrant Crisis;3;45;2;41;9
Protests of Islam critical PEGIDA movement in Dresden;3;37;4;41;15
Financial Crisis in Greece;4;31;2;46;17
Ukraine conflict between Russia and Western Countries;2;30;2;52;14"
        );


        $datasets[] = array(
            'id' => 'pay-gap',
            'title' => __('Gender pay gap'),
            'type' => __('Range plot', 'd3-bars'),
            'presets' => array(
                'type' => 'd3-range-plot',
                'metadata.visualize.value-label-format' => "0a",
                'metadata.describe.source-name' => 'US Census, 2008',
                'metadata.describe.source-url' => 'https://www2.census.gov/library/publications/2008/compendia/statab/128ed/tables/income.pdf',
                'metadata.visualize.thick' => true,
                'metadata.visualize.highlight-range' => true,
                'metadata.describe.intro' => 'Median earnings of full-time workers in constant US-Dollars, 2006',
                'metadata.data.transpose' => false
            ),
            'data' =>
"Education;Men;Women
Less than 9th grade;17169;10451
9th to 12 grade (no diploma);21184;11914
High school graduate;31009;17546
Some college, no degree;37271;22709
Associate degree;41807;26295
Bachelor's degree;54403;35094
Master’s degree;67425;46250
Doctorate;90511;61091"
        );


        $datasets[] = array(
            'id' => 'electric-cars',
            'title' => __('Electric cars 2018'),
            'type' => __('table', 'tables'),
            'presets' => [
                'type' => 'tables',
                'metadata.data.transpose' => false,
                'metadata.describe.source-name' => "Manufacturer's specifications",
                'metadata.visualize.columns.Range in miles.showAsBar' => true,
                'metadata.visualize.columns.Range in miles.showOnDesktop' => true,
                'metadata.visualize.columns.Range in miles.showOnMobile' => true,
                'metadata.visualize.columns.Base Price (US$, before incentives).showAsBar' => true,
                'metadata.visualize.columns.Base Price (US$, before incentives).showOnDesktop' => true,
                'metadata.visualize.columns.Base Price (US$, before incentives).showOnMobile' => true,
                'metadata.describe.intro' => 'The seven top-selling fully electric vehicles in the US, February 2018 '
            ],
            'data' =>
"Model	Base Price (US$, before incentives)	Range in miles
Tesla Model S 100D	94000	335
Tesla Model X 100D	96000	295
Chevrolet Bolt	37495	238
Tesla Model 3	35000	220
Nissan Leaf	30875	150
VW e-Golf	38000	125
BMW i3	44450	114"
        );

        $datasets[] = array(
            'id' => 'income-health',
            'type' => __('scatter plot', 'd3-scatter-plot'),
            'presets' => array(
                'type' => 'd3-scatter-plot',
                'metadata.visualize.auto-labels' => true,
                'metadata.axes.labels' => "Country",
                'metadata.data.transpose' => false,
                'metadata.describe.intro' => 'GDP per capita in US-Dollars and life expectancy in years for selected countries, 2015.',
                'metadata.describe.source-name' => 'Gapminder',
                'metadata.describe.source-url' => 'source: https://www.gapminder.org/tools/#$state$marker$axis_x$domainMin:null&domainMax:null&zoomedMin:null&zoomedMax:null;&axis_y$domainMin:null&domainMax:null&zoomedMin:50&zoomedMax:null;;;&chart-type=bubbles',
            ),
            'title' => __('Income vs life expectancy'),
            'data' =>
"Country;GDP per capita;Life expectancy;Population;Continent
Lesotho;2598;47.1;2174645;Africa
Central African Republic;599;49.6;4546100;Africa
Swaziland;6095;51.8;1319011;Africa
Afghanistan;1925;53.8;33736494;Asia
Somalia;624;54.2;13908129;Africa
Guinea-Bissau;1386;55.6;1770526;Africa
South Sudan;3047;56.1;11882136;Africa
Zambia;4034;56.7;16100587;Africa
Mozambique;1176;57.1;28010691;Africa
Sierra Leone;2085;57.1;7237025;Africa
Chad;2191;57.4;14009413;Africa
Botswana;17196;58.7;2209197;Africa
Guinea;1225;59.1;12091533;Africa
Cote d'Ivoire;3491;59.1;23108472;Africa
Zimbabwe;1801;59.3;15777451;Africa
Cameroon;2897;59.4;22834522;Africa
Angola;7615;59.6;27859305;Africa
Mali;1684;60.2;17467905;Africa
Malawi;799;60.5;17573607;Africa
Congo, Dem. Rep.;809;60.8;76196619;Africa
Burkina Faso;1654;60.9;18110624;Africa
Papua New Guinea;2529;60.9;7919825;Australia
Niger;943;61;19896965;Africa
Equatorial Guinea;31087;61;1175389;Africa
Uganda;1680;61.3;40144870;Africa
South Africa;12509;61.3;55291225;Africa
Burundi;777;61.4;10199270;Africa
Togo;1433;61.5;7416802;Africa
Congo, Rep.;6220;61.5;4995648;Africa
Benin;1830;62.3;10575952;Africa
Kiribati;1824;63;112407;Australia
Liberia;958;63.2;4499621;Africa
Madagascar;1400;63.5;24234088;Africa
Djibouti;3139;63.8;927414;Africa
Solomon Islands;2047;64;587482;Australia
Tanzania;2571;64.1;53879957;Africa
Namibia;10040;64.2;2425561;Africa
Haiti;1710;64.3;10711061;North America
Nigeria;5727;64.6;181181744;Africa
Vanuatu;2912;64.9;264603;Australia
Kenya;2898;65.1;47236259;Africa
Ethiopia;1520;65.2;99873033;Africa
Senegal;2251;65.3;14976994;Africa
Ghana;4099;65.3;27582821;Africa
Fiji;7925;65.8;892149;Australia
Rwanda;1549;65.9;11629553;Africa
Pakistan;4743;65.9;189380513;Asia
Gabon;18627;65.9;1930175;Africa
Yemen;3887;66;26916207;Asia
Guyana;6816;66.8;768514;South America
Marshall Islands;3661;66.9;52994;Australia
Lao;5212;67.1;6663967;Asia
Mongolia;11819;67.1;2976877;Asia
India;5903;67.2;1309053980;Asia
Iraq;14646;67.4;36115649;Asia
Sudan;3975;67.5;38647803;Africa
Sao Tome and Principe;3003;68;195553;Africa
Myanmar;4012;68;52403669;Asia
Comoros;1472;68.1;777424;Africa
Gambia;1644;68.1;1977590;Africa
Syria;4637;68.2;18734987;Asia
Micronesia, Fed. Sts.;3510;68.9;104433;Australia
Cambodia;3267;69.4;15517635;Asia
Nepal;2352;69.7;28656282;Asia
Mauritania;3877;69.7;4182341;Africa
Kyrgyz Republic;3245;69.8;5956900;Asia
Turkmenistan;15865;70;5565284;Asia
Kazakhstan;23468;70.2;17544126;Asia
Bangladesh;3161;70.4;161200886;Asia
Philippines;6876;71;101716359;Asia
Belarus;17415;71;9489616;Europe
Russia;23038;71;144096870;Europe
Indonesia;10504;71.1;258162113;Asia
St. Vincent and the Grenadines;10435;71.2;109455;North America
Tonga;5069;71.5;106364;Australia
Ukraine;8449;71.5;45154029;Europe
Egypt;11031;71.5;93778172;Africa
Grenada;11593;71.5;106823;North America
Belize;8501;71.7;359288;North America
Uzbekistan;5598;71.8;31298900;Asia
Suriname;17125;72;553208;South America
North Korea;1390;72.1;25243917;Asia
Greenland;27763;72.1;56114;North America
Timor-Leste;2086;72.4;1240977;Australia
Tajikistan;2582;72.4;8548651;Asia
Trinidad and Tobago;30113;72.4;1360092;North America
Guatemala;7279;72.6;16252429;North America
Bhutan;7983;72.7;787386;Asia
Georgia;7474;72.9;3717100;Asia
Azerbaijan;16986;72.9;9649341;Asia
Honduras;4270;73;8960829;North America
Dominica;10503;73.1;73162;North America
Samoa;5558;73.2;193759;Australia
Bolivia;6295;73.2;10724705;South America
Bahamas;22818;73.7;386838;North America
Moldova;4896;73.9;3554108;Europe
Libya;17261;74.1;6234955;Africa
Seychelles;25684;74.1;93419;Africa
Paraguay;8219;74.4;6639119;South America
Brazil;15441;74.4;205962108;South America
Mauritius;18350;74.5;1262605;Africa
West Bank and Gaza;4319;74.6;4422143;Asia
Morocco;7319;74.6;34803322;Africa
Iran;15573;74.6;79360487;Asia
Armenia;7763;74.7;2916950;Asia
Thailand;14512;74.7;68657600;Asia
St. Lucia;9997;74.8;177206;North America
Venezuela;15753;74.8;31155134;South America
Bulgaria;16371;74.8;7177991;Europe
El Salvador;7776;74.9;6312478;North America
Jamaica;8606;75;2871934;North America
Romania;19203;75.2;19815481;Europe
Lithuania;26665;75.2;2904910;Europe
Dominican Republic;12837;75.3;10528394;North America
Malaysia;24320;75.3;30723155;Asia
Vietnam;5623;75.4;93571567;Asia
Latvia;23282;75.4;1977527;Europe
United Arab Emirates;60749;75.4;9154302;Asia
Barbados;12984;75.7;284217;North America
Aruba;37138;75.72;104341;North America
Ecuador;10996;75.9;16144368;South America
Mexico;16850;75.9;125890949;North America
Serbia;12908;76.2;7095383;Europe
China;13334;76.2;1371220000;Asia
Algeria;13434;76.4;39871528;Africa
Antigua and Barbuda;21049;76.4;99923;North America
Macedonia, FYR;12547;76.5;2079308;Europe
Argentina;17344;76.5;43417765;South America
Hungary;24200;76.7;9843028;Europe
Uruguay;20438;76.8;3431552;South America
Brunei;73003;77.1;417542;Asia
Montenegro;14833;77.2;622159;Europe
Oman;48226;77.2;4199810;Asia
Sri Lanka;10624;77.6;20966000;Asia
Tunisia;11126;77.6;11273661;Africa
Poland;24787;77.6;37986412;Europe
Slovak Republic;27204;77.6;5423801;Europe
Croatia;20260;77.8;4203604;Europe
Estonia;26812;77.8;1315407;Europe
Nicaragua;4712;78;6082035;North America
Albania;10620;78;2880703;Europe
Colombia;12761;78;48228697;South America
Panama;20485;78.2;3969249;North America
Cuba;21291;78.2;11461432;North America
Jordan;11752;78.5;9159302;Asia
Puerto Rico;33604;78.5;3473181;North America
Bermuda;47081;78.5;65250;North America
Czech Republic;29437;78.8;10546059;Europe
Bosnia and Herzegovina;9833;78.9;3535961;Europe
Lebanon;17050;78.9;5851479;Asia
Bahrain;44138;79.1;1371855;Asia
United States;53354;79.1;320896618;North America
Turkey;19360;79.2;78271472;Asia
Chile;22465;79.4;17762681;South America
Peru;11903;79.5;31376671;South America
Taiwan;42948;79.5;23485755;Asia
Saudi Arabia;52469;79.5;31557144;Asia
Qatar;132877;79.7;2481539;Asia
Maldives;14408;80;418403;Asia
Costa Rica;14132;80.3;4807852;North America
Kuwait;82633;80.3;3935794;Asia
Denmark;43495;80.4;5683483;Europe
Belgium;41240;80.5;11274196;Europe
Portugal;26437;80.8;10358076;Europe
Germany;44053;80.8;81686611;Europe
Macao, China;148374;80.82;600942;Asia
Slovenia;28550;80.9;2063531;Europe
Finland;38923;80.9;5479531;Europe
Greece;25430;81;10820883;Europe
South Korea;34644;81;51014947;Asia
United Kingdom;38225;81;65128861;Europe
Austria;44401;81.3;8633169;Europe
Netherlands;45784;81.3;16939923;Europe
New Zealand;34186;81.4;4595700;Australia
Canada;43294;81.7;35832513;North America
Ireland;47758;81.7;4646554;Europe
Cyprus;29797;81.8;1160985;Europe
France;37599;81.8;66624068;Europe
Norway;64304;82;5190239;Europe
Singapore;80794;82;5535002;Asia
Malta;30265;82.1;431874;Europe
Israel;31590;82.1;8380100;Asia
Sweden;44892;82.1;9799186;Europe
Italy;33297;82.2;60730582;Europe
Luxembourg;88314;82.2;569604;Europe
Australia;44056;82.3;23850784;Australia
Spain;32979;82.6;46444832;Europe
Switzerland;56118;83;8282396;Europe
Japan;36162;83.2;127141000;Asia
Iceland;42182;83.3;330815;Europe
Hong Kong, China;53874;83.73;7291300;Asia
Andorra;46577;84.8;78014;Europe"
        );

//         $datasets[] = array(
//             'id' => 'income-urbanpopulation',
//             'type' => __('Scatterplot'),
//             'presets' => array(
//                 'type' => 'd3-scatter-plot',
//                 'metadata.visualize.auto-labels' => true,
//                 'metadata.axes.labels' => "Country",
//                 'metadata.data.transpose' => false,
//                 'metadata.describe.intro' => 'GDP per capita in US-Dollars and share of urban population for selected countries, 2016.',
//                 'metadata.describe.source-name' => 'Our World in Data',
//                 'metadata.describe.source-url' => 'source: https://ourworldindata.org/economic-growth',
//             ),
//             'title' => __('Comparing income and urban population'),
//             'data' =>
// "Country;GDP per capita;Share of urban population;Population;Continent
// Central African Republic;647.9;40.332;4594621;Africa
// Burundi;721.2;12.359;10524117;Africa
// Democratic Republic of Congo;742.3;43.015;78736153;Africa
// Liberia;753.6;50.1;4613823;Africa
// Niger;907;19.01;20672987;Africa
// Malawi;1084;16.454;18091575;Africa
// Mozambique;1128.3;32.508;28829476;Africa
// Guinea;1215;37.651;12395924;Africa
// Sierra Leone;1365.9;40.318;7396190;Africa
// Togo;1382.1;40.463;7606374;Africa
// Madagascar;1396.1;35.741;24894551;Africa
// Comoros;1411.2;28.412;795601;Africa
// Guinea-Bissau;1466.3;50.094;1815698;Africa
// Gambia;1565.8;60.224;2038501;Africa
// Burkina Faso;1594.6;30.688;18646433;Africa
// Ethiopia;1608.3;19.922;102403196;Africa
// Haiti;1654;59.794;10847334;North America
// Uganda;1713.9;16.444;41487965;Africa
// Afghanistan;1739.6;27.132;34656032;Asia
// Rwanda;1773.8;29.775;11917508;Africa
// Chad;1845.9;22.618;14452543;Africa
// Zimbabwe;1859.9;32.277;16150362;Africa
// Kiribati;1897.8;44.447;114395;Australia
// Mali;1962.7;40.683;17994837;Africa
// Benin;2010;44.395;10872298;Africa
// Solomon Islands;2072.7;22.779;599419;Australia
// Nepal;2287.7;18.995;28982771;Asia
// Yemen;2325.1;35.187;27584213;Asia
// Senegal;2380.4;44.065;15411614;Africa
// Tanzania;2583.3;32.316;55572201;Africa
// Tajikistan;2762.6;26.891;8734951;Asia
// Lesotho;2808.2;27.84;2203821;Africa
// Vanuatu;2856.5;26.441;270402;Australia
// Kenya;2925.6;26.055;48461567;Africa
// Sao Tome and Principe;2993.4;65.647;199910;Africa
// Cameroon;3045.9;54.938;23439189;Africa
// Bangladesh;3319.4;35.035;162951560;Asia
// Micronesia;3331;22.481;104937;Australia
// Tuvalu;3385.4;60.62;11097;Australia
// Cote d'Ivoire;3448.1;54.869;23695919;Africa
// Cambodia;3462.8;20.945;15762370;Asia
// Mauritania;3572.3;60.446;4301018;Africa
// Zambia;3636.1;41.379;16591390;Africa
// Marshall Islands;3775.1;72.94;53066;Australia
// Ghana;3980.2;54.682;28206728;Africa
// Sudan;4385;34.007;39578828;Africa
// Honduras;4392.3;55.315;9112867;North America
// Pakistan;4866.2;39.224;193203476;Asia
// Moldova;4944.3;45.089;3551954;Europe
// Nicaragua;5136.8;59.107;6149928;North America
// Congo;5301.4;65.798;5125821;Africa
// Tonga;5332.5;23.801;107122;Australia
// Myanmar;5351.6;34.65;52885223;Asia
// Nigeria;5438.9;48.597;185989640;Africa
// Lao;5734.6;39.654;6758353;Asia
// Samoa;5882.1;18.955;195125;Australia
// Vietnam;5955.3;34.236;94569072;Asia
// Angola;6024.7;44.819;28813463;Africa
// Uzbekistan;6038.9;36.479;31847900;Asia
// Cape Verde;6074.8;66.187;539560;Africa
// India;6092.6;33.136;1324171354;Asia
// Bolivia;6708;68.911;10887882;South America
// Philippines;7236.5;44.289;103320222;Asia
// Guyana;7248.2;28.661;773303;South America
// Morocco;7265.8;60.685;35276786;Africa
// Guatemala;7366.8;52.03;16582469;North America
// Ukraine;7668.1;69.915;45004645;Europe
// Swaziland;7733.8;21.315;1343098;Africa
// Belize;7831.5;43.845;366954;North America
// El Salvador;7990;67.189;6344722;North America
// Bhutan;8105.8;39.377;797765;Asia
// Armenia;8174.4;62.558;2924816;Asia
// Jamaica;8190;55.03;2881355;North America
// Jordan;8389.5;83.905;9455802;Asia
// Fiji;8862.7;54.099;898760;Australia
// Paraguay;8877.6;59.924;6725308;South America
// Georgia;9267.3;53.826;3719300;Asia
// Kosovo;9331.7;0;1816200;Europe
// Namibia;9812.4;47.625;2479713;Africa
// Dominica;10174;69.82;73543;North America
// Egypt;10319.3;43.222;95688681;Africa
// Ecuador;10462.4;63.976;16385068;South America
// Saint Lucia;10703.1;18.54;178015;North America
// Tunisia;10752;67.047;11403248;Africa
// Saint Vincent and the Grenadines;10758.6;50.899;109643;North America
// Indonesia;10764.5;54.466;261115456;Asia
// Bosnia and Herzegovina;11179.3;39.94;3516816;Europe
// Mongolia;11328.5;72.823;3027398;Asia
// Sri Lanka;11417.3;18.407;21203000;Asia
// Albania;11424.6;58.376;2876101;Europe
// Peru;12071.6;78.924;31773839;South America
// Maldives;12235.5;46.54;427756;Asia
// South Africa;12260.2;65.295;56015473;Africa
// Grenada;12911;35.616;107317;North America
// Nauru;12950.5;100;13049;Australia
// Lebanon;12974.2;87.914;6006668;Asia
// Macedonia;13054.8;57.204;2081206;Europe
// Suriname;13113.9;66.015;558368;South America
// Colombia;13124.3;76.708;48653419;South America
// Serbia;13720.1;55.668;7058322;Europe
// Algeria;13974.7;71.304;40606052;Africa
// Brazil;14023.7;85.933;207652865;South America
// Dominican Republic;14098.9;79.841;10648791;North America
// Palau;14251.2;87.636;21503;Australia
// China;14400.9;56.778;1378665000;Asia
// Costa Rica;15401.5;77.675;4857274;North America
// Botswana;15513.4;57.71;2250260;Africa
// Barbados;15588.3;31.415;284996;North America
// Turkmenistan;15648.4;50.396;5662544;Asia
// Montenegro;15658.1;64.223;622303;Europe
// Thailand;15681.8;51.54;68863514;Asia
// Azerbaijan;15994;54.895;9757812;Asia
// Iraq;16086.9;69.592;37202572;Asia
// Belarus;16742.3;77.046;9501534;Europe
// Gabon;16786;87.366;1979786;Africa
// Mexico;16831.1;79.517;127540423;North America
// Bulgaria;17709.1;74.266;7127822;Europe
// Argentina;18479.4;91.893;43847430;South America
// Mauritius;19548.6;39.548;1263473;Africa
// Uruguay;20046.9;95.46;3444006;South America
// Antigua and Barbuda;20777.6;23.393;100963;North America
// Panama;21334.9;66.895;4034119;North America
// Croatia;21408.6;59.284;4174349;Europe
// Bahamas;21481.7;82.951;391232;North America
// Romania;21647.8;54.749;19699312;Europe
// Chile;22706.7;89.697;17909754;South America
// Kazakhstan;23419.9;53.229;17794397;Asia
// Equatorial Guinea;23671.4;40.103;1221490;Africa
// Turkey;23679.4;73.887;79512426;Asia
// Latvia;23712.1;67.361;1959537;Europe
// Russia;24026;74.101;144342396;Europe
// Greece;24263.9;78.329;10770521;Europe
// Saint Kitts and Nevis;24738.3;32.153;54821;North America
// Hungary;25381.3;71.672;9814023;Europe
// Malaysia;25660.5;75.37;31187265;Asia
// Poland;26003;60.531;37970087;Europe
// Seychelles;26319.2;54.214;94677;Africa
// Portugal;27006.9;64.017;10325452;Europe
// Estonia;27735.1;67.468;1315790;Europe
// Lithuania;27904.1;66.512;2868231;Europe
// Slovakia;29156.1;53.468;5430798;Europe
// Trinidad and Tobago;29579;8.352;1364962;North America
// Slovenia;29803.4;49.627;2065042;Europe
// Czech Republic;31071.7;72.98;10566332;Europe
// Cyprus;31195.5;66.84;1170125;Europe
// Israel;32612.7;92.205;8546000;Asia
// Spain;33261.1;79.802;46484533;Europe
// Italy;34620.1;69.116;60627498;Europe
// South Korea;34985.8;82.592;51245707;Asia
// New Zealand;35269.1;86.322;4693200;Australia
// Malta;35694;95.529;437418;Europe
// France;38058.9;79.75;66892205;Europe
// Japan;38239.8;93.928;126994511;Asia
// United Kingdom;38901;82.835;65595565;Europe
// Finland;39422.6;84.358;5495303;Europe
// Belgium;41945.7;97.897;11338476;Europe
// Canada;43087.8;82.006;36264604;North America
// Germany;44072.4;75.51;82487842;Europe
// Austria;44143.7;66.032;8731471;Europe
// Australia;44414;89.554;24210809;Australia
// Iceland;45276.4;94.23;335439;Europe
// Denmark;45686.5;87.847;5728010;Europe
// Sweden;46441.2;85.964;9923085;Europe
// Netherlands;47128.3;91.032;17030314;Europe
// Saudi Arabia;50458.2;83.331;32275687;Asia
// United States;53272.5;81.788;323127513;North America
// Hong Kong;54279.2;100;7336600;Asia
// Switzerland;56625.1;73.99;8372413;Europe
// Ireland;62828.3;63.535;4749777;Europe
// Norway;63810.8;80.734;5236151;Europe
// United Arab Emirates;67133.1;85.804;9269612;Asia
// Brunei;71788.8;77.505;423196;Asia
// Singapore;81443.4;100;5607283;Asia
// Macao;96565.9;100;612167;Asia
// Luxembourg;97018.7;90.432;582014;Europe
// Qatar;118215.3;99.317;2569804;Asia"
//         );

        $datasets[] = array(
            'id' => 'income-urbanpopulation',
            'type' => __('stacked bars', 'd3-bars'),
            'presets' => array(
                'type' => 'd3-bars-stacked',
                'metadata.data.transpose' => false,
                'metadata.describe.intro' => 'Share of population that lives in the capital, in urban areas and in rural areas, of selected countries, 2014.',
                'metadata.describe.source-name' => 'UN Population Division',
                'metadata.describe.source-url' => 'source: https://esa.un.org/unpd/wup/CD-ROM/',
                'metadata.annotate.notes' => '<a href="https://unstats.un.org/unsd/demographic/sconcerns/densurb/Defintion_of%20Urban.pdf">The UN defines "Urban" differently for each country.</a> To count as "urban", Japanese settlements need to have at least 50,000 inhabitants. In Iceland, 200 inhabitants are enough.'
            ),
            'title' => __('Rural and urban population'),
            'data' =>
"country;Share of population that lives in the capital;in other urban areas;in rural areas
<b>Iceland</b> (Reykjavík);56.02;38;6
<b>Argentina</b> (Buenos Aires);34.95;56.6;8.4
<b>Japan</b> (Tokyo);29.52;63.5;7
<b>Portugal</b> (Lisbon);27.4;35.5;37.1
<b>Ireland</b> (Dublin);24.65;38.3;37
<b>UK</b> (London);22.7;59.6;17.7
<b>Denmark</b> (Copenhagen);22.16;65.3;12.5
<b>Egypt</b> (Cairo);20.06;23;56.9
<b>South Korea </b>(Seoul);19.4;63;17.6
<b>Mexico</b> (Mexico City);16.78;62.2;21
<b>France</b> (Paris);16.77;62.5;20.7
<b>Russia</b> (Moscow);8.39;65.5;26.1
<b>Niger</b> (Niamey);5.53;12.9;81.5
<b>Germany</b> (Berlin);4.35;70.7;24.9
<b>India </b>(Delhi);1.93;30.4;67.6
<b>Australia</b> (Canberra);1.77;87.5;10.7
<b>USA</b> (Washington, D.C.);1.54;79.9;18.6
<b>China</b> (Beijing);1.4;53;45.6"
        );

        $datasets[] = array(
            'id' => 'artmuseums',
            'title' => __('The most visited art museums 2018'),
            'type' => __('table', 'tables'),
            'presets' => [
                'type' => 'tables',
                'metadata.data.transpose' => false,
                'metadata.describe.source-name' => "Wikipedia",
                'metadata.describe.source-url' => 'https://en.wikipedia.org/wiki/List_of_most_visited_art_museums',
                'metadata.visualize.pagination' => true,
                'metadata.visualize.sortable' => true,
                'metadata.visualize.showRank' => true,
                'metadata.visualize.searchable' => true,
                'metadata.visualize.columns.Visitors 2018.showAsBar' => true,
                'metadata.visualize.columns.Visitors 2018.barNoBackground' => true,
                'metadata.visualize.columns.City.replaceFlags' => true,
                'metadata.visualize.columns.City.flagStyle' => "circle"
            ],
            'data' =>
"Name,city,Visitors 2018
Musée du Louvre,:fr: Paris,10200000
National Museum of China,:cn: Beijing,8610092
Metropolitan Museum of Art,:us: New York City,6953927
Vatican Museums,:it: Vatican City,6756186
Tate Modern,:gb: London,5868562
British Museum,:gb: London,5820000
National Gallery,:gb: London,5735831
National Gallery of Art,:us: Washington D.C.,4404212
State Hermitage Museum,:ru: Saint Petersburg,4220000
Victoria and Albert Museum,:gb: London,3967566
Reina Sofía,:es: Madrid,3898309
National Palace Museum,:tw: Taipei,3860644
Museo del Prado,:es: Madrid,3672853
Musée National d'Art Moderne (Centre Pompidou),:fr: Paris,3551544
National Museum of Korea,:kr: Seoul,3304453
Musée d'Orsay,:fr: Paris,3286224
Somerset House,:gb: London,3143626
Moscow Kremlin Museums,:ru: Moscow,2867295
Tokyo Metropolitan Art Museum,:jp: Tokyo,2787770
Museum of Modern Art,:us: New York City,2774103
The National Art Center Tokyo,:jp: Tokyo,2717565
National Gallery of Victoria,:au: Melbourne,2565474
Tokyo National Museum,:jp: Tokyo,2431073
Smithsonian American Art Museum,:us: Washington D.C.,2304404
National Portrait Gallery,:us: Washington D.C.,2304404
Rijksmuseum,:nl: Amsterdam,2300000
Galleria degli Uffizi,:it: Florence,2230914
National Museum of Scotland,:gb: Edinburgh,2227773
Van Gogh Museum,:nl: Amsterdam,2190000
Tretyakov Gallery,:ru: Moscow,2148538
Shanghai Museum,:cn: Shanghai,2111730
National Folk Museum of Korea,:kr: Seoul,1813626
National Museum of Singapore,:sg: Singapore,1803340
National Gallery Singapore,:sg: Singapore,1803340
Acropolis Museum,:gr: Athens,1774304
Scottish National Gallery,:gb: Edinburgh,1739128
Galleria dell'Accademia,:it: Florence,1719645
Art Institute of Chicago,:us: Chicago,1621861
Royal Academy of Arts,:gb: London,1594140
National Portrait Gallery,:gb: London,1586451
Belvedere,:at: Vienna,1510468
Getty Center [iii],:us: Los Angeles,1509196
Queensland Gallery of Modern Art,:au: Brisbane,1463448
Australian Centre for the Moving Image,:au: Melbourne,1412630
Centro Cultural Banco do Brasil,:br: Rio de Janeiro,1388664
Royal Ontario Museum,:ca: Toronto,1381712
National Museum of Western Art,:jp: Tokyo,1436941
Museum of European and Mediterranean Civilisations(MUCEM),:fr: Marseille,1335000
Art Gallery of New South Wales,:au: Sydney,1303789
Pushkin State Museum of Fine Arts,:ru: Moscow,1301832
Tate Britain,:gb: London,1272523
Guggenheim Museum Bilbao,:es: Bilbao,1265756
Musée du quai Branly,:fr: Paris,1261817
Museum of Fine Arts,:us: Boston,1249080
Petit Palais,:fr: Paris,1203810
Saatchi Gallery,:gb: London,1200000
National Museum of Modern and Contemporary Art,:kr: Seoul,1185168
National Museum in Krakow,:pl: Krakow,1147140
Centro Cultural Banco do Brasil,:br: Brasília,1146995
Louis Vuitton Foundation,:fr: Paris,1142731
Hong Kong Heritage Museum,:hk: Hong Kong,1142235
National Museum of Modern Art,:jp: Tokyo,1129270
Museum of Fine Arts Houston,:us: Houston,1117269
Grand Palais,:fr: Paris,1106868
Dalí Theatre and Museum,:es: Figueres,1105169
National Museum of the American Indian,:us: Washington D.C.,1104751
Gyeongju National Museum,:kr: Gyeongju,1102837
Los Angeles County Museum of Art,:us: Los Angeles,1096741
Museum of Contemporary Art Australia,:au: Sydney,1089551
Kelvingrove Art Gallery and Museum,:gb: Glasgow,1054562
Guggenheim Museum,:us: New York City,1031085
Tel Aviv Museum of Art,:il: Tel Aviv,1108323
San Francisco Museum of Modern Art,:us: San Francisco,1014000
Whitney Museum,:us: New York City,1006918
Albertina,:at: Vienna,1004800
Montreal Museum of Fine Arts,:ca: Montreal,1004287
Musée de l'Orangerie,:fr: Paris,1004287
Louvre Abu Dhabi,:ae: Abu Dhabi,1000700
National Art Museum of China,:cn: Beijing,1000000"
        );

        $datasets[] = array(
            'id' => 'wikimedia',
            'title' => __('Wikimedia projects & their launch dates (Markdown)'),
            'type' => __('table', 'tables'),
            'presets' => [
                'type' => 'tables',
                'metadata.data.transpose' => false,
                'metadata.describe.source-name' => "Wikipedia",
                'metadata.describe.source-url' => 'https://en.wikipedia.org/wiki/Wikimedia_Foundation#Wikimedia_projects',
                'metadata.visualize.noHeader' => true,
                'metadata.visualize.showRank' => false,
                'metadata.visualize.searchable' => false,
                'metadata.visualize.markdown' => true,
                'metadata.visualize.showOnMobile' => true,
                'metadata.visualize.columns.Name.style.fontSize' => 1.4,
                'metadata.visualize.columns.Launched.format' => "MMMM YYYY"
            ],
            'data' =>
"Launched;Name
January 2001;[Wikipedia](www.wikipedia.org) ^online encyclopedia^
December 2002;[Wiktionary](www.wiktionary.org) ^online dictionary and thesaurus^
July 2003;[Wikibooks](www.wikibooks.org) ^collection of textbooks^
July 2003;[Wikiquote](www.wikiquote.org) ^collection of quotations^
July 2003;[Wikivoyage](www.wikivoyage.org) ^travel guide^
November 2003;[Wikisource](wikisource.org) ^digital library^
September 2004;[Wikimedia Commons](commons.wikimedia.org) ^repository of images, sounds, videos, and general media^
September 2004;[Wikispecies](species.wikimedia.org) ^taxonomic catalogue of species^
November 2004;[Wikinews](www.wikinews.org) ^online newspaper^
August 2006;[Wikiversity](www.wikiversity.org) ^collection of tutorials and courses, while also serving as a hosting point to coordinate research^
October 2012;[Wikidata](www.wikidata.org) ^knowledge base^"
        );

        /*$datasets[] = array(
            'id' => 'life-expectancy-development',
            'title' => __('Life expectancy 1960-2016 (Sparklines)'),
            'type' => __('Table'),
            'presets' => array(
                'type' => 'tables',
                'metadata.data.transpose' => false,
                'metadata.describe.source-name' => 'Worldbank',
                'metadata.describe.source-url' => 'https://data.worldbank.org/indicator/sp.dyn.le00.in',
                'metadata.visualize.pagination' => true,
                'metadata.visualize.sortable' => true,
                'metadata.visualize.searchable' => true,
                'metadata.visualize.columns.1960.sparkline.enabled' => true,
                'metadata.visualize.columns.1961.sparkline.enabled' => true,
                'metadata.visualize.columns.1962.sparkline.enabled' => true,
                'metadata.visualize.columns.1963.sparkline.enabled' => true,
                'metadata.visualize.columns.1964.sparkline.enabled' => true,
                'metadata.visualize.columns.1965.sparkline.enabled' => true,
                'metadata.visualize.columns.1966.sparkline.enabled' => true,
                'metadata.visualize.columns.1967.sparkline.enabled' => true,
                'metadata.visualize.columns.1968.sparkline.enabled' => true,
                'metadata.visualize.columns.1969.sparkline.enabled' => true,
                'metadata.describe.intro' => 'Life expectancy in all countries increased since 1960, but with a different pace'
            ),
            'data' =>
"Country,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,Difference between 1960-2016
Aruba,65.66,66.07,66.44,66.79,67.11,67.44,67.76,68.09,68.44,68.78,69.14,69.50,69.85,70.19,70.52,70.83,71.14,71.44,71.74,72.02,72.29,72.54,72.75,72.93,73.07,73.18,73.26,73.33,73.38,73.42,73.47,73.51,73.54,73.57,73.60,73.62,73.65,73.67,73.70,73.74,73.79,73.85,73.94,74.04,74.16,74.29,74.43,74.58,74.72,74.87,75.02,75.16,75.30,75.44,75.58,75.72,75.87,10.20
Afghanistan,32.29,32.74,33.19,33.62,34.06,34.49,34.93,35.36,35.80,36.23,36.68,37.13,37.59,38.06,38.54,39.04,39.56,40.09,40.65,41.23,41.85,42.51,43.22,43.96,44.75,45.57,46.42,47.29,48.16,49.03,49.86,50.63,51.33,51.97,52.54,53.05,53.53,54.00,54.47,54.96,55.48,56.04,56.64,57.25,57.88,58.50,59.11,59.69,60.24,60.75,61.23,61.67,62.09,62.49,62.90,63.29,63.67,31.38
Angola,33.25,33.57,33.91,34.27,34.65,35.03,35.43,35.83,36.23,36.64,37.05,37.46,37.88,38.30,38.71,39.11,39.48,39.81,40.10,40.34,40.55,40.71,40.85,40.97,41.09,41.19,41.29,41.38,41.47,41.57,41.70,41.85,42.06,42.33,42.68,43.12,43.70,44.38,45.19,46.10,47.11,48.20,49.34,50.51,51.68,52.83,53.97,55.10,56.19,57.23,58.19,59.04,59.77,60.37,60.86,61.24,61.55,28.30
Albania,62.28,63.30,64.19,64.91,65.46,65.85,66.11,66.30,66.48,66.69,66.93,67.23,67.58,67.95,68.34,68.73,69.11,69.45,69.74,69.99,70.21,70.42,70.64,70.88,71.13,71.39,71.61,71.76,71.84,71.86,71.84,71.80,71.80,71.86,71.99,72.20,72.50,72.84,73.21,73.59,73.95,74.29,74.58,74.82,75.03,75.22,75.42,75.66,75.94,76.28,76.65,77.03,77.39,77.70,77.96,78.17,78.34,16.07
Arab World,46.83,47.41,47.99,48.57,49.16,49.74,50.32,50.88,51.42,51.95,52.47,53.02,53.59,54.18,54.80,55.42,56.05,56.66,57.26,57.85,58.46,59.08,59.73,60.40,61.08,61.74,62.36,62.93,63.44,63.89,64.32,64.69,64.98,65.35,65.71,66.12,66.48,66.82,67.13,67.42,67.69,67.95,68.19,68.44,68.69,68.94,69.19,69.42,69.65,69.85,70.04,70.22,70.41,70.60,70.79,70.99,71.20,24.37
United Arab Emirates,52.27,53.31,54.35,55.38,56.38,57.37,58.33,59.25,60.12,60.95,61.72,62.45,63.14,63.80,64.43,65.04,65.62,66.17,66.70,67.21,67.70,68.16,68.61,69.04,69.45,69.84,70.22,70.58,70.91,71.23,71.54,71.84,72.12,72.40,72.67,72.94,73.21,73.47,73.73,73.99,74.24,74.49,74.73,74.97,75.20,75.42,75.63,75.83,76.01,76.18,76.34,76.50,76.65,76.80,76.95,77.10,77.26,24.99
Argentina,65.02,65.14,65.23,65.31,65.39,65.48,65.60,65.76,65.95,66.18,66.45,66.74,67.04,67.35,67.65,67.95,68.25,68.55,68.86,69.16,69.46,69.75,70.00,70.23,70.44,70.62,70.80,70.97,71.16,71.35,71.56,71.79,72.02,72.26,72.49,72.72,72.95,73.17,73.40,73.62,73.83,74.04,74.24,74.42,74.60,74.78,74.94,75.11,75.27,75.43,75.59,75.76,75.93,76.09,76.25,76.42,76.58,11.55
Armenia,65.97,66.40,66.84,67.28,67.72,68.15,68.59,69.02,69.42,69.81,70.14,70.41,70.60,70.72,70.77,70.78,70.78,70.80,70.84,70.90,70.94,70.91,70.78,70.52,70.15,69.70,69.20,68.73,68.33,68.04,67.88,67.87,67.99,68.22,68.54,68.94,69.40,69.91,70.43,70.94,71.41,71.80,72.11,72.35,72.51,72.62,72.72,72.81,72.95,73.12,73.33,73.57,73.81,74.04,74.25,74.44,74.62,8.65
Antigua and Barbuda,62.12,62.55,62.98,63.38,63.77,64.15,64.51,64.86,65.21,65.56,65.90,66.23,66.56,66.88,67.18,67.48,67.77,68.05,68.33,68.60,68.87,69.14,69.41,69.67,69.93,70.19,70.44,70.67,70.91,71.13,71.35,71.57,71.78,72.00,72.22,72.44,72.66,72.89,73.11,73.33,73.54,73.75,73.96,74.16,74.35,74.54,74.73,74.91,75.08,75.25,75.41,75.57,75.73,75.89,76.05,76.21,76.36,14.25
Australia,70.82,70.97,70.94,70.91,70.88,70.85,70.82,70.87,70.92,70.97,71.02,71.07,71.46,71.85,72.24,72.63,73.01,73.34,73.67,74.00,74.33,74.66,74.90,75.15,75.39,75.63,75.87,76.15,76.43,76.71,76.99,77.28,77.38,77.88,77.88,77.83,78.08,78.48,78.63,78.93,79.23,79.63,79.94,80.24,80.49,80.84,81.04,81.29,81.40,81.54,81.70,81.90,82.05,82.15,82.30,82.40,82.50,11.68
Austria,68.59,69.58,69.31,69.44,69.92,69.72,70.05,69.92,70.06,69.83,69.91,70.11,70.46,71.01,71.01,71.11,71.57,71.91,72.01,72.31,72.46,72.81,72.96,73.01,73.61,73.81,74.32,74.77,75.22,75.27,75.57,75.62,75.82,76.07,76.42,76.67,76.87,77.32,77.67,77.88,78.13,78.58,78.68,78.63,79.18,79.33,79.88,80.18,80.43,80.33,80.58,80.98,80.94,81.14,81.49,81.19,80.89,12.30
Azerbaijan,61.03,61.26,61.47,61.68,61.89,62.10,62.32,62.54,62.75,62.95,63.14,63.31,63.46,63.58,63.69,63.78,63.85,63.92,63.99,64.07,64.16,64.28,64.42,64.59,64.76,64.91,65.02,65.05,65.02,64.94,64.83,64.75,64.73,64.81,64.99,65.26,65.57,65.90,66.21,66.49,66.76,67.05,67.39,67.79,68.25,68.75,69.27,69.77,70.24,70.65,70.99,71.26,71.48,71.66,71.80,71.92,72.03,10.99
Burundi,41.28,41.59,41.91,42.23,42.54,42.84,43.10,43.33,43.52,43.67,43.83,44.01,44.23,44.52,44.87,45.27,45.70,46.14,46.56,46.95,47.31,47.66,47.99,48.32,48.62,48.84,48.94,48.88,48.68,48.38,48.05,47.82,47.75,47.91,48.30,48.86,49.53,50.19,50.76,51.21,51.55,51.78,51.98,52.19,52.44,52.73,53.09,53.49,53.93,54.39,54.86,55.34,55.81,56.26,56.69,57.09,57.48,16.20
Belgium,69.70,70.52,70.22,70.05,70.76,70.63,70.71,71.01,70.69,70.76,70.97,71.06,71.41,71.64,71.99,71.97,72.12,72.77,72.70,73.19,73.21,73.62,73.89,73.87,74.40,74.52,74.73,75.37,75.57,75.63,76.05,76.19,76.35,76.35,76.69,76.84,77.19,77.37,77.47,77.62,77.72,77.97,78.08,78.13,78.88,78.98,79.38,79.78,79.68,80.03,80.18,80.59,80.39,80.59,81.29,80.99,80.99,11.29
Benin,37.27,37.73,38.19,38.66,39.13,39.62,40.11,40.61,41.12,41.63,42.15,42.68,43.23,43.78,44.34,44.88,45.40,45.88,46.34,46.76,47.19,47.64,48.15,48.71,49.34,50.03,50.79,51.58,52.37,53.13,53.81,54.37,54.78,55.04,55.17,55.20,55.17,55.13,55.14,55.22,55.39,55.67,56.02,56.44,56.89,57.35,57.82,58.26,58.65,59.01,59.32,59.59,59.85,60.11,60.37,60.64,60.91,23.64
Burkina Faso,34.43,34.90,35.37,35.85,36.33,36.81,37.29,37.75,38.21,38.65,39.09,39.54,40.00,40.49,41.02,41.63,42.34,43.17,44.08,45.06,46.05,46.98,47.81,48.49,48.99,49.32,49.49,49.55,49.55,49.51,49.45,49.41,49.37,49.36,49.38,49.45,49.56,49.71,49.91,50.17,50.49,50.89,51.38,51.96,52.60,53.31,54.06,54.84,55.62,56.38,57.10,57.76,58.38,58.94,59.46,59.93,60.36,25.93
Bangladesh,45.83,46.46,47.09,47.69,48.26,48.69,48.90,48.84,48.53,48.05,47.52,47.14,47.03,47.29,47.92,48.87,49.98,51.10,52.08,52.88,53.48,53.92,54.29,54.68,55.10,55.58,56.10,56.65,57.22,57.80,58.40,59.03,59.70,60.40,61.13,61.87,62.61,63.34,64.04,64.70,65.32,65.90,66.45,66.97,67.46,67.94,68.40,68.86,69.31,69.76,70.20,70.63,71.04,71.43,71.80,72.16,72.49,26.66
Bulgaria,69.25,70.20,69.49,70.31,71.12,71.29,71.22,70.41,71.23,70.43,71.26,70.87,70.90,71.34,71.21,71.05,71.39,70.82,71.18,71.31,71.16,71.57,71.19,71.39,71.50,71.23,71.73,71.53,71.60,71.72,71.64,71.56,71.49,71.35,71.21,71.05,70.90,70.35,71.06,71.41,71.66,71.77,71.87,72.07,72.56,72.56,72.61,72.66,72.96,73.41,73.51,74.16,74.31,74.86,74.47,74.61,74.61,5.37
Bahrain,51.87,53.23,54.59,55.91,57.18,58.39,59.52,60.59,61.61,62.56,63.45,64.27,65.04,65.76,66.42,67.04,67.62,68.15,68.65,69.12,69.55,69.95,70.32,70.65,70.96,71.24,71.50,71.73,71.96,72.18,72.39,72.60,72.80,73.01,73.21,73.41,73.62,73.83,74.03,74.24,74.44,74.64,74.82,75.00,75.17,75.33,75.48,75.62,75.77,75.91,76.06,76.20,76.34,76.48,76.62,76.76,76.90,25.03
Bahamas,62.88,63.22,63.55,63.87,64.19,64.50,64.80,65.09,65.38,65.67,65.94,66.22,66.49,66.76,67.03,67.29,67.55,67.80,68.05,68.29,68.52,68.75,68.98,69.21,69.44,69.66,69.89,70.10,70.32,70.52,70.70,70.87,71.01,71.13,71.24,71.35,71.48,71.65,71.85,72.09,72.37,72.67,72.97,73.26,73.54,73.79,74.01,74.22,74.41,74.59,74.76,74.92,75.08,75.23,75.38,75.53,75.67,12.79
Bosnia and Herzegovina,60.35,61.02,61.65,62.24,62.82,63.38,63.94,64.50,65.06,65.62,66.19,66.76,67.32,67.87,68.39,68.87,69.30,69.66,69.95,70.19,70.40,70.60,70.82,71.06,71.31,71.53,71.65,71.63,71.46,71.19,70.88,70.64,70.58,70.72,71.09,71.64,72.31,72.98,73.57,74.06,74.41,74.65,74.82,74.97,75.10,75.22,75.35,75.49,75.62,75.76,75.91,76.06,76.22,76.39,76.56,76.73,76.91,16.56
Belarus,67.71,68.21,68.64,68.99,69.29,69.54,69.73,69.88,69.98,70.05,70.08,70.09,70.09,70.08,70.07,70.05,70.02,69.97,69.91,69.84,69.80,69.82,69.91,70.06,70.27,70.99,71.55,70.99,71.34,71.48,70.84,70.38,70.02,68.97,68.77,68.46,68.51,68.46,68.41,67.91,68.91,68.51,68.06,68.55,68.96,68.85,69.40,70.21,70.46,70.41,70.40,70.55,71.97,72.47,72.97,73.62,73.83,6.12
Belize,59.98,60.53,61.09,61.66,62.24,62.82,63.40,63.97,64.53,65.06,65.57,66.05,66.50,66.94,67.35,67.75,68.14,68.51,68.87,69.23,69.58,69.92,70.26,70.58,70.86,71.11,71.29,71.41,71.44,71.39,71.25,71.01,70.70,70.33,69.92,69.52,69.14,68.82,68.57,68.40,68.33,68.36,68.46,68.62,68.81,69.02,69.22,69.39,69.52,69.61,69.68,69.73,69.80,69.89,70.03,70.19,70.38,10.40
Bolivia,42.14,42.45,42.78,43.11,43.45,43.80,44.16,44.52,44.90,45.28,45.67,46.07,46.48,46.89,47.31,47.74,48.18,48.63,49.08,49.54,50.01,50.49,50.97,51.47,51.97,52.47,52.99,53.51,54.03,54.57,55.10,55.65,56.20,56.75,57.30,57.86,58.42,58.99,59.55,60.12,60.69,61.26,61.83,62.40,62.97,63.54,64.11,64.69,65.27,65.85,66.41,66.94,67.45,67.92,68.36,68.76,69.12,26.99
Brazil,54.24,54.75,55.27,55.78,56.29,56.79,57.29,57.78,58.25,58.72,59.15,59.56,59.92,60.24,60.53,60.78,61.02,61.24,61.48,61.72,61.98,62.26,62.56,62.87,63.19,63.51,63.85,64.20,64.55,64.92,65.30,65.71,66.14,66.61,67.09,67.60,68.11,68.62,69.12,69.60,70.06,70.49,70.90,71.29,71.67,72.04,72.41,72.77,73.13,73.49,73.84,74.17,74.49,74.78,75.04,75.28,75.51,21.27
Barbados,61.00,61.48,61.96,62.45,62.94,63.43,63.90,64.36,64.79,65.19,65.57,65.92,66.26,66.58,66.89,67.20,67.51,67.82,68.12,68.42,68.73,69.02,69.32,69.60,69.88,70.14,70.41,70.66,70.91,71.15,71.38,71.61,71.84,72.06,72.28,72.48,72.68,72.86,73.04,73.21,73.38,73.53,73.69,73.85,74.00,74.16,74.32,74.49,74.65,74.81,74.97,75.13,75.29,75.45,75.60,75.75,75.91,14.90
Brunei Darussalam,62.47,63.02,63.54,64.04,64.52,64.96,65.38,65.78,66.17,66.55,66.93,67.30,67.67,68.02,68.37,68.71,69.03,69.35,69.65,69.94,70.23,70.51,70.78,71.06,71.33,71.59,71.86,72.13,72.40,72.66,72.92,73.17,73.41,73.65,73.88,74.11,74.33,74.55,74.77,74.98,75.20,75.42,75.65,75.88,76.09,76.29,76.45,76.58,76.66,76.70,76.72,76.73,76.76,76.82,76.92,77.05,77.20,14.74
Bhutan,34.53,34.89,35.29,35.73,36.22,36.74,37.30,37.88,38.47,39.06,39.63,40.19,40.73,41.26,41.78,42.31,42.86,43.45,44.08,44.75,45.46,46.20,46.95,47.70,48.44,49.17,49.90,50.63,51.37,52.12,52.88,53.64,54.39,55.15,55.90,56.66,57.43,58.23,59.05,59.90,60.76,61.62,62.48,63.32,64.13,64.88,65.58,66.21,66.79,67.31,67.79,68.23,68.64,69.04,69.43,69.82,70.20,35.67
Botswana,50.66,51.03,51.38,51.73,52.07,52.42,52.79,53.18,53.62,54.09,54.61,55.18,55.78,56.41,57.06,57.72,58.38,59.02,59.63,60.20,60.73,61.22,61.65,62.03,62.33,62.56,62.69,62.72,62.62,62.37,61.91,61.15,60.08,58.75,57.20,55.53,53.83,52.21,50.81,49.71,49.03,48.84,49.11,49.79,50.83,52.16,53.70,55.31,56.92,58.45,59.87,61.18,62.42,63.63,64.78,65.85,66.80,16.14
Central African Republic,36.49,36.90,37.33,37.77,38.23,38.73,39.28,39.88,40.52,41.21,41.95,42.72,43.52,44.33,45.13,45.90,46.63,47.30,47.91,48.44,48.89,49.24,49.51,49.69,49.80,49.82,49.76,49.62,49.40,49.12,48.77,48.35,47.87,47.35,46.81,46.25,45.70,45.17,44.67,44.25,43.94,43.76,43.72,43.83,44.08,44.47,44.97,45.55,46.19,46.86,47.56,48.28,49.04,49.83,50.62,51.41,52.17,15.68
Canada,71.13,71.35,71.37,71.38,71.78,71.87,72.00,72.21,72.35,72.50,72.70,73.03,72.93,73.16,73.24,73.52,73.86,74.22,74.53,74.87,75.08,75.48,75.68,76.04,76.32,76.30,76.44,76.74,76.81,77.07,77.38,77.55,77.32,77.69,77.86,77.98,78.23,78.48,78.66,78.88,79.24,79.49,79.59,79.84,80.14,80.29,80.29,80.54,80.70,80.95,81.20,81.45,81.58,81.77,81.95,82.13,82.30,11.17
Central Europe and the Baltics,67.82,68.26,68.01,68.70,69.05,69.28,69.53,69.27,69.54,69.28,69.45,69.49,69.93,70.07,70.31,70.17,70.32,70.24,70.15,70.24,69.89,70.37,70.46,70.39,70.35,70.31,70.56,70.61,70.86,70.73,70.66,70.57,70.73,70.85,70.87,71.03,71.34,71.52,71.90,72.18,72.72,73.10,73.24,73.38,73.74,73.84,74.09,74.25,74.58,74.93,75.30,75.89,75.99,76.36,76.69,76.59,76.60,8.78
Switzerland,71.31,71.64,71.20,71.19,72.08,72.20,72.34,72.64,72.59,72.61,73.02,73.13,73.64,73.94,74.29,74.67,74.79,75.24,75.19,75.47,75.46,75.69,76.03,76.03,76.61,76.73,76.90,77.20,77.23,77.42,77.24,77.51,77.81,78.09,78.35,78.42,78.90,79.08,79.32,79.58,79.68,80.18,80.39,80.54,81.09,81.24,81.49,81.74,81.99,82.04,82.25,82.70,82.70,82.80,83.20,82.90,82.90,11.58
Channel Islands,70.74,70.83,70.93,71.03,71.14,71.27,71.39,71.51,71.62,71.73,71.82,71.92,72.02,72.13,72.26,72.41,72.58,72.77,72.98,73.21,73.44,73.67,73.89,74.10,74.30,74.49,74.68,74.87,75.07,75.29,75.51,75.73,75.94,76.14,76.34,76.53,76.72,76.92,77.13,77.36,77.60,77.86,78.14,78.42,78.70,78.97,79.24,79.49,79.73,79.95,80.14,80.33,80.49,80.65,80.81,80.96,81.11,10.37
Chile,57.28,57.68,58.10,58.53,58.99,59.48,59.99,60.54,61.10,61.70,62.31,62.95,63.61,64.28,64.97,65.66,66.36,67.05,67.74,68.42,69.07,69.69,70.27,70.80,71.29,71.74,72.16,72.55,72.94,73.31,73.68,74.04,74.39,74.73,75.06,75.37,75.68,75.97,76.26,76.53,76.79,77.03,77.25,77.45,77.63,77.79,77.93,78.07,78.19,78.32,78.45,78.60,78.76,78.93,79.12,79.31,79.52,22.24
China,43.73,44.05,44.78,45.97,47.59,49.55,51.70,53.85,55.84,57.60,59.09,60.30,61.34,62.28,63.13,63.91,64.63,65.28,65.86,66.38,66.84,67.26,67.62,67.93,68.21,68.45,68.66,68.84,69.00,69.15,69.29,69.44,69.59,69.75,69.94,70.16,70.43,70.75,71.11,71.52,71.95,72.40,72.84,73.26,73.64,73.99,74.29,74.56,74.81,75.03,75.24,75.42,75.60,75.77,75.93,76.09,76.25,32.53
Cote d'Ivoire,36.87,37.55,38.22,38.87,39.49,40.10,40.74,41.41,42.12,42.89,43.70,44.53,45.36,46.17,46.94,47.67,48.35,48.98,49.57,50.12,50.62,51.08,51.50,51.88,52.22,52.48,52.68,52.79,52.80,52.71,52.49,52.12,51.60,50.98,50.26,49.50,48.75,48.04,47.44,46.97,46.67,46.57,46.64,46.86,47.20,47.66,48.18,48.75,49.32,49.88,50.42,50.95,51.46,51.99,52.52,53.05,53.58,16.72
Cameroon,41.55,41.99,42.43,42.87,43.30,43.74,44.18,44.64,45.11,45.60,46.10,46.63,47.16,47.70,48.25,48.78,49.31,49.83,50.32,50.78,51.21,51.60,51.96,52.27,52.52,52.70,52.79,52.78,52.68,52.49,52.21,51.84,51.39,50.91,50.43,50.02,49.71,49.54,49.54,49.70,50.03,50.49,51.06,51.67,52.30,52.92,53.49,54.03,54.53,55.00,55.42,55.83,56.24,56.66,57.11,57.58,58.07,16.53
Congo Dem Rep,41.10,41.31,41.53,41.76,41.99,42.26,42.55,42.87,43.21,43.56,43.91,44.25,44.55,44.80,45.03,45.22,45.41,45.61,45.83,46.09,46.36,46.65,46.94,47.21,47.46,47.70,47.95,48.22,48.50,48.79,49.04,49.23,49.31,49.30,49.22,49.11,49.04,49.07,49.23,49.56,50.04,50.67,51.38,52.14,52.92,53.67,54.40,55.09,55.74,56.35,56.91,57.42,57.89,58.35,58.78,59.20,59.62,18.52
Congo Rep,48.60,49.25,49.86,50.44,50.97,51.46,51.91,52.32,52.70,53.05,53.38,53.69,53.99,54.27,54.54,54.81,55.09,55.36,55.63,55.90,56.14,56.37,56.57,56.73,56.84,56.88,56.84,56.74,56.55,56.30,55.95,55.52,55.01,54.44,53.84,53.25,52.68,52.16,51.75,51.47,51.40,51.58,52.02,52.70,53.61,54.69,55.88,57.12,58.32,59.45,60.47,61.37,62.17,62.89,63.54,64.11,64.62,16.02
Colombia,56.75,57.28,57.77,58.24,58.68,59.10,59.50,59.88,60.23,60.57,60.91,61.25,61.60,61.97,62.36,62.79,63.27,63.80,64.35,64.93,65.51,66.05,66.54,66.97,67.31,67.59,67.79,67.94,68.06,68.17,68.29,68.44,68.63,68.86,69.12,69.43,69.76,70.09,70.42,70.73,71.02,71.29,71.56,71.81,72.06,72.30,72.53,72.75,72.95,73.14,73.33,73.50,73.67,73.85,74.02,74.20,74.38,17.63
Comoros,41.45,41.85,42.24,42.64,43.04,43.45,43.86,44.28,44.72,45.18,45.64,46.10,46.56,47.00,47.44,47.89,48.36,48.86,49.41,49.99,50.62,51.27,51.92,52.58,53.22,53.84,54.45,55.03,55.60,56.15,56.68,57.17,57.62,58.04,58.41,58.72,58.97,59.16,59.29,59.39,59.46,59.53,59.62,59.74,59.90,60.13,60.41,60.73,61.09,61.48,61.86,62.24,62.60,62.92,63.22,63.47,63.70,22.25
Cabo Verde,48.93,49.12,49.40,49.77,50.23,50.77,51.35,51.93,52.51,53.08,53.67,54.33,55.10,55.97,56.94,57.95,58.94,59.84,60.61,61.23,61.71,62.07,62.38,62.66,62.96,63.27,63.59,63.92,64.24,64.56,64.88,65.20,65.54,65.90,66.29,66.72,67.22,67.79,68.42,69.09,69.75,70.36,70.88,71.29,71.58,71.76,71.84,71.87,71.88,71.90,71.94,72.02,72.13,72.26,72.42,72.60,72.80,23.87
Costa Rica,60.56,61.27,61.96,62.63,63.26,63.85,64.40,64.92,65.43,65.94,66.44,66.95,67.46,67.98,68.52,69.07,69.65,70.24,70.85,71.45,72.05,72.61,73.14,73.61,74.03,74.40,74.71,74.98,75.22,75.44,75.64,75.83,76.02,76.20,76.39,76.57,76.76,76.94,77.12,77.29,77.45,77.60,77.74,77.87,77.99,78.11,78.23,78.36,78.48,78.61,78.76,78.91,79.08,79.25,79.44,79.63,79.83,19.28
Caribbean small states,62.37,62.87,63.33,63.74,64.11,64.44,64.73,65.00,65.25,65.49,65.74,65.99,66.25,66.51,66.78,67.06,67.34,67.61,67.88,68.13,68.37,68.58,68.77,68.94,69.08,69.19,69.28,69.37,69.44,69.50,69.56,69.62,69.71,69.71,69.76,69.80,69.86,69.99,70.00,70.09,70.20,70.34,70.57,70.69,70.89,71.11,71.35,71.58,71.82,72.04,72.25,72.44,72.62,72.78,72.93,73.06,73.19,10.82
Cuba,63.83,64.44,65.07,65.70,66.33,66.96,67.58,68.17,68.75,69.29,69.81,70.31,70.79,71.26,71.71,72.14,72.55,72.92,73.26,73.55,73.80,74.01,74.18,74.32,74.44,74.52,74.57,74.60,74.61,74.62,74.64,74.70,74.81,74.96,75.17,75.42,75.68,75.95,76.20,76.44,76.66,76.88,77.12,77.38,77.66,77.95,78.22,78.47,78.67,78.83,78.96,79.06,79.17,79.28,79.42,79.57,79.74,15.91
Cyprus,69.62,69.95,70.27,70.59,70.89,71.20,71.49,71.78,72.05,72.32,72.58,72.83,73.07,73.30,73.53,73.75,73.97,74.18,74.39,74.59,74.79,74.98,75.17,75.36,75.54,75.72,75.89,76.06,76.23,76.39,76.55,76.71,76.86,77.02,77.17,77.31,77.46,77.60,77.74,77.88,78.01,78.14,78.26,78.39,78.51,78.63,78.76,78.91,79.07,79.25,79.43,79.62,79.81,80.00,80.17,80.34,80.51,10.89
Czech Republic,70.35,70.51,69.79,70.30,70.46,70.16,70.38,70.26,69.84,69.37,69.44,69.68,70.18,70.02,70.09,70.41,70.53,70.57,70.64,70.75,70.28,70.72,70.81,70.59,70.84,71.05,71.00,71.45,71.64,71.68,71.38,71.90,72.27,72.77,72.97,73.07,73.71,73.82,74.51,74.67,74.97,75.17,75.22,75.17,75.72,75.92,76.52,76.72,76.98,77.08,77.42,77.87,78.08,78.18,78.82,78.58,78.33,7.98
Germany,69.31,69.51,69.69,69.86,70.01,70.15,70.27,70.37,70.47,70.55,70.64,70.74,70.87,71.02,71.20,71.40,71.63,71.88,72.14,72.41,72.68,72.95,73.23,73.51,73.78,74.05,74.31,74.56,74.79,75.01,75.23,75.32,75.82,75.87,76.27,76.42,76.67,77.07,77.48,77.73,77.93,78.33,78.23,78.38,78.68,78.93,79.13,79.53,79.74,79.84,79.99,80.44,80.54,80.49,81.09,80.64,80.64,11.33
Djibouti,44.04,44.47,44.89,45.31,45.73,46.17,46.65,47.20,47.81,48.48,49.16,49.83,50.44,50.98,51.44,51.83,52.18,52.51,52.87,53.24,53.64,54.05,54.45,54.83,55.17,55.49,55.77,56.03,56.27,56.49,56.68,56.83,56.94,57.02,57.06,57.06,57.05,57.02,57.00,56.99,57.02,57.10,57.23,57.42,57.68,58.00,58.39,58.85,59.34,59.87,60.38,60.87,61.31,61.69,62.01,62.26,62.47,18.43
Denmark,72.18,72.44,72.32,72.40,72.49,72.37,72.44,72.92,73.12,73.22,73.34,73.41,73.44,73.68,73.81,74.08,73.74,74.63,74.39,74.22,74.10,74.23,74.55,74.42,74.56,74.43,74.58,74.69,74.77,74.80,74.81,75.16,75.19,75.12,75.38,75.21,75.59,75.95,76.14,76.34,76.59,76.79,76.90,77.14,77.49,77.84,78.10,78.20,78.45,78.60,79.10,79.80,80.05,80.30,80.70,80.70,80.70,8.53
Dominican Republic,51.79,52.52,53.24,53.94,54.63,55.31,55.98,56.62,57.26,57.88,58.47,59.03,59.57,60.07,60.55,61.00,61.42,61.82,62.20,62.59,62.98,63.38,63.80,64.25,64.71,65.21,65.73,66.27,66.81,67.35,67.87,68.33,68.75,69.10,69.40,69.64,69.84,70.02,70.19,70.37,70.57,70.78,70.99,71.21,71.42,71.64,71.86,72.08,72.29,72.50,72.70,72.90,73.10,73.29,73.48,73.67,73.86,22.07
Algeria,46.14,46.60,47.05,47.51,47.96,48.39,48.81,49.21,49.59,49.98,50.37,50.77,51.20,51.67,52.22,52.86,53.66,54.61,55.70,56.91,58.20,59.52,60.82,62.05,63.16,64.11,64.90,65.53,66.03,66.42,66.72,66.98,67.23,67.48,67.77,68.11,68.50,68.93,69.37,69.82,70.29,70.78,71.28,71.78,72.28,72.77,73.22,73.65,74.03,74.37,74.68,74.94,75.19,75.42,75.64,75.86,76.08,29.94
East Asia & Pacific (excluding high income),45.72,46.17,46.89,47.92,49.27,50.86,52.57,54.27,55.84,57.22,58.39,59.36,60.21,60.98,61.71,62.40,63.06,63.68,64.26,64.78,65.26,65.69,66.07,66.42,66.74,67.03,67.29,67.52,67.73,67.93,68.12,68.29,68.46,68.64,68.82,69.03,69.28,69.56,69.88,70.23,70.59,70.97,71.34,71.70,72.03,72.33,72.60,72.84,73.07,73.28,73.48,73.67,73.85,74.01,74.18,74.33,74.49,28.77
Early-demographic dividend,45.21,45.88,46.49,47.04,47.64,48.23,48.87,49.44,49.98,50.51,51.04,51.56,52.08,52.62,53.17,53.72,54.27,54.81,55.33,55.83,56.30,56.74,57.17,57.60,58.02,58.45,58.88,59.31,59.74,60.17,60.60,61.03,61.46,61.89,62.31,62.71,63.10,63.47,63.82,64.16,64.49,64.81,65.12,65.45,65.78,66.12,66.48,66.85,67.22,67.59,67.96,68.31,68.64,68.96,69.25,69.52,69.77,24.55
East Asia & Pacific,48.46,48.99,49.66,50.64,51.84,53.22,54.75,56.24,57.62,58.86,59.91,60.83,61.62,62.32,63.02,63.69,64.30,64.88,65.41,65.90,66.31,66.72,67.11,67.43,67.76,68.04,68.31,68.56,68.74,68.95,69.13,69.32,69.48,69.65,69.85,70.03,70.30,70.58,70.88,71.20,71.58,71.95,72.30,72.64,72.96,73.23,73.52,73.76,73.98,74.21,74.38,74.55,74.74,74.92,75.09,75.25,75.40,26.94
Europe & Central Asia (excluding high income),63.40,63.92,64.31,64.67,64.97,65.19,65.36,65.48,65.62,65.71,65.95,66.15,66.19,66.30,66.41,66.22,66.20,66.21,66.28,66.22,66.35,66.56,66.89,67.01,67.01,67.42,68.18,68.35,68.42,68.37,68.25,68.01,67.36,66.51,66.26,66.31,66.81,67.42,67.75,67.61,67.66,67.83,67.85,67.99,68.31,68.45,69.07,69.58,69.87,70.47,70.77,71.34,71.67,72.06,72.27,72.54,72.81,9.42
Europe & Central Asia,67.04,67.40,67.49,67.76,68.16,68.31,68.52,68.64,68.71,68.72,68.99,69.13,69.33,69.43,69.63,69.61,69.71,69.88,69.97,70.09,70.19,70.46,70.75,70.82,70.97,71.18,71.67,71.88,72.01,72.07,72.08,71.99,71.92,71.60,71.67,71.77,72.15,72.56,72.87,72.92,73.07,73.35,73.43,73.55,73.98,74.14,74.63,74.99,75.25,75.64,75.93,76.44,76.59,76.90,77.22,77.16,77.28,10.24
Ecuador,53.24,53.84,54.41,54.93,55.41,55.84,56.24,56.62,56.99,57.38,57.78,58.22,58.68,59.17,59.68,60.22,60.78,61.35,61.93,62.51,63.09,63.69,64.29,64.90,65.51,66.13,66.73,67.33,67.91,68.46,68.99,69.49,69.96,70.40,70.82,71.22,71.59,71.95,72.30,72.62,72.93,73.22,73.48,73.72,73.94,74.14,74.32,74.50,74.68,74.86,75.05,75.24,75.45,75.66,75.88,76.10,76.33,23.09
Egypt,48.06,48.62,49.15,49.64,50.11,50.56,50.95,51.30,51.60,51.87,52.16,52.49,52.90,53.41,54.03,54.72,55.47,56.23,56.96,57.66,58.34,59.00,59.68,60.38,61.10,61.81,62.49,63.12,63.67,64.15,64.58,64.99,65.40,65.84,66.31,66.79,67.26,67.69,68.06,68.37,68.61,68.81,68.97,69.13,69.28,69.44,69.62,69.80,69.98,70.17,70.36,70.55,70.74,70.93,71.12,71.30,71.48,23.43
Euro area,69.27,69.65,69.60,69.77,70.23,70.32,70.60,70.74,70.79,70.79,71.16,71.27,71.61,71.70,72.03,72.17,72.44,72.79,73.01,73.34,73.53,73.81,74.16,74.23,74.59,74.76,75.06,75.35,75.54,75.76,75.91,76.03,76.38,76.49,76.80,76.96,77.22,77.58,77.80,78.02,78.27,78.60,78.68,78.71,79.28,79.43,79.86,80.10,80.30,80.51,80.75,81.23,81.23,81.51,81.93,81.56,81.56,12.29
Eritrea,38.42,39.07,39.69,40.26,40.77,41.22,41.63,42.02,42.40,42.77,43.16,43.55,43.94,44.32,44.69,45.05,45.41,45.74,46.06,46.36,46.65,46.93,47.19,47.44,47.70,47.96,48.23,48.52,48.84,49.19,49.59,50.04,50.55,51.10,51.69,52.31,52.93,53.54,54.13,54.69,55.26,55.85,56.48,57.17,57.92,58.69,59.47,60.23,60.94,61.59,62.18,62.72,63.22,63.70,64.17,64.64,65.09,26.67
Spain,69.11,69.48,69.52,69.68,70.40,70.81,71.06,71.25,71.54,71.06,72.03,71.63,72.82,72.61,72.97,73.32,73.64,74.13,74.30,74.82,75.35,75.53,76.13,75.91,76.30,76.26,76.51,76.73,76.75,76.81,76.84,76.97,77.41,77.55,77.90,77.98,78.12,78.60,78.67,78.72,78.97,79.37,79.57,79.62,79.87,80.17,80.82,80.87,81.18,81.48,81.63,82.48,82.43,83.08,83.23,82.83,82.83,13.72
Estonia,67.90,68.36,68.74,69.05,69.31,69.52,69.68,69.80,69.88,69.93,69.94,69.91,69.83,69.72,69.59,69.44,69.29,69.15,69.03,68.94,68.91,68.98,69.13,69.38,69.28,69.38,70.09,70.64,70.70,70.04,69.48,69.37,68.86,67.91,66.50,67.54,69.61,69.81,69.36,70.06,70.42,70.26,70.90,71.32,71.91,72.57,72.69,72.81,73.77,74.82,75.43,76.23,76.33,77.14,77.03,77.59,77.74,9.83
Ethiopia,38.42,39.08,39.71,40.29,40.81,41.27,41.67,42.03,42.35,42.66,42.94,43.21,43.47,43.69,43.89,44.05,44.12,44.10,44.02,43.88,43.75,43.67,43.71,43.88,44.20,44.63,45.15,45.68,46.19,46.67,47.10,47.51,47.91,48.35,48.81,49.30,49.81,50.32,50.84,51.37,51.94,52.59,53.35,54.21,55.17,56.22,57.33,58.47,59.58,60.64,61.62,62.50,63.27,63.95,64.53,65.04,65.47,27.06
European Union,69.28,69.59,69.52,69.76,70.23,70.34,70.57,70.68,70.72,70.68,71.00,71.11,71.42,71.54,71.83,71.92,72.13,72.41,72.53,72.77,72.86,73.20,73.46,73.53,73.80,73.88,74.15,74.39,74.58,74.74,74.87,74.97,75.29,75.39,75.69,75.82,76.07,76.36,76.60,76.83,77.16,77.49,77.61,77.69,78.19,78.36,78.74,78.97,79.18,79.44,79.72,80.24,80.25,80.53,80.92,80.61,80.62,11.34
Fragile and conflict affected situations,40.82,41.34,41.89,42.46,43.06,43.68,44.30,44.92,45.52,46.09,46.63,47.15,47.65,48.13,48.61,49.06,49.48,49.88,50.25,50.62,50.98,51.46,51.85,52.26,52.67,53.08,53.48,53.86,54.20,54.50,54.85,55.07,55.24,55.39,55.53,55.67,55.81,55.97,56.14,56.32,56.56,56.84,57.16,57.53,57.92,58.35,58.78,59.22,59.65,60.07,60.46,60.84,61.20,61.55,61.90,62.24,62.57,21.75
Finland,68.82,68.84,68.58,69.01,69.22,68.98,69.48,69.67,69.62,69.50,70.18,70.02,70.71,71.22,71.13,71.67,71.81,72.35,72.90,73.16,73.44,73.75,74.30,74.20,74.52,74.22,74.56,74.59,74.58,74.79,74.81,75.23,75.46,75.71,76.40,76.41,76.69,76.88,77.09,77.29,77.47,77.97,78.12,78.37,78.71,78.82,79.21,79.26,79.57,79.72,79.87,80.47,80.63,80.98,81.18,81.48,81.78,12.96
Fiji,55.86,56.29,56.72,57.13,57.55,57.95,58.35,58.74,59.12,59.49,59.86,60.21,60.55,60.87,61.19,61.50,61.80,62.10,62.40,62.69,62.98,63.26,63.54,63.81,64.07,64.33,64.58,64.82,65.05,65.28,65.51,65.73,65.95,66.16,66.37,66.58,66.78,66.98,67.17,67.36,67.55,67.73,67.91,68.08,68.24,68.41,68.57,68.74,68.91,69.09,69.27,69.45,69.62,69.80,69.96,70.12,70.27,14.41
France,69.87,70.12,70.31,70.51,70.66,70.81,70.96,71.16,71.31,71.46,71.66,71.91,72.11,72.36,72.60,72.85,73.10,73.35,73.60,73.85,74.05,74.30,74.50,74.80,75.00,75.30,75.60,75.80,76.10,76.35,76.60,76.85,77.10,77.30,77.65,77.75,77.95,78.30,78.60,78.76,79.06,79.16,79.26,79.11,80.16,80.16,80.81,81.11,81.21,81.41,81.66,82.11,81.97,82.22,82.67,82.27,82.27,12.40
Micronesia,57.58,57.98,58.38,58.78,59.18,59.58,59.98,60.39,60.80,61.21,61.63,62.07,62.52,62.97,63.42,63.84,64.22,64.55,64.82,65.02,65.17,65.28,65.37,65.45,65.54,65.64,65.75,65.87,65.98,66.10,66.21,66.33,66.44,66.55,66.67,66.78,66.88,66.99,67.09,67.19,67.30,67.41,67.54,67.67,67.82,67.97,68.11,68.25,68.38,68.48,68.58,68.67,68.77,68.86,68.97,69.08,69.19,11.61
Gabon,39.59,39.95,40.39,40.94,41.61,42.37,43.20,44.08,44.97,45.84,46.70,47.53,48.36,49.19,50.02,50.85,51.68,52.51,53.34,54.18,55.01,55.86,56.72,57.57,58.40,59.16,59.83,60.38,60.80,61.08,61.22,61.23,61.15,61.01,60.83,60.62,60.37,60.09,59.80,59.53,59.30,59.17,59.15,59.27,59.51,59.89,60.39,60.97,61.60,62.25,62.89,63.52,64.12,64.69,65.21,65.69,66.11,26.52
United Kingdom,71.13,70.88,70.93,70.83,71.62,71.62,71.57,72.12,71.72,71.72,71.97,72.27,72.12,72.32,72.52,72.72,72.78,73.22,73.18,73.28,73.68,74.03,74.18,74.38,74.78,74.63,74.93,75.28,75.38,75.58,75.88,76.08,76.43,76.39,76.89,76.84,77.09,77.21,77.19,77.39,77.74,77.99,78.14,78.45,78.75,79.05,79.25,79.45,79.60,80.05,80.40,80.95,80.90,81.00,81.30,80.96,80.96,9.83
Georgia,63.65,64.06,64.47,64.88,65.29,65.69,66.08,66.45,66.81,67.14,67.45,67.77,68.08,68.40,68.72,69.01,69.27,69.46,69.59,69.67,69.70,69.73,69.77,69.84,69.95,70.08,70.20,70.29,70.32,70.31,70.27,70.22,70.20,70.22,70.31,70.46,70.69,70.97,71.27,71.60,71.91,72.18,72.41,72.58,72.68,72.73,72.73,72.70,72.67,72.65,72.65,72.68,72.74,72.83,72.95,73.10,73.26,9.61
Ghana,45.84,46.28,46.70,47.09,47.47,47.82,48.16,48.47,48.77,49.06,49.34,49.62,49.91,50.20,50.51,50.81,51.11,51.41,51.69,51.98,52.27,52.58,52.91,53.27,53.67,54.11,54.60,55.14,55.70,56.25,56.76,57.16,57.44,57.58,57.60,57.51,57.35,57.17,57.03,56.96,56.99,57.15,57.41,57.76,58.19,58.67,59.17,59.66,60.13,60.55,60.92,61.25,61.56,61.86,62.15,62.45,62.74,16.90
Guinea,34.89,35.09,35.27,35.43,35.59,35.74,35.89,36.05,36.22,36.42,36.66,36.93,37.26,37.62,38.04,38.50,38.99,39.52,40.07,40.65,41.28,41.98,42.75,43.61,44.52,45.48,46.46,47.43,48.36,49.21,49.95,50.56,51.03,51.38,51.61,51.72,51.70,51.59,51.43,51.27,51.18,51.23,51.45,51.86,52.44,53.17,53.97,54.77,55.52,56.19,56.77,57.28,57.78,58.30,58.85,59.42,60.02,25.12
Gambia,32.03,32.32,32.65,33.05,33.52,34.08,34.71,35.42,36.18,36.98,37.82,38.69,39.56,40.43,41.29,42.15,42.99,43.83,44.66,45.48,46.29,47.09,47.86,48.60,49.31,49.96,50.54,51.04,51.48,51.85,52.18,52.48,52.79,53.11,53.46,53.84,54.25,54.68,55.10,55.51,55.92,56.33,56.73,57.13,57.53,57.91,58.29,58.65,58.99,59.32,59.62,59.91,60.19,60.45,60.71,60.95,61.19,29.16
Guinea-Bissau,37.85,38.16,38.48,38.83,39.20,39.58,39.98,40.37,40.77,41.16,41.54,41.92,42.30,42.68,43.07,43.47,43.87,44.29,44.72,45.15,45.57,45.98,46.37,46.74,47.08,47.41,47.73,48.05,48.38,48.72,49.07,49.44,49.83,50.21,50.60,50.97,51.31,51.60,51.86,52.08,52.27,52.45,52.64,52.84,53.08,53.36,53.66,53.99,54.33,54.69,55.05,55.42,55.81,56.20,56.60,57.00,57.40,19.55
Equatorial Guinea,36.74,37.04,37.34,37.64,37.94,38.24,38.54,38.84,39.14,39.44,39.74,40.02,40.29,40.55,40.82,41.12,41.49,41.95,42.49,43.11,43.77,44.43,45.05,45.60,46.07,46.47,46.81,47.13,47.47,47.84,48.24,48.68,49.14,49.62,50.10,50.59,51.06,51.52,51.96,52.37,52.75,53.10,53.41,53.71,53.99,54.26,54.55,54.86,55.19,55.54,55.91,56.27,56.60,56.91,57.18,57.43,57.68,20.94
Greece,68.16,68.55,68.89,69.19,69.43,69.64,69.84,70.05,70.30,70.59,70.90,71.23,71.53,71.81,72.06,72.29,72.52,72.76,73.03,73.33,73.65,73.97,74.28,74.57,74.83,75.08,75.33,75.60,75.89,76.69,76.94,77.14,77.38,77.39,77.64,77.59,77.69,78.14,77.84,77.99,77.89,78.39,78.64,78.84,79.04,79.24,79.44,79.44,79.94,80.19,80.39,80.73,80.63,81.29,81.39,81.04,81.04,12.87
Grenada,60.07,60.50,60.92,61.33,61.73,62.11,62.48,62.84,63.18,63.52,63.84,64.16,64.46,64.75,65.04,65.31,65.58,65.83,66.08,66.32,66.56,66.79,67.01,67.23,67.45,67.66,67.86,68.06,68.25,68.43,68.60,68.77,68.92,69.08,69.24,69.40,69.57,69.75,69.93,70.13,70.34,70.55,70.77,70.99,71.21,71.44,71.67,71.90,72.14,72.38,72.62,72.84,73.04,73.23,73.39,73.53,73.66,13.59
Guatemala,46.70,47.22,47.75,48.30,48.86,49.43,50.03,50.65,51.27,51.89,52.50,53.09,53.65,54.18,54.68,55.14,55.58,56.00,56.42,56.84,57.27,57.72,58.18,58.66,59.15,59.66,60.18,60.69,61.21,61.73,62.26,62.80,63.35,63.92,64.50,65.09,65.68,66.26,66.82,67.35,67.85,68.30,68.72,69.09,69.44,69.76,70.08,70.42,70.76,71.12,71.49,71.87,72.23,72.56,72.87,73.15,73.41,26.71
Guam,60.97,61.48,61.99,62.48,62.97,63.44,63.91,64.36,64.81,65.24,65.66,66.07,66.47,66.86,67.23,67.60,67.95,68.29,68.62,68.95,69.26,69.57,69.86,70.15,70.43,70.70,70.96,71.21,71.45,71.69,71.92,72.17,72.42,72.69,72.97,73.27,73.59,73.93,74.28,74.65,75.01,75.37,75.72,76.05,76.36,76.66,76.96,77.25,77.54,77.84,78.13,78.42,78.69,78.94,79.17,79.38,79.58,18.61
Guyana,60.26,60.44,60.62,60.80,60.98,61.16,61.32,61.46,61.59,61.70,61.79,61.87,61.94,62.01,62.07,62.14,62.21,62.28,62.35,62.43,62.50,62.56,62.63,62.68,62.74,62.80,62.87,62.95,63.05,63.16,63.29,63.44,63.60,63.77,63.95,64.12,64.30,64.47,64.63,64.78,64.93,65.06,65.19,65.31,65.43,65.54,65.64,65.74,65.84,65.93,66.02,66.12,66.22,66.32,66.42,66.54,66.65,6.39
High income,68.37,68.75,68.74,68.95,69.34,69.46,69.72,69.95,69.91,70.11,70.44,70.72,71.02,71.19,71.60,71.95,72.21,72.56,72.72,73.04,73.08,73.43,73.76,73.86,74.14,74.26,74.51,74.77,74.89,75.14,75.30,75.47,75.72,75.81,76.09,76.16,76.53,76.86,77.04,77.19,77.47,77.76,77.90,78.03,78.44,78.53,78.83,79.06,79.20,79.48,79.65,79.89,80.01,80.19,80.44,80.33,80.37,12.00
Hong Kong,66.96,67.55,68.11,68.63,69.10,69.54,69.95,70.33,70.69,71.04,71.39,71.46,71.46,72.11,72.61,73.37,72.82,73.32,73.58,73.67,74.67,75.32,75.43,75.28,76.03,76.43,76.69,76.88,77.08,77.03,77.38,77.88,77.68,78.03,78.53,78.68,79.63,80.13,80.13,80.38,80.88,81.42,81.43,81.38,81.83,81.63,82.38,82.33,82.38,82.78,82.98,83.42,83.48,83.83,83.98,84.28,84.23,17.27
Honduras,46.27,46.95,47.62,48.28,48.93,49.55,50.15,50.74,51.33,51.92,52.52,53.14,53.78,54.44,55.12,55.83,56.57,57.32,58.08,58.85,59.63,60.43,61.24,62.05,62.86,63.64,64.38,65.06,65.68,66.23,66.72,67.18,67.62,68.05,68.48,68.90,69.30,69.67,70.00,70.29,70.54,70.76,70.96,71.15,71.34,71.53,71.72,71.91,72.09,72.27,72.45,72.62,72.81,72.99,73.18,73.38,73.58,27.30
Heavily indebted poor countries (HIPC),39.57,40.01,40.44,40.85,41.26,41.67,42.07,42.47,42.87,43.28,43.69,44.10,44.51,44.92,45.32,45.71,46.08,46.44,46.77,47.09,47.41,47.72,48.02,48.33,48.63,48.91,49.15,49.34,49.48,49.58,49.66,49.76,49.89,50.06,50.27,50.50,50.76,51.05,51.38,51.76,52.20,52.71,53.29,53.93,54.63,55.37,56.13,56.89,57.63,58.34,59.00,59.61,60.18,60.71,61.20,61.66,62.08,22.51
Croatia,64.61,65.02,65.41,65.79,66.15,66.51,66.86,67.21,67.55,67.88,68.20,68.50,68.78,69.03,69.25,70.00,70.46,70.74,70.54,70.43,70.18,70.34,70.48,70.27,70.22,70.89,71.42,71.47,71.49,71.84,72.17,72.19,71.24,71.52,71.80,72.08,72.37,72.50,72.32,72.64,72.81,74.51,74.72,74.61,75.52,75.24,75.84,75.71,75.91,76.17,76.48,76.78,76.92,77.13,77.48,77.28,78.02,13.41
Haiti,42.11,42.70,43.28,43.85,44.41,44.95,45.47,45.95,46.41,46.82,47.22,47.59,47.97,48.34,48.72,49.11,49.48,49.85,50.20,50.53,50.85,51.18,51.53,51.89,52.28,52.68,53.09,53.49,53.88,54.25,54.61,54.95,55.30,55.64,55.98,56.32,56.63,56.93,57.21,57.47,57.72,57.97,58.24,58.53,58.86,59.22,59.61,60.02,60.45,60.88,61.30,61.70,62.08,62.43,62.76,63.05,63.33,21.22
Hungary,68.00,68.94,67.87,68.87,69.38,69.07,69.82,69.41,69.23,69.31,69.16,69.05,69.66,69.52,69.25,69.29,69.57,69.85,69.39,69.62,69.06,69.14,69.36,68.97,69.03,68.97,69.17,69.65,70.02,69.46,69.32,69.38,69.12,69.10,69.47,69.79,70.33,70.70,70.56,70.68,71.25,72.25,72.35,72.30,72.65,72.65,73.10,73.15,73.70,73.90,74.21,74.86,75.06,75.57,75.76,75.57,75.57,7.57
IBRD only,48.67,49.20,49.80,50.55,51.42,52.39,53.41,54.41,55.38,56.24,57.04,57.74,58.39,59.00,59.59,60.11,60.62,61.09,61.54,61.93,62.30,62.67,63.02,63.33,63.61,63.94,64.32,64.62,64.91,65.18,65.43,65.68,65.88,66.07,66.32,66.61,66.95,67.31,67.64,67.93,68.25,68.57,68.88,69.18,69.50,69.78,70.11,70.42,70.71,71.02,71.30,71.60,71.86,72.11,72.34,72.56,72.76,24.09
IDA & IBRD total,47.55,48.07,48.65,49.36,50.17,51.06,51.99,52.89,53.75,54.52,55.23,55.86,56.45,57.01,57.56,58.05,58.54,59.00,59.44,59.83,60.20,60.57,60.91,61.22,61.50,61.82,62.16,62.43,62.69,62.93,63.15,63.37,63.54,63.71,63.92,64.18,64.47,64.79,65.09,65.36,65.66,65.97,66.28,66.59,66.93,67.25,67.60,67.95,68.27,68.61,68.92,69.24,69.52,69.78,70.03,70.25,70.47,22.92
IDA total,41.92,42.46,43.01,43.54,44.07,44.59,45.06,45.49,45.88,46.23,46.55,46.86,47.18,47.53,47.92,48.35,48.81,49.29,49.78,50.26,50.71,51.17,51.58,51.96,52.32,52.64,52.93,53.19,53.40,53.59,53.77,53.94,54.12,54.30,54.50,54.72,54.97,55.23,55.51,55.82,56.16,56.54,56.97,57.45,57.97,58.51,59.07,59.64,60.20,60.74,61.25,61.72,62.15,62.56,62.94,63.29,63.62,21.70
IDA blend,43.61,44.26,44.90,45.52,46.11,46.68,47.23,47.76,48.28,48.79,49.28,49.76,50.23,50.67,51.10,51.51,51.92,52.32,52.71,53.10,53.46,53.81,54.13,54.40,54.63,54.82,54.96,55.06,55.12,55.16,55.18,55.16,55.14,55.09,55.05,55.02,55.01,55.02,55.06,55.15,55.29,55.50,55.78,56.11,56.51,56.95,57.43,57.94,58.45,58.96,59.45,59.90,60.32,60.70,61.05,61.37,61.66,18.06
Indonesia,48.65,49.28,49.90,50.50,51.09,51.67,52.25,52.82,53.40,53.97,54.54,55.10,55.66,56.20,56.73,57.24,57.74,58.23,58.71,59.17,59.62,60.05,60.45,60.84,61.20,61.55,61.90,62.24,62.58,62.93,63.28,63.64,64.00,64.35,64.70,65.03,65.34,65.62,65.87,66.09,66.28,66.47,66.64,66.82,67.00,67.19,67.39,67.58,67.78,67.96,68.15,68.33,68.51,68.68,68.86,69.03,69.19,20.54
IDA only,41.12,41.61,42.10,42.61,43.11,43.59,44.03,44.42,44.74,45.01,45.25,45.48,45.73,46.03,46.39,46.82,47.30,47.82,48.35,48.86,49.35,49.87,50.31,50.74,51.16,51.55,51.92,52.24,52.53,52.80,53.06,53.32,53.60,53.90,54.23,54.58,54.95,55.33,55.73,56.15,56.59,57.06,57.57,58.11,58.69,59.28,59.88,60.48,61.06,61.62,62.13,62.61,63.06,63.47,63.87,64.24,64.59,23.47
India,41.17,41.79,42.42,43.06,43.70,44.36,45.02,45.69,46.37,47.04,47.72,48.40,49.08,49.75,50.41,51.05,51.66,52.26,52.82,53.35,53.84,54.30,54.71,55.10,55.47,55.83,56.20,56.59,57.00,57.45,57.91,58.41,58.91,59.42,59.92,60.41,60.88,61.33,61.76,62.18,62.58,62.98,63.37,63.76,64.15,64.56,64.97,65.38,65.80,66.22,66.62,67.01,67.38,67.71,68.02,68.30,68.56,27.39
Ireland,69.80,69.98,70.13,70.27,70.40,70.52,70.64,70.75,70.84,70.94,71.03,71.13,71.23,71.35,71.47,71.62,71.78,71.97,72.17,72.39,72.62,72.86,73.09,73.31,73.53,73.74,73.95,74.16,74.38,74.60,74.81,75.01,75.18,75.34,75.48,75.62,75.83,75.99,76.18,76.08,76.54,77.13,77.63,78.14,78.54,78.94,79.24,79.64,80.10,80.19,80.74,80.75,80.85,81.00,81.35,81.45,81.61,11.81
Iran,44.95,45.51,46.07,46.62,47.17,47.73,48.30,48.89,49.51,50.15,50.86,51.66,52.56,53.51,54.46,55.27,55.74,55.83,55.51,54.88,54.11,53.45,53.13,53.29,53.99,55.21,56.85,58.68,60.53,62.27,63.83,65.13,66.21,67.09,67.79,68.33,68.74,69.09,69.43,69.78,70.14,70.53,70.90,71.25,71.58,71.91,72.26,72.64,73.04,73.48,73.93,74.38,74.79,75.15,75.47,75.73,75.95,31.01
Iraq,48.02,49.22,50.41,51.58,52.73,53.84,54.88,55.85,56.72,57.50,58.20,58.85,59.47,60.06,60.61,61.05,61.28,61.26,61.02,60.60,60.13,59.77,59.65,59.85,60.39,61.24,62.28,63.39,64.44,65.35,66.12,66.73,67.26,67.72,68.13,68.49,68.78,68.99,69.12,69.18,69.17,69.08,68.93,68.74,68.54,68.35,68.22,68.16,68.18,68.28,68.47,68.70,68.96,69.22,69.46,69.67,69.86,21.84
Iceland,73.42,73.50,73.72,73.04,73.54,73.87,73.30,73.78,74.01,73.78,73.93,73.57,74.46,74.45,74.51,75.58,76.97,76.37,76.65,76.77,76.85,76.52,77.04,76.85,77.58,77.60,77.99,77.34,77.08,78.14,78.04,77.99,78.76,78.93,79.25,77.98,78.78,78.89,79.60,79.35,79.65,80.69,80.50,80.96,81.00,81.50,81.16,81.45,81.61,81.75,81.90,82.36,82.92,82.06,82.86,82.47,82.47,9.05
Italy,69.12,69.76,69.15,69.25,70.31,70.17,70.93,70.96,70.78,70.81,71.56,71.81,72.08,72.03,72.73,72.65,72.99,73.36,73.69,74.00,73.94,74.35,74.81,74.64,75.39,75.47,75.77,76.22,76.37,76.82,76.97,77.02,77.42,77.72,77.92,78.17,78.52,78.82,78.98,79.42,79.78,80.13,80.23,79.98,80.78,80.78,81.28,81.43,81.49,81.64,82.04,82.19,82.24,82.69,83.09,82.54,82.54,13.42
Jamaica,64.39,64.96,65.48,65.96,66.40,66.79,67.14,67.47,67.76,68.05,68.32,68.61,68.91,69.22,69.55,69.89,70.23,70.58,70.92,71.23,71.51,71.74,71.92,72.05,72.14,72.17,72.18,72.16,72.13,72.10,72.06,72.04,72.02,72.00,71.99,71.99,72.01,72.05,72.12,72.20,72.33,72.49,72.68,72.91,73.17,73.45,73.74,74.04,74.33,74.62,74.88,75.12,75.33,75.52,75.69,75.84,75.97,11.58
Jordan,52.65,53.44,54.22,54.99,55.77,56.53,57.28,58.02,58.75,59.47,60.17,60.86,61.55,62.22,62.87,63.50,64.11,64.68,65.22,65.73,66.21,66.66,67.09,67.50,67.90,68.28,68.65,68.99,69.31,69.60,69.87,70.11,70.33,70.53,70.71,70.89,71.05,71.22,71.39,71.56,71.73,71.91,72.08,72.26,72.43,72.59,72.76,72.92,73.09,73.25,73.41,73.57,73.73,73.88,74.03,74.18,74.33,21.68
Japan,67.67,68.31,68.59,69.66,70.13,70.20,70.99,71.28,71.61,71.84,71.95,72.88,73.51,73.76,74.39,75.06,75.46,75.90,76.04,76.34,76.09,76.41,76.92,76.96,77.37,77.65,78.06,78.48,78.40,78.82,78.84,79.10,79.15,79.29,79.69,79.54,80.20,80.42,80.50,80.57,81.08,81.42,81.56,81.76,82.03,81.93,82.32,82.51,82.59,82.93,82.84,82.59,83.10,83.33,83.59,83.79,83.98,16.32
Kazakhstan,58.37,58.78,59.20,59.62,60.04,60.45,60.85,61.24,61.61,61.96,62.28,62.56,62.82,63.06,63.28,63.49,63.71,63.94,64.19,64.47,66.62,66.71,66.79,67.66,68.54,68.54,68.91,69.29,68.85,68.29,68.34,67.98,67.73,66.73,65.67,64.92,64.11,64.46,64.56,65.52,65.52,65.77,65.97,65.87,65.89,65.91,66.16,66.50,67.02,68.43,68.30,68.98,69.61,70.45,71.62,72.00,72.30,13.93
Kenya,46.35,47.00,47.63,48.25,48.84,49.41,49.96,50.51,51.07,51.64,52.22,52.80,53.38,53.95,54.50,55.04,55.59,56.15,56.70,57.25,57.76,58.21,58.59,58.87,59.04,59.08,58.99,58.78,58.47,58.05,57.54,56.92,56.21,55.45,54.67,53.91,53.20,52.59,52.11,51.80,51.75,52.00,52.56,53.41,54.51,55.82,57.27,58.78,60.27,61.68,62.94,64.01,64.91,65.65,66.24,66.69,67.03,20.68
Kyrgyz Republic,56.13,56.56,57.00,57.44,57.88,58.32,58.74,59.15,59.54,59.90,60.24,60.55,60.84,61.09,61.33,61.56,61.80,62.04,62.30,62.59,62.90,63.26,63.66,64.08,64.50,64.92,65.29,65.61,65.86,67.91,68.30,68.55,68.10,67.19,66.04,65.79,66.54,66.89,67.05,68.66,68.56,68.71,68.16,68.26,68.15,67.96,67.70,67.90,68.45,69.10,69.30,69.60,70.00,70.20,70.40,70.65,70.95,14.82
Cambodia,41.24,41.37,41.53,41.71,41.89,42.08,42.30,42.49,42.55,42.37,41.57,39.70,36.68,32.67,28.04,23.59,20.32,18.91,19.73,22.74,27.54,33.34,39.16,44.17,48.02,50.56,51.92,52.59,53.00,53.30,53.59,53.92,54.23,54.51,54.82,55.19,55.65,56.21,56.86,57.60,58.43,59.34,60.28,61.24,62.19,63.09,63.93,64.69,65.39,66.01,66.56,67.03,67.47,67.87,68.25,68.62,68.98,27.74
Kiribati,49.24,49.77,50.30,50.83,51.34,51.84,52.34,52.84,53.36,53.88,54.38,54.86,55.29,55.66,55.97,56.22,56.42,56.56,56.69,56.80,56.93,57.08,57.26,57.49,57.77,58.10,58.49,58.93,59.39,59.88,60.37,60.85,61.32,61.76,62.16,62.53,62.86,63.17,63.47,63.74,64.00,64.23,64.43,64.60,64.74,64.86,64.96,65.05,65.15,65.24,65.35,65.48,65.62,65.78,65.95,66.13,66.32,17.07
Korea Rep,53.00,53.74,54.49,55.25,56.02,56.82,57.66,58.53,59.42,60.32,62.16,62.61,63.01,63.41,63.80,64.15,64.50,64.90,65.20,65.55,66.05,66.55,67.10,67.55,68.20,68.80,69.45,70.00,70.55,71.05,71.60,72.05,72.50,73.00,73.40,73.70,74.15,74.60,75.00,75.41,75.91,76.41,76.77,77.21,77.67,78.17,78.67,79.12,79.52,79.97,80.12,80.57,80.82,81.27,81.72,82.02,82.02,29.02
Kuwait,60.28,61.01,61.70,62.35,62.96,63.54,64.09,64.61,65.11,65.58,66.03,66.45,66.86,67.24,67.61,67.96,68.30,68.63,68.95,69.26,69.57,69.88,70.18,70.47,70.75,71.02,71.27,71.50,71.72,71.91,72.08,72.23,72.37,72.50,72.61,72.72,72.82,72.92,73.00,73.08,73.16,73.23,73.30,73.37,73.43,73.50,73.58,73.67,73.76,73.87,73.98,74.10,74.22,74.34,74.46,74.58,74.69,14.41
Latin America & Caribbean (excluding high income),54.60,55.15,55.68,56.19,56.68,57.16,57.63,58.08,58.54,59.00,59.45,59.90,60.34,60.76,61.16,61.55,61.94,62.31,62.69,63.07,63.45,63.83,64.21,64.59,64.96,65.33,65.69,66.05,66.40,66.76,67.13,67.50,67.89,68.29,68.71,69.13,69.54,69.95,70.35,70.73,71.08,71.42,71.74,72.04,72.33,72.61,72.88,73.15,73.41,73.67,73.92,74.17,74.41,74.64,74.86,75.08,75.29,20.69
Lao PDR,43.20,43.51,43.82,44.12,44.42,44.73,45.03,45.34,45.65,45.96,46.27,46.58,46.88,47.17,47.45,47.72,47.98,48.24,48.50,48.77,49.06,49.38,49.74,50.14,50.58,51.05,51.55,52.06,52.58,53.09,53.59,54.09,54.59,55.11,55.63,56.16,56.70,57.25,57.80,58.36,58.92,59.49,60.07,60.65,61.22,61.79,62.35,62.89,63.40,63.89,64.36,64.80,65.21,65.60,65.97,66.33,66.68,23.48
Lebanon,63.27,63.58,63.87,64.16,64.44,64.71,64.98,65.25,65.53,65.80,66.07,66.32,66.56,66.79,67.00,67.18,67.35,67.51,67.66,67.80,67.95,68.11,68.29,68.47,68.68,68.90,69.14,69.39,69.66,69.93,70.22,70.54,70.88,71.25,71.65,72.07,72.52,72.99,73.47,73.96,74.45,74.93,75.42,75.89,76.35,76.79,77.19,77.55,77.88,78.17,78.43,78.66,78.86,79.05,79.23,79.41,79.58,16.32
Liberia,34.67,34.94,35.26,35.63,36.05,36.52,37.03,37.56,38.11,38.67,39.25,39.87,40.52,41.22,41.94,42.69,43.43,44.16,44.84,45.46,46.00,46.44,46.78,47.03,47.21,47.30,47.31,47.26,47.19,47.14,47.18,47.41,47.84,48.48,49.28,50.16,50.98,51.64,52.08,52.31,52.42,52.54,52.81,53.32,54.08,55.05,56.14,57.21,58.17,58.98,59.63,60.16,60.62,61.07,61.53,62.01,62.51,27.83
Libya,42.61,44.21,45.83,47.41,48.91,50.30,51.58,52.78,53.92,55.01,56.05,57.05,57.99,58.90,59.77,60.60,61.39,62.15,62.87,63.55,64.19,64.77,65.31,65.79,66.23,66.64,67.03,67.41,67.79,68.16,68.52,68.86,69.17,69.44,69.66,69.85,70.00,70.13,70.24,70.35,70.47,70.62,70.78,70.97,71.17,71.36,71.52,71.63,71.68,71.68,71.64,71.60,71.57,71.59,71.66,71.78,71.93,29.32
St. Lucia,57.33,58.13,58.87,59.53,60.10,60.60,61.05,61.49,61.96,62.47,63.02,63.60,64.21,64.82,65.42,66.02,66.61,67.21,67.79,68.35,68.88,69.35,69.75,70.07,70.33,70.52,70.67,70.79,70.90,71.01,71.11,71.19,71.23,71.25,71.23,71.21,71.19,71.18,71.22,71.31,71.46,71.68,71.96,72.29,72.65,73.03,73.39,73.73,74.02,74.27,74.47,74.63,74.79,74.95,75.12,75.30,75.50,18.17
Latin America & Caribbean,56.05,56.54,57.00,57.45,57.88,58.30,58.72,59.13,59.55,59.98,60.40,60.83,61.25,61.65,62.05,62.43,62.81,63.18,63.55,63.92,64.30,64.67,65.03,65.39,65.74,66.09,66.43,66.77,67.11,67.44,67.79,68.14,68.51,68.89,69.27,69.67,70.06,70.45,70.82,71.18,71.53,71.85,72.16,72.44,72.72,72.98,73.24,73.49,73.73,73.98,74.22,74.46,74.69,74.91,75.13,75.34,75.54,19.49
Least developed countries: UN classification,40.24,40.71,41.19,41.69,42.18,42.66,43.09,43.46,43.77,44.02,44.22,44.42,44.65,44.92,45.26,45.66,46.14,46.65,47.18,47.69,48.18,48.63,49.07,49.49,49.89,50.27,50.62,50.94,51.21,51.47,51.72,51.99,52.30,52.65,53.02,53.42,53.85,54.29,54.75,55.23,55.73,56.26,56.82,57.41,58.03,58.67,59.31,59.96,60.59,61.20,61.78,62.32,62.82,63.28,63.70,64.09,64.45,24.21
Low income,39.51,39.93,40.35,40.77,41.22,41.68,42.16,42.64,43.13,43.61,44.09,44.56,45.03,45.49,45.94,46.37,46.79,47.18,47.57,47.94,48.30,48.66,49.03,49.40,49.75,50.09,50.38,50.63,50.82,50.97,51.08,51.20,51.34,51.50,51.68,51.88,52.12,52.40,52.73,53.12,53.57,54.09,54.67,55.30,55.97,56.67,57.38,58.09,58.78,59.44,60.05,60.61,61.14,61.63,62.09,62.53,62.94,23.42
Sri Lanka,59.37,59.77,60.18,60.61,61.08,61.58,62.10,62.63,63.14,63.63,64.10,64.53,64.93,65.32,65.69,66.07,66.46,66.87,67.31,67.75,68.17,68.53,68.80,68.97,69.06,69.08,69.09,69.12,69.21,69.35,69.51,69.63,69.66,69.59,69.45,69.31,69.27,69.40,69.74,70.30,71.00,71.78,72.51,73.13,73.59,73.90,74.06,74.14,74.21,74.27,74.35,74.46,74.59,74.74,74.91,75.09,75.28,15.92
Lower middle income,45.48,46.08,46.68,47.27,47.85,48.42,48.96,49.47,49.95,50.39,50.83,51.26,51.71,52.19,52.70,53.24,53.78,54.33,54.85,55.35,55.81,56.24,56.64,57.01,57.36,57.70,58.04,58.39,58.72,59.07,59.41,59.73,60.08,60.41,60.74,61.06,61.38,61.72,62.05,62.37,62.67,63.00,63.32,63.65,63.99,64.34,64.70,65.07,65.43,65.81,66.18,66.52,66.84,67.13,67.40,67.65,67.88,22.40
Low & middle income,47.09,47.62,48.23,48.94,49.77,50.68,51.63,52.56,53.44,54.23,54.96,55.62,56.21,56.78,57.34,57.84,58.34,58.81,59.26,59.66,60.04,60.40,60.75,61.06,61.35,61.67,62.01,62.29,62.55,62.80,63.02,63.25,63.41,63.57,63.78,64.03,64.32,64.64,64.93,65.21,65.51,65.82,66.13,66.45,66.79,67.12,67.48,67.82,68.15,68.50,68.81,69.12,69.41,69.68,69.92,70.15,70.37,23.27
Lesotho,46.60,47.09,47.50,47.83,48.08,48.26,48.40,48.52,48.66,48.82,49.04,49.31,49.63,50.01,50.43,50.90,51.42,51.98,52.58,53.20,53.81,54.40,54.95,55.46,55.93,56.40,56.91,57.48,58.10,58.71,59.21,59.46,59.39,58.94,58.11,56.90,55.35,53.58,51.75,49.97,48.41,47.20,46.39,46.02,46.08,46.52,47.27,48.17,49.11,50.01,50.83,51.53,52.16,52.74,53.27,53.74,54.17,7.57
Late-demographic dividend,50.25,50.75,51.39,52.26,53.37,54.67,56.05,57.40,58.69,59.79,60.77,61.59,62.31,62.98,63.63,64.16,64.71,65.21,65.68,66.09,66.47,66.87,67.23,67.51,67.73,68.02,68.38,68.58,68.77,68.91,69.04,69.16,69.19,69.19,69.32,69.54,69.87,70.23,70.58,70.86,71.22,71.60,71.96,72.31,72.68,72.99,73.35,73.66,73.93,74.22,74.44,74.71,74.93,75.15,75.34,75.53,75.72,25.47
Lithuania,69.85,70.10,69.10,70.20,71.51,71.33,71.52,71.60,71.31,70.93,70.80,71.74,71.02,71.33,71.24,70.87,70.96,70.81,70.60,70.48,70.48,70.46,70.84,70.78,70.32,70.50,72.08,71.93,71.76,71.43,71.16,70.36,70.23,68.91,68.53,69.01,70.11,70.91,71.22,71.57,72.02,71.66,71.76,72.06,71.96,71.25,71.06,70.90,71.81,72.91,73.27,73.56,73.86,73.91,74.52,74.32,74.32,4.47
Luxembourg,68.45,68.74,69.00,69.22,69.41,69.56,69.67,69.76,69.84,69.90,69.98,70.08,70.21,70.36,70.54,70.76,71.00,71.26,71.52,71.79,72.07,72.36,72.65,72.96,73.27,73.59,73.89,74.19,74.48,74.75,75.01,75.46,75.77,75.71,76.37,76.51,76.52,76.88,77.02,77.77,77.87,77.82,77.97,77.73,79.12,79.43,79.29,79.38,80.54,80.64,80.63,80.99,81.39,81.80,82.23,82.29,82.29,13.85
Latvia,69.79,70.03,69.43,69.83,71.03,70.73,70.71,70.39,70.04,69.80,69.84,70.16,69.88,69.81,69.74,68.93,69.05,69.10,68.99,68.50,68.81,68.79,69.33,69.12,69.16,69.29,70.62,70.69,70.62,70.16,69.27,69.03,68.40,66.72,65.66,66.39,68.78,69.35,69.01,69.74,70.31,70.76,70.96,71.27,72.03,71.36,70.87,71.02,72.42,73.08,73.48,73.58,73.78,73.98,74.12,74.48,74.53,4.74
Macao,64.83,65.30,65.76,66.20,66.63,67.06,67.49,67.93,68.39,68.86,69.36,69.87,70.38,70.90,71.40,71.89,72.35,72.79,73.21,73.60,73.97,74.33,74.68,75.02,75.36,75.70,76.04,76.36,76.68,76.99,77.30,77.61,77.93,78.25,78.59,78.92,79.26,79.57,79.87,80.15,80.41,80.64,80.87,81.09,81.30,81.52,81.75,81.98,82.22,82.46,82.70,82.94,83.16,83.36,83.54,83.70,83.85,19.02
Morocco,48.46,48.88,49.31,49.74,50.17,50.59,51.01,51.41,51.81,52.20,52.57,52.94,53.30,53.68,54.07,54.49,54.98,55.52,56.14,56.82,57.56,58.34,59.14,59.94,60.72,61.47,62.19,62.88,63.54,64.16,64.73,65.25,65.72,66.13,66.50,66.85,67.18,67.53,67.89,68.28,68.72,69.21,69.74,70.30,70.87,71.46,72.03,72.58,73.10,73.57,74.00,74.38,74.72,75.03,75.31,75.57,75.82,27.36
Moldova,61.99,62.37,62.74,63.12,63.50,63.86,64.19,64.48,64.72,64.91,65.05,65.13,65.19,65.21,65.22,65.21,65.17,65.11,65.04,64.97,64.95,65.02,65.20,65.50,65.89,66.33,66.77,67.16,67.44,67.61,67.64,67.56,67.41,67.22,67.03,66.87,66.76,66.72,66.75,66.85,67.01,67.19,67.36,67.52,67.67,67.82,68.02,68.30,68.67,69.12,69.62,70.12,70.58,70.96,71.26,71.47,71.61,9.62
Madagascar,39.96,40.44,40.92,41.40,41.88,42.35,42.83,43.31,43.80,44.28,44.77,45.26,45.73,46.20,46.66,47.09,47.52,47.93,48.32,48.68,49.01,49.26,49.44,49.56,49.63,49.69,49.78,49.93,50.18,50.53,51.00,51.59,52.28,53.02,53.81,54.62,55.43,56.24,57.03,57.78,58.48,59.13,59.72,60.26,60.75,61.21,61.65,62.08,62.51,62.94,63.39,63.84,64.28,64.71,65.13,65.54,65.93,25.97
Maldives,37.40,37.99,38.63,39.28,39.96,40.64,41.34,42.05,42.76,43.49,44.24,45.01,45.80,46.62,47.47,48.35,49.27,50.22,51.18,52.15,53.12,54.06,54.96,55.83,56.65,57.44,58.21,58.98,59.77,60.57,61.40,62.24,63.08,63.91,64.74,65.57,66.41,67.27,68.14,69.03,69.94,70.84,71.74,72.60,73.42,74.15,74.77,75.27,75.65,75.92,76.11,76.26,76.40,76.57,76.78,77.04,77.34,39.94
Middle East & North Africa,46.70,47.78,48.37,48.46,49.06,49.65,50.71,51.26,51.80,52.35,52.93,53.54,54.16,54.86,55.56,56.27,56.93,57.49,57.97,58.37,58.75,59.14,59.60,60.19,60.89,61.69,62.55,63.43,64.25,65.05,65.75,66.36,66.84,67.33,67.76,68.18,68.56,68.89,69.20,69.50,69.80,70.08,70.34,70.60,70.86,71.11,71.36,71.60,71.83,72.06,72.27,72.47,72.68,72.88,73.09,73.29,73.49,26.80
Mexico,57.08,57.67,58.20,58.66,59.08,59.45,59.81,60.17,60.54,60.94,61.37,61.84,62.33,62.85,63.38,63.93,64.47,65.02,65.55,66.06,66.56,67.04,67.50,67.95,68.39,68.81,69.23,69.64,70.04,70.44,70.84,71.23,71.63,72.03,72.42,72.80,73.16,73.50,73.81,74.10,74.36,74.60,74.81,75.00,75.18,75.35,75.50,75.66,75.80,75.95,76.10,76.25,76.41,76.58,76.75,76.93,77.12,20.04
Middle income,47.70,48.24,48.87,49.60,50.46,51.41,52.40,53.37,54.28,55.10,55.85,56.52,57.12,57.71,58.27,58.79,59.30,59.79,60.24,60.65,61.03,61.40,61.75,62.07,62.35,62.68,63.03,63.32,63.60,63.86,64.11,64.35,64.53,64.70,64.94,65.20,65.52,65.85,66.16,66.43,66.73,67.04,67.34,67.65,67.97,68.27,68.61,68.93,69.24,69.56,69.86,70.16,70.42,70.68,70.91,71.13,71.33,23.63
Macedonia,60.63,61.26,61.87,62.47,63.06,63.64,64.22,64.78,65.31,65.82,66.30,66.74,67.13,67.47,67.77,68.02,68.21,68.36,68.46,68.55,68.64,68.76,68.94,69.16,69.44,69.76,70.09,70.41,70.70,70.94,71.15,71.33,71.50,71.68,71.87,72.08,72.31,72.55,72.80,73.04,73.27,73.47,73.64,73.78,73.89,73.99,74.08,74.18,74.31,74.46,74.63,74.82,75.02,75.21,75.38,75.55,75.70,15.07
Mali,28.20,28.34,28.54,28.78,29.10,29.49,29.96,30.50,31.09,31.72,32.39,33.08,33.78,34.49,35.20,35.92,36.65,37.38,38.14,38.91,39.68,40.44,41.17,41.88,42.55,43.17,43.76,44.31,44.84,45.32,45.75,46.08,46.30,46.45,46.52,46.57,46.66,46.82,47.10,47.52,48.07,48.76,49.54,50.37,51.22,52.06,52.84,53.55,54.19,54.76,55.25,55.69,56.12,56.56,57.01,57.48,57.97,29.77
Malta,68.60,68.89,69.17,69.46,69.73,70.01,70.28,70.55,70.81,71.07,71.33,71.58,71.84,72.08,72.33,72.57,72.81,73.05,73.29,73.52,73.75,73.98,74.21,74.43,74.65,74.87,75.09,75.30,75.51,75.73,75.94,76.14,76.35,76.56,76.76,77.14,77.14,77.59,77.39,77.30,78.20,78.84,78.74,78.55,79.25,79.30,79.44,79.79,79.64,80.24,81.40,80.75,80.75,81.75,81.95,81.80,81.80,13.20
Myanmar,42.71,43.38,44.14,44.99,45.95,46.97,47.98,48.93,49.75,50.44,50.99,51.43,51.82,52.19,52.56,52.95,53.36,53.77,54.18,54.58,54.98,55.37,55.76,56.15,56.53,56.90,57.28,57.65,58.02,58.38,58.74,59.10,59.45,59.79,60.13,60.46,60.80,61.13,61.47,61.80,62.13,62.45,62.76,63.05,63.32,63.60,63.88,64.18,64.50,64.84,65.18,65.51,65.81,66.07,66.28,66.46,66.61,23.90
Middle East & North Africa (excluding high income),46.63,47.22,47.81,48.39,48.98,49.57,50.15,50.71,51.27,51.81,52.36,52.94,53.57,54.24,54.93,55.62,56.25,56.79,57.23,57.60,57.92,58.28,58.73,59.31,60.02,60.85,61.76,62.68,63.57,64.38,65.13,65.76,66.31,66.80,67.25,67.65,68.02,68.36,68.68,68.98,69.27,69.55,69.82,70.09,70.35,70.61,70.86,71.10,71.33,71.55,71.75,71.96,72.16,72.37,72.58,72.79,72.99,26.36
Montenegro,63.82,64.51,65.18,65.83,66.44,67.02,67.59,68.17,68.76,69.35,69.93,70.48,70.97,71.39,71.75,72.04,72.29,72.50,72.71,72.92,73.13,73.33,73.52,73.69,73.84,73.98,74.12,74.25,74.39,74.53,74.63,74.67,74.63,74.52,74.33,74.10,73.85,73.61,73.42,73.29,73.23,73.23,73.28,73.36,73.47,73.62,73.83,74.12,74.46,74.86,75.28,75.70,76.09,76.43,76.71,76.94,77.12,13.30
Mongolia,48.39,49.30,50.19,51.01,51.77,52.46,53.10,53.70,54.28,54.84,55.36,55.82,56.19,56.48,56.68,56.80,56.85,56.86,56.86,56.88,56.94,57.07,57.30,57.59,57.97,58.39,58.84,59.27,59.66,59.99,60.27,60.49,60.67,60.84,61.02,61.21,61.45,61.73,62.06,62.45,62.87,63.32,63.78,64.23,64.67,65.10,65.54,65.99,66.45,66.92,67.38,67.82,68.22,68.56,68.85,69.09,69.29,20.90
Mozambique,35.03,35.49,35.94,36.36,36.77,37.17,37.57,37.98,38.40,38.83,39.27,39.73,40.21,40.68,41.12,41.51,41.80,41.98,42.05,42.02,41.91,41.78,41.66,41.60,41.61,41.70,41.87,42.09,42.33,42.60,42.91,43.29,43.74,44.27,44.86,45.49,46.12,46.74,47.31,47.84,48.35,48.86,49.41,50.01,50.66,51.36,52.08,52.78,53.46,54.10,54.70,55.29,55.88,56.48,57.10,57.71,58.31,23.28
Mauritania,43.49,44.17,44.84,45.47,46.08,46.65,47.18,47.69,48.19,48.66,49.13,49.59,50.05,50.50,50.97,51.45,51.97,52.51,53.08,53.68,54.28,54.88,55.45,55.99,56.48,56.91,57.29,57.62,57.92,58.18,58.41,58.63,58.84,59.04,59.23,59.42,59.59,59.73,59.85,59.96,60.05,60.14,60.25,60.38,60.54,60.73,60.95,61.20,61.46,61.73,62.00,62.25,62.49,62.71,62.91,63.08,63.24,19.75
Mauritius,58.75,59.75,60.63,61.36,61.93,62.36,62.64,62.82,62.93,63.02,63.12,63.25,63.44,63.69,64.00,64.39,64.86,65.37,65.91,66.46,66.97,67.41,67.77,68.04,68.23,68.37,68.50,68.66,68.86,69.12,69.40,69.96,70.06,70.11,70.16,70.33,70.32,70.40,70.61,70.96,71.66,71.77,71.97,72.12,72.28,72.43,72.43,72.57,72.57,72.88,72.97,73.27,73.86,74.02,74.19,74.35,74.39,15.65
Malawi,37.80,38.03,38.25,38.46,38.66,38.88,39.13,39.41,39.75,40.13,40.56,41.01,41.48,41.93,42.38,42.80,43.22,43.62,44.02,44.41,44.78,45.11,45.41,45.67,45.88,46.05,46.20,46.31,46.41,46.50,46.58,46.63,46.65,46.65,46.63,46.59,46.52,46.43,46.37,46.35,46.45,46.71,47.17,47.84,48.73,49.85,51.16,52.63,54.18,55.74,57.26,58.67,59.93,61.02,61.93,62.66,63.22,25.42
Malaysia,59.47,60.04,60.60,61.15,61.67,62.18,62.66,63.13,63.58,64.02,64.44,64.86,65.26,65.64,66.02,66.38,66.74,67.08,67.41,67.73,68.04,68.35,68.64,68.93,69.21,69.48,69.75,70.00,70.25,70.49,70.73,70.95,71.18,71.39,71.61,71.81,72.02,72.22,72.42,72.62,72.80,72.97,73.11,73.24,73.36,73.46,73.58,73.70,73.85,74.02,74.21,74.41,74.61,74.80,74.98,75.14,75.30,15.83
North America,69.89,70.37,70.23,70.05,70.31,70.37,70.38,70.71,70.18,70.69,70.99,71.29,71.32,71.53,72.08,72.69,72.95,73.35,73.47,73.91,73.75,74.15,74.49,74.62,74.74,74.73,74.79,74.96,74.97,75.22,75.43,75.58,75.79,75.65,75.84,75.86,76.25,76.63,76.79,76.81,76.89,77.10,77.20,77.31,77.75,77.76,77.94,78.24,78.30,78.64,78.80,78.92,79.03,79.04,79.15,79.04,79.05,9.16
Namibia,46.91,47.53,48.15,48.74,49.32,49.88,50.41,50.92,51.40,51.87,52.34,52.83,53.35,53.91,54.50,55.10,55.68,56.22,56.71,57.13,57.52,57.89,58.27,58.69,59.12,59.58,60.06,60.53,60.96,61.31,61.54,61.61,61.52,61.25,60.81,60.19,59.41,58.49,57.52,56.53,55.61,54.80,54.15,53.69,53.48,53.56,53.98,54.71,55.70,56.88,58.19,59.53,60.81,61.98,62.98,63.78,64.39,17.48
New Caledonia,58.64,59.04,59.44,59.89,60.34,60.79,61.23,61.68,62.13,62.58,63.03,63.48,63.93,64.38,64.82,65.27,65.72,66.17,66.30,66.44,66.57,66.70,66.92,68.59,68.06,68.77,69.06,69.43,69.45,69.09,70.49,70.36,71.61,71.66,70.67,72.01,72.00,71.74,74.38,73.88,75.16,74.83,75.10,75.27,75.47,75.72,76.08,76.48,76.68,76.98,77.26,76.65,77.07,77.18,77.25,77.24,76.96,18.32
Niger,35.05,35.13,35.21,35.29,35.36,35.43,35.50,35.57,35.66,35.76,35.88,36.03,36.20,36.40,36.63,36.91,37.23,37.60,38.02,38.48,38.96,39.45,39.93,40.38,40.82,41.24,41.65,42.08,42.53,43.02,43.54,44.11,44.71,45.34,46.00,46.66,47.32,47.98,48.62,49.25,49.87,50.49,51.12,51.77,52.44,53.13,53.85,54.59,55.35,56.10,56.84,57.53,58.16,58.73,59.23,59.67,60.06,25.01
Nigeria,36.98,37.43,37.87,38.29,38.69,39.07,39.44,39.81,40.18,40.57,40.97,41.39,41.83,42.27,42.73,43.19,43.65,44.10,44.55,44.96,45.33,45.63,45.87,46.02,46.10,46.12,46.10,46.05,45.99,45.94,45.90,45.87,45.85,45.84,45.84,45.85,45.88,45.92,45.99,46.10,46.27,46.51,46.83,47.24,47.72,48.25,48.80,49.36,49.89,50.38,50.85,51.28,51.70,52.12,52.55,52.98,53.43,16.45
Nicaragua,47.03,47.68,48.33,48.98,49.64,50.31,50.98,51.66,52.34,53.02,53.69,54.33,54.94,55.52,56.05,56.55,56.99,57.40,57.78,58.15,58.51,58.88,59.27,59.69,60.15,60.67,61.26,61.92,62.64,63.40,64.17,64.93,65.64,66.30,66.89,67.41,67.89,68.35,68.81,69.27,69.74,70.21,70.67,71.12,71.54,71.94,72.31,72.68,73.03,73.37,73.70,74.02,74.32,74.61,74.88,75.15,75.40,28.37
Netherlands,73.39,73.65,73.32,73.34,73.70,73.57,73.51,73.80,73.61,73.54,73.59,73.81,73.73,74.14,74.54,74.50,74.65,75.22,75.15,75.61,75.74,75.93,75.99,76.16,76.23,76.28,76.27,76.71,76.89,76.73,76.88,77.00,77.22,76.92,77.38,77.40,77.44,77.79,77.88,77.84,77.99,78.19,78.29,78.49,79.10,79.35,79.70,80.10,80.25,80.55,80.70,81.20,81.10,81.30,81.71,81.51,81.51,8.12
Norway,73.55,73.55,73.45,73.08,73.60,73.72,74.00,74.07,73.94,73.66,74.09,74.18,74.34,74.44,74.75,74.82,75.04,75.39,75.42,75.41,75.67,75.87,76.01,76.07,76.22,75.92,76.24,76.08,76.22,76.50,76.54,76.98,77.18,77.15,77.69,77.74,78.15,78.14,78.33,78.28,78.63,78.79,78.99,79.39,79.84,80.04,80.34,80.40,80.59,80.80,81.00,81.30,81.45,81.75,82.10,82.30,82.51,8.96
Nepal,35.20,35.56,35.98,36.45,36.98,37.54,38.12,38.73,39.34,39.95,40.54,41.13,41.71,42.28,42.85,43.43,44.02,44.63,45.25,45.90,46.56,47.25,47.95,48.67,49.41,50.16,50.94,51.74,52.56,53.40,54.26,55.12,55.99,56.85,57.70,58.53,59.34,60.13,60.91,61.66,62.39,63.08,63.74,64.38,64.97,65.54,66.07,66.56,67.04,67.48,67.91,68.33,68.73,69.13,69.51,69.89,70.25,35.06
New Zealand,71.24,70.99,71.23,71.28,71.33,71.23,71.12,71.47,71.12,71.47,71.27,71.77,71.83,71.67,71.92,72.22,72.42,72.17,73.02,73.07,72.83,73.62,73.72,73.78,74.37,73.83,74.12,74.18,74.42,74.82,75.38,76.03,76.12,76.43,76.88,76.73,76.79,77.33,78.09,77.89,78.64,78.69,78.85,79.15,79.55,79.85,80.05,80.15,80.35,80.70,80.70,80.90,81.16,81.41,81.40,81.46,81.61,10.38
OECD members,67.36,67.75,67.76,67.98,68.39,68.51,68.78,69.02,68.99,69.18,69.51,69.80,70.09,70.28,70.69,71.04,71.32,71.68,71.86,72.20,72.26,72.63,72.97,73.11,73.40,73.54,73.80,74.09,74.23,74.50,74.68,74.88,75.15,75.27,75.57,75.68,76.06,76.40,76.61,76.78,77.07,77.37,77.52,77.67,78.08,78.20,78.50,78.74,78.90,79.17,79.35,79.59,79.71,79.89,80.15,80.05,80.11,12.75
Oman,42.67,43.50,44.31,45.11,45.90,46.66,47.41,48.14,48.86,49.57,50.31,51.09,51.92,52.81,53.76,54.76,55.78,56.81,57.83,58.81,59.76,60.66,61.52,62.35,63.15,63.91,64.64,65.32,65.97,66.59,67.18,67.74,68.27,68.79,69.28,69.77,70.25,70.73,71.20,71.66,72.13,72.58,73.02,73.45,73.85,74.23,74.58,74.90,75.19,75.45,75.69,75.92,76.14,76.36,76.58,76.80,77.03,34.36
Other small states,51.45,51.90,52.34,52.74,53.15,53.52,53.85,54.19,54.52,54.85,55.19,55.51,55.85,56.16,56.46,56.80,57.18,57.58,58.04,58.51,59.04,59.51,59.97,60.39,60.76,61.11,61.49,61.83,62.10,62.28,62.40,62.52,62.49,62.31,62.05,61.89,61.74,61.43,61.08,60.86,60.73,60.64,60.70,60.90,61.25,61.73,62.28,62.92,63.61,64.31,64.95,65.53,66.08,66.55,66.97,67.36,67.70,16.25
Pakistan,45.27,46.20,47.09,47.94,48.75,49.52,50.26,50.95,51.62,52.24,52.84,53.39,53.90,54.38,54.81,55.22,55.61,55.97,56.31,56.65,56.97,57.30,57.61,57.93,58.24,58.55,58.85,59.16,59.46,59.76,60.05,60.34,60.62,60.90,61.17,61.44,61.70,61.96,62.22,62.48,62.73,62.97,63.20,63.41,63.62,63.84,64.06,64.30,64.56,64.84,65.13,65.42,65.69,65.93,66.14,66.32,66.48,21.22
Panama,60.86,61.38,61.88,62.36,62.82,63.27,63.71,64.16,64.60,65.06,65.53,66.02,66.51,67.02,67.53,68.03,68.51,68.98,69.41,69.82,70.19,70.54,70.86,71.17,71.45,71.73,72.00,72.26,72.51,72.75,72.99,73.22,73.44,73.66,73.88,74.09,74.30,74.50,74.70,74.89,75.08,75.27,75.44,75.61,75.78,75.95,76.11,76.28,76.46,76.64,76.83,77.02,77.22,77.41,77.61,77.81,78.00,17.14
Peru,47.69,48.23,48.75,49.25,49.73,50.21,50.74,51.32,51.97,52.69,53.46,54.24,55.02,55.76,56.45,57.10,57.71,58.30,58.88,59.47,60.06,60.66,61.25,61.84,62.41,62.96,63.50,64.03,64.54,65.05,65.54,66.03,66.53,67.02,67.52,68.03,68.53,69.04,69.54,70.04,70.51,70.96,71.39,71.78,72.15,72.47,72.76,73.02,73.26,73.47,73.68,73.88,74.09,74.30,74.52,74.75,74.98,27.29
Philippines,57.87,58.17,58.48,58.77,59.07,59.37,59.67,59.97,60.27,60.56,60.83,61.06,61.24,61.38,61.48,61.54,61.60,61.68,61.79,61.95,62.16,62.42,62.73,63.07,63.43,63.80,64.15,64.47,64.77,65.03,65.26,65.46,65.66,65.86,66.06,66.27,66.47,66.67,66.85,67.02,67.17,67.31,67.43,67.56,67.67,67.78,67.89,68.00,68.11,68.21,68.32,68.43,68.55,68.68,68.81,68.95,69.09,11.23
Papua New Guinea,41.89,42.36,42.88,43.48,44.15,44.87,45.62,46.38,47.12,47.83,48.51,49.17,49.84,50.51,51.20,51.92,52.66,53.41,54.17,54.92,55.62,56.24,56.76,57.17,57.49,57.73,57.93,58.12,58.33,58.58,58.87,59.18,59.51,59.82,60.13,60.42,60.70,60.98,61.25,61.54,61.83,62.14,62.46,62.78,63.11,63.43,63.73,64.01,64.25,64.45,64.63,64.79,64.94,65.08,65.23,65.38,65.54,23.65
Poland,67.68,67.78,67.43,68.38,68.63,69.43,69.83,69.42,70.22,69.72,69.87,69.61,70.67,70.66,71.12,70.56,70.66,70.40,70.35,70.75,70.10,71.05,71.10,71.00,70.80,70.55,70.85,70.90,71.33,71.04,70.89,70.59,71.09,71.60,71.70,71.89,72.25,72.65,73.00,73.04,73.75,74.20,74.50,74.60,74.85,75.00,75.14,75.24,75.54,75.70,76.25,76.70,76.75,77.00,77.60,77.45,77.45,9.77
Pre-demographic dividend,38.80,39.25,39.69,40.13,40.57,41.00,41.44,41.88,42.33,42.78,43.24,43.71,44.18,44.65,45.11,45.56,45.99,46.40,46.79,47.15,47.49,47.80,48.08,48.35,48.58,48.79,48.97,49.11,49.22,49.31,49.38,49.44,49.48,49.53,49.59,49.66,49.77,49.92,50.13,50.39,50.73,51.15,51.66,52.24,52.88,53.55,54.25,54.96,55.65,56.31,56.94,57.53,58.08,58.59,59.08,59.53,59.96,21.16
Puerto Rico,68.72,68.94,69.15,69.36,69.59,69.87,70.19,70.52,70.86,71.20,71.54,71.86,72.17,72.46,72.74,72.98,73.19,73.36,73.50,73.61,73.70,73.80,73.91,74.04,74.18,74.31,74.40,74.43,74.39,74.30,74.17,74.04,73.95,73.92,73.98,74.13,74.36,74.67,75.01,75.38,76.69,77.07,77.76,78.07,78.18,78.30,78.42,78.43,77.90,78.15,78.41,78.67,78.93,79.17,79.39,79.60,79.79,11.07
North Korea,51.30,51.67,52.08,52.61,53.34,54.26,55.36,56.51,57.62,58.68,59.66,60.55,61.38,62.16,62.90,63.58,64.21,64.78,65.29,65.76,66.19,66.57,66.92,67.25,67.57,67.90,68.28,68.72,69.18,69.61,69.90,69.88,69.49,68.74,67.70,66.54,65.50,64.77,64.49,64.68,65.27,66.09,66.92,67.61,68.10,68.39,68.54,68.68,68.89,69.19,69.57,70.01,70.45,70.84,71.18,71.46,71.69,20.39
Portugal,62.81,63.25,63.69,64.13,64.56,64.99,65.41,65.82,66.22,66.62,67.07,66.77,68.32,67.52,68.02,68.31,68.86,70.01,70.32,71.17,71.21,71.61,72.41,72.27,72.51,72.81,73.27,73.67,73.71,74.27,73.97,74.01,74.31,74.51,74.91,75.31,75.26,75.41,75.71,75.96,76.31,76.81,77.07,77.22,77.67,78.07,78.42,78.32,78.52,78.73,79.03,80.47,80.37,80.72,81.12,81.12,81.13,18.32
Paraguay,63.88,64.10,64.31,64.49,64.64,64.78,64.90,65.03,65.17,65.32,65.49,65.66,65.82,65.97,66.12,66.24,66.36,66.47,66.58,66.69,66.79,66.90,67.00,67.10,67.20,67.30,67.42,67.54,67.69,67.84,68.01,68.19,68.37,68.55,68.73,68.91,69.11,69.32,69.56,69.81,70.07,70.33,70.59,70.84,71.07,71.28,71.48,71.69,71.89,72.09,72.28,72.47,72.64,72.79,72.91,73.02,73.12,9.24
Pacific island small states,53.57,54.04,54.50,54.97,55.43,55.88,56.33,56.77,57.20,57.62,58.04,58.44,58.84,59.23,59.61,59.98,60.35,60.70,61.05,61.37,61.67,61.93,62.16,62.34,62.49,62.62,62.75,63.14,63.08,63.30,63.61,63.87,64.19,64.53,64.86,65.25,65.50,65.81,66.11,66.45,66.72,67.02,67.31,67.59,67.88,68.16,68.43,68.71,68.98,69.25,69.51,69.77,70.02,70.26,70.48,70.69,70.90,17.33
Post-demographic dividend,68.73,69.14,69.14,69.36,69.77,69.87,70.12,70.37,70.30,70.50,70.83,71.11,71.35,71.51,71.89,72.24,72.47,72.81,72.95,73.24,73.28,73.59,73.92,74.03,74.32,74.46,74.71,75.00,75.10,75.35,75.48,75.58,75.81,75.82,76.07,76.09,76.43,76.77,76.98,77.13,77.37,77.67,77.79,77.92,78.35,78.44,78.76,79.02,79.16,79.48,79.69,79.96,80.09,80.28,80.54,80.41,80.46,11.73
French Polynesia,56.28,56.71,57.09,57.47,57.84,58.24,58.65,59.06,59.45,59.83,60.18,60.52,60.84,61.15,61.47,61.82,62.23,62.72,63.28,63.90,64.56,65.22,65.84,66.39,66.87,67.27,67.59,67.88,68.15,68.42,68.70,69.00,69.33,69.68,70.05,70.43,70.82,71.21,71.59,71.95,72.31,72.67,73.03,73.40,73.77,74.13,74.49,74.82,75.12,75.40,75.64,75.86,76.06,76.26,76.44,76.63,76.81,20.53
Qatar,61.09,61.85,62.60,63.36,64.11,64.85,65.58,66.30,67.00,67.67,68.31,68.91,69.47,69.98,70.45,70.88,71.27,71.64,72.00,72.33,72.65,72.96,73.25,73.52,73.78,74.02,74.24,74.45,74.64,74.82,74.98,75.14,75.28,75.42,75.55,75.68,75.80,75.92,76.05,76.16,76.28,76.39,76.49,76.58,76.67,76.75,76.84,76.94,77.05,77.17,77.30,77.44,77.59,77.74,77.89,78.04,78.18,17.09
Romania,65.64,66.42,67.03,67.44,67.65,67.70,67.66,67.63,67.67,67.81,68.06,68.50,68.47,69.01,69.50,69.61,69.70,69.74,69.48,69.15,69.09,69.37,69.53,69.73,69.66,69.71,69.50,69.23,69.39,69.53,69.74,69.78,69.78,69.56,69.51,69.46,69.10,69.00,69.81,70.51,71.16,71.16,71.01,71.31,71.59,71.88,72.16,72.57,72.57,73.31,73.46,74.41,74.41,75.06,74.96,75.01,75.01,9.37
Russian Federation,66.06,66.60,67.02,67.34,67.57,67.72,67.81,67.86,67.87,67.87,68.13,68.38,68.31,68.29,68.32,67.72,67.49,67.38,67.39,67.11,67.03,67.26,67.81,67.65,67.20,67.86,69.39,69.44,69.46,69.17,68.89,68.47,66.87,64.94,64.47,64.69,65.85,66.70,67.03,65.98,65.48,65.38,65.13,65.05,65.47,65.53,66.73,67.59,67.95,68.68,68.84,69.68,70.07,70.58,70.74,71.17,71.59,5.54
Rwanda,42.29,42.59,42.88,43.16,43.42,43.65,43.85,44.01,44.14,44.25,44.34,44.41,44.48,44.58,44.71,44.93,45.30,45.82,46.48,47.24,48.09,49.01,49.93,50.71,51.18,50.95,49.58,46.97,43.26,38.78,34.22,30.43,28.10,27.61,29.00,31.98,35.92,40.01,43.60,46.41,48.41,49.79,50.97,52.27,53.76,55.43,57.22,58.97,60.56,61.96,63.14,64.11,64.91,65.60,66.19,66.70,67.13,24.84
South Asia,41.95,42.59,43.24,43.88,44.53,45.17,45.80,46.41,46.99,47.56,48.11,48.67,49.25,49.86,50.50,51.14,51.78,52.40,52.98,53.52,54.02,54.47,54.89,55.29,55.67,56.05,56.44,56.85,57.27,57.72,58.19,58.68,59.17,59.67,60.16,60.64,61.11,61.57,62.02,62.45,62.87,63.27,63.67,64.06,64.45,64.84,65.24,65.64,66.04,66.44,66.83,67.20,67.55,67.88,68.18,68.46,68.71,26.76
Saudi Arabia,45.64,46.15,46.66,47.21,47.78,48.41,49.10,49.88,50.74,51.68,52.69,53.77,54.88,56.00,57.12,58.22,59.27,60.29,61.26,62.18,63.04,63.84,64.59,65.28,65.94,66.55,67.11,67.64,68.13,68.59,69.02,69.43,69.82,70.20,70.57,70.92,71.27,71.59,71.90,72.19,72.44,72.65,72.82,72.95,73.04,73.11,73.18,73.25,73.33,73.44,73.57,73.73,73.90,74.07,74.23,74.40,74.56,28.92
Sudan,48.19,48.62,49.03,49.45,49.85,50.26,50.66,51.07,51.47,51.86,52.23,52.58,52.90,53.18,53.43,53.64,53.81,53.95,54.06,54.16,54.25,54.34,54.44,54.53,54.65,54.77,54.90,55.04,55.18,55.33,55.50,55.69,55.90,56.15,56.42,56.72,57.04,57.37,57.72,58.07,58.43,58.80,59.18,59.58,59.99,60.42,60.85,61.30,61.75,62.19,62.62,63.02,63.38,63.71,64.00,64.26,64.49,16.29
Senegal,38.22,38.38,38.46,38.48,38.45,38.41,38.39,38.42,38.56,38.82,39.23,39.81,40.56,41.45,42.44,43.52,44.64,45.77,46.87,47.93,48.94,49.94,50.94,51.95,52.95,53.91,54.81,55.61,56.28,56.82,57.20,57.43,57.53,57.53,57.48,57.41,57.34,57.33,57.38,57.53,57.80,58.18,58.66,59.23,59.86,60.54,61.26,62.01,62.76,63.48,64.18,64.81,65.39,65.91,66.38,66.78,67.15,28.92
Singapore,65.66,66.09,66.43,66.70,66.91,67.09,67.26,67.45,67.67,67.95,68.28,68.65,69.04,69.44,69.83,70.22,70.59,70.96,71.32,71.68,72.19,72.59,72.69,73.04,73.29,73.89,74.25,74.55,74.70,74.95,75.30,75.65,75.95,76.05,76.20,76.30,76.60,76.90,77.30,77.55,77.95,78.25,78.55,79.04,79.49,79.99,80.14,80.44,80.79,81.24,81.54,81.74,82.00,82.25,82.50,82.74,82.80,17.14
Solomon Islands,49.17,49.68,50.18,50.69,51.19,51.70,52.21,52.72,53.23,53.74,54.25,54.78,55.32,55.86,56.40,56.92,57.42,57.88,58.28,58.59,58.78,58.77,58.57,58.20,57.70,57.16,56.68,56.34,56.20,56.31,56.64,57.16,57.80,58.47,59.15,59.82,60.48,61.13,61.79,62.45,63.10,63.74,64.37,64.97,65.55,66.10,66.64,67.15,67.64,68.12,68.57,69.00,69.40,69.77,70.11,70.43,70.73,21.55
Sierra Leone,30.37,30.58,30.79,31.01,31.26,31.57,31.97,32.48,33.10,33.81,34.60,35.44,36.27,37.07,37.81,38.47,39.05,39.55,40.00,40.37,40.64,40.81,40.86,40.80,40.62,40.31,39.87,39.32,38.68,38.01,37.35,36.75,36.25,35.89,35.70,35.73,35.98,36.43,37.05,37.82,38.70,39.66,40.66,41.67,42.66,43.62,44.57,45.50,46.43,47.35,48.22,49.03,49.76,50.40,50.95,51.42,51.84,21.46
El Salvador,49.97,50.64,51.26,51.85,52.38,52.88,53.35,53.79,54.22,54.62,54.99,55.31,55.58,55.78,55.94,56.04,56.10,56.13,56.16,56.23,56.38,56.64,57.04,57.59,58.27,59.08,60.01,61.01,62.03,63.04,63.99,64.85,65.61,66.27,66.82,67.27,67.64,67.96,68.25,68.54,68.83,69.14,69.44,69.74,70.05,70.36,70.67,70.98,71.29,71.60,71.90,72.19,72.48,72.75,73.02,73.27,73.51,23.54
Somalia,36.98,37.38,37.77,38.18,38.58,38.98,39.38,39.78,40.18,40.57,40.96,41.34,41.73,42.11,42.49,42.88,43.26,43.64,44.01,44.37,44.72,45.06,45.39,45.69,45.96,46.14,46.20,46.11,45.91,45.63,45.38,45.26,45.36,45.72,46.34,47.15,48.06,48.96,49.75,50.39,50.87,51.21,51.49,51.76,52.04,52.34,52.67,53.00,53.32,53.65,53.99,54.33,54.69,55.07,55.47,55.88,56.29,19.32
Sub-Saharan Africa (excluding high income),40.38,40.82,41.25,41.67,42.08,42.48,42.88,43.28,43.68,44.09,44.50,44.92,45.34,45.75,46.16,46.54,46.92,47.27,47.61,47.93,48.23,48.52,48.79,49.05,49.29,49.49,49.66,49.77,49.84,49.87,49.87,49.87,49.87,49.88,49.90,49.92,49.97,50.03,50.14,50.30,50.54,50.86,51.29,51.81,52.42,53.11,53.86,54.64,55.43,56.20,56.94,57.64,58.28,58.88,59.44,59.94,60.39,20.02
South Sudan,31.70,32.12,32.55,32.98,33.40,33.83,34.25,34.66,35.05,35.43,35.81,36.19,36.58,36.97,37.38,37.77,38.12,38.42,38.66,38.86,39.03,39.21,39.41,39.67,40.01,40.42,40.93,41.51,42.15,42.83,43.52,44.23,44.93,45.61,46.26,46.86,47.41,47.92,48.39,48.83,49.24,49.63,50.01,50.39,50.78,51.19,51.63,52.09,52.59,53.11,53.66,54.21,54.76,55.29,55.82,56.32,56.81,25.11
Sub-Saharan Africa,40.38,40.82,41.25,41.67,42.08,42.48,42.88,43.28,43.68,44.09,44.50,44.92,45.34,45.75,46.16,46.54,46.92,47.27,47.61,47.93,48.23,48.52,48.80,49.05,49.29,49.50,49.66,49.77,49.84,49.87,49.88,49.87,49.87,49.88,49.90,49.93,49.97,50.04,50.14,50.30,50.54,50.87,51.29,51.81,52.42,53.11,53.86,54.64,55.43,56.20,56.94,57.64,58.28,58.88,59.44,59.94,60.39,20.02
Small states,54.75,55.22,55.66,56.07,56.47,56.83,57.15,57.46,57.76,58.05,58.35,58.65,58.95,59.23,59.52,59.82,60.16,60.50,60.89,61.27,61.68,62.05,62.44,62.73,63.00,63.25,63.52,63.80,63.94,64.07,64.18,64.27,64.30,64.17,64.00,63.91,63.83,63.67,63.40,63.27,63.20,63.16,63.28,63.42,63.71,64.10,64.54,65.04,65.58,66.14,66.65,67.11,67.55,67.93,68.28,68.60,68.87,14.13
Sao Tome and Principe,50.36,50.94,51.51,52.06,52.60,53.12,53.64,54.16,54.71,55.27,55.86,56.48,57.11,57.76,58.39,58.98,59.49,59.90,60.21,60.42,60.55,60.63,60.68,60.75,60.84,60.97,61.13,61.30,61.47,61.64,61.81,61.97,62.13,62.29,62.45,62.61,62.76,62.90,63.04,63.18,63.34,63.53,63.75,64.02,64.32,64.64,64.96,65.25,65.50,65.71,65.88,66.01,66.12,66.24,66.36,66.49,66.62,16.26
Suriname,59.66,60.03,60.39,60.75,61.12,61.49,61.87,62.24,62.60,62.94,63.27,63.57,63.84,64.10,64.34,64.57,64.81,65.05,65.31,65.59,65.86,66.13,66.37,66.58,66.76,66.90,67.02,67.12,67.21,67.31,67.39,67.48,67.55,67.62,67.68,67.72,67.75,67.77,67.78,67.80,67.84,67.92,68.05,68.24,68.48,68.77,69.09,69.42,69.75,70.06,70.33,70.58,70.79,70.98,71.14,71.28,71.41,11.75
Slovak Republic,69.92,70.25,70.47,70.59,70.63,70.60,70.53,70.42,70.31,70.21,70.13,70.10,70.10,70.13,70.18,70.24,70.32,70.40,70.47,70.52,70.41,70.63,70.69,70.48,70.75,70.73,71.02,71.09,71.21,71.03,70.93,70.88,71.80,72.45,72.30,72.25,72.65,72.70,72.55,72.90,73.05,73.40,73.60,73.60,73.96,73.90,74.20,74.21,74.70,74.91,75.11,75.96,76.11,76.41,76.81,76.56,76.56,6.64
Slovenia,68.98,68.98,68.98,68.62,68.66,68.37,69.01,69.37,68.92,68.36,68.61,68.83,69.06,69.40,70.16,70.36,70.31,70.56,70.70,70.85,71.10,71.20,71.05,70.54,70.90,71.35,71.80,72.00,72.45,72.70,73.20,73.35,73.30,73.25,73.40,73.96,74.46,74.71,74.81,75.01,75.41,75.76,76.01,76.86,77.21,77.61,78.09,78.56,78.77,78.97,79.42,79.97,80.12,80.32,81.08,80.78,80.78,11.80
Sweden,73.01,73.47,73.35,73.56,73.73,73.86,74.08,74.12,73.97,74.08,74.65,74.62,74.72,74.87,74.98,74.98,74.97,75.38,75.47,75.52,75.74,76.03,76.33,76.55,76.82,76.67,76.93,77.09,76.98,77.73,77.54,77.67,78.00,78.06,78.65,78.74,78.96,79.20,79.34,79.44,79.64,79.80,79.85,80.10,80.50,80.55,80.75,80.90,81.10,81.35,81.45,81.80,81.70,81.96,82.25,82.20,82.20,9.20
Eswatini,44.28,44.58,44.87,45.16,45.45,45.76,46.12,46.52,46.98,47.49,48.04,48.63,49.23,49.84,50.45,51.06,51.67,52.31,52.96,53.64,54.35,55.10,55.88,56.68,57.46,58.21,58.90,59.51,59.98,60.29,60.37,60.16,59.64,58.84,57.77,56.46,54.94,53.28,51.59,49.97,48.52,47.35,46.51,46.02,45.91,46.19,46.85,47.80,48.97,50.26,51.60,52.91,54.16,55.30,56.29,57.11,57.75,13.47
Syrian Arab Republic,51.97,52.57,53.18,53.80,54.44,55.10,55.79,56.51,57.26,58.03,58.81,59.60,60.38,61.14,61.87,62.58,63.26,63.91,64.55,65.17,65.77,66.36,66.93,67.48,68.00,68.51,68.98,69.42,69.83,70.21,70.55,70.87,71.17,71.44,71.71,71.96,72.20,72.44,72.66,72.88,73.11,73.37,73.66,73.97,74.25,74.43,74.41,74.15,73.65,72.94,72.11,71.27,70.55,70.05,69.82,69.90,70.31,18.34
Chad,38.02,38.28,38.54,38.80,39.06,39.35,39.67,40.03,40.43,40.87,41.33,41.79,42.23,42.64,43.00,43.33,43.62,43.89,44.16,44.43,44.70,44.99,45.27,45.55,45.82,46.08,46.31,46.52,46.69,46.84,46.95,47.05,47.15,47.24,47.34,47.43,47.51,47.56,47.58,47.59,47.59,47.60,47.64,47.72,47.85,48.05,48.35,48.73,49.18,49.69,50.23,50.78,51.30,51.78,52.20,52.58,52.90,14.88
East Asia & Pacific (IDA & IBRD countries),45.65,46.10,46.82,47.86,49.22,50.82,52.54,54.24,55.82,57.20,58.37,59.35,60.19,60.97,61.70,62.39,63.05,63.67,64.24,64.77,65.25,65.68,66.06,66.41,66.73,67.02,67.28,67.51,67.72,67.91,68.09,68.27,68.45,68.64,68.84,69.07,69.33,69.62,69.95,70.30,70.66,71.03,71.40,71.75,72.08,72.38,72.65,72.89,73.12,73.34,73.53,73.72,73.89,74.05,74.21,74.37,74.53,28.88
Europe & Central Asia (IDA & IBRD countries),63.83,64.31,64.63,65.05,65.34,65.62,65.81,65.88,66.09,66.12,66.35,66.51,66.65,66.75,66.88,66.68,66.68,66.66,66.71,66.69,66.74,67.02,67.33,67.42,67.40,67.75,68.46,68.62,68.72,68.66,68.53,68.28,67.74,67.02,66.81,66.88,67.36,67.93,68.27,68.15,68.25,68.46,68.51,68.63,68.96,69.09,69.67,70.13,70.43,70.98,71.30,71.85,72.15,72.53,72.76,72.99,73.25,9.41
Togo,40.30,40.94,41.58,42.22,42.85,43.47,44.10,44.72,45.34,45.95,46.57,47.17,47.78,48.37,48.96,49.54,50.11,50.68,51.25,51.80,52.34,52.86,53.37,53.84,54.28,54.67,55.03,55.34,55.59,55.78,55.89,55.87,55.73,55.48,55.15,54.76,54.36,54.00,53.72,53.54,53.49,53.55,53.71,53.94,54.23,54.60,55.05,55.58,56.17,56.81,57.47,58.09,58.67,59.17,59.60,59.95,60.23,19.94
Thailand,54.70,55.23,55.75,56.23,56.69,57.14,57.57,58.00,58.44,58.91,59.39,59.89,60.41,60.93,61.46,61.99,62.50,62.99,63.46,63.94,64.43,64.99,65.64,66.35,67.13,67.91,68.64,69.27,69.75,70.07,70.25,70.30,70.28,70.24,70.20,70.19,70.21,70.27,70.35,70.46,70.62,70.84,71.11,71.42,71.78,72.15,72.53,72.92,73.28,73.62,73.92,74.20,74.45,74.68,74.89,75.10,75.30,20.60
Tajikistan,56.15,56.57,56.99,57.42,57.84,58.26,58.67,59.06,59.43,59.78,60.11,60.42,60.71,60.99,61.25,61.50,61.74,61.98,62.22,62.45,62.68,62.93,63.18,63.44,63.68,63.87,63.95,63.90,63.72,63.45,63.15,62.88,62.72,62.71,62.87,63.19,63.62,64.11,64.59,65.05,65.48,65.89,66.30,66.73,67.16,67.61,68.05,68.49,68.90,69.29,69.64,69.96,70.23,70.48,70.69,70.88,71.05,14.90
Turkmenistan,54.47,54.90,55.33,55.76,56.19,56.61,57.02,57.42,57.79,58.15,58.47,58.77,59.03,59.27,59.49,59.70,59.92,60.16,60.42,60.70,61.00,61.31,61.62,61.92,62.19,62.43,62.60,62.73,62.80,62.82,62.81,62.78,62.76,62.76,62.78,62.85,62.95,63.08,63.24,63.41,63.61,63.84,64.10,64.39,64.69,65.02,65.35,65.69,66.03,66.36,66.66,66.93,67.17,67.38,67.55,67.70,67.83,13.36
Latin America & the Caribbean (IDA & IBRD countries),55.64,56.12,56.58,57.03,57.46,57.88,58.29,58.71,59.13,59.55,59.98,60.41,60.83,61.24,61.64,62.03,62.41,62.79,63.17,63.55,63.93,64.32,64.70,65.07,65.43,65.79,66.15,66.50,66.85,67.20,67.56,67.93,68.31,68.70,69.09,69.49,69.89,70.29,70.67,71.03,71.38,71.70,72.01,72.30,72.57,72.84,73.10,73.35,73.61,73.85,74.10,74.34,74.58,74.80,75.02,75.23,75.44,19.80
Timor-Leste,33.73,34.23,34.73,35.23,35.73,36.27,36.89,37.60,38.34,39.04,39.53,39.57,39.09,38.08,36.66,35.09,33.71,32.83,32.63,33.18,34.42,36.18,38.17,40.13,41.93,43.48,44.75,45.82,46.77,47.64,48.47,49.33,50.27,51.32,52.47,53.70,54.95,56.18,57.33,58.38,59.36,60.30,61.25,62.22,63.21,64.17,65.07,65.84,66.47,66.96,67.31,67.58,67.81,68.03,68.28,68.57,68.88,35.15
Middle East & North Africa (IDA & IBRD countries),46.63,47.22,47.81,48.39,48.98,49.57,50.15,50.71,51.27,51.81,52.36,52.94,53.57,54.24,54.93,55.62,56.25,56.79,57.23,57.60,57.92,58.28,58.73,59.31,60.02,60.85,61.76,62.68,63.57,64.38,65.11,65.74,66.29,66.78,67.23,67.63,68.00,68.34,68.66,68.96,69.25,69.53,69.81,70.07,70.34,70.59,70.85,71.09,71.32,71.54,71.75,71.95,72.16,72.36,72.57,72.78,72.99,26.35
Tonga,61.40,61.77,62.13,62.49,62.84,63.19,63.53,63.88,64.22,64.55,64.88,65.19,65.49,65.77,66.03,66.28,66.52,66.76,66.99,67.23,67.48,67.72,67.98,68.23,68.48,68.72,68.94,69.14,69.31,69.47,69.60,69.72,69.83,69.94,70.05,70.16,70.28,70.41,70.54,70.67,70.81,70.95,71.09,71.23,71.37,71.50,71.64,71.77,71.91,72.04,72.17,72.31,72.45,72.59,72.73,72.88,73.03,11.63
South Asia (IDA & IBRD),41.95,42.59,43.24,43.88,44.53,45.17,45.80,46.41,46.99,47.56,48.11,48.67,49.25,49.86,50.50,51.14,51.78,52.40,52.98,53.52,54.02,54.47,54.89,55.29,55.67,56.05,56.44,56.85,57.27,57.72,58.19,58.68,59.17,59.67,60.16,60.64,61.11,61.57,62.02,62.45,62.87,63.27,63.67,64.06,64.45,64.84,65.24,65.64,66.04,66.44,66.83,67.20,67.55,67.88,68.18,68.46,68.71,26.76
Sub-Saharan Africa (IDA & IBRD countries),40.38,40.82,41.25,41.67,42.08,42.48,42.88,43.28,43.68,44.09,44.50,44.92,45.34,45.75,46.16,46.54,46.92,47.27,47.61,47.93,48.23,48.52,48.80,49.05,49.29,49.50,49.66,49.77,49.84,49.87,49.88,49.87,49.87,49.88,49.90,49.93,49.97,50.04,50.14,50.30,50.54,50.87,51.29,51.81,52.42,53.11,53.86,54.64,55.43,56.20,56.94,57.64,58.28,58.88,59.44,59.94,60.39,20.02
Trinidad and Tobago,62.62,63.22,63.72,64.12,64.42,64.62,64.74,64.82,64.89,64.97,65.08,65.23,65.41,65.61,65.83,66.07,66.30,66.52,66.71,66.88,67.02,67.14,67.24,67.33,67.43,67.52,67.62,67.72,67.82,67.91,68.01,68.09,68.17,68.24,68.30,68.34,68.38,68.42,68.45,68.49,68.53,68.58,68.65,68.72,68.82,68.93,69.06,69.21,69.38,69.57,69.76,69.94,70.12,70.28,70.43,70.56,70.67,8.05
Tunisia,42.02,42.66,43.35,44.11,44.93,45.82,46.78,47.80,48.88,50.00,51.15,52.30,53.45,54.59,55.70,56.80,57.87,58.93,59.98,61.01,62.00,62.92,63.77,64.53,65.21,65.83,66.42,66.99,67.58,68.18,68.79,69.40,69.99,70.54,71.04,71.50,71.90,72.26,72.59,72.88,73.16,73.40,73.63,73.84,74.03,74.20,74.35,74.48,74.59,74.69,74.79,74.90,75.02,75.17,75.33,75.53,75.73,33.71
Turkey,45.37,46.09,46.83,47.57,48.31,49.03,49.73,50.41,51.05,51.68,52.29,52.89,53.49,54.11,54.74,55.39,56.05,56.71,57.37,58.02,58.67,59.30,59.91,60.52,61.11,61.68,62.23,62.76,63.27,63.76,64.26,64.76,65.28,65.81,66.38,66.96,67.57,68.19,68.81,69.42,70.01,70.57,71.10,71.60,72.06,72.48,72.87,73.22,73.55,73.86,74.15,74.44,74.71,74.98,75.24,75.50,75.75,30.39
Tanzania,43.69,43.94,44.20,44.46,44.73,45.02,45.33,45.65,45.99,46.34,46.72,47.12,47.55,47.99,48.45,48.89,49.31,49.67,49.99,50.24,50.43,50.58,50.69,50.79,50.86,50.90,50.89,50.80,50.65,50.45,50.21,49.95,49.72,49.54,49.44,49.46,49.61,49.89,50.30,50.83,51.49,52.28,53.17,54.14,55.16,56.20,57.22,58.21,59.16,60.05,60.89,61.71,62.53,63.35,64.16,64.95,65.67,21.99
Uganda,43.99,44.57,45.16,45.75,46.33,46.89,47.41,47.87,48.26,48.58,48.83,49.01,49.14,49.24,49.30,49.35,49.38,49.41,49.43,49.42,49.37,49.27,49.10,48.84,48.51,48.10,47.62,47.10,46.55,46.01,45.51,45.06,44.68,44.39,44.22,44.22,44.41,44.81,45.40,46.16,47.08,48.12,49.24,50.39,51.54,52.64,53.68,54.66,55.57,56.41,57.15,57.80,58.35,58.82,59.22,59.58,59.89,15.90
Ukraine,68.30,68.76,69.15,69.46,69.71,69.91,70.06,70.16,70.22,70.25,70.24,70.18,70.09,69.96,69.81,69.63,69.45,69.25,69.07,68.92,68.82,68.81,68.90,69.08,69.32,69.57,69.79,70.50,70.50,70.54,70.14,68.88,69.07,68.48,67.84,67.14,66.89,67.30,67.99,68.21,67.86,68.29,68.28,68.21,68.19,67.96,68.08,68.22,68.25,69.19,70.27,70.81,70.94,71.16,71.19,71.19,71.48,3.18
Upper middle income,49.51,50.04,50.70,51.56,52.65,53.92,55.27,56.62,57.90,59.03,60.04,60.89,61.62,62.30,62.93,63.46,63.97,64.43,64.86,65.22,65.58,65.93,66.29,66.58,66.85,67.19,67.59,67.85,68.10,68.31,68.51,68.69,68.76,68.82,69.00,69.24,69.57,69.92,70.25,70.51,70.83,71.16,71.47,71.79,72.13,72.42,72.77,73.08,73.36,73.65,73.89,74.18,74.42,74.67,74.88,75.09,75.29,25.78
Uruguay,67.78,68.01,68.20,68.35,68.45,68.52,68.55,68.57,68.58,68.59,68.62,68.66,68.73,68.82,68.94,69.09,69.27,69.48,69.72,69.98,70.25,70.53,70.81,71.08,71.34,71.58,71.81,72.01,72.20,72.39,72.57,72.76,72.95,73.16,73.38,73.61,73.85,74.10,74.34,74.58,74.81,75.02,75.23,75.43,75.61,75.79,75.96,76.12,76.28,76.44,76.59,76.74,76.89,77.04,77.19,77.34,77.49,9.71
United States,69.77,70.27,70.12,69.92,70.17,70.21,70.21,70.56,69.95,70.51,70.81,71.11,71.16,71.36,71.96,72.60,72.86,73.26,73.36,73.80,73.61,74.01,74.36,74.46,74.56,74.56,74.61,74.77,74.77,75.02,75.21,75.37,75.62,75.42,75.62,75.62,76.03,76.43,76.58,76.58,76.64,76.84,76.94,77.04,77.49,77.49,77.69,77.99,78.04,78.39,78.54,78.64,78.74,78.74,78.84,78.69,78.69,8.92
Uzbekistan,58.84,59.21,59.59,59.97,60.35,60.72,61.09,61.44,61.78,62.10,62.39,62.66,62.90,63.12,63.33,63.53,63.73,63.93,64.15,64.38,64.64,64.91,65.21,65.50,65.80,66.06,66.27,66.42,66.50,66.51,66.48,66.42,66.37,66.34,66.34,66.40,66.49,66.63,66.78,66.96,67.15,67.37,67.59,67.84,68.09,68.37,68.66,68.98,69.32,69.67,70.00,70.32,70.60,70.84,71.04,71.19,71.31,12.48
St. Vincent and the Grenadines,58.03,59.13,60.18,61.12,61.96,62.68,63.29,63.81,64.29,64.72,65.10,65.43,65.71,65.93,66.12,66.30,66.48,66.69,66.94,67.22,67.54,67.87,68.21,68.53,68.82,69.08,69.32,69.55,69.76,69.96,70.14,70.30,70.42,70.52,70.58,70.62,70.63,70.62,70.60,70.59,70.59,70.64,70.72,70.85,71.01,71.22,71.45,71.68,71.91,72.13,72.33,72.50,72.66,72.80,72.94,73.06,73.18,15.15
Venezuela,59.25,59.83,60.40,60.95,61.49,62.02,62.54,63.06,63.57,64.08,64.57,65.04,65.48,65.90,66.28,66.63,66.96,67.27,67.56,67.84,68.11,68.36,68.59,68.80,68.97,69.13,69.27,69.40,69.53,69.66,69.80,69.97,70.17,70.38,70.63,70.89,71.18,71.47,71.75,72.03,72.28,72.51,72.70,72.87,73.02,73.13,73.23,73.33,73.42,73.52,73.62,73.75,73.89,74.03,74.20,74.37,74.55,15.29
Virgin Islands (U.S.),66.22,66.49,66.74,67.00,67.26,67.54,67.84,68.14,68.44,68.75,69.05,69.35,69.65,69.94,70.22,70.49,70.75,71.00,71.24,71.47,71.70,71.93,72.17,72.41,72.66,72.92,73.19,73.45,73.72,73.98,74.24,74.49,74.75,75.00,75.26,75.51,75.76,76.00,76.24,76.46,76.62,77.67,77.62,77.57,77.87,77.42,78.48,76.86,77.26,77.61,77.97,78.42,78.67,78.87,78.97,79.17,79.27,13.04
Vietnam,59.04,59.72,60.39,61.02,61.59,61.97,62.04,61.77,61.19,60.39,59.57,58.99,58.84,59.21,60.12,61.46,63.02,64.56,65.87,66.88,67.55,67.95,68.21,68.45,68.70,68.98,69.30,69.63,69.94,70.24,70.54,70.83,71.11,71.40,71.69,71.97,72.25,72.52,72.78,73.03,73.27,73.49,73.69,73.89,74.08,74.26,74.44,74.61,74.78,74.95,75.12,75.29,75.48,75.66,75.86,76.05,76.25,17.21
Vanuatu,46.44,47.04,47.65,48.25,48.85,49.45,50.05,50.63,51.22,51.80,52.37,52.94,53.52,54.10,54.69,55.28,55.89,56.51,57.12,57.74,58.35,58.93,59.48,59.99,60.47,60.92,61.35,61.77,62.19,62.63,63.07,63.53,63.99,64.44,64.90,65.34,65.78,66.21,66.63,67.04,67.44,67.82,68.19,68.55,68.89,69.22,69.54,69.85,70.15,70.44,70.72,70.99,71.24,71.48,71.71,71.92,72.13,25.69
World,52.57,53.08,53.50,54.04,54.72,55.38,56.13,56.84,57.45,58.06,58.65,59.18,59.67,60.11,60.60,61.05,61.46,61.88,62.23,62.59,62.87,63.20,63.52,63.76,64.02,64.27,64.56,64.82,65.02,65.24,65.44,65.62,65.79,65.92,66.13,66.32,66.61,66.91,67.17,67.41,67.68,67.98,68.25,68.52,68.86,69.14,69.47,69.79,70.08,70.41,70.68,70.97,71.22,71.46,71.69,71.86,72.04,19.46
Samoa,49.75,50.25,50.75,51.25,51.76,52.26,52.77,53.27,53.77,54.28,54.78,55.28,55.78,56.28,56.78,57.28,57.78,58.29,58.79,59.30,59.80,60.30,60.79,61.28,61.77,62.27,62.76,63.27,63.79,64.32,64.85,65.38,65.91,66.42,66.92,67.39,67.83,68.23,68.61,68.97,69.31,69.64,69.97,70.31,70.67,71.05,71.45,71.87,72.29,72.71,73.12,73.51,73.88,74.21,74.50,74.77,75.01,25.27
Yemen,34.36,34.47,34.74,35.19,35.81,36.60,37.49,38.43,39.37,40.28,41.16,42.02,42.88,43.76,44.68,45.62,46.60,47.60,48.61,49.63,50.64,51.62,52.58,53.49,54.35,55.13,55.84,56.46,57.00,57.48,57.88,58.22,58.52,58.79,59.04,59.27,59.50,59.72,59.94,60.16,60.38,60.63,60.90,61.20,61.52,61.86,62.20,62.55,62.89,63.21,63.51,63.79,64.05,64.29,64.52,64.74,64.95,30.59
South Africa,52.22,52.56,52.89,53.23,53.57,53.93,54.30,54.69,55.09,55.48,55.85,56.19,56.48,56.73,56.92,57.08,57.19,57.29,57.40,57.53,57.70,57.96,58.29,58.69,59.15,59.67,60.22,60.77,61.29,61.73,62.06,62.24,62.25,62.09,61.76,61.23,60.49,59.58,58.55,57.45,56.34,55.27,54.30,53.48,52.88,52.57,52.61,53.01,53.72,54.70,55.89,57.20,58.55,59.83,60.99,61.98,62.77,10.56
Zambia,45.12,45.50,45.87,46.23,46.57,46.93,47.30,47.70,48.13,48.58,49.04,49.51,49.97,50.40,50.78,51.09,51.32,51.46,51.50,51.44,51.27,50.96,50.52,49.99,49.36,48.66,47.91,47.14,46.38,45.66,45.00,44.43,43.95,43.56,43.30,43.17,43.18,43.35,43.65,44.10,44.70,45.45,46.33,47.33,48.43,49.63,50.93,52.31,53.75,55.19,56.59,57.87,59.01,59.98,60.77,61.40,61.87,16.75
Zimbabwe,51.56,51.94,52.30,52.65,52.99,53.33,53.65,53.97,54.28,54.60,54.92,55.25,55.59,55.95,56.32,56.73,57.19,57.71,58.26,58.83,59.39,59.92,60.39,60.75,60.97,61.00,60.82,60.41,59.79,58.97,57.94,56.72,55.34,53.85,52.33,50.81,49.34,47.95,46.70,45.65,44.84,44.33,44.11,44.19,44.57,45.28,46.34,47.72,49.34,51.12,52.98,54.80,56.52,58.05,59.36,60.40,61.16,9.60
"
        );*/

        // add more datasets here...

        // only show tables datasets if URL starts with /table/
        if (substr($_SERVER['REQUEST_URI'] ?? '', 0, 7) === '/table/') {
            $datasets = array_filter($datasets, function($ds) {
                return $ds['presets']['type'] === 'tables';
            });
        }
        return $datasets;
    }
}
