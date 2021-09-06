class CodedError extends Error {
    /**
     * A custom Error object that allows for storing both an error
     * code and an error message (the standard JS error only stores
     * a message). Feel free to use this error whenever you need to
     * cleanly separate error code from error message.
     *
     * @exports CodedError
     * @kind function
     *
     * @example
     * import { CodedError } from '@datawrapper/shared';
     * throw new CodedError('notFound', 'the chart was not found');
     *
     * @param [string] code    a valid error code (depends on where it's being used). e.g. "notFound"
     * @param [string] message  an optional plain english message with more details
     */
    constructor(code, message) {
        super(message);
        this.name = 'CodedError';
        this.code = code;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }

    toString() {
        return `[${this.code}] ${this.message}`;
    }
}

module.exports = CodedError;
