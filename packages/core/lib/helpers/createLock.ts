import {
  ILockProvider,
  LockProviderOptions,
  MongoClient,
  ProviderType,
  RedisClient
} from 'packages/core/types';
import { FileSystemLockProvider } from '../fs';
import { MemoryLockProvider } from '../memory';
import MongoDBLockProvider from '../mongo/LockProvider';
import { RedisLockProvider } from '../redis';

/**
 * Creates a lock provider.
 * @param providerType - The type of lock provider to create.
 * @param options - The options to use when creating the lock provider.
 * @returns The lock provider.
 */
function createLock<T extends ProviderType>(
  providerType: T,
  options?: LockProviderOptions<T>
): ILockProvider {
  switch (providerType) {
    case 'memory':
      return new MemoryLockProvider();
    case 'fs':
      return new FileSystemLockProvider((options as unknown as { cachePath: string }).cachePath);
    case 'redis':
      return new RedisLockProvider(
        (options as unknown as { redisClient: RedisClient }).redisClient
      );
    case 'mongo':
      return new MongoDBLockProvider(
        (options as unknown as { mongoClient: MongoClient }).mongoClient,
        (options as unknown as { dbName: string }).dbName,
        (options as unknown as { collectionName: string }).collectionName
      );
    default:
      throw new Error(`Invalid lock provider type: ${providerType}`);
  }
}

export default createLock;
