import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDijeImages() {
  try {
    console.log('🔄 Buscando productos tipo Dije...\n');

    // Obtener todos los productos con categoría Dije
    const dijes = await prisma.product.findMany({
      where: {
        category: { name: 'Dije' }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Encontrados ${dijes.length} Dijes\n`);
    
    dijes.forEach((dije, index) => {
      console.log(`${index + 1}. ${dije.title} - Image: ${dije.image}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateDijeImages();
