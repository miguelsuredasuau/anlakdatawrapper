(function() {
    return {
        name: 'ga',
        weekdays: 'Dé Domhnaigh_Dé Luain_Dé Máirt_Dé Céadaoin_Déardaoin_Dé hAoine_Dé Satharn'.split('_'),
        months: 'Eanáir_Feabhra_Márta_Aibreán_Bealtaine_Méitheamh_Iúil_Lúnasa_Meán Fómhair_Deaireadh Fómhair_Samhain_Nollaig'.split('_'),
        weekStart: 1,
        weekdaysShort: 'Dom_Lua_Mái_Céa_Déa_hAo_Sat'.split('_'),
        monthsShort: 'Ean_Fea_Már_Aib_Beal_Meith_Iúil_Lún_MF_DF_Sam_Nol'.split('_'),
        weekdaysMin: 'Do_Lu_Má_Ce_Dé_hA_Sa'.split('_'),
        ordinal: function(n) {
            return n;
        },
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        relativeTime: {
            future: 'i %s',
            past: '%s ó shin',
            s: 'cúpla soicind',
            m: 'nóiméad',
            mm: '%d nóiméad',
            h: 'uair an chloig',
            hh: '%d uair an chloig',
            d: 'lá',
            dd: '%d lá',
            M: 'mí',
            MM: '%d mí',
            y: 'bliain',
            yy: '%d bliain'
        }
    };
})();
