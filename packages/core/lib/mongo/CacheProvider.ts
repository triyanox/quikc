import { CacheOptions, CacheProvider, CacheStats, ILockProvider, MongoClient } from '../../types';

/**
 * MongoDB cache provider.
 */
class MongoDBCacheProvider implements CacheProvider {
  private db: any;
  private collection: any;
  private lockProvider?: ILockProvider;
  private stats: CacheStats;

  constructor(mongoClient: MongoClient, dbName: string, collectionName: string) {
    this.stats = { hits: 0, misses: 0, hitRate: 0 };
    this.connect(mongoClient, dbName, collectionName);
  }

  private async connect(
    mongoClient: MongoClient,
    dbName: string,
    collectionName: string
  ): Promise<void> {
    try {
      await mongoClient.connect();
      this.db = mongoClient.db(dbName);
      this.collection = this.db.collection(collectionName);
      await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  async get(key: string): Promise<unknown | undefined> {
    const entry = await this.collection.findOne({ _id: key });
    if (!entry || entry.expiresAt < new Date()) {
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl ?? 0;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const dependencies = options?.dependencies;
    const priority = options?.priority;
    const lockTimeout = options?.lockTimeout;

    const entry = {
      _id: key,
      value,
      expiresAt,
      dependencies,
      priority,
      locked: false
    };

    if (lockTimeout && this.lockProvider) {
      const lockAcquired = await this.lockProvider.acquireLock(key, lockTimeout);
      if (!lockAcquired) {
        return;
      }
      entry.locked = true;
    }

    await this.collection.replaceOne({ _id: key }, entry, { upsert: true });
  }

  async del(key: string): Promise<void> {
    await this.collection.deleteOne({ _id: key });
  }

  async clear(): Promise<void> {
    await this.collection.drop();
  }

  getStats(): CacheStats {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses);
    this.stats.hitRate = isNaN(hitRate) ? 0 : hitRate;
    return { ...this.stats };
  }

  setLockProvider(lockProvider: ILockProvider): void {
    this.lockProvider = lockProvider;
  }

  withLockProvider(lockProvider: ILockProvider): CacheProvider {
    this.setLockProvider(lockProvider);
    return this;
  }
}

export default MongoDBCacheProvider;
