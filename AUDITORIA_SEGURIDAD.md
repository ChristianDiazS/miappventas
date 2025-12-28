# 🔐 AUDITORÍA DE SEGURIDAD - MiAppVentas

## 1. VULNERABILIDADES CRÍTICAS IDENTIFICADAS

### 1.1 ❌ CRÍTICA: Credenciales Expuestas en el Código

**Ubicación:** Varios archivos con Cloudinary/Stripe hardcodeado

**Riesgo:** Cualquiera puede acceder a:
- Cuentas de Cloudinary
- API keys de Stripe
- Base de datos de producción

**Verificación:**
```bash
# Buscar en código
grep -r "sk_live" ./backend ./frontend
grep -r "pk_live" ./backend ./frontend
grep -r "cloudinary_api_key" ./backend ./frontend
grep -r "DATABASE_URL" .env
```

**Remediación:**
```bash
# 1. Regenerar TODAS las API keys en:
# - Stripe dashboard
# - Cloudinary dashboard
# - Crear nueva .env

# 2. Verificar que .env no está en git
git log --all -- .env  # Si aparece, historial comprometido

# 3. Si fue commiteado, limpiar historial
# (requiere force push - CUIDADO)
```

---

### 1.2 ❌ CRÍTICA: Logs Exponen Información Sensible

**Ubicación:** Múltiples console.log() en código

**Ejemplo problemático:**
```javascript
console.log('User login:', { email, password, token }); // ❌ MAL
```

**Riesgo:** 
- Tokens visibles en logs
- Contraseñas en logs
- Información de BD en logs

**Remediación:**
```bash
# Buscar logs problemáticos
grep -r "console.log" backend/src --include="*.js" | head -20

# Reemplazar con logger seguro
# Use la clase Logger creada en plan de acción
```

---

### 1.3 ❌ IMPORTANTE: Swagger/Docs Expuesto en Producción

**Riesgo:** 
- Expone toda la estructura API
- Revela endpoints internos
- Facilita ataques dirigidos

**Remediación:**

```javascript
// En backend/src/app.js

// Swagger solo en development
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocs = require('./swagger-config');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}
```

---

### 1.4 ❌ IMPORTANTE: Debug Routes Activas

**Ubicación:** Posibles rutas de debug en `backend/src/routes/debug.js`

**Riesgo:**
- Acceso a información interna
- Control remoto del servidor
- Bypass de autenticación

**Verificación:**
```bash
find ./backend -name "*debug*" -type f
grep -r "router.get.*admin" ./backend/src
```

**Remediación:**
```javascript
// Envolver rutas de debug
if (process.env.NODE_ENV === 'development') {
  app.use('/debug', require('./routes/debug'));
} else {
  app.use('/debug', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}
```

---

## 2. VULNERABILIDADES ALTAS

### 2.1 ⚠️ ALTA: JWT Secret Débil o Hardcodeado

**Verificación:**
```bash
# Buscar JWT_SECRET en código
grep -r "JWT_SECRET" ./backend --include="*.js"

# Ver si es un valor fuerte
echo "sk_test_..." | wc -c  # Debe ser > 32 caracteres
```

**Requisitos:**
- Mínimo 32 caracteres
- Caracteres aleatorios
- Renovado cada 3 meses
- Diferente para dev/prod

**Remediación:**
```bash
# Generar secret fuerte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Actualizar .env
JWT_SECRET="<output-anterior>"
```

---

### 2.2 ⚠️ ALTA: Falta de Rate Limiting en Rutas Críticas

**Verificación:**
```bash
# Buscar rutas sensibles sin rate limit
grep -r "router.post.*login" ./backend/src
grep -r "router.post.*register" ./backend/src
grep -r "router.post.*password" ./backend/src
```

**Remediación:**

```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Login: 5 intentos por 15 minutos
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip
});

// Password reset: 3 intentos por hora
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Demasiados intentos de reset'
});

// En rutas:
router.post('/login', loginLimiter, authController.login);
router.post('/password-reset', passwordResetLimiter, authController.resetPassword);
```

