import test from 'ava';
import Sinon from 'sinon';
import CodedError from './CodedError';
import ServiceEventEmitter from './eventEmitter';

test('returns results for several listeners', async t => {
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' }
    ]);
});

test('returns failed results among successful ones', async t => {
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.reject('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { error: 'b', status: 'error' },
        { data: 'c', status: 'success' }
    ]);
});

test('handles sync and async listeners', async t => {
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => 'b');
    emitter.addListener('a', () => Promise.resolve('c'));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' }
    ]);
});

test('handles sync and async errors', async t => {
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.reject('b'));
    emitter.addListener('a', () => {
        throw 'c';
    });
    emitter.addListener('a', () => Promise.resolve('d'));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { error: 'b', status: 'error' },
        { error: 'c', status: 'error' },
        { data: 'd', status: 'success' }
    ]);
});

test('logs errors that are not CodedError', async t => {
    const logger = { error: Sinon.spy() };
    const codedError = new CodedError('b', 'c');
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' }, logger });
    emitter.addListener('a', () => Promise.reject(codedError));
    emitter.addListener('a', () => Promise.reject(error));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { error: codedError, status: 'error' },
        { error, status: 'error' }
    ]);
    t.true(logger.error.calledOnce);
    t.deepEqual(logger.error.args[0], [error, '[Event] a']);
});

test('passes arguments to listeners and calls them once', async t => {
    const handler1 = Sinon.spy();
    const handler2 = Sinon.spy();
    const data = { da: 'ta' };
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', handler1);
    emitter.addListener('a', handler2);
    await emitter.emit('a', data);
    t.true(handler1.calledOnce);
    t.deepEqual(handler1.args[0], [data]);
    t.true(handler2.calledOnce);
    t.deepEqual(handler2.args[0], [data]);
});

test('returns results only for listeners for emitted event', async t => {
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a', b: 'b' } });
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('b', () => Promise.resolve('d'));
    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [{ data: 'c', status: 'success' }]);
});

test('only calls listeners for emitted event', async t => {
    const handler1 = Sinon.spy();
    const handler2 = Sinon.spy();
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a', b: 'b' } });
    emitter.addListener('a', handler1);
    emitter.addListener('b', handler2);
    await emitter.emit('a', undefined);
    t.true(handler1.calledOnce);
    t.true(handler2.notCalled);
});

test('emit without filter returns all results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    const results = await emitter.emit('a', undefined);
    t.deepEqual(results, [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ]);
});

test('emit with unsupported returns all results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    // Checking correct handling of unsupported filter value when called from old JS code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await emitter.emit('a', undefined, { filter: 'unsupported' as any });
    t.deepEqual(results, [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ]);
});

test('emit with function filter only returns filtered results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    {
        const results = await emitter.emit('a', undefined, { filter: () => true });
        t.deepEqual(results, [
            { data: undefined, status: 'success' },
            { data: 'b', status: 'success' },
            { data: 'c', status: 'success' },
            { error, status: 'error' },
            { data: undefined, status: 'success' }
        ]);
    }
    {
        const results = await emitter.emit('a', undefined, {
            filter: result => result.status === 'success'
        });
        t.deepEqual(results, [
            { data: undefined, status: 'success' },
            { data: 'b', status: 'success' },
            { data: 'c', status: 'success' },
            { data: undefined, status: 'success' }
        ]);
    }
    {
        const results = await emitter.emit('a', undefined, {
            filter: result => result.status === 'success' && result.data === 'b'
        });
        t.deepEqual(results, [{ data: 'b', status: 'success' }]);
    }
    {
        const results = await emitter.emit('a', undefined, {
            filter: result => result.status === 'error'
        });
        t.deepEqual(results, [{ error, status: 'error' }]);
    }
});

test('emit with function filter throws first error when there are no matching results', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error1));
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.reject(error2));

    const actualError = await t.throwsAsync(
        emitter.emit('a', undefined, {
            filter: result => result.status === 'success' && result.data === 'e'
        })
    );
    t.deepEqual(actualError, error1);
});

test('emit with success filter returns data of successful results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    const results = await emitter.emit('a', undefined, { filter: 'success' });
    t.deepEqual(results, [undefined, 'b', 'c', undefined]);
});

test('emit with success filter returns data of successful results even if they are all empty', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    const results = await emitter.emit('a', undefined, { filter: 'success' });
    t.deepEqual(results, [undefined, undefined]);
});

test('emit with success filter throws first error if there are no successful results', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.reject(error1));
    emitter.addListener('a', () => Promise.reject(error2));

    const actualError = await t.throwsAsync(
        emitter.emit('a', undefined, {
            filter: result => result.status === 'success' && result.data === 'e'
        })
    );
    t.deepEqual(actualError, error1);
});

