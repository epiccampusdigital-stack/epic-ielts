require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://epicielts.live',
    'https://www.epicielts.live',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

try {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
} catch(e) {
  console.log('Uploads folder not found, skipping');
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EPIC IELTS API running',
    time: new Date().toISOString(),
    aiKeyLoaded: !!process.env.ANTHROPIC_API_KEY
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ message: 'EPIC IELTS API running' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('EPIC IELTS Backend running on port ' + PORT);
  console.log('AI Key loaded:', !!process.env.ANTHROPIC_API_KEY);
});