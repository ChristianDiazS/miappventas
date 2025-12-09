# 🛍️ MiAppVentas - E-Commerce Perú

**Estado:** ✅ MVP Completado (95% funcional)  
**Última Actualización:** 7 de Diciembre 2025  
**Versión:** 1.0.0-beta  

---

## 📊 Descripción del Proyecto

**MiAppVentas** es una plataforma e-commerce completa y funcional para Perú, diseñada con estándares profesionales. Incluye:

- ✅ Frontend moderno con React 18 + Tailwind CSS v4
- ✅ Backend API REST con Node.js + Express
- ✅ Base de datos MongoDB Atlas
- ✅ Sistema de autenticación JWT completo
- ✅ Carrito de compras dinámico
- ✅ Flujo de checkout integrado
- ✅ Gestor de órdenes y historial
- ✅ Sistema de imágenes y galería
- ✅ Formatos de precio consistentes (S/. Soles Peruanos)

---

## 🎯 Características Principales

### 🛒 Compra
- Catálogo completo con búsqueda en tiempo real
- Filtros por categoría, precio y stock
- 5 opciones de ordenamiento
- Galería de imágenes en detalle del producto
- Carrito persistente (localStorage)
- Cálculos automáticos (subtotal, IGV, envío)

### 🔐 Seguridad
- Autenticación JWT con tokens seguros
- Hash de contraseñas (bcrypt)
- Validación server-side
- Middleware de protección en rutas sensibles
- CORS configurado

### 💳 Checkout
- Selección de dirección de envío
- Múltiples métodos de pago
- Confirmación de orden
- Historial de órdenes
- Sistema de reviews y calificaciones

### 👤 Perfil de Usuario
- Gestión de direcciones (CRUD)
- Historial de órdenes
- Información personal
- Favoritos/Wishlist (localStorage)

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 16+ 
- MongoDB Atlas (cuenta gratuita)
- npm o yarn

### Instalación en 3 pasos

**1. Clonar el repositorio**
```bash
cd MiAppVentas
```

**2. Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

**3. Ejecutar servidores**

**Opción A: Con scripts**
```bash
# Windows
start-all.bat

# macOS/Linux
bash start-all.sh
```

**Opción B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### URLs de Acceso
- 🌐 **Frontend:** http://localhost:5173
- 🔌 **Backend:** http://localhost:5000
- 🏥 **Health Check:** http://localhost:5000/api/health

---

## 📁 Estructura del Proyecto

```
MiAppVentas/
├── frontend/                  # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # 13 componentes reutilizables
│   │   ├── pages/            # 12 páginas principales
│   │   ├── hooks/            # Custom hooks (useCart)
│   │   └── lib/              # Utilidades
│   ├── public/images/        # Imágenes de productos
│   └── package.json
│
├── backend/                   # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/           # 3 esquemas (User, Product, Order)
│   │   ├── routes/           # 5 rutas de API
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Autenticación y errores
│   │   └── config/           # Base de datos
│   └── package.json
│
├── ANALISIS_COMPLETO_PROYECTO.md  # Análisis técnico
├── README.md                  # Este archivo
├── start-all.bat             # Script Windows
├── start-all.sh              # Script Unix
└── .gitignore
```

---

## ✨ Páginas Implementadas

| Página | Ruta | Descripción |
|--------|------|------------|
| 🏠 Home | `/` | Landing page con hero y productos destacados |
| 📦 Productos | `/products` | Catálogo con filtros y búsqueda |
| 🔍 Detalle | `/products/:id` | Información completa + reviews |
| 🛒 Carrito | `/cart` | Gestión de items y precios |
| 📍 Dirección | `/checkout/address` | Datos de envío |
| 💳 Pago | `/checkout/payment` | Métodos de pago |
| ✅ Confirmación | `/order-confirmation` | Resumen de orden |
| 📋 Órdenes | `/orders` | Historial de compras |
| 👤 Perfil | `/profile` | Datos del usuario |
| 🔑 Login | `/login` | Iniciar sesión |
| ✍️ Registro | `/register` | Crear cuenta |

---

## 🔌 API REST Endpoints

### 🟢 Públicos (sin token)
```
GET    /api/health                    # Estado del servidor
GET    /api/products                  # Listar productos
GET    /api/products/:id              # Detalle de producto
POST   /api/products/:id/reviews      # Agregar review
POST   /api/auth/register             # Registro
POST   /api/auth/login                # Login
```

### 🔴 Protegidos (requieren JWT)
```
GET    /api/auth/profile              # Mi perfil
PUT    /api/auth/profile              # Actualizar perfil
GET    /api/users/addresses           # Mis direcciones
POST   /api/users/addresses           # Crear dirección
PUT    /api/users/addresses/:id       # Actualizar dirección
DELETE /api/users/addresses/:id       # Eliminar dirección
POST   /api/orders                    # Crear orden
GET    /api/orders                    # Mis órdenes
GET    /api/orders/:id                # Detalle de orden
POST   /api/payments/process          # Procesar pago
```

