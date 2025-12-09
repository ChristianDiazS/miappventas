import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export async function getUserProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });
    
    if (!user) {
      return next(new ApiError('Usuario no encontrado', 404));
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone })
      },
      include: { addresses: true }
    });
    
    if (!user) {
      return next(new ApiError('Usuario no encontrado', 404));
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req, res, next) {
  try {
    const { label, street, district, province, department, postalCode, isDefault } = req.body;
    
    if (!label || !street) {
      return next(new ApiError('Label y street son requeridos', 400));
    }
    
    // Si isDefault es true, desmarcamos otras direcciones como default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }
    
    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        street,
        district: district || null,
        province: province || null,
        department: department || null,
        postalCode: postalCode || null,
        isDefault: isDefault || false
      }
    });
    
    res.json({
      success: true,
      message: 'Dirección añadida exitosamente',
      data: address
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    const { label, street, district, province, department, postalCode, isDefault } = req.body;
    
    // Verificar que la dirección pertenece al usuario
    const address = await prisma.address.findUnique({
      where: { id: parseInt(addressId) }
    });
    
    if (!address || address.userId !== req.user.id) {
      return next(new ApiError('Dirección no encontrada', 404));
    }
    
    // Si isDefault es true, desmarcamos otras direcciones
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id: parseInt(addressId) },
      data: {
        ...(label && { label }),
        ...(street && { street }),
        ...(district !== undefined && { district }),
        ...(province !== undefined && { province }),
        ...(department !== undefined && { department }),
        ...(postalCode !== undefined && { postalCode }),
        ...(isDefault !== undefined && { isDefault })
      }
    });
    
    res.json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    
    // Verificar que la dirección pertenece al usuario
    const address = await prisma.address.findUnique({
      where: { id: parseInt(addressId) }
    });
    
    if (!address || address.userId !== req.user.id) {
      return next(new ApiError('Dirección no encontrada', 404));
    }
    
    await prisma.address.delete({
      where: { id: parseInt(addressId) }
    });
    
    res.json({
      success: true,
      message: 'Dirección eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ApiError('Todos los campos son requeridos', 400));
    }

    if (newPassword.length < 6) {
      return next(new ApiError('La nueva contraseña debe tener al menos 6 caracteres', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new ApiError('Las contraseñas no coinciden', 400));
    }

    if (currentPassword === newPassword) {
      return next(new ApiError('La nueva contraseña debe ser diferente a la actual', 400));
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return next(new ApiError('Usuario no encontrado', 404));
    }

    // Verificar contraseña actual
    const isPasswordCorrect = await comparePassword(currentPassword, user.passwordHash);
    
    if (!isPasswordCorrect) {
      return next(new ApiError('Contraseña actual incorrecta', 401));
    }

    // Hash la nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}
