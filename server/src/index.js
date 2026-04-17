require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const app  = express();
const PORT = process.env.PORT || 4000;
const ENV  = process.env.NODE_ENV || 'development';

// ── 요청 로그 ─────────────────────────────────────────
// dev: "GET /api/v1/... 200 12ms"
morgan.token('ts', () => new Date().toTimeString().slice(0, 8));
app.use(morgan('[:ts] :method :url :status :response-time ms'));

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────
app.use('/api/v1/public', require('./routes/public'));
app.use('/api/v1/auth',   require('./routes/auth'));
app.use('/api/v1/admin',  require('./routes/admin'));
app.use('/api/v1/super',  require('./routes/super'));

// ── Health check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Not found' });
});

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.url}`);
    console.error(err.stack);
  } else {
    console.warn(`[WARN] ${req.method} ${req.url} → ${err.message}`);
  }
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('─────────────────────────────────────');
  console.log(`  StillHungry Server`);
  console.log(`  ENV  : ${ENV}`);
  console.log(`  PORT : ${PORT}`);
  console.log(`  URL  : http://localhost:${PORT}`);
  console.log('─────────────────────────────────────');
});
