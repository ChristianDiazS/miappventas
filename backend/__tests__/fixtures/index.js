/**
 * 🎯 Fixtures de Prueba - Datos Consistentes para Tests
 * 
 * Este archivo centraliza todos los datos de prueba para garantizar:
 * - Consistencia entre tests
 * - Fácil mantenimiento
 * - Reutilización de datos
 * - Organización clara
 */

// ============================================================================
// 👤 USUARIOS - Test Data
// ============================================================================

export const users = {
  // Usuario válido para login
  valid: {
    email: 'usuario.valido@test.com',
    password: 'ValidPass123!',
    firstName: 'Test',
    lastName: 'Usuario',
    phone: '987654321',
  },

  // Usuario válido con datos completos
  complete: {
    email: 'usuario.completo@test.com',
    password: 'CompletePass123!',
    firstName: 'Completo',
    lastName: 'Datos',
    phone: '987654322',
  },

  // Usuario admin para operaciones especiales
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    phone: '987654323',
    role: 'ADMIN',
  },

  // Usuario para cambio de contraseña
  passwordChange: {
    email: 'password.change@test.com',
    password: 'OldPass123!',
    newPassword: 'NewPass456!',
    firstName: 'Password',
    lastName: 'Change',
    phone: '987654324',
  },

  // Usuario para pruebas de favoritos
  withFavorites: {
    email: 'favorites@test.com',
    password: 'FavPass123!',
    firstName: 'With',
    lastName: 'Favorites',
    phone: '987654325',
  },

  // Datos inválidos
  invalid: {
    noEmail: {
      firstName: 'No',
      lastName: 'Email',
      password: 'Pass123!',
    },
    noPassword: {
      email: 'no.password@test.com',
      firstName: 'No',
      lastName: 'Password',
    },
    invalidEmail: {
      email: 'not-an-email',
      password: 'Pass123!',
      firstName: 'Invalid',
      lastName: 'Email',
    },
    weakPassword: {
      email: 'weak.password@test.com',
      password: '123',
      firstName: 'Weak',
      lastName: 'Pass',
    },
  },

  // Datos para actualizar perfil
  update: {
    firstName: 'Actualizado',
    lastName: 'Nombre',
    phone: '987654399',
  },
};

// ============================================================================
// 📦 PRODUCTOS - Test Data
// ============================================================================

export const products = {
  // Producto válido básico
  valid: {
    name: 'Producto Test',
    description: 'Descripción del producto de test',
    price: 99.99,
    stock: 10,
    categoryId: 1,
  },

  // Producto con todos los campos
  complete: {
    name: 'Producto Completo',
    description: 'Descripción detallada del producto',
    price: 199.99,
    stock: 20,
    categoryId: 1,
    sku: 'TEST-SKU-001',
    images: [
      {
        url: 'https://example.com/image1.jpg',
        alt: 'Imagen 1',
      },
    ],
  },

  // Producto premium
  premium: {
    name: 'Producto Premium',
    description: 'Producto de alta calidad',
    price: 499.99,
    stock: 5,
    categoryId: 2,
    sku: 'PREMIUM-001',
  },

  // Producto económico
  budget: {
    name: 'Producto Económico',
    description: 'Producto de bajo costo',
    price: 19.99,
    stock: 100,
    categoryId: 3,
  },

  // Producto sin stock
  noStock: {
    name: 'Producto Sin Stock',
    description: 'Actualmente no disponible',
    price: 79.99,
    stock: 0,
    categoryId: 1,
  },

  // Datos inválidos
  invalid: {
    noName: {
      description: 'Sin nombre',
      price: 99.99,
      stock: 10,
    },
    noPrice: {
      name: 'Sin precio',
      description: 'Descripción',
      stock: 10,
    },
    negativePrice: {
      name: 'Precio negativo',
      description: 'Descripción',
      price: -99.99,
      stock: 10,
    },
    negativeStock: {
      name: 'Stock negativo',
      description: 'Descripción',
      price: 99.99,
      stock: -5,
    },
  },

  // Datos para actualizar
  update: {
    name: 'Producto Actualizado',
    description: 'Descripción actualizada',
    price: 129.99,
    stock: 15,
  },
};

// ============================================================================
// 📋 ÓRDENES - Test Data
// ============================================================================

