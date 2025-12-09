import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Componente de prueba para usar el hook
function TestComponent() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <p>Tema: {isDark ? 'oscuro' : 'claro'}</p>
      <button onClick={toggleTheme}>Toggle Tema</button>
    </div>
  );
}

describe('ThemeContext', () => {
  it('debe renderizar con tema claro por defecto', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByText(/Tema: claro/)).toBeInTheDocument();
  });

  it('debe permitir cambiar el tema', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: /Toggle Tema/ });
    await user.click(button);
    
    expect(screen.getByText(/Tema: oscuro/)).toBeInTheDocument();
  });

  it('debe guardar preferencia en localStorage', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: /Toggle Tema/ });
    await user.click(button);
    
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('debe leer preferencia del localStorage', () => {
    localStorage.setItem('theme-preference', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/Tema: oscuro/)).toBeInTheDocument();
    localStorage.clear();
  });
});
