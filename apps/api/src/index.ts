import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { healthRouter } from './routes/health';
import { scanRouter } from './routes/scan';
import { profileRouter } from './routes/profile';
import { historyRouter } from './routes/history';

// Load environment variables
dotenv.config();

const app = express();
const logger = createLogger();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.com'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));

// Logging middleware
app.use(pinoHttp({ logger }));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/v1/health', healthRouter);
app.use('/v1/scan', scanRouter);
app.use('/v1/profile', profileRouter);
app.use('/v1/history', historyRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`🚀 GluWise API server running on port ${port}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${port}/v1/health`);
});

export default app;
