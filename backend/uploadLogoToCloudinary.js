import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function uploadLogo() {
  try {
    const logoPath = path.join(__dirname, '../frontend/public/images/logo/Logo-UnPoquitoVariado.png');
    
    console.log('Subiendo logo a Cloudinary...');
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'joyeria',
      public_id: 'logo-unpoquito-variado',
      resource_type: 'auto'
    });

    console.log('✅ Logo subido exitosamente!');
    console.log('URL del logo:', result.secure_url);
    console.log('\nPara hacer transparente el fondo, usa esta URL:');
    console.log(result.secure_url.replace('/upload/', '/upload/e_background_removal/'));
    
  } catch (error) {
    console.error('❌ Error al subir el logo:', error);
  }
}

uploadLogo();
