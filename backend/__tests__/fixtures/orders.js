// Fixtures para tests de órdenes (Prisma)
const mockOrder = {
  id: 1,
  orderNumber: 'ORD-2025-00001',
  userId: 1,
  items: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 1,
      unitPrice: 2500.00,
      subtotal: 2500.00,
    },
    {
      id: 2,
      orderId: 1,
      productId: 2,
      quantity: 2,
      unitPrice: 150.00,
      subtotal: 300.00,
    },
  ],
  subtotal: 2800.00,
  tax: 504.00,
  shippingCost: 50.00,
  total: 3354.00,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  shippingAddressId: 1,
  shippingMethod: 'STANDARD',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockOrder2 = {
  id: 2,
  orderNumber: 'ORD-2025-00002',
  userId: 1,
  items: [
    {
      id: 3,
      orderId: 2,
      productId: 3,
      quantity: 1,
      unitPrice: 120.00,
      subtotal: 120.00,
    },
  ],
  subtotal: 120.00,
  tax: 21.60,
  shippingCost: 50.00,
  total: 191.60,
  status: 'SHIPPED',
  paymentStatus: 'COMPLETED',
  shippingAddressId: 1,
  shippingMethod: 'STANDARD',
  createdAt: new Date('2024-12-25'),
  updatedAt: new Date('2024-12-26'),
};

const mockNewOrder = {
  items: [
    {
      productId: 1,
      quantity: 1,
    },
  ],
  shippingAddressId: 1,
  shippingMethod: 'STANDARD',
};

const mockOrderUpdate = {
  status: 'PROCESSING',
  paymentStatus: 'COMPLETED',
};

const mockOrderStatusUpdate = {
  status: 'delivered',
};

const mockInvalidOrder = {
  items: [],
  total: -100,
  status: 'invalid_status',
};

module.exports = {
  mockOrder,
  mockOrder2,
  mockNewOrder,
  mockOrderUpdate,
  mockOrderStatusUpdate,
  mockInvalidOrder,
};
