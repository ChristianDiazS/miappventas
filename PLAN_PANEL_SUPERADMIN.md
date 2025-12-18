# 🎯 PLAN DETALLADO - PANEL SUPERADMIN

**Fecha:** 16 de diciembre de 2025  
**Prioridad:** ALTA (Fase 1 del roadmap)  
**Estimado:** 3-5 días de desarrollo

---

## 📋 RESUMEN EJECUTIVO

El Panel SUPERADMIN será una interfaz de administración superior que permitirá:
- Gestión completa de usuarios ADMIN
- Dashboard con KPIs globales
- Auditoría y logs de cambios
- Control de permisos y roles
- Reportes de ventas y usuarios
- Configuración global de la plataforma

---

## 🏗️ ARQUITECTURA PROPUESTA

### Rutas Frontend
```
/superadmin                    → Redirige a /superadmin/dashboard
/superadmin/dashboard          → Dashboard con KPIs
/superadmin/admins             → Gestión de admins
/superadmin/audit-logs         → Auditoría completa
/superadmin/reports            → Reportes y analytics
/superadmin/settings           → Configuración global
/superadmin/users              → Gestión de usuarios
/superadmin/products-analytics → Analytics de productos
```

### Estructura de Componentes
```
/pages/SuperAdmin/
├── SuperadminPanel.jsx         (700-900 líneas)
│   ├── Navegación interna
│   ├── Layout sidebar
│   └── Router interno
├── Dashboard.jsx               (400-500 líneas)
│   ├── KPI cards
│   ├── Gráficos de ventas
│   ├── User activity
│   └── Top products
├── AdminManagement.jsx         (400-500 líneas)
│   ├── Lista de admins
│   ├── Crear admin
│   ├── Editar permisos
│   └── Revocar acceso
├── AuditLogs.jsx              (300-400 líneas)
│   ├── Tabla de logs
│   ├── Filtros
│   ├── Búsqueda
│   └── Detalles
├── Reports.jsx                (500-600 líneas)
│   ├── Ventas por período
│   ├── Top products
│   ├── User metrics
│   └── Exportar datos
├── Settings.jsx               (300-400 líneas)
│   ├── Configuración global
│   ├── Preferencias
│   ├── Limpieza de caché
│   └── Mantenimiento
└── Users.jsx                  (400-500 líneas)
    ├── Gestión de usuarios
    ├── Suspensiones
    ├── Búsqueda
    └── Filtros por rol

/components/SuperAdmin/
├── KPICard.jsx               (50 líneas)
├── RevenueChart.jsx          (100 líneas)
├── AdminTable.jsx            (150 líneas)
├── AuditTable.jsx            (150 líneas)
├── SuperadminNav.jsx         (200 líneas)
└── ExportButton.jsx          (80 líneas)
```

### Rutas Backend
```
GET    /api/superadmin/dashboard        - KPI metrics
GET    /api/superadmin/stats            - Estadísticas globales
GET    /api/superadmin/admin-users      - Lista de admins
POST   /api/superadmin/admin-users      - Crear admin
PUT    /api/superadmin/admin-users/:id  - Actualizar admin
DELETE /api/superadmin/admin-users/:id  - Revocar acceso admin

GET    /api/superadmin/audit-logs       - Historial de cambios
GET    /api/superadmin/audit-logs/:id   - Detalle de cambio

GET    /api/superadmin/reports/sales    - Reporte de ventas
GET    /api/superadmin/reports/users    - Reporte de usuarios
GET    /api/superadmin/reports/products - Reporte de productos

GET    /api/superadmin/users            - Gestión de usuarios
PUT    /api/superadmin/users/:id        - Actualizar usuario
DELETE /api/superadmin/users/:id        - Eliminar usuario

GET    /api/superadmin/settings         - Obtener configuración
PUT    /api/superadmin/settings         - Actualizar configuración
POST   /api/superadmin/maintenance      - Acciones de mantenimiento
```

---

## 🎨 DISEÑO UI/UX

