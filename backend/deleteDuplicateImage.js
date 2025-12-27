import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dy73lxudf',
  api_key: '198146914452834',
  api_secret: 'AbBA4lLDIa84W1iUAHDeWwyz2eE'
});

async function deleteDuplicateImage() {
  try {
    console.log('🗑️  Eliminando imagen duplicada de Cloudinary...\n');

    const result = await cloudinary.uploader.destroy('miappventas/dijes/img-dije22');

    console.log('✅ Resultado de eliminación:', result);
    console.log('\n✨ Imagen eliminada correctamente de Cloudinary');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteDuplicateImage();
