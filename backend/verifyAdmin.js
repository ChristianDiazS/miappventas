import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyAndCreateAdmin() {
  try {
    // Buscar usuario admin existente
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (adminUser) {
      console.log('✅ Usuario ADMIN existe:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nombre: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`   Rol: ${adminUser.role}`);
      return;
    }

    // Si no existe, crear uno
    console.log('❌ No hay usuario ADMIN. Creando uno...');
    
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@miappventas.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'MiAppVentas',
        phone: '+51999999999',
        role: 'ADMIN',
        active: true
      }
    });

    console.log('✅ Usuario ADMIN creado:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Contraseña: Admin123!`);
    console.log(`   Rol: ${newAdmin.role}`);
    console.log('\n⚠️  Cambiar la contraseña después de primer login');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAndCreateAdmin();
