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
    simpleProxyHandler[key] = (target, ...rest) => Reflect[key](target.getRawModelClass(), ...rest);
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
            case 'dwORM$setInitializerArguments':
                return target.setInitializerArguments;
            default:
                throw new Error(`Unsupported property name '${prop}'`);
        }
    },
    set(target, prop, ...rest) {
        if (!prop?.startsWith('dwORM$')) {
            return simpleProxyHandler.set(target, prop, ...rest);
        }

        throw new Error(`Unsupported property name '${prop}'`);
    }
};

const createLazyModel = () => {
    let modelInitializer = undefined;
    let modelInitializerArguments = undefined;
    let Model = undefined;
    let isInitializing = false;
    const setInitializer = inputModelInitializer => {
        if (modelInitializer) {
            throw new Error('Model initializer is already set');
        }

        modelInitializer = inputModelInitializer;
    };
    const setInitializerArguments = (...inputModelInitializerArguments) => {
        if (modelInitializerArguments) {
            throw new Error('Model initializer arguments are already set');
        }

        modelInitializerArguments = inputModelInitializerArguments;
    };
    const ensureModelInitialized = () => {
        if (Model) {
            return;
        }

        if (!modelInitializer) {
            throw new Error('Model initializer is not set');
        }

        if (!modelInitializerArguments) {
            throw new Error('Model initializer arguments are not set');
        }

        if (isInitializing) {
            throw new Error('Recursive initialization');
        }
        try {
            isInitializing = true;
            Model = modelInitializer(...modelInitializerArguments);
        } finally {
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
        setInitializerArguments
    };
};

exports.createExports = name => {
    const lazyModel = Object.assign(function () {
        // It has to be a function so that proxy will handle function calls
        throw new Error('Should never happen');
    }, createLazyModel(name));

    return new Proxy(lazyModel, proxyHandler);
};
