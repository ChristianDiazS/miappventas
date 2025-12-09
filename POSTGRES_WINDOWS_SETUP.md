# 🐘 INSTALACIÓN POSTGRESQL EN WINDOWS (Paso a Paso)

## OPCIÓN 1: PostgreSQL Nativo (Recomendado para desarrollo local)

### Paso 1: Descargar PostgreSQL

1. **Ir a:** https://www.postgresql.org/download/windows/
2. **Descargar:** PostgreSQL versión 15 o superior (EDB Installer)
3. **Guardar** en `C:\Descargas\`

### Paso 2: Ejecutar Instalador

1. **Doble click** en `postgresql-15.x-x-windows-x64.exe`
2. **Pantalla 1 - Installation Directory**
   - Dejar default: `C:\Program Files\PostgreSQL\15`
   - Click: **Next**

3. **Pantalla 2 - Select Components**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder
   - ✅ Command Line Tools
   - Click: **Next**

4. **Pantalla 3 - Data Directory**
   - Dejar default: `C:\Program Files\PostgreSQL\15\data`
   - Click: **Next**

5. **Pantalla 4 - Database Superuser Password**
   - **Password:** `postgres` (anótalo!)
   - **Confirm password:** `postgres`
   - Click: **Next**

6. **Pantalla 5 - Port**
   - Default: `5432` (dejar así)
   - Click: **Next**

7. **Pantalla 6 - Locale**
   - Default: **Spanish, Spain**
   - Click: **Next**

8. **Pantalla 7 - Summary**
   - Click: **Install**
   - Esperar 2-3 minutos...

9. **Pantalla 8 - Complete**
   - ✅ Launch Stack Builder
   - Click: **Finish**

---

### Paso 3: Verificar Instalación

**Abrir PowerShell como Administrador:**

```powershell
# Verificar que postgres está instalado
psql --version
# Respuesta esperada: psql (PostgreSQL) 15.x

# Conectarse al servidor
psql -U postgres
# Te pedirá password: postgres

# Si conecta exitosamente, verás: postgres=#
postgres=# \q  # Salir
```

---

### Paso 4: Crear Base de Datos para MiAppVentas

**PowerShell:**

```powershell
# Conectarse como superuser
psql -U postgres

# Dentro de PostgreSQL (comando sql):
```

**SQL (dentro de psql):**

```sql
-- Crear base de datos
CREATE DATABASE miappventas;

-- Crear usuario
CREATE USER miappventas WITH PASSWORD 'miappventas';

-- Configuraciones
ALTER ROLE miappventas SET client_encoding TO 'utf8';
ALTER ROLE miappventas SET default_transaction_isolation TO 'read committed';
ALTER ROLE miappventas SET default_transaction_deferrable TO on;
ALTER USER miappventas CREATEDB;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;

-- Salir
\q
```

---

### Paso 5: Verificar Conexión

```powershell
# Conectarse con el usuario miappventas
psql -U miappventas -d miappventas -h localhost

# Deberías ver: miappventas=>

# Ver tablas (aún vacío):
\dt

# Salir:
\q
```

---

## OPCIÓN 2: PostgreSQL en Docker (Más fácil si tienes Docker)

### Paso 1: Verificar Docker

```powershell
docker --version
# Respuesta: Docker version 20.x.x
```

Si no tienes Docker, descargar desde: https://www.docker.com/products/docker-desktop

### Paso 2: Crear Container PostgreSQL

```powershell
docker run -d `
  --name postgres-miappventas `
  -e POSTGRES_USER=miappventas `
  -e POSTGRES_PASSWORD=miappventas `
  -e POSTGRES_DB=miappventas `
  -p 5432:5432 `
  postgres:15-alpine

