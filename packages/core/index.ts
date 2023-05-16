import {
  FileSystemCacheProvider,
  FileSystemLockProvider,
  MemoryCacheProvider,
  MemoryLockProvider,
  RedisCacheProvider,
  RedisLockProvider,
  createLock,
  createStore
} from './lib/index';

import type {
  CacheEntry,
  CacheOptions,
  CacheProvider,
  CacheProviderOptions,
  CacheStats,
  ILockProvider,
  LockProviderOptions,
  ProviderType
} from './types/index';

export {
  FileSystemCacheProvider,
  FileSystemLockProvider,
  MemoryCacheProvider,
  MemoryLockProvider,
  RedisCacheProvider,
  RedisLockProvider,
  createLock,
  createStore
};

export type {
  CacheEntry,
  CacheOptions,
  CacheProvider,
  CacheProviderOptions,
  CacheStats,
  ILockProvider,
  LockProviderOptions,
  ProviderType
};
