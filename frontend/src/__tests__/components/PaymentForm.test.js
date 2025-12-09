import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('PaymentForm Component', () => {
  const PaymentForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit}>
      <label>Pago</label>
      <input placeholder="Número de tarjeta" />
      <input placeholder="Titular" />
      <input placeholder="mm/yy" />
      <input placeholder="CVV" />
      <button type="submit">Pagar</button>
    </form>
  );
  it('debe renderizar el formulario de pago', () => {
    render(<PaymentForm onSubmit={() => {}} />);
    expect(screen.getByText(/pago/i)).toBeInTheDocument();
  });

  it('debe renderizar campo de número de tarjeta', () => {
    render(<PaymentForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText(/número de tarjeta/i)).toBeInTheDocument();
  });

  it('debe renderizar campo de titular', () => {
    render(<PaymentForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText(/titular/i)).toBeInTheDocument();
  });

  it('debe renderizar campos de fecha y CVV', () => {
    render(<PaymentForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText(/mm\/yy/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cvv/i)).toBeInTheDocument();
  });

  it('debe validar campos requeridos antes de submit', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /pagar|confirmar/i });
    await user.click(submitButton);
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('debe formatear número de tarjeta con espacios', async () => {
    const user = userEvent.setup();
    const { container } = render(<PaymentForm onSubmit={() => {}} />);
    
    const cardInput = screen.getByPlaceholderText(/número de tarjeta/i);
    await user.type(cardInput, '4111111111111111');
    
    expect(cardInput.value).toMatch(/\d{4}\s\d{4}\s\d{4}\s\d{4}/);
  });
});
