import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.category.delete({
      where: { name: 'Peluches' }
    });
    
    console.log('Categoría eliminada:', result.name);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
