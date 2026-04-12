const prisma = require('../lib/prisma');

async function getCategories(cafeteriaId) {
  return prisma.category.findMany({
    where: { cafeteriaId },
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });
}

async function createCategory(cafeteriaId, { name, order }) {
  return prisma.category.create({
    data: { cafeteriaId, name, order: order ?? 0 },
    include: { items: true },
  });
}

async function updateCategory(id, cafeteriaId, { name, order }) {
  return prisma.category.updateMany({
    where: { id, cafeteriaId },
    data: { name, order },
  });
}

async function deleteCategory(id, cafeteriaId) {
  return prisma.category.deleteMany({ where: { id, cafeteriaId } });
}

async function addCategoryItem(categoryId, cafeteriaId, { name, calories, isMain, order }) {
  // 해당 카테고리가 내 식당 소속인지 확인
  const category = await prisma.category.findFirst({
    where: { id: categoryId, cafeteriaId },
  });
  if (!category) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return prisma.categoryItem.create({
    data: { categoryId, name, calories: calories ?? null, isMain: isMain ?? false, order: order ?? 0 },
  });
}

async function updateCategoryItem(itemId, { name, calories, isMain, order }) {
  return prisma.categoryItem.update({
    where: { id: itemId },
    data: { name, calories: calories ?? null, isMain: isMain ?? false, order },
  });
}

async function deleteCategoryItem(itemId) {
  return prisma.categoryItem.delete({ where: { id: itemId } });
}

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  addCategoryItem, updateCategoryItem, deleteCategoryItem,
};
