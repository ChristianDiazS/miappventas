import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAnilloFantasiaImages() {
  try {
    console.log('🔧 Actualizando imágenes de Anillos Fantasía a Cloudinary...\n');

    // Obtener todos los Anillos Fantasía
    const anillosFantasia = await prisma.product.findMany({
      where: { sku: { contains: 'FANTASIA' }, active: true },
      select: { id: true, sku: true }
    });

    console.log(`Total Anillos Fantasía: ${anillosFantasia.length}\n`);

    for (const anillo of anillosFantasia) {
      // Extraer número del SKU (ANILLO-FANTASIA-X)
      const match = anillo.sku.match(/FANTASIA-(\d+)/);
      if (match) {
        const num = match[1];
        const cloudinaryUrl = `https://res.cloudinary.com/dy73lxudf/image/upload/v1766767078/miappventas/anillos/img-anilloFantasía${num}.jpeg`;
        
        await prisma.product.update({
          where: { id: anillo.id },
          data: { image: cloudinaryUrl }
        });
        
        console.log(`✅ ${anillo.sku} → Actualizado con imagen de Cloudinary`);
      }
    }

    console.log(`\n✅ Actualización completada`);

    // Verificar estado final
    const anillosWithCloudinary = await prisma.product.findMany({
      where: {
        category: { name: 'Anillo' },
        active: true,
        image: { contains: 'cloudinary' }
      },
      select: { id: true, sku: true }
    });

    console.log(`\n📊 Anillos con imagen en Cloudinary: ${anillosWithCloudinary.length}/104`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAnilloFantasiaImages();
