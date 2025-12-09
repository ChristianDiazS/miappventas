# ✅ CONFIGURACIÓN POSTGRESQL - Pasos Finales

## Tu Situación Actual

✅ PostgreSQL 17.7 instalado  
✅ Usuario superuser `postgres` (contraseña: `admin`)  
❌ Base de datos `miappventas` aún no creada  
❌ Usuario `miappventas` aún no creado  

---

## OPCIÓN 1: Usar pgAdmin (MÁS FÁCIL) ✨

### Paso 1: Abrir pgAdmin

1. **Abre navegador:** `http://localhost:5050`
2. **Email:** `postgres@example.com`
3. **Contraseña:** `admin` (default)

### Paso 2: Crear Servidor

1. **Right-click** en "Servers" → **Register** → **Server**
2. **Tab "General":**
   - Name: `MiAppVentas`
3. **Tab "Connection":**
   - Host name/address: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: `admin`
   - Save password: ✅
4. Click: **Save**

### Paso 3: Crear Base de Datos

1. Expandir: Servers → MiAppVentas → Databases
2. **Right-click** en "Databases" → **Create** → **Database**
3. **Name:** `miappventas`
4. Click: **Save**

### Paso 4: Crear Usuario

1. **Right-click** en "Login/Group Roles" → **Create** → **Login/Group Role**
2. **Tab "General":**
   - Name: `miappventas`
3. **Tab "Definition":**
   - Password: `miappventas`
   - Confirm password: `miappventas`
4. **Tab "Privileges":**
   - Can login?: ✅
   - Create databases?: ✅
5. Click: **Save**

### Paso 5: Dar Permisos

1. Click en la BD `miappventas`
2. **Tab "SQL"** (arriba)
3. Copiar y pegar esto:

```sql


```

4. Click: Execute (▶️)

---

## OPCIÓN 2: Usar Script SQL (Alternativo)

Si prefieres línea de comandos:

```powershell
# Navegar al backend
cd c:\Users\di_vi\MiAppVentas\backend

# Ejecutar script (te pedirá contraseña: admin)
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -f setup-db.sql
```

Si te pide contraseña, escribe: `admin`

---

## VERIFICACIÓN FINAL

Una vez creada la BD y usuario, verifica en PowerShell:

```powershell
# Conectarse con el usuario miappventas
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U miappventas -d miappventas -h localhost -c "SELECT version();"

# Contraseña: miappventas
# Si ves versión de PostgreSQL, ¡está funcionando!
```

---

## ⚠️ Si algo falla en pgAdmin

Abre PowerShell como **Administrador** y ejecuta:

```powershell
# Parar PostgreSQL
Stop-Service -Name postgresql-x64-17

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Reiniciar
Start-Service -Name postgresql-x64-17

# Esperar a que inicie
Start-Sleep -Seconds 5

# Verificar estado
Get-Service -Name postgresql-x64-17 | Select Status
```

---

## 🎯 Una vez esté todo listo

```powershell
cd c:\Users\di_vi\MiAppVentas\backend

# Actualizar npm
npm install

# Ejecutar migración Prisma (crea todas las tablas)
npx prisma migrate dev --name init

# Test de conexión
node test-db.js
```

---

**¿Cuál opción prefieres? ¿pgAdmin (más fácil) o el script SQL?**