export const orders = {
  // Orden válida básica
  valid: {
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 99.99,
      },
    ],
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15001',
      country: 'Perú',
    },
  },

  // Orden con múltiples items
  multipleItems: {
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 99.99,
      },
      {
        productId: 2,
        quantity: 1,
        price: 199.99,
      },
    ],
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15001',
      country: 'Perú',
    },
  },

  // Orden con dirección completa
  complete: {
    items: [
      {
        productId: 1,
        quantity: 1,
        price: 99.99,
      },
    ],
    shippingAddress: {
      street: 'Calle Test 456',
      city: 'Arequipa',
      state: 'Arequipa',
      zipCode: '04001',
      country: 'Perú',
    },
    notes: 'Entregar después de las 5pm',
  },

  // Datos inválidos
  invalid: {
    noItems: {
      items: [],
      shippingAddress: {
        street: 'Calle Test',
        city: 'Lima',
      },
    },
    noAddress: {
      items: [
        {
          productId: 1,
          quantity: 1,
        },
      ],
    },
  },

  // Estados de orden
  statuses: {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    shipped: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  },
};

// ============================================================================
// 💳 PAGOS / WEBHOOKS - Test Data
// ============================================================================

export const payments = {
  // Pago exitoso
  successful: {
    orderId: 1,
    amount: 199.98,
    status: 'completed',
    transactionId: 'txn_test_success_123',
    paymentMethod: 'credit_card',
  },

  // Pago fallido
  failed: {
    orderId: 2,
    amount: 199.98,
    status: 'failed',
    transactionId: 'txn_test_failed_456',
    reason: 'Insufficient funds',
  },

  // Pago pendiente
  pending: {
    orderId: 3,
    amount: 199.98,
    status: 'pending',
    transactionId: 'txn_test_pending_789',
  },

  // Webhook de pago exitoso
  webhookSuccess: {
    event: 'payment.completed',
    orderId: 1,
    status: 'completed',
    amount: 199.98,
    timestamp: new Date().toISOString(),
  },

  // Webhook de pago fallido
  webhookFailed: {
    event: 'payment.failed',
    orderId: 2,
    status: 'failed',
    error: 'Card declined',
    timestamp: new Date().toISOString(),
  },
};

// ============================================================================
// 🔐 AUTENTICACIÓN - Test Data
// ============================================================================

export const auth = {
  // Credenciales válidas
  validCredentials: {
    email: 'login.test@test.com',
    password: 'LoginTest123!',
  },

  // Credenciales inválidas
  invalidCredentials: {
    wrongEmail: {
      email: 'nonexistent@test.com',
      password: 'Password123!',
    },
    wrongPassword: {
      email: 'usuario.valido@test.com',
      password: 'WrongPass123!',
    },
    emptyEmail: {
      email: '',
      password: 'Password123!',
    },
    emptyPassword: {
      email: 'usuario.valido@test.com',
      password: '',
    },
  },

  // Token mock
  tokens: {
    valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNDc3NjAwMH0.mock',
    invalid: 'invalid.token.here',
    expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6MTcwNDc3MjQwMH0.expired',
  },
};

// ============================================================================
// 🏷️  CATEGORÍAS - Test Data
// ============================================================================

export const categories = {
  // Categoría válida
  valid: {
    name: 'Electrónica',
    description: 'Productos electrónicos en general',
    slug: 'electronica',
  },

  // Categoría con datos completos
  complete: {
    name: 'Ropa y Accesorios',
    description: 'Ropa y accesorios variados',
    slug: 'ropa-accesorios',
    image: 'https://example.com/category.jpg',
  },

  // Datos inválidos
  invalid: {
    noName: {
      description: 'Sin nombre',
      slug: 'sin-nombre',
    },
    noSlug: {
      name: 'Sin slug',
      description: 'Descripción',
    },
  },
};

// ============================================================================
// ⭐ REVIEWS - Test Data
// ============================================================================

export const reviews = {
  // Review positivo
  positive: {
    productId: 1,
    userId: 1,
    rating: 5,
    title: 'Excelente producto',
    comment: 'Muy satisfecho con la compra. Recomendado.',
  },

  // Review neutral
  neutral: {
    productId: 1,
    userId: 2,
    rating: 3,
    title: 'Producto regular',
    comment: 'Cumple con lo esperado pero nada extraordinario.',
  },

  // Review negativo
  negative: {
    productId: 1,
    userId: 3,
    rating: 1,
    title: 'Mala calidad',
    comment: 'El producto llegó defectuoso. Muy decepcionado.',
  },

  // Datos inválidos
  invalid: {
    noRating: {
      productId: 1,
      userId: 1,
      title: 'Sin rating',
      comment: 'Comentario',
    },
    invalidRating: {
      productId: 1,
      userId: 1,
      rating: 10, // Fuera de rango 1-5
      title: 'Rating inválido',
      comment: 'Comentario',
    },
  },
};

// ============================================================================
// 🛒 CARRITO - Test Data
// ============================================================================

