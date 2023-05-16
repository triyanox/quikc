import { CacheOptions, CacheProvider } from '@quikc/core';
import { NextFunction, Request, Response } from 'express';

/**
 * Represents an Express middleware function.
 */
interface QuikcExpressMiddlewareFunction {
  /**
   * Executes the Express middleware function.
   * @param req The Express Request object.
   * @param res The Express Response object.
   * @param next The next middleware function in the chain.
   */
  (req: Request, res: Response, next: NextFunction): void;
}

/**
 * Options for configuring the Express cache middleware.
 */
interface QuikcExpressCacheMiddlewareOptions {
  /**
   * The cache provider to use.
   */
  cache: CacheProvider;

  /**
   * A function that generates a cache key based on the request and response objects.
   * @param req The Express Request object.
   * @param res The Express Response object.
   * @returns The cache key generated based on the request and response.
   */
  getKey: (req: Request, res: Response) => string;

  /**
   * A function that determines whether a response can be cached.
   * Defaults to only caching successful GET requests.
   * @param req The Express Request object.
   * @param res The Express Response object.
   * @returns A boolean indicating whether the response can be cached.
   */
  shouldCache?: (req: Request, res: Response) => boolean;

  /**
   * Additional cache options for setting cache entries.
   */
  cacheOptions?: CacheOptions;

  /**
   * Enables fallback to cache when an error occurs during response processing.
   */
  cacheFallback?: boolean;

  /**
   * Time-to-live (TTL) for the fallback cache entry.
   */
  cacheFallbackTTL?: number;

  /**
   * A function that is called when an error occurs during response processing.
   * @param err The error that occurred.
   * @returns A Promise that resolves when the error is handled.
   */
  onError?: (err: Error) => void;

  /**
   * A function that is called when a cache entry is successfully stored.
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A Promise that resolves when the cache entry is successfully stored.
   * @remarks This function is called when the `shouldCache` function returns `true`.
   */
  onHit?: (req: Request, res: Response) => void;

  /**
   * A function that is called when a cache entry is not found.
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A Promise that resolves when the cache entry is not found.
   * @remarks This function is called when the `shouldCache` function returns `true`.
   */
  onMiss?: (req: Request, res: Response) => void;

  /**
   * A function that is called when a cache entry is skipped.
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A Promise that resolves when the cache entry is skipped.
   * @remarks This function is called when the `shouldCache` function returns `false`.
   */
  onSkip?: (req: Request, res: Response) => void;

  /**
   * A function that is called when a cache entry is successfully stored.
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A Promise that resolves when the cache entry is successfully stored.
   * @remarks This function is called when the `shouldCache` function returns `true`.
   */
  onStore?: (req: Request, res: Response) => void;
}

export type { QuikcExpressCacheMiddlewareOptions, QuikcExpressMiddlewareFunction };
