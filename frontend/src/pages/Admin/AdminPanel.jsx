import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../../components/Common/ImageUploader';

export default function AdminPanel() {
  const navigate = useNavigate();
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
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedCart, setSimulatedCart] = useState([]);
  const [selectedProductForCart, setSelectedProductForCart] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1);

  // Cargar productos y categorías
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // El endpoint devuelve { success, data, pagination }
        setProducts(Array.isArray(data) ? data : data.data || []);
      } else {
        setError('Error cargando productos');
      }
    } catch (err) {
      setError(err.message);
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

    // Si es nuevo producto, necesita al menos una imagen
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

      console.log('Guardando producto con datos:', formData);
      
      // Determinar si es creación o edición
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

      console.log('Response status:', productResponse.status);
      const productData = await productResponse.json();
      console.log('Response data:', productData);

      if (!productResponse.ok) {
        throw new Error(productData.message || productData.error || 'Error guardando producto');
      }

      // Limpiar y recargar
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
    const product = products.find(p => p.id === productId);
    const confirmMessage = `⚠️ ADVERTENCIA\n\nEstás a punto de ELIMINAR permanentemente el producto:\n"${product?.title}"\n\n¿Estás seguro de que deseas continuar?\n\nEsta acción no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchProducts();
        // Scroll to top to show success
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await response.json();
        setError(data.message || 'Error eliminando producto');
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

  // Funciones para el simulador de compra
  const addToSimulatedCart = () => {
    if (!selectedProductForCart) {
      setError('Selecciona un producto');
      return;
    }

    const existingItem = simulatedCart.find(item => item.id === selectedProductForCart.id);
    
    if (existingItem) {
      setSimulatedCart(simulatedCart.map(item =>
        item.id === selectedProductForCart.id
          ? { ...item, quantity: item.quantity + cartQuantity }
          : item
      ));
    } else {
      setSimulatedCart([...simulatedCart, { ...selectedProductForCart, quantity: cartQuantity }]);
    }
    
    setCartQuantity(1);
    setSelectedProductForCart(null);
    setError(null);
  };

  const removeFromSimulatedCart = (productId) => {
    setSimulatedCart(simulatedCart.filter(item => item.id !== productId));
  };

  const updateSimulatedCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromSimulatedCart(productId);
    } else {
      setSimulatedCart(simulatedCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getSimulatedTotal = () => {
    return simulatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const completeSimulatedPurchase = () => {
    if (simulatedCart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    const total = getSimulatedTotal();
    alert(`
✅ SIMULACIÓN DE COMPRA COMPLETADA

Productos:
${simulatedCart.map(item => `  • ${item.title} x${item.quantity} = S/ ${(item.price * item.quantity).toLocaleString('es-PE')}`).join('\n')}

Total: S/ ${total.toLocaleString('es-PE')}

⚠️ NOTA: Esta es una SIMULACIÓN. 
Los datos NO se han guardado en la base de datos.
    `);

    setSimulatedCart([]);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Gestiona tus productos y imágenes</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ sku: '', title: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '' });
              setUploadedImages([]);
              setEditingId(null);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {showForm ? '✕ Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Formulario */}
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

              {/* Subidor de imágenes */}
              <div>
                <label className="block text-gray-700 font-bold mb-4">
                  Imágenes del Producto {!editingId && '*'}
                </label>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  multiple={true}
                  maxSize={10}
                />
                {editingId && (
                  <p className="text-xs text-gray-500 mt-2">
                    Opcional: Puedes agregar más imágenes o dejar sin cambios
                  </p>
                )}
              </div>

              {/* Preview de imágenes */}
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

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6 border-b">Productos ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No hay productos aún</p>
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
                  {products.map(product => (
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
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Simulador de Compra */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold">🛒 Simulador de Compra</h2>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
            >
              {showSimulator ? '➖ Ocultar' : '➕ Mostrar'}
            </button>
          </div>

          {showSimulator && (
            <div className="p-6 space-y-6">
              {/* Seleccionar Producto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Selecciona Producto</label>
                  <select
                    value={selectedProductForCart?.id || ''}
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      const product = products.find(p => p.id === productId && p.active);
                      setSelectedProductForCart(product || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {products.filter(p => p.active).map(product => (
                      <option key={product.id} value={product.id}>
                        {product.title} (S/ {product.price.toLocaleString('es-PE')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cartQuantity}
                    onChange={(e) => setCartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={addToSimulatedCart}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    ➕ Agregar al Carrito
                  </button>
                </div>
              </div>

              {/* Carrito Simulado */}
              {simulatedCart.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Carrito Simulado ({simulatedCart.length} items)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="px-4 py-3 text-left">Producto</th>
                          <th className="px-4 py-3 text-right">Precio</th>
                          <th className="px-4 py-3 text-center">Cantidad</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                          <th className="px-4 py-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulatedCart.map(item => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{item.title}</td>
                            <td className="px-4 py-3 text-right">S/ {item.price.toLocaleString('es-PE')}</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateSimulatedCartQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-bold">
                              S/ {(item.price * item.quantity).toLocaleString('es-PE')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeFromSimulatedCart(item.id)}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                🗑️ Quitar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Resumen */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                      <span>Total:</span>
                      <span className="text-blue-600">S/ {getSimulatedTotal().toLocaleString('es-PE')}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={completeSimulatedPurchase}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        ✅ Completar Simulación de Compra
                      </button>
                      <button
                        onClick={() => setSimulatedCart([])}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        🔄 Limpiar Carrito
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                    ⚠️ <strong>SIMULACIÓN:</strong> Esta es una simulación sin guardar datos. Perfecta para testing del flujo de compra.
                  </div>
                </div>
              )}

              {simulatedCart.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>El carrito está vacío. Selecciona un producto para comenzar la simulación.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
