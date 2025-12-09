# 🚀 SEMANA 1: MIGRACIÓN A POSTGRES + PRISMA

## PASO 1: Setup PostgreSQL Local (Opción A - Recomendado: Windows)

### Opción 1A: PostgreSQL + pgAdmin (Local)

**Windows - Instalador:**
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador (versión 15+)
3. Durante instalación:
   - Set password para usuario `postgres` (ej: `password`)
   - Default port: 5432
4. Verificar instalación:
   ```bash
   psql --version
   ```

**Crear base de datos:**
```bash
# Conectarse como superuser
psql -U postgres

# Dentro de psql:
CREATE DATABASE miappventas;
CREATE USER miappventas WITH PASSWORD 'miappventas';
ALTER ROLE miappventas SET client_encoding TO 'utf8';
ALTER ROLE miappventas SET default_transaction_isolation TO 'read committed';
ALTER ROLE miappventas SET default_transaction_deferrable TO on;
ALTER ROLE miappventas SET default_transaction_read_committed TO on;
ALTER USER miappventas CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;
\q
```

**Verificar conexión:**
```bash
psql -U miappventas -d miappventas -h localhost
\dt  # ver tablas (vacío aún)
\q
```

---

### Opción 1B: PostgreSQL en Docker (Alternativa)

```bash
# Si tienes Docker instalado
docker run -d \
  --name postgres-miappventas \
  -e POSTGRES_USER=miappventas \
  -e POSTGRES_PASSWORD=miappventas \
  -e POSTGRES_DB=miappventas \
  -p 5432:5432 \
  postgres:15-alpine

# Verificar contenedor
docker ps | grep postgres

# Conectarse
psql -U miappventas -d miappventas -h localhost
```

---

### Opción 1C: Postgres Cloud (Rápido - Recomendado para producción)

**Neon (Gratuito - Recomendado):**
1. Ir a https://console.neon.tech/
2. Crear cuenta con GitHub
3. Crear nuevo proyecto
4. Copiar `DATABASE_URL` (conexión)
5. Pegar en `.env`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/miappventas
   ```

**Supabase (Alternativa):**
1. Ir a https://supabase.com/
2. Crear proyecto
3. Copiar connection string
4. Pegar en `.env`

---

## PASO 2: Verificar Estructura Prisma

```bash
cd backend

# Ver schema creado
cat prisma/schema.prisma

# Verificar que DATABASE_URL está en .env
cat .env | grep DATABASE_URL
```

---

## PASO 3: Crear Migraciones Prisma

```bash
cd backend

# Crear migración inicial (crea schema en PostgreSQL)
npx prisma migrate dev --name init
# Responder "yes" cuando pida crear la BD

# Verificar tablas creadas
npx prisma studio  # Abre UI para ver datos (http://localhost:5555)
```

**Resultado:** Schema Prisma aplicado a PostgreSQL ✅

---

## PASO 4: Refactorizar Controllers a Prisma

### Antes (Mongoose):
```javascript
// userController.js
import { User } from '../models/User.js';

export async function getUserProfile(req, res) {
  const user = await User.findById(req.user.id);
  return res.json(user);
}
```

### Después (Prisma):
```javascript
// userController.js
import { prisma } from '../lib/prisma.js';

export async function getUserProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  return res.json(user);
}
```

---

## PASO 5: Crear Archivo de Utilidad Prisma

**`src/lib/prisma.js`:**
```javascript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

---

## PASO 6: Migrar Datos de MongoDB → PostgreSQL

### Script de migración:

