import server from '../utils';

describe('express', () => {
  it('should cache a slow route', async () => {
    const res = await server.get('/api/slow');
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Hello from slow route!');
    expect(res.body.data.foo).toEqual('bar');
  }, 10000);

  it('should cache a fast route', async () => {
    const res = await server.get('/api/fast');
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual('Hello from fast route!');
    expect(res.body.data.foo).toEqual('bar');
  }, 10000);
});
