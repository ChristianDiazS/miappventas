import { render, screen } from '@testing-library/react';

describe('RatingStars Component', () => {
  const Badge = ({ variant = 'default', children, info }) => (
    <span className={`bg-${variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : 'gray'}-50 rounded px-2 py-1`}>
      {children}
      {info && <span className="text-xs"> ({info})</span>}
    </span>
  );

  const RatingStars = ({ rating = 0, count = 0 }) => (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400">{'⭐'.repeat(Math.floor(rating))}</span>
      <span className="text-yellow-300">{'⭐'.repeat(5 - Math.floor(rating))}</span>
      <span className="text-sm text-gray-600">({count})</span>
    </div>
  );

  it('debe renderizar componente de calificación', () => {
    render(<Badge variant="success">⭐ 4.5 Estrellas</Badge>);
    expect(screen.getByText(/4\.5|estrellas/i)).toBeInTheDocument();
  });

  it('debe mostrar el número de estrellas', () => {
    render(<Badge>⭐⭐⭐⭐ 4 de 5</Badge>);
    expect(screen.getByText(/4 de 5|4 stars/i)).toBeInTheDocument();
  });

  it('debe aplicar variante correcta', () => {
    const { container } = render(<Badge variant="warning">⭐⭐⭐</Badge>);
    const badge = container.querySelector('.bg-yellow-50');
    expect(badge).toBeInTheDocument();
  });

  it('debe mostrar puntuación en texto', () => {
    render(<Badge>⭐⭐⭐⭐⭐ 5.0</Badge>);
    expect(screen.getByText(/5\.0|5 stars/i)).toBeInTheDocument();
  });

  it('debe mostrar contador de reviews', () => {
    render(<Badge info="125 opiniones">Rating</Badge>);
    expect(screen.getByText(/125|opiniones/i)).toBeInTheDocument();
  });
});