---

### 2.3 ⚠️ ALTA: Validación Incompleta de Inputs

**Riesgo:** XSS, SQL Injection, NoSQL Injection

**Verificación:**
```bash
# Buscar rutas sin validación
grep -r "router.post\|router.put\|router.patch" ./backend/src | \
  grep -v "validator" | head -20
```

**Remediación:**

```javascript
// backend/src/validators/productValidator.js
const { body, validationResult } = require('express-validator');

exports.validateCreateProduct = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title debe tener 3-100 caracteres'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price debe ser un número positivo'),
  
  body('description')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description muy larga'),
  
  body('image_url')
    .isURL()
    .withMessage('URL de imagen inválida'),
  
  // Middleware para manejar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// En ruta:
router.post(
  '/products',
  authenticateToken,
  validateCreateProduct,
  productController.create
);
```

---

### 2.4 ⚠️ ALTA: CORS Demasiado Permisivo

**Verificación:**

```bash
grep -A5 "cors" backend/src/app.js
```

**Riesgo:** Si está `origin: '*'` o sin whitelist

**Remediación:**

```javascript
// backend/src/config/cors.js
const ALLOWED_ORIGINS = [
  'https://miappventas.com',           // Production
  'https://www.miappventas.com',
  'http://localhost:3000',             // Development
  'http://127.0.0.1:3000'
];

if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:5173'); // Vite
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin (mobile apps, Postman, etc)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed by policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;

// En app.js:
const cors = require('cors');
const corsOptions = require('./config/cors');
app.use(cors(corsOptions));
```

---

## 3. VULNERABILIDADES MEDIAS

### 3.1 ⚠️ MEDIA: Password Requirements Débiles

**Verificación:**
```bash
grep -r "password" backend/src/validators --include="*.js" | grep -i "length\|regex"
```

**Requisitos mínimos para producción:**
- Mínimo 8 caracteres
- Debe contener mayúsculas y minúsculas
- Debe contener números
- Debe contener caracteres especiales

**Remediación:**

```javascript
// backend/src/validators/authValidator.js
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.validatePassword = [
  body('password')
    .matches(passwordRegex)
    .withMessage('Password debe tener: 8+ caracteres, mayúsculas, minúsculas, números y símbolos (@$!%*?&)')
];

// Frontend hint:
const passwordRules = "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo";
```

---

### 3.2 ⚠️ MEDIA: Falta HTTPS Enforcement

**Verificación:**

```bash
grep -r "https\|HTTPS" backend/src/app.js
```

**Remediación:**

```javascript
// backend/src/middleware/https.js
function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
  }
  next();
}

// En app.js (después de helmet):
app.use(enforceHttps);
```

**Con Nginx reverse proxy:**
```nginx
server {
  listen 80;
  server_name api.miappventas.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.miappventas.com;
  
  ssl_certificate /etc/letsencrypt/live/api.miappventas.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.miappventas.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  
  # ... rest of config
}
```

---

### 3.3 ⚠️ MEDIA: Falta de CSRF Protection

**Riesgo:** En POST/PUT/DELETE sin validación

**Remediación:**

```bash
npm install csurf
```

```javascript
// backend/src/middleware/csrf.js
const csrf = require('csurf');

// CSRF protection - token en cookies
module.exports = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true,
    sameSite: 'strict'
  }
});

// En app.js:
const csrfProtection = require('./middleware/csrf');
app.use(csrfProtection);

// Pasar token al frontend:
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend debe incluir en headers:
// X-CSRF-Token: <token>
```

---

### 3.4 ⚠️ MEDIA: Falta de Input Size Limits

**Riesgo:** DoS attacks, memory exhaustion

**Remediación:**

```javascript
// En backend/src/app.js
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// En rutas de upload:
const multer = require('multer');
const upload = multer({ 
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

router.post('/upload', upload.single('image'), imageController.upload);
```

