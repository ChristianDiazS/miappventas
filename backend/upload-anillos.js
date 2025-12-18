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

async function uploadAnillos() {
  const anillosDir = path.join(__dirname, '../frontend/public/images/products/joyeria');
  
  // Filtrar solo archivos de anillos
  const anilloFiles = fs.readdirSync(anillosDir)
    .filter(file => file.startsWith('img-anillo') && /\.(png|jpg|jpeg)$/i.test(file))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  console.log(`Encontradas ${anilloFiles.length} imágenes de anillos\n`);

  const uploadedUrls = [];

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

      uploadedUrls.push({
        number: anilloNumber,
        filename: file,
        url: result.secure_url,
        publicId: result.public_id
      });

      console.log(`✓ ${file} subido correctamente`);
      console.log(`  URL: ${result.secure_url}\n`);
    } catch (error) {
      console.error(`✗ Error subiendo ${file}:`, error.message);
    }
  }

  // Guardar URLs en archivo
  const outputFile = path.join(__dirname, 'uploaded-anillos.json');
  fs.writeFileSync(outputFile, JSON.stringify(uploadedUrls, null, 2));
  console.log(`\n✅ Todas las imágenes han sido subidas. URLs guardadas en ${outputFile}`);

  return uploadedUrls;
}

uploadAnillos().catch(console.error);
