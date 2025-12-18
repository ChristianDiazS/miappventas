import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { LazyImage } from '../../components/Common/LazyImage';
import { useCart } from '../../hooks/useCart';

export function Jewelry() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchJewelryProducts();
  }, []);

  const fetchJewelryProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      if (!response.ok) throw new Error('Error al cargar productos');

      const data = await response.json();
      // Filtrar solo productos de joyería
      const jewelryProducts = (data.data || []).filter(p => 
        ['Collar', 'Dije', 'Anillo', 'Arete'].includes(p.category)
      );
      setProducts(jewelryProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.image) {
      return product.image;
    }
    return '/images/placeholder.svg';
  };

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    addToCart(product);
    setToast({
      type: 'success',
      message: `${product.title} agregado al carrito`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin">⏳ Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">✨ Joyería Personalizada</h1>
          <p className="text-lg text-gray-600 mb-8">
            Descubre nuestra colección de accesorios de joyería de alta calidad. 
            <br />
            <strong>¡Ahora puedes armar tu propio juego completo y obtener hasta 18% descuento!</strong>
          </p>

          {/* Botón destacado para el constructor */}
          <Button
            onClick={() => navigate('/jewelry/builder')}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-3 text-lg font-bold rounded-lg shadow-lg"
          >
            🎨 Personaliza tu Juego de Accesorios
          </Button>
        </div>

        {/* Productos por categoría */}
        {['Collar', 'Dije', 'Anillo', 'Arete'].map(category => {
          const categoryProducts = products.filter(p => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {category === 'Collar' && '⛓️'}
                  {category === 'Dije' && '💎'}
                  {category === 'Anillo' && '💍'}
                  {category === 'Arete' && '✨'}
                  {' '}{category}s
                </h2>
                <Badge variant="primary">{categoryProducts.length} productos</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                  <Card
                    key={product.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full border border-gray-200"
                  >
                    {/* Imagen */}
                    <div
                      className="bg-gray-200 h-48 w-full cursor-pointer hover:bg-gray-300 transition duration-300 relative overflow-hidden"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <LazyImage
                        src={getProductImage(product)}
                        alt={product.title}
                        className="w-full h-full object-cover p-2"
                      />
                    </div>

                    {/* Contenido */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm hover:text-cyan-600 transition">
                        {product.title}
                      </h3>

                      {/* Precio */}
                      <div className="mb-3 py-2 bg-cyan-50 rounded px-2 text-center border border-cyan-200">
                        <p className="text-cyan-700 font-bold text-lg">
                          S/. {product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Stock */}
                      <div className="mb-4">
                        {product.stock > 0 ? (
                          <Badge variant="success" className="text-xs w-full text-center">
                            ✓ Stock: {product.stock}
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-red-500 text-white w-full text-center">
                            ❌ Agotado
                          </Badge>
                        )}
                      </div>

                      {/* Botón */}
                      <Button
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                        className="mt-auto text-sm"
                      >
                        {product.stock > 0 ? '🛒 Añadir' : 'Agotado'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Mensaje si no hay productos */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Aún no tenemos productos de joyería disponibles. ¡Vuelve pronto!
            </p>
            <Button onClick={() => navigate('/products')}>
              ← Volver al catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
