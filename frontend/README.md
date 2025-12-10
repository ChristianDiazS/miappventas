# 🎨 Frontend - MiAppVentas

Aplicación frontend desarrollada con React 18 y Vite para MiAppVentas.

---

## 📋 Descripción

Interfaz de usuario moderna y responsiva para gestionar ventas, productos e inventario. Incluye componentes reutilizables, gestión de estado con hooks, y una experiencia de usuario intuitiva.

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool y dev server
- **React Router v7** - Client-side routing
- **TailwindCSS v4** - Styling
- **Jest** - Unit testing
- **Axios** - HTTP client

---

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/               # Páginas/vistas
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API calls
│   ├── styles/              # CSS modules
│   ├── App.jsx
│   └── main.jsx
├── public/                  # Archivos estáticos
├── vite.config.js
├── jest.config.js
└── package.json
```

---

## 🚀 Quick Start

### Instalación

```bash
npm install --legacy-peer-deps
```

### Desarrollo

```bash
npm run dev
```

Servidor en `http://localhost:5173`

### Build

```bash
npm run build
```

---

## 🧪 Testing

```bash
npm test                    # Ejecutar tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Con cobertura
```

**Coverage actual:** 86.3% ✓

---

## 📦 Características Principales

✅ Autenticación JWT  
✅ Dashboard interactivo  
✅ Gestión de productos  
✅ Carrito de compras  
✅ Búsqueda y filtros  
✅ Responsive design  
✅ Manejo de errores  

---

## 📝 Scripts

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run preview          # Preview del build
npm test                 # Tests
npm run lint             # Linting
npm run lint:fix         # Arreglar errores
```

---

## 🔐 Variables de Entorno

```
VITE_API_URL=http://localhost:5000/api
```

---

**Última actualización:** Diciembre 2025
