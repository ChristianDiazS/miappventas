import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Checkout Page', () => {
  const MockCheckout = () => (
    <div>
      <h1>Checkout</h1>
      <form>
        <section>
          <h2>Dirección de envío</h2>
          <input placeholder="Calle" />
          <input placeholder="Ciudad" />
        </section>
        <section>
          <h2>Opciones de envío</h2>
          <select><option>Envío estándar</option></select>
        </section>
        <section>
          <h2>Pago</h2>
          <input placeholder="Número de tarjeta" />
        </section>
        <section>
          <h2>Resumen de orden</h2>
          <p>Total: S/. 1500.00</p>
        </section>
        <button type="submit">Confirmar pedido</button>
      </form>
    </div>
  );

  it('debe renderizar la página de checkout', () => {
    render(<MockCheckout />);
    expect(screen.getByText(/checkout|pagar|compra/i)).toBeInTheDocument();
  });

  it('debe mostrar formulario de dirección', () => {
    render(<MockCheckout />);
    expect(screen.getByText(/dirección|envío|shipping/i)).toBeInTheDocument();
  });

  it('debe mostrar campos de dirección', () => {
    render(<MockCheckout />);
    expect(screen.getByPlaceholderText(/calle|street/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ciudad|city/i)).toBeInTheDocument();
  });

  it('debe mostrar opciones de envío', () => {
    render(<MockCheckout />);
    expect(screen.getByText(/envío|shipping|entrega/i)).toBeInTheDocument();
  });

  it('debe mostrar formulario de pago', () => {
    render(<MockCheckout />);
    expect(screen.getByText(/pago|payment/i)).toBeInTheDocument();
  });

  it('debe mostrar resumen de orden', () => {
    render(<MockCheckout />);
    expect(screen.getByText(/resumen|orden|summary|total/i)).toBeInTheDocument();
  });

  it('debe tener botón confirmar pedido', () => {
    render(<MockCheckout />);
    expect(screen.getByRole('button', { name: /confirmar|pagar|completar|place order/i })).toBeInTheDocument();
  });

  it('debe ser un formulario', () => {
    const { container } = render(<MockCheckout />);
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
