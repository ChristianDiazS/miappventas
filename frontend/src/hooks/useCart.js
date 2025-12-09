import { useState, useEffect } from 'react';

export function useCart() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    // Pequeño delay para asegurar que localStorage esté accesible
    const timer = setTimeout(() => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
      setIsLoading(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cart));
      // Disparar evento personalizado para actualizar badge
      window.dispatchEvent(
        new CustomEvent('cartUpdated', { detail: { cart, itemCount: getTotalItems() } })
      );
    }
  }, [cart, isLoading]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    const { _id, name, price, stock } = product;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === _id);

      if (existingItem) {
        // Si ya existe, aumentar cantidad
        if (existingItem.quantity < stock) {
          return prevCart.map((item) =>
            item.productId === _id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart; // No agregar si ya alcanzó stock máximo
      }

      // Agregar nuevo producto
      return [
        ...prevCart,
        {
          productId: _id,
          name,
          price,
          quantity: 1,
          stock
        }
      ];
    });
  };

  // Actualizar cantidad
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Obtener total de artículos
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Obtener subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Obtener total con impuestos y envío
  const getTotals = (shippingCost = 0, taxRate = 0.18) => {
    const subtotal = getSubtotal();
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    return {
      subtotal,
      tax,
      shipping: shippingCost,
      total
    };
  };

  return {
    cart,
    isLoading,
    loading: isLoading, // Mantener compatibilidad con código existente
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotals
  };
}
