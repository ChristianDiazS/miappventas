import * as Sentry from '@sentry/node';
import logger from './logger.js';

/**
 * Initialize Sentry Error Tracking
 * Captures and reports all unhandled exceptions and errors
 */
export function initializeSentry(app, environment = 'production') {
  // Skip initialization if DSN not provided
  if (!process.env.SENTRY_DSN) {
    logger.info('Sentry not configured (SENTRY_DSN not provided)');
    return false;
  }

  try {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      
      // Environment
      environment: environment || process.env.NODE_ENV || 'development',
      
      // Release tracking (use git commit hash if available)
      release: process.env.APP_VERSION || '1.0.0',
      
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      
      // Capture deeply nested errors
      attachStacktrace: true,
      
      // Maximum breadcrumbs to capture
      maxBreadcrumbs: 50,
      
      // Normalize HTTP request/response data
      normalizeDepth: 6,
      
      // Server name
      serverName: process.env.SERVER_NAME || 'miappventas-backend',
      
      // Integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
      ],
      
      // Custom filtering
      beforeSend: (event, hint) => {
        // Don't send 4xx errors (client errors) to Sentry
        if (event.exception) {
          const error = hint.originalException;
          if (error?.statusCode && error.statusCode < 500) {
            return null;
          }
        }
        
        // Filter out specific error types if needed
        if (hint.originalException?.message?.includes('ECONNREFUSED')) {
          logger.debug('Filtering out connection refused error');
          return null;
        }
        
        return event;
      },
      
      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'chrome-extension://',
        'moz-extension://',
        // Random plugins/extensions
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
        // Network-related errors
        'NetworkError',
        'Network request failed',
        'timeout of',
        // Client-side navigation errors
        'ResizeObserver loop limit exceeded',
      ]
    });

    // Attach Sentry to Express
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.errorHandler());

    logger.info(`✅ Sentry initialized - Environment: ${environment}`);
    return true;
  } catch (error) {
    logger.error(`Failed to initialize Sentry: ${error.message}`);
    return false;
  }
}

/**
 * Capture custom exception
 * Use this for important business logic errors
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
  
  logger.error(`Sentry captured exception: ${error.message}`, context);
}

/**
 * Capture custom message
 * Use this for informational logging that doesn't require an exception
 */
export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category = 'custom', level = 'info', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  });
}

/**
 * Set user context
 */
export function setUserContext(userId, email, username = null) {
  Sentry.setUser({
    id: userId,
    email,
    username
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Set request context
 */
export function setRequestContext(req) {
  Sentry.setContext('request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
}

/**
 * Create error with context
 */
export function createErrorWithContext(message, statusCode = 500, context = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.context = context;
  
  captureException(error, context);
  
  return error;
}

export default Sentry;
