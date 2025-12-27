import express from 'express';
const router = express.Router();

// Endpoint de debug - sin autenticación
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint para verificar el token (solo para debug)
router.get('/verify-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided',
      header: authHeader
    });
  }

  try {
    // No verificar, solo retornar info del header
    res.json({
      success: true,
      message: 'Token received',
      tokenPrefix: token.substring(0, 50) + '...',
      tokenLength: token.length,
      authHeader: authHeader.substring(0, 50) + '...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
