import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../../components/Common/ImageUploader';
import CategoryManagement from '../../components/Admin/CategoryManagement';
import AdminDashboard from './AdminDashboard';
import OrdersManagement from './OrdersManagement';
import UsersManagement from './UsersManagement';
import ShippingManagement from './ShippingManagement';
import BackupsManagement from './BackupsManagement';
import { 
  Package, FolderPlus, BarChart3, LogOut, Home, ShoppingCart, Users, 
  Truck, Database, Menu, X 
} from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [productSubTab, setProductSubTab] = useState('active');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProducts();
    fetchCategories();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No hay token disponible. Por favor, inicia sesión nuevamente.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch('http://localhost:5000/api/products/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } else if (response.status === 403) {
        setError('Acceso denegado. Tu usuario no tiene permisos de administrador.');
        console.error('403 Forbidden - Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      } else if (response.status === 401) {
        setError('Token inválido o expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Error ${response.status}: ${errorData.message || 'Error cargando productos'}`);
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.warn('No se pudieron cargar las categorías');
      }
    } catch (err) {
      console.warn('Error loading categories:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (imageData) => {
    setUploadedImages(prev => [...prev, imageData]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.title || !formData.price || !formData.categoryId) {
      setError('Completa todos los campos requeridos (*)');
      return;
    }

    if (!editingId && uploadedImages.length === 0) {
      setError('Completa todos los campos requeridos (*) y sube al menos una imagen');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Debes iniciar sesión como admin para crear/editar productos');
        return;
      }
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/products/${editingId}`
        : 'http://localhost:5000/api/products';
      
      const productResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sku: formData.sku,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          categoryId: parseInt(formData.categoryId),
          ...(uploadedImages.length > 0 && {
            images: uploadedImages.map((img) => ({
              url: img.url,
              alt: formData.title
            }))
          })
        })
      });

      const productData = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(productData.message || productData.error || 'Error guardando producto');
      }

      setFormData({ sku: '', title: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '' });
      setUploadedImages([]);
      setShowForm(false);
      setEditingId(null);
      await fetchProducts();
      setError(null);
      alert(`✅ Producto ${editingId ? 'actualizado' : 'creado'} exitosamente`);
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.message || 'Error desconocido');
    }
  };

  const handleDelete = async (productId) => {
    // Prevenir clics duplicados
    if (isDeleting === productId) return;

    const product = products.find(p => p.id === productId);
    const confirmMessage = `⚠️ ADVERTENCIA\n\nEstás a punto de ELIMINAR permanentemente el producto:\n"${product?.title}"\n\n¿Estás seguro de que deseas continuar?\n\nEsta acción no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setIsDeleting(productId);
      
      // Actualización optimista: remover el producto del estado local inmediatamente
      const originalProducts = products;
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setError('');
        // Esperar un poco para asegurar que el servidor ha procesado todo
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Revertir si hubo error
        setProducts(originalProducts);
        const data = await response.json();
        setError(data.message || 'Error eliminando producto');
      }
    } catch (err) {
      // Revertir en caso de error de red
      await fetchProducts();
      setError(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const product = products.find(p => p.id === productId);
    const action = currentStatus ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que deseas ${action} el producto "${product?.title}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setError('');
        await fetchProducts();
      } else {
        const data = await response.json();
        setError(data.message || `Error al ${action} el producto`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      sku: product.sku || '',
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock || '',
      categoryId: product.categoryId || ''
    });
    setEditingId(product.id);
    setUploadedImages([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">👨‍💼 Panel de Administración</h1>
            <p className="text-blue-100 mt-2">
              {user ? `Bienvenido, ${user.email}` : 'Gestiona tu tienda'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="bg-gray-800 border-b border-gray-700 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Package className="w-5 h-5" />
              Productos ({products.filter(p => p.active).length})
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FolderPlus className="w-5 h-5" />
              Categorías ({categories.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analíticas
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* TAB: CATEGORÍAS */}
        {activeTab === 'categories' && (
          <CategoryManagement />
        )}

        {/* TAB: ANALÍTICAS */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">📊 Analíticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-gray-600 font-semibold">Productos Totales</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{products.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-gray-600 font-semibold">Categorías</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{categories.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-gray-600 font-semibold">Productos en Stock</h3>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {products.filter(p => p.stock > 0).length}
                </p>
              </div>
            </div>

            {products.filter(p => p.stock < 10 && p.stock > 0).length > 0 && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-4">⚠️ Productos con Stock Bajo</h3>
                <div className="space-y-2">
                  {products.filter(p => p.stock < 10 && p.stock > 0).map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded border border-yellow-100">
                      <span className="font-semibold">{product.title}</span>
                      <span className="text-yellow-700 font-bold">{product.stock} unidades</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.filter(p => p.stock === 0).length > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-4">🚨 Productos Sin Stock</h3>
                <div className="space-y-2">
                  {products.filter(p => p.stock === 0).map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded border border-red-100">
                      <span className="font-semibold">{product.title}</span>
                      <span className="text-red-700 font-bold">Sin stock</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUCTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  {editingId ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">SKU (Código) *</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="Ej: ANILLO-ORO-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Nombre del Producto *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Ej: Anillo de Oro 18K"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Categoría *</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Precio (S/) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Precio Original (S/) (Opcional)</label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        step="0.01"
                        placeholder="Para mostrar descuentos"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descripción del producto..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-4">
                      Imágenes del Producto {!editingId && '*'}
                    </label>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      multiple={true}
                      maxSize={10}
                    />
                  </div>

                  {uploadedImages.length > 0 && (
                    <div>
                      <h4 className="text-gray-700 font-bold mb-3">Imágenes cargadas ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img.url}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      {editingId ? '💾 Actualizar Producto' : '💾 Guardar Producto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ sku: '', title: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '' });
                        setUploadedImages([]);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold mb-4">Productos</h2>
                
                {/* Sub-pestañas para Activos/Inactivos */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setProductSubTab('active')}
                    className={`px-4 py-2 font-bold transition border-b-2 ${
                      productSubTab === 'active'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    ✓ Activos ({products.filter(p => p.active).length})
                  </button>
                  <button
                    onClick={() => setProductSubTab('inactive')}
                    className={`px-4 py-2 font-bold transition border-b-2 ${
                      productSubTab === 'inactive'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    ✗ Inactivos ({products.filter(p => !p.active).length})
                  </button>
                </div>
              </div>
              
              {productSubTab === 'active' ? (
                // TAB ACTIVOS
                <>
                  {products.filter(p => p.active).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p className="mb-4">No hay productos activos</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        Crear primer producto
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">SKU</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Nombre</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Categoría</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Precio</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Stock</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Imagen</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products
                            .filter(p => p.active)
                            .sort((a, b) => {
                              const numA = parseInt(a.title.match(/\d+/)?.[0] || null);
                              const numB = parseInt(b.title.match(/\d+/)?.[0] || null);
                              if (numA !== null && numB !== null) return numA - numB;
                              if (numA !== null) return -1;
                              if (numB !== null) return 1;
                              return a.title.localeCompare(b.title);
                            })
                            .map(product => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-mono">{product.sku}</td>
                              <td className="px-6 py-4">{product.title}</td>
                              <td className="px-6 py-4">{product.category?.name || '-'}</td>
                              <td className="px-6 py-4">S/ {parseFloat(product.price).toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-12 w-12 object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-gray-500">Sin imagen</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(product.id, product.active)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition"
                                  >
                                    ⏸️ Desactivar
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={isDeleting === product.id}
                                    className={`${isDeleting === product.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-1 rounded-lg text-sm transition`}
                                  >
                                    {isDeleting === product.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                // TAB INACTIVOS
                <>
                  {products.filter(p => !p.active).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No hay productos inactivos</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">SKU</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Nombre</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Categoría</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Precio</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Stock</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Imagen</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Estado</th>
                            <th className="px-6 py-3 text-left text-gray-700 font-bold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products
                            .filter(p => !p.active)
                            .sort((a, b) => {
                              const numA = parseInt(a.title.match(/\d+/)?.[0] || null);
                              const numB = parseInt(b.title.match(/\d+/)?.[0] || null);
                              if (numA !== null && numB !== null) return numA - numB;
                              if (numA !== null) return -1;
                              if (numB !== null) return 1;
                              return a.title.localeCompare(b.title);
                            })
                            .map(product => (
                            <tr key={product.id} className="border-b hover:bg-gray-50 opacity-75">
                              <td className="px-6 py-4 text-sm font-mono">{product.sku}</td>
                              <td className="px-6 py-4 line-through">{product.title}</td>
                              <td className="px-6 py-4">{product.category?.name || '-'}</td>
                              <td className="px-6 py-4">S/ {parseFloat(product.price).toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800">
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-12 w-12 object-cover rounded opacity-50"
                                  />
                                ) : (
                                  <span className="text-gray-500">Sin imagen</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                                  Inactivo
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleToggleStatus(product.id, product.active)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition"
                                  >
                                    ✓ Activar
                                  </button>
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition"
                                  >
                                    👁️ Ver
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
