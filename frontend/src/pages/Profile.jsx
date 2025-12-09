import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toast } from '../components/Common/Toast';
import ChangePassword from '../components/Profile/ChangePassword';
import EditProfile from '../components/Profile/EditProfile';
import ShippingAddresses from '../components/Profile/ShippingAddresses';

export function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    
    fetchUserProfile();
  }, [location]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      console.error('Error:', error);
      setToast({
        type: 'error',
        message: error.message || 'Error al cargar el perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    showToast('Perfil actualizado exitosamente');
  };

  const handlePasswordChange = () => {
    showToast('Contraseña actualizada exitosamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600">Error al cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {toast && <Toast type={toast.type} message={toast.message} />}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mi Perfil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'password'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cambiar Contraseña
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'addresses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Direcciones
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <EditProfile 
                user={user} 
                onUpdate={handleProfileUpdate}
                showToast={showToast}
              />
            )}
            {activeTab === 'password' && (
              <ChangePassword onSuccess={handlePasswordChange} showToast={showToast} />
            )}
            {activeTab === 'addresses' && (
              <ShippingAddresses 
                user={user} 
                onUpdate={handleProfileUpdate}
                showToast={showToast}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
