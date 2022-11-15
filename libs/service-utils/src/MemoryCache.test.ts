import test from 'ava';
import { MemoryCache } from './MemoryCache';
import sinon from 'sinon';

test('MemoryCache calls function only once for given key', async t => {
    const method = sinon.spy();
    const key = 'KEY';
    const cache = new MemoryCache();
    await cache.withCache(key, method);
    await cache.withCache(key, method);
    await cache.withCache(key, method);
    t.true(method.calledOnce);
});

test('MemoryCache drop single cache key', async t => {
    const method1 = sinon.spy();
    const method2 = sinon.spy();

    const cache = new MemoryCache();
    await cache.withCache('key-1', method1);
    await cache.withCache('key-2', method2);
    cache.drop('key-1');
    await cache.withCache('key-1', method1);
    await cache.withCache('key-1', method1);
    await cache.withCache('key-2', method2);
    await cache.withCache('key-2', method2);

    t.true(method1.calledTwice);
    t.true(method2.calledOnce);
});

test('MemoryCache drop all cache keys', async t => {
    const method1 = sinon.spy();
    const method2 = sinon.spy();

    const cache = new MemoryCache();
    await cache.withCache('key-1', method1);
    await cache.withCache('key-2', method2);
    cache.dropAll();
    await cache.withCache('key-1', method1);
    await cache.withCache('key-1', method1);
    await cache.withCache('key-2', method2);
    await cache.withCache('key-2', method2);

    t.true(method1.calledTwice);
    t.true(method2.calledTwice);
});
