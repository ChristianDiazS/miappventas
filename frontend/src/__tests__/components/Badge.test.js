import { render, screen } from '@testing-library/react';

describe('Badge Component', () => {
  const Badge = ({ children, variant = 'success' }) => {
    const variantClasses = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${variantClasses[variant] || variantClasses.success}`}>
        {children}
      </span>
    );
  };
  it('debe renderizar el badge con el texto correcto', () => {
    render(<Badge>Nuevo</Badge>);
    expect(screen.getByText(/nuevo/i)).toBeInTheDocument();
  });

  it('debe tener la variante success por defecto', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
  });

  it('debe aplicar la variante warning correctamente', () => {
    const { container } = render(<Badge variant="warning">Advertencia</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('debe aplicar la variante error correctamente', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-100');
  });

  it('debe aplicar la variante info correctamente', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-100');
  });
});
