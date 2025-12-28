import React, { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function ShippingManagement() {
  const [shippingData, setShippingData] = useState({
    zones: [],
    rates: [],
    shipments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('zones');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    baseCost: '',
    costPerKg: '',
    estimatedDays: ''
  });

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch zones
      const zonesRes = await fetch('http://localhost:5000/api/shipping/zones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const zones = zonesRes.ok ? await zonesRes.json() : [];

      // Fetch shipments
      const shipmentsRes = await fetch('http://localhost:5000/api/shipping/track', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const shipments = shipmentsRes.ok ? await shipmentsRes.json() : [];

      setShippingData({
        zones: Array.isArray(zones) ? zones : [],
        rates: [],
        shipments: Array.isArray(shipments) ? shipments : []
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching shipping data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/shipping/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear zona de envío');
      }

      const newZone = await response.json();
      setShippingData(prev => ({
        ...prev,
        zones: [...prev.zones, newZone]
      }));

      setFormData({ name: '', region: '', baseCost: '', costPerKg: '', estimatedDays: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta zona de envío?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipping/zones/${zoneId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar zona');
      }

      setShippingData(prev => ({
        ...prev,
        zones: prev.zones.filter(z => z.id !== zoneId)
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos de envío...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🚚 Gestión de Envíos</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => { setActiveTab('zones'); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2 font-bold transition border-b-2 ${
              activeTab === 'zones'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Zonas ({shippingData.zones.length})
          </button>
          <button
            onClick={() => { setActiveTab('shipments'); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2 font-bold transition border-b-2 ${
              activeTab === 'shipments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Truck className="w-5 h-5" />
            Envíos ({shippingData.shipments.length})
          </button>
        </div>
      </div>

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Zona de Envío
            </button>
          )}

          {showForm && (
            <form onSubmit={handleAddZone} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Zona de Envío</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Costa"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Región</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    placeholder="Ej: Lima, Callao"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Costo Base (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.baseCost}
                    onChange={(e) => setFormData({...formData, baseCost: e.target.value})}
                    placeholder="Ej: 10.00"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Costo por Kg (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerKg}
                    onChange={(e) => setFormData({...formData, costPerKg: e.target.value})}
                    placeholder="Ej: 2.50"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Días Estimados de Entrega</label>
                  <input
                    type="number"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({...formData, estimatedDays: e.target.value})}
                    placeholder="Ej: 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                  Guardar Zona
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', region: '', baseCost: '', costPerKg: '', estimatedDays: '' });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Zones Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Zonas de Envío ({shippingData.zones.length})</h2>
            </div>

            {shippingData.zones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No hay zonas de envío configuradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Región</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Costo Base</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Costo/Kg</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Días Est.</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingData.zones.map(zone => (
                      <tr key={zone.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">{zone.name}</td>
                        <td className="px-6 py-4 text-gray-700">{zone.region}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">S/ {parseFloat(zone.baseCost).toFixed(2)}</td>
                        <td className="px-6 py-4 font-bold text-green-600">S/ {parseFloat(zone.costPerKg).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-700">{zone.estimatedDays || '-'} días</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Envíos Recientes ({shippingData.shipments.length})</h2>
          </div>

          {shippingData.shipments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No hay envíos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Número de Seguimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Envío</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingData.shipments.map(shipment => (
                    <tr key={shipment.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm">{shipment.trackingNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-700">{shipment.destinationCity || '-'}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">S/ {parseFloat(shipment.cost || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shipment.status === 'delivered' ? '✓ Entregado' :
                           shipment.status === 'in_transit' ? '📦 En tránsito' :
                           '⏳ Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(shipment.createdAt).toLocaleDateString('es-PE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
