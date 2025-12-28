import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Clock, Edit2, Save, X } from 'lucide-react';

export default function UsersManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    searchTerm: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar rol');
      }

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setEditingUser(null);
      setEditingRole(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'all' && user.role !== filters.role) return false;
    if (filters.searchTerm && !user.email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !user.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getRoleColor = (role) => {
    const colors = {
      'SUPERADMIN': 'bg-red-100 text-red-800',
      'ADMIN': 'bg-blue-100 text-blue-800',
      'USER': 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'SUPERADMIN': return '👑';
      case 'ADMIN': return '🛡️';
      case 'USER': return '👤';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">👥 Gestión de Usuarios</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="SUPERADMIN">👑 Superadmin</option>
              <option value="ADMIN">🛡️ Admin</option>
              <option value="USER">👤 Usuario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Email, nombre..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-gray-600 font-semibold text-sm">Superadmins</p>
          <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'SUPERADMIN').length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-600 font-semibold text-sm">Admins</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-gray-600 font-semibold text-sm">Usuarios</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'USER').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Usuarios ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hay usuarios que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Registrado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-gray-900">{user.name || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4">
                      {editingUser === user.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="SUPERADMIN">👑 Superadmin</option>
                          <option value="ADMIN">🛡️ Admin</option>
                          <option value="USER">👤 Usuario</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateUserRole(user.id, editingRole)}
                            className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setEditingRole(null);
                            }}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditingRole(user.role);
                          }}
                          disabled={currentUser?.id === user.id}
                          className={`font-semibold text-sm flex items-center gap-1 ${
                            currentUser?.id === user.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                          {currentUser?.id === user.id ? 'Es tu cuenta' : 'Editar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">📋 Descripción de Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-bold text-red-700 mb-1">👑 Superadmin</p>
            <p className="text-gray-600">Acceso total a todas las funciones del sistema, incluyendo gestión de backups y configuración del servidor.</p>
          </div>
          <div>
            <p className="font-bold text-blue-700 mb-1">🛡️ Admin</p>
            <p className="text-gray-600">Gestión completa de productos, categorías, órdenes y usuarios. No tiene acceso a backups ni configuración del servidor.</p>
          </div>
          <div>
            <p className="font-bold text-green-700 mb-1">👤 Usuario</p>
            <p className="text-gray-600">Acceso estándar de cliente. Puede ver su perfil, órdenes y realizar compras.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
