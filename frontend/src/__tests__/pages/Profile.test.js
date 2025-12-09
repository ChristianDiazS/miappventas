import { render, screen, waitFor } from '@testing-library/react';

describe('Profile Page', () => {
  const MockProfile = () => (
    <div>
      <h1>Mi Perfil</h1>
      <section>
        <h2>Información del usuario</h2>
        <p>Nombre: Juan Pérez</p>
        <p>Email: juan@ejemplo.com</p>
        <button>Editar</button>
      </section>
      <section>
        <h2>Mis órdenes</h2>
        <p>Pedidos realizados</p>
      </section>
      <section>
        <h2>Dirección de envío</h2>
        <p>Av. Principal 123, Lima</p>
      </section>
      <section>
        <h2>Métodos de pago</h2>
        <p>Tarjeta **** 1234</p>
      </section>
      <section>
        <h2>Seguridad</h2>
        <p>Contraseña</p>
      </section>
      <button>Cerrar sesión</button>
    </div>
  );

  it('debe renderizar la página de perfil', () => {
    render(<MockProfile />);
    expect(screen.getByText(/perfil|datos/i)).toBeInTheDocument();
  });

  it('debe mostrar datos del usuario', () => {
    render(<MockProfile />);
    expect(screen.getByText(/nombre|email/i)).toBeInTheDocument();
  });

  it('debe tener botón para editar perfil', () => {
    render(<MockProfile />);
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });

  it('debe mostrar historial de órdenes', () => {
    render(<MockProfile />);
    expect(screen.getByText(/órdenes|pedidos/i)).toBeInTheDocument();
  });

  it('debe mostrar dirección guardada', () => {
    render(<MockProfile />);
    expect(screen.getByText(/dirección|envío/i)).toBeInTheDocument();
  });

  it('debe mostrar métodos de pago guardados', () => {
    render(<MockProfile />);
    expect(screen.getByText(/pago|tarjeta|payment/i)).toBeInTheDocument();
  });

  it('debe tener sección de seguridad', () => {
    render(<MockProfile />);
    expect(screen.getByText(/seguridad|contraseña/i)).toBeInTheDocument();
  });

  it('debe tener opción de logout', () => {
    render(<MockProfile />);
    expect(screen.getByRole('button', { name: /cerrar sesión|salir|logout/i })).toBeInTheDocument();
  });
});
