const express = require('express');
const multer = require('multer');
const { storage, isLocal } = require('../config/cloudinary');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();
const upload = multer({ storage });

// POST /api/upload/image
router.post('/image', auth, adminOnly, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer image upload error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
    
    let url = req.file.path;
    if (isLocal) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const subfolder = req.file.mimetype.startsWith('audio') ? 'audio' : 'images';
      url = `${baseUrl}/uploads/${subfolder}/${req.file.filename}`;
    }

    console.log('Image uploaded successfully:', url);
    res.json({ url });
  });
});

// POST /api/upload/audio
router.post('/audio', auth, adminOnly, (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      console.error('Multer audio upload error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    
    let url = req.file.path;
    if (isLocal) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const subfolder = 'audio';
      url = `${baseUrl}/uploads/${subfolder}/${req.file.filename}`;
    }

    console.log('Audio uploaded successfully:', url);
    res.json({ url });
  });
});

module.exports = router;
