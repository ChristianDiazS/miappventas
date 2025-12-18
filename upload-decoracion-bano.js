const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

const imageDir = path.join(__dirname, 'frontend/public/images/products/decoración-paraBaño');
const files = fs.readdirSync(imageDir).filter(file => 
  /\.(jpg|jpeg|png|gif)$/i.test(file)
);

async function uploadImages() {
  console.log(`\n========== INICIANDO UPLOAD DE DECORACIÓN PARA BAÑO ==========`);
  console.log(`Total de imágenes a subir: ${files.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imageDir, file);
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'decoracion-para-bano',
        public_id: path.parse(file).name,
        resource_type: 'auto'
      });

      console.log(`✅ [${i + 1}/${files.length}] ${file}`);
      console.log(`   URL: ${result.secure_url}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${i + 1}/${files.length}] Error al subir ${file}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n========== RESUMEN ==========`);
  console.log(`Subidos correctamente: ${successCount}/${files.length}`);
  console.log(`Fallos: ${failCount}/${files.length}`);
  console.log(`============================\n`);

  if (successCount === files.length) {
    console.log('✅ TODAS LAS IMÁGENES SE SUBIERON CORRECTAMENTE');
  }
}

uploadImages();
