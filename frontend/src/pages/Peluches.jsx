import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { LazyImage } from '../components/Common/LazyImage';
import { Toast } from '../components/Common/Toast';
import { useCart } from '../hooks/useCart';

export function Peluches() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Imágenes de referencia de peluches
  const referenceProducts = [
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/v1766868632/miappventas/peluches/img-peluche1.png',
      title: 'Peluche 1',
      description: 'Suave y acogedor'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/v1766868650/miappventas/peluches/img-peluche2.png',
      title: 'Peluche 2',
      description: 'Diseño adorable'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/v1766868655/miappventas/peluches/img-peluche3.png',
      title: 'Peluche 3',
      description: 'Compañero perfecto'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/v1766868659/miappventas/peluches/img-peluche4.png',
      title: 'Peluche 4',
      description: 'Calidad premium'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/v1766868663/miappventas/peluches/img-peluche5.png',
      title: 'Peluche 5',
      description: 'Colores vibrantes'
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=200');
      if (!response.ok) throw new Error('Error al cargar productos');

      const data = await response.json();
      // Filtrar solo productos de Peluches
      const peluProducts = (data.data || []).filter(p => 
        p.category === 'Peluches'
      );
      setProducts(peluProducts);
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
      message: `${product.title} agregado al carrito`
    });
  };

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % referenceProducts.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + referenceProducts.length) % referenceProducts.length);
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
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Sección de Introducción */}
        <div className="mb-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">🧸 ¡Peluches Adorables!</h1>
            <p className="text-pink-100 text-base md:text-lg mb-2">
              Descubre nuestra colección de peluches suave y acogedores.
            </p>
            <p className="text-pink-100 text-sm md:text-base">
              Peluches de diferentes tamaños y diseños. Perfectos para regalar o para ti mismo.
            </p>
          </div>

          {/* Carrusel de Productos de Referencia */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">✨ Peluches Destacados</h2>
            
            <div className="relative bg-white/10 rounded-xl backdrop-blur-sm p-6 overflow-hidden">
              {/* Carrusel */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* Botón Anterior */}
                <button
                  onClick={prevCarousel}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Imagen Principal */}
                <div className="flex-1 relative h-80 rounded-lg overflow-hidden bg-white/5">
                  <LazyImage
                    src={referenceProducts[currentCarouselIndex].image}
                    alt={referenceProducts[currentCarouselIndex].title}
                    className="w-full h-full object-contain p-4"
                  />
                  
                  {/* Información de la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-lg font-bold text-white">
                      {referenceProducts[currentCarouselIndex].title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {referenceProducts[currentCarouselIndex].description}
                    </p>
                  </div>
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={nextCarousel}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Indicadores de página */}
              <div className="flex justify-center gap-2 mb-6">
                {referenceProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentCarouselIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      idx === currentCarouselIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Botón para ir al catálogo */}
          <Button
            onClick={() => document.querySelector('#productos-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto bg-white text-pink-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-lg border-4 border-white"
          >
            🛍️ Explorar Catálogo Completo
          </Button>
        </div>

        {/* Sección de Productos */}
        <div id="productos-section" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Peluches</h2>
          <p className="text-gray-600 text-lg">
            Encuentra el peluche perfecto para ti
          </p>
        </div>

        {/* Productos en Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Aún no hay peluches disponibles. ¡Vuelve pronto!
            </p>
            <Button onClick={() => navigate('/products')}>
              ← Volver al catálogo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
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
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm hover:text-pink-600 transition">
                    {product.title}
                  </h3>

                  {/* Precio */}
                  <div className="mb-3 py-2 bg-pink-50 rounded px-2 text-center border border-pink-200">
                    <p className="text-pink-700 font-bold text-lg">
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
        )}
      </div>
    </div>
  );
}
