import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Conexión exitosa');
    console.log('Usuarios encontrados:', users.length);
    
    // Buscar usuario SUPERADMIN
    const superadmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });
    
    if (superadmin) {
      console.log('✅ SUPERADMIN encontrado:', superadmin.email);
    } else {
      console.log('❌ No hay usuario SUPERADMIN');
      console.log('\nNecesitamos crear uno. Intentando...');
      
      // Crear SUPERADMIN
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('superadmin123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@example.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPERADMIN',
          isActive: true,
        }
      });
      
      console.log('✅ SUPERADMIN creado:', newAdmin.email);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
