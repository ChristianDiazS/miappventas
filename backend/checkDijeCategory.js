import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDijeCategory() {
  try {
    console.log('🔍 Verificando productos en categoría Dije...\n');

    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      include: { category: true }
    });

    console.log(`Total productos en Dije: ${dijes.length}\n`);
    
    dijes.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - Type: ${product.type} - SKU: ${product.sku}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDijeCategory();
