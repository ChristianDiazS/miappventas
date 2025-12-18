# 🧪 GUÍA DE TESTING - PANEL SUPERADMIN

## ⚙️ Preparación

### 1. Asegúrate de tener datos en la BD
```sql
-- Crear un usuario SUPERADMIN para testing
INSERT INTO "User" (email, "passwordHash", "firstName", "lastName", phone, role, active)
VALUES (
  'superadmin@test.com',
  '$2b$10$...', -- bcrypt hash de 'password123'
  'Super',
  'Admin',
  '123456789',
  'SUPERADMIN',
  true
);
```

### 2. Asegúrate de tener órdenes y pagos en la BD
El Dashboard obtiene datos de:
- `Order` table (para órdenes, ingresos)
- `OrderItem` table (para top productos)
- `Payment` table (para métodos de pago)

Si no hay datos de prueba, el dashboard mostrará ceros.

---

## 🚀 Iniciar la Aplicación

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Debe escuchar en `http://localhost:3001`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Debe escuchar en `http://localhost:5173`

---

## 🔐 LOGIN

1. Ir a `http://localhost:5173/login`
2. Email: `superadmin@test.com`
3. Password: `password123` (o la que hasheaste)
4. Click en **Inicia Sesión**

---

## 🎯 ACCEDER A SUPERADMIN

1. Una vez autenticado, ir a `http://localhost:5173/superadmin`
2. Deberías ver:
   - **Header:** "Panel SUPERADMIN" + Tu email
   - **Sidebar:** 5 opciones (Dashboard, Admins, Auditoría, Reportes, Configuración)
   - **Main:** Dashboard con KPIs y gráficos

---

## 🧪 TEST CASOS

### 1. Dashboard
- [ ] Carga estadísticas sin errores
- [ ] Muestra: Usuarios totales, órdenes, ingresos
- [ ] Top 5 productos aparece (si hay datos)
- [ ] Distribución de órdenes por estado
- [ ] Métodos de pago muestran counts

### 2. Gestión de Admins
- [ ] Click en "Gestión de Admins" → muestra tabla
- [ ] Click en "+ Crear Admin" → abre modal
- [ ] Llenar formulario y crear admin nuevo
  - Email: `admin2@test.com`
  - Nombre: Juan
  - Apellido: Pérez
  - Rol: ADMIN
  - Password: `test123`
- [ ] Nuevo admin aparece en tabla
- [ ] Click en icono edit → abre modal con datos precargados
- [ ] Cambiar nombre y guardar
- [ ] Click en icono trash → elimina admin

### 3. Auditoría
- [ ] Click en "Auditoría" → muestra logs
- [ ] Debe haber entradas de: `admin_created`, `admin_updated`, `admin_deleted`
- [ ] Filtrar por acción: escribir `admin_created`
- [ ] Filtrar por rango de fechas
- [ ] Click en "Ver cambios" → JSON desplegable

### 4. Reportes
- [ ] Click en "Reportes"
- [ ] Seleccionar rango de fechas (últimos 30 días por defecto)
- [ ] Click en "Generar Reporte"
- [ ] Mostrar:
  - Ingresos diarios
  - Top clientes
- [ ] Ver detalles de cada cliente

### 5. Configuración
- [ ] Click en "Configuración"
- [ ] Editar: Nombre app, moneda, idioma
- [ ] Activar/desactivar toggles
- [ ] Click en "Guardar Cambios"
- [ ] Ver mensaje de éxito

### 6. Logout
- [ ] Click en "Cerrar Sesión" en sidebar
- [ ] Debe redirigir a login
- [ ] Token y usuario deben limpiarse de localStorage

---

## 🐛 DEBUGGING

### Backend logs
Si algo falla en el backend, busca en la consola:
```
Error fetching dashboard stats: [error message]
Error creating admin: [error message]
```

### Frontend errors
Abre DevTools (F12) en Chrome/Firefox:
- Console tab → busca errores
- Network tab → verifica requests a `/api/superadmin/*`
- Application → localStorage (token, user)

### Verificar Token
En DevTools Console:
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

---

## 🔧 TROUBLESHOOTING

### Error: "Failed to fetch dashboard stats"
✅ **Solución:** 
- Verifica que backend está corriendo en puerto 3001
- Revisa CORS en `app.js` 
- Verifica token válido en localStorage

### Error: "Could not resolve ./views/DashboardView"
✅ **Solución:**
- Paths son case-sensitive
- Verifica que archivos existen en `frontend/src/pages/superadmin/views/`

### Modal no abre
✅ **Solución:**
- Verifica que `CreateAdminModal` está importado correctamente
- Revisa console para errores de React

### Órdenes/Ingresos muestran 0
✅ **Solución:**
- Es normal si no hay datos en BD
- Crear órdenes de prueba en ProductDetail o Cart
- O insertar manualmente en PostgreSQL

---

## 📊 EXPECTED RESULTS

### Dashboard (Con datos de prueba)
```
Total Users: 5-10
Active Users: 4-8
Total Orders: 10-20
Total Revenue: S/. 3,000 - 10,000
Avg Order Value: S/. 500 - 1,000

Top Products:
1. Ring Gold - 5 sales - S/. 2,500
2. Necklace Silver - 3 sales - S/. 1,200
...
```

### Admins
```
Table showing:
- Email: admin1@test.com
- Name: Juan Pérez
- Role: ADMIN
- Status: Active
- Created: Today's date
```

### Audit Logs
```
- User: superadmin@test.com
- Action: admin_created
- Entity: user
- Date: Today
- Changes: { email, role }
```

---

## ✅ FINAL CHECKLIST

- [ ] Backend corre sin errores
- [ ] Frontend corre sin errores
- [ ] Puedo loguearme con SUPERADMIN
- [ ] Puedo acceder a /superadmin
- [ ] Dashboard muestra datos
- [ ] Puedo crear admin (sin errores)
- [ ] Puedo editar admin
- [ ] Puedo eliminar admin (excepto único SUPERADMIN)
- [ ] Audit logs muestran mis acciones
- [ ] Reportes generan bajo demanda
- [ ] Configuración se guarda
- [ ] Logout funciona

---

## 💡 NEXT STEPS

Una vez confirmado que todo funciona:

1. **Seguridad:** Verificar que solo SUPERADMIN puede acceder
2. **Performance:** Probar con datos masivos (1000+ órdenes)
3. **Responsive:** Probar en mobile (iPhone, Android)
4. **UX:** Recopilar feedback y ajustar
5. **Producción:** Desplegar a servidor final

---

*Guía creada: 16/12/2025*
