/* globals define, $ */
define(function () {
    return function () {
        // obsolete
        $('a[href=#login], a[href=#signup]').click(function (e) {
            window.location.href = '/signin?ref='+location.pathname;
        });
    };
});
