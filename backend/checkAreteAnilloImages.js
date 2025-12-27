import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAreteAnilloImages() {
  try {
    console.log('🔍 Verificando imágenes de Arete y Anillo en Cloudinary...\n');

    // Verificar Aretes
    console.log('=== ARETES ===');
    const aretes = await prisma.product.findMany({
      where: { category: { name: 'Arete' }, active: true },
      select: { id: true, sku: true, title: true, image: true },
      orderBy: { id: 'asc' },
      take: 10
    });

    console.log(`Total Aretes activos: ${await prisma.product.count({ where: { category: { name: 'Arete' }, active: true } })}\n`);
    
    if (aretes.length > 0) {
      console.log('Primeros 6 Aretes:');
      aretes.slice(0, 6).forEach(a => {
        const isCloudinary = a.image && a.image.includes('cloudinary');
        const icon = isCloudinary ? '✅' : '❌';
        console.log(`${icon} ${a.sku}: ${a.image ? a.image.substring(0, 60) + '...' : 'SIN IMAGEN'}`);
      });
    }

    // Verificar Anillos
    console.log('\n=== ANILLOS ===');
    const anillos = await prisma.product.findMany({
      where: { category: { name: 'Anillo' }, active: true },
      select: { id: true, sku: true, title: true, image: true },
      orderBy: { id: 'asc' },
      take: 10
    });

    const anilloCount = await prisma.product.count({ where: { category: { name: 'Anillo' }, active: true } });
    console.log(`Total Anillos activos: ${anilloCount}\n`);
    
    if (anillos.length > 0) {
      console.log('Primeros 6 Anillos:');
      anillos.slice(0, 6).forEach(a => {
        const isCloudinary = a.image && a.image.includes('cloudinary');
        const icon = isCloudinary ? '✅' : '❌';
        console.log(`${icon} ${a.sku}: ${a.image ? a.image.substring(0, 60) + '...' : 'SIN IMAGEN'}`);
      });
    }

    // Análisis general
    console.log('\n=== ANÁLISIS ===');
    
    const aretesCloudinary = aretes.filter(a => a.image && a.image.includes('cloudinary')).length;
    const anillosCloudinary = anillos.filter(a => a.image && a.image.includes('cloudinary')).length;

    console.log(`Aretes con Cloudinary: ${aretesCloudinary}/${aretes.length}`);
    console.log(`Anillos con Cloudinary: ${anillosCloudinary}/${anillos.length}`);

    // Verificar si todas las imágenes de Arete están en Cloudinary
    const allAretesCloudinary = await prisma.product.findMany({
      where: { 
        category: { name: 'Arete' }, 
        active: true,
        image: { not: null }
      },
      select: { image: true }
    });

    const aretesWithCloudinary = allAretesCloudinary.filter(a => a.image.includes('cloudinary')).length;
    console.log(`\n✅ Aretes con imagen en Cloudinary: ${aretesWithCloudinary}/${allAretesCloudinary.length}`);

    // Verificar si todas las imágenes de Anillo están en Cloudinary
    const allAnillosCloudinary = await prisma.product.findMany({
      where: { 
        category: { name: 'Anillo' }, 
        active: true,
        image: { not: null }
      },
      select: { image: true }
    });

    const anillosWithCloudinary = allAnillosCloudinary.filter(a => a.image.includes('cloudinary')).length;
    console.log(`✅ Anillos con imagen en Cloudinary: ${anillosWithCloudinary}/${allAnillosCloudinary.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAreteAnilloImages();