export const cart = {
  // Item válido
  validItem: {
    productId: 1,
    quantity: 2,
  },

  // Múltiples items
  multipleItems: [
    {
      productId: 1,
      quantity: 2,
    },
    {
      productId: 2,
      quantity: 1,
    },
  ],

  // Datos inválidos
  invalid: {
    noProductId: {
      quantity: 2,
    },
    noQuantity: {
      productId: 1,
    },
    negativeQuantity: {
      productId: 1,
      quantity: -1,
    },
    zeroQuantity: {
      productId: 1,
      quantity: 0,
    },
  },
};

// ============================================================================
// 🔍 BÚSQUEDA - Test Data
// ============================================================================

export const search = {
  // Búsquedas válidas
  valid: {
    keyword: 'laptop',
    category: 'electronica',
    priceRange: {
      min: 100,
      max: 5000,
    },
    rating: 4,
    sort: 'price_asc',
  },

  // Búsqueda simple
  simple: {
    keyword: 'producto',
  },

  // Búsqueda avanzada
  advanced: {
    category: 'electronica',
    priceRange: {
      min: 500,
      max: 2000,
    },
    inStock: true,
    rating: 4,
  },
};

// ============================================================================
// 📊 PAGINACIÓN - Test Data
// ============================================================================

export const pagination = {
  // Página 1, 10 items por página
  default: {
    page: 1,
    limit: 10,
  },

  // Segunda página
  second: {
    page: 2,
    limit: 10,
  },

  // Limit personalizado
  custom: {
    page: 1,
    limit: 25,
  },

  // Datos inválidos
  invalid: {
    negativePage: {
      page: -1,
      limit: 10,
    },
    negativeLimit: {
      page: 1,
      limit: -5,
    },
    zeroPage: {
      page: 0,
      limit: 10,
    },
  },
};

// ============================================================================
// 📧 NOTIFICACIONES - Test Data
// ============================================================================

export const notifications = {
  // Notificación de orden confirmada
  orderConfirmed: {
    type: 'order_confirmed',
    userId: 1,
    orderId: 1,
    message: 'Tu orden ha sido confirmada',
  },

  // Notificación de envío
  orderShipped: {
    type: 'order_shipped',
    userId: 1,
    orderId: 1,
    message: 'Tu orden ha sido enviada',
    trackingNumber: 'TRACK123456789',
  },

  // Notificación de entrega
  orderDelivered: {
    type: 'order_delivered',
    userId: 1,
    orderId: 1,
    message: 'Tu orden ha sido entregada',
  },
};

// ============================================================================
// 🔢 IDS - Test Data
// ============================================================================

export const ids = {
  // IDs válidos
  valid: {
    product: 1,
    user: 1,
    order: 1,
    category: 1,
  },

  // IDs inválidos
  invalid: {
    nonexistent: 99999,
    negative: -1,
    zero: 0,
    invalidFormat: 'not-a-number',
  },
};

// ============================================================================
// 🎯 UTILIDADES - Helper Functions
// ============================================================================

/**
 * Genera un email único para tests
 * @param {string} prefix - Prefijo del email
 * @returns {string} Email único
 */
export function generateUniqueEmail(prefix = 'test') {
  return `${prefix}.${Date.now()}@test.com`;
}

/**
 * Genera un nombre de producto único
 * @param {string} prefix - Prefijo del producto
 * @returns {string} Nombre único
 */
export function generateUniqueProductName(prefix = 'Product') {
  return `${prefix} ${Date.now()}`;
}

/**
 * Genera un SKU único
 * @param {string} prefix - Prefijo del SKU
 * @returns {string} SKU único
 */
export function generateUniqueSKU(prefix = 'SKU') {
  return `${prefix}-${Date.now()}`;
}

/**
 * Crea un usuario de test con datos dinámicos
 * @param {object} overrides - Datos a sobrescribir
 * @returns {object} Usuario de test
 */
export function createTestUser(overrides = {}) {
  return {
    ...users.valid,
    email: generateUniqueEmail(),
    ...overrides,
  };
}

/**
 * Crea un producto de test con datos dinámicos
 * @param {object} overrides - Datos a sobrescribir
 * @returns {object} Producto de test
 */
export function createTestProduct(overrides = {}) {
  return {
    ...products.valid,
    name: generateUniqueProductName(),
    sku: generateUniqueSKU(),
    ...overrides,
  };
}

/**
 * Crea una orden de test con datos dinámicos
 * @param {object} overrides - Datos a sobrescribir
 * @returns {object} Orden de test
 */
export function createTestOrder(overrides = {}) {
  return {
    ...orders.valid,
    ...overrides,
  };
}

// ============================================================================
// 📌 EXPORTACIÓN DEFAULT
// ============================================================================

export default {
  users,
  products,
  orders,
  payments,
  auth,
  categories,
  reviews,
  cart,
  search,
  pagination,
  notifications,
  ids,
  generateUniqueEmail,
  generateUniqueProductName,
  generateUniqueSKU,
  createTestUser,
  createTestProduct,
  createTestOrder,
};
