# `@quikc/express` - express middileware for Quikc a NodeJS caching library

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Advanced usage](#advanced-usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

`@quikc/express` is an express middleware for `@quikc/core` a Node.js caching library that supports multiple cache providers and pluggable lock providers. It is designed to be framework-agnostic and can be used in any Node.js application.

## Installation

`@quikc/express` contains an express middleware that can be used to cache responses. You can install it by running the following command:

```bash
npm install @quikc/core @quikc/express
# or
yarn add @quikc/core @quikc/express
```

## Usage

### Basic usage

You can use `@quikc/core` package to create you cache instance with the desired cache provider and then use the `@quikc/express` middleware to cache your responses.

```js
import express from 'express';
import { createStore } from '@quikc/core';
import { QuikcExpress } from '@quikc/express';

const app = express();

const cache = createStore('memory');

const quikc = new QuikcExpress({
    cache,
    getKey: req => req.path,
    shouldCache: (req, res) => req.method === 'GET' && res.statusCode === 200,
});

app.use(quikc.middleware);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
```

### Advanced usage

The `QuickExpress` class accepts the following options:

- `cache` - The cache instance created using `createStore` function from `@quikc/core` package.
- `getKey` - A function that accepts the express request object and returns the cache key.
- `shouldCache` - A function that accepts the express request and response objects and returns a boolean indicating whether the response should be cached or not.
- `cacheFallback` - A boolean indicating whether to serve the cached response if the request fails or not.
- `cacheFallbackTTL` - The TTL of the cached response in seconds.
- `cacheOptions` - An object containing the cache options. This object is passed to the cache provider.
  - `ttl` - The TTL of the cached response in seconds.
  - `dependencies` - An array of cache keys that the cached response depends on. If any of the dependencies is invalidated, the cached response will be invalidated as well.
  - `priority` - The priority of the cached response. The higher the priority, the more likely the cached response will be served.
  - `lockTimeout` - The lock timeout in milliseconds.

- `onError` - A function that accepts the express request and response objects and is called when an error occurs while serving the cached response.

- `onHit` - A function that accepts the express request and response objects and is called when a cached response is served.
- `onMiss` - A function that accepts the express request and response objects and is called when a cached response is not found.
- `onSkip` - A function that accepts the express request and response objects and is called when a response is not cached.
- `onStore` - A function that accepts the express request and response objects and is called when a response is stored in the cache.

## Contributing

Contributions are welcome! Please read the [contributing guide](https://github.com/triyanox/quikc/blob/main/CONTRIBUTING) for more information.

## License

[MIT](https://github.com/triyanox/quikc/blob/main/LICENSE)
