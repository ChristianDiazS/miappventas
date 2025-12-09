import { useState } from 'react';

export function SearchBar({ placeholder = 'Buscar productos...', onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Llamar a onSearch en tiempo real mientras escribes
    if (onSearch) onSearch(value);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
      >
        Buscar
      </button>
    </div>
  );
}