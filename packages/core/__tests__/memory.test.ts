import { MemoryCacheProvider, CacheStats, MemoryLockProvider } from '@quikc/core';

describe('MemoryCacheProvider', () => {
  let cacheProvider: MemoryCacheProvider;

  beforeEach(() => {
    cacheProvider = new MemoryCacheProvider();
  });

  afterEach(() => {
    cacheProvider.clear();
  });

  test('should be able to get a value after setting it', async () => {
    await cacheProvider.set('foo', 'bar');
    const result = await cacheProvider.get('foo');
    expect(result).toBe('bar');
  });

  test('should return undefined when getting a non-existent value', async () => {
    const result = await cacheProvider.get('non-existent-key');
    expect(result).toBeUndefined();
  });

  test('should return undefined when getting an expired value', async () => {
    await cacheProvider.set('foo', 'bar', { ttl: 0 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const result = await cacheProvider.get('foo');
    expect(result).toBeUndefined();
  });

  test('should return the correct hit rate', async () => {
    await cacheProvider.set('foo', 'bar', {
      ttl: 10
    });
    await cacheProvider.set('bar', 'bar', {
      ttl: 10
    });
    await cacheProvider.set('baz', 'bar', {
      ttl: 10
    });
    await cacheProvider.get('foo');
    await cacheProvider.get('bar');
    await cacheProvider.get('baz');
    await cacheProvider.del('baz');
    await cacheProvider.get('baz');
    const stats: CacheStats = cacheProvider.getStats();
    expect(stats.hits).toBe(3);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.75);
  });

  test('clear should remove all entries', async () => {
    await cacheProvider.set('foo', 'bar');
    await cacheProvider.set('baz', 'qux');
    await cacheProvider.clear();
    const result1 = await cacheProvider.get('foo');
    const result2 = await cacheProvider.get('baz');
    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });

  test('del should remove a specific entry', async () => {
    await cacheProvider.set('foo', 'bar');
    await cacheProvider.set('baz', 'qux');
    await cacheProvider.del('foo');
    const result1 = await cacheProvider.get('foo');
    const result2 = await cacheProvider.get('baz');
    expect(result1).toBeUndefined();
    expect(result2).toBe('qux');
  });

  test('set should set an entry with dependencies', async () => {
    await cacheProvider.set('foo', 'bar', { ttl: 10 });
    await cacheProvider.set('baz', 'qux', { dependencies: ['foo'], ttl: 10 });

    const result1 = await cacheProvider.get('baz');
    expect(result1).toBe('qux');

    await cacheProvider.del('foo');

    const result2 = await cacheProvider.get('baz');
    expect(result2).toBeUndefined();
  });

  test('set should set an entry with priority', async () => {
    await cacheProvider.set('foo', 'bar', { priority: 10, ttl: 1 });
    await cacheProvider.set('baz', 'qux', { priority: 5, ttl: 1 });
    await cacheProvider.set('quux', 'corge', { priority: 15, ttl: 1 });
    const result1 = await cacheProvider.get('foo');
    const result2 = await cacheProvider.get('baz');
    const result3 = await cacheProvider.get('quux');
    expect(result1).toBe('bar');
    expect(result2).toBe('qux');
    expect(result3).toBe('corge');
  });

  test('set should set an entry with lock', async () => {
    const lockProvider = new MemoryLockProvider();
    cacheProvider.setLockProvider(lockProvider);

    const key = 'foo';
    const value = 'bar';

    await cacheProvider.set(key, value);

    const cachedValue = await cacheProvider.get(key);
    expect(cachedValue).toBe(value);

    const lock = await lockProvider.getLock(key);
    expect(lock).toBeDefined();
    expect(lock).toBe(true);
  });
});
