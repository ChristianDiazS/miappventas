# 👋 GUÍA PARA EL PRÓXIMO DESARROLLADOR

Bienvenido a **MiAppVentas**. Este documento te guiará paso a paso a través del proyecto.

---

## 🚀 Paso 1: Entender qué es MiAppVentas

**MiAppVentas** es una plataforma completa de ventas que incluye:

- 🔐 **Autenticación JWT** - Login, registro, tokens seguros
- 🛒 **Gestión de Productos** - CRUD, búsqueda, filtrado
- 📦 **Gestión de Órdenes** - Crear, actualizar, seguimiento
- 👤 **Perfiles de Usuario** - Datos, favoritos, historial
- 💳 **Pagos con Izipay** - Integración completa de pagos
- 🪝 **Webhooks** - Eventos de pago en tiempo real
- 📊 **Monitoreo 24/7** - Logs, métricas, alertas
- 🚀 **CI/CD Automático** - GitHub Actions (test, lint, deploy)

---

## 📚 Paso 2: Leer la Documentación

### Comienza Por:

1. **[SESION_FINAL_RESUMEN.md](./SESION_FINAL_RESUMEN.md)** (5 min)
   - ¿Qué se completó?
   - ¿Cuáles son los números?
   - ¿Cuál es el status?

2. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** (10 min)
   - Overview general
   - Estructura del proyecto
   - Technology stack

3. **[INDICE_DOCUMENTACION_FINAL.md](./INDICE_DOCUMENTACION_FINAL.md)** (5 min)
   - Índice de toda la documentación
   - Dónde encontrar qué

### Después, Lee:

4. **[GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)** (15 min)
   - Cómo funcionan los workflows
   - Cómo configurar secretos
   - Cómo ver resultados

5. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** (20 min)
   - Cómo setup local
   - Cómo desplegar
   - Cómo hacer rollback

---

## 💻 Paso 3: Setup Local Development

### 3.1 Requisitos Previos

```bash
# Verifica que tengas instalado:
node --version          # Debe ser v18.x o superior
npm --version           # Debe ser 9.x o superior
git --version           # Para clonar el repo
```

