import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Toast } from '../components/Common/Toast';
import { SkeletonLoader } from '../components/Common/SkeletonLoader';
import { LazyImage } from '../components/Common/LazyImage';
import { useCart } from '../hooks/useCart';

export function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [pricePreset, setPricePreset] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999 });

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
  }, [allProducts, searchTerm, sortBy, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Error al cargar productos');

      const data = await response.json();
      setAllProducts(data.data || []);
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

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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
      message: `${product.name} agregado al carrito`
    });
  };

  // Mapear imágenes locales según categoría
  const getProductImage = (category) => {
    const imageMap = {
      'Laptops': '/images/products/laptop/product-laptop-001.jpeg',
      'Monitores': '/images/products/monitor/product-monitor-001.jpeg',
      'Periféricos': '/images/products/keyboard/product-keyboard-001.jpeg',
      'Accesorios': '/images/products/headphones/product-headphones-001.jpeg',
      'Mobiliario': '/images/products/chair/product-chair-001.jpeg'
    };
    return imageMap[category] || '/images/products/laptop/product-laptop-001.jpeg';
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Catálogo de Productos</h1>
        </div>

        {/* Layout Principal: Filtros + Productos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Filtros - 1 columna en md+ */}
          <div className="md:col-span-1">
            <Card className="sticky top-4 p-4 md:p-6 shadow-lg border border-gray-200">
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

          {/* Productos - 3 columnas en lg */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  📦 <strong>{filteredProducts.length}</strong> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map(product => (
                  <Card
                    key={product._id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full border border-gray-200"
                  >
                    {/* Imagen */}
                    <div
                      className="bg-linear-to-br from-gray-200 to-gray-300 h-40 sm:h-48 w-full cursor-pointer hover:from-gray-300 hover:to-gray-400 transition duration-300 relative overflow-hidden"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <LazyImage
                        src={getProductImage(product.category)}
                        alt={product.name}
                        className="w-full h-full p-2"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name);
                        }}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-xs md:text-sm hover:text-cyan-600 transition">
                        {product.name}
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

                      {/* Botón */}
                      <Button
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                        className="mt-auto text-xs md:text-sm"
                      >
                        {product.stock > 0 ? '🛒 Añadir al Carrito' : 'Agotado'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
