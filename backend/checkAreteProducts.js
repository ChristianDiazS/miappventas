import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAreteProducts() {
  try {
    console.log('🔍 Verificando productos Arete...\n');

    const aretes = await prisma.product.findMany({
      where: {
        category: { name: 'Arete' }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Total Aretes: ${aretes.length}\n`);

    aretes.forEach((arete, index) => {
      console.log(`${index + 1}. ID: ${arete.id} | ${arete.title} | SKU: ${arete.sku}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAreteProducts();
