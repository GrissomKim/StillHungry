const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const SAFE_SELECT = {
  id: true, username: true, role: true,
  cafeteriaId: true, isActive: true, createdAt: true,
};

async function getAdmins() {
  return prisma.admin.findMany({
    select: SAFE_SELECT,
    orderBy: { id: 'asc' },
  });
}

async function createAdmin({ username, password, role, cafeteriaId }) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.admin.create({
    data: { username, password: hashed, role: role || 'ADMIN', cafeteriaId },
    select: SAFE_SELECT,
  });
}

async function updateAdmin(id, body) {
  const { password, ...rest } = body;
  const data = { ...rest };
  if (password) data.password = await bcrypt.hash(password, 10);
  return prisma.admin.update({
    where: { id },
    data,
    select: { id: true, username: true, role: true, cafeteriaId: true, isActive: true },
  });
}

async function deleteAdmin(id) {
  return prisma.admin.delete({ where: { id } });
}

module.exports = { getAdmins, createAdmin, updateAdmin, deleteAdmin };