### Dashboard (KPI View)
```
┌─────────────────────────────────────────────────────┐
│ 🏠 SUPERADMIN DASHBOARD                    [Settings]│
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│
│  │ Revenue  │  │ Orders   │  │ Users    │  │ Prod.││
│  │ S/. 45K  │  │    234   │  │   1,250  │  │ 890  ││
│  │ ↑ 12%    │  │ ↑ 8%     │  │ ↑ 5%     │  │ ↑ 3% ││
│  └──────────┘  └──────────┘  └──────────┘  └──────┘│
│                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐│
│  │   Revenue by Month   │  │  Top 5 Products      ││
│  │  [Line Chart]        │  │  1. Collar Gold  S/x ││
│  │                      │  │  2. Anillo Plata S/x ││
│  │                      │  │  3. Dije Cristal S/x ││
│  │                      │  │  4. Arete Perlas S/x ││
│  │                      │  │  5. Pulsera Oro  S/x ││
│  └──────────────────────┘  └──────────────────────┘│
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  Recent Activity                               ││
│  │  • Admin "juan@mail.com" created product #234  ││
│  │  • Order #5442 confirmed - S/. 899.00         ││
│  │  • User "maria@mail.com" registered           ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Admin Management View
```
┌──────────────────────────────────────────────────────┐
│ 👥 ADMIN USERS                    [+ Create Admin]   │
├──────────────────────────────────────────────────────┤
│ Search: [search box]  Filter: [All] [Active]         │
├──────────────────────────────────────────────────────┤
│ Name         │ Email         │ Role   │ Status │ Actn│
├──────────────────────────────────────────────────────┤
│ Juan Pérez   │ juan@mail.com │ ADMIN  │ ✅ Actv│ ⋮  │
│ María López  │ maria@mail.com│ ADMIN  │ ✅ Actv│ ⋮  │
│ Pedro García │ pedro@mail.com│ ADMIN  │ ❌ Inac│ ⋮  │
│ Ana Martínez │ ana@mail.com  │ ADMIN  │ ✅ Actv│ ⋮  │
└──────────────────────────────────────────────────────┘

Modal: Create/Edit Admin
┌────────────────────────────┐
│ Add New Admin              │
├────────────────────────────┤
│ Email*: [email@mail.com  ] │
│ First Name*: [__________] │
│ Last Name*: [__________]  │
│ Permissions:              │
│   ☑ View Products         │
│   ☑ Edit Products         │
│   ☑ Delete Products       │
│   ☑ View Orders           │
│   ☑ View Analytics        │
│ [Cancel]  [Create]        │
└────────────────────────────┘
```

### Audit Logs View
```
┌────────────────────────────────────────────────────┐
│ 📋 AUDIT LOGS                  [Export] [Clear All]│
├────────────────────────────────────────────────────┤
│ Filter: [All Actions] From: [2025-12-16] To: [now]│
├────────────────────────────────────────────────────┤
│ Time       │ User     │ Action      │ Resource │ Details
├────────────────────────────────────────────────────┤
│ 14:32:45   │ juan@... │ UPDATED     │ Prod#234 │ [View]
│ 14:15:20   │ maria@.. │ CREATED     │ Prod#235 │ [View]
│ 13:45:10   │ pedro@.. │ DELETED     │ User#123 │ [View]
│ 13:30:55   │ admin@.. │ ROLE_CHANGE │ User#456 │ [View]
│ 13:15:30   │ juan@... │ LOGGED_IN   │ System   │ [View]
└────────────────────────────────────────────────────┘

Detail Modal:
┌───────────────────────────────┐
│ Change Details                │
├───────────────────────────────┤
│ Timestamp: 2025-12-16 14:32:45│
│ User: juan@mail.com           │
│ Action: UPDATED               │
│ Resource Type: Product        │
│ Resource ID: 234              │
│ Details:                      │
│  - price: 399.00 → 449.00     │
│  - stock: 10 → 8              │
│                               │
│ [Close]                       │
└───────────────────────────────┘
```

---

## 🔧 FUNCIONALIDADES DETALLADAS

### 1. Dashboard
```
KPIs Mostrados:
  ✅ Revenue (total, this month, % change)
  ✅ Total Orders (count, % change)
  ✅ Total Users (active, registered, % change)
  ✅ Active Products (count, % change)
  ✅ Conversion Rate
  ✅ Avg Order Value
  ✅ Top Products (Top 5)
  ✅ Recent Activity (últimos 10 cambios)
  
Gráficos:
  ✅ Revenue by Month (últimos 12 meses)
  ✅ Orders by Category
  ✅ User Growth
  ✅ Order Status Distribution
```

### 2. Admin Management
```
Funcionalidades:
  ✅ Ver lista de admins con filters
  ✅ Crear nuevo admin (auto-generar contraseña temporal)
  ✅ Editar permisos de admin
  ✅ Cambiar estado (activo/inactivo)
  ✅ Revocar acceso
  ✅ Ver último acceso de admin
  ✅ Búsqueda por nombre/email
  
