import { isDate, identity } from 'underscore';
import dayjs from 'dayjs';

/**
 * Creates a date formatter based on a dw date column object
 *
 * @exports dateColumnFormatter
 * @kind function
 *
 * @description
 * This function returns a date formatting function based on a
 * dw column object. The implementation is backwards-compatible with
 * our old Globalize-based date formatting, but uses dayjs under the
 * hood.
 *
 * @param {object} column - the date column object
 * @returns {function}
 */

export default function dateColumnFormatter(column, { normalizeDatesToEn = true } = {}) {
    const format = column.format();
    if (!format) return identity;

    /*
     * When using dayjs to format, for chart rendering we need to normalize to 'en'
     * to ensure consistency, as render context may have, or
     * may at any point alter the locale of the dayjs instance (and formatted dates get used as keys in metadata, so they should be constant)
     */
    const formatDate = (d, fmt) => {
        if (!normalizeDatesToEn) return dayjs(d).format(fmt);

        const initialLocale = dayjs.locale();
        dayjs.locale('en');
        const formatted = dayjs(d).format(fmt);
        dayjs.locale(initialLocale);
        return formatted;
    };

    switch (column.precision()) {
        case 'year':
            return function (d) {
                return !isDate(d) ? d : d.getFullYear();
            };
        case 'half':
            return function (d) {
                return !isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
            };
        case 'quarter':
            return function (d) {
                return !isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
            };
        case 'month':
            return function (d) {
                return !isDate(d) ? d : formatDate(d, 'MMM YY');
            };
        case 'week':
            return function (d) {
                return !isDate(d) ? d : dateToIsoWeek(d).slice(0, 2).join(' W');
            };
        case 'day':
            return function (d, verbose) {
                return !isDate(d) ? d : formatDate(d, verbose ? 'dddd, MMMM DD, YYYY' : 'l');
            };
        case 'day-minutes':
            return function (d, verbose) {
                return !isDate(d)
                    ? d
                    : formatDate(d, 'MMM DD' + (verbose ? ', YYYY' : '')).replace(/ /g, '&nbsp;') +
                          ' - ' +
                          formatDate(d, 'LT').replace(' ', '&nbsp;');
            };
        case 'day-seconds':
            return function (d, verbose) {
                return !isDate(d)
                    ? d
                    : (verbose
                          ? formatDate(d, 'MMM DD, YYYY').replace(/ /g, '&nbsp;') + ' - '
                          : '') + formatDate(d, 'LTS').replace(' ', '&nbsp;');
            };
    }
}

function dateToIsoWeek(date) {
    const d = date.getUTCDay();
    const t = new Date(date.valueOf());
    t.setDate(t.getDate() - ((d + 6) % 7) + 3);
    const isoYear = t.getUTCFullYear();
    const w = Math.floor((t.getTime() - new Date(isoYear, 0, 1, -6)) / 864e5);
    return [isoYear, 1 + Math.floor(w / 7), d > 0 ? d : 7];
}
