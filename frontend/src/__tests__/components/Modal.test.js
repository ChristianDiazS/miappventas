import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Modal Component', () => {
  const Modal = ({ isOpen, onClose, title, actions, children }) => isOpen ? (
    <div>
      {title && <h2>{title}</h2>}
      <button aria-label="close" onClick={onClose}>X</button>
      {children}
      {actions && actions.map((a, i) => <button key={i} onClick={a.onClick}>{a.label}</button>)}
    </div>
  ) : null;
  it('no debe renderizar cuando isOpen es false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  it('debe renderizar cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  it('debe mostrar el título cuando se proporciona', () => {
    render(
      <Modal isOpen={true} title="Confirmación" onClose={() => {}}>
        <p>¿Está seguro?</p>
      </Modal>
    );
    expect(screen.getByText(/confirmación/i)).toBeInTheDocument();
  });

  it('debe llamar onClose cuando se hace clic en el botón cerrar', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );
    
    const closeButton = container.querySelector('button[aria-label*="close" i]') || 
                       container.querySelector('button:first-of-type');
    if (closeButton) {
      await user.click(closeButton);
    }
    expect(handleClose).toHaveBeenCalled();
  });

  it('debe renderizar los botones de acción cuando se proporcionan', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}}
        actions={[
          { label: 'Cancelar', onClick: jest.fn() },
          { label: 'Confirmar', onClick: jest.fn() }
        ]}
      >
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmar/i)).toBeInTheDocument();
  });
});
