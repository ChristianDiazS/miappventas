import { useState, useEffect } from 'react';
import { FolderPlus, Edit2, Trash2, X } from 'lucide-react';
import { ImageUploader } from '../Common/ImageUploader';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  // Cargar categorías
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Error cargando categorías');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    setUploadedImage(imageData);
    setFormData(prev => ({
      ...prev,
      image: imageData.url
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/categories/${editingId}`
        : 'http://localhost:5000/api/categories';

      console.log('Enviando categoría:', formData);
      console.log('Token:', token ? 'existe' : 'no existe');

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setError(null);
        setFormData({ name: '', description: '', image: '' });
        setUploadedImage(null);
        setEditingId(null);
        setShowForm(false);
        fetchCategories();
      } else {
        setError(data.message || 'Error al guardar categoría');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setUploadedImage(null);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setError(null);
        fetchCategories();
      } else {
        const data = await response.json();
        setError(data.message || 'Error al eliminar categoría');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
    setUploadedImage(null);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderPlus className="w-6 h-6" />
            Gestión de Categorías
          </h2>
          <p className="text-gray-600 text-sm mt-1">Total: {categories.length} categorías</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setUploadedImage(null);
              setFormData({ name: '', description: '', image: '' });
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <FolderPlus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Joyería"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ej: Joyas y accesorios"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-gray-700 font-bold mb-2">
                📸 Imagen de Categoría
              </label>
              <ImageUploader onImageUpload={handleImageUpload} />
              
              {uploadedImage && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ Imagen subida exitosamente</p>
                  <img 
                    src={uploadedImage.url} 
                    alt="Preview" 
                    className="mt-2 h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                O pega una URL manualmente
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                {editingId ? '✏️ Actualizar' : '➕ Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Categorías */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-2">Cargando categorías...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron categorías' : 'No hay categorías creadas aún'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(category => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              {/* Imagen */}
              {category.image && (
                <div className="mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Contenido */}
              <h3 className="font-bold text-lg text-gray-800 mb-2">{category.name}</h3>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              )}
              
              <div className="text-xs text-gray-500 mb-4">
                ID: {category.id}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
