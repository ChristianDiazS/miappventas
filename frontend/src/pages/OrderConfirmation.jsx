import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    
    // Obtener datos de la orden del localStorage
    const checkoutData = localStorage.getItem('checkoutData');
    const currentOrderId = localStorage.getItem('currentOrderId');

    if (checkoutData && currentOrderId) {
      try {
        const data = JSON.parse(checkoutData);
        setOrderData(data);
        setOrderId(currentOrderId);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing order data:', error);
        setLoading(false);
      }
    } else {
      // Si no hay datos, redirigir al carrito
      navigate('/cart');
    }
  }, [navigate]);

  const handleViewOrders = () => {
    // Limpiar localStorage después de ver la confirmación
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('currentOrderId');
    // Ir a la página de órdenes
    window.scrollTo(0, 0);
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    // Limpiar localStorage
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('currentOrderId');
    window.scrollTo(0, 0);
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <p className="text-gray-600 text-lg mb-4">No se encontraron datos de la orden</p>
          <Button onClick={() => navigate('/products')}>Volver a Productos</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header con Check Mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-lg text-gray-600">Tu compra se ha realizado exitosamente</p>
        </div>

        {/* Número de Orden */}
        <Card className="mb-6 bg-white border-2 border-green-500">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Número de Pedido</p>
            <p className="text-3xl font-bold text-cyan-600 font-mono mb-4">{orderId}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                alert('Número de pedido copiado al portapapeles');
              }}
              className="text-sm text-cyan-600 hover:text-cyan-700 underline"
            >
              Copiar número de pedido
            </button>
          </div>
        </Card>

        {/* Detalles de la Orden */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de tu Pedido</h2>

          {/* Items */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Artículos Comprados</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {orderData.items && orderData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-700">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-semibold">S/. {(item.price * item.quantity).toLocaleString('es-PE', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>S/. {orderData.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>IGV (18%)</span>
              <span>S/. {orderData.tax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Envío ({orderData.shippingMethod === 'express' ? 'Express' : 'Estándar'})</span>
              <span>S/. {orderData.shippingCost}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3">
              <span>Total</span>
              <span className="text-green-600">S/. {orderData.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Información de Envío */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Información de Envío</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold">
                {orderData.shippingAddress?.firstName} {orderData.shippingAddress?.lastName}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {orderData.shippingAddress?.street}
              </p>
              <p className="text-gray-600 text-sm">
                {orderData.shippingAddress?.district}, {orderData.shippingAddress?.province}
              </p>
              <p className="text-gray-600 text-sm">
                {orderData.shippingAddress?.department}
                {orderData.shippingAddress?.postalCode && ` - ${orderData.shippingAddress.postalCode}`}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                📧 {orderData.shippingAddress?.email}
              </p>
              <p className="text-gray-600 text-sm">
                📞 {orderData.shippingAddress?.phone}
              </p>
            </div>
          </div>
        </Card>

        {/* Estados y Tiempos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm text-gray-600">Pedido Confirmado</p>
            <p className="text-xs text-gray-500 mt-1">Ahora</p>
          </Card>
          <Card className="text-center opacity-50">
            <div className="text-2xl mb-2">📦</div>
            <p className="text-sm text-gray-600">En Preparación</p>
            <p className="text-xs text-gray-500 mt-1">Próximamente</p>
          </Card>
          <Card className="text-center opacity-50">
            <div className="text-2xl mb-2">🚚</div>
            <p className="text-sm text-gray-600">En Camino</p>
            <p className="text-xs text-gray-500 mt-1">
              {orderData.shippingMethod === 'express' ? '1-2 días' : '3-5 días'}
            </p>
          </Card>
        </div>

        {/* Información Importante */}
        <Card className="mb-6 bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">¿Qué ocurre ahora?</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Recibirás un email de confirmación en tu bandeja de entrada</li>
                <li>✓ Tu pedido está siendo preparado para el envío</li>
                <li>✓ Puedes seguir el estado en la sección "Mis Pedidos"</li>
                <li>✓ El envío tardará {orderData.shippingMethod === 'express' ? '1 a 2 días' : '3 a 5 días'} hábiles</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            fullWidth
            size="lg"
            onClick={handleViewOrders}
            className="bg-green-600 hover:bg-green-700"
          >
            Ver Mis Pedidos
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={handleContinueShopping}
          >
            Continuar Comprando
          </Button>
        </div>
      </div>
    </div>
  );
}
