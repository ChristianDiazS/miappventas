import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import { createApp } from './src/app.js';

dotenv.config();

// Database
connectDB();

const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
});
