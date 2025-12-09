import { ProductCard } from './ProductCard';
import { Spinner } from '../Common';

/**
 * ProductGrid Component
 * Grid responsivo de ProductCards
 * 
 * Props:
 *  - products: Product[]
 *  - loading: boolean
 *  - error: string | null
 *  - onViewDetails: (id) => void
 *  - onAddToCart: (product) => void
 */

export function ProductGrid({
  products = [],
  loading = false,
  error = null,
  onViewDetails = () => {},
  onAddToCart = () => {},
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold mb-2">⚠️ Error</p>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-12 text-center">
        <p className="text-blue-700 font-semibold text-lg">📦 No se encontraron productos</p>
        <p className="text-blue-600 mt-2">Intenta con otros filtros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
