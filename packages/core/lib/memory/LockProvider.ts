import { ILockProvider } from '../../types';

/**
 * A lock provider that uses memory to store locks.
 */
class MemoryLockProvider implements ILockProvider {
  private locks: Map<string, boolean>;

  constructor() {
    this.locks = new Map<string, boolean>();
  }

  async acquireLock(key: string, timeout?: number): Promise<boolean> {
    const lockTimeout = timeout ?? 0;
    const start = Date.now();

    while (true) {
      const lockAcquired = this.tryAcquireLock(key);
      if (lockAcquired) {
        return true;
      }

      if (timeout && Date.now() - start >= lockTimeout) {
        return false;
      }

      await this.sleep(10);
    }
  }

  private tryAcquireLock(key: string): boolean {
    if (!this.locks.has(key)) {
      this.locks.set(key, true);
      return true;
    }

    return false;
  }

  async releaseLock(key: string): Promise<void> {
    this.locks.delete(key);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getLock(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.locks.has(key)) {
        this.locks.set(key, true);
        resolve(true);
      }
      resolve(false);
    });
  }

  async clearLocks(): Promise<void> {
    return new Promise((resolve) => {
      this.locks.clear();
      resolve();
    });
  }
}

export default MemoryLockProvider;
