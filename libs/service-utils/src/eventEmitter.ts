import NodeEventEmitter from 'events';

const EventEmitter: new () => Omit<NodeEventEmitter, 'emit'> = NodeEventEmitter;

type Logger = {
    error: (...args: unknown[]) => void;
};

type EventList<TEvents extends string> = {
    [key in keyof Record<TEvents, unknown>]: key;
};

type EventResultSuccess = { status: 'success'; data: unknown };
type EventResultError = { status: 'error'; error: unknown };
type EventResult = EventResultSuccess | EventResultError;

type EventFilterFunc = (eventResult: EventResult) => boolean;

type EventFilter = 'first' | 'success' | EventFilterFunc;

const isEventResultSuccess = (eventResult: EventResult): eventResult is EventResultSuccess =>
    eventResult.status === 'success';
const isEventResultError = (eventResult: EventResult): eventResult is EventResultError =>
    eventResult.status === 'error';

/**
 * Custom event emitter that collects results of event listeners
 *
 * @class ServiceEventEmitter
 * @extends {EventEmitter}
 */
class ServiceEventEmitter<TEvents extends string> extends EventEmitter {
    logger: Logger;
    eventList: EventList<TEvents>;

    constructor({ logger, eventList }: { logger?: Logger; eventList: EventList<TEvents> }) {
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
    private async __privateEmit(event: TEvents, data: unknown) {
        if (!this.eventList[event]) {
            throw new TypeError(`Invalid event name (${event})`);
        }

        const listeners = this.listeners(event);

        const result = listeners.map(async (func): Promise<EventResult> => {
            try {
                const result = await func(data);
                return { status: 'success', data: result };
            } catch (error) {
                // TS does not yet support type narrowing for `'name' in error`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (error && (error as any).name !== 'CodedError') {
                    // only log unknown errors
                    this.logger.error(error, `[Event] ${event}`);
                }
                return { status: 'error', error };
            }
        });

        return Promise.all(result);
    }

    private filterEventResultsFirst(
        eventResults: readonly EventResult[],
        // Require constant parameter value to avoid being called instead of another function
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _filter: 'first'
    ): [unknown] | [] {
        const firstResult = eventResults.find(isEventResultSuccess);
        return firstResult?.data ? [firstResult.data] : [];
    }

    // Require constant parameter value to avoid being called instead of another function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private filterEventResultsSuccess(eventResults: readonly EventResult[], _filter: 'success') {
        return eventResults.filter(isEventResultSuccess).map(r => r.data);
    }

    private filterEventResultsFunction(
        eventResults: readonly EventResult[],
        filter: EventFilterFunc
    ) {
        return eventResults.filter(filter);
    }

    /**
     * @deprecated Use `emit`'s `filter` param instead
     */
    filterEventResults(eventResults: readonly EventResult[], filter: 'first'): [] | [unknown];
    /**
     * @deprecated Use `emit`'s `filter` param instead
     */
    filterEventResults(eventResults: readonly EventResult[], filter: 'success'): unknown[];
    /**
     * @deprecated Use `emit`'s `filter` param instead
     */
    filterEventResults(
        eventResults: readonly EventResult[],
        filter?: EventFilterFunc
    ): EventResult[];
    /**
     * Filter a list of event results
     *
     * @param {array} eventResults - List of event results
     * @param {function|string} filter - Result filter
     * @returns {array|object} - List or single event result
     * @memberof FrontendEventEmitter
     * @deprecated Use `emit`'s `filter` param instead
     */
    filterEventResults(eventResults: readonly EventResult[], filter: EventFilter = () => true) {
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
    private async emitWithFunctionFilter(event: TEvents, data: unknown, filter: EventFilterFunc) {
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
    private async emitWithSuccessFilter(event: TEvents, data: unknown, filter: 'success') {
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
    private async emitWithFirstFilter(event: TEvents, data: unknown, filter: 'first') {
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

    emit(event: TEvents, data: unknown, options: { filter: 'first' }): Promise<unknown>;
    emit(event: TEvents, data: unknown, options: { filter: 'success' }): Promise<unknown[]>;
    emit(
        event: TEvents,
        data: unknown,
        options?: { filter?: EventFilterFunc }
    ): Promise<EventResult[]>;
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
    async emit(event: TEvents, data: unknown, options?: { filter?: EventFilter }) {
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

export = ServiceEventEmitter;
