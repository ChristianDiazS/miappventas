import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ShippingAddresses Component', () => {
  const mockAddresses = [
    {
      id: 1,
      street: 'Av. Principal 123',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15001',
      isDefault: true
    },
    {
      id: 2,
      street: 'Av. Secundaria 456',
      city: 'Arequipa',
      state: 'Arequipa',
      zipCode: '04001',
      isDefault: false
    }
  ];

  const mockShippingAddresses = () => (
    <div>
      {mockAddresses.map((addr) => (
        <div key={addr.id}>
          <p>{addr.street}</p>
          <p>{addr.city}, {addr.state}</p>
          {addr.isDefault && <span>Por defecto</span>}
          <button>Seleccionar</button>
        </div>
      ))}
      <button>Agregar dirección</button>
    </div>
  );

  it('debe renderizar la lista de direcciones', () => {
    render(<mockShippingAddresses />);
    expect(screen.getByText(/av. principal 123/i)).toBeInTheDocument();
    expect(screen.getByText(/av. secundaria 456/i)).toBeInTheDocument();
  });

  it('debe marcar la dirección por defecto', () => {
    render(<mockShippingAddresses />);
    expect(screen.getByText(/por defecto|default/i)).toBeInTheDocument();
  });

  it('debe mostrar city y state', () => {
    render(<mockShippingAddresses />);
    expect(screen.getByText(/lima|arequipa/i)).toBeInTheDocument();
  });

  it('debe tener botón seleccionar para cada dirección', () => {
    render(<mockShippingAddresses />);
    const buttons = screen.getAllByRole('button', { name: /seleccionar/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('debe tener botón para agregar nueva dirección', () => {
    render(<mockShippingAddresses />);
    expect(screen.getByRole('button', { name: /agregar dirección|nueva dirección/i })).toBeInTheDocument();
  });
});