Permisos Granulares:
  ✅ view_products
  ✅ edit_products
  ✅ delete_products
  ✅ view_orders
  ✅ edit_orders
  ✅ view_users
  ✅ manage_users
  ✅ view_analytics
  ✅ manage_admins (solo SUPERADMIN)
  ✅ view_audit_logs
```

### 3. Audit Logs
```
Funcionalidades:
  ✅ Registrar todos los cambios (CREATE, UPDATE, DELETE)
  ✅ Filtrar por:
     - Date range
     - User
     - Action type
     - Resource type
  ✅ Búsqueda por keywords
  ✅ Exportar a CSV
  ✅ Ver detalles de cambio (before/after)
  ✅ Retención configurable (ej: 90 días)
  
Acciones a Registrar:
  ✅ Product CRUD
  ✅ User creation/deletion
  ✅ Admin role changes
  ✅ Order status changes
  ✅ Settings changes
  ✅ Password resets
  ✅ Bulk operations
```

### 4. Reports
```
Report 1: Sales Report
  ✅ Revenue by period (daily, weekly, monthly)
  ✅ Orders by category
  ✅ Avg order value
  ✅ Payment methods breakdown
  ✅ Refund rate
  
Report 2: User Report
  ✅ New users by period
  ✅ Active users
  ✅ User retention rate
  ✅ Most valuable customers
  ✅ Geographic distribution (if available)
  
Report 3: Product Report
  ✅ Top sellers
  ✅ Inventory levels
  ✅ Out of stock items
  ✅ Category performance
  ✅ Price distribution
  
All Reports:
  ✅ Date range selector
  ✅ Export to CSV/PDF
  ✅ Custom filters
  ✅ Comparison with previous period
```

### 5. User Management
```
Funcionalidades:
  ✅ Ver todos los usuarios
  ✅ Filtrar por rol (CUSTOMER, ADMIN, SUPERADMIN)
  ✅ Ver información de usuario
  ✅ Suspender usuario (soft delete)
  ✅ Reactivar usuario
  ✅ Forzar cambio de contraseña
  ✅ Ver historial de órdenes
  ✅ Búsqueda por email/nombre
```

### 6. Settings
```
Configuración Global:
  ✅ Store name
  ✅ Store email
  ✅ Phone
  ✅ Address
  ✅ Currency (default: PEN)
  ✅ Discount percentage
  ✅ Shipping costs
  ✅ Tax percentage
  ✅ Email notifications (on/off)
  ✅ Maintenance mode (on/off)
  
Maintenance:
  ✅ Clear image cache
  ✅ Clear session cache
  ✅ Generate backup
  ✅ Database statistics
  ✅ Logs cleanup
```

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Nuevas Tablas Necesarias

```sql
-- Admin Permissions Table
CREATE TABLE AdminPermission (
  id INT PRIMARY KEY AUTO_INCREMENT,
  adminId INT NOT NULL,
  permissionKey VARCHAR(50) NOT NULL,
  FOREIGN KEY (adminId) REFERENCES User(id),
  UNIQUE(adminId, permissionKey)
);

-- Audit Log Table
CREATE TABLE AuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  resourceType VARCHAR(50) NOT NULL,
  resourceId INT,
  changes JSON,
  timestamp DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX(timestamp),
  INDEX(userId)
);

-- Settings Table
CREATE TABLE GlobalSettings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  settingKey VARCHAR(100) UNIQUE NOT NULL,
  settingValue JSON,
  updatedAt DATETIME DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);

-- Detailed Analytics
CREATE TABLE OrderAnalytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT,
  userId INT,
  totalAmount INT,
  itemCount INT,
  orderDate DATETIME,
  FOREIGN KEY (orderId) REFERENCES Order(id),
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX(orderDate)
);
```

---

## 🔐 SEGURIDAD SUPERADMIN

```
Requerimientos:
  ✅ Solo accessible a SUPERADMIN role
  ✅ Requiere autenticación JWT válida
  ✅ Registrar todos los accesos en audit log
  ✅ Rate limiting en endpoints sensibles
  ✅ Session timeout después de 30 min inactividad
  ✅ Require password confirmation para acciones críticas
  ✅ 2FA recomendado pero no obligatorio
  ✅ IP whitelist opcional
  
Implementación:
  - ProtectedRoute con role="SUPERADMIN"
  - Backend middleware que verifica token + role
  - Logging de todas las acciones
