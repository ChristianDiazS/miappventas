import { render, screen } from '@testing-library/react';

describe('Card Component', () => {
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
  );
  it('debe renderizar el card con el contenido correcto', () => {
    render(<Card>Contenido del card</Card>);
    expect(screen.getByText(/contenido del card/i)).toBeInTheDocument();
  });

  it('debe tener la clase card correcta', () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('bg-white');
  });

  it('debe renderizar children correctamente', () => {
    render(
      <Card>
        <h1>Título</h1>
        <p>Párrafo</p>
      </Card>
    );
    expect(screen.getByText(/título/i)).toBeInTheDocument();
    expect(screen.getByText(/párrafo/i)).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    const { container } = render(<Card className="custom-class">Test</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
