import { prisma } from '../src/lib/prisma.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function uploadImageToCloudinary(imagePath) {
  try {
    console.log(`📸 Subiendo imagen a Cloudinary: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`El archivo no existe: ${imagePath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'unpoquitovariado_jewelry');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME || 'dy73lxudf'}/image/upload`,
      { method: 'POST', body: form }
    );

    if (!response.ok) {
      throw new Error(`Error en Cloudinary: ${response.statusText}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.message);
    throw error;
  }
}

async function recoverProduct() {
  try {
    console.log('🔄 Reactivando producto "Anillo-1"...\n');

    // 1. Buscar el producto inactivo
    const existingProduct = await prisma.product.findFirst({
      where: { sku: 'anillo1' }
    });

    if (!existingProduct) {
      throw new Error('Producto no encontrado en la base de datos');
    }

    console.log(`✅ Producto encontrado (ID: ${existingProduct.id}, activo: ${existingProduct.active})\n`);

    // 2. Subir nueva imagen
    const imageUrl = await uploadImageToCloudinary('C:\\Users\\di_vi\\MiAppVentas\\frontend\\public\\images\\products\\joyeria\\img-anillo1.png');
    console.log(`✅ Imagen subida a Cloudinary\n`);

    // 3. Actualizar el producto
    console.log('📝 Actualizando producto...');
    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        title: 'Anillo-1',
        description: 'Anillo de acero bañado ajustable, Lindos y Variados modelos.',
        price: 6,
        originalPrice: 6,
        stock: 2,
        active: true,
        images: {
          deleteMany: {},
          create: {
            url: imageUrl,
            alt: 'Anillo-1',
            isPrimary: true,
            order: 0
          }
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    console.log('✅ Producto reactivado exitosamente!\n');
    console.log('📊 Detalles del producto recuperado:');
    console.log(`  ID: ${updatedProduct.id}`);
    console.log(`  SKU: ${updatedProduct.sku}`);
    console.log(`  Nombre: ${updatedProduct.title}`);
    console.log(`  Descripción: ${updatedProduct.description}`);
    console.log(`  Precio: $${updatedProduct.price}`);
    console.log(`  Stock: ${updatedProduct.stock}`);
    console.log(`  Estado: ${updatedProduct.active ? '✅ Activo' : '❌ Inactivo'}`);
    if (updatedProduct.images.length > 0) {
      console.log(`  Imagen: ${updatedProduct.images[0].url}`);
    }
    console.log(`\n✨ El producto ha sido recuperado completamente!\n`);

  } catch (error) {
    console.error('❌ Error durante la recuperación:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

recoverProduct();
