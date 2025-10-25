import request from 'supertest';
import express, { Application } from 'express';
import simpleScanRoutes from '../routes/simpleScan';

const app: Application = express();
app.use(express.json());
app.use('/api/v1', simpleScanRoutes);

describe('Scan Endpoints', () => {
  describe('POST /scan-barcode', () => {
    it('should scan barcode successfully', async () => {
      const response = await request(app)
        .post('/api/v1/scan-barcode')
        .send({ barcode: '1234567890123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('product');
      expect(response.body.data).toHaveProperty('nutrition');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data).toHaveProperty('scan_metadata');
      expect(response.body.data.scan_metadata.scan_type).toBe('barcode');
    });

    it('should return error for missing barcode', async () => {
      const response = await request(app)
        .post('/api/v1/scan-barcode')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /analyze-text', () => {
    it('should analyze text successfully', async () => {
      const response = await request(app)
        .post('/api/v1/analyze-text')
        .send({ query: 'apple juice' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.scan_metadata.scan_type).toBe('manual');
    });

    it('should return error for missing query', async () => {
      const response = await request(app)
        .post('/api/v1/analyze-text')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /scan/:scanId', () => {
    it('should get scan result successfully', async () => {
      const scanId = 'test-scan-id';
      const response = await request(app)
        .get(`/api/v1/scan/${scanId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', scanId);
    });
  });
});
