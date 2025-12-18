import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Toast } from '../components/Common/Toast';
import { SkeletonLoader } from '../components/Common/SkeletonLoader';
import { LazyImage } from '../components/Common/LazyImage';
import { useCart } from '../hooks/useCart';
import { usePersonalization } from '../context/PersonalizationContext';

export function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { selectedItems, addToPersonalization } = usePersonalization();
  
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
  
  // Array con todas las imágenes de decoración para baño disponibles
  const decoracionBanoImages = [
    'img-dispensador1.jpg', 'img-dispensador2.jpg', 'img-dispensador3.jpg', 'img-dispensador4.jpg', 'img-dispensador5.jpg',
    'img-dispensador6.jpg', 'img-dispensador7.jpg', 'img-dispensador8.jpg', 'img-dispensador9.jpg', 'img-dispensador10.jpg',
    'img-dispensador11.jpg'
  ];
  
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showDecoracionIntro, setShowDecoracionIntro] = useState(false);
  const [showJoyeriaIntro, setShowJoyeriaIntro] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Imágenes de referencia de juegos completos para el carrusel
  const referenceGames = [
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858275/joyeria/img-completo1.png',
      title: 'Juego Completo 1',
      description: 'Elegancia clásica'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858276/joyeria/img-completo2.png',
      title: 'Juego Completo 2',
      description: 'Estilo moderno'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858278/joyeria/img-completo3.png',
      title: 'Juego Completo 3',
      description: 'Sofisticación'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858279/joyeria/img-completo4.png',
      title: 'Juego Completo 4',
      description: 'Luminoso'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858280/joyeria/img-completo5.png',
      title: 'Juego Completo 5',
      description: 'Minimalista'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858281/joyeria/img-completo6.png',
      title: 'Juego Completo 6',
      description: 'Vintage'
    },
    {
      image: 'https://res.cloudinary.com/dy73lxudf/image/upload/e_background_removal/v1765858283/joyeria/img-completo7.png',
      title: 'Juego Completo 7',
      description: 'Bohemio'
    }
  ];
  const [pricePreset, setPricePreset] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Opciones de rango de precio predefinidas
  const pricePresets = {
    all: { label: '💰 Cualquier Precio', min: 0, max: 999999 },
    budget: { label: '🤑 Económico (0 - 25K)', min: 0, max: 25000 },
    mid: { label: '💵 Medio (25K - 50K)', min: 25000, max: 50000 },
    premium: { label: '👑 Premium (50K - 100K)', min: 50000, max: 100000 },
    luxury: { label: '💎 Lujo (100K+)', min: 100000, max: 999999 }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Escuchar cambios en los parámetros de URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl !== null) {
      // Si hay parámetro search en URL (incluyendo string vacío)
      setSearchTerm(searchFromUrl);
    } else {
      // Si no hay parámetro search, mostrar todos
      setSearchTerm('');
    }
  }, [searchParams]);

  useEffect(() => {
    // Aplicar búsqueda y filtros cuando cambian
    applyFilters();
    setCurrentPage(1); // Resetear a página 1 cuando cambian los filtros
  }, [allProducts, searchTerm, sortBy, priceRange, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      if (!response.ok) throw new Error('Error al cargar productos');

      const data = await response.json();
      let allProds = data.data || [];

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

      // Para Decoración para el Baño, generar productos dinámicamente
      const generatedDecoracion = decoracionBanoImages.map((imgName, index) => ({
        id: `local-decoracion-${index + 1}`,
        title: `Dispensador Baño ${index + 1}`,
        price: 35 + (index % 4) * 15, // Precios variados entre 35 y 80
        image: `https://res.cloudinary.com/dy73lxudf/image/upload/c_limit,f_auto,q_auto,w_400/decoracion-para-bano/img-dispensador${index + 1}`,
        category: 'Decoración para el Baño',
        stock: 8,
        description: `Hermoso accesorio de decoración para baño - Diseño ${index + 1}`
      }));

      // Mezclar productos de la API con anillos y decoración generados
      // Remover anillos y decoración de la API si los hay
      allProds = allProds.filter(p => p.category !== 'Anillo' && p.category !== 'Decoración para el Baño');
      allProds = [...allProds, ...generatedAnillos, ...generatedDecoracion];

      setAllProducts(allProds);

      // Extraer categorías únicas de los productos
      const categories = [...new Set(allProds.map(p => p.category))];
      setAllCategories(categories);
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

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Filtrar por categoría
    if (selectedCategory) {
      if (selectedCategory === 'Joyería') {
        // Si selecciona Joyería, mostrar todos los productos de joyería
        filtered = filtered.filter(product => 
          ['Collar', 'Dije', 'Arete', 'Anillo'].includes(product.category)
        );
      } else {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por precio
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Ordenar
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // relevance
        // Mantener orden original
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (query) => {
    // Solo navegar, el useEffect actualizará searchTerm automáticamente
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/products?search=');
    }
  };

  const handleSort = (value) => {
    setSortBy(value);
  };

  const handlePriceRangeChange = (newMin, newMax) => {
    setPriceRange({ min: newMin, max: newMax });
  };

  const handlePricePresetChange = (preset) => {
    setPricePreset(preset);
    const { min, max } = pricePresets[preset];
    setPriceRange({ min, max });
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

  // Mapear imágenes - usar la imagen del producto o fallback según categoría
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

  // Funciones de paginación
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % referenceGames.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + referenceGames.length) % referenceGames.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Título */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Catálogo de Productos</h1>
          </div>

          {/* Layout Principal: Filtros + Productos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Sidebar Filtros - Skeleton */}
            <div className="md:col-span-1">
              <SkeletonLoader variant="card" count={1} className="h-96" />
            </div>

            {/* Productos - Skeleton Grid */}
            <div className="md:col-span-3">
              <div className="mb-4 md:mb-6 pb-4 border-b border-gray-300">
                <SkeletonLoader variant="text" count={1} className="w-32 h-5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <SkeletonLoader variant="card" count={6} />
              </div>
            </div>
          </div>
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
        {/* Título */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {selectedCategory === null 
              ? 'Catálogo de Productos'
              : selectedCategory === 'Joyería'
              ? '💍 Joyería'
              : selectedCategory === 'Decoración para el Baño'
              ? '🛁 Decoración para el Baño'
              : selectedCategory === 'Arreglos Florales'
              ? '🌸 Arreglos Florales'
              : selectedCategory === 'Collar'
              ? '📿 Collar'
              : selectedCategory === 'Dije'
              ? '✨ Dije'
              : selectedCategory === 'Arete'
              ? '👂 Arete'
              : selectedCategory === 'Anillo'
              ? '💍 Anillo'
              : 'Catálogo de Productos'
            }
          </h1>
        </div>

        {/* Layout Principal: Filtros + Productos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Filtros y Categorías - 1 columna en md+ */}
          <div className="md:col-span-1">
            {/* Contenedor sticky para ambos cards */}
            <div className="sticky top-32 space-y-4">
              {/* Card de Categorías */}
              <Card className="p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6 pb-3 border-b border-gray-300">
                  <svg 
                    className="w-6 h-6 text-gray-700" 
                    aria-hidden="true" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                    />
                  </svg>
                  <h3 className="font-bold text-lg text-gray-900">Categorías</h3>
                </div>

                {/* Botón "Ver Todos" */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setExpandedCategory(null);
                    setShowDecoracionIntro(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                    selectedCategory === null
                      ? 'bg-cyan-500 text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👁️ Ver Todos
                </button>

                {/* Categorías principales */}
                <div className="space-y-2">
                  {/* Decoración para Baño - Link directo */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Decoración para el Baño');
                      setShowDecoracionIntro(true);
                      setExpandedCategory(null);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === 'Decoración para el Baño'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🛁 Decoración para el Baño
                  </button>

                  {/* Arreglos Florales */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Arreglos Florales');
                      setShowDecoracionIntro(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === 'Arreglos Florales'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌸 Arreglos Florales
                  </button>

                  {/* Joyería - Link directo (sin ir a otra página) */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Joyería');
                      setShowJoyeriaIntro(true);
                      setExpandedCategory(null);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === 'Joyería'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💍 Joyería
                  </button>
                </div>
              </Card>

              {/* Card de Filtros */}
              <Card className="p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-6 pb-3 border-b border-gray-300">
                  <svg 
                    className="w-6 h-6 text-gray-700" 
                    aria-hidden="true" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeWidth="2" 
                      d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
                    />
                  </svg>
                  <h3 className="font-bold text-lg text-gray-900">Filtros</h3>
                </div>
                
                {/* Rango de precio - Dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💰 Rango de Precio
                  </label>
                  <select
                    value={pricePreset}
                    onChange={(e) => handlePricePresetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(pricePresets).map(([key, preset]) => (
                      <option key={key} value={key}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <div className="bg-cyan-50 p-2 rounded text-xs text-gray-700 text-center border border-cyan-200 mt-3">
                    <strong>S/. {priceRange.min.toLocaleString()} - S/. {priceRange.max.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Ordenar */}
                <div className="border-t border-gray-300 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📊 Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="relevance">✨ Relevancia</option>
                    <option value="price-low">📉 Menor Precio</option>
                    <option value="price-high">📈 Mayor Precio</option>
                    <option value="name">🔤 Nombre (A-Z)</option>
                    <option value="newest">⏰ Más Nuevos</option>
                  </select>
                </div>
              </Card>
            </div>
          </div>

          {/* Productos - 3 columnas en lg */}
          <div className="lg:col-span-3">
            {selectedCategory === null && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                <p className="text-gray-600 text-sm font-medium">
                  📦 <strong>{filteredProducts.length}</strong> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Sección Introductoria - Decoración para el Baño */}
            {showDecoracionIntro && selectedCategory === 'Decoración para el Baño' && (
              <div className="mb-8">
                {/* Introducción con gradiente */}
                <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 rounded-2xl p-8 md:p-12 text-white shadow-lg mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">🛁 Transforma tu Baño en un Oasis</h2>
                  <p className="text-cyan-50 text-lg md:text-xl mb-6">
                    Descubre nuestra exclusiva colección de accesorios y decoración para baño. Desde dispensadores elegantes hasta sets completos de tocador, tenemos todo lo que necesitas para crear un espacio de lujo y comodidad.
                  </p>
                  <p className="text-cyan-100 text-base md:text-lg">
                    ✨ Dispensadores de jabón | 🧴 Sets de baño | 🪥 Porta cepillos | 🛁 Accesorios decorativos | 🪞 Organizadores
                  </p>
                </div>
              </div>
            )}

            {/* Sección Introductoria - Joyería con Carrusel */}
            {showJoyeriaIntro && selectedCategory === 'Joyería' && (
              <div className="mb-8">
                {/* Carrusel de referencia */}
                <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200">
                  {/* Contenedor de imagen con fondo mejorado */}
                  <div 
                    className="relative w-full flex flex-col items-center justify-center"
                    style={{
                      height: '450px', 
                      minHeight: '450px',
                      background: '#262482'
                    }}
                  >
                    {/* Imagen con estilos mejorados */}
                    <div className="flex items-center justify-center w-full h-full px-4">
                      <img
                        src={referenceGames[currentCarouselIndex].image}
                        alt={referenceGames[currentCarouselIndex].title}
                        className="w-auto h-auto max-w-6xl max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Botones de navegación mejorados */}
                  <button
                    onClick={prevCarousel}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-3 transition-all shadow-lg hover:shadow-xl z-10 font-bold text-xl"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextCarousel}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-3 transition-all shadow-lg hover:shadow-xl z-10 font-bold text-xl"
                  >
                    →
                  </button>

                  {/* Contador de diapositivas */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {currentCarouselIndex + 1} / {referenceGames.length}
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Personalización - Aparece en Joyería o subcategorías */}
            {(selectedCategory === 'Joyería' || selectedCategory === 'Anillo' || selectedCategory === 'Collar' || selectedCategory === 'Dije' || selectedCategory === 'Arete') && (
              <div className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">🎁 Tu Juego Personalizado</h2>
                  <p className="text-cyan-100 text-sm md:text-base mb-4">Selecciona una pieza de cada tipo para crear tu combinación única. Al completar tu juego, obtendrás un 18% de descuento.</p>
                </div>

                {/* Grid de imágenes seleccionadas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-6">
                  {/* Collar */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-lg overflow-hidden flex items-center justify-center mb-2 border-2 border-white/50">
                      {selectedItems.collar ? (
                        <LazyImage
                          src={getProductImage(selectedItems.collar)}
                          alt={selectedItems.collar.title}
                          className="w-full h-full object-cover p-1"
                        />
                      ) : (
                        <span className="text-white/60 text-3xl">+</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('Collar');
                        setShowDecoracionIntro(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                        selectedCategory === 'Collar'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                          : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200'
                      }`}
                    >
                      📿 Collar
                    </button>
                  </div>

                  {/* Dije */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-lg overflow-hidden flex items-center justify-center mb-2 border-2 border-white/50">
                      {selectedItems.dije ? (
                        <LazyImage
                          src={getProductImage(selectedItems.dije)}
                          alt={selectedItems.dije.title}
                          className="w-full h-full object-cover p-1"
                        />
                      ) : (
                        <span className="text-white/60 text-3xl">+</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('Dije');
                        setShowDecoracionIntro(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                        selectedCategory === 'Dije'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                          : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200'
                      }`}
                    >
                      ✨ Dije
                    </button>
                  </div>

                  {/* Arete */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-lg overflow-hidden flex items-center justify-center mb-2 border-2 border-white/50">
                      {selectedItems.arete ? (
                        <LazyImage
                          src={getProductImage(selectedItems.arete)}
                          alt={selectedItems.arete.title}
                          className="w-full h-full object-cover p-1"
                        />
                      ) : (
                        <span className="text-white/60 text-3xl">+</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('Arete');
                        setShowDecoracionIntro(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                        selectedCategory === 'Arete'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                          : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200'
                      }`}
                    >
                      👂 Arete
                    </button>
                  </div>

                  {/* Anillo */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-lg overflow-hidden flex items-center justify-center mb-2 border-2 border-white/50">
                      {selectedItems.anillo ? (
                        <LazyImage
                          src={getProductImage(selectedItems.anillo)}
                          alt={selectedItems.anillo.title}
                          className="w-full h-full object-cover p-1"
                        />
                      ) : (
                        <span className="text-white/60 text-3xl">+</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('Anillo');
                        setShowDecoracionIntro(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                        selectedCategory === 'Anillo'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                          : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200'
                      }`}
                    >
                      💍 Anillo
                    </button>
                  </div>
                </div>

                {/* Estado del juego */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm font-semibold">
                    {selectedItems.collar && selectedItems.dije && selectedItems.arete && selectedItems.anillo
                      ? '✅ ¡Juego completo! Listo para finalizar'
                      : `⏳ ${[selectedItems.collar, selectedItems.dije, selectedItems.arete, selectedItems.anillo].filter(Boolean).length}/4 piezas seleccionadas`}
                  </p>
                </div>

                {/* Botón Finalizar */}
                {selectedItems.collar && selectedItems.dije && selectedItems.arete && selectedItems.anillo && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => navigate('/jewelry/builder')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 font-bold px-6 py-3 rounded-lg border-2 border-white"
                    >
                      ✨ Finalizar Personalización y Comprar
                    </Button>
                  </div>
                )}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Card className="text-center p-12 max-w-md shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin resultados</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    {searchTerm 
                      ? `No encontramos productos que coincidan con "${searchTerm}"`
                      : 'No hay productos disponibles con los filtros seleccionados'
                    }
                  </p>
                  <p className="text-gray-500 text-xs mb-6">
                    Intenta ajustar el rango de precio o el término de búsqueda
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setSearchTerm('');
                      setPriceRange({ min: 0, max: 10000 });
                      setSortBy('relevance');
                      navigate('/products');
                    }}
                  >
                    ✨ Limpiar Todos los Filtros
                  </Button>
                </Card>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {getPaginatedProducts().map(product => (
                    <Card
                      key={product.id}
                      className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full border border-gray-200"
                    >
                      {/* Imagen */}
                      <div
                        className="bg-white h-56 sm:h-64 w-full cursor-pointer hover:bg-gray-50 transition duration-300 relative overflow-hidden flex items-center justify-center"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <LazyImage
                          src={getProductImage(product)}
                          alt={product.title}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.title);
                          }}
                        />
                      </div>

                      {/* Contenido */}
                      <div className="p-3 md:p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-xs md:text-sm hover:text-cyan-600 transition">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 md:mb-3 capitalize">
                          🏷️ {product.category}
                        </p>
                        
                        {/* Precio */}
                        <div className="mb-2 md:mb-3 py-2 bg-cyan-50 rounded px-2 text-center border border-cyan-200">
                          <p className="text-cyan-700 font-bold text-sm md:text-lg">
                            S/. {product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Stock */}
                        <div className="mb-3 md:mb-4">
                          {product.stock > 0 ? (
                            <Badge variant="success" className="text-xs w-full text-center">
                              ✓ Stock: {product.stock} disponibles
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-red-500 text-white w-full text-center">
                              ❌ Agotado
                            </Badge>
                          )}
                        </div>

                        {/* Botones */}
                        <div className="flex flex-col gap-2 mt-auto">
                          {/* Botón Agregar a Personalizado - Solo en Joyería */}
                          {(selectedCategory === 'Collar' || selectedCategory === 'Dije' || selectedCategory === 'Arete' || selectedCategory === 'Anillo') && product.stock > 0 && (
                            <Button
                              fullWidth
                              disabled={product.stock === 0}
                              onClick={() => {
                                const categoryKey = selectedCategory.toLowerCase();
                                addToPersonalization(selectedCategory, product);
                                setToast({
                                  type: 'success',
                                  message: `${product.title} agregado a Personalizado`
                                });
                              }}
                              className="text-xs md:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                            >
                              ✨ Agregar a Personalizado
                            </Button>
                          )}

                          {/* Botón Carrito */}
                          <Button
                            fullWidth
                            disabled={product.stock === 0}
                            onClick={() => handleAddToCart(product)}
                            className="text-xs md:text-sm"
                          >
                            {product.stock > 0 ? '🛒 Añadir al Carrito' : 'Agotado'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Paginación */}
                {getTotalPages() > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    {/* Botón anterior */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ← Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex gap-1">
                      {[...Array(getTotalPages())].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-bold transition ${
                              currentPage === pageNum
                                ? 'bg-cyan-500 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón siguiente */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}

                {/* Información de página */}
                {getTotalPages() > 1 && (
                  <div className="mt-4 text-center text-gray-600 text-sm">
                    Página {currentPage} de {getTotalPages()} ({filteredProducts.length} productos encontrados)
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
