import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    // Obtener todos los productos con anillo en el título
    const anillos = await prisma.product.findMany({
      where: {
        title: { contains: 'Anillo' }
      },
      orderBy: { title: 'asc' },
      select: { title: true, active: true, images: { select: { url: true } } }
    });
    
    console.log(`Total de Anillos: ${anillos.length}\n`);
    anillos.forEach(a => {
      console.log(`${a.title}: active=${a.active}, images=${a.images.length}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
