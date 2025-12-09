import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { Toast } from '../components/Common/Toast';
import { useCart } from '../hooks/useCart';

export function CheckoutAddress() {
  const navigate = useNavigate();
  const { cart, isLoading, getTotals, clearCart } = useCart();
  const [toast, setToast] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    district: '',
    province: '',
    department: '',
    postalCode: ''
  });

  // Redirect if cart is empty (pero esperar a que cargue)
  useEffect(() => {
    // Solo verificar después de que se haya cargado el carrito desde localStorage
    if (!isLoading && cart.length === 0) {
      setToast({
        type: 'warning',
        message: 'Tu carrito está vacío. Redirigiendo a productos...'
      });
      const timer = setTimeout(() => navigate('/products'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, cart.length, navigate]);

  const shippingCosts = {
    standard: 50,
    express: 150
  };

  const currentShippingCost = shippingCosts[shippingMethod];
  const { subtotal, tax, total } = getTotals(currentShippingCost);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBack = () => {
    navigate('/cart');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'district', 'province', 'department'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setToast({
        type: 'error',
        message: `Por favor completa los campos requeridos: ${emptyFields.join(', ')}`
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          type: 'error',
          message: 'Sesión expirada. Por favor inicia sesión de nuevo.'
        });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      // Preparar los datos del pedido
      const checkoutData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          district: formData.district,
          province: formData.province,
          department: formData.department,
          postalCode: formData.postalCode
        },
        shippingMethod,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        tax,
        shippingCost: currentShippingCost,
        total
      };

      // Guardar datos de checkout en localStorage para usarlos en la página de pago
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      // Crear el pedido en el backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: checkoutData.items,
          shippingAddress: checkoutData.shippingAddress,
          shippingMethod,
          subtotal,
          tax,
          shippingCost: currentShippingCost,
          total
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const orderData = await response.json();
      
      // Guardar el ID del pedido para el flujo de pago
      // El backend retorna { data: order }, así que accedemos a data._id
      const orderId = orderData.data?._id;
      
      if (!orderId) {
        throw new Error('No se recibió ID de orden del servidor');
      }
      
      localStorage.setItem('currentOrderId', orderId);

      setToast({
        type: 'success',
        message: 'Pedido creado exitosamente. Redirigiendo a pago...'
      });

      // Limpiar carrito después de crear el pedido
      clearCart();

      // Redirigir a la página de pago
      setTimeout(() => {
        navigate('/checkout/payment');
      }, 1500);

    } catch (error) {
      console.error('Error en checkout:', error);
      setToast({
        type: 'error',
        message: error.message || 'Error al procesar el checkout. Intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner mientras se carga el carrito desde localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Mostrar spinner si el carrito está vacío (se está redirigiendo)
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Paso 1 de 2: Dirección de Envío</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout}>
              <Card className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Envío</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      name="firstName"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={(value) => handleInputChange('firstName', value)}
                      required
                    />
                    <Input
                      label="Apellido"
                      name="lastName"
                      placeholder="Pérez"
                      value={formData.lastName}
                      onChange={(value) => handleInputChange('lastName', value)}
                      required
                    />
                  </div>

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    required
                  />
                  <Input
                    label="Teléfono"
                    name="phone"
                    type="tel"
                    placeholder="+51 999 999 999"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    required
                  />

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Dirección</h3>
                    <Input
                      label="Calle y Número"
                      name="street"
                      placeholder="Av. Principal 123"
                      value={formData.street}
                      onChange={(value) => handleInputChange('street', value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Distrito"
                        name="district"
                        placeholder="Miraflores"
                        value={formData.district}
                        onChange={(value) => handleInputChange('district', value)}
                        required
                      />
                      <Input
                        label="Provincia"
                        name="province"
                        placeholder="Lima"
                        value={formData.province}
                        onChange={(value) => handleInputChange('province', value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Departamento"
                      name="department"
                      placeholder="Lima"
                      value={formData.department}
                      onChange={(value) => handleInputChange('department', value)}
                      required
                    />
                    <Input
                      label="Código Postal"
                      name="postalCode"
                      placeholder="15074"
                      value={formData.postalCode}
                      onChange={(value) => handleInputChange('postalCode', value)}
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-4">Método de Envío</h3>
                    <Card
                      className="p-4 mb-3 border-2 cursor-pointer transition-all"
                      onClick={() => setShippingMethod('standard')}
                      style={{
                        borderColor: shippingMethod === 'standard' ? '#06b6d4' : '#e5e7eb',
                        backgroundColor: shippingMethod === 'standard' ? '#f0f9fa' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">Envío Estándar</p>
                          <p className="text-sm text-gray-600">Entrega en 3-5 días hábiles</p>
                        </div>
                        <span className="ml-auto font-bold text-gray-900">$50</span>
                      </div>
                    </Card>
                    <Card
                      className="p-4 border-2 cursor-pointer transition-all hover:border-cyan-500"
                      onClick={() => setShippingMethod('express')}
                      style={{
                        borderColor: shippingMethod === 'express' ? '#06b6d4' : '#e5e7eb',
                        backgroundColor: shippingMethod === 'express' ? '#f0f9fa' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">Envío Express</p>
                          <p className="text-sm text-gray-600">Entrega en 1-2 días hábiles</p>
                        </div>
                        <span className="ml-auto font-bold text-gray-900">$150</span>
                      </div>
                    </Card>
                  </div>

                  <div className="pt-6 border-t flex gap-3">
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={handleBack}
                      type="button"
                    >
                      Volver
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Procesando...' : 'Continuar a Pago'}
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} x{item.quantity}</span>
                    <span>S/. {(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>S/. {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>IGV (18%)</span>
                  <span>S/. {tax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Envío</span>
                  <span>S/. {currentShippingCost}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-cyan-600">S/. {total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-700 flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>Recibirás un email de confirmación con el número de seguimiento</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
