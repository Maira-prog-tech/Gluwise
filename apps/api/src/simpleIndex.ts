import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';
import simpleScanRoutes from './routes/simpleScan';
import { healthRouter as healthRoutes } from './routes/health';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const logger = createLogger();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',  // React web app
    'http://localhost:3002',  // React web app (port 3002)
    'http://127.0.0.1:3000',  // React web app (127.0.0.1)
    'http://127.0.0.1:3002',  // React web app (127.0.0.1:3002)
    'http://localhost:8081',  // Mobile app
    'exp://192.168.1.100:8081',
    /^http:\/\/127\.0\.0\.1:\d+$/  // Browser preview proxy
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
  }, 'Incoming request');
  next();
});

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1', simpleScanRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GluWise API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  }, 'Unhandled error');

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started successfully');
  console.log(`🚀 GluWise API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔍 API docs: http://localhost:${PORT}/api/v1`);
});

export default app;
