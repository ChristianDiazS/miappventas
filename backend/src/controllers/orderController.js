import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddressId, shippingMethod = 'STANDARD' } = req.body;
    
    if (!items || items.length === 0) {
      return next(new ApiError('El pedido debe contener al menos un artículo', 400));
    }
    
    if (!shippingAddressId) {
      return next(new ApiError('Se requiere una dirección de envío', 400));
    }
    
    // Verificar que la dirección pertenece al usuario
    const address = await prisma.address.findUnique({
      where: { id: parseInt(shippingAddressId) }
    });
    
    if (!address || address.userId !== req.user.id) {
      return next(new ApiError('Dirección no encontrada', 404));
    }
    
    // Usar transacción para crear orden y actualizar stock
    const order = await prisma.$transaction(async (tx) => {
      // Validar y calcular totales
      let subtotal = 0;
      const orderItemsData = [];
      
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: parseInt(item.productId) }
        });
        
        if (!product) {
          throw new ApiError(`Producto ${item.productId} no encontrado`, 404);
        }
        
        if (product.stock < item.quantity) {
          throw new ApiError(`Stock insuficiente para ${product.title}`, 400);
        }
        
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: itemSubtotal
        });
        
        // Reducir stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } }
        });
      }
      
      // Calcular impuestos y envío
      const tax = subtotal * 0.18; // 18% IGV
      const shippingCost = shippingMethod === 'EXPRESS' ? 150 : 50;
      const total = subtotal + tax + shippingCost;
      
      // Generar número de orden
      const lastOrder = await tx.order.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
      });
      const orderNumber = `ORD-${new Date().getFullYear()}-${String((lastOrder?.id || 0) + 1).padStart(5, '0')}`;
      
      // Crear orden con items en una transacción
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          shippingAddressId: parseInt(shippingAddressId),
          shippingMethod,
          subtotal,
          tax,
          shippingCost,
          total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            createMany: {
              data: orderItemsData
            }
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          user: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      });
      
      return newOrder;
    });
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: order
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        shippingAddress: true,
        payments: true
      }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }
    
    // Verificar que el usuario sea el dueño o admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return next(new ApiError('No autorizado', 403));
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    
    if (!validStatuses.includes(status)) {
      return next(new ApiError('Estado inválido', 400));
    }
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }
    
    // Verificar autorización (solo admin puede actualizar estado)
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return next(new ApiError('No autorizado', 403));
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });
    
    res.json({
      success: true,
      message: 'Estado de la orden actualizado',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
}
