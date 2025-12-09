import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Toast } from '../components/Common/Toast';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      } else {
        setToast({
          type: 'error',
          message: 'Error al cargar los pedidos'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({
        type: 'error',
        message: 'Error al cargar los pedidos'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Entregado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      case 'processing':
        return 'En Preparación';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      case 'processing':
        return '📦';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="text-cyan-600 hover:text-cyan-700 font-medium text-sm mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Productos
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600 mt-2">Visualiza el estado y detalles de todos tus pedidos</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay pedidos</h2>
            <p className="text-gray-600 mb-6">Aún no has realizado ningún pedido</p>
            <button
              onClick={() => navigate('/products')}
              className="inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
            >
              Explorar Productos
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pedidos */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lista de Pedidos</h2>
              <div className="space-y-2">
                {orders.map((order) => (
                  <button
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      selectedOrder?._id === order._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      S/. {order.total.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detalles del Pedido */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Header del Pedido */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Pedido #{selectedOrder._id.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          Realizado el {new Date(selectedOrder.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-lg font-bold px-4 py-2 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </Card>

                  {/* Productos */}
                  <Card>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Productos</h3>
                    <div className="space-y-3 border-b pb-4 mb-4">
                      {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                            {item.productId && (
                              <p className="text-xs text-gray-500 mt-1">ID: {item.productId}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              S/. {(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-600">
                              S/. {item.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totales */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal</span>
                        <span>S/. {selectedOrder.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">IGV (18%)</span>
                        <span>S/. {selectedOrder.tax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Envío</span>
                        <span>S/. {selectedOrder.shippingCost}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-cyan-600">S/. {selectedOrder.total.toLocaleString('es-PE', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Información de Envío */}
                  <Card>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Información de Envío</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                      </p>
                      <p className="text-gray-700 text-sm mt-2">{selectedOrder.shippingAddress?.street}</p>
                      <p className="text-gray-700 text-sm">
                        {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {selectedOrder.shippingAddress?.department}
                        {selectedOrder.shippingAddress?.postalCode && ` - ${selectedOrder.shippingAddress.postalCode}`}
                      </p>
                      <p className="text-gray-700 text-sm mt-3">📧 {selectedOrder.shippingAddress?.email}</p>
                      <p className="text-gray-700 text-sm">📞 {selectedOrder.shippingAddress?.phone}</p>
                      <p className="text-gray-700 text-sm mt-3 font-medium">
                        Método de Envío: {selectedOrder.shippingMethod === 'express' ? 'Express (1-2 días)' : 'Estándar (3-5 días)'}
                      </p>
                    </div>
                  </Card>

                  {/* Seguimiento del Pedido */}
                  <Card>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Seguimiento del Pedido</h3>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200"></div>
                      
                      <div className="space-y-6">
                        {/* Confirmado */}
                        <div className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                            ✓
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Pedido Confirmado</p>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedOrder.createdAt).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* En Preparación */}
                        <div className={`flex gap-4 relative z-10 ${
                          selectedOrder.status !== 'pending' ? 'opacity-100' : 'opacity-60'
                        }`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md ${
                            selectedOrder.status !== 'pending' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {selectedOrder.status !== 'pending' ? '✓' : '📦'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">En Preparación</p>
                            <p className="text-sm text-gray-600">
                              {selectedOrder.status !== 'pending' 
                                ? 'Tu pedido está siendo preparado' 
                                : 'Pronto comenzaremos a preparar tu pedido'}
                            </p>
                          </div>
                        </div>

                        {/* En Camino */}
                        <div className={`flex gap-4 relative z-10 ${
                          selectedOrder.status === 'completed' ? 'opacity-100' : 'opacity-60'
                        }`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md ${
                            selectedOrder.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {selectedOrder.status === 'completed' ? '✓' : '🚚'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">En Camino</p>
                            <p className="text-sm text-gray-600">
                              {selectedOrder.status === 'completed' 
                                ? 'Tu pedido está en camino hacia ti' 
                                : 'Tu pedido será enviado pronto'}
                            </p>
                          </div>
                        </div>

                        {/* Entregado */}
                        <div className={`flex gap-4 relative z-10 ${
                          selectedOrder.status === 'completed' ? 'opacity-100' : 'opacity-60'
                        }`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md ${
                            selectedOrder.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {selectedOrder.status === 'completed' ? '✓' : '📍'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Entregado</p>
                            <p className="text-sm text-gray-600">
                              {selectedOrder.status === 'completed' 
                                ? '¡Tu pedido ha sido entregado exitosamente!' 
                                : 'Tu pedido será entregado en breve'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Acciones */}
                  {selectedOrder.status === 'completed' && (
                    <Card className="bg-green-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold text-green-900">¡Pedido Completado!</p>
                          <p className="text-sm text-green-800">Gracias por tu compra. ¡Esperamos verte pronto!</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-600 text-lg">Selecciona un pedido para ver sus detalles</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
