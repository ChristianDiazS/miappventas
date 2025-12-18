import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const superadmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });
    
    if (superadmin) {
      console.log('SUPERADMIN:', {
        id: superadmin.id,
        email: superadmin.email,
        name: superadmin.name,
        role: superadmin.role,
      });
    } else {
      console.log('Sin SUPERADMIN');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