---

## 4. VERIFICACIÓN POST-REMEDIACIÓN

### Checklist de Seguridad

```markdown
- [ ] .env NO está en git (verificar: git log --all -- .env)
- [ ] .env.example creado con todos los campos
- [ ] Swagger deshabilitado en producción
- [ ] Debug routes deshabilitadas en producción
- [ ] JWT_SECRET fuerte y regenerado
- [ ] HTTPS enforcement implementado
- [ ] CORS whitelist configurado
- [ ] Rate limiting en login/password reset
- [ ] Validación de inputs en todas las rutas
- [ ] CSRF protection habilitada
- [ ] Password requirements implementados
- [ ] Logging no expone datos sensibles
- [ ] Input size limits configurados
- [ ] Helmet configurado completamente
- [ ] Cookies con httpOnly y secure flags
- [ ] SQL queries usando ORM (Prisma)
- [ ] Error handling no expone stack traces
- [ ] API no devuelve información sensible
```

---

## 5. ESCANEO DE SEGURIDAD AUTOMATIZADO

### Usando OWASP ZAP (recomendado)

```bash
# Instalar ZAP
# https://www.zaproxy.org/

# Ejecutar escaneo
zaproxy -cmd -quickurl http://localhost:5000 -quickout security-report.html
```

### Usando npm audit

```bash
# Auditar dependencias
npm audit

# Corregir automáticamente
npm audit fix

# Forzar correción (puede romper dependencias)
npm audit fix --force
```

### Usando Snyk

```bash
npm install -g snyk
snyk auth
snyk test
snyk monitor
```

---

## 6. TABLA DE REMEDIACIÓN RÁPIDA

| Vulnerabilidad | Severidad | Tiempo | Prioridad |
|---|---|---|---|
| Credenciales expuestas | CRÍTICA | 15 min | NOW |
| Swagger en prod | CRÍTICA | 5 min | NOW |
| Debug routes activas | CRÍTICA | 5 min | NOW |
| JWT secret débil | ALTA | 10 min | Hoy |
| Rate limiting incompleto | ALTA | 20 min | Hoy |
| Validación incompleta | ALTA | 1 hora | Hoy |
| CORS permisivo | ALTA | 15 min | Hoy |
| Password requirements | MEDIA | 20 min | Hoy |
| HTTPS no enforced | MEDIA | 30 min | Esta semana |
| CSRF no implementado | MEDIA | 30 min | Esta semana |
| Input size limits | MEDIA | 15 min | Esta semana |

---

## 7. AUDITORÍA EXTERNA RECOMENDADA

**Antes de producción final:**
- [ ] Pentest (ethical hacking)
- [ ] Escaneo OWASP ZAP
- [ ] Auditoría de código de seguridad
- [ ] Testeo de autenticación

**Proveedores recomendados:**
- OWASP (gratis)
- Snyk (freemium)
- CloudFlare (si usas CDN)
- AWS Security Hub (si estás en AWS)

---

## 8. MONITOREO CONTINUO

```javascript
// Agregar a backend/src/app.js

// 1. Helmet con strict rules
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.stripe.com']
  }
}));

// 2. Logging de intentos sospechosos
app.use((req, res, next) => {
  if (req.path.includes('admin') || req.path.includes('api/admin')) {
    logger.warn('Admin access attempt', {
      ip: req.ip,
      path: req.path,
      user: req.user?.id || 'anonymous'
    });
  }
  next();
});

// 3. Monitorear intentos fallidos
app.use((err, req, res, next) => {
  if (err.status === 401 || err.status === 403) {
    logger.warn('Authentication failure', {
      ip: req.ip,
      path: req.path,
      error: err.message
    });
  }
  next(err);
});
```

---

**Fecha de última auditoría:** [Completar]
**Próxima auditoría recomendada:** 30 días post-lanzamiento
**Responsable de seguridad:** [Asignar]

