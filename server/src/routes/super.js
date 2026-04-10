const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(authenticate, requireSuperAdmin);

// ── 단지 ──
router.get('/complexes', async (req, res, next) => {
  try {
    const data = await prisma.complex.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/complexes', async (req, res, next) => {
  try {
    const data = await prisma.complex.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/complexes/:id', async (req, res, next) => {
  try {
    const data = await prisma.complex.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/complexes/:id', async (req, res, next) => {
  try {
    await prisma.complex.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 식당 ──
router.get('/cafeterias', async (req, res, next) => {
  try {
    const data = await prisma.cafeteria.findMany({ include: { complex: true }, orderBy: { id: 'asc' } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/cafeterias', async (req, res, next) => {
  try {
    const data = await prisma.cafeteria.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/cafeterias/:id', async (req, res, next) => {
  try {
    const data = await prisma.cafeteria.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/cafeterias/:id', async (req, res, next) => {
  try {
    await prisma.cafeteria.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Admin 계정 ──
router.get('/admins', async (req, res, next) => {
  try {
    const data = await prisma.admin.findMany({
      select: { id: true, username: true, role: true, cafeteriaId: true, isActive: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/admins', async (req, res, next) => {
  try {
    const { username, password, role, cafeteriaId } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const data = await prisma.admin.create({
      data: { username, password: hashed, role: role || 'ADMIN', cafeteriaId },
      select: { id: true, username: true, role: true, cafeteriaId: true, isActive: true, createdAt: true },
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/admins/:id', async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const updateData = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const data = await prisma.admin.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      select: { id: true, username: true, role: true, cafeteriaId: true, isActive: true },
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/admins/:id', async (req, res, next) => {
  try {
    await prisma.admin.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 전체 메뉴 관리 ──
router.get('/menus', async (req, res, next) => {
  try {
    const data = await prisma.menu.findMany({
      include: { items: true, cafeteria: { select: { name: true } } },
      orderBy: [{ date: 'desc' }, { cafeteriaId: 'asc' }],
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/menus/:id', async (req, res, next) => {
  try {
    const data = await prisma.menu.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/menus/:id', async (req, res, next) => {
  try {
    await prisma.menu.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
