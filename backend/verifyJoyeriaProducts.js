import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyProducts() {
  try {
    console.log('📊 Verificando productos de joyería...\n');

    // Contar productos por tipo
    const anillosAjustables = await prisma.product.count({
      where: { sku: { contains: 'ANILLO-AJUSTABLE' } }
    });

    const anillosFantasia = await prisma.product.count({
      where: { sku: { contains: 'ANILLO-FANTASIA' } }
    });

    const collaresSolo = await prisma.product.count({
      where: { sku: { contains: 'COLLAR-SOLO' } }
    });

    const collarDije = await prisma.product.count({
      where: { sku: { contains: 'COMBO-COLLAR-DIJE-' } }
    });

    const collarDijeArete = await prisma.product.count({
      where: { sku: { contains: 'COMBO-COLLAR-DIJE-ARETE' } }
    });

    console.log('✅ Resumen de productos creados:');
    console.log(`  • Anillos Ajustables: ${anillosAjustables}`);
    console.log(`  • Anillos Fantasía: ${anillosFantasia}`);
    console.log(`  • Collares Solo: ${collaresSolo}`);
    console.log(`  • Combos Collar + Dije: ${collarDije}`);
    console.log(`  • Combos Collar + Dije + Arete: ${collarDijeArete}`);
    console.log(`\n📈 TOTAL: ${anillosAjustables + anillosFantasia + collaresSolo + collarDije + collarDijeArete} productos\n`);

    // Mostrar algunos ejemplos
    console.log('📋 Ejemplos de productos:');
    
    const anilloAjustable = await prisma.product.findFirst({
      where: { sku: { contains: 'ANILLO-AJUSTABLE' } },
      include: { images: true }
    });
    if (anilloAjustable) {
      console.log(`\n  ✓ ${anilloAjustable.title}`);
      console.log(`    - Tipo: ${anilloAjustable.type}`);
      console.log(`    - Precio: S/. ${(anilloAjustable.price / 100).toFixed(2)}`);
      console.log(`    - Imágenes: ${anilloAjustable.images.length}`);
      console.log(`    - Stock: ${anilloAjustable.stock}`);
    }

    const anilloFantasiaExample = await prisma.product.findFirst({
      where: { sku: { contains: 'ANILLO-FANTASIA' } },
      include: { images: true }
    });
    if (anilloFantasiaExample) {
      console.log(`\n  ✓ ${anilloFantasiaExample.title}`);
      console.log(`    - Tipo: ${anilloFantasiaExample.type}`);
      console.log(`    - Precio: S/. ${(anilloFantasiaExample.price / 100).toFixed(2)}`);
      console.log(`    - Imágenes: ${anilloFantasiaExample.images.length}`);
      console.log(`    - Tallas: ${anilloFantasiaExample.sizes}`);
      console.log(`    - Stock: ${anilloFantasiaExample.stock}`);
    }

    const comboExample = await prisma.product.findFirst({
      where: { type: 'combo' }
    });
    if (comboExample) {
      console.log(`\n  ✓ ${comboExample.title}`);
      console.log(`    - Tipo: ${comboExample.type}`);
      console.log(`    - Precio: S/. ${(comboExample.price / 100).toFixed(2)}`);
      console.log(`    - Incluye: ${JSON.stringify(comboExample.comboItems)}`);
      console.log(`    - Stock: ${comboExample.stock}`);
    }

    console.log('\n✅ Verificación completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProducts();
