import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Agregar imagen a un producto
 * POST /api/products/:id/images
 */
export async function addProductImage(req, res, next) {
  try {
    const { id } = req.params;
    const { url, publicId, isPrimary = false } = req.body;

    if (!url || !publicId) {
      return next(new ApiError('URL y publicId son requeridos', 400));
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true }
    });

    if (!product) {
      return next(new ApiError('Producto no encontrado', 404));
    }

    // Si es la primera imagen, hacerla primaria
    const willBePrimary = isPrimary || product.images.length === 0;

    // Si es primaria, desmarcar las otras
    if (willBePrimary) {
      await prisma.productImage.updateMany(
        { where: { productId: product.id } },
        { data: { isPrimary: false } }
      );
    }

    // Crear imagen
    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        publicId,
        isPrimary: willBePrimary,
        order: product.images.length
      }
    });

    res.status(201).json({
      success: true,
      data: image,
      message: 'Imagen agregada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar imagen de un producto
 * DELETE /api/products/images/:imageId
 */
export async function deleteProductImage(req, res, next) {
  try {
    const { imageId } = req.params;

    const image = await prisma.productImage.findUnique({
      where: { id: parseInt(imageId) }
    });

    if (!image) {
      return next(new ApiError('Imagen no encontrada', 404));
    }

    // Eliminar imagen
    await prisma.productImage.delete({
      where: { id: parseInt(imageId) }
    });

    // Si era la principal, hacer principal a la primera restante
    if (image.isPrimary) {
      const firstRemaining = await prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { order: 'asc' }
      });

      if (firstRemaining) {
        await prisma.productImage.update({
          where: { id: firstRemaining.id },
          data: { isPrimary: true }
        });
      }
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Establecer imagen primaria
 * PATCH /api/products/images/:imageId/primary
 */
export async function setPrimaryImage(req, res, next) {
  try {
    const { imageId } = req.params;

    const image = await prisma.productImage.findUnique({
      where: { id: parseInt(imageId) }
    });

    if (!image) {
      return next(new ApiError('Imagen no encontrada', 404));
    }

    // Desmarcar las otras imágenes del mismo producto
    await prisma.productImage.updateMany(
      { where: { productId: image.productId } },
      { data: { isPrimary: false } }
    );

    // Marcar esta como primaria
    const updated = await prisma.productImage.update({
      where: { id: parseInt(imageId) },
      data: { isPrimary: true }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Imagen principal actualizada'
    });
  } catch (error) {
    next(error);
  }
}
