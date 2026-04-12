const prisma = require('../lib/prisma');

// ── Admin ──────────────────────────────────────────

async function getMenusByCafeteria(cafeteriaId) {
  return prisma.menu.findMany({
    where: { cafeteriaId },
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: [{ date: 'desc' }, { mealType: 'asc' }],
  });
}

async function createMenu(cafeteriaId, { date, mealType, price, image, isPublished, items }) {
  return prisma.menu.create({
    data: {
      cafeteriaId,
      date: new Date(date),
      mealType,
      price: price ? Number(price) : null,
      image: image || null,
      isPublished: isPublished ?? false,
      items: { create: items || [] },
    },
    include: { items: true },
  });
}

async function updateMenu(id, cafeteriaId, body) {
  const { isPublished, mealType, price, image } = body;
  const data = {};
  if (isPublished !== undefined) data.isPublished = isPublished;
  if (mealType    !== undefined) data.mealType    = mealType;
  if (price       !== undefined) data.price       = price ? Number(price) : null;
  if (image       !== undefined) data.image       = image || null;
  return prisma.menu.updateMany({
    where: { id, cafeteriaId },
    data,
  });
}

async function deleteMenu(id, cafeteriaId) {
  return prisma.menu.deleteMany({ where: { id, cafeteriaId } });
}

async function addMenuItem(menuId, data) {
  return prisma.menuItem.create({ data: { menuId, ...data } });
}

async function updateMenuItem(itemId, data) {
  return prisma.menuItem.update({ where: { id: itemId }, data });
}

async function deleteMenuItem(itemId) {
  return prisma.menuItem.delete({ where: { id: itemId } });
}

// ── Super ──────────────────────────────────────────

async function getAllMenus() {
  return prisma.menu.findMany({
    include: { items: true, cafeteria: { select: { name: true } } },
    orderBy: [{ date: 'desc' }, { cafeteriaId: 'asc' }],
  });
}

async function updateMenuSuper(id, data) {
  return prisma.menu.update({ where: { id }, data });
}

async function deleteMenuSuper(id) {
  return prisma.menu.delete({ where: { id } });
}

// ── Public ─────────────────────────────────────────

async function getPublicMenus(cafeteriaId, date) {
  const d = date ? new Date(date) : new Date();
  return prisma.menu.findMany({
    where: {
      cafeteriaId,
      date: { gte: new Date(d.setHours(0,0,0,0)), lt: new Date(d.setHours(24,0,0,0)) },
      isPublished: true,
    },
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { mealType: 'asc' },
  });
}

module.exports = {
  getMenusByCafeteria, createMenu, updateMenu, deleteMenu,
  addMenuItem, updateMenuItem, deleteMenuItem,
  getAllMenus, updateMenuSuper, deleteMenuSuper,
  getPublicMenus,
};
