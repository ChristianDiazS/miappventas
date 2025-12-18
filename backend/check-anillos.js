import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCategoriesAndProducts() {
  try {
    // Obtener categorías
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });
    console.log('Categorías disponibles:');
    categories.forEach(c => console.log(`- ${c.name}`));

    // Obtener todos los productos para ver estructura
    const products = await prisma.product.findMany({
      select: { id: true, title: true, categoryId: true, price: true }
    });
    console.log(`\nTotal de productos: ${products.length}`);
    console.log('Primeros 5 productos:');
    products.slice(0, 5).forEach(p => {
      console.log(`- ID: ${p.id}, Título: ${p.title}, CategoryID: ${p.categoryId}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getCategoriesAndProducts();
