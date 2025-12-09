# 🚀 PLAN DE ACCIÓN: De MVP a Producción (FASE 2-5)

## 📌 Objetivo
Llevar MiAppVentas desde MVP funcional (FASE 1.5) a Producción (FASE 5) en 4 semanas.

---

## SEMANA 1: Migración a Postgres + Prisma

### Lunes-Martes: Setup & Prisma Schema

**Tareas:**
1. Crear nuevo repo Postgres en Neon/Supabase
2. Instalar Prisma:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   npx prisma init
   ```

3. Crear `prisma/schema.prisma`:
```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int             @id @default(autoincrement())
  email         String          @unique
  passwordHash  String
  firstName     String
  lastName      String
  phone         String
  role          Role            @default(CUSTOMER)
  active        Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  addresses     Address[]
  orders        Order[]
  payments      Payment[]
  auditLogs     AuditLog[]
}

model Address {
  id            Int             @id @default(autoincrement())
  userId        Int
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  label         String?
  street        String
  city          String
  district      String?
  province      String?
  department    String?
  postalCode    String?
  lat           Float?
  lng           Float?
  isDefault     Boolean         @default(false)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  orders        Order[]
  @@index([userId])
}

model Category {
  id            Int             @id @default(autoincrement())
  name          String          @unique
  slug          String          @unique
  description   String?
  active        Boolean         @default(true)
  createdAt     DateTime        @default(now())
  
  products      Product[]
}

model Product {
  id            Int             @id @default(autoincrement())
  sku           String          @unique
  title         String
  description   String
  price         Int             // En centavos (39900 = S/. 399.00)
  originalPrice Int?
  categoryId    Int
  category      Category        @relation(fields: [categoryId], references: [id])
  stock         Int             @default(0)
  weight        Float?
  active        Boolean         @default(true)
  rating        Float           @default(0)
  reviewCount   Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  images        ProductImage[]
  features      ProductFeature[]
  orderItems    OrderItem[]
  inventory     InventoryItem[]
  reviews       Review[]
  
  @@index([categoryId])
}

model ProductImage {
  id            Int             @id @default(autoincrement())
  productId     Int
  product       Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  url           String
  alt           String?
  isPrimary     Boolean         @default(false)
  order         Int             @default(0)
  createdAt     DateTime        @default(now())
  
  @@index([productId])
}

model ProductFeature {
  id            Int             @id @default(autoincrement())
  productId     Int
  product       Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  feature       String
  
  @@index([productId])
}

model Review {
  id            Int             @id @default(autoincrement())
  productId     Int
  product       Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId        Int
  rating        Int             // 1-5
  title         String?
  content       String
  helpful       Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  @@index([productId])
  @@index([userId])
}

model Order {
  id            Int             @id @default(autoincrement())
  orderNumber   String          @unique
  userId        Int
  user          User            @relation(fields: [userId], references: [id])
  
  items         OrderItem[]
  
  shippingAddressId Int?
  shippingAddress   Address?    @relation(fields: [shippingAddressId], references: [id])
  
  shippingMethod  ShippingMethod @default(STANDARD)
  deliverySlot    String?
  
  subtotal      Int
  tax           Int
  shippingCost  Int
  total         Int
  
  status        OrderStatus     @default(PENDING)
  paymentStatus PaymentStatus   @default(PENDING)
  notes         String?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  payments      Payment[]
  auditLogs     AuditLog[]
  
  @@index([userId])
  @@index([status])
}

model OrderItem {
  id            Int             @id @default(autoincrement())
  orderId       Int
  order         Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId     Int
  product       Product         @relation(fields: [productId], references: [id])
  
  quantity      Int
  unitPrice     Int             // Precio en centavos
  subtotal      Int
  
  @@index([orderId])
  @@index([productId])
}

model Payment {
  id            Int             @id @default(autoincrement())
  orderId       Int
  order         Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  userId        Int
  user          User            @relation(fields: [userId], references: [id])
  
  provider      String          // "stripe", "mercadopago"
  providerId    String          // ID de transacción en el provider
  amount        Int             // En centavos
  
  status        PaymentStatus   @default(PENDING)
  metadata      Json?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  @@index([orderId])
  @@index([userId])
}

model InventoryItem {
  id            Int             @id @default(autoincrement())
  warehouseId   Int
  warehouse     Warehouse       @relation(fields: [warehouseId], references: [id])
  
  productId     Int
  product       Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  quantity      Int
  
  updatedAt     DateTime        @updatedAt
  
  @@unique([warehouseId, productId])
}

model Warehouse {
  id            Int             @id @default(autoincrement())
  name          String          @unique
  location      String
  latitude      Float?
  longitude     Float?
  active        Boolean         @default(true)
  
  inventory     InventoryItem[]
}

