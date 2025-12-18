import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dy73lxudf',
  api_key: process.env.CLOUDINARY_API_KEY || '198146914452834',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function deleteAnillos() {
  console.log('Iniciando eliminación de imágenes de anillos desde Cloudinary...\n');

  const publicIds = [];
  for (let i = 1; i <= 51; i++) {
    publicIds.push(`joyeria/anillos/img-anillo${i}`);
  }

  let deletedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < publicIds.length; i++) {
    const publicId = publicIds[i];
    const anilloNumber = i + 1;

    try {
      console.log(`[${anilloNumber}/51] Eliminando ${publicId}...`);
      
      const result = await cloudinary.v2.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`✓ ${publicId} eliminado correctamente\n`);
        deletedCount++;
      } else {
        console.log(`⚠ ${publicId} - Resultado: ${result.result}\n`);
        failedCount++;
      }
    } catch (error) {
      console.error(`✗ Error eliminando ${publicId}:`, error.message);
      failedCount++;
    }
  }

  console.log(`\n========== RESUMEN ==========`);
  console.log(`Eliminados correctamente: ${deletedCount}/51`);
  console.log(`Fallos: ${failedCount}/51`);
  console.log(`============================`);
}

deleteAnillos().catch(console.error);
