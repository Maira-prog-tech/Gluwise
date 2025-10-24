import request from 'supertest';
import express from 'express';
import { healthRouter } from '../routes/health';

const app = express();
app.use('/api/v1/health', healthRouter);

describe('Health Endpoint', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'healthy');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('version');
  });

  it('should include service status', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data).toHaveProperty('services');
    expect(response.body.data.services).toHaveProperty('database');
    expect(response.body.data.services).toHaveProperty('gemini');
    expect(response.body.data.services).toHaveProperty('vision');
    expect(response.body.data.services).toHaveProperty('usda');
  });

  it('should include memory information', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data).toHaveProperty('memory');
    expect(response.body.data.memory).toHaveProperty('used');
    expect(response.body.data.memory).toHaveProperty('total');
    expect(response.body.data.memory).toHaveProperty('percentage');
  });
});
