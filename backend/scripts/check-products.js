import { prisma } from '../src/lib/prisma.js';

const products = await prisma.product.findMany({
  select: { id: true, sku: true, title: true, active: true }
});

console.log('Productos en la base de datos:');
console.log(JSON.stringify(products, null, 2));

await prisma.$disconnect();
