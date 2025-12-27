import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

async function debugAdminAuth() {
  try {
    console.log('🔍 Verificando configuración de autenticación admin...\n');

    // Obtener usuario admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@unpoquitovariado.com' }
    });

    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log('✅ Usuario admin encontrado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Estado activo: ${admin.active}`);

    // Generar un token de prueba
    const testToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'tu_super_secret_key_123456',
      { expiresIn: '1h' }
    );

    console.log('\n🔑 Token de prueba generado:');
    console.log(`   ${testToken.substring(0, 50)}...`);

    // Verificar el token
    try {
      const decoded = jwt.verify(
        testToken,
        process.env.JWT_SECRET || 'tu_super_secret_key_123456'
      );
      console.log('\n✅ Token verificado correctamente:');
      console.log(`   ID: ${decoded.id}`);
      console.log(`   Email: ${decoded.email}`);
      console.log(`   Rol: ${decoded.role}`);
    } catch (err) {
      console.log('❌ Error al verificar token:', err.message);
    }

    // Verificar JWT_SECRET
    console.log(`\n🔐 JWT_SECRET configurado: ${process.env.JWT_SECRET ? 'Sí' : 'No'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminAuth();
