import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, active: true }
    });
    
    console.log('Total de categorías:', categories.length);
    console.log('\nCategorías:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug}, active: ${cat.active})`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
