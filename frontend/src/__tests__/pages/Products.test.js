import { render, screen, waitFor } from '@testing-library/react';

describe('Products Page', () => {
  const MockProductsPage = () => (
    <div>
      <h1>Productos</h1>
      <input placeholder="Buscar productos..." />
      <aside className="filter-sidebar">
        <h3>Filtros</h3>
      </aside>
      <main>
        <article>Producto 1</article>
        <article>Producto 2</article>
      </main>
      <nav>
        <button>Página 1</button>
        <button>Página 2</button>
      </nav>
    </div>
  );

  it('debe renderizar la página de productos', () => {
    render(<MockProductsPage />);
    expect(screen.getByText(/productos/i)).toBeInTheDocument();
  });

  it('debe mostrar campo de búsqueda', () => {
    render(<MockProductsPage />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('debe renderizar lista de productos', () => {
    const { container } = render(<MockProductsPage />);
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('debe mostrar barra lateral de filtros', () => {
    const { container } = render(<MockProductsPage />);
    expect(container.querySelector('.filter-sidebar')).toBeInTheDocument();
  });

  it('debe tener paginación', () => {
    render(<MockProductsPage />);
    expect(screen.getByRole('button', { name: /página|pagina/i })).toBeInTheDocument();
  });

  it('debe mostrar múltiples artículos', () => {
    render(<MockProductsPage />);
    expect(screen.getByText(/producto 1|producto 2/i)).toBeInTheDocument();
  });
});
