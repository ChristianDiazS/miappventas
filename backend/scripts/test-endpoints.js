import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('🧪 Testando endpoints...\n');

  try {
    // Test 1: GET /api/products (público)
    console.log('1️⃣  Testeando GET /api/products (público)...');
    const res1 = await fetch('http://localhost:5000/api/products');
    const data1 = await res1.json();
    console.log('✅ Respuesta:');
    if (data1.data && data1.data.length > 0) {
      console.log('   Primer producto:');
      console.log(`   - ID: ${data1.data[0].id}`);
      console.log(`   - Title: ${data1.data[0].title}`);
      console.log(`   - Category: ${data1.data[0].category} (tipo: ${typeof data1.data[0].category})`);
      console.log(`   - Image: ${data1.data[0].image}`);
    }

    // Test 2: GET /api/products/admin/all (requiere auth)
    console.log('\n2️⃣  Testeando GET /api/products/admin/all (requiere token)...');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AdW5wb3F1aXRvdmFyaWFkby5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MzQ0MjQzMjUsImV4cCI6MTczNDUxMDcyNX0.VvqVKsLVlDWQfgAGpH7vqTzOLEWgW1Dj2DVGXiAVxnY';
    const res2 = await fetch('http://localhost:5000/api/products/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data2 = await res2.json();
    if (res2.ok) {
      console.log('✅ Respuesta:');
      if (data2.data && data2.data.length > 0) {
        console.log('   Primer producto:');
        console.log(`   - ID: ${data2.data[0].id}`);
        console.log(`   - Title: ${data2.data[0].title}`);
        console.log(`   - Category: ${JSON.stringify(data2.data[0].category)} (tipo: ${typeof data2.data[0].category})`);
        console.log(`   - Image: ${data2.data[0].image}`);
        console.log(`   - Active: ${data2.data[0].active}`);
      }
    } else {
      console.log('❌ Error:', res2.status, data2);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoints();
