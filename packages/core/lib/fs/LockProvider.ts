import fs from 'fs';
import { ILockProvider } from 'packages/core/types';

/**
 * A lock provider that uses the file system to store locks.
 */
class FileSystemLockProvider implements ILockProvider {
  private lockDir: string;

  constructor(lockDir: string) {
    this.lockDir = lockDir;
    fs.mkdirSync(lockDir, { recursive: true });
  }

  async acquireLock(key: string, timeout?: number): Promise<boolean> {
    const lockFilePath = `${this.lockDir}/${key}.lock`;
    const expiration = Date.now() + (timeout || 10) * 1000;

    try {
      fs.writeFileSync(lockFilePath, expiration.toString(), { flag: 'wx' });
      return true;
    } catch (error) {
      const existingExpiration = parseInt(fs.readFileSync(lockFilePath, 'utf8'));
      if (existingExpiration < Date.now()) {
        fs.unlinkSync(lockFilePath);
        return this.acquireLock(key, timeout);
      }
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    const lockFilePath = `${this.lockDir}/${key}.lock`;

    try {
      fs.unlinkSync(lockFilePath);
    } catch (error) {
      console.error(`Failed to release lock file: ${lockFilePath}`, error);
    }
  }
}

export default FileSystemLockProvider;
