# Google Analytics - GDPR Compliant Implementation

## Overview

Google Analytics ha sido integrado respetando las preferencias de cookies GDPR/e-Privacy del usuario. Analytics solo se carga si el usuario explícitamente consiente al enviar la preferencia en el banner de cookies.

## Setup

### Step 1: Create Google Analytics Property

1. Ir a https://analytics.google.com/
2. Crear una nueva propiedad
3. Obtener el Measurement ID (formato: G-XXXXXXXXXX)

### Step 2: Add to Environment Variables

```bash
# frontend/.env
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Step 3: Verify Installation

1. Aceptar cookies en el banner (incluyendo "Analytics")
2. Abrir DevTools → Network
3. Buscar `googletagmanager.com`
4. Debería ver: GET /gtag/js?id=G-XXXXXXXXXX

## GDPR Compliance

### ✅ Features Implemented

1. **Cookie Consent Required**
   - GA solo se carga si `cookieConsent.analytics === true`
   - Usuario debe aceptar explícitamente en el banner

2. **IP Anonymization**
   - `anonymize_ip: true` - Google no almacena IPs completas
   - Cumple con regulaciones de privacidad

3. **User ID Management**
   - Solo se envía si el usuario está autenticado
   - Se obtiene de localStorage
   - Puede ser revocado cuando usuario hace logout

4. **Dynamic Consent Updates**
   - Escucha cambios en `localStorage.cookieConsent`
   - Si usuario revoca consentimiento → GA se deshabilita
   - Si usuario otorga consentimiento → GA se carga

5. **Data Sharing Controls**
   - Google Ads features respetan preferencia de marketing
   - `allow_google_signals: preferences.marketing || false`

## Tracking Events

### Automatic Tracking

```javascript
// Page views (automático)
// Se envía cada vez que usuario navega a una ruta diferente

// User properties (automático)
// Incluye: user_id, timestamp, location
```

### Manual Event Tracking

Disponible en `src/config/analytics.js`:

```javascript
import { 
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackViewItem,
  trackSearch,
  trackFormSubmit,
  trackButtonClick,
  setUserProperties 
} from '../config/analytics.js';

// Rastrear compra
trackPurchase({
  orderId: '12345',
  total: 99.99,
  tax: 15.00,
  shippingCost: 10.00,
  items: [{ productId: '1', name: 'Product', category: 'Jewelry', price: 99.99, quantity: 1 }]
});

// Rastrear agregar al carrito
trackAddToCart({ productId: '1', name: 'Product', category: 'Jewelry', price: 99.99, quantity: 1 });

// Rastrear vista de producto
trackViewItem({ id: '1', name: 'Product', category: 'Jewelry', price: 99.99 });

// Rastrear búsqueda
trackSearch('anillos', 42);

// Rastrear evento personalizado
trackEvent('custom_event', { custom_param: 'value' });
```

## Hook Usage

```javascript
import useGoogleAnalytics from '../hooks/useGoogleAnalytics';

function MyComponent() {
  // Automáticamente rastrea cambios de ruta
  useGoogleAnalytics();
  
  return <div>Content</div>;
}
```

## Events Tracked

### Standard Events

| Event | Trigger | Data |
|-------|---------|------|
| page_view | Route change | path, title, referrer |
| purchase | Order placed | transaction_id, total, tax, shipping, items |
| add_to_cart | Item added to cart | item_id, item_name, price, quantity |
| view_item | Product viewed | item_id, item_name, price |
| search | Search performed | search_term, results_count |
| form_submit | Form submitted | form_name, form_id |
| button_click | Button clicked | button_name, category |

### Custom Events

Se pueden rastrear eventos personalizados según necesidad del negocio:

```javascript
trackEvent('jewelry_customized', { 
  component_count: 5, 
  total_price: 299.99 
});

trackEvent('wishlist_added', { 
  product_id: '123', 
  product_name: 'Ring' 
});
```

## Google Analytics Dashboard

### Key Metrics to Monitor

1. **Audience Overview**
   - Total users
   - New users
   - User retention
   - Geographic distribution

2. **Acquisition**
   - Traffic sources (organic, direct, referral)
   - Campaign performance
   - Device breakdown

3. **Behavior**
   - Top pages
   - Average session duration
   - Bounce rate
   - Page flow

4. **E-commerce** (if configured)
   - Total transactions
   - Average order value
   - Conversion rate
   - Top products

5. **Performance**
   - Slowest pages
   - Core Web Vitals (CLS, FID, LCP)
   - Device performance

## Privacy Considerations

### Data Collection
- Only analytics cookies are used for tracking
- Functional cookies work independently
- Marketing cookies respect user choice

### Data Retention
- By default: 14 months
- User data automatically deleted after retention period
- Can configure in Google Analytics settings

### User Rights (GDPR)
- Right to withdraw consent ✅ (revoke analytics cookies)
- Right to access data ✅ (via Google Analytics exports)
- Right to erasure ✅ (user data deleted after period)
- Right to portability ✅ (can export GA reports)

## E-Commerce Integration

Para tiendas online, rastrear transacciones:

```javascript
// En CheckoutPayment.jsx
import { trackPurchase } from '../config/analytics';

async function onPaymentSuccess(orderData) {
  trackPurchase({
    orderId: orderData.id,
    affiliation: 'MiAppVentas',
    total: orderData.total,
    tax: orderData.tax,
    shippingCost: orderData.shippingCost,
    items: orderData.items
  });
}
```

## Conversion Tracking

Para rastrear conversiones importantes:

```javascript
// Goal: Usuario registrado
trackEvent('user_signup', {
  method: 'email',
  user_type: 'new'
});

// Goal: Completó primer pedido
trackEvent('first_purchase', {
  value: 99.99,
  currency: 'PEN'
});

// Goal: Se suscribió a newsletter
trackEvent('newsletter_signup', {
  source: 'homepage'
});
```

## Troubleshooting

### GA no se carga

1. Verificar que `VITE_GOOGLE_ANALYTICS_ID` está configurado
2. Verificar que usuario aceptó analytics en el cookie banner
3. Abrir DevTools → localStorage → buscar `cookieConsent`
4. Verificar que `analytics: true`

### Eventos no aparecen

1. Puede tomar 24-48 horas para aparecer en GA
2. En modo "Real-time" debería verse inmediatamente
3. Verificar que el sitio está agregado a GA
4. Verificar filtros de vista (puede estar filtrando tu IP)

### IP Address

- Está automaticamente anonimizada
- Google no almacena IPs completas
- Completo con GDPR

## Cost Analysis

- **Free**: Datos históricos de 6 meses
- **GA4 (Free)**: Datos históricos de 14 meses
- **GA360 (Premium)**: Datos ilimitados, soporte premium

## Archivos Relacionados

- `frontend/src/config/analytics.js` - Configuración principal
- `frontend/src/hooks/useGoogleAnalytics.js` - Hook de React
- `frontend/src/App.jsx` - Inicialización
- `frontend/src/components/CookieConsent.jsx` - Banner de consentimiento
- `frontend/.env.example` - Variables de entorno

## Next Steps

1. ✅ Instalar e integrar Google Analytics
2. ✅ Respetar preferencias de cookies
3. ⏳ Configurar dashboards en GA
4. ⏳ Implementar custom events según necesidad
5. ⏳ Monitorear KPIs regularmente
