import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCloudinaryImages() {
  try {
    console.log('🔍 Verificando imágenes en Cloudinary...\n');

    // Obtener combos Collar + Dije + Arete
    const comboDeluxe = await prisma.product.findMany({
      where: {
        title: { contains: 'Collar + Dije + Arete' }
      },
      take: 2
    });

    // Obtener combos Collar + Dije
    const comboDije = await prisma.product.findMany({
      where: {
        title: { contains: 'Collar + Dije' },
        NOT: { title: { contains: 'Arete' } }
      },
      take: 2
    });

    // Obtener Collares solo
    const collares = await prisma.product.findMany({
      where: {
        category: { name: 'Collar' }
      },
      take: 2
    });

    console.log('=== COMBO COLLAR + DIJE + ARETE ===');
    comboDeluxe.forEach(p => {
      console.log(`${p.title}`);
      console.log(`URL: ${p.image}`);
      console.log(`Es Cloudinary: ${p.image?.includes('cloudinary') ? '✅ SÍ' : '❌ NO'}\n`);
    });

    console.log('\n=== COMBO COLLAR + DIJE ===');
    comboDije.forEach(p => {
      console.log(`${p.title}`);
      console.log(`URL: ${p.image}`);
      console.log(`Es Cloudinary: ${p.image?.includes('cloudinary') ? '✅ SÍ' : '❌ NO'}\n`);
    });

    console.log('\n=== COLLARES SOLO ===');
    collares.forEach(p => {
      console.log(`${p.title}`);
      console.log(`URL: ${p.image}`);
      console.log(`Es Cloudinary: ${p.image?.includes('cloudinary') ? '✅ SÍ' : '❌ NO'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCloudinaryImages();
