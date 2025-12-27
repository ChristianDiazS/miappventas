const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configurar credenciales de Cloudinary
cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

const imagesDir = path.join(__dirname, 'frontend/public/images/products/joyeria/Collar/Collar+Dije+Arete');
const cloudinaryFolder = 'miappventas/collar-dije-arete';

async function uploadImages() {
  try {
    console.log('🚀 Iniciando carga de imágenes a Cloudinary...\n');

    // Leer archivos del directorio
    const files = fs.readdirSync(imagesDir);
    
    // Filtrar solo archivos -dije.jpeg y -arete.jpeg
    const filesToUpload = files.filter(file => 
      file.endsWith('-dije.jpeg') || file.endsWith('-arete.jpeg')
    );

    console.log(`📁 Encontrados ${filesToUpload.length} archivos para subir:\n`);
    filesToUpload.forEach(file => console.log(`  - ${file}`));
    console.log('\n');

    let successCount = 0;
    let failureCount = 0;

    // Subir cada archivo
    for (const file of filesToUpload) {
      const filePath = path.join(imagesDir, file);
      const publicId = path.basename(file, '.jpeg');

      try {
        console.log(`⏳ Subiendo: ${file}...`);
        
        const result = await cloudinary.uploader.upload(filePath, {
          folder: cloudinaryFolder,
          public_id: publicId,
          resource_type: 'auto',
          overwrite: true,
          quality: 'auto'
        });

        console.log(`✅ Éxito: ${file}`);
        console.log(`   URL: ${result.secure_url}\n`);
        successCount++;

      } catch (error) {
        console.log(`❌ Error al subir ${file}: ${error.message}\n`);
        failureCount++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE CARGA');
    console.log('='.repeat(60));
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Fallidos: ${failureCount}`);
    console.log(`📦 Total: ${successCount + failureCount}\n`);

    if (failureCount === 0) {
      console.log('🎉 ¡Todas las imágenes se subieron correctamente!');
    } else {
      console.log('⚠️  Algunas imágenes fallaron. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

uploadImages();
