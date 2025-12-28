import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { Toast } from '../../components/Common/Toast';
import { LazyImage } from '../../components/Common/LazyImage';
import { useCart } from '../../hooks/useCart';
import { usePersonalization } from '../../context/PersonalizationContext';
import { generateComponentImagesFromCombo } from '../../utils/cloudinaryImageGenerator';

export function JewelryBuilder() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { selectedItems, getTotalPrice, getBasePrice, clearPersonalization, totalDiscount, componentImages } = usePersonalization();
  
  // Array con todas las imágenes de anillos disponibles
  const anilloImages = [
    'img-anillo1.png', 'img-anillo2.png', 'img-anillo3.png', 'img-anillo4.png', 'img-anillo5.png',
    'img-anillo6.png', 'img-anillo7.png', 'img-anillo8.png', 'img-anillo9.png', 'img-anillo10.png',
    'img-anillo11.png', 'img-anillo12.png', 'img-anillo13.png', 'img-anillo14.png', 'img-anillo15.png',
    'img-anillo16.jpg', 'img-anillo17.jpg', 'img-anillo18.png', 'img-anillo19.png', 'img-anillo20.png',
    'img-anillo21.png', 'img-anillo22.png', 'img-anillo23.png', 'img-anillo24.png', 'img-anillo25.png',
    'img-anillo26.png', 'img-anillo27.png', 'img-anillo28.png', 'img-anillo29.png', 'img-anillo30.png',
    'img-anillo31.png', 'img-anillo32.png', 'img-anillo33.png', 'img-anillo34.png', 'img-anillo35.png',
    'img-anillo36.png', 'img-anillo37.png', 'img-anillo38.png', 'img-anillo39.png', 'img-anillo40.png',
    'img-anillo41.png', 'img-anillo42.png', 'img-anillo43.png', 'img-anillo44.png', 'img-anillo45.png',
    'img-anillo46.png', 'img-anillo47.png', 'img-anillo48.png', 'img-anillo49.png', 'img-anillo50.png',
    'img-anillo51.png'
  ];
  
  // State para productos disponibles
  const [collares, setCollares] = useState([]);
  const [dijes, setDijes] = useState([]);
  const [anillos, setAnillos] = useState([]);
  const [aretes, setAretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      if (!response.ok) throw new Error('Error al cargar productos');

      const data = await response.json();
      const products = data.data || [];

      // Clasificar productos por categoría
      setCollares(products.filter(p => p.category === 'Collar'));
      setDijes(products.filter(p => p.category === 'Dije'));
      setAretes(products.filter(p => p.category === 'Arete'));

      // Para Anillos, generar productos dinámicamente usando las imágenes de Cloudinary
      const generatedAnillos = anilloImages.map((imgName, index) => ({
        id: `local-anillo-${index + 1}`,
        title: `Anillo ${index + 1}`,
        price: 45 + (index % 5) * 10, // Precios variados entre 45 y 85
        image: `https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/joyeria/anillos/img-anillo${index + 1}`,
        category: 'Anillo',
        stock: 5,
        description: `Hermoso anillo de joyería - Diseño ${index + 1}`
      }));
      
      setAnillos(generatedAnillos);
    } catch (error) {
      console.error('Error:', error);
      setToast({
        type: 'error',
        message: 'Error al cargar los productos'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular precio del juego (18% descuento)
  const calculateGamePrice = () => {
    return getTotalPrice();
  };

  const getTotalIndividualPrice = () => {
    return getBasePrice();
  };

  // Función para generar imagen de componente - Reutilizable
  const getComponentImage = (item, componentType) => {
    if (!item) return null;
    
    // Si el item es un combo, usar generateComponentImagesFromCombo
    if (item.type === 'combo' && item.comboItems) {
      const generatedImage = generateComponentImagesFromCombo(item, componentType);
      console.log(`🎨 Generada imagen para ${componentType}:`, generatedImage);
      return generatedImage;
    }
    // Si no es combo, usar la imagen del producto y componentImage si existe
    if (componentImages[componentType]) {
      console.log(`✨ Usando componentImage guardada para ${componentType}:`, componentImages[componentType]);
      return componentImages[componentType];
    }
    // Fallback a la imagen del producto
    return item.image;
  };

  const handleAddToCart = () => {
    if (!selectedItems.collar || !selectedItems.dije || !selectedItems.anillo || !selectedItems.arete) {
      setToast({
        type: 'error',
        message: 'Debes seleccionar un producto de cada categoría'
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

    // Crear producto de juego personalizado
    const gameProduct = {
      _id: `game-${Date.now()}`,
      name: 'Juego Personalizado de Accesorios',
      title: 'Juego Personalizado de Accesorios',
      description: `Collar: ${selectedItems.collar.title} | Dije: ${selectedItems.dije.title} | Anillo: ${selectedItems.anillo.title} | Arete: ${selectedItems.arete.title}`,
      price: calculateGamePrice(),
      category: 'Joyería',
      stock: 1,
      image: selectedItems.collar.image,
      // Guardar las imágenes de componentes generadas correctamente
      componentImages: {
        collar: getComponentImage(selectedItems.collar, 'collar'),
        dije: getComponentImage(selectedItems.dije, 'dije'),
        arete: getComponentImage(selectedItems.arete, 'arete'),
        anillo: getComponentImage(selectedItems.anillo, 'anillo')
      },
      // Guardar referencias a los productos individuales
      components: {
        collarId: selectedItems.collar.id || selectedItems.collar._id,
        dijeId: selectedItems.dije.id || selectedItems.dije._id,
        anilloId: selectedItems.anillo.id || selectedItems.anillo._id,
        areteId: selectedItems.arete.id || selectedItems.arete._id
      },
      isCustomCombo: true
    };

    console.log('🛒 Producto agregado al carrito:', {
      title: gameProduct.title,
      componentImages: gameProduct.componentImages
    });

    addToCart(gameProduct);
    setToast({
      type: 'success',
      message: 'Juego personalizado agregado al carrito'
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Resumen de selección actual */}
        <div className="mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">🎁 Tu Juego Actual</h2>
          
          {/* Mostrar estado actual del juego */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 sm:p-8 mb-10 sm:mb-12 text-white shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-6">✨ Tu selección actual:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Collar */}
              <div className="flex flex-col items-center p-3 sm:p-4 bg-white/20 rounded-lg border-2 border-white/50 backdrop-blur-sm">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/30 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {selectedItems.collar ? (
                    <LazyImage
                      src={getComponentImage(selectedItems.collar, 'collar') || 'https://via.placeholder.com/64'}
                      alt={selectedItems.collar.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl text-white/60">+</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">📿 Collar</p>
              </div>

              {/* Dije */}
              <div className="flex flex-col items-center p-3 sm:p-4 bg-white/20 rounded-lg border-2 border-white/50 backdrop-blur-sm">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/30 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {selectedItems.dije ? (
                    <LazyImage
                      src={getComponentImage(selectedItems.dije, 'dije') || 'https://via.placeholder.com/64'}
                      alt={selectedItems.dije.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl text-white/60">+</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">✨ Dije</p>
              </div>

              {/* Arete */}
              <div className="flex flex-col items-center p-3 sm:p-4 bg-white/20 rounded-lg border-2 border-white/50 backdrop-blur-sm">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/30 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {selectedItems.arete ? (
                    <LazyImage
                      src={getComponentImage(selectedItems.arete, 'arete') || 'https://via.placeholder.com/64'}
                      alt={selectedItems.arete.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl text-white/60">+</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">👂 Arete</p>
              </div>

              {/* Anillo */}
              <div className="flex flex-col items-center p-3 sm:p-4 bg-white/20 rounded-lg border-2 border-white/50 backdrop-blur-sm">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/30 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {selectedItems.anillo ? (
                    <LazyImage
                      src={getComponentImage(selectedItems.anillo, 'anillo') || 'https://via.placeholder.com/64'}
                      alt={selectedItems.anillo.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl text-white/60">+</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">💍 Anillo</p>
              </div>
            </div>
          </div>

          {/* Grid de categorías con productos */}
          <div className="space-y-14 sm:space-y-16">

          </div>
        </div>

        {/* Resumen y Compra - Sticky */}
        {selectedItems.collar && selectedItems.dije && selectedItems.arete && selectedItems.anillo && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl z-40">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
                {/* Resumen de precios */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Total individual:</span>
                    <span className="line-through text-white/80">S/. {getTotalIndividualPrice().toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold">Con 18% desc:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-white">S/. {calculateGamePrice().toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-white/20 px-3 py-2 rounded-lg text-center border border-white/30">
                    <p className="text-sm sm:text-base font-semibold">💰 Ahorras: S/. {(getTotalIndividualPrice() - calculateGamePrice()).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-3 sm:col-span-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white text-cyan-600 hover:bg-gray-100 text-center font-bold py-3 sm:py-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
                  >
                    🛒 Agregar Juego Completo al Carrito
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/products?search=')}
                      className="bg-white/20 hover:bg-white/30 border border-white/50 text-white py-2 sm:py-3 rounded-lg transition-all font-semibold text-sm sm:text-base backdrop-blur-sm"
                    >
                      🔄 Otro Juego
                    </button>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-white/20 hover:bg-white/30 border border-white/50 text-white py-2 sm:py-3 rounded-lg transition-all font-semibold text-sm sm:text-base backdrop-blur-sm"
                    >
                      ← Atrás
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Espacio extra para que no se superponga con el sticky */}
        {selectedItems.collar && selectedItems.dije && selectedItems.arete && selectedItems.anillo && (
          <div className="h-32"></div>
        )}

        {/* Información adicional */}
        <Card className="p-6 sm:p-8 bg-cyan-50 border border-cyan-200 mt-12 sm:mt-16">
          <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ ¿Por qué comprar el juego completo?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ <strong>18% de descuento</strong> vs comprar productos individuales</li>
            <li>✓ <strong>Combinación coordinada</strong> perfecta para tu estilo</li>
            <li>✓ <strong>Una compra</strong> en lugar de cuatro</li>
            <li>✓ <strong>Personalización total</strong> de tu look</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
