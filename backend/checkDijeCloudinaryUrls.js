import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDijeCloudinaryUrls() {
  try {
    console.log('🔍 Verificando URLs de Dijes después de subida a Cloudinary...\n');

    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      take: 5
    });

    console.log(`Total Dijes: ${dijes.length}\n`);

    dijes.forEach((dije, index) => {
      console.log(`${index + 1}. ${dije.title}`);
      console.log(`   Image: ${dije.image}`);
      console.log(`   Es Cloudinary: ${dije.image?.includes('cloudinary') ? '✅ SÍ' : '❌ NO'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDijeCloudinaryUrls();
