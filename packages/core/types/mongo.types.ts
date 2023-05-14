/**
 * Represents a MongoDB client.
 */
export interface MongoClient {
  connect(): Promise<void>;
  db(databaseName: string): any;
}
