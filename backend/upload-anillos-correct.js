import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dy73lxudf',
  api_key: process.env.CLOUDINARY_API_KEY || '198146914452834',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function uploadAnillosCorrect() {
  const anillosDir = path.join(__dirname, '../frontend/public/images/products/joyeria');
  
  // Filtrar solo archivos de anillos (con mayúscula Anillo)
  const anilloFiles = fs.readdirSync(anillosDir)
    .filter(file => file.startsWith('img-Anillo') && /\.(jpeg|jpg|png)$/i.test(file))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  console.log(`Encontradas ${anilloFiles.length} imágenes de anillos\n`);

  let uploadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < anilloFiles.length; i++) {
    const file = anilloFiles[i];
    const filePath = path.join(anillosDir, file);
    const anilloNumber = parseInt(file.match(/\d+/)[0]);

    try {
      console.log(`[${i + 1}/${anilloFiles.length}] Subiendo ${file}...`);
      
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: 'joyeria/anillos',
        public_id: `img-anillo${anilloNumber}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      });

      console.log(`✓ ${file} subido correctamente`);
      console.log(`  URL: ${result.secure_url}\n`);
      uploadedCount++;
    } catch (error) {
      console.error(`✗ Error subiendo ${file}:`, error.message);
      failedCount++;
    }
  }

  console.log(`\n========== RESUMEN ==========`);
  console.log(`Subidos correctamente: ${uploadedCount}/${anilloFiles.length}`);
  console.log(`Fallos: ${failedCount}/${anilloFiles.length}`);
  console.log(`============================`);
}

uploadAnillosCorrect().catch(console.error);
