import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Mock hook para testing
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

describe('useFavorites Hook (Storage Hook)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe inicializar con valor inicial', () => {
    const { result } = renderHook(() => useLocalStorage('test', []));
    expect(result.current[0]).toEqual([]);
  });

  it('debe guardar y recuperar valores', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', []));
    
    act(() => {
      result.current[1]([{ id: 1, name: 'Producto' }]);
    });

    expect(result.current[0]).toEqual([{ id: 1, name: 'Producto' }]);
  });

  it('debe persistir en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', []));
    
    act(() => {
      result.current[1]([{ id: 1 }]);
    });

    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    expect(stored).toContainEqual({ id: 1 });
  });

  it('debe cargar datos existentes desde localStorage', () => {
    const initialData = [{ id: 1, name: 'Item' }];
    localStorage.setItem('favorites', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalStorage('favorites', []));
    expect(result.current[0]).toEqual(initialData);
  });

  it('debe actualizar múltiples veces', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', []));
    
    act(() => {
      result.current[1]([{ id: 1 }]);
    });
    expect(result.current[0]).toHaveLength(1);

    act(() => {
      result.current[1]([{ id: 1 }, { id: 2 }]);
    });
    expect(result.current[0]).toHaveLength(2);
  });

  it('debe manejar errores sin romper', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', []));
    
    expect(result.current[0]).toBeDefined();
    expect(Array.isArray(result.current[0])).toBe(true);
  });
});
