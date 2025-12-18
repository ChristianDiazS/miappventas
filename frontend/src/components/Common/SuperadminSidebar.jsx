import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const SuperadminSidebar = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Estadísticas generales',
    },
    {
      id: 'admins',
      label: 'Gestión de Admins',
      icon: Users,
      description: 'Crear y gestionar admins',
    },
    {
      id: 'audit',
      label: 'Auditoría',
      icon: FileText,
      description: 'Logs de actividad',
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      description: 'Análisis de ventas',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      description: 'Ajustes del sistema',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text">
          🎯 SUPERADMIN
        </h2>
        <p className="text-gray-400 text-sm mt-1">Un Poquito Variado</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  size={20}
                  className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'}
                />
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className={`text-xs ${isActive ? 'text-cyan-100' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SuperadminSidebar;
