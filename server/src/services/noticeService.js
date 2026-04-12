const prisma = require('../lib/prisma');

// ── Admin ──────────────────────────────────────────

async function getNoticesByCafeteria(cafeteriaId) {
  return prisma.notice.findMany({
    where: { cafeteriaId },
    orderBy: { createdAt: 'desc' },
  });
}

async function createNotice(cafeteriaId, data) {
  return prisma.notice.create({
    data: { cafeteriaId, ...data },
  });
}

async function updateNotice(id, cafeteriaId, data) {
  return prisma.notice.updateMany({
    where: { id, cafeteriaId },
    data,
  });
}

async function deleteNotice(id, cafeteriaId) {
  return prisma.notice.deleteMany({ where: { id, cafeteriaId } });
}

// ── Public ─────────────────────────────────────────

async function getPublicNotices(cafeteriaId) {
  return prisma.notice.findMany({
    where: { cafeteriaId, isPublished: true },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  getNoticesByCafeteria, createNotice, updateNotice, deleteNotice,
  getPublicNotices,
};
