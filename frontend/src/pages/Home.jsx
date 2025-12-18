import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Common/Button';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Toast } from '../components/Common/Toast';
import { useCart } from '../hooks/useCart';

export function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=4');
      if (!response.ok) throw new Error('Error al cargar productos');
      
      const data = await response.json();
      setFeaturedProducts((data.data || []).slice(0, 4));
    } catch (error) {
      console.error('Error:', error);
      setToast({
        type: 'error',
        message: 'Error al cargar los productos destacados'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mapear imágenes locales según categoría - SOLO como fallback
  const getProductImage = (product) => {
    // Si el producto tiene imagen de Cloudinary, usarla
    if (product.image) {
      return product.image;
    }
    
    // Si no, usar placeholder según categoría
    const imageMap = {
      'Joyería': '/images/placeholder.svg',
      'Arreglos Florales': '/images/placeholder.svg',
      'Decoración para el Baño': '/images/placeholder.svg'
    };
    return imageMap[product.category] || '/images/placeholder.svg';
  };

  const handleExploreCatalog = () => {
    window.scrollTo(0, 0);
    navigate('/products');
  };

  const handleViewDetail = (productId) => {
    window.scrollTo(0, 0);
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        type: 'error',
        message: 'Debes iniciar sesión primero'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    addToCart(product);
    setToast({
      type: 'success',
      message: `${product.name} agregado al carrito`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Hero Section */}
      <section className="bg-linear-to-r from-cyan-500 to-blue-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ✨ Bienvenido a Un Poquito Variado
          </h1>
          <p className="text-xl mb-8 text-cyan-100">
            Joyas, arreglos florales y decoración para el baño de la más alta calidad
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleExploreCatalog}
          >
            Ver Catálogo
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Productos Destacados</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                <div 
                  className="bg-linear-to-br from-gray-200 to-gray-300 h-48 w-full flex items-center justify-center cursor-pointer hover:from-gray-300 hover:to-gray-400 transition duration-300 relative overflow-hidden"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.title);
                    }}
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">{product.title}</h3>
                    {product.originalPrice && (
                      <Badge variant="success" className="text-xs ml-2 shrink-0">
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )}
                        %
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                  <p className="text-cyan-600 font-bold text-lg mb-4">
                    S/. {product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {product.stock > 0 && (
                    <Badge variant="success" className="text-xs mb-4 w-full text-center">
                      ✓ Stock: {product.stock}
                    </Badge>
                  )}
                </div>
                <Button 
                  fullWidth
                  disabled={product.stock === 0}
                  onClick={() => handleAddToCart(product)}
                >
                  {product.stock > 0 ? '🛒 Añadir al Carrito' : 'Agotado'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-cyan-500 mb-2">150+</h3>
              <p className="text-gray-700">Productos en Stock</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-cyan-500 mb-2">10K+</h3>
              <p className="text-gray-700">Clientes Satisfechos</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-cyan-500 mb-2">24/7</h3>
              <p className="text-gray-700">Soporte Disponible</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
