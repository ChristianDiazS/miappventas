import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAnilloFantasia1() {
  try {
    console.log('🔍 Verificando producto ANILLO-FANTASIA-1...\n');

    const product = await prisma.product.findUnique({
      where: { sku: 'ANILLO-FANTASIA-1' },
      include: { category: true }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('✅ Producto encontrado:');
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Título: ${product.title}`);
    console.log(`   Categoría: ${product.category.name} (ID: ${product.categoryId})`);
    console.log(`   Precio: ${product.price}`);
    console.log(`   Stock: ${product.stock}`);
    console.log(`   Activo: ${product.active}`);
    console.log(`   Type: ${product.type}`);

    // Obtener todas las categorías para verificar
    console.log('\n📊 Todas las categorías:');
    const allCategories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });

    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });

    // Contar Anillos por categoría
    console.log('\n📈 Conteo de productos por categoría:');
    const anilloCategory = await prisma.category.findUnique({
      where: { name: 'Anillo' }
    });

    if (anilloCategory) {
      const anilloCount = await prisma.product.count({
        where: { categoryId: anilloCategory.id, active: true }
      });
      console.log(`   Anillo (activos): ${anilloCount}`);
    }

    const joyeriaCategory = await prisma.category.findUnique({
      where: { name: 'Joyería' }
    });

    if (joyeriaCategory) {
      const joyeriaCount = await prisma.product.count({
        where: { categoryId: joyeriaCategory.id, active: true }
      });
      console.log(`   Joyería (activos): ${joyeriaCount}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAnilloFantasia1();