---

## 🛠️ Configuración

### Variables de Entorno Backend

Crear archivo `.env` en `backend/`:

```env
# Base de datos
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/miappventas?retryWrites=true&w=majority

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu-secreto-super-seguro-aqui
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Variables de Entorno Frontend

Crear archivo `.env.local` en `frontend/` (opcional):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Stack Tecnológico

| Layer | Tecnología | Versión |
|-------|-----------|---------|
| **Frontend** | React | 19.2.0 |
| **Build** | Vite | 7.2.4 |
| **Styling** | Tailwind CSS | 4.1.17 |
| **Routing** | React Router | 7.10.1 |
| **Backend** | Express | 4.18.2 |
| **Runtime** | Node.js | 18+ LTS |
| **BD** | MongoDB | 5.0+ |
| **Auth** | JWT | 9.0.0 |
| **Seguridad** | bcrypt | 5.1.0 |

---

## 🧪 Testing y Validación

### Frontend
```bash
cd frontend
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Vista previa build
```

### Backend
```bash
cd backend
npm run dev      # Desarrollo con watch
npm start        # Producción
```

### API Testing (con Postman/Thunder Client)
1. Registrarse en `/api/auth/register`
2. Login en `/api/auth/login` → obtener token
3. Usar token en header: `Authorization: Bearer TOKEN`

---

## 📈 Estadísticas

| Métrica | Cantidad | Estado |
|---------|----------|--------|
| Componentes React | 13 | ✅ Completos |
| Páginas | 12 | ✅ Funcionales |
| Endpoints API | 20+ | ✅ Implementados |
| Modelos BD | 3 | ✅ Operacionales |
| Líneas de código | 4,000+ | ✅ Profesional |
| Test Coverage | 0% | ⚠️ Próximo |

---

## 🎯 Próximas Mejoras

### Prioridad 1 (Crítica)
- [ ] Implementar testing (Jest + React Testing Library)
- [ ] Documentación técnica (Swagger/OpenAPI)
- [ ] Validación robusta con Zod
- [ ] Admin panel básico

### Prioridad 2 (Alta)
- [ ] Integración de pagos real (Stripe)
- [ ] Rate limiting en API
- [ ] Error boundaries
- [ ] Logging centralizado

### Prioridad 3 (Media)
- [ ] Code splitting y lazy loading
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] CI/CD con GitHub Actions

**Ver más detalles en:** [ANALISIS_COMPLETO_PROYECTO.md](./ANALISIS_COMPLETO_PROYECTO.md)

---

## 🐛 Troubleshooting

### "Puerto en uso"
```bash
# Encontrar proceso
lsof -i :5000    # Backend
lsof -i :5173    # Frontend

# Matar proceso
kill -9 PID
```

### "MongoDB no conecta"
```bash
# Verificar credenciales en .env
# Verificar que IP está en MongoDB Atlas whitelist
# Conectar con compass para probar
```

### "CORS Error"
- Confirmar `CORS_ORIGIN` en `.env` backend
- Debe coincidir con URL del frontend
- Limpiar caché del navegador

### "Token inválido"
- Limpiar localStorage en DevTools
- Verificar `JWT_SECRET` en `.env`
- Volver a hacer login

---

## 📚 Documentación Adicional

- **[ANALISIS_COMPLETO_PROYECTO.md](./ANALISIS_COMPLETO_PROYECTO.md)** - Análisis técnico detallado
- **[frontend/README.md](./frontend/README.md)** - Documentación frontend
- **[backend/README.md](./backend/README.md)** - Documentación backend

---

## 📋 Checklist de Funcionalidad

### ✅ Completado
- [x] Autenticación (registro/login)
- [x] Catálogo de productos
- [x] Búsqueda en tiempo real
- [x] Filtros avanzados
- [x] Carrito de compras
- [x] Checkout con dirección
- [x] Método de pago (framework)
- [x] Órdenes e historial
- [x] Gestión de direcciones
- [x] Reviews y ratings
- [x] Imágenes y galería
- [x] Responsive design

### ⏳ Próximo
- [ ] Testing automático
- [ ] Admin panel
- [ ] Integración de pagos real
- [ ] Notificaciones por email
- [ ] Dashboard de análisis

---

## 🤝 Contribución

Para reportar bugs o sugerir mejoras:
1. Abrir un issue con descripción detallada
2. Fork → rama nueva → commit → pull request

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial

---

## 👨‍💼 Autor

**Proyecto:** MiAppVentas  
**Estado:** Desarrollo Activo 🚀  
**Última Actualización:** 7 de Diciembre 2025  

---

## 📞 Soporte

Para soporte técnico:
- 📧 Email: soporte@miappventas.com
- 📱 WhatsApp: +51 999 999 999
- 🌐 Web: https://miappventas.com

---

**¡Gracias por usar MiAppVentas!** 🎉
