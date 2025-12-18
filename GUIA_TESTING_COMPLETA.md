# 🧪 GUÍA COMPLETA DE TESTING - PANEL SUPERADMIN

**Fecha:** 16 de diciembre de 2025  
**Estado:** Testing Phase - Día 3  
**Objetivo:** Validar todos los 11 endpoints del Panel SUPERADMIN

---

## 📋 CONTENIDO DEL TESTING

Se incluyen 3 métodos de testing:

1. **Script Node.js Automatizado** - `testing-superadmin.js`
2. **Colección Postman** - `Postman_SUPERADMIN_API.json`
3. **SQL para datos de prueba** - `seed-superadmin-test-data.sql`

---

## 🚀 PASO 1: PREPARACIÓN DEL ENTORNO

### 1.1 Insertar Datos de Prueba en la BD

Ejecutar el script SQL en tu servidor PostgreSQL:

```bash
# Opción 1: Desde psql directamente
psql -U tu_usuario -d tu_base_datos -f backend/scripts/seed-superadmin-test-data.sql

# Opción 2: Desde pgAdmin
# 1. Abre pgAdmin
# 2. Navega a tu BD (miappventas)
# 3. Click derecho → Query Tool
# 4. Pega el contenido de seed-superadmin-test-data.sql
# 5. Click en "Execute"
```

**Qué se crea:**
- ✅ 1 usuario SUPERADMIN (`superadmin@test.com` / `superadmin123`)
- ✅ 3 usuarios ADMIN (`admin1@test.com`, `admin2@test.com`, `admin3@test.com`)
- ✅ 5 usuarios CUSTOMER (para estadísticas)
- ✅ 7 órdenes de prueba con estados variados
- ✅ 6 pagos completados
- ✅ 5 registros de auditoría

**Verificar datos creados:**
```sql
SELECT COUNT(*) as total_users FROM "User";
SELECT COUNT(*) as total_orders FROM "Order";
SELECT COUNT(*) as total_payments FROM "Payment";
SELECT COUNT(*) as total_audit_logs FROM "AuditLog";
```

---

## 🖥️ PASO 2: INICIAR SERVIDORES

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Debe mostrar:
```
Server running on port 3001
Database connected ✓
```

### Terminal 2: Frontend (Opcional para UI testing)
```bash
cd frontend
npm run dev
```

Debe mostrar:
```
VITE v7.2.6 ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🤖 MÉTODO 1: Testing Automatizado con Node.js

### Ejecutar script de tests

```bash
cd backend
node testing-superadmin.js
```

**Output esperado:**
```
╔════════════════════════════════════════════╗
║   Testing Panel SUPERADMIN - Todos Endpoints   ║
╚════════════════════════════════════════════╝

📌 Test 1: Authentication
✓ PASS - Login y obtención de token
     Token: eyJhbGciOiJIUzI1NiIsInR5...

📌 Test 2: Dashboard - GET /api/superadmin/dashboard/stats
✓ PASS - Cargar estadísticas del dashboard
     Usuarios: 10, Órdenes: 7, Ingresos: S/. 678.40

📌 Test 3: System - GET /api/superadmin/dashboard/health
✓ PASS - Verificar salud del sistema
     Database conectada

[... más tests ...]

╔════════════════════════════════════════════╗
║              RESUMEN DE TESTING              ║
╚════════════════════════════════════════════╝

Total Tests: 12
✓ Pasados: 12
✗ Fallidos: 0
Success Rate: 100%

