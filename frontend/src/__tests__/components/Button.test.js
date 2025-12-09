import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  const Button = ({ children, onClick, variant = 'primary', disabled = false, fullWidth = false }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${variant} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );

  it('debe renderizar el botón con el texto correcto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('debe llamar onClick cuando se hace clic', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe aplicar la variante correcta', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('.btn-primary');
    expect(button).toBeInTheDocument();
  });

  it('debe ser deshabilitado cuando disabled es true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('debe aplicar clase fullWidth cuando se especifica', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    const button = container.querySelector('.w-full');
    expect(button).toBeInTheDocument();
  });
});
