import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Breadcrumb } from '../components/Common/Breadcrumb';
import { Toast } from '../components/Common/Toast';
import { useCart } from '../hooks/useCart';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    checkFavoriteStatus();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (!response.ok) throw new Error('Producto no encontrado');

      const data = await response.json();
      setProduct(data.data);
      setReviews(Array.isArray(data.data.reviews) ? data.data.reviews : []);
    } catch (error) {
      console.error('Error:', error);
      setToast({
        type: 'error',
        message: 'Error al cargar el producto'
      });
      setTimeout(() => navigate('/products'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  };

  const getProductImage = () => {
    // Si el producto tiene imágenes, devolver la primera
    if (product?.images && product.images.length > 0) {
      return product.images[selectedImage]?.url || product.images[0]?.url;
    }
    // Fallback a imagen por categoría
    const imageMap = {
      'Joyería': '/images/placeholder.svg',
      'Arreglos Florales': '/images/placeholder.svg',
      'Decoración para el Baño': '/images/placeholder.svg'
    };
    return imageMap[product?.category] || '/images/placeholder.svg';
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
    setQuantity(value);
  };

  const handleQuantityIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, product.stock));
  };

  const handleQuantityDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        type: 'error',
        message: 'Debes iniciar sesión primero'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const itemToAdd = { ...product, quantity };
    addToCart(itemToAdd);
    setToast({
      type: 'success',
      message: `${product.title} x${quantity} agregado al carrito`
    });
    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = favorites.filter(fId => fId !== id);
      setToast({
        type: 'info',
        message: 'Removido de favoritos'
      });
    } else {
      updatedFavorites = [...favorites, id];
      setToast({
        type: 'success',
        message: 'Agregado a favoritos'
      });
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      setToast({
        type: 'error',
        message: 'Completa todos los campos de la reseña'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        type: 'error',
        message: 'Debes iniciar sesión para dejar una reseña'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewForm)
        }
      );

      if (!response.ok) throw new Error('Error al enviar reseña');

      const newReview = await response.json();
      setReviews([newReview.data, ...reviews]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      setToast({
        type: 'success',
        message: 'Reseña publicada exitosamente'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Producto no encontrado</p>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Productos', href: '/products' },
            { label: product.title }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-8 lg:mt-12 items-start">
          {/* Images - Larger and Centered */}
          <div className="flex flex-col justify-center items-center lg:sticky lg:top-20">
            {/* Imagen Principal - Más grande */}
            <div className="bg-linear-to-br from-gray-100 to-gray-200 w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg mb-6 sm:mb-8 flex items-center justify-center overflow-hidden shadow-lg p-2">
              <img
                src={getProductImage()}
                alt={product.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>

            {/* Miniaturas */}
            <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
              {product?.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg cursor-pointer border-2 overflow-hidden transition hover:shadow-md flex items-center justify-center bg-gray-50 ${
                      selectedImage === idx ? 'border-cyan-500 shadow-lg' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-contain p-2 hover:opacity-75"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 overflow-hidden flex items-center justify-center bg-gray-50 border-gray-300`}
                >
                  <img
                    src={getProductImage()}
                    alt={`${product.title} 1`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Details - Proportioned */}
          <div className="flex flex-col justify-start pt-0">
            {product.category && (
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">📁 {product.category}</p>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex text-yellow-400 text-sm sm:text-lg">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm sm:text-lg">
                    {i < Math.round(product.rating || 4.5) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-gray-600 text-xs sm:text-sm">({reviews.length} reseñas)</span>
            </div>

            {/* Price */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600">S/. {product.price.toLocaleString('es-PE')}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm sm:text-lg text-gray-400 line-through">
                      S/. {product.originalPrice.toLocaleString('es-PE')}
                    </span>
                    {discountPercent > 0 && <Badge variant="success">-{discountPercent}%</Badge>}
                  </>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6 sm:mb-8">
              {product.stock > 0 ? (
                <Badge variant="success" className="mb-4">
                  ✓ En Stock ({product.stock} disponibles)
                </Badge>
              ) : (
                <Badge className="mb-4 bg-red-500">❌ Agotado</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-10">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción:</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">Características Principales:</h3>
                <ul className="space-y-1 sm:space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                      <span className="text-cyan-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Cantidad:</label>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleQuantityDecrement}
                  disabled={quantity <= 1}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 sm:w-20 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg text-center bg-white transition-colors"
                />
                <button
                  onClick={handleQuantityIncrement}
                  disabled={quantity >= product.stock}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <Button
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? `🛒 Añadir al Carrito (${quantity})` : 'Agotado'}
              </Button>
              <Button
                fullWidth
                variant={isFavorite ? 'primary' : 'outline'}
                onClick={handleToggleFavorite}
              >
                {isFavorite ? '❤️ Removido de Favoritos' : '🤍 Agregar a Favoritos'}
              </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">📦 Envío y Devoluciones</h4>
              <p className="text-sm text-gray-700">✓ Envío gratis a Lima</p>
              <p className="text-sm text-gray-700">✓ Devolución dentro de 30 días</p>
              <p className="text-sm text-gray-700">✓ Garantía de satisfacción</p>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas de Clientes ({reviews.length})</h2>

          {/* Review Form */}
          {!showReviewForm ? (
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(true)}
              className="mb-6"
            >
              ✍️ Escribir una Reseña
            </Button>
          ) : (
            <Card className="mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Reseña</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>
                        {rating} {'★'.repeat(rating)} - {['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Pobre'][5 - rating]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="Ej: Excelente producto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Cuéntanos tu experiencia con este producto..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary">Publicar Reseña</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 5, title: '', comment: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Sin reseñas aún. ¡Sé el primero en comentar!</p>
            ) : (
              reviews.map((review, idx) => (
                <Card key={idx} className="border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.title}</h4>
                      <p className="text-sm text-gray-600">{review.userName || 'Cliente'} • {' '}
                        <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('es-PE')}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
