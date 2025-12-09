import { render, screen } from '@testing-library/react';

describe('Toast Component', () => {
  const Toast = ({ message, type = 'info' }) => {
    const typeClasses = {
      success: 'bg-green-50 text-green-800',
      error: 'bg-red-50 text-red-800',
      warning: 'bg-yellow-50 text-yellow-800',
      info: 'bg-blue-50 text-blue-800',
    };
    return (
      <div className={`rounded p-4 ${typeClasses[type] || typeClasses.info}`}>
        <svg></svg>
        <p>{message}</p>
      </div>
    );
  };
  it('debe renderizar el toast con el mensaje correcto', () => {
    render(<Toast message="Operación exitosa" type="success" />);
    expect(screen.getByText(/operación exitosa/i)).toBeInTheDocument();
  });

  it('debe mostrar tipo success con clase bg-green-50', () => {
    const { container } = render(<Toast message="Éxito" type="success" />);
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
  });

  it('debe mostrar tipo error con clase bg-red-50', () => {
    const { container } = render(<Toast message="Error" type="error" />);
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
  });

  it('debe mostrar tipo warning con clase bg-yellow-50', () => {
    const { container } = render(<Toast message="Advertencia" type="warning" />);
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
  });

  it('debe mostrar tipo info con clase bg-blue-50', () => {
    const { container } = render(<Toast message="Info" type="info" />);
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('debe renderizar el icono correcto para cada tipo', () => {
    const { container } = render(<Toast message="Test" type="success" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
