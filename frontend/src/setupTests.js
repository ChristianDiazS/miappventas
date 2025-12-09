import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill para TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de fetch
global.fetch = jest.fn();

// Limpiar mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
});
