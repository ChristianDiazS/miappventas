import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Common/Button';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import PaymentForm from '../components/Common/PaymentForm';
import { Toast } from '../components/Common/Toast';

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [toast, setToast] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    
    // Obtener datos de la orden y del localStorage
    const checkoutData = localStorage.getItem('checkoutData');
    const currentOrderId = localStorage.getItem('currentOrderId');
    
    if (checkoutData && currentOrderId) {
      try {
        const data = JSON.parse(checkoutData);
        setOrderData(data);
        setOrderId(currentOrderId);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        setToast({
          type: 'error',
          message: 'Error al cargar los datos de la orden'
        });
      }
    } else if (!currentOrderId) {
      setToast({
        type: 'error',
        message: 'Orden no encontrada. Redirigiendo...'
      });
      setTimeout(() => navigate('/cart'), 2000);
    }
    setLoading(false);
  }, [navigate]);

  const orderSummary = orderData ? {
    itemsCount: orderData.items?.length || 0,
    subtotal: orderData.subtotal || 0,
    tax: orderData.tax || 0,
    shipping: orderData.shippingCost || 0,
    total: orderData.total || 0,
    items: orderData.items || []
  } : {
    itemsCount: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    items: []
  };

  const handlePaymentSuccess = (result) => {
    setTimeout(() => {
      navigate('/order-confirmation');
    }, 1000);
  };

  const handlePaymentError = (error) => {
    console.error('Error en pago:', error);
  };

  const handleOtherPaymentMethod = () => {
    setToast({
      type: 'info',
      message: `Método de pago: ${paymentMethod} - Funcionalidad en desarrollo`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago</h1>
          <p className="text-gray-600">Paso 2 de 2: Completa tu pago</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Métodos de pago */}
          <div className="lg:col-span-2">
            {/* Tarjeta de crédito/débito */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer mb-4">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-lg font-semibold text-gray-900">Tarjeta de Crédito/Débito</span>
              </label>
              {paymentMethod === 'card' && (
                <PaymentForm
                  orderId={orderId}
                  amount={orderSummary.total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>

            {/* Transferencia Bancaria */}
            <Card className="mb-6">
              <label className="flex items-center cursor-pointer mb-4">
                <input
                  type="radio"
                  name="payment"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-lg font-semibold text-gray-900">Transferencia Bancaria</span>
              </label>
              {paymentMethod === 'transfer' && (
                <div className="ml-8 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Realiza una transferencia a:</p>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-gray-200 mb-4">
                    <p><strong>Banco:</strong> BCP</p>
                    <p><strong>Cuenta:</strong> 19209873456</p>
                    <p><strong>Titular:</strong> Un Poquito Variado S.A.C.</p>
                    <p><strong>Monto:</strong> S/. {orderSummary.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleOtherPaymentMethod}
                    className="w-full"
                  >
                    Confirmar Transferencia Realizada
                  </Button>
                </div>
              )}
            </Card>

            {/* Billetera Digital */}
            <Card className="mb-6">
              <label className="flex items-center cursor-pointer mb-4">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-lg font-semibold text-gray-900">Billetera Digital (Yape, Plin)</span>
              </label>
              {paymentMethod === 'wallet' && (
                <div className="ml-8 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Envía el pago a:</p>
                  <p className="text-center text-lg font-bold text-green-600 mb-4">+51 999 999 999</p>
                  <Button
                    variant="primary"
                    onClick={handleOtherPaymentMethod}
                    className="w-full"
                  >
                    Confirmar Pago Realizado
                  </Button>
                </div>
              )}
            </Card>

            {/* PayPal */}
            <Card>
              <label className="flex items-center cursor-pointer mb-4">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-lg font-semibold text-gray-900">PayPal</span>
              </label>
              {paymentMethod === 'paypal' && (
                <div className="ml-8 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    Serás redirigido a PayPal para completar tu pago de forma segura.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleOtherPaymentMethod}
                    className="w-full"
                  >
                    Pagar con PayPal
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Resumen de orden */}
          <div>
            <Card className="sticky top-20">
              <h3 className="text-xl font-bold mb-4">Resumen de Orden</h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {orderSummary.items.length > 0 && (
                  <div className="max-h-40 overflow-y-auto mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Items:</h4>
                    {orderSummary.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{item.name} x{item.quantity}</span>
                        <span>S/. {(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">S/. {orderSummary.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IGV (18%)</span>
                  <span className="font-semibold">S/. {orderSummary.tax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold">S/. {orderSummary.shipping}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  S/. {orderSummary.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <Badge variant="success" className="w-full text-center mb-4">
                ✓ Envío Incluido
              </Badge>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Atrás
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Toast notificación */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
