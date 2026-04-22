import prisma from '../config/db';
import ApiError from '../utils/apiError';

export async function createMenuItem(data: {
  name: string;
  slug: string;
  categoryId: number;
  shortDescription?: string;
  description?: string;
  productType: string;
  price: number;
  imageUrl?: string;
  preparationTime?: number;
  sku?: string;
}) {
  const category = await prisma.menuCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const existingSlug = await prisma.menuItem.findUnique({ where: { slug: data.slug } });
  if (existingSlug) {
    throw ApiError.conflict('Menu item with this slug already exists');
  }

  if (data.sku) {
    const existingSku = await prisma.menuItem.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw ApiError.conflict('SKU already exists');
    }
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      description: data.description,
      productType: data.productType as any,
      price: data.price,
      imageUrl: data.imageUrl,
      preparationTime: data.preparationTime,
      sku: data.sku,
    },
  });

  return menuItem;
}

export async function getMenuItems(categoryId?: number, includeUnavailable = false) {
  return prisma.menuItem.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(includeUnavailable ? {} : { isAvailable: true }),
    },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
}

export async function getMenuItemById(id: number) {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }
  return menuItem;
}

export async function updateMenuItem(id: number, data: {
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  categoryId?: number;
}) {
  const menuItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  if (data.categoryId) {
    const category = await prisma.menuCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
  }

  return prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name || menuItem.name,
      shortDescription: data.shortDescription !== undefined ? data.shortDescription : menuItem.shortDescription,
      description: data.description !== undefined ? data.description : menuItem.description,
      price: data.price !== undefined ? data.price : menuItem.price,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : menuItem.imageUrl,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : menuItem.isAvailable,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : menuItem.isFeatured,
      preparationTime: data.preparationTime !== undefined ? data.preparationTime : menuItem.preparationTime,
      categoryId: data.categoryId || menuItem.categoryId,
    },
  });
}

export async function toggleAvailability(id: number) {
  const menuItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  return prisma.menuItem.update({
    where: { id },
    data: { isAvailable: !menuItem.isAvailable },
  });
}

export async function deleteMenuItem(id: number) {
  const menuItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!menuItem) {
    throw ApiError.notFound('Menu item not found');
  }

  await prisma.menuItem.delete({ where: { id } });
}

export default { createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, toggleAvailability, deleteMenuItem };
