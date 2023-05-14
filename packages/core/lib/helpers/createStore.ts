import {
  CacheProvider,
  CacheProviderOptions,
  MongoClient,
  ProviderType,
  RedisClient
} from 'packages/core/types';
import { FileSystemCacheProvider } from '../fs';
import { MemoryCacheProvider } from '../memory';
import { MongoCacheProvider } from '../mongo';
import { RedisCacheProvider } from '../redis';

/**
 *
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
      return new RedisCacheProvider(
        (options as unknown as { redisClient: RedisClient }).redisClient
      );
    case 'mongo':
      return new MongoCacheProvider(
        (options as unknown as { mongoClient: MongoClient }).mongoClient,
        (options as unknown as { dbName: string }).dbName,
        (options as unknown as { collectionName: string }).collectionName
      );
    default:
      throw new Error(`Invalid lock provider type: ${providerType}`);
  }
}

export default createStore;
