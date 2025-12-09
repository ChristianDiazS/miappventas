import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function UserMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cargar usuario del localStorage
    const loadUser = () => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          setUser(JSON.parse(userJson));
        } catch (error) {
          console.error('Error parseando usuario:', error);
        }
      } else {
        setUser(null);
      }
    };

    // Cargar al montar el componente
    loadUser();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      loadUser();
    };

    // Evento cuando otra pestaña cambia localStorage
    window.addEventListener('storage', handleStorageChange);

    // Evento personalizado cuando el mismo tab actualiza localStorage
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex gap-3">
        <Link
          to="/login"
          className="px-4 py-2 text-gray-700 hover:text-cyan-500 font-medium transition"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium transition"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
          {user.firstName?.[0]?.toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.firstName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsOpen(false)}
          >
            Mi Perfil
          </Link>
          <Link
            to="/orders"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsOpen(false)}
          >
            Mis Pedidos
          </Link>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
