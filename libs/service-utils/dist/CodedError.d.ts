/// <reference types="node" />
declare const _default: {
    new (code: string, message: string): {
        code: string;
        toString(): string;
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: (err: Error, stackTraces: NodeJS.CallSite[]) => any;
    stackTraceLimit: number;
};
export = _default;
