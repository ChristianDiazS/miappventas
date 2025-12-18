import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function uploadReferenceGames() {
  try {
    console.log('📦 Subiendo imágenes de juegos completos a Cloudinary...\n');

    const imagesDir = path.join(__dirname, '../../frontend/public/images/products/joyeria');
    
    // Archivos de juegos completos
    const gameImages = [
      'img-completo1.png',
      'img-completo2.png',
      'img-completo3.png',
      'img-completo4.png',
      'img-completo5.png',
      'img-completo6.png',
      'img-completo7.png'
    ];

    for (const fileName of gameImages) {
      const filePath = path.join(imagesDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${fileName}`);
        continue;
      }

      try {
        const publicId = fileName.replace(/\.[^.]+$/, ''); // Remove extension
        
        const result = await cloudinary.v2.uploader.upload(filePath, {
          public_id: publicId,
          folder: 'joyeria',
          overwrite: true,
          resource_type: 'auto'
        });

        console.log(`✅ ${fileName}`);
        console.log(`   URL: ${result.secure_url}\n`);
      } catch (error) {
        console.error(`❌ Error subiendo ${fileName}:`, error.message);
      }
    }

    console.log('✨ ¡Proceso completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

uploadReferenceGames();
