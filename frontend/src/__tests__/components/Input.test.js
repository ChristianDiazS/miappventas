import { render, screen } from '@testing-library/react';

describe('Input Component', () => {
  const Input = ({ label, type = 'text', placeholder, error }) => (
    <div>
      {label && <label>{label}</label>}
      <input type={type} placeholder={placeholder} className={error ? 'border-red-500' : ''} />
      {error && <p>{error}</p>}
    </div>
  );
  it('debe renderizar el input correctamente', () => {
    render(<Input type="text" placeholder="Ingresa tu nombre" />);
    const input = screen.getByPlaceholderText(/ingresa tu nombre/i);
    expect(input).toBeInTheDocument();
  });

  it('debe mostrar el label cuando se proporciona', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('debe ser de tipo text por defecto', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('debe cambiar el tipo de input correctamente', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('debe mostrar mensaje de error cuando se proporciona', () => {
    render(<Input error="Este campo es requerido" />);
    expect(screen.getByText(/este campo es requerido/i)).toBeInTheDocument();
  });

  it('debe tener la clase de error cuando hay error', () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-red-500');
  });
});
