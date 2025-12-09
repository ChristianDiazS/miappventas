import { render, screen } from '@testing-library/react';
import { LazyImage } from '../../components/Common/LazyImage';

describe('LazyImage Component', () => {
  it('debe renderizar con clase de contenedor', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test Image"
        className="test-class"
      />
    );
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('debe mostrar placeholder mientras se carga', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test Image"
      />
    );
    const placeholder = container.querySelector('.animate-pulse');
    expect(placeholder).toBeInTheDocument();
  });

  it('debe tener observador de intersección', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test Image"
      />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('debe aplicar responsive design', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test Image"
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
  });

  it('debe soportar dark mode', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test Image"
      />
    );
    expect(container.firstChild).toHaveClass('dark:bg-gray-700');
  });
});
