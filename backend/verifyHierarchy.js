import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyHierarchy() {
  try {
    // Obtener Joyería con sus subcategorías
    const joyeria = await prisma.category.findUnique({
      where: { name: 'Joyería' },
      include: {
        children: true
      }
    });

    console.log('Joyería:', joyeria);
    console.log('\nSubcategorías:', joyeria?.children || []);

    // Verificar categorías Collar, Dije, Arete
    const categorias = await prisma.category.findMany({
      where: { name: { in: ['Collar', 'Dije', 'Arete'] } },
      select: { id: true, name: true, parentId: true }
    });

    console.log('\nCategorías individuales:', categorias);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyHierarchy();
