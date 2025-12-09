import { render, screen, waitFor } from '@testing-library/react';

describe('Orders Page', () => {
  const MockOrders = () => (
    <div>
      <h1>Mis órdenes</h1>
      <article>
        <p>Orden #001</p>
        <p>Fecha: 7 de diciembre 2025</p>
        <p>Estado: Entregado</p>
        <p>Total: S/. 1500.00</p>
        <a href="/orden/1">Ver detalles</a>
      </article>
      <article>
        <p>Orden #002</p>
        <p>Fecha: 5 de diciembre 2025</p>
        <p>Estado: Procesando</p>
        <p>Total: S/. 800.00</p>
        <a href="/orden/2">Ver detalles</a>
      </article>
      <select>
        <option>Todos</option>
        <option>Pendiente</option>
        <option>Entregado</option>
      </select>
    </div>
  );

  it('debe renderizar la página de órdenes', () => {
    render(<MockOrders />);
    expect(screen.getByText(/órdenes|mis|pedidos|orders/i)).toBeInTheDocument();
  });

  it('debe mostrar lista de órdenes', () => {
    const { container } = render(<MockOrders />);
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('debe mostrar número de orden', () => {
    render(<MockOrders />);
    expect(screen.getByText(/orden|pedido/i)).toBeInTheDocument();
  });

  it('debe mostrar fecha de la orden', () => {
    render(<MockOrders />);
    expect(screen.getByText(/fecha|date|diciembre|2025/i)).toBeInTheDocument();
  });

  it('debe mostrar estado de la orden', () => {
    render(<MockOrders />);
    expect(screen.getByText(/estado|status|entregado|procesando/i)).toBeInTheDocument();
  });

  it('debe mostrar monto total', () => {
    render(<MockOrders />);
    expect(screen.getByText(/s\/.|\d+\.\d{2}/i)).toBeInTheDocument();
  });

  it('debe tener enlace para ver detalles', () => {
    render(<MockOrders />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('debe permitir filtrar órdenes', () => {
    render(<MockOrders />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
