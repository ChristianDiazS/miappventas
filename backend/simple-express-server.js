import express from 'express';

const app = express();
const PORT = 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'test-token' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});
