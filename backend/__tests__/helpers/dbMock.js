// Helper para tests - configurar mocks de MongoDB
import mongoose from 'mongoose';

// Mock en memoria de Mongoose para tests
const mockData = {
  users: [],
  products: [],
  orders: [],
};

export const setupTestDB = async () => {
  // Para tests, usamos mocks en memoria en lugar de conectar a MongoDB real
  jest.spyOn(mongoose, 'connect').mockResolvedValue({
    connection: { db: { name: 'miappventas-test' } },
  });

  jest.spyOn(mongoose, 'disconnect').mockResolvedValue(true);

  return mockData;
};

export const cleanupTestDB = async () => {
  mockData.users = [];
  mockData.products = [];
  mockData.orders = [];
};

export const resetMockData = () => {
  mockData.users = [];
  mockData.products = [];
  mockData.orders = [];
};

// Mock utilities para simular operaciones de base de datos
export const mockUserModel = {
  create: jest.fn(async (data) => {
    const user = { _id: new mongoose.Types.ObjectId(), ...data };
    mockData.users.push(user);
    return user;
  }),
  findById: jest.fn(async (id) => {
    return mockData.users.find((u) => u._id.toString() === id.toString());
  }),
  findOne: jest.fn(async (query) => {
    return mockData.users.find((u) =>
      Object.entries(query).every(([key, value]) => u[key] === value)
    );
  }),
  find: jest.fn(async () => {
    return mockData.users;
  }),
  findByIdAndUpdate: jest.fn(async (id, updates) => {
    const user = mockData.users.find((u) => u._id.toString() === id.toString());
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  }),
  findByIdAndDelete: jest.fn(async (id) => {
    const index = mockData.users.findIndex((u) => u._id.toString() === id.toString());
    if (index > -1) {
      return mockData.users.splice(index, 1)[0];
    }
    return null;
  }),
};

export const mockProductModel = {
  create: jest.fn(async (data) => {
    const product = { _id: new mongoose.Types.ObjectId(), ...data };
    mockData.products.push(product);
    return product;
  }),
  findById: jest.fn(async (id) => {
    return mockData.products.find((p) => p._id.toString() === id.toString());
  }),
  find: jest.fn(async (query = {}) => {
    if (Object.keys(query).length === 0) {
      return mockData.products;
    }
    return mockData.products.filter((p) =>
      Object.entries(query).every(([key, value]) => {
        if (key === 'price') {
          return p[key] <= value;
        }
        return p[key] === value;
      })
    );
  }),
  findByIdAndUpdate: jest.fn(async (id, updates) => {
    const product = mockData.products.find((p) => p._id.toString() === id.toString());
    if (product) {
      Object.assign(product, updates);
    }
    return product;
  }),
  findByIdAndDelete: jest.fn(async (id) => {
    const index = mockData.products.findIndex((p) => p._id.toString() === id.toString());
    if (index > -1) {
      return mockData.products.splice(index, 1)[0];
    }
    return null;
  }),
};

export const mockOrderModel = {
  create: jest.fn(async (data) => {
    const order = {
      _id: new mongoose.Types.ObjectId(),
      status: 'pending',
      paymentStatus: 'pending',
      ...data,
    };
    mockData.orders.push(order);
    return order;
  }),
  findById: jest.fn(async (id) => {
    return mockData.orders.find((o) => o._id.toString() === id.toString());
  }),
  find: jest.fn(async (query = {}) => {
    if (Object.keys(query).length === 0) {
      return mockData.orders;
    }
    return mockData.orders.filter((o) =>
      Object.entries(query).every(([key, value]) => o[key] === value)
    );
  }),
  findByIdAndUpdate: jest.fn(async (id, updates) => {
    const order = mockData.orders.find((o) => o._id.toString() === id.toString());
    if (order) {
      Object.assign(order, updates);
    }
    return order;
  }),
};
