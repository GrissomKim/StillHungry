const router = require('express').Router();
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');

// 로그인
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const tokens = await authService.login(username, password);
    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

// 토큰 갱신
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const tokens = await authService.refresh(refreshToken);
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
