import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Toast } from '../components/Common/Toast';
import { useCart } from '../hooks/useCart';

export function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, getTotals } = useCart();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProductImage = (product) => {
    // Si el producto tiene imagen, usarla
    if (product.image) {
      return product.image;
    }
    
    // Fallback por categoría si no tiene imagen
    const imageMap = {
      'Joyería': '/images/placeholder.svg',
      'Arreglos Florales': '/images/placeholder.svg',
      'Decoración para el Baño': '/images/placeholder.svg'
    };
    return imageMap[product.category] || '/images/placeholder.svg';
  };

  useEffect(() => {
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    // Simular carga
    setLoading(false);
  }, []);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    setToast({
      type: 'success',
      message: 'Producto removido del carrito'
    });
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart();
      setToast({
        type: 'success',
        message: 'Carrito vaciado'
      });
    }
  };

  const handleContinueShopping = () => {
    window.scrollTo(0, 0);
    navigate('/products');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setToast({
        type: 'error',
        message: 'Tu carrito está vacío'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        type: 'error',
        message: 'Debes iniciar sesión primero'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    navigate('/checkout/address');
  };

  const { subtotal, tax, shipping, total } = getTotals(50);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carrito...</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

        {cart.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Tu carrito está vacío</p>
            <p className="text-gray-500 mb-6">Comienza a agregar productos para tu compra</p>
            <Button onClick={handleContinueShopping}>Ir a Productos</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.productId} className="p-4">
                    <div className="flex gap-4">
                      {/* Mostrar vista previa del combo si es personalizado */}
                      {item.isCustomCombo && item.componentImages ? (
                        <div className="w-24 h-24 rounded flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 relative">
                          {/* Grid 2x2 para mostrar las 4 piezas */}
                          <div className="grid grid-cols-2 gap-0.5 w-full h-full p-1">
                            {item.componentImages.collar && (
                              <div className="bg-white rounded flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.componentImages.collar}
                                  alt="Collar"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            )}
                            {item.componentImages.dije && (
                              <div className="bg-white rounded flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.componentImages.dije}
                                  alt="Dije"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            )}
                            {item.componentImages.arete && (
                              <div className="bg-white rounded flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.componentImages.arete}
                                  alt="Arete"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            )}
                            {item.componentImages.anillo && (
                              <div className="bg-white rounded flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.componentImages.anillo}
                                  alt="Anillo"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Mostrar imagen única para productos normales */
                        <div className="bg-linear-to-br from-gray-100 to-gray-200 w-24 h-24 rounded flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-cyan-600 font-bold mb-2">S/. {item.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            −
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </Button>
                          {item.quantity >= item.stock && (
                            <span className="text-xs text-red-500 ml-2">Stock máximo</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 mb-2">
                          S/. {(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={handleContinueShopping} className="flex-1">
                  Continuar Comprando
                </Button>
                <Button variant="outline" onClick={handleClearCart} className="flex-1 text-red-500 hover:text-red-700">
                  Vaciar Carrito
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>

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
                    <span>S/. {shipping.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-cyan-600">
                    S/. {total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  className="mb-3"
                  onClick={handleCheckout}
                >
                  Proceder al Pago
                </Button>

                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-green-700">
                    ✓ Envío gratis en compras mayores a $200
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-700">
                    Items en carrito: <strong>{cart.length}</strong>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