**`scripts/migrate-mongodb-to-postgres.js`:**
```javascript
import mongoose from 'mongoose';
import { prisma } from '../src/lib/prisma.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import bcrypt from 'bcrypt';

async function migrateData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // 1. Migrar USUARIOS
    console.log('🔄 Migrando usuarios...');
    const mongoUsers = await User.find();
    for (const mongoUser of mongoUsers) {
      await prisma.user.upsert({
        where: { email: mongoUser.email },
        update: {},
        create: {
          email: mongoUser.email,
          passwordHash: mongoUser.password, // Ya está hasheado
          firstName: mongoUser.firstName,
          lastName: mongoUser.lastName,
          phone: mongoUser.phone,
          role: mongoUser.role || 'CUSTOMER',
          active: mongoUser.active !== false,
          
          // Migrar direcciones
          addresses: {
            create: mongoUser.addresses?.map(addr => ({
              label: addr.label,
              street: addr.street,
              city: addr.city || 'Lima',
              district: addr.district,
              province: addr.province,
              department: addr.department,
              postalCode: addr.postalCode,
              isDefault: addr.isDefault || false
            })) || []
          }
        }
      });
    }
    console.log(`✅ ${mongoUsers.length} usuarios migrados`);

    // 2. Migrar CATEGORÍAS
    console.log('🔄 Migrando categorías...');
    const uniqueCategories = [...new Set(
      (await Product.find()).map(p => p.category)
    )];
    
    for (const categoryName of uniqueCategories) {
      await prisma.category.upsert({
        where: { slug: categoryName.toLowerCase().replace(/ /g, '-') },
        update: {},
        create: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/ /g, '-'),
          active: true
        }
      });
    }
    console.log(`✅ ${uniqueCategories.length} categorías migradas`);

    // 3. Migrar PRODUCTOS
    console.log('🔄 Migrando productos...');
    const mongoProducts = await Product.find();
    
    for (const mongoProd of mongoProducts) {
      const category = await prisma.category.findFirst({
        where: { name: mongoProd.category }
      });

      await prisma.product.upsert({
        where: { sku: mongoProd.sku || mongoProd._id.toString() },
        update: {},
        create: {
          sku: mongoProd.sku || mongoProd._id.toString(),
          title: mongoProd.name,
          description: mongoProd.description,
          price: Math.round(mongoProd.price * 100), // Convertir a centavos
          originalPrice: mongoProd.originalPrice ? Math.round(mongoProd.originalPrice * 100) : null,
          categoryId: category?.id || 1,
          stock: mongoProd.stock || 0,
          rating: mongoProd.rating || 0,
          reviewCount: mongoProd.reviews || 0,
          active: true,
          
          // Migrar imágenes
          images: {
            create: mongoProd.images?.map((img, idx) => ({
              url: img.url,
              alt: img.alt || mongoProd.name,
              isPrimary: idx === 0,
              order: idx
            })) || []
          },
          
          // Migrar features
          features: {
            create: mongoProd.features?.map(feat => ({
              feature: feat
            })) || []
          }
        }
      });
    }
    console.log(`✅ ${mongoProducts.length} productos migrados`);

    // 4. Migrar ÓRDENES
    console.log('🔄 Migrando órdenes...');
    const mongoOrders = await Order.find().populate('user').populate('items.product');
    
    for (const mongoOrder of mongoOrders) {
      const user = await prisma.user.findUnique({
        where: { email: mongoOrder.user.email }
      });

      if (user) {
        await prisma.order.create({
          data: {
            orderNumber: mongoOrder.orderNumber,
            userId: user.id,
            
            subtotal: Math.round(mongoOrder.subtotal * 100),
            tax: Math.round(mongoOrder.tax * 100),
            shippingCost: Math.round((mongoOrder.shippingCost || 50) * 100),
            total: Math.round(mongoOrder.total * 100),
            
            status: (mongoOrder.status?.toUpperCase() || 'PENDING'),
            paymentStatus: (mongoOrder.paymentStatus?.toUpperCase() || 'PENDING'),
            
            shippingMethod: mongoOrder.shippingMethod === 'express' ? 'EXPRESS' : 'STANDARD',
            
            items: {
              create: mongoOrder.items.map(item => ({
                productId: item.product._id.toString(), // Necesita ser mirado
                quantity: item.quantity,
                unitPrice: Math.round(item.price * 100),
                subtotal: Math.round(item.price * item.quantity * 100)
              }))
            }
          }
        });
      }
    }
    console.log(`✅ ${mongoOrders.length} órdenes migradas`);

    console.log('\n✅ MIGRACIÓN COMPLETADA');
    
    // Desconectar
    await mongoose.disconnect();
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrateData();
```

**Ejecutar migración:**
```bash
node scripts/migrate-mongodb-to-postgres.js
```

---

## PASO 7: Actualizar Controllers (Todos)

### Controllers a actualizar:
- `userController.js` - GET/PUT profile, addresses
- `productController.js` - GET/POST/PUT/DELETE products
- `orderController.js` - GET/POST/PUT orders
- `authController.js` - register, login
- `paymentController.js` - process payments

**Ejemplo completo - userController.js:**

```javascript
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export async function getUserProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined
      }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addAddress(req, res) {
  try {
    const { label, street, city, district, province, department, postalCode, isDefault } = req.body;
    
    // Si es default, desactivar otros
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }
    
    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        street,
        city,
        district,
        province,
        department,
        postalCode,
        isDefault: isDefault || false
      }
    });
    
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashedPassword }
    });
    
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## PASO 8: Tests con Postgres

```bash
cd backend

# Crear .env.test
cat > .env.test << EOF
NODE_ENV=test
DATABASE_URL=postgresql://miappventas:miappventas@localhost:5432/miappventas_test
JWT_SECRET=test-secret-key
EOF

# Ejecutar tests
npm test

# Ver cobertura
npm run test:coverage
```

---

## 📋 Checklist SEMANA 1

- [ ] PostgreSQL instalado/accesible
- [ ] Base de datos `miappventas` creada
- [ ] Prisma schema creado y aplicado
- [ ] Migraciones Prisma corridas (`npx prisma migrate dev`)
- [ ] `src/lib/prisma.js` creado
- [ ] Controllers actualizados con Prisma
- [ ] Datos migrados (si es necesario)
- [ ] Tests verdes con PostgreSQL
- [ ] `.env` con DATABASE_URL configurado
- [ ] `prisma/schema.prisma` validado

---

## 🔗 Recursos

- Prisma Docs: https://www.prisma.io/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Neon (Postgres Cloud): https://neon.tech/
- Prisma Studio: `npx prisma studio`

---

## ❓ Troubleshooting

**Error: "Can't reach database server"**
```bash
# Verificar que PostgreSQL está corriendo
pg_isready -h localhost

# Si no está, iniciar:
# Windows (PowerShell):
Start-Service -Name postgresql-x64-15

# O usando Docker:
docker start postgres-miappventas
```

**Error: "role 'miappventas' does not exist"**
```bash
psql -U postgres -c "CREATE USER miappventas WITH PASSWORD 'miappventas';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE miappventas TO miappventas;"
```

**Error: "password authentication failed"**
- Verificar usuario/password en DATABASE_URL
- Verificar que PostgreSQL está corriendo
- Ejecutar: `psql -U miappventas -d miappventas -h localhost`

---

