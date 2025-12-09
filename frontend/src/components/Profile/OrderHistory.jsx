import React, { useState, useEffect } from 'react';
import { Button } from '../Common/Button';

export default function OrderHistory({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }

      const data = await response.json();
      setOrders(data.data);
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message || 'Error al cargar las órdenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      delivered: 'Entregada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `S/. ${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No tienes pedidos aún</p>
          <p className="text-sm">Explora nuestro catálogo y realiza tu primera compra</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h2>

      {selectedOrder ? (
        // Vista Detallada
        <div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
          >
            ← Volver al listado
          </button>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Número de Orden</p>
                <p className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="text-lg text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Estado de la Orden</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado del Pago</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                  {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos (18%):</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío ({selectedOrder.shippingMethod}):</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dirección de Envío */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Dirección de Envío</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-900">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedOrder.shippingAddress.street}
                </p>
                <p className="text-gray-600 text-sm">
                  {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                </p>
                <p className="text-gray-600 text-sm">
                  {selectedOrder.shippingAddress.department} {selectedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Teléfono: {selectedOrder.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Vista Listado
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Pago: {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    {order.items.length} producto(s) • {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="mt-2"
                  >
                    Ver Detalles
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
