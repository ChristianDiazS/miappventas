# 🚀 MiAppVentas Backend API

**Backend REST API** para la plataforma de e-commerce MiAppVentas

## 📋 Requisitos

- Node.js 16+
- npm 8+
- MongoDB local o Atlas

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

**Archivo `.env`:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/miappventas
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Instalar MongoDB (si no lo tienes)

**Windows:**
```bash
# Descargar desde: https://www.mongodb.com/try/download/community
# O usar WSL2 + Docker:
docker run -d -p 27017:27017 mongo:latest
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
curl https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
```

## ▶️ Ejecutar

### Desarrollo (con watch automático)
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en: **http://localhost:5000**

## 📡 Endpoints Disponibles

### 🔐 Autenticación

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "securepass123",
  "phone": "+51999999999"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": { ... },
  "token": "eyJhbGc..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "securepass123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_TOKEN
```

### 📦 Productos

#### Obtener todos los productos
```http
GET /api/products?category=Laptops&minPrice=1000&maxPrice=3000&search=dell&page=1&limit=12
```

**Query Parameters:**
- `category`: Laptops, Monitores, Accesorios, Periféricos, Mobiliario
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo
- `search`: Búsqueda por nombre/descripción
- `page`: Número de página
- `limit`: Productos por página

#### Obtener producto por ID
```http
GET /api/products/:id
```

#### Crear producto (admin)
```http
POST /api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Laptop Dell XPS 13",
  "description": "Ultraportátil",
  "price": 1299,
  "originalPrice": 1499,
  "category": "Laptops",
  "stock": 5,
  "sku": "XPS-13-2025",
  "features": ["Intel Core i7", "16GB RAM", "512GB SSD"]
}
```

### 👤 Usuarios

#### Obtener perfil
```http
GET /api/users/profile
Authorization: Bearer YOUR_TOKEN
```

#### Actualizar perfil
```http
PUT /api/users/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+51999999999"
}
```

#### Agregar dirección
```http
POST /api/users/addresses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "label": "Casa",
  "street": "Av. Principal 123",
  "district": "Miraflores",
  "province": "Lima",
  "department": "Lima",
  "postalCode": "15074"
}
```

### 📋 Órdenes

#### Crear orden
```http
POST /api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "ID_PRODUCTO",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+51999999999",
    "street": "Av. Principal 123",
    "district": "Miraflores",
    "province": "Lima",
    "department": "Lima"
  },
  "shippingMethod": "standard",
  "paymentMethod": "credit_card"
}
```

#### Obtener mis órdenes
```http
GET /api/orders
Authorization: Bearer YOUR_TOKEN
```

#### Obtener orden por ID
```http
GET /api/orders/:id
Authorization: Bearer YOUR_TOKEN
```

## 🔌 Integración con Frontend

### Configurar URL del backend en el frontend

En `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Ejemplo de llamada desde React

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Login
async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
}

// Obtener productos
async function getProducts(params) {
  const response = await axios.get(`${API_URL}/products`, { params });
  return response.data;
}

// Con autenticación
async function getUserProfile() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}
```

## 🧪 Testing

Puedes usar **Postman** o **Thunder Client** para probar los endpoints:

1. **Registrarse** → Obtener token
2. **Login** → Usar token en headers
3. **Obtener productos** → Sin token (público)
4. **Crear orden** → Con token

## 📁 Estructura

```
backend/
├── src/
│   ├── models/          # Esquemas de MongoDB
│   ├── routes/          # Definición de rutas
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación, errores
│   ├── utils/           # Funciones auxiliares
│   └── config/          # Configuración (BD, etc)
├── server.js            # Punto de entrada
├── package.json
├── .env
└── .env.example
```

## 🐛 Troubleshooting

**Error: Cannot find module 'express'**
```bash
npm install
```

**Error: MongooseError - connect ECONNREFUSED**
```bash
# Verificar que MongoDB está corriendo
# Windows: mongod
# macOS: brew services start mongodb-community
```

**Error CORS**
- Verificar que CORS_ORIGIN en .env coincida con el frontend
- Por defecto es: http://localhost:5173

## 📚 Modelos

### Product
- name, description, price, originalPrice
- category, stock, sku
- images, features
- rating, reviews
- active, timestamps

### User
- firstName, lastName, email, password
- phone, addresses
- role (customer, admin)
- active, timestamps

### Order
- orderNumber, user, items
- shippingAddress, shippingMethod
- subtotal, tax, shippingCost, total
- status, paymentStatus
- createdAt, updatedAt

## 🚀 Próximos Pasos

- [ ] Seed de datos (productos de ejemplo)
- [ ] Autenticación con OAuth (Google, Facebook)
- [ ] Integración con Izipay para pagos
- [ ] Sistema de reviews
- [ ] Dashboard admin
- [ ] Notificaciones por email

---

**API lista para producción** ✅
