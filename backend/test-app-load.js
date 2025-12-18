import dotenv from 'dotenv';

dotenv.config();

try {
  console.log('1. Loading app...');
  const { createApp } = await import('./src/app.js');
  console.log('2. App loaded successfully');
  
  const app = createApp();
  console.log('3. App created successfully');
  
  console.log('✅ Everything loaded OK');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
