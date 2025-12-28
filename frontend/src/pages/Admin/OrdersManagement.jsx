import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, Check, Clock, X } from 'lucide-react';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar órdenes');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar orden');
      }

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.searchTerm && !order.id.toString().includes(filters.searchTerm) && 
        !order.user?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'shipped': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 Gestión de Órdenes</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="ID, email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rango de Fecha</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Órdenes ({filteredOrders.length})
          </h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hay órdenes que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">{order.id?.toString().slice(-6)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.user?.email || 'Desconocido'}</p>
                        <p className="text-sm text-gray-600">{order.user?.name || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      S/ {parseFloat(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status || 'pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Detalles de Orden #{selectedOrder.id?.toString().slice(-6)}</h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">Información del Cliente</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {selectedOrder.user?.email || '-'}</p>
                <p><strong>Nombre:</strong> {selectedOrder.user?.name || '-'}</p>
                <p><strong>Teléfono:</strong> {selectedOrder.shippingAddress?.phone || '-'}</p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">Información de Envío</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Dirección:</strong> {selectedOrder.shippingAddress?.address || '-'}</p>
                <p><strong>Ciudad:</strong> {selectedOrder.shippingAddress?.city || '-'}</p>
                <p><strong>Código Postal:</strong> {selectedOrder.shippingAddress?.postalCode || '-'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {selectedOrder.items && selectedOrder.items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Artículos de la Orden</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Producto</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Precio</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.product?.title || 'Producto eliminado'}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">S/ {parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 font-bold">S/ {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Actualizar Estado</h4>
            <div className="flex gap-2 flex-wrap">
              {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(selectedOrder.id, status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    selectedOrder.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {status === 'pending' ? '⏳ Pendiente' :
                   status === 'processing' ? '⚙️ Procesando' :
                   status === 'shipped' ? '📦 Enviado' :
                   status === 'completed' ? '✓ Completado' :
                   '✕ Cancelado'}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total a Pagar:</span>
              <span className="text-2xl text-blue-600">S/ {parseFloat(selectedOrder.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
