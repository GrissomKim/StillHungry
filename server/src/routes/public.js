const router = require('express').Router();
const complexService    = require('../services/complexService');
const cafeteriaService  = require('../services/cafeteriaService');
const menuService       = require('../services/menuService');
const noticeService     = require('../services/noticeService');

// 단지 목록
router.get('/complexes', async (req, res, next) => {
  try {
    const data = await complexService.getComplexes();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// 전체 식당 검색 (?q=검색어)
router.get('/cafeterias', async (req, res, next) => {
  try {
    const data = await cafeteriaService.searchCafeterias(req.query.q?.trim());
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// 단지별 식당 목록
router.get('/complexes/:id/cafeterias', async (req, res, next) => {
  try {
    const data = await cafeteriaService.getCafeteriasByComplex(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// 식당 상세
router.get('/cafeterias/:id', async (req, res, next) => {
  try {
    const data = await cafeteriaService.getCafeteriaById(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// 날짜별 메뉴 조회 (?date=YYYY-MM-DD)
router.get('/cafeterias/:id/menus', async (req, res, next) => {
  try {
    const { date, from, to } = req.query;
    const data = await menuService.getPublicMenus(Number(req.params.id), { date, from, to });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// 공지/이벤트 목록
router.get('/cafeterias/:id/notices', async (req, res, next) => {
  try {
    const data = await noticeService.getPublicNotices(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
