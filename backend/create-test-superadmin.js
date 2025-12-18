import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creando usuario SUPERADMIN de testing...');
    
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    
    const newSuperAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@test.com',
        firstName: 'Super',
        lastName: 'Admin Test',
        passwordHash: hashedPassword,
        role: 'SUPERADMIN',
        phone: '+51999999999',
        active: true,
      }
    });
    
    console.log('✅ SUPERADMIN creado exitosamente:');
    console.log('  Email:', newSuperAdmin.email);
    console.log('  Password: TestPassword123!');
    console.log('  Role:', newSuperAdmin.role);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario ya existe');
      const existing = await prisma.user.findUnique({
        where: { email: 'superadmin@test.com' }
      });
      console.log('  Email:', existing.email);
      console.log('  Password: TestPassword123!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
