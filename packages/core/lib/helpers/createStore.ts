import { Redis } from 'ioredis';
import { CacheProvider, CacheProviderOptions, ProviderType } from '../../types';
import { FileSystemCacheProvider } from '../fs';
import { MemoryCacheProvider } from '../memory';
import { RedisCacheProvider } from '../redis';

/**
 * Creates a cache provider.
 * @param providerType - The type of lock provider to create.
 * @param options - The options to use when creating the lock provider.
 * @returns The lock provider.
 */
function createStore<T extends ProviderType>(
  providerType: T,
  options?: CacheProviderOptions<T>
): CacheProvider {
  switch (providerType) {
    case 'memory':
      return new MemoryCacheProvider();
    case 'fs':
      return new FileSystemCacheProvider((options as unknown as { cachePath: string }).cachePath);
    case 'redis':
      return new RedisCacheProvider((options as unknown as { redisClient: Redis }).redisClient);
    default:
      throw new Error(`Invalid lock provider type: ${providerType}`);
  }
}

export default createStore;
