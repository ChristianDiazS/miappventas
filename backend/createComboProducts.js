import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createComboProducts() {
  try {
    console.log('🔄 Creando productos combinados (combos)...\n');

    // Buscar categoría Collar
    const collarCategory = await prisma.category.findUnique({
      where: { name: 'Collar' }
    });

    if (!collarCategory) {
      console.log('❌ Categoría Collar no encontrada');
      return;
    }

    // Crear algunos productos combo
    const combos = [
      {
        sku: 'COMBO-001',
        title: 'Collar Premium + Dije Dorado',
        description: 'Hermoso collar con dije dorado incluido. Este juego no se puede separar.',
        price: 15900, // S/. 159.00
        categoryId: collarCategory.id,
        stock: 5,
        type: 'combo',
        comboItems: {
          collar: true,
          dije: true,
          arete: false,
          anillo: false
        }
      },
      {
        sku: 'COMBO-002',
        title: 'Juego Completo: Collar + Dije + Aretes',
        description: 'Juego completo que incluye collar elegante, dije plateado y un par de aretes. Perfectos para completar tu look.',
        price: 25900, // S/. 259.00
        categoryId: collarCategory.id,
        stock: 3,
        type: 'combo',
        comboItems: {
          collar: true,
          dije: true,
          arete: true,
          anillo: false
        }
      },
      {
        sku: 'COLLAR-001',
        title: 'Collar Elegante Individual',
        description: 'Collar de plata elegante que puedes combinar con otros accesorios.',
        price: 8900, // S/. 89.00
        categoryId: collarCategory.id,
        stock: 10,
        type: 'individual',
        comboItems: {
          collar: true,
          dije: false,
          arete: false,
          anillo: false
        }
      }
    ];

    for (const combo of combos) {
      const existing = await prisma.product.findUnique({
        where: { sku: combo.sku }
      });

      if (!existing) {
        const product = await prisma.product.create({
          data: {
            ...combo,
            comboItems: combo.comboItems // JSON se guarda automáticamente
          }
        });
        console.log(`✅ Creado: ${product.title} (${product.sku})`);
      } else {
        console.log(`⚠️  ${combo.sku} ya existe`);
      }
    }

    console.log('\n✅ Productos combinados creados exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createComboProducts();
