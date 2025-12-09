import { prisma } from '../lib/prisma.js';

export async function connectDB() {
  try {
    // Verificar conexión a PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado a PostgreSQL');
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
