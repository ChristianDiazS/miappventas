import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../Common/SearchBar';
import { CartIcon } from '../Common/CartIcon';
import { UserMenu } from './UserMenu';
import { useCart } from '../../hooks/useCart';

export function Header() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Actualizar el contador inicial desde el carrito
    setItemCount(cart.length);

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        setItemCount(cartItems.length);
      } else {
        setItemCount(0);
      }
    };

    // Escuchar el evento personalizado 'cartUpdated'
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cart]);

  const handleSearch = (query) => {
    // Navegar a /products con el parámetro de búsqueda (incluyendo vacío)
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      // Si está vacío, navegar con parámetro vacío para mostrar todos
      navigate('/products?search=');
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center py-1">
            <img 
              src="/images/logo/Logo-UnPoquitoVariado.png" 
              alt="Joyería Logo" 
              className="h-32 sm:h-40 lg:h-48 w-auto object-contain transition-all duration-200"
            />
          </Link>

          {/* SearchBar */}
          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar 
              placeholder="Buscar por nombre o categoría..."
              onSearch={handleSearch}
            />
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-cyan-500 font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-cyan-500 font-medium transition-colors">Productos</Link>
          </nav>

          {/* CartIcon y UserMenu */}
          <div className="flex items-center gap-4">
            <Link to="/cart">
              <CartIcon itemCount={itemCount} />
            </Link>
            
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}