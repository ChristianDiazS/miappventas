import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToSuperAdmin() {
  try {
    console.log('🔐 Promocionando usuario a SUPERADMIN...\n');

    const email = 'admin@unpoquitovariado.com';

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      await prisma.$disconnect();
      return;
    }

    // Actualizar el rol a SUPERADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPERADMIN' }
    });

    console.log('✅ Usuario promocionado a SUPERADMIN exitosamente!\n');
    console.log('📋 Detalles del usuario:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Nombre: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   Rol: ${updatedUser.role}`);
    console.log(`   Activo: ${updatedUser.active}\n`);
    console.log('🎉 Ya puedes usar este usuario para configurar la plataforma y designar administradores\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error promocionando usuario:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

promoteToSuperAdmin();
