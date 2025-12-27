import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateAnilloTallas() {
  try {
    console.log('🔄 Actualizando tallas de Anillos Fantasía...\n');

    // Actualizar todos los Anillos Fantasía
    const result = await prisma.product.updateMany({
      where: {
        sku: { contains: 'FANTASIA' }
      },
      data: {
        sizes: JSON.stringify(['17', '18', '19', '20', '21']),
        description: 'Anillo fantasía disponible en tallas 17, 18, 19, 20, 21. Incluye 2 vistas del producto.'
      }
    });

    console.log(`✅ Actualización completada`);
    console.log(`📊 Anillos Fantasía actualizados: ${result.count}`);

    // Verificar algunos productos
    const updated = await prisma.product.findMany({
      where: { sku: { contains: 'FANTASIA' } },
      select: { id: true, sku: true, title: true, sizes: true },
      take: 5
    });

    console.log('\n📋 Verificación de primeros 5 productos:');
    updated.forEach(p => {
      const parsedSizes = JSON.parse(p.sizes || '[]');
      console.log(`- ${p.sku}: Tallas = [${parsedSizes.join(', ')}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAnilloTallas();