```

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

### Archivos a Crear:

**Frontend:**
```
/pages/SuperAdmin/
  - SuperadminPanel.jsx (router principal)
  - Dashboard.jsx
  - AdminManagement.jsx
  - AuditLogs.jsx
  - Reports.jsx
  - Settings.jsx
  - Users.jsx

/components/SuperAdmin/
  - KPICard.jsx
  - RevenueChart.jsx
  - AdminTable.jsx
  - AuditTable.jsx
  - SuperadminNav.jsx
  - ExportButton.jsx
  - StatsCard.jsx
```

**Backend:**
```
/routes/
  - superadmin.js (nuevo archivo)

/controllers/
  - superadminController.js (nuevo archivo)

/services/
  - auditLogService.js (nuevo archivo)
  - analyticsService.js (nuevo archivo)
  - settingsService.js (nuevo archivo)

/middleware/
  - superadminAuth.js (middleware específico)
```

**Database:**
```
/prisma/
  - migration_*.sql (para nuevas tablas)
```

### Archivos a Modificar:

**Frontend:**
```
App.jsx
  - Agregar ruta /superadmin

schema.prisma
  - Agregar modelos: AdminPermission, AuditLog, GlobalSettings
```

**Backend:**
```
app.js
  - Agregar importación de superadminRoutes

User model en Prisma
  - Puede necesitar relaciones con AdminPermission
```

---

## 📊 TIMELINE ESTIMADO

### Día 1: Estructura Base
```
[ 1h ] Crear estructura de carpetas
[ 2h ] Crear rutas en backend (/api/superadmin/*)
[ 2h ] Crear middleware de autenticación SUPERADMIN
[ 2h ] Crear primeros endpoints (dashboard stats)
Total: 7 horas
```

### Día 2: Dashboard & Admin Management
```
[ 3h ] Implementar Dashboard.jsx con KPIs
[ 2h ] Implementar AdminManagement.jsx
[ 2h ] Crear componentes reutilizables (KPICard, tables)
[ 1h ] Integración frontend-backend
Total: 8 horas
```

### Día 3: Audit & Reports
```
[ 3h ] Implementar AuditLogs.jsx
[ 3h ] Implementar Reports.jsx
[ 1h ] Export functionality
[ 1h ] Testing
Total: 8 horas
```

### Día 4: Finalización
```
[ 2h ] Users & Settings pages
[ 2h ] Integración con base de datos
[ 2h ] Testing y QA
[ 1h ] Documentación
Total: 7 horas
```

**Total Estimado: 30 horas (3-5 días)**

---

## 🧪 Testing Checklist

```
Dashboard:
  ✅ KPIs calculan correctamente
  ✅ Gráficos cargan datos
  ✅ Responsive en móvil
  
Admin Management:
  ✅ Crear admin funciona
  ✅ Editar permisos actualiza
  ✅ Buscar/filtrar funciona
  ✅ Revocar acceso realmente revoca
  
Audit Logs:
  ✅ Se registran cambios
  ✅ Filtros funcionan
  ✅ Export a CSV funciona
  
Reports:
  ✅ Datos correctos
  ✅ Date range selector funciona
  ✅ Export funciona
  
Security:
  ✅ Solo SUPERADMIN puede acceder
  ✅ Todas las acciones en audit log
  ✅ Rate limiting funciona
  ✅ Session timeout funciona
```

---

## 📝 PRIORIZACIÓN DE FEATURES

### MVP (Mínimo Viable)
```
🔴 MUST HAVE:
  1. Dashboard con KPIs básicos
  2. Admin Management (crear/listar/eliminar)
  3. Audit Logs (registrar y listar cambios)
  4. Protección (solo SUPERADMIN)
```

### Phase 2 (Después de MVP)
```
🟡 SHOULD HAVE:
  1. Reports avanzados
  2. User management
  3. Settings global
  4. Export functionality
```

### Phase 3 (Nice to Have)
```
🟢 NICE TO HAVE:
  1. Gráficos avanzados
  2. Predicciones con ML
  3. Alertas automáticas
  4. 2FA obligatorio
```

---

## 🚀 CÓMO INICIAR

Cuando estés listo, los pasos serán:

```bash
1. Crear estructura de carpetas
2. Crear migration de base de datos
3. Implementar endpoints backend
4. Crear componentes frontend
5. Testing y QA
6. Deploy
```

¿Quieres que comience con la implementación del Panel SUPERADMIN? 🎯
