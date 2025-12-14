import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { products: true }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Error fetching category' });
  }
};

// Crear una nueva categoría (solo admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generar slug si no viene
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const category = await prisma.category.create({
      data: {
        name,
        description: description || '',
        slug: categorySlug
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Error creating category' });
  }
};

// Actualizar una categoría (solo admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(slug && { slug })
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Error updating category' });
  }
};

// Eliminar una categoría (solo admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Error deleting category' });
  }
};
