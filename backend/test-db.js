import { prisma } from './src/lib/prisma.js';

async function test() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...\n');
    
    // Test 1: Conexión básica
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión a PostgreSQL exitosa:', result);
    
    // Test 2: Contar tablas
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tablas en la base de datos:', tables[0].count);
    
    // Test 3: Listar todas las tablas
    const tableList = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('\n📋 Tablas creadas:');
    tableList.forEach(t => console.log(`  - ${t.tablename}`));
    
    console.log('\n✅ ¡PostgreSQL está funcionando correctamente!\n');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('📝 Asegúrate de:');
    console.error('  1. PostgreSQL instalado y corriendo');
    console.error('  2. Base de datos "miappventas" creada');
    console.error('  3. DATABASE_URL correcto en .env');
    console.error('  4. Ejecutar: npx prisma migrate dev --name init');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
