const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 단지 목록
router.get('/complexes', async (req, res, next) => {
  try {
    const complexes = await prisma.complex.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data: complexes });
  } catch (err) { next(err); }
});

// 전체 식당 검색 (?q=검색어)
router.get('/cafeterias', async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const cafeterias = await prisma.cafeteria.findMany({
      where: {
        isActive: true,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: { complex: { select: { id: true, name: true } } },
      orderBy: [{ complexId: 'asc' }, { name: 'asc' }],
    });
    res.json({ success: true, data: cafeterias });
  } catch (err) { next(err); }
});

// 단지별 식당 목록
router.get('/complexes/:id/cafeterias', async (req, res, next) => {
  try {
    const cafeterias = await prisma.cafeteria.findMany({
      where: { complexId: Number(req.params.id), isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: cafeterias });
  } catch (err) { next(err); }
});

// 식당 상세
router.get('/cafeterias/:id', async (req, res, next) => {
  try {
    const cafeteria = await prisma.cafeteria.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!cafeteria) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: cafeteria });
  } catch (err) { next(err); }
});

// 날짜별 메뉴 조회 (?date=YYYY-MM-DD)
router.get('/cafeterias/:id/menus', async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const menus = await prisma.menu.findMany({
      where: {
        cafeteriaId: Number(req.params.id),
        date: { gte: new Date(date.setHours(0,0,0,0)), lt: new Date(date.setHours(24,0,0,0)) },
        isPublished: true,
      },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { mealType: 'asc' },
    });
    res.json({ success: true, data: menus });
  } catch (err) { next(err); }
});

// 공지/이벤트 목록
router.get('/cafeterias/:id/notices', async (req, res, next) => {
  try {
    const notices = await prisma.notice.findMany({
      where: { cafeteriaId: Number(req.params.id), isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notices });
  } catch (err) { next(err); }
});

module.exports = router;
