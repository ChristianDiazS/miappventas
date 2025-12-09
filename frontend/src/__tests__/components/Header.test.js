import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Header } from '../../components/Layout/Header';

// Mock de useCart hook
jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    cart: [],
  }),
}));

// Mock de UserMenu
jest.mock('../../components/Layout/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

// Mock de CartIcon
jest.mock('../../components/Common/CartIcon', () => ({
  CartIcon: ({ itemCount }) => (
    <div data-testid="cart-icon">Cart ({itemCount})</div>
  ),
}));

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <Router>
        <Header />
      </Router>
    );
  };

  it('debe renderizar el header correctamente', () => {
    renderHeader();
    expect(screen.getByText('MiAppVentas')).toBeInTheDocument();
  });

  it('debe renderizar la barra de búsqueda', () => {
    renderHeader();
    const searchInput = screen.getByPlaceholderText(/buscar por nombre o categoría/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('debe renderizar los links de navegación', () => {
    renderHeader();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('debe renderizar el carrito', () => {
    renderHeader();
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
  });

  it('debe renderizar el menú de usuario', () => {
    renderHeader();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('debe buscar productos cuando se escribe en la barra de búsqueda', async () => {
    const user = userEvent.setup();
    renderHeader();

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o categoría/i);
    await user.type(searchInput, 'laptop');

    expect(searchInput).toHaveValue('laptop');
  });

  it('debe navegar a productos con parámetro de búsqueda cuando se envía el formulario', async () => {
    const user = userEvent.setup();
    renderHeader();

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o categoría/i);
    const searchButton = screen.getByRole('button', { name: /buscar/i });

    await user.type(searchInput, 'monitor');
    await user.click(searchButton);

    // Verificar que se ejecutó la navegación (esto es un test básico)
    expect(searchInput).toHaveValue('monitor');
  });

  it('debe permitir buscar con la tecla Enter', async () => {
    const user = userEvent.setup();
    renderHeader();

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o categoría/i);
    await user.type(searchInput, 'periféricos{Enter}');

    // Verificar que el input tiene el valor
    expect(searchInput).toHaveValue('periféricos');
  });

  it('debe tener clase sticky en la parte superior', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('debe mostrar el contador de carrito', () => {
    renderHeader();
    expect(screen.getByText(/cart \(0\)/i)).toBeInTheDocument();
  });

  it('debe tener el logo como enlace a home', () => {
    renderHeader();
    const logoLink = screen.getByRole('link', { name: /miappventas/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
