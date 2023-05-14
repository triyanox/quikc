import { ILockProvider, MongoClient } from 'packages/core/types';

/**
 * A lock provider that uses MongoDB to store locks.
 */
class MongoDBLockProvider implements ILockProvider {
  private db: any;
  private collection: any;

  constructor(mongoClient: MongoClient, dbName: string, collectionName: string) {
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

  async acquireLock(key: string, timeout?: number): Promise<boolean> {
    const expiration = new Date(Date.now() + (timeout || 10) * 1000);

    try {
      const result = await this.collection.updateOne(
        { _id: key, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $lt: new Date() } }] },
        { $set: { expiresAt: expiration } },
        { upsert: true }
      );

      return result.modifiedCount === 1;
    } catch (error: any) {
      if (error.code === 11000) {
        console.error(`Failed to acquire lock for key '${key}'. It is already locked.`);
        return false;
      }
      console.error(`Failed to acquire lock for key '${key}':`, error);
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    await this.collection.deleteOne({ _id: key });
  }
}

export default MongoDBLockProvider;
