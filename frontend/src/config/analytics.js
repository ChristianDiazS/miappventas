/**
 * Google Analytics Service
 * Respects cookie consent preferences
 * Only tracks when user explicitly allows analytics cookies
 */

// Google Analytics Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
const GA_API_SECRET = import.meta.env.VITE_GOOGLE_ANALYTICS_API_SECRET;

/**
 * Load Google Analytics script only if user consented
 * This respects the CookieConsent component settings
 */
export function loadGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.info('Google Analytics not configured (VITE_GOOGLE_ANALYTICS_ID not provided)');
    return false;
  }

  try {
    // Check if user has given analytics consent
    const cookiePreferences = localStorage.getItem('cookieConsent');
    
    if (!cookiePreferences) {
      console.info('User has not set cookie preferences yet - GA not loaded');
      return false;
    }

    const preferences = JSON.parse(cookiePreferences);

    // Only load GA if user explicitly allowed analytics
    if (!preferences.analytics) {
      console.info('User has not consented to analytics cookies');
      return false;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    
    // Configure GA with initial settings
    window.gtag('config', GA_MEASUREMENT_ID, {
      // Anonymize IP for GDPR compliance
      'anonymize_ip': true,
      
      // Enable Google Ads features (optional)
      'allow_google_signals': preferences.marketing || false,
      
      // Custom user ID (if available)
      'user_id': getUserId() || undefined,
      
      // Page path override
      'page_path': window.location.pathname,
      'page_title': document.title,
    });

    console.log('✅ Google Analytics loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading Google Analytics:', error.message);
    return false;
  }
}

/**
 * Track page view (call on route changes)
 */
export function trackPageView(pagePath, pageTitle) {
  if (!window.gtag) {
    console.warn('Google Analytics not loaded - pageview not tracked');
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      'page_path': pagePath,
      'page_title': pageTitle,
      'page_referrer': document.referrer,
      'send_to': import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    });

    console.debug('GA pageview tracked:', pagePath);
  } catch (error) {
    console.error('Error tracking pageview:', error.message);
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName, eventData = {}) {
  if (!window.gtag) {
    console.warn('Google Analytics not loaded - event not tracked');
    return;
  }

  try {
    window.gtag('event', eventName, eventData);
    console.debug('GA event tracked:', eventName, eventData);
  } catch (error) {
    console.error('Error tracking event:', error.message);
  }
}

/**
 * Track e-commerce transaction
 */
export function trackPurchase(transactionData) {
  if (!window.gtag) {
    console.warn('Google Analytics not loaded - purchase not tracked');
    return;
  }

  try {
    window.gtag('event', 'purchase', {
      'transaction_id': transactionData.orderId,
      'affiliation': transactionData.affiliation || 'MiAppVentas',
      'value': parseFloat(transactionData.total),
      'currency': transactionData.currency || 'PEN',
      'tax': parseFloat(transactionData.tax),
      'shipping': parseFloat(transactionData.shippingCost),
      'items': transactionData.items?.map(item => ({
        'item_id': item.productId,
        'item_name': item.name,
        'item_category': item.category,
        'price': parseFloat(item.price),
        'quantity': item.quantity,
      })) || [],
    });

    console.debug('GA purchase tracked:', transactionData.orderId);
  } catch (error) {
    console.error('Error tracking purchase:', error.message);
  }
}

/**
 * Track add to cart
 */
export function trackAddToCart(item) {
  if (!window.gtag) return;

  try {
    window.gtag('event', 'add_to_cart', {
      'items': [{
        'item_id': item.productId,
        'item_name': item.name,
        'item_category': item.category,
        'price': parseFloat(item.price),
        'quantity': item.quantity,
      }],
      'value': parseFloat(item.price) * item.quantity,
      'currency': 'PEN',
    });

    console.debug('GA add_to_cart tracked:', item.name);
  } catch (error) {
    console.error('Error tracking add_to_cart:', error.message);
  }
}

/**
 * Track product view
 */
export function trackViewItem(product) {
  if (!window.gtag) return;

  try {
    window.gtag('event', 'view_item', {
      'items': [{
        'item_id': product.id,
        'item_name': product.name,
        'item_category': product.category,
        'price': parseFloat(product.price),
      }],
      'currency': 'PEN',
    });

    console.debug('GA view_item tracked:', product.name);
  } catch (error) {
    console.error('Error tracking view_item:', error.message);
  }
}

/**
 * Track search
 */
export function trackSearch(searchQuery, resultCount) {
  if (!window.gtag) return;

  try {
    window.gtag('event', 'search', {
      'search_term': searchQuery,
      'results_count': resultCount,
    });

    console.debug('GA search tracked:', searchQuery);
  } catch (error) {
    console.error('Error tracking search:', error.message);
  }
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName, formData = {}) {
  if (!window.gtag) return;

  try {
    window.gtag('event', 'form_submit', {
      'form_name': formName,
      'form_id': formData.formId,
      ...formData,
    });

    console.debug('GA form_submit tracked:', formName);
  } catch (error) {
    console.error('Error tracking form_submit:', error.message);
  }
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName, category = 'engagement') {
  if (!window.gtag) return;

  try {
    window.gtag('event', 'button_click', {
      'button_name': buttonName,
      'event_category': category,
    });

    console.debug('GA button_click tracked:', buttonName);
  } catch (error) {
    console.error('Error tracking button_click:', error.message);
  }
}

/**
 * Set custom user properties
 */
export function setUserProperties(userId, userData = {}) {
  if (!window.gtag) return;

  try {
    window.gtag('set', {
      'user_id': userId,
      'user_properties': userData,
    });

    console.debug('GA user properties set');
  } catch (error) {
    console.error('Error setting user properties:', error.message);
  }
}

/**
 * Get stored user ID (from localStorage, session, etc.)
 */
function getUserId() {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Disable Google Analytics (when user revokes consent)
 */
export function disableGoogleAnalytics() {
  if (window.gtag) {
    window['ga-disable-' + import.meta.env.VITE_GOOGLE_ANALYTICS_ID] = true;
    console.info('Google Analytics disabled - user revoked consent');
  }
}

/**
 * Listen to cookie preference changes
 * Automatically load/disable GA when preferences change
 */
export function initializeGoogleAnalyticsListener() {
  // Listen to storage changes (other tabs, localStorage updates)
  window.addEventListener('storage', (e) => {
    if (e.key === 'cookieConsent') {
      const preferences = JSON.parse(e.newValue);
      
      if (preferences.analytics) {
        loadGoogleAnalytics();
      } else {
        disableGoogleAnalytics();
      }
    }
  });

  // Initial load
  loadGoogleAnalytics();
}

export default {
  loadGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackViewItem,
  trackSearch,
  trackFormSubmit,
  trackButtonClick,
  setUserProperties,
  disableGoogleAnalytics,
  initializeGoogleAnalyticsListener,
};
