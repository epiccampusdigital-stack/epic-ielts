const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.warn('⚠️ Forcing local disk storage as requested.');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio');
    const dir = path.join(__dirname, '../../uploads', isAudio ? 'audio' : 'images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio');
    const prefix = isAudio ? 'audio_' : 'img_';
    cb(null, prefix + Date.now() + path.extname(file.originalname).toLowerCase());
  }
});

module.exports = { cloudinary: null, storage, isLocal: true };

