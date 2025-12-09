import { createServer } from '../src/server';
import request from 'supertest';

describe('Express server', () => {
  it('returns ok on /health', async () => {
    const app = createServer();

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
