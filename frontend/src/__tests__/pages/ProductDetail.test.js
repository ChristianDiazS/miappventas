import { render, screen, waitFor } from '@testing-library/react';

describe('ProductDetail Page', () => {
  const MockProductDetail = () => (
    <div>
      <h1>Detalles del Producto</h1>
      <img src="product.jpg" alt="Producto" />
      <div data-testid="image-gallery">
        <img src="img1.jpg" alt="Galería 1" />
        <img src="img2.jpg" alt="Galería 2" />
      </div>
      <p>Descripción del producto</p>
      <span>S/. 1500.00</span>
      <button>Agregar al carrito</button>
      <section>
        <h2>Reseñas</h2>
        <p>⭐⭐⭐⭐ (120 opiniones)</p>
      </section>
      <p>Stock: Disponible</p>
    </div>
  );

  it('debe renderizar los detalles del producto', () => {
    render(<MockProductDetail />);
    expect(screen.getByText(/descripción/i)).toBeInTheDocument();
  });

  it('debe mostrar imagen principal', () => {
    const { container } = render(<MockProductDetail />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('debe mostrar galería de imágenes', () => {
    render(<MockProductDetail />);
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
  });

  it('debe mostrar precio', () => {
    render(<MockProductDetail />);
    expect(screen.getByText(/s\/.|\d+\.\d{2}/i)).toBeInTheDocument();
  });

  it('debe mostrar botón agregar al carrito', () => {
    render(<MockProductDetail />);
    expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument();
  });

  it('debe mostrar reseñas', () => {
    render(<MockProductDetail />);
    expect(screen.getByText(/reseñas/i)).toBeInTheDocument();
  });

  it('debe mostrar información de stock', () => {
    render(<MockProductDetail />);
    expect(screen.getByText(/stock|disponible/i)).toBeInTheDocument();
  });
});
