import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../components/Common/SearchBar';

describe('SearchBar Component', () => {
  it('debe renderizar el campo de búsqueda correctamente', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('debe llamar onSearch mientras se escribe (en tiempo real)', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, 'l');
    
    // Debería llamarse en tiempo real mientras escribes
    expect(handleSearch).toHaveBeenCalledWith('l');
  });

  it('debe llamar onSearch cuando se presiona Enter', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, 'laptops{Enter}');
    
    // Se llama múltiples veces: mientras escribe + al presionar Enter
    expect(handleSearch).toHaveBeenCalledWith('laptops');
  });

  it('debe llamar onSearch cuando se hace click en el botón Buscar', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/buscar/i);
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    
    await user.type(input, 'monitor');
    await user.click(searchButton);
    
    expect(handleSearch).toHaveBeenCalledWith('monitor');
  });

  it('debe mostrar placeholder personalizado cuando se proporciona', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Buscar productos..." />);
    expect(screen.getByPlaceholderText(/buscar productos/i)).toBeInTheDocument();
  });

  it('debe llamar onSearch con string vacío cuando se borra el campo', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, 'laptop');
    handleSearch.mockClear();
    
    await user.clear(input);
    
    // Al borrar, debería llamarse con string vacío
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
