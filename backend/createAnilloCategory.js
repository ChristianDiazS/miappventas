import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAnilloCategory() {
  try {
    console.log('🔄 Creando categoría "Anillo" como subcategoría de Joyería...\n');

    // Buscar Joyería
    const joyeria = await prisma.category.findUnique({
      where: { name: 'Joyería' }
    });

    if (!joyeria) {
      console.log('❌ Categoría "Joyería" no encontrada');
      return;
    }

    // Verificar si Anillo ya existe
    const anilloExistente = await prisma.category.findUnique({
      where: { name: 'Anillo' }
    });

    if (anilloExistente) {
      console.log('⚠️  Anillo ya existe. Actualizando parentId...');
      const updated = await prisma.category.update({
        where: { id: anilloExistente.id },
        data: { parentId: joyeria.id }
      });
      console.log(`✅ Anillo ahora es subcategoría de Joyería`);
      return;
    }

    // Crear Anillo como subcategoría
    const anillo = await prisma.category.create({
      data: {
        name: 'Anillo',
        slug: 'anillo',
        description: 'Anillos elegantes y sofisticados para completar tu look',
        parentId: joyeria.id,
        active: true
      }
    });

    console.log('✅ Categoría "Anillo" creada exitosamente');
    console.log(`   ID: ${anillo.id}`);
    console.log(`   Nombre: ${anillo.name}`);
    console.log(`   ParentID: ${anillo.parentId}`);
    console.log(`   Slug: ${anillo.slug}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAnilloCategory();
