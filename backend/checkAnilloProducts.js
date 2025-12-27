import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnilloProducts() {
  try {
    console.log('🔍 Verificando productos Anillo...\n');

    const anillos = await prisma.product.findMany({
      where: {
        category: { name: 'Anillo' }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Total Anillos: ${anillos.length}\n`);

    // Agrupar por tipo
    const ajustables = anillos.filter(a => a.sku.includes('AJUSTABLE'));
    const fantasia = anillos.filter(a => a.sku.includes('FANTASIA'));

    console.log(`Anillos Ajustables: ${ajustables.length}`);
    console.log(`Anillos Fantasía: ${fantasia.length}\n`);

    console.log('Primeros 5 Anillos:');
    anillos.slice(0, 5).forEach((anillo, index) => {
      console.log(`${index + 1}. ${anillo.title} | SKU: ${anillo.sku}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAnilloProducts();
