import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDijeImages() {
  try {
    console.log('🔍 Verificando imágenes de Dijes...\n');

    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      take: 5
    });

    dijes.forEach((dije) => {
      console.log(`${dije.title}`);
      console.log(`  Image Path: ${dije.image}`);
      console.log(`  Full URL would be: http://localhost:5173${dije.image}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDijeImages();
