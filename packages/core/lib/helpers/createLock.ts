import { Redis } from 'ioredis';
import { ILockProvider, LockProviderOptions, ProviderType } from '../../types';
import { FileSystemLockProvider } from '../fs';
import { MemoryLockProvider } from '../memory';
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
      return new FileSystemLockProvider((options as unknown as { lockPath: string }).lockPath);
    case 'redis':
      return new RedisLockProvider((options as unknown as { redisClient: Redis }).redisClient);
    default:
      throw new Error(`Invalid lock provider type: ${providerType}`);
  }
}

export default createLock;
