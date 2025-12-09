import React, { useState } from 'react';
import { Button } from '../Common/Button';

export default function ShippingAddresses({ user, onUpdate, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    district: '',
    province: '',
    department: '',
    postalCode: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'La etiqueta es requerida';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'La calle es requerida';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'El distrito es requerido';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'La provincia es requerida';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'El departamento es requerido';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5000/api/users/addresses/${editingId}`
        : 'http://localhost:5000/api/users/addresses';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la dirección');
      }

      onUpdate(data.data);
      resetForm();
      showToast(editingId ? 'Dirección actualizada' : 'Dirección agregada', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la dirección');
      }

      onUpdate(data.data);
      showToast('Dirección eliminada', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      label: '',
      street: '',
      district: '',
      province: '',
      department: '',
      postalCode: '',
      isDefault: false
    });
    setErrors({});
  };

  const addresses = user.addresses || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Direcciones</h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Agregar Dirección
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiqueta (Casa, Oficina, etc.)
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Ej: Casa"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.label ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calle
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Av. Principal 123"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distrito
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Miraflores"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Lima"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.province ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Lima"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="15001"
                  className={`w-full px-4 py-2 border rounded-lg text-sm ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
                disabled={loading}
              />
              <label className="ml-2 text-sm text-gray-700">
                Establecer como dirección predeterminada
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} size="sm" disabled={loading}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Direcciones */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay direcciones guardadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {address.street}, {address.district}, {address.province}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {address.department} {address.postalCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(address)}
                    disabled={loading}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(address._id)}
                    disabled={loading}
                    className="text-red-500"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
