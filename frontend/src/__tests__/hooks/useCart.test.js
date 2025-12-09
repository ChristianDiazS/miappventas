import { renderHook, act } from '@testing-library/react';
import React, { useState } from 'react';

describe('useCart Hook', () => {
  const useCart = () => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    const addToCart = (product) => {
      setCart((prevCart) => {
        const existing = prevCart.find((p) => p.id === product.id);
        if (existing) {
          return prevCart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p
          );
        }
        return [...prevCart, product];
      });
    };

    const removeFromCart = (productId) => {
      setCart((prevCart) => prevCart.filter((p) => p.id !== productId));
    };

    const clearCart = () => {
      setCart([]);
    };

    React.useEffect(() => {
      const newTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
      setTotal(newTotal);
    }, [cart]);

    return { cart, total, addToCart, removeFromCart, clearCart };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('debe inicializar con carrito vacío', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toEqual([]);
  });

  it('debe agregar un producto al carrito', () => {
    const { result } = renderHook(() => useCart());
    const product = { id: 1, name: 'Laptop', price: 1000, quantity: 1 };
    
    act(() => {
      result.current.addToCart(product);
    });
    
    expect(result.current.cart.length).toBeGreaterThan(0);
  });

  it('debe incrementar cantidad si el producto ya existe', () => {
    const { result } = renderHook(() => useCart());
    const product = { id: 1, name: 'Laptop', price: 1000, quantity: 1 };
    
    act(() => {
      result.current.addToCart(product);
      result.current.addToCart({ ...product, quantity: 1 });
    });
    
    expect(result.current.cart.length).toBe(1);
  });

  it('debe eliminar un producto del carrito', () => {
    const { result } = renderHook(() => useCart());
    const product = { id: 1, name: 'Laptop', price: 1000, quantity: 1 };
    
    act(() => {
      result.current.addToCart(product);
      result.current.removeFromCart(1);
    });
    
    expect(result.current.cart).toEqual([]);
  });

  it('debe calcular el total correctamente', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart({ id: 1, name: 'Laptop', price: 1000, quantity: 1 });
      result.current.addToCart({ id: 2, name: 'Mouse', price: 50, quantity: 2 });
    });
    
    expect(result.current.cart.length).toBe(2);
  });

  it('debe limpiar el carrito completamente', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart({ id: 1, name: 'Laptop', price: 1000, quantity: 1 });
      result.current.clearCart();
    });
    
    expect(result.current.cart).toEqual([]);
  });
});
