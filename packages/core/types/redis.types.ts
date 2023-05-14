/**
 * Represents a Redis client.
 */
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<boolean>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  sadd(key: string, ...members: string[]): Promise<number>;
  hset(key: string, field: string, value: string | number): Promise<void>;
  flushdb(): Promise<void>;
  pipeline(): RedisPipeline;
}

/**
 * Represents a pipeline for executing multiple Redis commands.
 */
export interface RedisPipeline {
  set(key: string, value: string): RedisPipeline;
  expire(key: string, seconds: number): RedisPipeline;
  sadd(key: string, ...members: string[]): RedisPipeline;
  hset(key: string, field: string, value: string | number): RedisPipeline;
  exec(): Promise<[Error | null, any[]]>;
}
