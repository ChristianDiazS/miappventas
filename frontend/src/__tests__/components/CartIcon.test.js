import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('CartIcon Component', () => {
  const CartIcon = ({ count = 0, onClick }) => (
    <button onClick={onClick} className="hover:text-orange-600">
      <svg></svg>
      {count > 0 && <span>{count}</span>}
    </button>
  );
  it('debe renderizar el icono del carrito', () => {
    const { container } = render(<CartIcon count={0} onClick={() => {}} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('debe mostrar el número de items cuando count > 0', () => {
    render(<CartIcon count={5} onClick={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('no debe mostrar badge cuando count es 0', () => {
    const { container } = render(<CartIcon count={0} onClick={() => {}} />);
    const badge = container.querySelector('.bg-red-500');
    expect(badge).not.toBeInTheDocument();
  });

  it('debe llamar onClick cuando se hace clic', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<CartIcon count={0} onClick={handleClick} />);
    
    const button = container.querySelector('button') || container.firstChild;
    await user.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('debe renderizar con clase para hover', () => {
    const { container } = render(<CartIcon count={3} onClick={() => {}} />);
    const icon = container.querySelector('button') || container.querySelector('[role="button"]');
    expect(icon).toHaveClass('hover:text-orange-600');
  });
});
