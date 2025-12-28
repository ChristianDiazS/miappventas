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
  Package, FolderPlus, Home, ShoppingCart, Users, 
  Truck, Database, Menu, X, LogOut, AlertCircle 
} from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productSubTab, setProductSubTab] = useState('active');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
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
  const [isDeleting, setIsDeleting] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Only fetch products/categories if viewing products tab
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    }
    setLoading(false);
  }, [navigate, activeTab]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
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
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
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
    if (isDeleting === productId) return;

    const product = products.find(p => p.id === productId);
    const confirmMessage = `⚠️ ADVERTENCIA\n\nEstás a punto de ELIMINAR permanentemente el producto:\n"${product?.title}"\n\n¿Estás seguro de que deseas continuar?\n\nEsta acción no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setIsDeleting(productId);
      
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
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setProducts(originalProducts);
        const data = await response.json();
        setError(data.message || 'Error eliminando producto');
      }
    } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-300">Cargando panel...</p>
        </div>
      </div>
    );
  }

  // Navigation items with role-based visibility
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'products', label: 'Productos', icon: Package, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'categories', label: 'Categorías', icon: FolderPlus, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'orders', label: 'Órdenes', icon: ShoppingCart, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'users', label: 'Usuarios', icon: Users, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'shipping', label: 'Envíos', icon: Truck, roles: ['ADMIN', 'SUPERADMIN'] },
    { id: 'backups', label: 'Backups', icon: Database, roles: ['SUPERADMIN'] },
  ].filter(item => user?.role && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">👨‍💼 Panel de Administración</h1>
            <p className="text-blue-100 text-sm md:text-base mt-1">
              {user?.email} • {user?.role === 'SUPERADMIN' ? '👑 Superadmin' : '🛡️ Admin'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-blue-100 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition flex items-center gap-2 text-sm md:text-base"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block absolute lg:relative w-64 bg-gray-800 border-r border-gray-700 h-screen lg:h-auto overflow-y-auto z-20`}>
          <div className="p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>⚠️ Error:</strong> {error}
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <AdminDashboard user={user} />
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white mb-6">📦 Gestión de Productos</h1>

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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-2">Categoría *</label>
                          <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                    
                    {!showForm && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition mb-4"
                      >
                        ➕ Nuevo Producto
                      </button>
                    )}

                    <div className="flex gap-2 border-t pt-4 mt-4">
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
                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        onClick={() => handleEdit(product)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                                      >
                                        ✏️ Editar
                                      </button>
                                      <button
                                        onClick={() => handleToggleStatus(product.id, product.active)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
                                      >
                                        ⏸️
                                      </button>
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={isDeleting === product.id}
                                        className={`${isDeleting === product.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-1 rounded text-sm transition`}
                                      >
                                        {isDeleting === product.id ? '⏳' : '🗑️'}
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
                                <th className="px-6 py-3 text-left text-gray-700 font-bold">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products
                                .filter(p => !p.active)
                                .sort((a, b) => a.title.localeCompare(b.title))
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
                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        onClick={() => handleToggleStatus(product.id, product.active)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={() => handleEdit(product)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                                      >
                                        👁️
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

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <h1 className="text-3xl font-bold text-white mb-6">📁 Gestión de Categorías</h1>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <CategoryManagement />
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <OrdersManagement />
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <UsersManagement currentUser={user} />
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <ShippingManagement />
              </div>
            )}

            {/* Backups Tab */}
            {activeTab === 'backups' && user?.role === 'SUPERADMIN' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <BackupsManagement userRole={user?.role} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
