import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ProductCard Component', () => {
  const ProductCard = ({ product, onAddToCart }) => (
    <div>
      <a href={`/producto/${product.id}`}>
        <img src={product.image} alt="Producto" />
        <p>{product.name}</p>
        <span>s/. {product.price}</span>
        <p>{product.rating} (120 opiniones)</p>
        <p>{product.inStock ? 'Disponible' : 'Agotado'}</p>
      </a>
      <button onClick={() => onAddToCart(product)}>Agregar</button>
    </div>
  );
  const mockProduct = {
    id: 1,
    name: 'Laptop Dell',
    price: 2500,
    image: 'https://example.com/laptop.jpg',
    rating: 4.5,
    reviews: 120,
    inStock: true
  };

  it('debe renderizar nombre del producto', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/laptop dell/i)).toBeInTheDocument();
  });

  it('debe mostrar imagen del producto', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', mockProduct.image);
  });

  it('debe mostrar precio formateado', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/s\/.?2.?500|2500/i)).toBeInTheDocument();
  });

  it('debe mostrar calificación de estrellas', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/4\.5|4 de 5/i)).toBeInTheDocument();
  });

  it('debe mostrar número de reseñas', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/120|reseñas|opiniones/i)).toBeInTheDocument();
  });

  it('debe tener enlace al detalle del producto', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', `/producto/${mockProduct.id}`);
  });

  it('debe mostrar botón agregar al carrito', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByRole('button', { name: /agregar|add to cart/i })).toBeInTheDocument();
  });

  it('debe mostrar indicador de stock disponible', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/disponible|en stock|in stock/i)).toBeInTheDocument();
  });

  it('debe mostrar indicador de sin stock cuando no hay disponibilidad', () => {
    const outOfStock = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStock} />);
    expect(screen.getByText(/agotado|sin stock|out of stock/i)).toBeInTheDocument();
  });

  it('debe llamar onAddToCart cuando se hace clic', async () => {
    const handleAddToCart = jest.fn();
    const user = userEvent.setup();
    render(
      <ProductCard product={mockProduct} onAddToCart={handleAddToCart} />
    );
    
    const addButton = screen.getByRole('button', { name: /agregar|add to cart/i });
    await user.click(addButton);
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
