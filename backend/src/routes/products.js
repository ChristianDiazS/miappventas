import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import {
  addProductImage,
  deleteProductImage,
  setPrimaryImage
} from '../controllers/imageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, createProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

// Rutas de imágenes (protegidas)
router.post('/:id/images', authenticateToken, addProductImage);
router.delete('/images/:imageId', authenticateToken, deleteProductImage);
router.patch('/images/:imageId/primary', authenticateToken, setPrimaryImage);

export default router;
