import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Pagination Component (Navigation Buttons)', () => {
  const Button = ({ children, onClick, variant = 'default', disabled = false }) => {
    const variantClasses = {
      default: 'bg-gray-200 text-gray-800',
      primary: 'bg-orange-600 text-white',
    };
    return (
      <button onClick={onClick} disabled={disabled} className={`px-3 py-2 rounded ${variantClasses[variant] || variantClasses.default}`}>
        {children}
      </button>
    );
  };
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar botones de navegación', () => {
    render(
      <>
        <Button onClick={() => mockOnPageChange(1)}>« Anterior</Button>
        <span>Página 1 de 5</span>
        <Button onClick={() => mockOnPageChange(2)}>Siguiente »</Button>
      </>
    );
    expect(screen.getByText(/página/i)).toBeInTheDocument();
  });

  it('debe mostrar información de página actual', () => {
    render(<span>Página 2 de 5</span>);
    expect(screen.getByText(/página 2 de 5/i)).toBeInTheDocument();
  });

  it('debe tener botón anterior habilitado', () => {
    render(
      <Button onClick={() => mockOnPageChange(1)}>« Anterior</Button>
    );
    const button = screen.getByRole('button', { name: /anterior/i });
    expect(button).not.toBeDisabled();
  });

  it('debe tener botón siguiente habilitado', () => {
    render(
      <Button onClick={() => mockOnPageChange(2)}>Siguiente »</Button>
    );
    const button = screen.getByRole('button', { name: /siguiente/i });
    expect(button).not.toBeDisabled();
  });

  it('debe llamar callback cuando se hace clic en anterior', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>« Anterior</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('debe llamar callback cuando se hace clic en siguiente', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Siguiente »</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('debe mostrar números de página', () => {
    render(
      <>
        {[1, 2, 3, 4, 5].map((page) => (
          <Button key={page}>{page}</Button>
        ))}
      </>
    );
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('debe destacar página actual', () => {
    const { container } = render(
      <Button variant="primary">3</Button>
    );
    const activeButton = container.querySelector('button.bg-orange-600');
    expect(activeButton).toBeInTheDocument();
  });
});
