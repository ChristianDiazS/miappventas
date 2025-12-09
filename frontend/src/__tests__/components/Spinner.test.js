import { render, screen } from '@testing-library/react';

describe('Spinner Component', () => {
  const Spinner = ({ size = 'medium', label }) => (
    <div>
      <div className="animate-spin w-8"></div>
      {label && <p>{label}</p>}
    </div>
  );
  it('debe renderizar el spinner correctamente', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('debe tener la clase animate-spin', () => {
    const { container } = render(<Spinner />);
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('debe mostrar texto de loading cuando se proporciona', () => {
    render(<Spinner label="Cargando..." />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe aplicar tamaño pequeño correctamente', () => {
    const { container } = render(<Spinner size="small" />);
    const spinner = container.querySelector('.w-6');
    expect(spinner).toBeInTheDocument();
  });

  it('debe aplicar tamaño grande correctamente', () => {
    const { container } = render(<Spinner size="large" />);
    const spinner = container.querySelector('.w-12');
    expect(spinner).toBeInTheDocument();
  });
});
