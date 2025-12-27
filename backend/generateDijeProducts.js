import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateDijeProducts() {
  try {
    console.log('🔄 Generando productos Dije desde las imágenes...\n');

    // Obtener la categoría Dije
    let dijeCategory = await prisma.category.findFirst({
      where: { name: 'Dije' }
    });

    if (!dijeCategory) {
      console.error('❌ No se encontró la categoría Dije');
      return;
    }

    console.log(`✅ Categoría encontrada: ${dijeCategory.name} (ID: ${dijeCategory.id})\n`);

    // Ruta de las imágenes
    const dijesImageDir = 'C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Dijes';
    
    // Leer archivos de imagen
    const files = fs.readdirSync(dijesImageDir);
    const dijeImages = files.filter(f => f.startsWith('img-dije') && f.endsWith('.jpeg')).sort();

    console.log(`📷 Se encontraron ${dijeImages.length} imágenes de dijes\n`);

    // Eliminar dijes existentes
    await prisma.product.deleteMany({
      where: { categoryId: dijeCategory.id }
    });
    console.log('🗑️  Dijes anteriores eliminados\n');

    // Crear nuevos productos Dije
    for (let i = 0; i < dijeImages.length; i++) {
      const numero = i + 1;
      const imagePath = `/images/products/joyeria/Dijes/${dijeImages[i]}`;
      
      const dije = await prisma.product.create({
        data: {
          sku: `DIJE-${numero}`,
          title: `Dije Diseño ${numero}`,
          description: `Hermoso dije en forma de letra. Disponible en diferentes diseños y materiales. Perfecto para crear tu combo personalizado.`,
          price: 4900,
          originalPrice: null,
          stock: 10,
          categoryId: dijeCategory.id,
          image: imagePath,
          type: 'individual',
          active: true
        }
      });

      console.log(`✅ ${numero}. ${dije.title} - ${imagePath}`);
    }

    console.log(`\n✨ ¡Se crearon ${dijeImages.length} productos Dije exitosamente!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateDijeProducts();