test('emit with first filter returns data of first successful result if it is not empty', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error));
    emitter.addListener('a', () => Promise.resolve(undefined));

    const result = await emitter.emit('a', undefined, { filter: 'first' });
    t.is(result, 'b');
});

test('emit with first filter throws first error if data of first successful result is empty', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.resolve('b'));
    emitter.addListener('a', () => Promise.resolve('c'));
    emitter.addListener('a', () => Promise.reject(error1));
    emitter.addListener('a', () => Promise.resolve(undefined));
    emitter.addListener('a', () => Promise.reject(error2));

    const actualError = await t.throwsAsync(
        emitter.emit('a', undefined, {
            filter: result => result.status === 'success' && result.data === 'e'
        })
    );
    t.deepEqual(actualError, error1);
});

test('emit with first filter throws if there are no successful results', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const emitter = new ServiceEventEmitter({ eventList: { a: 'a' } });
    emitter.addListener('a', () => Promise.reject(error1));
    emitter.addListener('a', () => Promise.reject(error2));

    const actualError = await t.throwsAsync(
        emitter.emit('a', undefined, {
            filter: result => result.status === 'success' && result.data === 'e'
        })
    );
    t.deepEqual(actualError, error1);
});

test('filterEventResults without filter returns all results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    const results = await emitter.filterEventResults(originalResults);
    t.deepEqual(results, originalResults);
});

test('filterEventResults with unsupported filter returns all results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    // Checking correct handling of unsupported filter value when called from old JS code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await emitter.filterEventResults(originalResults, 'unsupported' as any);
    t.deepEqual(results, originalResults);
});

test('filterEventResults with function filter returns filtered results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    {
        const results = await emitter.filterEventResults(originalResults, () => true);
        t.deepEqual(results, [
            { data: undefined, status: 'success' },
            { data: 'b', status: 'success' },
            { data: 'c', status: 'success' },
            { error, status: 'error' },
            { data: undefined, status: 'success' }
        ]);
    }
    {
        const results = await emitter.filterEventResults(
            originalResults,
            result => result.status === 'success'
        );
        t.deepEqual(results, [
            { data: undefined, status: 'success' },
            { data: 'b', status: 'success' },
            { data: 'c', status: 'success' },
            { data: undefined, status: 'success' }
        ]);
    }
    {
        const results = await emitter.filterEventResults(
            originalResults,
            result => result.status === 'success' && result.data === 'b'
        );
        t.deepEqual(results, [{ data: 'b', status: 'success' }]);
    }
    {
        const results = await emitter.filterEventResults(
            originalResults,
            result => result.status === 'error'
        );
        t.deepEqual(results, [{ error, status: 'error' }]);
    }
});

test('filterEventResults with success filter returns data of successful results', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    const results = await emitter.filterEventResults(originalResults, 'success');
    t.deepEqual(results, [undefined, 'b', 'c', undefined]);
});

test('filterEventResults with success filter returns data of successful results even if they is all empty', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { data: undefined, status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    const results = await emitter.filterEventResults(originalResults, 'success');
    t.deepEqual(results, [undefined, undefined]);
});

test('filterEventResults with success filter returns empty array if there are no successful results', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const originalResults = [
        { error: error1, status: 'error' },
        { error: error2, status: 'error' }
    ] as const;
    const emitter = new ServiceEventEmitter({ eventList: {} });

    const results = await emitter.filterEventResults(originalResults, 'success');
    t.deepEqual(results, []);
});

test('filterEventResults with first filter returns data of first successful result if it is not emty', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { error, status: 'error' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    const result = await emitter.filterEventResults(originalResults, 'first');
    t.deepEqual(result, ['b']);
});

test('filterEventResults with first filter returns empty array if first successful result is empty', async t => {
    const error = new Error('d');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { error, status: 'error' },
        { data: undefined, status: 'success' },
        { data: 'b', status: 'success' },
        { data: 'c', status: 'success' },
        { error, status: 'error' },
        { data: undefined, status: 'success' }
    ] as const;

    const result = await emitter.filterEventResults(originalResults, 'first');
    t.deepEqual(result, []);
});

test('filterEventResults with first filter returns empty array if there are no successful results', async t => {
    const error1 = new Error('d');
    const error2 = new Error('e');
    const emitter = new ServiceEventEmitter({ eventList: {} });
    const originalResults = [
        { error: error1, status: 'error' },
        { error: error2, status: 'error' }
    ] as const;

    const result = await emitter.filterEventResults(originalResults, 'first');
    t.deepEqual(result, []);
});
