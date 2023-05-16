import { FileSystemCacheProvider, FileSystemLockProvider } from './fs';
import { createLock, createStore } from './helpers';
import { MemoryCacheProvider, MemoryLockProvider } from './memory';
import { RedisCacheProvider, RedisLockProvider } from './redis';

import {
  CacheEntry,
  CacheOptions,
  CacheProvider,
  CacheProviderOptions,
  CacheStats,
  ILockProvider,
  LockProviderOptions,
  ProviderType
} from '../types';

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
