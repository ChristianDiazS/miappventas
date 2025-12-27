import fetch from 'node-fetch';

async function testDijesAPI() {
  try {
    console.log('🔍 Consultando API de productos Dije...\n');

    const response = await fetch('http://localhost:5000/api/products?limit=1000');
    const data = await response.json();

    // Filtrar solo Dijes
    const dijes = data.data.filter(p => p.category === 'Dije');

    console.log(`Total Dijes en API: ${dijes.length}\n`);

    dijes.slice(0, 3).forEach((dije, index) => {
      console.log(`${index + 1}. ${dije.title}`);
      console.log(`   Image: ${dije.image}`);
      console.log(`   Es Cloudinary: ${dije.image?.includes('cloudinary') ? '✅ SÍ' : '❌ NO'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDijesAPI();
