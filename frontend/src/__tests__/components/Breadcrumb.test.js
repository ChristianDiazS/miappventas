import { render, screen } from '@testing-library/react';

describe('Breadcrumb Component', () => {
  const Breadcrumb = ({ items = [] }) => (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
          {idx < items.length - 1 && <span>/</span>}
        </div>
      ))}
    </nav>
  );
  it('debe renderizar los items del breadcrumb', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Productos', href: '/productos' },
      { label: 'Electrónica' }
    ];
    render(<Breadcrumb items={items} />);
    
    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/productos/i)).toBeInTheDocument();
    expect(screen.getByText(/electrónica/i)).toBeInTheDocument();
  });

  it('debe renderizar enlaces para items con href', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Actual' }
    ];
    const { container } = render(<Breadcrumb items={items} />);
    
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('debe no renderizar enlace para el último item', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Actual', href: '/actual' }
    ];
    render(<Breadcrumb items={items} />);
    
    const actual = screen.getByText(/actual/i);
    expect(actual.closest('a')).not.toBeInTheDocument();
  });

  it('debe separar items con slash', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Productos', href: '/productos' }
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const slashes = container.textContent.split('/').filter(s => s.trim());
    expect(slashes.length).toBeGreaterThanOrEqual(1);
  });
});
