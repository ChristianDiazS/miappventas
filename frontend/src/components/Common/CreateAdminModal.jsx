import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CreateAdminModal = ({ onClose, onSuccess, editingAdmin }) => {
  const [formData, setFormData] = useState(
    editingAdmin || {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'ADMIN',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingAdmin && !formData.password) {
      setError('La contraseña es requerida para crear un nuevo admin');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const url = editingAdmin
        ? `http://localhost:3001/api/superadmin/admins/${editingAdmin.id}`
        : 'http://localhost:3001/api/superadmin/admins';

      const method = editingAdmin ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el admin');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving admin:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {editingAdmin ? 'Editar Admin' : 'Crear Nuevo Admin'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 flex items-start space-x-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingAdmin}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 disabled:bg-gray-600 disabled:opacity-50"
              placeholder="admin@ejemplo.com"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Juan"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Apellido *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Pérez"
            />
          </div>

          {/* Password */}
          {!editingAdmin && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Contraseña *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">SuperAdmin</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium transition-all duration-200"
            >
              {loading ? 'Guardando...' : editingAdmin ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal;
