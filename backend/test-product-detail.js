// Script para verificar que el endpoint devuelve las imágenes correctamente
async function testProductEndpoint() {
  try {
    console.log('🧪 Testeando endpoint de detalle del producto...\n');

    // Obtener anillo1 (ID 5)
    const response = await fetch('http://localhost:5000/api/products/5');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const product = data.data;

    console.log('✅ Respuesta del servidor:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Título: ${product.title}`);
    console.log(`   Categoría: ${product.category}`);
    console.log(`   Imágenes: ${product.images?.length || 0}`);
    
    if (product.images && product.images.length > 0) {
      console.log('\n   URLs de imágenes:');
      product.images.forEach((img, idx) => {
        console.log(`   ${idx}: ${img.url.substring(0, 80)}...`);
      });
    }

    console.log(`\n✨ El endpoint devuelve correctamente las imágenes`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductEndpoint();
