import { prisma } from '../src/lib/prisma.js';

async function createCategories() {
  try {
    console.log('📦 Creando categorías de joyería...');

    const categories = [
      {
        name: 'Collar',
        slug: 'collar',
        description: 'Collares y cadenas personalizadas'
      },
      {
        name: 'Dije',
        slug: 'dije',
        description: 'Dijes decorativos para personalizar tus accesorios'
      },
      {
        name: 'Arete',
        slug: 'arete',
        description: 'Aretes y pendientes para completar tu look'
      }
    ];

    for (const cat of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug }
      });

      if (existing) {
        console.log(`✅ Categoría "${cat.name}" ya existe (ID: ${existing.id})`);
      } else {
        const created = await prisma.category.create({
          data: cat
        });
        console.log(`✅ Categoría "${cat.name}" creada (ID: ${created.id})`);
      }
    }

    console.log('✨ ¡Proceso completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCategories();
