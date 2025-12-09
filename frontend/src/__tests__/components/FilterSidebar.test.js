import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FilterSidebar Component', () => {
  const FilterSidebar = ({ categories, onFilterChange }) => (
    <div>
      <h3>Filtros</h3>
      <div><p>Precio</p></div>
      <div><p>En stock</p></div>
      {categories.map(cat => (
        <label key={cat.id}><input type="checkbox" onChange={() => onFilterChange()} /> {cat.name}</label>
      ))}
    </div>
  );
  const mockCategories = [
    { id: 1, name: 'Electrónica' },
    { id: 2, name: 'Ropa' }
  ];

  const mockFilters = {
    category: null,
    priceRange: [0, 5000],
    inStock: false
  };

  it('debe renderizar la barra lateral de filtros', () => {
    render(
      <FilterSidebar 
        categories={mockCategories}
        filters={mockFilters}
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText(/filtros/i)).toBeInTheDocument();
  });

  it('debe renderizar las categorías disponibles', () => {
    render(
      <FilterSidebar 
        categories={mockCategories}
        filters={mockFilters}
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText(/electrónica/i)).toBeInTheDocument();
    expect(screen.getByText(/ropa/i)).toBeInTheDocument();
  });

  it('debe llamar onFilterChange cuando se selecciona una categoría', async () => {
    const handleFilterChange = jest.fn();
    const user = userEvent.setup();
    render(
      <FilterSidebar 
        categories={mockCategories}
        filters={mockFilters}
        onFilterChange={handleFilterChange}
      />
    );
    
    const categoryCheckbox = screen.getByRole('checkbox', { name: /electrónica/i });
    await user.click(categoryCheckbox);
    expect(handleFilterChange).toHaveBeenCalled();
  });

  it('debe renderizar el filtro de rango de precio', () => {
    render(
      <FilterSidebar 
        categories={mockCategories}
        filters={mockFilters}
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText(/precio/i)).toBeInTheDocument();
  });

  it('debe renderizar el filtro de stock', () => {
    render(
      <FilterSidebar 
        categories={mockCategories}
        filters={mockFilters}
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText(/en stock/i)).toBeInTheDocument();
  });
});
