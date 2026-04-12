const prisma = require('../lib/prisma');

// ── Admin ──────────────────────────────────────────

async function getCafeteriaSettings(cafeteriaId) {
  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id: cafeteriaId },
    select: {
      id: true, name: true, description: true, address: true, phone: true,
      defaultBreakfastPrice: true, defaultLunchPrice: true, defaultDinnerPrice: true,
    },
  });
  if (!cafeteria) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return cafeteria;
}

async function updateCafeteriaSettings(cafeteriaId, { defaultBreakfastPrice, defaultLunchPrice, defaultDinnerPrice }) {
  return prisma.cafeteria.update({
    where: { id: cafeteriaId },
    data: {
      defaultBreakfastPrice: defaultBreakfastPrice != null ? Number(defaultBreakfastPrice) : null,
      defaultLunchPrice:     defaultLunchPrice     != null ? Number(defaultLunchPrice)     : null,
      defaultDinnerPrice:    defaultDinnerPrice    != null ? Number(defaultDinnerPrice)    : null,
    },
  });
}

// ── Public ─────────────────────────────────────────

async function searchCafeterias(q) {
  return prisma.cafeteria.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    },
    include: { complex: { select: { id: true, name: true } } },
    orderBy: [{ complexId: 'asc' }, { name: 'asc' }],
  });
}

async function getCafeteriasByComplex(complexId) {
  return prisma.cafeteria.findMany({
    where: { complexId, isActive: true },
    orderBy: { name: 'asc' },
  });
}

async function getCafeteriaById(id) {
  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id },
    include: { complex: { select: { id: true, name: true } } },
  });
  if (!cafeteria) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return cafeteria;
}

// ── Super ──────────────────────────────────────────

async function getAllCafeterias() {
  return prisma.cafeteria.findMany({
    include: { complex: true },
    orderBy: { id: 'asc' },
  });
}

async function createCafeteria(data) {
  return prisma.cafeteria.create({ data });
}

async function updateCafeteria(id, data) {
  return prisma.cafeteria.update({ where: { id }, data });
}

async function deleteCafeteria(id) {
  return prisma.cafeteria.delete({ where: { id } });
}

module.exports = {
  getCafeteriaSettings, updateCafeteriaSettings,
  searchCafeterias, getCafeteriasByComplex, getCafeteriaById,
  getAllCafeterias, createCafeteria, updateCafeteria, deleteCafeteria,
};
