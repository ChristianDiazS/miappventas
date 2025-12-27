import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║   VERIFICACIÓN DE USUARIOS SUPERADMIN EN BD        ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Obtener todos los SUPERADMIN
    const superAdmins = await prisma.user.findMany({
      where: { 
        role: 'SUPERADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Obtener todos los ADMIN
    const admins = await prisma.user.findMany({
      where: { 
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Total de usuarios
    const totalUsers = await prisma.user.count();

    console.log(`📊 RESUMEN GENERAL:`);
    console.log(`   • Total usuarios en BD: ${totalUsers}`);
    console.log(`   • Total SUPERADMIN: ${superAdmins.length}`);
    console.log(`   • Total ADMIN: ${admins.length}`);
    console.log('');

    if (superAdmins.length > 0) {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║          USUARIOS SUPERADMIN (ENCONTRADOS)         ║');
      console.log('╚════════════════════════════════════════════════════╝\n');
      
      superAdmins.forEach((admin, index) => {
        console.log(`[${index + 1}] ${admin.email}`);
        console.log(`    Nombre: ${admin.firstName} ${admin.lastName}`);
        console.log(`    Rol: ${admin.role}`);
        console.log(`    Estado: ${admin.active ? '✅ Activo' : '❌ Inactivo'}`);
        console.log(`    Creado: ${new Date(admin.createdAt).toLocaleString('es-ES')}`);
        console.log('');
      });
    } else {
      console.log('❌ NO HAY USUARIOS SUPERADMIN CREADOS\n');
    }

    if (admins.length > 0) {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║          USUARIOS ADMIN (ENCONTRADOS)              ║');
      console.log('╚════════════════════════════════════════════════════╝\n');
      
      admins.forEach((admin, index) => {
        console.log(`[${index + 1}] ${admin.email}`);
        console.log(`    Nombre: ${admin.firstName} ${admin.lastName}`);
        console.log(`    Rol: ${admin.role}`);
        console.log(`    Estado: ${admin.active ? '✅ Activo' : '❌ Inactivo'}`);
        console.log(`    Creado: ${new Date(admin.createdAt).toLocaleString('es-ES')}`);
        console.log('');
      });
    }

    console.log('═════════════════════════════════════════════════════');
    if (superAdmins.length === 1) {
      console.log(`✅ Hay 1 SUPERADMIN disponible para usar:`);
      console.log(`   📧 ${superAdmins[0].email}`);
      console.log(`   🔑 TestPassword123!`);
    } else if (superAdmins.length > 1) {
      console.log(`✅ Hay ${superAdmins.length} SUPERADMIN disponibles`);
    }
    console.log('═════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
