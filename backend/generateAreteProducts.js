import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function generateAreteProducts() {
  try {
    console.log('🔄 Generando productos Arete desde las imágenes...\n');

    // Obtener la categoría Arete
    let areteCategory = await prisma.category.findFirst({
      where: { name: 'Arete' }
    });

    if (!areteCategory) {
      console.error('❌ No se encontró la categoría Arete');
      return;
    }

    console.log(`✅ Categoría encontrada: ${areteCategory.name} (ID: ${areteCategory.id})\n`);

    // Ruta de las imágenes
    const aretesImageDir = 'C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Aretes';
    
    // Leer archivos de imagen
    const files = fs.readdirSync(aretesImageDir).filter(f => f.startsWith('img-arete') && f.endsWith('.jpeg')).sort();
    
    console.log(`📷 Se encontraron ${files.length} imágenes de aretes\n`);

    // Eliminar aretes existentes
    const deletedCount = await prisma.product.deleteMany({
      where: { categoryId: areteCategory.id }
    });
    console.log(`🗑️  ${deletedCount.count} aretes anteriores eliminados\n`);

    // Subir imágenes a Cloudinary y crear productos
    console.log('📸 Subiendo imágenes a Cloudinary y creando productos...\n');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(aretesImageDir, file);
      const numero = i + 1;

      try {
        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `miappventas/aretes`,
          public_id: file.replace(/\.[^/.]+$/, ''),
          resource_type: 'auto'
        });

        const cloudinaryUrl = result.secure_url;

        // Crear producto
        const arete = await prisma.product.create({
          data: {
            sku: `ARETE-${numero}`,
            title: `Arete Diseño ${numero}`,
            description: `Hermoso arete elegante. Disponible en diferentes diseños y materiales. Perfecto para completar tu look.`,
            price: 2900,
            originalPrice: null,
            stock: 10,
            categoryId: areteCategory.id,
            image: cloudinaryUrl,
            type: 'individual',
            active: true
          }
        });

        console.log(`✅ ${numero}/6 - ${arete.title}`);
        console.log(`   URL: ${cloudinaryUrl}\n`);

      } catch (uploadError) {
        console.error(`   ❌ Error subiendo ${file}:`, uploadError.message);
      }
    }

    console.log(`\n✨ ¡Se crearon 6 productos Arete exitosamente!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateAreteProducts();
