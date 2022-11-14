"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const MemoryCache_1 = __importDefault(require("./MemoryCache"));
const sinon_1 = __importDefault(require("sinon"));
(0, ava_1.default)('MemoryCache calls function only once for given key', async (t) => {
    const method = sinon_1.default.spy();
    const key = 'KEY';
    const cache = new MemoryCache_1.default();
    await cache.withCache(key, method);
    await cache.withCache(key, method);
    await cache.withCache(key, method);
    t.true(method.calledOnce);
});
(0, ava_1.default)('MemoryCache drop single cache key', async (t) => {
    const method1 = sinon_1.default.spy();
    const method2 = sinon_1.default.spy();
    const cache = new MemoryCache_1.default();
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
(0, ava_1.default)('MemoryCache drop all cache keys', async (t) => {
    const method1 = sinon_1.default.spy();
    const method2 = sinon_1.default.spy();
    const cache = new MemoryCache_1.default();
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
