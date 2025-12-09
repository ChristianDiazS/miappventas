// Setup para tests del backend - CommonJS version
const dotenv = require('dotenv');

// Cargar variables de entorno de test
dotenv.config({ path: '.env.test' });

// Variables de entorno por defecto para tests
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/miappventas-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-123';
process.env.PORT = process.env.PORT || '5001';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';

// Mock de console.log en tests para evitar spam
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  // Silenciar logs durante tests (opcional)
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Mock global para setTimeout (si es necesario)
jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

module.exports = {};
