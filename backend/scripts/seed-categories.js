import { prisma } from '../src/lib/prisma.js';

async function seedCategories() {
  try {
    console.log('🌱 Iniciando seed de categorías...');

    const categories = [
      {
        name: 'Joyería',
        slug: 'joyeria',
        description: 'Joyas elegantes y sofisticadas: anillos, cadenas, pulseras, dijes, aretes y más'
      },
      {
        name: 'Arreglos Florales',
        slug: 'arreglos-florales',
        description: 'Hermosos arreglos florales para eventos, decoración y regalos especiales'
      },
      {
        name: 'Decoración para el Baño',
        slug: 'decoracion-bano',
        description: 'Accesorios y decoración moderna para transformar tu baño'
      }
    ];

    for (const category of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existing) {
        const created = await prisma.category.create({
          data: category
        });
        console.log(`✅ Categoría creada: ${created.name}`);
      } else {
        console.log(`⏭️  Categoría ya existe: ${existing.name}`);
      }
    }

    console.log('✨ Seed de categorías completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedCategories();
