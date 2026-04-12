const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const menuService      = require('../services/menuService');
const noticeService    = require('../services/noticeService');
const cafeteriaService = require('../services/cafeteriaService');
const categoryService  = require('../services/categoryService');

router.use(authenticate);

// ── 메뉴 ──────────────────────────────────────────

router.get('/menus', async (req, res, next) => {
  try {
    const data = await menuService.getMenusByCafeteria(req.admin.cafeteriaId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/menus', async (req, res, next) => {
  try {
    const data = await menuService.createMenu(req.admin.cafeteriaId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/menus/:id', async (req, res, next) => {
  try {
    const data = await menuService.updateMenu(Number(req.params.id), req.admin.cafeteriaId, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/menus/:id', async (req, res, next) => {
  try {
    await menuService.deleteMenu(Number(req.params.id), req.admin.cafeteriaId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 메뉴 항목 ─────────────────────────────────────

router.post('/menus/:id/items', async (req, res, next) => {
  try {
    const data = await menuService.addMenuItem(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/menus/:menuId/items/:itemId', async (req, res, next) => {
  try {
    const data = await menuService.updateMenuItem(Number(req.params.itemId), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/menus/:menuId/items/:itemId', async (req, res, next) => {
  try {
    await menuService.deleteMenuItem(Number(req.params.itemId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 카테고리 ──────────────────────────────────────

router.get('/categories', async (req, res, next) => {
  try {
    const data = await categoryService.getCategories(req.admin.cafeteriaId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
  try {
    const data = await categoryService.createCategory(req.admin.cafeteriaId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const data = await categoryService.updateCategory(Number(req.params.id), req.admin.cafeteriaId, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await categoryService.deleteCategory(Number(req.params.id), req.admin.cafeteriaId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/categories/:id/items', async (req, res, next) => {
  try {
    const data = await categoryService.addCategoryItem(Number(req.params.id), req.admin.cafeteriaId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/categories/:categoryId/items/:itemId', async (req, res, next) => {
  try {
    const data = await categoryService.updateCategoryItem(Number(req.params.itemId), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/categories/:categoryId/items/:itemId', async (req, res, next) => {
  try {
    await categoryService.deleteCategoryItem(Number(req.params.itemId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 식당 설정 ─────────────────────────────────────

router.get('/cafeteria', async (req, res, next) => {
  try {
    const data = await cafeteriaService.getCafeteriaSettings(req.admin.cafeteriaId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/cafeteria', async (req, res, next) => {
  try {
    const data = await cafeteriaService.updateCafeteriaSettings(req.admin.cafeteriaId, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// ── 공지/이벤트 ───────────────────────────────────

router.get('/notices', async (req, res, next) => {
  try {
    const data = await noticeService.getNoticesByCafeteria(req.admin.cafeteriaId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/notices', async (req, res, next) => {
  try {
    const data = await noticeService.createNotice(req.admin.cafeteriaId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/notices/:id', async (req, res, next) => {
  try {
    const data = await noticeService.updateNotice(Number(req.params.id), req.admin.cafeteriaId, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/notices/:id', async (req, res, next) => {
  try {
    await noticeService.deleteNotice(Number(req.params.id), req.admin.cafeteriaId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