model Driver {
  id            Int             @id @default(autoincrement())
  name          String
  phone         String
  vehicle       String?
  status        DriverStatus    @default(AVAILABLE)
  currentLat    Float?
  currentLng    Float?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model AuditLog {
  id            Int             @id @default(autoincrement())
  userId        Int
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  orderId       Int?
  order         Order?          @relation(fields: [orderId], references: [id], onDelete: SetNull)
  
  action        String          // "order_created", "payment_completed", etc
  entity        String          // "order", "product"
  entityId      Int
  
  previousData  Json?
  newData       Json?
  
  createdAt     DateTime        @default(now())
  
  @@index([userId])
  @@index([createdAt])
}

// Enums
enum Role {
  CUSTOMER
  ADMIN
  SUPERADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum ShippingMethod {
  STANDARD
  EXPRESS
  PICKUP
}

enum DriverStatus {
  AVAILABLE
  BUSY
  OFFLINE
}
```

**Resultado:** Schema Prisma completo listo para migración.

---

### Miércoles-Jueves: Migración de Datos & Modelos

**Tareas:**
1. Crear script de migración MongoDB → Postgres:
```bash
npx prisma migrate dev --name init
```

2. Reemplazar Mongoose models con Prisma client en controllers:
```javascript
// ANTES (Mongoose)
const user = await User.findById(id);

// DESPUÉS (Prisma)
const user = await prisma.user.findUnique({ where: { id } });
```

3. Actualizar todos los controllers (userController, productController, etc)

**Resultado:** Backend migrando a Postgres + Prisma

---

### Viernes: Testing & Verificación

**Tareas:**
1. Ejecutar todos los tests con Postgres:
```bash
npm test
```

2. Seed de datos de prueba con Prisma:
```bash
npx prisma db seed
```

3. Verificar datos críticos (usuarios, productos, órdenes)

**Resultado:** Todos los tests verdes con Postgres

---

## SEMANA 2: Refactor a Services + Admin Panel

### Lunes-Martes: Refactor a Services

**Problema actual:**
```
Controllers contienen lógica de negocio + queries
→ Difícil de testear
→ Difícil de reutilizar
```

**Estructura nueva:**
```
/backend/src/
├── /controllers/      (solo routing)
├── /services/         (lógica de negocio)
├── /repositories/     (acceso a datos)
└── /validators/       (Zod schemas)
```

**Ejemplo refactor:**

```javascript
// ANTES: userController.js
export async function getUserProfile(req, res) {
  const user = await User.findById(req.user.id);
  const addresses = await Address.find({ userId: req.user.id });
  return res.json({ user, addresses });
}

// DESPUÉS: userService.js
export async function getUserProfileWithAddresses(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  });
}

// userController.js (solo routing)
export async function getUserProfile(req, res) {
  const data = await userService.getUserProfileWithAddresses(req.user.id);
  return res.json(data);
}
```

**Archivos a crear:**
- `/services/userService.js`
- `/services/productService.js`
- `/services/orderService.js`
- `/services/paymentService.js`
- `/repositories/userRepository.js`
- `/repositories/productRepository.js`
- `/validators/userValidator.js` (Zod)
- `/validators/productValidator.js` (Zod)

**Resultado:** Código más limpio y testeable

---

### Miércoles-Jueves: Admin Panel Frontend

**Frontend components:**
```
/frontend/src/pages/admin/
├── AdminDashboard.jsx      (overview de órdenes, productos)
├── AdminProducts.jsx       (CRUD productos)
├── AdminOrders.jsx         (gestión de órdenes)
├── AdminInventory.jsx      (stock management)
└── AdminUsers.jsx          (usuarios, roles)

/frontend/src/components/Admin/
├── OrderStatusBadge.jsx
├── ProductForm.jsx
├── OrderTable.jsx
└── InventoryChart.jsx
```

**Backend endpoints:**
```
GET  /api/admin/orders              (listado paginado)
GET  /api/admin/orders/:id          (detalle)
PATCH /api/admin/orders/:id/status  (actualizar estado)

GET  /api/admin/products            (listado)
POST /api/admin/products            (crear)
PUT  /api/admin/products/:id        (actualizar)
DELETE /api/admin/products/:id      (eliminar)

GET  /api/admin/inventory           (stock por warehouse)
PATCH /api/admin/inventory/:productId (ajustar qty)

GET  /api/admin/analytics           (KPIs básicos)
```

**Middleware protección:**
```javascript
// authMiddleware.js - verificar admin role
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

