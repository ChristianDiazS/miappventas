import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDijeImages() {
  try {
    console.log('🔍 Verificando campo image en Dijes...\n');

    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      select: {
        id: true,
        title: true,
        image: true,
        category: { select: { name: true } }
      },
      take: 5
    });

    dijes.forEach((dije) => {
      console.log(`ID: ${dije.id} | Title: ${dije.title}`);
      console.log(`  image field value: ${dije.image}`);
      console.log(`  image is null: ${dije.image === null}`);
      console.log(`  image trim: ${dije.image?.trim()}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugDijeImages();
