// Fixtures para tests de productos (Prisma)
const mockProduct = {
  id: 1,
  sku: 'DELL-XPS-13-001',
  title: 'Laptop Dell XPS 13',
  description: 'Laptop ultraportátil de alta performance',
  price: 2500.00,
  originalPrice: 2800.00,
  categoryId: 1,
  stock: 50,
  weight: 1.2,
  rating: 4.5,
  reviewCount: 120,
  active: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockProduct2 = {
  id: 2,
  sku: 'LOG-MX-MASTER-001',
  title: 'Mouse Logitech MX Master',
  description: 'Mouse profesional de precisión',
  price: 150.00,
  originalPrice: 179.99,
  categoryId: 2,
  stock: 200,
  weight: 0.135,
  rating: 4.8,
  reviewCount: 350,
  active: true,
  createdAt: new Date('2025-01-02'),
  updatedAt: new Date('2025-01-02'),
};

const mockProduct3 = {
  id: 3,
  sku: 'KEY-RGB-001',
  title: 'Teclado Mecánico RGB',
  description: 'Teclado mecánico con retroiluminación RGB',
  price: 120.00,
  originalPrice: 149.99,
  categoryId: 2,
  stock: 0,
  weight: 0.9,
  rating: 4.3,
  reviewCount: 89,
  active: true,
  createdAt: new Date('2025-01-03'),
  updatedAt: new Date('2025-01-03'),
};

const mockNewProduct = {
  sku: 'LG-4K-27-001',
  title: 'Monitor LG 27" 4K',
  description: 'Monitor 4K de 27 pulgadas para diseño profesional',
  price: 1200.00,
  categoryId: 3,
  stock: 30,
};

const mockProductUpdate = {
  price: 2700.00,
  stock: 45,
  rating: 4.6,
};

const mockInvalidProduct = {
  title: '',
  price: -100,
  stock: -10,
};

const mockProducts = [mockProduct, mockProduct2, mockProduct3];

module.exports = {
  mockProduct,
  mockProduct2,
  mockProduct3,
  mockNewProduct,
  mockProductUpdate,
  mockInvalidProduct,
  mockProducts,
};
