import { CacheOptions, CacheProvider } from '@quikc/core';
import { NextFunction, Request, Response } from 'express';
import { QuikcExpressCacheMiddlewareOptions, QuikcExpressMiddlewareFunction } from '../types';

/**
 * Express middleware that provides caching functionality.
 */
class QuikcExpress {
  private readonly cache: CacheProvider;
  private readonly getKey: (req: Request, res: Response) => string;
  private readonly shouldCache: (req: Request, res: Response) => boolean;
  private readonly cacheOptions?: CacheOptions;
  private readonly cacheFallback?: boolean;
  private readonly cacheFallbackTTL?: number;
  private readonly onError?: (err: Error) => void;
  private readonly onHit?: (req: Request, res: Response) => void;
  private readonly onMiss?: (req: Request, res: Response) => void;
  private readonly onSkip?: (req: Request, res: Response) => void;
  private readonly onStore?: (req: Request, res: Response) => void;

  /**
   * Creates a new instance of the Express cache middleware.
   * @param options Options for configuring the Express cache middleware.
   */
  constructor(options: QuikcExpressCacheMiddlewareOptions) {
    this.cache = options.cache;
    this.getKey = options.getKey;
    this.shouldCache =
      options.shouldCache ?? ((req, res) => req.method === 'GET' && res.statusCode === 200);
    this.cacheOptions = options.cacheOptions;
    this.cacheFallback = options.cacheFallback;
    this.cacheFallbackTTL = options.cacheFallbackTTL;
    this.onError = options.onError;
    this.onHit = options.onHit;
    this.onMiss = options.onMiss;
    this.onSkip = options.onSkip;
    this.onStore = options.onStore;
  }

  /**
   * Gets the Express middleware function.
   */
  middleware(): QuikcExpressMiddlewareFunction {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.shouldCache(req, res)) {
        this.onSkip?.(req, res);
        return next();
      }

      const key = this.getKey(req, res);
      const cachedValue = await this.cache.get(key);

      if (cachedValue !== undefined) {
        this.onHit?.(req, res);
        res.send(cachedValue);
      } else {
        const originalSend = res.send.bind(res);
        res.send = (async (body: unknown) => {
          this.onStore?.(req, res);
          await this.cache.set(key, body, this.cacheOptions);
          originalSend(body);
        }) as any;
        if (this.cacheFallback) {
          res.on('error', async (err) => {
            this.onError?.(err);
            if (this.cacheFallbackTTL !== undefined) {
              await this.cache.set(key, cachedValue, { ttl: this.cacheFallbackTTL });
            }
          });
        }
        this.onMiss?.(req, res);
        next();
      }
    };
  }
}

export default QuikcExpress;
export type { QuikcExpressCacheMiddlewareOptions, QuikcExpressMiddlewareFunction };
