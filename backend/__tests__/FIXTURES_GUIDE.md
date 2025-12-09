# 🎯 Guía de Fixtures - Datos de Prueba Consistentes

**Versión**: 1.0  
**Última actualización**: Diciembre 2024  
**Mantenedor**: QA Team

---

## 📋 Contenido

1. [Introducción](#introducción)
2. [Estructura de Fixtures](#estructura-de-fixtures)
3. [Cómo Usar Fixtures](#cómo-usar-fixtures)
4. [Fixtures Disponibles](#fixtures-disponibles)
5. [Funciones Helper](#funciones-helper)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Introducción

Los **fixtures** son datos predefinidos reutilizables en tests. Proporcionan:

✅ **Consistencia**: Los mismos datos en todos los tests  
✅ **Mantenibilidad**: Cambios centralizados  
✅ **Eficiencia**: Menos código duplicado  
✅ **Claridad**: Datos organizados por categoría  

**Ubicación**: `__tests__/fixtures/index.js`

---

## Estructura de Fixtures

```
fixtures/
├── index.js                 # Archivo principal con todos los fixtures
└── FIXTURES_GUIDE.md       # Este archivo
```

El archivo `index.js` organiza fixtures en categorías:

```javascript
export const users = { /* datos de usuarios */ }
export const products = { /* datos de productos */ }
export const orders = { /* datos de órdenes */ }
// ... más categorías
```

---

## Cómo Usar Fixtures

### Importar Fixtures

```javascript
// Importar toda la categoría
import { users, products } from '../fixtures/index.js';

// O importar el módulo completo
import fixtures from '../fixtures/index.js';
```

### Usar Datos Válidos

```javascript
import { users } from '../fixtures/index.js';

it('debe registrar usuario válido', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(users.valid);
  
  expect(res.status).toBe(201);
});
```

### Usar Datos Inválidos

```javascript
it('debe rechazar usuario sin email', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(users.invalid.noEmail);
  
  expect([400, 422]).toContain(res.status);
});
```

### Combinar y Personalizar

```javascript
import { users } from '../fixtures/index.js';

it('debe actualizar perfil', async () => {
  const userData = {
    ...users.valid,
    firstName: 'Nuevo',
    lastName: 'Nombre',
  };
  
  const res = await request(app)
    .put('/api/users/profile')
    .send(userData);
  
  expect(res.status).toBe(200);
});
```

---

## Fixtures Disponibles

### 👤 Users (Usuarios)

```javascript
users.valid              // Usuario básico válido
users.complete          // Usuario con datos completos
users.admin             // Usuario administrador
users.passwordChange    // Usuario para cambio de contraseña
users.withFavorites     // Usuario con favoritos
users.invalid.noEmail   // Sin email
users.invalid.noPassword // Sin contraseña
users.invalid.invalidEmail // Email inválido
users.invalid.weakPassword // Contraseña débil
users.update            // Datos para actualizar perfil
```

**Ejemplo de uso:**

```javascript
const newUser = users.valid;
// {
//   email: 'usuario.valido@test.com',
//   password: 'ValidPass123!',
//   firstName: 'Test',
//   lastName: 'Usuario',
//   phone: '987654321',
// }
```

---

### 📦 Products (Productos)

```javascript
products.valid          // Producto básico válido
products.complete       // Producto con todos los campos
products.premium        // Producto premium (precio alto)
products.budget         // Producto económico
products.noStock        // Producto sin stock
products.invalid.noName          // Sin nombre
products.invalid.noPrice         // Sin precio
products.invalid.negativePrice   // Precio negativo
products.invalid.negativeStock   // Stock negativo
products.update         // Datos para actualizar
```

**Ejemplo de uso:**

```javascript
const product = products.complete;
// {
//   name: 'Producto Completo',
//   description: 'Descripción detallada...',
//   price: 199.99,
//   stock: 20,
//   categoryId: 1,
//   sku: 'TEST-SKU-001',
//   images: [...]
// }
```

---

### 📋 Orders (Órdenes)

```javascript
orders.valid            // Orden básica válida
orders.multipleItems    // Orden con múltiples items
orders.complete         // Orden con datos completos
orders.invalid.noItems  // Sin items
orders.invalid.noAddress // Sin dirección
orders.statuses.pending // Estado pendiente
orders.statuses.delivered // Estado entregado
// ... más estados
```

**Ejemplo de uso:**

```javascript
const order = orders.multipleItems;
// {
//   items: [
//     { productId: 1, quantity: 2, price: 99.99 },
//     { productId: 2, quantity: 1, price: 199.99 }
//   ],
//   shippingAddress: { ... }
// }
```

---

### 💳 Payments (Pagos)

```javascript
payments.successful     // Pago exitoso
payments.failed         // Pago fallido
payments.pending        // Pago pendiente
payments.webhookSuccess // Webhook de pago exitoso
payments.webhookFailed  // Webhook de pago fallido
```

**Ejemplo de uso:**

```javascript
const webhook = payments.webhookSuccess;
// {
//   event: 'payment.completed',
//   orderId: 1,
//   status: 'completed',
//   amount: 199.98,
//   timestamp: '2024-12-09T...'
// }
```

---

### 🔐 Auth (Autenticación)

```javascript
auth.validCredentials               // Credenciales válidas
auth.invalidCredentials.wrongEmail  // Email incorrecto
auth.invalidCredentials.wrongPassword // Contraseña incorrecta
auth.invalidCredentials.emptyEmail  // Email vacío
auth.invalidCredentials.emptyPassword // Contraseña vacía
auth.tokens.valid       // Token válido (mock)
auth.tokens.invalid     // Token inválido
auth.tokens.expired     // Token expirado
```

**Ejemplo de uso:**

```javascript
const credentials = auth.validCredentials;
// {
//   email: 'login.test@test.com',
//   password: 'LoginTest123!'
// }
```

---

### 🏷️ Categories (Categorías)

```javascript
categories.valid        // Categoría válida
categories.complete     // Categoría con datos completos
categories.invalid.noName // Sin nombre
categories.invalid.noSlug // Sin slug
```

---

### ⭐ Reviews (Reseñas)

```javascript
reviews.positive        // Review con 5 estrellas
reviews.neutral         // Review con 3 estrellas
reviews.negative        // Review con 1 estrella
reviews.invalid.noRating // Sin rating
reviews.invalid.invalidRating // Rating fuera de rango
```

---

### 🛒 Cart (Carrito)

```javascript
cart.validItem          // Item válido
cart.multipleItems      // Múltiples items
cart.invalid.noProductId // Sin producto
cart.invalid.noQuantity  // Sin cantidad
cart.invalid.negativeQuantity // Cantidad negativa
cart.invalid.zeroQuantity // Cantidad cero
```

---

### 🔍 Search (Búsqueda)

```javascript
search.valid            // Búsqueda válida completa
search.simple           // Búsqueda simple (solo keyword)
search.advanced         // Búsqueda avanzada con filtros
```

---

### 📊 Pagination (Paginación)

```javascript
pagination.default      // Página 1, 10 items
pagination.second       // Página 2, 10 items
pagination.custom       // Página 1, 25 items
pagination.invalid.negativePage // Página negativa
pagination.invalid.negativeLimit // Limit negativo
```

---

### 📧 Notifications (Notificaciones)

```javascript
notifications.orderConfirmed // Orden confirmada
notifications.orderShipped   // Orden enviada
notifications.orderDelivered // Orden entregada
```

---

### 🔢 IDs

```javascript
ids.valid.product       // ID de producto válido (1)
ids.valid.user          // ID de usuario válido (1)
ids.valid.order         // ID de orden válido (1)
ids.invalid.nonexistent // ID que no existe (99999)
ids.invalid.negative    // ID negativo (-1)
ids.invalid.invalidFormat // Formato inválido
```

---

## Funciones Helper

### generateUniqueEmail(prefix)

Genera un email único basado en timestamp.

```javascript
import { generateUniqueEmail } from '../fixtures/index.js';

const email1 = generateUniqueEmail('user');      // user.1702177200000@test.com
const email2 = generateUniqueEmail('customer');  // customer.1702177200001@test.com
```

**Por qué es útil**: Cada test puede registrar un usuario nuevo sin conflictos de email duplicado.

---

### generateUniqueProductName(prefix)

Genera un nombre de producto único basado en timestamp.

```javascript
import { generateUniqueProductName } from '../fixtures/index.js';

const name1 = generateUniqueProductName('Laptop');  // Laptop 1702177200000
const name2 = generateUniqueProductName('Mouse');   // Mouse 1702177200001
```

---

### generateUniqueSKU(prefix)

Genera un SKU único basado en timestamp.

```javascript
import { generateUniqueSKU } from '../fixtures/index.js';

const sku1 = generateUniqueSKU('PROD');  // PROD-1702177200000
const sku2 = generateUniqueSKU('TEST');  // TEST-1702177200001
```

---

### createTestUser(overrides)

Crea un usuario de test con email único.

```javascript
import { createTestUser } from '../fixtures/index.js';

const user1 = createTestUser();
// {
//   email: 'usuario.valido.1702177200000@test.com',
//   password: 'ValidPass123!',
//   firstName: 'Test',
//   lastName: 'Usuario',
// }

const admin = createTestUser({ role: 'ADMIN' });
// Combinaría los datos de usuario válido con role: ADMIN
```

---

### createTestProduct(overrides)

Crea un producto de test con nombre y SKU únicos.

```javascript
import { createTestProduct } from '../fixtures/index.js';

const product1 = createTestProduct();
// {
//   name: 'Product 1702177200000',
//   sku: 'SKU-1702177200000',
//   price: 99.99,
//   stock: 10,
// }

const premium = createTestProduct({ price: 499.99, stock: 5 });
// Combinaería datos de producto válido con overrides
```

---

### createTestOrder(overrides)

Crea una orden de test con datos dinámicos.

```javascript
import { createTestOrder } from '../fixtures/index.js';

const order = createTestOrder({
  items: [
    { productId: 1, quantity: 5, price: 99.99 }
  ]
});
```

---

## Mejores Prácticas

### 1. ✅ Usar Fixtures en lugar de Crear Datos en Tests

**❌ MAL:**

```javascript
it('debe registrar usuario', async () => {
  const userData = {
    email: 'test@test.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '123456789'
  };
  // ... test
});
```

**✅ BIEN:**

```javascript
import { users } from '../fixtures/index.js';

it('debe registrar usuario', async () => {
  const userData = users.valid;
  // ... test
});
```

---

### 2. ✅ Usar Funciones Helper para Datos Únicos

**❌ MAL:**

```javascript
it('debe registrar múltiples usuarios', async () => {
  // Falla si el test se ejecuta dos veces (email duplicado)
  const user1 = users.valid;
  const user2 = users.valid;
});
```

**✅ BIEN:**

```javascript
import { createTestUser } from '../fixtures/index.js';

it('debe registrar múltiples usuarios', async () => {
  const user1 = createTestUser();
  const user2 = createTestUser();
  // Cada uno tiene un email único
});
```

---

### 3. ✅ Documentar Cambios en Fixtures

Si necesitas cambiar un fixture, documenta el cambio:

```javascript
// ❌ MAL: Cambio sin explicación
users.valid = { /* datos diferentes */ }

// ✅ BIEN: Con comentario explicativo
// ACTUALIZADO: Email cambiado por política de test
// Fecha: 2024-12-09
users.valid = {
  email: 'usuario.valido@test.com',
  // ...
}
```

---

### 4. ✅ Mantener Fixtures Simples y Focalizados

Cada fixture debe representar un caso específico:

```javascript
// ✅ BIEN: Cada uno es claramente diferente
users.valid              // Caso normal
users.admin              // Caso especial: admin
users.withFavorites      // Caso especial: con favoritos
users.passwordChange     // Caso especial: cambio de contraseña

// ❌ MAL: Fixtures complejos y genéricos
users.all = { /* 50 combinaciones */ }
```

---

### 5. ✅ Separar Datos Válidos de Inválidos

```javascript
// ✅ BIEN: Organizados en sub-objetos
products.valid
products.invalid.noPrice
products.invalid.negativePrice

// ❌ MAL: Mezclados sin estructura
products.test1
products.test2
products.badPrice
```

---

## Ejemplos Prácticos

### Ejemplo 1: Test de Registro de Usuario

```javascript
import { users, generateUniqueEmail } from '../fixtures/index.js';
import request from 'supertest';
import app from '../../src/app.js';

describe('Autenticación', () => {
  it('debe registrar usuario válido', async () => {
    const userData = {
      ...users.valid,
      email: generateUniqueEmail('newuser'),
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect([201, 200]).toContain(res.status);
    expect(res.body).toHaveProperty('user');
  });

  it('debe rechazar usuario sin email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(users.invalid.noEmail);

    expect([400, 422]).toContain(res.status);
    expect(res.body).toHaveProperty('success', false);
  });
});
```

---

### Ejemplo 2: Test de Órdenes

```javascript
import { orders, createTestProduct } from '../fixtures/index.js';
import request from 'supertest';
import app from '../../src/app.js';

describe('Órdenes', () => {
  it('debe crear orden con múltiples items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orders.multipleItems);

    expect([201, 200]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.items).toHaveLength(2);
  });

  it('debe rechazar orden sin items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orders.invalid.noItems);

    expect([400, 422]).toContain(res.status);
  });
});
```

---

### Ejemplo 3: Test de Búsqueda

```javascript
import { search, pagination } from '../fixtures/index.js';
import request from 'supertest';
import app from '../../src/app.js';

describe('Búsqueda', () => {
  it('debe buscar productos', async () => {
    const res = await request(app)
      .get('/api/products/search')
      .query(search.simple);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
  });

  it('debe paginar resultados', async () => {
    const res = await request(app)
      .get('/api/products')
      .query(pagination.default);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
  });
});
```

---

## Mantenimiento de Fixtures

### Cuándo Actualizar Fixtures

✅ Cuando cambien requisitos de validación  
✅ Cuando se agreguen nuevos campos obligatorios  
✅ Cuando cambien formatos de datos  
✅ Cuando se encuentren inconsistencias  

### Cómo Actualizar

1. **Identifica** qué fixture necesita cambio
2. **Documenta** el cambio con comentario y fecha
3. **Prueba** que los tests aún pasen
4. **Comunica** el cambio al equipo

---

## Cheat Sheet Rápido

```javascript
// Importar fixtures
import { users, products, orders } from '../fixtures/index.js';

// Usar datos válidos
const user = users.valid;
const product = products.premium;

// Usar datos inválidos
const badUser = users.invalid.noEmail;
const badProduct = products.invalid.negativePrice;

// Generar datos únicos
const email = generateUniqueEmail('test');
const product = createTestProduct({ price: 299.99 });

// Combinar y personalizar
const customUser = {
  ...users.valid,
  firstName: 'Personalizado',
  email: generateUniqueEmail(),
};
```

---

## Preguntas Frecuentes

**P: ¿Puedo modificar un fixture en un test?**  
R: No. Los fixtures son constantes. Crea un nuevo objeto con spread operator.

```javascript
// ✅ CORRECTO
const customProduct = { ...products.valid, price: 599.99 };

// ❌ INCORRECTO
products.valid.price = 599.99; // Modifica el original
```

---

**P: ¿Cómo manejo datos que necesitan estar en la BD?**  
R: Usa funciones helper que generen datos únicos para cada test.

```javascript
const user = createTestUser(); // Email único cada vez
```

---

**P: ¿Puedo crear nuevos fixtures?**  
R: Sí. Agrégalos en `__tests__/fixtures/index.js` manteniendo la organización.

---

## Resumen

✅ Usa fixtures para consistencia  
✅ Usa funciones helper para datos únicos  
✅ Separa válido de inválido  
✅ Documenta cambios  
✅ Mantén fixtures simples y focalizados  

---

**¿Preguntas?** Revisa los ejemplos o consulta con el equipo QA.
