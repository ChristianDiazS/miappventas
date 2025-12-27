import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDijeProduct() {
  try {
    console.log('🗑️  Eliminando producto Dije con imagen eliminada...\n');

    const result = await prisma.product.delete({
      where: { id: 238 }
    });

    console.log(`✅ Producto eliminado:`);
    console.log(`   Título: ${result.title}`);
    console.log(`   ID: ${result.id}`);
    console.log(`\n✨ El card desaparecerá al recargar la página`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDijeProduct();
