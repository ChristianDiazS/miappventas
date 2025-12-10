# 🚀 MiAppVentas

Sistema de gestión de ventas moderno construido con React, Node.js y PostgreSQL.

## 📋 Descripción

MiAppVentas es una aplicación web completa para gestionar ventas, productos e inventario con una interfaz intuitiva y backend robusto. Incluye autenticación, reportes y análisis en tiempo real.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v7** - Routing
- **TailwindCSS** - Styling
- **Jest** - Testing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL 17** - Database
- **Prisma ORM** - Database access
- **Jest** - Testing

### DevOps
- **GitHub Actions** - CI/CD
- **Docker** - Containerization
- **Git** - Version control

---

## 📦 Características

✅ Gestión de productos e inventario  
✅ Sistema de ventas con historial  
✅ Análisis y reportes  
✅ Autenticación de usuarios  
✅ Panel de control (Dashboard)  
✅ API REST completa  
✅ Tests automatizados  
✅ CI/CD con GitHub Actions  

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18.x o 20.x
- PostgreSQL 17+
- npm 10.0.0+

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/ChristianDiazS/miappventas.git
cd miappventas

# Instalar dependencias
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar migraciones de base de datos
npm run migrate

# Iniciar en desarrollo
npm run dev
```

### Servidor Local
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Database:** PostgreSQL en localhost:5432

---

## 📁 Estructura del Proyecto

```
miappventas/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── styles/          # CSS modules
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express app
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── prisma/
│       └── schema.prisma    # Database schema
│
├── .github/workflows/        # GitHub Actions
│   └── test.yml             # CI/CD pipeline
│
├── package.json             # Root monorepo config
└── README.md               # Este archivo
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo backend
npm test --prefix backend

# Solo frontend
npm test --prefix frontend

# Con cobertura
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Coverage Actual
- **Frontend:** 86.3% ✓
- **Backend:** 81.6% ✓
- **Combined:** 84.8% ✓

---

## 🔄 CI/CD Pipeline

El proyecto incluye un pipeline automático con GitHub Actions que:

1. **Ejecuta tests** en cada push/PR
2. **Valida código** (linting, security)
3. **Crea reportes** de cobertura
4. **Notifica resultados** en PRs

### Estado del Pipeline
- ✅ Test Pipeline: Activo
- ✅ Cobertura: >80%
- ✅ Workflows: 1 configurado

---

## 📝 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia frontend + backend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Testing
npm test                # Ejecutar todos los tests
npm run test:coverage   # Tests con cobertura

# Build
npm run build           # Build para producción
npm run build:backend   # Build backend
npm run build:frontend  # Build frontend

# Base de datos
npm run migrate         # Ejecutar migraciones
npm run seed            # Seed datos iniciales
npm run studio          # Abrir Prisma Studio

# Linting
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Arreglar errores
```

---

## 🗄️ Base de Datos

### Configuración

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/miappventas"

# Crear y migrar
npm run migrate

# Ver datos con Prisma Studio
npm run studio
```

### Modelo de Datos
- Users (Usuarios)
- Products (Productos)
- Orders (Pedidos)
- OrderItems (Items de pedidos)
- Categories (Categorías)
- Inventory (Inventario)

---

## 🔐 Autenticación

El sistema usa autenticación basada en JWT:

```javascript
// Login
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }

// Respuesta
{ "token": "eyJhbGc...", "user": { ... } }

// Usar token
Headers: { "Authorization": "Bearer eyJhbGc..." }
```

---

## 📚 API Endpoints

### Productos
```
GET    /api/products          # Listar productos
GET    /api/products/:id      # Obtener producto
POST   /api/products          # Crear producto
PUT    /api/products/:id      # Actualizar producto
DELETE /api/products/:id      # Eliminar producto
```

### Órdenes
```
GET    /api/orders            # Listar órdenes
GET    /api/orders/:id        # Obtener orden
POST   /api/orders            # Crear orden
PUT    /api/orders/:id        # Actualizar orden
DELETE /api/orders/:id        # Eliminar orden
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Requisitos para PR
- ✅ Tests deben pasar
- ✅ Coverage > 80%
- ✅ No warnings en linting
- ✅ Documentación actualizada

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

Para reportar issues o sugerencias:
- 📧 Email: support@miappventas.com
- 🐛 Issues: [GitHub Issues](https://github.com/ChristianDiazS/miappventas/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ChristianDiazS/miappventas/discussions)

---

## 👨‍💻 Autor

**Christian Díaz** - [GitHub](https://github.com/ChristianDiazS)

---

## ✨ Acknowledgments

- React community
- Express.js team
- PostgreSQL community
- GitHub Actions documentation

---

**Última actualización:** 09 de Diciembre 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Production Ready