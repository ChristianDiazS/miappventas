import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAnilloFantasia1() {
  try {
    console.log('🔧 Corrigiendo categoría de ANILLO-FANTASIA-1...\n');

    // Obtener la categoría "Anillo"
    const anilloCategory = await prisma.category.findUnique({
      where: { name: 'Anillo' }
    });

    if (!anilloCategory) {
      console.log('❌ Categoría Anillo no encontrada');
      return;
    }

    // Actualizar el producto
    const updated = await prisma.product.update({
      where: { sku: 'ANILLO-FANTASIA-1' },
      data: {
        categoryId: anilloCategory.id,
        price: 5900  // Restaurar precio original si fue modificado
      },
      include: { category: true }
    });

    console.log('✅ Producto actualizado correctamente:');
    console.log(`   SKU: ${updated.sku}`);
    console.log(`   Título: ${updated.title}`);
    console.log(`   Categoría: ${updated.category.name} (ID: ${updated.categoryId})`);
    console.log(`   Precio: S/. ${updated.price}`);

    // Verificar conteo
    const anilloCount = await prisma.product.count({
      where: { categoryId: anilloCategory.id, active: true }
    });

    console.log(`\n📊 Total Anillos activos: ${anilloCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAnilloFantasia1();
