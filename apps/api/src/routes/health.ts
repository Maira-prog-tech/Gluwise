import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router: Router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    gemini: 'available' | 'unavailable' | 'error';
    vision: 'available' | 'unavailable' | 'error';
    usda: 'available' | 'unavailable' | 'error';
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected', // TODO: Add actual Supabase health check
      gemini: 'available',   // TODO: Add actual Gemini AI health check
      vision: 'available',   // TODO: Add actual Vision API health check
      usda: 'available'      // TODO: Add actual USDA API health check
    },
    memory: {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100)
    }
  };

  // Determine overall health status
  const serviceStatuses = Object.values(healthStatus.services);
  if (serviceStatuses.includes('error')) {
    healthStatus.status = 'unhealthy';
  } else if (serviceStatuses.includes('unavailable')) {
    healthStatus.status = 'degraded';
  }

  const response: ApiResponse<HealthStatus> = {
    success: true,
    data: healthStatus,
    message: 'GluWise API is running'
  };

  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(response);
}));

router.get('/ping', asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse<{ pong: string }> = {
    success: true,
    data: { pong: 'pong' },
    message: 'Server is responsive'
  };
  
  res.json(response);
}));

export { router as healthRouter };
