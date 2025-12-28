import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initializeGoogleAnalyticsListener } from '../config/analytics';

/**
 * Hook para rastrear cambios de página en React Router
 * Automáticamente envía eventos de pageview a Google Analytics
 */
export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA listener on mount (only once)
    initializeGoogleAnalyticsListener();
  }, []);

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname, document.title);
  }, [location]);
}

export default useGoogleAnalytics;
