import { captureException, setRequestContext, addBreadcrumb } from '../config/sentry.js';
import logger from '../config/logger.js';

/**
 * Middleware to capture errors in async route handlers
 * Wraps route handlers and captures any errors that occur
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add request context to breadcrumb
      if (req.user) {
        addBreadcrumb(`Request by user ${req.user.id}`, 'auth', 'info');
      }
      
      // Set request context in Sentry
      setRequestContext(req);
      
      // Capture the error
      if (error.statusCode >= 500 || !error.statusCode) {
        captureException(error, {
          method: req.method,
          path: req.path,
          userId: req.user?.id
        });
      }
      
      // Log and pass to error handler
      logger.error(`Error in route handler: ${error.message}`, {
        method: req.method,
        path: req.path,
        statusCode: error.statusCode
      });
      
      next(error);
    });
  };
}

/**
 * Middleware to track performance with Sentry
 */
export function performanceTracking(req, res, next) {
  const startTime = Date.now();
  
  // Track when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log slow requests
    if (duration > 1000) {
      addBreadcrumb(
        `Slow request: ${req.method} ${req.path}`,
        'performance',
        'warning',
        { duration }
      );
    }
    
    // Log error responses
    if (statusCode >= 500) {
      addBreadcrumb(
        `Server error: ${statusCode} ${req.method} ${req.path}`,
        'error',
        'error',
        { duration }
      );
    }
  });
  
  next();
}

export default asyncHandler;
