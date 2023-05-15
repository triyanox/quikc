import { ILockProvider } from '../../types';
import { Redis } from 'ioredis';

/**
 * redis lock provider.
 */
class RedisLockProvider implements ILockProvider {
  private redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async acquireLock(key: string, timeout?: number): Promise<boolean> {
    const lockTimeout = timeout ?? 0;
    const start = Date.now();

    while (true) {
      const lockAcquired = await this.tryAcquireLock(key);
      if (lockAcquired) {
        return true;
      }

      if (timeout && Date.now() - start >= lockTimeout) {
        return false;
      }

      await RedisLockProvider.sleep(10);
    }
  }

  private async tryAcquireLock(key: string): Promise<boolean> {
    const lockAcquired = await this.redisClient.set(key, 'locked', 'NX');
    return lockAcquired === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async clearLocks(): Promise<void> {
    await this.redisClient.flushdb();
  }

  async getLock(key: string): Promise<boolean | undefined> {
    const lockAcquired = await this.redisClient.set(key, 'locked', 'NX');
    return lockAcquired === 'OK';
  }
}

export default RedisLockProvider;
