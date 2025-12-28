import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for React Frontend
 * Captures and reports JavaScript errors, network issues, and performance metrics
 */
export function initializeSentryReact() {
  // Skip if DSN not provided
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.info('Sentry not configured (VITE_SENTRY_DSN not provided)');
    return false;
  }

  try {
    Sentry.init({
      // Sentry DSN (from environment variables)
      dsn: import.meta.env.VITE_SENTRY_DSN,

      // Environment
      environment: import.meta.env.MODE || 'development',

      // Application version
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',

      // React integration
      integrations: [
        new BrowserTracing({
          // Track routing
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            window.history
          ),
          
          // Track interactions
          tracingOrigins: ['localhost', /^\//],
          
          // Performance monitoring
          performanceMonitoringEnabled: true,
        }),
        
        // Replay for error debugging
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
          maskAllInputs: false,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errored sessions

      // Attach stack traces
      attachStacktrace: true,

      // Maximum breadcrumbs
      maxBreadcrumbs: 50,

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'chrome-extension://',
        'moz-extension://',
        // Network errors that are expected
        'Network request failed',
        'NetworkError',
        'timeout of',
        // ResizeObserver
        'ResizeObserver loop limit exceeded',
        // Random plugins
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
      ],

      // Before sending to Sentry
      beforeSend: (event, hint) => {
        // Filter out client-side 4xx errors (optional)
        // These might be expected behavior (404, 401, etc.)
        
        // Don't send in development unless in error scenario
        if (import.meta.env.MODE !== 'production' && 
            event.level === 'error' && 
            !hint.originalException) {
          return null;
        }

        return event;
      },

      // Normalize data
      normalizeDepth: 5,
    });

    console.log('✅ Sentry initialized for React - Environment:', import.meta.env.MODE);
    return true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error.message);
    return false;
  }
}

/**
 * Capture custom exception in React
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture custom message
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
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUserContext(userId, email, username = null) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Error Boundary Component for React
 * Wraps the entire app to catch unhandled React component errors
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Higher Order Component for component-level error catching
 */
export function withErrorBoundary(Component, errorHandler = null) {
  return Sentry.withErrorBoundary(Component, {
    fallback: <ErrorFallback />,
    onError: errorHandler,
  });
}

/**
 * Default error fallback UI
 */
export function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          ❌ Algo salió mal
        </h1>
        <p className="text-gray-600 mb-4">
          Hemos capturado este error y lo estamos investigando. Por favor, intenta recargando la página.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-mono text-red-600">
              Detalles del Error
            </summary>
            <pre className="mt-2 overflow-auto text-gray-700">
              {error?.toString()}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Recargar Página
        </button>
      </div>
    </div>
  );
}

export default Sentry;
