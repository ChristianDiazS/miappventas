# 🚀 PLAN DE ACCIÓN - CHECKLIST LANZAMIENTO

## Fase 1: LIMPIEZA Y SEGURIDAD (30 minutos)

### 1.1 Eliminar Archivos Temporales

```bash
# Backend - Scripts de verificación
rm backend/checkPeluches.js
rm backend/checkAnilloFantasia1.js
rm backend/checkAnilloProducts.js
rm backend/checkAreteAnilloImages.js
rm backend/checkAreteProducts.js
rm backend/checkCategories.js
rm backend/checkCloudinaryImages.js
rm backend/checkDijeCategory.js
rm backend/checkDijeCloudinaryUrls.js
rm backend/checkDijeImages.js
rm backend/checkDijes.js
rm backend/checkImages.js
rm backend/checkUserRole.js
rm backend/checkAdminUsers.js

# Backend - Scripts de setup/debug
rm backend/create-test-superadmin.js
rm backend/createAnilloCategory.js
rm backend/createComboProducts.js
rm backend/generateAreteProducts.js
rm backend/generateDijeProducts.js
rm backend/generateJoyeriaProducts.js
rm backend/debug-server.js
rm backend/debugAdminAuth.js
rm backend/debugAnilloFilter.js
rm backend/debugDijeImages.js
rm backend/debugDijeImages2.js
rm backend/delete-anillos.js
rm backend/deleteCategory.js
rm backend/deleteDijeProduct.js
rm backend/deleteDuplicateImage.js
rm backend/findDijeWithImage22.js
rm backend/fixAnilloFantasia1.js
rm backend/resetDatabase.js
rm backend/simulateControllerQuery.js
rm backend/simple-express-server.js
rm backend/simple-server.js
rm backend/testAnilloAPI.mjs
rm backend/testAPIResponse.js
rm backend/testDijesAPI.js
rm backend/testing-file-output.js
rm backend/testing-superadmin-v2.js

# Backend - Logs y reportes temporales
rm backend/*.txt
rm backend/COMPLETION_REPORT.md
rm backend/COVERAGE_ANALYSIS.md
rm backend/FIXTURES_CREATED.md
rm backend/ITERACION_5_RESUMEN.md
rm backend/STATUS_FINAL.md
rm backend/TEST_SUMMARY.md

# Raíz - Archivos temporales
rm test-cloudinary.js
rm upload-decoracion-bano.js
rm uploadToCloudinary.js
rm temp_github_readme.txt
rm ESTADO_FINAL_PROYECTO.md
rm PROJECT_PROGRESS.md
rm README_COMBOS.txt

# Frontend
rm frontend/test-output.txt

# Scripts batch para desarrollo local (opcional - mantener solo si usas)
# rm start-all.bat
# rm start-all.sh
```

**Status:** ☐ Completado

---

### 1.2 Verificar y Actualizar .gitignore

```bash
# Crear/actualizar .gitignore en raíz

# Dependencies
node_modules/
.pnp

# Production
dist/
build/
coverage/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Development
.env.development.local
Postman_*.json
*.sql

# Testing
coverage/
.nyc_output/

# Build artifacts
*.tsbuildinfo
```

**Status:** ☐ Completado

---

### 1.3 Remover Credenciales de Git

```bash
# Si .env fue commiteado:
git rm --cached .env
git commit -m "Remove .env file (credentials exposed)"

# Force push if already pushed (cuidado!)
git push origin main --force

# Regenerar ALL secrets en producción:
# - STRIPE_SECRET_KEY
# - JWT_SECRET
# - CLOUDINARY_API_KEY
# - DATABASE_URL
# - CLOUDINARY_API_SECRET
```

**Status:** ☐ Completado

---

## Fase 2: SEGURIDAD (1 hora)

### 2.1 Crear .env.example

Archivo: `backend/.env.example`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/miappventas"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="7d"
JWT_REFRESH_EXPIRY="30d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="dy73lxudf"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Server
NODE_ENV="development"
PORT=5000
API_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Logging
LOG_LEVEL="debug"
LOG_FILE="logs/app.log"

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Archivo: `frontend/.env.example`

```env
VITE_API_URL="http://localhost:5000"
VITE_CLOUDINARY_CLOUD_NAME="dy73lxudf"
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

**Status:** ☐ Completado

---

### 2.2 Agregar Logging Centralizado

Archivo: `backend/src/lib/logger.js`

```javascript
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../../logs');

// Crear directorio de logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

class Logger {
  constructor(module) {
    this.module = module;
  }

  log(level, message, data = {}) {
    if (levels[level] > levels[process.env.LOG_LEVEL || 'info']) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      module: this.module,
      message,
      ...(Object.keys(data).length > 0 && { data })
    };

    // Evitar loguear datos sensibles
    if (data.password) delete logEntry.data.password;
    if (data.token) delete logEntry.data.token;

    const logString = JSON.stringify(logEntry);

    // Console (development)
    if (process.env.NODE_ENV !== 'production') {
      const colorCode = colors[level] || colors.reset;
      console.log(`${colorCode}[${level.toUpperCase()}]${colors.reset} ${message}`);
    }

    // File (production)
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, `${level}.log`),
        logString + '\n'
      );
    }
  }

  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  debug(message, data) { this.log('debug', message, data); }
}

