const router = require('express').Router();
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const complexService   = require('../services/complexService');
const cafeteriaService = require('../services/cafeteriaService');
const adminService     = require('../services/adminService');
const menuService      = require('../services/menuService');

router.use(authenticate, requireSuperAdmin);

// ── 단지 ──────────────────────────────────────────

router.get('/complexes', async (req, res, next) => {
  try {
    const data = await complexService.getComplexes();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/complexes', async (req, res, next) => {
  try {
    const data = await complexService.createComplex(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/complexes/:id', async (req, res, next) => {
  try {
    const data = await complexService.updateComplex(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/complexes/:id', async (req, res, next) => {
  try {
    await complexService.deleteComplex(Number(req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 식당 ──────────────────────────────────────────

router.get('/cafeterias', async (req, res, next) => {
  try {
    const data = await cafeteriaService.getAllCafeterias();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/cafeterias', async (req, res, next) => {
  try {
    const data = await cafeteriaService.createCafeteria(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/cafeterias/:id', async (req, res, next) => {
  try {
    const data = await cafeteriaService.updateCafeteria(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/cafeterias/:id', async (req, res, next) => {
  try {
    await cafeteriaService.deleteCafeteria(Number(req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Admin 계정 ────────────────────────────────────

router.get('/admins', async (req, res, next) => {
  try {
    const data = await adminService.getAdmins();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/admins', async (req, res, next) => {
  try {
    const data = await adminService.createAdmin(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/admins/:id', async (req, res, next) => {
  try {
    const data = await adminService.updateAdmin(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/admins/:id', async (req, res, next) => {
  try {
    await adminService.deleteAdmin(Number(req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── 전체 메뉴 ─────────────────────────────────────

router.get('/menus', async (req, res, next) => {
  try {
    const data = await menuService.getAllMenus();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/menus/:id', async (req, res, next) => {
  try {
    const data = await menuService.updateMenuSuper(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/menus/:id', async (req, res, next) => {
  try {
    await menuService.deleteMenuSuper(Number(req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
