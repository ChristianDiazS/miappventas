import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupCategoryHierarchy() {
  try {
    console.log('🔄 Configurando estructura jerárquica de categorías...\n');

    // Buscar Joyería (categoría principal)
    const joyeria = await prisma.category.findUnique({
      where: { name: 'Joyería' }
    });

    if (!joyeria) {
      console.log('❌ Categoría "Joyería" no encontrada');
      return;
    }

    console.log('✅ Encontrada categoría "Joyería" (ID: ' + joyeria.id + ')');

    // Subcategorías de Joyería
    const subcategorias = ['Anillo', 'Collar', 'Dije', 'Arete'];

    for (const subcat of subcategorias) {
      const category = await prisma.category.findUnique({
        where: { name: subcat }
      });

      if (category) {
        // Actualizar para que sea subcategoría de Joyería
        const updated = await prisma.category.update({
          where: { id: category.id },
          data: { parentId: joyeria.id }
        });
        console.log(`✅ "${subcat}" ahora es subcategoría de Joyería`);
      } else {
        console.log(`⚠️  Categoría "${subcat}" no encontrada`);
      }
    }

    console.log('\n✅ Estructura jerárquica configurada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupCategoryHierarchy();
