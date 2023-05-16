# `@quikc/core` - Core package for Quikc a NodeJS caching library

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Available strategies](#available-strategies)
- [Creating a cache instance](#creating-a-cache-instance)
  - [Memory Cache provider](#memory-cache-provider)
  - [File system Cache provider](#file-system-cache-provider)
  - [Redis Cache provider](#redis-cache-provider)
- [Using the cache instance](#using-the-cache-instance)
- [Lock providers](#lock-providers)
  - [Memory Lock provider](#memory-lock-provider)
  - [Redis Lock provider](#redis-lock-provider)
  - [File system Lock provider](#file-system-lock-provider)
  - [Using the lock instance](#using-the-lock-instance)
- [Contributing](#contributing)
- [License](#license)

## Introduction

`@quikc/core` is a Node.js caching library that supports multiple cache providers and pluggable lock providers. It is designed to be framework-agnostic and can be used in any Node.js application.

## Installation

`@quikc/core` is not framwork specific and can be used in any Node.js application.
you can install it by running the following command:

```bash
npm install @quikc/core
# or
yarn add @quikc/core
```

## Available strategies

You can use one of the following strategies:

- `memory` - In-memory cache
- `fs` - File system cache
- `redis` - Redis cache

For the redis strategy, the cache provider utilizes ioredis under the hood. You can install it by running the following command:

```bash
npm install ioredis
# or
yarn add ioredis
```

## Creating a cache instance

### Memory Cache provider

You can use the memory cache provider by passing the `memory` strategy to the `createStore` function or by creating a new instance of the `MemoryCacheProvider` class.

```js
import { createStore, MemoryCacheProvider } from '@quikc/core';

// Using the createStore function
const cache = createStore('memory');

// Using the MemoryCacheProvider class
const cache = new MemoryCacheProvider();
```

### File system Cache provider

You can use the file system cache provider by passing the `fs` strategy to the `createStore` function or by creating a new instance of the `FileSystemCacheProvider` class.

```js
import { createStore, FileSystemCacheProvider } from '@quikc/core';

// Using the createStore function
const cache = createStore('fs',{
  // The path to the cache directory
  cachePath: './cache'
});

// Using the FileSystemCacheProvider class
const cache = new FileSystemCacheProvider('./cache');
```

### Redis Cache provider

You can use the redis cache provider by passing the `redis` strategy to the `createStore` function or by creating a new instance of the `RedisCacheProvider` class.

```js
import { createStore, RedisCacheProvider } from '@quikc/core';
import { Redis } from 'ioredis';

// Using the createStore function
const cache = createStore('redis',{
  // The redis client instance
  redisClient: new Redis({
    host: 'localhost',
    port: 6379
  })
});

// Using the RedisCacheProvider class
const cache = new RedisCacheProvider(new Redis({
  host: 'localhost',
  port: 6379
}));
```

## Using the cache instance

The cache instance exposes the following methods:

- `get(key: string): Promise<unknown | undefined>` - Gets the cached value associated with the specified key.
- `set(key: string, value: unknown, options?: CacheOptions): Promise<void>` - Stores a value in the cache using the specified key.
- `del(key: string): Promise<void>` - Removes the cache entry associated with the specified key.
- `clear(): Promise<void>` - Clears all cached entries from the cache.
- `getStats(): CacheStats` - Retrieves cache statistics including hits, misses, and hit rate.
- `setLockProvider(lockProvider: ILockProvider): void` - Sets a lock provider to handle cache locking.
- `getDependentKeys(key: string): Promise<string[] | undefined>` - Gets the dependent keys for the specified key.
- `delDependentKeys(keys: string[]): Promise<void>` - Deletes the dependent keys for the specified key.

`CacheOptions` is an interface that defines the options that can be passed to the `set` method of a cache provider. Here is the list of available options:

- `ttl`: The time-to-live (TTL) for the cached value, in seconds.
- `dependencies`: An array of keys for other cached values that the current value depends on. If any of these dependent keys are deleted or updated, the current value will also be invalidated.
- `priority`: A number indicating the priority of the cached value, relative to other cached values. Higher-priority values will be retained in cache longer than lower-priority values, even if their TTLs have expired.
- `lockTimeout`: The maximum amount of time to wait for a lock when setting the cached value. If this timeout is exceeded, the set operation will fail.

And the `CacheEntry` interface defines the structure of a cached value:

```ts
interface CacheEntry {
  value: unknown;
  expiresAt: number;
  dependencies?: string[];
  priority?: number;
  locked?: number;
}
```

- `value`: The value of the cache entry.
- `expiresAt`: The time at which the cache entry expires.
- `dependencies`: An optional array of cache entry dependencies.
- `priority`: An optional priority value for the cache entry.
- `locked`: An optional timeout value for acquiring a lock on the cache entry.

## Lock providers

Locks are used to prevent multiple concurrent writes to the same cache key, which can result in inconsistent or invalid cached data. Quikc supports pluggable lock providers that can be used to configure how locks are managed.

### Memory Lock provider

You can use the memory lock provider by passing the `memory` strategy to the `createLock` function or by creating a new instance of the `MemoryLockProvider` class.

```ts
import { createLock, MemoryLockProvider } from '@quikc/core';

// Using the createLock function
const lock = createLock('memory');

// Using the MemoryLockProvider class
const lock = new MemoryLockProvider();
```

### Redis Lock provider

You can use the redis lock provider by passing the `redis` strategy to the `createLock` function or by creating a new instance of the `RedisLockProvider` class.

```ts
import { createLock, RedisLockProvider } from '@quikc/core';
import { Redis } from 'ioredis';

// Using the createLock function
const lock = createLock('redis',{
  // The redis client instance
  redisClient: new Redis({
    host: 'localhost',
    port: 6379
  })
});

// Using the RedisLockProvider class
const lock = new RedisLockProvider(new Redis({
  host: 'localhost',
  port: 6379
}));
```

## File system Lock provider

You can use the file system lock provider by passing the `fs` strategy to the `createLock` function or by creating a new instance of the `FileSystemLockProvider` class.

```ts
import { createLock, FileSystemLockProvider } from '@quikc/core';

// Using the createLock function
const lock = createLock('fs',{
  // The path to the lock directory
  lockPath: './lock'
});

// Using the FileSystemLockProvider class
const lock = new FileSystemLockProvider('./lock');
```

## Using the lock instance

The lock instance exposes the following methods:

- `acquireLock(key: string, timeout?: number): Promise<boolean>`: Acquires a lock on the specified cache entry.
- `releaseLock(key: string): Promise<void>`: Releases the lock on the specified cache entry.
- `clearLocks(): Promise<void>`: Clears all locks. This method is intended for testing purposes only.
- `getLock(key: string): Promise<boolean | undefined>`: Returns a Promise that resolves to `true` if the lock is successfully acquired, or `false` otherwise.

and you can use the `setLockProvider` method of the cache instance to set the lock provider:

```js
import { createStore, createLock, MemoryCacheProvider, MemoryLockProvider } from '@quikc/core';

const cache = createStore('memory');

// Using the createLock function
const lock = createLock('memory');

// Using the MemoryLockProvider class
const lock = new MemoryLockProvider();

cache.setLockProvider(lock);
```

## Contributing

Contributions are welcome! Please read the [contributing guide](https://github.com/triyanox/quikc/blob/main/CONTRIBUTING) for more information.

## License

[MIT](https://github.com/triyanox/quikc/blob/main/LICENSE)
