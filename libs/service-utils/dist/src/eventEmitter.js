"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = __importDefault(require("events"));
const EventEmitter = events_1.default;
const isEventResultSuccess = (eventResult) => eventResult.status === 'success';
const isEventResultError = (eventResult) => eventResult.status === 'error';
/**
 * Custom event emitter that collects results of event listeners
 *
 * @class ServiceEventEmitter
 * @extends {EventEmitter}
 */
class ServiceEventEmitter extends EventEmitter {
    logger;
    eventList;
    constructor({ logger, eventList }) {
        super();
        this.logger = logger ?? {
            error() {
                // do nothing
            }
        };
        this.eventList = eventList;
    }
    /**
     * Emit function that calls all listeners and returns Promise of their results
     *
     * @private
     * @param {string} event - Name of event to emit
     * @param {any} [data] - Data to pass to event listeners
     * @return {Promise} - Promise of event results as array
     * @memberof FrontendEventEmitter
     */
    async __privateEmit(event, data) {
        if (!this.eventList[event]) {
            throw new TypeError(`Invalid event name (${event})`);
        }
        const listeners = this.listeners(event);
        const result = listeners.map(async (func) => {
            try {
                const result = await func(data);
                return { status: 'success', data: result };
            }
            catch (error) {
                // TS does not yet support type narrowing for `'name' in error`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (error && error.name !== 'CodedError') {
                    // only log unknown errors
                    this.logger.error(error, `[Event] ${event}`);
                }
                return { status: 'error', error };
            }
        });
        return Promise.all(result);
    }
    filterEventResultsFirst(eventResults, 
    // Require constant parameter value to avoid being called instead of another function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filter) {
        const firstResult = eventResults.find(isEventResultSuccess);
        return firstResult?.data ? [firstResult.data] : [];
    }
    // Require constant parameter value to avoid being called instead of another function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filterEventResultsSuccess(eventResults, _filter) {
        return eventResults.filter(isEventResultSuccess).map(r => r.data);
    }
    filterEventResultsFunction(eventResults, filter) {
        return eventResults.filter(filter);
    }
    /**
     * Filter a list of event results
     *
     * @param {array} eventResults - List of event results
     * @param {function|string} filter - Result filter
     * @returns {array|object} - List or single event result
     * @memberof FrontendEventEmitter
     * @deprecated Use `emit`'s `filter` param instead
     */
    filterEventResults(eventResults, filter = () => true) {
        if (typeof filter === 'function') {
            return this.filterEventResultsFunction(eventResults, filter);
        }
        switch (filter) {
            case 'first':
                return this.filterEventResultsFirst(eventResults, filter);
            case 'success':
                return this.filterEventResultsSuccess(eventResults, filter);
            default:
                // If an unsupported type-violating value was passed from JS code,
                // ignore it for backwards compatibility reasons.
                return eventResults;
        }
    }
    /**
     * * If there are successful results (even without data), returns them.
     * * If there are no successful results but there are errors, throws the first error.
     * * Otherwise, returns an empty array.
     */
    async emitWithFunctionFilter(event, data, filter) {
        const results = await this.__privateEmit(event, data);
        const eventResults = this.filterEventResultsFunction(results, filter);
        if (!eventResults.length) {
            const errorResult = results.find(isEventResultError);
            if (errorResult) {
                throw errorResult.error;
            }
        }
        return eventResults;
    }
    /**
     * * If there are successful results (even without data), returns array of their `data`s (in some cases this can be `undefined[]`).
     * * If there are no successful results but there are errors, throws the first error.
     * * Otherwise, returns an empty array.
     */
    async emitWithSuccessFilter(event, data, filter) {
        const results = await this.__privateEmit(event, data);
        const eventResults = this.filterEventResultsSuccess(results, filter);
        if (!eventResults.length) {
            const errorResult = results.find(isEventResultError);
            if (errorResult) {
                throw errorResult.error;
            }
        }
        return eventResults;
    }
    /**
     * * If there are successful results, and the first of them has a non-empty data, returns the data.
     * * Otherwise (including the cases when some successful results but not the first one have a non-empty data), if there are errors, throws the first error.
     * * Otherwise, returns undefined.
     */
    async emitWithFirstFilter(event, data, filter) {
        const results = await this.__privateEmit(event, data);
        const eventResults = this.filterEventResultsFirst(results, filter);
        if (!eventResults.length) {
            const errorResult = results.find(isEventResultError);
            if (errorResult) {
                throw errorResult.error;
            }
        }
        return eventResults[0];
    }
    /**
     * Emit function with options
     *
     * @param {string} event - Name of event to emit
     * @param {any} [data] - Data to pass to event listeners
     * @param {object} [options] - Options object to modify returned results
     * @param {function|string} [options.filter] - Result filter
     * @return {Promise} - Promise of event results
     * @memberof FrontendEventEmitter
     */
    async emit(event, data, options) {
        const filter = options?.filter ?? (() => true);
        if (typeof filter === 'function') {
            return this.emitWithFunctionFilter(event, data, filter);
        }
        switch (filter) {
            case 'success':
                return this.emitWithSuccessFilter(event, data, filter);
            case 'first':
                return this.emitWithFirstFilter(event, data, filter);
            default:
                // If an unsupported type-violating value was passed from JS code,
                // ignore it for backwards compatibility reasons.
                return this.emitWithFunctionFilter(event, data, () => true);
        }
    }
}
module.exports = ServiceEventEmitter;
