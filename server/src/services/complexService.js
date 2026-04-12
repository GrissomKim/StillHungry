const prisma = require('../lib/prisma');

async function getComplexes() {
  return prisma.complex.findMany({ orderBy: { id: 'asc' } });
}

async function createComplex(data) {
  return prisma.complex.create({ data });
}

async function updateComplex(id, data) {
  return prisma.complex.update({ where: { id }, data });
}

async function deleteComplex(id) {
  return prisma.complex.delete({ where: { id } });
}

module.exports = { getComplexes, createComplex, updateComplex, deleteComplex };
