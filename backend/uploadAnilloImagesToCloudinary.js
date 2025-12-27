import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

const prisma = new PrismaClient();

async function uploadAnilloImagesToCloudinary() {
  try {
    console.log('🚀 Iniciando carga de imágenes de Anillo a Cloudinary...\n');

    const basePath = 'c:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Anillos';
    const folders = ['Anillo_Ajustable', 'Anillo_FantasíaFina'];

    let totalUploaded = 0;
    let totalUpdated = 0;

    for (const folder of folders) {
      const folderPath = path.join(basePath, folder);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Carpeta no encontrada: ${folderPath}`);
        continue;
      }

      const files = fs.readdirSync(folderPath).filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      console.log(`📁 ${folder}: ${files.length} imágenes encontradas\n`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(folderPath, file);

        try {
          // Subir a Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'miappventas/anillos',
            public_id: file.replace(/\.[^/.]+$/, ''),
            overwrite: true,
            resource_type: 'auto'
          });

          // Encontrar y actualizar el producto correspondiente
          const imageName = file.toLowerCase();
          let product = null;

          if (folder === 'Anillo_Ajustable') {
            // Buscar por SKU ANILLO-AJUSTABLE-X
            const match = imageName.match(/anillo[_-]?(\d+)/i);
            if (match) {
              const num = match[1];
              product = await prisma.product.findUnique({
                where: { sku: `ANILLO-AJUSTABLE-${num}` }
              });
            }
          } else if (folder === 'Anillo_FantasíaFina') {
            // Buscar por SKU ANILLO-FANTASIA-X
            const match = imageName.match(/anillo[_-]?fantasia[_-]?(\d+)/i);
            if (match) {
              const num = match[1];
              product = await prisma.product.findUnique({
                where: { sku: `ANILLO-FANTASIA-${num}` }
              });
            }
          }

          if (product) {
            // Actualizar el producto con la URL de Cloudinary
            await prisma.product.update({
              where: { id: product.id },
              data: { image: result.secure_url }
            });
            totalUpdated++;
          }

          totalUploaded++;
          const progress = ((i + 1) / files.length * 100).toFixed(0);
          console.log(`[${progress}%] ✅ ${file} → ${result.public_id}`);

        } catch (error) {
          console.log(`[❌] Error uploading ${file}: ${error.message}`);
        }
      }

      console.log(`\n✅ ${folder}: ${totalUploaded} imágenes subidas\n`);
    }

    console.log('\n=== RESUMEN ===');
    console.log(`📊 Total de imágenes subidas a Cloudinary: ${totalUploaded}`);
    console.log(`📊 Total de productos actualizados: ${totalUpdated}`);

    // Verificar estado final
    const anillosWithCloudinary = await prisma.product.findMany({
      where: {
        category: { name: 'Anillo' },
        active: true,
        image: { contains: 'cloudinary' }
      },
      select: { id: true, sku: true }
    });

    console.log(`\n✅ Anillos con imagen en Cloudinary: ${anillosWithCloudinary.length}/104`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

uploadAnilloImagesToCloudinary();