Si no tienes estos, instálalos desde:
- [Node.js](https://nodejs.org/) - Incluye npm
- [Git](https://git-scm.com/)

### 3.2 Clonar el Repositorio

```bash
# Clona el proyecto
git clone https://github.com/your-username/miappventas.git

# Entra en el directorio
cd miappventas
```

### 3.3 Instalar Dependencias

```bash
# Instala todas las dependencias
npm install

# Si tarda mucho, prueba:
npm install --legacy-peer-deps
```

### 3.4 Configurar Base de Datos

```bash
# Necesitas PostgreSQL 17.7 corriendo
# En Windows:
# - Instala PostgreSQL desde: https://www.postgresql.org/download/windows/
# - Crea una database llamada "miappventas"
# - Anota las credenciales

# Crear archivo .env.local
cp .env.example .env.local

# Edita .env.local con:
DATABASE_URL=postgresql://username:password@localhost:5432/miappventas

# Ejecuta las migraciones
npm run prisma:migrate
```

### 3.5 Verificar Setup

```bash
# Ejecuta los tests
npm test

# Deberías ver:
# Test Suites: 13 passed, 13 total
# Tests:       326 passed, 326 total

# Si todo pasó, ¡estás listo!
```

---

## 🎯 Paso 4: Entender la Estructura del Código

### Directorios Principales

```
src/
├── controllers/          # Lógica de negocio
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── userController.js
│   └── webhookController.js
│
├── routes/              # Definiciones de endpoints
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── users.js
│   └── webhooks.js
│
├── middleware/          # Middleware Express
│   ├── authMiddleware.js      # JWT validation
│   ├── errorHandler.js        # Error handling
│   ├── securityHeaders.js     # HTTP headers
│   └── webhookLogger.js       # Logging
│
├── services/            # Servicios externos
│   └── izipayService.js       # Payment provider
│
├── models/              # Prisma schema
│   └── schema.prisma
│
└── app.js              # Aplicación Express
```

### Archivos Importantes

| Archivo | Propósito |
|---------|----------|
| `src/app.js` | Punto de entrada, configura Express |
| `package.json` | Dependencias y scripts |
| `.env.example` | Variables de entorno requeridas |
| `prisma/schema.prisma` | Definición de modelos |

---

## 🧪 Paso 5: Ejecutar Comandos Útiles

### Desarrollo

```bash
# Inicia el servidor en modo desarrollo
npm run dev

# En otra terminal, ahora puedes:
curl http://localhost:3000/api/health
```

### Testing

```bash
# Ejecuta todos los tests
npm test

# Ejecuta tests en watch mode (se recarga automáticamente)
npm test -- --watch

# Ejecuta solo un archivo de tests
npm test -- webhooks-strategy1.test.js

# Ejecuta con coverage
npm test -- --coverage
```

### Linting

```bash
# Verifica estilos de código
npm run lint

# Arregla automáticamente algunos errores
npm run lint -- --fix
```

### Base de Datos

```bash
# Ver estado actual de migraciones
npm run prisma:status

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (interfaz gráfica)
npm run prisma:studio
```

---

## 🔄 Paso 6: Git Workflow

### Workflow Recomendado

```bash
# 1. Asegúrate de estar en main y actualizado
git checkout main
git pull origin main

# 2. Crea una rama para tu feature
git checkout -b feature/my-awesome-feature

# 3. Haz cambios, prueba localmente
npm test

# 4. Commit tus cambios
git add .
git commit -m "Add awesome feature"

# 5. Push a tu rama
git push origin feature/my-awesome-feature

# 6. GitHub Actions automáticamente:
#    - Ejecutará 326 tests
#    - Verificará linting
#    - Probará performance
#    - Ejecutará security audit

# 7. Espera a que todos pasen (verde ✅)

# 8. Crea un Pull Request en GitHub

# 9. Después de revisión, merge a main

# 10. Delete tu rama
git branch -d feature/my-awesome-feature
```

---

## 🚀 Paso 7: Desplegar a Staging

### Proceso Automático

```bash
# 1. Asegúrate que todo está OK en main
git checkout main
git pull origin main

# 2. Crea/actualiza rama staging
git checkout staging
git pull origin staging
git merge main

# 3. Push a staging
git push origin staging

# 4. GitHub Actions automáticamente:
#    - Ejecuta 326 tests
#    - Construye Docker image
#    - Deploya a staging
#    - Envía notificación

# 5. Verifica en staging
curl https://staging-api.yourdomain.com/api/health
```

---

## 📦 Paso 8: Hacer Release a Producción

### Proceso Manual

```bash
# 1. Asegúrate que staging está OK (24+ horas)
# 2. Todos los tests deberían estar pasando
# 3. No hay errores en monitoreo

# 3. Crea una release
gh release create v1.0.0 --notes "Release notes here"

# O en GitHub UI:
# - Ve a Releases → New Release
# - Tag: v1.0.0
# - Title: Release v1.0.0
# - Publish

# 4. GitHub Actions automáticamente:
#    - Valida todos los 326 tests
#    - Ejecuta security audit
#    - Construye Docker image
#    - Sube artifacts
#    - Notifica equipo

# 5. Verifica en producción
curl https://api.yourdomain.com/api/health
```

---

## 📊 Paso 9: Monitorear la Aplicación

### Logs

```bash
# Ver logs en vivo
docker logs -f miappventas-backend

# Ver últimas 100 líneas
docker logs --tail 100 miappventas-backend

# Ver logs por fecha
docker logs --since 2024-01-01 miappventas-backend
```

### Health Check

```bash
# Verificar que la API está viva
curl https://api.yourdomain.com/api/health

# Verificar database
curl https://api.yourdomain.com/api/db-health

# Test webhook endpoint
curl -X POST https://api.yourdomain.com/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","orderId":1}'
```

### Métricas

```bash
# Ver métricas de webhook
curl https://api.yourdomain.com/api/monitoring/webhooks

# Exportar logs a CSV
curl https://api.yourdomain.com/api/monitoring/webhooks/export > logs.csv
```

---

## 🐛 Paso 10: Cuando Algo Falla

### Errores Comunes

#### "Database connection failed"
```bash
# 1. Verifica que PostgreSQL está corriendo
psql --version

# 2. Verifica que DATABASE_URL es correcto
echo $DATABASE_URL

# 3. Intenta conectar
psql $DATABASE_URL

# 4. Si falla, resetea la DB:
npm run prisma:migrate:reset
```

#### "Tests failing locally pero passing en CI"
```bash
# 1. Limpia node_modules
rm -rf node_modules
npm install

# 2. Regenera Prisma client
npm run prisma:generate

# 3. Intenta de nuevo
npm test
```

#### "Webhook not working"
```bash
# 1. Verifica logs
docker logs miappventas-backend | grep webhook

# 2. Verifica endpoint está registrado
curl http://localhost:3000/api/webhooks/payment

# 3. Test manualmente
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","orderId":1}'
```

### Recursos para Resolver Issues

1. Primero: Lee [DEPLOYMENT_GUIDE.md - Troubleshooting](./DEPLOYMENT_GUIDE.md#-troubleshooting)
2. Segundo: Busca el error en Google
3. Tercero: Pregunta en el equipo
4. Último: Crea un issue en GitHub

---

## 📚 Paso 11: Conceptos Clave

### Enumeradores (Importante!)

```javascript
// Order Status
enum OrderStatus {
  PENDING      // Pendiente pago
  CONFIRMED    // Pago confirmado
  PROCESSING   // Procesando
  SHIPPED      // Enviado
  DELIVERED    // Entregado
  CANCELLED    // Cancelado
  REFUNDED     // Reembolsado
}

// Payment Status
enum PaymentStatus {
  PENDING      // Pendiente
  COMPLETED    // Completado
  FAILED       // Falló
  REFUNDED     // Reembolsado
}

// ⚠️ IMPORTANTE: Siempre usa UPPERCASE
// ✅ CORRECTO: paymentStatus: "COMPLETED"
// ❌ INCORRECTO: paymentStatus: "completed"
```

### JWT Tokens

```javascript
// El token se envía en header
Authorization: Bearer <token>

// El middleware lo valida
// Si es válido, agrega user al request
// Si es inválido, retorna 401 Unauthorized
```

### Webhooks

```javascript
// Endpoint público (sin autenticación)
POST /api/webhooks/payment
{
  "event": "payment.completed",
  "orderId": 1,
  "data": { ... }
}

// El controller valida:
// 1. Payload no es null
// 2. Event existe
// 3. OrderId es válido
// 4. Order existe en DB
// 5. Actualiza estado de orden
```

---

## 🎓 Paso 12: Recursos Útiles

### Documentación del Proyecto

- **[INDICE_DOCUMENTACION_FINAL.md](./INDICE_DOCUMENTACION_FINAL.md)** - Índice completo
- **[GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)** - CI/CD explicado
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment completo
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Overview del proyecto
- **[SESION_FINAL_RESUMEN.md](./SESION_FINAL_RESUMEN.md)** - Resumen ejecutivo

### Documentación Externa

- **[Node.js Docs](https://nodejs.org/docs/)** - JavaScript runtime
- **[Express Docs](https://expressjs.com/)** - Web framework
- **[Prisma Docs](https://www.prisma.io/docs/)** - ORM
- **[Jest Docs](https://jestjs.io/)** - Testing
- **[GitHub Actions](https://docs.github.com/en/actions)** - CI/CD
- **[PostgreSQL](https://www.postgresql.org/docs/)** - Database

---

## ✅ Checklist para el Primer Día

- [ ] Leí SESION_FINAL_RESUMEN.md
- [ ] Leí PROJECT_STATUS.md
- [ ] Instalé Node.js 18.x
- [ ] Instalé PostgreSQL 17.7
- [ ] Cloné el repositorio
- [ ] Ejecuté npm install
- [ ] Configuré .env.local
- [ ] Ejecuté npm run prisma:migrate
- [ ] Ejecuté npm test (326/326 passing)
- [ ] Ejecuté npm run dev (servidor corriendo)
- [ ] Hice un curl a http://localhost:3000/api/health

---

## 📞 Cuando Necesites Ayuda

| Pregunta | Dónde Buscar |
|----------|-------------|
| ¿Cómo inicio? | Este archivo |
| ¿Cómo deploy? | DEPLOYMENT_GUIDE.md |
| ¿Cómo CI/CD? | GITHUB_ACTIONS_GUIDE.md |
| ¿Error en código? | Busca en documentación primero |
| ¿Error no documentado? | Pregunta al equipo |
| ¿Issue en GitHub? | Crea un issue con detalles |

---

## 🎯 Próximos Pasos Después de Setup

1. **Lee el código** - Familiarízate con la estructura
2. **Escribe tus primeros tests** - Aprende cómo escribimos tests
3. **Haz cambio pequeño** - Practica el workflow Git
4. **Deploy a staging** - Practica deployment
5. **Ask questions** - No tengas miedo de preguntar

---

## 💡 Tips Finales

- 🔍 **Lee el código primero** - Es el mejor aprendizaje
- 🧪 **Ejecuta tests frecuentemente** - Te dirán si rompiste algo
- 📖 **Mantén la documentación actualizada** - Ayuda a otros
- 🚀 **Practica deployment temprano** - No esperes hasta producción
- 🤝 **Pregunta cuando no entiendas** - Mejor que romper algo

---

## 📞 Contacto

- **Equipo**: dev@miappventas.com
- **Issues**: GitHub Issues
- **Documentation**: Carpeta /docs

---

**Bienvenido al equipo de MiAppVentas! 🎉**

Ahora:
1. Abre una terminal
2. Ejecuta: `git clone https://github.com/your-username/miappventas.git`
3. Sigue los pasos de Setup Local
4. ¡Comienza a programar!

**Buena suerte! 🚀**
