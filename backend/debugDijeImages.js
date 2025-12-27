import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDijeImages() {
  try {
    console.log('🔍 Verificando datos completos de Dijes...\n');

    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      take: 3
    });

    dijes.forEach((dije) => {
      console.log(`ID: ${dije.id}`);
      console.log(`Title: ${dije.title}`);
      console.log(`Image: ${dije.image}`);
      console.log(`Image is null: ${dije.image === null}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugDijeImages();
