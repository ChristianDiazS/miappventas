import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@unpoquitovariado.com' }
    });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.active}`);
      
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        console.log('\n⚠️  PROBLEMA: El usuario NO tiene rol ADMIN');
        console.log('   Es necesario actualizar el rol a ADMIN para acceder al panel');
      }
    } else {
      console.log('❌ Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