# Esperar 5 segundos...
# Verificar que está corriendo:
docker ps | Select-String postgres
```

### Paso 3: Usar en .env

```
DATABASE_URL=postgresql://miappventas:miappventas@localhost:5432/miappventas
```

---

## OPCIÓN 3: Neon (PostgreSQL en la Nube - MÁS RÁPIDO)

### Paso 1: Crear Cuenta

1. **Ir a:** https://console.neon.tech
2. **Sign up con GitHub**
3. **Create project** (nombre: `miappventas`)

### Paso 2: Copiar Connection String

1. En Neon dashboard
2. Hacer click en el proyecto
3. Copiar el connection string completo

### Paso 3: Agregar a .env

```
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/miappventas?sslmode=require
```

---

## CONFIGURACIÓN EN EL PROYECTO

### Paso 1: Actualizar .env

```bash
cd c:\Users\di_vi\MiAppVentas\backend
```

**Editar `.env`:**

```
DATABASE_URL=postgresql://miappventas:miappventas@localhost:5432/miappventas
```

### Paso 2: Instalar Prisma (si no lo hiciste)

```bash
npm install @prisma/client prisma --save-dev
npx prisma init
```

### Paso 3: Aplicar Schema Prisma

```bash
# Crear migración y base de datos
npx prisma migrate dev --name init

# Verificar con Prisma Studio
npx prisma studio
```

Abrirá `http://localhost:5555` con interfaz gráfica.

---

## 🧪 Tests de Conexión

### Test 1: Línea de comandos

```powershell
# Conectarse con psql
psql -U miappventas -d miappventas -h localhost -c "SELECT version();"

# Deberías ver la versión de PostgreSQL
```

### Test 2: Node.js

**Crear archivo `test-db.js` en backend:**

```javascript
import { prisma } from './src/lib/prisma.js';

async function test() {
  try {
    // Test de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión a PostgreSQL exitosa:', result);
    
    // Contar tablas
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tablas en la base de datos:', tables);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

**Ejecutar:**

```bash
node test-db.js
```

---

## 📱 Usar pgAdmin (Interfaz Gráfica)

### Conectarse a pgAdmin

1. **Abrir navegador:** http://localhost:5050
2. **Email:** postgres@example.com
3. **Password:** admin (default)

### Crear Servidor

1. **Right-click** en "Servers" → **Register** → **Server**
2. **Name:** MiAppVentas
3. **Host name/address:** localhost
4. **Port:** 5432
5. **Username:** postgres
6. **Password:** postgres
7. Click: **Save**

### Ver Tablas

1. Expandir: Servers → MiAppVentas → Databases → miappventas
2. Ver tablas creadas por Prisma

---

## ❌ Solucionar Problemas

### Error: "Could not connect to server"

```powershell
# Verificar que PostgreSQL está corriendo
Get-Service PostgreSQL* | Select Name, Status

# Si está stopped:
Start-Service -Name postgresql-x64-15

# O usar Services (services.msc)
```

### Error: "password authentication failed"

```powershell
# Verificar que la contraseña es correcta
psql -U postgres -d postgres -h localhost

# Si no funciona, resetear password:
psql -U postgres -d postgres -h localhost `
  -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### Error: "role does not exist"

```powershell
# Crear usuario si no existe
psql -U postgres -d postgres -h localhost `
  -c "CREATE USER miappventas WITH PASSWORD 'miappventas';"

# Dar permisos
psql -U postgres -d postgres -h localhost `
  -c "GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;"
```

### Puerto 5432 ya está en uso

```powershell
# Encontrar qué está usando el puerto
Get-NetTCPConnection -LocalPort 5432 | Select ProcessName

# Matar proceso (si es seguro):
Stop-Process -Id <PID> -Force
```

---

## ✅ Checklist

- [ ] PostgreSQL instalado (verificar: `psql --version`)
- [ ] Servicio PostgreSQL corriendo (verificar en Services)
- [ ] Base de datos `miappventas` creada
- [ ] Usuario `miappventas` creado
- [ ] Conexión desde psql funciona
- [ ] Conexión desde Node.js funciona
- [ ] `.env` actualizado con DATABASE_URL
- [ ] Prisma schema aplicado (`npx prisma migrate dev --name init`)
- [ ] Tablas creadas en PostgreSQL
- [ ] Prisma Studio accesible (`npx prisma studio`)

---

## 🎯 Siguientes Pasos

1. ✅ PostgreSQL funcionando
2. → Migrar controllers a Prisma
3. → Migrar datos de MongoDB (si es necesario)
4. → Tests con PostgreSQL
5. → Refactor a Services layer

---

