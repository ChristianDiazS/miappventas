import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('🔍 Verificando usuarios administradores...\n');

    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Total de usuarios: ${allUsers.length}\n`);

    // Filtrar por rol
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const superadmins = allUsers.filter(u => u.role === 'SUPERADMIN');
    const users = allUsers.filter(u => u.role === 'USER');

    console.log('📊 Desglose por rol:');
    console.log(`- SUPERADMIN: ${superadmins.length}`);
    console.log(`- ADMIN: ${admins.length}`);
    console.log(`- USER: ${users.length}\n`);

    console.log('📋 Listado de todos los usuarios:');
    allUsers.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.email} | Rol: ${u.role} | Creado: ${u.createdAt.toLocaleDateString('es-PE')}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
