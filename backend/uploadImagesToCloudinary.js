import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function uploadImagesToCloudinary() {
  try {
    console.log('🚀 Iniciando carga de imágenes a Cloudinary...\n');

    // 1. Subir imágenes de Collar + Dije + Arete
    console.log('📸 Subiendo imágenes de Collar + Dije + Arete...');
    await uploadComboImages(
      'C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Collar\\Collar+Dije+Arete',
      'collar-dije-arete',
      'Collar + Dije + Arete Combo Deluxe'
    );

    // 2. Subir imágenes de Collar + Dije
    console.log('\n📸 Subiendo imágenes de Collar + Dije...');
    await uploadComboImages(
      'C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Collar\\Collar+Dije',
      'collar-dije',
      'Collar + Dije'
    );

    // 3. Subir imágenes de Dijes individuales
    console.log('\n📸 Subiendo imágenes de Dijes individuales...');
    await uploadComboImages(
      'C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\Dijes',
      'dijes',
      'Dije Diseño'
    );

    console.log('\n✅ ¡Todas las imágenes se han subido exitosamente a Cloudinary!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function uploadComboImages(dirPath, folderName, productTitleFilter) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Carpeta no encontrada: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
    
    console.log(`   Encontradas ${files.length} imágenes\n`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dirPath, file);
      const fileNumber = i + 1;

      try {
        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `miappventas/${folderName}`,
          public_id: file.replace(/\.[^/.]+$/, ''),
          resource_type: 'auto'
        });

        const cloudinaryUrl = result.secure_url;

        // Actualizar en base de datos según el tipo
        if (folderName === 'collar-dije-arete') {
          await prisma.product.updateMany({
            where: {
              title: { contains: 'Collar + Dije + Arete' },
              image: { contains: file }
            },
            data: { image: cloudinaryUrl }
          });
        } else if (folderName === 'collar-dije') {
          await prisma.product.updateMany({
            where: {
              title: 'Collar + Dije',
              image: { contains: file }
            },
            data: { image: cloudinaryUrl }
          });
        } else if (folderName === 'dijes') {
          await prisma.product.updateMany({
            where: {
              title: { contains: 'Dije Diseño' },
              image: { contains: file }
            },
            data: { image: cloudinaryUrl }
          });
        }

        console.log(`   ✅ ${fileNumber}/${files.length} - ${file}`);
        console.log(`      URL: ${cloudinaryUrl}`);

      } catch (uploadError) {
        console.error(`   ❌ Error subiendo ${file}:`, uploadError.message);
      }
    }

  } catch (error) {
    console.error(`Error procesando carpeta ${dirPath}:`, error.message);
  }
}

uploadImagesToCloudinary();
