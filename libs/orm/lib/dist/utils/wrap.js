"use strict";
// This low-level module violates type checks on purpose;
// it would be unreasonably difficult to implement it with strict type checking.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInitializerParams = exports.setInitializer = exports.getRawModelClass = exports.ensureModelInitialized = exports.createExports = void 0;
const simpleProxyHandler = {};
for (const key of [
    'apply',
    'construct',
    'defineProperty',
    'deleteProperty',
    'get',
    'getOwnPropertyDescriptor',
    'getPrototypeOf',
    'has',
    'isExtensible',
    'ownKeys',
    'preventExtensions',
    'set',
    'setPrototypeOf'
]) {
    simpleProxyHandler[key] = ((target, ...rest) => Reflect[key](target.getRawModelClass(), ...rest));
}
const proxyHandler = {
    ...simpleProxyHandler,
    get(target, prop, ...rest) {
        if (!prop?.startsWith?.('dwORM$')) {
            return simpleProxyHandler.get(target, prop, ...rest);
        }
        switch (prop) {
            case 'dwORM$ensureModelInitialized':
                return target.ensureModelInitialized;
            case 'dwORM$getRawModelClass':
                return target.getRawModelClass;
            case 'dwORM$setInitializer':
                return target.setInitializer;
            case 'dwORM$setInitializerParams':
                return target.setInitializerParams;
            default:
                throw new Error(`Unsupported property name '${String(prop)}'`);
        }
    },
    set(target, prop, value, receiver) {
        if (!prop?.startsWith('dwORM$')) {
            return simpleProxyHandler.set(target, prop, value, receiver);
        }
        throw new Error(`Unsupported property name '${String(prop)}'`);
    }
};
const createLazyModel = (modelName) => {
    let modelInitializer = undefined;
    let initializerParams = undefined;
    let Model = undefined;
    let isInitializing = false;
    const setInitializer = (inputModelInitializer) => {
        if (modelInitializer) {
            throw new Error('Model initializer is already set');
        }
        modelInitializer = inputModelInitializer;
    };
    const setInitializerParams = ({ db, ...rest }) => {
        if (initializerParams) {
            throw new Error('Model initializer arguments are already set');
        }
        initializerParams = {
            initOptions: {
                sequelize: db,
                modelName
            },
            config: rest
        };
    };
    const ensureModelInitialized = () => {
        if (Model) {
            return;
        }
        if (!modelInitializer) {
            throw new Error('Model initializer is not set');
        }
        if (!initializerParams) {
            throw new Error('Model initializer arguments are not set');
        }
        if (isInitializing) {
            throw new Error('Recursive initialization');
        }
        try {
            isInitializing = true;
            Model = modelInitializer(initializerParams);
        }
        finally {
            isInitializing = false;
        }
    };
    const getRawModelClass = () => {
        ensureModelInitialized();
        return Model;
    };
    return {
        ensureModelInitialized,
        getRawModelClass,
        setInitializer,
        setInitializerParams
    };
};
const createExports = (modelName) => () => {
    const lazyModel = Object.assign(function () {
        // It has to be a function so that proxy will handle function calls
        throw new Error('Should never happen');
    }, createLazyModel(modelName));
    return new Proxy(lazyModel, proxyHandler);
};
exports.createExports = createExports;
const ensureModelInitialized = (exportedLite) => {
    return exportedLite.dwORM$ensureModelInitialized();
};
exports.ensureModelInitialized = ensureModelInitialized;
const getRawModelClass = (exportedLite) => {
    return exportedLite.dwORM$getRawModelClass();
};
exports.getRawModelClass = getRawModelClass;
const setInitializer = (exportedLite, initializer) => {
    return exportedLite.dwORM$setInitializer(initializer);
};
exports.setInitializer = setInitializer;
const setInitializerParams = (exportedLite, orm) => {
    return exportedLite.dwORM$setInitializerParams(orm);
};
exports.setInitializerParams = setInitializerParams;
