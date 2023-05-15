import { FileSystemCacheProvider, FileSystemLockProvider } from '@quikc/core';
import fs from 'fs';

import EventEmitter from 'events';
const emitter = new EventEmitter();

emitter.setMaxListeners(20);

describe('FileSystemCacheProvider', () => {
  const cachePath = './test-cache';
  let cacheProvider: FileSystemCacheProvider;

  beforeEach(() => {
    cacheProvider = new FileSystemCacheProvider(cachePath);
    cacheProvider.clear();
  });

  afterAll(() => {
    return fs.rm(cachePath, { recursive: true } as fs.RmOptions, (error) => {
      if (error) {
        console.error('Failed to delete test cache directory:', error);
      }
    });
  });

  describe('get and set', () => {
    it('should be able to get a value after setting it', async () => {
      await cacheProvider.set('foo', 'bar', {
        ttl: 1
      });
      const result = await cacheProvider.get('foo');
      expect(result).toBe('bar');
    });

    it('should return undefined if the key is not found', async () => {
      const result = await cacheProvider.get('baz');
      expect(result).toBeUndefined();
    });

    it('should return undefined if the key has expired', async () => {
      await cacheProvider.set('foo', 'bar', { ttl: 1 });
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const result = await cacheProvider.get('foo');
      expect(result).toBeUndefined();
    });

    it('should be able to set a value with dependencies', async () => {
      await cacheProvider.set('foo', 'bar');
      await cacheProvider.set('baz', 'qux', {
        dependencies: ['foo'],
        ttl: 1
      });
      const result = await cacheProvider.get('baz');
      expect(result).toBe('qux');
    });

    it('should be able to set a value with priority', async () => {
      await cacheProvider.set('foo', 'bar');
      await cacheProvider.set('baz', 'qux', { priority: 1, ttl: 1 });
      const result = await cacheProvider.get('baz');
      expect(result).toBe('qux');
    });
  });

  describe('del', () => {
    it('should be able to delete an existing key', async () => {
      await cacheProvider.set('foo', 'bar');
      await cacheProvider.del('foo');
      const result = await cacheProvider.get('foo');
      expect(result).toBeUndefined();
    });

    it('should not throw an error if the key does not exist', async () => {
      await expect(cacheProvider.del('foo')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should be able to clear the cache', async () => {
      await cacheProvider.set('foo', 'bar');
      await cacheProvider.clear();
      const result = await cacheProvider.get('foo');
      expect(result).toBeUndefined();
    });
  });
});

describe('FileSystemLockProvider', () => {
  const lockDir = './test/locks';
  const lockProvider = new FileSystemLockProvider(lockDir);

  beforeEach(() => {
    fs.mkdirSync(lockDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(lockDir, { recursive: true });
  });

  test('acquireLock acquires a lock successfully', async () => {
    const key = 'test-key';
    const result = await lockProvider.acquireLock(key);
    expect(result).toBe(true);
    const filePath = `${lockDir}/${key}.lock`;
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('acquireLock returns false if lock is already acquired', async () => {
    const key = 'test-key';
    const timeout = 5;
    const firstResult = await lockProvider.acquireLock(key, timeout);
    expect(firstResult).toBe(true);
    const secondResult = await lockProvider.acquireLock(key, timeout);
    expect(secondResult).toBe(false);
  });

  test('acquireLock re-acquires a lock if it has expired', async () => {
    const key = 'test-key';
    const timeout = 1;
    const firstResult = await lockProvider.acquireLock(key, timeout);
    expect(firstResult).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, timeout * 1000));
    const secondResult = await lockProvider.acquireLock(key, timeout);
    expect(secondResult).toBe(true);
  });

  test('releaseLock releases a lock successfully', async () => {
    const key = 'test-key';
    await lockProvider.acquireLock(key);
    const filePath = `${lockDir}/${key}.lock`;
    expect(fs.existsSync(filePath)).toBe(true);
    await lockProvider.releaseLock(key);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('releaseLock does not throw an error if lock file does not exist', async () => {
    const key = 'test-key';
    await lockProvider.releaseLock(key);
    const filePath = `${lockDir}/${key}.lock`;
    expect(fs.existsSync(filePath)).toBe(false);
  });
});
