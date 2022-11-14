/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @see https://github.com/jonschlinkert/assign-deep/issues/19#issuecomment-1034126618
 */
declare module 'assign-deep' {
    function assign<T, U>(target: T, source: U): T & U;
    function assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
    function assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    function assign<T, U, V, W, Q>(
        target: T,
        source1: U,
        source2: V,
        source3: W,
        source4: Q
    ): T & U & V & W & Q;
    function assign<T, U, V, W, Q, R>(
        target: T,
        source1: U,
        source2: V,
        source3: W,
        source4: Q,
        source5: R
    ): T & U & V & W & Q & R;
    function assign(target: any, ...sources: any[]): any;
    namespace assign {}
    export = assign;
}
