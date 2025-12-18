import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Test endpoint' });
});

app.listen(PORT, () => {
  console.log(`✅ Test Server running on http://localhost:${PORT}`);
});
