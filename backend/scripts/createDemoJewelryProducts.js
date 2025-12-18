import { prisma } from '../src/lib/prisma.js';

async function createDemoJewelryProducts() {
  try {
    console.log('📦 Creando productos de demostración de joyería...\n');

    // Obtener IDs de categorías
    const collarCat = await prisma.category.findUnique({ where: { slug: 'collar' } });
    const dijeCat = await prisma.category.findUnique({ where: { slug: 'dije' } });
    const areteCat = await prisma.category.findUnique({ where: { slug: 'arete' } });

    if (!collarCat || !dijeCat || !areteCat) {
      console.error('❌ Las categorías no existen. Ejecuta createJewelryCategories.js primero');
      console.log('Categorías encontradas:', { collarCat, dijeCat, areteCat });
      process.exit(1);
    }

    // Productos de demostración
    const demoProducts = [
      // Collares
      {
        sku: 'COLLAR-001',
        title: 'Collar Dorado Elegante',
        description: 'Collar de oro 18k con diseño elegante y sofisticado',
        price: 89.99,
        stock: 5,
        categoryId: collarCat.id
      },
      {
        sku: 'COLLAR-002',
        title: 'Collar Plateado Moderno',
        description: 'Collar de plata 925 con cadena moderna',
        price: 59.99,
        stock: 8,
        categoryId: collarCat.id
      },
      {
        sku: 'COLLAR-003',
        title: 'Collar Rosado Delicado',
        description: 'Collar de oro rosado 18k con toque delicado',
        price: 79.99,
        stock: 6,
        categoryId: collarCat.id
      },

      // Dijes
      {
        sku: 'DIJE-001',
        title: 'Dije Corazón',
        description: 'Hermoso dije en forma de corazón',
        price: 24.99,
        stock: 10,
        categoryId: dijeCat.id
      },
      {
        sku: 'DIJE-002',
        title: 'Dije Inicial Personalizada',
        description: 'Dije con tu inicial grabada',
        price: 29.99,
        stock: 12,
        categoryId: dijeCat.id
      },
      {
        sku: 'DIJE-003',
        title: 'Dije Luna Brillante',
        description: 'Dije con diseño de luna con brillantes',
        price: 39.99,
        stock: 7,
        categoryId: dijeCat.id
      },

      // Aretes
      {
        sku: 'ARETE-001',
        title: 'Aretes Perla Clásicos',
        description: 'Aretes con perlas naturales',
        price: 44.99,
        stock: 9,
        categoryId: areteCat.id
      },
      {
        sku: 'ARETE-002',
        title: 'Aretes Cristal Brillantes',
        description: 'Aretes con cristal swarovski',
        price: 34.99,
        stock: 11,
        categoryId: areteCat.id
      },
      {
        sku: 'ARETE-003',
        title: 'Aretes Diamante Minimalista',
        description: 'Aretes minimalistas con diamantes de laboratorio',
        price: 54.99,
        stock: 5,
        categoryId: areteCat.id
      }
    ];

    for (const product of demoProducts) {
      const existing = await prisma.product.findFirst({
        where: { title: product.title }
      });

      if (existing) {
        console.log(`⏭️  Producto "${product.title}" ya existe`);
      } else {
        const created = await prisma.product.create({
          data: {
            sku: product.sku,
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId,
            active: true
          }
        });
        console.log(`✅ Creado: ${product.title} (ID: ${created.id})`);
      }
    }

    console.log('\n✨ ¡Proceso completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoJewelryProducts();
