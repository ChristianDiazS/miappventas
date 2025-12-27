import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ShoppingCart } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen || !product) return null;

  // Obtener imágenes
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : [product.image];

  // Obtener tallas si existen
  const sizes = product.sizes ? JSON.parse(product.sizes) : null;

  // Navegación de imágenes
  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 1));
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return; // Solo permitir drag cuando hay zoom
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;

    const container = document.getElementById('image-container');
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Calcular el tamaño de la imagen con zoom
    const imageWidth = containerWidth * zoom;
    const imageHeight = containerHeight * zoom;
    
    // Calcular los límites máximos de movimiento
    const maxX = (imageWidth - containerWidth) / 2;
    const maxY = (imageHeight - containerHeight) / 2;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      image: product.image
    };

    onAddToCart?.(cartItem);
    onClose();
  };

  // Calcular precio con descuento si es combo
  const isCombo = product.type === 'combo';
  const discountedPrice = isCombo ? product.price * 0.82 : product.price;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con botón cerrar */}
        <div className="sticky top-0 flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Producto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* SECCIÓN DE IMÁGENES CON ZOOM */}
            <div className="flex flex-col gap-4">
              {/* Imagen principal con zoom y drag */}
              <div 
                id="image-container"
                className="relative w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200" 
                style={{ aspectRatio: '1' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseDown={zoom > 1 ? handleMouseDown : undefined}
              >
                <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  style={{
                    cursor: zoom > 1 ? 'grab' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {images[currentImageIndex] && (
                    <img
                      src={images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover select-none"
                      style={{
                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        transformOrigin: 'center',
                      }}
                      draggable="false"
                    />
                  )}
                </div>

                {/* Controles de zoom */}
                <div className="absolute bottom-4 right-4 flex gap-2 bg-white rounded-lg shadow-lg p-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    title="Alejar (Zoom Out)"
                  >
                    <ZoomOut size={20} className="text-gray-700" />
                  </button>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-700 min-w-15 text-center">
                    {Math.round(zoom * 100)}%
                  </div>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    title="Acercar (Zoom In)"
                  >
                    <ZoomIn size={20} className="text-gray-700" />
                  </button>
                  {zoom > 1 && (
                    <div className="border-l border-gray-300">
                      <button
                        onClick={resetZoom}
                        className="p-2 hover:bg-gray-100 rounded transition-colors ml-1"
                        title="Resetear zoom"
                      >
                        <span className="text-xs font-semibold text-gray-700">Reset</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Navegación de imágenes */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-20"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-20"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-cyan-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Indicador de imágenes */}
              {images.length > 1 && (
                <div className="text-center text-sm text-gray-500">
                  Imagen {currentImageIndex + 1} de {images.length}
                </div>
              )}

              {/* Instructivo de zoom */}
              {zoom > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 text-center">
                  💡 Arrastra la imagen para centrar lo que deseas ver
                </div>
              )}
            </div>

            {/* SECCIÓN DE INFORMACIÓN DEL PRODUCTO */}
            <div className="flex flex-col gap-6">
              
              {/* Categoría y Título */}
              <div>
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold mb-2">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                {product.description && (
                  <p className="text-gray-600 text-base">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-baseline gap-3">
                  {isCombo && (
                    <>
                      <span className="text-sm text-gray-600 line-through">
                        S/. {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-red-500">-18% Combo</span>
                    </>
                  )}
                  <span className="text-4xl font-bold text-gray-900">
                    S/. {discountedPrice.toFixed(2)}
                  </span>
                </div>
                {product.sku && (
                  <p className="text-sm text-gray-500 mt-2">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              {/* Selector de tallas (si aplica) */}
              {sizes && sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Selecciona una talla:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 rounded-lg font-semibold transition-all border-2 ${
                          selectedSize === size
                            ? 'border-cyan-500 bg-cyan-100 text-cyan-700'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock y disponibilidad */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  Disponible en stock
                </p>
              </div>

              {/* Botón agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={sizes && sizes.length > 0 && !selectedSize}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
              >
                <ShoppingCart size={24} />
                Agregar al Carrito
              </button>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">✓</span> Envío rápido a todo el país
                </p>
                <p>
                  <span className="font-semibold">✓</span> Producto 100% auténtico
                </p>
                <p>
                  <span className="font-semibold">✓</span> Garantía de satisfacción
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
