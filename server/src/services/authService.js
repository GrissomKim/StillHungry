const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

function generateTokens(admin) {
  const payload = { id: admin.id, role: admin.role, cafeteriaId: admin.cafeteriaId };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

async function login(username, password) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !admin.isActive) {
    const err = new Error('아이디 또는 비밀번호를 확인하세요.');
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    const err = new Error('아이디 또는 비밀번호를 확인하세요.');
    err.status = 401;
    throw err;
  }
  return generateTokens(admin);
}

async function refresh(refreshToken) {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
  if (!admin || !admin.isActive) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return generateTokens(admin);
}

module.exports = { login, refresh };
