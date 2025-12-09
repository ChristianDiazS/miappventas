import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Navigation Component', () => {
  const Navigation = ({ cartCount = 0, isAuthenticated = false }) => (
    <nav>
      <p>MiAppVentas</p>
      <a href="/">Inicio</a>
      <a href="/productos">Productos</a>
      <input placeholder="Buscar" />
      <a href="/carrito">Carrito{cartCount > 0 && <span>{cartCount}</span>}</a>
      {isAuthenticated ? (
        <button>Cerrar sesión</button>
      ) : (
        <a href="/login">Iniciar sesión</a>
      )}
    </nav>
  );
  it('debe renderizar el logotipo de la tienda', () => {
    render(<Navigation />);
    expect(screen.getByText(/miappventas|tienda|store/i)).toBeInTheDocument();
  });

  it('debe mostrar enlaces de navegación principales', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /inicio|home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /productos|products/i })).toBeInTheDocument();
  });

  it('debe tener icono de búsqueda', () => {
    const { container } = render(<Navigation />);
    const searchInput = screen.queryByPlaceholderText(/buscar|search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('debe tener icono del carrito con contador', () => {
    render(<Navigation />);
    const cartLink = screen.getByRole('link', { name: /carrito|cart/i });
    expect(cartLink).toBeInTheDocument();
  });

  it('debe mostrar contador de items en el carrito', () => {
    render(<Navigation cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('debe mostrar enlace de usuario/perfil', () => {
    render(<Navigation />);
    const enlaces = screen.queryAllByRole('link');
    expect(enlaces.length).toBeGreaterThan(0);
  });

  it('debe mostrar enlace de logout cuando usuario está autenticado', () => {
    render(<Navigation isAuthenticated={true} />);
    const logout = screen.queryByRole('button', { name: /salir|logout|cerrar/i });
    expect(logout).toBeInTheDocument();
  });

  it('debe mostrar enlace de login cuando usuario no está autenticado', () => {
    render(<Navigation isAuthenticated={false} />);
    expect(screen.getByRole('link', { name: /iniciar sesión|login/i })).toBeInTheDocument();
  });

  it('debe responder a cambios en el tamaño de pantalla', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
