import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDijeWithImage22() {
  try {
    console.log('🔍 Buscando producto Dije con img-dije22...\n');

    const dije = await prisma.product.findFirst({
      where: {
        category: { name: 'Dije' },
        image: { contains: 'img-dije22' }
      }
    });

    if (dije) {
      console.log(`✅ Encontrado:`);
      console.log(`   ID: ${dije.id}`);
      console.log(`   Título: ${dije.title}`);
      console.log(`   Image: ${dije.image}`);
    } else {
      console.log('❌ No se encontró producto con img-dije22');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findDijeWithImage22();
