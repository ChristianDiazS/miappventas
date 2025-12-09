import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '../../components/Common/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('debe renderizar skeleton card correctamente', () => {
    const { container } = render(<SkeletonLoader variant="card" count={1} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar múltiples skeletons cuando count > 1', () => {
    const { container } = render(<SkeletonLoader variant="card" count={3} />);
    const skeletons = container.querySelectorAll('.rounded-lg');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('debe renderizar skeleton text variant', () => {
    const { container } = render(<SkeletonLoader variant="text" count={2} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar skeleton heading variant', () => {
    const { container } = render(<SkeletonLoader variant="heading" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar skeleton image variant', () => {
    const { container } = render(<SkeletonLoader variant="image" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('debe renderizar skeleton profile variant', () => {
    const { container } = render(<SkeletonLoader variant="profile" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar skeleton list variant', () => {
    const { container } = render(<SkeletonLoader variant="list" count={3} />);
    const items = container.querySelectorAll('.flex');
    expect(items.length).toBeGreaterThan(0);
  });

  it('debe aplicar clase personalizada', () => {
    const { container } = render(
      <SkeletonLoader variant="card" className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('debe tener animación pulse', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('debe tener fondo gris para simular carga', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    const skeleton = container.querySelector('.bg-gray-200');
    expect(skeleton).toBeInTheDocument();
  });
});
