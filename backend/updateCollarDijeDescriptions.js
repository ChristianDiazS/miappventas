import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCollarDijeDescriptions() {
  try {
    console.log('🔄 Actualizando descripciones de los 20 combos Collar + Dije...\n');

    // Los 20 combos Collar + Dije (IDs 192-211)
    const comboIds = Array.from({ length: 20 }, (_, i) => 192 + i);

    const newDescription = 'Hermoso y elegante collar con un dije en forma de letra. Este juego no se puede separar - los dos productos van juntos.';

    for (const id of comboIds) {
      const combo = await prisma.product.update({
        where: { id },
        data: { description: newDescription }
      });
      
      console.log(`✅ ID ${id}: Descripción actualizada`);
    }

    console.log('\n✨ ¡Todas las descripciones han sido actualizadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCollarDijeDescriptions();
