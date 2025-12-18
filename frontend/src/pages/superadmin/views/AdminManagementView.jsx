import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import CreateAdminModal from '../../../components/Common/CreateAdminModal';

const AdminManagementView = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/superadmin/admins?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch admins');

      const data = await response.json();
      setAdmins(data.admins);
      setError(null);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/superadmin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete admin');

      setAdmins(admins.filter((a) => a.id !== adminId));
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('Error al eliminar el admin: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestión de Admins</h2>
          <p className="text-gray-400 mt-1">Crear y administrar usuarios con acceso administrativo</p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Crear Admin</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Email</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Nombre</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Rol</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Estado</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Fecha Creación</th>
              <th className="px-6 py-4 text-right text-gray-300 font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 text-white text-sm">{admin.email}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {admin.firstName} {admin.lastName}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      admin.role === 'SUPERADMIN'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-blue-900 text-blue-200'
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      admin.active ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {admin.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(admin.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingAdmin(admin);
                      setShowModal(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 inline-block"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200 inline-block"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No hay administradores aún</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateAdminModal
          onClose={() => {
            setShowModal(false);
            setEditingAdmin(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAdmin(null);
            fetchAdmins();
          }}
          editingAdmin={editingAdmin}
        />
      )}
    </div>
  );
};

export default AdminManagementView;
