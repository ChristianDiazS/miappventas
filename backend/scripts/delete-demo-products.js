import { prisma } from '../src/lib/prisma.js';

async function deleteProducts() {
  try {
    console.log('🗑️ Eliminando productos de demostración...\n');

    // IDs de los productos a eliminar
    const skusToDelete = [
      'MON-LG-27-4K-001',
      'KEY-RGB-MECH-001',
      'LOG-MX-MASTER-001',
      'DELL-XPS-13-001'
    ];

    for (const sku of skusToDelete) {
      const product = await prisma.product.findUnique({ where: { sku } });
      
      if (product) {
        console.log(`Eliminando relaciones para: ${sku}...`);
        
        // Eliminar imágenes
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        });

        // Eliminar características
        await prisma.productFeature.deleteMany({
          where: { productId: product.id }
        });

        // Eliminar items de inventario
        await prisma.inventoryItem.deleteMany({
          where: { productId: product.id }
        });

        // Eliminar reseñas
        await prisma.review.deleteMany({
          where: { productId: product.id }
        });

        // Eliminar items de órdenes
        await prisma.orderItem.deleteMany({
          where: { productId: product.id }
        });

        // Finalmente eliminar el producto
        await prisma.product.delete({
          where: { id: product.id }
        });

        console.log(`✅ Eliminado: ${sku} - ${product.title}`);
      } else {
        console.log(`⚠️ No encontrado: ${sku}`);
      }
    }

    console.log('\n✨ Productos de demostración eliminados exitosamente');

    // Mostrar productos restantes
    const remaining = await prisma.product.findMany({
      select: { id: true, sku: true, title: true, active: true },
      orderBy: { id: 'asc' }
    });

    console.log('\n📊 Productos restantes:');
    console.log(JSON.stringify(remaining, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteProducts();
