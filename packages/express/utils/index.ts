import { MemoryCacheProvider, MemoryLockProvider } from '@quikc/core';
import express from 'express';
import request from 'supertest';
import QuikcExpress from '../lib';

const app = express();

const cache = new MemoryCacheProvider();
const lock = new MemoryLockProvider();
cache.setLockProvider(lock);

app.get(
  '/api/slow',
  new QuikcExpress({
    cache,
    getKey: (req) => req.path,
    shouldCache: (req, res) => req.method === 'GET' && res.statusCode === 200,
    cacheFallback: true,
    cacheFallbackTTL: 60,
    cacheOptions: {
      ttl: 60,
      dependencies: ['/api/fast'],
      lockTimeout: 1000,
      priority: 10
    }
  }).middleware(),
  (_req, res) => {
    setTimeout(() => {
      res.json({
        message: 'Hello from slow route!',
        data: {
          foo: 'bar'
        }
      });
    }, 2000);
  }
);

app.get(
  '/api/fast',
  new QuikcExpress({
    cache,
    getKey: (req) => req.path,
    shouldCache: (req, res) => req.method === 'GET' && res.statusCode === 200,
    cacheFallback: true,
    cacheFallbackTTL: 60,
    cacheOptions: {
      ttl: 60,
      dependencies: ['/api/slow'],
      lockTimeout: 10,
      priority: 1
    }
  }).middleware(),
  (_req, res) => {
    res.json({
      message: 'Hello from fast route!',
      data: {
        foo: 'bar'
      }
    });
  }
);

const server = request(app);
export default server;
