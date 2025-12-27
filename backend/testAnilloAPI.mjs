// Script para verificar cuántos productos retorna la API
const response = await fetch('http://localhost:5000/api/products?limit=1000');
const data = await response.json();

console.log(`Total productos retornados por API: ${data.pagination.total}`);
console.log(`Productos en respuesta: ${data.data.length}`);

// Contar Anillos
const anillos = data.data.filter(p => p.category === 'Anillo');
console.log(`Anillos en respuesta: ${anillos.length}`);

// Primeros 5 Anillos
console.log('\nPrimeros 5 Anillos:');
anillos.slice(0, 5).forEach(a => {
  console.log(`- ${a.title} (ID: ${a.id}, SKU: ${a.sku})`);
});
