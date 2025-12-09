import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Componente que lanza error
function BrokenComponent() {
  throw new Error('Test error');
}

// Componente que funciona correctamente
function WorkingComponent() {
  return <div>Contenido funcionando correctamente</div>;
}

describe('ErrorBoundary Component', () => {
  // Suprimir console.error para mantener salida limpia en tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('debe renderizar children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Contenido funcionando correctamente/)).toBeInTheDocument();
  });

  it('debe capturar errores y mostrar UI de error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Algo salió mal/)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error capturado', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('debe tener botón para intentar de nuevo', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /Intentar de Nuevo/ })).toBeInTheDocument();
  });

  it('debe tener enlace a inicio', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('link', { name: /Ir a Inicio/ })).toBeInTheDocument();
  });

  it('debe tener clases dark mode', () => {
    const { container } = render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(container.querySelector('.dark\\:bg-gray-900')).toBeInTheDocument();
  });

  it('debe mostrar detalles en desarrollo', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    const details = screen.getByText(/Detalles del Error/);
    expect(details).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });
});
