import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const SettingsView = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/superadmin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/superadmin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Configuración</h2>
        <p className="text-gray-400 mt-1">Ajustes generales del sistema</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <p className="text-green-200">✓ Configuración guardada exitosamente</p>
        </div>
      )}

      {/* Settings Form */}
      {settings && (
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">General</h3>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Nombre de Aplicación</label>
              <input
                type="text"
                value={settings.appName || ''}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Moneda por Defecto</label>
              <select
                value={settings.defaultCurrency || 'PEN'}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Idioma por Defecto</label>
              <select
                value={settings.defaultLanguage || 'es'}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Características</h3>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode || false}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-gray-300">Modo Mantenimiento</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNewsletter || false}
                  onChange={(e) => setSettings({ ...settings, enableNewsletter: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-gray-300">Habilitar Newsletter</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableReviews || false}
                  onChange={(e) => setSettings({ ...settings, enableReviews: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-gray-300">Habilitar Reseñas</span>
              </label>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Contacto</h3>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email de Soporte</label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Política de Privacidad</label>
              <input
                type="url"
                value={settings.privacyPolicy || ''}
                onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Términos de Servicio</label>
              <input
                type="url"
                value={settings.termsOfService || ''}
                onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200"
          >
            <Save size={20} />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
