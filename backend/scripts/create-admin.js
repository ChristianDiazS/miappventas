import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario admin...\n');

    // Datos del admin
    const email = 'admin@unpoquitovariado.com';
    const password = 'Admin123!'; // Cambiar esta contraseña
    const firstName = 'Admin';
    const lastName = 'Un Poquito Variado';

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  El usuario ya existe:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Rol: ${existingUser.role}`);
      await prisma.$disconnect();
      return;
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario admin
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: '+51',
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario admin creado exitosamente!\n');
    console.log('📋 Datos de acceso:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   URL de login: http://localhost:5173/login\n`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña en tu primera sesión\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdminUser();
