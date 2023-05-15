import { ILockProvider, RedisClient } from '../../types';

/**
 * redis lock provider.
 */
class RedisLockProvider implements ILockProvider {
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient) {
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

      await this.sleep(10);
    }
  }

  private async tryAcquireLock(key: string): Promise<boolean> {
    const lockAcquired = await this.redisClient.set(key, 'locked', 'NX');
    return lockAcquired;
  }

  async releaseLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default RedisLockProvider;
