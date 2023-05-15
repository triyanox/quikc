import fs from 'fs';
import { ILockProvider } from '../../types';

/**
 * A lock provider that uses the file system to store locks.
 */
class FileSystemLockProvider implements ILockProvider {
  private lockDir: string;

  constructor(lockDir: string) {
    this.lockDir = lockDir;
    fs.mkdirSync(lockDir, { recursive: true });
  }

  async acquireLock(key: string, timeout = 10): Promise<boolean> {
    const lockFilePath = `${this.lockDir}/${key}.lock`;
    const expiration = Date.now() + timeout * 1000;
    try {
      if (!fs.existsSync(lockFilePath)) {
        await fs.promises.writeFile(lockFilePath, expiration.toString(), 'utf8');
        return true;
      }
      const existingExpiration = parseInt(
        fs.existsSync(lockFilePath) ? fs.readFileSync(lockFilePath, 'utf8') : '0',
        10
      );
      if (existingExpiration < Date.now()) {
        fs.unlinkSync(lockFilePath);
        return this.acquireLock(key, timeout);
      }
      return false;
    } catch (error) {
      console.error(`Error acquiring lock for: ${key}`);
      console.error(error);
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

  async getLock(key: string): Promise<boolean> {
    const lockFilePath = `${this.lockDir}/${key}.lock`;
    const expiration = Date.now() + 10 * 1000;
    try {
      if (!fs.existsSync(lockFilePath)) {
        await fs.promises.writeFile(lockFilePath, expiration.toString(), 'utf8');
        return true;
      }
      const existingExpiration = parseInt(
        fs.existsSync(lockFilePath) ? fs.readFileSync(lockFilePath, 'utf8') : '0',
        10
      );
      if (existingExpiration < Date.now()) {
        fs.unlinkSync(lockFilePath);
        return this.getLock(key);
      }
      return false;
    } catch (error) {
      console.error(`Error acquiring lock for: ${key}`);
      console.error(error);
      return false;
    }
  }

  async clearLocks(): Promise<void> {
    try {
      fs.rmdirSync(this.lockDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to clear locks in: ${this.lockDir}`, error);
    }
  }
}

export default FileSystemLockProvider;
