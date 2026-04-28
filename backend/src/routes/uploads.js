const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();
const upload = multer({ storage });

// POST /api/upload/image
router.post('/image', auth, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
  res.json({ url: req.file.path });
});

// POST /api/upload/audio
router.post('/audio', auth, adminOnly, upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
  res.json({ url: req.file.path });
});

module.exports = router;
