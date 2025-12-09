// Script para resetear la base de datos
// Ejecuta esto en el backend para limpiar usuarios y empezar de nuevo

import { User } from './src/models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar todos los usuarios
    const result = await User.deleteMany({});
    console.log(`✅ ${result.deletedCount} usuarios eliminados`);

    // Crear usuario de prueba con contraseña hasheada correctamente
    const testUser = new User({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      password: 'password123', // Será hasheada automáticamente por el pre-save hook
      phone: '+51999999999'
    });

    await testUser.save();
    console.log('✅ Usuario de prueba creado:');
    console.log('   Email: juan@example.com');
    console.log('   Contraseña: password123');

    // Desconectar
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
