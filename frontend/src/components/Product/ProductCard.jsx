import { Badge } from '../Common';

/**
 * ProductCard Component
 * Card individual de producto en grid
 * 
 * Props:
 *  - product: { id, sku, name, description, price, originalPrice?, image, stock, category }
 *  - onViewDetails: (id: string) => void
 *  - onAddToCart: (product: Product) => void
 */

export function ProductCard({
  product = {
    id: 'test-001',
    sku: 'TEST-001',
    name: 'Producto de Ejemplo',
    description: 'Descripción corta del producto',
    price: 99.99,
    originalPrice: 149.99,
    image: '/images/placeholder.svg',
    stock: 5,
    category: 'electronics'
  },
  onViewDetails = () => {},
  onAddToCart = () => {},
}) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getStockBadge = () => {
    if (product.stock === 0) return <Badge variant="error" size="sm">Agotado</Badge>;
    if (product.stock <= 3) return <Badge variant="warning" size="sm">Casi agotado</Badge>;
    return <Badge variant="success" size="sm">En stock</Badge>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden hover:scale-105 transform">
      {/* Imagen */}
      <div className="relative overflow-hidden bg-gray-100 h-64">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badge de stock */}
        <div className="absolute top-3 right-3">
          {getStockBadge()}
        </div>

        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* SKU */}
        <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>

        {/* Nombre */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 h-14 mb-2">
          {product.name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Precio */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-cyan-500">
              S/ {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                S/ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(product.id)}
            className="flex-1 px-4 py-2 border-2 border-cyan-500 text-cyan-500 rounded-lg font-semibold hover:bg-cyan-50 transition-colors"
          >
            Ver detalles
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
