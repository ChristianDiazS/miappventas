import { prisma } from '../src/lib/prisma.js';

async function countProducts() {
  try {
    // Contar TODOS los productos
    const total = await prisma.product.count();
    
    // Contar solo ACTIVOS
    const active = await prisma.product.count({
      where: { active: true }
    });

    // Listar todos
    const allProducts = await prisma.product.findMany({
      select: { id: true, sku: true, title: true, active: true },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 ESTADÍSTICAS DE PRODUCTOS:\n`);
    console.log(`Total en BD: ${total}`);
    console.log(`Activos: ${active}`);
    console.log(`Inactivos: ${total - active}`);
    console.log(`\n📋 LISTA COMPLETA:`);
    console.log(JSON.stringify(allProducts, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

countProducts();
