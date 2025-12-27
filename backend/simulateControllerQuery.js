import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateControllerQuery() {
  try {
    console.log('🔍 Simulando la query del controlador...\n');

    const products = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      skip: 0,
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        images: true,
        features: true
      }
    });

    console.log('Primer producto:');
    console.log(JSON.stringify(products[0], null, 2));

    console.log('\n\nTienen el campo image:');
    products.forEach((p, i) => {
      console.log(`${i + 1}. image: ${p.image ? '✅ SÍ' : '❌ NO'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simulateControllerQuery();
