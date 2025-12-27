import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductDetailModal from './ProductDetailModal';
import { generateComponentImagesFromCombo, generateAllComponentImagesFromCombo } from '../../utils/cloudinaryImageGenerator';

export default function ProductCard({ product, onAddToCart, selectedCategory, onAddToPersonalization }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Verificar si es una subcategoría de Joyería
  const isJoyeriaSubcategory = ['Collar', 'Dije', 'Arete', 'Anillo'].includes(selectedCategory);

  // Obtener imágenes
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : [product.image];

  // Obtener tallas si existen
  const sizes = product.sizes ? JSON.parse(product.sizes) : null;

  // Verificar si es combo
  const isCombo = product.type === 'combo';

  // Navegación de imágenes
  const goToPrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    if (sizes && !selectedSize) {
      setShowSizeModal(true);
      return;
    }

    const cartItem = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      image: product.image
    };

    onAddToCart?.(cartItem);
  };

  const handleAddToPersonalization = () => {
    if (sizes && !selectedSize) {
      setShowSizeModal(true);
      return;
    }

    // Mapear categoría a la clave de personalización
    const categoryMap = {
      'Collar': 'collar',
      'Dije': 'dije',
      'Arete': 'arete',
      'Anillo': 'anillo'
    };

    const productWithSize = {
      ...product,
      selectedSize
    };

    // Si es un combo, descomponerlo en sus partes con imágenes recortadas
    if (product.type === 'combo' && product.comboItems) {
      if (product.comboItems.collar) {
        const comboImage = generateComponentImagesFromCombo(product, 'collar');
        onAddToPersonalization?.('collar', {
          ...productWithSize,
          componentImage: comboImage
        });
      }
      if (product.comboItems.dije) {
        const comboImage = generateComponentImagesFromCombo(product, 'dije');
        onAddToPersonalization?.('dije', {
          ...productWithSize,
          componentImage: comboImage
        });
      }
      if (product.comboItems.arete) {
        const comboImage = generateComponentImagesFromCombo(product, 'arete');
        onAddToPersonalization?.('arete', {
          ...productWithSize,
          componentImage: comboImage
        });
      }
      if (product.comboItems.anillo) {
        const comboImage = generateComponentImagesFromCombo(product, 'anillo');
        onAddToPersonalization?.('anillo', {
          ...productWithSize,
          componentImage: comboImage
        });
      }
    } else {
      // Si es un producto individual, agregarlo en su categoría
      const categoryKey = categoryMap[selectedCategory];
      if (categoryKey) {
        onAddToPersonalization?.(categoryKey, productWithSize);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
        {/* IMAGEN CON CARRUSEL */}
        <div 
          className="relative w-full bg-gray-100 group overflow-hidden cursor-pointer" 
          style={{ aspectRatio: '3/4' }}
          onClick={() => setShowDetailModal(true)}
        >
          {/* Imagen principal */}
          {images[currentImageIndex] && (
            <img
              src={images[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Overlay con indicador clickeable */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-gray-900">
              👁️ Ver Detalles
            </div>
          </div>

          {/* Botón Favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>

          {/* Navegación de imágenes - aparece al pasar el mouse */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage(e);
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage(e);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Indicadores de imagen */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="p-4 flex-1 flex flex-col">
          
          {/* Título y Subtítulo */}
          <div className="mb-3">
            {product.type === 'combo' ? (
              <>
                {/* Para combos: mostrar items como título centrado */}
                <h3 className="font-bold text-sm md:text-base text-gray-800 text-center">
                  {product.title.split('Combo')[0].trim()}
                </h3>
                {/* Subtítulo con "Combo Deluxe X" o "Collar con Dije Letra-X" */}
                <p className="text-xs text-gray-500 text-center font-semibold mt-1">
                  {product.title.includes('Deluxe') 
                    ? `Combo Deluxe ${product.title.match(/\d+$/)?.[0] || ''}`
                    : (() => {
                        const numero = product.title.match(/\d+$/)?.[0];
                        return numero ? `Collar con Dije Letra-${numero}` : 'Combo';
                      })()
                  }
                </p>
              </>
            ) : (
              /* Para productos individuales: mostrar como antes */
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-sm md:text-base text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.title}
                </h3>
              </Link>
            )}
          </div>

          {/* Descripción breve */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">
            {product.description}
          </p>

          {/* Selector de Tallas (si aplica) */}
          {sizes && (
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                Talla:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeModal(false);
                    }}
                    className={`py-1 px-2 text-xs rounded border transition-colors ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Precio y Stock */}
          <div className="mb-3 space-y-1">
            <p className="text-lg font-bold text-gray-800">
              S/. {product.price?.toFixed(2) || '0.00'}
            </p>
            <p className={`text-xs font-semibold ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 
                ? `${product.stock} disponibles` 
                : 'Sin stock'}
            </p>
          </div>

          {/* Botón Agregar - Dinámico según contexto */}
          {isJoyeriaSubcategory ? (
            <button
              onClick={handleAddToPersonalization}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold"
            >
              ✨ Agregar a Personalizado
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <ShoppingCart size={18} />
              Agregar
            </button>
          )}
        </div>
      </div>

      {/* Modal de Talla */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Selecciona una talla
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setShowSizeModal(false);
                  }}
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Producto */}
      <ProductDetailModal
        product={product}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAddToCart={(cartItem) => {
          onAddToCart?.(cartItem);
          setShowDetailModal(false);
        }}
      />
    </>
  );
}
