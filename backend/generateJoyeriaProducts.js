import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const imageBasePath = '../frontend/public/images/products/joyeria';

// Función para escanear carpetas y obtener imágenes
function scanImages(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error leyendo ${dirPath}:`, err.message);
    return [];
  }
}

// Función para agrupar imágenes por modelo
function groupImagesByModel(images, pattern) {
  const grouped = {};
  images.forEach(img => {
    const match = img.match(pattern);
    if (match) {
      const modelNum = match[1];
      if (!grouped[modelNum]) {
        grouped[modelNum] = [];
      }
      grouped[modelNum].push(img);
    }
  });
  return grouped;
}

async function generateProducts() {
  try {
    console.log('🔄 Iniciando generación de productos de joyería...\n');

    // Obtener categorías
    const anilloCategory = await prisma.category.findUnique({ where: { name: 'Anillo' } });
    const collarCategory = await prisma.category.findUnique({ where: { name: 'Collar' } });
    const dijeCategory = await prisma.category.findUnique({ where: { name: 'Dije' } });
    const areteCategory = await prisma.category.findUnique({ where: { name: 'Arete' } });

    if (!anilloCategory || !collarCategory || !dijeCategory || !areteCategory) {
      console.error('❌ Falta alguna categoría');
      return;
    }

    // ============================================
    // 1. ANILLOS AJUSTABLES (sin tallas)
    // ============================================
    console.log('📍 Procesando ANILLOS AJUSTABLES...');
    const anillosAjustablesPath = path.join(imageBasePath, 'Anillos', 'Anillo_Ajustable');
    const anillosAjustables = scanImages(anillosAjustablesPath);

    for (let i = 1; i <= anillosAjustables.length; i++) {
      const sku = `ANILLO-AJUSTABLE-${i}`;
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (!existing) {
        const imageName = anillosAjustables[i - 1];
        const imagePath = `/images/products/joyeria/Anillos/Anillo_Ajustable/${imageName}`;

        const product = await prisma.product.create({
          data: {
            sku,
            title: `Anillo Ajustable ${i}`,
            description: `Anillo ajustable modelo ${i}. Se adapta a cualquier tamaño sin necesidad de tallas específicas.`,
            price: 4900,
            categoryId: anilloCategory.id,
            stock: 3,
            image: imagePath,
            type: 'individual',
            comboItems: {
              collar: false,
              dije: false,
              arete: false,
              anillo: true
            },
            images: {
              create: [{
                url: imagePath,
                alt: `Anillo Ajustable ${i}`,
                isPrimary: true,
                order: 0
              }]
            }
          }
        });
        console.log(`  ✅ ${product.sku}`);
      }
    }

    // ============================================
    // 2. ANILLOS FANTASÍA (con tallas)
    // ============================================
    console.log('\n📍 Procesando ANILLOS FANTASÍA (con tallas)...');
    const anillosFantasiaPath = path.join(imageBasePath, 'Anillos', 'Anillo_FantasíaFina');
    const anillosFantasia = scanImages(anillosFantasiaPath);
    
    // Agrupar por modelo (sin la "b")
    const fantasyRings = groupImagesByModel(anillosFantasia, /anilloFantasía(\d+)([b]?)/i);

    let fantasyCounter = 1;
    for (const [modelNum, images] of Object.entries(fantasyRings)) {
      const sku = `ANILLO-FANTASIA-${modelNum}`;
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (!existing && fantasyCounter <= 53) {
        // Ordenar imágenes (la sin "b" primero, luego la con "b")
        const sortedImages = images.sort((a, b) => {
          const aHasB = a.includes('b.jpeg');
          const bHasB = b.includes('b.jpeg');
          return aHasB - bHasB;
        });

        const imagePaths = sortedImages.map(img => 
          `/images/products/joyeria/Anillos/Anillo_FantasíaFina/${img}`
        );

        const product = await prisma.product.create({
          data: {
            sku,
            title: `Anillo Fantasía ${modelNum}`,
            description: `Anillo fantasía modelo ${modelNum} disponible en tallas 17, 18, 19, 20, 21. Incluye 2 vistas del producto.`,
            price: 5900,
            categoryId: anilloCategory.id,
            stock: 5,
            image: imagePaths[0],
            type: 'individual',
            comboItems: {
              collar: false,
              dije: false,
              arete: false,
              anillo: true
            },
            sizes: JSON.stringify(['17', '18', '19', '20', '21']),
            images: {
              create: imagePaths.map((url, idx) => ({
                url,
                alt: `Anillo Fantasía ${modelNum} - Vista ${idx + 1}`,
                isPrimary: idx === 0,
                order: idx
              }))
            }
          }
        });
        console.log(`  ✅ ${product.sku} (${sortedImages.length} imágenes)`);
        fantasyCounter++;
      }
    }

    // ============================================
    // 3. COLLARES SOLO
    // ============================================
    console.log('\n📍 Procesando COLLARES SOLO...');
    const collarSoloPath = path.join(imageBasePath, 'Collar', 'Collar solo');
    const collaresSolo = scanImages(collarSoloPath);

    for (let i = 1; i <= collaresSolo.length; i++) {
      const sku = `COLLAR-SOLO-${i}`;
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (!existing) {
        const imageName = collaresSolo[i - 1];
        const imagePath = `/images/products/joyeria/Collar/Collar solo/${imageName}`;

        const product = await prisma.product.create({
          data: {
            sku,
            title: `Collar Solo ${i}`,
            description: `Collar elegante modelo ${i}. Perfecto para usar solo o combinar con otros accesorios.`,
            price: 7900,
            categoryId: collarCategory.id,
            stock: 4,
            image: imagePath,
            type: 'individual',
            comboItems: {
              collar: true,
              dije: false,
              arete: false,
              anillo: false
            },
            images: {
              create: [{
                url: imagePath,
                alt: `Collar Solo ${i}`,
                isPrimary: true,
                order: 0
              }]
            }
          }
        });
        console.log(`  ✅ ${product.sku}`);
      }
    }

    // ============================================
    // 4. COLLARES + DIJE (COMBO)
    // ============================================
    console.log('\n📍 Procesando COLLARES + DIJE (COMBOS)...');
    const collarDijePath = path.join(imageBasePath, 'Collar', 'Collar+Dije');
    const collaresDije = scanImages(collarDijePath);

    for (let i = 1; i <= collaresDije.length; i++) {
      const sku = `COMBO-COLLAR-DIJE-${i}`;
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (!existing) {
        const imageName = collaresDije[i - 1];
        const imagePath = `/images/products/joyeria/Collar/Collar+Dije/${imageName}`;

        const product = await prisma.product.create({
          data: {
            sku,
            title: `🎁 Collar + Dije Combo ${i}`,
            description: `Hermoso combo que incluye un collar elegante con un dije coordinado. Este juego no se puede separar - los dos productos van juntos.`,
            price: 13900,
            categoryId: collarCategory.id,
            stock: 5,
            image: imagePath,
            type: 'combo',
            comboItems: {
              collar: true,
              dije: true,
              arete: false,
              anillo: false
            },
            images: {
              create: [{
                url: imagePath,
                alt: `Collar + Dije Combo ${i}`,
                isPrimary: true,
                order: 0
              }]
            }
          }
        });
        console.log(`  ✅ ${product.sku} (Collar + Dije incluido)`);
      }
    }

    // ============================================
    // 5. COLLARES + DIJE + ARETE (COMBO DELUXE)
    // ============================================
    console.log('\n📍 Procesando COLLARES + DIJE + ARETE (COMBOS DELUXE)...');
    const collarDijeAretePath = path.join(imageBasePath, 'Collar', 'Collar+Dije+Arete');
    const collaresDijeArete = scanImages(collarDijeAretePath);

    for (let i = 1; i <= collaresDijeArete.length; i++) {
      const sku = `COMBO-COLLAR-DIJE-ARETE-${i}`;
      const existing = await prisma.product.findUnique({ where: { sku } });

      if (!existing) {
        const imageName = collaresDijeArete[i - 1];
        const imagePath = `/images/products/joyeria/Collar/Collar+Dije+Arete/${imageName}`;

        const product = await prisma.product.create({
          data: {
            sku,
            title: `🎁 Collar + Dije + Arete Combo Deluxe ${i}`,
            description: `Conjunto completo de joyería que incluye collar, dije y aretes coordinados. Este combo deluxe está diseñado para verse perfecto junto - todos los elementos van como un juego.`,
            price: 21900,
            categoryId: collarCategory.id,
            stock: 3,
            image: imagePath,
            type: 'combo',
            comboItems: {
              collar: true,
              dije: true,
              arete: true,
              anillo: false
            },
            images: {
              create: [{
                url: imagePath,
                alt: `Collar + Dije + Arete Combo Deluxe ${i}`,
                isPrimary: true,
                order: 0
              }]
            }
          }
        });
        console.log(`  ✅ ${product.sku} (Collar + Dije + Arete incluido)`);
      }
    }

    console.log('\n✅ ¡Generación completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`  • Anillos Ajustables: ${anillosAjustables.length}`);
    console.log(`  • Anillos Fantasía: ${Object.keys(fantasyRings).length}`);
    console.log(`  • Collares Solo: ${collaresSolo.length}`);
    console.log(`  • Combos Collar+Dije: ${collaresDije.length}`);
    console.log(`  • Combos Collar+Dije+Arete: ${collaresDijeArete.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateProducts();
