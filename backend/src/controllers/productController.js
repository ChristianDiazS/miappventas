import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function getAllProducts(req, res, next) {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;
    
    // Construir where con filtros
    const where = { active: true };
    
    if (category) {
      const categoryObj = await prisma.category.findUnique({
        where: { slug: category.toLowerCase() }
      });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          images: true,
          features: true
        }
      }),
      prisma.product.count({ where })
    ]);
    
    // Transformar datos para devolver solo el nombre de categoria
    const transformedProducts = products.map(product => ({
      ...product,
      category: product.category?.name || 'General'
    }));
    
    res.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { name: true } },
        images: true,
        features: true,
        reviews: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } }
        }
      }
    });
    
    if (!product || !product.active) {
      return next(new ApiError('Producto no encontrado', 404));
    }
    
    // Transformar para devolver solo el nombre de categoria
    const transformedProduct = {
      ...product,
      category: product.category?.name || 'General'
    };
    
    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { sku, title, description, price, originalPrice, categoryId, stock, weight, images, features } = req.body;
    
    if (!sku || !title || !price || !categoryId) {
      return next(new ApiError('Campos requeridos faltantes', 400));
    }
    
    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return next(new ApiError('Categoría no encontrada', 404));
    }
    
    const product = await prisma.product.create({
      data: {
        sku,
        title,
        description: description || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
        categoryId: parseInt(categoryId),
        stock: parseInt(stock) || 0,
        weight: weight ? parseFloat(weight) : null,
        rating: 0,
        reviewCount: 0,
        active: true,
        images: images ? {
          createMany: {
            data: images.map(img => ({
              url: img.url,
              alt: img.alt || title
            }))
          }
        } : undefined,
        features: features ? {
          createMany: {
            data: features.map(feat => ({
              key: feat.key,
              value: feat.value
            }))
          }
        } : undefined
      },
      include: {
        category: { select: { name: true } },
        images: true,
        features: true
      }
    });
    
    // Transformar para devolver solo el nombre de categoria
    const transformedProduct = {
      ...product,
      category: product.category?.name || 'General'
    };
    
    res.status(201).json({
      success: true,
      data: transformedProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new ApiError('El SKU ya existe', 400));
    }
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, price, originalPrice, categoryId, stock, weight, images, features } = req.body;
    
    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return next(new ApiError('Producto no encontrado', 404));
    }
    
    // Si cambió la categoría, verificar que existe
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      if (!category) {
        return next(new ApiError('Categoría no encontrada', 404));
      }
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(originalPrice && { originalPrice: parseFloat(originalPrice) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(weight && { weight: parseFloat(weight) })
      },
      include: {
        category: { select: { name: true } },
        images: true,
        features: true
      }
    });
    
    // Transformar para devolver solo el nombre de categoria
    const transformedProduct = {
      ...updatedProduct,
      category: updatedProduct.category?.name || 'General'
    };
    
    res.json({
      success: true,
      data: transformedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return next(new ApiError('Producto no encontrado', 404));
    }
    
    // Soft delete: solo marcar como inactivo
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}
