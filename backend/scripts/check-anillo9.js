import { prisma } from '../src/lib/prisma.js';

async function checkProduct() {
  try {
    const product = await prisma.product.findUnique({
      where: { sku: 'anillo9' }
    });

    if (product) {
      console.log('✅ Anillo-9 EXISTE en la base de datos:');
      console.log(JSON.stringify(product, null, 2));
    } else {
      console.log('❌ Anillo-9 NO existe en la base de datos');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
