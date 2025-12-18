import dotenv from 'dotenv';
dotenv.config();

console.log('Step 1: Loading modules...');
try {
  const module1 = await import('./src/config/database.js');
  console.log('✅ database.js loaded');
} catch (e) {
  console.error('❌ database.js error:', e.message);
}

try {
  const module2 = await import('./src/app.js');
  console.log('✅ app.js loaded');
} catch (e) {
  console.error('❌ app.js error:', e.message);
}

console.log('Step 2: Calling connectDB...');
try {
  const { connectDB } = await import('./src/config/database.js');
  connectDB();
  console.log('✅ connectDB called');
} catch (e) {
  console.error('❌ connectDB error:', e.message);
}

console.log('Step 3: Creating app...');
try {
  const { createApp } = await import('./src/app.js');
  const app = createApp();
  console.log('✅ app created');
} catch (e) {
  console.error('❌ createApp error:', e.message);
}

console.log('Step 4: Starting server...');
try {
  const { createApp } = await import('./src/app.js');
  const app = createApp();
  const PORT = process.env.PORT || 5000;
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
  });
  
  console.log('Step 5: Server started successfully');
} catch (e) {
  console.error('❌ Server startup error:', e.message);
  console.error('Stack:', e.stack);
}
