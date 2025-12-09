# 📊 Reporte de Cobertura - Análisis y Plan

**Fecha**: Diciembre 2024  
**Status**: ✅ Fase de Análisis Completada

## 1. Métrica Actual de Cobertura

```
Global:          22.48% Statements, 12.67% Branches, 21.42% Functions
Rutas (routes):  100% ✅ 
Controladores:   9.46% (Crítico - Bajo)
Middleware:      81.25% (Muy Bueno)
```

## 2. Análisis por Componente

### ✅ Excelente (100% Cobertura)
- **src/routes/*** (auth.js, orders.js, products.js, users.js, payments.js)
  - Razón: Los tests HTTP validan que las rutas estén correctamente mapeadas

### ⚠️ Bajo (0% Cobertura) - CRÍTICO
- **src/controllers/orderController.js** (0%)
  - Problema: Los tests HTTP ejecutan la ruta pero fallan en validaciones previas
  - Solución necesaria: Tests que lleguen a ejecutar la lógica del controlador
  
- **src/controllers/userController.js** (0%)
  - Mismo problema que orderController
  - Se ejecuta autenticación pero el controlador nunca se alcanza
  
- **src/controllers/paymentController.js** (0%)
  - Similar al anterior
  - Necesita tests de webhook específicos

- **src/models/*.js** (Order.js: 0%, Product.js: 0%, User.js: 0%)
  - No hay tests unitarios para modelos/schemas

### ⚠️ Bajo (30-32% Cobertura)
- **src/controllers/authController.js** (32.35%)
  - Parcialmente cubierto por tests de login/registro
  - Faltan validaciones y edge cases
  
- **src/controllers/productController.js** (30.15%)
  - Cubierto parcialmente por GET /products tests
  - Faltan rutas POST, PUT, DELETE

### ⚠️ Moderado (70-81% Cobertura)
- **src/middleware/auth.js** (70%)
  - Bien: Validación de token
  - Falta: Casos de tokens expirados, malformados
  
- **src/middleware/errorHandler.js** (100%)
  - Completamente cubierto ✅

## 3. Problemas Identificados

### Problema Principal: Arquitectura de Pruebas
Los tests HTTP **nunca ejecutan el código del controlador** porque fallan antes:

1. **Orden de ejecución típico**:
   ```
   HTTP Request
   ↓ Validación de ruta (✓ ejecutada)
   ↓ Middleware de autenticación (✗ falla aquí sin token)
   ↓ Controller (nunca se alcanza)
   ```

2. **Resultado**: El controlador nunca ejecuta su código, así que:
   - 0% de líneas cubiertas
   - 0% de funciones cubiertas
   - Los tests pasan pero la cobertura no sube

## 4. Plan de Mejora de Cobertura

### Estrategia 1: Tests de Webhooks (Sin Autenticación)
**Implementar**: Tests que usen endpoints públicos

```javascript
// Ejemplo: Payment webhook - sin autenticación requerida
POST /api/webhooks/payment
→ Ejecuta handlePaymentWebhook del paymentController
→ Aumenta cobertura de paymentController
```

**Beneficio**: Ejecuta código real del controlador sin barreras

### Estrategia 2: Tests Unitarios de Controladores
**Implementar**: Tests directo del controlador (mock de Prisma)

```javascript
// Ejemplo:
import { createOrder } from '../../src/controllers/orderController.js';
import { prisma } from '../../src/lib/prisma.js';

jest.mock('../../src/lib/prisma.js');

test('createOrder - valida items', async () => {
  const mockReq = { body: { items: [], shippingAddressId: 1 }, user: { id: 1 } };
  const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const mockNext = jest.fn();
  
  await createOrder(mockReq, mockRes, mockNext);
  
  expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
});
```

**Beneficio**: Controla cada camino de código específicamente

### Estrategia 3: Tests de Modelos
**Implementar**: Validación de schemas de Prisma

```javascript
test('Order model - validar campos requeridos', async () => {
  const order = new Order({ userId: 1 }); // Falta items, status, total
  expect(() => order.validate()).toThrow();
});
```

### Estrategia 4: Tests de Integración Completa
**Implementar**: Flujos end-to-end que culminen en controladores

Ejemplo: Crear usuario → autenticar → crear orden → pagar → webhook
```javascript
test('Complete purchase flow', async () => {
  // 1. Register & Login (ejecuta authController) ✓
  // 2. Get Products (ejecuta productController) ✓
  // 3. Create Order (ejecuta orderController) ← Aquí falla
  // 4. Pay Order (ejecuta paymentController) ← Aquí falla
  // 5. Webhook (ejecuta paymentController) ← Aquí sí ejecutaría
});
```

## 5. Métricas Actuales vs. Objetivo

| Componente | Actual | Objetivo | Brecha |
|-----------|--------|----------|--------|
| Routes | 100% | 100% | ✓ |
| Controllers | 9.46% | 80%+ | -70.54% |
| Middleware | 81.25% | 95%+ | -13.75% |
| Models | 0% | 60%+ | -60% |
| Global | 22.48% | 70%+ | -47.52% |

## 6. Recomendación Inmediata

### Fase 4.1 (Próximos 30 min):
1. Crear tests para webhooks públicos (paymentController)
2. Agregar tests unitarios con mocks para orderController
3. Crear casos de edge en authController

### Fase 4.2 (Próximos 60 min):
4. Tests de validación de modelos
5. Tests de flujos completos si es posible
6. Tests de errorHandler para casos especiales

### Fase 4.3 (Si se continúa):
7. Análisis de paymentController (316 líneas, 0% cobertura)
8. Tests unitarios con datos mockados para userController (218 líneas)
9. Coverage target: 50%+ global

## 7. Archivos de Prueba Existentes

- `__tests__/routes/auth.test.js` - 12 tests ✓
- `__tests__/routes/orders.test.js` - 28 tests ✓
- `__tests__/routes/products.test.js` - 22 tests ✓
- `__tests__/routes/users.test.js` - 28 tests ✓
- `__tests__/routes/integration.test.js` - 20 tests ✓
- `__tests__/routes/api.test.js` - 25 tests ✓
- `__tests__/routes/coverage.test.js` - 55 tests ✓
- `__tests__/routes/controller-coverage.test.js` - 22 tests ✓

**Total**: 192 tests pasando ✅

## 8. Conclusión

La baja cobertura en controladores **no es un problema de tests faltantes**, sino de que los tests HTTP **no logran alcanzar el código del controlador** debido a:

1. **Validaciones previas**: Autenticación, validación de input
2. **Datos faltantes**: IDs que no existen en la BD
3. **Restricciones de diseño**: Tests de integración vs. tests unitarios

La solución es un **enfoque dual**:
- ✅ Mantener tests HTTP para validar flujos reales (192 tests actuales)
- ➕ Agregar tests unitarios/mocks para alcanzar 70%+ cobertura

---

**Próximo Paso**: Implementar Estrategia 1 (webhooks) + Estrategia 2 (unitarios) para llevar cobertura a 50-70% en controladores.
