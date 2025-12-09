import { useState } from 'react';

export function FilterSidebar({ onFilter }) {
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg p-6 shadow-sm">
      
      {/* Categorías */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Categorías</h3>
        <div className="space-y-2">
          {['Laptops', 'Monitores', 'Accesorios', 'Muebles'].map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => {
                  setCategory(e.target.checked ? cat : 'all');
                  if (onFilter) onFilter({ category: cat });
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de Precio */}
      <div>
        <h3 className="text-lg font-bold mb-4">Rango de Precio</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={(e) => {
              setPriceRange([0, parseInt(e.target.value)]);
              if (onFilter) onFilter({ priceMax: parseInt(e.target.value) });
            }}
            className="w-full"
          />
          <p className="text-sm text-gray-600">
            S/ 0 - S/ {priceRange[1]}
          </p>
        </div>
      </div>
    </aside>
  );
}