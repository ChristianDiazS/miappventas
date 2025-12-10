# ⚙️ Backend - MiAppVentas

API REST desarrollada con Node.js y Express para MiAppVentas.

---

## 📋 Descripción

Backend robusto que proporciona todos los endpoints necesarios para gestionar ventas, productos, órdenes e inventario. Incluye autenticación JWT, validación de datos, y manejo de errores.

---

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL 17** - Base de datos
- **Prisma ORM** - Database access layer
- **Jest** - Testing
- **JWT** - Autenticación
- **Joi** - Validación

---

## 📁 Estructura

```
backend/
├── src/
│   ├── routes/              # Rutas API
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── models/              # Modelos/tipos
│   ├── middleware/          # Middleware Express
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/               # Funciones utilitarias
│   ├── config/              # Configuración
│   ├── app.js
│   └── server.js
├── prisma/
│   └── schema.prisma        # Schema de base de datos
├── __tests__/               # Tests
├── jest.config.js
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Instalación

```bash
npm install --legacy-peer-deps
```

### Configuración BD

```bash
# Crear .env
DATABASE_URL="postgresql://user:password@localhost:5432/miappventas"

# Ejecutar migraciones
npm run migrate

# Seed datos iniciales
npm run seed
```

### Desarrollo

```bash
npm run dev
```

API disponible en `http://localhost:5000`

---

## 🧪 Testing

```bash
npm test                    # Todos los tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Con cobertura
```

**Coverage actual:** 81.6% ✓

---

## 📚 API Endpoints

### Autenticación
```
POST   /api/auth/login      # Login
POST   /api/auth/register   # Registro
POST   /api/auth/refresh    # Refresh token
POST   /api/auth/logout     # Logout
```

### Productos
```
GET    /api/products        # Listar productos
GET    /api/products/:id    # Obtener producto
POST   /api/products        # Crear producto
PUT    /api/products/:id    # Actualizar producto
DELETE /api/products/:id    # Eliminar producto
```

### Órdenes
```
GET    /api/orders          # Listar órdenes
GET    /api/orders/:id      # Obtener orden
POST   /api/orders          # Crear orden
PUT    /api/orders/:id      # Actualizar orden
DELETE /api/orders/:id      # Eliminar orden
```

### Usuarios
```
GET    /api/users/:id       # Obtener usuario
PUT    /api/users/:id       # Actualizar usuario
DELETE /api/users/:id       # Eliminar usuario
```

---

## 🔐 Autenticación

Usa JWT (JSON Web Tokens):

```javascript
// Headers requerido
Authorization: Bearer <token>

// Token se obtiene en login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## 🗄️ Base de Datos

### Modelo de datos

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  orders    Order[]
  createdAt DateTime  @default(now())
}

model Product {
  id        String    @id @default(cuid())
  name      String
  price     Float
  stock     Int
  category  String
  orders    OrderItem[]
  createdAt DateTime  @default(now())
}

model Order {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  items     OrderItem[]
  total     Float
  status    String    @default("pending")
  createdAt DateTime  @default(now())
}

model OrderItem {
  id        String    @id @default(cuid())
  orderId   String
  order     Order     @relation(fields: [orderId], references: [id])
  productId String
  product   Product   @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}
```

---

## 📝 Scripts

```bash
npm run dev              # Desarrollo con nodemon
npm start                # Producción
npm test                 # Tests
npm run test:coverage    # Tests con cobertura
npm run migrate          # Ejecutar migraciones
npm run seed             # Seed datos iniciales
npm run studio           # Abrir Prisma Studio
npm run lint             # ESLint
npm run lint:fix         # Arreglar errores
```

---

## 🔧 Configuración

### Variables de Entorno

```
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/miappventas

# JWT
JWT_SECRET=tu_secret_key_muy_segura
JWT_REFRESH_SECRET=tu_refresh_secret_key

# Server
NODE_ENV=development
PORT=5000

# Email (opcional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

---

## 🚨 Manejo de Errores

```javascript
// Error response standard
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Producto no encontrado",
    "statusCode": 404
  }
}

// Success response standard
{
  "success": true,
  "data": { ... }
}
```

---

## 🤝 Contribuir

1. Crear rama feature (`git checkout -b feature/endpoint-name`)
2. Commit cambios (`git commit -am 'Add new endpoint'`)
3. Push (`git push origin feature/endpoint-name`)
4. Pull Request

### Requisitos
- ✅ Tests deben pasar
- ✅ Coverage > 80%
- ✅ Validaciones en controllers
- ✅ Documentación de endpoints

---

**Última actualización:** Diciembre 2025
