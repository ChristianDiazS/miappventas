# Sentry - Error Tracking Implementation

## Overview

Sentry es un servicio de monitoreo de errores en tiempo real que ayuda a detectar, rastrear y resolver errores en producción.

## Configuration

### Step 1: Create Sentry Account

1. Ir a https://sentry.io/
2. Crear una cuenta (free tier disponible)
3. Crear un nuevo proyecto (seleccionar "Node.js")
4. Copiar el DSN (Digital Signature Notification)

### Step 2: Add DSN to Environment Variables

```bash
# backend/.env
SENTRY_DSN=https://<public-key>@<hostname>/<project-id>
```

### Step 3: Verify Installation

El servidor debería mostrar:
```
✅ Sentry initialized - Environment: production
```

## Features Implemented

### 1. **Automatic Error Capture**
- Todas las excepciones no controladas se capturan automáticamente
- Los errores 5xx se envían a Sentry
- Los errores 4xx se filtran (opcional)

### 2. **Request Tracking**
- Método HTTP, URL, IP del cliente
- ID del usuario autenticado
- User-Agent del navegador

### 3. **Breadcrumbs**
- Registra acciones previas al error
- Máximo 50 breadcrumbs por sesión
- Útil para debugging

### 4. **Performance Monitoring**
- Rastrea solicitudes lentas (>1s)
- Mide tiempo de respuesta
- Identifica cuellos de botella

### 5. **Custom Error Handling**
Funciones disponibles en `src/config/sentry.js`:

```javascript
import { 
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  setRequestContext,
  createErrorWithContext 
} from '../config/sentry.js';

// Capturar excepción con contexto
captureException(error, { userId, action: 'payment_processing' });

// Capturar mensaje informativo
captureMessage('Important event happened', 'info');

// Agregar breadcrumb para debugging
addBreadcrumb('User clicked button', 'user-action', 'info');

// Establecer contexto del usuario
setUserContext(user.id, user.email, user.username);
```

## API Endpoints (with Sentry)

Todas las rutas auditadas tienen tracking automático:

```
POST /api/auth/login          → Captura intentos de login fallidos
POST /api/orders              → Monitorea errores de órdenes
POST /api/payments/process    → Rastrea fallos de pagos
GET  /api/products            → Monitorea errores de base de datos
```

## Error Sampling

- **Producción**: 10% de errores (para reducir cuota)
- **Desarrollo**: 100% de errores (debugging completo)

Configurar en `src/config/sentry.js`:
```javascript
tracesSampleRate: environment === 'production' ? 0.1 : 1.0
```

## Filtering Rules

Sentry filtra automáticamente:
- Errores 4xx (configurables)
- Errores de extensiones de navegador
- Errores de conexión (ECONNREFUSED)
- Errores específicos listos en `ignoreErrors`

## Slack Integration (Optional)

1. En Sentry Dashboard → Settings → Integrations
2. Buscar "Slack" → Install
3. Seleccionar canal para notificaciones
4. Configurar reglas (e.g., "Alert on all errors", "Alert on releases")

## Email Alerts

1. En Sentry Dashboard → Alerts → Create Alert Rule
2. Seleccionar "All Errors" o condiciones específicas
3. Acción: "Send to Email"
4. Frecuencia: "Inmediata" o "Diaria"

## Dashboard Features

### Error Stats
- Tasa de errores por hora
- Top 10 errores más frecuentes
- Comparación con período anterior

### Release Tracking
- Correlacionar errores con versiones
- Detectar regresiones
- Timeline de releases

### User Impact
- Número de usuarios afectados
- Último evento del error
- Stack trace completo

## Performance Monitoring Dashboard

- Transaciones lentas
- Duración de endpoint
- Error rate por endpoint
- Comparativa de rendimiento

## Troubleshooting

### Sentry no captura errores

1. Verificar que `SENTRY_DSN` está configurado
2. Verificar logs: `✅ Sentry initialized - Environment: ...`
3. Asegurar que el error es `>= 500` (4xx se filtran)

### DSN no válido

- Verifica el formato: `https://<key>@<host>/<id>`
- Verifica que el proyecto existe en Sentry
- Verifica permisos: "Can Send Events"

### Cuota agotada

- En Sentry → Settings → Organization → Quota
- Aumentar límite de eventos
- Reducir `tracesSampleRate` en producción

## Security Notes

1. **SENTRY_DSN**: Contiene credenciales públicas (es seguro)
2. **No incluir**:
   - Contraseñas en mensajes de error
   - Tokens API en contexto
   - Información PII sensible
3. **Data Scrubbing**: Sentry automáticamente oculta:
   - Números de tarjeta
   - Tokens de autenticación
   - Información sensible

## Cost Analysis

- **Free Tier**: 5,000 eventos/mes
- **$29/mes**: 100,000 eventos/mes
- **$99/mes**: 500,000 eventos/mes

Para reducir costos:
1. Filtrar errores 4xx
2. Reducir sample rate en producción
3. Configurar alertas solo para errores críticos

## Next Steps

1. ✅ Instalar y configurar Sentry
2. ✅ Integrar con error handler
3. ⏳ Configurar alertas en Slack/Email
4. ⏳ Revisar dashboard regularmente
5. ⏳ Implementar Release Tracking

## Related Files

- `backend/src/config/sentry.js` - Configuración principal
- `backend/src/middleware/sentryMiddleware.js` - Middlewares
- `backend/src/middleware/errorHandler.js` - Integración error handler
- `backend/server.js` - Inicialización
