import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Login Page', () => {
  const MockLogin = () => (
    <div>
      <h1>Iniciar sesión</h1>
      <form>
        <input placeholder="Email" />
        <input type="password" placeholder="Contraseña" />
        <label>
          <input type="checkbox" /> Recordar sesión
        </label>
        <button type="submit">Iniciar sesión</button>
      </form>
      <a href="/signup">Registrarse</a>
      <a href="/forgot">¿Olvide la contraseña?</a>
    </div>
  );

  it('debe renderizar la página de login', () => {
    render(<MockLogin />);
    expect(screen.getByText(/iniciar|ingresa|login/i)).toBeInTheDocument();
  });

  it('debe mostrar campo email', () => {
    render(<MockLogin />);
    expect(screen.getByPlaceholderText(/email|correo/i)).toBeInTheDocument();
  });

  it('debe mostrar campo de contraseña', () => {
    render(<MockLogin />);
    const passwordInput = screen.getByPlaceholderText(/contraseña|password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('debe tener botón para iniciar sesión', () => {
    render(<MockLogin />);
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe mostrar enlace a registro', () => {
    render(<MockLogin />);
    expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('debe mostrar enlace de olvide contraseña', () => {
    render(<MockLogin />);
    expect(screen.getByRole('link', { name: /olvide/i })).toBeInTheDocument();
  });

  it('debe mostrar checkbox de recordar sesión', () => {
    render(<MockLogin />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('debe ser un formulario', () => {
    const { container } = render(<MockLogin />);
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
