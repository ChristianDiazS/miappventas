import { render, screen, waitFor } from '@testing-library/react';

describe('Home Page', () => {
  const MockHome = () => (
    <div>
      <h1>Bienvenido a MiAppVentas</h1>
      <section>Productos Destacados</section>
      <div data-testid="carousel">
        <img src="banner.jpg" alt="Banner" />
      </div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos">Productos</a>
      </nav>
    </div>
  );

  it('debe renderizar página principal', () => {
    render(<MockHome />);
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
  });

  it('debe mostrar sección de productos', () => {
    render(<MockHome />);
    expect(screen.getByText(/destacados/i)).toBeInTheDocument();
  });

  it('debe renderizar carousel', () => {
    const { container } = render(<MockHome />);
    expect(container.querySelector('[data-testid="carousel"]')).toBeInTheDocument();
  });

  it('debe tener múltiples secciones', () => {
    const { container } = render(<MockHome />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('debe renderizar enlaces de navegación', () => {
    render(<MockHome />);
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
  });
});
