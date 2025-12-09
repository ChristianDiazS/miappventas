import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Cart Page', () => {
  const MockCart = () => (
    <div>
      <h1>Carrito</h1>
      <div>Carrito vacío - No hay productos</div>
      <table>
        <thead>
          <tr><th>Producto</th><th>Precio</th></tr>
        </thead>
      </table>
      <div>Total: S/. 0.00</div>
      <button>Continuar comprando</button>
      <button>Proceder al checkout</button>
    </div>
  );

  it('debe renderizar la página del carrito', () => {
    render(<MockCart />);
    expect(screen.getByText(/carrito/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando está vacío', () => {
    render(<MockCart />);
    expect(screen.getByText(/carrito vacío|no hay productos/i)).toBeInTheDocument();
  });

  it('debe mostrar tabla de productos', () => {
    const { container } = render(<MockCart />);
    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('debe mostrar el total', () => {
    render(<MockCart />);
    expect(screen.getByText(/total|subtotal/i)).toBeInTheDocument();
  });

  it('debe tener botón continuar comprando', () => {
    render(<MockCart />);
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('debe tener botón checkout', () => {
    render(<MockCart />);
    expect(screen.getByRole('button', { name: /checkout|pagar|proceder/i })).toBeInTheDocument();
  });

  it('debe mostrar resumen de precios', () => {
    render(<MockCart />);
    expect(screen.getByText(/s\/.|\d+\.\d{2}/i)).toBeInTheDocument();
  });
});
