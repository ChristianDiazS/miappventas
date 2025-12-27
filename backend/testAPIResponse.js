import fetch from 'node-fetch';

async function testAPIResponse() {
  try {
    console.log('🔍 Consultando API...\n');

    const response = await fetch('http://localhost:5000/api/products?limit=30');
    const data = await response.json();

    const dijes = data.data.filter(p => p.category === 'Dije').slice(0, 3);

    console.log(`Dijes encontrados: ${dijes.length}\n`);

    dijes.forEach((dije, i) => {
      console.log(`${i + 1}. ${dije.title}`);
      console.log(`   image: ${dije.image}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPIResponse();
