import express from 'express';
import {
  getAllProducts,
  getAllProductsForAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from '../controllers/productController.js';
import {
  addProductImage,
  deleteProductImage,
  setPrimaryImage
} from '../controllers/imageController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/admin/all', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), getAllProductsForAdmin); // Endpoint para admin ANTES del /:id
router.get('/:id', getProductById);

// Rutas protegidas (solo ADMIN y SUPERADMIN)
router.post('/', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), createProduct);
router.put('/:id', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), updateProduct);
router.patch('/:id/toggle-status', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), toggleProductStatus);
router.delete('/:id', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), deleteProduct);

// Rutas de imágenes (protegidas - solo ADMIN y SUPERADMIN)
router.post('/:id/images', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), addProductImage);
router.delete('/images/:imageId', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), deleteProductImage);
router.patch('/images/:imageId/primary', authenticateToken, authorize(['ADMIN', 'SUPERADMIN']), setPrimaryImage);

export default router;
