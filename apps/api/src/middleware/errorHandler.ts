import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }

  // Log error
  if (!isOperational || statusCode >= 500) {
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    }, 'Unhandled error occurred');
  } else {
    logger.warn({
      error: {
        message: error.message,
        statusCode,
        url: req.url,
        method: req.method
      }
    }, 'Operational error occurred');
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.message
    }),
    timestamp: new Date().toISOString()
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