// Usar en rutas
router.get('/admin/orders', authenticateToken, requireAdmin, adminOrdersHandler);
```

**Resultado:** Admin panel totalmente funcional

---

### Viernes: Integration Testing

**Tareas:**
1. Tests de services:
```javascript
describe('UserService', () => {
  test('getUserProfileWithAddresses retorna usuario con addresses', async () => {
    const user = await userService.getUserProfileWithAddresses(testUserId);
    expect(user.addresses).toBeDefined();
  });
});
```

2. E2E test (Playwright):
```javascript
test('Admin puede crear producto', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/products');
  await page.fill('input[name="title"]', 'Nuevo producto');
  await page.click('button:has-text("Crear")');
  await expect(page).toHaveURL('/admin/products');
});
```

**Resultado:** Tests cobriendo nuevo flujo admin

---

## SEMANA 3: Seguridad & Validación

### Lunes: JWT Refresh Token + httpOnly Cookies

**Problema actual:**
- JWT almacenado en localStorage (XSS vulnerable)
- Sin refresh token (debe re-login si expira)

**Solución:**
```javascript
// Backend: authController.js
export async function login(req, res) {
  // Validación...
  const user = await userService.getUserByEmail(email);
  
  // Tokens
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  // httpOnly cookie (no accesible desde JS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
  
  return res.json({
    accessToken,
    user: { id: user.id, email: user.email, role: user.role }
  });
}

// Refresh token endpoint
export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

```javascript
// Frontend: API interceptor
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Resultado:** Seguridad mejorada sin comprometer UX

---

### Martes-Miércoles: Zod Validation

**Instalación:**
```bash
npm install zod
```

**Esquemas:**
```javascript
// validators/userValidator.js
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^\+?[0-9]{9,}/)
});

export const createProductSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  price: z.number().positive(),
  categoryId: z.number().positive(),
  stock: z.number().min(0),
  sku: z.string().unique()
});
```

**Middleware validador:**
```javascript
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
  };
}

// Uso
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);
```

**Resultado:** Validación centralizada y segura

---

### Jueves-Viernes: Rate Limiting & CORS

**Rate limiting:**
```bash
npm install express-rate-limit
```

```javascript
// Backend: middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100 // 100 requests por minuto
});

// Uso
router.post('/login', loginLimiter, authController.login);
app.use('/api/', apiLimiter);
```

**CORS mejorado:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Para cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Resultado:** Protección contra ataques comunes

---

## SEMANA 4: Docker + CI/CD + Deploy

### Lunes: Docker Setup

**Backend Dockerfile:**
```dockerfile
# Dockerfile (backend)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Multi-stage: runtime
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
# Dockerfile (frontend)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx para servir
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: miappventas
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: miappventas
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://miappventas:${DB_PASSWORD}@postgres:5432/miappventas
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Resultado:** Stack completamente containerizado

---

### Martes-Miércoles: GitHub Actions CI/CD

**`.github/workflows/ci-cd.yml`:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/miappventas-backend:latest

      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/miappventas-frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Railway
        run: |
          curl -X POST https://api.railway.app/deploy \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"service": "miappventas"}'
```

**Resultado:** Pipeline automático de CI/CD

---

### Jueves-Viernes: Deploy a Staging

**Plataforma recomendada: Railway.app**

**Steps:**
1. Crear cuenta en Railway
2. Conectar repo GitHub
3. Configurar variables de entorno
4. Deploy automático en cada push a `main`

**URL Staging:** `https://miappventas-staging.railway.app`

**Verificación Post-Deploy:**
```bash
curl https://miappventas-staging.railway.app/api/health
# Respuesta: { "status": "ok", "db": "connected" }
```

**Resultado:** App deployada en staging con CI/CD automático

---

## 📊 Checklist de Completitud

- [ ] SEMANA 1: Postgres + Prisma migrado (todos tests verdes)
- [ ] SEMANA 2: Services layer + Admin Panel completo
- [ ] SEMANA 3: Refresh tokens + Zod validation + Rate limiting
- [ ] SEMANA 4: Docker + GitHub Actions + Deploy staging

**Bonus (Semana 5+):**
- [ ] Images upload (Cloudinary)
- [ ] Email notifications (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Analytics (Mixpanel / Plausible)
- [ ] Sentry monitoring
- [ ] Monitoring de queries lentas (DataDog)

---

## 💰 Estimación de Costos (Post-Deploy)

| Servicio | Plan | Costo/mes |
|---|---|---|
| **Railway** (Backend + DB) | Starter | $5-50 |
| **Vercel** (Frontend) | Hobby | Gratis |
| **Stripe** | Pay-as-you-go | 2.9% + $0.30 |
| **Cloudinary** (Images) | Free | Gratis (hasta 25GB) |
| **SendGrid** (Email) | Free | Gratis (hasta 100/día) |
| **Sentry** (Monitoring) | Free | Gratis |
| **Domain + SSL** (Cloudflare) | - | $0-5 |
| **Total** | | **$10-60/mes** |

---

## 🎯 KPIs a Medir (Post-Launch)

```
Semana 1-2:
- Traffic: 100+ visitas
- Conversion rate: 2-5%
- Average order value: S/. 150-300

Semana 3-4:
- CAC (Cost per Acquisition)
- ROAS (Return on Ad Spend) si hacemos ads
- Customer retention: 10-15%

Mes 1+:
- Monthly Recurring Revenue (MRR)
- Lifetime Value (LTV)
- Churn rate
```

---

