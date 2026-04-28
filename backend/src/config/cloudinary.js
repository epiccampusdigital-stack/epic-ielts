require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isLocal = !process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME;

let storage;
let cloudinary = null;

if (isLocal) {
  console.warn('⚠️ No Cloudinary config found. Using local disk storage.');
  storage = multer.diskStorage({
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
} else {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  
  console.log('=== Cloudinary Boot Check ===');
  console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '✗ UNDEFINED');
  console.log('API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
  console.log('API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);
  console.log('================================');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('🚨 CRITICAL: Cloudinary env vars missing!');
    console.error('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'MISSING');
    console.error('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'set' : 'MISSING');
    console.error('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'set' : 'MISSING');
    throw new Error('Cloudinary configuration incomplete - check Render env vars');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isAudio = file.mimetype.startsWith('audio');
      return {
        folder: isAudio ? 'epic-ielts/audio' : 'epic-ielts/images',
        resource_type: isAudio ? 'video' : 'image', // Cloudinary uses 'video' for audio
        format: path.extname(file.originalname).replace('.', '').toLowerCase() || 'mp3',
        public_id: file.fieldname + '_' + Date.now()
      };
    },
  });
}

module.exports = { cloudinary, storage, isLocal };
