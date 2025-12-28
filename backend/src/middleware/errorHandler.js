import logger from '../config/logger.js';
import { captureException } from '../config/sentry.js';

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // Log the error
  logger.error(`[${status}] ${message}`, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: err.stack
  });

  // Capture error in Sentry if status code is 5xx
  if (status >= 500) {
    captureException(err, {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      statusCode: status
    });
  }

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
