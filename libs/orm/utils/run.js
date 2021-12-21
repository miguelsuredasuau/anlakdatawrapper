/**
 * Run an SQL query function `func` and ignore any parse errors that happen during its execution.
 *
 * This is useful to ignore syntax errors in user-provided full-text search expressions.
 *
 * Without this, the query can crash with "SequelizeDatabaseError: syntax error, unexpected '<'".
 *
 * @see https://github.com/datawrapper/code/pull/585
 */
async function runAndIgnoreParseErrors(func) {
    try {
        return await func();
    } catch (ex) {
        if (ex.original && ex.original.code === 'ER_PARSE_ERROR') {
            return null;
        }
        throw ex;
    }
}

module.exports = {
    runAndIgnoreParseErrors
};
