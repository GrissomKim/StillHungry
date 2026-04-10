const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

function generateTokens(admin) {
  const payload = { id: admin.id, role: admin.role, cafeteriaId: admin.cafeteriaId };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// 로그인
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호를 확인하세요.' });
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호를 확인하세요.' });
    }
    const tokens = generateTokens(admin);
    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

// 토큰 갱신
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const tokens = generateTokens(admin);
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