module.exports = (module) => new Logger(module);
```

**Usage:**
```javascript
const logger = require('./lib/logger')(__filename);
logger.info('Server started', { port: 5000 });
logger.error('Database error', { error: err.message });
```

**Status:** ☐ Completado

---

### 2.3 Agregar Health Check Endpoint

Archivo: `backend/src/routes/health.js`

```javascript
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const logger = require('../lib/logger')(__filename);

router.get('/', async (req, res) => {
  try {
    // Verificar DB
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
```

En `backend/src/app.js`:
```javascript
app.use('/health', require('./routes/health'));
```

**Status:** ☐ Completado

---

## Fase 3: DOCUMENTACIÓN (1-2 horas)

### 3.1 Crear DEPLOYMENT.md

Archivo: `docs/DEPLOYMENT.md`

```markdown
# 🚀 Guía de Despliegue - MiAppVentas

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado
- Cuenta en Cloudinary (existe)
- Cuenta en Stripe (existe)
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Dominio DNS configurado

## Opción 1: Despliegue en Heroku

\`\`\`bash
# 1. Instalar Heroku CLI
# 2. Hacer login
heroku login

# 3. Crear app
heroku create miappventas

# 4. Agregar PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 5. Establecer variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-strong-secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set CLOUDINARY_CLOUD_NAME=dy73lxudf
heroku config:set CLOUDINARY_API_KEY=...

# 6. Deploy
git push heroku main

# 7. Ver logs
heroku logs --tail
\`\`\`

## Opción 2: Despliegue en AWS EC2

[Ver archivo completo]

## Opción 3: Despliegue con Docker

[Ver archivo completo]

## Post-Despliegue

- [ ] Verificar /health endpoint
- [ ] Verificar logs
- [ ] Ejecutar migraciones: \`npm run migrate:prod\`
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo
```

**Status:** ☐ Completado

---

### 3.2 Crear SETUP.md

Archivo: `docs/SETUP.md`

```markdown
# 🔧 Guía de Configuración Local - MiAppVentas

## Instalación

\`\`\`bash
# 1. Clonar repo
git clone <repo-url>
cd MiAppVentas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar backend/.env y completar valores

# 4. Inicializar BD
npm run db:migrate

# 5. Ejecutar proyecto
npm run dev
\`\`\`

## Estructura Base de Datos

Las migraciones están en \`backend/prisma/migrations/\`

Para ver esquema actual:
\`\`\`bash
npm run db:schema
\`\`\`

## Troubleshooting

- Error de conexión DB: Verificar DATABASE_URL
- Puerto 5000 en uso: \`lsof -i :5000\` y matar proceso
- Error de Cloudinary: Verificar API_KEY y API_SECRET
```

**Status:** ☐ Completado

---

## Fase 4: MONITOREO BÁSICO (1 hora)

### 4.1 Agregar Graceful Shutdown

Archivo: `backend/server.js` (actualizar)

```javascript
// ... código existente ...

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
```

**Status:** ☐ Completado

---

### 4.2 Agregar Sentry para Error Tracking

```bash
npm install @sentry/node

# En backend/src/app.js (al inicio):
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Status:** ☐ Completado

---

## Fase 5: BASE DE DATOS (30 mins)

### 5.1 Agregar Índices de Base de Datos

Crear archivo: `backend/prisma/migrations/[timestamp]_add_indexes/migration.sql`

```sql
-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_category_id ON "Product"(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON "Product"(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON "Product"(created_at);

-- Índices para órdenes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON "Order"(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON "Order"(created_at);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON "User"(role);

-- Índices para carrito
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON "CartItem"(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON "CartItem"(product_id);
```

Ejecutar:
```bash
npm run db:migrate
```

**Status:** ☐ Completado

---

### 5.2 Configurar Backups

```bash
# En servidor production (cron job diario)
# Editar: crontab -e

# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-db.sh

# Crear backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql
# Subir a S3 (opcional)
aws s3 cp /backups/db_$DATE.sql.gz s3://miappventas-backups/
```

**Status:** ☐ Completado

---

## Fase 6: PERFORMANCE (opcional, semana 1)

### 6.1 Agregar Compresión Gzip

En `backend/src/app.js`:
```javascript
const compression = require('compression');
app.use(compression()); // Debe ir después de Helmet
```

```bash
npm install compression
```

**Status:** ☐ Completado

---

### 6.2 Lazy Loading en Frontend

En `frontend/src/App.jsx`:
```javascript
import { Suspense, lazy } from 'react';

const Products = lazy(() => import('./pages/Products'));
const Peluches = lazy(() => import('./pages/Peluches'));
const DecoracionBano = lazy(() => import('./pages/DecoracionBano'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/peluches" element={<Peluches />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**Status:** ☐ Completado

---

## RESUMEN - Orden de Ejecución

### Semana 1 (ANTES DE PRODUCCIÓN)

- [ ] Fase 1: Limpieza (30 mins)
- [ ] Fase 2: Seguridad (1 hora)
- [ ] Fase 3: Documentación (1-2 horas)
- [ ] Fase 4: Monitoreo (1 hora)
- [ ] Fase 5: Base de Datos (30 mins)
- [ ] **Total: ~4-5 horas de trabajo**

### Semana 2 (POST-LANZAMIENTO)

- [ ] Fase 6: Performance
- [ ] Implementar Redis caché
- [ ] Agregar tests básicos
- [ ] Configurar CI/CD

### Semana 3-4

- [ ] E2E tests
- [ ] Load testing
- [ ] Security audit
- [ ] Optimización

---

**Próximo paso:** Ejecutar Fase 1 para limpiar el proyecto

