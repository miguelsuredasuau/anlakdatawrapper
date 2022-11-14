/// <reference types="node" />
import NodeEventEmitter from 'events';
declare const EventEmitter: new () => Omit<NodeEventEmitter, 'emit'>;
declare type Logger = {
    error: (...args: unknown[]) => void;
};
declare type EventList<TEvents extends string> = {
    [key in keyof Record<TEvents, unknown>]: key;
};
declare type EventResultSuccess = {
    status: 'success';
    data: unknown;
};
declare type EventResultError = {
    status: 'error';
    error: unknown;
};
declare type EventResult = EventResultSuccess | EventResultError;
declare type EventFilterFunc = (eventResult: EventResult) => boolean;
/**
 * Custom event emitter that collects results of event listeners
 *
 * @class ServiceEventEmitter
 * @extends {EventEmitter}
 */
declare class ServiceEventEmitter<TEvents extends string> extends EventEmitter {
    logger: Logger;
    eventList: EventList<TEvents>;
    constructor({ logger, eventList }: {
        logger?: Logger;
        eventList: EventList<TEvents>;
    });
    /**
     * Emit function that calls all listeners and returns Promise of their results
     *
     * @private
     * @param {string} event - Name of event to emit
     * @param {any} [data] - Data to pass to event listeners
     * @return {Promise} - Promise of event results as array
     * @memberof FrontendEventEmitter
     */
    private __privateEmit;
    private filterEventResultsFirst;
    private filterEventResultsSuccess;
    private filterEventResultsFunction;
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
    filterEventResults(eventResults: readonly EventResult[], filter?: EventFilterFunc): EventResult[];
    /**
     * * If there are successful results (even without data), returns them.
     * * If there are no successful results but there are errors, throws the first error.
     * * Otherwise, returns an empty array.
     */
    private emitWithFunctionFilter;
    /**
     * * If there are successful results (even without data), returns array of their `data`s (in some cases this can be `undefined[]`).
     * * If there are no successful results but there are errors, throws the first error.
     * * Otherwise, returns an empty array.
     */
    private emitWithSuccessFilter;
    /**
     * * If there are successful results, and the first of them has a non-empty data, returns the data.
     * * Otherwise (including the cases when some successful results but not the first one have a non-empty data), if there are errors, throws the first error.
     * * Otherwise, returns undefined.
     */
    private emitWithFirstFilter;
    emit(event: TEvents, data: unknown, options: {
        filter: 'first';
    }): Promise<unknown>;
    emit(event: TEvents, data: unknown, options: {
        filter: 'success';
    }): Promise<unknown[]>;
    emit(event: TEvents, data: unknown, options?: {
        filter?: EventFilterFunc;
    }): Promise<EventResult[]>;
}
export = ServiceEventEmitter;
