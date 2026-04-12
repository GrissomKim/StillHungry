const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(authenticate);

// 내 식당 메뉴 목록
router.get('/menus', async (req, res, next) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { cafeteriaId: req.admin.cafeteriaId },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: [{ date: 'desc' }, { mealType: 'asc' }],
    });
    res.json({ success: true, data: menus });
  } catch (err) { next(err); }
});

// 메뉴 등록
router.post('/menus', async (req, res, next) => {
  try {
    const { date, mealType, price, isPublished, items } = req.body;
    const menu = await prisma.menu.create({
      data: {
        cafeteriaId: req.admin.cafeteriaId,
        date: new Date(date),
        mealType,
        price: price ? Number(price) : null,
        isPublished: isPublished ?? false,
        items: { create: items || [] },
      },
      include: { items: true },
    });
    res.status(201).json({ success: true, data: menu });
  } catch (err) { next(err); }
});

// 메뉴 수정
router.put('/menus/:id', async (req, res, next) => {
  try {
    const { isPublished, mealType, price } = req.body;
    const data = {};
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (mealType !== undefined) data.mealType = mealType;
    if (price !== undefined) data.price = price ? Number(price) : null;
    const menu = await prisma.menu.updateMany({
      where: { id: Number(req.params.id), cafeteriaId: req.admin.cafeteriaId },
      data,
    });
    res.json({ success: true, data: menu });
  } catch (err) { next(err); }
});

// 메뉴 삭제
router.delete('/menus/:id', async (req, res, next) => {
  try {
    await prisma.menu.deleteMany({
      where: { id: Number(req.params.id), cafeteriaId: req.admin.cafeteriaId },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// 메뉴 항목 추가
router.post('/menus/:id/items', async (req, res, next) => {
  try {
    const item = await prisma.menuItem.create({
      data: { menuId: Number(req.params.id), ...req.body },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

// 메뉴 항목 수정
router.put('/menus/:menuId/items/:itemId', async (req, res, next) => {
  try {
    const item = await prisma.menuItem.update({
      where: { id: Number(req.params.itemId) },
      data: req.body,
    });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

// 메뉴 항목 삭제
router.delete('/menus/:menuId/items/:itemId', async (req, res, next) => {
  try {
    await prisma.menuItem.delete({ where: { id: Number(req.params.itemId) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// 식당 설정 조회
router.get('/cafeteria', async (req, res, next) => {
  try {
    const cafeteria = await prisma.cafeteria.findUnique({
      where: { id: req.admin.cafeteriaId },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        defaultBreakfastPrice: true,
        defaultLunchPrice: true,
        defaultDinnerPrice: true,
      },
    });
    if (!cafeteria) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: cafeteria });
  } catch (err) { next(err); }
});

// 식당 설정 수정
router.put('/cafeteria', async (req, res, next) => {
  try {
    const { defaultBreakfastPrice, defaultLunchPrice, defaultDinnerPrice } = req.body;
    const cafeteria = await prisma.cafeteria.update({
      where: { id: req.admin.cafeteriaId },
      data: {
        defaultBreakfastPrice: defaultBreakfastPrice != null ? Number(defaultBreakfastPrice) : null,
        defaultLunchPrice: defaultLunchPrice != null ? Number(defaultLunchPrice) : null,
        defaultDinnerPrice: defaultDinnerPrice != null ? Number(defaultDinnerPrice) : null,
      },
    });
    res.json({ success: true, data: cafeteria });
  } catch (err) { next(err); }
});

// 공지 목록
router.get('/notices', async (req, res, next) => {
  try {
    const notices = await prisma.notice.findMany({
      where: { cafeteriaId: req.admin.cafeteriaId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notices });
  } catch (err) { next(err); }
});

// 공지 등록
router.post('/notices', async (req, res, next) => {
  try {
    const notice = await prisma.notice.create({
      data: { cafeteriaId: req.admin.cafeteriaId, ...req.body },
    });
    res.status(201).json({ success: true, data: notice });
  } catch (err) { next(err); }
});

// 공지 수정
router.put('/notices/:id', async (req, res, next) => {
  try {
    const notice = await prisma.notice.updateMany({
      where: { id: Number(req.params.id), cafeteriaId: req.admin.cafeteriaId },
      data: req.body,
    });
    res.json({ success: true, data: notice });
  } catch (err) { next(err); }
});

// 공지 삭제
router.delete('/notices/:id', async (req, res, next) => {
  try {
    await prisma.notice.deleteMany({
      where: { id: Number(req.params.id), cafeteriaId: req.admin.cafeteriaId },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