✓✓✓ TODOS LOS TESTS PASARON ✓✓✓
```

### Interpretar Resultados

| Símbolo | Significado |
|---------|------------|
| ✓ PASS  | Test exitoso |
| ✗ FAIL  | Test fallido |
| 100%    | Todos los endpoints funcionan |
| < 80%   | Revisar errores y logs |

---

## 📬 MÉTODO 2: Testing Manual con Postman

### 2.1 Importar Colección

1. **Abre Postman** (descarga de postman.com si no lo tienes)
2. **Click en "File" → "Import"**
3. **Selecciona** `backend/Postman_SUPERADMIN_API.json`
4. **Click en "Import"**

### 2.2 Configurar Variables de Entorno

1. **Click en el ícono de engranaje** (Settings) → "Environments"
2. **Click en "Create New Environment"**
3. **Nombre:** `SUPERADMIN Testing`
4. **Agregar variables:**

```
baseUrl:    http://localhost:3001
token:      (se rellena automáticamente después de login)
userId:     (se rellena automáticamente)
newAdminId: (se rellena automáticamente)
```

5. **Click en "Save"**

### 2.3 Ejecutar Tests

**Orden recomendado:**

#### 1️⃣ Authentication
```
POST /api/auth/login
Body:
{
  "email": "superadmin@test.com",
  "password": "superadmin123"
}
```
**Esperado:** Status 200, Token en response

#### 2️⃣ Dashboard
```
GET /api/superadmin/dashboard/stats
GET /api/superadmin/dashboard/health
```
**Esperado:** Status 200, JSON con estadísticas

#### 3️⃣ Admin Management
```
GET /api/superadmin/admins?page=1&limit=10
POST /api/superadmin/admins (crear nuevo)
PUT /api/superadmin/admins/:id (actualizar)
DELETE /api/superadmin/admins/:id (eliminar)
```
**Esperado:** Status 200/201, JSON con datos de admin

#### 4️⃣ Audit Logs
```
GET /api/superadmin/audit-logs?page=1&limit=20
GET /api/superadmin/audit-logs?action=admin_created
GET /api/superadmin/audit-logs?startDate=2025-12-01&endDate=2025-12-31
```
**Esperado:** Status 200, Array de logs

#### 5️⃣ Reports
```
GET /api/superadmin/reports?startDate=2025-11-16&endDate=2025-12-16
```
**Esperado:** Status 200, JSON con dailyRevenue y topCustomers

#### 6️⃣ Settings
```
GET /api/superadmin/settings
PUT /api/superadmin/settings
```
**Esperado:** Status 200, JSON con configuración

#### 7️⃣ Security
```
GET /api/superadmin/dashboard/stats (sin token)
```
**Esperado:** Status 401/403 (acceso denegado)

---

## 🔍 PASO 3: VERIFICAR RESULTADOS

### Checklist de Validación

#### Backend
- [ ] Todos los 11 endpoints responden
- [ ] Status codes correctos (200/201/400/401/403/500)
- [ ] Datos están en el formato esperado (JSON válido)
- [ ] Las auditorías se registran en cada acción
- [ ] Errores muestran mensajes descriptivos
- [ ] Sin errores 500 (server error)

#### Seguridad
- [ ] Sin token → Status 401
- [ ] Token inválido → Status 401
- [ ] Usuario CUSTOMER intenta acceder → Status 403
- [ ] Datos sensibles no se retornan (passwords)

#### Base de Datos
- [ ] Los datos creados aparecen en queries
- [ ] Las transacciones son consistentes
- [ ] No hay duplicados en auditoría

#### Performance
- [ ] Endpoints responden en < 500ms
- [ ] No hay memory leaks (revisar heap)
- [ ] Las queries son eficientes

---

## 📊 CASOS DE PRUEBA DETALLADOS

### Test 1: Dashboard Stats
```
Endpoint: GET /api/superadmin/dashboard/stats
Esperado:
{
  "summary": {
    "totalUsers": 10,
    "activeUsers": 9,
    "totalOrders": 7,
    "totalRevenue": 678400,
    "avgOrderValue": 96914
  },
  "thisMonth": {
    "orders": 5,
    "revenue": 456000
  },
  "topProducts": [
    {
      "productId": 1,
      "title": "Ring Gold",
      "sales": 2,
      "revenue": 200000
    }
  ],
  "ordersByStatus": [
    {
      "status": "DELIVERED",
      "_count": 3,
      "_sum": { "total": 345000 }
    }
  ],
  "paymentsByMethod": [
    {
      "provider": "stripe",
      "_count": 6,
      "_sum": { "amount": 678400 }
    }
  ]
}
```

### Test 2: Create Admin
```
Endpoint: POST /api/superadmin/admins
Body:
{
  "email": "newtestadmin@test.com",
  "password": "TestPass123!",
  "firstName": "Test",
  "lastName": "Admin",
  "role": "ADMIN"
}
Esperado: Status 201
{
  "id": 15,
  "email": "newtestadmin@test.com",
  "firstName": "Test",
  "lastName": "Admin",
  "role": "ADMIN",
  "createdAt": "2025-12-16T10:30:00Z"
}
```

### Test 3: Audit Logs
```
Endpoint: GET /api/superadmin/audit-logs?action=admin_created
Esperado: Status 200
{
  "logs": [
    {
      "id": 1,
      "userId": 1,
      "action": "admin_created",
      "entity": "user",
      "entityId": 2,
      "newData": {
        "email": "admin1@test.com",
        "role": "ADMIN"
      },
      "user": {
        "email": "superadmin@test.com"
      },
      "createdAt": "2025-12-16T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch"
**Causa:** Backend no está corriendo o CORS está bloqueado
```bash
# Solución 1: Verificar backend
curl http://localhost:3001/api/health

# Solución 2: Revisar CORS en app.js
# Debe tener: cors({ origin: 'http://localhost:5173' })
```

### Error: "401 Unauthorized"
**Causa:** Token no es válido o expiró
```bash
# Solución: Hacer login nuevamente para obtener token nuevo
POST /api/auth/login
{
  "email": "superadmin@test.com",
  "password": "superadmin123"
}
```

### Error: "403 Forbidden"
**Causa:** Usuario no tiene rol SUPERADMIN
```bash
# Solución: Usar usuario SUPERADMIN
# O actualizar rol del usuario en BD:
UPDATE "User" SET role = 'SUPERADMIN' WHERE email = 'user@test.com';
```

### Error: "404 Not Found"
**Causa:** Endpoint no existe o path está incorrecto
```bash
# Verificar:
# - Base URL es correcta (http://localhost:3001)
# - Path es correcto (/api/superadmin/...)
# - Backend está corriendo
```

### Error: "500 Internal Server Error"
**Causa:** Hay un error en el código backend
```bash
# Solución:
# 1. Revisar logs en terminal del backend
# 2. Buscar stack trace del error
# 3. Corregir el issue
# 4. Reiniciar backend (npm run dev)
```

---

## 📝 LOGGING Y DEBUGGING

### Revisar logs del Backend

En la terminal donde corre `npm run dev`:
```
[16:30:45] Fetching dashboard stats...
[16:30:46] Stats retrieved successfully
[16:30:47] User admin_created logged
```

### Debug en Frontend (DevTools)

1. **F12 en navegador**
2. **Tab "Console"** - buscar errores
3. **Tab "Network"** - ver requests a `/api/superadmin/*`
4. **Tab "Application"** - revisar localStorage (token, user)

### Debug en Backend

Agregar logs en controlador:
```javascript
console.log('Dashboard stats request from:', req.user.email);
console.log('Stats calculated:', stats);
```

---

## ✅ MATRIZ DE TESTING

| Endpoint | Método | Status | Esperado | Tested |
|----------|--------|--------|----------|--------|
| /api/superadmin/dashboard/stats | GET | 200 | KPIs | [ ] |
| /api/superadmin/dashboard/health | GET | 200 | Health | [ ] |
| /api/superadmin/admins | GET | 200 | Array | [ ] |
| /api/superadmin/admins | POST | 201 | Admin | [ ] |
| /api/superadmin/admins/:id | PUT | 200 | Admin | [ ] |
| /api/superadmin/admins/:id | DELETE | 200 | Message | [ ] |
| /api/superadmin/audit-logs | GET | 200 | Array | [ ] |
| /api/superadmin/reports | GET | 200 | Data | [ ] |
| /api/superadmin/settings | GET | 200 | Settings | [ ] |
| /api/superadmin/settings | PUT | 200 | Settings | [ ] |
| Sin Auth | GET | 401 | Error | [ ] |

---

## 🎯 PRÓXIMOS PASOS

Una vez completado el testing:

1. **Documentar Issues** - Si hay fallos, crear tickets
2. **Refinamientos UI/UX** - Mejorar interfaz basado en feedback
3. **Optimizar Performance** - Reducir tiempos de respuesta
4. **Swagger Docs** - Documentación API interactiva
5. **Deploy a Producción** - Ir en vivo

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisar los logs (terminal backend)
2. Verificar que data de prueba está cargada
3. Asegurarse de que tokens son válidos
4. Revisar permisos de usuario (role SUPERADMIN)

---

*Guía creada: 16/12/2025*  
*Última actualización: Testing Phase - Día 3*
