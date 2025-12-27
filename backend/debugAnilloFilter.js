import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugAnilloFilter() {
  try {
    // Obtener todos los productos de Anillo
    const anillos = await prisma.product.findMany({
      where: { category: { name: 'Anillo' } },
      select: { 
        id: true, 
        title: true, 
        category: { select: { name: true } },
        type: true,
        comboItems: true
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Total Anillos en BD: ${anillos.length}\n`);

    // Contar por tipo
    const byType = {
      individual: anillos.filter(a => a.type === 'individual').length,
      combo: anillos.filter(a => a.type === 'combo').length
    };

    console.log(`Desglose por tipo:`);
    console.log(`- Individual: ${byType.individual}`);
    console.log(`- Combo: ${byType.combo}`);

    // Verificar la estructura de comboItems
    console.log('\n=== ESTRUCTURA COMBO ===');
    const firstCombo = anillos.find(a => a.type === 'combo');
    if (firstCombo) {
      console.log('Primer combo encontrado:');
      console.log(JSON.stringify(firstCombo, null, 2));
    } else {
      console.log('No hay combos con Anillo');
    }

    // Listar primeros 15 Anillos
    console.log('\n=== PRIMEROS 15 ANILLOS ===');
    anillos.slice(0, 15).forEach(a => {
      console.log(`${a.id}. ${a.title} | Type: ${a.type} | ComboItems: ${JSON.stringify(a.comboItems)}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAnilloFilter();
